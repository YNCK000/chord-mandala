import { describe, it, expect } from 'vitest';
import { generateMidiFile } from '../../src/export/midi';
import type { ProgressionSlot } from '../../src/store/progressionStore';

function makeSlot(midiNotes: number[]): ProgressionSlot {
  return {
    id: 'test',
    rootIndex: 0,
    quality: 'major7',
    symbol: 'Cmaj7',
    romanNumeral: 'I',
    voicing: midiNotes.map((midi) => ({ midi, delayMs: 0, velocity: 100 })),
  };
}

/** Properly parse MIDI track 1 events, handling variable-length deltas. */
function parseTrack1Events(bytes: Uint8Array): { noteOns: number; noteOffs: number } {
  // Header = 14 bytes, then Track 0 = MTrk(4) + len(4) + data
  const track0Len = (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
  const t1Header = 14 + 8 + track0Len; // start of Track 1 MTrk
  const t1DataLen = (bytes[t1Header + 4] << 24) | (bytes[t1Header + 5] << 16) |
    (bytes[t1Header + 6] << 8) | bytes[t1Header + 7];
  let pos = t1Header + 8; // start of Track 1 event data
  const end = pos + t1DataLen;

  let noteOns = 0;
  let noteOffs = 0;

  while (pos < end) {
    // Read variable-length delta time
    while (pos < end && (bytes[pos] & 0x80) !== 0) pos++;
    pos++; // consume last delta byte

    if (pos >= end) break;
    const status = bytes[pos];

    if ((status & 0xf0) === 0x90) { noteOns++; pos += 3; }
    else if ((status & 0xf0) === 0x80) { noteOffs++; pos += 3; }
    else if (status === 0xff) {
      // Meta event: FF type length data
      const metaLen = bytes[pos + 2];
      pos += 3 + metaLen;
    } else { pos++; }
  }
  return { noteOns, noteOffs };
}

describe('generateMidiFile', () => {
  it('returns a Blob', () => {
    const blob = generateMidiFile([makeSlot([60, 64, 67, 71])], 120);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('has audio/midi type', () => {
    const blob = generateMidiFile([makeSlot([60, 64, 67])], 120);
    expect(blob.type).toBe('audio/midi');
  });

  it('starts with MThd header', async () => {
    const blob = generateMidiFile([makeSlot([60])], 120);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(bytes[0]).toBe(0x4d);
    expect(bytes[1]).toBe(0x54);
    expect(bytes[2]).toBe(0x68);
    expect(bytes[3]).toBe(0x64);
  });

  it('has correct BPM tempo event', async () => {
    const bpm = 120;
    const blob = generateMidiFile([makeSlot([60])], bpm);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const usPerQuarter = Math.round(60000000 / bpm); // 500000
    let found = false;
    for (let i = 0; i < bytes.length - 6; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
        const tempo = (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
        expect(tempo).toBe(usPerQuarter);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('has correct number of note-on events', async () => {
    const blob = generateMidiFile([makeSlot([60, 64, 67, 71])], 120);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const { noteOns } = parseTrack1Events(bytes);
    expect(noteOns).toBe(4);
  });

  it('has correct number of note-off events', async () => {
    const blob = generateMidiFile([makeSlot([60, 64, 67, 71])], 120);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const { noteOffs } = parseTrack1Events(bytes);
    expect(noteOffs).toBe(4);
  });

  it('handles multiple slots', async () => {
    const slot1 = makeSlot([60, 64, 67]);
    const slot2 = makeSlot([65, 69, 72]);
    const blob = generateMidiFile([slot1, slot2], 120);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const { noteOns } = parseTrack1Events(bytes);
    expect(noteOns).toBe(6); // 3 notes × 2 slots
  });

  it('uses correct velocity', async () => {
    const slot = makeSlot([60]);
    slot.voicing[0].velocity = 80;
    const blob = generateMidiFile([slot], 120);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    // Find first note-on in track 1
    const track0Len = (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
    const t1Data = 14 + 8 + track0Len + 8;
    // First event: delta=0 (1 byte), then 90 nn vv
    expect(bytes[t1Data + 1] & 0xf0).toBe(0x90);
    expect(bytes[t1Data + 3]).toBe(80); // velocity
  });

  it('handles empty slots array', () => {
    const blob = generateMidiFile([], 120);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
