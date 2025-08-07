# InternetFriends Testing & Event System

A comprehensive testing and event-driven architecture for the InternetFriends Next.js application, featuring advanced curl-based HTTP testing, compute optimization, and real-time event processing.

## Overview

This testing system combines three powerful approaches:

1. **Curl-Based HTTP Testing** - Unix-native HTTP testing using curl commands executed through Bun
2. **Event-Driven Architecture** - High-performance event system for compute optimization and system coordination
3. **Integration Testing** - Hybrid tests combining HTTP, events, and compute systems

## Architecture

→ [Project Structure](../README.md#architecture)
→ [Event System Implementation](../lib/events/event.system.ts)
→ [Compute Events Implementation](../lib/events/compute.events.ts)
→ [Curl Test Runner](./curl/curl.test.runner.ts)
→ [Integration Tests](./integration/event.compute.integration.test.ts)

## Features

### 🌐 Curl-Based HTTP Testing

→ [CurlTestRunner Implementation](./curl/curl.test.runner.ts)
→ [Test Suites Configuration](./curl/curl.test.runner.ts#L287-L340)
→ [Retry Logic](./curl/curl.test.runner.ts#L83-L115)
→ [Report Generation](./curl/curl.test.runner.ts#L193-L220)

### ⚡ Event-Driven System

→ [Event System Core](../lib/events/event.system.ts)
→ [Event Types & Schemas](../lib/events/event.system.ts#L10-L52)
→ [Event Queue Implementation](../lib/events/event.system.ts#L116-L148)
→ [Performance Statistics](../lib/events/event.system.ts#L107-L115)

### 🔧 Compute Optimization

→ [Compute Event Manager](../lib/events/compute.events.ts)
→ [Job Queue System](../lib/events/compute.events.ts#L145-L220)
→ [Resource Monitor](../lib/events/compute.events.ts#L222-L335)
→ [Auto-scaling Logic](../lib/events/compute.events.ts#L603-L618)

## Quick Start

### 1. Install Dependencies

→ [Package.json Scripts](../package.json#L10-L35)

### 2. Start the Development Server

→ [Development Scripts](../package.json#L10-L11)

### 3. Run Tests

→ [All Testing Scripts](../package.json#L15-L28)
→ [Quick Demo](../scripts/demo.integration.ts)

## Testing Commands

### Available Test Commands

→ [Curl Test Commands](../package.json#L21-L25)
→ [Event System Tests](../package.json#L26-L28)
→ [Demo Commands](../package.json#L29-L31)

### Custom Test Execution

→ [Curl Test Runner CLI](./curl/curl.test.runner.ts#L342-L350)
→ [Event System Exports](../lib/events/event.system.ts#L441-L456)
→ [Compute Operations](../lib/events/compute.events.ts#L677-L737)

## Test Suites

### Test Suite Definitions

→ [Health Check Suite](./curl/curl.test.runner.ts#L248-L262)
→ [API Test Suite](./curl/curl.test.runner.ts#L264-L275)
→ [Performance Test Suite](./curl/curl.test.runner.ts#L277-L288)
→ [Security Test Suite](./curl/curl.test.runner.ts#L290-L301)

## Event System Usage

### Event System Usage

→ [Event Emission API](../lib/events/event.system.ts#L441-L456)
→ [Compute Operations](../lib/events/compute.events.ts#L677-L737)
→ [Event Tracking Examples](../scripts/demo.integration.ts#L84-L128)
→ [Specialized Event Emitters](../lib/events/event.system.ts#L458-L541)

## Configuration

### Configuration

→ [Test Configuration](./integration/event.compute.integration.test.ts#L23-L28)
→ [Compute System Config Schema](../lib/events/compute.events.ts#L110-L134)
→ [Demo Configuration](../scripts/demo.integration.ts#L24-L30)
→ [Environment Variables](../package.json#L15-L28)

## Performance Metrics

The system automatically tracks:

- **Response Times** - HTTP request/response latencies
- **Event Processing** - Event emission and handling times
- **Job Throughput** - Compute jobs processed per second
- **Resource Utilization** - CPU, memory, and other resource usage
- **Success Rates** - Test pass/fail rates across all systems

### Viewing Metrics

→ [System Status Methods](../lib/events/compute.events.ts#L559-L571)
→ [Event System Statistics](../lib/events/event.system.ts#L423-L430)
→ [Demo Statistics Collector](../scripts/demo.integration.ts#L33-L66)
→ [Performance Monitor](../scripts/demo.integration.ts#L219-L263)

## Advanced Usage

### Custom Test Suites

→ [CurlTestRunner Class](./curl/curl.test.runner.ts#L46-L134)
→ [Test Configuration Schema](./curl/curl.test.runner.ts#L11-L23)
→ [Custom Test Examples](../scripts/demo.integration.ts#L149-L175)

### Custom Event Handlers

→ [Job Handler Registration](../lib/events/compute.events.ts#L400-L403)
→ [Demo Handler Examples](../scripts/demo.integration.ts#L149-L175)
→ [Job Submission API](../lib/events/compute.events.ts#L407-L441)

## Monitoring & Debugging

### Real-time Event Monitoring

→ [Event Monitor Class](../scripts/demo.integration.ts#L68-L128)
→ [Global Event Handler](../lib/events/event.system.ts#L234-L248)
→ [Event System Health Check](../lib/events/event.system.ts#L423-L435)

### Health Checks

→ [System Health Methods](../lib/events/event.system.ts#L423-L435)
→ [Compute System Status](../lib/events/compute.events.ts#L559-L571)
→ [Health Check Test Suite](./curl/curl.test.runner.ts#L248-L262)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 3000 is available
2. **Event system not starting**: Check for proper initialization
3. **Curl tests failing**: Verify server is running and accessible
4. **Resource allocation errors**: Monitor system resource usage

### Debug Commands

→ [Debug CLI Interface](../scripts/demo.integration.ts#L464-L497)
→ [System Validation](../scripts/system-integration-test.ts)
→ [Quick Validation](../scripts/validate-quick.ts)
→ [Minimal Test Runner](./curl/curl.test.runner.ts#L342-L350)

## CI/CD Integration

### CI/CD Integration

→ [GitHub Actions Workflow](../.github/workflows/)
→ [Chat Mode CI Integration](../.github/chatmodes/internetfriends-test.md)
→ [Package Scripts for CI](../package.json#L15-L35)

## Contributing

When adding new tests or event handlers:

1. Follow the existing patterns and schemas
2. Add appropriate error handling and logging
3. Update this README with new functionality
4. Ensure tests pass in both development and CI environments
5. Add performance considerations for new features

## License

This testing system is part of the InternetFriends project and follows the same licensing terms.
