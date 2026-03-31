import { describe, it, expect } from 'vitest';
import { getBaseIntervals, buildIntervals, buildSymbol } from '../../src/theory/chords';

describe('chords', () => {
  it('major triad has correct intervals', () => {
    expect(getBaseIntervals('major')).toEqual([0, 4, 7]);
  });

  it('minor triad has correct intervals', () => {
    expect(getBaseIntervals('minor')).toEqual([0, 3, 7]);
  });

  it('dominant7 has correct intervals', () => {
    expect(getBaseIntervals('dominant7')).toEqual([0, 4, 7, 10]);
  });

  it('major7 has correct intervals', () => {
    expect(getBaseIntervals('major7')).toEqual([0, 4, 7, 11]);
  });

  it('minor7 has correct intervals', () => {
    expect(getBaseIntervals('minor7')).toEqual([0, 3, 7, 10]);
  });

  it('diminished has correct intervals', () => {
    expect(getBaseIntervals('diminished')).toEqual([0, 3, 6]);
  });

  it('halfDim has correct intervals', () => {
    expect(getBaseIntervals('halfDim')).toEqual([0, 3, 6, 10]);
  });

  it('dim7 has correct intervals', () => {
    expect(getBaseIntervals('dim7')).toEqual([0, 3, 6, 9]);
  });

  it('augmented has correct intervals', () => {
    expect(getBaseIntervals('augmented')).toEqual([0, 4, 8]);
  });

  it('sus2 has correct intervals', () => {
    expect(getBaseIntervals('sus2')).toEqual([0, 2, 7]);
  });

  it('sus4 has correct intervals', () => {
    expect(getBaseIntervals('sus4')).toEqual([0, 5, 7]);
  });

  it('minMaj7 has correct intervals', () => {
    expect(getBaseIntervals('minMaj7')).toEqual([0, 3, 7, 11]);
  });

  it('buildIntervals adds extensions', () => {
    const result = buildIntervals('dominant7', ['b9']);
    expect(result).toContain(13); // b9 = 13 semitones
    expect(result).toContain(0);  // root
    expect(result).toContain(4);  // major 3rd
    expect(result).toContain(7);  // perfect 5th
    expect(result).toContain(10); // minor 7th
  });

  it('buildSymbol generates correct symbols', () => {
    expect(buildSymbol('C', 'major')).toBe('C');
    expect(buildSymbol('C', 'minor')).toBe('Cm');
    expect(buildSymbol('C', 'dominant7')).toBe('C7');
    expect(buildSymbol('C', 'major7')).toBe('Cmaj7');
    expect(buildSymbol('C', 'minor7')).toBe('Cm7');
    expect(buildSymbol('C', 'dominant7', ['b9', '#11'])).toBe('C7(b9,#11)');
    expect(buildSymbol('G', 'halfDim')).toBe('Gø7');
  });
});
