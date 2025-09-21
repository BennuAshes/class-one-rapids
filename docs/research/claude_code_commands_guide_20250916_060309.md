# Claude Code Commands Best Practices Guide

## Quick Reference

- **Command Location**: `.claude/commands/` (project) or `~/.claude/commands/` (personal)
- **File Format**: Markdown (`.md`) with optional YAML frontmatter
- **Argument Variables**: `$ARGUMENTS` (all args), `$1`, `$2` (positional)
- **Bash Execution**: Prefix with `!` to run shell commands
- **File References**: Use `@` to include file contents
- **Context File**: `CLAUDE.md` provides persistent project context

## Code Examples

### Basic Command Structure

```markdown
---
description: "Brief description of what this command does"
argument-hint: "<expected arguments>"
allowed-tools: "Read, Write, Edit, Bash, Grep"
model: claude-3-5-sonnet-20241022
---

Your prompt here with $ARGUMENTS or $1, $2 for parameters
```

### Project Command Example

```markdown
# .claude/commands/fix-issue.md
---
description: "Fix a GitHub issue"
argument-hint: "<issue-number>"
allowed-tools: "Read, Edit, Write, Bash(git:*), WebFetch"
---

Find and fix issue #$ARGUMENTS:
1. Fetch issue details from GitHub
2. Locate relevant code in codebase
3. Implement solution following our conventions
4. Add appropriate tests
5. Run typecheck and lint
6. Prepare concise commit message
```

### Personal Command Example

```markdown
# ~/.claude/commands/review.md
---
description: "Perform comprehensive code review"
allowed-tools: "Read, Grep, Glob"
---

Review recent changes:
- Check TypeScript/React conventions
- Verify error handling and loading states
- Ensure accessibility (WCAG 2.1 AA)
- Review test coverage
- Check for security vulnerabilities
- Validate performance implications
```

### Command with Bash Execution

```markdown
# .claude/commands/test-and-fix.md
---
description: "Run tests and fix failures"
allowed-tools: "Bash(npm run test:*), Edit, Read"
---

!`npm run test`

If tests fail:
1. Analyze each failure
2. Fix the underlying issue
3. Re-run tests to confirm
4. Document any changes made
```

### Namespaced Commands

```bash
# Directory structure creates namespacing
.claude/commands/
├── frontend/
│   ├── component.md    # Accessed as /component (project:frontend)
│   └── hook.md         # Accessed as /hook (project:frontend)
└── backend/
    └── api.md          # Accessed as /api (project:backend)
```

## Technical Specifications

### Frontmatter Options

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Brief command description | `"Create React component"` |
| `argument-hint` | string | Expected arguments format | `"<component-name> [props]"` |
| `allowed-tools` | string | Comma-separated tool list | `"Read, Edit, Write, Bash"` |
| `model` | string | Specific Claude model | `"claude-3-5-sonnet-20241022"` |

### Tool Permissions Syntax

```yaml
# Specific command permissions
allowed-tools: Bash(git add:*), Bash(git commit:*)

# Wildcard permissions
allowed-tools: Bash(npm run:*)

# Mixed permissions
allowed-tools: Read, Write, Bash(python:*), WebFetch
```

### Argument Handling Patterns

```markdown
# All arguments as single string
Fix the following: $ARGUMENTS

# Positional arguments
Create $1 component with props: $2

# Mixed usage
Deploy $1 to environment: $ARGUMENTS
```

## Implementation Patterns

### CLAUDE.md Project Context

```markdown
# CLAUDE.md
## Commands
- `npm run dev` - Start development server
- `npm run test` - Run test suite
- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Run ESLint

## Conventions
- Use functional React components with hooks
- Follow Airbnb TypeScript style guide
- Test files: `*.test.tsx` alongside components
- State management: Zustand (see src/stores/)

## Architecture
- /src/components - React components
- /src/hooks - Custom React hooks
- /src/utils - Utility functions
- /src/api - API client code
```

### Hierarchical CLAUDE.md

```bash
# Multiple CLAUDE.md files for context specificity
project/
├── CLAUDE.md           # Project-wide context
├── src/
│   └── CLAUDE.md      # Source-specific guidelines
└── tests/
    └── CLAUDE.md      # Testing-specific rules
```

### Command Workflow Integration

```markdown
# .claude/commands/workflow.md
---
description: "Complete development workflow"
argument-hint: "<feature-name>"
---

Implement feature: $ARGUMENTS

1. Create feature branch
!`git checkout -b feature/$ARGUMENTS`

2. Implement changes following CLAUDE.md conventions

3. Run quality checks
!`npm run typecheck && npm run lint && npm run test`

4. Commit with conventional message
!`git add -A && git commit -m "feat: add $ARGUMENTS"`
```

## Best Practices & Anti-patterns

### DO: Keep Commands Focused

```markdown
# Good: Single responsibility
---
description: "Generate TypeScript interface from JSON"
---
Convert this JSON to TypeScript interface:
@data.json
```

### DON'T: Create Overly Complex Commands

```markdown
# Bad: Too many responsibilities
---
description: "Do everything"
---
Fix all bugs, refactor code, add tests, update docs, deploy...
```

### DO: Use Declarative Instructions

```markdown
# Good: Clear, concise
- Use React.FC for components
- Include JSDoc comments
- Export from index.ts
```

### DON'T: Write Narrative Explanations

```markdown
# Bad: Too verbose
When you create a component, first you should think about...
```

### DO: Leverage Frontmatter for Control

```markdown
---
allowed-tools: "Read, Edit"  # Limit to safe operations
model: claude-3-5-haiku-20241022  # Use faster model
---
```

### DON'T: Hardcode Sensitive Data

```markdown
# Bad: Never include secrets
API_KEY=sk-actual-key-here  # NEVER DO THIS
```

## Knowledge Gaps

- **Dynamic frontmatter**: Conditional tool permissions based on environment
- **Command versioning**: Managing command evolution across teams
- **Performance metrics**: Optimal command length vs. token usage
- **Cross-command communication**: Sharing state between commands
- **Custom model parameters**: Fine-tuning beyond model selection

## Quick Reference Links

- [Official Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Awesome Claude Code Repository](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [MCP Integration Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)