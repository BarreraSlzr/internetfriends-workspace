#!/usr/bin/env bun

/**
 * Development Monitoring Script
 * Provides real-time feedback loop for development with log monitoring
 */

import { spawn } from "child_process";
import { watch } from "fs";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT_DIR = process.cwd();
const LOG_FILE = join(ROOT_DIR, "dev.log");
const WATCH_DIRS = ["app", "components", "lib", "styles"];

interface MonitorStats {
  compilations: number;
  errors: number;
  warnings: number;
  lastActivity: Date;
}

class DevMonitor {
  private stats: MonitorStats = {
    compilations: 0,
    errors: 0,
    warnings: 0,
    lastActivity: new Date(),
  };

  private logPosition = 0;

  async start() {
    console.log("🚀 Starting Development Monitor...");
    console.log("📁 Watching:", WATCH_DIRS.join(", "));
    console.log("📋 Log file:", LOG_FILE);
    console.log("🌐 Server: http://localhost:3000");
    console.log("─".repeat(50));

    // Monitor log file
    this.watchLogs();

    // Monitor file changes
    this.watchFiles();

    // Status updates
    setInterval(() => this.showStatus(), 30000); // Every 30 seconds

    // Keep process alive
    process.stdin.resume();
  }

  private watchLogs() {
    if (existsSync(LOG_FILE)) {
      const initialSize = readFileSync(LOG_FILE, "utf8").length;
      this.logPosition = initialSize;

      watch(LOG_FILE, (eventType) => {
        if (eventType === "change") {
          this.processLogChanges();
        }
      });
    }
  }

  private processLogChanges() {
    try {
      const content = readFileSync(LOG_FILE, "utf8");
      const newContent = content.slice(this.logPosition);
      this.logPosition = content.length;

      if (newContent.trim()) {
        this.parseLogContent(newContent);
        this.stats.lastActivity = new Date();
      }
    } catch (error) {
      console.error("❌ Error reading logs:", error);
    }
  }

  private parseLogContent(content: string) {
    const lines = content.split("\n").filter((line) => line.trim());

    lines.forEach((line) => {
      if (line.includes("✓ Compiled")) {
        this.stats.compilations++;
        console.log("✅", line.trim());
      } else if (line.includes("Error:") || line.includes("error")) {
        this.stats.errors++;
        console.log("❌", line.trim());
      } else if (line.includes("Warning:") || line.includes("warn")) {
        this.stats.warnings++;
        console.log("⚠️ ", line.trim());
      } else if (line.includes("GET") || line.includes("POST")) {
        console.log("🌐", line.trim());
      } else if (line.includes("Ready in") || line.includes("Starting")) {
        console.log("🚀", line.trim());
      }
    });
  }

  private watchFiles() {
    WATCH_DIRS.forEach((dir) => {
      const dirPath = join(ROOT_DIR, dir);
      if (existsSync(dirPath)) {
        watch(dirPath, { recursive: true }, (eventType, filename) => {
          if (
            filename &&
            (filename.endsWith(".ts") ||
              filename.endsWith(".tsx") ||
              filename.endsWith(".scss"))
          ) {
            console.log(`📝 ${eventType}: ${dir}/${filename}`);
            this.stats.lastActivity = new Date();
          }
        });
      }
    });
  }

  private showStatus() {
    console.log("\n📊 Development Status:");
    console.log(`   Compilations: ${this.stats.compilations}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(`   Warnings: ${this.stats.warnings}`);
    console.log(
      `   Last activity: ${this.stats.lastActivity.toLocaleTimeString()}`,
    );
    console.log("─".repeat(30));
  }

  async runQuickChecks() {
    console.log("\n🔍 Running quick checks...");

    const checks = [
      { name: "TypeScript", command: "bun run typecheck" },
      { name: "Lint", command: "bun run lint" },
      { name: "Build", command: "bun run build" },
    ];

    for (const check of checks) {
      try {
        const result = spawn("bun", ["run", check.name.toLowerCase()], {
          stdio: "pipe",
          cwd: ROOT_DIR,
        });

        console.log(`⏳ ${check.name} check...`);

        result.on("close", (code) => {
          if (code === 0) {
            console.log(`✅ ${check.name} passed`);
          } else {
            console.log(`❌ ${check.name} failed`);
          }
        });
      } catch (error) {
        console.log(`❌ ${check.name} error:`, error);
      }
    }
  }
}

// Handle CLI arguments
const monitor = new DevMonitor();

if (process.argv.includes("--check")) {
  monitor.runQuickChecks();
} else {
  monitor.start();
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Stopping development monitor...");
  process.exit(0);
});
