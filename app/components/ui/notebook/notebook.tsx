import React from 'react';
import NotebookBackground from './elements/notebook-background';
import ContentArea from './elements/content-area';
import TabsContainer from './elements/tabs-container';
import useNotebook from './hooks/use-notebook';
import { createTabsConfig } from './elements/tabs-config';
import { TabsConfigEntry, JourneyMapProps } from '@/app/lib/types';

const Notebook = (props: JourneyMapProps) => {
  const { activeTab, tabStates, updateClickedSequence, updateAllIconPositions, handleTabChange, handleCheck, handleSubmit } = useNotebook();
  const tabs = createTabsConfig({
    onCheck: handleCheck, 
    onSubmit: handleSubmit, 
    mapProps: {...props, updateClickedSequence, updateAllIconPositions},
    tabStates: tabStates,
  } as TabsConfigEntry);

  return (
    <NotebookBackground>
      <ContentArea>
        {tabs[activeTab].content}
      </ContentArea>
      <TabsContainer 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </NotebookBackground>
  );
};

export default Notebook;
