#!/bin/bash

# Setup script for Quick-Ref Auto-Update System
# This script configures git hooks and dependencies

echo "🚀 Setting up Quick-Ref Auto-Update System..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository root"
    echo "   Please run this script from the repository root"
    exit 1
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Install Node.js dependencies
echo "📦 Installing dependencies..."
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "class-one-rapids",
  "version": "1.0.0",
  "description": "Context Engineering System with Auto-Update Quick-Ref",
  "scripts": {
    "update-quick-ref": "node scripts/update-quick-ref.js",
    "validate-quick-ref": "node scripts/validate-quick-ref.js",
    "watch-research": "node scripts/watch-research.js"
  },
  "devDependencies": {
    "chokidar": "^3.5.3",
    "diff": "^5.1.0"
  }
}
EOF
fi

npm install

# Setup git hooks
echo ""
echo "🔧 Setting up git hooks..."

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: Validate quick-ref if research files changed

# Check if any research files are being committed
if git diff --cached --name-only | grep -q "research/.*\.md"; then
    echo "📝 Research files changed, validating quick-ref..."
    
    # Run update in dry-run mode
    node scripts/update-quick-ref.js --validate
    
    if [ $? -ne 0 ]; then
        echo "❌ Quick-ref validation failed!"
        echo "   Run: npm run update-quick-ref"
        exit 1
    fi
fi
EOF

chmod +x .git/hooks/pre-commit

# Post-commit hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Post-commit hook: Update quick-ref after research changes

# Check if research files were committed
if git diff --name-only HEAD~1 | grep -q "research/.*\.md"; then
    echo "🔄 Updating quick-ref based on research changes..."
    node scripts/update-quick-ref.js --background &
fi
EOF

chmod +x .git/hooks/post-commit

# Create file watcher script
echo ""
echo "📝 Creating file watcher script..."

cat > scripts/watch-research.js << 'EOF'
#!/usr/bin/env node

/**
 * File watcher for research directory
 * Automatically updates quick-ref when research files change
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../research');
const DEBOUNCE_MS = 2000; // Wait 2 seconds after last change

let updateTimeout;

console.log('👁️  Watching research directory for changes...');
console.log('   Press Ctrl+C to stop\n');

// Initialize watcher
const watcher = chokidar.watch(RESEARCH_DIR, {
  ignored: [
    '**/quick-ref.md', // Don't watch the output file
    '**/.*.swp',       // Ignore vim swap files
    '**/.DS_Store',    // Ignore Mac files
    '**/node_modules'  // Ignore node_modules
  ],
  persistent: true,
  ignoreInitial: true
});

// Handle file changes
watcher.on('change', (filePath) => {
  if (!filePath.endsWith('.md')) return;
  
  console.log(`📝 Changed: ${path.relative(RESEARCH_DIR, filePath)}`);
  
  // Debounce updates
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    console.log('🔄 Updating quick-ref...');
    try {
      execSync('node scripts/update-quick-ref.js', { stdio: 'inherit' });
      console.log('✅ Quick-ref updated!\n');
    } catch (error) {
      console.error('❌ Update failed:', error.message);
    }
  }, DEBOUNCE_MS);
});

// Handle new files
watcher.on('add', (filePath) => {
  if (!filePath.endsWith('.md')) return;
  console.log(`➕ Added: ${path.relative(RESEARCH_DIR, filePath)}`);
});

// Handle errors
watcher.on('error', error => {
  console.error('❌ Watcher error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  watcher.close();
  process.exit(0);
});
EOF

chmod +x scripts/watch-research.js

# Create GitHub Actions workflow
echo ""
echo "🤖 Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/update-quick-ref.yml << 'EOF'
name: Auto-Update Quick Reference

on:
  push:
    paths:
      - 'research/**/*.md'
      - '!research/quick-ref.md'
  pull_request:
    paths:
      - 'research/**/*.md'
      - '!research/quick-ref.md'

jobs:
  update-quick-ref:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Update quick-ref
      run: node scripts/update-quick-ref.js
    
    - name: Validate quick-ref
      run: node scripts/validate-quick-ref.js
    
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add research/quick-ref.md
        git diff --staged --quiet || git commit -m "auto-update: quick-ref from research changes"
    
    - name: Push changes
      if: github.event_name == 'push'
      run: git push
EOF

# Create a manual update command for .claude/commands
echo ""
echo "📝 Creating Claude command..."

mkdir -p .claude/commands

cat > .claude/commands/update-quick-ref.md << 'EOF'
---
description: Manually update quick-ref.md from research files
argument-hint: [--validate] [--force]
allowed-tools: ["Bash", "Read", "Write"]
---

EXECUTE quick-ref update: $ARGUMENTS

**Update the quick-ref.md file based on changes in research files**

Run the update script:
```bash
node scripts/update-quick-ref.js $ARGUMENTS
```

Show the validation results:
```bash
node scripts/validate-quick-ref.js
```

If validation passes, show summary of changes:
```bash
git diff research/quick-ref.md
```
EOF

# Summary
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 What was configured:"
echo "   - Git pre-commit hook (validates before commit)"
echo "   - Git post-commit hook (updates after commit)"
echo "   - File watcher script (scripts/watch-research.js)"
echo "   - GitHub Actions workflow (.github/workflows/update-quick-ref.yml)"
echo "   - Claude command (/update-quick-ref)"
echo ""
echo "🎯 Available commands:"
echo "   npm run update-quick-ref    # Manually update quick-ref"
echo "   npm run validate-quick-ref  # Validate quick-ref"
echo "   npm run watch-research      # Watch for changes (dev mode)"
echo ""
echo "💡 The system will now automatically update quick-ref.md when:"
echo "   - You commit changes to research files"
echo "   - You push to GitHub (via Actions)"
echo "   - You run the watcher in development"
echo ""
echo "🚀 To start watching for changes now, run:"
echo "   npm run watch-research"