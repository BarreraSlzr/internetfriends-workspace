#!/bin/bash

# 🎭 Git LLM Helpers - InternetFriends Epic Development
# Automation scripts for LLM-friendly git workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# ============================================================================
# LLM Context Functions
# ============================================================================

# Generate comprehensive context for LLM handoff
llm_context() {
    echo -e "${PURPLE}=== DEVELOPMENT CONTEXT FOR LLM ===${NC}"
    echo -e "${BLUE}Current Branch:${NC} $(git branch --show-current)"
    echo -e "${BLUE}Last Commit:${NC} $(git log --oneline -1)"
    echo -e "${BLUE}Repository:${NC} $(basename "$(git rev-parse --show-toplevel)")"
    echo

    echo -e "${YELLOW}=== EPIC STATUS ===${NC}"
    if [[ -f "$ROOT_DIR/scripts/epic-tools/epic" ]]; then
        "$ROOT_DIR/scripts/epic-tools/epic" quick 2>/dev/null || echo "Epic tools not available"
    else
        echo "Epic tools not found"
    fi
    echo

    echo -e "${YELLOW}=== RECENT CHANGES ===${NC}"
    git status --short | head -10
    if [[ $(git status --porcelain | wc -l) -gt 10 ]]; then
        echo "... and $(( $(git status --porcelain | wc -l) - 10 )) more files"
    fi
    echo

    echo -e "${YELLOW}=== RECENT COMMITS ===${NC}"
    git log --oneline --graph -5
    echo

    echo -e "${GREEN}=== NEXT ACTIONS ===${NC}"
    echo "- Continue epic development on: $(git branch --show-current)"
    echo "- Run 'git_health' for quick status check"
    echo "- Use './scripts/epic-tools/epic dashboard' for progress"
    echo "- TypeScript check: 'bunx tsc --noEmit'"
    echo
}

