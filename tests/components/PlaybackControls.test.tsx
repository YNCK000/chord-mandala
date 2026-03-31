import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import PlaybackControls from '@/components/PlaybackControls/PlaybackControls';

describe('PlaybackControls', () => {
  const baseProps = {
    bpm: 120,
    onBpmChange: vi.fn(),
    isPlaying: false,
    onPlayToggle: vi.fn(),
    loop: false,
    onLoopToggle: vi.fn(),
  };

  it('renders BPM display', () => {
    const { getByTestId } = render(<PlaybackControls {...baseProps} />);
    expect(getByTestId('bpm-display').textContent).toBe('120');
  });

  it('renders BPM slider with range 40-200', () => {
    const { getByTestId } = render(<PlaybackControls {...baseProps} />);
    const slider = getByTestId('bpm-slider');
    expect(slider.getAttribute('min')).toBe('40');
    expect(slider.getAttribute('max')).toBe('200');
  });

  it('BPM slider fires onBpmChange', () => {
    const onBpmChange = vi.fn();
    const { getByTestId } = render(
      <PlaybackControls {...baseProps} onBpmChange={onBpmChange} />
    );
    fireEvent.change(getByTestId('bpm-slider'), { target: { value: '160' } });
    expect(onBpmChange).toHaveBeenCalledWith(160);
  });

  it('play button fires onPlayToggle', () => {
    const onPlayToggle = vi.fn();
    const { getByTestId } = render(
      <PlaybackControls {...baseProps} onPlayToggle={onPlayToggle} />
    );
    fireEvent.click(getByTestId('play-button'));
    expect(onPlayToggle).toHaveBeenCalled();
  });

  it('play button shows ▶ when not playing', () => {
    const { getByTestId } = render(
      <PlaybackControls {...baseProps} isPlaying={false} />
    );
    expect(getByTestId('play-button').textContent).toContain('▶');
  });

  it('play button shows ⏸ when playing', () => {
    const { getByTestId } = render(
      <PlaybackControls {...baseProps} isPlaying={true} />
    );
    expect(getByTestId('play-button').textContent).toContain('⏸');
  });

  it('loop button fires onLoopToggle', () => {
    const onLoopToggle = vi.fn();
    const { getByTestId } = render(
      <PlaybackControls {...baseProps} onLoopToggle={onLoopToggle} />
    );
    fireEvent.click(getByTestId('loop-button'));
    expect(onLoopToggle).toHaveBeenCalled();
  });

  it('loop button shows Loop text', () => {
    const { getByTestId } = render(<PlaybackControls {...baseProps} />);
    expect(getByTestId('loop-button').textContent).toContain('Loop');
  });
});
