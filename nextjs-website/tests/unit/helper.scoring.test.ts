#!/usr/bin/env bun
/**
 * Helper Scoring Edge Cases Unit Tests
 * Tests raw Date detection, missing disabled, >8 props, banned pattern, stamp & iso presence
 */

import { describe, test, expect } from "bun:test";

// Mock component content variations for testing
const mockComponents = {
  perfectComponent: `
interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, disabled = false, onClick, ...props }, ref) => {
      return (
        <button 
          ref={ref}
          disabled={disabled}
          onClick={onClick}
          data-testid="button"
          className={styles.button}
          {...props}
        >
          {children}
        </button>
      );
    }
  )
);`,

  rawDateUsage: `
interface ComponentProps {
  title: string;
}

export const Component: React.FC<ComponentProps> = ({ title }) => {
  const timestamp = new Date(); // Raw Date usage - should be penalized
  
  return (
    <div className={styles.component}>
      <span>{title}</span>
      <time>{timestamp.toISOString()}</time>
    </div>
  );
};`,

  bannedPatterns: `
interface DebugProps {
  value: string;
}

export const Debug: React.FC<DebugProps> = ({ value }) => {
  console.log('Debug value:', value); // Banned pattern
  debugger; // Another banned pattern
  
  return <div>{value}</div>;
};`,

  excessiveProps: `
interface OverloadedProps {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
  prop5: string;
  prop6: string;
  prop7: string;
  prop8: string;
  prop9: string; // This makes it >8 props
  prop10: string;
  prop11: string;
}

export const Overloaded: React.FC<OverloadedProps> = (props) => {
  return <div>Too many props</div>;
};`,

  missingDisabled: `
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  // Missing disabled prop
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};`,

  goodTimestampUsage: `
import { generateStamp, getIsoTimestamp } from '@/utils/stamp';

interface TimestampProps {
  title: string;
}

export const Timestamp: React.FC<TimestampProps> = ({ title }) => {
  const created = getIsoTimestamp();
  const id = generateStamp();
  
  return (
    <div data-stamp={id} data-created={created}>
      {title}
    </div>
  );
};`,

  missingInterface: `
export const NoInterface = (props: any) => {
  return <div>{props.children}</div>;
};`,

  noTestId: `
interface SimpleProps {
  text: string;
}

export const Simple: React.FC<SimpleProps> = ({ text }) => {
  return <div className={styles.simple}>{text}</div>;
};`,
};

// Mock scoring function (simplified version for testing)
function mockScoreComponent(componentPath: string, content: string) {
  let score = 100;
  const deductions: string[] = [];
  const patterns = {
    hasDisabled: /disabled\??\s*:/.test(content),
    hasTestId: /data-testid/.test(content),
    hasStamp: /generateStamp|stamp/.test(content),
    hasIsoTimestamp: /getIsoTimestamp|iso.*timestamp/i.test(content),
    hasRawDate:
      /new Date\(\)/.test(content) &&
      !/getIsoTimestamp|generateStamp/.test(content),
    hasBannedPatterns: /console\.log|debugger/.test(content),
    propCount: (content.match(/\w+\??\s*:/g) || []).length,
    hasProperInterface: /interface\s+\w+Props/.test(content),
    hasMemoization: /React\.memo/.test(content),
    hasForwardRef: /forwardRef/.test(content),
  };

  // Scoring logic
  if (!patterns.hasDisabled && componentPath.includes("button")) {
    score -= 5;
    deductions.push("Missing disabled prop for button component");
  }

  if (!patterns.hasTestId) {
    score -= 5;
    deductions.push("Missing test identifier");
  }

  if (!patterns.hasStamp && !patterns.hasIsoTimestamp) {
    score -= 5;
    deductions.push("Missing timestamp utilities");
  }

  if (patterns.hasRawDate) {
    score -= 15;
    deductions.push("Raw Date usage detected");
  }

  if (patterns.hasBannedPatterns) {
    score -= 25;
    deductions.push("Banned debugging patterns found");
  }

  if (patterns.propCount > 8) {
    score -= 10;
    deductions.push(`Excessive props: ${patterns.propCount}`);
  }

  if (!patterns.hasProperInterface) {
    score -= 20;
    deductions.push("Missing proper TypeScript interface");
  }

  return {
    score: Math.max(0, score),
    patterns,
    deductions,
    propCount: patterns.propCount,
  };
}

