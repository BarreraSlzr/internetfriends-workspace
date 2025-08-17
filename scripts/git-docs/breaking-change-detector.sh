#!/bin/bash
# Breaking Change Detection System
# Analyzes Git diffs for TypeScript interfaces, Zod schemas, and API changes

set -euo pipefail

# Configuration
BREAKING_CHANGE_PATTERNS=(
    # Interface changes
    "interface.*{.*}"
    "export interface"
    
    # Type changes
    "export type.*="
    "type.*=.*"
    
    # Zod schema changes
    "Schema = z\."
    "\.z\."
    "zod.*schema"
    
    # API endpoint changes
    "export.*GET\|POST\|PUT\|DELETE"
    "NextRequest\|NextResponse"
    "route\.ts"
    
    # Function signature changes
    "function.*("
    "async function"
    "export.*function"
)

# Severity levels for different change types
SEVERITY_MAP=(
    ["interface_removal"]="CRITICAL"
    ["interface_field_removal"]="HIGH"
    ["interface_field_type_change"]="HIGH"
    ["schema_validation_change"]="HIGH"
    ["api_endpoint_removal"]="CRITICAL"
    ["api_method_change"]="HIGH"
    ["type_definition_change"]="MEDIUM"
    ["export_removal"]="HIGH"
    ["function_signature_change"]="MEDIUM"
)

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[breaking-detect]${NC} $1"; }
warn() { echo -e "${YELLOW}[breaking-detect]${NC} $1"; }
error() { echo -e "${RED}[breaking-detect]${NC} $1"; }
success() { echo -e "${GREEN}[breaking-detect]${NC} $1"; }
critical() { echo -e "${RED}[breaking-detect CRITICAL]${NC} $1"; }

# Get diff between commits
get_git_diff() {
    local from_commit="${1:-HEAD~1}"
    local to_commit="${2:-HEAD}"
    local file_pattern="${3:-}"
    
    if [[ -n "$file_pattern" ]]; then
        git diff "$from_commit..$to_commit" -- "$file_pattern" 2>/dev/null || echo ""
    else
        git diff "$from_commit..$to_commit" 2>/dev/null || echo ""
    fi
}

# Analyze interface changes
analyze_interface_changes() {
    local diff_content="$1"
    local file_path="$2"
    
    log "Analyzing interface changes in $file_path"
    
    local breaking_changes=()
    
    # Check for removed interfaces
    local removed_interfaces=$(echo "$diff_content" | grep "^-.*export interface" | sed 's/^-//' || true)
    if [[ -n "$removed_interfaces" ]]; then
        while IFS= read -r line; do
            local interface_name=$(echo "$line" | sed 's/export interface //' | cut -d' ' -f1 | cut -d'<' -f1)
            breaking_changes+=("{\"type\": \"interface_removal\", \"severity\": \"CRITICAL\", \"interface\": \"$interface_name\", \"change\": \"$line\"}")
        done <<< "$removed_interfaces"
    fi
    
    # Check for modified interface fields
    local interface_context=""
    while IFS= read -r line; do
        if [[ "$line" =~ ^[-+].*export\ interface ]]; then
            interface_context=$(echo "$line" | sed 's/^[-+]//' | sed 's/export interface //' | cut -d' ' -f1 | cut -d'<' -f1)
        elif [[ "$line" =~ ^-.*:.*$ ]] && [[ -n "$interface_context" ]]; then
            local field_name=$(echo "$line" | sed 's/^-//' | sed 's/[[:space:]]*//' | cut -d':' -f1)
            breaking_changes+=("{\"type\": \"interface_field_removal\", \"severity\": \"HIGH\", \"interface\": \"$interface_context\", \"field\": \"$field_name\", \"change\": \"$line\"}")
        fi
    done <<< "$diff_content"
    
    printf '%s\n' "${breaking_changes[@]}"
}

