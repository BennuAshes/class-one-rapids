---
description: "Refactors a specific solution into its own module"
argument-hint: "<feature-description>"
---
# Refactor Feature to Module

Refactor the $ARGUMENTS feature into its own module following the project's modular architecture patterns.

## Process

1. **Analyze Current Implementation**
   - Identify all components, hooks, and utilities related to the feature
   - Map out dependencies and shared resources
   - Note any state management patterns currently in use

2. **Create Module Structure**
   Following the patterns in `/docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md` and `/docs/architecture/file-organization-patterns.md`:
   - Create a new feature module under `frontend/modules/[feature-name]/`
   - Structure should include:
     - `index.tsx` - Main feature component export
     - `components/` - Feature-specific components
     - `hooks/` - Custom hooks for the feature
     - `types.ts` - TypeScript definitions
     - `utils/` - Helper functions (if needed)

3. **Migrate State Management**
   Based on `/docs/architecture/state-management-hooks-guide.md` and `/docs/architecture/expo_legend_state_v3_finegrained_guide_20250917_230000.md`:
   - Extract feature-specific state into dedicated hooks
   - Use Legend State patterns for reactive state management
   - Ensure proper separation of concerns

4. **Update Imports**
   - Update all imports throughout the codebase
   - Ensure no circular dependencies
   - Update barrel exports if needed

5. **Test Integration**
   - Verify the refactored module works correctly
   - Check that all existing functionality is preserved
   - Ensure no breaking changes to other features

## Guidelines

- Follow existing project patterns and conventions
- Maintain backwards compatibility where possible
- Keep the module self-contained but extensible
- Document any public APIs or interfaces
- Consider performance implications of the refactor

## References

- See `/docs/guides/lean-task-generation-guide.md` for task breakdown approach
- Check `/docs/architecture/working-directory-context.md` for project structure context
- Review existing modules in `frontend/modules/` for consistent patterns