import { CIRCLE_OF_FIFTHS } from '@/theory';
import ChordNode from '@/components/ChordNode/ChordNode';
import ChordTooltip from '@/components/ChordNode/ChordTooltip';
import ResolutionArrow from '@/components/ResolutionArrow/ResolutionArrow';

interface CircleMapProps {
  selectedKey: number;
  hoveredKey: number | null;
  onNodeClick: (circleIndex: number) => void;
  onNodeHover: (circleIndex: number | null) => void;
}

const VIEWBOX_HALF = 1.3;

function getNodePosition(index: number): { x: number; y: number } {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

const CircleMap = (props: CircleMapProps) => {
  const {
    selectedKey,
    hoveredKey,
    onNodeClick,
    onNodeHover,
  } = props;
  return (
    <svg
      viewBox={`${-VIEWBOX_HALF} ${-VIEWBOX_HALF} ${VIEWBOX_HALF * 2} ${VIEWBOX_HALF * 2}`}
      className="w-full h-full"
    >
      {/* Background ring */}
      <circle
        cx={0}
        cy={0}
        r={1}
        fill="none"
        stroke="#1e293b"
        strokeWidth={0.005}
        strokeDasharray="0.02 0.02"
        opacity={0.5}
      />

      {/* Resolution arrows (drawn behind nodes) */}
      <ResolutionArrow
        selectedKey={selectedKey}
        getNodePos={getNodePosition}
      />

      {/* Nodes */}
      {CIRCLE_OF_FIFTHS.map((note, i) => {
        const pos = getNodePosition(i);
        return (
          <ChordNode
            key={note}
            note={note}
            x={pos.x}
            y={pos.y}
            isSelected={i === selectedKey}
            isHovered={i === hoveredKey}
            onClick={() => onNodeClick(i)}
            onMouseEnter={() => onNodeHover(i)}
            onMouseLeave={() => onNodeHover(null)}
          />
        );
      })}

      {/* Tooltip (drawn on top) */}
      {hoveredKey !== null && (
        <ChordTooltip
          circleIndex={hoveredKey}
          x={getNodePosition(hoveredKey).x}
          y={getNodePosition(hoveredKey).y}
          viewBoxHalf={VIEWBOX_HALF}
        />
      )}
    </svg>
  );
};

export default CircleMap;
