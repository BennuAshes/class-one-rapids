# Setup
- We are using windows
- The emulator is configured for windows
- You must use cmd.exe to execute npm and expo commands.
- 

## WSL/Bash Scripts

- **IMMEDIATELY after creating or editing any .sh file**, run these commands to fix line endings:
  ```bash
  sed -i 's/\r$//' path/to/script.sh && chmod +x path/to/script.sh
  ```
- This is NOT optional - files created in Windows have CRLF line endings that break WSL execution
- You will see "required file not found" errors if you forget this step
- Do this in the SAME response where you create the file, using the Bash tool

# Project Rules

- This is a expo + react-native app
- Do not add dependencies directly to package.json, use npm install
- Do not directly modify the android or ios folders in the expo app folders (such as /frontend/ and /approval-app/)

## Critical

- Ask questions or do research if you have gaps in knowledge
- No git checkout or git stash without user approval
- NEVER change package versions (React, React Native, Expo, etc) without explicit user approval
- Version mismatches should be reported to user, not auto-fixed

## Configuration Safety

- NEVER remove/replace code in test setup files (jest.setup.js, etc)
- ADD to existing config, don't replace
- If unsure about config code, leave it unchanged
- NEVER run ```expo start``` yourself, ask for help

## Observability & Telemetry

### Langfuse OTLP Limitations

**IMPORTANT**: Langfuse **ONLY** supports OTLP traces, NOT logs or metrics.

- **Supported**: OTLP traces via `/api/public/otel/v1/traces`
- **NOT Supported**: OTLP logs (returns 404) or metrics
- **Format**: HTTP/protobuf only (no gRPC)

**Sources:**
- [Langfuse OTLP Documentation](https://langfuse.com/docs/opentelemetry/get-started)
- [GitHub Discussion #8275](https://github.com/orgs/langfuse/discussions/8275)

### Claude Code Telemetry Issue

Claude Code's built-in OTLP telemetry sends data as **logs**, not traces:
```
ResourceLog #0 ... claude_code.api_request ...
```

This means Claude Code's OTLP data **cannot** be sent directly to Langfuse.

### Solution: Use Langfuse Python SDK

For workflow telemetry, use the **Langfuse Python SDK** directly:
- Module: `scripts/workflow_telemetry.py`
- Bypasses OTLP entirely
- Uses Langfuse native API
- Creates traces/spans programmatically

**Do NOT** try to configure OTEL collector to send logs to Langfuse - it will fail with 404 errors.

## LangFuse Python SDK v3 - CRITICAL RULES

**Version**: 3.8.1 (OTEL-based)

### What NOT to Do

1. **NEVER use SDK v2 methods** - No `.trace()`, `.span()`, or similar methods
2. **NEVER instantiate `Langfuse()` directly** - Use `get_client()` instead
3. **NEVER add/remove/modify telemetry code without testing** - Run workflow with telemetry enabled first
4. **NEVER assume v2 examples work** - SDK v3 uses completely different API

### Correct v3 API

```python
from langfuse import get_client

# Get client (singleton)
client = get_client()

# Create spans using context managers (auto-handles lifecycle)
with client.start_as_current_span(name="step-name") as span:
    # Your work here
    span.update(metadata={"key": "value"})
    # Span auto-closes when exiting context

# Flush in short-lived apps
client.flush()
```

### Implementation Location

- **File**: `scripts/libs/workflow_telemetry.py`
- **Class**: `WorkflowObserver`
- **Key Methods**:
  - `_create_workflow_trace()` - Creates parent trace on initialization
  - `start_step()` - Creates nested child spans under parent trace
  - `complete_step()` - Closes child spans
  - `flush()` - Closes parent trace and sends all data
- **DO NOT modify** these without understanding v3 context manager lifecycle

### Trace Structure

Workflow creates **ONE parent trace** with **nested child spans** for each step:

```
Feature-to-Code Workflow (parent trace)
├── Generate PRD (span)
├── Generate Technical Design (span)
├── Generate Task List (span)
├── Execute Tasks (span)
└── Generate Summary (span)
```

All spans share the same `execution_id` as `session_id` for easy filtering in Langfuse UI.

### Testing Telemetry

```bash
# Test with telemetry
./workflow --mock --approval test test-feature.md

# Test without telemetry (faster)
./workflow --mock --approval test --no-telemetry test-feature.md

# Run test suite (includes telemetry test)
./test-workflow.sh
```

Check http://localhost:3000 for traces after running.

## Workflow CLI Best Practices

### File Path Handling

**CRITICAL**: Always use Unix-style forward slashes (`/`) when passing file paths to `./workflow`, even on Windows.

**Good Examples**:
```bash
./workflow docs/specs/feature-name/description.md
./workflow test-feature.md
```

**Bad Examples** (will cause path parsing errors):
```bash
./workflow docs\specs\feature-name\description.md  # Windows backslashes
./workflow "docs\specs\feature-name\description.md"  # Quoted but still wrong
```

### Why This Matters

When Windows backslashes are used:
- Path gets mangled into a single string (e.g., `docsspecsfeature-namedescription.md`)
- Feature folder name generation fails
- Files stay in `workflow-outputs/` instead of being extracted to `docs/specs/[feature]/`

The workflow now automatically normalizes paths, but always prefer forward slashes to avoid issues.

### Feature Folder Organization

**How It Works**:
1. Workflow reads your feature description from file or command line
2. Generates a folder name from the description (kebab-case, removes stop-words)
3. Creates specs in `docs/specs/[generated-folder-name]/`

**Example**:
```bash
# Input: docs/specs/salvage-tinkering-system/salvage-tinkering-progressive-automation.md
# Generated folder: salvage-tinkering-progressive-automation
# Output location: docs/specs/salvage-tinkering-progressive-automation/
```

**What Gets Extracted**:
- `prd_extracted_YYYYMMDD.md` - Product Requirements Document
- `technical_design_YYYYMMDD.md` - Technical Design Document
- `tasks_YYYYMMDD.md` - Task List

**Verifying Extraction Worked**:
```bash
# Check if files were extracted
ls docs/specs/[your-feature-name]/

# Should see:
# - prd_extracted_YYYYMMDD.md
# - technical_design_YYYYMMDD.md
# - tasks_YYYYMMDD.md
# - *.metadata.json files
```

### Common Pitfalls

1. **Spaces in paths** - Always quote paths with spaces:
   ```bash
   ./workflow "docs/specs/my feature/description.md"  # Correct
   ./workflow docs/specs/my feature/description.md    # Wrong
   ```

2. **Relative vs absolute paths** - Both work, but relative paths are preferred:
   ```bash
   ./workflow docs/specs/feature.md           # Preferred
   ./workflow /mnt/c/dev/project/feature.md   # Also works
   ```

3. **Missing feature folder** - If folder isn't created in `docs/specs/`:
   - Check that `auto_extract` and `extract_to_specs` are enabled (they are by default)
   - Verify feature description isn't empty
   - Check workflow output for extraction warnings

### Testing Your Changes

Before relying on the workflow for production features:

```bash
# Test with mock mode (fast, no actual LLM calls)
./workflow --mock --approval minimal test-feature.md

# Verify files were extracted
ls docs/specs/test-feature-simple-calculator-api/

# Run full test suite
./test-workflow.sh
```

