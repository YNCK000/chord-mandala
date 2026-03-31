import { describe, it, expect } from 'vitest';
import { noteToMidi, midiToNote, voiceRootPosition, voiceInversion, applyStrum, applyVelocityCurve } from '../../src/theory/voicing';

describe('voicing', () => {
  it('noteToMidi converts correctly', () => {
    expect(noteToMidi('C', 4)).toBe(60);
    expect(noteToMidi('A', 4)).toBe(69);
  });

  it('midiToNote converts correctly', () => {
    expect(midiToNote(60)).toEqual({ note: 'C', octave: 4 });
    expect(midiToNote(69)).toEqual({ note: 'A', octave: 4 });
  });

  it('voiceRootPosition creates correct voicing for C major', () => {
    const voicing = voiceRootPosition('C', [0, 4, 7], 4, 5);
    expect(voicing.notes.length).toBe(3);
    expect(voicing.notes[0].midi).toBe(60); // C4
    expect(voicing.notes[1].midi).toBe(64); // E4
    expect(voicing.notes[2].midi).toBe(67); // G4
    expect(voicing.lowestMidi).toBe(60);
    expect(voicing.highestMidi).toBe(67);
  });

  it('voiceRootPosition creates correct voicing for G7', () => {
    const voicing = voiceRootPosition('G', [0, 4, 7, 10]);
    expect(voicing.notes.length).toBe(4);
    expect(voicing.notes[0].midi).toBe(55); // G3
    expect(voicing.notes[1].midi).toBe(59); // B3
    expect(voicing.notes[2].midi).toBe(62); // D4
    expect(voicing.notes[3].midi).toBe(65); // F4
  });

  it('voiceInversion works', () => {
    voiceRootPosition('C', [0, 4, 7], 4, 5);
    // voiceRootPosition with baseOctave=4 uses minOctave=3 → C3=48, E3=52, G3=55
    // After 1st inversion: E3=52, G3=55, C4=60
    const firstInv = voiceInversion('C', [0, 4, 7], 1, 4);
    expect(firstInv.notes[0].midi).toBe(52); // E3
    expect(firstInv.notes[1].midi).toBe(55); // G3
    expect(firstInv.notes[2].midi).toBe(60); // C4
  });

  it('applyStrum staggers note onsets', () => {
    const voicing = voiceRootPosition('C', [0, 4, 7]);
    const strummed = applyStrum(voicing, 100);
    expect(strummed.notes[0].delayMs).toBe(0);
    expect(strummed.notes[1].delayMs).toBe(50);
    expect(strummed.notes[2].delayMs).toBe(100);
  });

  it('applyStrum with 0 returns unchanged', () => {
    const voicing = voiceRootPosition('C', [0, 4, 7]);
    const strummed = applyStrum(voicing, 0);
    expect(strummed).toEqual(voicing);
  });

  it('applyVelocityCurve modifies velocities', () => {
    const voicing = voiceRootPosition('C', [0, 4, 7]);
    // All notes start at velocity 100
    const curved = applyVelocityCurve(voicing, 1); // ascending
    // With positive curve, later notes should be louder
    expect(curved.notes[2].velocity).toBeGreaterThan(curved.notes[0].velocity);
  });

  it('applyVelocityCurve with 0 returns same velocities', () => {
    const voicing = voiceRootPosition('C', [0, 4, 7]);
    const curved = applyVelocityCurve(voicing, 0);
    // All should be 100 (no change)
    expect(curved.notes.every(n => n.velocity === 100)).toBe(true);
  });
});
