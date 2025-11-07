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

## More Guidelines
- NEVER use LangFuse SDK v2, if you don't understand v3 or why its not working, read local documentation and use websearch to understand.