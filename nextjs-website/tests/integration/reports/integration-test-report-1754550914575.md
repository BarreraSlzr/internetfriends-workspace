# InternetFriends Integration Test Report

**Generated:** 2025-08-07T07:15:14.575Z
**Total Tests:** 5
**Passed:** 3
**Failed:** 2
**Success Rate:** 60.00%
**Average Duration:** 362.00ms

## Test Distribution by Type

- **compute:** 4 tests
- **hybrid:** 1 tests

## Failed Tests

### ❌ Compute System > Resource monitoring and allocation
- **Type:** compute
- **Duration:** 96ms
- **Error:** Resource allocation failed
- **Metrics:** {
  "queueSizeBefore": 0,
  "queueSizeAfter": 0,
  "runningJobsBefore": 0,
  "runningJobsAfter": 0
}

### ❌ Performance > Concurrent HTTP requests
- **Type:** hybrid
- **Duration:** 1046ms
- **Error:** Only 0/10 requests succeeded
- **Metrics:** {
  "concurrentRequests": 10,
  "successfulRequests": 0,
  "eventsGenerated": 0,
  "avgResponseTime": null
}


## All Test Results

✅ **Compute System** > Job submission and execution (161ms)
❌ **Compute System** > Resource monitoring and allocation (96ms)
✅ **Compute System** > Priority queue management (201ms)
❌ **Performance** > Concurrent HTTP requests (1046ms)
✅ **Performance** > Compute system throughput (306ms)
