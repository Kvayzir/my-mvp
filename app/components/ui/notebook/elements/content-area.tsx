import React from 'react';

const ContentArea = ({ children }: {children: React.ReactNode}) => {
  return (
    <div className="flex-1 relative">
      {/* Ruled Lines Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
          backgroundSize: '100% 32px'
        }}
      ></div>
      
      {/* Tab Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default ContentArea;