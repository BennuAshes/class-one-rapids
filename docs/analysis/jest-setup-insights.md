# Jest Setup Insights and Best Practices

## Date: 2025-09-22
## Context: React Native + Expo + Jest Configuration Issues

## Problem Summary
When setting up Jest testing for an Expo React Native project using React 19, we encountered version compatibility issues between:
- React 19.1.0 (bleeding edge)
- jest-expo expecting Jest 27-29
- React Test Renderer version mismatches
- Testing libraries not yet compatible with React 19

## Root Causes

### 1. Version Mismatch Chain
```
React 19.1.0
  → react-test-renderer@19.1.1 (requires exact React version)
    → @testing-library/react-native expects older versions
      → jest-expo includes jest-watch-typeahead
        → Expects Jest 27-29, but Jest 30 was installed
```

### 2. NPM Dependency Resolution
- NPM tried to install latest versions by default
- Peer dependency conflicts cascaded through the dependency tree
- `--legacy-peer-deps` masked issues but didn't solve them

## Lessons Learned

### 1. **Check Version Compatibility First**
Before installing any testing libraries, verify compatibility:
```bash
# Check Expo SDK requirements
npx expo doctor

# Check package versions before installing
npm view [package] versions
npm view [package] peerDependencies
```

### 2. **Use Expo's Package Manager**
For Expo projects, always use Expo's installer:
```bash
# Good - Expo manages compatibility
npx expo install jest-expo jest @testing-library/react-native

# Risky - May install incompatible versions
npm install jest @testing-library/react-native
```

### 3. **Version Lock Strategy**
Create a known-working configuration:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-expo": "~50.0.0",
    "@testing-library/react-native": "^12.4.0",
    "react-test-renderer": "18.2.0"
  }
}
```

### 4. **Bleeding Edge Risks**
React 19 (released late 2024) issues:
- Testing ecosystem hasn't caught up
- Many libraries still targeting React 18
- Production projects should use React 18.2.x for stability

## Prevention Strategies

### 1. Project Setup Checklist
```markdown
- [ ] Check Expo SDK version first
- [ ] Verify React/React Native compatibility matrix
- [ ] Use `npx expo install` for Expo-managed packages
- [ ] Write and run simple test immediately
- [ ] Commit working configuration before adding deps
- [ ] Document exact working versions
```

### 2. Test Early Pattern
```javascript
// Always create this test first
// __tests__/setup.test.js
test('testing setup works', () => {
  expect(true).toBe(true);
});
```
Run immediately after setup to catch configuration issues.

### 3. Fallback Testing Strategies
When Jest setup is problematic:

#### Option A: Direct TypeScript Testing
```typescript
// verify-logic.ts
import { MyService } from './MyService';
const service = new MyService();
console.assert(service.method() === expected, 'Test failed');
```

#### Option B: Use Vitest (Modern Alternative)
```bash
npm install -D vitest @vitest/ui
```
- Faster than Jest
- Better TypeScript support
- Compatible with Jest API

#### Option C: Separate Business Logic Testing
- Test pure business logic separately from React components
- Use Node's built-in test runner for simple cases

### 4. Version Compatibility Matrix

| Expo SDK | React Native | React | Jest | jest-expo | Testing Library |
|----------|--------------|-------|------|-----------|-----------------|
| 54.x | 0.81.x | 19.x | 29.x | 54.x | 12.x+ |
| 50.x | 0.73.x | 18.2.x | 29.x | 50.x | 12.x |
| 49.x | 0.72.x | 18.2.x | 29.x | 49.x | 12.x |

### 5. Recovery Steps When Tests Won't Run

1. **Clean slate approach:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check for multiple Jest versions:**
```bash
npm ls jest
# Look for version conflicts
```

3. **Verify babel configuration:**
```javascript
// babel.config.js for Expo
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

4. **Use exact versions:**
```bash
npm install --save-dev --save-exact jest@29.7.0
```

## Working Configuration Template

For new Expo projects with testing (as of 2025-09):

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0"
  },
  "devDependencies": {
    "jest": "29.7.0",
    "jest-expo": "~50.0.0",
    "@testing-library/react-native": "^12.4.0",
    "react-test-renderer": "18.2.0",
    "@types/jest": "^29.5.0",
    "typescript": "~5.3.0"
  }
}
```

## Alternative: Minimal Testing Setup

For projects where Jest is problematic, use this minimal approach:

1. **Business Logic Tests Only**
```typescript
// Use Node's test runner (Node 18+)
import { test } from 'node:test';
import assert from 'node:assert';

test('business logic', () => {
  assert.strictEqual(calculate(2, 3), 5);
});
```

2. **E2E Testing with Detox**
- Bypasses unit test setup issues
- Tests actual app behavior
- More reliable for React Native

3. **Manual Verification Scripts**
- Create TypeScript verification scripts
- Run with `npx tsx script.ts`
- Quick feedback without test framework overhead

## Key Takeaways

1. **Version compatibility is critical** - Check before installing
2. **Use platform-specific installers** - `npx expo install` for Expo
3. **Test the test setup immediately** - Don't wait
4. **Document working configurations** - Save time later
5. **Have fallback strategies** - Not every project needs full Jest
6. **Avoid bleeding edge for production** - Stability > latest features
7. **Commit working setups** - Before adding more dependencies
8. **Consider alternatives** - Vitest, Node test runner, verification scripts

## Recommended Reading

- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library Migration Guide](https://callstack.github.io/react-native-testing-library/docs/migration)
- [Jest Configuration Docs](https://jestjs.io/docs/configuration)
- [Vitest - Modern Alternative](https://vitest.dev/)

## Future Considerations

As the ecosystem evolves:
- React 19 support will improve (wait 3-6 months)
- Consider Vitest for new projects
- Watch for Expo SDK updates that improve testing
- Keep a "golden" project template with working test setup

---

*This analysis based on real-world issues encountered setting up testing for a React Native Expo project with React 19 in September 2025.*