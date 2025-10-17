# Proposed Improvements to execute-task.md - State Management Guidance

**Date**: 2025-10-05
**Issue**: State management guidance (Legend-State vs Context vs hooks) is buried in the middle of the document and was missed during implementation

## Problem

During the attributes system implementation, I incorrectly used React Context API instead of Legend-State for cross-feature state management. The guidance exists in execute-task.md but wasn't prominent enough to catch during execution.

## Proposed Changes

### 1. Add "State Management Decision Tree" Section Early

**Location**: After Phase 2, before Phase 3 (TDD Execution)

```markdown
## CRITICAL: State Management Architecture Decision

Before implementing ANY stateful feature, follow this decision tree:

### State Management Hierarchy (MANDATORY)

**Decision Flow:**
1. **Is state used by only one component?**
   - YES → Use `useState` in component
   - NO → Continue to step 2

2. **Is the logic complex or reusable?**
   - YES → Continue to step 3
   - NO → Use `useState` with inline logic

3. **Is state shared across multiple features/modules?**
   - YES → Use **Legend-State store** (`featureStore.ts`)
   - NO → Use **Custom Hook** (`useFeatureName.ts`)

### State Management Hierarchy Table

| State Type | Example | Solution | File |
|------------|---------|----------|------|
| Component-local, simple | Button clicked state | `useState` | In component |
| Component-local, complex | Form validation logic | Custom hook | `useFormValidation.ts` |
| Cross-feature shared | Attributes affecting damage | Legend-State | `attributesStore.ts` |
| Global app config | Theme, settings | Legend-State | `settingsStore.ts` |

### NEVER Use
- ❌ React Context API for state management (use Legend-State)
- ❌ Service classes (use hooks or stores)
- ❌ Redux, MobX, or other state libraries (use Legend-State)

### Example Scenarios

**Attributes System** (affects damage, crits, offline progression):
```typescript
// ✅ CORRECT: Legend-State store
// frontend/modules/attributes/attributesStore.ts
import { observable } from '@legendapp/state';

export const attributes$ = observable({
  strength: 0,
  coordination: 0,
  endurance: 0
});

export const getDamageBonus = () => attributes$.strength.get() * 5;
```

**Enemy Health** (single component):
```typescript
// ✅ CORRECT: useState
function Enemy() {
  const [health, setHealth] = useState(1000);
  // ...
}
```

**Complex Animation** (isolated but complex):
```typescript
// ✅ CORRECT: Custom hook
// frontend/modules/combat/useEnemyAnimation.ts
export const useEnemyAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  // Complex animation logic
  return { isAnimating, triggerAnimation };
};
```
```

---

### 2. Add to Pre-execution Checklist

**Location**: Phase 3, Step 1 (Pre-execution Check), around line 61

```bash
# Check for existing state management (BEFORE creating new files)
echo "Checking for existing state management patterns..."

# Check for Legend-State stores
find src/modules/*/[feature]Store.ts 2>/dev/null

# Check for custom hooks
find src/modules/*/use*.ts 2>/dev/null

# Check for React Context (should be avoided for state)
grep -r "createContext" src/modules/ 2>/dev/null && echo "⚠️ WARNING: Context found - consider Legend-State instead"
```

