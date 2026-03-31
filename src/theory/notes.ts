import { NoteName } from './types';

// ── Constants ──────────────────────────────────────────────

/** All 12 chromatic pitch classes in sharp order */
export const CHROMATIC_SHARP: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

/** Flat enharmonic equivalents (index matches CHROMATIC_SHARP) */
export const ENHARMONIC_FLAT: (NoteName | string)[] = [
  'C', 'D♭', 'D', 'E♭', 'E', 'F',
  'G♭', 'G', 'A♭', 'A', 'B♭', 'B',
];

/** Map note name to semitone index (C=0, C#=1, ...) */
export const NOTE_TO_INDEX: Record<NoteName, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
};

/** Circle of fifths order: C=0, G=1, D=2, A=3, ... */
export const CIRCLE_OF_FIFTHS: NoteName[] = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F',
];

/** Sharps count for each position in circle of fifths */
export const SHARPS_COUNT: number[] = [
  0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1,
];
// C=0, G=1♯, D=2♯, A=3♯, E=4♯, B=5♯, F♯=6♯,
// C♯=7♯ but enharmonically D♭=5♭, G♭=6♭, D♭=5♭, A♭=4♭, E♭=3♭, B♭=2♭, F=1♭
// Using convention: positive=sharps, negative=flats

// ── Functions ──────────────────────────────────────────────

/**
 * Get semitone index for a note name.
 */
export function noteToSemitone(note: NoteName): number {
  return NOTE_TO_INDEX[note];
}

/**
 * Add semitones to a note, wrapping around the octave.
 */
export function addSemitones(note: NoteName, semitones: number): NoteName {
  const idx = (NOTE_TO_INDEX[note] + semitones % 12 + 12) % 12;
  return CHROMATIC_SHARP[idx];
}

/**
 * Get position (0–11) in the circle of fifths for a given note.
 */
export function circlePosition(note: NoteName): number {
  return CIRCLE_OF_FIFTHS.indexOf(note);
}

/**
 * Get circle entry at a given index.
 */
export function getCircleEntry(index: number): { key: NoteName; sharps: number } {
  const i = ((index % 12) + 12) % 12;
  return {
    key: CIRCLE_OF_FIFTHS[i],
    sharps: SHARPS_COUNT[i],
  };
}

/**
 * Get the next key in the circle of fifths.
 */
export function nextInFifths(note: NoteName): NoteName {
  const pos = circlePosition(note);
  return CIRCLE_OF_FIFTHS[(pos + 1) % 12];
}

/**
 * Get the previous key in the circle of fifths.
 */
export function prevInFifths(note: NoteName): NoteName {
  const pos = circlePosition(note);
  return CIRCLE_OF_FIFTHS[(pos + 11) % 12]; // +11 = -1 mod 12
}

/**
 * Display name for a note, respecting enharmonic style.
 */
export function displayName(note: NoteName, style: 'sharp' | 'flat' = 'sharp'): string {
  if (style === 'flat') {
    const idx = NOTE_TO_INDEX[note];
    return String(ENHARMONIC_FLAT[idx]);
  }
  return note.replace('#', '♯');
}

/**
 * Convert MIDI note number to note name.
 */
export function midiToNoteName(midi: number): NoteName {
  return CHROMATIC_SHARP[((midi % 12) + 12) % 12];
}

/**
 * Convert note name + octave to MIDI number.
 * C4 = 60
 */
export function noteToMidi(note: NoteName, octave: number): number {
  return NOTE_TO_INDEX[note] + (octave + 1) * 12;
}

/**
 * Interval between two notes in semitones (always positive 0–11).
 */
export function intervalBetween(a: NoteName, b: NoteName): number {
  return ((NOTE_TO_INDEX[b] - NOTE_TO_INDEX[a]) % 12 + 12) % 12;
}
