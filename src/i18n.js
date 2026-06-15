// V3 çeviri katmanı: temel sözlükleri (translations.js) yeni anahtarlar ve
// içerik düzeltmeleriyle birleştirir. Eski dosyaya dokunmadan tüm v3 metinleri buradadır.
import { uiTranslations as baseUI, puzzleTranslations as basePz } from './translations.js';

const LANGS = ['tr', 'en', 'ru'];

// ---------------------------------------------------------------------------
// 1) Yeni / geçersiz kılınan arayüz metinleri
// ---------------------------------------------------------------------------
const v3UI = {
  tr: {
    "node-5-text": "Erzak Kamyonları",
    "btn-hint": "💡 İpucu Adımı Göster",
    "btn-hint-next": "💡 Sonraki İpucu Adımı",
    "hint-all-shown": "✓ Tüm ipucu adımları gösterildi",
    "input-placeholder": "Cevabın...",

    // İsim diyaloğu
    "name-title": "Kaşif Adını Yaz!",
    "name-sub": "\"Maceraya başlamadan önce tanışalım! Yol boyunca sana adınla sesleneceğim.\"",
    "name-placeholder": "Adın...",
    "name-start": "Haritaya Git 🗺️",
    "name-skip": "Adsız devam et",

    // Harita ekstraları
    "btn-journal": "📖 Macera Defteri",
    "team-lbl": "Ekibin:",
    "journal-title": "📖 Macera Defteri",
    "journal-sub": "Açtığın her kapı, hikayeden yeni bir sayfa kazandırır. Kitabın tamamı için 'Kraliçeyi Kurtarmak'ı oku!",
    "journal-locked": "Bu sayfa hâlâ kilitli. Kapıyı açınca hikaye burada belirecek!",
    "btn-close": "Kapat",
    "stardust-lbl": "Yıldız Tozu",
    "resume-note": "💾 Kaldığın yerden devam ediyorsun!",
    "confirm-restart": "Tüm ilerlemen ve yıldızların silinecek. Emin misin?",

    // Modal v3
    "kazanim-lbl": "🎯 Kazanım:",
    "btn-sketch": "✏️ Çizim Alanını Aç/Kapat",
    "sketch-hint": "Sihirli Kalem ile modelini çiz: kutular, şekiller, oklar... Çizim yapmak kaleme +2 enerji verir!",
    "sketch-clear": "🧽 Temizle",
    "sketch-pen": "✏️ Kalem",
    "sketch-eraser": "⬜ Silgi",
    "btn-stardust": "✨ Yıldız Tozu: İlk Adımı Göster",
    "stardust-empty": "Yıldız tozun kalmadı! Yeni yol arkadaşları katıldıkça kazanırsın.",
    "step-reveal-title": "✨ İlk Çözüm Adımı:",
    "tts-label": "Soruyu sesli dinle",
    "choice-lbl": "Cevabını seç:",

    // Destekleyici geri bildirim
    "wrong-encourage-1": "Olsun {name}! Hata yapmak öğrenmenin bir parçası. Görseldeki modeli bir daha incele! 💪",
    "wrong-encourage-2": "Çok yaklaştın {name}! Sana ipucunu ücretsiz açtım — bir kez daha dene! 🔍",
    "wrong-encourage-3": "Pes etmek yok {name}! İlk çözüm adımını birlikte açtık. Adım adım gidelim! ✨",
    "diagnostic-prefix": "🔎 Monoculus fark etti:",

    // Yıldızlar
    "gate-stars-earned": "Bu kapıdan {n} yıldız kazandın!",
    "success-stars": "Topladığın Yıldızlar:",
    "companion-join": "🎉 {name} ekibe katıldı! +1 Yıldız Tozu ✨",
    "comp-1": "Aleks", "comp-2": "Vanessa", "comp-3": "Sam", "comp-4": "Monoculus",

    // Düello
    "duel-title": "⚔️ Son Düello: Recher'e Karşı!",
    "duel-intro": "Kraliçenin hücresinin anahtarı Recher'in elinde! Onu zihinden işlem düellosunda yen: 5 sorudan en az 3'ünü doğru cevapla. Süreye dikkat!",
    "duel-btn-start": "Düelloyu Başlat ⚔️",
    "duel-q-lbl": "Soru {i} / {n}",
    "duel-score-lbl": "Doğru: {s}",
    "duel-win": "Recher'i yendin! Anahtar sende — hücre açılıyor! 👑",
    "duel-lose": "Recher bu sefer kaçtı! Üzülme — yeni sorularla tekrar dene, sen kazanacaksın!",
    "duel-btn-retry": "Tekrar Dene 🔄",
    "duel-btn-continue": "Kraliçe'nin Yanına Git 👑",

    // Çalışma kağıdı v3
    "ws-answer-key-toggle": "Cevap anahtarını ekle (öğretmen için)",
    "ws-answer-key-title": "🔑 CEVAP ANAHTARI (Öğretmen İçin)",
    "ws-a1-lbl": "Cevap 1:",
    "ws-a2-lbl": "Cevap 2:",
    "ws-kazanim-lbl": "Kazanım:",

    // V3 görselleştirici metinleri
    "vis-check": "Kontrol Et",
    "vis-diff-instruction": "Aradaki artışları SEN bul: kutucuklara sayıyı yaz, doğruysa yeşile döner!",
    "vis-ratio-instruction": "Kaç katına çıktığını SEN bul: kutucuklara çarpanı yaz!",
    "vis-percent-instruction": "Yüzlük tabloda kutucuklara tıklayarak hedef yüzdeyi boya:",
    "vis-percent-shaded": "Boyalı: %{p}",
    "vis-percent-target": "Hedef: %{p}",
    "vis-percent-done": "Harika! %{p}, 100 parçadan {p} tanesi demek. Şimdi hesapla: {n} × {p} ÷ 100. Cevabını aşağıya gir!",
    "vis-percent-plus10": "+10 Boya",
    "vis-percent-clear": "Temizle",
    "vis-frac-step1": "1. Adım: Vanessa kaç kutu aldı? Yaz:",
    "vis-frac-step2": "2. Adım: Sam kalanlardan kaç kutu aldı? Yaz:",
    "vis-frac-step3": "3. Adım: 1 kutu kaç zümrüt eder? Yaz:",
    "vis-frac-done": "Süper! Artık başlangıçtaki TOPLAM zümrüt sayısını hesaplayıp aşağıya girebilirsin: 12 kutu × kutu başına zümrüt.",
    "vis-pipe-step1": "Önce ortadaki sayıyı bul ve yaz:",
    "vis-pipe-step2": "Şimdi başlangıç sayısını bul ve yaz:",
    "vis-pipe-done": "Bravo! Boru hattını geriye doğru çözdün. Başlangıç sayısını aşağıdaki cevap kutusuna da yaz!"
  },
  en: {
    "node-5-text": "Supply Trucks",
    "btn-hint": "💡 Show a Hint Step",
    "btn-hint-next": "💡 Next Hint Step",
    "hint-all-shown": "✓ All hint steps shown",
    "input-placeholder": "Your answer...",
    "about-p1": "In this interactive game adapted from <strong>Vladimir Tumanov</strong>'s globally beloved novel <em>\"Save the Queen\"</em>, you will explore the magical world of mathematics!",

    "name-title": "Write Your Explorer Name!",
    "name-sub": "\"Let's meet before the adventure begins! I'll call you by your name along the way.\"",
    "name-placeholder": "Your name...",
    "name-start": "Go to the Map 🗺️",
    "name-skip": "Continue without a name",

    "btn-journal": "📖 Adventure Journal",
    "team-lbl": "Your Team:",
    "journal-title": "📖 Adventure Journal",
    "journal-sub": "Every gate you open earns a new page of the story. Read 'Jayden's Rescue' for the whole tale!",
    "journal-locked": "This page is still locked. Open the gate and the story will appear here!",
    "btn-close": "Close",
    "stardust-lbl": "Stardust",
    "resume-note": "💾 Continuing where you left off!",
    "confirm-restart": "All your progress and stars will be erased. Are you sure?",

    "kazanim-lbl": "🎯 Learning goal:",
    "btn-sketch": "✏️ Toggle Drawing Area",
    "sketch-hint": "Draw your model with the Magic Pencil: boxes, shapes, arrows... Drawing gives the pencil +2 energy!",
    "sketch-clear": "🧽 Clear",
    "sketch-pen": "✏️ Pen",
    "sketch-eraser": "⬜ Eraser",
    "btn-stardust": "✨ Stardust: Reveal First Step",
    "stardust-empty": "No stardust left! You earn more as new companions join.",
    "step-reveal-title": "✨ First Solution Step:",
    "tts-label": "Listen to the question",
    "choice-lbl": "Choose your answer:",

    "wrong-encourage-1": "It's okay, {name}! Mistakes are part of learning. Look at the model once more! 💪",
    "wrong-encourage-2": "So close, {name}! I opened the hint for you for free — try once more! 🔍",
    "wrong-encourage-3": "Never give up, {name}! We revealed the first solution step together. Step by step! ✨",
    "diagnostic-prefix": "🔎 Monoculus noticed:",

    "gate-stars-earned": "You earned {n} star(s) from this gate!",
    "success-stars": "Stars Collected:",
    "companion-join": "🎉 {name} joined the team! +1 Stardust ✨",
    "comp-1": "Alex", "comp-2": "Vanessa", "comp-3": "Sam", "comp-4": "Monoculus",

    "duel-title": "⚔️ Final Duel: Against Recher!",
    "duel-intro": "Recher holds the key to the Queen's cell! Beat him in a mental math duel: answer at least 3 of 5 questions correctly. Watch the timer!",
    "duel-btn-start": "Start the Duel ⚔️",
    "duel-q-lbl": "Question {i} / {n}",
    "duel-score-lbl": "Correct: {s}",
    "duel-win": "You beat Recher! The key is yours — the cell opens! 👑",
    "duel-lose": "Recher escaped this time! Don't worry — try again with new questions. You'll win!",
    "duel-btn-retry": "Try Again 🔄",
    "duel-btn-continue": "Go to the Queen 👑",

    "ws-answer-key-toggle": "Include answer key (for teachers)",
    "ws-answer-key-title": "🔑 ANSWER KEY (For Teachers)",
    "ws-a1-lbl": "Answer 1:",
    "ws-a2-lbl": "Answer 2:",
    "ws-kazanim-lbl": "Learning goal:",

    "vis-check": "Check",
    "vis-diff-instruction": "YOU find the increases: type the number in each box — it turns green when correct!",
    "vis-ratio-instruction": "YOU find the multiplier: type it in each box!",
    "vis-percent-instruction": "Click cells in the hundred grid to shade the target percent:",
    "vis-percent-shaded": "Shaded: {p}%",
    "vis-percent-target": "Target: {p}%",
    "vis-percent-done": "Great! {p}% means {p} out of 100 parts. Now calculate: {n} × {p} ÷ 100. Enter your answer below!",
    "vis-percent-plus10": "+10 Shade",
    "vis-percent-clear": "Clear",
    "vis-frac-step1": "Step 1: How many boxes did Vanessa take? Type:",
    "vis-frac-step2": "Step 2: How many of the remaining boxes did Sam take? Type:",
    "vis-frac-step3": "Step 3: How many emeralds is 1 box worth? Type:",
    "vis-frac-done": "Super! Now compute the TOTAL emeralds at the start: 12 boxes × emeralds per box. Enter it below.",
    "vis-pipe-step1": "First find the middle number and type it:",
    "vis-pipe-step2": "Now find the starting number and type it:",
    "vis-pipe-done": "Bravo! You solved the pipeline backwards. Also type the starting number into the answer box below!"
  },
  ru: {
    "node-5-text": "Грузовики с припасами",
    "btn-hint": "💡 Показать шаг подсказки",
    "btn-hint-next": "💡 Следующий шаг",
    "hint-all-shown": "✓ Все шаги показаны",
    "input-placeholder": "Твой ответ...",
    "about-p1": "В этой интерактивной игре, созданной по мотивам любимого во всем мире романа <strong>Владимира Туманова</strong> <em>«Королеву в заложники!»</em>, ты откроешь для себя волшебный мир математики!",

    "name-title": "Напиши имя исследователя!",
    "name-sub": "\"Давай познакомимся перед приключением! Я буду называть тебя по имени.\"",
    "name-placeholder": "Твоё имя...",
    "name-start": "К карте 🗺️",
    "name-skip": "Продолжить без имени",

    "btn-journal": "📖 Дневник приключений",
    "team-lbl": "Твоя команда:",
    "journal-title": "📖 Дневник приключений",
    "journal-sub": "Каждые открытые ворота дарят новую страницу истории. Прочитай книгу, чтобы узнать всё!",
    "journal-locked": "Эта страница ещё закрыта. Открой ворота — и история появится здесь!",
    "btn-close": "Закрыть",
    "stardust-lbl": "Звёздная пыль",
    "resume-note": "💾 Продолжаем с того места, где ты остановился!",
    "confirm-restart": "Весь прогресс и звёзды будут удалены. Ты уверен?",

    "kazanim-lbl": "🎯 Цель обучения:",
    "btn-sketch": "✏️ Открыть/закрыть область рисования",
    "sketch-hint": "Нарисуй свою модель Волшебным Карандашом: коробки, фигуры, стрелки... Рисование даёт карандашу +2 энергии!",
    "sketch-clear": "🧽 Очистить",
    "sketch-pen": "✏️ Карандаш",
    "sketch-eraser": "⬜ Ластик",
    "btn-stardust": "✨ Звёздная пыль: показать первый шаг",
    "stardust-empty": "Звёздная пыль закончилась! Получай больше с новыми спутниками.",
    "step-reveal-title": "✨ Первый шаг решения:",
    "tts-label": "Прослушать вопрос",
    "choice-lbl": "Выбери ответ:",

    "wrong-encourage-1": "Ничего, {name}! Ошибки — часть обучения. Посмотри на модель ещё раз! 💪",
    "wrong-encourage-2": "Почти получилось, {name}! Я открыл подсказку бесплатно — попробуй ещё раз! 🔍",
    "wrong-encourage-3": "Не сдавайся, {name}! Мы вместе открыли первый шаг решения. Шаг за шагом! ✨",
    "diagnostic-prefix": "🔎 Монокулус заметил:",

    "gate-stars-earned": "Ты получил {n} звёзд за эти ворота!",
    "success-stars": "Собранные звёзды:",
    "companion-join": "🎉 {name} присоединился к команде! +1 Звёздная пыль ✨",
    "comp-1": "Алекс", "comp-2": "Ванесса", "comp-3": "Сэм", "comp-4": "Монокулус",

    "duel-title": "⚔️ Финальная дуэль: против Решера!",
    "duel-intro": "Ключ от камеры Королевы у Решера! Победи его в дуэли устного счёта: ответь правильно минимум на 3 из 5 вопросов. Следи за временем!",
    "duel-btn-start": "Начать дуэль ⚔️",
    "duel-q-lbl": "Вопрос {i} / {n}",
    "duel-score-lbl": "Верно: {s}",
    "duel-win": "Ты победил Решера! Ключ твой — камера открывается! 👑",
    "duel-lose": "Решер сбежал на этот раз! Не расстраивайся — попробуй снова с новыми вопросами!",
    "duel-btn-retry": "Попробовать снова 🔄",
    "duel-btn-continue": "К Королеве 👑",

    "ws-answer-key-toggle": "Добавить ключ с ответами (для учителя)",
    "ws-answer-key-title": "🔑 КЛЮЧ С ОТВЕТАМИ (Для учителя)",
    "ws-a1-lbl": "Ответ 1:",
    "ws-a2-lbl": "Ответ 2:",
    "ws-kazanim-lbl": "Цель обучения:",

    "vis-check": "Проверить",
    "vis-diff-instruction": "САМ найди прибавления: впиши число в каждое окошко — верное станет зелёным!",
    "vis-ratio-instruction": "САМ найди множитель: впиши его в окошки!",
    "vis-percent-instruction": "Нажимай на клетки сотенной таблицы, чтобы закрасить нужный процент:",
    "vis-percent-shaded": "Закрашено: {p}%",
    "vis-percent-target": "Цель: {p}%",
    "vis-percent-done": "Отлично! {p}% — это {p} из 100 частей. Теперь вычисли: {n} × {p} ÷ 100. Введи ответ ниже!",
    "vis-percent-plus10": "+10 закрасить",
    "vis-percent-clear": "Очистить",
    "vis-frac-step1": "Шаг 1: Сколько коробок взяла Ванесса? Впиши:",
    "vis-frac-step2": "Шаг 2: Сколько из оставшихся взял Сэм? Впиши:",
    "vis-frac-step3": "Шаг 3: Сколько изумрудов стоит 1 коробка? Впиши:",
    "vis-frac-done": "Супер! Теперь вычисли ОБЩЕЕ число изумрудов: 12 коробок × изумруды в коробке. Введи ниже.",
    "vis-pipe-step1": "Сначала найди среднее число и впиши его:",
    "vis-pipe-step2": "Теперь найди начальное число и впиши его:",
    "vis-pipe-done": "Браво! Ты решил конвейер в обратную сторону. Впиши начальное число и в поле ответа ниже!"
  }
};

