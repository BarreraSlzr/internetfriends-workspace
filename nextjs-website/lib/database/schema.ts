import {
  Generated,
  ColumnType,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  component_quality: ComponentQualityTable;
  optimization_runs: OptimizationRunsTable;
  quality_metrics: QualityMetricsTable;
  component_analysis: ComponentAnalysisTable;
  contact_submissions: ContactSubmissionsTable;
}

export interface ComponentQualityTable {
  id: Generated<string>;
  component_name: string;
  component_path: string;
  component_type: "atomic" | "molecular" | "organisms";
  quality_score: number;
  max_possible_score: number;
  optimization_status: "pending" | "in_progress" | "completed" | "failed";
  last_analyzed: ColumnType<Date, string | Date, string | Date>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, string | Date | undefined>;
}

export interface OptimizationRunsTable {
  id: Generated<string>;
  run_timestamp: ColumnType<Date, string | Date, string | Date>;
  total_components: number;
  components_optimized: number;
  average_score_before: number;
  average_score_after: number;
  total_points_gained: number;
  duration_ms: number;
  optimization_type: "phase1" | "phase2" | "comprehensive";
  status: "running" | "completed" | "failed";
  created_at: ColumnType<Date, never, never>;
}

export interface QualityMetricsTable {
  id: Generated<string>;
  component_id: string;
  metric_type:
    | "stamp"
    | "test_id"
    | "props_interface"
    | "disabled_prop"
    | "typescript"
    | "accessibility"
    | "performance";
  metric_value: number;
  max_value: number;
  details: string | null;
  measured_at: ColumnType<Date, string | Date, string | Date>;
  created_at: ColumnType<Date, never, never>;
}

export interface ComponentAnalysisTable {
  id: Generated<string>;
  component_id: string;
  analysis_data: string;
  fossil_hash: string;
  analysis_version: string;
  created_at: ColumnType<Date, never, never>;
}

export interface ContactSubmissionsTable {
  id: Generated<string>;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  project_start_date: string;
  budget: string;
  project_scope: string;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, string | Date | undefined>;
}

export type ComponentQuality = Selectable<ComponentQualityTable>;
export type NewComponentQuality = Insertable<ComponentQualityTable>;
export type ComponentQualityUpdate = Updateable<ComponentQualityTable>;

export type OptimizationRun = Selectable<OptimizationRunsTable>;
export type NewOptimizationRun = Insertable<OptimizationRunsTable>;
export type OptimizationRunUpdate = Updateable<OptimizationRunsTable>;

export type QualityMetric = Selectable<QualityMetricsTable>;
export type NewQualityMetric = Insertable<QualityMetricsTable>;
export type QualityMetricUpdate = Updateable<QualityMetricsTable>;

export type ComponentAnalysis = Selectable<ComponentAnalysisTable>;
export type NewComponentAnalysis = Insertable<ComponentAnalysisTable>;
export type ComponentAnalysisUpdate = Updateable<ComponentAnalysisTable>;

export type ContactFormData = Insertable<ContactSubmissionsTable>;
export type ContactSubmission = Selectable<ContactSubmissionsTable>;
export type ContactSubmissionUpdate = Updateable<ContactSubmissionsTable>;
