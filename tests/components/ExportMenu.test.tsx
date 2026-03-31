import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportMenu from '../../src/components/ExportMenu/ExportMenu';
import type { ProgressionSlot } from '../../src/store/progressionStore';

// Mock URL methods
const createObjectURLSpy = vi.fn(() => 'blob:mock-url');
const revokeObjectURLSpy = vi.fn();
vi.stubGlobal('URL', {
  ...URL,
  createObjectURL: createObjectURLSpy,
  revokeObjectURL: revokeObjectURLSpy,
});

function makeSlot(): ProgressionSlot {
  return {
    id: 'test',
    rootIndex: 0,
    quality: 'major7',
    symbol: 'Cmaj7',
    romanNumeral: 'I',
    voicing: [{ midi: 60, delayMs: 0, velocity: 100 }],
  };
}

describe('ExportMenu', () => {
  beforeEach(() => {
    createObjectURLSpy.mockClear();
    revokeObjectURLSpy.mockClear();
  });

  it('renders export button', () => {
    render(<ExportMenu slots={[makeSlot()]} bpm={120} />);
    expect(screen.getByText('Export ▾')).toBeTruthy();
  });

  it('is disabled when slots empty', () => {
    render(<ExportMenu slots={[]} bpm={120} />);
    const button = screen.getByText('Export ▾');
    expect(button).toHaveProperty('disabled', true);
  });

  it('renders dropdown buttons when open', () => {
    render(<ExportMenu slots={[makeSlot()]} bpm={120} />);
    fireEvent.click(screen.getByText('Export ▾'));
    expect(screen.getByText('🎹 Export MIDI')).toBeTruthy();
    expect(screen.getByText('📄 Export Chord Chart')).toBeTruthy();
  });

  it('does not render dropdown when disabled', () => {
    render(<ExportMenu slots={[]} bpm={120} />);
    fireEvent.click(screen.getByText('Export ▾'));
    expect(screen.queryByText('Export MIDI')).toBeNull();
  });
});
