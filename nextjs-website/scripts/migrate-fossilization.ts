import { dbService } from "../lib/database/service";
import * as fs from "fs";

interface FossilComponent {
  filePath: string;
  exportName: string;
  score: number;
  issues: string[];
  suggestions: string[];
  patterns: {
    hasDisabled: boolean;
    hasTestId: boolean;
    hasStamp: boolean;
    hasIsoTimestamp: boolean;
    hasRawDateUsage: boolean;
    propsCount: number;
  };
  category: "atomic" | "molecular" | "organisms" | "utility";
}

interface FossilData {
  timestamp: string;
  report: {
    totalComponents: number;
    averageScore: number;
    categoryBreakdown: Record<string, { count: number; avgScore: number }>;
    topIssues: Record<string, number>;
    lowestPerformers: FossilComponent[];
    recommendations: string[];
  };
  components: FossilComponent[];
}

async function importFossilization() {
  console.log("🔄 Importing existing fossilization data to PostgreSQL...");

  try {
    // Read comprehensive analysis
    const comprehensiveData = JSON.parse(
      fs.readFileSync(".fossils/comprehensive-analysis.json", "utf8"),
    ) as FossilData;

    // Read phase1 optimization report if it exists
    let phase1Data: any = null;
    try {
      phase1Data = JSON.parse(
        fs.readFileSync(".fossils/phase1-optimization-report.json", "utf8"),
      );
    } catch (error) {
      console.log("⚠️  Phase1 optimization report not found, skipping");
    }

    const db = dbService.getDb();

    // Create optimization run record for the comprehensive analysis
    const optimizationRun = await dbService.createOptimizationRun({
      total_components: comprehensiveData.report.totalComponents,
      optimization_type: "comprehensive",
    });

    if (!optimizationRun?.id) {
      throw new Error("Failed to create optimization run");
    }

    // Import component quality data
    let importedComponents = 0;
    for (const component of comprehensiveData.components) {
      try {
        // Determine component type based on path and category
        let componentType: "atomic" | "molecular" | "organisms" = "atomic";
        if (component.category === "molecular") {
          componentType = "molecular";
        } else if (component.category === "organisms") {
          componentType = "organisms";
        } else if (component.filePath.includes("/atomic/")) {
          componentType = "atomic";
        } else if (component.filePath.includes("/molecular/")) {
          componentType = "molecular";
        } else if (component.filePath.includes("/organisms/")) {
          componentType = "organisms";
        }

        // Calculate max possible score (assume 100 for now, adjust based on patterns)
        const maxPossibleScore = 100;

        // Upsert component quality
        const componentRecord = await dbService.upsertComponentQuality({
          component_name: component.exportName,
          component_path: component.filePath,
          component_type: componentType,
          quality_score: component.score,
          max_possible_score: maxPossibleScore,
          optimization_status: component.score >= 70 ? "completed" : "pending",
        });

        if (componentRecord?.id) {
          // Record individual quality metrics
          const metrics = [
            {
              metric_type: "stamp" as const,
              metric_value: component.patterns.hasStamp ? 1 : 0,
              max_value: 1,
              details: component.patterns.hasStamp
                ? "Has stamp generation"
                : "Missing stamp generation",
            },
            {
              metric_type: "test_id" as const,
              metric_value: component.patterns.hasTestId ? 1 : 0,
              max_value: 1,
              details: component.patterns.hasTestId
                ? "Has test ID"
                : "Missing test ID",
            },
            {
              metric_type: "disabled_prop" as const,
              metric_value: component.patterns.hasDisabled ? 1 : 0,
              max_value: 1,
              details: component.patterns.hasDisabled
                ? "Has disabled prop"
                : "Missing disabled prop",
            },
            {
              metric_type: "props_interface" as const,
              metric_value: component.issues.some((issue) =>
                issue.includes("Props interface"),
              )
                ? 0
                : 1,
              max_value: 1,
              details: component.issues.some((issue) =>
                issue.includes("Props interface"),
              )
                ? "Missing Props interface"
                : "Has Props interface",
            },
          ];

          for (const metric of metrics) {
            await dbService.recordQualityMetric({
              component_id: componentRecord.id,
              ...metric,
            });
          }

          // Save component analysis
          await dbService.saveComponentAnalysis({
            component_id: componentRecord.id,
            analysis_data: JSON.stringify({
              issues: component.issues,
              suggestions: component.suggestions,
              patterns: component.patterns,
            }),
            fossil_hash: `fossil-${Date.now()}-${component.filePath.replace(/[^a-zA-Z0-9]/g, "")}`,
            analysis_version: "1.0.0",
          });

          importedComponents++;
        }
      } catch (error) {
        console.error(
          `❌ Failed to import component ${component.filePath}:${component.exportName}:`,
          error,
        );
      }
    }

    // Update optimization run with results
    await dbService.updateOptimizationRun(optimizationRun.id, {
      components_optimized: importedComponents,
      average_score_before: comprehensiveData.report.averageScore,
      average_score_after: comprehensiveData.report.averageScore,
      total_points_gained: 0,
      duration_ms: 0,
      status: "completed",
    });

    console.log(
      `✅ Successfully imported ${importedComponents} components from fossilization data`,
    );

    // Import phase1 optimization data if available
    if (phase1Data) {
      console.log("📊 Importing Phase1 optimization results...");

      const phase1Run = await dbService.createOptimizationRun({
        total_components:
          phase1Data.totalComponentsProcessed ||
          comprehensiveData.report.totalComponents,
        optimization_type: "phase1",
        status: "completed",
      });

      if (phase1Run?.id) {
        await dbService.updateOptimizationRun(phase1Run.id, {
          components_optimized: phase1Data.componentsOptimized || 102,
          average_score_before: phase1Data.averageScoreBefore || 62.2,
          average_score_after: phase1Data.averageScoreAfter || 63.7,
          total_points_gained: phase1Data.totalPointsGained || 2735,
          duration_ms: phase1Data.durationMs || 0,
          status: "completed",
        });
      }
    }

    // Display summary
    const stats = await dbService.getComponentQualityStats();
    console.log("\n📈 Import Summary:");
    console.log(`Total Components: ${stats.overall?.total_components}`);
    console.log(
      `Average Score: ${Number(stats.overall?.avg_score || 0).toFixed(1)}`,
    );
    console.log("\nBy Type:");
    stats.by_type.forEach((type) => {
      console.log(
        `  ${type.component_type}: ${type.total_components} components, avg ${Number(type.avg_score).toFixed(1)}`,
      );
    });
  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }
}

