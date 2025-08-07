# InternetFriends Integration Test Report

**Generated:** 2025-08-07T07:00:46.457Z
**Total Tests:** 7
**Passed:** 3
**Failed:** 4
**Success Rate:** 42.86%
**Average Duration:** 1141.86ms

## Test Distribution by Type

- **compute:** 4 tests
- **hybrid:** 3 tests

## Failed Tests

### ❌ Compute System > Resource monitoring and allocation
- **Type:** compute
- **Duration:** 107ms
- **Error:** Resource allocation failed
- **Metrics:** {
  "queueSizeBefore": 0,
  "queueSizeAfter": 0,
  "runningJobsBefore": 0,
  "runningJobsAfter": 0
}

### ❌ End-to-End > Error handling and recovery
- **Type:** hybrid
- **Duration:** 26ms
- **Error:** Error handling test failed
- **Metrics:** {
  "httpErrorHandled": false,
  "jobErrorHandled": true
}

### ❌ Performance > Concurrent HTTP requests
- **Type:** hybrid
- **Duration:** 1024ms
- **Error:** Only 0/10 requests succeeded
- **Metrics:** {
  "concurrentRequests": 10,
  "successfulRequests": 0,
  "eventsGenerated": 0,
  "avgResponseTime": null
}

### ❌ End-to-End > Complete user workflow
- **Type:** hybrid
- **Duration:** 6185ms
- **Error:** Workflow did not complete successfully
- **Metrics:** {
  "httpSuccess": false,
  "httpResponseTime": 23,
  "jobCompleted": true,
  "interactionEvents": 0,
  "pageLoadEvents": 0
}


## All Test Results

✅ **Compute System** > Job submission and execution (148ms)
❌ **Compute System** > Resource monitoring and allocation (107ms)
✅ **Compute System** > Priority queue management (201ms)
❌ **End-to-End** > Error handling and recovery (26ms)
❌ **Performance** > Concurrent HTTP requests (1024ms)
❌ **End-to-End** > Complete user workflow (6185ms)
✅ **Performance** > Compute system throughput (302ms)
