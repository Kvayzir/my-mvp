import { JourneyIconEntry, JourneyMapProps } from "@/app/lib/types";
import JourneyIcon from "./journey-icon";
import { useState, useCallback, useEffect } from "react";

// Extended type to include position information
interface PositionedJourneyIcon extends JourneyIconEntry {
  position: { x: number; y: number };
  id: string;
  ring: number; // Add ring information for visibility logic
  itemIndex: number; // Add itemIndex for id generation
}

export default function JourneyMap(props: JourneyMapProps) {
  // State to track the sequence of clicked icons
  const [clickedSequence, setClickedSequence] = useState<PositionedJourneyIcon[]>([]);
  // State to store all calculated icon positions
  const [allIconPositions, setAllIconPositions] = useState<PositionedJourneyIcon[]>([]);

  // Configuration for concentric circles
  const journeyData = [
    // Inner circle (center)
    {
      ring: 0,
      items: [
        { name: "Your Journey", type: "goal", color: "purple", size: "lg", onClick: () => props.onSetLevel("goal") } as JourneyIconEntry
      ]
    },
    // First ring
    {
      ring: 1,
      items: [
        { name: "Célula Vegetal", type: "nature", color: "green", onClick: () => props.onSetLevel("cellVeg") } as JourneyIconEntry,
        { name: "Célula Animal", type: "biology", color: "pink", onClick: () => props.onSetLevel("cellAn") } as JourneyIconEntry,
        { name: "Energía", type: "magic", color: "orange", onClick: () => props.onSetLevel("energy") } as JourneyIconEntry,
        { name: "Partes de la Célula", type: "mystery", color: "red", onClick: () => props.onSetLevel("parts") }   as JourneyIconEntry
      ]
    },
    // Second ring
    {
      ring: 2,
      items: [
        { name: "History Journey", type: "history", color: "blue", onClick: () => props.onSetLevel("history") } as JourneyIconEntry,
        { name: "Science Journey", type: "science", color: "yellow", onClick: () => props.onSetLevel("science") } as JourneyIconEntry,
        { name: "Mystery Journey", type: "mystery", color: "indigo", onClick: () => props.onSetLevel("mystery") } as JourneyIconEntry,
      ]
    }
  ];

  // Function to calculate position of items in a circle
  const getCircularPosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / total + Math.PI / 2; // Start at the top
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  // Ring configurations
  const ringConfig: { [key: number]: { radius: number; color: string } } = {
    0: { radius: 0, color: 'bg-red-100' },
    1: { radius: 100, color: 'bg-blue-100' },
    2: { radius: 200, color: 'bg-purple-100' }
  };

  // Calculate and store all icon positions once on mount
  useEffect(() => {
    const positions: PositionedJourneyIcon[] = [];
    journeyData.forEach((ringData) => {
      ringData.items.forEach((item, index) => {
        const { x, y } = getCircularPosition(
          index,
          ringData.items.length,
          ringConfig[ringData.ring < 3 ? ringData.ring : 0].radius
        );
        // Calculate absolute position for arrow drawing (center of 600x600 container)
        const absolutePosition = {
          x: 300 + x, // 300 is half of the 600px width
          y: 216 + y  // 216 is half of the 432px height (approx 600/2 - (600-432)/2)
        };
        positions.push({
          ...item,
          position: absolutePosition,
          id: `${ringData.ring}-${index}`,
          ring: ringData.ring,
          itemIndex: index,
        });
      });
    });
    setAllIconPositions(positions);
  }, []); // Empty dependency array means this runs once on mount

  // Enhanced click handler that tracks sequence and draws arrows
  const handleIconClick = useCallback((item: JourneyIconEntry, position: { x: number; y: number }, ringIndex: number, itemIndex: number) => {
    const iconId = `${ringIndex}-${itemIndex}`;
    
    // Create positioned icon object
    const positionedIcon: PositionedJourneyIcon = {
      ...item,
      position,
      id: iconId,
      ring: ringIndex,
      itemIndex: itemIndex,
    };

    // Check if this icon was already clicked
    setClickedSequence(prev => {
      const isAlreadyClicked = prev.some(clicked => clicked.id === iconId);
      if (!isAlreadyClicked) {
        return [...prev, positionedIcon];
      }
      return prev;
    });

    // Call the original onClick handler
    if (item.onClick) {
      item.onClick();
    }
  }, []);

  // Helper function to calculate the shortest distance from a point to a line segment
  // Used to detect if an icon is "in the way" of a straight arrow path
  function pointToLineSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
      const L2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      if (L2 === 0) return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2)); // v == w case

      const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2;
      let closestX, closestY;
      if (t < 0) {
          closestX = x1;
          closestY = y1;
      } else if (t > 1) {
          closestX = x2;
          closestY = y2;
      } else {
          closestX = x1 + t * (x2 - x1);
          closestY = y1 + t * (y2 - y1);
      }
      return Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
  }

  // Function to create arrow path between two points with improved logic
  const createArrow = useCallback((startIcon: PositionedJourneyIcon, endIcon: PositionedJourneyIcon): { arrowPath: string; arrowhead: string } => {
    const start = startIcon.position;
    const end = endIcon.position;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const iconRadius = 48 / 2; // Assuming JourneyIcon has a diameter of 48px (size 'md')
    const collisionBuffer = iconRadius + 10; // Buffer around icons for collision detection

    // Case 1: Distance too short, force a small curve
    if (distance < collisionBuffer * 3) { // If icons are very close, force a curve
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const angle = Math.atan2(dy, dx);
      const perpendicularAngle = angle + Math.PI / 2;
      const curveOffset = 30; // Small offset for short curves
      const controlX = midX + Math.cos(perpendicularAngle) * curveOffset;
      const controlY = midY + Math.sin(perpendicularAngle) * curveOffset;

      const startX = start.x + Math.cos(angle) * iconRadius;
      const startY = start.y + Math.sin(angle) * iconRadius;
      const endX = end.x - Math.cos(angle) * iconRadius;
      const endY = end.y - Math.sin(angle) * iconRadius;

      // Arrowhead calculation adjusted for curve
      const endAngle = Math.atan2(endY - controlY, endX - controlX);
      const arrowSize = 12;
      const arrowAngle1 = endAngle + Math.PI * 0.75;
      const arrowAngle2 = endAngle - Math.PI * 0.75;
      
      const arrowX1 = endX + Math.cos(arrowAngle1) * arrowSize;
      const arrowY1 = endY + Math.sin(arrowAngle1) * arrowSize;
      const arrowX2 = endX + Math.cos(arrowAngle2) * arrowSize;
      const arrowY2 = endY + Math.sin(arrowAngle2) * arrowSize;

      const arrowPath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      const arrowhead = `M ${arrowX1} ${arrowY1} L ${endX} ${endY} L ${arrowX2} ${arrowY2}`;
      return { arrowPath, arrowhead };
    }

    const centerOfMap = { x: 300, y: 216 }; // Center of your SVG container

    let curveRequired = false;

    // Check for intervening icons (excluding start and end icons)
    for (const otherIcon of allIconPositions) {
      if (otherIcon.id === startIcon.id || otherIcon.id === endIcon.id) continue;

      const distToLineSegment = pointToLineSegmentDistance(
        otherIcon.position.x, otherIcon.position.y,
        start.x, start.y,
        end.x, end.y
      );

      if (distToLineSegment < collisionBuffer) {
        curveRequired = true;
        break; // Found an intervening icon, force curve
      }
    }

    // Check if the straight line path crosses near the map center
    const distMidpointToCenter = Math.sqrt(Math.pow((start.x + end.x) / 2 - centerOfMap.x, 2) + Math.pow((start.y + end.y) / 2 - centerOfMap.y, 2));
    if (distMidpointToCenter < 120) { // Threshold for considering crossing the center
      curveRequired = true;
    }

    let controlX, controlY;
    const angle = Math.atan2(dy, dx);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    if (curveRequired) {
      // If there's an intervening icon or it crosses the center, curve away from the center
      const vectorX = midX - centerOfMap.x;
      const vectorY = midY - centerOfMap.y;
      const vectorMagnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
      
      const extendFactor = 1.5; // How much to push the control point away
      const curveOffsetFactor = Math.max(distance * 0.1, 50); // Ensure a minimum curve
      
      if (vectorMagnitude > 0) {
        controlX = centerOfMap.x + (vectorX / vectorMagnitude) * (vectorMagnitude + curveOffsetFactor * extendFactor);
        controlY = centerOfMap.y + (vectorY / vectorMagnitude) * (vectorMagnitude + curveOffsetFactor * extendFactor);
      } else { // If start and end are at the center, just pick a perpendicular direction
        controlX = midX + Math.cos(angle + Math.PI / 2) * curveOffsetFactor;
        controlY = midY + Math.sin(angle + Math.PI / 2) * curveOffsetFactor;
      }
    } else {
      // Straight line path (no curve needed)
      controlX = midX;
      controlY = midY;
    }

    // Offset start and end points to avoid overlapping with icons
    const startOffset = iconRadius;
    const endOffset = iconRadius;
    const startX = start.x + Math.cos(angle) * startOffset;
    const startY = start.y + Math.sin(angle) * startOffset;
    const endX = end.x - Math.cos(angle) * endOffset;
    const endY = end.y - Math.sin(angle) * endOffset;

    // Arrowhead calculation
    const endAngle = Math.atan2(endY - controlY, endX - controlX);
    const arrowSize = 12;
    const arrowAngle1 = endAngle + Math.PI * 0.75;
    const arrowAngle2 = endAngle - Math.PI * 0.75;
    
    const arrowX1 = endX + Math.cos(arrowAngle1) * arrowSize;
    const arrowY1 = endY + Math.sin(arrowAngle1) * arrowSize;
    const arrowX2 = endX + Math.cos(arrowAngle2) * arrowSize;
    const arrowY2 = endY + Math.sin(arrowAngle2) * arrowSize;

    // Use quadratic Bezier curve if a curve is required, otherwise a straight line
    const arrowPath = curveRequired ? `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}` : `M ${startX} ${startY} L ${endX} ${endY}`;
    const arrowhead = `M ${arrowX1} ${arrowY1} L ${endX} ${endY} L ${arrowX2} ${arrowY2}`;
    return { arrowPath, arrowhead };
  }, [allIconPositions]); // Dependency on allIconPositions

  // Function to get the starting position of an arrow for number placement
  const getArrowStartPosition = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return start;
    
    const angle = Math.atan2(dy, dx);
    
    // Position number slightly ahead of the start point
    const offset = 45; // Slightly more than icon offset
    const numberX = start.x + Math.cos(angle) * offset;
    const numberY = start.y + Math.sin(angle) * offset;
    
    return { x: numberX, y: numberY };
  }, []);

  // Function to reset the arrow sequence
  const resetArrows = () => {
    setClickedSequence([]);
  };

  // Determine visibility of icons based on props.state
  const isRingVisible = useCallback((ring: number) => {
    switch (props.state) {
      case 'start':
        return ring === 2;
      case 'in progress':
        return ring === 1 || ring === 2;
      case 'end':
        return ring === 0 || ring === 1 || ring === 2;
      default:
        return false;
    }
  }, [props.state]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-transparent">
      <h1 className="text-3xl font-bold text-gray-700 mb-8 text-center z-1">Journey Map</h1>

      {/* Circular Journey Map Container */}
      <div className="relative flex items-center justify-center" style={{ width: '600px', height: '600px' }}>
        
        {/* Concentric Circle Backgrounds */}
        {Object.entries(ringConfig).reverse().map(([ring, config]) => (
          <div
              key={ring}
              className={`absolute rounded-full border-2 border-dashed border-opacity-30 ${config.color} bg-opacity-10`}
              style={{
                  width: `${config.radius * 2 + 96}px`,
                  height: `${config.radius * 2 + 96}px`,
                  borderColor: config.color.replace('bg-', '').replace('-100', '-300'),
                  left: `50%`,
                  top: `50%`,
                  transform: `translate(-50%, -50%)`,
              }}
            />
        ))}
        
        {/* Journey Icons */}
        {journeyData.map((ringData: { ring: number; items: JourneyIconEntry[] }) => (
          <div key={ringData.ring}>
            {ringData.items.map((item: JourneyIconEntry, index: number) => {
              const { x, y } = getCircularPosition(
                index, 
                ringData.items.length, 
                ringConfig[ringData.ring < 3 ? ringData.ring : 0].radius
              );
              
              // Calculate absolute position for arrow drawing (center of 600x600 container)
              const absolutePosition = { 
                x: 300 + x, 
                y: 216 + y 
              };
              
              // Determine if this icon should be visible
              const isVisible = isRingVisible(ringData.ring);
              
              // Check if this icon has been clicked
              const isClicked = clickedSequence.some(clicked => clicked.id === `${ringData.ring}-${index}`);
              
              // Special handling for Ring 0 (Goal) based on state
              if (ringData.ring === 0) {
                if (props.state !== 'end') {
                  // Show "Goal" text when not in 'end' state
                  return (
                    <div
                      key={`${ringData.ring}-${index}`}
                      className={`absolute ${isVisible ? '' : 'hidden'}`}
                      style={{
                          left: `50%`,
                          top: `50%`,
                          transform: `translate(-50%, -50%)`,
                          color: 'white', // Or a color that stands out on the background
                      }}
                    > Goal </div>
                  );
                } else if (props.state === 'end') {
                    // When state is 'end', show the actual JourneyIcon for the goal
                    return (
                      <div
                        key={`${ringData.ring}-${index}`}
                        className={`absolute ${isVisible ? '' : 'hidden'}`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: `translate(-50%, -50%)`
                        }}
                      >
                        <div className={`${isClicked ? 'ring-2 ring-blue-400 ring-opacity-75 rounded-full' : ''}`}>
                          <JourneyIcon
                            name={item.name}
                            type={item.type}
                            color={item.color}
                            size={item.size || 'md'}
                            onClick={() => handleIconClick(item, absolutePosition, ringData.ring, index)}
                          />
                        </div>
                      </div>
                    );
                }
              }

              // For other rings, render JourneyIcon conditionally
              return (
                <div
                  key={`${ringData.ring}-${index}`}
                  className={`absolute ${isVisible ? '' : 'hidden'}`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%)`
                  }}
                >
                  <div className={`${isClicked ? 'ring-2 ring-blue-400 ring-opacity-75 rounded-full' : ''}`}>
                    <JourneyIcon
                      name={item.name}
                      type={item.type}
                      color={item.color}
                      size={item.size || 'md'}
                      onClick={() => handleIconClick(item, absolutePosition, ringData.ring, index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Center Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-indigo-100 via-transparent to-transparent opacity-20 pointer-events-none" />
        
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>         
          {/* Dynamic Arrow Paths */}
          {clickedSequence.length > 1 && clickedSequence.map((icon, index) => {
            if (index === 0) return null; // Skip first icon as it has no predecessor
            
            const prevIcon = clickedSequence[index - 1];
            // Pass allIconPositions to createArrow for collision detection
            const {arrowPath, arrowhead} = createArrow(prevIcon, icon);
            const numberPosition = getArrowStartPosition(prevIcon.position, icon.position);
            
            if (!arrowPath || !arrowhead) return null;
            
            return (
              <g key={`arrow-${index}`}>
                {/* Arrow path */}
                <path
                  d={arrowPath}
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Arrowhead */}
                <path
                  d={arrowhead}
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Sequence number */}
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
        
      </div>
      
      {/* Legend */}
      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-100 rounded-full mr-1 border border-red-300"></div>
            Center
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 rounded-full mr-1 border border-blue-300"></div>
            Core Journeys
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-purple-100 rounded-full mr-1 border border-purple-300"></div>
            Introduction
          </span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetArrows}
        className="absolute px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        style={{
            left: `15%`,
            top: `7%`,
            transform: `translate(-50%, -50%)`
        }}
      >
        Reset Arrows ({clickedSequence.length} clicked)
      </button>

    </div>
  );
}
