// Minimal Web Audio helper for the music games.
// A single lazily-created AudioContext is shared across all games.

let ctx: AudioContext | null = null;

export const getAudioCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

/**
 * Play a simple tone with attack/release envelope.
 */
export const playTone = (
  freq: number,
  durationMs: number = 400,
  type: OscillatorType = 'sine',
  gain: number = 0.2,
): void => {
  const c = getAudioCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.05);
};

/**
 * Play a noise burst — used for percussion (kick/snare/hi-hat-like sounds).
 */
export const playNoise = (
  durationMs: number = 120,
  lowCut: number = 2000,
  gain: number = 0.25,
): void => {
  const c = getAudioCtx();
  if (!c) return;
  const now = c.currentTime;
  const bufferSize = Math.floor((c.sampleRate * durationMs) / 1000);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = lowCut;

  const g = c.createGain();
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(now);
  src.stop(now + durationMs / 1000);
};

/**
 * Play a kick-drum-like thump (sine sweep).
 */
export const playKick = (): void => {
  const c = getAudioCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.25);
};

/** Frequency (Hz) for a named note in scientific pitch notation, e.g. "C4", "F#5". */
export const noteFreq = (note: string): number => {
  const m = /^([A-G])([#b]?)(-?\d+)$/.exec(note);
  if (!m) return 440;
  const [, letter, accidental, octaveStr] = m;
  const semitones: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let n = semitones[letter];
  if (accidental === '#') n += 1;
  if (accidental === 'b') n -= 1;
  const octave = parseInt(octaveStr, 10);
  // A4 = 440 Hz, MIDI 69
  const midi = n + (octave + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
};
