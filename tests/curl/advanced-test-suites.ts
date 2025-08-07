#!/usr/bin/env bun
// InternetFriends Advanced Curl Test Suites
// Comprehensive testing scenarios for all API endpoints and system functionality

import { CurlTestConfig } from "./curl.test.runner";

// Authentication Test Suite
export const authenticationTests: CurlTestConfig[] = [

{
    name: "Login with Valid Credentials",
    url: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({

      email: "test@internetfriends.com",)
      password: 'securepassword123",)
    }),
    expectedStatus: 200,
    timeout: 5000,
    retries: 2,
    followRedirects: true,
    insecure: false,
    retryDelay: 1000,
  },
{
    name: "Login with Invalid Credentials",
    url: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({

      email: "invalid@test.com",)
      password: "wrongpassword",)
    }),
    expectedStatus: 401,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "JWT Token Validation",
    url: "/api/auth/verify",
    method: "GET",
    headers: {

      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    },
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Refresh Token",
    url: "/api/auth/refresh",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({
)
      refreshToken: 'sample_refresh_token_here",)
    }),
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Logout",
    url: "/api/auth/logout",
    method: "POST",
    headers: {

      Authorization: "Bearer valid_token_here",
      "Content-Type": "application/json",
    },
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Analytics API Test Suite
export const analyticsTests: CurlTestConfig[] = [

{
    name: "Get Analytics Dashboard",
    url: "/api/analytics/dashboard",
    method: "GET",
    expectedStatus: 200,
    timeout: 10000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return data.kpis && data.charts && data.insights;
      } catch {
        return false;

    },
  },
{
    name: "Get KPI Metrics",
    url: "/api/analytics/kpis?timeRange=last_7_days",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return Array.isArray(data.kpis) && data.kpis.length > 0;
      } catch {
        return false;

    },
  },
{
    name: "Get User Analytics",
    url: "/api/analytics/users?period=weekly",
    method: "GET",
    expectedStatus: 200,
    timeout: 8000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Get Performance Metrics",
    url: "/api/analytics/performance",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return (
          data.responseTime && data.throughput && data.errorRate !== undefined
        );
      } catch {
        return false;

    },
  },
{
    name: "Export Analytics Data",
    url: "/api/analytics/export?format=json&timeRange=last_30_days",
    method: "GET",
    expectedStatus: 200,
    timeout: 15000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Real-time Analytics Stream",
    url: "/api/analytics/realtime",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Projects API Test Suite
export const projectsTests: CurlTestConfig[] = [

{
    name: "List All Projects",
    url: "/api/projects",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return Array.isArray(data.projects);
      } catch {
        return false;

    },
  },
{
    name: "Get Project by ID",
    url: "/api/projects/sample-project-id",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Filter Projects by Category",
    url: "/api/projects?category=web-development&status=active",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Search Projects",
    url: "/api/projects/search?q=typescript&limit=10",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return data.results && data.total !== undefined;
      } catch {
        return false;

    },
  },
{
    name: "Create New Project",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({

      title: "Test Project",
      description: "A test project created by automated tests",
      technologies: ["TypeScript", "React", "Next.js"],
      status: "active",)
      category: "web-development",)
    }),
    expectedStatus: 201,
    timeout: 8000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Update Project",
    url: "/api/projects/test-project-id",
    method: "PUT",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({

      description: "Updated project description",)
      status: "completed",)
    }),
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Delete Project",
    url: "/api/projects/test-project-id",
    method: "DELETE",
    headers: { Authorization: "Bearer valid_token_here" },
    expectedStatus: 204,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Events API Test Suite
