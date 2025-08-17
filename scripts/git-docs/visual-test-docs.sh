#!/bin/bash
# Visual Test Documentation Generator
# Integrates Git-based documentation with visual regression testing and component snapshots

set -euo pipefail

# Configuration
SCRIPT_DIR="$({BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(SCRIPT_DIR/../.." && pwd)"
VISUAL_DOCS_DIR="$ROOT_DIR/docs/visual-tests"
GIT_DOCS_DIR="$ROOT_DIR/docs/git-generated"
SNAPSHOT_DIR="$ROOT_DIR/nextjs-website/visual-snapshots"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[visual-test-docs]${NC} $1"; }
success() { echo -e "${GREEN}[visual-test-docs]${NC} $1"; }
warn() { echo -e "${YELLOW}[visual-test-docs]${NC} $1"; }
error() { echo -e "${RED}[visual-test-docs]${NC} $1"; }
info() { echo -e "${CYAN}[visual-test-docs]${NC} $1"; }

# Initialize visual test documentation system
initialize_visual_test_docs() {
    log "Initializing visual test documentation system..."
    
    mkdir -p "$VISUAL_DOCS_DIR"/{snapshots,reports,component-tracking,git-integration}
    mkdir -p "$SNAPSHOT_DIR"
    
    # Create configuration file
    cat > "$VISUAL_DOCS_DIR/config.json" << EOF
{
    "version": "1.0.0",
    "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "integration": {
        "git_docs_system": true,
        "visual_comparison_api": true,
        "design_system_snapshots": true,
        "breaking_change_detection": true
    },
    "component_patterns": [
        "components/atomic/**/*.tsx",
        "components/molecular/**/*.tsx", 
        "components/organisms/**/*.tsx"
    ],
    "snapshot_triggers": [
        "component file changes",
        "style file modifications",
        "design token updates",
        "breaking change detection"
    ],
    "visual_test_endpoints": [
        "/api/visual-comparison",
        "/api/design-system/snapshots",
        "/api/git-docs/generate"
    ]
}
EOF

    success "Visual test documentation system initialized"
}

