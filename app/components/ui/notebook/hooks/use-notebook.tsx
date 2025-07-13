import { useState } from 'react';
import { PositionedJourneyIcon, TabStates } from '@/app/lib/types';

const useNotebook = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabStates, setTabStates] = useState<TabStates>({
    0: {
      clickedSequence: [] as PositionedJourneyIcon[],
      allIconPositions: [] as PositionedJourneyIcon[],
    },
    1: { completed: false },
    2: { completed: false },
    3: { completed: false }
  });

  const updateTabState = (tabIndex: number, newState: Partial<typeof tabStates[0]>) => {
    setTabStates(prev => ({
      ...prev,
      [tabIndex]: { ...prev[tabIndex], ...newState }
    }));
  };

  // Specific updater functions for your journey map tab (assuming it's tab 0)
  const updateClickedSequence = (newSequence: PositionedJourneyIcon[]) => {
    updateTabState(0, { clickedSequence: newSequence });
  };

  const updateAllIconPositions = (newPositions: PositionedJourneyIcon[]) => {
    updateTabState(0, { allIconPositions: newPositions });
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleCheck = () => {
    alert("Reviewing notebook...");
  };

  const handleSubmit = () => {
    alert("Notebook saved!");
  };

  return {
    activeTab,
    tabStates,
    updateClickedSequence,
    updateAllIconPositions,
    handleTabChange,
    handleCheck,
    handleSubmit
  };
};

export default useNotebook;