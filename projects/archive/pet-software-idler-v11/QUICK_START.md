# Project Iteration Quick Start

## Version Information
- **Current Version**: v10
- **Previous Version**: v9
- **Created**: 2025-08-10
- **Archive Location**: `projects/archive/pet-software-idler-v10/`

## Workflow Status
✅ Project initialized
⏳ PRD pending
⏳ Technical analysis pending
⏳ Runbook pending

## Key Improvements in v10
- **Enhanced dependency management research**: Added comprehensive npm-dependency-management.md
- **Critical anti-pattern enforcement**: `--legacy-peer-deps` now flagged as top anti-pattern
- **Context-engineered quick-ref**: Regenerated with full semantic preservation (737 tokens total)
- **Research coverage**: Now includes TanStack Query v5, modern TypeScript configs, game loop patterns

## Next Steps

### To start the full workflow:
1. Run `/generate-advanced-prd design-doc.md`
2. Run `/analyze-prd-technical-requirements [prd-file]`
3. Run `/create-development-runbook-v2 [tech-requirements-file]`
4. Run `/follow-runbook-with-senior-engineer ./runbook/`

### Critical Architecture Requirements (from enhanced research):
1. **NEVER use `npm install --legacy-peer-deps`** - Always use `npx expo install` for Expo projects
2. **Vertical slicing pattern**: `features/[feature]/index.ts` not horizontal layers
3. **Expo SDK ~53.0.0** with React Native 0.79.x (New Architecture default)
4. **TypeScript ^5.8.0** with `nodenext` module resolution
5. **TanStack Query ^5.0.0** with breaking API changes from v4

## Research Integration
The enhanced `research/quick-ref.md` now includes:
- **L1 Critical (181 tokens)**: Top packages, patterns, anti-patterns
- **L2 Implementation (467 tokens)**: Code examples, configurations
- **L3 Reference (89 tokens)**: Source file links with line numbers
- **Total: 737 tokens** with full semantic preservation

## Dependency Management Guidelines
From the new npm-dependency-management.md research:
- **Red flag**: npm suggesting `--legacy-peer-deps` means deeper issues
- **Solution**: Use `npx expo install` for automatic version resolution
- **Debug**: `npm ls <package>` to find conflicts
- **Fix**: `npx expo doctor --fix-dependencies`

## Useful Commands
- Check progress: `cat runbook/progress.json` (after runbook creation)
- View runbook: `cat runbook/index.md` (after runbook creation)
- Run tests: `npm test` (after implementation)
- Start dev server: `npx expo start` (after implementation)
- Check dependencies: `npx expo doctor`