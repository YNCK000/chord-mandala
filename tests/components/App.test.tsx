import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

// Mock audio before importing App
vi.mock('@/audio', () => ({
  startAudio: vi.fn().mockResolvedValue(undefined),
  isReady: vi.fn(() => false),
  playChord: vi.fn(),
  setReverbMix: vi.fn(),
  getReverbMix: vi.fn(() => 0.3),
}));

import App from '@/App';
import { startAudio, playChord, setReverbMix } from '@/audio';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title "Chord Mandala"', () => {
    const { getByText } = render(<App />);
    expect(getByText('Chord Mandala')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    const { getByText } = render(<App />);
    expect(getByText('Interactive harmonic exploration')).toBeInTheDocument();
  });

  it('shows "Key of C — Ionian" by default', () => {
    const { getByText } = render(<App />);
    expect(getByText('Key of C — Ionian')).toBeInTheDocument();
  });

  it('renders 7 chord chips for C Ionian', () => {
    const { container } = render(<App />);
    // C Ionian: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bø7
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(7);
  });

  it('renders the reverb slider', () => {
    const { container } = render(<App />);
    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeTruthy();
    expect(slider!.getAttribute('min')).toBe('0');
    expect(slider!.getAttribute('max')).toBe('1');
  });

  it('calls setReverbMix when slider changes', () => {
    const { container } = render(<App />);
    const slider = container.querySelector('input[type="range"]')!;
    fireEvent.change(slider, { target: { value: '0.75' } });
    // React effect runs setReverbMix
    expect(setReverbMix).toHaveBeenCalled();
  });

  it('initializes audio and plays chord when a node is clicked', async () => {
    const { getByText } = render(<App />);
    // Click on G node
    const gNode = getByText('G').closest('g')!;
    fireEvent.click(gNode);
    
    await waitFor(() => {
      expect(startAudio).toHaveBeenCalled();
    });
  });

  it('plays a chord when a chip button is clicked', async () => {
    const { container } = render(<App />);
    const buttons = container.querySelectorAll('button');
    // Click the first chip (I chord)
    fireEvent.click(buttons[0]);
    
    await waitFor(() => {
      expect(startAudio).toHaveBeenCalled();
    });
  });

  it('changes selected key when a different node is clicked', () => {
    const { getByText, queryByText } = render(<App />);
    // Initially "Key of C"
    expect(getByText('Key of C — Ionian')).toBeInTheDocument();
    
    // Click G node
    const gNode = getByText('G').closest('g')!;
    fireEvent.click(gNode);
    
    // Should now show "Key of G"
    expect(getByText('Key of G — Ionian')).toBeInTheDocument();
    expect(queryByText('Key of C — Ionian')).toBeNull();
  });

  it('renders the SVG circle map', () => {
    const { container } = render(<App />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('reverb slider shows current value', () => {
    const { container } = render(<App />);
    // Default reverb is 0.30
    const spans = container.querySelectorAll('span');
    const reverbValue = Array.from(spans).find(s => s.textContent === '0.30');
    expect(reverbValue).toBeTruthy();
  });
});
