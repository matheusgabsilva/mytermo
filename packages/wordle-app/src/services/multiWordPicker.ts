import { selectRandomWord } from 'wordle-engine';

/**
 * Retorna uma seed diária (YYYYMMDD) baseada na data atual no fuso de Brasília (UTC-3).
 */
export function getDailyKey(): string {
  const now = new Date();
  // Ajuste para horário de Brasília (UTC-3)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasiliaTime = new Date(utc - 3 * 3600000);
  const yyyy = brasiliaTime.getFullYear();
  const mm = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const dd = String(brasiliaTime.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Função determinística pseudo-aleatória (PRNG mulberry32) a partir de uma seed numérica.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash >>> 0;
}

/**
 * Sorteia N palavras diárias determinísticas para a data e modo atual.
 */
export function pickDailyWords(
  all: readonly string[],
  count: number,
  mode: string,
): string[] {
  const dailyKey = getDailyKey();
  const seed = stringToSeed(`${dailyKey}-${mode}`);
  const rng = mulberry32(seed);

  const pool = [...all];
  const chosen: string[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return chosen;
}

/**
 * Sorteia N palavras aleatórias distintas para o modo livre (sem repetir na mesma partida).
 */
export function pickMultipleWords(
  all: readonly string[],
  count: number,
  avoid: readonly string[] = [],
): string[] {
  const avoidSet = new Set(avoid);
  let available = all.filter((w) => !avoidSet.has(w));

  if (available.length < count) {
    available = [...all];
  }

  const chosen: string[] = [];
  const pool = [...available];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return chosen;
}