export const ui = {};
for (const l of LANGS) ui[l] = { ...baseUI[l], ...v3UI[l] };

// ---------------------------------------------------------------------------
// 2) Kapı meta metinleri: 5. Kapı tamamen yenilendi (Yüzdeler),
//    8. Kapı çalışma kağıdı düzeltildi (eski sorular iki çözümlüydü).
// ---------------------------------------------------------------------------
const gate5Override = {
  tr: {
    chapter: "Kanyon Geçidi",
    title: "5. Kapı: Erzak Kamyonları (Yüzdeler)",
    character: "Sam",
    narrative: "Kanyon yolunu Recher'in erzak kamyonları kapatmıştır. Nöbetçi dev seslenir: 'Bu kamyonlardaki sandıkların hesabını ancak yüzdeleri bilen yapar! Kamyonlardaki yüklerin yüzdesini doğru hesaplarsanız geçit sizindir!' Sam gülümser: 'Yüzde demek, 100 eş parçadan kaçı demek. Yüzlük tabloyu çizelim!'",
    worksheet: {
      title: "Erzak Kamyonları (Yüzdeler)",
      topic: "Yüzdeler: Bir Çokluğun Yüzdesini Bulma",
      outcome: "Bir çokluğun belirtilen yüzdesine karşılık gelen miktarı yüzlük tablo modeliyle hesaplar.",
      q1: "Bir kamyonda 80 sandık vardır. Sandıkların %25'i zümrüt doludur. Kaç sandık zümrüt doludur? (Yüzlük tablo modeli çizerek gösteriniz.)",
      q2: "Recher'in deposundaki 200 erzak paketinin %40'ı ekmektir. Depoda kaç paket ekmek vardır? (Çözüm adımlarını yazınız.)"
    },
    speech: [
      "Yüzlük tabloda gördük: yüzde demek 100 parçadan kaçı demek! İlk kamyonun yükünü doğru saydık. Sıradaki kamyon bizi bekliyor!",
      "Ne?! Yük hesabımı çocuklar mı yaptı?! Olamaz... Ama bahçemdeki gümüş kulelerin örüntüsünü asla çözemeyeceksiniz!"
    ]
  },
  en: {
    chapter: "Canyon Passage",
    title: "Gate 5: Supply Trucks (Percentages)",
    character: "Sam",
    narrative: "Recher's supply trucks block the canyon road. The guard giant bellows: 'Only those who know percentages can count the crates in these trucks! Calculate the loads correctly and the passage is yours!' Sam smiles: 'A percent means how many out of 100 equal parts. Let's draw the hundred grid!'",
    worksheet: {
      title: "Supply Trucks (Percentages)",
      topic: "Percentages: Finding a Percent of a Quantity",
      outcome: "Calculates the amount corresponding to a given percent of a quantity using the hundred-grid model.",
      q1: "A truck carries 80 crates. 25% of the crates are full of emeralds. How many crates are full of emeralds? (Show with a hundred-grid model.)",
      q2: "40% of the 200 supply packages in Recher's depot are bread. How many bread packages are in the depot? (Write the solution steps.)"
    },
    speech: [
      "We saw it on the hundred grid: a percent means parts out of 100! We counted the first truck's load correctly. The next truck awaits!",
      "What?! Children calculated my cargo?! Impossible... But you will never solve the pattern of the silver towers in my garden!"
    ]
  },
  ru: {
    chapter: "Каньонный проход",
    title: "Ворота 5: Грузовики с припасами (Проценты)",
    character: "Сэм",
    narrative: "Дорогу через каньон перекрыли грузовики Решера. Великан-страж кричит: 'Только знающий проценты сосчитает ящики в этих грузовиках! Посчитайте груз правильно — и проход ваш!' Сэм улыбается: 'Процент — это сколько из 100 равных частей. Нарисуем сотенную таблицу!'",
    worksheet: {
      title: "Грузовики с припасами (Проценты)",
      topic: "Проценты: нахождение процента от величины",
      outcome: "Вычисляет количество, соответствующее указанному проценту величины, с помощью сотенной таблицы.",
      q1: "В грузовике 80 ящиков. 25% ящиков заполнены изумрудами. Сколько ящиков с изумрудами? (Покажи с помощью сотенной таблицы.)",
      q2: "40% из 200 пакетов с припасами на складе Решера — хлеб. Сколько пакетов хлеба на складе? (Запиши шаги решения.)"
    },
    speech: [
      "Мы увидели на сотенной таблице: процент — это части из 100! Мы верно посчитали груз первого грузовика. Следующий ждёт!",
      "Что?! Дети посчитали мой груз?! Невозможно... Но узор серебряных башен в моём саду вам не разгадать!"
    ]
  }
};

