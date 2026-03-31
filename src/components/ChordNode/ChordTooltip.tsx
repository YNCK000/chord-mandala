import { CIRCLE_OF_FIFTHS, CHROMATIC_SHARP, getModeChords, buildSymbol, getBaseIntervals } from '@/theory';
import { ChordQuality } from '@/theory/types';
import { startAudio, isReady, playChord } from '@/audio';
import { voiceRootPosition } from '@/theory/voicing';

interface ChordTooltipProps {
  /** Circle-of-fifths index (0-11) of the hovered node */
  circleIndex: number;
  /** X position in SVG units */
  x: number;
  /** Y position in SVG units */
  y: number;
  /** ViewBox half-extent (e.g. 1.3 for viewBox "-1.3 -1.3 2.6 2.6") */
  viewBoxHalf: number;
}

const QUALITY_COLORS: Record<ChordQuality, string> = {
  major: '#f59e0b',       // amber-500 / gold
  major7: '#f59e0b',
  minor: '#3b82f6',       // blue-500
  minor7: '#3b82f6',
  dominant7: '#eab308',   // yellow-500
  diminished: '#ef4444',  // red-500
  halfDim: '#a855f7',     // purple-500
  augmented: '#f97316',   // orange-500
  sus2: '#06b6d4',        // cyan-500
  sus4: '#06b6d4',
  dim7: '#ef4444',
  minMaj7: '#ec4899',     // pink-500
};

const ChordTooltip = ({ circleIndex, x, y, viewBoxHalf }: ChordTooltipProps) => {
  const noteName = CIRCLE_OF_FIFTHS[circleIndex];
  // Use the note's chromatic index for getModeChords (which expects semitone index)
  const chromaticIndex = CHROMATIC_SHARP.indexOf(noteName);

  const modeChords = getModeChords(chromaticIndex, 'ionian');

  const handleChordClick = async (rootIndex: number, quality: ChordQuality) => {
    if (!isReady()) {
      await startAudio();
    }
    const intervals = getBaseIntervals(quality);
    const voicing = voiceRootPosition(CHROMATIC_SHARP[rootIndex], intervals, 3);
    const midiNotes = voicing.notes.map(n => n.midi);
    playChord(midiNotes, 90, '2n', 20);
  };

  // Position tooltip to the right of the node, with off-screen correction
  const tooltipW = 0.45;
  const tooltipH = modeChords.length * 0.065 + 0.06;
  let tooltipX = x + 0.15;
  let tooltipY = y - tooltipH / 2;

  // Keep within viewBox
  if (tooltipX + tooltipW > viewBoxHalf - 0.05) {
    tooltipX = x - tooltipW - 0.15; // show on left
  }
  if (tooltipY < -viewBoxHalf + 0.05) {
    tooltipY = -viewBoxHalf + 0.05;
  }
  if (tooltipY + tooltipH > viewBoxHalf - 0.05) {
    tooltipY = viewBoxHalf - tooltipH - 0.05;
  }

  return (
    <g className="pointer-events-auto" style={{ transition: 'opacity 150ms ease' }}>
      {/* Tooltip background */}
      <rect
        x={tooltipX}
        y={tooltipY}
        width={tooltipW}
        height={tooltipH}
        rx={0.03}
        ry={0.03}
        fill="#0f172a"
        fillOpacity={0.92}
        stroke="#334155"
        strokeWidth={0.005}
      />

      {/* Title */}
      <text
        x={tooltipX + 0.02}
        y={tooltipY + 0.035}
        fill="#94a3b8"
        fontSize={0.04}
        fontWeight="bold"
        className="select-none"
      >
        {noteName} Ionian
      </text>

      {/* Chord list */}
      {modeChords.map((chord, i) => {
        const cy = tooltipY + 0.07 + i * 0.065;
        const rootName = CHROMATIC_SHARP[chord.rootIndex];
        const symbol = buildSymbol(rootName, chord.quality);
        const color = QUALITY_COLORS[chord.quality] || '#94a3b8';

        return (
          <g
            key={i}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleChordClick(chord.rootIndex, chord.quality);
            }}
          >
            <rect
              x={tooltipX + 0.01}
              y={cy - 0.022}
              width={tooltipW - 0.02}
              height={0.052}
              rx={0.01}
              fill="transparent"
              className="hover:fill-white"
              style={{ transition: 'fill 100ms ease' }}
            />
            {/* Quality dot */}
            <circle
              cx={tooltipX + 0.03}
              cy={cy + 0.004}
              r={0.008}
              fill={color}
            />
            {/* Symbol */}
            <text
              x={tooltipX + 0.05}
              y={cy + 0.008}
              fill="#e2e8f0"
              fontSize={0.04}
              fontFamily="monospace"
              fontWeight="bold"
              className="select-none pointer-events-none"
            >
              {symbol}
            </text>
            {/* Roman numeral */}
            <text
              x={tooltipX + tooltipW - 0.03}
              y={cy + 0.008}
              fill="#64748b"
              fontSize={0.035}
              textAnchor="end"
              className="select-none pointer-events-none"
            >
              {chord.romanNumeral}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default ChordTooltip;
