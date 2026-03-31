import { useEffect } from 'react';
import { CIRCLE_OF_FIFTHS, CHROMATIC_SHARP, getModeChords, buildSymbol, getBaseIntervals } from '@/theory';
import { ChordQuality } from '@/theory/types';
import { startAudio, isReady, playChord, setReverbMix, playProgression, stopProgression } from '@/audio';
import { voiceRootPosition } from '@/theory/voicing';
import CircleMap from '@/components/CircleMap/CircleMap';
import ProgressionBar from '@/components/ProgressionBar/ProgressionBar';
import PlaybackControls from '@/components/PlaybackControls/PlaybackControls';
import ExportMenu from '@/components/ExportMenu/ExportMenu';
import { useProgressionStore } from '@/store/progressionStore';
import { useState } from 'react';

function App() {
  const [selectedKey, setSelectedKey] = useState(0);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [reverb, setReverb] = useState(0.3);
  const [audioReady, setAudioReady] = useState(false);

  const {
    slots,
    bpm,
    isPlaying,
    loop,
    playingIndex,
    addSlot,
    removeSlot,
    reorderSlot,
    clearSlots,
    setBpm,
    togglePlay,
    toggleLoop,
    setPlayingIndex,
  } = useProgressionStore();

  const noteName = CIRCLE_OF_FIFTHS[selectedKey];
  const chromaticIndex = CHROMATIC_SHARP.indexOf(noteName);
  const modeChords = getModeChords(chromaticIndex, 'ionian');

  useEffect(() => {
    const initAudio = async () => {
      if (!audioReady && isReady()) {
        setAudioReady(true);
      }
    };
    initAudio();
  }, [audioReady]);

  useEffect(() => {
    setReverbMix(reverb);
  }, [reverb]);

  // Handle play/stop progression
  useEffect(() => {
    if (!isPlaying || slots.length === 0) return;

    const playSlots = slots.map((slot) => ({
      voicing: slot.voicing,
      duration: 1,
    }));

    // Set up Tone.Transport callback to track playing index
    let currentIndex = 0;
    const interval = setInterval(() => {
      setPlayingIndex(currentIndex);
      currentIndex++;
      if (currentIndex >= slots.length) {
        if (loop) {
          currentIndex = 0;
        } else {
          clearInterval(interval);
          setPlayingIndex(null);
          togglePlay();
        }
      }
    }, (60 / bpm) * 1000);

    playProgression(playSlots, bpm);

    return () => {
      clearInterval(interval);
      stopProgression();
      setPlayingIndex(null);
    };
  }, [isPlaying, slots, bpm, loop]);

  const handleNodeClick = async (circleIndex: number) => {
    setSelectedKey(circleIndex);

    if (!audioReady) {
      try {
        await startAudio();
        setAudioReady(true);
      } catch (e) {
        console.warn('Audio init failed:', e);
        return;
      }
    }

    // Add the I chord to progression
    const iChord = modeChords[0];
    addSlot(iChord.rootIndex, iChord.quality, iChord.romanNumeral);

    // Also play it for feedback
    const intervals = getBaseIntervals(iChord.quality);
    const voicing = voiceRootPosition(CHROMATIC_SHARP[iChord.rootIndex], intervals, 3);
    const midiNotes = voicing.notes.map((n) => n.midi);
    playChord(midiNotes, 90, '2n', 20);
  };

  const handleChordClick = async (rootIndex: number, quality: ChordQuality, romanNumeral: string) => {
    if (!audioReady) {
      try {
        await startAudio();
        setAudioReady(true);
      } catch (e) {
        console.warn('Audio init failed:', e);
        return;
      }
    }

    // Add to progression
    addSlot(rootIndex, quality, romanNumeral);

    // Play for feedback
    const intervals = getBaseIntervals(quality);
    const voicing = voiceRootPosition(CHROMATIC_SHARP[rootIndex], intervals, 3);
    const midiNotes = voicing.notes.map((n) => n.midi);
    playChord(midiNotes, 90, '2n', 20);
  };

  const handlePlaySlot = async (index: number) => {
    if (!audioReady) {
      try {
        await startAudio();
        setAudioReady(true);
      } catch (e) {
        console.warn('Audio init failed:', e);
        return;
      }
    }

    const slot = slots[index];
    if (slot) {
      const midiNotes = slot.voicing.map((n) => n.midi);
      playChord(midiNotes, 90, '2n', 20);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Chord Mandala</h1>
      <p className="text-gray-400 mb-4 sm:mb-8">Interactive harmonic exploration</p>

      <div className="w-full max-w-2xl sm:max-w-3xl aspect-square relative">
        <CircleMap
          selectedKey={selectedKey}
          hoveredKey={hoveredKey}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredKey}
        />
      </div>

      {/* Selected key info */}
      <div className="mt-6 sm:mt-8 text-center max-w-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">
          Key of {noteName} — Ionian
        </h2>
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {modeChords.map((chord, i) => {
            const root = CHROMATIC_SHARP[chord.rootIndex];
            const symbol = buildSymbol(root, chord.quality);
            return (
              <button
                key={i}
                onClick={() => handleChordClick(chord.rootIndex, chord.quality, chord.romanNumeral)}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                <div className="font-mono font-bold">{symbol}</div>
                <div className="text-gray-500 text-xs">{chord.romanNumeral}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progression Bar */}
      <div className="w-full max-w-3xl mt-6">
        <ProgressionBar
          slots={slots}
          playingIndex={playingIndex}
          onRemove={removeSlot}
          onReorder={reorderSlot}
          onPlay={handlePlaySlot}
          onClear={clearSlots}
        />
      </div>

      {/* Playback Controls */}
      <div className="mt-4 flex items-center gap-4">
        <PlaybackControls
          bpm={bpm}
          onBpmChange={setBpm}
          isPlaying={isPlaying}
          onPlayToggle={togglePlay}
          loop={loop}
          onLoopToggle={toggleLoop}
          disabled={slots.length === 0}
        />
        <ExportMenu slots={slots} bpm={bpm} />
      </div>

      {/* Reverb control */}
      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="reverb" className="text-gray-400 text-sm">
          Reverb
        </label>
        <input
          id="reverb"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={reverb}
          onChange={(e) => setReverb(parseFloat(e.target.value))}
          className="w-24 sm:w-32 accent-violet-500"
        />
        <span className="text-gray-400 text-sm w-12">{reverb.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default App;
