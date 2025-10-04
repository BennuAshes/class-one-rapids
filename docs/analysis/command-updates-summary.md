# Command Updates Summary - Fixing Critical Issues

## Date: 2025-10-02

## Overview
Fixed the actual slash command definitions that were causing architectural problems in task generation and execution. These updates directly address the root causes identified in the reflection document.

## Key Updates Made

### 1. tasks.md Command Fixes

#### Added Working Directory Context (Lines 13-17)
```markdown
## CRITICAL: Working Directory Context
**You are operating in**: `c:\dev\class-one-rapids\frontend\`
**All paths are relative to the frontend directory**
**NEVER create `frontend/frontend/` nested structures**
**The correct structure is**: `src/modules/[feature]/` (relative to frontend dir)
```

#### Fixed Folder Structure (Lines 27-62)
- Added explicit warnings against barrel exports
- Emphasized co-located tests (NOT in `__tests__` directories)
- Changed "services" to "hooks" throughout
- Added Legend-State as preferred state management

#### Key Changes:
- ❌ Removed: `├── services/` (use hooks instead)
- ❌ Removed: barrel export patterns
- ✅ Added: Test files co-located (`.test.tsx` next to `.tsx`)
- ✅ Added: Explicit "NO barrel exports" warning
- ✅ Added: "Hook (NOT service)" annotations

### 2. execute-task.md Command Fixes

#### Added Path Verification Steps (Lines 14-22)
```markdown
## CRITICAL: Working Directory Context
**You are operating in**: `c:\dev\class-one-rapids\frontend\`
**All paths are relative to the frontend directory**
**NEVER create `frontend/frontend/` nested structures**

### Before ANY file creation:
1. Run `pwd` to verify you're in the frontend directory
2. Use `ls` to check if parent directories exist
3. Create files at `src/modules/[feature]/` NOT `frontend/src/modules/[feature]/`
```

#### Fixed Test Locations (Lines 61-68)
- Changed from `src/__tests__/` to co-located tests
- Changed from "services" to "hooks"
- Added explicit comments about co-location

#### Added State Management Guidance (Lines 99-103)
```markdown
**State Management Priority**:
1. Start with `useState` for component-local state
2. Extract to custom hooks (e.g., `useEnemy()`) when logic gets complex
3. Use Legend-State ONLY when state needs sharing across features
4. NEVER create service classes - use hooks for stateful logic
```

#### Fixed Component Structure Example (Lines 309-316)
- Removed `featureService.ts`
- Added `feature.types.ts` and `feature.store.ts`
- Emphasized hooks over services

## Why These Changes Matter

### Before:
- Commands would create `frontend/frontend/src/modules/` nested structures
- Encouraged barrel exports (index.ts files)
- Suggested service classes instead of hooks
- Put tests in separate `__tests__` directories

### After:
- Clear working directory context prevents nesting
- Explicit prohibition of barrel exports
- Hooks-first approach aligns with React best practices
- Co-located tests improve maintainability

## Impact on Task Generation

When `/tasks` is run now, it will:
1. Generate tasks that create files in the correct location
2. NOT suggest creating barrel exports
3. Use hooks instead of services
4. Place tests next to implementation files

When `/execute-task` is run now, it will:
1. Verify working directory before creating files
2. Create hooks, not services
3. Write co-located tests
4. Follow React's functional paradigm

## Verification Steps

To verify these changes work:
1. Run `/tasks` on a new TDD - check that no barrel exports are mentioned
2. Run `/execute-task` - verify files are created in `frontend/src/`, not `frontend/frontend/src/`
3. Check that generated code uses hooks, not services
4. Confirm tests are co-located with implementation files

## Comparison: CLAUDE.md vs Command Updates

### Why Command Updates Were Critical:
- **CLAUDE.md**: General guidance that can be overridden
- **Commands**: Actual execution instructions that directly control behavior
- **Commands contain their own examples**: These examples were showing the wrong patterns

### What Was Updated Where:
- **CLAUDE.md**: Added context and principles (good for reference)
- **Commands**: Fixed the actual generation templates and examples (controls execution)

## Next Steps

These command updates should immediately fix:
1. ✅ Nested directory creation issues
2. ✅ Barrel export anti-pattern
3. ✅ Service class instead of hooks
4. ✅ Separate test directories

No further updates to CLAUDE.md are needed since the commands now have the correct context and patterns embedded directly where they're executed.