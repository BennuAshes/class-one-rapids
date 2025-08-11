# Project Iteration Quick Start

## Version Information
- **Current Version**: v9
- **Previous Version**: v8
- **Created**: 2025-08-10
- **Archive Location**: `projects/archive/pet-software-idler-v9/`

## Workflow Status
✅ Project initialized
⏳ PRD pending
⏳ Technical analysis pending
⏳ Runbook pending

## Key Improvements in v9
- **Fixed quick-ref.md**: Now includes full semantic context with implementation details and anti-patterns
- **Vertical Slicing Clarity**: Explicitly shows `features/{name}/state/store.ts` pattern
- **Anti-pattern Documentation**: Clear examples of what NOT to do (e.g., no centralized gameStore.ts)
- **Expo Router Structure**: Clarified that `app/` directory is required, not `src/`

## Next Steps

### To start the full workflow:
1. Run `/generate-advanced-prd design-doc.md`
2. Run `/analyze-prd-technical-requirements [prd-file]`
3. Run `/create-development-runbook-v2 [tech-requirements-file]`
4. Run `/follow-runbook-with-senior-engineer ./runbook/`

### Key Architecture Fixes Needed:
1. **Split centralized gameStore.ts** into feature-specific stores:
   - `features/departments/state/departmentStore.ts`
   - `features/player/state/playerStore.ts`
   - `features/progression/state/progressionStore.ts`
   - `features/settings/state/settingsStore.ts`

2. **Use app/ directory structure** for Expo Router:
   ```
   app/
   ├── (tabs)/
   │   ├── _layout.tsx
   │   ├── index.tsx
   │   └── [feature].tsx
   ├── _layout.tsx
   └── +not-found.tsx
   ```

3. **Implement Legend State observable pattern** per feature:
   ```typescript
   import { observable } from '@legendapp/state/react';
   
   export const featureStore = observable({
     // Feature-specific state only
   });
   ```

## Research Integration
All commands automatically use the enhanced `research/quick-ref.md` which now includes:
- Full semantic context preservation
- Implementation patterns with code examples
- Anti-patterns to avoid architectural violations
- Performance targets and testing requirements

## Useful Commands
- Check progress: `cat runbook/progress.json` (after runbook creation)
- View runbook: `cat runbook/index.md` (after runbook creation)
- Run tests: `npm test` (after implementation)
- Start dev server: `npx expo start` (after implementation)

## ESLint Research Needed
One of the pending tasks is researching ESLint configuration for:
- React Native
- Expo SDK 52+
- TypeScript 5.3+
- Legend State integration

This will help with the self-correcting error recovery system.