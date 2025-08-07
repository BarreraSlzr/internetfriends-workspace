#!/usr/bin/env bun
// Hot Reload Checker - Monitors file changes and verifies hot reloading

import { watch } from "fs";
import { resolve } from "path";

let lastReloadTime = Date.now();
let changeCount = 0;

function logChange(filename: string) {
  changeCount++;
  const now = Date.now();
  const timeSinceLastReload = now - lastReloadTime;
  
  console.log(`📝 [${new Date().toLocaleTimeString()}] File changed: ${filename}`);
  console.log(`⏱️  Time since last reload: ${timeSinceLastReload}ms`);
  console.log(`📊 Changes detected: ${changeCount}`);
  
  if (timeSinceLastReload > 5000) {
    console.log("⚠️  Hot reload might not be working properly");
    console.log("💡 Check Next.js console for errors");
  }
  
  lastReloadTime = now;
  console.log("---");
}

async function checkHotReload() {
  console.log("🔥 InternetFriends Hot Reload Checker");
  console.log("===================================== ");
  console.log("Monitoring app/ directory for changes...");
  console.log("Make changes to see hot reload performance");
  console.log("Press Ctrl+C to stop");
  console.log("");
  
  const appDir = resolve("./app");
  const componentsDir = resolve("./components");
  
  // Watch app directory
  watch(appDir, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes("node_modules")) {
      logChange(`app/${filename}`);
    }
  });
  
  // Watch components directory  
  watch(componentsDir, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes("node_modules")) {
      logChange(`components/${filename}`);
    }
  });
  
  // Check dev server connection
  setInterval(async () => {
    try {
      const response = await fetch("http://localhost:3000");
      if (!response.ok) {
        console.log("❌ Dev server connection lost");
      }
    } catch {
      console.log("❌ Cannot connect to dev server");
    }
  }, 10000);
}

if (import.meta.main) {
  checkHotReload().catch(console.error);
}
