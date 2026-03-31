import type { ProgressionSlot } from '@/store/progressionStore';

// ── Helpers ──────────────────────────────────────────────

function writeUint32(bytes: number[], value: number): void {
  bytes.push((value >> 24) & 0xff);
  bytes.push((value >> 16) & 0xff);
  bytes.push((value >> 8) & 0xff);
  bytes.push(value & 0xff);
}

function writeUint16(bytes: number[], value: number): void {
  bytes.push((value >> 8) & 0xff);
  bytes.push(value & 0xff);
}

/** Encode a delta time in MIDI variable-length format. */
function encodeVariableLength(value: number): number[] {
  if (value < 0) throw new Error('Delta time cannot be negative');
  if (value === 0) return [0];

  const result: number[] = [];
  let temp = value & 0x7f;
  let remaining = value >> 7;
  while (remaining > 0) {
    temp |= 0x80;
    result.unshift(temp);
    temp = remaining & 0x7f;
    remaining >>= 7;
  }
  result.push(temp);
  return result;
}

/** Encode a 3-byte tempo (microseconds per quarter note). */
function encodeTempo(usPerQuarter: number): number[] {
  return [
    (usPerQuarter >> 16) & 0xff,
    (usPerQuarter >> 8) & 0xff,
    usPerQuarter & 0xff,
  ];
}

// ── MIDI Generation ─────────────────────────────────────

export function generateMidiFile(slots: ProgressionSlot[], bpm: number): Blob {
  const TICKS_PER_QUARTER = 384;
  const TICKS_PER_CHORD = TICKS_PER_QUARTER; // 1 quarter note per chord

  // ── Track 0: Tempo ──
  const track0: number[] = [];
  // delta=0, FF 51 03 + tempo
  const usPerQuarter = Math.round(60000000 / bpm);
  track0.push(...encodeVariableLength(0), 0xff, 0x51, 0x03, ...encodeTempo(usPerQuarter));
  // delta=0, FF 2F 00 (end of track)
  track0.push(...encodeVariableLength(0), 0xff, 0x2f, 0x00);

  // ── Track 1: Notes ──
  const track1: number[] = [];
  const channel = 0;
  for (const slot of slots) {
    const notes = slot.voicing;
    // Note-on events — all at delta=0 (simultaneous)
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const noteOnDelta = i === 0 ? 0 : 0;
      track1.push(
        ...encodeVariableLength(noteOnDelta),
        0x90 | channel,
        note.midi & 0x7f,
        Math.min(127, Math.max(0, note.velocity)) & 0x7f,
      );
    }
    // Note-off events — all at delta = TICKS_PER_CHORD (after duration)
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const noteOffDelta = i === 0 ? TICKS_PER_CHORD : 0;
      track1.push(
        ...encodeVariableLength(noteOffDelta),
        0x80 | channel,
        note.midi & 0x7f,
        0x00,
      );
    }
  }
  // End of track
  track1.push(...encodeVariableLength(0), 0xff, 0x2f, 0x00);

  // ── Build file ──
  const header: number[] = [];
  // MThd
  header.push(0x4d, 0x54, 0x68, 0x64);
  // Length = 6
  writeUint32(header, 6);
  // Format = 1 (multi-track)
  writeUint16(header, 1);
  // Number of tracks = 2
  writeUint16(header, 2);
  // Division = ticks per quarter note = 384 (0x0180)
  writeUint16(header, TICKS_PER_QUARTER);

  // Track 0 chunk
  const track0Chunk: number[] = [];
  track0Chunk.push(0x4d, 0x54, 0x72, 0x6b); // MTrk
  writeUint32(track0Chunk, track0.length);
  track0Chunk.push(...track0);

  // Track 1 chunk
  const track1Chunk: number[] = [];
  track1Chunk.push(0x4d, 0x54, 0x72, 0x6b); // MTrk
  writeUint32(track1Chunk, track1.length);
  track1Chunk.push(...track1);

  const fileData = new Uint8Array([...header, ...track0Chunk, ...track1Chunk]);
  return new Blob([fileData], { type: 'audio/midi' });
}
