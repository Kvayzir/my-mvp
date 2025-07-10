import React from 'react';

const NotebookTab = ({ tab, isActive, onClick }: {tab: {id: number, label: string, icon: string, content: React.ReactNode}, isActive: boolean, onClick: () => void}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex flex-col items-center justify-center p-3 border-b border-gray-200 transition-all duration-200
        ${isActive 
          ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-500' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }
      `}
    >
      <span className="text-2xl mb-1">{tab.icon}</span>
      <span className="text-xs font-medium transform -rotate-90 whitespace-nowrap">
        {tab.label}
      </span>
    </button>
  );
};

export default NotebookTab;