import { BookOpenIcon, BeakerIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

const CircularButton = ({ 
  color = 'blue', 
  size = 'md', 
  onClick, 
  children, 
  disabled = false 
}: {
    color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray' | 'orange' | 'teal',
    size?: 'sm' | 'md' | 'lg' | 'xl',
    onClick: () => void,
    children: ReactNode,
    disabled?: boolean
}) => {
  // Color mapping for different color variants
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    red: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    green: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    purple: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500',
    pink: 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500',
    indigo: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500',
    gray: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500',
    orange: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
    teal: 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-500',
  };

  // Size mapping for different button sizes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  // Get the appropriate classes or fallback to blue
  const colorClass = colorClasses[color] || colorClasses.blue;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorClass}
        ${sizeClass}
        rounded-full
        text-white
        font-medium
        transition-all
        duration-200
        transform
        hover:scale-105
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        shadow-md
        hover:shadow-lg
        flex
        items-center
        justify-center
      `}
    >
      {children}
    </button>
  );
};

export default function JourneyIcon(prop: {name: string, type: 'history' | 'science' | 'mystery', color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray' | 'orange' | 'teal'}) {
    const icon = {
        'history': <BookOpenIcon className="w-6 h-6 text-gray-500" />,
        'science': <BeakerIcon className="w-6 h-6 text-gray-500" />,
        'mystery': <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />,
    }
    return (
        <div className="w-[50px] h-[50px] r p-4 color-">   
            {CircularButton({
                color: prop.color || 'blue',
                size: 'md',
                onClick: () => console.log(`Clicked on ${prop.name}`),
                children: icon[prop.type] || <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />,
                disabled: false
            })}
        </div>
    );
}