const gate8WorksheetFix = {
  tr: {
    q1: "Mert, Can ve Ali farklı renkte (Kırmızı, Mavi, Yeşil) kazaklar giymiştir:\n- Mert: 'Kırmızı kazağı ben giydim.'\n- Can: 'Ben mavi giymedim.'\n- Ali: 'Ben kırmızı giymedim.'\nEğer sadece BİR kişi doğru söylüyorsa kim hangi rengi giymiştir? (Mantık tablosu oluşturup çelişkileri yazınız.)",
    q2: "A, B ve C kutularının yalnızca birinde altın anahtar vardır. Kutuların üzerinde şunlar yazar:\n- A Kutusu: 'Altın anahtar C kutusundadır.'\n- B Kutusu: 'Altın anahtar bu kutudadır.'\n- C Kutusu: 'Altın anahtar B kutusunda değildir.'\nEğer ifadelerden sadece BİRİ yalansa altın anahtar hangi kutudadır?"
  },
  en: {
    q1: "Mert, Can and Ali wear sweaters of different colors (Red, Blue, Green):\n- Mert: 'I wore the red sweater.'\n- Can: 'I did not wear blue.'\n- Ali: 'I did not wear red.'\nIf only ONE of them tells the truth, who wears which color? (Build a logic table and note the contradictions.)",
    q2: "Only one of boxes A, B and C holds the golden key. The boxes read:\n- Box A: 'The golden key is in box C.'\n- Box B: 'The golden key is in this box.'\n- Box C: 'The golden key is not in box B.'\nIf exactly ONE statement is a lie, which box holds the golden key?"
  },
  ru: {
    q1: "Мерт, Джан и Али носят свитера разных цветов (красный, синий, зелёный):\n- Мерт: 'Красный свитер надел я.'\n- Джан: 'Я не надевал синий.'\n- Али: 'Я не надевал красный.'\nЕсли только ОДИН говорит правду, кто в каком цвете? (Построй логическую таблицу.)",
    q2: "Золотой ключ лежит только в одной из коробок A, B и C. На коробках написано:\n- Коробка A: 'Золотой ключ в коробке C.'\n- Коробка B: 'Золотой ключ в этой коробке.'\n- Коробка C: 'Золотого ключа нет в коробке B.'\nЕсли ровно ОДНО утверждение ложно, где золотой ключ?"
  }
};

