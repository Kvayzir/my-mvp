import { JOURNEY_MAP_CONFIG } from "@/app/lib/constants/journey-map-constants";

export interface Position {
  x: number;
  y: number;
}

export const getCircularPosition = (
  index: number, 
  total: number, 
  radius: number
): Position => {
  const angle = (index * 2 * Math.PI) / total + Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
};

export const getAbsolutePosition = (relativePos: Position): Position => {
  const { CENTER_POINT } = JOURNEY_MAP_CONFIG;
  return {
    x: CENTER_POINT.x + relativePos.x,
    y: CENTER_POINT.y + relativePos.y
  };
};

export const pointToLineSegmentDistance = (
  px: number, 
  py: number, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number => {
  const L2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (L2 === 0) return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));

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
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateAngle = (from: Position, to: Position): number => {
  return Math.atan2(to.y - from.y, to.x - from.x);
};
