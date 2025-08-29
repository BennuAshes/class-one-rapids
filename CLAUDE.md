# General
- Don't guess
- Ask questions if you're not confident about something
- Be blunt, honest, and direct at all times
- Never use meaningless platitudes or acknowledgments about learning/changing
- If you make an error, state the error concisely without explanation or promises to improve
- roles are located at the root in the /roles/ folder
- do not look in archive/ folders unless explicitly told to
- do not read files in archive/ folders unless explicitly told to
- use functional programming styles by default - avoid using classes

- Example:
```typescript
// Good
export function doSomething() {}

// Bad
class Something {
  doSomething() {}
}
```
# State Management Rules
- **ALWAYS use Feature State with Computed Integration pattern**:
  - Each feature owns its state in a `state.ts` file
  - Cross-feature calculations go in `game-state/` folder
  - Never directly import another feature's state from within a feature
- **NEVER create centralized monolithic state**:
  - Bad: Single `gameState$` with everything
  - Good: Separate `developmentState$`, `salesState$`, etc.
- **Use computed observables for ALL derived values**:
  - Don't calculate in components
  - Don't store derived values in state
  - Let Legend-state handle reactivity

Example:
```typescript
// GOOD - Feature owns its state
// features/development/state.ts
export const developmentState$ = observable({
  units: { juniorDevs: 5 }
})

// GOOD - Integration in game-state
// game-state/resources/code.ts  
export const codePerSecond$ = computed(() => {
  return developmentState$.units.juniorDevs.get() * 0.1
})

// BAD - Monolithic state
const gameState$ = observable({
  development: { units: {} },
  sales: { units: {} }
})
```

# Critical Anti-Patterns
- **NEVER use `npm install --legacy-peer-deps`** - This masks version conflicts and indicates deeper problems
- If npm suggests --legacy-peer-deps, STOP and investigate the real issue
- **NEVER use git commands that modify the repository** unless explicitly requested:
  - No `git add`, `git commit`, `git push`, `git merge`, `git rebase`
  - No `git checkout`, `git branch`, `git tag`
  - Read-only commands are OK: `git status`, `git log`, `git diff`, `git show`
- Version control modifications are managed at a higher level

# Project Directory Management
- **NEVER create project artifacts in the root directory** (/mnt/c/dev/class-one-rapids/)
- All project artifacts MUST be created within `/project/`
- Before creating any files or folders:
  1. Check current directory with `pwd`
  2. If in root, navigate to appropriate project: `cd project/`
  3. Verify you're in the correct location before proceeding
- When executing workflows, always specify paths relative to the project directory
- Examples of artifacts that MUST be in project directories:
  - runbook/ folders
  - Application code folders (src, package.json, etc.)
  - PRD files (*.md)
  - Technical requirements documents
  - Any generated code or documentation

# Testing & Validation
- Some common commands hang the terminal. Be careful using these, as they stop your flow.