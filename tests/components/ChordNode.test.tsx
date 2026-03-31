import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import ChordNode from '@/components/ChordNode/ChordNode';

// Helper: wrap SVG components in an <svg> so the DOM is valid
const renderInSvg = (ui: React.ReactElement) =>
  render(<svg>{ui}</svg>);

describe('ChordNode', () => {
  const baseProps = {
    note: 'C',
    x: 0,
    y: -1,
    isSelected: false,
    isHovered: false,
    onClick: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
  };

  it('renders the note label', () => {
    const { getByText } = renderInSvg(<ChordNode {...baseProps} />);
    expect(getByText('C')).toBeInTheDocument();
  });

  it('renders all 12 note names correctly', () => {
    const notes = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
    for (const note of notes) {
      const { getByText } = renderInSvg(
        <ChordNode {...baseProps} note={note} />
      );
      expect(getByText(note)).toBeInTheDocument();
    }
  });

  it('uses slate fill when not selected or hovered', () => {
    const { container } = renderInSvg(<ChordNode {...baseProps} />);
    const circles = container.querySelectorAll('circle');
    // Should have 1 circle (no glow ring for unselected)
    const mainCircle = circles[0];
    expect(mainCircle.getAttribute('fill')).toBe('#1e293b');
    expect(mainCircle.getAttribute('stroke')).toBe('#475569');
  });

  it('uses violet fill and larger radius when selected', () => {
    const { container } = renderInSvg(
      <ChordNode {...baseProps} isSelected={true} />
    );
    const circles = container.querySelectorAll('circle');
    // Selected: glow ring + main circle = 2 circles
    expect(circles.length).toBe(2);
    const mainCircle = circles[1]; // main circle is second
    expect(mainCircle.getAttribute('fill')).toBe('#8b5cf6');
    expect(mainCircle.getAttribute('r')).toBe('0.12');
  });

  it('renders glow ring when selected', () => {
    const { container } = renderInSvg(
      <ChordNode {...baseProps} isSelected={true} />
    );
    const circles = container.querySelectorAll('circle');
    const glowRing = circles[0];
    expect(glowRing.getAttribute('stroke')).toBe('#8b5cf6');
    expect(parseFloat(glowRing.getAttribute('r')!)).toBeCloseTo(0.15, 2); // 0.12 + 0.03
  });

  it('uses brighter stroke when hovered (not selected)', () => {
    const { container } = renderInSvg(
      <ChordNode {...baseProps} isHovered={true} />
    );
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('stroke')).toBe('#94a3b8');
    expect(circle.getAttribute('fill')).toBe('#334155');
  });

  it('has smaller radius when not selected', () => {
    const { container } = renderInSvg(<ChordNode {...baseProps} />);
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('r')).toBe('0.09');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = renderInSvg(
      <ChordNode {...baseProps} onClick={onClick} />
    );
    // Click the text label — event bubbles up to the <g> with the handler
    fireEvent.click(getByText('C'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('fires onMouseEnter and onMouseLeave', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    const { container } = renderInSvg(
      <ChordNode {...baseProps} onMouseEnter={onEnter} onMouseLeave={onLeave} />
    );
    // Use the <g> with cursor-pointer class (the interactive wrapper)
    const g = container.querySelector('g.cursor-pointer')!;
    fireEvent.mouseEnter(g);
    expect(onEnter).toHaveBeenCalledOnce();
    fireEvent.mouseLeave(g);
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it('sets bold font weight when selected', () => {
    const { getByText } = renderInSvg(
      <ChordNode {...baseProps} isSelected={true} />
    );
    const text = getByText('C');
    expect(text.getAttribute('font-weight')).toBe('bold');
  });

  it('uses larger font when selected (0.08 vs 0.06)', () => {
    const { container: selContainer } = renderInSvg(
      <ChordNode {...baseProps} isSelected={true} />
    );
    const selText = selContainer.querySelector('text')!;
    expect(selText.getAttribute('font-size')).toBe('0.08');

    const { container: defContainer } = renderInSvg(
      <ChordNode {...baseProps} isSelected={false} />
    );
    const defText = defContainer.querySelector('text')!;
    expect(defText.getAttribute('font-size')).toBe('0.06');
  });

  it('positions circle and text at the given x/y', () => {
    const { container, getByText } = renderInSvg(
      <ChordNode {...baseProps} x={0.5} y={-0.866} />
    );
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('cx')).toBe('0.5');
    expect(circle.getAttribute('cy')).toBe('-0.866');
    const text = getByText('C');
    expect(text.getAttribute('x')).toBe('0.5');
    expect(text.getAttribute('y')).toBe('-0.866');
  });
});
