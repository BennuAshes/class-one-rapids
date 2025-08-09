# Project Iteration Quick Start

## Version Information
- **Current Version**: v8
- **Previous Version**: v7
- **Created**: 2025-08-09

## Workflow Status
✅ Project initialized
⏳ PRD pending
⏳ Technical analysis pending
⏳ Runbook pending

## Next Steps

### To start the workflow:
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
Previous version archived at: `projects/archive/pet-software-idler-v7/`

## Research Integration
All commands automatically use optimized `research/quick-ref.md` for:
- Package versions (@beta tags preserved)
- Architecture patterns (vertical slicing enforced)
- Performance optimizations (40% improvements)

## Quick Actions
Since you have a design-doc.md ready, your next command should be:
```
/generate-advanced-prd design-doc.md
```