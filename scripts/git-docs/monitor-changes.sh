#!/bin/bash
# Git-Based Documentation Change Monitor
# Monitors types/*.ts, schemas/*.ts, and API routes for documentation generation

set -euo pipefail

# Configuration
WATCH_PATTERNS=("types/*.ts" "schemas/*.ts" "nextjs-website/app/api/*/route.ts" "app/api/*/route.ts")
OUTPUT_DIR="./docs/git-generated"
ATTRIBUTION_FILE="$OUTPUT_DIR/source-attribution.json"
BREAKING_CHANGES_FILE="$OUTPUT_DIR/breaking-changes.json"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[git-docs]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[git-docs]${NC} $1"
}

error() {
    echo -e "${RED}[git-docs]${NC} $1"
}

success() {
    echo -e "${GREEN}[git-docs]${NC} $1"
}

# Get current Git context
get_git_context() {
    local branch=$(git branch --show-current)
    local commit=$(git rev-parse HEAD)
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    echo "{
        \"branch\": \"$branch\",
        \"commit\": \"$commit\",
        \"timestamp\": \"$timestamp\",
        \"remote\": \"$(git config --get remote.origin.url | sed 's/\.git$//')\"
    }"
}

# Find files matching our patterns
find_target_files() {
    log "Scanning for target files..."
    
    for pattern in "${WATCH_PATTERNS[@]}"; do
        # Use find with basic pattern matching
        find . -path "./$pattern" -type f 2>/dev/null || true
    done | sort | uniq
}

# Extract TypeScript interfaces and types from a file
extract_typescript_definitions() {
    local file="$1"
    local output=""
    
    log "Extracting TypeScript definitions from $file"
    
    # Extract interfaces using grep and sed
    interfaces=$(grep -n "^export interface" "$file" 2>/dev/null | sed 's/:/ |/' || true)
    types=$(grep -n "^export type" "$file" 2>/dev/null | sed 's/:/ |/' || true)
    schemas=$(grep -n "Schema = z\." "$file" 2>/dev/null | sed 's/:/ |/' || true)
    
    if [[ -n "$interfaces" ]]; then
        echo "=== INTERFACES ==="
        echo "$interfaces"
        echo ""
    fi
    
    if [[ -n "$types" ]]; then
        echo "=== TYPES ==="
        echo "$types"
        echo ""
    fi
    
    if [[ -n "$schemas" ]]; then
        echo "=== ZOD SCHEMAS ==="
        echo "$schemas"
        echo ""
    fi
}

