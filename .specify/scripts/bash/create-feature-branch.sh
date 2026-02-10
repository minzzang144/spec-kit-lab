#!/usr/bin/env bash

# Create Feature Branch Script
#
# Creates feature branches for implementation phase from spec branches.
# Supports single mode (one feature branch) or parallel mode (User Story branches).
#
# Usage: create-feature-branch.sh [OPTIONS]
#
# OPTIONS:
#   --json              Output in JSON format
#   --mode single       Single branch for all work (default)
#   --mode parallel     Create branches per User Story
#   --story us1         Create specific User Story branch only (parallel mode)
#   --dry-run           Show what would be created without creating
#   --help, -h          Show help message
#
# EXAMPLES:
#   # Single mode - one feature branch for all tasks
#   ./create-feature-branch.sh --json --mode single
#
#   # Parallel mode - branches per User Story
#   ./create-feature-branch.sh --json --mode parallel
#
#   # Create specific User Story branch
#   ./create-feature-branch.sh --json --mode parallel --story us1
#
# BRANCH PATTERNS:
#   Single mode:   feature/#ticket-feature-name
#   Parallel mode: feature/#ticket-us1-feature-name
#                  feature/#ticket-us2-feature-name
#                  feature/#ticket-foundation-feature-name (for Phase 1-2)

set -e

# Parse command line arguments
JSON_MODE=false
MODE="single"
SPECIFIC_STORY=""
DRY_RUN=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --mode)
            shift_next=true
            ;;
        --story)
            shift_story=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --help|-h)
            cat << 'EOF'
Usage: create-feature-branch.sh [OPTIONS]

Create feature branches for implementation phase from spec branches.

OPTIONS:
  --json              Output in JSON format
  --mode single       Single branch for all work (default)
  --mode parallel     Create branches per User Story
  --story us1         Create specific User Story branch only (parallel mode)
  --dry-run           Show what would be created without creating
  --help, -h          Show this help message

EXAMPLES:
  # Single mode - one feature branch
  ./create-feature-branch.sh --json --mode single

  # Parallel mode - User Story branches
  ./create-feature-branch.sh --json --mode parallel

  # Create specific User Story branch
  ./create-feature-branch.sh --json --mode parallel --story us1

BRANCH FLOW:
  develop (stable)
    └── spec/#ticket-feature (specification)
         └── feature/#ticket-feature (implementation)
              ├── feature/#ticket-us1-feature (parallel mode)
              └── feature/#ticket-us2-feature (parallel mode)
EOF
            exit 0
            ;;
        *)
            if [[ "$shift_next" == true ]]; then
                MODE="$arg"
                shift_next=false
            elif [[ "$shift_story" == true ]]; then
                SPECIFIC_STORY="$arg"
                shift_story=false
            fi
            ;;
    esac
done

# Source common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get current branch and validate
REPO_ROOT=$(get_repo_root)
CURRENT_BRANCH=$(get_current_branch)
HAS_GIT="false"
if has_git; then
    HAS_GIT="true"
fi

