#!/usr/bin/env bash
# Prints two lines: the resolved base branch, then a content hash of the
# reviewed diff scope. Used by write-receipt.sh (to stamp a receipt) and
# gate.sh (to check a receipt is still fresh) — both must compute the exact
# same hash for a given diff, so this is the only place that logic lives.
#
# Usage: diff-hash.sh [base-branch]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

repo_root="$(pr_self_review_repo_root)"
cd "$repo_root"

base="$(pr_self_review_resolve_base "${1:-}")"
hash="$(pr_self_review_collect_diff "$base" | git hash-object --stdin)"

printf '%s\n%s\n' "$base" "$hash"
