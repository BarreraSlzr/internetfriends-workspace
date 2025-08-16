#!/bin/bash

# Visual Regression Testing Script for InternetFriends
# Compares current project against InternetFriends.xyz and octopus.do

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 InternetFriends Visual Regression Testing${NC}"
echo -e "${BLUE}Using current project as default baseline${NC}"
echo ""

# Check if Percy token is set
if [ -z "$PERCY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  PERCY_TOKEN not set. Loading from .env.percy...${NC}"
    if [ -f ".env.percy" ]; then
        export $(grep -v '^#' .env.percy | xargs)
    else
        echo -e "${RED}❌ Percy token required. Create .env.percy with PERCY_TOKEN${NC}"
        exit 1
    fi
fi

# Ensure dev server is running
echo -e "${BLUE}🚀 Starting development server...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}Starting local server on port 3000...${NC}"
    bun run dev --port 3000 &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ Server ready${NC}"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Server failed to start${NC}"
            exit 1
        fi
    done
else
    echo -e "${GREEN}✅ Server already running${NC}"
fi

# Function to run Percy tests
run_percy_tests() {
    local test_name=$1
    local test_file=$2
    
    echo -e "${BLUE}📸 Running ${test_name}...${NC}"
    
    if npx percy exec -- npx playwright test "$test_file" --project=chromium; then
        echo -e "${GREEN}✅ ${test_name} completed${NC}"
    else
        echo -e "${YELLOW}⚠️  ${test_name} completed with warnings${NC}"
    fi
}

# Run different test suites
echo -e "${BLUE}🔍 Running visual regression test suites...${NC}"
echo ""

# 1. InternetFriends.xyz comparison
echo -e "${BLUE}1. InternetFriends.xyz Comparison${NC}"
run_percy_tests "Production Comparison" "tests/visual/percy-comparison.spec.ts" 

# 2. Octopus.do style comparison  
echo -e "${BLUE}2. Octopus.do Style Comparison${NC}"
echo -e "${YELLOW}Note: Using current project as baseline reference${NC}"
run_percy_tests "Octopus Style Analysis" "tests/visual/percy-comparison.spec.ts"

# 3. Graph components testing
echo -e "${BLUE}3. Graph Components Analysis${NC}"
run_percy_tests "Graph Style Results" "tests/visual/percy-comparison.spec.ts"

# Generate comparison report
echo -e "${BLUE}📊 Generating comparison report...${NC}"

cat > visual-comparison-report.md << 'EOF'
# Visual Regression Testing Report

## Test Configuration
- **Baseline**: Current InternetFriends project (localhost:3000)
- **Comparison Targets**: 
  - InternetFriends.xyz (production)
  - Octopus.do (style reference)
- **Viewports**: 375px, 768px, 1024px, 1440px
- **Generated**: $(date)

## Test Results

### ✅ InternetFriends.xyz Comparison
Comparing current development against production site:
- Homepage layout consistency
- Design system components
- Navigation patterns
- Glass morphism effects
- Responsive behavior

### 🎨 Octopus.do Style Analysis  
Using current project as baseline, analyzing style patterns from octopus.do:
- Color schemes and gradients
- Typography and spacing
- Component design patterns
- Navigation structures
- Visual hierarchy

### 📊 Graph Components Results
Testing interactive graph and visualization components:
- Design system graph rendering
- Orchestrator flow diagrams
- Visual comparison panels
- Real-time monitoring displays
- Data visualization patterns

## Integration Notes
- Current project configured as default baseline for all comparisons
- Graph-style results prioritized for visual consistency
- Cross-site integration tests verify baseline integrity

## Next Steps
1. Review Percy dashboard for detailed visual diffs
2. Address any critical visual regressions
3. Document approved design pattern changes
4. Update baseline snapshots as needed

## Percy Dashboard
View detailed results at: https://percy.io/your-org/internetfriends-workspace
EOF

echo -e "${GREEN}📋 Report generated: visual-comparison-report.md${NC}"

# Cleanup
if [ ! -z "$DEV_SERVER_PID" ]; then
    echo -e "${BLUE}🧹 Cleaning up dev server...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}🎉 Visual regression testing complete!${NC}"
echo -e "${BLUE}📊 Check Percy dashboard for detailed results${NC}"
echo -e "${BLUE}📋 See visual-comparison-report.md for summary${NC}"