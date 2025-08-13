import { generateStamp } from "@/lib/utils/timestamp";
"use client";
/**
 * project-showcase.consolidated.tsx - Consolidated ProjectShowcase Component
 *
 * Reduces from 22 props to 5 props using productive defaults:
 * - Removes micro-config (showFilters, showSearch, showCategories, etc.)
 * - Removes callback soup (onProjectClick, onFilterChange, onSortChange, etc.)
 * - Removes viewMode complexity (grid/list switching)
 * - Uses once-on-mount configuration
 * - Applies productive defaults from usage patterns
 */

import React, { useState, useMemo } from "react";
import { ClientOnly } from "../../../patterns/boundary-patterns";

// Consolidated interface - 5 props maximum
interface ProjectShowcaseConsolidatedProps {
  projects?: Project[];
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  "data-testid"?: string;
}

// Productive defaults (all features enabled by default)
const SHOWCASE_DEFAULTS = {
  viewMode: "grid" as const,
  showFilters: true,
  showSearch: true,
  showStats: true,
  animateOnScroll: true,
  itemsPerPage: 12,
  sortBy: "updated" as const,
};

// Types (simplified)
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image?: string;
  url?: string;
  github?: string;
  status: "active" | "completed" | "archived";
  updated: string;
  created: string;
}

interface ProjectFilter {
  category: string;
  status: string;
  search: string;
}

export const ProjectShowcaseConsolidated: React.FC<
  ProjectShowcaseConsolidatedProps
> = ({
  projects = [],
  disabled = false,
  className,
  loading = false,
  "data-testid": testId = "project-showcase-consolidated",
}) => {
  // Once-on-mount configuration
  const [filter, setFilter] = useState<ProjectFilter>({
    category: "all",
    status: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">(
    "updated",
  );

  // Get unique categories from projects
  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p) => p.category)));
    return ["all", ...cats.sort()];
  }, [projects]);

  // Get unique statuses from projects
  const statuses = useMemo(() => {
    const stats = Array.from(new Set(projects.map((p) => p.status)));
    return ["all", ...stats.sort()];
  }, [projects]);

  // Filtered and sorted projects
  const processedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by category
    if (filter.category !== "all") {
      result = result.filter((project) => project.category === filter.category);
    }

    // Filter by status
    if (filter.status !== "all") {
      result = result.filter((project) => project.status === filter.status);
    }

    // Filter by search
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case "updated":
        default:
          return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      }
    });

    return result;
  }, [projects, filter, sortBy]);

  const handleSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilter((prev) => ({ ...prev, category }));
  };

  const handleStatusFilter = (status: string) => {
    setFilter((prev) => ({ ...prev, status }));
  };

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: <ShowcaseLoadingSkeleton />,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <div
        className={`project-showcase-consolidated ${className || ""}`}
        data-testid={testId}
        data-loading={loading}
        data-projects={processedProjects.length}
      >
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search projects..."
              value={filter.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <select
              value={filter.category}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filter.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Showing {processedProjects.length} of {projects.length} projects
        </div>

        {/* Projects Grid */}
        {loading ? (
          <ShowcaseLoadingSkeleton />
        ) : processedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-gray-500 dark:text-gray-400">
              No projects match your filters
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Development debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 right-2 z-50 pointer-events-none text-xs font-mono bg-purple-600 text-white px-2 py-1 rounded">
            🚀 Projects: {processedProjects.length} shown, 5 props
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

// Project card component
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const handleClick = () => {
    if (project.url) {
      window.open(project.url, "_blank");
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            project.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : project.status === "completed"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {project.status}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {project.category}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
        {project.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {project.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
          >
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
            +{project.tags.length - 3}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center space-x-3 text-sm">
        {project.url && (
          <span className="text-blue-600 dark:text-blue-400 hover:underline">
            View Project
          </span>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  );
};

// Loading skeleton
const ShowcaseLoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <div className="flex justify-between mb-3">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="flex gap-1 mb-4">
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export default ProjectShowcaseConsolidated;
