import { Resolution } from './types';
import { CHROMATIC_SHARP } from './notes';
import { getModeChords } from './modes';

// ── Resolution Definitions ─────────────────────────────────

/**
 * Generate all primary resolutions (V7 → I) for all 12 keys.
 */
export function authenticResolutions(): Resolution[] {
  const resolutions: Resolution[] = [];

  for (let i = 0; i < 12; i++) {
    const fifthUp = (i + 7) % 12; // dominant is a 5th above tonic
    resolutions.push({
      from: `${CHROMATIC_SHARP[fifthUp]}_dominant7`,
      to: `${CHROMATIC_SHARP[i]}_major`,
      type: 'authentic',
      strength: 1.0,
    });
    // V7 → i (minor key authentic)
    resolutions.push({
      from: `${CHROMATIC_SHARP[fifthUp]}_dominant7`,
      to: `${CHROMATIC_SHARP[i]}_minor`,
      type: 'authentic',
      strength: 0.9,
    });
  }

  return resolutions;
}

/**
 * Generate plagal resolutions (IV → I) for all 12 keys.
 */
export function plagalResolutions(): Resolution[] {
  const resolutions: Resolution[] = [];

  for (let i = 0; i < 12; i++) {
    const fourthUp = (i + 5) % 12;
    resolutions.push({
      from: `${CHROMATIC_SHARP[fourthUp]}_major`,
      to: `${CHROMATIC_SHARP[i]}_major`,
      type: 'plagal',
      strength: 0.6,
    });
    // IV → i
    resolutions.push({
      from: `${CHROMATIC_SHARP[fourthUp]}_major`,
      to: `${CHROMATIC_SHARP[i]}_minor`,
      type: 'plagal',
      strength: 0.5,
    });
  }

  return resolutions;
}

/**
 * Generate deceptive cadences (V7 → vi) for all 12 keys.
 */
export function deceptiveResolutions(): Resolution[] {
  const resolutions: Resolution[] = [];

  for (let i = 0; i < 12; i++) {
    const fifthUp = (i + 7) % 12;
    // Relative minor root is key + 9 (minor third above... no, minor 6th interval)
    // In key of C: G7 → Am. G = 7, A = 9.
    const viRoot = (i + 9) % 12;
    resolutions.push({
      from: `${CHROMATIC_SHARP[fifthUp]}_dominant7`,
      to: `${CHROMATIC_SHARP[viRoot]}_minor`,
      type: 'deceptive',
      strength: 0.7,
    });
  }

  return resolutions;
}

/**
 * Generate tritone substitutions for V7 → I.
 * Tritone sub: replace V7 with bII7 (e.g., G7 → D♭7 → C)
 */
export function tritoneSubResolutions(): Resolution[] {
  const resolutions: Resolution[] = [];

  for (let i = 0; i < 12; i++) {
    const fifthUp = (i + 7) % 12;
    const tritoneSub = (fifthUp + 6) % 12; // tritone above the dominant

    resolutions.push({
      from: `${CHROMATIC_SHARP[tritoneSub]}_dominant7`,
      to: `${CHROMATIC_SHARP[i]}_major`,
      type: 'tritoneSub',
      strength: 0.85,
    });
    resolutions.push({
      from: `${CHROMATIC_SHARP[tritoneSub]}_dominant7`,
      to: `${CHROMATIC_SHARP[i]}_minor`,
      type: 'tritoneSub',
      strength: 0.8,
    });
  }

  return resolutions;
}

/**
 * Generate secondary dominant resolutions (V/x → x).
 * e.g., in key of C: A7→Dm (V/ii→ii), B7→Em (V/iii→iii), etc.
 */
export function secondaryDominantResolutions(keyRootIndex: number): Resolution[] {
  const resolutions: Resolution[] = [];
  const modeChords = getModeChords(keyRootIndex, 'ionian');

  // Skip degree 0 (I) and degree 4 (V — already primary)
  for (let deg = 1; deg < 7; deg++) {
    const target = modeChords[deg];
    const dominantRoot = (target.rootIndex + 7) % 12; // V of target

    const targetQuality = target.quality === 'major7' ? 'major' :
                          target.quality === 'minor7' ? 'minor' : 'minor';

    resolutions.push({
      from: `${CHROMATIC_SHARP[dominantRoot]}_dominant7`,
      to: `${CHROMATIC_SHARP[target.rootIndex]}_${targetQuality}`,
      type: 'secondary',
      strength: 0.6,
    });
  }

  return resolutions;
}

/**
 * Build complete resolution graph for a given key center.
 */
export function buildResolutionGraph(keyRootIndex: number): Resolution[] {
  return [
    ...authenticResolutions(),
    ...plagalResolutions(),
    ...deceptiveResolutions(),
    ...tritoneSubResolutions(),
    ...secondaryDominantResolutions(keyRootIndex),
  ];
}

/**
 * Get all resolutions FROM a specific chord.
 */
export function getResolutionsFrom(resolutions: Resolution[], fromChordId: string): Resolution[] {
  return resolutions.filter(r => r.from === fromChordId);
}

/**
 * Get all resolutions TO a specific chord.
 */
export function getResolutionsTo(resolutions: Resolution[], toChordId: string): Resolution[] {
  return resolutions.filter(r => r.to === toChordId);
}
