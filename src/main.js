// V3 Merkezi Koordinatör: kalıcı ilerleme, yıldızlar, yol arkadaşları, defter,
// üretilen sorular, destekleyici geri bildirim, çizim alanı, son düello.
import { initCanvas, triggerExplosion, triggerConfetti, togglePauseCanvas } from './canvas.js';
import { initAudio, playClick, playSuccess, playFailure, playMagic, toggleDrone } from './audio.js';
import { generateTasks, gateAvatars, colorLabel } from './puzzles.js';
import { generateCertificate } from './certificate.js';
import { ui, gateText, tooltipData, journalPages, companions, compName } from './i18n.js';
import { loadState, saveState, resetState } from './storage.js';
import { createSketchpad } from './sketchpad.js';
import { initDuel } from './duel.js';
import gsap from 'gsap';
import Lenis from 'lenis';

// ---------------------------------------------------------------------------
// Oyun durumu
// ---------------------------------------------------------------------------
let state = loadState();
let isMuted = false;
let isBgActive = true;
let currentOpenPuzzle = null; // { gateId, tasks, solved }
let currentTaskIndex = 0;
let gateWrongs = 0;   // bu kapıdaki yanlış sayısı (yıldız hesabı)
let gateHintsUsed = false; // bu kapıda ipucu kullanıldı mı (yıldız hesabı)
let taskAttempts = 0; // bu görevdeki yanlış sayısı (kademeli yardım)
let hintIndex = 0;    // bu görevde açılan ipucu adımı sayısı
let sketchPad = null;
let sketchOpen = false;
let sketchRewarded = false;
let resumeShown = false;

let currentLang = localStorage.getItem('game_lang');
if (!currentLang) {
  const browserLang = (navigator.language || '').toLowerCase();
  currentLang = browserLang.startsWith('ru') ? 'ru' : browserLang.startsWith('tr') ? 'tr' : 'en';
}

const lenis = new Lenis();
function scrollLoop(time) {
  lenis.raf(time);
  requestAnimationFrame(scrollLoop);
}
requestAnimationFrame(scrollLoop);

// ---------------------------------------------------------------------------
// DOM referansları
// ---------------------------------------------------------------------------
const $ = id => document.getElementById(id);

const heroScreen = $('heroScreen');
const mapScreen = $('mapScreen');
const successScreen = $('successScreen');
const duelScreen = $('duelScreen');

const pencilBar = $('pencilBar');
const pencilPercent = $('pencilPercent');

const puzzleModal = $('puzzleModal');
const chapterLabel = $('chapterLabel');
const taskProgressLabel = $('taskProgressLabel');
const kazanimBadge = $('kazanimBadge');
const puzzleTitle = $('puzzleTitle');
const speechAvatar = $('speechAvatar');
const speechName = $('speechName');
const speechText = $('speechText');
const questionText = $('questionText');
const visWorkarea = $('visWorkarea');
const pInput = $('pInput');
const inputContainer = $('inputContainer');
const choiceRow = $('choiceRow');
const btnShowHint = $('btnShowHint');
const btnSubmitAnswer = $('btnSubmitAnswer');
const hintBox = $('hintBox');
const solutionBox = $('solutionBox');
const padlockWrapper = $('padlockWrapper');
const magicKey = $('magicKey');
const mapTooltip = $('mapTooltip');
const sketchWrap = $('sketchWrap');

const wsTopic = $('wsTopic');
const wsOutcome = $('wsOutcome');
const wsKazanim = $('wsKazanim');
const wsQ1Text = $('wsQ1Text');
const wsQ2Text = $('wsQ2Text');
const wsAnswerKeyToggle = $('wsAnswerKeyToggle');
const wsPrintTitle = $('wsPrintTitle');
const wsPrintTopic = $('wsPrintTopic');
const wsPrintOutcome = $('wsPrintOutcome');
const wsPrintKazanim = $('wsPrintKazanim');
const wsPrintNarrative = $('wsPrintNarrative');
const wsPrintQ1Text = $('wsPrintQ1Text');
const wsPrintQ2Text = $('wsPrintQ2Text');
const wsAnswerKey = $('wsAnswerKey');
const wsPrintA1 = $('wsPrintA1');
const wsPrintA2 = $('wsPrintA2');

const playerNameInput = $('playerNameInput');

function t(key) {
  return (ui[currentLang] && ui[currentLang][key]) || ui.tr[key] || key;
}
function displayName() {
  return state.playerName || { tr: 'Kaşif', en: 'Explorer', ru: 'Исследователь' }[currentLang];
}
function recherName() {
  return { tr: 'Kral Recher', en: 'King Recher', ru: 'Король Решер' }[currentLang];
}
function playSoundEffect(fn) {
  if (!isMuted) fn();
}

