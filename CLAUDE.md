# General
- Ask questions if you have gaps in knowledge or have any doubts
- Avoid running git commands that can change the state, like git checkout or git stash. If something tells you to use something like git checkout or git stash, stop and ask for help before proceeding

## Task Generation - LEAN PRINCIPLES (CRITICAL)
When generating tasks from TDDs or PRDs, follow these lean principles:

### Core Rules
1. **NO infrastructure-only tasks** - Every task must deliver user-visible functionality
2. **First task = Simplest working feature** - User can interact with something in Task 1
3. **Just-in-time everything** - Create files/folders/dependencies only when implementing the feature that needs them
4. **Progressive enhancement** - Each task builds on the previous, adding one layer of complexity
5. **Always demo-able** - After each task, you could show working functionality to a user

### Task Validation Checklist
Before accepting any task, verify:
- [ ] User can DO something new after this task?
- [ ] Task includes TDD cycle (test first, implement, refactor)?
- [ ] Files/folders created only if needed for THIS feature?
- [ ] Dependencies installed only if used in THIS task?
- [ ] Could demo the result of this task?

### Example Good vs Bad Tasks
❌ **BAD**: "Set up project folder structure"
✅ **GOOD**: "Implement tap-to-damage in App.tsx - user can tap enemy to reduce health"

❌ **BAD**: "Install all project dependencies"
✅ **GOOD**: "Add floating damage numbers (installing react-native-reanimated for animations)"

See `/docs/guides/lean-task-generation-guide.md` for complete guide.

## Project Specific
- When using npm, don't install specific versions unless its to fix a known compatibilty issue or to use a stable beta version thats recommended by the vendor (like with legend-state)
- 