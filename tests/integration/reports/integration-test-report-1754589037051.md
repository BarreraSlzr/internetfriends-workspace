# InternetFriends Integration Test Report

**Generated:** 2025-08-07T17:50:37.051Z
**Total Tests:** 2
**Passed:** 0
**Failed:** 2
**Success Rate:** 0.00%
**Average Duration:** 618.00ms

## Test Distribution by Type

- **compute:** 1 tests
- **hybrid:** 1 tests

## Failed Tests

### ❌ Compute System > Priority queue management
- **Type:** compute
- **Duration:** 201ms
- **Error:** Expected 3 queued events, got 0
- **Metrics:** {
  "normalJob": "744b5456-e8ae-48fe-959a-dfdfcb5fe9bb",
  "highPriorityJob": "2d50f3a2-eaa8-4837-b6b2-7a14348dac9c",
  "criticalJob": "72a17a9f-e3d7-479b-a578-7da9fb684a65",
  "queuedEvents": 0
}

### ❌ Performance > Concurrent HTTP requests
- **Type:** hybrid
- **Duration:** 1035ms
- **Error:** Only 0/10 requests succeeded
- **Metrics:** {
  "concurrentRequests": 10,
  "successfulRequests": 0,
  "eventsGenerated": 0,
  "avgResponseTime": null
}


## All Test Results

❌ **Compute System** > Priority queue management (201ms)
❌ **Performance** > Concurrent HTTP requests (1035ms)
