import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import CircleMap from '@/components/CircleMap/CircleMap';
import { CIRCLE_OF_FIFTHS } from '@/theory';

// Mock audio module (ChordTooltip imports it)
vi.mock('@/audio', () => ({
  startAudio: vi.fn(),
  isReady: vi.fn(() => true),
  playChord: vi.fn(),
  setReverbMix: vi.fn(),
  getReverbMix: vi.fn(() => 0.3),
}));

describe('CircleMap', () => {
  const baseProps = {
    selectedKey: 0,
    hoveredKey: null as number | null,
    onNodeClick: vi.fn(),
    onNodeHover: vi.fn(),
  };

  it('renders an SVG element', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders all 12 note nodes', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    for (const note of CIRCLE_OF_FIFTHS) {
      const texts = container.querySelectorAll('text');
      const found = Array.from(texts).some(t => t.textContent === note);
      expect(found).toBe(true);
    }
  });

  it('has C at the top (y ≈ -1)', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    // C is index 0, angle = (0*30-90)=-90°, y = sin(-90°) = -1
    const textEls = container.querySelectorAll('text');
    const cText = Array.from(textEls).find(t => t.textContent === 'C')!;
    const y = parseFloat(cText.getAttribute('y')!);
    expect(y).toBeCloseTo(-1, 1);
  });

  it('has G at the 1 o\'clock position', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    // G is index 1, angle = (1*30-90)=-60°
    // x = cos(-60°) ≈ 0.5, y = sin(-60°) ≈ -0.866
    const textEls = container.querySelectorAll('text');
    const gText = Array.from(textEls).find(t => t.textContent === 'G')!;
    const x = parseFloat(gText.getAttribute('x')!);
    const y = parseFloat(gText.getAttribute('y')!);
    expect(x).toBeCloseTo(0.5, 1);
    expect(y).toBeCloseTo(-0.866, 1);
  });

  it('fires onNodeClick when a node is clicked', () => {
    const onNodeClick = vi.fn();
    const { getByText } = render(
      <CircleMap {...baseProps} onNodeClick={onNodeClick} />
    );
    // Click on the G node
    fireEvent.click(getByText('G').closest('g')!);
    expect(onNodeClick).toHaveBeenCalledWith(1); // G = index 1
  });

  it('fires onNodeHover on mouseEnter/mouseLeave', () => {
    const onNodeHover = vi.fn();
    const { getByText } = render(
      <CircleMap {...baseProps} onNodeHover={onNodeHover} />
    );
    const dNode = getByText('D').closest('g')!;
    fireEvent.mouseEnter(dNode);
    expect(onNodeHover).toHaveBeenCalledWith(2); // D = index 2
    fireEvent.mouseLeave(dNode);
    expect(onNodeHover).toHaveBeenCalledWith(null);
  });

  it('highlights the selected node with violet fill', () => {
    const { container } = render(
      <CircleMap {...baseProps} selectedKey={3} /> // A selected
    );
    // Selected node should have violet fill (#8b5cf6)
    const circles = container.querySelectorAll('circle');
    const violetCircles = Array.from(circles).filter(
      c => c.getAttribute('fill') === '#8b5cf6'
    );
    expect(violetCircles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a dashed background ring', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    const circles = container.querySelectorAll('circle');
    const ringCircle = Array.from(circles).find(
      c => c.getAttribute('r') === '1' && c.getAttribute('stroke-dasharray')
    );
    expect(ringCircle).toBeTruthy();
  });

  it('shows tooltip when hoveredKey is set', () => {
    const { container } = render(
      <CircleMap {...baseProps} hoveredKey={5} /> // B hovered
    );
    // Tooltip should have rect for background + text content
    const rects = container.querySelectorAll('rect');
    // Should have at least 1 rect (tooltip background)
    expect(rects.length).toBeGreaterThanOrEqual(1);
    // Should show "Ionian" text from tooltip title
    const texts = container.querySelectorAll('text');
    const ionianText = Array.from(texts).find(t =>
      t.textContent?.includes('Ionian')
    );
    expect(ionianText).toBeTruthy();
  });

  it('does not show tooltip when hoveredKey is null', () => {
    const { container } = render(
      <CircleMap {...baseProps} hoveredKey={null} />
    );
    // No tooltip rects (only circles, no rects)
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(0);
  });

  it('node positions form a circle (all at distance ≈ 1 from center)', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    const textEls = container.querySelectorAll('text');
    
    for (const note of CIRCLE_OF_FIFTHS) {
      const el = Array.from(textEls).find(t => t.textContent === note)!;
      const x = parseFloat(el.getAttribute('x')!);
      const y = parseFloat(el.getAttribute('y')!);
      const dist = Math.sqrt(x * x + y * y);
      expect(dist).toBeCloseTo(1, 1);
    }
  });

  it('uses correct viewBox dimensions', () => {
    const { container } = render(<CircleMap {...baseProps} />);
    const svg = container.querySelector('svg')!;
    const viewBox = svg.getAttribute('viewBox');
    expect(viewBox).toBe('-1.3 -1.3 2.6 2.6');
  });
});