# Generate source attribution data
generate_source_attribution() {
    local file="$1"
    local relative_path="${file#./}"
    local git_url=$(git config --get remote.origin.url | sed 's/\.git$//')
    local commit=$(git rev-parse HEAD)
    local branch=$(git branch --show-current)
    
    # Count lines and get file info
    local line_count=$(wc -l < "$file")
    local last_modified=$(git log -1 --format="%ai" -- "$file")
    local last_author=$(git log -1 --format="%an" -- "$file")
    
    cat << EOF
{
    "file": "$relative_path",
    "github_url": "$git_url/blob/$commit/$relative_path",
    "github_blame_url": "$git_url/blame/$commit/$relative_path",
    "commit": "$commit",
    "branch": "$branch",
    "line_count": $line_count,
    "last_modified": "$last_modified",
    "last_author": "$last_author",
    "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Detect breaking changes by comparing with previous commit
detect_breaking_changes() {
    local file="$1"
    local relative_path="${file#./}"
    
    log "Checking for breaking changes in $relative_path"
    
    # Get the diff from the previous commit
    local diff_output=$(git diff HEAD~1 "$file" 2>/dev/null || echo "No previous version")
    
    # Check for potential breaking changes in TypeScript/Zod schemas
    local breaking_patterns=(
        "interface.*{" 
        "type.*="
        "Schema = z\."
        "export.*interface"
        "export.*type"
    )
    
    local breaking_changes=""
    
    for pattern in "${breaking_patterns[@]}"; do
        # Check if the pattern was removed (lines starting with -)
        local removed=$(echo "$diff_output" | grep "^-.*$pattern" || true)
        if [[ -n "$removed" ]]; then
            breaking_changes+="REMOVED: $removed\n"
        fi
        
        # Check if the pattern was significantly modified
        local modified=$(echo "$diff_output" | grep -A1 -B1 ".*$pattern" | grep "^[-+]" | head -5 || true)
        if [[ -n "$modified" ]]; then
            breaking_changes+="MODIFIED: $modified\n"
        fi
    done
    
    if [[ -n "$breaking_changes" ]]; then
        warn "⚠️  Potential breaking changes detected in $relative_path"
        echo -e "$breaking_changes"
        return 0
    else
        success "✅ No breaking changes detected in $relative_path"
        return 1
    fi
}

# Generate comprehensive documentation for a file
generate_file_documentation() {
    local file="$1"
    local relative_path="${file#./}"
    local output_file="$OUTPUT_DIR/$(echo "$relative_path" | tr '/' '_').md"
    
    log "Generating documentation for $relative_path"
    
    # Get Git context
    local git_context=$(get_git_context)
    local source_attribution=$(generate_source_attribution "$file")
    
    # Create markdown documentation
    cat > "$output_file" << EOF
# Documentation: $relative_path

**Auto-generated from Git repository**  
**Source**: [GitHub]($( echo "$source_attribution" | grep '"github_url"' | cut -d'"' -f4))  
**Last Modified**: $(git log -1 --format="%ai" -- "$file")  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## File Overview

\`\`\`
Path: $relative_path
Lines: $(wc -l < "$file")
Last Author: $(git log -1 --format="%an" -- "$file")
Commit: $(git rev-parse HEAD | cut -c1-8)
\`\`\`

## TypeScript Definitions

\`\`\`typescript
$(extract_typescript_definitions "$file")
\`\`\`

## Source Attribution

\`\`\`json
$source_attribution
\`\`\`

## Recent Changes

\`\`\`diff
$(git log -3 --oneline --follow -- "$file")
\`\`\`

---
*This documentation was automatically generated from the Git repository. 
For the most up-to-date version, visit the [source file]($( echo "$source_attribution" | grep '"github_url"' | cut -d'"' -f4)).*
EOF

    success "Generated documentation: $output_file"
}

# Main function
main() {
    log "Starting Git-based documentation generation..."
    
    # Ensure we're in a Git repository
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        error "Not in a Git repository!"
        exit 1
    fi
    
    # Find all target files
    local target_files=($(find_target_files))
    
    if [[ ${#target_files[@]} -eq 0 ]]; then
        warn "No target files found matching patterns: ${WATCH_PATTERNS[*]}"
        exit 0
    fi
    
    log "Found ${#target_files[@]} target files"
    
    # Initialize attribution and breaking changes tracking
    echo "[]" > "$ATTRIBUTION_FILE"
    echo "[]" > "$BREAKING_CHANGES_FILE"
    
    local attribution_data="["
    local breaking_changes_data="["
    
    # Process each file
    for file in "${target_files[@]}"; do
        if [[ -f "$file" ]]; then
            # Generate documentation
            generate_file_documentation "$file"
            
            # Add to attribution data
            local file_attribution=$(generate_source_attribution "$file")
            attribution_data+="$file_attribution,"
            
            # Check for breaking changes
            if detect_breaking_changes "$file"; then
                local breaking_change="{
                    \"file\": \"${file#./}\",
                    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
                    \"commit\": \"$(git rev-parse HEAD)\",
                    \"detected\": true
                }"
                breaking_changes_data+="$breaking_change,"
            fi
        fi
    done
    
    # Close JSON arrays and save
    attribution_data="${attribution_data%,}]"
    breaking_changes_data="${breaking_changes_data%,}]"
    
    echo "$attribution_data" > "$ATTRIBUTION_FILE"
    echo "$breaking_changes_data" > "$BREAKING_CHANGES_FILE"
    
    success "Documentation generation complete!"
    success "Output directory: $OUTPUT_DIR"
    success "Attribution data: $ATTRIBUTION_FILE"
    success "Breaking changes: $BREAKING_CHANGES_FILE"
}

# Run with command line arguments
case "${1:-help}" in
    "watch")
        log "Watching for changes..."
        while true; do
            main
            sleep 30
        done
        ;;
    "generate")
        main
        ;;
    "help"|*)
        echo "Usage: $0 [watch|generate]"
        echo "  watch    - Continuously monitor for changes"
        echo "  generate - Generate documentation once"
        ;;
esac