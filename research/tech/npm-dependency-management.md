# NPM Dependency Management Best Practices

## Critical Anti-Pattern: --legacy-peer-deps

### 🚨 RED FLAG: Never Use --legacy-peer-deps Without Deep Investigation

The `--legacy-peer-deps` flag is a **critical warning sign** that indicates:
1. **Version conflicts** between packages
2. **Outdated dependencies** in your dependency tree
3. **Incompatible package combinations**
4. **Previous bad decisions** in the codebase

### Why --legacy-peer-deps is Almost Always Wrong

When npm suggests using `--legacy-peer-deps`, it's telling you:
- Your packages have **conflicting peer dependency requirements**
- You're trying to combine packages that **weren't designed to work together**
- Someone before you may have already made this mistake

### What to Do Instead

#### 1. Investigate the Root Cause
```bash
# See the actual conflict
npm install --dry-run

# Check why packages are incompatible
npm ls <conflicting-package>

# Audit your dependencies
npm audit
```

#### 2. Common Real Solutions

**For React Native/Expo Projects:**
```bash
# Wrong approach (masks the problem)
npm install --legacy-peer-deps

# Right approach - use Expo's installer
npx expo install <package>
# Expo automatically resolves to compatible versions
```

**For Version Conflicts:**
```bash
# Check what versions are actually compatible
npm view <package> peerDependencies

# Update to compatible versions
npm install package@compatible-version
```

**For Legacy Codebases:**
```bash
# If you inherited a project with --legacy-peer-deps
# 1. Document the technical debt
# 2. Plan a migration strategy
# 3. Use npm-check-updates to find safe upgrades
npx npm-check-updates -u
npm install
```

#### 3. Common Scenarios and Solutions

| Symptom | Wrong Fix | Right Fix |
|---------|-----------|-----------|
| React version mismatch | --legacy-peer-deps | Align all packages to same React version |
| Expo SDK conflicts | --legacy-peer-deps | Use `expo install` for Expo-compatible versions |
| TypeScript conflicts | --legacy-peer-deps | Update to consistent TS version across packages |
| Build tool conflicts | --legacy-peer-deps | Align webpack/babel/metro versions |

### When --legacy-peer-deps Might Be Acceptable (Rare)

Only consider `--legacy-peer-deps` when **ALL** of these are true:
1. You're maintaining a legacy system that cannot be updated
2. You've documented the specific incompatibility
3. You've created a migration plan to remove it
4. You've tried all other solutions first
5. It's a temporary measure with a removal date

### The Hidden Costs of --legacy-peer-deps

1. **Security vulnerabilities** - Outdated deps often have CVEs
2. **Performance issues** - Multiple versions of same library loaded
3. **Bundle size bloat** - Duplicate code from conflicting versions
4. **Future migration pain** - Technical debt compounds
5. **Team confusion** - "Why doesn't this work like the docs say?"

### Automated Detection

Add this to your CI/CD pipeline:
```json
// package.json
{
  "scripts": {
    "preinstall": "node ./scripts/check-legacy-deps.js"
  }
}
```

```javascript
// scripts/check-legacy-deps.js
if (process.env.npm_config_legacy_peer_deps === 'true') {
  console.error('🚨 ERROR: --legacy-peer-deps detected!');
  console.error('This is almost always wrong. Investigate the real issue.');
  console.error('See: research/tech/npm-dependency-management.md');
  process.exit(1);
}
```

### Research Triggers

If you encounter any of these, stop and research:
- `npm ERR! peer dep missing`
- `npm ERR! ERESOLVE unable to resolve dependency tree`
- `--force` or `--legacy-peer-deps` suggestions
- `Cannot resolve peer dependency`
- Multiple versions of React/React Native in `npm ls`

### Example: React Native Project Gone Wrong

```bash
# 🚨 BAD - What often happens
npm install some-package
# Error: peer dependency conflict with React 18 vs 17
npm install --legacy-peer-deps  # "Quick fix"
# Months later: mysterious bugs, can't upgrade anything

# ✅ GOOD - What should happen
npm install some-package
# Error: peer dependency conflict
npm ls react  # Find what needs React 17
# Either:
# 1. Find React 18 compatible version
npm install some-package@latest
# 2. Or use Expo's resolver
npx expo install some-package
# 3. Or replace with better maintained package
```

### The Golden Rule

> **If npm suggests --legacy-peer-deps, it's telling you to stop and think, not to add the flag.**

### References
- [npm Documentation on peer dependencies](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#peerdependencies)
- [Understanding peer dependencies](https://nodejs.org/en/blog/npm/peer-dependencies)
- [Expo's approach to dependency management](https://docs.expo.dev/workflow/using-libraries/)

---
*Last updated: 2025-08-10*
*Critical: This is a blocking issue that requires investigation before proceeding*