// Çalışma kağıdı cevap anahtarı (öğretmen çıktısı için)
const wsAnswers = {
  tr: {
    1: ["12  (60 - 12 = 48, 48 ÷ 4 = 12)", "30  (8 + 7 = 15, 15 × 2 = 30)"],
    2: ["95  (artışlar: +6, +12, +24, +48)", "256  (her sayı bir öncekinin 4 katı)"],
    3: ["22  (30'un 2/5'i = 12, 1/3'ü = 10, 12 + 10 = 22)", "60 TL  (kalan 30 TL bütünün yarısıdır)"],
    4: ["Elif 48 kg  (3 kat = 72, 1 kat = 24)", "Baba 34  (44 - 4 = 40, 40 ÷ 4 = 10, 3×10+4 = 34)"],
    5: ["20 sandık  (80 × 25 ÷ 100)", "80 paket  (200 × 40 ÷ 100)"],
    6: ["38  (8, 14, 20, 26, 32, 38)", "47 cm  (5 + 6×7 = 47)"],
    7: ["7 tavşan  ((44 - 30) ÷ 2 = 7)", "14 doğru  (5d - 2(20-d) = 58 → d = 14)"],
    8: ["Ali kırmızı, Can yeşil, Mert mavi (sadece Can doğru söyler)", "C kutusunda (yalnızca B'nin ifadesi yalan olur)"]
  },
  en: {
    1: ["12  (60 - 12 = 48, 48 ÷ 4 = 12)", "30  (8 + 7 = 15, 15 × 2 = 30)"],
    2: ["95  (increases: +6, +12, +24, +48)", "256  (each number is 4 times the previous)"],
    3: ["22  (2/5 of 30 = 12, 1/3 of 30 = 10, 12 + 10 = 22)", "60 TL  (the remaining 30 TL is half of the whole)"],
    4: ["Elif 48 kg  (3 units = 72, 1 unit = 24)", "Father 34  (44 - 4 = 40, 40 ÷ 4 = 10, 3×10+4 = 34)"],
    5: ["20 crates  (80 × 25 ÷ 100)", "80 packages  (200 × 40 ÷ 100)"],
    6: ["38  (8, 14, 20, 26, 32, 38)", "47 cm  (5 + 6×7 = 47)"],
    7: ["7 rabbits  ((44 - 30) ÷ 2 = 7)", "14 correct  (5c - 2(20-c) = 58 → c = 14)"],
    8: ["Ali red, Can green, Mert blue (only Can tells the truth)", "Box C (only box B's statement is a lie)"]
  },
  ru: {
    1: ["12  (60 - 12 = 48, 48 ÷ 4 = 12)", "30  (8 + 7 = 15, 15 × 2 = 30)"],
    2: ["95  (прибавления: +6, +12, +24, +48)", "256  (каждое число в 4 раза больше предыдущего)"],
    3: ["22  (2/5 от 30 = 12, 1/3 от 30 = 10, 12 + 10 = 22)", "60 лир  (оставшиеся 30 лир — половина целого)"],
    4: ["Элиф 48 кг  (3 части = 72, 1 часть = 24)", "Отец 34  (44 - 4 = 40, 40 ÷ 4 = 10, 3×10+4 = 34)"],
    5: ["20 ящиков  (80 × 25 ÷ 100)", "80 пакетов  (200 × 40 ÷ 100)"],
    6: ["38  (8, 14, 20, 26, 32, 38)", "47 см  (5 + 6×7 = 47)"],
    7: ["7 кроликов  ((44 - 30) ÷ 2 = 7)", "14 верных  (5п - 2(20-п) = 58 → п = 14)"],
    8: ["Али красный, Джан зелёный, Мерт синий (правду говорит только Джан)", "Коробка C (ложно только утверждение B)"]
  }
};

