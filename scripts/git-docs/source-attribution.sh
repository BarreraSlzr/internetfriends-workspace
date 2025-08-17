#!/bin/bash
# Source Attribution Engine - GitHub URL Builder and Source Tracker
# Builds proper GitHub URLs with repository context and handles private/public repos

set -euo pipefail

# Configuration
PRIVATE_REPO_URL=$(git config --get remote.private.url 2>/dev/null || echo "")
PUBLIC_REPO_URL=$(git config --get remote.public.url 2>/dev/null || echo "")
DEFAULT_REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[source-attr]${NC} $1"; }
success() { echo -e "${GREEN}[source-attr]${NC} $1"; }
warn() { echo -e "${YELLOW}[source-attr]${NC} $1"; }
error() { echo -e "${RED}[source-attr]${NC} $1"; }

# Get repository context and build proper URLs
get_repo_context() {
    local commit=$(git rev-parse HEAD)
    local branch=$(git branch --show-current)
    
    # Determine which repository URL to use
    local repo_url=""
    local repo_type=""
    
    if [[ -n "$PRIVATE_REPO_URL" ]]; then
        repo_url="$PRIVATE_REPO_URL"
        repo_type="private"
    elif [[ -n "$PUBLIC_REPO_URL" ]]; then
        repo_url="$PUBLIC_REPO_URL"
        repo_type="public"
    else
        repo_url="$DEFAULT_REPO_URL"
        repo_type="default"
    fi
    
    # Clean the URL (remove .git suffix)
    repo_url=$(echo "$repo_url" | sed 's/\.git$//')
    
    echo "{
        \"repository\": {
            \"url\": \"$repo_url\",
            \"type\": \"$repo_type\",
            \"commit\": \"$commit\",
            \"branch\": \"$branch\"
        }
    }"
}

# Build GitHub URLs for a specific file
build_github_urls() {
    local file="$1"
    local relative_path="${file#./}"
    local repo_context=$(get_repo_context)
    local repo_url=$(echo "$repo_context" | grep '"url"' | cut -d'"' -f4)
    local commit=$(echo "$repo_context" | grep '"commit"' | cut -d'"' -f4)
    local branch=$(echo "$repo_context" | grep '"branch"' | cut -d'"' -f4)
    
    cat << EOF
{
    "file": "$relative_path",
    "urls": {
        "github_blob": "$repo_url/blob/$commit/$relative_path",
        "github_blame": "$repo_url/blame/$commit/$relative_path",
        "github_history": "$repo_url/commits/$branch/$relative_path",
        "github_raw": "$repo_url/raw/$commit/$relative_path"
    },
    "metadata": {
        "commit": "$commit",
        "commit_short": "${commit:0:8}",
        "branch": "$branch",
        "line_count": $(wc -l < "$file" 2>/dev/null || echo 0),
        "file_size": $(wc -c < "$file" 2>/dev/null || echo 0),
        "last_modified": "$(git log -1 --format="%ai" -- "$file" 2>/dev/null || echo "unknown")",
        "last_author": "$(git log -1 --format="%an" -- "$file" 2>/dev/null || echo "unknown")",
        "last_commit_message": "$(git log -1 --format="%s" -- "$file" 2>/dev/null || echo "unknown")"
    }
}
EOF
}

# Extract line ranges for specific TypeScript constructs
extract_line_ranges() {
    local file="$1"
    local relative_path="${file#./}"
    
    log "Extracting line ranges for $relative_path"
    
    # Find interfaces with line numbers
    local interfaces=$(grep -n "^export interface" "$file" 2>/dev/null || true)
    local types=$(grep -n "^export type" "$file" 2>/dev/null || true)
    local schemas=$(grep -n "Schema = z\." "$file" 2>/dev/null || true)
    
    cat << EOF
{
    "file": "$relative_path",
    "constructs": {
        "interfaces": [
$(if [[ -n "$interfaces" ]]; then
    echo "$interfaces" | while IFS=':' read -r line_num definition; do
        local name=$(echo "$definition" | sed 's/export interface //' | cut -d' ' -f1)
        echo "            {\"name\": \"$name\", \"line\": $line_num, \"type\": \"interface\"},"
    done | sed '$ s/,$//'
fi)
        ],
        "types": [
$(if [[ -n "$types" ]]; then
    echo "$types" | while IFS=':' read -r line_num definition; do
        local name=$(echo "$definition" | sed 's/export type //' | cut -d' ' -f1)
        echo "            {\"name\": \"$name\", \"line\": $line_num, \"type\": \"type\"},"
    done | sed '$ s/,$//'
fi)
        ],
        "schemas": [
$(if [[ -n "$schemas" ]]; then
    echo "$schemas" | while IFS=':' read -r line_num definition; do
        local name=$(echo "$definition" | sed 's/export const //' | cut -d' ' -f1)
        echo "            {\"name\": \"$name\", \"line\": $line_num, \"type\": \"schema\"},"
    done | sed '$ s/,$//'
fi)
        ]
    }
}
EOF
}