// ---------------------------------------------------------------------------
// Kurulum
// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initCanvas('particleCanvas');
  document.body.addEventListener('click', () => initAudio(), { once: true });

  $('btnStartAdventure').addEventListener('click', startAdventure);
  $('btnPlayAgain').addEventListener('click', () => doRestart(successScreen));
  $('btnResetProgress').addEventListener('click', () => doRestart(null));
  $('btnDownloadCert').addEventListener('click', handleDownloadCertificate);
  $('soundToggle').addEventListener('click', handleSoundToggle);
  $('bgToggle').addEventListener('click', handleBgToggle);
  $('btnCloseModal').addEventListener('click', closeModal);
  btnShowHint.addEventListener('click', revealNextHint);
  btnSubmitAnswer.addEventListener('click', handleSubmitAnswer);
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btnSubmitAnswer.click(); }
  });

  // İsim diyaloğu
  $('btnNameStart').addEventListener('click', () => {
    const v = $('nameInput').value.trim().slice(0, 24);
    if (v) { state.playerName = v; saveState(state); }
    hideNameOverlay();
    goToMap();
  });
  $('btnNameSkip').addEventListener('click', () => { hideNameOverlay(); goToMap(); });
  $('nameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('btnNameStart').click();
  });

  // Defter
  $('btnJournal').addEventListener('click', openJournal);
  $('btnCloseJournal').addEventListener('click', closeJournal);
  $('journalModal').addEventListener('click', (e) => {
    if (e.target === $('journalModal')) closeJournal();
  });

  // Sesli okuma
  $('btnTts').addEventListener('click', speakQuestion);

  // Çizim alanı
  $('btnSketch').addEventListener('click', toggleSketch);

  // Harita kuleleri
  for (let i = 1; i <= 8; i++) {
    const node = $(`node-${i}`);
    if (node) {
      node.addEventListener('click', () => handleTowerClick(i));
      // Yıldız etiketi (SVG text)
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      star.setAttribute('y', i === 8 ? '72' : '66');
      star.setAttribute('text-anchor', 'middle');
      star.setAttribute('class', 'tower-stars');
      star.setAttribute('id', `stars-${i}`);
      node.appendChild(star);
    }
  }

  // Sekmeler
  $('tabBtnInteractive').addEventListener('click', () => switchTab(true));
  $('tabBtnWorksheet').addEventListener('click', () => switchTab(false));

  // Çalışma kağıdı yazdırma + cevap anahtarı
  wsAnswerKeyToggle.addEventListener('change', () => {
    wsAnswerKey.style.display = wsAnswerKeyToggle.checked ? 'block' : 'none';
  });
  $('btnPrintWorksheet').addEventListener('click', () => {
    playSoundEffect(playClick);
    const name = state.playerName || '';
    const printNameEl = document.querySelector('.ws-header-meta .meta-field:first-child');
    if (printNameEl && name) {
      const metaLabel = { tr: "Öğrencinin Adı Soyadı:", en: "Student's Full Name:", ru: "Имя и фамилия ученика:" }[currentLang];
      printNameEl.innerHTML = `<strong>${metaLabel}</strong> ${name}`;
    }
    wsAnswerKey.style.display = wsAnswerKeyToggle.checked ? 'block' : 'none';
    window.print();
  });

  setupVideo();
  setupMapTooltips();

  const langSelect = $('langSelect');
  langSelect.value = currentLang;
  langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  changeLanguage(currentLang);

  updateHUD();
  updateMapVisuals();
  renderTeamChips();
});

