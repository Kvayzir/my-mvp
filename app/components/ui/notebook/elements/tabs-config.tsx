import { NotesContent, TasksContent, IdeasContent } from './notebook-content';
import { TabsConfigEntry, JourneyTabState } from '@/app/lib/types';
import JourneyMap from '@/app/components/ui/journey-map/journey-map';

export const createTabsConfig = (props: TabsConfigEntry) => [
  {
    id: 0,
    label: "Instructions",
    icon: "✅",
    content: <TasksContent />
  },
  {
    id: 1,
    label: "Journey",
    icon: "🗺️",
    content: <JourneyMap 
      onSetLevel={props.mapProps.onSetLevel} 
      state={props.mapProps.state} 
      tabState={props.tabStates[0] as JourneyTabState} 
      updateClickedSequence={props.mapProps.updateClickedSequence} 
      updateAllIconPositions={props.mapProps.updateAllIconPositions} 
    />
  },
  {
    id: 2,
    label: "Report",
    icon: "📝",
    content: <NotesContent onCheck={props.onCheck} onSubmit={props.onSubmit} />
  },
  {
    id: 3,
    label: "Ideas",
    icon: "💡",
    content: <IdeasContent />
  }
];