**Add validation step:**
```markdown
### Pre-implementation State Management Check

BEFORE writing any code, answer:

1. **Will this state be accessed by multiple components?**
   - If YES → Plan for Legend-State store
   - If NO → Can use hooks or useState

2. **Does existing state management exist for this feature?**
   - Check: `src/modules/[feature]/*Store.ts`
   - Check: `src/modules/[feature]/use*.ts`

3. **What features will consume this state?**
   - List all components/modules that need access
   - If list > 1 feature → Legend-State required
```

---

### 3. Create "Common Pitfalls" Section

**Location**: Near the top, after CRITICAL architecture rules (before Phase 1)

```markdown
## ⚠️ COMMON STATE MANAGEMENT PITFALLS TO AVOID

### Anti-Patterns (What NOT to do)

1. **DON'T use React Context** for cross-feature state
   ```typescript
   // ❌ WRONG
   const AttributeContext = createContext();

   // ✅ RIGHT
   import { observable } from '@legendapp/state';
   export const attributes$ = observable({ strength: 0 });
   ```

2. **DON'T create service classes** for state management
   ```typescript
   // ❌ WRONG
   class AttributeService {
     private strength = 0;
     getAllocate() { ... }
   }

   // ✅ RIGHT
   export const useAttributes = () => {
     const [strength, setStrength] = useState(0);
     // ...
   };
   ```

3. **DON'T pass callbacks through multiple components** (prop drilling)
   ```typescript
   // ❌ WRONG
   <App>
     <GameScreen onDamage={handleDamage}>
       <Enemy onHit={onDamage}>
         <HealthBar />
       </Enemy>
     </GameScreen>
   </App>

   // ✅ RIGHT - Use Legend-State
   import { combat$ } from './combatStore';
   combat$.dealDamage(amount);
   ```

4. **DON'T lift state up unnecessarily**
   ```typescript
   // ❌ WRONG - Lifting everything to App
   function App() {
     const [enemyHealth, setEnemyHealth] = useState(1000);
     const [attributes, setAttributes] = useState({...});
     const [inventory, setInventory] = useState([]);
     // Passing all as props...
   }

   // ✅ RIGHT - Use stores for shared state
   // Each module manages its own store
   ```

### Red Flags That You Need Legend-State

You should use Legend-State when you observe any of these:

- ⚠️ Multiple components need to read the same state
- ⚠️ State changes in one component must affect another component
- ⚠️ You're considering creating a React Context
- ⚠️ You're passing callbacks through 2+ component levels
- ⚠️ Different features need to coordinate based on shared data
- ⚠️ You type `createContext` or `useContext`

### When NOT to Use Legend-State

Keep it simple with hooks/useState when:

- ✅ State is only used within a single component
- ✅ State doesn't need to persist
- ✅ No other components care about this state
- ✅ Logic is simple and doesn't need extraction

### Real Examples from This Project

| Feature | State Type | Solution | Why |
|---------|------------|----------|-----|
| **Attributes** (strength/coord/end) | Cross-feature | Legend-State store | Combat, UI, offline all need access |
| **Enemy health** | Component-local | useState | Only Enemy component cares |
| **Weakness spot position** | Component-local | useState | Only WeaknessSpot component |
| **Player inventory** | Cross-feature | Legend-State store | Multiple screens access |
| **Form input** | Component-local | useState | Single form component |
```

---

### 4. Expand Component Structure Section with Store Guidance

**Location**: Around line 307-317 (Component Structure)

```markdown
### Component Structure (with co-located tests)

```
src/modules/[feature]/
├── ComponentName.tsx
├── ComponentName.test.tsx      # Test co-located with component
├── useFeature.ts               # Hook (for complex local logic)
├── useFeature.test.ts          # Hook test (co-located)
├── featureStore.ts             # Legend-State store (when shared across features)
├── featureStore.test.ts        # Store test (co-located)
└── feature.types.ts            # TypeScript types
```

### When to Create Each File Type

#### featureStore.ts (Legend-State Store)
**Create when:**
- Multiple features/modules need access to this state
- State affects behavior of unrelated components
- State needs persistence across app lifecycle

**Examples from this project:**
```typescript
// attributesStore.ts - Used by combat, UI, offline progression
export const attributes$ = observable({
  strength: 0,
  coordination: 0,
  endurance: 0,
  unallocatedPoints: 0
});

// inventoryStore.ts - Used by inventory screen, combat, shop
export const inventory$ = observable({
  items: [],
  gold: 0
});

// settingsStore.ts - Used by all screens
export const settings$ = observable({
  soundEnabled: true,
  theme: 'dark'
});
```

#### useFeature.ts (Custom Hook)
**Create when:**
- Logic is complex but only used in one feature
- You want to extract reusable logic from components
- State is local but calculations are complex

**Examples:**
```typescript
// useEnemyAnimation.ts - Complex but isolated to combat
export const useEnemyAnimation = () => {
  const [state, setState] = useState('idle');
  // Complex animation logic
};

// useFormValidation.ts - Complex validation, single form
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  // Validation logic
};
```

### Quick Reference: State Management Files

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `featureStore.ts` | Shared across features | `attributesStore.ts` (combat + UI + offline) |
| `useFeature.ts` | Complex logic, single feature | `useEnemyAnimation.ts` (combat only) |
| `useState` in component | Simple, component-local | Button click states |
```

---

### 5. Add Quick Reference at the Very Top

**Location**: Right after the command description (around line 10)

```markdown
---

## 🚀 QUICK DECISION REFERENCE

### Before Writing Any Code

**State Management Decision:**
- **Single component?** → `useState` in component
- **Complex logic?** → Custom hook (`useFeatureName.ts`)
- **Multiple features?** → **Legend-State store** (`featureStore.ts`)

**File Organization:**
- ✅ Tests co-located with implementation (`.test.tsx`)
- ✅ No barrel exports (`index.ts`)
- ❌ No `__tests__` folders
- ❌ No React Context for state

**Testing:**
- ✅ Write test FIRST (RED)
- ✅ Implement minimal code (GREEN)
- ✅ Refactor with tests passing (REFACTOR)

**Legend-State Guide**: See `/docs/research/expo_legend_state_v3_guide_20250917_225656.md`

---
```

---

## Implementation Checklist

To apply these changes to `.claude/commands/execute-task.md`:

- [ ] Add Quick Reference at top (after command description)
- [ ] Add Common Pitfalls section (after CRITICAL rules)
- [ ] Add State Management Decision Tree (before Phase 3)
- [ ] Update Pre-execution Check with state management validation
- [ ] Expand Component Structure section with store examples
- [ ] Add cross-references to Legend-State guide document

## Expected Outcome

After these changes, developers (AI and human) should:

1. **Immediately see** state management decision rules
2. **Not miss** Legend-State for cross-feature state
3. **Understand** when to use stores vs hooks vs useState
4. **Avoid** React Context API for state management
5. **Reference** the decision tree before implementation

## Testing the Changes

After updating execute-task.md, test by:

1. Running `/execute-task` on a new feature that needs shared state
2. Verify the agent chooses Legend-State over Context
3. Ensure decision tree is referenced early in execution
4. Check that pitfalls section prevents anti-patterns

---

*This document should be used to update `.claude/commands/execute-task.md`*