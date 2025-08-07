# InternetFriends - Next.js Portfolio Application

A modern, event-driven Next.js application featuring advanced testing, compute optimization, and a comprehensive design system.

## 🚀 Quick Start

### Prerequisites

- Bun 1.2+ (recommended) or Node.js 20+
- macOS/Linux for optimal testing experience

### Installation & Setup

```bash
# Clone and install dependencies
bun install

# Start development server
bun run dev

# Open browser to http://localhost:3000
```

## 🏗️ Project Architecture

### Core Systems

- **Next.js 15.2.4** with Turbopack for lightning-fast builds
- **Event-Driven Architecture** for real-time compute optimization
- **Curl-Based Testing** for authentic HTTP validation
- **Atomic Design System** with glass morphism aesthetics

### Key Directories

→ [Component Library](./components/) - Atomic design components
→ [Event System](./lib/events/) - High-performance event processing
→ [Design System](./lib/design-system/) - Brand tokens and utilities
→ [Testing Suite](./tests/) - Comprehensive testing framework
→ [Application Pages](./app/) - Next.js app router structure

## 🧪 Testing & Quality

### Available Test Commands

→ [All Test Scripts](./package.json#L15-L35)

```bash
# Quick health check
bun run test:curl:health

# Full integration suite
bun run test:full-integration

# Event system tests
bun run test:events

# Interactive demo
bun run demo
```

### Testing Features

- **Unix-Native HTTP Testing** using curl commands
- **Event-Driven Integration Tests** with real-time monitoring
- **Compute Job Management** with resource optimization
- **Performance Benchmarking** with detailed reporting

→ [Complete Testing Guide](./tests/README.md)

## 🎨 Design System

### Design Principles

- **Glass Morphism** - Translucent UI with backdrop filters
- **Blue-Centric Palette** - Primary brand color `#3b82f6`
- **Compact Minimalism** - Maximum 12px border radius
- **Accessibility First** - WCAG 2.1 compliant with keyboard navigation

### Component Architecture

→ [Atoms](./components/atoms/) - Basic UI building blocks
→ [Molecules](./components/molecules/) - Composite components
→ [Organisms](./components/organisms/) - Complex UI sections

→ [Design System Documentation](<./app/(internetfriends)/design-system/README.md>)

## ⚡ Event System

### Real-Time Processing

- **High-Performance Event Queue** with priority handling
- **Compute Job Management** with resource allocation
- **Auto-Scaling Capabilities** for load optimization
- **Real-Time Metrics** and health monitoring

### Usage Examples

→ [Event System Implementation](./lib/events/event.system.ts)
→ [Compute Events](./lib/events/compute.events.ts)
→ [Integration Demo](./scripts/demo.integration.ts)

```bash
# Monitor system events
bun -e "import { eventSystem } from './lib/events/event.system'; eventSystem.onAll(console.log)"

# Check system status
bun -e "import { computeManager } from './lib/events/compute.events'; console.log(computeManager.getStatus())"
```

## 🔧 Development Workflow

### Key Scripts

```bash
# Development
bun run dev              # Start dev server with validation
bun run dev:skip-validation  # Skip pre-dev validation

# Building
bun run build           # Production build
bun run start           # Start production server

# Testing
bun run test:all        # Run all tests
bun run demo:quick      # Quick system demo

# Validation
bun run validate        # Full system validation
bun run validate:quick  # Fast validation check
```

→ [All Available Scripts](./package.json#L10-L45)

### Development Tools

- **Turbopack** for ultra-fast builds
- **TypeScript Strict Mode** with comprehensive typing
- **ESLint + Prettier** for code quality
- **SCSS Modules** with design token integration

## 📊 Performance Features

### Optimization Strategies

- **Event-Driven Compute** for efficient resource usage
- **CSS-in-Module Architecture** for optimal loading
- **Lazy Loading** for non-critical components
- **Bundle Optimization** with tree-shaking

### Monitoring & Metrics

→ [Performance Monitoring](./lib/events/event.system.ts#L423-L435)
→ [Resource Tracking](./lib/events/compute.events.ts#L559-L571)
→ [Demo Statistics](./scripts/demo.integration.ts#L33-L66)

## 🔍 Debugging & Troubleshooting

### Debug Tools

```bash
# System health check
bun run validate:quick

# Event system diagnostics
bun -e "import { eventSystem } from './lib/events'; console.log(await eventSystem.healthCheck())"

# Component validation
bun -e "import * as components from './components'; console.log(Object.keys(components))"
```

→ [Troubleshooting Guide](./tests/README.md#troubleshooting)
→ [Debug Scripts](./scripts/)

## 📚 Documentation

### Complete Guides

→ [Testing Framework](./tests/README.md) - Comprehensive testing guide
→ [Design System](<./app/(internetfriends)/design-system/README.md>) - Complete design documentation
→ [References](./docs/REFERENCES.md) - Quick reference links
→ [Chat Modes](./.github/chatmodes/) - AI development workflows

### Development Resources

→ [Copilot Instructions](./.github/copilot-instructions.md) - AI development guidelines
→ [Project Structure](./docs/REFERENCES.md#architecture--structure) - Architecture overview

## 🚀 Deployment

### Build & Deploy

```bash
# Build for production
bun run build

# Validate before deploy
bun run validate

# Start production server
bun run start
```

### Environment Configuration

→ [Package Configuration](./package.json) - Dependencies and scripts
→ [TypeScript Config](./tsconfig.json) - Type checking setup
→ [Next.js Config](./next.config.js) - Build configuration

## 🤝 Contributing

### Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `bun install`
3. **Run validation**: `bun run validate:quick`
4. **Start development**: `bun run dev`
5. **Run tests**: `bun run test:all`

### Code Standards

- Follow **atomic design principles** for components
- Use **event-driven patterns** for state management
- Implement **comprehensive accessibility** (WCAG 2.1)
- Write **tests for all new features**
- Follow **TypeScript strict mode**

→ [Development Guidelines](./.github/copilot-instructions.md)

## 📈 Project Status

**Current Version**: v1.0.0
**Build Status**: ✅ All systems operational
**Test Coverage**: 30/30 tests passing (100%)
**Performance**: Optimized for production

### Recent Updates

→ [Development Progress](./DEVELOPMENT_PROGRESS.md) - Latest milestones
→ [Status Updates](./STATUS.md) - Current development status

## 📝 License

This project is part of the InternetFriends portfolio and follows standard licensing terms.

---

**InternetFriends** - Built with Next.js, TypeScript, and modern web technologies.
For questions or support, refer to the [documentation](./docs/REFERENCES.md) or [testing guides](./tests/README.md).
