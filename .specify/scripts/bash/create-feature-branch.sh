#!/usr/bin/env bash

# Create Feature Branch Script
#
# Creates a feature branch for one implementation cycle.
# Uses Stacked PR pattern: spec ← base ← us1 ← us2 ...
#
# Usage: create-feature-branch.sh [OPTIONS]
#
# OPTIONS:
#   --json              Output in JSON format
#   --cycle <name>      Cycle name: base, us1, us2, ... (required)
#   --from <branch>     Branch to fork from (default: current branch)
#   --dry-run           Show what would be created without creating
#   --help, -h          Show help message
#
# EXAMPLES:
#   # base cycle: fork from spec branch
#   ./create-feature-branch.sh --json --cycle base
#
#   # us1 cycle: fork from base branch
#   ./create-feature-branch.sh --json --cycle us1 --from feature/#ticket-base-feature
#
#   # us2 cycle: fork from us1 branch
#   ./create-feature-branch.sh --json --cycle us2 --from feature/#ticket-us1-feature
#
# BRANCH PATTERNS (Stacked PR):
#   spec/#ticket-feature
#     ← feature/#ticket-base-feature     (Phase 1+2: Setup + Foundation)
#        ← feature/#ticket-us1-feature   (Phase 3: US1)
#           ← feature/#ticket-us2-feature (Phase 4: US2)

set -e

# Parse command line arguments
JSON_MODE=false
CYCLE=""
FROM_BRANCH=""
DRY_RUN=false

shift_next=""
for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --cycle)
            shift_next="cycle"
            ;;
        --from)
            shift_next="from"
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --help|-h)
            cat << 'EOF'
Usage: create-feature-branch.sh [OPTIONS]

Create a feature branch for one implementation cycle.
Uses Stacked PR pattern: spec ← base ← us1 ← us2 ...

OPTIONS:
  --json              Output in JSON format
  --cycle <name>      Cycle name: base, us1, us2, ... (required)
  --from <branch>     Branch to fork from (default: current branch)
  --dry-run           Show what would be created without creating
  --help, -h          Show this help message

EXAMPLES:
  # base cycle: fork from spec branch (current branch)
  ./create-feature-branch.sh --json --cycle base

  # us1 cycle: fork from base branch
  ./create-feature-branch.sh --json --cycle us1 --from feature/#ticket-base-feature

  # us2 cycle: fork from us1 branch
  ./create-feature-branch.sh --json --cycle us2 --from feature/#ticket-us1-feature

BRANCH FLOW (Stacked PR):
  spec/#ticket-feature (specification)
    ← feature/#ticket-base-feature (Phase 1+2)
       ← feature/#ticket-us1-feature (Phase 3: US1)
          ← feature/#ticket-us2-feature (Phase 4: US2)
EOF
            exit 0
            ;;
        *)
            if [[ "$shift_next" == "cycle" ]]; then
                CYCLE="$arg"
                shift_next=""
            elif [[ "$shift_next" == "from" ]]; then
                FROM_BRANCH="$arg"
                shift_next=""
            fi
            ;;
    esac
done

# Validate --cycle is provided
if [[ -z "$CYCLE" ]]; then
    echo "ERROR: --cycle is required. Use --cycle base, --cycle us1, --cycle us2, etc." >&2
    exit 1
fi

# Validate cycle name format: 'base' or 'us' followed by number
if [[ "$CYCLE" != "base" ]] && ! echo "$CYCLE" | grep -qE '^us[0-9]+$'; then
    echo "ERROR: Invalid cycle name '$CYCLE'. Use 'base', 'us1', 'us2', etc." >&2
    exit 1
fi

# Source common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get current branch and repo info
REPO_ROOT=$(get_repo_root)
CURRENT_BRANCH=$(get_current_branch)
HAS_GIT="false"
if has_git; then
    HAS_GIT="true"
fi

# Determine the source branch to fork from
if [[ -n "$FROM_BRANCH" ]]; then
    SOURCE_BRANCH="$FROM_BRANCH"
else
    SOURCE_BRANCH="$CURRENT_BRANCH"
fi

