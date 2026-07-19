#!/usr/bin/env bash
# Prints the reviewed diff scope's changed files as `<status>\t<path>` lines
# (git's --name-status format; renames appear as `R100\told\tnew`), deduped.
# This is what the skill classifies into frontend/backend buckets — cheap to
# scan without pulling every hunk into context.
#
# Usage: changed-files.sh [base-branch]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

repo_root="$(pr_self_review_repo_root)"
cd "$repo_root"

base="$(pr_self_review_resolve_base "${1:-}")"
merge_base="$(git merge-base "$base" HEAD 2>/dev/null || echo "$base")"

{
  git diff -M --name-status "$merge_base"...HEAD 2>/dev/null || true
  git diff -M --name-status HEAD 2>/dev/null || true
  pr_self_review_untracked_files | awk '{print "A\t" $0}'
} | awk '!seen[$0]++'
