#!/usr/bin/env bun

/**
 * OpenCode Vercel AI Gateway Configuration Helper
 * Configures OpenCode to use Vercel AI Gateway by setting environment variables
 */

import { spawn } from "bun";

const CONFIG = {
  gatewayUrl: process.env.VERCEL_AI_GATEWAY_URL,
  gatewayToken: process.env.VERCEL_AI_GATEWAY_TOKEN,
};

function validateConfig() {
  if (!CONFIG.gatewayUrl || !CONFIG.gatewayToken) {
    console.error("❌ Missing required environment variables:");
    console.error("   VERCEL_AI_GATEWAY_URL");
    console.error("   VERCEL_AI_GATEWAY_TOKEN");
    console.error("");
    console.error("Add these to your .env file or shell profile:");
    console.error("   export VERCEL_AI_GATEWAY_URL='your_gateway_url'");
    console.error("   export VERCEL_AI_GATEWAY_TOKEN='your_gateway_token'");
    process.exit(1);
  }
}

function configureEnvironment() {
  // Override OpenAI settings to use Vercel AI Gateway
  process.env.OPENAI_API_KEY = CONFIG.gatewayToken;
  process.env.OPENAI_BASE_URL = `${CONFIG.gatewayUrl}/v1`;
  
  console.log("🚀 OpenCode configured for Vercel AI Gateway");
  console.log(`   Base URL: ${process.env.OPENAI_BASE_URL}`);
  console.log("   Token: [REDACTED]");
  console.log("");
}

async function startOpenCode() {
  const args = process.argv.slice(2);
  const opencode = spawn(["opencode", ...args], {
    env: process.env,
    stdio: ["inherit", "inherit", "inherit"],
  });
  
  const exitCode = await opencode.exited;
  process.exit(exitCode);
}

async function main() {
  console.log("🎯 Starting OpenCode with Vercel AI Gateway...");
  
  validateConfig();
  configureEnvironment();
  
  await startOpenCode();
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});