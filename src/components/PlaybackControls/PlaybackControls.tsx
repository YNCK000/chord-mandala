interface PlaybackControlsProps {
  bpm: number;
  onBpmChange(bpm: number): void;
  isPlaying: boolean;
  onPlayToggle(): void;
  loop: boolean;
  onLoopToggle(): void;
  disabled?: boolean;
}

export default function PlaybackControls({
  bpm,
  onBpmChange,
  isPlaying,
  onPlayToggle,
  loop,
  onLoopToggle,
  disabled,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap" data-testid="playback-controls">
      {/* BPM */}
      <div className="flex items-center gap-2">
        <label htmlFor="bpm-slider" className="text-gray-400 text-sm whitespace-nowrap">
          BPM: <span className="text-white font-mono" data-testid="bpm-display">{bpm}</span>
        </label>
        <input
          id="bpm-slider"
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          className="w-24 sm:w-32 accent-violet-500"
          data-testid="bpm-slider"
        />
      </div>

      {/* Play / Pause */}
      <button
        onClick={onPlayToggle}
        disabled={disabled}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-4 py-2 text-white font-medium transition-colors"
        data-testid="play-button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* Loop */}
      <button
        onClick={onLoopToggle}
        className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
          loop
            ? 'bg-violet-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        data-testid="loop-button"
        aria-pressed={loop}
      >
        ↺ Loop
      </button>
    </div>
  );
}
