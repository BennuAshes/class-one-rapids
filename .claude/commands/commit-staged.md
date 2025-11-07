# Commit Staged Files

Review staged files and commit with an appropriate message based on the changes.

## Instructions

1. Check what files are currently staged using `git status`
2. Review the changes summary using `git diff --cached --stat`
3. Analyze the nature and scope of the changes
4. Generate a descriptive commit message following conventional commit format:
   - Use appropriate type prefix (feat, fix, docs, refactor, chore, etc.)
   - Include a clear, concise subject line
   - Add bullet points detailing the key changes
   - Include context about the significance of the changes if applicable
5. Commit the staged files with the generated message

## Commit Message Format

```
<type>: <subject line>

- Detail 1
- Detail 2
- Detail 3
...

[Optional: Additional context paragraph]
```

## Common Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `test`: Test additions or changes
- `style`: Formatting changes

