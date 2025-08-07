# InternetFriends Curl Test Report

**Summary:** 0/3 tests passed
**Average Response Time:** 13.00ms
**Generated:** 2025-08-07T06:52:33.720Z

## Failed Tests

### ❌ Homepage Load
- **Status:** N/A
- **Response Time:** 16ms
- **Error:** Body does not contain: "InternetFriends"
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3000/"`

### ❌ API Health Check
- **Status:** N/A
- **Response Time:** 12ms
- **Error:** Expected status 200, got 0
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3000/api/health"`

### ❌ Design System Page
- **Status:** N/A
- **Response Time:** 11ms
- **Error:** Body does not contain: "Design System"
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3000/design-system"`

## All Test Results

❌ **Homepage Load** (16ms)
❌ **API Health Check** (12ms)
❌ **Design System Page** (11ms)
