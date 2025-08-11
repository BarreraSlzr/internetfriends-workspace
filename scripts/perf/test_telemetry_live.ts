#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { execSync } from 'child_process';

interface TelemetryLiveTest {
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  tests: {
    componentExists: boolean;
    hookExists: boolean;
    layoutIntegration: boolean;
    nextDevRunning: boolean;
    portAvailable: boolean;
    telemetryActive: boolean;
  };
  server: {
    port: number;
    url: string;
    running: boolean;
  };
  instructions: string[];
  verificationSteps: string[];
}

const checkPortAvailable = (port: number): boolean => {
  try {
    execSync(`lsof -ti:${port}`, { stdio: 'ignore' });
    return false; // Port is in use
  } catch {
    return true; // Port is available
  }
};

const checkNextDevProcess = (): boolean => {
  try {
    const processes = execSync('ps aux | grep "next dev" | grep -v grep', { encoding: 'utf8' });
    return processes.trim().length > 0;
  } catch {
    return false;
  }
};

const analyzeTelemetrySetup = async (): Promise<TelemetryLiveTest> => {
  const test: TelemetryLiveTest = {
    timestamp: new Date().toISOString(),
    status: 'passed',
    tests: {
      componentExists: false,
      hookExists: false,
      layoutIntegration: false,
      nextDevRunning: false,
      portAvailable: false,
      telemetryActive: false
    },
    server: {
      port: 3000,
      url: 'http://localhost:3000',
      running: false
    },
    instructions: [],
    verificationSteps: []
  };

  // Check if telemetry hook exists
  try {
    await readFile('hooks/perf/use_web_vitals_telemetry.ts', 'utf8');
    test.tests.hookExists = true;
  } catch {
    test.status = 'failed';
  }

  // Check if telemetry component exists
  try {
    await readFile('components/perf/performance_metrics_initializer.tsx', 'utf8');
    test.tests.componentExists = true;
  } catch {
    test.status = 'failed';
  }

  // Check layout integration
  try {
    const layoutContent = await readFile('nextjs-website/app/layout.tsx', 'utf8');
    if (layoutContent.includes('PerformanceMetricsInitializer')) {
      test.tests.layoutIntegration = true;
    } else {
      test.status = 'failed';
    }
  } catch {
    test.status = 'failed';
  }

  // Check if Next.js dev server is running
  test.tests.nextDevRunning = checkNextDevProcess();
  test.server.running = test.tests.nextDevRunning;

  // Check port availability
  test.tests.portAvailable = checkPortAvailable(3000);

  // If all components are present, telemetry should be active
  test.tests.telemetryActive = test.tests.componentExists &&
                               test.tests.hookExists &&
                               test.tests.layoutIntegration;

  // Generate instructions based on current state
  if (!test.tests.nextDevRunning) {
    test.instructions.push('1. Start Next.js development server:');
    test.instructions.push('   cd nextjs-website && bun run dev');
    test.instructions.push('');
  }

  if (test.tests.telemetryActive) {
    test.instructions.push('2. Open browser and navigate to: http://localhost:3000');
    test.instructions.push('3. Open browser DevTools (F12)');
    test.instructions.push('4. Go to Console tab');
    test.instructions.push('5. Look for performance telemetry messages:');
    test.instructions.push('   🚀 FCP: XXXms');
    test.instructions.push('   🚀 LCP: XXXms');
    test.instructions.push('   🚀 CLS: X.XXX');
    test.instructions.push('   🚀 TTFB: XXXms');
    test.instructions.push('');
    test.instructions.push('6. In development mode, you should also see a debug overlay in the top-right corner');
    test.instructions.push('   showing live telemetry data');
    test.instructions.push('');
    test.instructions.push('7. Test force flush with keyboard shortcut: Ctrl+Shift+P (or Cmd+Shift+P on Mac)');
    test.instructions.push('');
  }

  // Verification steps
  test.verificationSteps = [
    'Check console for telemetry log messages (🚀 prefix)',
    'Verify debug overlay appears in top-right (development only)',
    'Confirm metrics update as you navigate pages',
    'Test keyboard shortcut for manual flush',
    'Verify no console errors related to performance observer',
    'Check Network tab for any beacon requests (if NEXT_PUBLIC_PERF_BEACON_URL is set)'
  ];

  return test;
};

