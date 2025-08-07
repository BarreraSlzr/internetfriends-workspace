"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eventSystem, UIEvents } from "../../../../../lib/events/event.system";
import styles from "./data-table.styles.module.scss";

// Define types inline to avoid module resolution issues
type ColumnType = "string" | "number" | "date" | "boolean" | "custom";
type SortDirection = "asc" | "desc";

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
}

interface SortConfig {
  column: string;
  direction: SortDirection;
}

interface FilterConfig {
  value: unknown;
  type: string;
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

interface SelectionConfig {
  _enabled: boolean;
  _multiple: boolean;
}

interface DataTableProps {
  data: unknown[];
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
  className?: string;
  [key: string]: unknown;
}

type TableRow = any;

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
  virtualScrolling = false,
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>
  >({});

  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Initialize column visibility
  useEffect(() => {
    const initialVisibility = columns.reduce(
      (acc: unknown, col: unknown) => {
        acc[col.key] = col.visible !== false;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setColumnVisibility(initialVisibility);
  }, [columns]);

  // Data processing
  const processedData = useMemo(() => {
    let result = [...data];

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
        columns.some((col: unknown) => {
          if (!columnVisibility[col.key]) return false;
          const value = row[col.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }),
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];

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
    (columnKey: string, value: unknown, type: string = "text") => {
      if (!filterable) return;

      const newFilters = {
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
    (rowId: string, selected: boolean) => {
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

      const newSelection = selected
        ? new Set(visibleData.map((row) => row.id))
        : new Set<string>();

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
      UIEvents.interaction("table_row_click", row.id, userId, sessionId);
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
      <th key={column.key} className={`
          ${styles.headerCell}
          ${sortable && column.sortable !== false ? styles.sortable : ""}
          ${isSorted ? styles._sorted : ""}
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

    return (
      <div
        className={styles.filterContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={filterValue}
          onChange={(e) => handleFilter(column.key, e.target.value, "text")}
          placeholder={`Filter ${column.header}...`}
          className={styles.filterInput}
        />
      </div>
    );
  };

  // Render table cell
  const renderCell = (row: TableRow, column: TableColumn, _rowIndex: number) => {
    const value = row[column.key];
    let displayValue = value;

    // Apply column formatting
    if (column.type === "date" && value) {
      displayValue = new Date(value).toLocaleDateString();
    } else if (column.type === "number" && typeof value === "number") {
      displayValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } else if (column.type === "boolean") {
      displayValue = value ? "✓" : "✗";
    }

    return (
      <td key={column.key} className={`
          ${styles.cell}
          ${column.align ? styles[`align-${column.align}`] : ""}
        `}
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
            <button key={page} onClick={() => handlePageChange(page)}
              className={`${styles.paginationButton}${page === currentPage ? styles.active : ""}`}
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
        _staggerChildren: 0.02,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { _duration: 0.3 },
    },
  };

  if (error) {
    return (
      <div className={`${styles.container}${styles.error} ${className || ""}`}>
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
      className={`${styles.container}${compact ? styles.compact : ""}
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
          className={`${styles.table}${zebra ? styles.zebra : ""}
            ${stickyHeader ? styles.stickyHeader : ""}
          `}
          variants={containerVariants}
          _initial="hidden"
          _animate="visible"
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
                    <tr key={row.id} className={`${styles.row}${selectedRows.has(row.id) ? styles.selected : ""}
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
                      .map((col) => renderCell(row, col, index))}
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
