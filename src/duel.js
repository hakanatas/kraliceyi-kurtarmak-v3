// Son Düello: Recher'e karşı süreli zihinden işlem mini oyunu.
// 5 soru, soru başına 20 saniye; kazanmak için en az 3 doğru gerekir.
import { ui } from './i18n.js';
import { playClick, playSuccess, playFailure } from './audio.js';

const QUESTION_COUNT = 5;
const NEED_CORRECT = 3;
const SECONDS_PER_Q = 20;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// 5. sınıf seviyesinde zihinden işlem soruları üret
function makeQuestion(lang) {
  const type = pick(['add', 'sub', 'mul', 'percent', 'double']);
  let text = '', answer = 0;
  switch (type) {
    case 'add': {
      const a = randInt(15, 89), b = randInt(12, 89);
      text = `${a} + ${b} = ?`;
      answer = a + b;
      break;
    }
    case 'sub': {
      const a = randInt(40, 99), b = randInt(11, a - 10);
      text = `${a} - ${b} = ?`;
      answer = a - b;
      break;
    }
    case 'mul': {
      const a = randInt(3, 9), b = randInt(4, 12);
      text = `${a} × ${b} = ?`;
      answer = a * b;
      break;
    }
    case 'percent': {
      const p = pick([10, 25, 50]);
      const base = pick([40, 60, 80, 120, 200]);
      const sfx = { 10: "'u", 25: "'i", 50: "'si" }[p];
      const pctWord = { tr: `${base} sayısının %${p}${sfx} = ?`, en: `${p}% of ${base} = ?`, ru: `${p}% от ${base} = ?` };
      text = pctWord[lang] || pctWord.tr;
      answer = (base * p) / 100;
      break;
    }
    case 'double': {
      const a = randInt(13, 48);
      const w = { tr: `${a} sayısının 2 katı = ?`, en: `Double of ${a} = ?`, ru: `Удвой ${a} = ?` };
      text = w[lang] || w.tr;
      answer = a * 2;
      break;
    }
  }
  // Şıklar: doğru + 3 yakın çeldirici
  const options = new Set([answer]);
  while (options.size < 4) {
    const delta = pick([-10, -5, -2, -1, 1, 2, 5, 10]);
    const candidate = answer + delta;
    if (candidate > 0) options.add(candidate);
  }
  const shuffledOpts = [...options];
  for (let i = shuffledOpts.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
  }
  return { text, answer, options: shuffledOpts };
}

export function initDuel(container, lang, { onWin, playSound }) {
  const t = ui[lang];
  let questions = [];
  let qIndex = 0;
  let score = 0;
  let timerId = null;

  function renderIntro() {
    container.innerHTML = `
      <div class="duel-intro">
        <div class="duel-avatars"><span class="duel-avatar">🧙‍♂️</span><span class="duel-vs font-accent">VS</span><span class="duel-avatar duel-avatar--recher">👑</span></div>
        <h2 class="font-accent duel-title">${t["duel-title"]}</h2>
        <p class="duel-text">${t["duel-intro"]}</p>
        <button class="btn btn--primary btn--glow" id="duelStart">${t["duel-btn-start"]}</button>
      </div>
    `;
    container.querySelector('#duelStart').addEventListener('click', () => {
      playSound && playSound(playClick);
      questions = Array.from({ length: QUESTION_COUNT }, () => makeQuestion(lang));
      qIndex = 0;
      score = 0;
      renderQuestion();
    });
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function renderQuestion() {
    stopTimer();
    const q = questions[qIndex];
    container.innerHTML = `
      <div class="duel-play">
        <div class="duel-status">
          <span class="duel-chip">${t["duel-q-lbl"].replace("{i}", String(qIndex + 1)).replace("{n}", String(QUESTION_COUNT))}</span>
          <span class="duel-chip duel-chip--score">${t["duel-score-lbl"].replace("{s}", String(score))}</span>
        </div>
        <div class="duel-timer"><div class="duel-timer-bar" id="duelTimerBar"></div></div>
        <div class="duel-question font-headings" id="duelQuestion">${q.text}</div>
        <div class="duel-options" id="duelOptions">
          ${q.options.map(opt => `<button class="btn btn--secondary duel-option" data-val="${opt}">${opt}</button>`).join('')}
        </div>
      </div>
    `;
    const bar = container.querySelector('#duelTimerBar');
    let remaining = SECONDS_PER_Q * 10; // 100ms adımlar
    timerId = setInterval(() => {
      remaining--;
      bar.style.width = `${(remaining / (SECONDS_PER_Q * 10)) * 100}%`;
      if (remaining <= SECONDS_PER_Q * 3) bar.classList.add('duel-timer-bar--low');
      if (remaining <= 0) {
        stopTimer();
        playSound && playSound(playFailure);
        next(false);
      }
    }, 100);

    container.querySelectorAll('.duel-option').forEach(btn => {
      btn.addEventListener('click', () => {
        stopTimer();
        const val = parseInt(btn.getAttribute('data-val'), 10);
        const correct = val === q.answer;
        btn.classList.add(correct ? 'duel-option--correct' : 'duel-option--wrong');
        if (!correct) {
          const rightBtn = container.querySelector(`.duel-option[data-val="${q.answer}"]`);
          if (rightBtn) rightBtn.classList.add('duel-option--correct');
        }
        container.querySelectorAll('.duel-option').forEach(b => b.disabled = true);
        playSound && playSound(correct ? playSuccess : playFailure);
        setTimeout(() => next(correct), 800);
      });
    });
  }

  function next(wasCorrect) {
    if (wasCorrect) score++;
    qIndex++;
    if (qIndex < QUESTION_COUNT) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  function renderResult() {
    stopTimer();
    const won = score >= NEED_CORRECT;
    container.innerHTML = `
      <div class="duel-result">
        <div class="duel-result-emoji">${won ? '🏆' : '💨'}</div>
        <p class="duel-text duel-text--big">${won ? t["duel-win"] : t["duel-lose"]}</p>
        <p class="duel-chip duel-chip--score">${t["duel-score-lbl"].replace("{s}", `${score} / ${QUESTION_COUNT}`)}</p>
        <div class="duel-actions">
          ${won
            ? `<button class="btn btn--primary btn--glow" id="duelContinue">${t["duel-btn-continue"]}</button>`
            : `<button class="btn btn--primary" id="duelRetry">${t["duel-btn-retry"]}</button>`}
        </div>
      </div>
    `;
    if (won) {
      container.querySelector('#duelContinue').addEventListener('click', () => {
        playSound && playSound(playClick);
        onWin && onWin();
      });
    } else {
      container.querySelector('#duelRetry').addEventListener('click', () => {
        playSound && playSound(playClick);
        questions = Array.from({ length: QUESTION_COUNT }, () => makeQuestion(lang));
        qIndex = 0;
        score = 0;
        renderQuestion();
      });
    }
  }

  renderIntro();
  return { destroy: stopTimer };
}
