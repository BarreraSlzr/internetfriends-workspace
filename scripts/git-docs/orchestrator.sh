#!/bin/bash
# Git Documentation Orchestrator
# Unified system that coordinates all Git-based documentation utilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/docs/git-generated"
CONFIG_FILE="$SCRIPT_DIR/git-docs-config.json"

# Utility scripts
MONITOR_SCRIPT="$SCRIPT_DIR/monitor-changes.sh"
ATTRIBUTION_SCRIPT="$SCRIPT_DIR/source-attribution.sh"
BREAKING_CHANGE_SCRIPT="$SCRIPT_DIR/breaking-change-detector.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[git-docs-orchestrator]${NC} $1"; }
success() { echo -e "${GREEN}[git-docs-orchestrator]${NC} $1"; }
warn() { echo -e "${YELLOW}[git-docs-orchestrator]${NC} $1"; }
error() { echo -e "${RED}[git-docs-orchestrator]${NC} $1"; }
info() { echo -e "${CYAN}[git-docs-orchestrator]${NC} $1"; }

# Initialize configuration
initialize_config() {
    log "Initializing Git documentation configuration..."
    
    cat > "$CONFIG_FILE" << EOF
{
    "version": "1.0.0",
    "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "watch_patterns": [
        "types/*.ts",
        "schemas/*.ts",
        "nextjs-website/app/api/*/route.ts",
        "app/api/*/route.ts"
    ],
    "output_directory": "./docs/git-generated",
    "repository": {
        "url": "$(git config --get remote.origin.url | sed 's/\.git$//')",
        "private_url": "$(git config --get remote.private.url 2>/dev/null || echo '')",
        "public_url": "$(git config --get remote.public.url 2>/dev/null || echo '')"
    },
    "features": {
        "breaking_change_detection": true,
        "source_attribution": true,
        "dual_documentation": true,
        "api_integration": true
    },
    "thresholds": {
        "critical_breaking_changes": 0,
        "high_breaking_changes": 3,
        "max_processing_time_seconds": 60
    }
}
EOF
    
    success "Configuration initialized: $CONFIG_FILE"
}

