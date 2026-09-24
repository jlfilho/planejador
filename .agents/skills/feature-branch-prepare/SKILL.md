---
name: "feature-branch-prepare"
description: "Create the feature branch for the one changed Spec Kit feature. Use as the mandatory before_implement hook."
metadata:
  author: "project"
  source: "local automation"
---

## Purpose

Prepare the single feature branch immediately before implementation while
preserving every uncommitted change.

## Procedure

1. Confirm a Git working tree with `git rev-parse --is-inside-work-tree`; stop
   unless its result is exactly `true`.
2. Inspect `git status --porcelain=v1 --untracked-files=all`. From changed or
   untracked paths, collect only first-level feature directories matching
   `specs/NNN-nome-em-kebab-case/`, where `NNN` is three digits and every slug
   segment is lowercase alphanumeric text separated by single hyphens. Handle
   renamed paths by considering both reported paths. Ignore every other path.
3. Require exactly one distinct candidate. With zero or more than one, stop and
   list the candidates found without guessing.
4. Derive the destination branch by replacing the candidate's `specs/` prefix
   with `feat/`; for example, `specs/001-foundation-auth` becomes
   `feat/001-foundation-auth`.
5. Run `git branch --show-current` and require exactly `main`. If it differs or
   is empty, stop without altering the working tree.
6. Verify the destination branch does not exist locally with
   `git show-ref --verify --quiet refs/heads/<destination>`. Verify it does not
   exist on `origin` with `git ls-remote --heads origin refs/heads/<destination>`.
   Stop if either exists. If the remote check itself fails, stop and request
   human resolution rather than treating the failure as absence.
7. Preserve all uncommitted changes. Never stash, commit, reset, clean, or
   discard them. Run exactly `git pull --ff-only`; if it fails, stop for human
   resolution.
8. Run exactly `git switch -c <destination>`, then confirm with
   `git branch --show-current` that the result is exactly `<destination>`.
   Stop and report any failure.
9. Run exactly `git status`. Reinspect porcelain status and confirm that the
   previously identified uncommitted Spec Kit artifacts for the candidate still
   appear under `specs/<NNN-nome-em-kebab-case>/`. If they do not, stop and
   report the discrepancy.

## Safety boundaries

- Never run `git stash`, `git commit`, `git reset`, or `git clean`.
- Do not create a branch when candidate selection, branch verification, or the
  fast-forward-only pull cannot be completed unambiguously.
