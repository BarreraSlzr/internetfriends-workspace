// InternetFriends Data Table Organism Types
// Comprehensive type definitions for the data table system

export type SortDirection = "asc" | "desc" | "none";

export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "enum"
  | "badge"
  | "action"
  | "custom";

export type FilterType =
  | "text"
  | "number"
  | "date"
  | 'select"
  | "multiselect"
  | "range"
  | "boolean";

export type SelectionMode = "none" | 'single" | "multiple";

export type DensityMode = "compact" | "normal" | "comfortable";

// Base interfaces
export interface TableColumn {
  key: string;
  label: string;
  type: ColumnType;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  hideable?: boolean;
  pinned?: "left" | "right" | false;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: TableRow, index: number) => React.ReactNode;
  accessor?: (row: TableRow) => any;
  className?: string;
  headerClassName?: string;
}

export interface TableRow {
  id: string | number;
  [key: string]: unknown;
}

export interface SortConfig {
  column: string;
  _direction: SortDirection;
}

export interface FilterConfig {
  column: string;
  type: FilterType;
  value: unknown;
  operator?: "equals" | "contains" | 'startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "between" | "in" | "notIn";
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

export interface ColumnVisibility {
  [_columnKey: string]: boolean;
}

export interface TableState {
  data: TableRow[];
  _filteredData: TableRow[];
  sortConfig: SortConfig;
  filters: FilterConfig[];
  pagination: PaginationConfig;
  columnVisibility: ColumnVisibility;
  selectedRows: Set<string | number>;
  density: DensityMode;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Component props
export interface DataTableOrganismProps {
  data: TableRow[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string | null;
  selectionMode?: SelectionMode;
  onSelectionChange?: (_selectedIds: (string | number)[]) => void;
  onRowClick?: (row: TableRow, index: number) => void;
  onRowDoubleClick?: (row: TableRow, index: number) => void;
  onSort?: (sortConfig: SortConfig) => void;
  onFilter?: (filters: FilterConfig[]) => void;
  onSearch?: (query: string) => void;
  onExport?: (format: "csv" | "json" | "xlsx") => void;
  pagination?: Partial<PaginationConfig>;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  enableColumnToggle?: boolean;
  enableColumnResize?: boolean;
  enableRowSelection?: boolean;
  enableExport?: boolean;
  initialSort?: SortConfig;
  initialFilters?: FilterConfig[];
  initialPageSize?: number;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: TableRow, index: number) => string);
  emptyStateMessage?: string;
  loadingMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  compactMode?: boolean;
}

export interface TableHeaderProps {
  columns: TableColumn[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onColumnResize?: (column: string, width: number) => void;
  columnVisibility: ColumnVisibility;
  selectionMode: SelectionMode;
  selectedCount: number;
  totalCount: number;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
}

export interface TableBodyProps {
  data: TableRow[];
  columns: TableColumn[];
  columnVisibility: ColumnVisibility;
  selectedRows: Set<string | number>;
  onRowSelect?: (id: string | number, selected: boolean) => void;
  onRowClick?: (row: TableRow, index: number) => void;
  onRowDoubleClick?: (row: TableRow, index: number) => void;
  rowClassName?: string | ((row: TableRow, index: number) => string);
  loading?: boolean;
  emptyStateMessage?: string;
  className?: string;
}

export interface TablePaginationProps {
  pagination: PaginationConfig;
  _onPageChange: (page: number) => void;
  _onPageSizeChange: (pageSize: number) => void;
  showSizeSelector?: boolean;
  className?: string;
}

export interface TableFiltersProps {
  columns: TableColumn[];
  filters: FilterConfig[];
  _onFiltersChange: (filters: FilterConfig[]) => void;
  _onClearFilters: () => void;
  className?: string;
}

export interface TableToolbarProps {
  searchQuery: string;
  _onSearchChange: (query: string) => void;
  selectedCount: number;
  totalCount: number;
  onExport?: (format: "csv" | "json" | "xlsx") => void;
  onRefresh?: () => void;
  onColumnToggle?: () => void;
  density: DensityMode;
  _onDensityChange: (density: DensityMode) => void;
  enableSearch?: boolean;
  enableExport?: boolean;
  enableRefresh?: boolean;
  enableColumnToggle?: boolean;
  enableDensity?: boolean;
  className?: string;
}

export interface ColumnToggleProps {
  columns: TableColumn[];
  columnVisibility: ColumnVisibility;
  _onVisibilityChange: (_visibility: ColumnVisibility) => void;
  className?: string;
}

// Action interfaces
export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  onClick: (row: TableRow) => void;
  disabled?: (row: TableRow) => boolean;
  variant?: "primary" | 'secondary" | "danger";
  tooltip?: string;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: string;
  onClick: (selectedRows: TableRow[]) => void;
  disabled?: (selectedRows: TableRow[]) => boolean;
  variant?: "primary" | 'secondary" | "danger";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Filter option interfaces
export interface FilterOption {
  label: string;
  value: unknown;
}

export interface NumberRangeFilter {
  _min: number;
  _max: number;
}

export interface DateRangeFilter {
  _start: Date;
  _end: Date;
}

// Event types
export interface TableEvent {
  type: 'sort" | "filter" | 'select" | 'search" | "export" | "row_click" | "row_double_click";
  data: unknown;
  _timestamp: Date;
  userId?: string;
}

// API response types
export interface TableApiResponse {
  data: TableRow[];
  total: number;
  page: number;
  pageSize: number;
  _hasNextPage: boolean;
  _hasPreviousPage: boolean;
}

// Utility types
export type _TableData = TableRow[];
export type _ColumnConfig = Omit<TableColumn, 'render'>;
export type _SortableColumns = Record<string, boolean>;
export type _FilterableColumns = Record<string, FilterType>;

// Configuration interfaces
export interface TableConfig {
  _defaultPageSize: number;
  pageSizeOptions: number[];
  _maxPageSize: number;
  _enableVirtualization: boolean;
  stickyHeader: boolean;
  _stickyColumns: boolean;
  _resizableColumns: boolean;
  _sortableColumns: boolean;
  _filterableColumns: boolean;
  _searchableColumns: boolean;
  _exportFormats: ("csv" | "json" | "xlsx")[];
  _densityOptions: DensityMode[];
  selectionMode: SelectionMode;
}

export interface TableTheme {
  _colors: {
    _headerBackground: string;
    _headerText: string;
    _rowBackground: string;
    _rowBackgroundAlt: string;
    _rowText: string;
    _border: string;
    _selectedRow: string;
    _hoverRow: string;
  };
  _spacing: {
    _cellPadding: string;
    _rowHeight: string;
    _headerHeight: string;
  };
  _typography: {
    _fontSize: string;
    _fontWeight: string;
    _lineHeight: string;
  };
}
