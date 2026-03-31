import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ProgressionBar from '@/components/ProgressionBar/ProgressionBar';
import type { ProgressionSlot } from '@/store/progressionStore';

const makeSlot = (overrides: Partial<ProgressionSlot> = {}): ProgressionSlot => ({
  id: 'test-1',
  rootIndex: 0,
  quality: 'major7',
  symbol: 'Cmaj7',
  romanNumeral: 'I',
  voicing: [],
  ...overrides,
});

describe('ProgressionBar', () => {
  const baseProps = {
    playingIndex: null,
    onRemove: vi.fn(),
    onReorder: vi.fn(),
    onPlay: vi.fn(),
    onClear: vi.fn(),
  };

  it('renders empty state with message', () => {
    const { getByTestId } = render(
      <ProgressionBar slots={[]} {...baseProps} />
    );
    expect(getByTestId('progression-empty')).toBeInTheDocument();
    expect(getByTestId('progression-empty').textContent).toContain('Add chords from the circle');
  });

  it('renders chord slots with symbols', () => {
    const slots = [
      makeSlot({ id: 's1', symbol: 'Cmaj7' }),
      makeSlot({ id: 's2', symbol: 'Dm7', romanNumeral: 'ii' }),
    ];
    const { getByText } = render(
      <ProgressionBar slots={slots} {...baseProps} />
    );
    expect(getByText('Cmaj7')).toBeInTheDocument();
    expect(getByText('Dm7')).toBeInTheDocument();
  });

  it('shows roman numeral for each slot', () => {
    const slots = [
      makeSlot({ id: 's1', symbol: 'Cmaj7', romanNumeral: 'I' }),
      makeSlot({ id: 's2', symbol: 'G7', romanNumeral: 'V' }),
    ];
    const { getByText } = render(
      <ProgressionBar slots={slots} {...baseProps} />
    );
    expect(getByText('I')).toBeInTheDocument();
    expect(getByText('V')).toBeInTheDocument();
  });

  it('click slot fires play callback on double-click', () => {
    const onPlay = vi.fn();
    const slots = [makeSlot({ id: 's1' })];
    const { getByTestId } = render(
      <ProgressionBar slots={slots} {...baseProps} onPlay={onPlay} />
    );
    fireEvent.doubleClick(getByTestId('slot-0'));
    expect(onPlay).toHaveBeenCalledWith(0);
  });

  it('remove button fires remove callback', () => {
    const onRemove = vi.fn();
    const slots = [makeSlot({ id: 's1', symbol: 'Cmaj7' })];
    const { getByTestId } = render(
      <ProgressionBar slots={slots} {...baseProps} onRemove={onRemove} />
    );
    fireEvent.click(getByTestId('remove-0'));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('renders Clear All button', () => {
    const slots = [makeSlot({ id: 's1' })];
    const { getByTestId } = render(
      <ProgressionBar slots={slots} {...baseProps} />
    );
    expect(getByTestId('clear-all')).toBeInTheDocument();
  });

  it('calls onClear when Clear All is clicked', () => {
    const onClear = vi.fn();
    const slots = [makeSlot({ id: 's1' })];
    const { getByTestId } = render(
      <ProgressionBar slots={slots} {...baseProps} onClear={onClear} />
    );
    fireEvent.click(getByTestId('clear-all'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders progression bar when slots exist', () => {
    const slots = [makeSlot({ id: 's1' })];
    const { getByTestId } = render(
      <ProgressionBar slots={slots} {...baseProps} />
    );
    expect(getByTestId('progression-bar')).toBeInTheDocument();
  });
});
