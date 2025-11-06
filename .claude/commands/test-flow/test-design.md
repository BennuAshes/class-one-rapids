---
description: "Test Design command - validates stdin file path input"
argument-hint: "PRD file path via stdin"
allowed-tools: "Read, Write, Bash(echo:*)"
---

# Test Technical Design Generator

**IMPORTANT**: This command receives the PRD file path via stdin (piped).

## Input Processing

The PRD file path will be provided as stdin input:
```bash
echo "/path/to/prd.md" | claude /test-design
```

### Steps:
1. Read the first line from stdin to get PRD file path
2. Validate the file path is not empty
3. Use Read tool to load PRD contents
4. Generate minimal TDD

## Error Handling

If no path provided:
- Output: "ERROR: PRD file path required via stdin"
- EXIT without creating files

## Generate Test TDD

```markdown
# Technical Design Document - Test

## Input Source
PRD File: [path that was received via stdin]

## Architecture
- Simple test architecture

## Implementation
- Test implementation plan

---
Generated: [timestamp]
```

## Output

Save to: `test-output/tdd_test_[timestamp].md`
