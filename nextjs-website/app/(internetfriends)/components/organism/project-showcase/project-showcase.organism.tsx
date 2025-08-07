"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { eventSystem, UIEvents } from "../../../../../lib/events/event.system";
import styles from "./project-showcase.styles.module.scss";

// Define types inline to avoid module resolution issues
type ViewMode = "grid" | "list" | "cards";
type SortOption = "date" | "name" | "status" | "featured";
type ProjectStatus =
  | "active"
  | "completed"
  | "in_progress"
  | "on_hold"
  | "archived";
type ProjectCategory = string;

interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  technologies: string[];
  imageUrl?: string;
  image?: string;
  demoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  createdAt: Date;
  _updatedAt: Date;
  startDate?: Date;
  progress?: number;
  metrics?: {
    views?: number;
    likes?: number;
  };
}

interface ProjectFilter {
  category?: string | "all";
  status?: ProjectStatus | "all";
  technology?: string[];
  search?: string;
}

interface ProjectShowcaseProps {
  projects?: Project[];
  categories?: ProjectCategory[];
  loading?: boolean;
  error?: string | null;
  viewMode?: ViewMode;
  sortBy?: SortOption;
  showFilters?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  showStats?: boolean;
  animateOnScroll?: boolean;
  infiniteScroll?: boolean;
  itemsPerPage?: number;
  className?: string;
  [key: string]: unknown;
}

