// Audio engine — barrel export
export { startAudio, isReady, isLoading, disposeAudio } from './engine';
export {
  playNote,
  playChord,
  disposePiano,
  isPianoReady,
  ensureReady as ensurePianoReady,
} from './piano';
export { setReverbMix, getReverbMix, getReverbNode, disposeReverb } from './reverb';
export {
  playVoicingPrecise,
  playProgression,
  stopProgression,
  disposePlayback,
} from './playback';
