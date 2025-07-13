import { JourneyIconEntry } from "@/app/lib/types";

export const JOURNEY_MAP_CONFIG = {
  CONTAINER_SIZE: { width: 600, height: 600 },
  CENTER_POINT: { x: 300, y: 216 },
  ICON_RADIUS: 24,
  COLLISION_BUFFER: 34,
  ARROW_SIZE: 12,
  CURVE_OFFSET: 50,
  EXTEND_FACTOR: 1.5,
} as const;

export const RING_CONFIG = {
  0: { radius: 0, color: 'bg-red-100', borderColor: 'border-red-300' },
  1: { radius: 100, color: 'bg-blue-100', borderColor: 'border-blue-300' },
  2: { radius: 200, color: 'bg-purple-100', borderColor: 'border-purple-300' }
} as const;

export const JOURNEY_DATA = [
  {
    ring: 0,
    items: [
      { 
        name: "Your Journey", 
        type: "goal", 
        color: "purple", 
        size: "lg", 
        level: "goal" 
      } as JourneyIconEntry & { level: string }
    ]
  },
  {
    ring: 1,
    items: [
      { name: "Célula Vegetal", type: "nature", color: "green", level: "cellVeg" },
      { name: "Célula Animal", type: "biology", color: "pink", level: "cellAn" },
      { name: "Energía", type: "magic", color: "orange", level: "energy" },
      { name: "Partes de la Célula", type: "mystery", color: "red", level: "parts" },
      { name: "Trabajo", type: "art", color: "orange", level: "testing" },
    ] as (JourneyIconEntry & { level: string })[]
  },
  {
    ring: 2,
    items: [
      { name: "History Journey", type: "history", color: "blue", level: "history" },
      { name: "Science Journey", type: "science", color: "yellow", level: "science" },
      { name: "Mystery Journey", type: "mystery", color: "indigo", level: "mystery" },
      { name: "Outerspace Journey", type: "space", color: "indigo", level: "mystery" },
    ] as (JourneyIconEntry & { level: string })[]
  }
] as const;