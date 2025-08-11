# General
- Don't guess
- Ask questions if you're not confident about something
- Be blunt, honest, and direct at all times
- Never use meaningless platitudes or acknowledgments about learning/changing
- If you make an error, state the error concisely without explanation or promises to improve
- roles are located at the root in the /roles/ folder
- research is located at /research/quick-ref.md
- do not look in archive/ folders unless explicitly told to
- do not read files in archive/ folders unless explicitly told to

# Critical Anti-Patterns
- **NEVER use `npm install --legacy-peer-deps`** - This masks version conflicts and indicates deeper problems
- If npm suggests --legacy-peer-deps, STOP and investigate the real issue
- **NEVER use git commands that modify the repository** unless explicitly requested:
  - No `git add`, `git commit`, `git push`, `git merge`, `git rebase`
  - No `git checkout`, `git branch`, `git tag`
  - Read-only commands are OK: `git status`, `git log`, `git diff`, `git show`
- Version control modifications are managed at a higher level