// MEB 5. sınıf kazanım eşlemesi (kapı başına)
const kazanimlar = {
  tr: {
    1: "M.5.1.2 — Doğal sayılarla işlemler: ters işlem (geriye doğru çalışma) stratejisi",
    2: "M.5.1.1 — Sayı örüntüleri: değişen artış kuralını keşfetme",
    3: "M.5.1.3 — Kesirler: bütün-parça ilişkisi ve şekil çizme stratejisi",
    4: "M.5.1.2 — Problem çözme: kat ilişkilerini denge (terazi) modeliyle çözme",
    5: "M.5.1.6 — Yüzdeler: bir çokluğun belirtilen yüzdesini bulma",
    6: "M.5.1.1 — Örüntüler: aritmetik örüntüde istenen terimi bulma",
    7: "M.5.1.2 — Problem çözme: varsayım (hepsi ... olsaydı) stratejisi",
    8: "Müfredat+ — Mantıksal akıl yürütme ve çelişki bulma"
  },
  en: {
    1: "Grade 5 — Operations with natural numbers: working backwards strategy",
    2: "Grade 5 — Number patterns: discovering a changing-increase rule",
    3: "Grade 5 — Fractions: part-whole relationship and drawing models",
    4: "Grade 5 — Problem solving: multiplicative relations with a balance model",
    5: "Grade 5 — Percentages: finding a percent of a quantity",
    6: "Grade 5 — Patterns: finding a requested term in an arithmetic pattern",
    7: "Grade 5 — Problem solving: the assumption ('what if all were...') strategy",
    8: "Enrichment — Logical reasoning and finding contradictions"
  },
  ru: {
    1: "5 класс — Действия с натуральными числами: стратегия обратного хода",
    2: "5 класс — Числовые закономерности: правило растущего прибавления",
    3: "5 класс — Дроби: отношение часть-целое и рисование моделей",
    4: "5 класс — Решение задач: кратные отношения с моделью весов",
    5: "5 класс — Проценты: нахождение процента от величины",
    6: "5 класс — Закономерности: нахождение нужного члена",
    7: "5 класс — Решение задач: стратегия предположения",
    8: "Дополнительно — Логическое рассуждение и поиск противоречий"
  }
};

