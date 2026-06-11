// Kalıcı oyun durumu: localStorage üzerinden kaydet/yükle ("kaldığın yerden devam")
const SAVE_KEY = 'krk_v3_save';

const defaultState = () => ({
  playerName: '',
  activeGate: 1,
  unlockedGates: [],
  pencilEnergy: 100,
  stars: {},        // { gateId: 1|2|3 }
  stardust: 1,      // Yıldız Tozu: ücretsiz çözüm adımı hakkı (yol arkadaşları ekledikçe artar)
  companions: [1],  // katılan yol arkadaşı id'leri (1: Aleks baştan ekipte)
  duelWon: false
});

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // depolama kapalıysa oyun kayıtsız devam eder
  }
}

export function resetState() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) { /* yoksay */ }
  return defaultState();
}
