interface ChordNodeProps {
  note: string;
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ChordNode = (props: ChordNodeProps) => {
  const {
    note,
    x,
    y,
    isSelected,
    isHovered,
    onClick,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const radius = isSelected ? 0.12 : 0.09;

  let fill = '#1e293b'; // slate-800
  let stroke = '#475569'; // slate-600
  let textColor = '#94a3b8'; // slate-400
  let fontWeight: 'normal' | 'bold' = 'normal';
  let fontSize = 0.06;

  if (isSelected) {
    fill = '#8b5cf6'; // violet-500
    stroke = '#a78bfa'; // violet-400
    textColor = 'white';
    fontWeight = 'bold';
    fontSize = 0.08;
  } else if (isHovered) {
    stroke = '#94a3b8'; // slate-400
    textColor = '#cbd5e1'; // slate-300
    fill = '#334155'; // slate-700
  }

  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
      style={{ transition: 'all 200ms ease' }}
    >
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={radius + 0.03}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={0.005}
          opacity={0.4}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.01}
        style={{ transition: 'all 200ms ease' }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={fontSize}
        fontWeight={fontWeight}
        className="select-none pointer-events-none"
        style={{ transition: 'all 200ms ease' }}
      >
        {note}
      </text>
    </g>
  );
};

export default ChordNode;
