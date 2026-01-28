#!/usr/bin/env bash

set -e

JSON_MODE=false
SHORT_NAME=""
BRANCH_NUMBER=""
TICKET_ID=""
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json) 
            JSON_MODE=true 
            ;;
        --short-name)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            # Check if the next argument is another option (starts with --)
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            SHORT_NAME="$next_arg"
            ;;
        --number)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            BRANCH_NUMBER="$next_arg"
            ;;
        --ticket)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --ticket requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --ticket requires a value' >&2
                exit 1
            fi
            # Remove leading # if present (normalize input)
            TICKET_ID="${next_arg#\#}"
            ;;
        --help|-h)
            echo "Usage: $0 --ticket <id> [--json] [--short-name <name>] <feature_description>"
            echo ""
            echo "Options:"
            echo "  --ticket <id>       Ticket/issue ID (required). Examples: 13272f64, PROJ123"
            echo "  --json              Output in JSON format"
            echo "  --short-name <name> Provide a custom short name (2-4 words) for the branch"
            echo "  --number N          [DEPRECATED] Specify branch number manually"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --ticket 13272f64 'Add user authentication system'"
            echo "  $0 --ticket PROJ123 --short-name 'user-auth' 'Add user authentication'"
            exit 0
            ;;
        *) 
            ARGS+=("$arg") 
            ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 --ticket <id> [--json] [--short-name <name>] <feature_description>" >&2
    exit 1
fi

# Ticket ID validation and interactive input
if [ -z "$TICKET_ID" ]; then
    # JSON mode requires --ticket option (no interactive input possible)
    if $JSON_MODE; then
        echo "ERROR: --ticket is required in JSON mode" >&2
        echo "" >&2
        echo "Usage: $0 --json --ticket <id> [--short-name <name>] <description>" >&2
        echo "" >&2
        echo "Examples:" >&2
        echo "  --ticket 13272f64 'Add user authentication'" >&2
        echo "  --ticket PROJ123 'Implement payment processing'" >&2
        exit 1
    fi

    # Interactive mode: prompt for ticket ID
    echo ""
    echo "Ticket ID is required for new features."
    echo "Examples: 13272f64, PROJ123, abc456"
    echo ""
    read -p "Enter ticket ID: " TICKET_ID

    # Check if input is empty
    if [ -z "$TICKET_ID" ]; then
        echo "ERROR: Ticket ID cannot be empty" >&2
        exit 1
    fi

    # Remove leading # if present (normalize input)
    TICKET_ID="${TICKET_ID#\#}"
fi

# Validate ticket ID format (alphanumeric only)
if [[ ! "$TICKET_ID" =~ ^[a-zA-Z0-9]+$ ]]; then
    echo "ERROR: Invalid ticket ID format: '$TICKET_ID'" >&2
    echo "" >&2
    echo "Ticket ID must contain only alphanumeric characters:" >&2
    echo "  Valid: 13272f64, PROJ123, abc123" >&2
    echo "  Invalid: ABC-123, proj#123, special!chars" >&2
    exit 1
fi

