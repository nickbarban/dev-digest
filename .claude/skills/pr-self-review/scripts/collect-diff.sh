#!/usr/bin/env bash
# Prints the resolved base branch as a comment line, then the full reviewed
# diff (see lib.sh). Use this instead of hand-rolling `git diff` commands —
# it guarantees the diff Claude reads is the exact same scope diff-hash.sh
# and gate.sh hash and gate on.
#
# Usage: collect-diff.sh [base-branch]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

repo_root="$(pr_self_review_repo_root)"
cd "$repo_root"

base="$(pr_self_review_resolve_base "${1:-}")"
printf '# base: %s\n' "$base"
pr_self_review_collect_diff "$base"
