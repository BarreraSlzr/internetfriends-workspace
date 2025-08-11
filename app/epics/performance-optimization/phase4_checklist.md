# Phase 4: Advanced Bundle & Runtime Optimization Checklist

**Epic:** Performance Optimization
**Phase:** 4 - Advanced Bundle & Runtime Optimization
**Timeline:** 2-3 weeks
**Target:** Reduce load/interaction latency by 15-30%

---

## 🎯 Phase 4 Objectives

- **JS Initial Route Payload:** -20–30% reduction
- **CSS Delivered:** -10–15% reduction (post-pruning + layering)
- **First Interaction (FID/INP proxy):** -15–25% improvement
- **Hydration CPU Time:** -15–20% reduction
- **Slow 3G LCP:** -10–15% improvement

---

## 📋 Task Checklist

### 1. Infrastructure & Baseline Setup

- [x] **Create performance budgets configuration**
  - File: `perf.budgets.json`
  - Thresholds for bundle sizes and metrics
  - Epic-specific targets defined

- [x] **Set up route bundle analyzer**
  - File: `scripts/perf/analyze_route_bundles.ts`
  - Automated bundle size tracking
  - Top contributors identification

- [x] **Implement budget checker for CI**
  - File: `scripts/perf/check_budgets.ts`
  - CI integration ready
  - Automated threshold validation

- [x] **Create RUM (Real User Monitoring) system**
  - API endpoint: `app/api/rum/route.ts`
  - Client library: `src/lib/rum.init.ts`
  - Core Web Vitals tracking

- [ ] **Establish baseline measurements**
  - Run: `bun scripts/perf/analyze_route_bundles.ts --baseline`
  - Document current metrics in artifacts
  - Commit baseline for delta tracking

### 2. Bundle Analysis & Code Splitting

- [ ] **Generate per-route bundle analysis**
  - Run: `ANALYZE=true bunx next build`
  - Identify largest contributors (≥5% of route chunk)
  - Create artifact: `route_bundle_baseline.json`

- [ ] **Identify dynamic import candidates**
  - Modal components
  - Chart/visualization components
  - Code editors/syntax highlighters
  - 3rd-party embeds
  - Target: Components with TTI cost > 6ms

- [ ] **Implement dynamic imports (Phase 1)**
  - Convert 3-5 heavy components to `next/dynamic`
  - Add loading skeletons
  - Validate no hydration mismatches
  - Test: Ensure SEO not impacted

- [ ] **Add chunk naming strategy**
  - Implement cohesive chunk naming
  - Use descriptive webpackChunkName comments
  - Organize by feature boundaries

### 3. Component Hydration Optimization

- [ ] **Audit component interactivity**
  - Classify top 20 components: interactive/static/hybrid
  - Document in `hydration_reduction.md`
  - Identify server component candidates

- [ ] **Convert static components (Phase 1)**
  - Convert 3-5 static components to Server Components
  - Maintain prop stability
  - Measure hydration reduction

- [ ] **Implement granular hydration boundaries**
  - Move interactive logic to leaf components
  - Reduce React node count
  - Target: 15-20% hydration CPU reduction

- [ ] **Document hydration improvements**
  - Before/after React node counts
  - Hydration CPU measurements
  - Component classification results

### 4. Critical Path & CSS Optimization

- [ ] **Critical CSS analysis**
  - Identify above-the-fold styles
  - Measure current CSS delivery impact
  - Plan critical/non-critical split strategy

- [ ] **Implement CSS loading optimization**
  - Option A: Rely on Next.js automatic extraction
  - Option B: Custom critical CSS extraction (if >5KB gain)
  - Add `rel="preload"` for remaining styles

- [ ] **CSS bundle reduction**
  - Continue unused class removal (46 identified)
  - Reach 95% SCSS modernization target
  - Document net CSS savings

### 5. Dependency & Asset Optimization

- [ ] **Heavy dependency audit**
  - Map dependency graph: `bun analyze`
  - Identify libs >40KB min+gz
  - Target: moment, lodash.*, chart libs, date libs

- [ ] **Replace heavy dependencies (Phase 1)**
  - `lodash.*` → native/small utilities
  - Date/time libs → `date-fns` subset or `Intl`
  - Remove unnecessary polyfills

- [ ] **Validate tree-shaking**
  - Ensure ESM imports only
  - Verify dead code elimination
  - Document bundle size improvements

- [ ] **Image & media optimization**
  - Convert large images (≥150KB) to AVIF/WebP
  - Add explicit `sizes` attributes
  - Preload hero/LCP images
  - Lazy-load below-fold content

### 6. Performance Budgets & CI Integration

