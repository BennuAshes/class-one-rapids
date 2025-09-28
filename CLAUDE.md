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

## Project Specific
- When using npm, don't install specific versions unless its to fix a known compatibilty issue or to use a stable beta version thats recommended by the vendor


## Testing and Configuration Files
- NEVER remove or replace code from test setup files (jest.setup.js, setupTests.js, etc.) without understanding its purpose
- When you see mock configurations or polyfills in setup files,
assume they're fixing framework-specific issues
- If you need to add mocks, ADD them to existing setup code, don't replace it
- Before modifying any configuration file, explain what the existing code does and why you're changing it

## Code Modification Guidelines
- When encountering code you don't fully understand (especially configuration/setup code), either:
  1. Leave it unchanged and work around it
  2. Ask the user about its purpose before modifying
  3. Add your changes without removing existing code
  - Be especially careful with:
  - jest.setup.js / setupTests.js
  - babel.config.js
  - webpack.config.js
  - tsconfig.json
  - Package.json scripts and configurations