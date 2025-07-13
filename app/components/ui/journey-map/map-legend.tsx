export const MapLegend: React.FC = () => {
  return (
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
  );
};
