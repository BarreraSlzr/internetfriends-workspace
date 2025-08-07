# MCP Chat Mode: InternetFriends Dev

You simulate local dev sessions for InternetFriends portfolio management. Use Bun commands, VSCode API, and automation to streamline DX for private business admin tool development. Prefer mocks, evals, and test task runners to verify logic during feature implementation.

## Development Focus Areas

### Portfolio Component Development with shadcn/ui
- Generate and customize UI components
- Implement responsive design patterns
- Integrate with existing design system
- Maintain component documentation

### Achievement System Integration
- Real-time achievement tracking
- Business metrics dashboard development
- Achievement visualization components
- Progress tracking interfaces

### Real-time Fossil Database Management
- Database schema evolution
- Data migration strategies
- Performance optimization
- Backup and recovery procedures

### Next.js Optimization for Business Dashboard
- Server-side rendering optimization
- Static generation strategies
- API route performance
- Bundle size optimization

### API Endpoint Development and Testing
- RESTful API design
- Authentication and authorization
- Rate limiting implementation
- Error handling patterns

## Development Workflow

### Component Development Cycle
```bash
# 1. Generate component with shadcn/ui
cd src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio
bunx shadcn@latest add button

# 2. Test component in isolation
bun -e "console.log('Testing component import'); import('./components/ui/button').then(console.log).catch(console.error)"

# 3. Run development server
bun run dev

# 4. Run tests
bun test
```

### API Development Workflow
```bash
# 1. Create API endpoint
# 2. Test with curl or fetch
bun -e "fetch('http://localhost:3001/api/new-endpoint').then(r => r.json()).then(console.log)"

# 3. Run integration tests
bun run test:api

# 4. Validate with test server
bun test-server.ts
```

### Database Development Workflow
```bash
# 1. Test database connection
bun -e "fetch('http://localhost:3001/api/database/stats').then(r => r.json()).then(console.log)"

# 2. Run database migrations
bun run migrate

# 3. Seed development data
bun run seed

# 4. Validate schema
bun run validate-schema
```

## Development Tools & Commands

### Quick Development Commands
```bash
# Start development environment
bun run dev:turbo

# Run with debugging
bun run dev:debug

# Clean and restart
bun run clean && bun run dev

# Type checking
bun run type-check

# Lint and fix
bun run lint:fix
```

### Testing Commands
```bash
# Run all tests
bun run test:all

# Run specific test suites
bun run test:api
bun run test:health
bun run test:curl

# Watch mode for development
bun test --watch

# Coverage report
bun test --coverage
```

### Build Commands
```bash
# Development build
bun run build

# Production optimization
NODE_ENV=production bun run build

# Analyze bundle
bun run analyze

# Static export
bun run export
```

## Development Best Practices

### Component Development
- Use TypeScript for all components
- Implement proper error boundaries
- Add loading and error states
- Include accessibility attributes
- Write component tests

### API Development
- Follow RESTful conventions
- Implement proper error handling
- Add request validation
- Include API documentation
- Write integration tests

### Database Development
- Use migrations for schema changes
- Implement proper indexing
- Add data validation
- Include backup strategies
- Write database tests

### Performance Optimization
- Implement code splitting
- Use React.memo for expensive components
- Optimize database queries
- Add caching strategies
- Monitor bundle size

## Development Environment Setup

### Required Tools
- Bun runtime and package manager
- Node.js (for compatibility)
- TypeScript compiler
- Next.js framework
- SQLite database

### VS Code Extensions
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense

### Environment Variables
```bash
# Development
NODE_ENV=development
DATABASE_URL=./dev.db
API_BASE_URL=http://localhost:3001

# Testing
TEST_DATABASE_URL=./test.db
TEST_API_URL=http://localhost:3001
```

## Debugging Strategies

### Component Debugging
```typescript
// Add debug logging
console.log('Component props:', props);

// Use React DevTools
// Add breakpoints in browser

// Test component isolation
bun -e "import('./components/MyComponent').then(console.log)"
```

### API Debugging
```bash
# Test API endpoints
curl -X GET http://localhost:3001/api/health

# Check database queries
bun -e "fetch('http://localhost:3001/api/database/stats').then(r => r.text()).then(console.log)"

# Monitor server logs
tail -f server.log
```

### Performance Debugging
```bash
# Analyze bundle size
bun run analyze

# Check memory usage
bun -e "console.log(process.memoryUsage())"

# Monitor API response times
bun test-server.ts | grep "Response Time"
```

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused variables

### ESLint Rules
- React hooks rules
- TypeScript recommended
- Import order enforcement
- Unused variable detection

### Testing Standards
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for UI elements
- E2E tests for critical workflows

### Documentation Requirements
- API endpoint documentation
- Component prop documentation
- Database schema documentation
- Development setup instructions

## Development Monitoring

### Performance Metrics
- Page load times
- API response times
- Database query performance
- Bundle size tracking

### Error Monitoring
- Runtime error tracking
- API error logging
- Database error monitoring
- User experience issues

### Development Analytics
- Build time tracking
- Test execution time
- Code coverage metrics
- Development velocity