// ---------------------------------------------------------------------------
// Hero video (otomatik oynatma YOK; kullanıcı isterse izler)
// ---------------------------------------------------------------------------
function setupVideo() {
  const teaserVideo = $('teaserVideo');
  const btnPlayPause = $('btnPlayPauseVideo');
  const btnMute = $('btnMuteVideo');
  const videoWrap = $('heroVideoWrapper');
  const illWrap = $('heroIllustrationWrapper');

  function toIllustration() {
    teaserVideo.pause();
    gsap.to(videoWrap, {
      opacity: 0, duration: 0.3,
      onComplete: () => {
        videoWrap.style.display = 'none';
        illWrap.style.display = 'block';
        gsap.fromTo(illWrap, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }
    });
  }

  $('btnToggleTeaser').addEventListener('click', () => {
    playSoundEffect(playClick);
    gsap.to(illWrap, {
      opacity: 0, duration: 0.3,
      onComplete: () => {
        illWrap.style.display = 'none';
        videoWrap.style.display = 'block';
        gsap.fromTo(videoWrap, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        teaserVideo.muted = false;
        teaserVideo.play().catch(() => {
          teaserVideo.muted = true;
          btnMute.innerHTML = '<span class="video-icon">🔇</span>';
          teaserVideo.play().catch(() => {});
        });
      }
    });
  });
  $('btnBackToIllustration').addEventListener('click', (e) => {
    e.stopPropagation();
    playSoundEffect(playClick);
    toIllustration();
  });
  btnPlayPause.addEventListener('click', (e) => {
    e.stopPropagation();
    if (teaserVideo.paused) teaserVideo.play().catch(() => {});
    else teaserVideo.pause();
  });
  btnMute.addEventListener('click', (e) => {
    e.stopPropagation();
    teaserVideo.muted = !teaserVideo.muted;
    btnMute.innerHTML = `<span class="video-icon">${teaserVideo.muted ? '🔇' : '🔊'}</span>`;
  });
  teaserVideo.addEventListener('play', () => { btnPlayPause.innerHTML = '<span class="video-icon">⏸️</span>'; });
  teaserVideo.addEventListener('pause', () => { btnPlayPause.innerHTML = '<span class="video-icon">▶️</span>'; });
  teaserVideo.addEventListener('ended', toIllustration);
}

// ---------------------------------------------------------------------------
// Ekran geçişleri
// ---------------------------------------------------------------------------
function switchScreen(fromScreen, toScreen) {
  gsap.to(fromScreen, {
    opacity: 0, duration: 0.3,
    onComplete: () => {
      fromScreen.classList.remove('screen--active');
      toScreen.classList.add('screen--active');
      gsap.fromTo(toScreen, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
  });
}

function startAdventure() {
  playSoundEffect(playClick);
  const teaserVideo = $('teaserVideo');
  if (teaserVideo) teaserVideo.pause();
  if (!isMuted) setTimeout(() => toggleDrone(true), 500);

  if (!state.playerName && state.unlockedGates.length === 0) {
    showNameOverlay();
    return;
  }
  goToMap();
}

function goToMap() {
  // Düello ya da final ekranına yönlendirme (kayıttan devam)
  if (state.activeGate > 8 && state.duelWon) {
    switchScreen(heroScreen, successScreen);
    fillSuccess();
    return;
  }
  if (state.activeGate > 8 && !state.duelWon) {
    switchScreen(heroScreen, duelScreen);
    startDuel();
    return;
  }
  switchScreen(heroScreen, mapScreen);
  gsap.from('.map-svg-wrapper', { scale: 0.95, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });
  if (state.unlockedGates.length > 0 && !resumeShown) {
    resumeShown = true;
    showToast(t('resume-note'));
  }
}

function showNameOverlay() {
  $('nameOverlay').classList.add('name-overlay--active');
  setTimeout(() => $('nameInput').focus(), 350);
}
function hideNameOverlay() {
  $('nameOverlay').classList.remove('name-overlay--active');
}

function showToast(text) {
  const toast = $('resumeToast');
  toast.textContent = text;
  toast.classList.add('resume-toast--active');
  setTimeout(() => toast.classList.remove('resume-toast--active'), 3500);
}

function doRestart(fromScreen) {
  if (!window.confirm(t('confirm-restart'))) return;
  playSoundEffect(playClick);
  const keepName = state.playerName;
  state = resetState();
  state.playerName = keepName;
  saveState(state);
  resumeShown = true;
  updateHUD();
  updateMapVisuals();
  renderTeamChips();
  if (fromScreen && fromScreen !== mapScreen) switchScreen(fromScreen, mapScreen);
}

// ---------------------------------------------------------------------------
// Ses & arka plan
// ---------------------------------------------------------------------------
function handleSoundToggle() {
  isMuted = !isMuted;
  $('soundOnIcon').style.display = isMuted ? 'none' : 'block';
  $('soundOffIcon').style.display = isMuted ? 'block' : 'none';
  if (isMuted) toggleDrone(false);
  else { initAudio(); toggleDrone(true); }
}

function handleBgToggle() {
  playSoundEffect(playClick);
  isBgActive = !isBgActive;
  $('bgOnIcon').style.display = isBgActive ? 'block' : 'none';
  $('bgOffIcon').style.display = isBgActive ? 'none' : 'block';
  togglePauseCanvas(!isBgActive);
  $('magicalAuras').classList.toggle('magical-auras--disabled', !isBgActive);
}

// ---------------------------------------------------------------------------
// HUD: kalem enerjisi + yıldız tozu
// ---------------------------------------------------------------------------
function updateHUD() {
  pencilBar.style.width = `${state.pencilEnergy}%`;
  pencilPercent.textContent = `${state.pencilEnergy}%`;
  if (state.pencilEnergy > 60) pencilBar.style.background = 'linear-gradient(90deg, #d97706, #fbbf24)';
  else if (state.pencilEnergy > 30) pencilBar.style.background = 'linear-gradient(90deg, #ea580c, #f97316)';
  else pencilBar.style.background = 'linear-gradient(90deg, #be123c, #f43f5e)';
}

function changeEnergy(delta) {
  state.pencilEnergy = Math.max(10, Math.min(100, state.pencilEnergy + delta));
  saveState(state);
  updateHUD();
}

// ---------------------------------------------------------------------------
// Harita
// ---------------------------------------------------------------------------
const nodeCoords = {
  1: { x: 100, y: 400 }, 2: { x: 220, y: 350 }, 3: { x: 160, y: 220 }, 4: { x: 300, y: 150 },
  5: { x: 450, y: 260 }, 6: { x: 410, y: 410 }, 7: { x: 580, y: 350 }, 8: { x: 700, y: 200 }
};

function updateMapVisuals(animate = false) {
  for (let i = 1; i <= 8; i++) {
    const node = $(`node-${i}`);
    if (!node) continue;
    node.classList.remove('tower-node--locked', 'tower-node--unlocked', 'tower-node--active');
    if (state.unlockedGates.includes(i)) node.classList.add('tower-node--unlocked');
    else if (i === state.activeGate) node.classList.add('tower-node--active');
    else node.classList.add('tower-node--locked');
    const starEl = $(`stars-${i}`);
    if (starEl) {
      const s = state.stars[i] || 0;
      starEl.textContent = s > 0 ? '★'.repeat(s) : '';
    }
  }
  for (let i = 1; i <= 7; i++) {
    const path = $(`path-${i}-${i + 1}`);
    if (!path) continue;
    path.classList.remove('map-path--unlocked', 'map-path--active');
    if (state.unlockedGates.includes(i)) path.classList.add('map-path--unlocked');
    else if (i === state.activeGate - 1) path.classList.add('map-path--active');
  }
  const coords = nodeCoords[Math.min(state.activeGate, 8)];
  if (coords) {
    if (animate) {
      gsap.killTweensOf('#mapAvatar');
      gsap.killTweensOf('#avatarEmoji');
      const tl = gsap.timeline();
      tl.to('#avatarEmoji', { y: -25, yoyo: true, repeat: 5, duration: 0.15, ease: 'power1.inOut' })
        .to('#mapAvatar', { x: coords.x, y: coords.y, duration: 1.5, ease: 'power2.inOut' }, 0);
    } else {
      gsap.set('#mapAvatar', { x: coords.x, y: coords.y });
      gsap.set('#avatarEmoji', { y: 0 });
    }
  }
}

function handleTowerClick(gateId) {
  if (state.unlockedGates.includes(gateId)) openPuzzleModal(gateId, true);
  else if (gateId === state.activeGate) openPuzzleModal(gateId, false);
  else {
    playSoundEffect(playFailure);
    const node = $(`node-${gateId}`);
    const icon = node.querySelector('.tower-icon');
    gsap.to(icon || node, {
      x: 8, yoyo: true, repeat: 5, duration: 0.04,
      onComplete: () => gsap.set(icon || node, { x: 0 })
    });
  }
}

function setupMapTooltips() {
  for (let i = 1; i <= 8; i++) {
    const node = $(`node-${i}`);
    if (!node) continue;
    node.addEventListener('mouseenter', () => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const info = (tooltipData[currentLang] || tooltipData.tr)[i];
      let statusText = t('status-locked');
      let statusClass = 'locked';
      if (state.unlockedGates.includes(i)) { statusText = t('status-unlocked'); statusClass = 'unlocked'; }
      else if (i === state.activeGate) { statusText = t('status-active'); statusClass = 'active'; }
      const starCount = state.stars[i] || 0;
      mapTooltip.innerHTML = `
        <div class="tooltip-title">${info.title}</div>
        <div class="tooltip-status tooltip-status--${statusClass}">${statusText}${starCount ? ' ' + '★'.repeat(starCount) : ''}</div>
        <div class="tooltip-desc">${info.desc}</div>
      `;
      mapTooltip.classList.add('map-tooltip--active');
    });
    node.addEventListener('mousemove', (e) => {
      mapTooltip.style.left = `${e.clientX + 15}px`;
      mapTooltip.style.top = `${e.clientY + 15}px`;
    });
    node.addEventListener('mouseleave', () => mapTooltip.classList.remove('map-tooltip--active'));
  }
}

// ---------------------------------------------------------------------------
// Yol arkadaşları
// ---------------------------------------------------------------------------
function renderTeamChips() {
  const wrap = $('teamChips');
  wrap.innerHTML = '';
  companions.forEach(c => {
    const joined = state.companions.includes(c.id);
    const chip = document.createElement('div');
    chip.className = `team-chip ${joined ? 'team-chip--joined' : 'team-chip--locked'}`;
    chip.innerHTML = `<span class="team-emoji">${joined ? c.emoji : '❔'}</span><span class="team-name">${joined ? compName(currentLang, c.id) : '???'}</span>`;
    wrap.appendChild(chip);
  });
}

function checkCompanionJoin(gateId) {
  companions.forEach(c => {
    if (c.joinAfterGate === gateId && !state.companions.includes(c.id)) {
      state.companions.push(c.id);
      saveState(state);
      renderTeamChips();
      showToast(t('companion-join').replace('{name}', compName(currentLang, c.id)));
    }
  });
}

// ---------------------------------------------------------------------------
// Macera Defteri
// ---------------------------------------------------------------------------
function openJournal() {
  playSoundEffect(playClick);
  renderJournal();
  $('journalModal').classList.add('journal-modal--active');
}
function closeJournal() {
  $('journalModal').classList.remove('journal-modal--active');
}
function renderJournal() {
  const wrap = $('journalPagesWrap');
  wrap.innerHTML = '';
  for (let i = 1; i <= 8; i++) {
    const unlocked = state.unlockedGates.includes(i);
    const info = (tooltipData[currentLang] || tooltipData.tr)[i];
    const page = document.createElement('div');
    page.className = `journal-page ${unlocked ? '' : 'journal-page--locked'}`;
    page.innerHTML = `
      <div class="journal-page-head">${unlocked ? '📜' : '🔒'} <strong>${info.title}</strong></div>
      <p class="journal-page-text">${unlocked ? (journalPages[currentLang] || journalPages.tr)[i] : t('journal-locked')}</p>
    `;
    wrap.appendChild(page);
  }
}

// ---------------------------------------------------------------------------
// Bilmece modali
// ---------------------------------------------------------------------------
function switchTab(interactive) {
  playSoundEffect(playClick);
  $('tabBtnInteractive').classList.toggle('tab-btn--active', interactive);
  $('tabBtnWorksheet').classList.toggle('tab-btn--active', !interactive);
  $('tabContentInteractive').classList.toggle('tab-content--active', interactive);
  $('tabContentWorksheet').classList.toggle('tab-content--active', !interactive);
}

function openPuzzleModal(gateId, isAlreadySolved = false) {
  const tasks = generateTasks(gateId);
  currentOpenPuzzle = { gateId, tasks, solved: isAlreadySolved };
  gateWrongs = 0;
  gateHintsUsed = false;

  switchTab(true);
  const meta = gateText(currentLang, gateId);

  chapterLabel.textContent = `${t('chapter-lbl')} ${gateId}: ${meta.chapter}`;
  puzzleTitle.textContent = meta.title;
  kazanimBadge.textContent = `${t('kazanim-lbl')} ${meta.kazanim}`;
  speechAvatar.textContent = gateAvatars[gateId];
  speechName.textContent = meta.character;
  speechText.textContent = meta.narrative;

  // Çalışma kağıdı (önizleme + yazdırma)
  wsTopic.textContent = meta.worksheet.topic;
  wsOutcome.textContent = meta.worksheet.outcome;
  wsKazanim.textContent = meta.kazanim;
  wsQ1Text.innerHTML = meta.worksheet.q1;
  wsQ2Text.innerHTML = meta.worksheet.q2;
  wsPrintTitle.textContent = `${t('chapter-lbl')} ${gateId}: ${meta.worksheet.title.toUpperCase()}`;
  wsPrintTopic.textContent = meta.worksheet.topic;
  wsPrintOutcome.textContent = meta.worksheet.outcome;
  wsPrintKazanim.textContent = meta.kazanim;
  wsPrintNarrative.textContent = meta.narrative;
  wsPrintQ1Text.innerHTML = meta.worksheet.q1;
  wsPrintQ2Text.innerHTML = meta.worksheet.q2;
  wsPrintA1.innerHTML = meta.answers[0];
  wsPrintA2.innerHTML = meta.answers[1];

  btnSubmitAnswer.removeAttribute('data-mode');
  padlockWrapper.classList.remove('padlock-wrapper--unlocked');
  magicKey.style.display = 'none';
  gsap.set('.dialogue-box', { borderColor: 'var(--color-gold)', backgroundColor: 'rgba(0,0,0,0.2)' });

  if (isAlreadySolved) {
    padlockWrapper.classList.add('padlock-wrapper--unlocked');
    currentTaskIndex = tasks.length - 1;
    const task = tasks[currentTaskIndex];
    questionText.innerHTML = task.question(currentLang);
    taskProgressLabel.textContent = t('modal-completed');
    task.render(visWorkarea, currentLang);
    setupAnswerUI(task, true);
    const solTitle = { tr: 'Bu Kapı Daha Önce Açıldı!', en: 'This gate was opened before!', ru: 'Эти ворота уже были открыты!' }[currentLang];
    solutionBox.innerHTML = `<p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">🎉 ${solTitle}</p>${task.solution(currentLang)}`;
    solutionBox.classList.add('info-box--active');
    hintBox.classList.remove('info-box--active');
    btnSubmitAnswer.style.display = 'none';
    btnShowHint.style.display = 'none';
  } else {
    setupTask(0);
  }

  puzzleModal.classList.add('puzzle-modal--active');
  gsap.fromTo('.puzzle-panel', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' });
  playSoundEffect(playClick);
}

function setupTask(idx) {
  const { gateId, tasks } = currentOpenPuzzle;
  currentTaskIndex = idx;
  taskAttempts = 0;
  hintIndex = 0;
  sketchRewarded = false;
  sketchOpen = false;
  sketchWrap.style.display = 'none';
  sketchPad = null;

  const task = tasks[idx];
  const meta = gateText(currentLang, gateId);

  speechAvatar.textContent = gateAvatars[gateId];
  speechName.textContent = meta.character;
  speechText.textContent = meta.narrative;

  questionText.innerHTML = task.question(currentLang);
  taskProgressLabel.textContent = `${t('modal-task-lbl')} ${idx + 1} / ${tasks.length}`;
  visWorkarea.innerHTML = '';
  task.render(visWorkarea, currentLang);

  hintBox.innerHTML = '';
  hintBox.classList.remove('info-box--active');
  solutionBox.classList.remove('info-box--active');

  setupAnswerUI(task, false);
  btnSubmitAnswer.textContent = t('btn-submit');
  btnSubmitAnswer.style.display = 'inline-flex';
  btnShowHint.style.display = 'inline-flex';
  btnShowHint.disabled = false;
  btnShowHint.textContent = t('btn-hint');
  btnSubmitAnswer.removeAttribute('data-mode');
  padlockWrapper.classList.remove('padlock-wrapper--unlocked');
}

// Kademeli + dinamik ipucu: her çağrı bir sonraki adımı açar ve canlı görselde gösterir
function revealNextHint() {
  if (!currentOpenPuzzle) return;
  const task = currentOpenPuzzle.tasks[currentTaskIndex];
  const steps = task.hints(currentLang);
  if (hintIndex >= steps.length) return;

  playSoundEffect(playClick);
  if (!gateHintsUsed) gateHintsUsed = true;

  const step = steps[hintIndex];
  const item = document.createElement('div');
  item.className = 'hint-step';
  item.innerHTML = `<span class="hint-step-num">${hintIndex + 1}</span><span>${step.text}</span>`;
  hintBox.appendChild(item);
  hintBox.classList.add('info-box--active');

  // Adımı canlı görselin üstünde dinamik olarak göster
  if (typeof step.apply === 'function') {
    try { step.apply(visWorkarea); } catch (e) { /* görsel adımı atlanır */ }
  }

  hintIndex++;
  if (hintIndex >= steps.length) {
    btnShowHint.disabled = true;
    btnShowHint.textContent = t('hint-all-shown');
  } else {
    btnShowHint.textContent = t('btn-hint-next');
  }
}

// Sayı girişi veya tıklanabilir şıklar
function setupAnswerUI(task, solvedView) {
  if (task.answerType === 'choice') {
    inputContainer.style.display = 'none';
    choiceRow.style.display = 'flex';
    choiceRow.innerHTML = `<span class="choice-lbl">${t('choice-lbl')}</span>`;
    task.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `btn choice-btn choice-btn--${c}`;
      btn.textContent = `${{ red: '🟥', blue: '🟦', green: '🟩' }[c]} ${colorLabel(currentLang, c)}`;
      if (solvedView) {
        btn.disabled = true;
        if (c === task.answer) btn.classList.add('choice-btn--correct');
      } else {
        btn.addEventListener('click', () => {
          playSoundEffect(playClick);
          evaluateAnswer(task, c);
        });
      }
      choiceRow.appendChild(btn);
    });
    btnSubmitAnswer.style.display = 'none';
  } else {
    choiceRow.style.display = 'none';
    inputContainer.style.display = 'flex';
    pInput.value = solvedView ? String(task.answer) : '';
    pInput.disabled = solvedView;
    pInput.style.display = 'inline-block';
  }
}

function closeModal() {
  playSoundEffect(playClick);
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  mapTooltip.classList.remove('map-tooltip--active');
  gsap.to('.puzzle-panel', {
    scale: 0.85, opacity: 0, duration: 0.3,
    onComplete: () => {
      puzzleModal.classList.remove('puzzle-modal--active');
      currentOpenPuzzle = null;
    }
  });
}

// ---------------------------------------------------------------------------
// Sesli okuma, çizim
// ---------------------------------------------------------------------------
function speakQuestion() {
  if (!window.speechSynthesis) return;
  playSoundEffect(playClick);
  window.speechSynthesis.cancel();
  // Kesirleri sesli okurken "pay bölü payda" olarak söylet (görsel kesir glyph'i yerine)
  const sep = { tr: ' bölü ', en: ' over ', ru: ' делить на ' }[currentLang] || ' / ';
  const clone = questionText.cloneNode(true);
  clone.querySelectorAll('.frac').forEach(f => {
    const n = f.querySelector('.frac-n')?.textContent || '';
    const d = f.querySelector('.frac-d')?.textContent || '';
    f.replaceWith(document.createTextNode(`${n}${sep}${d}`));
  });
  const utter = new SpeechSynthesisUtterance(clone.textContent);
  utter.lang = { tr: 'tr-TR', en: 'en-US', ru: 'ru-RU' }[currentLang];
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function toggleSketch() {
  playSoundEffect(playClick);
  sketchOpen = !sketchOpen;
  sketchWrap.style.display = sketchOpen ? 'block' : 'none';
  if (sketchOpen) {
    if (!sketchPad) {
      sketchPad = createSketchpad($('sketchHost'), currentLang, () => {
        if (!sketchRewarded) {
          sketchRewarded = true;
          changeEnergy(+2);
        }
      });
    }
    sketchPad.resize();
  }
}

// ---------------------------------------------------------------------------
// Kilit animasyonu
// ---------------------------------------------------------------------------
function animateUnlock() {
  magicKey.style.display = 'block';
  magicKey.style.opacity = '0';
  gsap.timeline()
    .fromTo(magicKey,
      { x: -40, y: 15, rotation: -45, scale: 0.4, opacity: 0 },
      { x: -5, y: -5, rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to(magicKey, { rotation: 90, scale: 0.8, duration: 0.4, delay: 0.1 })
    .to(magicKey, {
      opacity: 0, duration: 0.2, onComplete: () => {
        magicKey.style.display = 'none';
        padlockWrapper.classList.add('padlock-wrapper--unlocked');
        playSoundEffect(playMagic);
        const rect = padlockWrapper.getBoundingClientRect();
        triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 25, 150);
      }
    });
}

// ---------------------------------------------------------------------------
// Cevap değerlendirme
// ---------------------------------------------------------------------------
function handleSubmitAnswer() {
  if (!currentOpenPuzzle) return;
  const { gateId, tasks } = currentOpenPuzzle;
  const mode = btnSubmitAnswer.getAttribute('data-mode');

  if (mode === 'duel') {
    closeModal();
    btnSubmitAnswer.removeAttribute('data-mode');
    switchScreen(mapScreen, duelScreen);
    startDuel();
    return;
  }

  if (mode === 'continue') {
    closeModal();
    btnSubmitAnswer.removeAttribute('data-mode');
    playSoundEffect(playMagic);
    const nodeEl = $(`node-${state.activeGate - 1}`);
    if (nodeEl) {
      const rect = nodeEl.getBoundingClientRect();
      triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    }
    return;
  }

  if (mode === 'next-task') {
    btnSubmitAnswer.removeAttribute('data-mode');
    gsap.set('.dialogue-box', { borderColor: 'var(--color-gold)', backgroundColor: 'rgba(0,0,0,0.2)' });
    setupTask(currentTaskIndex + 1);
    playSoundEffect(playClick);
    return;
  }

  // Normal sayı cevabı
  const task = tasks[currentTaskIndex];
  const raw = pInput.value.trim();
  if (raw === '') {
    playSoundEffect(playFailure);
    shakeInput();
    return;
  }
  const numVal = parseFloat(raw.replace(',', '.'));
  evaluateAnswer(task, numVal);
}

function evaluateAnswer(task, val) {
  const { gateId, tasks } = currentOpenPuzzle;
  const meta = gateText(currentLang, gateId);
  const isCorrect = task.answerType === 'choice' ? val === task.answer : val === task.answer;

  if (isCorrect) {
    playSoundEffect(playSuccess);
    triggerConfetti();
    animateUnlock();
    gsap.fromTo('.dialogue-box',
      { borderColor: 'var(--color-gold)', backgroundColor: 'rgba(99, 102, 241, 0.06)' },
      { borderColor: 'var(--color-emerald)', backgroundColor: 'rgba(16,185,129,0.12)', duration: 0.4, yoyo: true, repeat: 1 });

    // Konuşma: 1. görevde kapı karakteri, 2. görevde Recher (8. kapıda Kraliçe)
    if (currentTaskIndex === 0) {
      speechAvatar.textContent = gateAvatars[gateId];
      speechName.textContent = meta.character;
    } else if (gateId === 8) {
      speechAvatar.textContent = '🧝‍♀️';
      speechName.textContent = meta.character;
    } else {
      speechAvatar.textContent = '👑';
      speechName.textContent = recherName();
    }
    speechText.textContent = meta.speech[currentTaskIndex];

    const btnRect = btnSubmitAnswer.getBoundingClientRect();
    triggerExplosion(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2, 60);

    pInput.disabled = true;
    choiceRow.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      if (b.classList.contains(`choice-btn--${task.answer}`)) b.classList.add('choice-btn--correct');
    });
    hintBox.classList.remove('info-box--active');
    btnShowHint.style.display = 'none';

    if (currentTaskIndex < tasks.length - 1) {
      solutionBox.innerHTML = `<p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${t('correct-task-next')}</p>${task.solution(currentLang)}`;
      solutionBox.classList.add('info-box--active');
      btnSubmitAnswer.textContent = t('btn-next-task');
      btnSubmitAnswer.setAttribute('data-mode', 'next-task');
      btnSubmitAnswer.style.display = 'inline-flex';
    } else {
      // Kapı tamamlandı: yıldız + enerji + kayıt
      const stars = (gateWrongs === 0 && !gateHintsUsed) ? 3 : (gateWrongs <= 2 && hintIndex < 2 ? 2 : 1);
      state.stars[gateId] = Math.max(state.stars[gateId] || 0, stars);
      if (!state.unlockedGates.includes(gateId)) state.unlockedGates.push(gateId);
      state.activeGate = gateId + 1;
      saveState(state);
      changeEnergy(+10);
      updateMapVisuals(true);
      checkCompanionJoin(gateId);

      solutionBox.innerHTML = `
        <p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${t('correct-gate-all')}</p>
        <p style="font-weight: bold; color: var(--color-gold);">${t('gate-stars-earned').replace('{n}', String(stars))} ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
        ${task.solution(currentLang)}
      `;
      solutionBox.classList.add('info-box--active');

      if (gateId === 8) {
        btnSubmitAnswer.textContent = t('duel-btn-start');
        btnSubmitAnswer.setAttribute('data-mode', 'duel');
      } else {
        btnSubmitAnswer.textContent = t('btn-continue-map');
        btnSubmitAnswer.setAttribute('data-mode', 'continue');
      }
      btnSubmitAnswer.style.display = 'inline-flex';
    }
  } else {
    // Yanlış cevap: destekleyici + teşhisli geri bildirim
    playSoundEffect(playFailure);
    if (task.answerType !== 'choice') shakeInput();
    taskAttempts++;
    gateWrongs++;
    changeEnergy(-10);

    gsap.fromTo('.dialogue-box',
      { borderColor: 'var(--color-gold)' },
      { borderColor: 'var(--color-recher)', duration: 0.15, yoyo: true, repeat: 3 });

    // Teşhis: yaygın yanlışı yakala
    const mistake = (task.mistakes || []).find(m => m.value === val && m.value !== task.answer);
    speechAvatar.textContent = '👁️';
    speechName.textContent = 'Monoculus';
    if (mistake) {
      speechText.textContent = `${t('diagnostic-prefix')} ${mistake.msg(currentLang)}`;
    } else {
      const key = taskAttempts === 1 ? 'wrong-encourage-1' : taskAttempts === 2 ? 'wrong-encourage-2' : 'wrong-encourage-3';
      speechText.textContent = t(key).replace('{name}', displayName());
    }

    // Kademeli yardım: her yanlıştan sonra bir sonraki ipucu adımını otomatik aç (dinamik gösterimle)
    revealNextHint();
  }
}

function shakeInput() {
  gsap.fromTo('#pInput', { x: -10 }, {
    x: 10, yoyo: true, repeat: 5, duration: 0.05,
    onComplete: () => gsap.set('#pInput', { x: 0 })
  });
  pInput.classList.add('answer-input--error');
  setTimeout(() => pInput.classList.remove('answer-input--error'), 500);
}

// ---------------------------------------------------------------------------
// Düello & final
// ---------------------------------------------------------------------------
function startDuel() {
  initDuel($('duelArea'), currentLang, {
    playSound: playSoundEffect,
    onWin: () => {
      state.duelWon = true;
      saveState(state);
      switchScreen(duelScreen, successScreen);
      fillSuccess();
      playSoundEffect(playSuccess);
      triggerConfetti();
      triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 120);
    }
  });
}

function totalStars() {
  return Object.values(state.stars).reduce((a, b) => a + b, 0);
}

function fillSuccess() {
  const total = totalStars();
  $('successStars').innerHTML = `${t('success-stars')} <span class="success-stars-num">★ ${total} / 24</span>`;
  if (state.playerName) playerNameInput.value = state.playerName;
}

function handleDownloadCertificate() {
  playSoundEffect(playClick);
  const name = playerNameInput.value.trim() || state.playerName;
  if (!name) {
    gsap.fromTo('#playerNameInput', { x: -8 }, {
      x: 8, yoyo: true, repeat: 5, duration: 0.05,
      onComplete: () => gsap.set('#playerNameInput', { x: 0 })
    });
    return;
  }
  generateCertificate(name, state.pencilEnergy, currentLang, totalStars());
}

// ---------------------------------------------------------------------------
// Dil değiştirme
// ---------------------------------------------------------------------------
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('game_lang', lang);
  document.documentElement.lang = lang;
  $('langSelect').value = lang;

  // Tanıtım videosu kaynağı
  const teaserVideo = $('teaserVideo');
  const srcEl = teaserVideo ? teaserVideo.querySelector('source') : null;
  if (srcEl) {
    // Göreceli yol: GitHub Pages alt-dizininde de (ör. /kraliceyi-kurtarmak-v3/) doğru çözümlenir
    const newSrc = lang === 'en' ? 'intro_eng.mp4' : lang === 'ru' ? 'intro_rusca.mp4' : 'intro.mp4';
    const cur = (srcEl.getAttribute('src') || '').replace(/^\.?\//, '');
    if (cur !== newSrc) {
      const wasPlaying = !teaserVideo.paused;
      srcEl.setAttribute('src', newSrc);
      teaserVideo.load();
      if (wasPlaying) teaserVideo.play().catch(() => {});
    }
  }

  // data-i18n çevirileri (birleştirilmiş sözlükten)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = ui[lang] && ui[lang][key];
    if (!translation) return;
    if (/<(strong|em|span|br)/.test(translation)) el.innerHTML = translation;
    else el.textContent = translation;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (ui[lang][key]) el.placeholder = ui[lang][key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (ui[lang][key]) el.title = ui[lang][key];
  });

  // Harita kule etiketleri
  for (let i = 1; i <= 8; i++) {
    const node = $(`node-${i}`);
    if (node) {
      const textEl = node.querySelector('.tower-text');
      if (textEl && ui[lang][`node-${i}-text`]) textEl.textContent = ui[lang][`node-${i}-text`];
    }
  }

  renderTeamChips();
  if ($('journalModal').classList.contains('journal-modal--active')) renderJournal();

  // Açık modal varsa metinleri tazele
  if (currentOpenPuzzle) {
    const { gateId, tasks, solved } = currentOpenPuzzle;
    const meta = gateText(lang, gateId);
    const task = tasks[currentTaskIndex];
    chapterLabel.textContent = `${t('chapter-lbl')} ${gateId}: ${meta.chapter}`;
    puzzleTitle.textContent = meta.title;
    kazanimBadge.textContent = `${t('kazanim-lbl')} ${meta.kazanim}`;
    speechName.textContent = meta.character;
    speechText.textContent = meta.narrative;
    questionText.innerHTML = task.question(lang);
    visWorkarea.innerHTML = '';
    task.render(visWorkarea, lang);
    // Açılmış ipucu adımlarını yeni dilde yeniden kur ve görseli tazele
    if (!solved && hintIndex > 0) {
      const steps = task.hints(lang);
      hintBox.innerHTML = '';
      for (let i = 0; i < hintIndex && i < steps.length; i++) {
        const item = document.createElement('div');
        item.className = 'hint-step';
        item.innerHTML = `<span class="hint-step-num">${i + 1}</span><span>${steps[i].text}</span>`;
        hintBox.appendChild(item);
        if (typeof steps[i].apply === 'function') {
          try { steps[i].apply(visWorkarea); } catch (e) { /* atla */ }
        }
      }
      hintBox.classList.add('info-box--active');
      btnShowHint.textContent = hintIndex >= steps.length ? t('hint-all-shown') : t('btn-hint-next');
    }
    if (solved) {
      taskProgressLabel.textContent = t('modal-completed');
      const solTitle = { tr: 'Bu Kapı Daha Önce Açıldı!', en: 'This gate was opened before!', ru: 'Эти ворота уже были открыты!' }[lang];
      solutionBox.innerHTML = `<p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">🎉 ${solTitle}</p>${task.solution(lang)}`;
    } else {
      taskProgressLabel.textContent = `${t('modal-task-lbl')} ${currentTaskIndex + 1} / ${tasks.length}`;
      if (!btnSubmitAnswer.getAttribute('data-mode')) btnSubmitAnswer.textContent = t('btn-submit');
      setupAnswerUI(task, false);
    }
    wsTopic.textContent = meta.worksheet.topic;
    wsOutcome.textContent = meta.worksheet.outcome;
    wsKazanim.textContent = meta.kazanim;
    wsQ1Text.textContent = meta.worksheet.q1;
    wsQ2Text.textContent = meta.worksheet.q2;
    wsPrintTitle.textContent = `${t('chapter-lbl')} ${gateId}: ${meta.worksheet.title.toUpperCase()}`;
    wsPrintTopic.textContent = meta.worksheet.topic;
    wsPrintOutcome.textContent = meta.worksheet.outcome;
    wsPrintKazanim.textContent = meta.kazanim;
    wsPrintNarrative.textContent = meta.narrative;
    wsPrintQ1Text.textContent = meta.worksheet.q1;
    wsPrintQ2Text.textContent = meta.worksheet.q2;
    wsPrintA1.textContent = meta.answers[0];
    wsPrintA2.textContent = meta.answers[1];
  }
}
