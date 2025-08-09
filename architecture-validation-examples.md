# Architecture Validation System - Example Scenarios

## How the Enhanced System Works

The architecture validation system now operates exactly like package validation - automatically extracting rules from research and applying them during development.

## Example 1: PetSoft Tycoon Current State Validation

### Input
```bash
/validate-architecture-alignment projects/pet-software-idler/PetSoftTycoon --fix
```

### What Happens

1. **Load Rules**: System loads `research-requirements.json` with architecture rules
2. **Scan Project**: Detects current violations:
   - ❌ Monolithic state in `/src/app/store/gameStore.ts`
   - ❌ Empty feature folders in `/src/features/`
   - ❌ No feature-specific state management

3. **Auto-Corrections Applied**:

#### Fix 1: Split Monolithic State
```typescript
// DELETED: src/app/store/gameStore.ts (monolithic)

// CREATED: src/features/resources/state/resourceState.ts
import { observable } from '@legendapp/state'

export const resourceState$ = observable({
  linesOfCode: 0,
  features: 0,
  money: 0,
  customerLeads: 0
})

// CREATED: src/features/departments/state/departmentState.ts
export const departmentState$ = observable({
  development: { /* ... */ },
  sales: { /* ... */ }
})

// CREATED: src/features/prestige/state/prestigeState.ts
export const prestigeState$ = observable({
  investorPoints: 0,
  totalPrestigesCompleted: 0,
  permanentBonuses: { /* ... */ }
})

// UPDATED: src/app/store/index.ts (composition only)
import { resourceState$ } from '@features/resources/state'
import { departmentState$ } from '@features/departments/state'
import { prestigeState$ } from '@features/prestige/state'

export const gameState$ = observable({
  resources: resourceState$,
  departments: departmentState$,
  prestige: prestigeState$
})
```

#### Fix 2: Populate Empty Features
```
src/features/codeProduction/
  ├── components/
  │   ├── CodeEditor.tsx
  │   └── index.ts
  ├── hooks/
  │   ├── useCodeProduction.ts
  │   └── index.ts
  ├── services/
  │   ├── codeGenerationService.ts
  │   └── index.ts
  ├── state/
  │   ├── codeProductionState.ts
  │   └── index.ts
  └── index.ts
```

### Generated Report
```markdown
# Architecture Validation Report

## Summary
- **Project**: projects/pet-software-idler/PetSoftTycoon
- **Date**: 2025-08-08
- **Mode**: auto-fix
- **Overall Status**: FIXED
- **Total Violations**: 8
- **Auto-Fixed**: 8

## Violations Fixed

### State Management (3 fixed)
| Violation | File | Fix Applied |
|-----------|------|-------------|
| Monolithic state | gameStore.ts | ✅ Split into 4 feature observables |
| Missing feature state | codeProduction | ✅ Created codeProductionState.ts |
| Missing feature state | departments | ✅ Created departmentState.ts |

### Folder Structure (5 fixed)
| Violation | Location | Fix Applied |
|-----------|----------|-------------|
| Empty feature | /features/codeProduction | ✅ Populated with full structure |
| Empty feature | /features/departments | ✅ Populated with full structure |
| Empty feature | /features/achievements | ✅ Populated with full structure |
| Empty feature | /features/prestige | ✅ Populated with full structure |
| Missing hooks | All features | ✅ Created hook directories |
```

## Example 2: During Runbook Execution

### When `/follow-runbook-with-senior-engineer` runs:

```bash
Task 1.3.1: Initialize Legend State Store
Creating src/app/store/gameStore.ts...

⚠️ ARCHITECTURE VIOLATION DETECTED
Rule: stateManagement.modular-observables
Source: research/tech/legend-state.md:606-631
Issue: Attempting to create monolithic state store

✅ AUTO-CORRECTION APPLIED:
Instead of single gameStore.ts, created:
- features/resources/state/resourceState.ts
- features/departments/state/departmentState.ts
- features/prestige/state/prestigeState.ts
- app/store/index.ts (composition only)

Log: "Applied modular observable pattern from research"
Continuing with corrected architecture...
```

## Example 3: Validation-Only Mode

### Input
```bash
/validate-architecture-alignment projects/my-app --verbose
```

### Output (No Fixes, Just Report)
```markdown
# Architecture Validation Report

## Summary
- **Mode**: validate-only
- **Total Violations**: 12
- **Action Required**: Run with --fix to auto-correct

## Violations Found

### ❌ Folder Structure Issues
1. Root-level `/src/services` folder
   - Should be: `/src/features/*/services`
   - Research: vertical-slicing.md:83-84

2. Root-level `/src/utils` folder
   - Should be: Feature-specific hooks
   - Research: react-native.md:1589-1614

### ❌ State Management Issues
1. Single Redux store with slices
   - Should be: Modular Legend State observables
   - Research: legend-state.md:606-631

### ❌ Component Organization Issues
1. Components organized by type (`/components/buttons/`)
   - Should be: Feature-scoped components
   - Research: vertical-slicing.md:16-19

## To Fix
Run: /validate-architecture-alignment projects/my-app --fix
```

## Integration Benefits

### 1. **Seamless Workflow Integration**
- Works automatically during `/follow-runbook-with-senior-engineer`
- No manual intervention needed
- Same JSON-based system as packages

### 2. **Research-Driven Corrections**
- All rules extracted from research files
- Every correction references research source
- Maintains consistency with documented patterns

### 3. **Transparent Operations**
```
✅ Package correction: @legendapp/state → @legendapp/state@beta
   Source: research/tech/legend-state.md

✅ Architecture correction: monolithic store → modular observables
   Source: research/tech/legend-state.md:606-631
```

### 4. **Progressive Enhancement**
- Start with validation-only to understand issues
- Apply --fix when ready for corrections
- Review changes in version control
- All corrections are logged and reversible

## Command Usage Summary

### In Runbook Generation
```bash
/create-development-runbook-v2 ./prd.md
# Automatically extracts architecture rules
# Creates research-requirements.json with architectureRules
```

### During Development
```bash
/follow-runbook-with-senior-engineer ./runbook/
# Automatically validates architecture during execution
# Auto-corrects violations in real-time
# Logs all corrections
```

### For Existing Projects
```bash
/validate-architecture-alignment ./my-project
# Reports violations

/validate-architecture-alignment ./my-project --fix
# Auto-corrects violations
```

## Key Advantages

1. **No New Gates** - Uses existing validation flow
2. **Automatic** - No manual rule writing
3. **Research-Based** - All rules from research files
4. **Transparent** - Clear logging with sources
5. **Reversible** - All changes trackable in git
6. **Educational** - Teaches patterns through corrections