// InternetFriends Project Showcase Organism Types
// Comprehensive type definitions for the project showcase system

export type ProjectStatus =
  | "active"
  | "completed"
  | "in_progress"
  | "on_hold"
  | "archived";

export type ProjectCategory =
  | "web_app"
  | "mobile_app"
  | "api"
  | "library"
  | "tool"
  | "website"
  | "desktop_app"
  | "game"
  | "other";

export type ProjectPriority = "low" | "medium" | "high" | "critical";

export type ViewMode = "grid" | "list" | "card";

export type SortOption =
  | "name"
  | "created_date"
  | "updated_date"
  | "status"
  | "priority"
  | "completion";

export type SortDirection = "asc" | "desc";

// Base interfaces
export interface ProjectLink {
  type: "github" | "demo" | "documentation" | "website" | "download";
  url: string;
  label?: string;
}

export interface ProjectMetrics {
  stars?: number;
  forks?: number;
  downloads?: number;
  views?: number;
  commits?: number;
  contributors?: number;
  issues?: number;
  pullRequests?: number;
}

export interface ProjectTechnology {
  name: string;
  category:
    | "language"
    | "framework"
    | "library"
    | "tool"
    | "platform"
    | "database";
  version?: string;
  icon?: string;
  color?: string;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  profileUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  status: ProjectStatus;
  category: ProjectCategory;
  priority: ProjectPriority;
  tags: string[];
  technologies: string[];
  techStack: ProjectTechnology[];
  links: ProjectLink[];
  metrics: ProjectMetrics;
  team: ProjectTeamMember[];
  thumbnail?: string;
  images: string[];
  video?: string;
  createdAt: Date;
  updatedAt: Date;
  completionDate?: Date;
  startDate?: Date;
  progress: number; // 0-100
  featured: boolean;
  isPrivate: boolean;
  archived: boolean;
  license?: string;
  documentation?: string;
  changelog?: string;
  roadmap?: string;
}

export interface ProjectFilters {
  status: ProjectStatus[];
  category: ProjectCategory[];
  technology: string[];
  tags: string[];
  priority: ProjectPriority[];
  featured?: boolean;
  archived?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search: string;
}

export interface ProjectSort {
  field: SortOption;
  direction: SortDirection;
}

// Component props
export interface ProjectShowcaseOrganismProps {
  projects: Project[];
  loading?: boolean;
  error?: string | null;
  onProjectClick?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  onProjectShare?: (project: Project) => void;
  onFiltersChange?: (filters: ProjectFilters) => void;
  onSortChange?: (sort: ProjectSort) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onSearch?: (query: string) => void;
  initialFilters?: Partial<ProjectFilters>;
  initialSort?: ProjectSort;
  initialViewMode?: ViewMode;
  enableFilters?: boolean;
  enableSort?: boolean;
  enableSearch?: boolean;
  enableViewToggle?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableShare?: boolean;
  showMetrics?: boolean;
  showProgress?: boolean;
  showTeam?: boolean;
  maxProjects?: number;
  className?: string;
  compactMode?: boolean;
}

export interface ProjectCardProps {
  project: Project;
  viewMode: ViewMode;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onShare?: (project: Project) => void;
  showMetrics?: boolean;
  showProgress?: boolean;
  showTeam?: boolean;
  enableActions?: boolean;
  className?: string;
}

export interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onClearFilters: () => void;
  availableCategories: ProjectCategory[];
  availableTechnologies: string[];
  availableTags: string[];
  className?: string;
}

export interface ProjectSortProps {
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
  options: SortOption[];
  className?: string;
}

export interface ProjectSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export interface ProjectToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  projectCount: number;
  selectedCount: number;
  onBulkAction?: (action: string, projects: Project[]) => void;
  enableViewToggle?: boolean;
  enableSort?: boolean;
  enableSearch?: boolean;
  enableBulkActions?: boolean;
  className?: string;
}

export interface ProjectGridProps {
  projects: Project[];
  viewMode: ViewMode;
  onProjectClick?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  onProjectShare?: (project: Project) => void;
  showMetrics?: boolean;
  showProgress?: boolean;
  showTeam?: boolean;
  enableActions?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onShare?: (project: Project) => void;
  className?: string;
}

// Event types
export interface ProjectEvent {
  type:
    | "click"
    | "edit"
    | "delete"
    | "share"
    | "filter"
    | "sort"
    | "search"
    | "view_change";
  data: unknown;
  timestamp: Date;
  userId?: string;
}

// API response types
export interface ProjectsApiResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: ProjectFilters;
  sort: ProjectSort;
}

export interface ProjectApiResponse {
  project: Project;
  status: "success" | "error";
  message?: string;
}

// Utility types
export type ProjectMap = Record<string, Project>;
export type TechnologyMap = Record<string, ProjectTechnology>;
export type CategoryMap = Record<ProjectCategory, Project[]>;

// Configuration interfaces
export interface ProjectShowcaseConfig {
  defaultViewMode: ViewMode;
  defaultSort: ProjectSort;
  enabledFeatures: {
    filters: boolean;
    search: boolean;
    sort: boolean;
    viewToggle: boolean;
    metrics: boolean;
    progress: boolean;
    team: boolean;
    actions: boolean;
  };
  pagination: {
    enabled: boolean;
    pageSize: number;
    showSizeSelector: boolean;
  };
  grid: {
    columns: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    gap: string;
  };
}

export interface ProjectTheme {
  colors: {
    cardBackground: string;
    cardBorder: string;
    cardHover: string;
    statusColors: Record<ProjectStatus, string>;
    priorityColors: Record<ProjectPriority, string>;
    categoryColors: Record<ProjectCategory, string>;
  };
  spacing: {
    cardPadding: string;
    cardGap: string;
    sectionGap: string;
  };
  typography: {
    titleSize: string;
    descriptionSize: string;
    metaSize: string;
  };
}

// Filter and search utilities
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SearchResult {
  project: Project;
  score: number;
  matches: {
    field: string;
    value: string;
    highlight: string;
  }[];
}

// Bulk operations
export interface BulkOperation {
  id: string;
  label: string;
  icon?: string;
  action: (projects: Project[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface ProjectStats {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  byCategory: Record<ProjectCategory, number>;
  byPriority: Record<ProjectPriority, number>;
  completionRate: number;
  averageProgress: number;
  recentActivity: number;
}
