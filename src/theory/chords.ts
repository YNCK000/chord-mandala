import { ChordQuality, Interval } from './types';

// ── Base Intervals ─────────────────────────────────────────
// Each chord quality defined as semitone intervals from root.

const INTERVALS: Record<ChordQuality, Interval[]> = {
  major:       [0, 4, 7],
  minor:       [0, 3, 7],
  dominant7:   [0, 4, 7, 10],
  major7:      [0, 4, 7, 11],
  minor7:      [0, 3, 7, 10],
  diminished:  [0, 3, 6],
  halfDim:     [0, 3, 6, 10],
  augmented:   [0, 4, 8],
  sus2:        [0, 2, 7],
  sus4:        [0, 5, 7],
  dim7:        [0, 3, 6, 9],
  minMaj7:     [0, 3, 7, 11],
};

// ── Extension Intervals ────────────────────────────────────
// Added on top of existing chord tones.

const EXTENSION_INTERVALS: Record<string, Interval> = {
  '9':   14,   // major 9th (octave + 2)
  'b9':  13,   // minor 9th
  '#9':  15,   // augmented 9th
  '11':  17,   // perfect 11th
  '#11': 18,   // augmented 11th
  '13':  21,   // major 13th
  'b13': 20,   // minor 13th
};

// ── Chord Symbol Formatters ────────────────────────────────

const QUALITY_SYMBOL: Record<ChordQuality, string> = {
  major:       '',
  minor:       'm',
  dominant7:   '7',
  major7:      'maj7',
  minor7:      'm7',
  diminished:  'dim',
  halfDim:     'ø7',
  augmented:   'aug',
  sus2:        'sus2',
  sus4:        'sus4',
  dim7:        'dim7',
  minMaj7:     'm(maj7)',
};

// ── Functions ──────────────────────────────────────────────

/**
 * Get base intervals for a chord quality (without extensions).
 */
export function getBaseIntervals(quality: ChordQuality): Interval[] {
  return [...INTERVALS[quality]];
}

/**
 * Get interval for a specific extension.
 */
export function getExtensionInterval(ext: string): Interval | undefined {
  return EXTENSION_INTERVALS[ext];
}

/**
 * Build full interval array from quality + extensions.
 */
export function buildIntervals(quality: ChordQuality, extensions: string[] = []): Interval[] {
  const base = getBaseIntervals(quality);
  for (const ext of extensions) {
    const interval = getExtensionInterval(ext);
    if (interval !== undefined && !base.includes(interval)) {
      base.push(interval);
    }
  }
  return base.sort((a, b) => a - b);
}

/**
 * Build display symbol for a chord.
 * e.g., root='C', quality='dominant7', extensions=['b9','#11'] → 'C7(b9,#11)'
 */
export function buildSymbol(root: string, quality: ChordQuality, extensions: string[] = []): string {
  let symbol = root + QUALITY_SYMBOL[quality];
  if (extensions.length > 0) {
    symbol += `(${extensions.join(',')})`;
  }
  return symbol;
}

/**
 * All available chord qualities.
 */
export function getAllQualities(): ChordQuality[] {
  return Object.keys(INTERVALS) as ChordQuality[];
}
