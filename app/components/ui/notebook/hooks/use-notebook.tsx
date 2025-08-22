import { useState, useCallback } from 'react';
import { PositionedJourneyIcon, TabStates, JourneyTabState } from '@/app/lib/types';
import { useArrowGenerator } from "@/app/hooks/use-arrow-generator";
import { ArrowLayer } from "@/app/components/ui/journey-map/arrow-layer";
import { ResetButton } from "@/app/components/ui/journey-map/reset-button";

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

  const updateTabState = useCallback((tabIndex: number, newState: Partial<typeof tabStates[0]>) => {
    setTabStates(prev => ({
      ...prev,
      [tabIndex]: { ...prev[tabIndex], ...newState }
    }));
  }, []);

  // Specific updater functions for your journey map tab (assuming it's tab 0)
  const updateClickedSequence = useCallback((newSequence: PositionedJourneyIcon[]) => {
    updateTabState(0, { clickedSequence: newSequence });
  }, [updateTabState]);

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

  const { clickedSequence, allIconPositions } = tabStates[0] as JourneyTabState;
  const { createArrow, getArrowStartPosition } = useArrowGenerator(allIconPositions);

  const handleIconClick = useCallback((
        item: PositionedJourneyIcon,
        ringIndex: number,
        itemIndex: number
      ) => {
        const iconId = `${ringIndex}-${itemIndex}`;
        
        const isAlreadyClicked = clickedSequence.some(clicked => clicked.id === iconId)
        if (!isAlreadyClicked) {
          updateClickedSequence([...clickedSequence, item]);
        }
    
        if (item.onClick) {
          item.onClick();
        }

        setActiveTab(2);
        console.log(`Icon clicked: ${item.name}`);
      }, [clickedSequence, updateClickedSequence]);

      const resetArrows = useCallback(() => {
        updateClickedSequence([]);
      }, []);

  function ArrowMapping() {
    return (
    <>
      <ArrowLayer
        clickedSequence={clickedSequence}
        createArrow={createArrow}
        getArrowStartPosition={getArrowStartPosition}
      />
      <ResetButton 
        onReset={resetArrows}
        clickedCount={clickedSequence.length}
      />
    </>
  );
  }

  return {
    activeTab,
    tabStates,
    clickedSequence,
    handleIconClick,
    ArrowMapping,
    updateAllIconPositions,
    handleTabChange,
    handleCheck,
    handleSubmit
  };
};

export default useNotebook;