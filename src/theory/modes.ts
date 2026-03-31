import { Mode, ModeName, ChordQuality } from './types';

// ── Mode Definitions ───────────────────────────────────────
// Each mode: semitone steps between degrees + chord qualities per degree.

const MODES: Record<ModeName, Mode> = {
  ionian: {
    name: 'ionian',
    steps: [2, 2, 1, 2, 2, 2, 1],
    degreeQualities: ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'halfDim'],
    degreeRomanNumerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  },
  dorian: {
    name: 'dorian',
    steps: [2, 1, 2, 2, 2, 1, 2],
    degreeQualities: ['minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'halfDim', 'major7'],
    degreeRomanNumerals: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  },
  phrygian: {
    name: 'phrygian',
    steps: [1, 2, 2, 2, 1, 2, 2],
    degreeQualities: ['minor7', 'major7', 'dominant7', 'minor7', 'halfDim', 'major7', 'minor7'],
    degreeRomanNumerals: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  },
  lydian: {
    name: 'lydian',
    steps: [2, 2, 2, 1, 2, 2, 1],
    degreeQualities: ['major7', 'dominant7', 'minor7', 'halfDim', 'major7', 'minor7', 'minor7'],
    degreeRomanNumerals: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
  },
  mixolydian: {
    name: 'mixolydian',
    steps: [2, 2, 1, 2, 2, 1, 2],
    degreeQualities: ['dominant7', 'minor7', 'halfDim', 'major7', 'minor7', 'minor7', 'major7'],
    degreeRomanNumerals: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  },
  aeolian: {
    name: 'aeolian',
    steps: [2, 1, 2, 2, 1, 2, 2],
    degreeQualities: ['minor7', 'halfDim', 'major7', 'minor7', 'minor7', 'major7', 'dominant7'],
    degreeRomanNumerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  },
  locrian: {
    name: 'locrian',
    steps: [1, 2, 2, 1, 2, 2, 2],
    degreeQualities: ['halfDim', 'major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7'],
    degreeRomanNumerals: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
  },
};

// ── Functions ──────────────────────────────────────────────

/**
 * Get mode definition by name.
 */
export function getMode(name: ModeName): Mode {
  return MODES[name];
}

/**
 * Get all mode names.
 */
export function getAllModes(): ModeName[] {
  return Object.keys(MODES) as ModeName[];
}

/**
 * Get the root note of a scale degree in a given mode/key.
 * degree is 0-indexed (0 = root).
 */
export function getScaleDegreeRoot(keyRoot: number, mode: ModeName, degree: number): number {
  const m = MODES[mode];
  let semitones = 0;
  for (let i = 0; i < ((degree % 7) + 7) % 7; i++) {
    semitones += m.steps[i];
  }
  return (keyRoot + semitones) % 12;
}

/**
 * Get chord quality at a specific scale degree.
 */
export function getChordQualityAtDegree(mode: ModeName, degree: number): ChordQuality {
  const m = MODES[mode];
  const d = ((degree % 7) + 7) % 7;
  return m.degreeQualities[d];
}

/**
 * Get all chord roots and qualities for a key/mode.
 */
export function getModeChords(keyRootIndex: number, mode: ModeName): { rootIndex: number; quality: ChordQuality; romanNumeral: string }[] {
  const m = MODES[mode];
  const chords = [];
  let accumulated = 0;

  for (let i = 0; i < 7; i++) {
    chords.push({
      rootIndex: (keyRootIndex + accumulated) % 12,
      quality: m.degreeQualities[i],
      romanNumeral: m.degreeRomanNumerals[i],
    });
    accumulated += m.steps[i];
  }

  return chords;
}

/**
 * Get relative mode: what mode do you get starting on a different degree?
 * e.g., ionian degree 5 → mixolydian
 */
export function getRelativeMode(mode: ModeName, degree: number): ModeName {
  const modes: ModeName[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
  const currentIdx = modes.indexOf(mode);
  return modes[(currentIdx + degree) % 7];
}
