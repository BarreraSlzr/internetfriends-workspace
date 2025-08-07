#!/usr/bin/env bun
// InternetFriends Curl Test Runner - Advanced HTTP Testing with Bun
// Implements curl-based testing for local development and CI/CD pipelines

import { z } from "zod";

// Test Configuration Schema
const CurlTestConfigSchema = z.object({
  name: z.string(),
  url: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  data: z.string().optional(),
  timeout: z.number().default(10000),
  expectedStatus: z.union([z.number(), z.array(z.number())]).default(200),
  expectedHeaders: z.record(z.string(), z.string()).optional(),
  expectedBody: z.string().optional(),
  bodyContains: z.array(z.string()).optional(),
  followRedirects: z.boolean().default(true),
  insecure: z.boolean().default(false),
  retries: z.number().default(3),
  retryDelay: z.number().default(1000),
  validator: z.any().optional(),
  condition: z.any().optional(),
  concurrent: z.number().optional(),
});

export type CurlTestConfig = z.infer<typeof CurlTestConfigSchema>;

// Test Result Schema

  name: z.string(),
  success: z.boolean(),
  status: z.number().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  responseTime: z.number(),
  error: z.string().optional(),
  curlCommand: z.string(),
  timestamp: z.date(),
});

type CurlTestResult = z.infer<typeof CurlTestResultSchema>;

// Curl Test Runner Class
export class CurlTestRunner {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private verbose: boolean;

  constructor(
    baseUrl: string = "http://localhost:3000",
    verbose: boolean = false,
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "User-Agent": "InternetFriends-Test-Runner/1.0",
      Accept: "application/json, text/html, */*",
      "Accept-Encoding": "gzip, deflate",
    };
    this.verbose = verbose;
  }

  // Build curl command from test config
  private buildCurlCommand(config: CurlTestConfig): string {
    const url = config.url.startsWith("http")
      ? config.url
      : `${this.baseUrl}${config.url}`;

    let cmd = `curl -s -w "\\n%{http_code}\\n%{time_total}\\n" -X ${config.method}`;

    // Add headers
    const allHeaders = { ...this.defaultHeaders, ...config.headers };
    for (const [key, value] of Object.entries(allHeaders)) {
      cmd += ` -H "${key}: ${value}"`;
    }

    // Add body for POST/PUT/PATCH
    const bodyData = config.data || config.body;
    if (bodyData && ["POST", "PUT", "PATCH"].includes(config.method)) {
      cmd += ` -d '${bodyData}'`;
    }

    // Add options
    if (config.followRedirects) cmd += " -L";
    if (config.insecure) cmd += " -k";
    if (config.timeout) cmd += ` --max-time ${config.timeout / 1000}`;

    cmd += ` "${url}"`;

    return cmd;
  }

  // Execute curl command with retries
  private async executeCurl(config: CurlTestConfig): Promise<CurlTestResult> {
    const startTime = Date.now();
    const curlCommand = this.buildCurlCommand(config);

    if (this.verbose) {
      console.log(`🌐 Executing: ${curlCommand}`);
    }

    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        const proc = Bun.spawn(curlCommand.split(" "), {
          stdout: "pipe",
          stderr: "pipe",
        });

        const output = await new Response(proc.stdout).text();
        const lines = output.trim().split("\n");

        // Parse curl output (body, status, time)
        const responseTime = Math.round(Date.now() - startTime);
        const timeTotal = parseFloat(lines[lines.length - 1]) * 1000;
        const status = parseInt(lines[lines.length - 2]);
        const body = lines.slice(0, -2).join("\n");

        // Extract headers (if curl -i was used)
        const headers: Record<string, string> = {};

        const result: CurlTestResult = {
          name: config.name,
          success: status === config.expectedStatus,
          status,
          headers,
          body,
          responseTime: timeTotal || responseTime,
          curlCommand,
          timestamp: new Date(),
        };

        // Validate response
        const expectedStatuses = Array.isArray(config.expectedStatus)
          ? config.expectedStatus
          : [config.expectedStatus];

        if (config.expectedStatus && !expectedStatuses.includes(status)) {
          result.success = false;
          result.error = `Expected status ${expectedStatuses.join(" or ")}, got ${status}`;
        }

        if (config.bodyContains) {
          for (const expectedText of config.bodyContains) {
            if (!body.includes(expectedText)) {
              result.success = false;
              result.error = `Body does not contain: "${expectedText}"`;
              break;
            }
          }
        }

        if (config.expectedBody && body !== config.expectedBody) {
          result.success = false;
          result.error = `Body mismatch. Expected: "${config.expectedBody}", Got: "${body.substring(0, 100)}..."`;
        }

        return result;
      } catch (error) {
        if (attempt === config.retries) {
          return {
            name: config.name,
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
            curlCommand,
            timestamp: new Date(),
          };
        }

        if (this.verbose) {
          console.log(
            `  ⚠️  Attempt ${attempt} failed, retrying in ${config.retryDelay}ms...`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      }
    }

    throw new Error("Should not reach here");
  }

  // Run a single test
  async runTest(config: CurlTestConfig): Promise<CurlTestResult> {
    const validatedConfig = CurlTestConfigSchema.parse(config);
    return await this.executeCurl(validatedConfig);
  }

  // Run multiple tests
  async runTests(configs: CurlTestConfig[]): Promise<CurlTestResult[]> {
    const results: CurlTestResult[] = [];

    for (const config of configs) {
      if (config.concurrent && config.concurrent > 1) {
        // Handle concurrent tests
        const concurrentResults = await Promise.all(
          Array(config.concurrent)
            .fill(null)
            .map(() => this.runTest(config)),
        );
        results.push(...concurrentResults);
      } else {
        const result = await this.runTest(config);
        results.push(result);
      }

      if (this.verbose) {
        const lastResult = results[results.length - 1];
        const status = lastResult.success ? "✅" : "❌";
        console.log(
          `${status} ${lastResult.name} (${lastResult.responseTime}ms)`,
        );
        if (!lastResult.success && lastResult.error) {
          console.log(`     Error: ${lastResult.error}`);
        }
      }
    }

    return results;
  }

  // Generate test report
  generateReport(results: CurlTestResult[]): string {
    const passed = results.filter((r) => r.success).length;
    const failed = results.length - passed;
    const avgResponseTime =
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    let report = "# InternetFriends Curl Test Report\n\n";
    report += `**Summary:** ${passed}/${results.length} tests passed\n`;
    report += `**Average Response Time:** ${avgResponseTime.toFixed(2)}ms\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    if (failed > 0) {
      report += "## Failed Tests\n\n";
      results
        .filter((r) => !r.success)
        .forEach((result) => {
          report += `### ❌ ${result.name}\n`;
          report += `- **Status:** ${result.status || "N/A"}\n`;
          report += `- **Response Time:** ${result.responseTime}ms\n`;
          report += `- **Error:** ${result.error}\n`;
          report += `- **Curl Command:** \`${result.curlCommand}\`\n\n`;
        });
    }

    report += "## All Test Results\n\n";
    results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      report += `${status} **${result.name}** (${result.responseTime}ms)\n`;
    });

    return report;
  }
}