export function gateText(lang, id) {
  const base = (basePz[lang] && basePz[lang][id]) ? basePz[lang][id] : basePz['tr'][id];
  if (id === 5) {
    const o = gate5Override[lang] || gate5Override.tr;
    return {
      chapter: o.chapter, title: o.title, character: o.character, narrative: o.narrative,
      worksheet: o.worksheet, speech: o.speech,
      answers: wsAnswers[lang][5], kazanim: kazanimlar[lang][5]
    };
  }
  const ws = { ...base.worksheet };
  if (id === 8) {
    const fix = gate8WorksheetFix[lang] || gate8WorksheetFix.tr;
    ws.q1 = fix.q1;
    ws.q2 = fix.q2;
  }
  return {
    chapter: base.chapter, title: base.title, character: base.character, narrative: base.narrative,
    worksheet: ws,
    speech: [base.tasks[0].speechCorrect, base.tasks[1].speechCorrect],
    answers: wsAnswers[lang][id], kazanim: kazanimlar[lang][id]
  };
}

// ---------------------------------------------------------------------------
// 3) Harita ipucu balonları (5. Kapı güncellendi)
// ---------------------------------------------------------------------------
export const tooltipData = {
  tr: {
    1: { title: "1. Kapı: Sihirli Kalem", desc: "Kral Recher'in ilk kapısı. Ters işlem boru hattını çözüp sihirli kalemin gücünü zihnimizle kurmalıyız." },
    2: { title: "2. Kapı: Lav Köprüsü", desc: "Altından kızgın lavların aktığı nehir. Köprünün taş kuralını çözerek karşıya güvenle geç." },
    3: { title: "3. Kapı: Zümrüt Kulesi", desc: "Kulenin tepesindeki kesir alevleri yolu kapadı. Zümrütleri kesir modellerine ayırarak bilmeceyi çöz." },
    4: { title: "4. Kapı: Muhafız Geçidi", desc: "Recher'in iki dev nöbetçisi kapıda bekliyor. Yaş katı terazi dengesini kurarak muhafızları aş." },
    5: { title: "5. Kapı: Erzak Kamyonları", desc: "Recher'in kamyonları yolu kapattı. Yüzlük tabloyla yüklerin yüzdesini hesapla ve geçidi aç." },
    6: { title: "6. Kapı: Gümüş Kuleler", desc: "Bahçedeki parıldayan gümüş kulelerin yükseklik örüntüsü kuralını bulup kilidi aç." },
    7: { title: "7. Kapı: Monoculus Soyu", desc: "Karanlık mağaradaki tek gözlü ve 3 gözlü canavarların toplam göz sayılarını varsayım yaparak dengele." },
    8: { title: "8. Kapı: Kraliçe'nin Zindanı", desc: "Kraliçe Jayden burada kilitli! Mantık sandıklarını analiz ederek doğru sandığı ve anahtarı belirle." }
  },
  en: {
    1: { title: "Gate 1: Magic Pencil", desc: "King Recher's first gate. Solve the reverse operation pipeline to restore the magic pencil's power in your mind." },
    2: { title: "Gate 2: Lava Bridge", desc: "A river flowing with hot lava. Unravel the stone pattern's rule to safely cross the bridge." },
    3: { title: "Gate 3: Emerald Tower", desc: "Fraction flames block the path at the top of the tower. Divide the emeralds into fractional models to solve it." },
    4: { title: "Gate 4: Guard Passage", desc: "Recher's two giant guards await at the gate. Balance the age-factor scale to bypass them." },
    5: { title: "Gate 5: Supply Trucks", desc: "Recher's trucks block the road. Use the hundred grid to compute the cargo percentages and open the passage." },
    6: { title: "Gate 6: Silver Towers", desc: "Find the height pattern rule of the glowing silver towers in the garden to open the lock." },
    7: { title: "Gate 7: Monoculus Clan", desc: "Balance the total eye counts of the 1-eyed and 3-eyed monsters in the dark cave by making assumptions." },
    8: { title: "Gate 8: Queen's Dungeon", desc: "Queen Jayden is locked here! Analyze the logic chests to determine the correct chest and key." }
  },
  ru: {
    1: { title: "Ворота 1: Волшебный Карандаш", desc: "Первые ворота Короля Решера. Решите обратные операции, чтобы мысленно восстановить силу карандаша." },
    2: { title: "Ворота 2: Лавовый Мост", desc: "Река с горячей лавой. Разгадайте правило узора камней моста, чтобы безопасно переправиться." },
    3: { title: "Ворота 3: Изумрудная Башня", desc: "Пламя дробей на вершине башни преградило путь. Разделите изумруды на долевые модели." },
    4: { title: "Ворота 4: Пост Охраны", desc: "Два гигантских стражника ждут у ворот. Сбалансируйте весы возраста, чтобы пройти." },
    5: { title: "Ворота 5: Грузовики с припасами", desc: "Грузовики Решера перекрыли дорогу. Посчитай проценты груза по сотенной таблице и открой проход." },
    6: { title: "Ворота 6: Серебряные Башни", desc: "Найдите закономерность высоты серебряных башен в саду, чтобы открыть замок." },
    7: { title: "Ворота 7: Глаза Монстров", desc: "Сбалансируйте общее число глаз одноглазых и трёхглазых монстров методом подбора." },
    8: { title: "Ворота 8: Темница Королевы", desc: "Королева Джейден заперта здесь! Проанализируйте сундуки, чтобы найти ключ." }
  }
};

