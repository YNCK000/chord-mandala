import { describe, it, expect } from 'vitest';
import {
  authenticResolutions,
  plagalResolutions,
  deceptiveResolutions,
  tritoneSubResolutions,
  secondaryDominantResolutions,
  buildResolutionGraph,
  getResolutionsFrom,
  getResolutionsTo,
} from '../../src/theory/resolutions';

describe('resolutions', () => {
  it('authentic resolutions have 24 entries (12 keys × 2 qualities)', () => {
    const auth = authenticResolutions();
    expect(auth.length).toBe(24);
  });

  it('authentic resolution G7 → C major exists', () => {
    const auth = authenticResolutions();
    const g7ToC = auth.find(r => r.from === 'G_dominant7' && r.to === 'C_major');
    expect(g7ToC).toBeDefined();
    expect(g7ToC!.type).toBe('authentic');
    expect(g7ToC!.strength).toBe(1.0);
  });

  it('plagal resolutions have 24 entries', () => {
    const plagal = plagalResolutions();
    expect(plagal.length).toBe(24);
  });

  it('plagal resolution F → C major exists', () => {
    const plagal = plagalResolutions();
    const fToC = plagal.find(r => r.from === 'F_major' && r.to === 'C_major');
    expect(fToC).toBeDefined();
    expect(fToC!.type).toBe('plagal');
  });

  it('deceptive resolutions have 12 entries', () => {
    const deceptive = deceptiveResolutions();
    expect(deceptive.length).toBe(12);
  });

  it('deceptive resolution G7 → A minor exists (in key of C)', () => {
    const deceptive = deceptiveResolutions();
    const g7ToAm = deceptive.find(r => r.from === 'G_dominant7' && r.to === 'A_minor');
    expect(g7ToAm).toBeDefined();
    expect(g7ToAm!.type).toBe('deceptive');
  });

  it('tritone sub resolutions have 24 entries', () => {
    const tritone = tritoneSubResolutions();
    expect(tritone.length).toBe(24);
  });

  it('tritone sub Db7 → C major exists', () => {
    const tritone = tritoneSubResolutions();
    const db7ToC = tritone.find(r => r.from === 'C#_dominant7' && r.to === 'C_major');
    expect(db7ToC).toBeDefined();
    expect(db7ToC!.type).toBe('tritoneSub');
  });

  it('secondary dominants generate 6 resolutions per key', () => {
    const secondary = secondaryDominantResolutions(0); // key of C
    expect(secondary.length).toBe(6);
  });

  it('secondary dominant A7 → Dm exists (V/ii in C)', () => {
    const secondary = secondaryDominantResolutions(0);
    const a7ToDm = secondary.find(r => r.from === 'A_dominant7' && r.to === 'D_minor');
    expect(a7ToDm).toBeDefined();
    expect(a7ToDm!.type).toBe('secondary');
  });

  it('buildResolutionGraph returns combined resolutions', () => {
    const graph = buildResolutionGraph(0);
    // 24 + 24 + 12 + 24 + 6 = 90
    expect(graph.length).toBe(90);
  });

  it('getResolutionsFrom filters correctly', () => {
    const graph = buildResolutionGraph(0);
    const fromG7 = getResolutionsFrom(graph, 'G_dominant7');
    expect(fromG7.length).toBeGreaterThan(0);
    expect(fromG7.every(r => r.from === 'G_dominant7')).toBe(true);
  });

  it('getResolutionsTo filters correctly', () => {
    const graph = buildResolutionGraph(0);
    const toC = getResolutionsTo(graph, 'C_major');
    expect(toC.length).toBeGreaterThan(0);
    expect(toC.every(r => r.to === 'C_major')).toBe(true);
  });
});
