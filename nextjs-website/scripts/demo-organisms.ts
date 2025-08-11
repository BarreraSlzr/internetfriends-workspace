#!/usr/bin/env bun
// InternetFriends Organism Components Demonstration Script
// Interactive showcase of all organism-level components with live examples

import { spawn } from "child_process";
import { readdir } from "fs/promises";

// Demo configuration
interface OrganismDemo {
  name: string;
  component: string;
  description: string;
  features: string[];
  props: Record<string, unknown>;
  demoData?: Record<string, unknown>;
  interactiveFeatures: string[];
}

// Organism demo configurations
const ORGANISM_DEMOS: OrganismDemo[] = [
  {
    name: "Dashboard Organism",
    component: "DashboardOrganism",
    description:
      "Comprehensive dashboard with real-time metrics, activity feeds, and interactive charts",
    features: [
      "Real-time KPI metrics",
      "Activity feed with filtering",
      "Tab-based navigation",
      "Auto-refresh functionality",
      "Event system integration",
      "Glass morphism design",
      "Responsive layout",
    ],
    props: {
      userId: "demo-user-123",
      sessionId: "demo-session-456",
      initialTab: "overview",
      showMetrics: true,
      showActivity: true,
      showAnalytics: true,
    },
    demoData: {
      metrics: [
        {
          id: "users",
          title: "Total Users",
          value: "15,847",
          change: "+12.5%",
          trend: "up",
        },
        {
          id: "sessions",
          title: "Active Sessions",
          value: "2,143",
          change: "+8.2%",
          trend: "up",
        },
        {
          id: "response",
          title: "Response Time",
          value: "245ms",
          change: "-5.1%",
          trend: "down",
        },
        {
          id: "errors",
          title: "Error Rate",
          value: "0.02%",
          change: "-0.05%",
          trend: "down",
        },
      ],
      activities: [
        {
          type: "user_login",
          message: "New user registration",
          timestamp: new Date(),
          severity: "info",
        },
        {
          type: "system_alert",
          message: "High traffic detected",
          timestamp: new Date(),
          severity: "warning",
        },
        {
          type: "deployment",
          message: "v2.1.0 deployed successfully",
          timestamp: new Date(),
          severity: "success",
        },
      ],
    },
    interactiveFeatures: [
      "Click tabs to switch views",
      "Hover over metrics for details",
      "Click refresh button",
      "Filter activity by type",
      "Real-time data updates",
    ],
  },
  {
    name: "Data Table Organism",
    component: "DataTableOrganism",
    description:
      "Advanced data table with sorting, filtering, pagination, and export capabilities",
    features: [
      "Multi-column sorting",
      "Advanced filtering",
      "Pagination with size options",
      "Row selection",
      "Search functionality",
      "Export to CSV/JSON",
      "Responsive design",
      "Virtual scrolling support",
    ],
    props: {
      sortable: true,
      filterable: true,
      paginated: true,
      selectable: true,
      searchable: true,
      exportable: true,
      showRowNumbers: true,
      userId: "demo-user-123",
      sessionId: "demo-session-456",
    },
    demoData: {
      columns: [
        { key: "id", label: "ID", sortable: true, width: "80px" },
        { key: "name", label: "Name", sortable: true, filterable: true },
        { key: "email", label: "Email", sortable: true, filterable: true },
        {
          key: "status",
          label: "Status",
          sortable: true,
          filterable: true,
          type: "select",
        },
        { key: "created", label: "Created", sortable: true, type: "date" },
        {
          key: "revenue",
          label: "Revenue",
          sortable: true,
          type: "currency",
          align: "right",
        },
      ],
      data: Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: ["active", "inactive", "pending"][i % 3],
        created: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        ),
        revenue: Math.floor(Math.random() * 10000),
      })),
    },
    interactiveFeatures: [
      "Click column headers to sort",
      "Use filter inputs to filter data",
      "Search across all columns",
      "Select rows with checkboxes",
      "Navigate with pagination",
      "Export filtered data",
      "Resize browser to see responsive behavior",
    ],
  },
  {
    name: "Analytics Organism",
    component: "AnalyticsOrganism",
    description:
      "Comprehensive analytics dashboard with charts, KPIs, and AI-powered insights",
    features: [
      "Interactive charts (line, bar, pie, area)",
      "Key Performance Indicators",
      "AI-powered insights",
      "Time range selection",
      "Data export functionality",
      "Real-time updates",
      "Mobile-responsive design",
    ],
    props: {
      title: "InternetFriends Analytics",
      timeRange: "last_7_days",
      autoRefresh: true,
      refreshInterval: 30000,
      showKPIs: true,
      showCharts: true,
      showInsights: true,
      userId: "demo-user-123",
      sessionId: "demo-session-456",
    },
    demoData: {
      kpis: [
        {
          id: "revenue",
          title: "Revenue",
          value: 42850,
          format: "currency",
          change: 10.09,
          trend: "up",
        },
        {
          id: "users",
          title: "Active Users",
          value: 15847,
          format: "number",
          change: 12.5,
          trend: "up",
        },
        {
          id: "conversion",
          title: "Conversion Rate",
          value: 3.24,
          format: "percentage",
          change: -2.1,
          trend: "down",
        },
        {
          id: "retention",
          title: "Retention Rate",
          value: 68.5,
          format: "percentage",
          change: 5.3,
          trend: "up",
        },
      ],
      insights: [
        {
          title: "Strong Growth Trend",
          description: "User acquisition has increased 25% this month",
          severity: "positive",
          actionable: true,
        },
        {
          title: "Mobile Conversion Issue",
          description: "Mobile conversion rate is 15% lower than desktop",
          severity: "warning",
          actionable: true,
        },
      ],
    },
    interactiveFeatures: [
      "Change time range selector",
      "Hover over chart data points",
      "Click KPI cards for details",
      "Export analytics data",
      "View AI insights",
      "Refresh data manually",
    ],
  },
  {
    name: "Project Showcase Organism",
    component: "ProjectShowcaseOrganism",
    description:
      "Interactive portfolio showcase with filtering, search, and multiple view modes",
    features: [
      "Multiple view modes (grid, list, cards, timeline)",
      "Category and status filtering",
      "Technology stack filtering",
      "Search functionality",
      "Project statistics",
      "Animated transitions",
      "Responsive grid layout",
    ],
    props: {
      viewMode: "grid",
      sortBy: "date",
      showFilters: true,
      showSearch: true,
      showCategories: true,
      showStats: true,
      animateOnScroll: true,
      userId: "demo-user-123",
      sessionId: "demo-session-456",
    },
    demoData: {
      projects: [
        {
          id: "project-1",
          title: "InternetFriends Dashboard",
          description: "Modern dashboard with real-time analytics",
          status: "completed",
          category: "web-development",
          technologies: ["React", "TypeScript", "Next.js", "SCSS"],
          image: "/images/project-dashboard.jpg",
          startDate: "2024-01-15",
        },
        {
          id: "project-2",
          title: "Event-Driven Architecture",
          description: "High-performance event system for microservices",
          status: "active",
          category: "backend",
          technologies: ["Node.js", "TypeScript", "Redis", "Docker"],
          startDate: "2024-02-01",
        },
        {
          id: "project-3",
          title: "AI Content Generator",
          description: "Machine learning powered content creation tool",
          status: "in_progress",
          category: "ai-ml",
          technologies: ["Python", "TensorFlow", "FastAPI", "React"],
          progress: 65,
          startDate: "2024-03-01",
        },
      ],
      categories: [
        { id: "web-development", name: "Web Development", count: 12 },
        { id: "backend", name: "Backend Systems", count: 8 },
        { id: "ai-ml", name: "AI & Machine Learning", count: 5 },
        { id: "mobile", name: "Mobile Apps", count: 3 },
      ],
    },
    interactiveFeatures: [
      "Switch between view modes",
      "Filter by category and status",
      "Search projects by name/technology",
      "Click projects for details",
      "Hover for project previews",
      "Sort by different criteria",
    ],
  },
];

