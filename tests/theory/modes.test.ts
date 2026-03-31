import { describe, it, expect } from 'vitest';
import { getMode, getAllModes, getModeChords, getScaleDegreeRoot, getRelativeMode } from '../../src/theory/modes';

describe('modes', () => {
  it('has 7 modes', () => {
    expect(getAllModes().length).toBe(7);
  });

  it('ionian has correct steps', () => {
    const ionian = getMode('ionian');
    expect(ionian.steps).toEqual([2, 2, 1, 2, 2, 2, 1]);
    // Sum = 12 (full octave)
    expect(ionian.steps.reduce((a, b) => a + b, 0)).toBe(12);
  });

  it('all modes sum to 12', () => {
    for (const name of getAllModes()) {
      const mode = getMode(name);
      const sum = mode.steps.reduce((a, b) => a + b, 0);
      expect(sum).toBe(12);
    }
  });

  it('ionian degree chords are correct for C', () => {
    const chords = getModeChords(0, 'ionian');
    // C: I=CM7, ii=Dm7, iii=Em7, IV=FM7, V=G7, vi=Am7, vii=Bø7
    expect(chords[0]).toEqual({ rootIndex: 0, quality: 'major7', romanNumeral: 'I' });
    expect(chords[1]).toEqual({ rootIndex: 2, quality: 'minor7', romanNumeral: 'ii' });
    expect(chords[2]).toEqual({ rootIndex: 4, quality: 'minor7', romanNumeral: 'iii' });
    expect(chords[3]).toEqual({ rootIndex: 5, quality: 'major7', romanNumeral: 'IV' });
    expect(chords[4]).toEqual({ rootIndex: 7, quality: 'dominant7', romanNumeral: 'V' });
    expect(chords[5]).toEqual({ rootIndex: 9, quality: 'minor7', romanNumeral: 'vi' });
    expect(chords[6]).toEqual({ rootIndex: 11, quality: 'halfDim', romanNumeral: 'vii°' });
  });

  it('dorian degree chords are correct for D', () => {
    const chords = getModeChords(2, 'dorian');
    // D dorian: i=Dm7, ii=Em7, III=FM7, IV=G7, v=Am7, vi=Bø7, VII=CM7
    expect(chords[0]).toEqual({ rootIndex: 2, quality: 'minor7', romanNumeral: 'i' });
    expect(chords[1]).toEqual({ rootIndex: 4, quality: 'minor7', romanNumeral: 'ii' });
    expect(chords[2]).toEqual({ rootIndex: 5, quality: 'major7', romanNumeral: 'III' });
    expect(chords[3]).toEqual({ rootIndex: 7, quality: 'dominant7', romanNumeral: 'IV' });
  });

  it('getScaleDegreeRoot returns correct roots', () => {
    // C ionian, degree 4 = G (index 7): C D E F G
    expect(getScaleDegreeRoot(0, 'ionian', 4)).toBe(7);
    // C ionian, degree 3 = F (index 5)
    expect(getScaleDegreeRoot(0, 'ionian', 3)).toBe(5);
    // C ionian, degree 0 = C (index 0)
    expect(getScaleDegreeRoot(0, 'ionian', 0)).toBe(0);
  });

  it('getRelativeMode works', () => {
    expect(getRelativeMode('ionian', 5)).toBe('aeolian');
    expect(getRelativeMode('ionian', 4)).toBe('mixolydian');
    expect(getRelativeMode('dorian', 1)).toBe('phrygian');
  });
});
