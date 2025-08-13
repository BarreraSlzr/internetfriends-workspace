#!/usr/bin/env bun
/**
 * Unit tests for OpenCode Helper scoring logic
 * Tests edge cases: raw Date detection, missing patterns, >8 props, banned patterns
 */

import { describe, expect, test } from 'bun:test';
import { OpenCodeHelper } from '../.opencode/helper';

// Ambient declarations for Bun runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Bun: any;

// Mock component content variations for testing
const mockComponents = {
  perfect: `
interface PerfectProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  'data-testid'?: string;
}

import { generateStamp, getIsoTimestamp } from '../utils/stamp';

export const Perfect: React.FC<PerfectProps> = ({ variant = 'primary', disabled = false, 'data-testid': testId }) => {
  if (disabled) return null;
  const config = useMemo(() => ({ id: generateStamp(), createdAt: getIsoTimestamp() }), []);
  return <div data-testid={testId}>Perfect</div>;
};`,

  tooManyProps: `
interface TooManyPropsProps {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
  prop5: string;
  prop6: string;
  prop7: string;
  prop8: string;
  prop9: string; // This exceeds the 8-prop limit
}`,

  rawDateUsage: `
interface RawDateProps {
  variant?: 'primary';
}

export const RawDate = () => {
  const timestamp = new Date().toISOString(); // Raw Date usage
  const now = Date.now(); // Another raw Date usage
  return <div>{timestamp}</div>;
};`,

  bannedPatterns: `
interface BadConfigProps {
  strategy: 'fast' | 'slow'; // Banned: Strategy
  config: ConfigObject; // Banned: Config  
  options: OptionSet; // Banned: Options
}`,

  missingPatterns: `
interface MissingPatternsProps {
  variant: 'primary';
  theme?: 'light' | 'dark';
}

export const Missing = () => {
  return <div>Missing patterns</div>;
};`,

  noPropsInterface: `
export const NoProps = () => {
  return <div>No Props interface</div>;
};`
};

// Utility to create temporary files for testing
async function createTestFile(name: string, content: string): Promise<string> {
  const path = `/tmp/test-${name}-${Math.random().toString(36).slice(2)}.tsx`;
  await Bun.write(path, content);
  return path;
}

async function cleanupTestFile(path: string): Promise<void> {
  try {
    await Bun.file(path).text(); // Check if exists
    // Note: Bun doesn't have unlink in this context, so we'll leave temp files
  } catch {
    // File doesn't exist, no cleanup needed
  }
}

describe('OpenCode Helper Scoring', () => {
  test('perfect component scores 100', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('perfect', mockComponents.perfect);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.score).toBe(100);
    expect(analysis.suggestions).toHaveLength(0);
    expect(analysis.hasDisabled).toBe(true);
    expect(analysis.hasTestId).toBe(true);
    expect(analysis.hasStamp).toBe(true);
    expect(analysis.hasIsoTimestamp).toBe(true);
    expect(analysis.hasRawDateUsage).toBe(false);
    
    await cleanupTestFile(testFile);
  });

  test('too many props reduces score', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('toomany', mockComponents.tooManyProps);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.propsCount).toBe(9);
    expect(analysis.score).toBeLessThan(90); // 100 - 10 (1 extra prop) - other deductions
    expect(analysis.suggestions).toContain('Too many props (9/8)');
    
    await cleanupTestFile(testFile);
  });

  test('raw Date usage penalizes score', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('rawdate', mockComponents.rawDateUsage);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.hasRawDateUsage).toBe(true);
    expect(analysis.score).toBeLessThan(85); // 100 - 15 (raw date) penalty
    expect(analysis.suggestions).toContain('Replace raw Date usage with getIsoTimestamp()/generateStamp()');
    
    await cleanupTestFile(testFile);
  });

  test('banned patterns reduce score significantly', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('banned', mockComponents.bannedPatterns);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.score).toBeLessThan(50); // 100 - (20*3) banned patterns - other deductions
    expect(analysis.suggestions).toContain('Avoid Strategy pattern');
    expect(analysis.suggestions).toContain('Avoid Config pattern');
    expect(analysis.suggestions).toContain('Avoid Options pattern');
    
    await cleanupTestFile(testFile);
  });

  test('missing patterns accumulate suggestions', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('missing', mockComponents.missingPatterns);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.hasDisabled).toBe(false);
    expect(analysis.hasTestId).toBe(false);
    expect(analysis.hasStamp).toBe(false);
    expect(analysis.hasIsoTimestamp).toBe(false);
    
    expect(analysis.suggestions).toContain('Consider adding disabled prop');
    expect(analysis.suggestions).toContain('Add data-testid for testing');
    expect(analysis.suggestions).toContain('Use generateStamp() for unique IDs');
    expect(analysis.suggestions).toContain('Use getIsoTimestamp() for createdAt');
    
    await cleanupTestFile(testFile);
  });

  test('no props interface returns error state', async () => {
    const helper = new OpenCodeHelper();
    const testFile = await createTestFile('noprops', mockComponents.noPropsInterface);
    
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.name).toBe('Unknown');
    expect(analysis.propsCount).toBe(0);
    expect(analysis.score).toBe(0);
    expect(analysis.suggestions).toContain('No Props interface found');
    
    await cleanupTestFile(testFile);
  });

  test('score bounded between 0 and 100', async () => {
    const helper = new OpenCodeHelper();
    const massivelyBadComponent = `
interface MassivelyBadProps {
  strategy1: any; prop1: any; prop2: any; prop3: any; prop4: any; 
  prop5: any; prop6: any; prop7: any; prop8: any; prop9: any; prop10: any;
  config1: any; options1: any;
}
export const Bad = () => {
  const time = new Date().getTime();
  return <div>{time}</div>;
};`;
    
    const testFile = await createTestFile('massive', massivelyBadComponent);
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(100);
    
    await cleanupTestFile(testFile);
  });
});

describe('OpenCode Helper Event Emission', () => {
  test('emits analysis events when emitter provided', async () => {
    const events: any[] = [];
    const mockEmitter = {
      emit: (event: any) => events.push(event)
    };
    
    const helper = new OpenCodeHelper(mockEmitter);
    const testFile = await createTestFile('events', mockComponents.perfect);
    
    await helper.analyzeComponent({ filePath: testFile });
    
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('analysis');
    expect(events[0].analysis.score).toBe(100);
    expect(events[0].filePath).toBe(testFile);
    
    await cleanupTestFile(testFile);
  });

  test('no events when emitter not provided', async () => {
    const helper = new OpenCodeHelper(); // No emitter
    const testFile = await createTestFile('noevents', mockComponents.perfect);
    
    // Should not throw or cause issues
    const analysis = await helper.analyzeComponent({ filePath: testFile });
    expect(analysis.score).toBe(100);
    
    await cleanupTestFile(testFile);
  });
});
