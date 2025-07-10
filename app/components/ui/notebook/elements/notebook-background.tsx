import React from 'react';

const NotebookBackground = ({ children }: {children: React.ReactNode}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-8">
      <div className="relative">
        {/* Notebook Shadow */}
        <div className="absolute inset-0 bg-gray-400 rounded-lg transform translate-x-1 translate-y-1"></div>
        
        {/* Main Notebook */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{ width: '800px', height: '600px' }}>
          {/* Notebook Binding */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-red-600 shadow-inner">
            <div className="h-full flex flex-col justify-evenly items-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-red-800 rounded-full"></div>
              ))}
            </div>
          </div>
          
          {/* Left Red Margin */}
          <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300"></div>
          
          {/* Content Area */}
          <div className="ml-16 h-full flex">
            {children}
          </div>
          
          {/* Page Corner */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gray-100 transform rotate-45 translate-x-4 -translate-y-4 shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default NotebookBackground;