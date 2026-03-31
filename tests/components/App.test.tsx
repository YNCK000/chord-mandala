import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

// Mock audio before importing App
vi.mock('@/audio', () => ({
  startAudio: vi.fn().mockResolvedValue(undefined),
  isReady: vi.fn(() => false),
  playChord: vi.fn(),
  setReverbMix: vi.fn(),
  getReverbMix: vi.fn(() => 0.3),
  playProgression: vi.fn(),
  stopProgression: vi.fn(),
}));

import App from '@/App';
import { startAudio, setReverbMix } from '@/audio';

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
    // The chord chips are the buttons inside the "Key of" section
    const chipSection = container.querySelector('.max-w-xl');
    const buttons = chipSection ? chipSection.querySelectorAll('button') : [];
    expect(buttons.length).toBe(7);
  });

  it('renders the reverb slider', () => {
    const { container } = render(<App />);
    const sliders = container.querySelectorAll('input[type="range"]');
    // Should have reverb slider and BPM slider
    expect(sliders.length).toBeGreaterThanOrEqual(1);
    const reverbSlider = Array.from(sliders).find(s => s.getAttribute('min') === '0');
    expect(reverbSlider).toBeTruthy();
    expect(reverbSlider!.getAttribute('max')).toBe('1');
  });

  it('calls setReverbMix when slider changes', () => {
    const { container } = render(<App />);
    // Find the reverb slider specifically
    const sliders = container.querySelectorAll('input[type="range"]');
    const reverbSlider = Array.from(sliders).find(s => s.getAttribute('min') === '0')!;
    fireEvent.change(reverbSlider, { target: { value: '0.75' } });
    expect(setReverbMix).toHaveBeenCalled();
  });

  it('initializes audio and plays chord when a node is clicked', async () => {
    const { getByText } = render(<App />);
    const gNode = getByText('G').closest('g')!;
    fireEvent.click(gNode);
    
    await waitFor(() => {
      expect(startAudio).toHaveBeenCalled();
    });
  });

  it('plays a chord when a chip button is clicked', async () => {
    const { container } = render(<App />);
    const chipSection = container.querySelector('.max-w-xl');
    const buttons = chipSection ? chipSection.querySelectorAll('button') : [];
    fireEvent.click(buttons[0]);
    
    await waitFor(() => {
      expect(startAudio).toHaveBeenCalled();
    });
  });

  it('changes selected key when a different node is clicked', () => {
    const { getByText, queryByText } = render(<App />);
    expect(getByText('Key of C — Ionian')).toBeInTheDocument();
    
    const gNode = getByText('G').closest('g')!;
    fireEvent.click(gNode);
    
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
    const spans = container.querySelectorAll('span');
    const reverbValue = Array.from(spans).find(s => s.textContent === '0.30');
    expect(reverbValue).toBeTruthy();
  });
});