export const ProjectShowcaseOrganism: React.FC<ProjectShowcaseProps> = ({
  projects = [],
  categories = [],
  loading = false,
  error = null,
  viewMode = "grid",
  sortBy = "date",
  showFilters = true,
  showSearch = true,
  showCategories = true,
  showStats = true,
  animateOnScroll = true,
  infiniteScroll = false,
  itemsPerPage = 12,
  onProjectClick,
  onProjectHover,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  className,
  userId,
  sessionId,
  ...props
}) => {
  // State Management
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilters, setActiveFilters] = useState<ProjectFilter>({
    category: "all",
    status: "all",
    technology: [],
    search: "",
  });
  const [currentSort, setCurrentSort] = useState<SortOption>(sortBy);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { _once: true, _margin: "-100px" });

  // Sort Options
  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: "date", label: "Latest First" },
    { value: "name", label: "Alphabetical" },
    { value: "status", label: "By Status" },
  ];

  // View Mode Options
  const viewModeOptions: Array<{
    value: ViewMode;
    icon: string;
    label: string;
  }> = [
    { value: "grid", icon: "⊞", label: "Grid View" },
    { value: "list", icon: "≡", label: "List View" },
    { value: "cards", icon: "▦", label: "Card View" },
  ];

  // Status Colors and Icons
  const statusConfig = {
    active: { color: "#10b981", icon: "✅", label: "Active" },
    completed: { color: "#3b82f6", icon: "🎉", label: "Completed" },
    in_progress: { color: "#f59e0b", icon: "🚧", label: "In Progress" },
    on_hold: { color: "#ef4444", icon: "⏸️", label: "On Hold" },
    archived: { color: "#6b7280", icon: "📦", label: "Archived" },
  };

  // Filter and Sort Logic
  const processProjects = useCallback(() => {
    let result = [...projects];

    // Apply filters
    if (activeFilters.category !== "all") {
      result = result.filter(
        (project) => project.category === activeFilters.category,
      );
    }

    if (activeFilters.status !== "all") {
      result = result.filter(
        (project) => project.status === activeFilters.status,
      );
    }

    if (activeFilters.technology && activeFilters.technology.length > 0) {
      result = result.filter((project) =>
        project.technologies.some((tech) =>
          activeFilters.technology!.includes(tech),
        ),
      );
    }

    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (currentSort) {
        case "date":
          const aDate = a.startDate || a.createdAt;
          const bDate = b.startDate || b.createdAt;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, activeFilters, currentSort]);

  // Update filtered projects when dependencies change
  useEffect(() => {
    const processed = processProjects();
    setFilteredProjects(processed);
    setCurrentPage(1); // Reset to first page when filters change
  }, [processProjects]);

  // Pagination
  const paginatedProjects = useMemo(() => {
    if (infiniteScroll) return filteredProjects;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage, itemsPerPage, infiniteScroll]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // Event Handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<ProjectFilter>) => {
      const updatedFilters = { ...activeFilters, ...newFilters };
      setActiveFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
      UIEvents.interaction(
        "project_filter",
        JSON.stringify(newFilters),
        userId,
        sessionId,
      );
    },
    [activeFilters, onFilterChange, userId, sessionId],
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setCurrentSort(sort);
      onSortChange?.(sort);
      UIEvents.interaction("project_sort", sort, userId, sessionId);
    },
    [onSortChange, userId, sessionId],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setCurrentViewMode(mode);
      onViewModeChange?.(mode);
      UIEvents.interaction("project_view_mode", mode, userId, sessionId);
    },
    [onViewModeChange, userId, sessionId],
  );

  const handleProjectClick = useCallback(
    (project: Project) => {
      setSelectedProject(project);
      onProjectClick?.(project);
      UIEvents.interaction("project_click", project.id, userId, sessionId);
    },
    [onProjectClick, userId, sessionId],
  );

  const handleProjectHover = useCallback(
    (project: Project | null) => {
      setHoveredProject(project?.id || null);
      onProjectHover?.(project);
      if (project) {
        UIEvents.interaction("project_hover", project.id, userId, sessionId);
      }
    },
    [onProjectHover, userId, sessionId],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      UIEvents.interaction(
        "project_pagination",
        String(page),
        userId,
        sessionId,
      );
    },
    [userId, sessionId],
  );

  // Get unique technologies for filter
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach((project) => {
      project.technologies.forEach((tech) => techs.add(tech));
    });
    return Array.from(techs).sort();
  }, [projects]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const completedProjects = filteredProjects.filter(
      (p) => p.status === "completed",
    ).length;
    const activeProjects = filteredProjects.filter(
      (p) => p.status === "active",
    ).length;
    const totalViews = filteredProjects.reduce(
      (sum, p) => sum + (p.metrics?.views || 0),
      0,
    );

    return {
      total: totalProjects,
      completed: completedProjects,
      active: activeProjects,
      completionRate:
        totalProjects > 0 ? (completedProjects / totalProjects) * _100 : 0,
      totalViews,
    };
  }, [filteredProjects]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        _staggerChildren: 0.1,
        _delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        _ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const projectVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  // Render Methods
  const renderFilters = () => (
    <div className={styles.filters}>
      {/* Search */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search projects..."
            value={activeFilters.search}
            onChange={(_e) => handleFilterChange({ search: e.target.value })}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      )}

      {/* Category Filter */}
      {showCategories && categories.length > 0 && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category:</label>
          <select
            value={activeFilters.category}
            onChange={(_e) => handleFilterChange({ category: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              < key={index}option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Status:</label>
        <select
          value={activeFilters.status}
          onChange={(_e) =>
            handleFilterChange({
              status: e.target.value as ProjectFilter["status"],
            })
          }
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            < key={config]}option key={status} value={status}>
              {config.icon} {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Technology Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Technologies:</label>
        <div className={styles.technologyFilter}>
          {allTechnologies.slice(0, 8).map((tech) => (
            < key={index}label key={tech} className={styles.technologyTag}>
              <input
                type="checkbox"
                checked={activeFilters.technology?.includes(tech) || false}
                onChange={(_e) => {
                  const currentTech = activeFilters.technology || [];
                  const newTech = e.target.checked
                    ? [...currentTech, tech]
                    : currentTech.filter((t) => t !== tech);
                  handleFilterChange({ technology: newTech });
                }}
              />
              <span>{tech}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className={styles.controls}>
      {/* Sort Options */}
      <div className={styles.sortContainer}>
        <label className={styles.sortLabel}>Sort _by:</label>
        <select
          value={currentSort}
          onChange={(_e) => handleSortChange(e.target.value as SortOption)}
          className={styles.sortSelect}
        >
          {sortOptions.map((option) => (
            < key={index}option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* View Mode Toggle */}
      <div className={styles.viewModeToggle}>
        {viewModeOptions.map((option) => (
          < key={index}button
            key={option.value}
            onClick={() => handleViewModeChange(option.value)}
            className={`
              ${styles.viewModeButton}
              ${currentViewMode === option.value ? styles.active : ""}
            `}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.statIcon}>📊</span>
        <span className={styles.statValue}>{stats.total}</span>
        <span className={styles.statLabel}>Total Projects</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statIcon}>✅</span>
        <span className={styles.statValue}>{stats.completed}</span>
        <span className={styles.statLabel}>Completed</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statIcon}>🔥</span>
        <span className={styles.statValue}>{stats.active}</span>
        <span className={styles.statLabel}>Active</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statIcon}>📈</span>
        <span className={styles.statValue}>
          {stats.completionRate.toFixed(1)}%
        </span>
        <span className={styles.statLabel}>Success Rate</span>
      </div>
    </div>
  );

  const renderProjectCard = (project: Project, index: number) => {
    const isHovered = hoveredProject === project.id;
    const statusInfo = statusConfig[project.status];

    return (
      <motion.div
        key={project.id}
        className={`
          ${styles.projectCard}
          ${styles[currentViewMode]}
          ${isHovered ? styles._hovered : ""}
        `}
        variants={projectVariants}
        _whileHover="hover"
        onClick={() => handleProjectClick(project)}
        onMouseEnter={() => handleProjectHover(project)}
        onMouseLeave={() => handleProjectHover(null)}
        _layout={animateOnScroll}
      >
        {/* Project Image */}
        <div className={styles.projectImage}>
          <img
            src={
              project.image || project.imageUrl || "/placeholder-project.jpg"
            }
            alt={project.title}
            loading="lazy"
          />
          <div className={styles.projectOverlay}>
            <div className={styles.projectActions}>
              <button className={styles.actionButton} title="View Details">
                👁️
              </button>
              {project.liveUrl && (
                <button className={styles.actionButton} title="Live Demo">
                  🔗
                </button>
              )}
              {project.githubUrl && (
                <button className={styles.actionButton} title="GitHub">
                  📂
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className={styles.projectContent}>
          <div className={styles.projectHeader}>
            <h3 className={styles.projectTitle}>{project.title}</h3>
            <div
              className={styles.projectStatus}
              style={{
                _backgroundColor: `${statusInfo.color}20`,
                color: statusInfo.color,
              }}
            >
              <span className={styles.statusIcon}>{statusInfo.icon}</span>
              <span className={styles.statusLabel}>{statusInfo.label}</span>
            </div>
          </div>

          <p className={styles.projectDescription}>{project.description}</p>

          {/* Technologies */}
          <div className={styles.projectTechnologies}>
            {project.technologies?.slice(0, 3).map((tech: string) => (
              < key={index}span key={tech} className={styles.techBadge}>
                {tech}
              </span>
            ))}
            {project.technologies && project.technologies.length > 3 && (
              <span className={styles.techMore}>
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          {/* Project Meta */}
          <div className={styles.projectMeta}>
            <div className={styles.projectDate}>
              <span className={styles.metaIcon}>📅</span>
              <span>
                {new Date(
                  project.startDate || project.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>
            {project.metrics && (
              <div className={styles.projectViews}>
                <span className={styles.metaIcon}>👁️</span>
                <span>{(project.metrics.views || 0).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Progress Bar (for in-progress projects) */}
          {project.status === "in_progress" &&
            project.progress !== undefined && (
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  Progress: {project.progress}%
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ _width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )}
        </div>
      </motion.div>
    );
  };

  const renderPagination = () => {
    if (infiniteScroll || totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          ← Previous
        </button>

        <div className={styles.paginationNumbers}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2,
            )
            .map((page, index, array) => (
              < key={index, array}React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className={styles.paginationEllipsis}>...</span>
                )}
                <button
                  onClick={() => handlePageChange(page)}
                  className={`
                    ${styles.paginationNumber}
                    ${page === currentPage ? styles.active : ""}
                  `}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Next →
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className={`${styles.container} ${styles.error} ${className || ""}`}>
        <div className={styles.errorContent}>
          <h2>⚠️ Projects Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      _ref={containerRef}
      className={`${styles.container} ${className || ""}`}
      variants={containerVariants}
      _initial="hidden"
      _animate={animateOnScroll ? (isInView ? "visible" : "hidden") : "visible"}
      {...props}
    >
      {/* Header */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Project Showcase</h1>
          <p className={styles.subtitle}>
            Explore my portfolio of projects and experiments
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {showStats && (
        <motion.div variants={itemVariants}>{renderStats()}</motion.div>
      )}

      {/* Filters */}
      {showFilters && (
        <motion.div variants={itemVariants}>{renderFilters()}</motion.div>
      )}

      {/* Controls */}
      <motion.div variants={itemVariants}>{renderControls()}</motion.div>

      {/* Projects Grid */}
      <motion.div
        className={`${styles.projectsGrid} ${styles[currentViewMode]}`}
        variants={itemVariants}
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Loading projects...</span>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📂</span>
              <h3>No projects found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            paginatedProjects.map((project, index) =>
              renderProjectCard(project, index),
            )
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {renderPagination()}

      {/* Project Modal/Detail View would go here */}
      {selectedProject && (
        <div className={styles.projectModal}>
          {/* Implementation for detailed project view */}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectShowcaseOrganism;
