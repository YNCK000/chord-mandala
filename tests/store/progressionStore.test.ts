import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressionStore } from '@/store/progressionStore';

describe('progressionStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useProgressionStore.setState({
      slots: [],
      bpm: 120,
      isPlaying: false,
      loop: false,
      playingIndex: null,
    });
  });

  it('initially has empty slots', () => {
    const state = useProgressionStore.getState();
    expect(state.slots).toEqual([]);
  });

  it('addSlot adds a chord', () => {
    const { addSlot } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    const state = useProgressionStore.getState();
    expect(state.slots.length).toBe(1);
    expect(state.slots[0].rootIndex).toBe(0);
    expect(state.slots[0].quality).toBe('major7');
    expect(state.slots[0].symbol).toBe('Cmaj7');
    expect(state.slots[0].romanNumeral).toBe('I');
  });

  it('removeSlot removes by index', () => {
    const { addSlot, removeSlot } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    addSlot(7, 'minor7', 'ii');
    removeSlot(0);
    const state = useProgressionStore.getState();
    expect(state.slots.length).toBe(1);
    expect(state.slots[0].symbol).toBe('Gm7');
  });

  it('reorderSlot swaps positions', () => {
    const { addSlot, reorderSlot } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    addSlot(7, 'minor7', 'ii');
    reorderSlot(0, 1);
    const state = useProgressionStore.getState();
    expect(state.slots[0].symbol).toBe('Gm7');
    expect(state.slots[1].symbol).toBe('Cmaj7');
  });

  it('clearSlots empties all', () => {
    const { addSlot, clearSlots } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    addSlot(7, 'minor7', 'ii');
    clearSlots();
    const state = useProgressionStore.getState();
    expect(state.slots.length).toBe(0);
  });

  it('setBpm updates BPM', () => {
    const { setBpm } = useProgressionStore.getState();
    setBpm(160);
    expect(useProgressionStore.getState().bpm).toBe(160);
  });

  it('setBpm clamps to min 40', () => {
    const { setBpm } = useProgressionStore.getState();
    setBpm(10);
    expect(useProgressionStore.getState().bpm).toBe(40);
  });

  it('setBpm clamps to max 200', () => {
    const { setBpm } = useProgressionStore.getState();
    setBpm(300);
    expect(useProgressionStore.getState().bpm).toBe(200);
  });

  it('togglePlay flips isPlaying', () => {
    const { togglePlay } = useProgressionStore.getState();
    expect(useProgressionStore.getState().isPlaying).toBe(false);
    togglePlay();
    expect(useProgressionStore.getState().isPlaying).toBe(true);
    togglePlay();
    expect(useProgressionStore.getState().isPlaying).toBe(false);
  });

  it('toggleLoop flips loop', () => {
    const { toggleLoop } = useProgressionStore.getState();
    expect(useProgressionStore.getState().loop).toBe(false);
    toggleLoop();
    expect(useProgressionStore.getState().loop).toBe(true);
    toggleLoop();
    expect(useProgressionStore.getState().loop).toBe(false);
  });

  it('setPlayingIndex updates playing index', () => {
    const { setPlayingIndex } = useProgressionStore.getState();
    setPlayingIndex(3);
    expect(useProgressionStore.getState().playingIndex).toBe(3);
    setPlayingIndex(null);
    expect(useProgressionStore.getState().playingIndex).toBe(null);
  });

  it('addSlot generates voicing data', () => {
    const { addSlot } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    const state = useProgressionStore.getState();
    expect(state.slots[0].voicing.length).toBeGreaterThan(0);
    expect(state.slots[0].voicing[0]).toHaveProperty('midi');
    expect(state.slots[0].voicing[0]).toHaveProperty('velocity');
  });

  it('clearSlots resets isPlaying and playingIndex', () => {
    const { addSlot, togglePlay, setPlayingIndex, clearSlots } = useProgressionStore.getState();
    addSlot(0, 'major7', 'I');
    togglePlay();
    setPlayingIndex(0);
    clearSlots();
    const state = useProgressionStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.playingIndex).toBe(null);
  });
});
