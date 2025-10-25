# CI/CD Setup - TypeScript Type Checking

This project uses automated type checking to maintain code quality.

## 🔍 What Gets Checked

Every commit and pull request is automatically checked for TypeScript errors using `npm run typecheck`.

## 🚀 How It Works

### 1. **Local Pre-Commit Hook** (Immediate Feedback)

When you try to commit code, a git hook automatically runs:

```bash
# Runs automatically on git commit
🔍 Running TypeScript type check...
✅ Type check passed!
```

If there are errors, the commit is **blocked** until you fix them.

**To bypass** (use only when absolutely necessary):
```bash
git commit --no-verify
```

### 2. **GitHub Actions CI** (Remote Validation)

When you push to `main`, `master`, or `develop` branches, or open a pull request:

1. GitHub Actions automatically runs type checking
2. If errors are found:
   - ❌ The build fails
   - PR cannot be merged (if branch protection is enabled)
   - A comment is added to the PR explaining the failure

## 📦 Setup for New Developers

### First-Time Setup

```bash
# Run the setup script
./scripts/setup-hooks.sh

# Or manually:
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### Verify Setup

```bash
# Test the pre-commit hook
./.githooks/pre-commit

# Run type check manually
cd frontend
npm run typecheck
```

## 🛠️ Local Development

### Run Type Check Manually

```bash
cd frontend
npm run typecheck
```

### Fix Common Issues

**Issue:** `Property 'X' does not exist on type 'Y'`
- **Fix:** Check type definitions in `/frontend/src/types/`

**Issue:** `Type 'X' is not assignable to type 'Y'`
- **Fix:** Add proper type casting or fix the type mismatch

**Issue:** `Cannot find module`
- **Fix:** Check import paths and ensure file extensions are correct

## 📊 CI Status Badge

Add this to your README.md to show build status:

```markdown
![Type Check](https://github.com/YOUR-USERNAME/YOUR-REPO/actions/workflows/typecheck.yml/badge.svg)
```

## 🔧 Configuration Files

- **`.github/workflows/typecheck.yml`** - GitHub Actions workflow
- **`.githooks/pre-commit`** - Local git pre-commit hook
- **`scripts/setup-hooks.sh`** - Setup script for new developers
- **`frontend/package.json`** - Contains `typecheck` script

## 🎯 Best Practices

1. **Fix errors immediately** - Don't let type errors accumulate
2. **Run `npm run typecheck` before committing** - Catch issues early
3. **Never use `--no-verify` without good reason** - The hook is there to help
4. **Review CI failures** - They often catch issues WebStorm misses

## ❓ FAQ

**Q: Can I disable type checking for a specific commit?**
A: Yes, use `git commit --no-verify`, but this is discouraged.

**Q: Why did my commit pass locally but fail in CI?**
A: Ensure your local dependencies are up to date: `npm install`

**Q: How do I fix "React is declared but never read" warnings?**
A: These are just hints, not errors. They won't block commits but can be cleaned up.

**Q: Can I run typecheck on file save?**
A: Yes! Configure WebStorm to run `npm run typecheck` on save, or use `tsc --watch`.