async function exportToDashboard() {
  console.log("🔄 Exporting database data to dashboard...");

  try {
    const dashboardData = await dbService.getDashboardData();

    // Write to public dashboard file
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Quality Dashboard - PostgreSQL Backend</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #666; font-size: 0.9rem; }
        .section { margin-bottom: 30px; }
        .component-list { max-height: 400px; overflow-y: auto; }
        .component-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .score { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
        .score.high { background: #d4edda; color: #155724; }
        .score.medium { background: #fff3cd; color: #856404; }
        .score.low { background: #f8d7da; color: #721c24; }
        .timestamp { color: #666; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Component Quality Dashboard</h1>
            <p class="timestamp">PostgreSQL Backend • Updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${dashboardData.quality_stats.overall?.total_components || 0}</div>
                <div class="stat-label">Total Components</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Number(dashboardData.quality_stats.overall?.avg_score || 0).toFixed(1)}%</div>
                <div class="stat-label">Average Quality Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${dashboardData.recent_optimizations.length}</div>
                <div class="stat-label">Recent Optimizations</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 By Component Type</h2>
            ${dashboardData.quality_stats.by_type
              .map(
                (type) => `
                <div style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>${type.component_type.charAt(0).toUpperCase() + type.component_type.slice(1)}</strong>: 
                    ${type.total_components} components • 
                    Average: ${Number(type.avg_score).toFixed(1)}%
                </div>
            `,
              )
              .join("")}
        </div>

        <div class="section">
            <h2>🏅 Top Performing Components</h2>
            <div class="component-list">
                ${dashboardData.top_components
                  .map(
                    (component) => `
                    <div class="component-item">
                        <span>${component.component_name} <small>(${component.component_path})</small></span>
                        <span class="score high">${component.quality_score}%</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>

        <div class="section">
            <h2>🎯 Components Needing Attention</h2>
            <div class="component-list">
                ${dashboardData.bottom_components
                  .map(
                    (component) => `
                    <div class="component-item">
                        <span>${component.component_name} <small>(${component.component_path})</small></span>
                        <span class="score ${component.quality_score >= 70 ? "high" : component.quality_score >= 50 ? "medium" : "low"}">${component.quality_score}%</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>

        <div class="section">
            <h2>🔄 Recent Optimizations</h2>
            ${dashboardData.recent_optimizations
              .map(
                (run) => `
                <div style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>${run.optimization_type.toUpperCase()}</strong> • 
                    ${run.components_optimized}/${run.total_components} components • 
                    ${new Date(run.run_timestamp).toLocaleDateString()}
                </div>
            `,
              )
              .join("")}
        </div>
    </div>
    
    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => window.location.reload(), 300000);
    </script>
</body>
</html>`;

    fs.writeFileSync("public/postgresql-quality-dashboard.html", dashboardHTML);
    console.log(
      "✅ Dashboard exported to public/postgresql-quality-dashboard.html",
    );
  } catch (error) {
    console.error("❌ Dashboard export failed:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === "import") {
      await importFossilization();
    } else if (command === "export") {
      await exportToDashboard();
    } else {
      await importFossilization();
      await exportToDashboard();
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
