import React, { useState } from 'react';
import type { ProgressionSlot } from '@/store/progressionStore';

interface ProgressionBarProps {
  slots: ProgressionSlot[];
  playingIndex: number | null;
  onRemove(index: number): void;
  onReorder(from: number, to: number): void;
  onPlay(index: number): void;
  onClear(): void;
}

export default function ProgressionBar({
  slots,
  playingIndex,
  onRemove,
  onReorder,
  onPlay,
  onClear,
}: ProgressionBarProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setDragOverIndex(null);
  };

  if (slots.length === 0) {
    return (
      <div
        className="bg-gray-900 rounded-lg border border-dashed border-gray-700 p-4 text-center text-gray-500 text-sm"
        data-testid="progression-empty"
      >
        + Add chords from the circle
      </div>
    );
  }

  return (
    <div
      className="bg-gray-900 rounded-lg border border-gray-800 p-3 flex items-center gap-2 overflow-x-auto"
      data-testid="progression-bar"
    >
      {slots.map((slot, index) => (
        <div
          key={slot.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => setSelectedIndex(index)}
          onDoubleClick={() => onPlay(index)}
          data-testid={`slot-${index}`}
          className={`
            relative group flex-shrink-0 rounded px-3 py-2 cursor-pointer select-none
            transition-colors min-w-[80px]
            ${selectedIndex === index ? 'border-2 border-blue-500 bg-gray-700' : 'border border-gray-700 bg-gray-800'}
            ${playingIndex === index ? 'ring-2 ring-violet-400 bg-violet-900/40' : ''}
            ${dragOverIndex === index ? 'border-dashed border-violet-500' : ''}
            hover:bg-gray-700
          `}
        >
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
              if (selectedIndex === index) setSelectedIndex(null);
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-600 hover:bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${slot.symbol}`}
            data-testid={`remove-${index}`}
          >
            ×
          </button>

          <div className="font-mono font-bold text-white text-sm whitespace-nowrap">
            {slot.symbol}
          </div>
          <div className="text-gray-500 text-xs whitespace-nowrap">
            {slot.romanNumeral}
          </div>
        </div>
      ))}

      {/* Clear All */}
      <button
        onClick={onClear}
        className="flex-shrink-0 px-3 py-2 rounded bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 text-xs transition-colors ml-auto"
        data-testid="clear-all"
      >
        Clear All
      </button>
    </div>
  );
}
