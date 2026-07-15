#!/usr/bin/env bash
# PreToolUse hook for the Bash tool. Reads the hook-event JSON on stdin,
# and — only for `gh pr create` commands — checks that a fresh
# pr-self-review receipt exists for the current diff before allowing the
# command through. Every other Bash command is allowed immediately.
#
# Draft PRs (`--draft`) are exempt: they aren't mergeable yet, so gating them
# here would just add friction to a WIP flow without protecting anything.
set -uo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

allow() {
  exit 0
}

allow_with_message() {
  jq -n --arg msg "$1" '{systemMessage: $msg}'
  exit 0
}

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

input="$(cat)"
command_text="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"

[[ -z "$command_text" ]] && allow

# Match against the command with quoted/heredoc text stripped out — otherwise
# a `git commit -m "... gh pr create ..."` or a PR-body heredoc mentioning
# the phrase gets mistaken for an actual invocation and blocks unrelated
# commands (including the commit that introduces this very hook).
cleaned="$(printf '%s\n' "$command_text" | pr_self_review_strip_quoted)"

# Only gate `gh pr create` invocations (allow git/gh/anything else through).
printf '%s' "$cleaned" | grep -qE '(^|[;&|]|[[:space:]])gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)' || allow

if printf '%s' "$cleaned" | grep -qE -- '--draft([[:space:]]|=|$)'; then
  allow_with_message "pr-self-review: --draft PR — gate skipped (not mergeable yet). Gate re-applies when this PR is marked ready."
fi

repo_root="$(pr_self_review_repo_root 2>/dev/null)"
if [[ -z "$repo_root" ]]; then
  allow # not in a git repo somehow — nothing to gate against
fi

receipt="$repo_root/.claude/.pr-self-review-receipt.json"

# Extract --base <branch> or --base=<branch> if the command specifies one.
base_arg=""
if [[ "$cleaned" =~ --base[[:space:]=]([^[:space:]]+) ]]; then
  base_arg="${BASH_REMATCH[1]}"
fi

resolved="$("$script_dir/diff-hash.sh" "$base_arg" 2>/dev/null)" || allow
current_base="$(printf '%s' "$resolved" | sed -n '1p')"
current_hash="$(printf '%s' "$resolved" | sed -n '2p')"

if [[ ! -f "$receipt" ]]; then
  deny "pr-self-review: no receipt for the current diff. Run /pr-self-review before opening this PR."
fi

verdict="$(jq -r '.verdict // empty' "$receipt" 2>/dev/null)"
receipt_hash="$(jq -r '.diffHash // empty' "$receipt" 2>/dev/null)"
receipt_base="$(jq -r '.base // empty' "$receipt" 2>/dev/null)"

if [[ "$receipt_hash" != "$current_hash" || "$receipt_base" != "$current_base" ]]; then
  deny "pr-self-review: receipt is stale (diff or base branch changed since the last run). Run /pr-self-review again."
fi

case "$verdict" in
  pass)
    allow
    ;;
  override)
    reason="$(jq -r '.overrideReason // "no reason recorded"' "$receipt" 2>/dev/null)"
    allow_with_message "pr-self-review: proceeding on recorded override — \"$reason\""
    ;;
  blocked)
    deny "pr-self-review: BLOCKED — unresolved CRITICAL findings. Run /pr-self-review to see them, fix them, or re-run with --override \"reason\" if intentional."
    ;;
  *)
    deny "pr-self-review: receipt has an unrecognized verdict ('$verdict'). Run /pr-self-review again."
    ;;
esac
