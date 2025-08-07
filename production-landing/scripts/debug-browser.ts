#!/usr/bin/env bun
// Debug Browser Utility - Opens browser and provides debugging information

async function checkDevServer() {
  try {
    const response = await fetch("http://localhost:3000");
    return response.ok;
  } catch {
    return false;
  }
}

async function openBrowser() {
  const platform = process.platform;
  
  console.log("🌐 Opening browser...");
  
  if (platform === "darwin") {
    await Bun.spawn(["open", "http://localhost:3000"]);
  } else if (platform === "linux") {
    await Bun.spawn(["xdg-open", "http://localhost:3000"]);
  } else {
    console.log("Please open http://localhost:3000 manually");
  }
}

async function main() {
  console.log("🔍 InternetFriends Debug Browser Utility");
  console.log("========================================");
  
  const isRunning = await checkDevServer();
  
  if (!isRunning) {
    console.log("❌ Dev server not running at http://localhost:3000");
    console.log("💡 Start it with: bun run dev");
    process.exit(1);
  }
  
  console.log("✅ Dev server is running");
  console.log("🌐 URL: http://localhost:3000");
  
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
