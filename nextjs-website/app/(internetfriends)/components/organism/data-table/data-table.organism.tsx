"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UIEvents } from "../../../../../lib/events/event.system";
import styles from "./data-table.styles.module.scss";

// Define types inline to avoid module resolution issues
type ColumnType = "string" | "number" | "date" | "boolean" | "custom";
type SortDirection = "asc" | "desc";

interface TableRow {
  id: string | number;
  [key: string]: React.ReactNode;
}

interface TableColumn {
  key: string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  fixed?: boolean;
  visible?: boolean;
  format?: (value: React.ReactNode, row: TableRow) => React.ReactNode;
}

interface SortConfig {
  column: string;
  direction: SortDirection;
}

interface FilterConfig {
  value: React.ReactNode;
  type: "text" | "number" | "date" | "boolean" | "select";
}

interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// SelectionConfig interface commented out as it's not used
// interface SelectionConfig {
//   enabled: boolean;
//   multiple?: boolean;
//   selectAll?: boolean;
// }

interface DataTableProps {
  data: TableRow[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string | null;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  selectable?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  virtualScrolling?: boolean;
  stickyHeader?: boolean;
  zebra?: boolean;
  compact?: boolean;
  showRowNumbers?: boolean;
  className?: string;
  userId?: string;
  sessionId?: string;
  onRowClick?: (row: TableRow, index: number) => void;
  onRowSelect?: (rows: (string | number)[]) => void;
  onSort?: (config: SortConfig) => void;
  onFilter?: (filters: Record<string, FilterConfig>) => void;
  onExport?: (payload: {
    data: TableRow[];
    filters: Record<string, FilterConfig>;
    sort: SortConfig | null;
    search: string;
  }) => void;
  onRefresh?: () => void;
  [key: string]: unknown;
}

// (legacy) TableRow type replaced by interface above

export const DataTableOrganism: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  error = null,
  sortable = true,
  filterable = true,
  paginated = true,
  selectable = false,
  searchable = true,
  exportable = true,
  // virtualScrolling = false, // Feature not yet implemented
  stickyHeader = true,
  zebra = true,
  compact = false,
  showRowNumbers = false,
  onRowClick,
  onRowSelect,
  onSort,
  onFilter,
  onExport,
  onRefresh,
  className,
  userId,
  sessionId,
  ...props
}) => {
  // State Management
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, FilterConfig>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Initialize column visibility
  useEffect(() => {
    const initialVisibility = columns.reduce<Record<string, boolean>>(
      (acc, col) => {
        acc[col.key] = col.visible !== false;
        return acc;
      },
      {},
    );
    setColumnVisibility(initialVisibility);
  }, [columns]);

  // Data processing
  const processedData = useMemo<TableRow[]>(() => {
    let result: TableRow[] = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, filter]) => {
      if (
        filter.value !== "" &&
        filter.value !== null &&
        filter.value !== undefined
      ) {
        result = result.filter((row) => {
          const cellValue = row[key];
          const filterValue = filter.value;

          switch (filter.type) {
            case "text":
              return String(cellValue)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
            case "number":
              return Number(cellValue) === Number(filterValue);
            case "date":
              if (cellValue == null || filterValue == null) return false;
              if (
                (typeof cellValue !== "string" &&
                  typeof cellValue !== "number" &&
                  !(cellValue instanceof Date)) ||
                (typeof filterValue !== "string" &&
                  typeof filterValue !== "number" &&
                  !(filterValue instanceof Date))
              )
                return false;
              return (
                new Date(cellValue).toDateString() ===
                new Date(filterValue).toDateString()
              );
            case "boolean":
              return Boolean(cellValue) === Boolean(filterValue);
            case "select":
              return cellValue === filterValue;
            default:
              return true;
          }
        });
      }
    });

    // Apply search
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((col) => {
          if (!columnVisibility[col.key]) return false;
          const value = row[col.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }),
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a: TableRow, b: TableRow) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return sortConfig.direction === "desc" ? comparison * -1 : comparison;
      });
    }

    return result;
  }, [data, filters, searchTerm, sortConfig, columns, columnVisibility]);

  // Pagination
  const paginationConfig = useMemo((): PaginationConfig => {
    const totalRows = processedData.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);

    return {
      currentPage,
      pageSize,
      totalRows,
      totalPages,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    };
  }, [processedData.length, currentPage, pageSize]);

  // Get visible data based on pagination
  const visibleData = useMemo(() => {
    if (!paginated) return processedData;
    return processedData.slice(
      paginationConfig.startIndex,
      paginationConfig.endIndex,
    );
  }, [processedData, paginationConfig, paginated]);

  // Event Handlers
  const handleSort = useCallback(
    (columnKey: string) => {
      if (!sortable) return;

      const direction =
        sortConfig?.column === columnKey && sortConfig.direction === "asc"
          ? "desc"
          : "asc";

      const newSortConfig = {
        column: columnKey,
        direction: direction as SortDirection,
      };
      setSortConfig(newSortConfig);
      onSort?.(newSortConfig);

      UIEvents.interaction(
        "table_sort",
        `${columnKey}_${direction}`,
        userId,
        sessionId,
      );
    },
    [sortConfig, sortable, onSort, userId, sessionId],
  );

  const handleFilter = useCallback(
    (columnKey: string, value: string, type: FilterConfig["type"] = "text") => {
      if (!filterable) return;

      const newFilters: Record<string, FilterConfig> = {
        ...filters,
        [columnKey]: { value, type },
      };

      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filtering
      onFilter?.(newFilters);

      UIEvents.interaction("table_filter", columnKey, userId, sessionId);
    },
    [filters, filterable, onFilter, userId, sessionId],
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      UIEvents.interaction("table_search", term, userId, sessionId);
    },
    [userId, sessionId],
  );

  const handleRowSelect = useCallback(
    (rowId: string | number, selected: boolean) => {
      if (!selectable) return;

      const newSelection = new Set(selectedRows);
      if (selected) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }

      setSelectedRows(newSelection);
      onRowSelect?.(Array.from(newSelection));

      UIEvents.interaction(
        "table_row_select",
        `${rowId}_${selected}`,
        userId,
        sessionId,
      );
    },
    [selectedRows, selectable, onRowSelect, userId, sessionId],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (!selectable) return;

      const newSelection: Set<string | number> = selected
        ? new Set<string | number>(visibleData.map((row) => row.id))
        : new Set<string | number>();

      setSelectedRows(newSelection);
      onRowSelect?.(Array.from(newSelection));

      UIEvents.interaction(
        "table_select_all",
        String(selected),
        userId,
        sessionId,
      );
    },
    [visibleData, selectable, onRowSelect, userId, sessionId],
  );

  const handleRowClick = useCallback(
    (row: TableRow, index: number) => {
      onRowClick?.(row, index);
      UIEvents.interaction(
        "table_row_click",
        String(row.id),
        userId,
        sessionId,
      );
    },
    [onRowClick, userId, sessionId],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      UIEvents.interaction("table_pagination", String(page), userId, sessionId);
    },
    [userId, sessionId],
  );

  const handleExport = useCallback(() => {
    if (!exportable) return;

    const exportData = {
      data: processedData,
      filters,
      sort: sortConfig,
      search: searchTerm,
    };

    onExport?.(exportData);
    UIEvents.interaction("table_export", "csv", userId, sessionId);
  }, [
    processedData,
    filters,
    sortConfig,
    searchTerm,
    exportable,
    onExport,
    userId,
    sessionId,
  ]);

  // Render column header
  const renderColumnHeader = (column: TableColumn) => {
    const isSorted = sortConfig?.column === column.key;
    const sortDirection = sortConfig?.direction;

    return (
      <th
        key={column.key}
        className={`
          ${styles.headerCell}
          ${sortable && column.sortable !== false ? styles.sortable : ""}
          ${isSorted ? styles.sorted : ""}
          ${column.align ? styles[`align-${column.align}`] : ""}
        `}
        onClick={() => column.sortable !== false && handleSort(column.key)}
        style={{ width: column.width }}
      >
        <div className={styles.headerContent}>
          <span className={styles.headerText}>{column.header}</span>
          {sortable && column.sortable !== false && (
            <div className={styles.sortIndicator}>
              {!isSorted && <span className={styles.sortNeutral}>⇅</span>}
              {sortDirection === "asc" && (
                <span className={styles.sortAsc}>↑</span>
              )}
              {sortDirection === "desc" && (
                <span className={styles.sortDesc}>↓</span>
              )}
            </div>
          )}
        </div>
        {filterable &&
          column.filterable !== false &&
          renderColumnFilter(column)}
      </th>
    );
  };

  // Render column filter
  const renderColumnFilter = (column: TableColumn) => {
    const filterValue = filters[column.key]?.value || "";
    const stringValue =
      typeof filterValue === "string" ? filterValue : String(filterValue || "");

    return (
      <div
        className={styles.filterContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={stringValue}
          onChange={(e) => handleFilter(column.key, e.target.value)}
          placeholder={`Filter ${column.header}...`}
          className={styles.filterInput}
        />
      </div>
    );
  };

  // Render table cell
  const renderCell = (row: TableRow, column: TableColumn) => {
    const value = row[column.key];
    let displayValue: React.ReactNode = value;

    // Apply column formatting
    if (
      column.type === "date" &&
      value &&
      (typeof value === "string" ||
        typeof value === "number" ||
        value instanceof Date)
    ) {
      displayValue = new Date(value).toLocaleDateString();
    } else if (column.type === "number" && typeof value === "number") {
      displayValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } else if (column.type === "boolean") {
      displayValue = value ? "Yes" : "No";
    }

    // Apply custom formatting if provided
    if (column.format) {
      displayValue = column.format(value, row);
    }

    return (
      <td
        key={column.key}
        className={`${styles.cell} ${column.align ? styles[`align-${column.align}`] : ""}`}
        style={{ width: column.width, minWidth: column.minWidth }}
      >
        {displayValue}
      </td>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (!paginated || paginationConfig.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNext, hasPrevious } = paginationConfig;
    const pages = [];

    // Calculate page range
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {paginationConfig.startIndex + 1}-{paginationConfig.endIndex}{" "}
          of {processedData.length}
        </div>
        <div className={styles.paginationControls}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={!hasPrevious}
            className={styles.paginationButton}
            title="First page"
          >
            ⟪
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className={styles.paginationButton}
            title="Previous page"
          >
            ⟨
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.paginationButton} ${page === currentPage ? styles.active : ""}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
            className={styles.paginationButton}
            title="Next page"
          >
            ⟩
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={!hasNext}
            className={styles.paginationButton}
            title="Last page"
          >
            ⟫
          </button>
        </div>
        <div className={styles.pageSizeSelector}>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={styles.pageSizeSelect}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (error) {
    return (
      <div className={`${styles.container} ${styles.error} ${className || ""}`}>
        <div className={styles.errorContent}>
          <h3>⚠️ Table Error</h3>
          <p>{error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className={styles.retryButton}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${styles.container}
        ${compact ? styles.compact : ""}
        ${className || ""}
      `}
      {...props}
    >
      {/* Table Header Actions */}
      <div className={styles.tableHeader}>
        <div className={styles.tableActions}>
          {searchable && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search table..."
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          )}
          {exportable && (
            <button
              onClick={handleExport}
              className={styles.exportButton}
              title="Export data"
            >
              📥 Export
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={styles.refreshButton}
              title="Refresh data"
            >
              ↻
            </button>
          )}
        </div>
        {selectable && selectedRows.size > 0 && (
          <div className={styles.selectionActions}>
            <span className={styles.selectionCount}>
              {selectedRows.size} selected
            </span>
            <button
              onClick={() => setSelectedRows(new Set())}
              className={styles.clearSelection}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className={styles.tableContainer}>
        <motion.table
          ref={tableRef}
          className={`
            ${styles.table}
            ${zebra ? styles.zebra : ""}
            ${stickyHeader ? styles.stickyHeader : ""}
          `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Table Header */}
          <thead ref={headerRef} className={styles.header}>
            <tr className={styles.headerRow}>
              {selectable && (
                <th className={styles.selectColumn}>
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === visibleData.length &&
                      visibleData.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className={styles.selectCheckbox}
                  />
                </th>
              )}
              {showRowNumbers && <th className={styles.rowNumberColumn}>#</th>}
              {columns
                .filter((col) => columnVisibility[col.key])
                .map(renderColumnHeader)}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={styles.body}>
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (showRowNumbers ? 1 : 0)
                    }
                    className={styles.loadingCell}
                  >
                    <div className={styles.loadingContent}>
                      <div className={styles.spinner}></div>
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (showRowNumbers ? 1 : 0)
                    }
                    className={styles.emptyCell}
                  >
                    <div className={styles.emptyContent}>
                      <span className={styles.emptyIcon}>📋</span>
                      <span>No data available</span>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    className={`
                      ${styles.row}
                      ${selectedRows.has(row.id) ? styles.selected : ""}
                      ${onRowClick ? styles.clickable : ""}
                    `}
                    variants={rowVariants}
                    onClick={() => handleRowClick(row, index)}
                  >
                    {selectable && (
                      <td className={styles.selectColumn}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={(e) =>
                            handleRowSelect(row.id, e.target.checked)
                          }
                          className={styles.selectCheckbox}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {showRowNumbers && (
                      <td className={styles.rowNumberColumn}>
                        {paginationConfig.startIndex + index + 1}
                      </td>
                    )}
                    {columns
                      .filter((col) => columnVisibility[col.key])
                      .map((col) => renderCell(row, col))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>

      {/* Table Footer */}
      {paginated && renderPagination()}
    </div>
  );
};

export default DataTableOrganism;
