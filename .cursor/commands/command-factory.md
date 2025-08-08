---
alwaysApply: false
---

# Command Factory

Create new custom commands quickly with a single line, following best practices from @research/gpt5-prompt-engineering-best-practices-2025.md and implementation patterns from @research/cursor-ide-slash-commands-guide-2025.md

## Syntax

```
/cmd new <commandName> [--pattern "/alias"] [--desc "description"] \
  [--globs "**/*.ts,**/*.tsx"] [--alwaysApply false] \
  [--scope <dirPath>] [--examples true]

# Optional instruction block on following lines (until a blank line):
# Describes what the new command should do. Use bullets.
```

## Behavior

When the user types `/cmd new <commandName>`:

1. Parse options and infer sane defaults:

   - pattern: `"/" + commandName` if not provided
   - desc: `"Custom slash command: " + commandName` if not provided
   - globs: `"**/*"` if not provided
   - alwaysApply: `false` unless explicitly set `true`
   - scope: project root (`.`) if not provided
   - examples: `true` if flag present or value is true

2. Plan briefly (do not wait for approval unless critical info missing):

   - Target path: `<scope>/.cursor/rules/<commandName>.mdc`
   - Show resolved options in a short checklist

3. Generate a new `.mdc` file using the template below, substituting values and inserting the instruction block as the command's "Instructions" section.

4. Write the file to disk at the target path, creating directories if necessary.

5. Echo how to invoke the new command (its `/alias`) and where the file was created.

## Template for Generated Command

Use this exact structure when creating the new rule file. Replace placeholders in {{double_braces}} with computed values.

```md
---
description: {{desc}}
globs:
  - {{#each globs}}
  - {{this}}
  {{/each}}
alwaysApply: {{alwaysApply}}
---

# {{commandName}} Command

## Context

- Based on practices from @research/gpt5-prompt-engineering-best-practices-2025.md
- Follows Cursor rule patterns in @research/cursor-ide-slash-commands-guide-2025.md
- Be explicit, concise, and structured. Prefer bullet points. Use short plans before execution.

## Command Pattern

- Trigger: When the user types "{{pattern}} ..."

## Instructions

{{instructionBlock}}

## Examples{{#if examples}}

### Good

- Show a realistic invocation of "{{pattern}}" and the expected behavior

### Bad

- Ambiguous or under-specified invocations
  {{/if}}
```

## Notes

- Follow clarity, specificity, and structured context guidance from the GPT-5 prompt engineering doc.
- Keep generated rule files under 500 lines. Co-locate scoped rules by using `--scope` to place rules near relevant code.
- Ask a single clarifying question only if a critical parameter is missing (e.g., no `commandName`). Otherwise infer defaults and proceed.

## Example

User input:

```
/cmd new search --pattern "/s" --desc "Codebase search shortcut" --globs "**/*.ts,**/*.tsx" --alwaysApply true --examples true
- When invoked, search the codebase for the provided term
- Show file paths and matching lines
- Prefer semantic search; fall back to exact if needed
```

Expected outcome:

- Create `.cursor/rules/search.mdc` with the filled template
- Announce the new command: "Use /s <term> to search the codebase"
