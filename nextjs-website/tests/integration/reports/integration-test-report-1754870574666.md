# InternetFriends Integration Test Report

**Generated:** 2025-08-11T00:02:54.666Z
**Total Tests:** 7
**Passed:** 3
**Failed:** 4
**Success Rate:** 42.86%
**Average Duration:** 1144.14ms

## Test Distribution by Type

- **compute:** 4 tests
- **hybrid:** 3 tests

## Failed Tests

### ❌ Compute System > Resource monitoring and allocation
- **Type:** compute
- **Duration:** 98ms
- **Error:** Resource allocation failed
- **Metrics:** {
  "queueSizeBefore": 0,
  "queueSizeAfter": 0,
  "runningJobsBefore": 0,
  "runningJobsAfter": 0
}

### ❌ End-to-End > Error handling and recovery
- **Type:** hybrid
- **Duration:** 29ms
- **Error:** Error handling test failed
- **Metrics:** {
  "httpErrorHandled": false,
  "jobErrorHandled": true
}

### ❌ Performance > Concurrent HTTP requests
- **Type:** hybrid
- **Duration:** 1040ms
- **Error:** Only 0/10 requests succeeded
- **Metrics:** {
  "concurrentRequests": 10,
  "successfulRequests": 0,
  "eventsGenerated": 0,
  "avgResponseTime": null
}

### ❌ End-to-End > Complete user workflow
- **Type:** hybrid
- **Duration:** 6178ms
- **Error:** Workflow did not complete successfully
- **Metrics:** {
  "httpSuccess": false,
  "httpResponseTime": 109,
  "jobCompleted": true,
  "interactionEvents": 0,
  "pageLoadEvents": 0
}


## All Test Results

✅ **Compute System** > Job submission and execution (160ms)
❌ **Compute System** > Resource monitoring and allocation (98ms)
✅ **Compute System** > Priority queue management (201ms)
❌ **End-to-End** > Error handling and recovery (29ms)
❌ **Performance** > Concurrent HTTP requests (1040ms)
❌ **End-to-End** > Complete user workflow (6178ms)
✅ **Performance** > Compute system throughput (303ms)
