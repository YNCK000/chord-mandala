import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import ResolutionArrow from '@/components/ResolutionArrow/ResolutionArrow';

function getNodePosition(index: number): { x: number; y: number } {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

// Helper to render inside SVG
const renderInSvg = (ui: React.ReactElement) =>
  render(<svg>{ui}</svg>);

describe('ResolutionArrow', () => {
  it('renders SVG path elements for arrows', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    // C should have at least an authentic resolution arrow (from G)
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('renders arrowhead markers in defs', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const markers = container.querySelectorAll('marker');
    // Should define markers for each resolution type
    expect(markers.length).toBeGreaterThanOrEqual(1);
  });

  it('authentic arrow uses amber color (#f59e0b)', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    const amberPaths = Array.from(paths).filter(
      p => p.getAttribute('stroke') === '#f59e0b'
    );
    // G→C is an authentic resolution, should be amber
    expect(amberPaths.length).toBeGreaterThanOrEqual(1);
  });

  it('authentic arrows are solid (no dash)', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    const amberPaths = Array.from(paths).filter(
      p => p.getAttribute('stroke') === '#f59e0b'
    );
    for (const path of amberPaths) {
      const dash = path.getAttribute('stroke-dasharray');
      expect(dash === 'none' || dash === null || dash === '').toBe(true);
    }
  });

  it('generates different arrows for different selected keys', () => {
    const { container: c1 } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const { container: c2 } = renderInSvg(
      <ResolutionArrow selectedKey={6} getNodePos={getNodePosition} />
    );
    const paths1 = c1.querySelectorAll('path');
    const paths2 = c2.querySelectorAll('path');
    // Both should have arrows, but they should point to different nodes
    expect(paths1.length).toBeGreaterThanOrEqual(1);
    expect(paths2.length).toBeGreaterThanOrEqual(1);
    // The path 'd' attributes should differ
    const d1 = Array.from(paths1).map(p => p.getAttribute('d')).sort();
    const d2 = Array.from(paths2).map(p => p.getAttribute('d')).sort();
    expect(d1).not.toEqual(d2);
  });

  it('arrow paths use quadratic curves (Q command)', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    for (const path of Array.from(paths)) {
      const d = path.getAttribute('d')!;
      expect(d).toContain('M');
      expect(d).toContain('Q');
    }
  });

  it('arrows have opacity based on resolution strength', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    for (const path of Array.from(paths)) {
      const opacity = parseFloat(path.getAttribute('opacity')!);
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  });

  it('no arrows point from a node to itself', () => {
    for (let key = 0; key < 12; key++) {
      const { container } = renderInSvg(
        <ResolutionArrow selectedKey={key} getNodePos={getNodePosition} />
      );
      const paths = container.querySelectorAll('path');
      for (const path of Array.from(paths)) {
        const d = path.getAttribute('d')!;
        // Extract M x1 y1 and the endpoint — they shouldn't be the same
        const coords = d.match(/[\d.-]+/g)!.map(Number);
        if (coords.length >= 6) {
          const [x1, y1] = coords.slice(0, 2);
          const [x2, y2] = coords.slice(-2);
          // Start and end shouldn't be identical
          const same = Math.abs(x1 - x2) < 0.001 && Math.abs(y1 - y2) < 0.001;
          expect(same).toBe(false);
        }
      }
    }
  });

  it('each arrow has a markerEnd reference', () => {
    const { container } = renderInSvg(
      <ResolutionArrow selectedKey={0} getNodePos={getNodePosition} />
    );
    const paths = container.querySelectorAll('path');
    for (const path of Array.from(paths)) {
      const marker = path.getAttribute('marker-end');
      expect(marker).toBeTruthy();
      expect(marker).toMatch(/url\(#arrowhead-/);
    }
  });
});