- [ ] **Integrate budgets into CI**
  - Add GitHub Actions workflow
  - Post-build budget validation
  - PR comments for violations

- [ ] **Lighthouse CI setup**
  - Mobile config for key routes
  - Performance score tracking
  - Automated regression detection

- [ ] **Visual regression testing**
  - Playwright or Chromatic integration
  - Protect against CSS refactor breakage
  - Automated screenshot comparison

### 7. Real User Monitoring & Analytics

- [ ] **Deploy RUM system**
  - Add RUM initialization to app
  - Configure data collection endpoints
  - Set up metric aggregation

- [ ] **Performance dashboard**
  - Recent metrics visualization
  - Epic progress tracking
  - Alert thresholds for regressions

- [ ] **RUM data analysis**
  - Real user performance baseline
  - Geographic performance variations
  - Device/connection impact analysis

### 8. Caching & Edge Optimization

- [ ] **Caching strategy documentation**
  - Static asset caching headers
  - API response caching policies
  - CDN optimization recommendations

- [ ] **Preconnect & DNS optimization**
  - Add preconnect for external origins
  - Optimize resource loading order
  - Validate resource hints effectiveness

- [ ] **Streaming optimization**
  - Evaluate server component streaming
  - Optimize large payload delivery
  - Measure stream vs. static performance

### 9. Advanced Optimizations

- [ ] **Route-based code splitting**
  - Analyze route-specific chunks
  - Implement targeted splitting
  - Measure per-route improvements

- [ ] **Runtime instrumentation**
  - Add performance markers
  - Custom timing measurements
  - Debug performance bottlenecks

- [ ] **Edge case optimization**
  - Slow network simulation testing
  - Memory-constrained device testing
  - Accessibility performance validation

### 10. Validation & Documentation

- [ ] **Performance regression testing**
  - Automated performance test suite
  - CI-integrated performance gates
  - Delta tracking automation

- [ ] **Epic completion metrics**
  - Final performance measurements
  - Target achievement validation
  - Before/after comparison report

- [ ] **Documentation updates**
  - Performance optimization guide
  - Maintenance procedures
  - Future optimization roadmap

---

## 📊 Progress Tracking

### Bundle Size Targets

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| JS Initial (KB) | TBD | -20% | TBD | 🟡 |
| CSS Total (KB) | TBD | -15% | TBD | 🟡 |
| Route Max JS (KB) | TBD | -25% | TBD | 🟡 |
| Total Assets (MB) | TBD | -20% | TBD | 🟡 |

### Performance Metrics

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| LCP Mobile (ms) | TBD | -15% | TBD | 🟡 |
| FCP (ms) | TBD | -10% | TBD | 🟡 |
| CLS | TBD | <0.1 | TBD | 🟡 |
| Hydration CPU (ms) | TBD | -20% | TBD | 🟡 |

### Epic Milestones

- [ ] **Week 1:** Infrastructure setup & baseline establishment
- [ ] **Week 2:** Code splitting & hydration optimization
- [ ] **Week 3:** Performance validation & documentation
- [ ] **Final:** Epic completion & metrics achievement

---

## 🚨 Risk Mitigation

### High-Risk Items

1. **Dynamic Import Regressions**
   - Mitigation: Add comprehensive fallback components
   - Testing: Automated hydration mismatch detection

2. **Server Component Conversion**
   - Mitigation: Snapshot HTML before/after changes
   - Testing: Visual regression test coverage

3. **CSS Critical Path Changes**
   - Mitigation: Start with measurement-only approach
   - Testing: FOUC/flash detection automation

4. **Dependency Replacement**
   - Mitigation: Targeted unit tests for utility functions
   - Testing: API compatibility validation

### Rollback Plan

- Git branch protection for performance-critical changes
- Automated performance gate failures trigger alerts
- Easy revert path for each optimization category
- Staged deployment with performance monitoring

---

## 🎭 Epic Success Criteria

### Primary Goals
- [ ] 20%+ reduction in initial JavaScript bundle
- [ ] 15%+ improvement in mobile LCP
- [ ] 15%+ reduction in hydration CPU time
- [ ] Performance budgets integrated in CI

### Secondary Goals
- [ ] RUM system operational with 7-day data
- [ ] Visual regression testing automated
- [ ] Performance documentation complete
- [ ] Future optimization roadmap defined

### Epic Completion Trigger
All primary goals achieved AND performance budgets passing in CI for 3 consecutive days.

---

**Status:** 🟡 In Progress
**Last Updated:** 2025-01-12
**Next Review:** Weekly during epic execution
**Epic Lead:** Performance Team
**Stakeholders:** Development Team, Product, Infrastructure
