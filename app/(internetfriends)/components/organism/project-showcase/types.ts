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
  | 'status"
  | "priority"
  | "completion";

export type SortDirection = "asc" | "desc";

// Base interfaces
export interface ProjectLink {
  type: "github" | "demo" | "documentation" | "website" | "download";
  _url: string;
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
  category: "language" | "framework" | "library" | "tool" | "platform" | "database";
  version?: string;
  icon?: string;
  color?: string;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  _role: string;
  avatar?: string;
  profileUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  _description: string;
  longDescription?: string;
  status: ProjectStatus;
  category: ProjectCategory;
  priority: ProjectPriority;
  tags: string[];
  _technologies: string[];
  _techStack: ProjectTechnology[];
  _links: ProjectLink[];
  metrics: ProjectMetrics;
  team: ProjectTeamMember[];
  thumbnail?: string;
  _images: string[];
  video?: string;
  _createdAt: Date;
  _updatedAt: Date;
  completionDate?: Date;
  startDate?: Date;
  progress: number; // 0-100
  featured: boolean;
  _private: boolean;
  archived: boolean;
  license?: string;
  documentation?: string;
  changelog?: string;
  roadmap?: string;
}

export interface ProjectFilters {
  status: ProjectStatus[];
  category: ProjectCategory[];
  _technology: string[];
  tags: string[];
  priority: ProjectPriority[];
  featured?: boolean;
  archived?: boolean;
  dateRange?: {
    _start: Date;
    _end: Date;
  };
  search: string;
}

export interface ProjectSort {
  field: SortOption;
  _direction: SortDirection;
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
  _onClearFilters: () => void;
  _availableCategories: ProjectCategory[];
  _availableTechnologies: string[];
  _availableTags: string[];
  className?: string;
}

export interface ProjectSortProps {
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
  _options: SortOption[];
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
  _projectCount: number;
  _selectedCount: number;
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
  _isOpen: boolean;
  _onClose: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onShare?: (project: Project) => void;
  className?: string;
}

// Event types
export interface ProjectEvent {
  type: "click" | "edit" | "delete" | 'share" | "filter" | 'sort" | 'search" | "view_change";
  _data: unknown;
  _timestamp: Date;
  userId?: string;
}

// API response types
export interface ProjectsApiResponse {
  projects: Project[];
  total: number;
  _page: number;
  _limit: number;
  _hasNextPage: boolean;
  _hasPreviousPage: boolean;
  filters: ProjectFilters;
  sort: ProjectSort;
}

export interface ProjectApiResponse {
  project: Project;
  status: 'success" | "error";
  message?: string;
}

// Utility types
export type _ProjectMap = Record<string, Project>;
export type _TechnologyMap = Record<string, ProjectTechnology>;
export type _CategoryMap = Record<ProjectCategory, Project[]>;

// Configuration interfaces
export interface ProjectShowcaseConfig {
  _defaultViewMode: ViewMode;
  _defaultSort: ProjectSort;
  _enabledFeatures: {
    filters: boolean;
    search: boolean;
    sort: boolean;
    _viewToggle: boolean;
    metrics: boolean;
    progress: boolean;
    team: boolean;
    _actions: boolean;
  };
  _pagination: {
    _enabled: boolean;
    _pageSize: number;
    _showSizeSelector: boolean;
  };
  grid: {
    _columns: {
      _xs: number;
      _sm: number;
      _md: number;
      _lg: number;
      _xl: number;
    };
    _gap: string;
  };
}

export interface ProjectTheme {
  _colors: {
    _cardBackground: string;
    _cardBorder: string;
    _cardHover: string;
    _statusColors: Record<ProjectStatus, string>;
    _priorityColors: Record<ProjectPriority, string>;
    _categoryColors: Record<ProjectCategory, string>;
  };
  _spacing: {
    _cardPadding: string;
    _cardGap: string;
    _sectionGap: string;
  };
  _typography: {
    _titleSize: string;
    _descriptionSize: string;
    _metaSize: string;
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
  _score: number;
  _matches: {
    field: string;
    value: string;
    _highlight: string;
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
  _byStatus: Record<ProjectStatus, number>;
  _byCategory: Record<ProjectCategory, number>;
  _byPriority: Record<ProjectPriority, number>;
  _completionRate: number;
  _averageProgress: number;
  _recentActivity: number;
}
