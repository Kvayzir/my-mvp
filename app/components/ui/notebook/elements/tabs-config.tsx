import { NotesContent, TasksContent, Resources, IdeasContent } from './notebook-content';
import { TabsConfigEntry  } from '@/app/lib/types';
import JourneyMap from '@/app/components/ui/journey-map/journey-map';

export const createTabsConfig = (props: TabsConfigEntry) => {  
  return [
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
      clickedSequence={props.mapProps.clickedSequence} 
      updateAllIconPositions={props.mapProps.updateAllIconPositions} 
      handleIconClick={props.mapProps.handleIconClick} 
    >
      {props.mapProps.children}
    </JourneyMap>
  },
  {
    id: 2,
    label: "Recursos",
    icon: "📚",
    content: <Resources />
  },
  {
    id: 3,
    label: "Report",
    icon: "📝",
    content: <NotesContent onCheck={props.onCheck} onSubmit={props.onSubmit} />
  },
  {
    id: 4,
    label: "Ideas",
    icon: "💡",
    content: <IdeasContent />
  }
];
}
