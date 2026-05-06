import type { AudioSettings, GameHistoryResult } from "../types/game";

const historyKey = "word-bowling-history";
const bestKey = "word-bowling-best";
const audioKey = "word-bowling-audio";

export function saveGameHistory(result: GameHistoryResult): void {
  const history = loadGameHistory();
  const nextHistory = [result, ...history].slice(0, 20);
  localStorage.setItem(historyKey, JSON.stringify(nextHistory));
  const best = loadBestScore();
  if (!best || result.score > best.score) {
    localStorage.setItem(bestKey, JSON.stringify(result));
  }
}

export function loadGameHistory(): GameHistoryResult[] {
  try {
    return JSON.parse(localStorage.getItem(historyKey) ?? "[]") as GameHistoryResult[];
  } catch {
    return [];
  }
}

export function loadBestScore(): GameHistoryResult | null {
  try {
    return JSON.parse(localStorage.getItem(bestKey) ?? "null") as GameHistoryResult | null;
  } catch {
    return null;
  }
}

export function clearGameHistory(): void {
  localStorage.removeItem(historyKey);
  localStorage.removeItem(bestKey);
}

export function saveAudioSettings(settings: AudioSettings): void {
  localStorage.setItem(audioKey, JSON.stringify(settings));
}

export function loadAudioSettings(): AudioSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(audioKey) ?? "{}") as Partial<AudioSettings>;
    return {
      musicEnabled: parsed.musicEnabled ?? true,
      sfxEnabled: parsed.sfxEnabled ?? true,
      volume: parsed.volume ?? 0.55,
    };
  } catch {
    return { musicEnabled: true, sfxEnabled: true, volume: 0.55 };
  }
}
