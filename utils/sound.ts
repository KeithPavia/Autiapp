export const SOUND_SETTINGS_EVENT = 'app-sound-settings-changed';
type PlayOptions = { volume?: number; loop?: boolean; category?: 'music' | 'effects' | string; };
const MUSIC_KEY = 'musicVolume';
const EFFECTS_KEY = 'effectsVolume';
const MUTE_KEY = 'soundMuted';

export function getMusicVolume() { const value = Number(localStorage.getItem(MUSIC_KEY)); return Number.isFinite(value) ? value : 0.35; }
export function setMusicVolume(value: number) { localStorage.setItem(MUSIC_KEY, String(value)); window.dispatchEvent(new Event(SOUND_SETTINGS_EVENT)); }
export function getEffectsVolume() { const value = Number(localStorage.getItem(EFFECTS_KEY)); return Number.isFinite(value) ? value : 0.75; }
export function setEffectsVolume(value: number) { localStorage.setItem(EFFECTS_KEY, String(value)); window.dispatchEvent(new Event(SOUND_SETTINGS_EVENT)); }
export function isSoundMuted() { return localStorage.getItem(MUTE_KEY) === 'true'; }
export function setSoundMuted(value: boolean) { localStorage.setItem(MUTE_KEY, value ? 'true' : 'false'); window.dispatchEvent(new Event(SOUND_SETTINGS_EVENT)); }

export function playSound(path: string, options: PlayOptions = {}) {
  if (isSoundMuted()) return null;
  const audio = new Audio(path);
  const baseVolume = options.category === 'music' ? getMusicVolume() : getEffectsVolume();
  audio.volume = Math.max(0, Math.min(1, (options.volume ?? 1) * baseVolume));
  audio.loop = Boolean(options.loop);
  audio.play().catch(() => {});
  return audio;
}
export function stopSound(audio: HTMLAudioElement | null | undefined) {
  if (!audio) return;
  try { audio.pause(); audio.currentTime = 0; } catch {}
}