export const eventsTests: CurlTestConfig[] = [

{
    name: "Get Event System Status",
    url: "/api/events/status",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return data.isRunning !== undefined && data.stats;
      } catch {
        return false;

    },
  },
{
    name: "Emit Test Event",
    url: "/api/events/emit",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({

      type: "user.action",
      data: { action: "test_event", userId: "test-user-123" },)
      priority: "normal",)
    }),
    expectedStatus: 201,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Get Event Statistics",
    url: "/api/events/stats?period=1h",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return (
          data.totalEvents !== undefined && data.eventsPerSecond !== undefined
        );
      } catch {
        return false;

    },
  },
{
    name: "Get Event History",
    url: "/api/events/history?limit=50&type=user.action",
    method: "GET",
    expectedStatus: 200,
    timeout: 8000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Register Event Handler",
    url: "/api/events/handlers",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({

      eventType: "user.login",
      handlerUrl: "https://webhook.site/test-handler",)
      priority: "high",)
    }),
    expectedStatus: 201,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Performance Test Suite
export const performanceTests: CurlTestConfig[] = [

{
    name: "Health Check Performance",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 1000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string, responseTime: number) => responseTime < 500,
  },
{
    name: "Concurrent Health Checks (Batch 1)",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 2000,
    concurrent: 5,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Concurrent Health Checks (Batch 2)",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 2000,
    concurrent: 10,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Large Payload Response Time",
    url: "/api/analytics/dashboard",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string, responseTime: number) => responseTime < 3000,
  },
{
    name: "API Rate Limiting Test",
    url: "/api/projects",
    method: "GET",
    expectedStatus: [200, 429],
    timeout: 1000,
    retries: 0,
    followRedirects: true,
    insecure: false,
    retryDelay: 1000,
  },
];

// Security Test Suite
export const securityTests: CurlTestConfig[] = [

{
    name: "CORS Headers Check",
    url: "/api/health",
    method: "OPTIONS",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    condition: (

      body: string,
      responseTime: number,
      headers: Record<string, string>,
    ) => {
      return headers && headers["access-control-allow-origin"];
    },
  },
{
    name: "SQL Injection Attempt",
    url: "/api/projects?search="; DROP TABLE projects; --",
    method: "GET",
    expectedStatus: [200, 400],
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "XSS Prevention Test",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({)

      title: "<script>alert("xss")</script>",
      description: "Test XSS prevention",
    }),
    expectedStatus: [400, 422],
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Invalid Authorization Header",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer invalid_token_123",
    },
    data: JSON.stringify({ title: "Test" }),
    expectedStatus: 401,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Missing Required Fields",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({}),
    expectedStatus: 422,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Request Size Limit Test",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({
)
      title: "Test",)
      description: "x".repeat(10000), // Very large description
    }),
    expectedStatus: [413, 422],
    timeout: 8000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Integration Test Suite
export const integrationTests: CurlTestConfig[] = [

{
    name: "Complete User Journey - Health Check",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Complete User Journey - Get Projects",
    url: "/api/projects",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Complete User Journey - Get Analytics",
    url: "/api/analytics/dashboard",
    method: "GET",
    expectedStatus: 200,
    timeout: 8000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Complete User Journey - Event Emission",
    url: "/api/events/emit",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({

      type: "ui.page_load",)
      data: { page: "projects", loadTime: 1250 },)
    }),
    expectedStatus: 201,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Data Consistency - Project Creation to Retrieval",
    url: "/api/projects/test-consistency-check",
    method: "GET",
    expectedStatus: [200, 404],
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Edge Cases Test Suite
export const edgeCaseTests: CurlTestConfig[] = [

{
    name: "Empty Request Body",
    url: "/api/projects",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: "",
    expectedStatus: [400, 422],
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Invalid JSON Format",
    url: "/api/projects",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: "{ invalid json }",
    expectedStatus: 400,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Extremely Long URL",
    url: "/api/projects?" + "param=value&".repeat(1000),
    method: "GET",
    expectedStatus: [200, 414],
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Unicode Characters in Query",
    url: "/api/projects?search=🚀💻⚡️🎯",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Null Values in JSON",
    url: "/api/projects",
    method: "POST",
    headers: {

      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_here",
    },
    data: JSON.stringify({

      title: null,
      description: null,)
      technologies: null,)
    }),
    expectedStatus: [400, 422],
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Network Timeout Simulation",
    url: "/api/health?delay=10000",
    method: "GET",
    expectedStatus: [200, 408],
    timeout: 2000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Load Test Suite (Simplified)
