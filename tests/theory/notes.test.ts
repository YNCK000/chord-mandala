import { describe, it, expect } from 'vitest';
import {
  CHROMATIC_SHARP,
  NOTE_TO_INDEX,
  noteToSemitone,
  addSemitones,
  circlePosition,
  getCircleEntry,
  nextInFifths,
  prevInFifths,
  midiToNoteName,
  noteToMidi,
  intervalBetween,
} from '../../src/theory/notes';

describe('notes', () => {
  it('has 12 chromatic pitches', () => {
    expect(CHROMATIC_SHARP.length).toBe(12);
  });

  it('maps notes to correct semitone indices', () => {
    expect(NOTE_TO_INDEX['C']).toBe(0);
    expect(NOTE_TO_INDEX['C#']).toBe(1);
    expect(NOTE_TO_INDEX['E']).toBe(4);
    expect(NOTE_TO_INDEX['B']).toBe(11);
  });

  it('noteToSemitone works', () => {
    expect(noteToSemitone('C')).toBe(0);
    expect(noteToSemitone('G')).toBe(7);
  });

  it('addSemitones wraps around octave', () => {
    expect(addSemitones('C', 0)).toBe('C');
    expect(addSemitones('C', 7)).toBe('G');
    expect(addSemitones('B', 1)).toBe('C');
    expect(addSemitones('C', -1)).toBe('B');
    expect(addSemitones('C', 12)).toBe('C');
  });

  it('circlePosition returns correct positions', () => {
    expect(circlePosition('C')).toBe(0);
    expect(circlePosition('G')).toBe(1);
    expect(circlePosition('F')).toBe(11);
    expect(circlePosition('F#')).toBe(6);
  });

  it('getCircleEntry returns correct data', () => {
    const c = getCircleEntry(0);
    expect(c.key).toBe('C');
    expect(c.sharps).toBe(0);

    const g = getCircleEntry(1);
    expect(g.key).toBe('G');
    expect(g.sharps).toBe(1);

    const f = getCircleEntry(11);
    expect(f.key).toBe('F');
    expect(f.sharps).toBe(-1);
  });

  it('nextInFifths/prevInFifths work', () => {
    expect(nextInFifths('C')).toBe('G');
    expect(nextInFifths('F')).toBe('C');
    expect(prevInFifths('C')).toBe('F');
    expect(prevInFifths('G')).toBe('C');
  });

  it('midiToNoteName converts correctly', () => {
    expect(midiToNoteName(60)).toBe('C');   // C4
    expect(midiToNoteName(64)).toBe('E');   // E4
    expect(midiToNoteName(69)).toBe('A');   // A4
    expect(midiToNoteName(0)).toBe('C');    // C-1
  });

  it('noteToMidi converts correctly', () => {
    expect(noteToMidi('C', 4)).toBe(60);
    expect(noteToMidi('A', 4)).toBe(69);
    expect(noteToMidi('E', 4)).toBe(64);
  });

  it('intervalBetween calculates correctly', () => {
    expect(intervalBetween('C', 'G')).toBe(7);
    expect(intervalBetween('G', 'C')).toBe(5);
    expect(intervalBetween('C', 'C')).toBe(0);
    expect(intervalBetween('E', 'B')).toBe(7);
  });
});
