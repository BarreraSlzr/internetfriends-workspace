# InternetFriends Curl Test Report

**Summary:** 0/3 tests passed
**Average Response Time:** 15.33ms
**Generated:** 2025-08-07T06:52:46.145Z

## Failed Tests

### ❌ Homepage Load
- **Status:** N/A
- **Response Time:** 22ms
- **Error:** Body does not contain: "InternetFriends"
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3001/"`

### ❌ API Health Check
- **Status:** N/A
- **Response Time:** 13ms
- **Error:** Expected status 200, got 0
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3001/api/health"`

### ❌ Design System Page
- **Status:** N/A
- **Response Time:** 11ms
- **Error:** Body does not contain: "Design System"
- **Curl Command:** `curl -s -w "\n%{http_code}\n%{time_total}\n" -X GET -H "User-Agent: InternetFriends-Test-Runner/1.0" -H "Accept: application/json, text/html, */*" -H "Accept-Encoding: gzip, deflate" -L --max-time 10 "http://localhost:3001/design-system"`

## All Test Results

❌ **Homepage Load** (22ms)
❌ **API Health Check** (13ms)
❌ **Design System Page** (11ms)
