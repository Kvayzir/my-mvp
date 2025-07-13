import { PositionedJourneyIcon } from "@/app/lib/types";
import { ArrowData } from "@/app/hooks/use-arrow-generator";

interface ArrowLayerProps {
  clickedSequence: PositionedJourneyIcon[];
  createArrow: (start: PositionedJourneyIcon, end: PositionedJourneyIcon) => ArrowData;
  getArrowStartPosition: (start: { x: number; y: number }, end: { x: number; y: number }) => { x: number; y: number };
}

export const ArrowLayer: React.FC<ArrowLayerProps> = ({
  clickedSequence,
  createArrow,
  getArrowStartPosition
}) => {
  if (clickedSequence.length < 2) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {clickedSequence.map((icon, index) => {
        if (index === 0) return null;
        
        const prevIcon = clickedSequence[index - 1];
        const { arrowPath, arrowhead } = createArrow(prevIcon, icon);
        const numberPosition = getArrowStartPosition(prevIcon.position, icon.position);
        
        if (!arrowPath || !arrowhead) return null;
        
        return (
          <g key={`arrow-${index}`}>
            <path
              d={arrowPath}
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="10,5"
              fill="none"
              className="animate-pulse"
            />
            <path
              d={arrowhead}
              stroke="#dc2626"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle
              cx={numberPosition.x}
              cy={numberPosition.y}
              r="12"
              fill="#dc2626"
              className="opacity-90"
            />
            <text
              x={numberPosition.x}
              y={numberPosition.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-white"
              style={{ fontSize: '12px' }}
            >
              {index}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
