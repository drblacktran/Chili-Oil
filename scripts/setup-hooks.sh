#!/bin/bash
# Setup script for git hooks

echo "🔧 Setting up git hooks..."

# Configure git to use .githooks directory
git config core.hooksPath .githooks

# Make hooks executable
chmod +x .githooks/pre-commit

echo "✅ Git hooks configured successfully!"
echo ""
echo "Pre-commit hook will now run TypeScript type checking before each commit."
echo "To bypass (not recommended): git commit --no-verify"
