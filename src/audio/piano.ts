import * as Tone from 'tone';
import { startAudio } from './engine';
import { getReverbNode } from './reverb';

const SALAMANDER_SAMPLES: Record<string, string> = {
  'C3': 'https://tonejs.github.io/audio/salamander/C3.mp3',
  'D#3': 'https://tonejs.github.io/audio/salamander/Ds3.mp3',
  'F#3': 'https://tonejs.github.io/audio/salamander/Fs3.mp3',
  'A3': 'https://tonejs.github.io/audio/salamander/A3.mp3',
  'C4': 'https://tonejs.github.io/audio/salamander/C4.mp3',
  'D#4': 'https://tonejs.github.io/audio/salamander/Ds4.mp3',
  'F#4': 'https://tonejs.github.io/audio/salamander/Fs4.mp3',
  'A4': 'https://tonejs.github.io/audio/salamander/A4.mp3',
  'C5': 'https://tonejs.github.io/audio/salamander/C5.mp3',
  'D#5': 'https://tonejs.github.io/audio/salamander/Ds5.mp3',
  'F#5': 'https://tonejs.github.io/audio/salamander/Fs5.mp3',
  'A5': 'https://tonejs.github.io/audio/salamander/A5.mp3',
};

let sampler: Tone.Sampler | null = null;
let isLoaded = false;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Convert MIDI note number to Tone.js note name (e.g. 60 → 'C4'). */
function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

function getOrCreate(): Tone.Sampler {
  if (sampler) return sampler;

  sampler = new Tone.Sampler({
    urls: SALAMANDER_SAMPLES,
    onload: () => {
      isLoaded = true;
    },
    onerror: (err) => {
      console.error('[Piano] Sample load error:', err);
    },
  }).connect(getReverbNode());

  return sampler;
}

/**
 * Ensure the sampler is ready (audio started + samples loaded).
 * @throws If samples haven't finished loading yet.
 */
export async function ensureReady(): Promise<void> {
  await startAudio();
  getOrCreate();
  if (isLoaded) return;

  // Wait for samples to load (up to 30s)
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Piano samples timed out loading')), 30_000);
    const check = setInterval(() => {
      if (isLoaded) {
        clearInterval(check);
        clearTimeout(timeout);
        resolve();
      }
    }, 100);
  });
}

/** Whether all piano samples are loaded. */
export function isPianoReady(): boolean {
  return isLoaded;
}

/**
 * Play a single note.
 * @param midiNote 0–127 MIDI note number
 * @param velocity 0–1 (default 0.8)
 * @param duration  Tone.js time string (default '8n')
 */
export function playNote(midiNote: number, velocity = 0.8, duration = '8n'): void {
  if (!isLoaded) {
    console.warn('[Piano] Samples not loaded yet');
    return;
  }
  const s = getOrCreate();
  const noteName = midiToNoteName(midiNote);
  s.triggerAttackRelease(noteName, duration, Tone.now(), velocity);
}

/**
 * Play a chord (multiple notes with optional strum).
 * @param midiNotes Array of 0–127 MIDI note numbers
 * @param velocity 0–1 (default 0.8)
 * @param duration  Tone.js time string (default '4n')
 * @param strumMs   Milliseconds between each note for strum effect (default 0)
 */
export function playChord(
  midiNotes: number[],
  velocity = 0.8,
  duration = '4n',
  strumMs = 0,
): void {
  if (!isLoaded) {
    console.warn('[Piano] Samples not loaded yet');
    return;
  }
  const s = getOrCreate();
  const now = Tone.now();

  midiNotes.forEach((midi, i) => {
    const offset = (strumMs * i) / 1000;
    const noteName = midiToNoteName(midi);
    s.triggerAttackRelease(noteName, duration, now + offset, velocity);
  });
}

/** Dispose the piano sampler. */
export function disposePiano(): void {
  if (sampler) {
    sampler.dispose();
    sampler = null;
    isLoaded = false;
  }
}