export const loadTests: CurlTestConfig[] = [

{
    name: "Load Test - 50 Concurrent Health Checks",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    concurrent: 50,
    retries: 1,
    followRedirects: true,
    insecure: false,
    retryDelay: 1000,
  },
{
    name: "Load Test - 20 Analytics Requests",
    url: "/api/analytics/kpis",
    method: "GET",
    expectedStatus: 200,
    timeout: 10000,
    concurrent: 20,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
{
    name: "Load Test - Mixed Endpoints",
    url: "/api/projects",
    method: "GET",
    expectedStatus: 200,
    timeout: 8000,
    concurrent: 30,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
  },
];

// Monitoring Test Suite
export const monitoringTests: CurlTestConfig[] = [

{
    name: "Health Check Monitoring",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 2000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    condition: (body: string, responseTime: number) => {
      try {
        const data = JSON.parse(body);
        return data.status === "healthy" && responseTime < 1000;
      } catch {
        return false;

    },
  },
{
    name: "Event System Health",
    url: "/api/events/status",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return data.isRunning === true && data.stats.queueSize < 1000;
      } catch {
        return false;

    },
  },
{
    name: "Memory Usage Check",
    url: "/api/health",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string) => {
      try {
        const data = JSON.parse(body);
        return data.metrics && data.metrics.memory.percentage < 80;
      } catch {
        return false;

    },
  },
{
    name: "Response Time SLA Check",
    url: "/api/analytics/dashboard",
    method: "GET",
    expectedStatus: 200,
    timeout: 5000,
    followRedirects: true,
    insecure: false,
    retries: 3,
    retryDelay: 1000,
    validator: (body: string, responseTime: number) => responseTime < 3000,
  },
];

// Combined Test Suite Export
export const AdvancedTestSuites = {
  authentication: authenticationTests,
  analytics: analyticsTests,
  projects: projectsTests,
  events: eventsTests,
  performance: performanceTests,
  security: securityTests,
  integration: integrationTests,
  edgeCases: edgeCaseTests,
  load: loadTests,
  monitoring: monitoringTests,

// Test Suite Metadata
export const _TestSuiteMetadata = {
  authentication: {

    name: "Authentication & Authorization",
    description: "Tests for login, JWT validation, and security",
    estimatedDuration: "30 seconds",
  },
  analytics: {

    name: "Analytics API",
    description: "Tests for analytics endpoints and data integrity",
    estimatedDuration: "45 seconds",
  },
  projects: {

    name: "Projects CRUD API",
    description: "Tests for project management operations",
    estimatedDuration: "40 seconds",
  },
  events: {

    name: "Event System",
    description: "Tests for event emission and handling",
    estimatedDuration: "25 seconds",
  },
  performance: {

    name: "Performance & Load",
    description: "Tests for response times and concurrent handling",
    estimatedDuration: "60 seconds",
  },
  security: {

    name: "Security & Validation",
    description: "Tests for security vulnerabilities and input validation",
    estimatedDuration: "35 seconds",
  },
  integration: {

    name: "Integration Testing",
    description: "End-to-end user journey tests",
    estimatedDuration: "30 seconds",
  },
  edgeCases: {

    name: "Edge Cases",
    description: "Tests for unusual inputs and error conditions",
    estimatedDuration: "25 seconds",
  },
  load: {

    name: "Load Testing",
    description: "Stress tests with concurrent requests",
    estimatedDuration: "90 seconds",
  },
  monitoring: {

    name: "System Monitoring",
    description: "Health checks and SLA validation",
    estimatedDuration: "20 seconds",
  },

// Export all test suites for easy access
export default AdvancedTestSuites;