# Analyze Zod schema changes
analyze_schema_changes() {
    local diff_content="$1"
    local file_path="$2"
    
    log "Analyzing Zod schema changes in $file_path"
    
    local breaking_changes=()
    
    # Check for schema validation changes
    local schema_changes=$(echo "$diff_content" | grep -E "^[-+].*Schema = z\.|^[-+].*\.z\." || true)
    if [[ -n "$schema_changes" ]]; then
        while IFS= read -r line; do
            if [[ "$line" =~ ^-.*Schema ]]; then
                local schema_name=$(echo "$line" | sed 's/^-.*export const //' | cut -d' ' -f1)
                breaking_changes+=("{\"type\": \"schema_validation_change\", \"severity\": \"HIGH\", \"schema\": \"$schema_name\", \"change\": \"removed\", \"line\": \"$line\"}")
            elif [[ "$line" =~ ^+.*Schema ]]; then
                local schema_name=$(echo "$line" | sed 's/^+.*export const //' | cut -d' ' -f1)
                breaking_changes+=("{\"type\": \"schema_validation_change\", \"severity\": \"MEDIUM\", \"schema\": \"$schema_name\", \"change\": \"added\", \"line\": \"$line\"}")
            fi
        done <<< "$schema_changes"
    fi
    
    printf '%s\n' "${breaking_changes[@]}"
}

# Analyze API endpoint changes
analyze_api_changes() {
    local diff_content="$1"
    local file_path="$2"
    
    if [[ "$file_path" != *"/route.ts" ]]; then
        return 0
    fi
    
    log "Analyzing API endpoint changes in $file_path"
    
    local breaking_changes=()
    
    # Check for removed HTTP methods
    local removed_methods=$(echo "$diff_content" | grep "^-.*export.*\(GET\|POST\|PUT\|DELETE\|PATCH\)" || true)
    if [[ -n "$removed_methods" ]]; then
        while IFS= read -r line; do
            local method=$(echo "$line" | grep -o '\(GET\|POST\|PUT\|DELETE\|PATCH\)')
            breaking_changes+=("{\"type\": \"api_endpoint_removal\", \"severity\": \"CRITICAL\", \"method\": \"$method\", \"file\": \"$file_path\", \"change\": \"$line\"}")
        done <<< "$removed_methods"
    fi
    
    # Check for changed function signatures
    local signature_changes=$(echo "$diff_content" | grep -E "^[-+].*function.*\(|^[-+].*async.*function.*\(" || true)
    if [[ -n "$signature_changes" ]]; then
        local change_pairs=""
        while IFS= read -r line; do
            if [[ "$line" =~ ^- ]]; then
                change_pairs="$change_pairs$line\n"
            elif [[ "$line" =~ ^+ ]] && [[ -n "$change_pairs" ]]; then
                breaking_changes+=("{\"type\": \"function_signature_change\", \"severity\": \"MEDIUM\", \"file\": \"$file_path\", \"old\": \"$(echo "$change_pairs" | tail -1)\", \"new\": \"$line\"}")
                change_pairs=""
            fi
        done <<< "$signature_changes"
    fi
    
    printf '%s\n' "${breaking_changes[@]}"
}

