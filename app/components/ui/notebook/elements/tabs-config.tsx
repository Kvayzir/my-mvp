import { NotesContent, TasksContent, IdeasContent } from './notebook-content';
import { TabsConfigEntry } from '@/app/lib/types';
// Import your actual JourneyMap component here
import JourneyMap from '../journey-map';

export const createTabsConfig = (props: TabsConfigEntry) => [
  {
    id: 0,
    label: "Notes",
    icon: "📝",
    content: <NotesContent onCheck={props.onCheck} onSubmit={props.onSubmit} />
  },
  {
    id: 1,
    label: "Journey",
    icon: "🗺️",
    content: <JourneyMap onSetLevel={props.onSetLevel} />
  },
  {
    id: 2,
    label: "Tasks",
    icon: "✅",
    content: <TasksContent />
  },
  {
    id: 3,
    label: "Ideas",
    icon: "💡",
    content: <IdeasContent />
  }
];
