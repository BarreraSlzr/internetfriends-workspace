# InternetFriends Integration Test Report

**Generated:** 2025-08-07T06:42:30.592Z
**Total Tests:** 7
**Passed:** 3
**Failed:** 4
**Success Rate:** 42.86%
**Average Duration:** 1144.29ms

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
- **Duration:** 26ms
- **Error:** Error handling test failed
- **Metrics:** {
  "httpErrorHandled": false,
  "jobErrorHandled": true
}

### ❌ Performance > Concurrent HTTP requests
- **Type:** hybrid
- **Duration:** 1030ms
- **Error:** Only 0/10 requests succeeded
- **Metrics:** {
  "concurrentRequests": 10,
  "successfulRequests": 0,
  "eventsGenerated": 0,
  "avgResponseTime": null
}

### ❌ End-to-End > Complete user workflow
- **Type:** hybrid
- **Duration:** 6180ms
- **Error:** Workflow did not complete successfully
- **Metrics:** {
  "httpSuccess": false,
  "httpResponseTime": 82,
  "jobCompleted": true,
  "interactionEvents": 0,
  "pageLoadEvents": 0
}


## All Test Results

✅ **Compute System** > Job submission and execution (172ms)
❌ **Compute System** > Resource monitoring and allocation (98ms)
✅ **Compute System** > Priority queue management (201ms)
❌ **End-to-End** > Error handling and recovery (26ms)
❌ **Performance** > Concurrent HTTP requests (1030ms)
❌ **End-to-End** > Complete user workflow (6180ms)
✅ **Performance** > Compute system throughput (303ms)
