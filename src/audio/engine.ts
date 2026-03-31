import * as Tone from 'tone';

type AudioState = 'uninitialized' | 'loading' | 'ready';

let state: AudioState = 'uninitialized';

/**
 * Start the Tone.js audio context.
 * MUST be called from a user gesture (click/touch) — browsers require this.
 * Safe to call multiple times; subsequent calls return the same promise.
 */
let startPromise: Promise<void> | null = null;

export async function startAudio(): Promise<void> {
  if (state === 'ready') return;
  if (startPromise) return startPromise;

  startPromise = (async () => {
    state = 'loading';
    await Tone.start();
    state = 'ready';
  })();

  return startPromise;
}

/** Whether audio context is fully started and ready for playback. */
export function isReady(): boolean {
  return state === 'ready';
}

/** Whether audio is currently loading. */
export function isLoading(): boolean {
  return state === 'loading';
}

/** Dispose the Tone.js context entirely. */
export function disposeAudio(): void {
  Tone.getTransport().dispose();
  state = 'uninitialized';
  startPromise = null;
}
