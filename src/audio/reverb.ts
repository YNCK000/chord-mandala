import * as Tone from 'tone';

let reverb: Tone.Reverb | null = null;
let _wet: number = 0.25;

function createReverb(): Tone.Reverb {
  const r = new Tone.Reverb({ wet: _wet, decay: 3, preDelay: 0.01 }).toDestination();
  return r;
}

function getOrCreate(): Tone.Reverb {
  if (!reverb) {
    reverb = createReverb();
  }
  return reverb;
}

/**
 * Get the reverb node for connecting instruments to.
 * Lazily created on first access.
 */
export function getReverbNode(): Tone.Reverb {
  return getOrCreate();
}

/**
 * Set reverb wet/dry mix.
 * @param value 0 = fully dry, 1 = fully wet
 */
export function setReverbMix(value: number): void {
  _wet = Math.max(0, Math.min(1, value));
  const r = getOrCreate();
  r.wet.value = _wet;
}

/** Get current reverb mix value. */
export function getReverbMix(): number {
  return _wet;
}

/** Dispose the reverb node. */
export function disposeReverb(): void {
  if (reverb) {
    reverb.dispose();
    reverb = null;
  }
}
