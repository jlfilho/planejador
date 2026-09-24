---
name: "feature-finish"
description: "Finish a feature locally only after its pull request to main is verified as merged."
metadata:
  author: "project"
  source: "local automation"
---

## Purpose

Return a completed feature checkout to an up-to-date local `main`, ready for the
next specification. This skill never merges locally or deletes branches.

## Procedure

1. Confirm a Git working tree with `git rev-parse --is-inside-work-tree`.
2. Read `git branch --show-current`; require `feat/NNN-nome-em-kebab-case`.
   Otherwise stop without changing the repository.
3. Run `git status` and require a clean working tree. If there are staged,
   unstaged, or untracked changes, stop and list them.
4. Verify on GitHub that this branch has a pull request targeting `main` and
   that it is actually `MERGED`. Prefer an available GitHub integration;
   otherwise use `gh pr list --head <branch> --base main --state merged` and
   inspect the PR URL, number, and merged timestamp. If it is open, closed
   without merge, absent, or cannot be verified, stop.
5. Do not perform a local merge. Run exactly `git switch main`, then exactly
   `git pull --ff-only`. If either fails, stop for human resolution.
6. Run `git status`. Confirm `main` is synchronized with `origin/main`, for
   example with `git rev-list --left-right --count main...origin/main` requiring
   `0 0`. If it is not synchronized, stop and report the divergence.
7. Do not delete the feature branch. Report the finalized feature, merged PR,
   current `main` commit hash, synchronization status, and that the project is
   ready for the next specification.

## Safety boundaries

- Never run `git merge`, `git reset`, `git clean`, `git stash`, or branch
  deletion.
- A verified merged PR is a hard prerequisite; GitHub uncertainty is a stop,
  not permission to proceed.
