import { generateStamp } from "@/lib/utils/timestamp";
("use client");
/**
 * data-table.consolidated.tsx - Consolidated DataTable Component
 *
 * Reduces from 28 props to 6 props using productive defaults:
 * - Removes micro-config (sortable, filterable, searchable, etc.)
 * - Removes callback soup (onSort, onFilter, onExport, etc.)
 * - Uses once-on-mount configuration
 * - Applies productive defaults from usage patterns
 */

import React, { useState, useMemo } from "react";
import { ClientOnly } from "../../../patterns/boundary-patterns";

// Consolidated interface - 6 props maximum
interface DataTableConsolidatedProps {
  data: TableRow[];
  columns: TableColumn[];
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  "data-testid"?: string;
}

// Productive defaults (all features enabled by default)
const TABLE_DEFAULTS = {
  sortable: true,
  filterable: true,
  paginated: true,
  searchable: true,
  exportable: true,
  stickyHeader: true,
  showRowNumbers: true,
  pageSize: 25,
};

// Types (simplified)
interface TableRow {
  id: string | number;
  [key: string]: any;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

export const DataTableConsolidated: React.FC<DataTableConsolidatedProps> = ({
  data,
  columns,
  disabled = false,
  className,
  loading = false,
  "data-testid": testId = "data-table-consolidated",
}) => {
  // Once-on-mount configuration
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const modifier = sortConfig.direction === "desc" ? -1 : 1;

        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / TABLE_DEFAULTS.pageSize);
  const startIndex = (currentPage - 1) * TABLE_DEFAULTS.pageSize;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + TABLE_DEFAULTS.pageSize,
  );

  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction:
        prev?.key === columnKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExport = () => {
    const csv = [
      columns.map((col) => col.label).join(","),
      ...processedData.map((row) =>
        columns.map((col) => row[col.key]).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: <TableLoadingSkeleton />,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <div
        className={`data-table-consolidated ${className || ""}`}
        data-testid={testId}
        data-loading={loading}
        data-rows={processedData.length}
      >
        {/* Search and Export Bar */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                {TABLE_DEFAULTS.showRowNumbers && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortConfig?.key === column.key && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {TABLE_DEFAULTS.showRowNumbers && (
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginatedData.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {TABLE_DEFAULTS.showRowNumbers && (
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {startIndex + rowIndex + 1}
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100"
                        >
                          {String(row[column.key] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1}-
            {Math.min(
              startIndex + TABLE_DEFAULTS.pageSize,
              processedData.length,
            )}{" "}
            of {processedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Development debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 right-2 z-50 pointer-events-none text-xs font-mono bg-green-600 text-white px-2 py-1 rounded">
            📊 DataTable: {processedData.length} rows, 6 props
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

// Loading skeleton
const TableLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex gap-4">
      <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="h-12 bg-gray-100 dark:bg-gray-800" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
      ))}
    </div>
  </div>
);

export default DataTableConsolidated;
