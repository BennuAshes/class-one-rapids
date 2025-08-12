# Project Iteration Quick Start

## Version Information
- **Current Version**: v11
- **Previous Version**: v10
- **Created**: 2025-08-10

## Workflow Status
✅ Project initialized
⏳ PRD pending
⏳ Technical analysis pending
⏳ Runbook pending

## Next Steps

### Starting fresh from design doc:
1. Run `/generate-advanced-prd design-doc.md`
2. Run `/analyze-prd-technical-requirements [prd-file]`
3. Run `/create-development-runbook-v2 [tech-requirements-file]`
4. Run `/follow-runbook-with-senior-engineer ./runbook/`

### To validate architecture:
1. Run `/validate-architecture-alignment ./runbook/`

## Useful Commands
- Check progress: `cat runbook/progress.json`
- View runbook: `cat runbook/index.md`
- Run tests: `npm test`
- Start dev server: `npm start`

## Archive Location
Previous version archived at: `projects/archive/pet-software-idler-v11/`

## Research Integration
All commands automatically use optimized `research/quick-ref.md` for:
- Package versions (@beta tags preserved)
- Architecture patterns (vertical slicing enforced)
- Performance optimizations (40% improvements)

## New Research Available
The latest research on **Legend State v3 Best Practices** has been added at:
`research/legend-state-v3-best-practices.md`

This includes:
- Performance benchmarks (fastest React state library)
- Fine-grained reactivity patterns
- MMKV integration (30x faster than AsyncStorage)
- TanStack Query integration
- TypeScript best practices
- Migration guide from v2 to v3
- Complete implementation examples