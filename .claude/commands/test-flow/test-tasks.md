---
description: "Test Tasks command - validates stdin file path input"
argument-hint: "TDD file path via stdin"
allowed-tools: "Read, Write, Bash(echo:*)"
---

# Test Task List Generator

**IMPORTANT**: This command receives the TDD file path via stdin (piped).

## Input Processing

The TDD file path will be provided as stdin input:
```bash
echo "/path/to/tdd.md" | claude /test-tasks
```

### Steps:
1. Read the first line from stdin to get TDD file path
2. Validate the file path is not empty
3. Use Read tool to load TDD contents
4. Generate minimal task list

## Error Handling

If no path provided:
- Output: "ERROR: TDD file path required via stdin"
- EXIT without creating files

## Generate Test Tasks

```markdown
# Task List - Test

## Input Source
TDD File: [path that was received via stdin]

## Tasks

### Task 1: Test Task
- Description: Validate workflow
- Status: Pending

---
Generated: [timestamp]
```

## Output

Save to: `test-output/tasks_test_[timestamp].md`
