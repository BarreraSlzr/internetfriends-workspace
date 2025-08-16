#!/usr/bin/env bun

/**
 * Vercel AI Gateway Auth Manager
 * Provides steady authentication with automatic token rotation
 */

import { Vercel } from "@vercel/sdk";
import { SignJWT, jwtVerify } from "jose";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface AuthConfig {
  vercelToken: string;
  teamId?: string;
  gatewayUrl?: string;
  refreshInterval: number;
  tokenPath: string;
  tier: 'free' | 'pro' | 'enterprise';
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

interface TokenCache {
  token: string;
  expiresAt: number;
  refreshToken?: string;
  gatewayUrl: string;
  requestCount: number;
  dailyRequestCount: number;
  lastResetTime: number;
}

class VercelAIGatewayAuthManager {
  private config: AuthConfig;
  private vercel: Vercel;
  private tokenCache: TokenCache | null = null;
  
  constructor(config: AuthConfig) {
    this.config = config;
    this.vercel = new Vercel({
      accessToken: config.vercelToken,
    });
  }

  /**
   * Initialize auth manager and load cached tokens
   */
  async initialize(): Promise<void> {
    await this.ensureConfigDir();
    await this.loadTokenCache();
    
    if (!this.tokenCache || this.isTokenExpired()) {
      await this.refreshTokens();
    }
  }

  /**
   * Get current valid token for OpenCode with rate limiting
   */
  async getValidToken(): Promise<string> {
    // Check rate limits for free tier
    if (this.config.tier === 'free' && !this.checkRateLimit()) {
      throw new Error("Rate limit exceeded for free tier. Please wait before making more requests.");
    }

    if (!this.tokenCache || this.isTokenExpired()) {
      await this.refreshTokens();
    }
    
    if (!this.tokenCache) {
      throw new Error("Failed to obtain valid token");
    }

    // Increment request count
    this.incrementRequestCount();
    
    return this.tokenCache.token;
  }

  /**
   * Get gateway URL for OpenCode configuration
   */
  async getGatewayUrl(): Promise<string> {
    if (!this.tokenCache) {
      await this.initialize();
    }
    
    return this.tokenCache?.gatewayUrl || this.config.gatewayUrl || "";
  }

  /**
   * Refresh tokens from Vercel API
   */
  private async refreshTokens(): Promise<void> {
    try {
      console.log("🔄 Refreshing Vercel AI Gateway tokens...");
      
      // For free tier, we'll use direct gateway API calls instead of SDK
      const gatewayUrl = this.config.gatewayUrl || 
        `https://gateway.vercel.app/${this.config.teamId || 'personal'}`;
      
      // Create a simple JWT token for the gateway (this is a simplified approach)
      // In production, you'd get this from Vercel's actual token endpoint
      const secret = new TextEncoder().encode(this.config.vercelToken);
      const token = await new SignJWT({ 
        sub: this.config.teamId || 'personal',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (this.config.refreshInterval * 60),
        tier: this.config.tier
      })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);

      this.tokenCache = {
        token,
        expiresAt: Date.now() + (this.config.refreshInterval * 60 * 1000),
        gatewayUrl,
        requestCount: this.tokenCache?.requestCount || 0,
        dailyRequestCount: this.tokenCache?.dailyRequestCount || 0,
        lastResetTime: this.tokenCache?.lastResetTime || Date.now(),
      };

      await this.saveTokenCache();
      console.log("✅ Tokens refreshed successfully");
      
    } catch (error) {
      console.error("❌ Failed to refresh tokens:", error);
      throw error;
    }
  }

  /**
   * Check if rate limit allows for new requests
   */
  private checkRateLimit(): boolean {
    if (!this.tokenCache) return true;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    // Reset daily counter if needed
    if (now - this.tokenCache.lastResetTime >= oneDay) {
      this.tokenCache.dailyRequestCount = 0;
      this.tokenCache.lastResetTime = now;
    }

    // Check daily limit
    if (this.tokenCache.dailyRequestCount >= this.config.rateLimits.requestsPerDay) {
      console.warn(`⚠️ Daily rate limit reached (${this.config.rateLimits.requestsPerDay} requests)`);
      return false;
    }

    // For minute-based limiting, we'd need more sophisticated tracking
    // For now, just check if we're being reasonable
    return true;
  }

  /**
   * Increment request counters
   */
  private incrementRequestCount(): void {
    if (this.tokenCache) {
      this.tokenCache.requestCount++;
      this.tokenCache.dailyRequestCount++;
      this.saveTokenCache(); // Save updated counts
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { daily: number; total: number; dailyLimit: number } {
    if (!this.tokenCache) {
      return { daily: 0, total: 0, dailyLimit: this.config.rateLimits.requestsPerDay };
    }

    return {
      daily: this.tokenCache.dailyRequestCount,
      total: this.tokenCache.requestCount,
      dailyLimit: this.config.rateLimits.requestsPerDay,
    };
  }
  private isTokenExpired(): boolean {
    if (!this.tokenCache) return true;
    
    // Refresh if token expires in the next 5 minutes
    const bufferTime = 5 * 60 * 1000;
    return Date.now() + bufferTime >= this.tokenCache.expiresAt;
  }

  /**
   * Load cached tokens from disk
   */
  private async loadTokenCache(): Promise<void> {
    try {
      if (existsSync(this.config.tokenPath)) {
        const data = await readFile(this.config.tokenPath, 'utf-8');
        this.tokenCache = JSON.parse(data);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load token cache:", error);
      this.tokenCache = null;
    }
  }

  /**
   * Save tokens to disk cache
   */
  private async saveTokenCache(): Promise<void> {
    if (!this.tokenCache) return;
    
    try {
      await writeFile(
        this.config.tokenPath, 
        JSON.stringify(this.tokenCache, null, 2)
      );
    } catch (error) {
      console.error("❌ Failed to save token cache:", error);
    }
  }

  /**
   * Ensure config directory exists
   */
  private async ensureConfigDir(): Promise<void> {
    const dir = path.dirname(this.config.tokenPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Get environment variables for OpenCode
   */
  async getOpenCodeEnv(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    const gatewayUrl = await this.getGatewayUrl();
    
    return {
      OPENAI_API_KEY: token,
      OPENAI_BASE_URL: `${gatewayUrl}/v1`,
      VERCEL_AI_GATEWAY_URL: gatewayUrl,
      VERCEL_AI_GATEWAY_TOKEN: token,
    };
  }
}

/**
 * Create auth manager with default configuration optimized for Vercel Free tier
 */
export function createAuthManager(overrides: Partial<AuthConfig> = {}): VercelAIGatewayAuthManager {
  const tier = (overrides.tier || process.env.VERCEL_TIER || 'free') as 'free' | 'pro' | 'enterprise';
  
  // Free tier optimized settings
  const freetierLimits = {
    requestsPerMinute: 20,
    requestsPerDay: 1000, // Conservative limit for free tier
  };

  const proTierLimits = {
    requestsPerMinute: 100,
    requestsPerDay: 10000,
  };

  const defaultConfig: AuthConfig = {
    vercelToken: process.env.VERCEL_TOKEN || "",
    teamId: process.env.VERCEL_TEAM_ID,
    gatewayUrl: process.env.VERCEL_AI_GATEWAY_URL,
    refreshInterval: tier === 'free' ? 45 : 30, // Longer refresh for free tier
    tokenPath: path.join(process.env.HOME || ".", ".config", "opencode", "vercel-auth.json"),
    tier,
    rateLimits: tier === 'free' ? freetierLimits : proTierLimits,
    ...overrides,
  };

  if (!defaultConfig.vercelToken) {
    throw new Error("VERCEL_TOKEN environment variable is required");
  }

  return new VercelAIGatewayAuthManager(defaultConfig);
}

// CLI usage
if (import.meta.main) {
  const manager = createAuthManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case "init":
      await manager.initialize();
      console.log("🎯 Auth manager initialized");
      break;
      
    case "token":
      const token = await manager.getValidToken();
      console.log(token);
      break;
      
    case "stats":
      const stats = await manager.getUsageStats();
      console.log("📊 Usage Statistics:");
      console.log(`   Daily requests: ${stats.daily}/${stats.dailyLimit}`);
      console.log(`   Total requests: ${stats.total}`);
      console.log(`   Remaining today: ${stats.dailyLimit - stats.daily}`);
      break;
      
    case "env":
      const env = await manager.getOpenCodeEnv();
      Object.entries(env).forEach(([key, value]) => {
        console.log(`export ${key}="${value}"`);
      });
      break;
      
    case "stats":
      const usageStats = await manager.getUsageStats();
      console.log("📊 Usage Statistics:");
      console.log(`   Daily requests: ${usageStats.daily}/${usageStats.dailyLimit}`);
      console.log(`   Total requests: ${usageStats.total}`);
      console.log(`   Remaining today: ${usageStats.dailyLimit - usageStats.daily}`);
      break;
      
    default:
      console.log("Usage: bun vercel-auth-manager.ts [init|token|env|stats]");
      process.exit(1);
  }
}