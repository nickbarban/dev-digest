#!/usr/bin/env bash
# Shared helpers for pr-self-review scripts. Source this, don't execute it directly.

pr_self_review_repo_root() {
  git rev-parse --show-toplevel
}

# Resolves the base branch to diff against, in priority order:
# explicit arg > this branch's tracking upstream > origin/main.
pr_self_review_resolve_base() {
  local base_input="${1:-}"
  if [[ -n "$base_input" ]]; then
    printf '%s' "$base_input"
    return
  fi
  local upstream
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
  if [[ -n "$upstream" ]]; then
    printf '%s' "$upstream"
    return
  fi
  printf '%s' "origin/main"
}

# Lists untracked, non-ignored files, one per line — flattened, so a brand
# new directory contributes its individual files rather than collapsing to
# one directory entry the way `git status --porcelain` does.
pr_self_review_untracked_files() {
  git ls-files --others --exclude-standard
}

# Strips heredoc bodies and quoted-string contents out of a shell command so
# regex matching only sees actual command syntax, not arbitrary text quoted
# as an argument — e.g. a `git commit -m "... gh pr create ..."` message
# must never be mistaken for an actual `gh pr create` invocation. Best-effort
# (not a full shell parser), but covers the common real-world cases: `-m`
# strings, heredoc-built messages, PR bodies.
pr_self_review_strip_quoted() {
  awk '
    BEGIN { in_heredoc = 0; delim = "" }
    {
      if (in_heredoc) {
        trimmed = $0
        gsub(/^[ \t]+/, "", trimmed)
        if (trimmed == delim) { in_heredoc = 0; delim = "" }
        next
      }
      if (match($0, /<<-?["\x27]?[A-Za-z_][A-Za-z0-9_]*["\x27]?/)) {
        tok = substr($0, RSTART, RLENGTH)
        d = tok
        sub(/^<<-?/, "", d)
        gsub(/["\x27]/, "", d)
        delim = d
        in_heredoc = 1
        print substr($0, 1, RSTART - 1)
        next
      }
      print $0
    }
  ' | sed -E "s/'[^']*'//g" | sed -E 's/"([^"\\]|\\.)*"//g'
}

# Prints the full reviewed diff scope to stdout: committed-ahead-of-base
# (renames detected via -M) + working tree changes + untracked file contents.
# This is the single source of truth for "what pr-self-review reviews" — every
# script that needs the diff (hashing, dumping, gating) calls this so they can
# never drift apart.
pr_self_review_collect_diff() {
  local base="$1"
  local merge_base
  merge_base="$(git merge-base "$base" HEAD 2>/dev/null || echo "$base")"

  git diff -M "$merge_base"...HEAD 2>/dev/null || true
  git diff -M HEAD 2>/dev/null || true
  # `if` (not `[[ -f ]] && { ... }`) matters here: a false condition with no
  # `else` exits the `if` statement 0, so a stray unreadable path can't make
  # this — piped into `git hash-object --stdin` under `pipefail` — kill the
  # whole script under `set -e`.
  pr_self_review_untracked_files | while IFS= read -r f; do
    if [[ -f "$f" ]]; then
      printf '%s\n' "--- untracked: $f ---"
      cat "$f"
    fi
  done
  return 0
}
