import { create } from 'zustand';
import { ChordQuality } from '@/theory/types';
import { CHROMATIC_SHARP, buildSymbol, getBaseIntervals } from '@/theory';
import { voiceRootPosition } from '@/theory/voicing';
import type { VoicedNote } from '@/theory/types';

export interface ProgressionSlot {
  id: string;
  rootIndex: number;
  quality: ChordQuality;
  symbol: string;
  romanNumeral: string;
  voicing: VoicedNote[];
}

interface ProgressionState {
  slots: ProgressionSlot[];
  bpm: number;
  isPlaying: boolean;
  loop: boolean;
  playingIndex: number | null;

  addSlot(rootIndex: number, quality: ChordQuality, romanNumeral: string): void;
  removeSlot(index: number): void;
  reorderSlot(from: number, to: number): void;
  clearSlots(): void;
  setBpm(bpm: number): void;
  togglePlay(): void;
  toggleLoop(): void;
  setPlayingIndex(index: number | null): void;
}

let slotCounter = 0;

export const useProgressionStore = create<ProgressionState>((set) => ({
  slots: [],
  bpm: 120,
  isPlaying: false,
  loop: false,
  playingIndex: null,

  addSlot: (rootIndex, quality, romanNumeral) => {
    const root = CHROMATIC_SHARP[rootIndex];
    const symbol = buildSymbol(root, quality);
    const intervals = getBaseIntervals(quality);
    const voicing = voiceRootPosition(root, intervals, 3);
    const slot: ProgressionSlot = {
      id: `slot-${++slotCounter}-${Date.now()}`,
      rootIndex,
      quality,
      symbol,
      romanNumeral,
      voicing: voicing.notes,
    };
    set((state) => ({ slots: [...state.slots, slot] }));
  },

  removeSlot: (index) => {
    set((state) => ({
      slots: state.slots.filter((_, i) => i !== index),
    }));
  },

  reorderSlot: (from, to) => {
    set((state) => {
      const slots = [...state.slots];
      if (from < 0 || from >= slots.length || to < 0 || to >= slots.length) {
        return state;
      }
      const [moved] = slots.splice(from, 1);
      slots.splice(to, 0, moved);
      return { slots };
    });
  },

  clearSlots: () => set({ slots: [], isPlaying: false, playingIndex: null }),

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(200, bpm)) }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleLoop: () => set((state) => ({ loop: !state.loop })),

  setPlayingIndex: (index) => set({ playingIndex: index }),
}));
