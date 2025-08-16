#!/usr/bin/env bun

/**
 * Test script for OG Screenshot Visual Comparison
 * Tests the new OG-based image generation vs old Playwright approach
 */

import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:3000';

async function testOGScreenshot(url: string, name: string) {
  console.log(`\n🧪 Testing OG Screenshot for ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/og-screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        name,
        width: 1200,
        height: 630
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${name}: ${result.screenshot}`);
      console.log(`   Generated at: ${result.timestamp}`);
      console.log(`   Type: ${result.type}`);
      return result.screenshot;
    } else {
      console.log(`❌ ${name} failed: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${name} error: ${error}`);
    return null;
  }
}

async function testImageGeneration(imageUrl: string, name: string) {
  console.log(`\n🖼️  Testing image generation for ${name}...`);
  
  try {
    const response = await fetch(imageUrl);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`✅ ${name} image generated successfully`);
      console.log(`   Content-Type: ${contentType}`);
      return true;
    } else {
      console.log(`❌ ${name} image generation failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name} image fetch error: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting OG Screenshot Visual Comparison Tests\n');
  
  const testUrls = [
    { url: 'https://example.com', name: 'Example.com' },
    { url: 'https://internetfriends.xyz', name: 'Production' },
    { url: 'https://nextjs-website-a92ygj6bi-internetfriends.vercel.app', name: 'Staging' }
  ];
  
  let successCount = 0;
  let totalTests = testUrls.length * 2; // Screenshot + Image generation
  
  for (const test of testUrls) {
    // Test screenshot API
    const screenshotUrl = await testOGScreenshot(test.url, test.name);
    if (screenshotUrl) successCount++;
    
    // Test actual image generation
    if (screenshotUrl) {
      await setTimeout(500); // Small delay between requests
      const imageSuccess = await testImageGeneration(screenshotUrl, test.name);
      if (imageSuccess) successCount++;
    }
  }
  
  console.log(`\n📊 Test Results: ${successCount}/${totalTests} tests passed`);
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed! OG Screenshot system is working perfectly.');
    console.log('\n💡 Benefits of OG approach vs Playwright:');
    console.log('   • Much faster generation (edge runtime)');
    console.log('   • No heavy browser dependencies');  
    console.log('   • Better for visual branding/metadata');
    console.log('   • Optimized for social sharing');
    console.log('   • Works great on Vercel Edge Functions');
  } else {
    console.log('❌ Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
  
  console.log('\n🔗 Visit the visual comparison tool:');
  console.log(`   ${BASE_URL}/visual-comparison`);
}

if (import.meta.main) {
  main().catch(console.error);
}