// Predefined test suites for InternetFriends
export const InternetFriendsTestSuites = {
  // Health check tests
  healthCheck: [
    {
      name: "Homepage Load",
      url: "/",
      method: "GET" as const,
      expectedStatus: 200,
      bodyContains: ["InternetFriends"],
    },
    {
      name: "API Health Check",
      url: "/api/health",
      method: "GET" as const,
      expectedStatus: 200,
    },
    {
      name: "Design System Page",
      url: "/design-system",
      method: "GET" as const,
      expectedStatus: 200,
      bodyContains: ["Design System"],
    },
  ],

  // API endpoints
  apiTests: [
    {
      name: "User Session Check",
      url: "/api/auth/session",
      method: "GET" as const,
      expectedStatus: 200,
    },
    {
      name: "Database Health",
      url: "/api/db/health",
      method: "GET" as const,
      expectedStatus: 200,
    },
  ],

  // Performance tests
  performanceTests: [
    {
      name: "Homepage Performance",
      url: "/",
      method: "GET" as const,
      expectedStatus: 200,
      timeout: 3000, // 3 second max
    },
    {
      name: "Static Assets",
      url: "/favicon.ico",
      method: "GET" as const,
      expectedStatus: 200,
      timeout: 1000,
    },
  ],

  // Security tests
  securityTests: [
    {
      name: "CORS Headers",
      url: "/",
      method: "OPTIONS" as const,
      expectedStatus: 200,
    },
    {
      name: "Security Headers Check",
      url: "/",
      method: "GET" as const,
      expectedStatus: 200,
    },
  ],
};

// CLI Runner
export async function runCurlTests(
  suite: keyof typeof InternetFriendsTestSuites = "healthCheck",
  verbose: boolean = false,
) {
  const runner = new CurlTestRunner("http://localhost:3000", verbose);
  const rawTests = InternetFriendsTestSuites[suite];

  // Transform tests to include required properties
  const tests: CurlTestConfig[] = rawTests.map((__event: Event) => ({
    ...test,
    timeout: test.timeout || 10000,
    followRedirects: test.followRedirects ?? true,
    insecure: test.insecure ?? false,
    retries: test.retries || 3,
    retryDelay: test.retryDelay || 1000,
  }));

  console.log(`🧪 Running ${suite} test suite (${tests.length} tests)...`);
  console.log("= ".repeat(50));

  const results = await runner.runTests(tests);
  const report = runner.generateReport(results);

  console.log("\n" + "= ".repeat(50));
  console.log(report);

  // Write report to file
  const reportPath = `./tests/curl/reports/curl-test-report-${suite}-${Date.now()}.md`;
  await Bun.write(reportPath, report);
  console.log(`📊 Report saved to: ${reportPath}`);

  // Exit with error code if any tests failed
  const failedCount = results.filter((r) => !r.success).length;
  if (failedCount > 0) {
    console.log(`\n❌ ${failedCount} tests failed`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tests passed!`);
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.main) {
  const args = process.argv.slice(2);
  const suite =
    (args[0] as keyof typeof InternetFriendsTestSuites) || "healthCheck";
  const verbose = args.includes("--verbose") || args.includes("-v");

  await runCurlTests(suite, verbose);
}
