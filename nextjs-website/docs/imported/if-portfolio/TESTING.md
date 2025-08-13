# 🧪 Universal Testing Suite

Comprehensive testing utility for the InternetFriends Portfolio - works across development, build, and production environments.

## Quick Start

```bash
# Health check (fastest)
bun run test:health

# Full development testing
bun run test:curl

# Test production build
bun run test:build

# Test live production
bun run test:prod
```

## What Gets Tested

### 🌐 Endpoints
- **Homepage** (`/`) - Main application
- **Database Manager** (`/database-manager/`) - Administrative interface
- **API Routes** (`/api/database/fossils/`) - Backend functionality
- **Static Assets** (favicon, manifests, icons)

### 🔍 Validation Types
- HTTP status codes (200, 404, etc.)
- Response times and performance
- Security headers
- Content types and MIME validation
- Database integration
- I18n/localization support
- Error page handling

## Usage Examples

### Development Testing
```bash
# Start dev server
bun run dev

# In another terminal - test it
bun run test:dev
# or
./test-runner.js
```

### Production Build Testing
```bash
# Build and start production server
bun run build
bun run start

# Test the production build
bun run test:build
# or
./test-runner.js --env=build
```

### Live Production Testing
```bash
# Test your live website
bun run test:prod
# or
./test-runner.js --env=production
```

### Custom URL Testing
```bash
# Test any URL
./test-runner.js --url=https://your-domain.com
./test-runner.js --url=http://localhost:4000
```

## Command Reference

### Bun Scripts
```bash
bun run test:health     # Quick health check only
bun run test:curl       # Full curl-based endpoint testing
bun run test:dev        # Test development environment
bun run test:build      # Test production build
bun run test:prod       # Test live production
bun run test:all        # Run both curl tests and unit tests
bun run validate        # Validate project structure
```

### Direct Script Usage
```bash
./test-runner.js                    # Test current environment
./test-runner.js --env=build        # Test production build
./test-runner.js --env=production   # Test live production
./test-runner.js --health-only      # Quick health check
./test-runner.js --url=http://custom # Custom URL
./test-runner.js --validate         # Environment validation
./test-runner.js --help             # Usage guide
```

## Output Examples

### Health Check Output
```
🏥 UNIVERSAL HEALTH CHECK
=========================
🌍 Environment: Development
📍 Base URL: http://localhost:3000

✅ Homepage: HTTP 200 (145ms)
✅ Database Manager: HTTP 200 (89ms)
✅ API: Fossils: HTTP 200 (234ms)
✅ Static: Favicon: HTTP 200 (12ms)

📊 Health Summary: 4/4 endpoints healthy
🎯 Overall Status: HEALTHY ✅
```

### Full Test Output
```
🧪 RUNNING FULL TEST SUITE
===========================

🚀 Running: npm test -- tests/curls/ --verbose
📂 Working directory: /path/to/project

PASS tests/curls/endpoints.test.ts
PASS tests/curls/database-integration.test.ts
PASS tests/curls/assets.test.ts

Tests:       3 passed, 3 total
Time:        2.847 s

🏁 TEST RUNNER COMPLETE
========================
🎯 Result: SUCCESS ✅
```

## Test Structure

```
tests/
└── curls/
    ├── endpoints.test.ts           # Core endpoint testing
    ├── database-integration.test.ts # Database API testing
    ├── assets.test.ts              # Static assets testing
    ├── environment-config.ts       # Environment configurations
    └── master-runner.test.ts       # Test orchestration
```

## Environment Configuration

The testing suite automatically adapts to different environments:

- **Development**: `localhost:3000`, relaxed timeouts
- **Build**: `localhost:3000`, production-optimized expectations
- **Production**: Live URL, strict performance requirements
- **Custom**: User-defined URL with balanced settings

## Features

### ✅ Comprehensive Coverage
- All public pages and endpoints
- API functionality validation
- Static asset delivery
- Error handling verification
- Performance monitoring

### ✅ Environment Awareness
- Automatic environment detection
- Environment-specific expectations
- Flexible timeout configurations
- Custom URL support

### ✅ CI/CD Ready
- Exit codes for automation
- JSON output support
- Scriptable health checks
- Production deployment validation

### ✅ Developer Friendly
- Colorful, readable output
- Quick health checks
- Detailed error reporting
- Easy integration

## Integration with CI/CD

```yaml
# GitHub Actions example
- name: Test Deployment
  run: |
    bun install
    bun run build
    bun run start &
    sleep 5
    bun run test:build
```

## Troubleshooting

### Common Issues

**"Health check failed"**
- Ensure your development server is running (`bun run dev`)
- Check if ports are correct (default: 3000)
- Verify URLs are accessible

**"Missing project files"**
- Run `bun run validate` to check project structure
- Ensure you're in the correct directory
- Check that required files exist

**"Test timeouts"**
- Check server performance
- Increase timeout in environment config
- Verify network connectivity

### Getting Help

```bash
./test-runner.js --help    # Usage guide
bun run validate           # Project validation
bun run test:health        # Quick diagnostic
```

## Sharing This Tool

This testing suite is completely self-contained and can be easily shared:

1. **Copy the entire `/tests` directory**
2. **Copy `test-runner.js`**
3. **Copy the bun scripts** from `package.json`
4. **Install dependencies**: `bun install` (bun has built-in test runner)

The tool will automatically adapt to any InternetFriends portfolio project structure.
