import { NotesContent, TasksContent, IdeasContent } from './notebook-content';
// Import your actual JourneyMap component here
import JourneyMap from '../journey-map';

export const createTabsConfig = (onCheck: () => void, onSubmit: () => void) => [
  {
    id: 0,
    label: "Notes",
    icon: "📝",
    content: <NotesContent onCheck={onCheck} onSubmit={onSubmit} />
  },
  {
    id: 1,
    label: "Journey",
    icon: "🗺️",
    content: <JourneyMap />
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
