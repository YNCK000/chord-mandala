// ── Core Types ──────────────────────────────────────────────

/** Note name (chromatic pitch class) */
export type NoteName =
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F'
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/** Enharmonic alias map */
export type EnharmonicStyle = 'sharp' | 'flat';

/** Semitone interval from root */
export type Interval = number;

/** Chord quality */
export type ChordQuality =
  | 'major'       // C
  | 'minor'       // Cm
  | 'dominant7'   // C7
  | 'major7'      // Cmaj7
  | 'minor7'      // Cm7
  | 'diminished'  // Cdim
  | 'halfDim'     // Cø7
  | 'augmented'   // Caug
  | 'sus2'        // Csus2
  | 'sus4'        // Csus4
  | 'dim7'        // Cdim7
  | 'minMaj7';    // Cm(maj7)

/** Extension type */
export type ExtensionType =
  | '9' | 'b9' | '#9'
  | '11' | '#11'
  | '13' | 'b13';

/** A fully defined chord */
export interface Chord {
  id: string;                    // e.g. 'C_dominant7_9'
  root: NoteName;
  quality: ChordQuality;
  extensions: ExtensionType[];   // e.g. ['b9', '#11']
  intervals: Interval[];         // semitones from root
  symbol: string;                // display name: 'C7(b9,#11)'
}

/** Mode name */
export type ModeName =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

/** Mode definition */
export interface Mode {
  name: ModeName;
  steps: number[];              // semitone steps between scale degrees (7 numbers)
  degreeQualities: ChordQuality[]; // chord quality at each degree (7 entries)
  degreeRomanNumerals: string[];   // ['I', 'ii', ...]
}

/** Resolution type */
export type ResolutionType =
  | 'authentic'      // V → I
  | 'plagal'         // IV → I
  | 'deceptive'      // V → vi
  | 'tritoneSub'     // V7 → bII7
  | 'secondary';     // V/x → x

/** Resolution edge between two chords */
export interface Resolution {
  from: string;      // chord id
  to: string;        // chord id
  type: ResolutionType;
  strength: number;  // 0–1, how strong the pull is
}

/** Key center */
export interface KeyCenter {
  root: NoteName;
  enharmonicStyle: EnharmonicStyle;
  sharps: number;    // number of sharps (negative = flats)
}

/** Circle of fifths entry */
export interface CircleEntry {
  index: number;       // 0–11, position in circle of fifths
  angle: number;       // radians for rendering
  key: NoteName;
  sharps: number;      // + = sharps, - = flats
  displayName: string; // for UI: 'F♯' or 'G♭' depending on context
}

/** Voiced note for playback */
export interface VoicedNote {
  midi: number;        // MIDI note number (0–127)
  delayMs: number;     // offset from chord start (for strum)
  velocity: number;    // 0–127
}

/** Chord voicing */
export interface Voicing {
  notes: VoicedNote[];
  lowestMidi: number;
  highestMidi: number;
}

/** Chord builder slot */
export interface ChordSlot {
  id: string;          // unique slot id
  chord: Chord;
  voicing: Voicing;
}
