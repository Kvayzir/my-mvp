import { JourneyIconEntry } from "@/app/lib/types";
import JourneyIcon from "./journey-icon";

export default function JourneyMap({onSetLevel}: {onSetLevel: (level:string) => void}) {
    // Configuration for concentric circles
  const journeyData = [
    // Inner circle (center)
    {
      ring: 0,
      items: [
        { name: "Your Journey", type: "goal", color: "indigo", size: "lg", onClick: () => onSetLevel("goal") } as JourneyIconEntry
      ]
    },
    // First ring
    {
      ring: 1,
      items: [
        { name: "Célula Vegetal", type: "nature", color: "green", onClick: () => onSetLevel("cellVeg") } as JourneyIconEntry,
        { name: "Célula Animal", type: "biology", color: "purple", onClick: () => onSetLevel("cellAn") } as JourneyIconEntry,
        { name: "Energía", type: "magic", color: "orange", onClick: () => onSetLevel("energy") } as JourneyIconEntry,
        { name: "Partes de la Célula", type: "mystery", color: "red", onClick: () => onSetLevel("parts") }  as JourneyIconEntry
      ]
    },
    // Second ring
    {
      ring: 2,
      items: [
        { name: "History Journey", type: "history", color: "blue", onClick: () => onSetLevel("history") } as JourneyIconEntry,
        { name: "Science Journey", type: "science", color: "yellow", onClick: () => onSetLevel("science") } as JourneyIconEntry,
        { name: "Mystery Journey", type: "mystery", color: "indigo", onClick: () => onSetLevel("mystery") } as JourneyIconEntry,
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
    0: { radius: 0, color: 'bg-indigo-100' },
    1: { radius: 100, color: 'bg-blue-100' },
    2: { radius: 200, color: 'bg-purple-100' }
  };

    return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-transparent">
      <h1 className="text-3xl font-bold text-gray-700 mb-8 text-center z-1">Journey Map</h1>
      
      {/* Circular Journey Map Container */}
      <div className="relative flex items-center justify-center" style={{ width: '600px', height: '600px' }}>
        
        {/* Concentric Circle Backgrounds */}
        {Object.entries(ringConfig).reverse().map(([ring, config]) => (
          ring !== '0' && (
            <div
              key={ring}
              className={`absolute rounded-full border-2 border-dashed border-opacity-30 ${config.color} bg-opacity-10`}
              style={{
                  width: `${config.radius * 2 + 80}px`,
                  height: `${config.radius * 2 + 80}px`,
                  borderColor: config.color.replace('bg-', '').replace('-100', '-300'),
                  left: `50%`,
                  top: `50%`,
                  transform: `translate(-50%, -50%)`,
              }}
            />
          )
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
              
              return (
                <div
                  key={`${ringData.ring}-${index}`}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%)`
                  }}
                >
                  <JourneyIcon
                    name={item.name}
                    type={item.type}
                    color={item.color}
                    size={item.size || 'md'}
                    onClick={item.onClick}
                  />
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Center Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-indigo-100 via-transparent to-transparent opacity-20 pointer-events-none" />
        
        {/* Connecting Lines (Optional) */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="lineGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Example connecting lines from center to first ring */}
          {journeyData[1]?.items.map((_, index) => {
            const { x, y } = getCircularPosition(index, journeyData[1].items.length, 120);
            return (
              <line
                key={index}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${x}px)`}
                y2={`calc(50% + ${y}px)`}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })}
        </svg>
        
      </div>
      
      {/* Legend */}
      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-indigo-100 rounded-full mr-1 border border-indigo-300"></div>
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
    </div>
  );
}