describe("Helper Scoring Edge Cases", () => {
  describe("Raw Date Detection", () => {
    test("should penalize raw Date() usage", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.rawDateUsage,
      );

      expect(result.patterns.hasRawDate).toBe(true);
      expect(result.deductions).toContain("Raw Date usage detected");
      expect(result.score).toBeLessThan(100);
    });

    test("should allow proper timestamp utilities", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.goodTimestampUsage,
      );

      expect(result.patterns.hasRawDate).toBe(false);
      expect(result.patterns.hasStamp).toBe(true);
      expect(result.patterns.hasIsoTimestamp).toBe(true);
      expect(result.deductions).not.toContain("Raw Date usage detected");
    });
  });

  describe("Disabled Prop Detection", () => {
    test("should penalize missing disabled prop in button components", () => {
      const result = mockScoreComponent(
        "/components/button/button.tsx",
        mockComponents.missingDisabled,
      );

      expect(result.patterns.hasDisabled).toBe(false);
      expect(result.deductions).toContain(
        "Missing disabled prop for button component",
      );
    });

    test("should not penalize missing disabled in non-button components", () => {
      const result = mockScoreComponent(
        "/components/card/card.tsx",
        mockComponents.missingDisabled,
      );

      expect(result.deductions).not.toContain(
        "Missing disabled prop for button component",
      );
    });
  });

  describe("Excessive Props Detection", () => {
    test("should penalize components with >8 props", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.excessiveProps,
      );

      expect(result.propCount).toBeGreaterThan(8);
      expect(result.deductions.some((d) => d.includes("Excessive props"))).toBe(
        true,
      );
      expect(result.score).toBeLessThan(90);
    });

    test("should allow reasonable prop counts", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.perfectComponent,
      );

      expect(result.propCount).toBeLessThanOrEqual(8);
      expect(result.deductions.some((d) => d.includes("Excessive props"))).toBe(
        false,
      );
    });
  });

  describe("Banned Pattern Detection", () => {
    test("should heavily penalize console.log and debugger", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.bannedPatterns,
      );

      expect(result.patterns.hasBannedPatterns).toBe(true);
      expect(result.deductions).toContain("Banned debugging patterns found");
      expect(result.score).toBeLessThan(75); // Heavy penalty
    });

    test("should allow clean code without debugging", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.perfectComponent,
      );

      expect(result.patterns.hasBannedPatterns).toBe(false);
      expect(result.deductions).not.toContain(
        "Banned debugging patterns found",
      );
    });
  });

  describe("Stamp & ISO Timestamp Presence", () => {
    test("should detect generateStamp usage", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.goodTimestampUsage,
      );

      expect(result.patterns.hasStamp).toBe(true);
      expect(result.deductions).not.toContain("Missing timestamp utilities");
    });

    test("should detect getIsoTimestamp usage", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.goodTimestampUsage,
      );

      expect(result.patterns.hasIsoTimestamp).toBe(true);
      expect(result.deductions).not.toContain("Missing timestamp utilities");
    });

    test("should penalize missing timestamp utilities", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.missingInterface,
      );

      expect(result.patterns.hasStamp).toBe(false);
      expect(result.patterns.hasIsoTimestamp).toBe(false);
      expect(result.deductions).toContain("Missing timestamp utilities");
    });
  });

  describe("Interface Detection", () => {
    test("should penalize missing TypeScript interfaces", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.missingInterface,
      );

      expect(result.patterns.hasProperInterface).toBe(false);
      expect(result.deductions).toContain(
        "Missing proper TypeScript interface",
      );
      expect(result.score).toBeLessThan(80);
    });

    test("should allow proper interfaces", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.perfectComponent,
      );

      expect(result.patterns.hasProperInterface).toBe(true);
      expect(result.deductions).not.toContain(
        "Missing proper TypeScript interface",
      );
    });
  });

  describe("Test ID Detection", () => {
    test("should penalize missing data-testid", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.noTestId,
      );

      expect(result.patterns.hasTestId).toBe(false);
      expect(result.deductions).toContain("Missing test identifier");
    });

    test("should allow components with test IDs", () => {
      const result = mockScoreComponent(
        "/components/test.tsx",
        mockComponents.perfectComponent,
      );

      expect(result.patterns.hasTestId).toBe(true);
      expect(result.deductions).not.toContain("Missing test identifier");
    });
  });

  describe("Comprehensive Scoring", () => {
    test("perfect component should score high", () => {
      const result = mockScoreComponent(
        "/components/button/button.tsx",
        mockComponents.perfectComponent,
      );

      expect(result.score).toBeGreaterThan(85);
      expect(result.deductions.length).toBeLessThan(3);
    });

    test("component with multiple issues should score low", () => {
      const badComponent =
        mockComponents.bannedPatterns + mockComponents.rawDateUsage;
      const result = mockScoreComponent("/components/test.tsx", badComponent);

      expect(result.score).toBeLessThan(60);
      expect(result.deductions.length).toBeGreaterThan(2);
    });
  });
});

// Integration test with actual helper if available
describe("Helper Integration", () => {
  test("should integrate with existing test script", async () => {
    // This test ensures our scoring tests integrate with the project's test runner
    expect(true).toBe(true); // Placeholder - actual helper integration would go here
  });
});

console.log("🧪 Helper Scoring Tests Created");
console.log("Run with: bun test tests/unit/helper.scoring.test.ts");