# Quick git and epic health check
git_health() {
    echo -e "${PURPLE}=== EPIC HEALTH CHECK ===${NC}"

    # TypeScript check
    if bunx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript${NC}"
    else
        echo -e "${RED}❌ TypeScript errors${NC}"
    fi

    # Git status
    local changes=$(git status --porcelain | wc -l | tr -d ' ')
    if [[ $changes -eq 0 ]]; then
        echo -e "${GREEN}✅ Working tree clean${NC}"
    else
        echo -e "${YELLOW}⚠️  $changes uncommitted changes${NC}"
    fi

    # Epic progress
    local current_branch=$(git branch --show-current)
    if [[ $current_branch == epic/* ]]; then
        echo -e "${BLUE}📊 Epic branch: $current_branch${NC}"
        if [[ -f "$ROOT_DIR/scripts/epic-tools/epic" ]]; then
            "$ROOT_DIR/scripts/epic-tools/epic" progress "$current_branch" 2>/dev/null || true
        fi
    else
        echo -e "${YELLOW}⚠️  Not on epic branch${NC}"
    fi

    # Build status
    if [[ -f "$ROOT_DIR/package.json" ]] || [[ -f "$ROOT_DIR/nextjs-website/package.json" ]]; then
        echo -e "${BLUE}🔧 Build environment ready${NC}"
    fi
}

# Epic-aware git log
epic_log() {
    local count=${1:-10}
    local current_branch=$(git branch --show-current)

    echo -e "${PURPLE}=== EPIC GIT TIMELINE ===${NC}"

    if [[ $current_branch == epic/* ]]; then
        local epic_name=$(echo "$current_branch" | sed 's/epic\///' | sed 's/-v[0-9]*$//')
        echo -e "${BLUE}Epic: $epic_name${NC}"
        echo

        # Show commits related to this epic
        git log --oneline --graph --grep="$epic_name" --grep="epic" -i "$count" 2>/dev/null || \
        git log --oneline --graph -"$count"
    else
        git log --oneline --graph -"$count"
    fi
}

# Generate epic integration summary
epic_integration_ready() {
    echo -e "${PURPLE}=== EPIC INTEGRATION READINESS ===${NC}"

    local current_branch=$(git branch --show-current)
    if [[ $current_branch != epic/* ]]; then
        echo -e "${RED}❌ Not on epic branch${NC}"
        return 1
    fi

    echo -e "${BLUE}Branch: $current_branch${NC}"

    # Check for uncommitted changes
    if [[ $(git status --porcelain | wc -l) -gt 0 ]]; then
        echo -e "${RED}❌ Uncommitted changes present${NC}"
        git status --short
        return 1
    else
        echo -e "${GREEN}✅ Working tree clean${NC}"
    fi

    # Check TypeScript
    if bunx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript validation passed${NC}"
    else
        echo -e "${RED}❌ TypeScript errors present${NC}"
        return 1
    fi

    # Show commits ahead of main
    local commits_ahead=$(git rev-list --count main..HEAD 2>/dev/null || echo "unknown")
    echo -e "${BLUE}📊 Commits ahead of main: $commits_ahead${NC}"

    # Epic status
    if [[ -f "$ROOT_DIR/scripts/epic-tools/epic" ]]; then
        echo -e "${BLUE}📈 Epic Status:${NC}"
        "$ROOT_DIR/scripts/epic-tools/epic" quick 2>/dev/null || true
    fi

    echo -e "${GREEN}✅ Ready for integration${NC}"
    return 0
}

# ============================================================================
# Git Workflow Functions
# ============================================================================

# Epic-aware commit with automatic context
epic_commit() {
    local message="$1"
    if [[ -z "$message" ]]; then
        echo -e "${RED}Error: Commit message required${NC}"
        echo "Usage: epic_commit 'commit message'"
        return 1
    fi

    local current_branch=$(git branch --show-current)
    local epic_context=""

    if [[ $current_branch == epic/* ]]; then
        local epic_name=$(echo "$current_branch" | sed 's/epic\///' | sed 's/-v[0-9]*$//')
        epic_context="Epic: $epic_name"
    fi

    # Add epic context to commit message if not already present
    if [[ ! "$message" =~ Epic: ]] && [[ -n "$epic_context" ]]; then
        message="$message

$epic_context"
    fi

    git add -A
    git commit -m "$message"

    echo -e "${GREEN}✅ Committed with epic context${NC}"
}

# Push current epic branch
epic_push() {
    local current_branch=$(git branch --show-current)

    if [[ $current_branch == epic/* ]]; then
        echo -e "${BLUE}📤 Pushing epic branch: $current_branch${NC}"
        git push -u private "$current_branch"
        echo -e "${GREEN}✅ Epic branch pushed${NC}"
    else
        echo -e "${YELLOW}⚠️  Not on epic branch, using standard push${NC}"
        git push
    fi
}

# ============================================================================
# Utility Functions
# ============================================================================

# Show available commands
show_help() {
    echo -e "${PURPLE}🎭 Git LLM Helpers - Available Commands${NC}"
    echo
    echo -e "${BLUE}LLM Context:${NC}"
    echo "  llm_context        - Full development context for LLM"
    echo "  git_health         - Quick health check"
    echo "  epic_log [count]   - Epic-aware git log"
    echo
    echo -e "${BLUE}Epic Workflow:${NC}"
    echo "  epic_commit 'msg'  - Commit with epic context"
    echo "  epic_push          - Push epic branch"
    echo "  epic_integration_ready - Check if ready for merge"
    echo
    echo -e "${BLUE}Utilities:${NC}"
    echo "  show_help          - Show this help"
    echo
    echo -e "${YELLOW}Usage:${NC}"
    echo "  source scripts/git-llm-helpers.sh"
    echo "  llm_context"
}

# ============================================================================
# Auto-execution
# ============================================================================

# If script is sourced, make functions available
# If script is executed directly, show help
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    show_help
else
    echo -e "${GREEN}🎭 Git LLM Helpers loaded${NC}"
    echo "Run 'show_help' to see available commands"
fi
