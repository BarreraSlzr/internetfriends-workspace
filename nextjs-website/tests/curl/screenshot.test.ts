#!/usr/bin/env bun
// Screenshot API Curl Test Suite - Real vs OG Screenshot Testing
// Tests both Playwright real screenshots and OG image generation

import { CurlTestRunner, type CurlTestConfig } from './curl.test.runner';

// Screenshot Test Configurations
const screenshotTests: CurlTestConfig[] = [
  // Test GET endpoint documentation
  {
    name: "Screenshot API Documentation",
    url: "/api/screenshot",
    method: "GET",
    expectedStatus: 200,
    bodyContains: ["Real Screenshot API", "Playwright"],
    timeout: 5000
  },

  // Test OG Screenshot API
  {
    name: "OG Screenshot API Documentation", 
    url: "/api/og-screenshot",
    method: "GET",
    expectedStatus: 200,
    timeout: 10000
  },

  // Test real screenshot with simple site
  {
    name: "Real Screenshot - Example.com",
    url: "/api/screenshot", 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-screenshot-key-2024"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "Example.com Test",
      waitFor: 2000,
      viewport: { width: 1280, height: 720 }
    }),
    expectedStatus: 200,
    bodyContains: ["success", "true", "real-screenshot"],
    timeout: 30000
  },

  // Test real screenshot with redirect handling
  {
    name: "Real Screenshot - InternetFriends.xyz (with redirect)",
    url: "/api/screenshot",
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-screenshot-key-2024"
    },
    data: JSON.stringify({
      url: "https://internetfriends.xyz",
      name: "Production Site",
      waitFor: 3000,
      viewport: { width: 1280, height: 720 },
      fullPage: true
    }),
    expectedStatus: 200,
    bodyContains: ["success", "true", "real-screenshot"],
    timeout: 35000
  },

  // Test real screenshot with staging URL
  {
    name: "Real Screenshot - Staging Site",
    url: "/api/screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-screenshot-key-2024"
    },
    data: JSON.stringify({
      url: "https://nextjs-website-a92ygj6bi-internetfriends.vercel.app",
      name: "Staging Site", 
      waitFor: 3000,
      viewport: { width: 1280, height: 720 }
    }),
    expectedStatus: 200,
    bodyContains: ["success", "true", "real-screenshot"],
    timeout: 35000
  },

  // Test OG screenshot generation
  {
    name: "OG Screenshot Generation",
    url: "/api/og-screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "OG Example",
      width: 1200,
      height: 630
    }),
    expectedStatus: 200,
    bodyContains: ["success", "true", "og-image"],
    timeout: 15000
  },

  // Test screenshot with missing URL
  {
    name: "Screenshot Error - Missing URL",
    url: "/api/screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-screenshot-key-2024"
    },
    data: JSON.stringify({
      name: "Test"
    }),
    expectedStatus: 400,
    bodyContains: ["error", "URL is required"],
    timeout: 5000
  },

  // Test screenshot with invalid URL
  {
    name: "Screenshot Error - Invalid URL",
    url: "/api/screenshot", 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-screenshot-key-2024"
    },
    data: JSON.stringify({
      url: "not-a-valid-url",
      name: "Invalid Test"
    }),
    expectedStatus: 500,
    bodyContains: ["success", "false"],
    timeout: 15000
  },

  // Test screenshot without API key
  {
    name: "Screenshot Error - Missing API Key",
    url: "/api/screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "No Auth Test"
    }),
    expectedStatus: 401,
    bodyContains: ["error", "authorization"],
    timeout: 5000
  },

  // Test screenshot with invalid API key
  {
    name: "Screenshot Error - Invalid API Key",
    url: "/api/screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer invalid-key"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "Bad Auth Test"
    }),
    expectedStatus: 403,
    bodyContains: ["error", "Invalid API key"],
    timeout: 5000
  },

  // Test visual comparison page loads
  {
    name: "Visual Comparison Page",
    url: "/visual-comparison",
    method: "GET", 
    expectedStatus: 200,
    bodyContains: ["Visual Comparison Tool", "Load Sample URLs"],
    timeout: 10000
  }
];

// Performance tests for screenshot APIs
const performanceTests: CurlTestConfig[] = [
  {
    name: "Screenshot Speed Test - Small Viewport",
    url: "/api/screenshot",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "Speed Test",
      waitFor: 1000,
      viewport: { width: 800, height: 600 },
      fullPage: false
    }),
    expectedStatus: 200,
    timeout: 20000 // Should be faster with smaller viewport
  },

  {
    name: "OG Image Speed Test",
    url: "/api/og-screenshot", 
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      url: "https://example.com",
      name: "OG Speed Test"
    }),
    expectedStatus: 200,
    timeout: 10000 // OG should be much faster
  }
];

// Main test runner
async function runScreenshotTests(verbose: boolean = false) {
  const runner = new CurlTestRunner("http://localhost:3000", verbose);
  
  console.log('🧪 Running Screenshot API Test Suite');
  console.log('=====================================\n');
  
  // Run main screenshot tests
  console.log('📸 Testing Screenshot APIs...');
  const screenshotResults = await runner.runTests(screenshotTests);
  
  console.log('\n⚡ Testing Performance...');
  const perfResults = await runner.runTests(performanceTests);
  
  // Combine results
  const allResults = [...screenshotResults, ...perfResults];
  const report = runner.generateReport(allResults);
  
  console.log('\n' + '='.repeat(50));
  console.log(report);
  
  // Write detailed report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `./tests/curl/reports/screenshot-test-${timestamp}.md`;
  
  // Ensure reports directory exists
  await Bun.write('./tests/curl/reports/.gitkeep', '');
  await Bun.write(reportPath, report);
  console.log(`📊 Detailed report saved to: ${reportPath}`);
  
  // Summary with performance insights
  const realScreenshots = allResults.filter(r => r.name.includes('Real Screenshot') && r.success);
  const ogScreenshots = allResults.filter(r => r.name.includes('OG') && r.success);
  
  if (realScreenshots.length > 0 && ogScreenshots.length > 0) {
    const avgRealTime = realScreenshots.reduce((sum, r) => sum + r.responseTime, 0) / realScreenshots.length;
    const avgOgTime = ogScreenshots.reduce((sum, r) => sum + r.responseTime, 0) / ogScreenshots.length;
    
    console.log('\n📊 Performance Comparison:');
    console.log(`   Real Screenshots: ${avgRealTime.toFixed(0)}ms average`);
    console.log(`   OG Images: ${avgOgTime.toFixed(0)}ms average`);
    console.log(`   Speed difference: ${(avgRealTime / avgOgTime).toFixed(1)}x`);
  }
  
  // Exit with appropriate code
  const failedCount = allResults.filter(r => !r.success).length;
  const passedCount = allResults.filter(r => r.success).length;
  
  console.log(`\n📋 Final Results: ${passedCount}/${allResults.length} tests passed`);
  
  if (failedCount > 0) {
    console.log(`❌ ${failedCount} tests failed`);
    process.exit(1);
  } else {
    console.log('✅ All screenshot tests passed!');
    console.log('\n🎯 Both real screenshots and OG images are working correctly');
    process.exit(0);
  }
}

// Export for use in other test suites  
export { screenshotTests, performanceTests };

// Run if called directly
if (import.meta.main) {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  await runScreenshotTests(verbose);
}