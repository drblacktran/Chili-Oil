# Git Hooks

This directory contains git hooks for the project.

## Setup

To enable these hooks, run from the project root:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

Or run the setup script:

```bash
./scripts/setup-hooks.sh
```

## Hooks

### pre-commit

Runs TypeScript type checking before allowing commits. This ensures:
- No TypeScript errors in the codebase
- Consistent code quality across all commits
- Early detection of type issues

**To bypass** (use sparingly):
```bash
git commit --no-verify
```
