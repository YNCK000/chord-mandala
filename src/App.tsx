import { useState } from 'react';
import { CHROMATIC_SHARP, getModeChords } from './theory';

function App() {
  const [selectedKey, setSelectedKey] = useState(0); // C

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2">Chord Mandala</h1>
      <p className="text-gray-400 mb-8">Interactive harmonic exploration</p>

      <div className="w-full max-w-4xl aspect-square relative">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full">
          {/* Circle of fifths nodes */}
          {CHROMATIC_SHARP.map((note, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180); // 30° apart, start at top
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            const isSelected = i === selectedKey;

            return (
              <g key={note} onClick={() => setSelectedKey(i)} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 0.12 : 0.09}
                  fill={isSelected ? '#8b5cf6' : '#1e293b'}
                  stroke={isSelected ? '#a78bfa' : '#475569'}
                  strokeWidth={0.01}
                  className="transition-all duration-200"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? 'white' : '#94a3b8'}
                  fontSize={isSelected ? 0.08 : 0.06}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="select-none pointer-events-none"
                >
                  {note}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Key of {CHROMATIC_SHARP[selectedKey]} — Ionian
        </h2>
        <div className="flex gap-2 flex-wrap justify-center">
          {getModeChords(selectedKey, 'ionian').map((chord, i) => {
            const root = CHROMATIC_SHARP[chord.rootIndex];
            return (
              <div
                key={i}
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
              >
                <div className="font-mono font-bold">{root}{chord.quality === 'major7' ? 'maj7' : chord.quality === 'minor7' ? 'm7' : chord.quality === 'dominant7' ? '7' : chord.quality === 'halfDim' ? 'ø7' : ''}</div>
                <div className="text-gray-500 text-xs">{chord.romanNumeral}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
