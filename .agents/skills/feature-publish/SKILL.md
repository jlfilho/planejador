---
name: "feature-publish"
description: "Validate and publish a completed feat/ branch as a GitHub pull request without merging it."
metadata:
  author: "project"
  source: "local automation"
---

## Purpose

Publish a completed feature safely: validate it, make one reviewed Conventional
Commit, push it, and open a pull request to `main`. Never merge the pull request.

## Procedure

1. Confirm a Git working tree with `git rev-parse --is-inside-work-tree`.
2. Read `git branch --show-current`; require `feat/NNN-nome-em-kebab-case`, with
   a three-digit number and a lowercase kebab-case name. Otherwise stop without
   altering the repository.
3. Derive `specs/NNN-nome-em-kebab-case` and confirm that directory exists.
4. Run `git status`, then inspect the complete status. Identify only legitimate
   feature changes; do not infer that all changed files belong to the feature.
   Stop when ownership of a changed or already staged file is unclear.
5. Refuse to stage or commit `.env`, `.env.local`, any `*.pem` or `*.key`, or
   any file that appears to contain credentials, tokens, private keys, or other
   secrets. Report the path and stop for review.
6. Detect package scripts before running quality gates. When both `pnpm` and the
   corresponding script are available, run each applicable gate in this order:
   `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, and
   `pnpm build`. Record skipped gates and why. If any executed gate fails, stop
   before staging, committing, pushing, or creating a pull request.
7. Examine `git diff`, `git diff --stat`, and `git status`. Build an explicit
   reviewed list of legitimate feature files. Stage each approved path explicitly
   with `git add -- <path>`; never use `git add .` or `git add -A`.
8. Run `git diff --cached --check` and `git diff --cached --name-only`. Stop for
   any check failure, unexpected path, sensitive path, or empty staged list.
9. Derive an appropriate Conventional Commit message from the staged change.
   Show the branch, exact staged files, and proposed message for review in the
   execution report immediately before committing. Then create the commit.
10. Push exactly with `git push -u origin <current-branch>`.
11. Create a pull request with base `main` and head `<current-branch>`. Prefer
   an available GitHub integration; otherwise use authenticated `gh pr create`
   with an automatic title and body. The body must contain `Summary`,
   `Specification`, `Validation`, and `Security` sections. If neither method is
   available, report the base, head, proposed title, and complete description
   needed for manual opening.
12. Report the branch, commit hash, pull-request URL or manual-opening details,
   quality-gate results, and the next required human step: review and merge the
   pull request.

## Safety boundaries

- Never merge a pull request or run `git switch main`, `git merge`, `git reset`,
  `git clean`, or `git stash`.
- Do not push or create a pull request after an unresolved validation, staging,
  secret-detection, or quality-gate failure.
