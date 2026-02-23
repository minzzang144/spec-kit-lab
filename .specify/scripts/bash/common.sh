#!/usr/bin/env bash
# Common functions and variables for all scripts

# Get repository root, with fallback for non-git repositories
get_repo_root() {
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        # Fall back to script location for non-git repos
        local script_dir="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        (cd "$script_dir/../../.." && pwd)
    fi
}

# Get current branch, with fallback for non-git repositories
get_current_branch() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Then check git if available
    if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
        git rev-parse --abbrev-ref HEAD
        return
    fi

    # For non-git repos, try to find the latest feature directory
    local repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"

    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0

        for dir in "$specs_dir"/*; do
            if [[ -d "$dir" ]]; then
                local dirname=$(basename "$dir")
                # Support both new ticket-based pattern (spec/#ticket-*) and legacy pattern (###-*)
                if [[ "$dirname" =~ ^#[a-zA-Z0-9]+- ]]; then
                    # New ticket-based pattern - use as latest if found
                    # (prioritize by modification time if needed)
                    latest_feature=$dirname
                elif [[ "$dirname" =~ ^([0-9]{3})- ]]; then
                    # Legacy pattern - track highest number
                    local number=${BASH_REMATCH[1]}
                    number=$((10#$number))
                    if [[ "$number" -gt "$highest" ]]; then
                        highest=$number
                        latest_feature=$dirname
                    fi
                fi
            fi
        done

        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return
        fi
    fi

    echo "main"  # Final fallback
}

# Check if we have git available
has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

check_feature_branch() {
    local branch="$1"
    local has_git_repo="$2"

    # For non-git repos, we can't enforce branch naming but still provide output
    if [[ "$has_git_repo" != "true" ]]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    # Support all valid workflow branch patterns:
    # - spec/#ticket-* (specification phase)
    # - feature/#ticket-* (implementation phase)
    # - feature/#ticket-base-* (implementation phase - base cycle)
    # - feature/#ticket-us{N}-* (implementation phase - US cycle)
    # - ###-* (legacy pattern)
    if [[ "$branch" =~ ^spec/#[a-zA-Z0-9]+- ]] || \
       [[ "$branch" =~ ^feature/#[a-zA-Z0-9]+- ]] || \
       [[ "$branch" =~ ^[0-9]{3}- ]]; then
        return 0
    fi

    echo "ERROR: Not on a valid workflow branch. Current branch: $branch" >&2
    echo "Valid branch patterns:" >&2
    echo "  - spec/#ticket-feature-name (specification phase)" >&2
    echo "  - feature/#ticket-base-feature-name (base cycle)" >&2
    echo "  - feature/#ticket-us1-feature-name (US cycle)" >&2
    echo "  - 001-feature-name (legacy)" >&2
    return 1
}

get_feature_dir() { echo "$1/specs/$2"; }

# Find feature directory by ticket ID or numeric prefix
# Supports all branch patterns:
#   - spec/#ticket-* (spec branch)
#   - feature/#ticket-base-* (base cycle branch)
#   - feature/#ticket-us{N}-* (US cycle branch)
#   - feature/#ticket-* (generic feature branch)
#   - ###-* (legacy pattern)
# Note: Uses parameter expansion for Bash 3.2 compatibility
find_feature_dir_by_prefix() {
    local repo_root="$1"
    local branch_name="$2"
    local specs_dir="$repo_root/specs"

    # Helper function: find specs directory by ticket ID
    _find_specs_by_ticket() {
        local ticket_id="$1"
        local first_match=""
        local match_count=0

        if [[ -d "$specs_dir" ]]; then
            # Check if any matching directory exists first
            local pattern="$specs_dir/#${ticket_id}-"*
            for dir in $pattern; do
                # Check if glob expanded (file/dir exists)
                if [[ -d "$dir" ]]; then
                    if [[ $match_count -eq 0 ]]; then
                        first_match="$(basename "$dir")"
                    fi
                    match_count=$((match_count + 1))
                fi
            done
        fi

        if [[ $match_count -eq 1 ]]; then
            echo "$specs_dir/$first_match"
            return 0
        elif [[ $match_count -gt 1 ]]; then
            echo "ERROR: Multiple spec directories found with ticket '$ticket_id'" >&2
            echo "Please ensure only one spec directory exists per ticket ID." >&2
            echo "$specs_dir/$first_match"  # Return first match
            return 0
        fi
        return 1
    }

    # Extract ticket ID from spec or feature branch using parameter expansion
    # Patterns: spec/#ticket-* or feature/#ticket-*
    _extract_ticket_id() {
        local branch="$1"
        local rest=""

        if [[ "$branch" == spec/#* ]]; then
            rest="${branch#spec/#}"
        elif [[ "$branch" == feature/#* ]]; then
            rest="${branch#feature/#}"
        else
            return 1
        fi

        # Extract ticket ID (everything before first hyphen)
        local ticket="${rest%%-*}"
        if [[ -n "$ticket" ]]; then
            echo "$ticket"
            return 0
        fi
        return 1
    }

    # 1. Check for spec or feature branch patterns: (spec|feature)/#ticket-*
    if [[ "$branch_name" == spec/#* ]] || [[ "$branch_name" == feature/#* ]]; then
        local ticket_id
        ticket_id=$(_extract_ticket_id "$branch_name")

        if [[ -n "$ticket_id" ]]; then
            # Try to find existing specs directory
            local found_dir
            found_dir=$(_find_specs_by_ticket "$ticket_id")
            if [[ $? -eq 0 ]]; then
                echo "$found_dir"
                return
            fi

            # No match found - derive directory name from branch name
            if [[ "$branch_name" == spec/* ]]; then
                # spec/#ticket-feature -> #ticket-feature
                local dir_name="${branch_name#spec/}"
                echo "$specs_dir/$dir_name"
            else
                # For feature branches without existing spec dir, construct from ticket
                echo "$specs_dir/#${ticket_id}-unknown"
            fi
            return
        fi
    fi

    # 2. Legacy: Extract numeric prefix from branch (e.g., "004" from "004-whatever")
    # Check if starts with 3 digits followed by hyphen
    local first_four="${branch_name:0:4}"
    if [[ "$first_four" =~ ^[0-9]{3}- ]]; then
        local prefix="${branch_name:0:3}"

        # Search for directories in specs/ that start with this prefix
        local first_match=""
        local match_count=0
        if [[ -d "$specs_dir" ]]; then
            local pattern="$specs_dir/${prefix}-"*
            for dir in $pattern; do
                if [[ -d "$dir" ]]; then
                    if [[ $match_count -eq 0 ]]; then
                        first_match="$(basename "$dir")"
                    fi
                    match_count=$((match_count + 1))
                fi
            done
        fi

        # Handle results
        if [[ $match_count -eq 0 ]]; then
            echo "$specs_dir/$branch_name"
        elif [[ $match_count -eq 1 ]]; then
            echo "$specs_dir/$first_match"
        else
            echo "ERROR: Multiple spec directories found with prefix '$prefix'" >&2
            echo "Please ensure only one spec directory exists per numeric prefix." >&2
            echo "$specs_dir/$branch_name"
        fi
        return
    fi

    # 3. Fallback: exact match
    echo "$specs_dir/$branch_name"
}

get_feature_paths() {
    local repo_root=$(get_repo_root)
    local current_branch=$(get_current_branch)
    local has_git_repo="false"

    if has_git; then
        has_git_repo="true"
    fi

    # Use prefix-based lookup to support multiple branches per spec
    local feature_dir=$(find_feature_dir_by_prefix "$repo_root" "$current_branch")

    cat <<EOF
REPO_ROOT='$repo_root'
CURRENT_BRANCH='$current_branch'
HAS_GIT='$has_git_repo'
FEATURE_DIR='$feature_dir'
FEATURE_SPEC='$feature_dir/spec.md'
IMPL_PLAN='$feature_dir/plan.md'
TASKS='$feature_dir/tasks.md'
RESEARCH='$feature_dir/research.md'
DATA_MODEL='$feature_dir/data-model.md'
QUICKSTART='$feature_dir/quickstart.md'
CONTRACTS_DIR='$feature_dir/contracts'
EOF
}

check_file() { [[ -f "$1" ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
check_dir() { [[ -d "$1" && -n $(ls -A "$1" 2>/dev/null) ]] && echo "  ✓ $2" || echo "  ✗ $2"; }

# Extract ticket ID from branch name
# Supports both new ticket-based (spec/#ticket-*) and legacy (###-*) patterns
extract_ticket_id() {
    local branch_name="$1"
    if [[ "$branch_name" =~ ^spec/#([a-zA-Z0-9]+)- ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ "$branch_name" =~ ^([0-9]{3})- ]]; then
        # Legacy pattern: return the numeric prefix
        echo "${BASH_REMATCH[1]}"
    fi
}

# Check if branch uses the new ticket-based naming convention
is_ticket_based_branch() {
    [[ "$1" =~ ^spec/#[a-zA-Z0-9]+- ]]
}

# ============================================================================
# Feature Branch Utilities
# ============================================================================

# Check if branch is a feature branch
# Supports: feature/#ticket-*, feature/#ticket-base-*, feature/#ticket-us{N}-*
is_feature_branch() {
    [[ "$1" == feature/#* ]]
}

# Extract ticket ID from feature branch name
# Examples:
#   feature/#abc123-user-auth -> abc123
#   feature/#abc123-base-user-auth -> abc123
#   feature/#abc123-us1-user-auth -> abc123
# Note: Uses parameter expansion for Bash 3.2 compatibility (macOS default)
extract_ticket_from_feature() {
    local branch_name="$1"
    # Check if it's a feature branch
    if [[ "$branch_name" != feature/#* ]]; then
        return 1
    fi
    # Remove 'feature/#' prefix
    local rest="${branch_name#feature/#}"
    # Extract up to first hyphen (ticket ID)
    local ticket_id="${rest%%-*}"
    # Validate it's alphanumeric
    if [[ "$ticket_id" =~ ^[a-zA-Z0-9]+$ ]]; then
        echo "$ticket_id"
    fi
}

# Extract cycle name from feature branch name (if present)
# Examples:
#   feature/#abc123-base-user-auth -> base
#   feature/#abc123-us1-user-auth -> us1
#   feature/#abc123-us2-user-auth -> us2
#   feature/#abc123-user-auth -> (empty)
# Note: Uses parameter expansion for Bash 3.2 compatibility
extract_cycle() {
    local branch_name="$1"
    # Check if it's a feature branch
    if [[ "$branch_name" != feature/#* ]]; then
        return 1
    fi
    # Remove 'feature/#' prefix and ticket ID
    local rest="${branch_name#feature/#}"
    rest="${rest#*-}"  # Remove ticket ID (before first -)

    # Check for cycle prefixes
    if [[ "$rest" == base-* ]]; then
        echo "base"
    elif [[ "$rest" == us[0-9]* ]]; then
        # Extract 'usN' part
        local us_part="${rest%%-*}"
        echo "$us_part"
    fi
}

# Legacy alias for backward compatibility
extract_user_story() {
    extract_cycle "$@"
}

# Get corresponding spec branch from feature branch
# Examples:
#   feature/#abc123-user-auth -> spec/#abc123-user-auth
#   feature/#abc123-us1-user-auth -> spec/#abc123-user-auth
get_spec_branch_from_feature() {
    local feature_branch="$1"
    local repo_root="${2:-$(get_repo_root)}"
    local ticket_id=$(extract_ticket_from_feature "$feature_branch")

    if [ -n "$ticket_id" ]; then
        # Search specs/ directory for matching spec
        for dir in "$repo_root/specs/#${ticket_id}-"*; do
            if [ -d "$dir" ]; then
                local dirname=$(basename "$dir")
                echo "spec/$dirname"
                return 0
            fi
        done
    fi
    return 1
}

# Check if current branch is valid for workflow (spec or feature branch)
is_valid_workflow_branch() {
    local branch="$1"
    is_ticket_based_branch "$branch" || is_feature_branch "$branch" || [[ "$branch" =~ ^[0-9]{3}- ]]
}

