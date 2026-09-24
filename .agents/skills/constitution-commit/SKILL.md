---
name: "constitution-commit"
description: "Commit only the project constitution after Spec Kit updates it. Use as the mandatory after_constitution hook."
metadata:
  author: "project"
  source: "local automation"
---

## Purpose

Safely create the constitution commit. This skill is intentionally limited to
`.specify/memory/constitution.md` and must never publish the commit.

## Procedure

1. Confirm this is a Git working tree with `git rev-parse --is-inside-work-tree`.
   Stop if it is not exactly `true`.
2. Read `git branch --show-current`. Require exactly `main`; stop safely for a
   detached HEAD or any other branch.
3. Confirm `.specify/memory/constitution.md` exists. Stop if it does not.
4. Run exactly `git add -- .specify/memory/constitution.md`.
5. Run exactly `git diff --cached --check`; stop on any error.
6. Run exactly `git diff --cached --name-only`. If it reports no files, report
   that there is nothing to commit and stop without creating an empty commit.
7. Require the staged-file list to contain exactly
   `.specify/memory/constitution.md`. If any other file is staged, stop and
   report every staged path; do not unstage, reset, or otherwise alter it.
8. Run exactly `git commit -m "docs(spec): establish project constitution"`.
9. On success, report the new commit hash from `git rev-parse --short HEAD` and
   the committed paths from `git diff-tree --no-commit-id --name-only -r HEAD`.

## Safety boundaries

- Never run `git push`, `git checkout`, `git switch`, `git merge`, `git reset`,
  `git stash`, or `git clean`.
- Do not stage, commit, modify, or unstage any path other than the constitution.
- On every failed precondition or Git command, stop and present the command's
  error plus the manual action required.