# Detect component changes from Git commits
detect_component_changes() {
    local from_commit="${1:-HEAD~1}"
    local to_commit="${2:-HEAD}"
    
    log "Detecting component changes from $from_commit to $to_commit"
    
    # Get changed component files
    local changed_components=$(" | grep -E "(components|styles)" || true)
    
    if [[ -z "$changed_components" ]]; then
        info "No component changes detected"
        return 0
    fi
    
    # Analyze each changed component
    local component_analysis=()
    
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            local component_name=$(//')
            local component_type=""
            
            # Determine component type
            if [[ "$file" =~ components/atomic ]]; then
                component_type="atomic"
            elif [[ "$file" =~ components/molecular ]]; then
                component_type="molecular"
            elif [[ "$file" =~ components/organisms ]]; then
                component_type="organisms"
            elif [[ "$file" =~ styles ]]; then
                component_type="style"
            else
                component_type="unknown"
            fi
            
            # Get diff for this file
            local file_diff=$(file" | head -50)
            local lines_changed=$(file_diff" | grep -c "^[+-]" || echo 0)
            
            # Check for visual-impacting changes
            local visual_impact="low"
            if echo "$file_diff" | grep -qE "(className|style|css|scss|border|color|background|padding|margin|width|height)"; then
                visual_impact="high"
            elif echo "$file_diff" | grep -qE "(component|jsx|tsx|props)"; then
                visual_impact="medium"
            fi
            
            component_analysis+=("{
                \"file\": \"$file\",
                \"component_name\": \"$component_name\",
                \"component_type\": \"$component_type\",
                \"lines_changed\": $lines_changed,
                \"visual_impact\": \"$visual_impact\",
                \"last_modified\": \"$(file")\",
                \"last_author\": \"$(file")\",
                \"commit_hash\": \"$(file" | cut -c1-8)\"
            }")
        fi
    done <<< "$changed_components"
    
    # Save component change analysis
    local analysis_file="$VISUAL_DOCS_DIR/component-tracking/changes-$(date +%Y%m%d-%H%M%S).json"
    cat > "$analysis_file" << EOF
{
    "analysis": {
        "commit_range": "$from_commit..$to_commit",
        "analyzed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
        "total_files_changed": $(changed_components" | wc -l),
        "high_visual_impact": $({component_analysis[@]}" | grep -c '"visual_impact": "high"' || echo 0),
        "components_requiring_snapshots": []
    },
    "component_changes": [
        $({component_analysis[*]}")
    ]
}
EOF
    
    success "Component change analysis saved: $analysis_file"
    
    # Return high-impact components for snapshot generation
    printf '%s\n' "${component_analysis[@]}" | grep '"visual_impact": "high"' | jq -r '.file' || true
}

# Generate visual test documentation for a component
generate_component_visual_docs() {
    local component_file="$1"
    local component_name=$(//')
    
    log "Generating visual documentation for $component_name"
    
    # Get Git attribution for the component
    local git_attribution=""
    local attribution_file="$GIT_DOCS_DIR/attribution_$(component_file" | tr '/' '_').json"
    
    if [[ -f "$attribution_file" ]]; then
        git_attribution=$(attribution_file")
    else
        # Generate attribution on-demand
        if [[ -x "$SCRIPT_DIR/source-attribution.sh" ]]; then
            "$SCRIPT_DIR/source-attribution.sh" "$component_file" || true
            if [[ -f "$attribution_file" ]]; then
                git_attribution=$(attribution_file")
            fi
        fi
    fi
    
    # Get component documentation from Git docs
    local git_docs=""
    local docs_file="$GIT_DOCS_DIR/$(component_file" | tr '/' '_').md"
    if [[ -f "$docs_file" ]]; then
        git_docs=$(docs_file")
    fi
    
    # Generate visual test documentation
    local visual_doc_file="$VISUAL_DOCS_DIR/snapshots/$component_name.visual.md"
    
    cat > "$visual_doc_file" << EOF
# Visual Test Documentation: $component_name

**Component**: \`$component_file\`  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Git Integration**: ✅ Enabled

## 🎯 Visual Testing Overview

This component is monitored for visual regression through automated snapshot testing integrated with Git change detection.

### 📊 Component Metrics

\`\`\`json
$(if [[ -n "$git_attribution" ]]; then
    echo "$git_attribution" | jq '.attribution.metadata // {}'
else
    echo '{"status": "attribution_pending"}'
fi)
\`\`\`

### 🔗 Source Attribution

$(if [[ -n "$git_attribution" ]]; then
    echo "$git_attribution" | jq -r '.attribution.urls // {} | to_entries[] | "- [\(.key)](\(.value))"'
else
    echo "- Source attribution pending..."
fi)

## 📸 Visual Snapshots

### Current State
\`\`\`bash
# Generate current snapshot
curl -X POST http://localhost:3000/api/visual-comparison \\
  -H "Content-Type: application/json" \\
  -d '{
    "images": [],
    "prompt": "Analyze $component_name component for visual consistency and design system compliance",
    "context": {
      "component": "$component_name",
      "file": "$component_file",
      "mode": "component-audit"
    }
  }'
\`\`\`

### Regression Testing
\`\`\`bash
# Run visual regression test
bun run test:visual -- --component="$component_name"

# Compare with baseline
./scripts/git-docs/visual-test-docs.sh compare "$component_name" HEAD~1 HEAD
\`\`\`

## 🔍 Git Change Integration

### Recent Changes
\`\`\`bash
# View recent changes affecting this component
git log --oneline -5 --follow -- "$component_file"
\`\`\`

### Breaking Change Detection
$(if [[ -f "$GIT_DOCS_DIR/breaking-changes.json" ]]; then
    if grep -q "$component_file" "$GIT_DOCS_DIR/breaking-changes.json" 2>/dev/null; then
        echo "⚠️ **BREAKING CHANGES DETECTED** - Visual regression testing recommended"
    else
        echo "✅ No breaking changes detected in recent commits"
    fi
else
    echo "🔍 Breaking change analysis pending..."
fi)

## 🛠️ Development Workflow

### Before Making Changes
\`\`\`bash
# 1. Capture current state
./scripts/git-docs/visual-test-docs.sh snapshot "$component_name" "before-changes"

# 2. Generate baseline documentation  
./scripts/git-docs/orchestrator.sh generate
\`\`\`

### After Making Changes
\`\`\`bash
# 1. Capture new state
./scripts/git-docs/visual-test-docs.sh snapshot "$component_name" "after-changes"

# 2. Compare visually
./scripts/git-docs/visual-test-docs.sh compare "$component_name" before-changes after-changes

# 3. Update documentation
./scripts/git-docs/orchestrator.sh generate
\`\`\`

## 📋 Component Documentation

$(if [[ -n "$git_docs" ]]; then
    echo "### Auto-Generated Git Documentation"
    echo ""
    echo "\`\`\`markdown"
    echo "$git_docs" | head -50
    echo "\`\`\`"
else
    echo "### Git Documentation"
    echo "Component documentation will be automatically generated when Git docs system processes this file."
fi)

## 🔄 Automated Testing

### Visual Regression Pipeline
- **Trigger**: Git commits affecting component files
- **Process**: Automated snapshot comparison
- **Integration**: Links to Git documentation and breaking change detection  
- **Output**: Visual diff reports with actionable recommendations

### Manual Testing Commands
\`\`\`bash
# Full visual audit
./scripts/git-docs/visual-test-docs.sh audit "$component_name"

# Generate snapshot report
./scripts/git-docs/visual-test-docs.sh report "$component_name"

# Integration test with Git docs
./scripts/git-docs/visual-test-docs.sh integrate "$component_name"
\`\`\`

---
*This visual test documentation is automatically generated and maintained by the Git-integrated visual testing system.*  
*For updates, run: \`./scripts/git-docs/visual-test-docs.sh generate "$component_file"\`*
EOF

    success "Generated visual documentation: $visual_doc_file"
}

# Create visual snapshot with Git attribution
create_visual_snapshot() {
    local component_name="$1"
    local snapshot_label="${2:-$(date +%Y%m%d-%H%M%S)}"
    
    log "Creating visual snapshot for $component_name ($snapshot_label)"
    
    # Create snapshot directory
    local snapshot_dir="$SNAPSHOT_DIR/$component_name"
    mkdir -p "$snapshot_dir"
    
    # Get current Git context
    local git_context=$(cat << EOF
{
    "component": "$component_name",
    "snapshot_label": "$snapshot_label",
    "git": {
        "commit": "$(git rev-parse HEAD)",
        "commit_short": "$(git rev-parse --short HEAD)",
        "branch": "$(git branch --show-current)",
        "author": "$(git log -1 --format='%an')",
        "timestamp": "$(git log -1 --format='%ai')",
        "message": "$(git log -1 --format='%s')"
    },
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
)
    
    # Save snapshot metadata
    local metadata_file="$snapshot_dir/$snapshot_label.json"
    echo "$git_context" > "$metadata_file"
    
    # Trigger visual comparison API for component snapshot
    local api_response=""
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
        api_response=$(curl -s -X POST http://localhost:3000/api/visual-comparison \
            -H "Content-Type: application/json" \
            -d "{
                \"images\": [],
                \"prompt\": \"Generate visual snapshot for $component_name component\",
                \"context\": {
                    \"component\": \"$component_name\",
                    \"snapshot_label\": \"$snapshot_label\",
                    \"mode\": \"snapshot-generation\",
                    \"git_context\": $git_context
                },
                \"outputFormat\": \"json\"
            }" || echo "{\"error\": \"API call failed\"}")
    else
        warn "Visual comparison API not available - creating metadata-only snapshot"
        api_response='{"error": "API not available", "metadata_only": true}'
    fi
    
    # Save API response
    local response_file="$snapshot_dir/$snapshot_label.response.json"
    echo "$api_response" > "$response_file"
    
    success "Visual snapshot created: $snapshot_dir/$snapshot_label"
    
    # Return snapshot path for further processing
    echo "$snapshot_dir/$snapshot_label"
}

# Compare visual snapshots between Git commits or labels
compare_visual_snapshots() {
    local component_name="$1"
    local baseline="${2:-HEAD~1}"
    local current="${3:-HEAD}"
    
    log "Comparing visual snapshots for $component_name: $baseline vs $current"
    
    local comparison_dir="$VISUAL_DOCS_DIR/reports/comparisons"
    mkdir -p "$comparison_dir"
    
    local comparison_id="$component_name-$((date +%Y%m%d-%H%M%S)"
    local comparison_file="$comparison_dir/$comparison_id.md"
    
    # Get Git diffs for context
    local git_diff=""
    if git rev-parse "$baseline" >/dev/null 2>&1 && git rev-parse "$current" >/dev/null 2>&1; then
        git_diff=$(component_name" || echo "No component files changed")
    else
        git_diff="Comparing snapshot labels: $baseline vs $current"
    fi
    
    # Generate comparison report
    cat > "$comparison_file" << EOF
# Visual Snapshot Comparison: $component_name

**Comparison ID**: \`$comparison_id\`  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Baseline**: $baseline  
**Current**: $current

## 📊 Change Summary

### Git Changes
\`\`\`
$git_diff
\`\`\`

### File Analysis
$(if [[ -n "$git_diff" ]] && [[ "$git_diff" != "No component files changed" ]] && [[ "$git_diff" != *"snapshot labels"* ]]; then
    echo "$git_diff" | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "**$file**"
            echo "- Lines changed: $(file" | grep -c "^[+-]" || echo 0)"
            echo "- Last modified: $(file")"
            echo ""
        fi
    done
else
    echo "No Git file changes detected (comparing snapshot labels or no changes)"
fi)

## 🔍 Visual Comparison

### Snapshot Locations
- **Baseline**: \`$SNAPSHOT_DIR/$component_name/$baseline.*\`
- **Current**: \`$SNAPSHOT_DIR/$component_name/$current.*\`

### Comparison Commands
\`\`\`bash
# View snapshot metadata
cat "$SNAPSHOT_DIR/$component_name/$baseline.json" 2>/dev/null || echo "Baseline snapshot not found"
cat "$SNAPSHOT_DIR/$component_name/$current.json" 2>/dev/null || echo "Current snapshot not found"

# Trigger detailed visual analysis
curl -X POST http://localhost:3000/api/visual-comparison \\
  -H "Content-Type: application/json" \\
  -d '{
    "images": [],
    "prompt": "Compare visual changes in $component_name between $baseline and $current",
    "context": {
      "component": "$component_name",
      "comparison_id": "$comparison_id",
      "baseline": "$baseline",
      "current": "$current",
      "mode": "visual-regression-analysis"
    }
  }'
\`\`\`

## 📋 Integration Analysis

### Breaking Change Detection
$(if [[ -f "$GIT_DOCS_DIR/breaking-changes.json" ]]; then
    if grep -q "$component_name" "$GIT_DOCS_DIR/breaking-changes.json" 2>/dev/null; then
        echo "⚠️ **BREAKING CHANGES DETECTED**"
        echo ""
        echo "\`\`\`json"
        cat "$GIT_DOCS_DIR/breaking-changes.json" | jq ".breaking_changes[] | select(.file | contains(\"$component_name\"))" 2>/dev/null || echo "Error parsing breaking changes"
        echo "\`\`\`"
    else
        echo "✅ No breaking changes detected for this component"
    fi
else
    echo "🔍 Breaking change analysis not available"
fi)

### Git Documentation Integration
$(component_name" | tr '/' '_').md" ]]; then
    echo "📖 [View Git Documentation]($GIT_DOCS_DIR/$(component_name" | tr '/' '_').md)"
else
    echo "📖 Git documentation pending generation"
fi)

## 🎯 Recommended Actions

1. **Review Visual Changes**: Examine snapshots for unintended visual regressions
2. **Test Interactivity**: Verify hover, focus, and click states remain consistent  
3. **Check Accessibility**: Ensure color contrast and keyboard navigation still work
4. **Update Documentation**: Run Git docs generation if changes are intentional
5. **Update Snapshots**: If changes are approved, update baseline snapshots

### Commands to Execute
\`\`\`bash
# 1. Generate fresh documentation
./scripts/git-docs/orchestrator.sh generate

# 2. Run full component test suite
bun run test -- --component="$component_name"

# 3. Update visual baselines (if approved)
./scripts/git-docs/visual-test-docs.sh snapshot "$component_name" "approved-$(date +%Y%m%d)"

# 4. Commit documentation updates
git add docs/visual-tests/ docs/git-generated/
git commit -m "docs(visual): update $component_name documentation and snapshots"
\`\`\`

---
*Visual comparison report generated by Git-integrated visual testing system*  
*For detailed analysis, run: \`./scripts/git-docs/visual-test-docs.sh compare "$component_name" "$baseline" "$current"\`*
EOF

    success "Visual comparison report generated: $comparison_file"
    
    # Return comparison file path
    echo "$comparison_file"
}

# Generate comprehensive visual test audit report
generate_visual_audit_report() {
    local target_component="${1:-all}"
    
    log "Generating comprehensive visual audit report for: $target_component"
    
    local audit_file="$VISUAL_DOCS_DIR/reports/audit-$(date +%Y%m%d-%H%M%S).md"
    
    # Get component statistics
    local total_components=$(ROOT_DIR" -path "*/components/*" -name "*.tsx" | wc -l || echo 0)
    local documented_components=$(VISUAL_DOCS_DIR/snapshots/"*.visual.md 2>/dev/null | wc -l || echo 0)
    local snapshot_count=$(SNAPSHOT_DIR" -name "*.json" 2>/dev/null | wc -l || echo 0)
    
    cat > "$audit_file" << EOF
# Visual Testing Audit Report

**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Target**: $target_component  
**Git Integration**: ✅ Active

## 📊 System Overview

### Component Coverage
- **Total Components**: $total_components
- **Documented Components**: $documented_components  
- **Visual Snapshots**: $snapshot_count
- **Coverage Percentage**: $((total_components > 0 ? documented_components * 100 / total_components : 0))%

### Git Integration Status
- **Git Docs System**: $(GIT_DOCS_DIR" && echo "✅ Active" || echo "❌ Inactive")
- **Breaking Change Detection**: $(GIT_DOCS_DIR/breaking-changes.json" && echo "✅ Active" || echo "❌ Inactive")
- **Source Attribution**: $(GIT_DOCS_DIR/source-attribution.json" && echo "✅ Active" || echo "❌ Inactive")

## 🔍 Component Analysis

$(if [[ "$target_component" == "all" ]]; then
    echo "### All Components"
    find "$ROOT_DIR" -path "*/components/*" -name "*.tsx" | head -20 | while read -r component; do
        local comp_name=$(//')
        local has_docs=$(comp_name.visual.md" && echo "✅" || echo "❌")
        local has_snapshots=$(comp_name" && echo "✅" || echo "❌")
        echo "- **$comp_name**: Docs $has_docs | Snapshots $has_snapshots"
    done
else
    echo "### Component: $target_component"
    local comp_docs="$VISUAL_DOCS_DIR/snapshots/$target_component.visual.md"
    local comp_snapshots="$SNAPSHOT_DIR/$target_component"
    
    echo "- **Documentation**: $(comp_docs" && echo "✅ Available" || echo "❌ Missing")"
    echo "- **Snapshots**: $(comp_snapshots"/*.json 2>/dev/null | wc -l) snapshots)" || echo "❌ Missing")"
    echo "- **Git Attribution**: $(target_component*.json" && echo "✅ Available" || echo "❌ Missing")"
fi)

## 🚀 Integration Commands

### Quick Setup
\`\`\`bash
# Initialize visual testing for all components
./scripts/git-docs/visual-test-docs.sh init

# Generate documentation for specific component
./scripts/git-docs/visual-test-docs.sh generate-docs "button.atomic"

# Create baseline snapshots
./scripts/git-docs/visual-test-docs.sh snapshot-all
\`\`\`

### Development Workflow
\`\`\`bash
# Before making changes
./scripts/git-docs/visual-test-docs.sh snapshot "$target_component" "baseline"

# After making changes  
./scripts/git-docs/visual-test-docs.sh snapshot "$target_component" "after-changes"
./scripts/git-docs/visual-test-docs.sh compare "$target_component" baseline after-changes

# Update Git documentation
./scripts/git-docs/orchestrator.sh generate
\`\`\`

## 📋 Recommendations

### High Priority
$(((total_components / 2)) ]]; then
    echo "- 🔴 **Increase documentation coverage**: Only $documented_components/$total_components components documented"
fi)
$(if [[ $snapshot_count -lt 10 ]]; then
    echo "- 🔴 **Create more visual snapshots**: Only $snapshot_count snapshots available"
fi)

### Medium Priority  
- 🟡 **Automate visual regression testing**: Set up CI/CD integration
- 🟡 **Expand component coverage**: Add visual testing for molecular and organism components
- 🟡 **Integrate with design system**: Link visual tests to design token changes

### Low Priority
- 🟢 **Performance optimization**: Cache visual comparison results  
- 🟢 **Enhanced reporting**: Add visual diff images and automated analysis
- 🟢 **Cross-browser testing**: Extend visual testing to multiple browsers

## 🔧 System Health

### API Endpoints
$(curl -s http://localhost:3000/api/health >/dev/null 2>&1 && echo "- ✅ **Main API**: Healthy" || echo "- ❌ **Main API**: Unavailable")
$(curl -s http://localhost:3000/api/visual-comparison >/dev/null 2>&1 && echo "- ✅ **Visual Comparison API**: Healthy" || echo "- ❌ **Visual Comparison API**: Unavailable")
$(curl -s http://localhost:3000/api/git-docs/generate >/dev/null 2>&1 && echo "- ✅ **Git Docs API**: Healthy" || echo "- ❌ **Git Docs API**: Unavailable")

### File System
- **Visual Docs Directory**: $(VISUAL_DOCS_DIR" && echo "✅ Available" || echo "❌ Missing")
- **Git Docs Directory**: $(GIT_DOCS_DIR" && echo "✅ Available" || echo "❌ Missing")  
- **Snapshot Directory**: $(SNAPSHOT_DIR" && echo "✅ Available" || echo "❌ Missing")

---
*Visual testing audit completed. For detailed analysis of specific components, run with component name as parameter.*
EOF

    success "Visual audit report generated: $audit_file"
    echo "$audit_file"
}

# Main function
main() {
    local command="${1:-help}"
    local component="${2:-}"
    local arg3="${3:-}"
    local arg4="${4:-}"
    
    case "$command" in
        "init")
            initialize_visual_test_docs
            ;;
        "detect-changes")
            detect_component_changes "$component" "$arg3"
            ;;
        "generate-docs")
            if [[ -z "$component" ]]; then
                error "Component file path required for generate-docs command"
                exit 1
            fi
            generate_component_visual_docs "$component"
            ;;
        "snapshot")
            if [[ -z "$component" ]]; then
                error "Component name required for snapshot command"
                exit 1
            fi
            create_visual_snapshot "$component" "$arg3"
            ;;
        "compare")
            if [[ -z "$component" ]]; then
                error "Component name required for compare command"
                exit 1
            fi
            compare_visual_snapshots "$component" "$arg3" "$arg4"
            ;;
        "audit")
            generate_visual_audit_report "$component"
            ;;
        "integrate")
            log "Running full Git-Visual integration..."
            initialize_visual_test_docs
            
            # Detect recent changes and generate docs
            local changed_components=($(detect_component_changes))
            for comp_file in "${changed_components[@]}"; do
                if [[ -n "$comp_file" ]]; then
                    generate_component_visual_docs "$comp_file"
                fi
            done
            
            # Generate audit report
            generate_visual_audit_report "all"
            ;;
        "help"|*)
            echo "Visual Test Documentation Generator - Git-integrated visual regression testing"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  init                           Initialize visual test documentation system"
            echo "  detect-changes [from] [to]     Detect component changes between Git commits"
            echo "  generate-docs <component>      Generate visual docs for specific component"
            echo "  snapshot <component> [label]   Create visual snapshot with Git attribution"
            echo "  compare <component> [baseline] [current]  Compare visual snapshots"
            echo "  audit [component]              Generate comprehensive audit report"
            echo "  integrate                      Run full Git-Visual integration process"
            echo "  help                          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 init"
            echo "  $0 detect-changes HEAD~5 HEAD"
            echo "  $0 generate-docs components/atomic/button/button.atomic.tsx"
            echo "  $0 snapshot button-atomic baseline"
            echo "  $0 compare button-atomic baseline current"
            echo "  $0 audit button-atomic"
            echo "  $0 integrate"
            ;;
    esac
}

# Execute main function with all arguments
main "$@"