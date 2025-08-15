import { JourneyIconEntry } from "@/app/lib/types";

export const JOURNEY_MAP_CONFIG = {
  CONTAINER_SIZE: { width: 400, height: 600 },
  CENTER_POINT: { x: 200, y: 216 },
  ICON_RADIUS: 24,
  COLLISION_BUFFER: 34,
  ARROW_SIZE: 12,
  CURVE_OFFSET: 10,
  EXTEND_FACTOR: 1.5,
} as const;

export const RING_CONFIG = {
  0: { radius: 0, color: 'bg-red-100', borderColor: 'border-red-300' },
  1: { radius: 85, color: 'bg-blue-100', borderColor: 'border-blue-300' },
  2: { radius: 170, color: 'bg-purple-100', borderColor: 'border-purple-300' }
} as const;

export const JOURNEY_DATA = [
  {
    ring: 0,
    items: [
      { 
        name: "Your Journey", 
        icon: "🎯", 
        color: "purple", 
        size: "lg", 
        level: "goal" 
      } as JourneyIconEntry & { level: string }
    ]
  },
  {
    ring: 1,
    items: [
      { name: "Citoesqueleto", icon: "🩻", color: "indigo", level: "citoesqueleto" },
      { name: "Energía", icon: "🔋", color: "green", level: "energy" },
      { name: "Sustancias", icon: "⚙️", color: "red", level: "sustances" },
      { name: "Núcleo celular", icon: "🧬", color: "yellow", level: "nucleo" },
    ] as (JourneyIconEntry & { level: string })[]
  },
  {
    ring: 2,
    items: [
      { name: "Misión núcle", icon: "🧿", color: "purple", level: "core" },
      { name: "Una mini ciudad", icon: "🏙️", color: "teal", level: "Ciudad" },
      { name: "Viaje microscópico", icon: "🛩️", color: "indigo", level: "microscopio" },
    ] as (JourneyIconEntry & { level: string })[]
  }
] as const;