import type { AudioSettings } from "../types/game";
import { loadAudioSettings, saveAudioSettings } from "./storage";

let context: AudioContext | null = null;
let master: GainNode | null = null;
let bgmTimer: number | null = null;
let settings: AudioSettings = loadAudioSettings();

function supported(): boolean {
  return typeof window !== "undefined" && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
}

export function initAudio(): boolean {
  if (!supported()) return false;
  if (!context) {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    context = new AudioCtor();
    master = context.createGain();
    master.gain.value = settings.volume;
    master.connect(context.destination);
  }
  void context.resume();
  return true;
}

function toneRaw(freq: number, duration: number, type: OscillatorType = "square", when = 0, volume = 0.18): void {
  if (!initAudio() || !context || !master) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration);
}

function tone(freq: number, duration: number, type: OscillatorType = "square", when = 0, volume = 0.18): void {
  if (!settings.sfxEnabled) return;
  toneRaw(freq, duration, type, when, volume);
}

function musicTone(freq: number, duration: number, when = 0, volume = 0.035): void {
  if (!initAudio() || !context || !master) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const start = context.currentTime + when;
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.035);
  gain.gain.linearRampToValueAtTime(0.001, start + duration);
  osc.connect(filter).connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise(duration: number, volume = 0.12): void {
  if (!settings.sfxEnabled || !initAudio() || !context || !master) return;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = context.createBufferSource();
  const gain = context.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain).connect(master);
  source.start();
}

export function startBgm(): void {
  if (!settings.musicEnabled || !initAudio() || bgmTimer) return;
  const notes = [392, 440, 494, 440, 349, 392, 440, 330];
  const harmony = [196, 220, 247, 220, 174, 196, 220, 165];
  let index = 0;
  bgmTimer = window.setInterval(() => {
    if (!settings.musicEnabled) return;
    const noteIndex = index % notes.length;
    musicTone(notes[noteIndex], 0.32, 0, 0.028);
    if (index % 2 === 0) musicTone(harmony[noteIndex], 0.42, 0.02, 0.018);
    index += 1;
  }, 520);
}

export function stopBgm(): void {
  if (bgmTimer) window.clearInterval(bgmTimer);
  bgmTimer = null;
}

export function playButtonClick(): void { tone(720, 0.05, "triangle", 0, 0.12); }
export function playToggleClick(): void { toneRaw(560, 0.045, "sine", 0, 0.09); toneRaw(760, 0.065, "sine", 0.035, 0.07); }
export function playOptionSelect(): void { tone(520, 0.06, "square", 0, 0.1); }
export function playWrong(): void { tone(180, 0.18, "sine", 0, 0.14); }
export function playCorrect(): void { tone(660, 0.08, "triangle", 0, 0.14); tone(880, 0.12, "triangle", 0.08, 0.12); }
export function playStrike(): void { noise(0.35, 0.13); tone(784, 0.08, "square", 0.12, 0.12); tone(988, 0.14, "square", 0.2, 0.1); }
export function playSpare(): void { tone(587, 0.08, "triangle", 0, 0.12); tone(784, 0.16, "triangle", 0.09, 0.13); }
export function playMiss(): void { tone(220, 0.18, "sine", 0, 0.1); }
export function playResult(): void { tone(523, 0.09, "square", 0, 0.12); tone(659, 0.09, "square", 0.1, 0.12); tone(784, 0.18, "square", 0.2, 0.12); }

export function setMusicEnabled(enabled: boolean): void {
  settings = { ...settings, musicEnabled: enabled };
  saveAudioSettings(settings);
  if (enabled) startBgm(); else stopBgm();
}

export function setSfxEnabled(enabled: boolean): void {
  settings = { ...settings, sfxEnabled: enabled };
  saveAudioSettings(settings);
}

export function setVolume(value: number): void {
  settings = { ...settings, volume: value };
  if (master) master.gain.value = value;
  saveAudioSettings(settings);
}

export function getAudioSettings(): AudioSettings {
  return settings;
}
