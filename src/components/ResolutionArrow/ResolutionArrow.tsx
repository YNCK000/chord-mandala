import { useMemo } from 'react';
import {
  CIRCLE_OF_FIFTHS,
  CHROMATIC_SHARP,
  authenticResolutions,
  plagalResolutions,
  deceptiveResolutions,
  tritoneSubResolutions,
  secondaryDominantResolutions,
} from '@/theory';
import { Resolution, ResolutionType } from '@/theory/types';

interface ResolutionArrowProps {
  /** Selected key circle-of-fifths index (0-11) */
  selectedKey: number;
  /** Get node position by circle index */
  getNodePos: (circleIndex: number) => { x: number; y: number };
}

interface ArrowDef {
  fromCircle: number;
  toCircle: number;
  type: ResolutionType;
  strength: number;
}

const ARROW_COLORS: Record<ResolutionType, string> = {
  authentic: '#f59e0b',   // amber-500
  tritoneSub: '#14b8a6',  // teal-500
  secondary: '#6b7280',   // gray-500
  plagal: '#a855f7',      // purple-500
  deceptive: '#ef4444',   // red-400
};

const ARROW_DASH: Record<ResolutionType, string> = {
  authentic: 'none',
  tritoneSub: '6 4',
  secondary: '4 3',
  plagal: 'none',
  deceptive: '6 4',
};

/**
 * Parse chord ID like "G_dominant7" → { root: "G", quality: "dominant7" }
 */
function parseChordId(id: string): { root: string; quality: string } | null {
  const parts = id.split('_');
  if (parts.length < 2) return null;
  return { root: parts[0], quality: parts.slice(1).join('_') };
}

function rootToCirclePosition(root: string): number {
  return CIRCLE_OF_FIFTHS.indexOf(root as typeof CIRCLE_OF_FIFTHS[number]);
}

const ResolutionArrow = ({ selectedKey, getNodePos }: ResolutionArrowProps) => {
  const selectedNote = CIRCLE_OF_FIFTHS[selectedKey];
  const selectedChromatic = CHROMATIC_SHARP.indexOf(selectedNote);

  const arrows = useMemo<ArrowDef[]>(() => {
    const allResolutions: Resolution[] = [
      ...authenticResolutions(),
      ...plagalResolutions(),
      ...deceptiveResolutions(),
      ...tritoneSubResolutions(),
      ...secondaryDominantResolutions(selectedChromatic),
    ];

    // Build target chord IDs for the selected key
    const targetQualities = ['major', 'minor'];
    const targetIds = targetQualities.map(q => `${selectedNote}_${q}`);

    // Collect unique arrows pointing TO this key
    const arrowMap = new Map<string, ArrowDef>();

    for (const targetId of targetIds) {
      const incoming = allResolutions.filter(r => r.to === targetId);
      for (const res of incoming) {
        const fromParsed = parseChordId(res.from);
        if (!fromParsed) continue;

        const fromCircle = rootToCirclePosition(fromParsed.root);
        const toCircle = selectedKey;
        if (fromCircle < 0 || fromCircle === toCircle) continue;

        const key = `${fromCircle}-${toCircle}-${res.type}`;
        if (!arrowMap.has(key) || (arrowMap.get(key)?.strength ?? 0) < res.strength) {
          arrowMap.set(key, {
            fromCircle,
            toCircle,
            type: res.type,
            strength: res.strength,
          });
        }
      }
    }

    return Array.from(arrowMap.values());
  }, [selectedKey, selectedNote, selectedChromatic]);

  // SVG defs for arrowhead markers
  const markerId = (type: ResolutionType) => `arrowhead-${type}`;

  return (
    <g>
      {/* Arrow markers */}
      <defs>
        {(Object.keys(ARROW_COLORS) as ResolutionType[]).map(type => (
          <marker
            key={type}
            id={markerId(type)}
            markerWidth={0.04}
            markerHeight={0.03}
            refX={0.035}
            refY={0.015}
            orient="auto"
          >
            <polygon
              points={`0,0 0.04,0.015 0,0.03`}
              fill={ARROW_COLORS[type]}
            />
          </marker>
        ))}
      </defs>

      {/* Arrows */}
      {arrows.map((arrow, i) => {
        const from = getNodePos(arrow.fromCircle);
        const to = getNodePos(arrow.toCircle);

        // Shorten line to not overlap nodes
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nodeRadius = 0.12; // selected node radius
        const offset = nodeRadius + 0.01;

        const ux = dx / dist;
        const uy = dy / dist;

        const x1 = from.x + ux * 0.1; // start past source node
        const y1 = from.y + uy * 0.1;
        const x2 = to.x - ux * offset; // end before target node
        const y2 = to.y - uy * offset;

        // Curved path for visual clarity
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        // Perpendicular offset for curve
        const curvature = 0.08;
        const px = -uy * curvature;
        const py = ux * curvature;

        const path = `M ${x1} ${y1} Q ${mx + px} ${my + py} ${x2} ${y2}`;

        return (
          <path
            key={`${arrow.fromCircle}-${arrow.toCircle}-${arrow.type}-${i}`}
            d={path}
            fill="none"
            stroke={ARROW_COLORS[arrow.type]}
            strokeWidth={0.008}
            strokeDasharray={ARROW_DASH[arrow.type]}
            opacity={arrow.strength * 0.8}
            markerEnd={`url(#${markerId(arrow.type)})`}
            style={{ transition: 'opacity 300ms ease' }}
          />
        );
      })}
    </g>
  );
};

export default ResolutionArrow;
