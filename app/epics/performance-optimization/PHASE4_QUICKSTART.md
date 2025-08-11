# 🚀 Phase 4 Quick Start Guide

## Advanced Bundle & Runtime Optimization

**Epic:** Performance Optimization
**Timeline:** 2-3 weeks
**Goal:** Reduce load/interaction latency by 15-30%

---

## ⚡ Immediate Setup (15 minutes)

### 1. Verify Infrastructure

```bash
# Check all files are in place
ls -la perf.budgets.json
ls -la scripts/perf/
ls -la app/api/rum/route.ts
ls -la src/lib/rum.init.ts
```

### 2. Establish Performance Baseline

```bash
# Build the app first
bun run build

# Generate baseline measurements
bun run perf:baseline

# View current status
bun run perf:dashboard
```

### 3. Test RUM System

```bash
# Start dev server
bun run dev

# In another terminal, test RUM endpoint
curl http://localhost:3000/api/rum

# Visit your site and check for RUM data collection
# Look for POST requests to /api/rum in browser DevTools
```

---

## 🎯 Phase 4 Execution Plan

### Week 1: Foundation & Analysis

**Days 1-2: Infrastructure Validation**

- [ ] Run baseline measurements
- [ ] Validate RUM data collection
- [ ] Check performance budgets
- [ ] Document current metrics

**Days 3-5: Bundle Analysis**

- [ ] Generate detailed bundle analysis: `bun run analyze`
- [ ] Identify dynamic import candidates (modals, charts, editors)
- [ ] Map component hydration boundaries
- [ ] Plan code splitting strategy

### Week 2: Implementation

**Days 6-8: Dynamic Imports**

- [ ] Convert 3-5 heavy components to `next/dynamic`
- [ ] Add loading skeletons
- [ ] Test for hydration mismatches
- [ ] Measure bundle size reductions

**Days 9-10: Hydration Optimization**

- [ ] Convert static components to Server Components
- [ ] Optimize component boundaries
- [ ] Reduce React node count
- [ ] Validate performance improvements

### Week 3: Optimization & Validation

**Days 11-12: Dependencies & Assets**

- [ ] Replace heavy dependencies (lodash, moment, etc.)
- [ ] Optimize images (AVIF/WebP conversion)
- [ ] Implement critical CSS strategy
- [ ] Remove unused CSS classes

**Days 13-15: Final Validation**

- [ ] Comprehensive performance testing
- [ ] CI integration validation
- [ ] Real user monitoring analysis
- [ ] Epic completion documentation

---

## 📊 Daily Monitoring

### Morning Checkpoint

```bash
# Quick status check
bun run perf:dashboard

# Check for any budget violations
bun run perf:budgets
```

### After Each Change

```bash
# Re-analyze bundles
bun run perf:analyze

# Validate budgets still pass
bun run perf:budgets

# Check RUM data (if deployed)
curl http://localhost:3000/api/rum | jq
```

---

## 🎯 Success Metrics

### Primary Targets

- **JS Initial Bundle:** -20% (from baseline)
- **Mobile LCP:** -15% (real user data)
- **Hydration CPU:** -20% (DevTools measurement)
- **CSS Bundle:** -15% (after unused class removal)

### Validation Commands

```bash
# Before optimization
bun run perf:baseline

# After each major change
bun run perf:analyze
bun run perf:budgets

# Final validation
bun run perf:dashboard
```

---

## 🚨 Common Issues & Solutions

### Bundle Analysis Fails

```bash
# Ensure build exists
bun run build

# Check for build errors
ls -la .next/static/

# Alternative analysis
bun run perf:analyze --help
```

### RUM Data Not Collecting

```bash
# Check API endpoint
curl -X POST http://localhost:3000/api/rum \
  -H "Content-Type: application/json" \
  -d '{"lcp":1500,"fcp":800}'

# Verify client initialization
# Add to your app.tsx or layout.tsx:
import { initRUM } from '@/lib/rum.init';
// Call initRUM() in useEffect
```

### Performance Budgets Too Strict

```bash
# Adjust budgets in perf.budgets.json
# Increase warn/fail thresholds temporarily
# Focus on improvements, not perfect scores initially
```

### Dynamic Import Hydration Issues

```bash
# Check for SSR mismatches
# Use ssr: true in dynamic imports when possible
# Add proper loading states
# Test with JavaScript disabled
```

---

## 🔧 Essential Commands Reference

```bash
# Infrastructure
bun run perf:dashboard          # Epic progress overview
bun run perf:baseline           # Establish baseline
bun run perf:budgets            # Check performance budgets
bun run perf:analyze            # Analyze bundle sizes

# Development
bun run build                   # Build for analysis
bun run analyze                 # Next.js bundle analyzer
bun run dev                     # Development server

# CI/Testing
bun run perf:budgets:ci         # CI-friendly budget check
bun run perf:report             # Generate detailed report
```

---

## 🎭 Epic Integration

### Git Workflow

```bash
# Create feature branch for each optimization
git checkout -b feat/dynamic-imports-modal
# Make changes
git commit -m "feat: convert modal components to dynamic imports

- Reduces initial bundle by 45KB
- Adds loading skeletons for UX
- Performance impact: -12% JS bundle size"

# Include performance impact in commit messages
```

### Progress Tracking

```bash
# Update checklist after each task
vim app/epics/performance-optimization/phase4_checklist.md

# Run dashboard for status
bun run perf:dashboard

# Document improvements
echo "Week 1 Progress: Bundle analysis complete, 3 components converted" >> PROGRESS.md
```

---

## 🎉 Phase Completion Criteria

### Ready for Phase 5 When:

- [ ] All primary targets achieved (≥15% improvements)
- [ ] Performance budgets passing in CI
- [ ] RUM system collecting data for 7+ days
- [ ] No critical performance regressions
- [ ] Documentation updated and complete

### Epic Success Metrics:

- **20%+ reduction** in initial JavaScript bundle
- **15%+ improvement** in mobile LCP (real users)
- **15%+ reduction** in hydration CPU time
- **Performance budgets integrated** in CI pipeline

---

## 🚀 Ready to Start?

1. **Right now:** Run `bun run perf:baseline`
2. **Today:** Complete infrastructure validation
3. **This week:** Begin dynamic import implementation
4. **Check progress:** `bun run perf:dashboard` daily

**Next immediate action:** Run the baseline command and review the Phase 4 checklist!

---

**Status:** 🟢 Ready to Execute
**Last Updated:** 2025-01-12
**Epic Lead:** Performance Team
