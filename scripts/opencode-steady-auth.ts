#!/usr/bin/env bun

/**
 * OpenCode Steady Auth Launcher
 * Manages Vercel AI Gateway authentication with automatic rotation
 */

import { spawn } from "bun";
import { createAuthManager } from "../lib/auth/vercel-auth-manager";

class OpenCodeSteadyAuth {
  private authManager: ReturnType<typeof createAuthManager>;
  private refreshTimer?: Timer;

  constructor() {
    this.authManager = createAuthManager();
  }

  /**
   * Initialize auth and start OpenCode with steady authentication
   */
  async start(args: string[] = []): Promise<void> {
    try {
      console.log("🚀 Starting OpenCode with Vercel AI Gateway Steady Auth...");
      
      // Initialize auth manager
      await this.authManager.initialize();
      console.log("✅ Authentication initialized");

      // Set up automatic token rotation
      this.setupTokenRotation();

      // Get current environment variables
      const env = await this.authManager.getOpenCodeEnv();
      
      console.log("🎯 Environment configured:");
      console.log(`   Gateway URL: ${env.VERCEL_AI_GATEWAY_URL}`);
      console.log("   Token: [REDACTED]");
      console.log("");

      // Start OpenCode with configured environment
      await this.startOpenCode(args, env);

    } catch (error) {
      console.error("❌ Failed to start OpenCode:", error);
      process.exit(1);
    }
  }

  /**
   * Set up automatic token rotation optimized for free tier
   */
  private setupTokenRotation(): void {
    // Free tier: refresh every 40 minutes (5 minutes before 45min expiry)
    // Pro tier: refresh every 25 minutes (5 minutes before 30min expiry)
    const refreshInterval = this.authManager.config?.tier === 'free' ? 40 * 60 * 1000 : 25 * 60 * 1000;
    
    this.refreshTimer = setInterval(async () => {
      try {
        console.log("🔄 Refreshing authentication tokens...");
        await this.authManager.getValidToken(); // This triggers refresh if needed
        console.log("✅ Tokens refreshed successfully");
        
        // Show usage stats for free tier
        if (this.authManager.config?.tier === 'free') {
          const stats = await this.authManager.getUsageStats();
          console.log(`📊 Daily usage: ${stats.daily}/${stats.dailyLimit} requests`);
        }
      } catch (error) {
        console.error("⚠️ Token refresh failed:", error);
      }
    }, refreshInterval);

    const intervalMinutes = refreshInterval / (60 * 1000);
    console.log(`⏰ Automatic token rotation enabled (every ${intervalMinutes} minutes)`);
  }

  /**
   * Start OpenCode process with configured environment
   */
  private async startOpenCode(args: string[], env: Record<string, string>): Promise<void> {
    const opencode = spawn(["opencode", ...args], {
      env: { ...process.env, ...env },
      stdio: ["inherit", "inherit", "inherit"],
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down OpenCode...");
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      opencode.kill("SIGINT");
      process.exit(0);
    });

    const exitCode = await opencode.exited;
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    process.exit(exitCode);
  }

  /**
   * Check authentication status with usage info
   */
  async status(): Promise<void> {
    try {
      await this.authManager.initialize();
      const env = await this.authManager.getOpenCodeEnv();
      const stats = await this.authManager.getUsageStats();
      
      console.log("🔍 Vercel AI Gateway Auth Status:");
      console.log(`   Status: ✅ Active`);
      console.log(`   Tier: ${this.authManager.config?.tier || 'unknown'}`);
      console.log(`   Gateway URL: ${env.VERCEL_AI_GATEWAY_URL}`);
      console.log(`   Token: [REDACTED]`);
      console.log(`   Config: ~/.config/opencode/vercel-auth.json`);
      console.log("");
      console.log("📊 Usage Statistics:");
      console.log(`   Daily requests: ${stats.daily}/${stats.dailyLimit}`);
      console.log(`   Total requests: ${stats.total}`);
      console.log(`   Remaining today: ${stats.dailyLimit - stats.daily}`);
      
      if (stats.daily > stats.dailyLimit * 0.8) {
        console.log("⚠️  Warning: Approaching daily rate limit");
      }
      
    } catch (error) {
      console.log("🔍 Vercel AI Gateway Auth Status:");
      console.log(`   Status: ❌ Error`);
      console.log(`   Error: ${error}`);
    }
  }

  /**
   * Reset authentication cache
   */
  async reset(): Promise<void> {
    try {
      console.log("🔄 Resetting authentication cache...");
      
      // Force token refresh
      this.authManager = createAuthManager();
      await this.authManager.initialize();
      
      console.log("✅ Authentication cache reset successfully");
      
    } catch (error) {
      console.error("❌ Failed to reset auth cache:", error);
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const steadyAuth = new OpenCodeSteadyAuth();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case "status":
      await steadyAuth.status();
      break;
      
    case "usage":
      await steadyAuth.status(); // Status includes usage info
      break;
      
    case "reset":
      await steadyAuth.reset();
      break;
      
    case "usage":
      await steadyAuth.status(); // Status includes usage info
      break;
      
    case "help":
      console.log("OpenCode Steady Auth Commands (FREE TIER OPTIMIZED):");
      console.log("  bun opencode-steady-auth.ts [project]  - Start OpenCode with steady auth");
      console.log("  bun opencode-steady-auth.ts status     - Check auth status & usage");
      console.log("  bun opencode-steady-auth.ts usage      - Show usage statistics");
      console.log("  bun opencode-steady-auth.ts reset      - Reset auth cache");
      console.log("  bun opencode-steady-auth.ts help       - Show this help");
      console.log("");
      console.log("🆓 Free Tier Features:");
      console.log("  • 1,000 requests/day limit");
      console.log("  • 45-minute token refresh (vs 30min pro)");
      console.log("  • Usage tracking & warnings");
      console.log("  • Rate limit protection");
      break;
      
    default:
      // Default: start OpenCode with the provided args
      await steadyAuth.start([command, ...args].filter(Boolean));
      break;
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});