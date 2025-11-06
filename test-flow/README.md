# Test Flow - Simplified Workflow Validation

This directory contains a simplified version of the workflow for quick testing and validation.

## Purpose

Validate that the flow commands correctly receive input via stdin piping, without running the full workflow infrastructure.

## Components

### Test Commands

Located in `.claude/commands/test-flow/`:
- **test-prd.md** - Minimal PRD generator that validates stdin input
- **test-design.md** - Minimal TDD generator that validates file path via stdin
- **test-tasks.md** - Minimal task list generator that validates file path via stdin

Invoked as:
- `claude /test-flow:test-prd`
- `claude /test-flow:test-design`
- `claude /test-flow:test-tasks`

### Test Script

- **test-workflow.sh** - Simplified workflow script that:
  - Runs all three flow commands in sequence
  - Validates stdin piping works correctly
  - Auto-approves (no manual approval needed)
  - Provides clear validation output
  - Completes in seconds vs minutes

## Usage

### Quick Test

```bash
./test-flow/test-workflow.sh "test feature: simple calculator"
```

### What It Tests

1. **PRD Step**: Feature description received via stdin
   ```bash
   echo "description" | claude /test-flow:test-prd
   ```

2. **Design Step**: File path received via stdin
   ```bash
   echo "/path/to/prd.md" | claude /test-flow:test-design
   ```

3. **Tasks Step**: File path received via stdin
   ```bash
   echo "/path/to/tdd.md" | claude /test-flow:test-tasks
   ```

### Expected Output

```
========================================
Simplified Workflow Test
========================================
Test Directory: /path/to/test-flow
Output Directory: /path/to/test-output/TIMESTAMP
Timestamp: YYYYMMDD_HHMMSS

========================================
Test Step 1: PRD Generation
========================================
Feature: test feature: simple calculator

Testing stdin input to /test-prd...
✓ PRD generated successfully
  File: /path/to/test-output/TIMESTAMP/prd_test.md
  Size: XXX bytes

========================================
Test Step 2: Technical Design
========================================
Testing file path via stdin to /test-design...
✓ Design generated successfully

========================================
Test Step 3: Task List
========================================
Testing file path via stdin to /test-tasks...
✓ Tasks generated successfully

========================================
✓ All Tests Passed!
========================================

Validation Results:
  1. PRD received feature description via stdin: ✓
  2. Design received PRD file path via stdin: ✓
  3. Tasks received TDD file path via stdin: ✓
```

## When to Use This

### Use test-flow when:
- Testing changes to flow command structure
- Validating stdin input processing
- Quick iteration on command improvements
- Debugging input passing issues
- Learning how the workflow works

### Use full workflow when:
- Generating actual production specs
- Need full features (telemetry, approvals, extraction)
- Creating comprehensive documentation
- Full integration testing

## Comparison to Full Workflow

| Feature | Test Flow | Full Workflow |
|---------|-----------|---------------|
| Duration | ~10 seconds | ~5-10 minutes |
| Approval | Auto | Manual or File-based |
| Output | Minimal | Comprehensive |
| Telemetry | No | Optional |
| Extraction | No | Yes |
| Commands | /test-flow:test-prd, test-design, test-tasks | /flow:prd, /flow:design, /flow:tasks |
| Purpose | Validation | Production |

## Directory Structure

```
.claude/commands/test-flow/   # Test command definitions
├── test-prd.md              # Test PRD command
├── test-design.md           # Test Design command
└── test-tasks.md            # Test Tasks command

test-flow/                   # Test scripts and output
├── README.md               # This file
├── test-workflow.sh        # Test runner script
└── test-output/            # Output directory (created on first run)
    └── YYYYMMDD_HHMMSS/    # Timestamped test runs
        ├── prd_test.md
        ├── tdd_test.md
        └── tasks_test.md
```

## Integration with .claude/settings

To use these test commands, they should be registered in `.claude/settings.local.json` or invoked directly.

The test commands follow the same stdin piping pattern as the production flow commands:
- `.claude/commands/flow/prd.md` ↔ `test-flow/test-prd.md`
- `.claude/commands/flow/design.md` ↔ `test-flow/test-design.md`
- `.claude/commands/flow/tasks.md` ↔ `test-flow/test-tasks.md`

## Troubleshooting

### Script won't execute
```bash
# Fix line endings and permissions
sed -i 's/\r$//' test-flow/test-workflow.sh && chmod +x test-flow/test-workflow.sh
```

### Commands not found
Make sure you're running from the project root:
```bash
cd /mnt/c/dev/class-one-rapids
./test-flow/test-workflow.sh "test description"
```

### Output files empty
Check the command output for error messages. The test commands should show clear error messages if stdin input is missing.
