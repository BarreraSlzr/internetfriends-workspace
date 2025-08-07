# InternetFriends Project References

Quick reference links to key files, implementations, and documentation across the InternetFriends project.

## 🏗️ Architecture & Structure

### Core Configuration
- [Package.json Scripts](../package.json) - All available npm/bun scripts
- [TypeScript Config](../tsconfig.json) - TypeScript configuration
- [Next.js Config](../next.config.js) - Next.js build configuration
- [Tailwind Config](../tailwind.config.ts) - Tailwind CSS configuration

### Project Structure
- [Component Architecture](../components/) - Atomic design structure
- [Event System](../lib/events/) - Event-driven architecture
- [Design System](../lib/design-system/) - Design tokens and utilities
- [Testing Framework](../tests/) - Comprehensive testing suite

## 🎨 Design System

### Core Design Files
- [Color System](../lib/design-system/colors.ts) - Brand colors and CSS variables
- [Gesture System](../lib/design-system/gestures.ts) - Interactions and animations
- [Global Styles](../styles/globals.css) - CSS reset and base styles

### Component Libraries
- [Atomic Components](../components/atoms/) - Basic UI building blocks
- [Molecular Components](../components/molecules/) - Composite UI elements
- [Organism Components](../components/organisms/) - Complex UI sections

### Design Documentation
- [Design System README](../app/(internetfriends)/design-system/README.md) - Complete design guide
- [Component Registry](../app/(internetfriends)/design-system/registry/) - Component catalog

## ⚡ Event & Compute System

### Core Event System
- [Event System Core](../lib/events/event.system.ts) - High-performance event processing
- [Compute Events](../lib/events/compute.events.ts) - Job management and optimization
- [Event Types & Schemas](../lib/events/event.system.ts#L10-L52) - Event type definitions

### Event Usage Examples
- [Event Integration Demo](../scripts/demo.integration.ts) - Complete usage examples
- [System Integration Test](../scripts/system-integration-test.ts) - Event system validation

## 🧪 Testing Framework

### Test Runners & Suites
- [Curl Test Runner](../tests/curl/curl.test.runner.ts) - HTTP testing with curl
- [Integration Tests](../tests/integration/event.compute.integration.test.ts) - End-to-end testing
- [Unit Tests](../tests/unit/) - Component and utility testing

### Test Configuration
- [Test Suites](../tests/curl/curl.test.runner.ts#L287-L340) - Predefined test configurations
- [Demo Scripts](../scripts/demo.integration.ts) - Interactive test demonstrations

### Testing Documentation
- [Testing README](../tests/README.md) - Complete testing guide
- [Test Commands](../package.json#L15-L35) - All available test scripts

## 🔧 Development Tools

### Scripts & Automation
- [Demo Integration](../scripts/demo.integration.ts) - System demonstration
- [System Validation](../scripts/validate-system.ts) - Health checks
- [Smart Commit](../scripts/smart-commit-orchestrator.ts) - Automated commits

### Development Guides
- [Copilot Instructions](../.github/copilot-instructions.md) - AI development guidelines
- [Chat Modes](../.github/chatmodes/) - Specialized development modes

## 📱 Application Structure

### Next.js App Structure
- [App Router Layout](../app/layout.tsx) - Root application layout
- [InternetFriends Layout](../app/(internetfriends)/layout.tsx) - Main app layout
- [Homepage](../app/(internetfriends)/page.tsx) - Landing page implementation

### Component Implementations
- [Header Organism](../components/organisms/header/) - Main navigation header
- [Button Atomic](../components/atoms/button/) - Primary button component
- [Theme Integration](../components/organisms/header/header.atomic.tsx) - Theme system usage

## 🔗 External Integrations

### Dependencies & Packages
- [Main Dependencies](../package.json#L35-L65) - Core project dependencies
- [Dev Dependencies](../package.json#L66-L85) - Development tools

### Configuration Files
- [ESLint Config](../.eslintrc.json) - Code linting rules
- [Prettier Config](../.prettierrc) - Code formatting rules
- [PostCSS Config](../postcss.config.js) - CSS processing

## 📊 Performance & Monitoring

### Performance Tools
- [Event System Stats](../lib/events/event.system.ts#L423-L435) - Real-time metrics
- [Compute System Status](../lib/events/compute.events.ts#L559-L571) - Resource monitoring
- [Performance Monitor](../scripts/demo.integration.ts#L219-L263) - Benchmarking tools

### Optimization Strategies
- [Bundle Optimization](../next.config.js) - Build optimization
- [CSS Performance](../components/organisms/header/header.styles.module.scss) - Styling efficiency
- [Component Performance](../lib/design-system/gestures.ts#L47-L75) - Animation optimization

## 🚀 Deployment & CI/CD

### Build & Deploy
- [Build Scripts](../package.json#L12-L14) - Production build commands
- [Validation Scripts](../package.json#L32-L40) - Pre-deployment checks

### Environment Configuration
- [Environment Variables](../package.json#L15-L28) - Runtime configuration
- [Development Setup](../setup.sh) - Local development setup

## 🔍 Debugging & Troubleshooting

### Debug Tools
- [System Health Checks](../lib/events/event.system.ts#L423-L435) - System diagnostics
- [Debug CLI](../scripts/demo.integration.ts#L464-L497) - Interactive debugging
- [Validation Tools](../scripts/validate-quick.ts) - Quick system validation

### Common Issues
- [Troubleshooting Guide](../tests/README.md#troubleshooting) - Common problems and solutions
- [Error Handling](../lib/events/compute.events.ts#L603-L618) - Error recovery patterns

## 📚 Learning Resources

### Documentation
- [Project README](../README.md) - Project overview and setup
- [Development Progress](../DEVELOPMENT_PROGRESS.md) - Current project status
- [Status Updates](../STATUS.md) - Latest changes and updates

### Code Examples
- [Component Examples](../app/(internetfriends)/design-system/nodes/) - Live component demos
- [Integration Examples](../tests/integration/) - Real-world usage patterns
- [Event Usage](../scripts/demo.integration.ts) - Event system demonstrations

## 🎯 Quick Actions

### Common Development Tasks
```bash
# Start development server
bun run dev

# Run all tests
bun run test:all

# Quick health check
bun run test:curl:health

# System demonstration
bun run demo

# Validate system
bun run validate
```

### File Navigation Shortcuts
- 🎨 [Design System](../lib/design-system/) - Visual design components
- ⚡ [Event System](../lib/events/) - Real-time processing
- 🧪 [Testing Suite](../tests/) - Comprehensive testing
- 📱 [Components](../components/) - UI component library
- 🔧 [Scripts](../scripts/) - Automation tools

---

*This reference file is automatically maintained. Links are validated during the build process.*
