import { useCallback, useEffect } from "react";
import { JourneyMapProps, PositionedJourneyIcon } from "@/app/lib/types";
import { 
  getCircularPosition, 
  getAbsolutePosition 
} from "@/app/lib/utils/journey-map-utils";
import { 
  JOURNEY_DATA, 
  RING_CONFIG, 
  JOURNEY_MAP_CONFIG 
} from "@/app/lib/constants/journey-map-constants";
import { RingBackground } from "./ring-background";
import { JourneyIconWrapper } from "./journey-icon-wrapper";
import { MapLegend } from "./map-legend";

export default function JourneyMap(props: JourneyMapProps) {
  const setAllIconPositions = props.updateAllIconPositions ? props.updateAllIconPositions : () => {};

  // Calculate and store all icon positions once on mount
  useEffect(() => {
    const positions: PositionedJourneyIcon[] = [];
    
    JOURNEY_DATA.forEach((ringData) => {
      ringData.items.forEach((item, index) => {
        const ringConfig = RING_CONFIG[ringData.ring as keyof typeof RING_CONFIG];
        const relativePos = getCircularPosition(index, ringData.items.length, ringConfig.radius);
        const absolutePos = getAbsolutePosition(relativePos);
        
        positions.push({
          ...item,
          onClick: () => props.onSetLevel ? props.onSetLevel(item.level) : console.log("onSetLevel not provided"),
          position: absolutePos,
          id: `${ringData.ring}-${index}`,
          ring: ringData.ring,
          itemIndex: index,
        });
      });
    });
    
    setAllIconPositions(positions);
  }, [props.onSetLevel]);

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
      <h1 className="text-3xl font-bold text-gray-700 mb-8 text-center z-1">
        Journey Map
      </h1>

      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: `${JOURNEY_MAP_CONFIG.CONTAINER_SIZE.width}px`, 
          height: `${JOURNEY_MAP_CONFIG.CONTAINER_SIZE.height}px` 
        }}
      >
        {/* Ring Backgrounds */}
        {Object.keys(RING_CONFIG).reverse().map(ring => (
          <RingBackground key={ring} ring={Number(ring)} />
        ))}

        {/* Journey Icons */}
        {JOURNEY_DATA.map((ringData) => (
          <div key={ringData.ring}>
            {ringData.items.map((item, index) => {
              const ringConfig = RING_CONFIG[ringData.ring as keyof typeof RING_CONFIG];
              const relativePos = getCircularPosition(index, ringData.items.length, ringConfig.radius);
              const absolutePos = getAbsolutePosition(relativePos);
              
              const isVisible = isRingVisible(ringData.ring);
              const isClicked = props.clickedSequence ? props.clickedSequence.some(clicked => clicked.id === `${ringData.ring}-${index}`): true;
              
              // Special handling for Ring 0 (Goal)
              if (ringData.ring === 0 && props.state !== 'end') {
                return (
                  <div
                    key={`${ringData.ring}-${index}`}
                    className={`absolute ${isVisible ? '' : 'hidden'}`}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                    }}
                  >
                    Goal
                  </div>
                );
              }

              const positionedIcon: PositionedJourneyIcon = {
                ...item,
                onClick: () => props.onSetLevel ? props.onSetLevel(item.level) : console.log("onSetLevel not provided"),
                position: absolutePos,
                id: `${ringData.ring}-${index}`,
                ring: ringData.ring,
                itemIndex: index,
              };

              return (
                <JourneyIconWrapper
                  key={`${ringData.ring}-${index}`}
                  item={item}
                  position={relativePos}
                  isVisible={isVisible}
                  isClicked={isClicked}
                  onClick={() => props.handleIconClick ? props.handleIconClick(positionedIcon, ringData.ring, index) : positionedIcon.onClick ? positionedIcon.onClick() : console.log("handleIconClick not provided")}
                />
              );
            })}
          </div>
        ))}

        {/* Center Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-indigo-100 via-transparent to-transparent opacity-20 pointer-events-none" />

        {/* Arrow Layer */}
        {props.children ? props.children() : null}
      </div>

      <MapLegend />
    </div>
  );
}