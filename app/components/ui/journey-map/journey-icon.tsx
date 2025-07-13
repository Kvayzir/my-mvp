import { JourneyIconEntry } from "@/app/lib/types";
export default function JourneyIcon(props: JourneyIconEntry) {
  const colorClasses = {
    blue: 'bg-blue-500 border-blue-300',
    yellow: 'bg-yellow-500 border-yellow-300',
    indigo: 'bg-indigo-500 border-indigo-300',
    green: 'bg-green-500 border-green-300',
    red: 'bg-red-500 border-red-300',
    purple: 'bg-purple-500 border-purple-300',
    pink: 'bg-pink-500 border-pink-300',
    orange: 'bg-orange-500 border-orange-300',
    gray: 'bg-orange-500 border-gray-300',
    teal: 'bg-orange-500 border-teal-300',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base',
  };

  const typeIcons = {
    history: '🏛️',
    science: '🔬',
    mystery: '🔍',
    goal: '🎯',
    magic: '✨',
    nature: '🌿',
    space: '🚀',
    art: '🎨',
    biology: '🐻‍❄️',
  };

  return (
    <div className={`flex flex-col items-center group cursor-pointer ${sizeClasses[props.size || "md"] || sizeClasses.md}`}>
      <div 
        className={`
          ${colorClasses[props.color || "blue"] || colorClasses.blue}
          ${sizeClasses[props.size || "md"] || sizeClasses.md}
          rounded-full
          border-4
          flex items-center justify-center
          shadow-lg
          transition-all duration-300
          hover:scale-110
          hover:shadow-xl
          bg-opacity-80
          backdrop-blur-sm
        `}
        title={props.name}
        onClick={props.onClick ? props.onClick : () => alert(`You clicked on ${props.name}`)}
      >
        <span className="text-white text-2xl">
          {typeIcons[props.type] || '🎯'}
        </span>
      </div>
      <span className="text-xs mt-2 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md z-10">
        {props.name}
      </span>
    </div>
  );
}

