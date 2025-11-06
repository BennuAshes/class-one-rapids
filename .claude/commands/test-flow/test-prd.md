---
description: "Test PRD command - validates stdin input processing"
argument-hint: "Feature description via stdin"
allowed-tools: "Write, Bash(echo:*)"
---

# Test PRD Generator

**IMPORTANT**: This command receives input via stdin (piped), not arguments.

## Input Processing

Read the feature description from stdin:
- The feature description will be piped as: `echo "description" | claude /test-prd`

## Generate Test PRD

Create a minimal PRD output:

```markdown
# Product Requirements Document - Test

## Feature Description
[Echo the input received from stdin]

## Requirements
- REQ-1: Test requirement

## Success Criteria
- Input was received correctly via stdin
- Output file was generated

---
Generated: [timestamp]
```

## Output

Save to: `test-output/prd_test_[timestamp].md`

**Validation**: If no input received, output error message and exit.