const printLiveTestInstructions = (test: TelemetryLiveTest): void => {
  console.log('🔴 LIVE PERFORMANCE TELEMETRY TEST');
  console.log('═══════════════════════════════════════\n');

  console.log(`🕐 Timestamp: ${test.timestamp}`);
  console.log(`📊 Status: ${test.status.toUpperCase()}\n`);

  console.log('📋 COMPONENT CHECK:');
  console.log(`  ${test.tests.hookExists ? '✅' : '❌'} Telemetry Hook: hooks/perf/use_web_vitals_telemetry.ts`);
  console.log(`  ${test.tests.componentExists ? '✅' : '❌'} Telemetry Component: components/perf/performance_metrics_initializer.tsx`);
  console.log(`  ${test.tests.layoutIntegration ? '✅' : '❌'} Layout Integration: nextjs-website/app/layout.tsx`);
  console.log(`  ${test.tests.telemetryActive ? '✅' : '❌'} Telemetry Active: All components integrated`);

  console.log('\n🌐 SERVER STATUS:');
  console.log(`  ${test.tests.nextDevRunning ? '✅' : '❌'} Next.js Dev Server: ${test.server.running ? 'Running' : 'Not Running'}`);
  console.log(`  ${test.tests.portAvailable ? '⚠️  Available' : '✅ In Use'} Port 3000: ${test.server.url}`);

  if (test.status === 'failed') {
    console.log('\n❌ SETUP ISSUES DETECTED:');
    if (!test.tests.hookExists) console.log('  - Telemetry hook file missing');
    if (!test.tests.componentExists) console.log('  - Telemetry component file missing');
    if (!test.tests.layoutIntegration) console.log('  - Component not integrated in layout');
    console.log('\n🔧 Run Phase 2 setup first: bun scripts/perf/start_phase2.ts');
    return;
  }

  console.log('\n📝 LIVE TEST INSTRUCTIONS:');
  console.log('═══════════════════════════════\n');

  test.instructions.forEach(instruction => {
    console.log(instruction);
  });

  console.log('🔍 VERIFICATION CHECKLIST:');
  console.log('═══════════════════════════\n');

  test.verificationSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  console.log('\n📊 EXPECTED TELEMETRY OUTPUT:');
  console.log('════════════════════════════════\n');

  console.log('Console messages you should see:');
  console.log('  🚀 TTFB: 45.67ms { type: "PERF_METRIC", metric: "TTFB", value: 45.67, ... }');
  console.log('  🚀 FCP: 123.45ms { type: "PERF_METRIC", metric: "FCP", value: 123.45, ... }');
  console.log('  🚀 LCP: 234.56ms { type: "PERF_METRIC", metric: "LCP", value: 234.56, ... }');
  console.log('  🚀 CLS: 0.023 { type: "PERF_METRIC", metric: "CLS", value: 0.023, ... }');
  console.log('');

  console.log('Debug overlay (development only):');
  console.log('  ┌─────────────────────────────┐');
  console.log('  │ 🚀 Performance Telemetry    │');
  console.log('  │ Navigation: nav_12345       │');
  console.log('  │ Queued metrics: 3           │');
  console.log('  │ Beacon: ✅                  │');
  console.log('  │ Ctrl+Shift+P to flush       │');
  console.log('  └─────────────────────────────┘');
  console.log('');

  console.log('🎯 PERFORMANCE TARGETS:');
  console.log('═══════════════════════════\n');

  console.log('Good performance metrics for development:');
  console.log('  📈 TTFB: < 100ms (Time to First Byte)');
  console.log('  🎯 FCP: < 300ms (First Contentful Paint)');
  console.log('  🏁 LCP: < 500ms (Largest Contentful Paint)');
  console.log('  📊 CLS: < 0.1 (Cumulative Layout Shift)');
  console.log('  ⚡ INP: < 200ms (Interaction to Next Paint)');

  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('══════════════════\n');

  console.log('If no telemetry appears:');
  console.log('  1. Check browser console for errors');
  console.log('  2. Verify browser supports PerformanceObserver API');
  console.log('  3. Hard refresh page (Ctrl+Shift+R)');
  console.log('  4. Check component is actually rendered (React DevTools)');
  console.log('');

  console.log('If debug overlay missing:');
  console.log('  1. Confirm NODE_ENV=development');
  console.log('  2. Check showDebugInfo prop is true');
  console.log('  3. Verify no CSS is hiding the overlay');
  console.log('');

  console.log('For production testing:');
  console.log('  1. Set NEXT_PUBLIC_PERF_BEACON_URL environment variable');
  console.log('  2. Build and start production server: bun run build && bun run start');
  console.log('  3. Check Network tab for beacon requests');

  console.log('\n✅ Ready for live testing! Follow the instructions above.');
};

const main = async (): Promise<void> => {
  console.log('🔴 Starting live telemetry test setup...\n');

  try {
    const test = await analyzeTelemetrySetup();
    printLiveTestInstructions(test);

    // Save test setup
    const setupPath = `scripts/perf/snapshots/telemetry-live-test-${Date.now()}.json`;
    await Bun.write(setupPath, JSON.stringify(test, null, 2));
    console.log(`\n💾 Test setup saved: ${setupPath}`);

    console.log('\n🎯 NEXT STEPS:');
    if (test.status === 'failed') {
      console.log('  ❌ Fix setup issues first, then re-run this test');
      process.exit(1);
    } else if (!test.tests.nextDevRunning) {
      console.log('  🚀 Start the development server and follow the instructions above');
    } else {
      console.log('  🌐 Open browser to http://localhost:3000 and check DevTools console');
    }

    console.log('\n📝 Report your findings to validate Phase 2 telemetry integration!');

  } catch (error) {
    console.error('❌ Live test setup failed:', error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { analyzeTelemetrySetup, TelemetryLiveTest };
