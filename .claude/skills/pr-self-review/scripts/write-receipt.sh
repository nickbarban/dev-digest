#!/usr/bin/env bash
# Writes .claude/.pr-self-review-receipt.json — the artifact the PreToolUse
# hook (gate.sh) reads to decide whether `gh pr create` may proceed. This is
# the ONLY place that should write the receipt; the skill's last action is
# always a call to this script so the hook and the skill can never disagree
# about the diff hash.
#
# Usage: write-receipt.sh <pass|blocked|override> [base-branch] [override-reason]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

verdict="${1:?usage: write-receipt.sh <pass|blocked|override> [base-branch] [override-reason]}"
base_arg="${2:-}"
override_reason="${3:-}"

case "$verdict" in
  pass|blocked|override) ;;
  *)
    echo "write-receipt.sh: invalid verdict '$verdict' (expected pass|blocked|override)" >&2
    exit 1
    ;;
esac

if [[ "$verdict" == "override" && -z "$override_reason" ]]; then
  echo "write-receipt.sh: verdict=override requires an override-reason argument" >&2
  exit 1
fi

repo_root="$(pr_self_review_repo_root)"
cd "$repo_root"

base="$(pr_self_review_resolve_base "$base_arg")"
hash="$(pr_self_review_collect_diff "$base" | git hash-object --stdin)"
at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "$repo_root/.claude"

jq -n \
  --arg verdict "$verdict" \
  --arg diffHash "$hash" \
  --arg base "$base" \
  --arg at "$at" \
  --arg overrideReason "$override_reason" \
  '{verdict: $verdict, diffHash: $diffHash, base: $base, at: $at}
   + (if $overrideReason != "" then {overrideReason: $overrideReason} else {} end)' \
  > "$repo_root/.claude/.pr-self-review-receipt.json"

echo "Receipt written: verdict=$verdict base=$base diffHash=$hash" >&2