# Validate we're on a spec branch
if [[ "$CURRENT_BRANCH" != spec/#* ]]; then
    echo "ERROR: Not on a spec branch. Current branch: $CURRENT_BRANCH" >&2
    echo "Feature branches must be created from spec branches (spec/#ticket-feature-name)" >&2
    exit 1
fi

# Extract ticket ID and feature name using parameter expansion (Bash 3.2 compatible)
# spec/#ticket-feature-name -> ticket, feature-name
_rest="${CURRENT_BRANCH#spec/#}"      # Remove 'spec/#' prefix
TICKET_ID="${_rest%%-*}"               # Extract ticket (before first -)
FEATURE_NAME="${_rest#*-}"             # Extract feature-name (after first -)
SPEC_BRANCH="$CURRENT_BRANCH"

# Validate extracted values
if [[ -z "$TICKET_ID" ]] || [[ -z "$FEATURE_NAME" ]]; then
    echo "ERROR: Could not parse spec branch name: $CURRENT_BRANCH" >&2
    echo "Expected format: spec/#ticket-feature-name" >&2
    exit 1
fi

# Get feature directory for tasks.md
FEATURE_DIR=$(find_feature_dir_by_prefix "$REPO_ROOT" "$CURRENT_BRANCH")
TASKS_FILE="$FEATURE_DIR/tasks.md"

# Parse User Stories from tasks.md
# Note: Uses grep/sed for Bash 3.2 compatibility instead of regex capture groups
parse_user_stories() {
    local tasks_file="$1"

    if [[ ! -f "$tasks_file" ]]; then
        echo "WARNING: tasks.md not found at $tasks_file" >&2
        return
    fi

    # Extract User Story phases: "## Phase N: User Story X - Title"
    # Use grep to find matching lines, then sed to extract the number
    grep -E '^## Phase [0-9]+: User Story [0-9]+' "$tasks_file" 2>/dev/null | \
        sed -E 's/.*User Story ([0-9]+).*/us\1/' | \
        sort -u
}

# Create a single feature branch
create_single_branch() {
    local branch_name="feature/#${TICKET_ID}-${FEATURE_NAME}"

    if [[ "$DRY_RUN" == true ]]; then
        echo "Would create branch: $branch_name (from $SPEC_BRANCH)" >&2
        echo "$branch_name"
        return 0
    fi

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name" 2>/dev/null; then
        echo "Branch already exists: $branch_name" >&2
        echo "$branch_name"
        return 0
    fi

    # Create and checkout the branch
    git checkout -b "$branch_name" "$SPEC_BRANCH" >/dev/null 2>&1
    echo "$branch_name"
}

# Create User Story branches (parallel mode)
create_parallel_branches() {
    local branches=()
    local user_stories

    # Parse user stories from tasks.md
    user_stories=$(parse_user_stories "$TASKS_FILE")

    if [[ -z "$user_stories" ]]; then
        echo "WARNING: No User Stories found in tasks.md. Creating single feature branch instead." >&2
        local branch=$(create_single_branch)
        echo "$branch"
        return 0
    fi

    # If specific story requested, only create that one
    if [[ -n "$SPECIFIC_STORY" ]]; then
        local found=false
        while IFS= read -r us; do
            if [[ "$us" == "$SPECIFIC_STORY" ]]; then
                found=true
                break
            fi
        done <<< "$user_stories"

        if [[ "$found" != true ]]; then
            echo "ERROR: User Story '$SPECIFIC_STORY' not found in tasks.md" >&2
            echo "Available stories: $(echo "$user_stories" | tr '\n' ' ')" >&2
            exit 1
        fi

        user_stories="$SPECIFIC_STORY"
    fi

    # Create branches for each User Story
    while IFS= read -r us; do
        [[ -z "$us" ]] && continue

        local branch_name="feature/#${TICKET_ID}-${us}-${FEATURE_NAME}"

        if [[ "$DRY_RUN" == true ]]; then
            echo "Would create branch: $branch_name (from $SPEC_BRANCH)" >&2
            branches+=("$branch_name")
            continue
        fi

        # Check if branch already exists
        if git show-ref --verify --quiet "refs/heads/$branch_name" 2>/dev/null; then
            echo "Branch already exists: $branch_name" >&2
            branches+=("$branch_name")
            continue
        fi

        # Create the branch (but stay on current branch)
        git branch "$branch_name" "$SPEC_BRANCH" >/dev/null 2>&1
        branches+=("$branch_name")
    done <<< "$user_stories"

    printf '%s\n' "${branches[@]}"
}

# Main execution
case "$MODE" in
    single)
        CREATED_BRANCHES=$(create_single_branch)
        ;;
    parallel)
        CREATED_BRANCHES=$(create_parallel_branches)
        ;;
    *)
        echo "ERROR: Invalid mode '$MODE'. Use 'single' or 'parallel'." >&2
        exit 1
        ;;
esac

# Output results
if $JSON_MODE; then
    # Build JSON array of branches
    json_branches=""
    while IFS= read -r branch; do
        [[ -z "$branch" ]] && continue
        if [[ -n "$json_branches" ]]; then
            json_branches="$json_branches,"
        fi
        json_branches="$json_branches\"$branch\""
    done <<< "$CREATED_BRANCHES"

    # Determine current branch after creation
    if [[ "$DRY_RUN" != true ]] && [[ "$HAS_GIT" == "true" ]]; then
        CURRENT_AFTER=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$CURRENT_BRANCH")
    else
        CURRENT_AFTER="$CURRENT_BRANCH"
    fi

    printf '{"SPEC_BRANCH":"%s","FEATURE_BRANCHES":[%s],"MODE":"%s","TICKET_ID":"%s","FEATURE_NAME":"%s","FEATURE_DIR":"%s","CURRENT_BRANCH":"%s","DRY_RUN":%s}\n' \
        "$SPEC_BRANCH" \
        "$json_branches" \
        "$MODE" \
        "$TICKET_ID" \
        "$FEATURE_NAME" \
        "$FEATURE_DIR" \
        "$CURRENT_AFTER" \
        "$DRY_RUN"
else
    echo "SPEC_BRANCH: $SPEC_BRANCH"
    echo "MODE: $MODE"
    echo "TICKET_ID: $TICKET_ID"
    echo "FEATURE_NAME: $FEATURE_NAME"
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "FEATURE_BRANCHES:"
    while IFS= read -r branch; do
        [[ -z "$branch" ]] && continue
        echo "  - $branch"
    done <<< "$CREATED_BRANCHES"

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        echo "(Dry run - no branches were created)"
    fi
fi
