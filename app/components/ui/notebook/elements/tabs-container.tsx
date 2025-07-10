import React from 'react';
import NotebookTab from './notebook-tab';

const TabsContainer = ({ tabs, activeTab, onTabChange }: {tabs: {id: number, label: string, icon: string, content: React.ReactNode}[], activeTab: number, onTabChange: (tab: number) => void}) => {
  return (
    <div className="w-20 bg-gray-50 border-l border-gray-200 flex flex-col">
      {tabs.map((tab: {id: number, label: string, icon: string, content: React.ReactNode}, index: number) => (
        <NotebookTab
          key={tab.id}
          tab={tab}
          isActive={activeTab === index}
          onClick={() => onTabChange(index)}
        />
      ))}
    </div>
  );
};

export default TabsContainer;