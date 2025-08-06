#!/usr/bin/env bun
// Debug Browser Utility - Opens browser and provides debugging information

import { spawn } from "bun";

const DEV_URL = "http://localhost:3000";
const BROWSER_COMMANDS = {
  darwin: "open",
  linux: "xdg-open", 
  win32: "start"
};

async function checkDevServer() {
  try {
    const response = await fetch(DEV_URL);
    return response.ok;
  } catch {
    return false;
  }
}

async function openBrowser() {
  const platform = process.platform as keyof typeof BROWSER_COMMANDS;
  const command = BROWSER_COMMANDS[platform] || "open";
  
  console.log("🌐 Opening browser...");
  spawn([command, DEV_URL], { stdio: "inherit" });
}

async function main() {
  console.log("🔍 InternetFriends Debug Browser Utility");
  console.log("========================================");
  
  const isRunning = await checkDevServer();
  
  if (!isRunning) {
    console.log("❌ Dev server not running at", DEV_URL);
    console.log("💡 Start it with: bun run dev");
    process.exit(1);
  }
  
  console.log("✅ Dev server is running");
  console.log("🌐 URL:", DEV_URL);
  
  await openBrowser();
  
  console.log("🛠️  Debug Tips:");
  console.log("   - F12: Open DevTools");
  console.log("   - Ctrl+Shift+I: Inspect Element");
  console.log("   - Ctrl+R: Hard Reload");
  console.log("   - Console: Check for errors/warnings");
}

if (import.meta.main) {
  main().catch(console.error);
}