# Generate attribution with line-level GitHub links
generate_enhanced_attribution() {
    local file="$1"
    local urls=$(build_github_urls "$file")
    local line_ranges=$(extract_line_ranges "$file")
    local repo_context=$(get_repo_context)
    
    # Merge all the JSON data
    cat << EOF
{
    "attribution": $(echo "$urls"),
    "line_ranges": $(echo "$line_ranges"),
    "repository": $(echo "$repo_context" | jq '.repository'),
    "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Create public/private documentation versions
create_dual_documentation() {
    local file="$1"
    local relative_path="${file#./}"
    local output_dir="./docs/git-generated"
    
    # Generate enhanced attribution
    local attribution=$(generate_enhanced_attribution "$file")
    
    # Create public version (no sensitive paths)
    local public_doc="$output_dir/public_$(echo "$relative_path" | tr '/' '_').md"
    cat > "$public_doc" << EOF
# Public API Documentation: $(basename "$relative_path")

**Auto-generated from repository**  
**File**: \`$relative_path\`  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Overview

This file contains TypeScript definitions for the InternetFriends API system.

## Type Definitions

\`\`\`typescript
$(extract_typescript_definitions "$file" | sed 's/\[0;34m\[git-docs\]\[0m.*//g')
\`\`\`

## Source Information

\`\`\`json
$(echo "$attribution" | jq '.attribution.metadata')
\`\`\`

---
*This is public documentation. For detailed source access, contact the development team.*
EOF

    # Create private version (full attribution)
    local private_doc="$output_dir/private_$(echo "$relative_path" | tr '/' '_').md"
    cat > "$private_doc" << EOF
# Private Documentation: $relative_path

**Full Git Attribution with Source Links**  
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Direct GitHub Access

$(echo "$attribution" | jq -r '.attribution.urls | to_entries[] | "- [\(.key)](\(.value))"')

## Complete Attribution

\`\`\`json
$attribution
\`\`\`

## TypeScript Definitions with Line Numbers

\`\`\`typescript
$(cat -n "$file" | head -50)
\`\`\`

---
*Private repository access required for GitHub links.*
EOF

    success "Created dual documentation: $public_doc & $private_doc"
}

# Extract function signatures and API endpoints
extract_api_signatures() {
    local file="$1"
    local relative_path="${file#./}"
    
    log "Extracting API signatures from $relative_path"
    
    # Extract API route handlers
    if [[ "$relative_path" == *"/route.ts" ]]; then
        local handlers=$(grep -n "export.*function\|export.*async.*function" "$file" 2>/dev/null || true)
        local methods=$(grep -n "export.*GET\|export.*POST\|export.*PUT\|export.*DELETE" "$file" 2>/dev/null || true)
        
        if [[ -n "$methods" ]]; then
            echo "=== API ROUTE METHODS ==="
            echo "$methods"
        fi
        
        if [[ -n "$handlers" ]]; then
            echo "=== HANDLER FUNCTIONS ==="
            echo "$handlers"
        fi
    fi
    
    # Extract interface exports
    local exports=$(grep -n "^export" "$file" 2>/dev/null | head -20 || true)
    if [[ -n "$exports" ]]; then
        echo "=== EXPORTS ==="
        echo "$exports"
    fi
}

# Main execution
main() {
    local file="${1:-}"
    
    if [[ -z "$file" ]]; then
        error "Usage: $0 <file_path>"
        error "Example: $0 types/api.ts"
        exit 1
    fi
    
    if [[ ! -f "$file" ]]; then
        error "File not found: $file"
        exit 1
    fi
    
    log "Processing source attribution for $file"
    
    # Create output directory
    mkdir -p "./docs/git-generated"
    
    # Generate enhanced attribution
    local attribution=$(generate_enhanced_attribution "$file")
    echo "$attribution" > "./docs/git-generated/attribution_$(echo "$file" | tr '/' '_').json"
    
    # Create dual documentation
    create_dual_documentation "$file"
    
    # Extract API signatures
    extract_api_signatures "$file" > "./docs/git-generated/signatures_$(echo "$file" | tr '/' '_').txt"
    
    success "Source attribution complete for $file"
}

# Run the main function with all arguments
main "$@"