# Generate comprehensive breaking change report
generate_breaking_change_report() {
    local from_commit="${1:-HEAD~1}"
    local to_commit="${2:-HEAD}"
    local target_files="${3:-types/*.ts schemas/*.ts nextjs-website/app/api/*/route.ts app/api/*/route.ts}"
    
    log "Generating breaking change report from $from_commit to $to_commit"
    
    local report_file="./docs/git-generated/breaking-changes-$(date +%Y%m%d-%H%M%S).json"
    local all_changes=()
    
    # Analyze each file type
    for pattern in $target_files; do
        for file in $(find . -path "./$pattern" -type f 2>/dev/null || true); do
            if [[ -f "$file" ]]; then
                local relative_path="${file#./}"
                local diff_content=$(get_git_diff "$from_commit" "$to_commit" "$file")
                
                if [[ -n "$diff_content" ]]; then
                    log "Analyzing changes in $relative_path"
                    
                    # Analyze different types of changes
                    local interface_changes=($(analyze_interface_changes "$diff_content" "$relative_path"))
                    local schema_changes=($(analyze_schema_changes "$diff_content" "$relative_path"))
                    local api_changes=($(analyze_api_changes "$diff_content" "$relative_path"))
                    
                    # Combine all changes for this file
                    for change in "${interface_changes[@]}" "${schema_changes[@]}" "${api_changes[@]}"; do
                        if [[ -n "$change" ]]; then
                            # Add file context to the change
                            local enhanced_change=$(echo "$change" | sed "s/}/,\"file\":\"$relative_path\",\"commit_range\":\"$from_commit..$to_commit\",\"detected_at\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}/")
                            all_changes+=("$enhanced_change")
                        fi
                    done
                fi
            fi
        done
    done
    
    # Create comprehensive report
    local report_content="{
        \"analysis\": {
            \"from_commit\": \"$from_commit\",
            \"to_commit\": \"$to_commit\",
            \"analyzed_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
            \"total_breaking_changes\": ${#all_changes[@]},
            \"repository\": \"$(git config --get remote.origin.url | sed 's/\.git$//')\",
            \"branch\": \"$(git branch --show-current)\"
        },
        \"breaking_changes\": ["
    
    # Add all changes
    for i in "${!all_changes[@]}"; do
        report_content+="${all_changes[$i]}"
        if [[ $i -lt $((${#all_changes[@]} - 1)) ]]; then
            report_content+=","
        fi
    done
    
    report_content+="],
        \"summary\": {
            \"critical\": $(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"CRITICAL\"' || echo 0),
            \"high\": $(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"HIGH\"' || echo 0),
            \"medium\": $(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"MEDIUM\"' || echo 0)
        }
    }"
    
    echo "$report_content" > "$report_file"
    
    # Display summary
    local critical_count=$(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"CRITICAL\"' || echo 0)
    local high_count=$(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"HIGH\"' || echo 0)
    local medium_count=$(printf '%s\n' "${all_changes[@]}" | grep -c '\"severity\":\"MEDIUM\"' || echo 0)
    
    echo ""
    echo "🔍 BREAKING CHANGE ANALYSIS COMPLETE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ $critical_count -gt 0 ]]; then
        critical "🚨 CRITICAL: $critical_count breaking changes found"
    fi
    
    if [[ $high_count -gt 0 ]]; then
        error "⚠️  HIGH: $high_count potentially breaking changes"
    fi
    
    if [[ $medium_count -gt 0 ]]; then
        warn "📋 MEDIUM: $medium_count changes requiring attention"
    fi
    
    if [[ $((critical_count + high_count + medium_count)) -eq 0 ]]; then
        success "✅ No breaking changes detected"
    fi
    
    success "Report saved: $report_file"
    
    return $critical_count
}

# Main function
main() {
    local command="${1:-analyze}"
    local from_commit="${2:-HEAD~1}"
    local to_commit="${3:-HEAD}"
    
    case "$command" in
        "analyze")
            if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
                error "Not in a Git repository!"
                exit 1
            fi
            
            generate_breaking_change_report "$from_commit" "$to_commit"
            ;;
        "watch")
            log "Starting breaking change monitoring..."
            while true; do
                generate_breaking_change_report "HEAD~1" "HEAD"
                sleep 60
            done
            ;;
        "help"|*)
            echo "Usage: $0 [analyze|watch] [from_commit] [to_commit]"
            echo "Commands:"
            echo "  analyze  - Analyze breaking changes between commits (default)"
            echo "  watch    - Continuously monitor for breaking changes"
            echo ""
            echo "Examples:"
            echo "  $0 analyze HEAD~5 HEAD"
            echo "  $0 analyze main develop"
            echo "  $0 watch"
            ;;
    esac
}

main "$@"