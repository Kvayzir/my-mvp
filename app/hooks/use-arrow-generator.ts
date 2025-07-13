import { useCallback } from "react";
import { PositionedJourneyIcon } from "@/app/lib/types";
import { 
  pointToLineSegmentDistance, 
  calculateDistance, 
  calculateAngle,
  Position 
} from "@/app/lib/utils/journey-map-utils";
import { JOURNEY_MAP_CONFIG } from "@/app/lib/constants/journey-map-constants";

export interface ArrowData {
  arrowPath: string;
  arrowhead: string;
}

export const useArrowGenerator = (allIconPositions: PositionedJourneyIcon[]) => {
  const createArrow = useCallback((
    startIcon: PositionedJourneyIcon, 
    endIcon: PositionedJourneyIcon
  ): ArrowData => {
    const start = startIcon.position;
    const end = endIcon.position;
    const distance = calculateDistance(start, end);
    const angle = calculateAngle(start, end);

    // Check if curve is required
    const curveRequired = shouldUseCurve(start, end, distance, allIconPositions);
    
    const { startX, startY, endX, endY, controlX, controlY } = calculatePathPoints(
      start, 
      end, 
      angle, 
      distance, 
      curveRequired
    );

    const arrowPath = curveRequired 
      ? `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
      : `M ${startX} ${startY} L ${endX} ${endY}`;

    const arrowhead = createArrowhead(endX, endY, controlX, controlY);

    return { arrowPath, arrowhead };
  }, [allIconPositions]);

  const shouldUseCurve = (
    start: Position, 
    end: Position, 
    distance: number, 
    allIcons: PositionedJourneyIcon[]
  ): boolean => {
    const { CENTER_POINT, COLLISION_BUFFER } = JOURNEY_MAP_CONFIG;
    
    // Force curve for very short distances
    if (distance < COLLISION_BUFFER * 3) return true;

    // Check for intervening icons
    for (const icon of allIcons) {
      const distToLine = pointToLineSegmentDistance(
        icon.position.x, icon.position.y,
        start.x, start.y,
        end.x, end.y
      );
      if (distToLine < COLLISION_BUFFER) return true;
    }

    // Check if path crosses center
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const distToCenter = calculateDistance({ x: midX, y: midY }, CENTER_POINT);
    
    return distToCenter < 120;
  };

  const calculatePathPoints = (
    start: Position,
    end: Position,
    angle: number,
    distance: number,
    curveRequired: boolean
  ) => {
    const { CENTER_POINT, ICON_RADIUS, CURVE_OFFSET, EXTEND_FACTOR } = JOURNEY_MAP_CONFIG;
    
    const startX = start.x + Math.cos(angle) * ICON_RADIUS;
    const startY = start.y + Math.sin(angle) * ICON_RADIUS;
    const endX = end.x - Math.cos(angle) * ICON_RADIUS;
    const endY = end.y - Math.sin(angle) * ICON_RADIUS;

    let controlX, controlY;
    
    if (curveRequired) {
      console.log("Using curve for arrow");
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const vectorX = midX - CENTER_POINT.x;
      const vectorY = midY - CENTER_POINT.y;
      console.log("Vector X:", vectorX, "Vector Y:", vectorY);
      const vectorMagnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
      
      const curveOffsetFactor = Math.max(distance * 0.1, CURVE_OFFSET);
      
      if (vectorMagnitude > 0) {
        controlX = CENTER_POINT.x + ((Math.abs(vectorX) > 5 ? vectorX : distance * 0.3) / vectorMagnitude) * (vectorMagnitude + curveOffsetFactor * EXTEND_FACTOR);
        controlY = CENTER_POINT.y + ((Math.abs(vectorY) > 5 ? vectorY : distance * 0.3) / vectorMagnitude) * (vectorMagnitude + curveOffsetFactor * EXTEND_FACTOR);
      } else {
        controlX = midX + Math.cos(angle + Math.PI / 2) * curveOffsetFactor;
        controlY = midY + Math.sin(angle + Math.PI / 2) * curveOffsetFactor;
      }
    } else {
      controlX = (start.x + end.x) / 2;
      controlY = (start.y + end.y) / 2;
    }

    return { startX, startY, endX, endY, controlX, controlY };
  };

  const createArrowhead = (endX: number, endY: number, controlX: number, controlY: number): string => {
    const { ARROW_SIZE } = JOURNEY_MAP_CONFIG;
    const endAngle = Math.atan2(endY - controlY, endX - controlX);
    const arrowAngle1 = endAngle + Math.PI * 0.75;
    const arrowAngle2 = endAngle - Math.PI * 0.75;
    
    const arrowX1 = endX + Math.cos(arrowAngle1) * ARROW_SIZE;
    const arrowY1 = endY + Math.sin(arrowAngle1) * ARROW_SIZE;
    const arrowX2 = endX + Math.cos(arrowAngle2) * ARROW_SIZE;
    const arrowY2 = endY + Math.sin(arrowAngle2) * ARROW_SIZE;

    return `M ${arrowX1} ${arrowY1} L ${endX} ${endY} L ${arrowX2} ${arrowY2}`;
  };

  const getArrowStartPosition = useCallback((start: Position, end: Position): Position => {
    const distance = calculateDistance(start, end);
    if (distance < 10) return start;
    
    const angle = calculateAngle(start, end);
    const offset = 45;
    
    return {
      x: start.x + Math.cos(angle) * offset,
      y: start.y + Math.sin(angle) * offset
    };
  }, []);

  return { createArrow, getArrowStartPosition };
};