// ---------------------------------------------------------------------------
// 4) Macera Defteri: kapı başına hikaye sayfası (kitaba köprü kuran kısa pasajlar)
// ---------------------------------------------------------------------------
export const journalPages = {
  tr: {
    1: "Aleks, sihirli kalemin son kıvılcımı sönerken ilk kapının önünde durdu. Recher'in sesi yankılandı: 'Kaleminiz bitti, zihniniz yetmez!' Ama Aleks gülümsedi — çünkü asıl sihir, geriye doğru düşünmeyi bilen bir akıldı.",
    2: "Lav nehri köpürerek akıyordu. Vanessa köprü taşlarına dokundu; taşların üstündeki sayılar bir şarkı gibi büyüyordu. 'Kuralı bulursak taşlar bizi taşır!' diye fısıldadı. Ve taşlar, doğru sayıyla parladı.",
    3: "Zümrüt Kulesi'nin yeşil alevleri matematik bilmeyeni yakardı. Sam defterine 12 kutu çizdi: 'Bütünü parçalara bölersek alevler söner.' Kutular doldukça alevler tek tek sönüyordu.",
    4: "İki dev muhafız yolu kapatmıştı. 'Yaşlarımızı bil!' diye kükrediler. Aleks bir terazi hayal etti: bir kefede genç, diğerinde yaşlı... Denge kurulunca devler şaşkınlıkla kenara çekildi.",
    5: "Kanyonda Recher'in erzak kamyonları dizilmişti. Sam yere yüz kareli dev bir tablo çizdi. 'Yüzde dediğin, yüz parçadan kaçı!' Nöbetçi dev, doğru hesabı duyunca bariyeri kaldırmak zorunda kaldı.",
    6: "Kraliyet bahçesindeki gümüş kuleler ay ışığında parlıyordu. Her kule bir öncekinden biraz daha yüksekti — ama ne kadar? Vanessa farkları sayınca kulelerin şarkısı çözüldü ve gizli geçit açıldı.",
    7: "Karanlık mağarada yüzlerce göz parladı. Monoculus fısıldadı: 'Korkma — sayarsan dost olurlar.' Doğru varsayım yapılınca tek gözlü ve üç gözlü canavarlar hep birlikte yolu aydınlattı.",
    8: "Ve son kapı... Üç sandık, üç ifade, tek bir doğru. Kraliçe Jayden içeriden seslendi: 'Mantığınıza güvenin çocuklar!' Çelişkiler tek tek elendi ve anahtar, doğru sandıkta ışıldadı."
  },
  en: {
    1: "Alex stood before the first gate as the magic pencil's last spark faded. Recher's voice echoed: 'Your pencil is gone, your mind won't suffice!' But Alex smiled — the real magic was a mind that could think backwards.",
    2: "The lava river foamed and roared. Vanessa touched the bridge stones; the numbers on them grew like a song. 'If we find the rule, the stones will carry us!' she whispered. And the stones glowed with the right number.",
    3: "The green flames of the Emerald Tower burned those who knew no math. Sam drew 12 boxes in his notebook: 'Split the whole into parts and the flames go out.' As the boxes filled, the flames died one by one.",
    4: "Two giant guards blocked the way. 'Know our ages!' they roared. Alex imagined a balance scale: the young one on one pan, the old one on the other... When it balanced, the giants stepped aside in awe.",
    5: "Recher's supply trucks lined the canyon. Sam drew a giant hundred-grid on the ground. 'A percent is parts out of a hundred!' Hearing the correct count, the guard giant had to lift the barrier.",
    6: "The silver towers in the royal garden gleamed in the moonlight. Each tower stood a little taller than the last — but by how much? When Vanessa counted the differences, the towers' song was solved and a secret passage opened.",
    7: "Hundreds of eyes glowed in the dark cave. Monoculus whispered: 'Don't be afraid — count them and they become friends.' With the right assumption, the one-eyed and three-eyed monsters lit the way together.",
    8: "And the final gate... Three chests, three statements, a single truth. Queen Jayden called from within: 'Trust your logic, children!' The contradictions fell one by one, and the key gleamed in the right chest."
  },
  ru: {
    1: "Алекс стоял перед первыми воротами, когда погасла последняя искра волшебного карандаша. Голос Решера гремел: 'Карандаш кончился, ума не хватит!' Но Алекс улыбнулся — настоящая магия была в уме, умеющем думать наоборот.",
    2: "Лавовая река пенилась и ревела. Ванесса коснулась камней моста; числа на них росли, как песня. 'Найдём правило — камни нас перенесут!' — прошептала она. И камни засияли верным числом.",
    3: "Зелёное пламя Изумрудной Башни обжигало незнающих математику. Сэм нарисовал в блокноте 12 коробок: 'Разделим целое на части — пламя погаснет.' Коробки заполнялись, и огни гасли один за другим.",
    4: "Два великана-стража преградили путь. 'Узнайте наши возрасты!' — взревели они. Алекс представил весы: на одной чаше юный, на другой старший... Когда настал баланс, великаны отступили в изумлении.",
    5: "В каньоне выстроились грузовики Решера. Сэм начертил на земле огромную сотенную таблицу. 'Процент — это части из ста!' Услышав верный счёт, великан-страж был вынужден поднять шлагбаум.",
    6: "Серебряные башни королевского сада блестели в лунном свете. Каждая башня была чуть выше предыдущей — но насколько? Когда Ванесса сосчитала разности, песня башен была разгадана, и открылся тайный проход.",
    7: "Сотни глаз светились в тёмной пещере. Монокулус прошептал: 'Не бойся — сосчитай их, и они станут друзьями.' С верным предположением одноглазые и трёхглазые монстры вместе осветили путь.",
    8: "И последние ворота... Три сундука, три надписи, одна правда. Королева Джейден позвала изнутри: 'Доверьтесь логике, дети!' Противоречия отпали одно за другим, и ключ засиял в правильном сундуке."
  }
};

// ---------------------------------------------------------------------------
// 5) Yol arkadaşları: hangi kapıdan sonra katılırlar
// ---------------------------------------------------------------------------
export const companions = [
  { id: 1, emoji: "👦", joinAfterGate: 0 }, // Aleks: baştan ekipte
  { id: 2, emoji: "👧", joinAfterGate: 2 }, // Vanessa: Lav Köprüsü'nden sonra
  { id: 3, emoji: "🧒", joinAfterGate: 3 }, // Sam: Zümrüt Kulesi'nden sonra
  { id: 4, emoji: "👁️", joinAfterGate: 7 }  // Monoculus: mağaradan sonra
];

export function compName(lang, id) {
  return ui[lang][`comp-${id}`] || ui.tr[`comp-${id}`];
}
