import { NoteName, Voicing, VoicedNote } from './types';
import { NOTE_TO_INDEX, CHROMATIC_SHARP } from './notes';

// ── Constants ──────────────────────────────────────────────

/** MIDI range limits */
const MIN_MIDI = 36; // C2
const MAX_MIDI = 96; // C7

// ── Functions ──────────────────────────────────────────────

/**
 * Convert note name + octave to MIDI number.
 * C4 = 60
 */
export function noteToMidi(note: NoteName, octave: number): number {
  return NOTE_TO_INDEX[note] + (octave + 1) * 12;
}

/**
 * Convert MIDI number to note name + octave.
 */
export function midiToNote(midi: number): { note: NoteName; octave: number } {
  const normalized = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    note: CHROMATIC_SHARP[normalized],
    octave,
  };
}

/**
 * Voice a chord in root position within a target range.
 * Intervals are semitones from root.
 */
export function voiceRootPosition(
  rootNote: NoteName,
  intervals: number[],
  minOctave: number = 3,
  _maxOctave: number = 5,
): Voicing {
  const rootMidi = noteToMidi(rootNote, minOctave);
  const notes: VoicedNote[] = [];

  for (const interval of intervals) {
    let midi = rootMidi + interval;
    // Keep within range
    while (midi < MIN_MIDI) midi += 12;
    while (midi > MAX_MIDI) midi -= 12;
    notes.push({
      midi,
      delayMs: 0,
      velocity: 100,
    });
  }

  // Sort low to high
  notes.sort((a, b) => a.midi - b.midi);

  return {
    notes,
    lowestMidi: notes[0].midi,
    highestMidi: notes[notes.length - 1].midi,
  };
}

/**
 * Voice a chord in a specific inversion.
 * inversion: 0 = root, 1 = first, 2 = second, 3 = third
 */
export function voiceInversion(
  rootNote: NoteName,
  intervals: number[],
  inversion: number,
  baseOctave: number = 4,
): Voicing {
  const base = voiceRootPosition(rootNote, intervals, baseOctave - 1, baseOctave + 2);
  const notes = [...base.notes];

  // Apply inversion: move bottom N notes up an octave
  const inv = Math.min(inversion, notes.length - 1);
  for (let i = 0; i < inv; i++) {
    notes[i].midi += 12;
  }

  // Re-sort
  notes.sort((a, b) => a.midi - b.midi);

  return {
    notes,
    lowestMidi: notes[0].midi,
    highestMidi: notes[notes.length - 1].midi,
  };
}

/**
 * Apply strum effect: stagger note onsets.
 * strumMs = total duration of strum across all notes.
 */
export function applyStrum(voicing: Voicing, strumMs: number): Voicing {
  if (strumMs <= 0 || voicing.notes.length <= 1) return voicing;

  const step = strumMs / (voicing.notes.length - 1);
  const notes = voicing.notes.map((note, i) => ({
    ...note,
    delayMs: Math.round(i * step),
  }));

  return { ...voicing, notes };
}

/**
 * Apply velocity curve.
 * curve: 0 = uniform, positive = ascending, negative = descending.
 */
export function applyVelocityCurve(voicing: Voicing, curve: number): Voicing {
  if (voicing.notes.length <= 1) return voicing;

  const notes = voicing.notes.map((note, i) => {
    const factor = voicing.notes.length > 1
      ? i / (voicing.notes.length - 1)
      : 0.5;
    const multiplier = 1 + curve * (factor - 0.5);
    const velocity = Math.round(Math.max(1, Math.min(127, note.velocity * multiplier)));
    return { ...note, velocity };
  });

  return { ...voicing, notes };
}