# Function to find the repository root by searching for existing project markers
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Function to get highest number from specs directory
get_highest_from_specs() {
    local specs_dir="$1"
    local highest=0
    
    if [ -d "$specs_dir" ]; then
        for dir in "$specs_dir"/*; do
            [ -d "$dir" ] || continue
            dirname=$(basename "$dir")
            number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
            number=$((10#$number))
            if [ "$number" -gt "$highest" ]; then
                highest=$number
            fi
        done
    fi
    
    echo "$highest"
}

# Function to get highest number from git branches
get_highest_from_branches() {
    local highest=0
    
    # Get all branches (local and remote)
    branches=$(git branch -a 2>/dev/null || echo "")
    
    if [ -n "$branches" ]; then
        while IFS= read -r branch; do
            # Clean branch name: remove leading markers and remote prefixes
            clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
            
            # Extract feature number if branch matches pattern ###-*
            if echo "$clean_branch" | grep -q '^[0-9]\{3\}-'; then
                number=$(echo "$clean_branch" | grep -o '^[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            fi
        done <<< "$branches"
    fi
    
    echo "$highest"
}

# Function to check existing branches (local and remote) and return next available number
check_existing_branches() {
    local specs_dir="$1"

    # Fetch all remotes to get latest branch info (suppress errors if no remotes)
    git fetch --all --prune 2>/dev/null || true

    # Get highest number from ALL branches (not just matching short name)
    local highest_branch=$(get_highest_from_branches)

    # Get highest number from ALL specs (not just matching short name)
    local highest_spec=$(get_highest_from_specs "$specs_dir")

    # Take the maximum of both
    local max_num=$highest_branch
    if [ "$highest_spec" -gt "$max_num" ]; then
        max_num=$highest_spec
    fi

    # Return next number
    echo $((max_num + 1))
}

# Function to clean and format a branch name
clean_branch_name() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Resolve repository root. Prefer git information when available, but fall back
# to searching for repository markers so the workflow still functions in repositories that
# were initialised with --no-git.
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
    if [ -z "$REPO_ROOT" ]; then
        echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
        exit 1
    fi
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Function to generate branch name with stop word filtering and length filtering
generate_branch_name() {
    local description="$1"
    
    # Common stop words to filter out
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"
    
    # Convert to lowercase and split into words
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')
    
    # Filter words: remove stop words and words shorter than 3 chars (unless they're uppercase acronyms in original)
    local meaningful_words=()
    for word in $clean_name; do
        # Skip empty words
        [ -z "$word" ] && continue
        
        # Keep words that are NOT stop words AND (length >= 3 OR are potential acronyms)
        if ! echo "$word" | grep -qiE "$stop_words"; then
            if [ ${#word} -ge 3 ]; then
                meaningful_words+=("$word")
            elif echo "$description" | grep -q "\b${word^^}\b"; then
                # Keep short words if they appear as uppercase in original (likely acronyms)
                meaningful_words+=("$word")
            fi
        fi
    done
    
    # If we have meaningful words, use first 3-4 of them
    if [ ${#meaningful_words[@]} -gt 0 ]; then
        local max_words=3
        if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi
        
        local result=""
        local count=0
        for word in "${meaningful_words[@]}"; do
            if [ $count -ge $max_words ]; then break; fi
            if [ -n "$result" ]; then result="$result-"; fi
            result="$result$word"
            count=$((count + 1))
        done
        echo "$result"
    else
        # Fallback to original logic if no meaningful words found
        local cleaned=$(clean_branch_name "$description")
        echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
    fi
}

# Generate branch name
if [ -n "$SHORT_NAME" ]; then
    # Use provided short name, just clean it up
    BRANCH_SUFFIX=$(clean_branch_name "$SHORT_NAME")
else
    # Generate from description with smart filtering
    BRANCH_SUFFIX=$(generate_branch_name "$FEATURE_DESCRIPTION")
fi

# Check if a spec already exists for this ticket ID
check_existing_ticket() {
    local ticket_id="$1"
    local specs_dir="$2"

    # Check remote branches for ticket-based pattern
    if [ "$HAS_GIT" = true ]; then
        local remote_match=$(git ls-remote --heads origin 2>/dev/null | grep -E "refs/heads/spec/#${ticket_id}-" || true)
        if [ -n "$remote_match" ]; then
            echo "remote"
            return 0
        fi

        # Check local branches
        local local_match=$(git branch 2>/dev/null | grep -E "^[* ]*spec/#${ticket_id}-" || true)
        if [ -n "$local_match" ]; then
            echo "local"
            return 0
        fi
    fi

    # Check specs directories
    if [ -d "$specs_dir" ]; then
        for dir in "$specs_dir"/#"$ticket_id"-*; do
            if [ -d "$dir" ]; then
                echo "specs"
                return 0
            fi
        done
    fi

    echo ""
    return 0
}

# Check for duplicate ticket (|| true prevents set -e from exiting on empty result)
EXISTING_TICKET=$(check_existing_ticket "$TICKET_ID" "$SPECS_DIR" || true)
if [ -n "$EXISTING_TICKET" ]; then
    echo "ERROR: A spec already exists for ticket #${TICKET_ID}" >&2
    echo "" >&2
    if [ "$EXISTING_TICKET" = "remote" ] || [ "$EXISTING_TICKET" = "local" ]; then
        echo "Existing branch found. To work on this feature, checkout the existing branch:" >&2
        echo "  git checkout spec/#${TICKET_ID}-*" >&2
    else
        echo "Existing spec directory found at: specs/#${TICKET_ID}-*" >&2
    fi
    exit 1
fi

# Build ticket-based branch name: spec/#ticket-feature-suffix
BRANCH_NAME="spec/#${TICKET_ID}-${BRANCH_SUFFIX}"

# GitHub enforces a 244-byte limit on branch names
# Validate and truncate if necessary
MAX_BRANCH_LENGTH=244
if [ ${#BRANCH_NAME} -gt $MAX_BRANCH_LENGTH ]; then
    # Calculate how much we need to trim from suffix
    # Account for: "spec/#" (6) + ticket_id + "-" (1) chars
    prefix_len=$((7 + ${#TICKET_ID}))
    MAX_SUFFIX_LENGTH=$((MAX_BRANCH_LENGTH - prefix_len))

    # Truncate suffix at word boundary if possible
    TRUNCATED_SUFFIX=$(echo "$BRANCH_SUFFIX" | cut -c1-$MAX_SUFFIX_LENGTH)
    # Remove trailing hyphen if truncation created one
    TRUNCATED_SUFFIX=$(echo "$TRUNCATED_SUFFIX" | sed 's/-$//')

    ORIGINAL_BRANCH_NAME="$BRANCH_NAME"
    BRANCH_NAME="spec/#${TICKET_ID}-${TRUNCATED_SUFFIX}"

    >&2 echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit"
    >&2 echo "[specify] Original: $ORIGINAL_BRANCH_NAME (${#ORIGINAL_BRANCH_NAME} bytes)"
    >&2 echo "[specify] Truncated to: $BRANCH_NAME (${#BRANCH_NAME} bytes)"
fi

if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[specify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# For spec directory, use #ticket-feature format (without spec/ prefix)
SPEC_DIR_NAME="#${TICKET_ID}-${BRANCH_SUFFIX}"
FEATURE_DIR="$SPECS_DIR/$SPEC_DIR_NAME"
mkdir -p "$FEATURE_DIR"

TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
SPEC_FILE="$FEATURE_DIR/spec.md"
if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$SPEC_FILE"; else touch "$SPEC_FILE"; fi

# Set environment variables for the current session
export SPECIFY_FEATURE="$BRANCH_NAME"
export SPECIFY_TICKET="$TICKET_ID"

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","TICKET_ID":"%s"}\n' "$BRANCH_NAME" "$SPEC_FILE" "$TICKET_ID"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "TICKET_ID: $TICKET_ID"
    echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
    echo "SPECIFY_TICKET environment variable set to: $TICKET_ID"
fi