class OrganismDemonstrator {
  private verbose: boolean;
  private interactive: boolean;
  private serverProcess?: import("child_process").ChildProcess;

  constructor(verbose: boolean = false, interactive: boolean = true) {
    this.verbose = verbose;
    this.interactive = interactive;
  }

  // Main demo function
  async runDemo(): Promise<void> {
    console.log("🧬 InternetFriends Organism Components Demo");
    console.log("=".repeat(60));
    console.log("");

    if (this.interactive) {
      await this.runInteractiveDemo();
    } else {
      await this.runAutomatedDemo();
    }
  }

  // Interactive demo with user choices
  private async runInteractiveDemo(): Promise<void> {
    console.log("🎯 Interactive Organism Demo");
    console.log("Choose an organism to demonstrate:");
    console.log("");

    ORGANISM_DEMOS.forEach((demo, index) => {
      console.log(`${index + 1}. ${demo.name}`);
      console.log(`   ${demo.description}`);
      console.log("");
    });

    console.log("0. Show all organisms");
    console.log("q. Quit");
    console.log("");

    const choice = await this.promptUser("Enter your choice: ");

    if (choice === "q" || choice === "quit") {
      console.log("👋 Demo ended");
      return;
    }

    if (choice === "0") {
      await this.demonstrateAllOrganisms();
    } else {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < ORGANISM_DEMOS.length) {
        await this.demonstrateOrganism(ORGANISM_DEMOS[index]);
      } else {
        console.log("❌ Invalid choice");
        await this.runInteractiveDemo();
      }
    }
  }

  // Automated demo showing all organisms
  private async runAutomatedDemo(): Promise<void> {
    console.log("🚀 Automated Organism Demo");
    console.log("Demonstrating all organism components...");
    console.log("");

    for (const demo of ORGANISM_DEMOS) {
      await this.demonstrateOrganism(demo);
      await this.delay(2000);
    }

    console.log("✅ All organism demos completed!");
  }

  // Demonstrate individual organism
  private async demonstrateOrganism(demo: OrganismDemo): Promise<void> {
    console.log(`🧬 Demonstrating: ${demo.name}`);
    console.log("=".repeat(50));
    console.log(`Description: ${demo.description}`);
    console.log("");

    // Show features
    console.log("📋 Features:");
    demo.features.forEach((feature) => {
      console.log(`  • ${feature}`);
    });
    console.log("");

    // Show props
    if (this.verbose) {
      console.log("⚙️ Component Props:");
      Object.entries(demo.props).forEach(([key, value]) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      });
      console.log("");
    }

    // Show demo data structure
    if (this.verbose && demo.demoData) {
      console.log("📊 Demo Data Structure:");
      console.log(
        JSON.stringify(demo.demoData, null, 2).substring(0, 500) + "...",
      );
      console.log("");
    }

    // Show interactive features
    console.log("🎮 Interactive Features:");
    demo.interactiveFeatures.forEach((feature) => {
      console.log(`  • ${feature}`);
    });
    console.log("");

    // Generate component usage example
    this.showUsageExample(demo);

    // Show live implementation status
    await this.checkImplementationStatus(demo);

    console.log("─".repeat(50));
    console.log("");
  }

  // Show all organisms in overview
  private async demonstrateAllOrganisms(): Promise<void> {
    console.log("🌟 All Organism Components Overview");
    console.log("=".repeat(60));
    console.log("");

    console.log("📊 Summary Statistics:");
    console.log(`Total Organisms: ${ORGANISM_DEMOS.length}`);
    console.log(
      `Total Features: ${ORGANISM_DEMOS.reduce((sum, demo) => sum + demo.features.length, 0)}`,
    );
    console.log(
      `Interactive Elements: ${ORGANISM_DEMOS.reduce((sum, demo) => sum + demo.interactiveFeatures.length, 0)}`,
    );
    console.log("");

    console.log("🏗️ Architecture Overview:");
    console.log("All organisms follow the InternetFriends design system:");
    console.log("  • Glass morphism styling");
    console.log("  • Event system integration");
    console.log("  • TypeScript strict typing");
    console.log("  • Responsive design");
    console.log("  • Accessibility compliance");
    console.log("  • Performance optimization");
    console.log("");

    // Start development server for live demo
    if (this.interactive) {
      const startServer = await this.promptUser(
        "Start development server for live demo? (y/n): ",
      );
      if (
        startServer.toLowerCase() === "y" ||
        startServer.toLowerCase() === "yes"
      ) {
        await this.startDevelopmentServer();
      }
    }

    // Show each organism briefly
    for (const demo of ORGANISM_DEMOS) {
      console.log(`🧬 ${demo.name}`);
      console.log(`   ${demo.description}`);
      console.log(
        `   Features: ${demo.features.length} | Interactive: ${demo.interactiveFeatures.length}`,
      );
      console.log("");
    }

    this.showIntegrationExample();
  }

  // Show component usage example
  private showUsageExample(demo: OrganismDemo): void {
    console.log("💻 Usage Example:");
    console.log("```tsx");
    console.log(
      `import { ${demo.component} } from './components/organism/${demo.name.toLowerCase().replace(/\s+/g, "-")}';`,
    );
    console.log("");
    console.log(`const MyPage = () => {`);
    console.log(`  return (`);
    console.log(`    <${demo.component}`);

    // Show key props
    const keyProps = Object.entries(demo.props).slice(0, 4);
    keyProps.forEach(([key, value]) => {
      const formattedValue =
        typeof value === "string" ? `"${value}"` : JSON.stringify(value);
      console.log(`      ${key}={${formattedValue}}`);
    });

    console.log(`    />`);
    console.log(`  );`);
    console.log(`};`);
    console.log("```");
    console.log("");
  }

  // Show integration example
  private showIntegrationExample(): void {
    console.log("🔗 Integration Example:");
    console.log("```tsx");
    console.log(`// Complete dashboard page with multiple organisms`);
    console.log(`import { DashboardOrganism } from './organism/dashboard';`);
    console.log(`import { AnalyticsOrganism } from './organism/analytics';`);
    console.log(`import { DataTableOrganism } from './organism/data-table';`);
    console.log("");
    console.log(`export const ComprehensiveDashboard = () => {`);
    console.log(`  return (`);
    console.log(`    <div className="dashboard-layout">`);
    console.log(`      <DashboardOrganism userId="current-user" />`);
    console.log(`      `);
    console.log(`      <div className="analytics-section">`);
    console.log(`        <AnalyticsOrganism timeRange="last_30_days" />`);
    console.log(`      </div>`);
    console.log(`      `);
    console.log(`      <div className="data-section">`);
    console.log(`        <DataTableOrganism data={tableData} />`);
    console.log(`      </div>`);
    console.log(`    </div>`);
    console.log(`  );`);
    console.log(`};`);
    console.log("```");
    console.log("");
  }

  // Check if component is implemented
  private async checkImplementationStatus(demo: OrganismDemo): Promise<void> {
    const componentPath = `./app/(internetfriends)/components/organism/${demo.name.toLowerCase().replace(/\s+/g, "-")}`;

    try {
      const files = await readdir(componentPath);
      const hasComponent = files.some((file) => file.endsWith(".organism.tsx"));
      const hasStyles = files.some((file) =>
        file.endsWith(".styles.module.scss"),
      );
      const hasTypes = files.includes("types.ts");

      console.log("📁 Implementation Status:");
      console.log(`  Component File: ${hasComponent ? "✅" : "❌"}`);
      console.log(`  Styles File: ${hasStyles ? "✅" : "❌"}`);
      console.log(`  Types File: ${hasTypes ? "✅" : "❌"}`);

      if (hasComponent && hasStyles && hasTypes) {
        console.log(`  Status: 🟢 Fully Implemented`);
      } else if (hasComponent) {
        console.log(`  Status: 🟡 Partially Implemented`);
      } else {
        console.log(`  Status: 🔴 Not Implemented`);
      }
    } catch {
      console.log("📁 Implementation Status: 🔴 Directory Not Found");
    }
    console.log("");
  }

  // Start development server
  private async startDevelopmentServer(): Promise<void> {
    console.log("🚀 Starting development server...");

    try {
      this.serverProcess = spawn("bun", ["run", "dev"], {
        stdio: "pipe",
        cwd: process.cwd(),
      });

      console.log("✅ Development server starting...");
      console.log("🌐 Visit: http://localhost:3000");
      console.log("");
      console.log("📱 Try these organism demo pages:");
      console.log("  • Dashboard: http://localhost:3000/demo/dashboard");
      console.log("  • Analytics: http://localhost:3000/demo/analytics");
      console.log("  • Data Table: http://localhost:3000/demo/data-table");
      console.log("  • Projects: http://localhost:3000/demo/projects");
      console.log("");

      // Wait for server to be ready
      await this.delay(5000);

      if (this.interactive) {
        const openBrowser = await this.promptUser(
          "Open browser automatically? (y/n): ",
        );
        if (openBrowser.toLowerCase() === "y") {
          await this.openBrowser("http://localhost:3000");
        }
      }
    } catch (error) {
      console.log("❌ Failed to start development server:", error);
    }
  }

  // Open browser
  private async openBrowser(url: string): Promise<void> {
    try {
      const platform = process.platform;
      let command: string;

      switch (platform) {
        case "darwin":
          command = "open";
          break;
        case "win32":
          command = "start";
          break;
        default:
          command = "xdg-open";
      }

      spawn(command, [url], { stdio: "ignore" });
      console.log(`🌐 Opening ${url} in your default browser...`);
    } catch {
      console.log(
        `❌ Could not open browser automatically. Please visit: ${url}`,
      );
    }
  }

  // Prompt user for input
  private async promptUser(question: string): Promise<string> {
    process.stdout.write(question);

    return new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  // Utility delay function
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cleanup function
  cleanup(): void {
    if (this.serverProcess) {
      this.serverProcess.kill("SIGTERM");
      console.log("🛑 Development server stopped");
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const automated = args.includes("--automated") || args.includes("-a");
  const interactive = !automated;

  console.log("🧬 InternetFriends Organism Demo Starting...");
  console.log("");

  const demonstrator = new OrganismDemonstrator(verbose, interactive);

  // Handle cleanup on exit
  process.on("SIGINT", () => {
    console.log("\n🛑 Demo interrupted");
    demonstrator.cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    demonstrator.cleanup();
    process.exit(0);
  });

  try {
    await demonstrator.runDemo();
  } catch (error) {
    console.error("❌ Demo failed:", error);
    demonstrator.cleanup();
    process.exit(1);
  }

  demonstrator.cleanup();
}

// Run if called directly
if (import.meta.main) {
  // Make stdin readable for interactive prompts
  process.stdin.setRawMode(false);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  main().catch(console.error);
}

export { OrganismDemonstrator, ORGANISM_DEMOS };
