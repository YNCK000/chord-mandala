import * as Tone from 'tone';
import type { VoicedNote } from '../theory/types';
import { startAudio } from './engine';
import { getReverbNode } from './reverb';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

// ── Dedicated sampler for playback module (connected to reverb) ──

const SALAMANDER_URLS: Record<string, string> = {
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

let playbackSampler: Tone.Sampler | null = null;
let playbackLoaded = false;

function getPlaybackSampler(): Tone.Sampler {
  if (playbackSampler) return playbackSampler;

  playbackSampler = new Tone.Sampler({
    urls: SALAMANDER_URLS,
    onload: () => {
      playbackLoaded = true;
    },
  }).connect(getReverbNode());

  return playbackSampler;
}

async function waitForLoad(timeoutMs = 10_000): Promise<void> {
  if (playbackLoaded) return;
  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (playbackLoaded) {
        clearInterval(check);
        resolve();
      }
    }, 50);
    setTimeout(() => { clearInterval(check); resolve(); }, timeoutMs);
  });
}

// ── Active part reference for stop/cleanup ──

let activePart: Tone.Part | null = null;

// ── Public API ──

/**
 * Play a full voicing with precise Tone.js scheduling.
 * Each note fires at its delayMs offset from now.
 */
export async function playVoicingPrecise(voicing: VoicedNote[], duration = '4n'): Promise<void> {
  await startAudio();
  const s = getPlaybackSampler();
  await waitForLoad();

  const now = Tone.now();

  voicing.forEach((vn) => {
    const noteName = midiToNoteName(vn.midi);
    const vel = vn.velocity / 127;
    const time = now + vn.delayMs / 1000;
    s.triggerAttackRelease(noteName, duration, time, vel);
  });
}

/**
 * Play a chord progression at a given BPM.
 * @param slots  Array of { voicing, duration } where duration is in beats
 * @param bpm    Tempo in beats per minute
 */
export async function playProgression(
  slots: { voicing: VoicedNote[]; duration: number }[],
  bpm: number,
): Promise<void> {
  await startAudio();
  const s = getPlaybackSampler();
  await waitForLoad();

  // Stop any previously playing part
  if (activePart) {
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }

  Tone.getTransport().bpm.value = bpm;

  // Build events array for Tone.Part: [timeInBeats, data]
  const events: [number, { voicing: VoicedNote[]; duration: number }][] = [];
  let beat = 0;
  for (const slot of slots) {
    events.push([beat, slot]);
    beat += slot.duration;
  }

  activePart = new Tone.Part((time, data) => {
    const durSec = Tone.Time(`${data.duration}n`).toSeconds();
    data.voicing.forEach((vn: VoicedNote) => {
      const noteName = midiToNoteName(vn.midi);
      const vel = vn.velocity / 127;
      const noteTime = time + vn.delayMs / 1000;
      s.triggerAttackRelease(noteName, durSec, noteTime, vel);
    });
  }, events);

  // Auto-stop transport after the progression finishes
  const totalSeconds = Tone.Time(`${beat}n`).toSeconds();
  Tone.getTransport().scheduleOnce(() => {
    Tone.getTransport().stop();
  }, `+${totalSeconds + 0.5}`);

  activePart.start(0);
  Tone.getTransport().start();
}

/** Stop any currently playing progression. */
export function stopProgression(): void {
  if (activePart) {
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }
  Tone.getTransport().stop();
}

/** Dispose playback resources. */
export function disposePlayback(): void {
  stopProgression();
  if (playbackSampler) {
    playbackSampler.dispose();
    playbackSampler = null;
    playbackLoaded = false;
  }
}
