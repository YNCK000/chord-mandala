import { useState, useRef, useEffect } from 'react';
import type { ProgressionSlot } from '@/store/progressionStore';
import { generateMidiFile } from '@/export/midi';
import { generateChordChart } from '@/export/chordChart';

interface ExportMenuProps {
  slots: ProgressionSlot[];
  bpm: number;
}

export function ExportMenu({ slots, bpm }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const disabled = slots.length === 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportMidi() {
    const blob = generateMidiFile(slots, bpm);
    download(blob, 'chord-mandala.mid');
    setOpen(false);
  }

  function handleExportChart() {
    const text = generateChordChart(slots, bpm);
    const blob = new Blob([text], { type: 'text/markdown' });
    download(blob, 'chord-mandala.md');
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          disabled
            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-800 border-gray-600 text-white hover:border-gray-400 hover:bg-gray-700'
        }`}
      >
        Export ▾
      </button>
      {open && !disabled && (
        <div className="absolute right-0 mt-1 w-48 rounded-lg bg-gray-800 border border-gray-600 shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleExportMidi}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            🎹 Export MIDI
          </button>
          <button
            onClick={handleExportChart}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            📄 Export Chord Chart
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