# Extract ticket ID and feature name
# Supports both spec/#ticket-* and feature/#ticket-* branches
extract_info_from_branch() {
    local branch="$1"
    local rest=""

    if [[ "$branch" == spec/#* ]]; then
        rest="${branch#spec/#}"
    elif [[ "$branch" == feature/#* ]]; then
        rest="${branch#feature/#}"
    else
        echo "ERROR: Cannot extract ticket info from branch: $branch" >&2
        echo "Expected spec/#ticket-* or feature/#ticket-* pattern" >&2
        return 1
    fi

    # Extract ticket ID (before first hyphen)
    local ticket="${rest%%-*}"
    # Extract feature name: remove ticket ID prefix, then remove cycle prefix if present
    local after_ticket="${rest#*-}"

    # Strip cycle prefixes (base-, us1-, us2-, etc.) to get pure feature name
    local feature_name="$after_ticket"
    if [[ "$feature_name" == base-* ]]; then
        feature_name="${feature_name#base-}"
    elif echo "$feature_name" | grep -qE '^us[0-9]+-'; then
        feature_name="${feature_name#us[0-9]*-}"
        # Bash 3.2 compatible: use sed to strip usN- prefix
        feature_name=$(echo "$after_ticket" | sed -E 's/^us[0-9]+-//')
    fi

    echo "$ticket" "$feature_name"
}

# Try to extract from current branch first, then from source branch
BRANCH_INFO=""
if [[ "$CURRENT_BRANCH" == spec/#* ]]; then
    BRANCH_INFO=$(extract_info_from_branch "$CURRENT_BRANCH")
elif [[ "$CURRENT_BRANCH" == feature/#* ]]; then
    BRANCH_INFO=$(extract_info_from_branch "$CURRENT_BRANCH")
elif [[ -n "$FROM_BRANCH" ]]; then
    BRANCH_INFO=$(extract_info_from_branch "$FROM_BRANCH")
fi

if [[ -z "$BRANCH_INFO" ]]; then
    echo "ERROR: Could not determine ticket ID and feature name." >&2
    echo "Must be on a spec/#ticket-* or feature/#ticket-* branch, or use --from." >&2
    exit 1
fi

# Parse ticket ID and feature name from extracted info
TICKET_ID=$(echo "$BRANCH_INFO" | cut -d' ' -f1)
FEATURE_NAME=$(echo "$BRANCH_INFO" | cut -d' ' -f2-)

# Validate extracted values
if [[ -z "$TICKET_ID" ]] || [[ -z "$FEATURE_NAME" ]]; then
    echo "ERROR: Could not parse branch name." >&2
    echo "Ticket ID: '$TICKET_ID', Feature Name: '$FEATURE_NAME'" >&2
    exit 1
fi

# Determine spec branch for reference
if [[ "$CURRENT_BRANCH" == spec/#* ]]; then
    SPEC_BRANCH="$CURRENT_BRANCH"
else
    # Try to find spec branch from ticket ID
    SPEC_BRANCH=$(get_spec_branch_from_feature "$CURRENT_BRANCH" "$REPO_ROOT" 2>/dev/null || echo "spec/#${TICKET_ID}-${FEATURE_NAME}")
fi

# Get feature directory
FEATURE_DIR=$(find_feature_dir_by_prefix "$REPO_ROOT" "$CURRENT_BRANCH")

# Build branch name based on cycle
BRANCH_NAME="feature/#${TICKET_ID}-${CYCLE}-${FEATURE_NAME}"

# Determine PR base branch for this cycle
case "$CYCLE" in
    base)
        PR_BASE="$SPEC_BRANCH"
        ;;
    us1)
        PR_BASE="feature/#${TICKET_ID}-base-${FEATURE_NAME}"
        ;;
    *)
        # us2 → us1, us3 → us2, etc.
        local_cycle_num="${CYCLE#us}"
        prev_num=$((local_cycle_num - 1))
        PR_BASE="feature/#${TICKET_ID}-us${prev_num}-${FEATURE_NAME}"
        ;;
esac

# Create the branch
if [[ "$DRY_RUN" == true ]]; then
    echo "Would create branch: $BRANCH_NAME (from $SOURCE_BRANCH)" >&2
    echo "PR base would be: $PR_BASE" >&2
    CREATED_BRANCH="$BRANCH_NAME"
else
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
        echo "Branch already exists: $BRANCH_NAME — switching to it" >&2
        git checkout "$BRANCH_NAME" >/dev/null 2>&1
        CREATED_BRANCH="$BRANCH_NAME"
    else
        # Verify source branch exists
        if [[ "$SOURCE_BRANCH" != "$CURRENT_BRANCH" ]]; then
            if ! git show-ref --verify --quiet "refs/heads/$SOURCE_BRANCH" 2>/dev/null; then
                echo "ERROR: Source branch '$SOURCE_BRANCH' does not exist." >&2
                exit 1
            fi
        fi

        # Create and checkout the branch
        git checkout -b "$BRANCH_NAME" "$SOURCE_BRANCH" >/dev/null 2>&1
        CREATED_BRANCH="$BRANCH_NAME"
    fi
fi

# Output results
if $JSON_MODE; then
    # Determine current branch after creation
    if [[ "$DRY_RUN" != true ]] && [[ "$HAS_GIT" == "true" ]]; then
        CURRENT_AFTER=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$CURRENT_BRANCH")
    else
        CURRENT_AFTER="$CURRENT_BRANCH"
    fi

    printf '{"SPEC_BRANCH":"%s","FEATURE_BRANCH":"%s","CYCLE":"%s","PR_BASE":"%s","SOURCE_BRANCH":"%s","TICKET_ID":"%s","FEATURE_NAME":"%s","FEATURE_DIR":"%s","CURRENT_BRANCH":"%s","DRY_RUN":%s}\n' \
        "$SPEC_BRANCH" \
        "$CREATED_BRANCH" \
        "$CYCLE" \
        "$PR_BASE" \
        "$SOURCE_BRANCH" \
        "$TICKET_ID" \
        "$FEATURE_NAME" \
        "$FEATURE_DIR" \
        "$CURRENT_AFTER" \
        "$DRY_RUN"
else
    echo "SPEC_BRANCH: $SPEC_BRANCH"
    echo "CYCLE: $CYCLE"
    echo "FEATURE_BRANCH: $CREATED_BRANCH"
    echo "PR_BASE: $PR_BASE"
    echo "SOURCE_BRANCH: $SOURCE_BRANCH"
    echo "TICKET_ID: $TICKET_ID"
    echo "FEATURE_NAME: $FEATURE_NAME"
    echo "FEATURE_DIR: $FEATURE_DIR"

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        echo "(Dry run — no branch was created)"
    fi
fi
