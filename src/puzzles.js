// V3 Soru Motoru: her kapı için parametrik (rastgele üretilen) görevler.
// Her görev; soru/çözüm metinlerini 3 dilde üretir, yaygın yanlışlar için
// teşhis mesajları taşır ve öğrencinin KENDİSİNİN yaptığı etkileşimli modeller çizer.
//
// İPUCU SİSTEMİ (v3.1): Tek bir "İpucu" butonu vardır. Her tıklamada bir sonraki
// çözüm adımı açılır (kademeli). Mümkün olan her adımda `apply()` ile adım, canlı
// görselin üstünde DİNAMİK olarak gösterilir (kutu dolar, terazi dengelenir,
// hücre boyanır, sandık seçilir...). Yıldız Tozu kaldırıldı.
import { playClick } from './audio.js';
import { ui } from './i18n.js';

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
const L = (lang, o) => o[lang] !== undefined ? o[lang] : o.tr;

// Bir step-input'a değer yazıp 'input' olayını tetikler (dinamik ipucu için)
function fireVal(el, val) {
  if (!el) return;
  el.value = String(val);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

// Kapı meta bilgisi (anlatıcı avatarları)
export const gateAvatars = { 1: "👑", 2: "👧", 3: "👦", 4: "👦", 5: "👦", 6: "👧", 7: "👁️", 8: "🧝‍♀️" };

export const KAZANIM_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

// Mini giriş kutusu: doğru değer yazılınca yeşile döner, callback çağrılır
function bindStepInput(input, expected, onCorrect) {
  const handler = () => {
    const val = parseInt(String(input.value).replace(/[^\-0-9]/g, ''), 10);
    if (val === expected) {
      input.classList.add('step-input--correct');
      input.disabled = true;
      playClick();
      input.removeEventListener('input', handler);
      onCorrect && onCorrect();
    }
  };
  input.addEventListener('input', handler);
}

// ---------------------------------------------------------------------------
// KAPI 1 — Sihirli Kalem (Ters İşlem)
// ---------------------------------------------------------------------------
function makePipelineTask(taskNo, mode) {
  let p = {};
  if (mode === 'mul') {
    const a = pick([2, 3, 4, 5]);
    const x = randInt(4, 12);
    const b = randInt(3, 19);
    p = { a, x, b, c: a * x + b, mid: a * x };
  } else {
    const d = pick([2, 3]);
    const k = randInt(5, 12);
    const e = randInt(4, 15);
    p = { d, x: d * k, e, f: k + e, mid: k };
  }

  const isMul = mode === 'mul';
  const trDat = (n) => n === 2 ? "2'ye" : `${n}'e`;
  const opStr = isMul ? `× ${p.a}` : `÷ ${p.d}`;
  const addStr = isMul ? `+ ${p.b}` : `+ ${p.e}`;
  const result = isMul ? p.c : p.f;
  const added = isMul ? p.b : p.e;
  const factor = isMul ? p.a : p.d;
  const answer = p.x;

  return {
    answerType: 'number',
    answer,
    question(lang) {
      return L(lang, {
        tr: `${taskNo}. Görev: Sihirli sayı makinesi bir sayıyı ${isMul ? `${factor} ile çarpıp` : `${trDat(factor)} bölüp`}, sonucuna ${added} eklediğinde ${result} elde ediyor. Başlangıçtaki sayı kaçtır?`,
        en: `Task ${taskNo}: The magic number machine ${isMul ? `multiplies a number by ${factor}` : `divides a number by ${factor}`}, then adds ${added}, and gets ${result}. What was the starting number?`,
        ru: `Задание ${taskNo}: Волшебная машина ${isMul ? `умножает число на ${factor}` : `делит число на ${factor}`}, затем прибавляет ${added} и получает ${result}. Какое число было в начале?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Geriye doğru çalış! Toplamanın tersi çıkarma, çarpmanın tersi bölmedir. Boru hattını sondan başa doğru takip et.`,
            en: `Work backwards! The inverse of adding is subtracting, of multiplying is dividing. Follow the pipe from the end to the start.`,
            ru: `Иди в обратную сторону! Обратное сложению — вычитание, умножению — деление. Двигайся по трубе с конца к началу.`
          })
        },
        {
          text: L(lang, {
            tr: `Önce sonuçtan eklenen sayıyı çıkar: ${result} − ${added} = ${p.mid}. Bu, ortadaki sayıdır.`,
            en: `First subtract the added number from the result: ${result} − ${added} = ${p.mid}. That's the middle number.`,
            ru: `Сначала вычти прибавленное из результата: ${result} − ${added} = ${p.mid}. Это среднее число.`
          }),
          apply: (c) => fireVal(c.querySelector('#pipe-mid'), p.mid)
        },
        {
          text: L(lang, {
            tr: `Şimdi ${isMul ? `${trDat(factor)} böl` : `${factor} ile çarp`}: ${p.mid} ${isMul ? '÷' : '×'} ${factor} = ${answer}. Başlangıç sayısı bu!`,
            en: `Now ${isMul ? `divide by ${factor}` : `multiply by ${factor}`}: ${p.mid} ${isMul ? '÷' : '×'} ${factor} = ${answer}. That's the start!`,
            ru: `Теперь ${isMul ? `раздели на ${factor}` : `умножь на ${factor}`}: ${p.mid} ${isMul ? '÷' : '×'} ${factor} = ${answer}. Это начало!`
          }),
          apply: (c) => fireVal(c.querySelector('#pipe-start'), answer)
        }
      ];
    },
    solution(lang) {
      const step2 = isMul ? `${p.mid} ÷ ${factor} = ${answer}` : `${p.mid} × ${factor} = ${answer}`;
      return L(lang, {
        tr: `Çözüm: Sondan geriye gideriz. Önce eklenen sayıyı çıkarırız: ${result} - ${added} = ${p.mid}. Sonra ${isMul ? 'böleriz' : 'çarparız'}: ${step2}. Başlangıçtaki sayı ${answer}'dir!`,
        en: `Solution: We go backwards. First subtract the added number: ${result} - ${added} = ${p.mid}. Then ${isMul ? 'divide' : 'multiply'}: ${step2}. The starting number is ${answer}!`,
        ru: `Решение: Идём с конца. Сначала вычитаем: ${result} - ${added} = ${p.mid}. Затем ${isMul ? 'делим' : 'умножаем'}: ${step2}. Начальное число — ${answer}!`
      });
    },
    mistakes: [
      {
        value: p.mid,
        msg(lang) {
          return L(lang, {
            tr: `İlk adımın doğru: ${result} - ${added} = ${p.mid}. Ama bu ORTADAKİ sayı — bir adım daha var: ${isMul ? `${trDat(factor)} böl` : `${factor} ile çarp`}!`,
            en: `Your first step is right: ${result} - ${added} = ${p.mid}. But that's the MIDDLE number — one more step: ${isMul ? `divide by ${factor}` : `multiply by ${factor}`}!`,
            ru: `Первый шаг верный: ${result} - ${added} = ${p.mid}. Но это СРЕДНЕЕ число — ещё один шаг: ${isMul ? `раздели на ${factor}` : `умножь на ${factor}`}!`
          });
        }
      },
      {
        value: result + added,
        msg(lang) {
          return L(lang, {
            tr: `Geriye giderken toplama işleminin TERSİ çıkarmadır: ${result} - ${added} yapmalısın, toplamamalısın.`,
            en: `When going backwards, the INVERSE of addition is subtraction: compute ${result} - ${added}, don't add.`,
            ru: `Идя назад, делай ОБРАТНОЕ сложению — вычитание: ${result} - ${added}, а не сложение.`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      container.innerHTML = `
        <div class="vis-reverse">
          <p class="vis-instruction">${t["vis-pipe-step1"]}</p>
          <div class="pipeline pipeline--reversed">
            <div class="pipe-node"><input class="step-input pipe-step" id="pipe-start" inputmode="numeric" placeholder="?" disabled /></div>
            <div class="pipe-link font-accent">${opStr}</div>
            <div class="pipe-node"><input class="step-input pipe-step" id="pipe-mid" inputmode="numeric" placeholder="?" /></div>
            <div class="pipe-link font-accent">${addStr}</div>
            <div class="pipe-node pipe-node--active">${result}</div>
          </div>
          <div class="pipeline-explain" id="pipe-explain">${t["vis-pipe-step1"]}</div>
        </div>
      `;
      const midInput = container.querySelector('#pipe-mid');
      const startInput = container.querySelector('#pipe-start');
      const explain = container.querySelector('#pipe-explain');
      bindStepInput(midInput, p.mid, () => {
        explain.textContent = t["vis-pipe-step2"];
        startInput.disabled = false;
        startInput.focus();
        bindStepInput(startInput, answer, () => {
          explain.textContent = t["vis-pipe-done"];
        });
      });
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 2 — Lav Köprüsü (Örüntüler)
// ---------------------------------------------------------------------------
function makeDoublingPatternTask(taskNo) {
  const s = randInt(2, 6);
  const d = pick([3, 4, 5]);
  const terms = [s, s + d, s + 3 * d, s + 7 * d, s + 15 * d];
  const diffs = [d, 2 * d, 4 * d, 8 * d];
  const nextDiff = 16 * d;
  const answer = terms[4] + nextDiff;

  return {
    answerType: 'number',
    answer,
    question(lang) {
      const seq = terms.join(', ');
      return L(lang, {
        tr: `${taskNo}. Görev: ${seq}, [?] sayı örüntüsünde boş bırakılan yere hangi sayı gelmelidir?`,
        en: `Task ${taskNo}: In the number pattern ${seq}, [?] — which number should replace the question mark?`,
        ru: `Задание ${taskNo}: В числовой последовательности ${seq}, [?] — какое число должно стоять вместо знака вопроса?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Sayıların arasındaki FARKLARA bak. Soru işaretli kutulara farkları yazınca kural ortaya çıkar.`,
            en: `Look at the DIFFERENCES between the numbers. Filling the boxes reveals the rule.`,
            ru: `Посмотри на РАЗНОСТИ между числами. Заполнив окошки, ты увидишь правило.`
          })
        },
        {
          text: L(lang, {
            tr: `İlk fark: ${terms[1]} − ${terms[0]} = ${d}.`,
            en: `First difference: ${terms[1]} − ${terms[0]} = ${d}.`,
            ru: `Первая разность: ${terms[1]} − ${terms[0]} = ${d}.`
          }),
          apply: (c) => fireVal(c.querySelector('.seq-input[data-idx="0"]'), diffs[0])
        },
        {
          text: L(lang, {
            tr: `Farklar her adımda 2 katına çıkıyor: ${diffs.join(', ')}.`,
            en: `The differences double each step: ${diffs.join(', ')}.`,
            ru: `Разности удваиваются: ${diffs.join(', ')}.`
          }),
          apply: (c) => { for (let i = 1; i < diffs.length; i++) fireVal(c.querySelector(`.seq-input[data-idx="${i}"]`), diffs[i]); }
        },
        {
          text: L(lang, {
            tr: `Sonraki artış ${diffs[3]} × 2 = ${nextDiff}. Yani ${terms[4]} + ${nextDiff} = ${answer}.`,
            en: `Next increase: ${diffs[3]} × 2 = ${nextDiff}. So ${terms[4]} + ${nextDiff} = ${answer}.`,
            ru: `Следующее прибавление: ${diffs[3]} × 2 = ${nextDiff}. Значит ${terms[4]} + ${nextDiff} = ${answer}.`
          })
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: Artışlar +${diffs.join(', +')} şeklindedir; her artış öncekinin 2 katıdır. Sonraki artış ${diffs[3]} × 2 = ${nextDiff} olmalıdır. ${terms[4]} + ${nextDiff} = ${answer} olur.`,
        en: `Solution: The increases are +${diffs.join(', +')}; each is double the previous. The next increase is ${diffs[3]} × 2 = ${nextDiff}. So ${terms[4]} + ${nextDiff} = ${answer}.`,
        ru: `Решение: Прибавления +${diffs.join(', +')}; каждое вдвое больше предыдущего. Следующее: ${diffs[3]} × 2 = ${nextDiff}. Значит ${terms[4]} + ${nextDiff} = ${answer}.`
      });
    },
    mistakes: [
      {
        value: terms[4] + diffs[3],
        msg(lang) {
          return L(lang, {
            tr: `Son artışı aynen tekrarladın (+${diffs[3]}). Ama bu örüntüde artışlar sabit değil: her artış bir öncekinin 2 KATI!`,
            en: `You repeated the last increase (+${diffs[3]}). But the increases aren't constant here: each one DOUBLES!`,
            ru: `Ты повторил последнее прибавление (+${diffs[3]}). Но здесь прибавления не постоянны: каждое УДВАИВАЕТСЯ!`
          });
        }
      }
    ],
    render(container, lang) {
      renderDiffSequence(container, lang, { terms, diffs, mode: 'add' });
    }
  };
}

function makeRatioPatternTask(taskNo) {
  const a = pick([1, 2, 3]);
  const r = pick([2, 3]);
  const terms = [a, a * r, a * r * r, a * r * r * r];
  const answer = terms[3] * r;

  return {
    answerType: 'number',
    answer,
    question(lang) {
      const seq = terms.join(', ');
      return L(lang, {
        tr: `${taskNo}. Görev: Köprünün diğer yarısındaki örüntü: ${seq}, [?] şeklindedir. Boş bırakılan yere hangi sayı gelmelidir?`,
        en: `Task ${taskNo}: The pattern on the other half of the bridge is ${seq}, [?]. Which number should replace the question mark?`,
        ru: `Задание ${taskNo}: Последовательность на другой половине моста: ${seq}, [?]. Какое число должно стоять вместо знака вопроса?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Bu sefer farklara değil, KATLARA bak: her sayı bir öncekinin kaç katı?`,
            en: `This time look at the RATIOS, not differences: each number is how many times the previous?`,
            ru: `На этот раз смотри не на разности, а на ОТНОШЕНИЯ: во сколько раз каждое больше предыдущего?`
          })
        },
        {
          text: L(lang, {
            tr: `${terms[1]} ÷ ${terms[0]} = ${r}. Demek ki ×${r}.`,
            en: `${terms[1]} ÷ ${terms[0]} = ${r}. So ×${r}.`,
            ru: `${terms[1]} ÷ ${terms[0]} = ${r}. Значит ×${r}.`
          }),
          apply: (c) => fireVal(c.querySelector('.seq-input[data-idx="0"]'), r)
        },
        {
          text: L(lang, {
            tr: `Her adımda ×${r}. Kutuların hepsine ${r} yaz.`,
            en: `Every step is ×${r}. Put ${r} in all boxes.`,
            ru: `Каждый шаг ×${r}. Впиши ${r} во все окошки.`
          }),
          apply: (c) => { for (let i = 1; i < 3; i++) fireVal(c.querySelector(`.seq-input[data-idx="${i}"]`), r); }
        },
        {
          text: L(lang, {
            tr: `Son sayıyı da ${r} ile çarp: ${terms[3]} × ${r} = ${answer}.`,
            en: `Multiply the last number by ${r}: ${terms[3]} × ${r} = ${answer}.`,
            ru: `Умножь последнее число на ${r}: ${terms[3]} × ${r} = ${answer}.`
          })
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: Her sayı bir öncekinin ${r} katıdır: ${terms[0]} × ${r} = ${terms[1]}, ${terms[1]} × ${r} = ${terms[2]}... O halde sonraki sayı: ${terms[3]} × ${r} = ${answer} olmalıdır.`,
        en: `Solution: Each number is ${r} times the previous: ${terms[0]} × ${r} = ${terms[1]}, ${terms[1]} × ${r} = ${terms[2]}... So the next number is ${terms[3]} × ${r} = ${answer}.`,
        ru: `Решение: Каждое число в ${r} раз больше предыдущего: ${terms[0]} × ${r} = ${terms[1]}, ${terms[1]} × ${r} = ${terms[2]}... Значит следующее: ${terms[3]} × ${r} = ${answer}.`
      });
    },
    mistakes: [
      {
        value: terms[3] + (terms[3] - terms[2]),
        msg(lang) {
          return L(lang, {
            tr: `Farkı ekledin — ama bu örüntü TOPLAMA değil ÇARPMA örüntüsü: her sayı öncekinin ${r} katı!`,
            en: `You added the difference — but this is a MULTIPLICATION pattern, not addition: each number is ${r} times the previous!`,
            ru: `Ты прибавил разность — но это последовательность УМНОЖЕНИЯ, а не сложения: каждое число в ${r} раз больше!`
          });
        }
      }
    ],
    render(container, lang) {
      renderDiffSequence(container, lang, { terms, diffs: [r, r, r], mode: 'mul' });
    }
  };
}

// Ortak örüntü görseli: artışları/çarpanları ÖĞRENCİ yazar
function renderDiffSequence(container, lang, cfg) {
  const t = ui[lang];
  const { terms, diffs, mode } = cfg;
  const maxTerm = Math.max(...terms);
  const heights = terms.map(v => 40 + Math.round((v / maxTerm) * 110));

  let html = `<div class="vis-pattern">
    <p class="vis-instruction">${mode === 'add' ? t["vis-diff-instruction"] : t["vis-ratio-instruction"]}</p>
    <div class="pattern-sequence">`;
  terms.forEach((term, i) => {
    html += `<div class="seq-item"><div class="seq-block" style="height: ${heights[i]}px;">${term}</div></div>`;
    if (i < terms.length - 1) {
      html += `<div class="seq-diff seq-diff--input"><span class="diff-op">${mode === 'add' ? '+' : '×'}</span><input class="step-input seq-input" data-idx="${i}" inputmode="numeric" placeholder="?" /></div>`;
    }
  });
  html += `<div class="seq-diff seq-diff--glow">${mode === 'add' ? '+?' : '×?'}</div>
    <div class="seq-item"><div class="seq-block seq-block--target" style="height: 170px;">?</div></div>
    </div>
    <div class="pattern-explain" id="pattern-explain">${t["vis-pattern-explain-default"]}</div>
  </div>`;
  container.innerHTML = html;

  const explain = container.querySelector('#pattern-explain');
  const inputs = container.querySelectorAll('.seq-input');
  let solvedCount = 0;
  inputs.forEach((input) => {
    const idx = parseInt(input.getAttribute('data-idx'), 10);
    bindStepInput(input, diffs[idx], () => {
      solvedCount++;
      if (solvedCount === diffs.length) {
        explain.innerHTML = L(lang, {
          tr: mode === 'add'
            ? `Tüm artışları buldun! 🎉 Şimdi SONRAKİ artışı tahmin et ve son sayıya ekleyerek hedefi hesapla. Cevabını aşağıya gir!`
            : `Çarpanı buldun! 🎉 Son sayıyı ${diffs[0]} ile çarparak hedefi hesapla ve cevabını aşağıya gir!`,
          en: mode === 'add'
            ? `You found all the increases! 🎉 Now predict the NEXT increase, add it to the last number and enter your answer below!`
            : `You found the multiplier! 🎉 Multiply the last number by ${diffs[0]} and enter your answer below!`,
          ru: mode === 'add'
            ? `Ты нашёл все прибавления! 🎉 Теперь предскажи СЛЕДУЮЩЕЕ, прибавь к последнему числу и введи ответ ниже!`
            : `Ты нашёл множитель! 🎉 Умножь последнее число на ${diffs[0]} и введи ответ ниже!`
        });
      }
    });
  });
}

// ---------------------------------------------------------------------------
// KAPI 3 — Zümrüt Kulesi (Kesirler)
// ---------------------------------------------------------------------------
const FRAC_COMBOS = [
  { p: 3, q: 2 }, { p: 3, q: 4 }, { p: 2, q: 2 }, { p: 2, q: 3 },
  { p: 4, q: 3 }, { p: 6, q: 2 }, { p: 6, q: 5 }, { p: 2, q: 6 }
];
const TR_FRAC = { 2: "yarısını", 3: "1/3'ünü", 4: "1/4'ünü", 5: "1/5'ini", 6: "1/6'sını" };
function fracPhrase(lang, n) {
  if (lang === 'tr') return TR_FRAC[n];
  if (lang === 'ru') return n === 2 ? 'половину' : `1/${n}`;
  return n === 2 ? 'half' : `1/${n}`;
}

function makeFractionTask(taskNo, excludeCombo) {
  let combo = pick(FRAC_COMBOS);
  while (excludeCombo && combo.p === excludeCombo.p && combo.q === excludeCombo.q) {
    combo = pick(FRAC_COMBOS);
  }
  const { p, q } = combo;
  const vBoxes = 12 / p;
  const remBoxes = 12 - vBoxes;
  const sBoxes = remBoxes / q;
  const leftBoxes = remBoxes - sBoxes;
  const w = pick([1, 2, 3, 4, 5]);
  const leftEmeralds = leftBoxes * w;
  const answer = 12 * w;

  return {
    answerType: 'number',
    answer,
    combo,
    question(lang) {
      return L(lang, {
        tr: `${taskNo}. Görev: Bir torbadaki sihirli zümrütlerin ${fracPhrase('tr', p)} Vanessa alıyor. Kalan zümrütlerin ${fracPhrase('tr', q)} Sam alıyor. Geriye ${leftEmeralds} zümrüt kaldığına göre, başlangıçta kaç zümrüt vardı?`,
        en: `Task ${taskNo}: Vanessa takes ${fracPhrase('en', p)} of the magic emeralds in a bag. Sam takes ${fracPhrase('en', q)} of the remaining emeralds. If ${leftEmeralds} emeralds are left, how many emeralds were there at the start?`,
        ru: `Задание ${taskNo}: Ванесса берёт ${fracPhrase('ru', p)} волшебных изумрудов из мешка. Сэм берёт ${fracPhrase('ru', q)} оставшихся. Если осталось ${leftEmeralds} изумрудов, сколько их было в начале?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Şekil çiz! Bütünü 12 eş kutuya böl — kesirleri kutularla göstermek çok kolaylaştırır.`,
            en: `Draw a model! Split the whole into 12 equal boxes — fractions are much easier with boxes.`,
            ru: `Нарисуй модель! Раздели целое на 12 равных коробок — с коробками дроби намного проще.`
          })
        },
        {
          text: L(lang, {
            tr: `Vanessa'nın payı: 12 ÷ ${p} = ${vBoxes} kutu. Geriye ${remBoxes} kutu kalır.`,
            en: `Vanessa's share: 12 ÷ ${p} = ${vBoxes} boxes. ${remBoxes} boxes remain.`,
            ru: `Доля Ванессы: 12 ÷ ${p} = ${vBoxes}. Остаётся ${remBoxes}.`
          }),
          apply: (c) => fireVal(c.querySelector('#frac-in-1'), vBoxes)
        },
        {
          text: L(lang, {
            tr: `Sam kalan ${remBoxes} kutunun ${TR_FRAC[q] || `1/${q}'i`} = ${sBoxes} kutu alır. Geriye ${leftBoxes} kutu kalır.`,
            en: `Sam takes ${sBoxes} of the ${remBoxes} remaining boxes. ${leftBoxes} boxes remain.`,
            ru: `Сэм берёт ${sBoxes} из ${remBoxes} оставшихся. Остаётся ${leftBoxes}.`
          }),
          apply: (c) => fireVal(c.querySelector('#frac-in-2'), sBoxes)
        },
        {
          text: L(lang, {
            tr: `${leftBoxes} kutu = ${leftEmeralds} zümrüt. Demek ki 1 kutu = ${w} zümrüt.`,
            en: `${leftBoxes} boxes = ${leftEmeralds} emeralds. So 1 box = ${w} emeralds.`,
            ru: `${leftBoxes} коробок = ${leftEmeralds} изумрудов. Значит 1 коробка = ${w}.`
          }),
          apply: (c) => fireVal(c.querySelector('#frac-in-3'), w)
        },
        {
          text: L(lang, {
            tr: `Başlangıçta 12 kutu vardı: 12 × ${w} = ${answer} zümrüt.`,
            en: `There were 12 boxes at the start: 12 × ${w} = ${answer} emeralds.`,
            ru: `В начале было 12 коробок: 12 × ${w} = ${answer} изумрудов.`
          })
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: Bütünü 12 kutu sayalım. Vanessa ${vBoxes} kutu alır, ${remBoxes} kutu kalır. Sam kalan ${remBoxes} kutunun ${TR_FRAC[q] || `1/${q}'i`} (${sBoxes} kutu) alır, ${leftBoxes} kutu kalır. ${leftBoxes} kutu = ${leftEmeralds} zümrüt ise 1 kutu = ${w} zümrüttür. Başlangıç: 12 × ${w} = ${answer} zümrüt.`,
        en: `Solution: Count the whole as 12 boxes. Vanessa takes ${vBoxes}, leaving ${remBoxes}. Sam takes ${sBoxes} of them, leaving ${leftBoxes} boxes. ${leftBoxes} boxes = ${leftEmeralds} emeralds, so 1 box = ${w}. Start: 12 × ${w} = ${answer} emeralds.`,
        ru: `Решение: Считаем целое как 12 коробок. Ванесса берёт ${vBoxes}, остаётся ${remBoxes}. Сэм берёт ${sBoxes}, остаётся ${leftBoxes} коробок. ${leftBoxes} коробок = ${leftEmeralds} изумрудов, значит 1 коробка = ${w}. Начало: 12 × ${w} = ${answer} изумрудов.`
      });
    },
    mistakes: [
      {
        value: leftBoxes,
        msg(lang) {
          return L(lang, {
            tr: `${leftBoxes} geriye kalan KUTU sayısı. Soru, başlangıçtaki TOPLAM zümrüt sayısını soruyor: önce 1 kutunun değerini bul!`,
            en: `${leftBoxes} is the number of remaining BOXES. The question asks the TOTAL emeralds at the start: find the value of 1 box first!`,
            ru: `${leftBoxes} — это число оставшихся КОРОБОК. Вопрос про ОБЩЕЕ число изумрудов: сначала найди цену 1 коробки!`
          });
        }
      },
      {
        value: leftEmeralds,
        msg(lang) {
          return L(lang, {
            tr: `${leftEmeralds} geriye KALAN zümrüt sayısı; istenen başlangıçtaki TOPLAM. 12 kutunun tamamını hesapla!`,
            en: `${leftEmeralds} is what REMAINS; we need the TOTAL at the start. Compute all 12 boxes!`,
            ru: `${leftEmeralds} — это ОСТАТОК; нужно ОБЩЕЕ число в начале. Посчитай все 12 коробок!`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      container.innerHTML = `
        <div class="vis-fraction">
          <p class="vis-instruction">${t["vis-fraction-instruction"]}</p>
          <div class="fraction-bar" id="fraction-bar"></div>
          <div class="frac-steps">
            <div class="frac-step" id="fs-1">
              <label>${t["vis-frac-step1"]}</label>
              <input class="step-input" id="frac-in-1" inputmode="numeric" placeholder="?" />
            </div>
            <div class="frac-step frac-step--hidden" id="fs-2">
              <label>${t["vis-frac-step2"]}</label>
              <input class="step-input" id="frac-in-2" inputmode="numeric" placeholder="?" />
            </div>
            <div class="frac-step frac-step--hidden" id="fs-3">
              <label>${t["vis-frac-step3"]}</label>
              <input class="step-input" id="frac-in-3" inputmode="numeric" placeholder="?" />
            </div>
          </div>
          <div class="fraction-explain" id="fraction-explain">${t["vis-fraction-explain-default"]}</div>
        </div>
      `;
      const bar = container.querySelector('#fraction-bar');
      const explain = container.querySelector('#fraction-explain');
      for (let i = 0; i < 12; i++) {
        const block = document.createElement('div');
        block.className = 'fraction-block';
        block.innerHTML = `<span class="block-num">${i + 1}</span>`;
        bar.appendChild(block);
      }
      const blocks = bar.querySelectorAll('.fraction-block');

      bindStepInput(container.querySelector('#frac-in-1'), vBoxes, () => {
        for (let i = 0; i < vBoxes; i++) { blocks[i].classList.add('fraction-block--vanessa'); blocks[i].innerHTML = 'V'; }
        container.querySelector('#fs-2').classList.remove('frac-step--hidden');
        explain.innerHTML = L(lang, {
          tr: `Vanessa ${vBoxes} kutu aldı, <span class="text-accent">${remBoxes} kutu</span> kaldı.`,
          en: `Vanessa took ${vBoxes} boxes; <span class="text-accent">${remBoxes} boxes</span> remain.`,
          ru: `Ванесса взяла ${vBoxes}; осталось <span class="text-accent">${remBoxes}</span>.`
        });
      });
      bindStepInput(container.querySelector('#frac-in-2'), sBoxes, () => {
        for (let i = vBoxes; i < vBoxes + sBoxes; i++) { blocks[i].classList.add('fraction-block--sam'); blocks[i].innerHTML = 'S'; }
        container.querySelector('#fs-3').classList.remove('frac-step--hidden');
        explain.innerHTML = L(lang, {
          tr: `Sam ${sBoxes} kutu aldı, geriye <span class="text-accent">${leftBoxes} kutu</span> kaldı. Bu ${leftBoxes} kutu, sorudaki ${leftEmeralds} zümrüte eşit!`,
          en: `Sam took ${sBoxes} boxes; <span class="text-accent">${leftBoxes} boxes</span> remain. Those equal the ${leftEmeralds} emeralds in the question!`,
          ru: `Сэм взял ${sBoxes}; осталось <span class="text-accent">${leftBoxes}</span>. Это и есть ${leftEmeralds} изумрудов из задачи!`
        });
      });
      bindStepInput(container.querySelector('#frac-in-3'), w, () => {
        for (let i = vBoxes + sBoxes; i < 12; i++) { blocks[i].classList.add('fraction-block--emerald'); blocks[i].innerHTML = '💎'; }
        explain.innerHTML = `<strong>${t["vis-frac-done"]}</strong>`;
      });
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 4 — Muhafız Geçidi (Terazi / Kat Modeli)
// ---------------------------------------------------------------------------
function makeScaleTask(taskNo, withExtra) {
  const m = withExtra ? pick([2, 3]) : pick([2, 3, 4]);
  const y = randInt(7, 15);
  const f = withExtra ? randInt(2, 6) : 0;
  const S = y * (m + 1) + f;
  const answer = m * y + f;
  const sliderMin = Math.max(4, y - 6);
  const sliderMax = y + 6;

  return {
    answerType: 'number',
    answer,
    question(lang) {
      return L(lang, {
        tr: withExtra
          ? `${taskNo}. Görev: Diğer iki muhafızın bilmecesi: Baş muhafızın yaşı, genç muhafızın yaşının ${m} katından ${f} fazladır. İkisinin yaşları toplamı ${S} olduğuna göre baş muhafız kaç yaşındadır?`
          : `${taskNo}. Görev: Baş muhafızın yaşı, genç muhafızın yaşının tam ${m} katıdır. İkisinin yaşları toplamı ${S} olduğuna göre baş muhafız kaç yaşındadır?`,
        en: withExtra
          ? `Task ${taskNo}: The riddle of the other two guards: The head guard's age is ${f} more than ${m} times the young guard's age. Their ages add up to ${S}. How old is the head guard?`
          : `Task ${taskNo}: The head guard's age is exactly ${m} times the young guard's age. Their ages add up to ${S}. How old is the head guard?`,
        ru: withExtra
          ? `Задание ${taskNo}: Загадка двух других стражей: возраст старшего на ${f} больше, чем ${m}-кратный возраст младшего. Сумма их возрастов ${S}. Сколько лет старшему?`
          : `Задание ${taskNo}: Возраст старшего стража ровно в ${m} раз больше возраста младшего. Сумма их возрастов ${S}. Сколько лет старшему?`
      });
    },
    hints(lang) {
      const steps = [
        {
          text: L(lang, {
            tr: `Kutu modeli kur: genç muhafız 1 kutu, baş muhafız ${m} kutu${f ? ` artı ${f}` : ''}. Toplam ${m + 1} kutu${f ? ` + ${f}` : ''} = ${S}.`,
            en: `Build a box model: young guard = 1 box, head guard = ${m} boxes${f ? ` plus ${f}` : ''}. Total ${m + 1} boxes${f ? ` + ${f}` : ''} = ${S}.`,
            ru: `Построй модель: младший = 1 коробка, старший = ${m} коробки${f ? ` плюс ${f}` : ''}. Всего ${m + 1} коробок${f ? ` + ${f}` : ''} = ${S}.`
          })
        }
      ];
      if (f) {
        steps.push({
          text: L(lang, {
            tr: `Önce fazlalığı çıkar: ${S} − ${f} = ${S - f}. Bu, ${m + 1} eşit kutunun toplamı.`,
            en: `First remove the extra: ${S} − ${f} = ${S - f}. That's the total of ${m + 1} equal boxes.`,
            ru: `Сначала убери лишнее: ${S} − ${f} = ${S - f}. Это сумма ${m + 1} равных коробок.`
          })
        });
      }
      steps.push({
        text: L(lang, {
          tr: `1 kutu (genç muhafızın yaşı) = ${S - f} ÷ ${m + 1} = ${y}. Sürgüyü ${y}'ye getir, terazi dengelenir!`,
          en: `1 box (young guard's age) = ${S - f} ÷ ${m + 1} = ${y}. Set the slider to ${y} and the scale balances!`,
          ru: `1 коробка (возраст младшего) = ${S - f} ÷ ${m + 1} = ${y}. Поставь ползунок на ${y} — весы уравновесятся!`
        }),
        apply: (c) => { const s = c.querySelector('#scale-slider'); if (s) { s.value = String(y); s.dispatchEvent(new Event('input', { bubbles: true })); } }
      });
      steps.push({
        text: L(lang, {
          tr: `Baş muhafız = ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer}.`,
          en: `Head guard = ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer}.`,
          ru: `Старший = ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer}.`
        })
      });
      return steps;
    },
    solution(lang) {
      const eq = f ? `${S} - ${f} = ${S - f}; ${S - f} ÷ ${m + 1} = ${y}` : `${S} ÷ ${m + 1} = ${y}`;
      return L(lang, {
        tr: `Çözüm: Genç = 1 kat, Baş = ${m} kat${f ? ` + ${f}` : ''}. ${eq} (genç muhafızın yaşı). Baş muhafız: ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer} yaşındadır.`,
        en: `Solution: Young = 1 unit, Head = ${m} units${f ? ` + ${f}` : ''}. ${eq} (the young guard's age). Head guard: ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer}.`,
        ru: `Решение: Младший = 1 часть, старший = ${m} части${f ? ` + ${f}` : ''}. ${eq} (возраст младшего). Старший: ${m} × ${y}${f ? ` + ${f}` : ''} = ${answer}.`
      });
    },
    mistakes: [
      {
        value: y,
        msg(lang) {
          return L(lang, {
            tr: f ? `${y}, GENÇ muhafızın yaşı! Soru BAŞ muhafızı soruyor: ${m} katının ${f} fazlasını hesapla.` : `${y}, GENÇ muhafızın yaşı! Soru BAŞ muhafızı soruyor: ${m} katını hesapla.`,
            en: `${y} is the YOUNG guard's age! The question asks the HEAD guard: compute ${m} times${f ? ` plus ${f}` : ''}.`,
            ru: `${y} — возраст МЛАДШЕГО! Вопрос про СТАРШЕГО: умножь на ${m}${f ? ` и прибавь ${f}` : ''}.`
          });
        }
      },
      ...(f ? [{
        value: m * y,
        msg(lang) {
          return L(lang, {
            tr: `Çok yaklaştın! ${m} katını buldun ama "${f} fazlası"nı eklemeyi unuttun.`,
            en: `So close! You found ${m} times, but forgot to add the extra ${f}.`,
            ru: `Почти! Ты нашёл ${m}-кратное, но забыл прибавить ${f}.`
          });
        }
      }] : []),
      {
        value: S,
        msg(lang) {
          return L(lang, {
            tr: `${S}, ikisinin yaşları TOPLAMI. Baş muhafızın yaşını bulmak için önce 1 katın değerini bul.`,
            en: `${S} is the SUM of their ages. First find the value of 1 unit.`,
            ru: `${S} — это СУММА возрастов. Сначала найди цену 1 части.`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      container.innerHTML = `
        <div class="vis-scale">
          <p class="vis-instruction">${t["vis-scale-instruction"]}</p>
          <div class="scale-container">
            <div class="scale-beam" id="scale-beam">
              <div class="scale-pan scale-pan--left" id="pan-left">
                <div class="pan-contents" id="left-contents"></div>
              </div>
              <div class="scale-pan scale-pan--right" id="pan-right">
                <div class="pan-contents"><div class="weight-block">${S}</div></div>
              </div>
            </div>
            <div class="scale-base"></div>
          </div>
          <div class="scale-control">
            <label for="scale-slider">${t["vis-scale-slider-label"]} (<span class="text-gold" style="font-weight:bold;" id="slider-val">${sliderMin}</span>):</label>
            <input type="range" id="scale-slider" min="${sliderMin}" max="${sliderMax}" value="${sliderMin}" step="1" style="width:100%; max-width: 300px;">
          </div>
          <div class="scale-explain" id="scale-explain">${t["vis-scale-explain-default"]}</div>
        </div>
      `;
      const slider = container.querySelector('#scale-slider');
      const sliderVal = container.querySelector('#slider-val');
      const beam = container.querySelector('#scale-beam');
      const leftContents = container.querySelector('#left-contents');
      const explain = container.querySelector('#scale-explain');

      function updateScale() {
        const val = parseInt(slider.value, 10);
        sliderVal.textContent = val;
        let headBoxes = '';
        for (let i = 0; i < m; i++) headBoxes += `<div class="scale-box scale-box--lead">${val}</div>`;
        leftContents.innerHTML = `
          <div class="pan-row"><span class="block-lbl">${t["vis-scale-young-label"]}</span> <div class="scale-box scale-box--young">${val}</div></div>
          <div class="pan-row"><span class="block-lbl">${t["vis-scale-lead-label"].replace("{factor}", String(m))}</span> ${headBoxes}${f ? `<div class="scale-box scale-box--extra">+${f}</div>` : ''}</div>
        `;
        const totalLeft = val * (m + 1) + f;
        const diff = totalLeft - S;
        const maxTilt = 15;
        let tilt = (diff / S) * maxTilt * 2;
        tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));
        beam.style.transform = `rotate(${tilt}deg)`;
        const panLeft = container.querySelector('#pan-left');
        const panRight = container.querySelector('#pan-right');
        panLeft.style.transform = `rotate(${-tilt}deg)`;
        panRight.style.transform = `rotate(${-tilt}deg)`;

        if (totalLeft === S) {
          beam.classList.add('scale-beam--balanced');
          explain.innerHTML = t["vis-scale-explain-balanced"].replace("{age}", String(y)).replace("{factor}", String(m))
            + (f ? L(lang, {
              tr: `<br>Unutma: baş muhafız ${m} kat <strong>+ ${f}</strong>!`,
              en: `<br>Remember: the head guard is ${m} units <strong>+ ${f}</strong>!`,
              ru: `<br>Помни: старший — ${m} части <strong>+ ${f}</strong>!`
            }) : '');
        } else {
          beam.classList.remove('scale-beam--balanced');
          const status = diff > 0
            ? L(lang, { tr: "Ağır Geldi", en: "Heavy", ru: "Перевес" })
            : L(lang, { tr: "Hafif Geldi", en: "Light", ru: "Недовес" });
          explain.innerHTML = L(lang, {
            tr: `Sol Taraf Toplamı: <span class="text-accent">${totalLeft}</span> (Hedef: ${S}). Sol Taraf <strong>${status}</strong>.<br>Dengeyi bulmak için kaydırıcıyı oynat!`,
            en: `Left Side Total: <span class="text-accent">${totalLeft}</span> (Target: ${S}). Left Side is <strong>${status}</strong>.<br>Move the slider to balance!`,
            ru: `Слева всего: <span class="text-accent">${totalLeft}</span> (Цель: ${S}). Слева <strong>${status}</strong>.<br>Двигай ползунок для баланса!`
          });
        }
      }
      slider.addEventListener('input', () => {
        if (Math.random() > 0.6) playClick();
        updateScale();
      });
      updateScale();
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 5 — Erzak Kamyonları (Yüzdeler)
// ---------------------------------------------------------------------------
const PCT_TR = { 10: "'u", 20: "'si", 25: "'i", 30: "'u", 40: "'ı", 50: "'si" };

function makePercentTask(taskNo, excludeP) {
  const N = pick([40, 60, 80, 120, 200]);
  let P = pick([10, 20, 25, 30, 40, 50]);
  while ((N * P) % 100 !== 0 || P === excludeP) {
    P = pick([10, 20, 25, 30, 40, 50]);
  }
  const answer = (N * P) / 100;
  const itemKey = taskNo === 1 ? 'crate' : 'bread';
  const item = {
    crate: { tr: "sandık", en: "crates", ru: "ящиков" },
    bread: { tr: "erzak paketi", en: "supply packages", ru: "пакетов с припасами" }
  }[itemKey];
  const what = {
    crate: { tr: "zümrüt dolu", en: "full of emeralds", ru: "с изумрудами" },
    bread: { tr: "ekmek", en: "bread", ru: "с хлебом" }
  }[itemKey];

  return {
    answerType: 'number',
    answer,
    P, N,
    question(lang) {
      const trQ = itemKey === 'crate'
        ? `${taskNo}. Görev: Birinci kamyonda ${N} sandık var. Bunların %${P}${PCT_TR[P]} zümrüt dolu. Kaç sandık zümrüt doludur?`
        : `${taskNo}. Görev: İkinci kamyonda ${N} erzak paketi var. Bunların %${P}${PCT_TR[P]} ekmek. Kamyonda kaç paket ekmek vardır?`;
      return L(lang, {
        tr: trQ,
        en: `Task ${taskNo}: The ${taskNo === 1 ? 'first' : 'second'} truck carries ${N} ${item.en}. ${P}% of them are ${what.en}. How many ${item.en} are ${what.en}?`,
        ru: `Задание ${taskNo}: В ${taskNo === 1 ? 'первом' : 'втором'} грузовике ${N} ${item.ru}. ${P}% из них — ${what.ru}. Сколько их?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `%${P} demek, 100 eş parçadan ${P} tanesi demek. Yüzlük tabloda ${P} kutu boyamak bunu gösterir.`,
            en: `${P}% means ${P} out of 100 equal parts. Shading ${P} cells in the hundred grid shows this.`,
            ru: `${P}% — это ${P} из 100 равных частей. Закрась ${P} клеток в сотенной таблице.`
          }),
          apply: (c) => {
            const cells = c.querySelectorAll('.percent-cell');
            cells.forEach(cell => cell.classList.remove('percent-cell--shaded'));
            for (let i = 0; i < P && i < cells.length; i++) cells[i].click();
          }
        },
        {
          text: L(lang, {
            tr: `${N}'i 100 parçaya bölüp ${P} parçasını al: ${N} × ${P} = ${N * P}.`,
            en: `Split ${N} into 100 parts and take ${P}: ${N} × ${P} = ${N * P}.`,
            ru: `Раздели ${N} на 100 частей и возьми ${P}: ${N} × ${P} = ${N * P}.`
          })
        },
        {
          text: L(lang, {
            tr: `Şimdi 100'e böl: ${N * P} ÷ 100 = ${answer}.`,
            en: `Now divide by 100: ${N * P} ÷ 100 = ${answer}.`,
            ru: `Теперь раздели на 100: ${N * P} ÷ 100 = ${answer}.`
          })
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: ${N} sayısının %${P}${PCT_TR[P]} = ${N} × ${P} ÷ 100 = ${N * P} ÷ 100 = ${answer} olur.`,
        en: `Solution: ${P}% of ${N} = ${N} × ${P} ÷ 100 = ${N * P} ÷ 100 = ${answer}.`,
        ru: `Решение: ${P}% от ${N} = ${N} × ${P} ÷ 100 = ${N * P} ÷ 100 = ${answer}.`
      });
    },
    mistakes: [
      {
        value: P,
        msg(lang) {
          return L(lang, {
            tr: `%${P} oranın kendisi. Soru, bu yüzdeye karşılık gelen MİKTARI soruyor: ${N} × ${P} ÷ 100.`,
            en: `${P} is the percent itself. The question asks the AMOUNT: ${N} × ${P} ÷ 100.`,
            ru: `${P} — это сам процент. Вопрос про КОЛИЧЕСТВО: ${N} × ${P} ÷ 100.`
          });
        }
      },
      {
        value: N - answer,
        msg(lang) {
          return L(lang, {
            tr: `Bu, geriye kalan kısmın miktarı (%${100 - P}). Soru %${P}'lik kısmı soruyor!`,
            en: `That's the remaining part (${100 - P}%). The question asks the ${P}% part!`,
            ru: `Это оставшаяся часть (${100 - P}%). Вопрос про часть в ${P}%!`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      container.innerHTML = `
        <div class="vis-percent">
          <p class="vis-instruction">${t["vis-percent-instruction"]}</p>
          <div class="percent-status">
            <span class="percent-chip percent-chip--target">${t["vis-percent-target"].replace("{p}", String(P))}</span>
            <span class="percent-chip" id="percent-shaded">${t["vis-percent-shaded"].replace("{p}", "0")}</span>
          </div>
          <div class="percent-grid" id="percent-grid"></div>
          <div class="vis-actions">
            <button class="btn btn--secondary btn--small" id="btn-p10">${t["vis-percent-plus10"]}</button>
            <button class="btn btn--secondary btn--small" id="btn-pclear">${t["vis-percent-clear"]}</button>
          </div>
          <div class="percent-explain" id="percent-explain">&nbsp;</div>
        </div>
      `;
      const grid = container.querySelector('#percent-grid');
      const shadedChip = container.querySelector('#percent-shaded');
      const explain = container.querySelector('#percent-explain');
      const cells = [];
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'percent-cell';
        grid.appendChild(cell);
        cells.push(cell);
        cell.addEventListener('click', () => {
          cell.classList.toggle('percent-cell--shaded');
          update();
        });
      }
      function shadedCount() {
        return cells.filter(c => c.classList.contains('percent-cell--shaded')).length;
      }
      function update() {
        const n = shadedCount();
        shadedChip.textContent = t["vis-percent-shaded"].replace("{p}", String(n));
        if (n === P) {
          explain.innerHTML = `<strong>${t["vis-percent-done"].replace(/\{p\}/g, String(P)).replace("{n}", String(N))}</strong>`;
          explain.classList.add('percent-explain--done');
        } else {
          explain.innerHTML = '&nbsp;';
          explain.classList.remove('percent-explain--done');
        }
      }
      container.querySelector('#btn-p10').addEventListener('click', () => {
        playClick();
        let added = 0;
        for (const c of cells) {
          if (added >= 10) break;
          if (!c.classList.contains('percent-cell--shaded')) { c.classList.add('percent-cell--shaded'); added++; }
        }
        update();
      });
      container.querySelector('#btn-pclear').addEventListener('click', () => {
        playClick();
        cells.forEach(c => c.classList.remove('percent-cell--shaded'));
        update();
      });
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 6 — Gümüş Kuleler (Aritmetik Örüntü)
// ---------------------------------------------------------------------------
function makeArithmeticTask(taskNo, far) {
  const a = randInt(2, 9);
  const d = randInt(3, 9);
  const n = far ? pick([6, 7]) : 5;
  const answer = a + (n - 1) * d;
  const shown = [a, a + d, a + 2 * d, a + 3 * d];

  return {
    answerType: 'number',
    answer,
    question(lang) {
      const seq = shown.join(', ');
      return L(lang, {
        tr: far
          ? `${taskNo}. Görev: İkinci kule sırası ${seq}, ... şeklinde uzayıp gidiyor. Bu örüntünün ${n}. kulesinin yüksekliği kaç metredir?`
          : `${taskNo}. Görev: İlk kulesi ${a} m, ikincisi ${a + d} m, üçüncüsü ${a + 2 * d} m olan gümüş kuleler örüntüsünde ${n}. kulenin yüksekliği kaç metredir?`,
        en: far
          ? `Task ${taskNo}: The second row of towers continues as ${seq}, ... How tall is tower number ${n} in this pattern?`
          : `Task ${taskNo}: In the silver tower pattern whose first towers are ${a} m, ${a + d} m and ${a + 2 * d} m, how tall is tower number ${n}?`,
        ru: far
          ? `Задание ${taskNo}: Второй ряд башен продолжается: ${seq}, ... Какова высота башни №${n}?`
          : `Задание ${taskNo}: Первые башни — ${a} м, ${a + d} м, ${a + 2 * d} м. Какова высота башни №${n}?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Önce örüntünün kuralını bul: her kule bir öncekinden kaç metre yüksek? Kutulara farkı yaz.`,
            en: `First find the rule: how many meters taller is each tower? Type the difference in the boxes.`,
            ru: `Сначала найди правило: на сколько выше каждая башня? Впиши разность в окошки.`
          })
        },
        {
          text: L(lang, {
            tr: `İlk fark: ${a + d} − ${a} = ${d}. Örüntü her adımda ${d} artıyor.`,
            en: `First difference: ${a + d} − ${a} = ${d}. The pattern grows by ${d} each step.`,
            ru: `Первая разность: ${a + d} − ${a} = ${d}. Узор растёт на ${d}.`
          }),
          apply: (c) => { for (let i = 0; i < 3; i++) fireVal(c.querySelector(`.seq-input[data-idx="${i}"]`), d); }
        },
        {
          text: L(lang, {
            tr: `${n}. kuleye ulaşmak için ${a}'ya ${n - 1} kez ${d} ekle: ${a} + ${n - 1} × ${d} = ${answer}.`,
            en: `To reach tower ${n}, add ${d} to ${a}, ${n - 1} times: ${a} + ${n - 1} × ${d} = ${answer}.`,
            ru: `Чтобы дойти до башни ${n}, прибавь ${d} к ${a} ${n - 1} раз: ${a} + ${n - 1} × ${d} = ${answer}.`
          })
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: Kural her adımda +${d}. ${n}. kule = ${a} + ${n - 1} × ${d} = ${a} + ${(n - 1) * d} = ${answer} olur.`,
        en: `Solution: The rule is +${d} each step. Tower ${n} = ${a} + ${n - 1} × ${d} = ${a} + ${(n - 1) * d} = ${answer}.`,
        ru: `Решение: Правило +${d} на шаг. Башня ${n} = ${a} + ${n - 1} × ${d} = ${a} + ${(n - 1) * d} = ${answer}.`
      });
    },
    mistakes: [
      {
        value: a + (n - 2) * d,
        msg(lang) {
          return L(lang, {
            tr: `Bir adım eksik saydın: bu ${n - 1}. kulenin yüksekliği. Bir kez daha ${d} ekle!`,
            en: `One step short: that's tower ${n - 1}. Add ${d} once more!`,
            ru: `На шаг меньше: это башня ${n - 1}. Прибавь ${d} ещё раз!`
          });
        }
      },
      {
        value: a + n * d,
        msg(lang) {
          return L(lang, {
            tr: `Bir adım fazla gittin: bu ${n + 1}. kule olurdu. ${n}. kule için ${n - 1} kez ${d} eklemelisin.`,
            en: `One step too far: that would be tower ${n + 1}. For tower ${n}, add ${d} exactly ${n - 1} times.`,
            ru: `На шаг больше: это была бы башня ${n + 1}. Для башни ${n} прибавь ${d} ровно ${n - 1} раз.`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      const all = [a, a + d, a + 2 * d, a + 3 * d];
      const maxH = a + 4 * d;
      let html = `<div class="vis-towers">
        <p class="vis-instruction">${t["vis-diff-instruction"]}</p>
        <div class="towers-row">`;
      all.forEach((v, i) => {
        const h = 45 + Math.round((v / maxH) * 110);
        html += `<div class="tower-col" style="height:${h}px;"><div class="t-col-roof"></div><div class="t-col-body">${v}</div></div>`;
        if (i < all.length - 1) {
          html += `<div class="tower-col-diff seq-diff--input"><span class="diff-op">+</span><input class="step-input seq-input" data-idx="${i}" inputmode="numeric" placeholder="?" /></div>`;
        }
      });
      html += `<div class="tower-col-diff">→</div>
        <div class="tower-col tower-col--target" style="height:170px;"><div class="t-col-roof"></div><div class="t-col-body">${n}.?</div></div>
        </div>
        <div class="towers-explain" id="towers-explain">${t["vis-towers-explain-default"]}</div>
      </div>`;
      container.innerHTML = html;
      const explain = container.querySelector('#towers-explain');
      let solved = 0;
      container.querySelectorAll('.seq-input').forEach(input => {
        bindStepInput(input, d, () => {
          solved++;
          if (solved === 3) {
            explain.innerHTML = L(lang, {
              tr: `Kural: her kule +${d}! 🎉 Şimdi ${n}. kulenin yüksekliğini hesapla ve aşağıya gir. (${a} üzerine ${n - 1} kez ${d} ekle.)`,
              en: `Rule: each tower +${d}! 🎉 Now compute tower ${n} and enter it below. (Add ${d} to ${a}, ${n - 1} times.)`,
              ru: `Правило: каждая башня +${d}! 🎉 Вычисли башню ${n} и введи ниже. (Прибавь ${d} к ${a}, ${n - 1} раз.)`
            });
          }
        });
      });
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 7 — Monoculus Soyu (Varsayım Stratejisi)
// ---------------------------------------------------------------------------
function makeMonsterTask(taskNo, excludeN) {
  let n = randInt(7, 10);
  while (n === excludeN) n = randInt(7, 10);
  const c = randInt(2, n - 2);
  const E = n + 2 * c;
  const answer = c;

  return {
    answerType: 'number',
    answer,
    n,
    question(lang) {
      return L(lang, {
        tr: `${taskNo}. Görev: Mağaradaki bu grupta toplam ${n} canavar var; hepsi ya tek gözlü ya da 3 gözlü. Toplam göz sayısı ${E} olduğuna göre, 3 gözlü canavarların sayısı kaçtır?`,
        en: `Task ${taskNo}: This cave group has ${n} monsters; each has either 1 eye or 3 eyes. The total number of eyes is ${E}. How many monsters have 3 eyes?`,
        ru: `Задание ${taskNo}: В этой группе ${n} монстров; у каждого 1 или 3 глаза. Всего глаз ${E}. Сколько монстров с 3 глазами?`
      });
    },
    hints(lang) {
      return [
        {
          text: L(lang, {
            tr: `Varsayımda bulun: ya hepsi tek gözlü olsaydı? O zaman ${n} göz olurdu.`,
            en: `Make an assumption: what if all had 1 eye? Then there would be ${n} eyes.`,
            ru: `Сделай предположение: что если у всех 1 глаз? Тогда было бы ${n} глаз.`
          })
        },
        {
          text: L(lang, {
            tr: `Gerçekte ${E} göz var; fazladan ${E} − ${n} = ${E - n} göz. Bu fazlalık 3 gözlülerden geliyor.`,
            en: `There are really ${E} eyes; the extra is ${E} − ${n} = ${E - n}. That comes from the 3-eyed ones.`,
            ru: `На самом деле ${E} глаз; лишних ${E} − ${n} = ${E - n}. Они от трёхглазых.`
          })
        },
        {
          text: L(lang, {
            tr: `Her 3 gözlü, tek gözlüden 2 fazla göz taşır: ${E - n} ÷ 2 = ${c} canavar 3 gözlü. (+/− ile ${c}'ye getir, göz sayısı tutar!)`,
            en: `Each 3-eyed has 2 extra eyes: ${E - n} ÷ 2 = ${c} monsters are 3-eyed. (Set it to ${c} with +/− and the eyes match!)`,
            ru: `У каждого трёхглазого 2 лишних глаза: ${E - n} ÷ 2 = ${c}. (Поставь ${c} кнопками +/− — глаза совпадут!)`
          }),
          apply: (c2) => { const inc = c2.querySelector('#btn-inc-3'); if (inc) for (let i = 0; i < c; i++) inc.click(); }
        }
      ];
    },
    solution(lang) {
      return L(lang, {
        tr: `Çözüm: Hepsi tek gözlü olsaydı ${n} göz olurdu. Fark: ${E} - ${n} = ${E - n}. Her 3 gözlü +2 göz kattığından ${E - n} ÷ 2 = ${c} canavar 3 gözlüdür. Kontrol: ${c} × 3 + ${n - c} × 1 = ${E}. ✓`,
        en: `Solution: If all had 1 eye: ${n} eyes. Difference: ${E} - ${n} = ${E - n}. Each 3-eyed adds +2, so ${E - n} ÷ 2 = ${c} monsters have 3 eyes. Check: ${c} × 3 + ${n - c} × 1 = ${E}. ✓`,
        ru: `Решение: Если бы у всех 1 глаз: ${n}. Разница: ${E} - ${n} = ${E - n}. Каждый трёхглазый даёт +2, значит ${E - n} ÷ 2 = ${c}. Проверка: ${c} × 3 + ${n - c} × 1 = ${E}. ✓`
      });
    },
    mistakes: [
      {
        value: n - c,
        msg(lang) {
          return L(lang, {
            tr: `${n - c}, TEK gözlü canavar sayısı. Soru 3 GÖZLÜLERİ soruyor!`,
            en: `${n - c} is the number of ONE-eyed monsters. The question asks the THREE-eyed ones!`,
            ru: `${n - c} — это ОДНОглазые. Вопрос про ТРЁХглазых!`
          });
        }
      },
      {
        value: E - n,
        msg(lang) {
          return L(lang, {
            tr: `${E - n}, fazladan göz sayısı — güzel bir ara adım! Şimdi 2'ye bölmeyi unutma.`,
            en: `${E - n} is the number of extra eyes — a great middle step! Now divide by 2.`,
            ru: `${E - n} — лишние глаза, отличный промежуточный шаг! Теперь раздели на 2.`
          });
        }
      }
    ],
    render(container, lang) {
      const t = ui[lang];
      container.innerHTML = `
        <div class="vis-eyes">
          <p class="vis-instruction">${t["vis-eyes-instruction"].replace("{target}", String(E))}</p>
          <div class="eyes-layout">
            <div class="eyes-summary-box">
              <div class="sum-row">${t["vis-eyes-monsters"]} <span class="sum-val">${n}</span></div>
              <div class="sum-row">${t["vis-eyes-target"]} <span class="sum-val text-accent" style="font-weight:bold;">${E}</span></div>
              <div class="sum-row">${t["vis-eyes-current"]} <span class="sum-val" id="current-eyes-lbl">${n}</span></div>
            </div>
            <div class="eyes-controls">
              <div class="control-group">
                <label>${t["vis-eyes-label-3"]} (<span id="three-eyes-lbl" style="font-weight:bold; color:var(--color-gold);">0</span>):</label>
                <div class="counter-buttons">
                  <button class="btn-count" id="btn-dec-3">-</button>
                  <button class="btn-count" id="btn-inc-3">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="monsters-grid" id="monsters-grid"></div>
          <div class="eyes-explain" id="eyes-explain">${t["vis-eyes-explain-default"].replace("{target}", String(E))}</div>
        </div>
      `;
      const btnInc = container.querySelector('#btn-inc-3');
      const btnDec = container.querySelector('#btn-dec-3');
      const threeLbl = container.querySelector('#three-eyes-lbl');
      const currentLbl = container.querySelector('#current-eyes-lbl');
      const grid = container.querySelector('#monsters-grid');
      const explain = container.querySelector('#eyes-explain');
      let threeCount = 0;

      function updateMonsters() {
        threeLbl.textContent = threeCount;
        const oneCount = n - threeCount;
        const currentEyes = threeCount * 3 + oneCount;
        currentLbl.textContent = currentEyes;
        grid.innerHTML = '';
        for (let i = 0; i < n; i++) {
          const monster = document.createElement('div');
          monster.className = 'monster-item';
          if (i < threeCount) {
            monster.classList.add('monster-item--three');
            monster.innerHTML = `👾<span class="m-eyes-badge">👁👁👁</span>`;
          } else {
            monster.innerHTML = `👾<span class="m-eyes-badge">👁</span>`;
          }
          grid.appendChild(monster);
        }
        if (currentEyes === E) {
          currentLbl.className = 'sum-val text-emerald';
          currentLbl.style.fontWeight = 'bold';
          explain.innerHTML = t["vis-eyes-explain-balanced"]
            .replace("{target}", String(E))
            .replace("{three}", String(threeCount))
            .replace("{one}", String(oneCount));
        } else {
          currentLbl.className = 'sum-val';
          currentLbl.style.fontWeight = 'normal';
          explain.textContent = L(lang, {
            tr: `Toplam Göz: ${currentEyes} (Hedef: ${E}). Canavarları ayarlamaya devam et.`,
            en: `Total Eyes: ${currentEyes} (Target: ${E}). Keep adjusting monsters.`,
            ru: `Всего глаз: ${currentEyes} (Цель: ${E}). Продолжай настройку.`
          });
        }
      }
      btnInc.addEventListener('click', () => { playClick(); if (threeCount < n) { threeCount++; updateMonsters(); } });
      btnDec.addEventListener('click', () => { playClick(); if (threeCount > 0) { threeCount--; updateMonsters(); } });
      updateMonsters();
    }
  };
}

// ---------------------------------------------------------------------------
// KAPI 8 — Kraliçe'nin Zindanı (Mantık) — cevap TIKLANARAK seçilir
// ---------------------------------------------------------------------------
const CHEST_COLORS = ['red', 'blue', 'green'];
const COLOR_LABELS = {
  red:   { tr: "Kırmızı", en: "Red", ru: "Красный" },
  blue:  { tr: "Mavi", en: "Blue", ru: "Синий" },
  green: { tr: "Yeşil", en: "Green", ru: "Зелёный" }
};
const COLOR_ICONS = { red: "🟥", blue: "🟦", green: "🟩" };

export function colorLabel(lang, color) {
  return L(lang, COLOR_LABELS[color]);
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeLogicTask(taskNo, template) {
  const [X, Y, Z] = shuffled(CHEST_COLORS);
  let statements, answer, requiredTrue;

  if (template === 'oneTrue') {
    statements = [
      { owner: X, pred: key => key === X, kind: 'here' },
      { owner: Y, pred: key => key !== Y, kind: 'notHere' },
      { owner: Z, pred: key => key !== X, kind: 'notIn', ref: X }
    ];
    answer = Y;
    requiredTrue = 1;
  } else {
    statements = [
      { owner: X, pred: key => key === Z, kind: 'inOther', ref: Z },
      { owner: Y, pred: key => key === Y, kind: 'here' },
      { owner: Z, pred: key => key !== Y, kind: 'notIn', ref: Y }
    ];
    answer = Z;
    requiredTrue = 2;
  }

  function statementText(lang, st) {
    const refName = st.ref ? colorLabel(lang, st.ref) : '';
    switch (st.kind) {
      case 'here': return L(lang, { tr: "Anahtar bu sandıktadır.", en: "The key is in this chest.", ru: "Ключ в этом сундуке." });
      case 'notHere': return L(lang, { tr: "Anahtar bu sandıkta değildir.", en: "The key is not in this chest.", ru: "Ключа нет в этом сундуке." });
      case 'notIn': return L(lang, { tr: `Anahtar ${refName} sandıkta değildir.`, en: `The key is not in the ${refName} chest.`, ru: `Ключа нет в сундуке (${refName}).` });
      case 'inOther': return L(lang, { tr: `Anahtar ${refName} sandıktadır.`, en: `The key is in the ${refName} chest.`, ru: `Ключ в сундуке (${refName}).` });
    }
  }

  const ruleText = (lang) => template === 'oneTrue'
    ? L(lang, { tr: "sadece TEK BİR ifade doğru (diğer ikisi yalan)", en: "EXACTLY ONE statement is true (the other two are lies)", ru: "РОВНО ОДНО утверждение истинно (два других — ложь)" })
    : L(lang, { tr: "sadece TEK BİR ifade yalan (diğer ikisi doğru)", en: "EXACTLY ONE statement is a lie (the other two are true)", ru: "РОВНО ОДНО утверждение ложно (два других — истина)" });

  const clickChest = (color) => (c) => {
    const chest = c.querySelector(`.chest-card[data-chest="${color}"]`);
    if (chest) chest.click();
  };

  return {
    answerType: 'choice',
    choices: CHEST_COLORS,
    answer,
    question(lang) {
      const lines = statements.map(st => `${COLOR_ICONS[st.owner]} ${colorLabel(lang, st.owner)}: '${statementText(lang, st)}'`).join('\n');
      return L(lang, {
        tr: `${taskNo}. Görev: Sandıkların üzerindeki ifadeler:\n${lines}\nRecher, ${ruleText('tr')} olduğunu söylüyor. Anahtar hangi sandıktadır? (Aşağıdan sandığı seç!)`,
        en: `Task ${taskNo}: The chest statements are:\n${lines}\nRecher says ${ruleText('en')}. Which chest holds the key? (Pick the chest below!)`,
        ru: `Задание ${taskNo}: Надписи на сундуках:\n${lines}\nРешер говорит: ${ruleText('ru')}. В каком сундуке ключ? (Выбери сундук ниже!)`
      });
    },
    hints(lang) {
      const firstColor = colorLabel(lang, CHEST_COLORS[0]);
      const ansName = colorLabel(lang, answer);
      return [
        {
          text: L(lang, {
            tr: `Varsayım stratejisi: anahtarı sırayla her sandıkta varsay ve her durumda kaç ifadenin doğru olduğunu say.`,
            en: `Assumption strategy: suppose the key is in each chest in turn and count how many statements are true.`,
            ru: `Метод предположений: предположи, что ключ в каждом сундуке по очереди, и посчитай истинные утверждения.`
          })
        },
        {
          text: L(lang, {
            tr: `İlk olarak "${firstColor} sandıkta" diye varsay ve sandığa tıkla; tabloda doğru sayısına bak.`,
            en: `First assume "in the ${firstColor} chest" and click it; check the true count in the table.`,
            ru: `Сначала предположи "в сундуке (${firstColor})" и нажми на него; посмотри число истин.`
          }),
          apply: clickChest(CHEST_COLORS[0])
        },
        {
          text: L(lang, {
            tr: `Kurala (${ruleText('tr')}) uyan tek satır ${ansName} sandık varsayımıdır. Cevap: ${ansName}!`,
            en: `The only row matching the rule (${ruleText('en')}) is the ${ansName} chest. Answer: ${ansName}!`,
            ru: `Единственная строка по правилу (${ruleText('ru')}) — сундук (${ansName}). Ответ: ${ansName}!`
          }),
          apply: clickChest(answer)
        }
      ];
    },
    solution(lang) {
      const ansName = colorLabel(lang, answer);
      const states = statements.map(st => {
        const v = st.pred(answer);
        const tf = v
          ? L(lang, { tr: "DOĞRU", en: "TRUE", ru: "ИСТИНА" })
          : L(lang, { tr: "YALAN", en: "LIE", ru: "ЛОЖЬ" });
        return `${colorLabel(lang, st.owner)} → ${tf}`;
      }).join(', ');
      return L(lang, {
        tr: `Çözüm: Anahtar ${ansName} sandıkta olsun. İfadeler: ${states}. Bu durumda kural (${ruleText('tr')}) sağlanır. Diğer varsayımlarda kural bozulur. Anahtar ${ansName} sandıktadır!`,
        en: `Solution: Suppose the key is in the ${ansName} chest. Statements: ${states}. The rule (${ruleText('en')}) holds. Any other assumption breaks the rule. The key is in the ${ansName} chest!`,
        ru: `Решение: Пусть ключ в сундуке (${ansName}). Утверждения: ${states}. Правило (${ruleText('ru')}) выполняется. Другие варианты его нарушают. Ключ в сундуке (${ansName})!`
      });
    },
    mistakes: CHEST_COLORS.filter(c => c !== answer).map(color => ({
      value: color,
      msg(lang) {
        const trueCount = statements.filter(st => st.pred(color)).length;
        return L(lang, {
          tr: `"${colorLabel(lang, color)}" varsayımında doğru ifade sayısı ${trueCount} oluyor; ama kural "${template === 'oneTrue' ? 'tam 1 doğru' : 'tam 2 doğru (1 yalan)'}" idi. Tabloda bu satırı incele!`,
          en: `Assuming "${colorLabel(lang, color)}" gives ${trueCount} true statement(s); but the rule was "${template === 'oneTrue' ? 'exactly 1 true' : 'exactly 2 true (1 lie)'}". Check that row in the table!`,
          ru: `При предположении "${colorLabel(lang, color)}" истинных утверждений ${trueCount}; а правило — "${template === 'oneTrue' ? 'ровно 1 истина' : 'ровно 2 истины (1 ложь)'}". Проверь эту строку!`
        });
      }
    })),
    render(container, lang) {
      const t = ui[lang];
      const chestsHtml = statements.map(st => `
        <div class="chest-card" data-chest="${st.owner}">
          <div class="chest-icon">${COLOR_ICONS[st.owner]}</div>
          <div class="chest-title">${colorLabel(lang, st.owner)}</div>
          <div class="chest-statement font-handwritten">"${statementText(lang, st)}"</div>
        </div>`).join('');

      const trLoc = { red: "Kırmızı'da", blue: "Mavi'de", green: "Yeşil'de" };
      const rowsHtml = CHEST_COLORS.map(assume => `
        <tr data-assume="${assume}">
          <td>${L(lang, { tr: `Anahtar ${trLoc[assume]} olsa`, en: `If key in ${colorLabel(lang, assume)}`, ru: `Если ключ: ${colorLabel(lang, assume)}` })}</td>
          ${statements.map((st, i) => `<td class="cell-status" data-cell="${assume}-${i}">-</td>`).join('')}
          <td class="cell-count" data-count="${assume}">-</td>
        </tr>`).join('');

      container.innerHTML = `
        <div class="vis-logic">
          <p class="vis-instruction">${L(lang, {
            tr: `Anahtarın hangi sandıkta olduğunu VARSAYARAK sandıklara tıkla; tabloda doğru/yalan sayısını incele. Kural: ${ruleText('tr')}!`,
            en: `Click a chest to ASSUME the key is there; study the true/lie counts in the table. Rule: ${ruleText('en')}!`,
            ru: `Нажми на сундук, чтобы ПРЕДПОЛОЖИТЬ, что ключ там; изучи число истин/лжи в таблице. Правило: ${ruleText('ru')}!`
          })}</p>
          <div class="chests-row">${chestsHtml}</div>
          <div class="logic-table-wrapper">
            <table class="logic-table">
              <thead>
                <tr>
                  <th>${t["vis-logic-table-header-1"] || L(lang, { tr: "Varsayım", en: "Assumption", ru: "Предположение" })}</th>
                  ${statements.map(st => `<th>${COLOR_ICONS[st.owner]}</th>`).join('')}
                  <th>${L(lang, { tr: "Doğru Sayısı", en: "True Count", ru: "Истин" })}</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="logic-explain" id="logic-explain">${t["vis-logic-explain-default"] || L(lang, { tr: "Test etmek için bir sandığa tıkla!", en: "Click a chest to test!", ru: "Нажми на сундук!" })}</div>
        </div>
      `;

      const chests = container.querySelectorAll('.chest-card');
      chests.forEach(chest => {
        chest.addEventListener('click', () => {
          playClick();
          chests.forEach(cc => cc.classList.remove('chest-card--active'));
          container.querySelectorAll('tr[data-assume]').forEach(r => r.classList.remove('row-assume--active'));
          const assume = chest.getAttribute('data-chest');
          chest.classList.add('chest-card--active');
          const row = container.querySelector(`tr[data-assume="${assume}"]`);
          row.classList.add('row-assume--active');
          let trueCount = 0;
          statements.forEach((st, i) => {
            const cell = container.querySelector(`[data-cell="${assume}-${i}"]`);
            const v = st.pred(assume);
            if (v) trueCount++;
            cell.textContent = v
              ? L(lang, { tr: "DOĞRU ✓", en: "TRUE ✓", ru: "ИСТИНА ✓" })
              : L(lang, { tr: "YALAN ✗", en: "LIE ✗", ru: "ЛОЖЬ ✗" });
            cell.className = `cell-status ${v ? 'cell-status--true' : 'cell-status--false'}`;
          });
          const countCell = container.querySelector(`[data-count="${assume}"]`);
          countCell.textContent = String(trueCount);
          countCell.className = `cell-count ${trueCount === requiredTrue ? 'cell-count--valid' : 'cell-count--invalid'}`;
        });
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Kapı başına görev üretimi — iki görevin CEVAPLARI farklı olacak şekilde
// ---------------------------------------------------------------------------
function distinctPair(genA, genB) {
  const a = genA();
  let b = genB(a);
  let tries = 0;
  while (tries < 40 && String(b.answer) === String(a.answer)) {
    b = genB(a);
    tries++;
  }
  return [a, b];
}

export function generateTasks(gateId) {
  switch (gateId) {
    case 1: return distinctPair(() => makePipelineTask(1, 'mul'), () => makePipelineTask(2, 'div'));
    case 2: return distinctPair(() => makeDoublingPatternTask(1), () => makeRatioPatternTask(2));
    case 3: return distinctPair(() => makeFractionTask(1, null), (a) => makeFractionTask(2, a.combo));
    case 4: return distinctPair(() => makeScaleTask(1, false), () => makeScaleTask(2, true));
    case 5: return distinctPair(() => makePercentTask(1, null), (a) => makePercentTask(2, a.P));
    case 6: return distinctPair(() => makeArithmeticTask(1, false), () => makeArithmeticTask(2, true));
    case 7: return distinctPair(() => makeMonsterTask(1, null), (a) => makeMonsterTask(2, a.n));
    case 8: return distinctPair(() => makeLogicTask(1, 'oneTrue'), () => makeLogicTask(2, 'oneLie'));
    default: return [];
  }
}