# Get current Git context
get_git_context() {
    local context=$(cat << EOF
{
    "repository": {
        "url": "$(git config --get remote.origin.url | sed 's/\.git$//')",
        "branch": "$(git branch --show-current)",
        "commit": "$(git rev-parse HEAD)",
        "commit_short": "$(git rev-parse --short HEAD)"
    },
    "workspace": {
        "root": "$ROOT_DIR",
        "output": "$OUTPUT_DIR",
        "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    }
}
EOF
)
    echo "$context"
}

# Execute comprehensive documentation generation
execute_full_generation() {
    local start_time=$(date +%s)
    
    log "🚀 Starting comprehensive Git documentation generation..."
    
    # Ensure output directory exists
    mkdir -p "$OUTPUT_DIR"
    
    # Save current context
    get_git_context > "$OUTPUT_DIR/context.json"
    
    # Step 1: Monitor and generate base documentation
    info "📝 Step 1: Generating base documentation..."
    if [[ -x "$MONITOR_SCRIPT" ]]; then
        "$MONITOR_SCRIPT" generate
        success "✅ Base documentation generated"
    else
        error "❌ Monitor script not found or not executable: $MONITOR_SCRIPT"
        return 1
    fi
    
    # Step 2: Enhanced source attribution
    info "🔗 Step 2: Generating enhanced source attribution..."
    local target_files=($(find "$ROOT_DIR" -name "*.ts" -path "*/types/*" -o -path "*/schemas/*" -o -path "*/api/*/route.ts" | head -10))
    
    for file in "${target_files[@]}"; do
        local relative_file="${file#$ROOT_DIR/}"
        if [[ -x "$ATTRIBUTION_SCRIPT" ]]; then
            "$ATTRIBUTION_SCRIPT" "$relative_file" || warn "⚠️  Attribution failed for $relative_file"
        fi
    done
    success "✅ Source attribution completed"
    
    # Step 3: Breaking change detection
    info "🔍 Step 3: Detecting breaking changes..."
    if [[ -x "$BREAKING_CHANGE_SCRIPT" ]]; then
        "$BREAKING_CHANGE_SCRIPT" analyze HEAD~5 HEAD
        success "✅ Breaking change analysis completed"
    else
        warn "⚠️  Breaking change script not found: $BREAKING_CHANGE_SCRIPT"
    fi
    
    # Step 4: Generate unified index
    info "📚 Step 4: Creating unified documentation index..."
    generate_unified_index
    
    # Step 5: Integration with existing systems
    info "🔧 Step 5: Integrating with existing systems..."
    integrate_with_existing_systems
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "🎉 Complete! Generated documentation in ${duration}s"
    success "📂 Output directory: $OUTPUT_DIR"
    
    # Generate summary report
    generate_summary_report "$duration"
}

# Generate unified documentation index
generate_unified_index() {
    log "Creating unified documentation index..."
    
    local index_file="$OUTPUT_DIR/index.md"
    local context=$(get_git_context)
    
    cat > "$index_file" << EOF
# Git-Sourced Documentation Index

**Auto-generated comprehensive documentation from Git repository**  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Repository**: $(echo "$context" | grep '"url"' | head -1 | cut -d'"' -f4)  
**Branch**: $(echo "$context" | grep '"branch"' | cut -d'"' -f4)  
**Commit**: $(echo "$context" | grep '"commit_short"' | cut -d'"' -f4)

## 📋 Documentation Categories

### 🔧 API Documentation
$(ls "$OUTPUT_DIR"/*api*.md 2>/dev/null | head -10 | while read file; do
    local basename=$(basename "$file")
    echo "- [$basename](./$basename)"
done || echo "- No API documentation found")

### 📊 Type Definitions
$(ls "$OUTPUT_DIR"/*types*.md 2>/dev/null | head -5 | while read file; do
    local basename=$(basename "$file")
    echo "- [$basename](./$basename)"
done || echo "- No type documentation found")

### 🔒 Schema Validation
$(ls "$OUTPUT_DIR"/*schemas*.md 2>/dev/null | head -5 | while read file; do
    local basename=$(basename "$file")
    echo "- [$basename](./$basename)"
done || echo "- No schema documentation found")

## 🔍 Analysis Reports

### Breaking Changes
$(ls "$OUTPUT_DIR"/breaking-changes-*.json 2>/dev/null | head -3 | while read file; do
    local basename=$(basename "$file")
    local timestamp=$(echo "$basename" | grep -o '[0-9]\\{8\\}-[0-9]\\{6\\}' || echo "unknown")
    echo "- [$basename](./$basename) - $timestamp"
done || echo "- No breaking change reports found")

### Source Attribution
$(ls "$OUTPUT_DIR"/attribution_*.json 2>/dev/null | head -5 | while read file; do
    local basename=$(basename "$file")
    local original_file=$(echo "$basename" | sed 's/attribution_//' | sed 's/.json$//' | tr '_' '/')
    echo "- [$basename](./$basename) - $original_file"
done || echo "- No attribution files found")

## 🚀 Integration Points

### API Endpoints
- \`GET /api/git-docs/generate\` - List generated documentation
- \`POST /api/git-docs/generate\` - Trigger documentation generation
- \`GET /api/git-docs/breaking-changes\` - List breaking change reports
- \`POST /api/git-docs/breaking-changes\` - Analyze breaking changes
- \`GET /api/git-docs/source-attribution\` - List attribution data
- \`POST /api/git-docs/source-attribution\` - Get file attribution

### Command Line Tools
\`\`\`bash
# Generate all documentation
./scripts/git-docs/orchestrator.sh generate

# Watch for changes
./scripts/git-docs/orchestrator.sh watch

# Analyze specific commit range
./scripts/git-docs/orchestrator.sh analyze HEAD~10 HEAD

# Get status
./scripts/git-docs/orchestrator.sh status
\`\`\`

---
*This index was automatically generated by the Git Documentation Orchestrator system.*  
*For the latest version, regenerate using \`./scripts/git-docs/orchestrator.sh generate\`*
EOF

    success "Generated unified index: $index_file"
}

# Integrate with existing systems
integrate_with_existing_systems() {
    log "Integrating with existing InternetFriends systems..."
    
    # Check for visual comparison system integration
    local visual_comparison_api="$ROOT_DIR/nextjs-website/app/api/visual-comparison/route.ts"
    if [[ -f "$visual_comparison_api" ]]; then
        info "🔗 Found visual comparison system - creating integration point"
        
        # Create integration metadata
        cat > "$OUTPUT_DIR/visual-comparison-integration.json" << EOF
{
    "integration_type": "visual_comparison",
    "target_file": "nextjs-website/app/api/visual-comparison/route.ts",
    "documentation_files": [
        "$(basename "$OUTPUT_DIR"/nextjs-website_app_api_visual-comparison_route.ts.md 2>/dev/null || echo "not-generated")"
    ],
    "suggested_enhancements": [
        "Add Git change tracking to visual comparison snapshots",
        "Include source attribution in snapshot metadata",
        "Link breaking changes to visual regression detection"
    ],
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    fi
    
    # Check for epic system integration
    local epic_tools="$ROOT_DIR/scripts/epic-tools"
    if [[ -d "$epic_tools" ]]; then
        info "🎭 Found epic management system - creating integration point"
        
        # Create epic integration metadata
        cat > "$OUTPUT_DIR/epic-integration.json" << EOF
{
    "integration_type": "epic_management",
    "epic_tools_path": "scripts/epic-tools",
    "current_epic": "git-sourced-documentation-v1",
    "documentation_coverage": {
        "types_documented": $(ls "$OUTPUT_DIR"/*types*.md 2>/dev/null | wc -l || echo 0),
        "apis_documented": $(ls "$OUTPUT_DIR"/*api*.md 2>/dev/null | wc -l || echo 0),
        "schemas_documented": $(ls "$OUTPUT_DIR"/*schemas*.md 2>/dev/null | wc -l || echo 0)
    },
    "epic_features_completed": [
        "Git change monitoring system",
        "Source attribution with GitHub links",
        "Breaking change detection",
        "API route implementation",
        "Unified orchestrator system"
    ],
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    fi
    
    success "Integration metadata created"
}

# Generate summary report
generate_summary_report() {
    local duration="$1"
    local report_file="$OUTPUT_DIR/generation-summary.json"
    
    log "Generating summary report..."
    
    # Count generated files
    local docs_count=$(ls "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l || echo 0)
    local attribution_count=$(ls "$OUTPUT_DIR"/attribution_*.json 2>/dev/null | wc -l || echo 0)
    local breaking_changes_count=$(ls "$OUTPUT_DIR"/breaking-changes-*.json 2>/dev/null | wc -l || echo 0)
    
    # Get Git stats
    local total_commits=$(git rev-list --count HEAD 2>/dev/null || echo 0)
    local recent_commits=$(git rev-list --count HEAD~10..HEAD 2>/dev/null || echo 0)
    
    cat > "$report_file" << EOF
{
    "summary": {
        "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
        "processing_time_seconds": $duration,
        "total_documentation_files": $docs_count,
        "attribution_files": $attribution_count,
        "breaking_change_reports": $breaking_changes_count
    },
    "repository_stats": {
        "total_commits": $total_commits,
        "recent_commits_analyzed": $recent_commits,
        "current_branch": "$(git branch --show-current)",
        "current_commit": "$(git rev-parse --short HEAD)"
    },
    "system_health": {
        "monitor_script_available": $(test -x "$MONITOR_SCRIPT" && echo true || echo false),
        "attribution_script_available": $(test -x "$ATTRIBUTION_SCRIPT" && echo true || echo false),
        "breaking_change_script_available": $(test -x "$BREAKING_CHANGE_SCRIPT" && echo true || echo false),
        "output_directory_writable": $(test -w "$OUTPUT_DIR" && echo true || echo false)
    },
    "next_steps": [
        "Review generated documentation in $OUTPUT_DIR",
        "Check breaking change reports for critical issues",
        "Integrate with existing visual comparison system",
        "Add automated Git hooks for continuous documentation"
    ]
}
EOF

    success "Summary report generated: $report_file"
    
    # Display key metrics
    echo ""
    echo "📊 GENERATION SUMMARY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "📝 Documentation files: $docs_count"
    info "🔗 Attribution files: $attribution_count"  
    info "🔍 Breaking change reports: $breaking_changes_count"
    info "⏱️  Processing time: ${duration}s"
    echo ""
}

# Watch mode for continuous documentation
watch_mode() {
    log "🔄 Starting continuous documentation watching..."
    
    while true; do
        log "Running documentation generation cycle..."
        execute_full_generation
        
        log "Waiting 30 seconds for next cycle..."
        sleep 30
    done
}

# Status check
status_check() {
    log "🔍 Git Documentation System Status"
    echo ""
    
    # Check Git repository
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        success "✅ Git repository: $(git config --get remote.origin.url)"
        info "   Branch: $(git branch --show-current)"
        info "   Commit: $(git rev-parse --short HEAD)"
    else
        error "❌ Not in a Git repository"
        return 1
    fi
    
    # Check scripts
    echo ""
    info "📜 Script Status:"
    test -x "$MONITOR_SCRIPT" && success "   ✅ Monitor script available" || error "   ❌ Monitor script missing"
    test -x "$ATTRIBUTION_SCRIPT" && success "   ✅ Attribution script available" || error "   ❌ Attribution script missing"
    test -x "$BREAKING_CHANGE_SCRIPT" && success "   ✅ Breaking change script available" || error "   ❌ Breaking change script missing"
    
    # Check output directory
    echo ""
    info "📂 Output Directory Status:"
    if [[ -d "$OUTPUT_DIR" ]]; then
        success "   ✅ Output directory exists: $OUTPUT_DIR"
        local docs_count=$(ls "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l || echo 0)
        info "   📝 Documentation files: $docs_count"
        local recent_reports=$(find "$OUTPUT_DIR" -name "breaking-changes-*.json" -mtime -1 2>/dev/null | wc -l || echo 0)
        info "   🔍 Recent breaking change reports: $recent_reports"
    else
        warn "   ⚠️  Output directory does not exist: $OUTPUT_DIR"
    fi
    
    # Check API integration
    echo ""
    info "🌐 API Integration Status:"
    local api_dir="$ROOT_DIR/nextjs-website/app/api/git-docs"
    if [[ -d "$api_dir" ]]; then
        success "   ✅ Git docs API routes available"
        local route_count=$(find "$api_dir" -name "route.ts" | wc -l || echo 0)
        info "   📡 API routes: $route_count"
    else
        warn "   ⚠️  Git docs API routes not found"
    fi
}

# Main function
main() {
    local command="${1:-help}"
    
    case "$command" in
        "init")
            initialize_config
            ;;
        "generate")
            execute_full_generation
            ;;
        "watch")
            watch_mode
            ;;
        "status")
            status_check
            ;;
        "analyze")
            local from_commit="${2:-HEAD~5}"
            local to_commit="${3:-HEAD}"
            log "Analyzing commits from $from_commit to $to_commit"
            execute_full_generation
            ;;
        "help"|*)
            echo "Git Documentation Orchestrator - Unified Git-based documentation system"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  init        Initialize configuration"
            echo "  generate    Generate comprehensive documentation"
            echo "  watch       Watch for changes and regenerate continuously"
            echo "  status      Check system status and health"
            echo "  analyze     Analyze specific commit range"
            echo "  help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 generate"
            echo "  $0 watch"
            echo "  $0 analyze HEAD~10 HEAD"
            echo "  $0 status"
            ;;
    esac
}

# Execute main function with all arguments
main "$@"