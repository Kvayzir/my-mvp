// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'docente' | 'estudiante' | 'admin';

// ============================================================================
// Chat & Messaging Types
// ============================================================================

export interface ChatMessage {
  id: number;
  user_id: string;
  user_type: MessageSender;
  text: string;
  parsed: boolean;
  timestamp: string;
  topic?: string;
}

export type MessageSender = 'user' | 'bot';

export interface ChatReplyRequest {
  id: number;
  user_id: string;
  topic: string | null;
  msg: string;
}

// ============================================================================
// Assignment & Topic Types
// ============================================================================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  topic: string;
  createdBy: string; // user id
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  status: AssignmentStatus;
}

export type AssignmentStatus = 'draft' | 'published' | 'completed' | 'archived';

export interface Topic {
  id: string;
  name: string;
  description: string;
  subject: string;
  createdBy: string; // user id
  assignments: Assignment[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Card & UI Component Types
// ============================================================================

export interface CardData {
  id: string;
  title: string;
  description: string;
  type: CardType;
  metadata?: Record<string, unknown>;
  href?: string;
}

export type CardType = 'assignment' | 'topic' | 'chat' | 'notebook';

export interface CardWrapperProps {
  role: UserRole;
  className?: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// ============================================================================
// Form & Input Types
// ============================================================================

export interface CreateTopicForm {
  title: string;
  description: string;
  subject: string;
}

export interface CreateAssignmentForm {
  title: string;
  description: string;
  topicId: string;
  dueDate?: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  role?: UserRole;
  status?: AssignmentStatus;
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: SearchFilters;
}

// ============================================================================
// Notebook & Learning Types
// ============================================================================

export interface NotebookEntry {
  id: string;
  userId: string;
  topicId: string;
  content: string;
  type: NotebookEntryType;
  createdAt: Date;
  updatedAt: Date;
}

export type NotebookEntryType = 'note' | 'question' | 'answer' | 'reflection';

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardStats {
  totalAssignments: number;
  completedAssignments: number;
  activeTopics: number;
  totalStudents?: number; // Only for docente role
}

export interface ProgressData {
  userId: string;
  assignmentId: string;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>> & {
  updatedAt: Date;
};

// ============================================================================
// Component Prop Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorProps {
  message: string;
  retry?: () => void;
}

// ============================================================================
// Route Params Types (for Next.js)
// ============================================================================

export interface PageParams {
  params: {
    id?: string;
    slug?: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}
