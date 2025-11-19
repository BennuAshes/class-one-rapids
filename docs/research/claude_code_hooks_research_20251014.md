# Claude Code Hooks Research

**Date**: 2025-10-14
**Project**: Class One Rapids (Expo + React Native)
**Purpose**: Research and recommendations for implementing Claude Code hooks

## Executive Summary

Claude Code hooks are configurable scripts that automatically execute at specific points during Claude Code's operation. They enable workflow automation, code quality enforcement, and safety checks. This document provides comprehensive research on hook capabilities and specific recommendations for the Class One Rapids project.

## What Are Claude Code Hooks?

Hooks are event-driven scripts that extend Claude Code's functionality by:
- Customizing tool behavior before or after execution
- Adding validation and permission checks
- Automating repetitive tasks like formatting and testing
- Creating audit trails and logs
- Preventing accidental modifications to critical files

### Security Consideration
⚠️ **USE AT YOUR OWN RISK**: Hooks execute arbitrary shell commands and can modify or delete files. Always test hooks in a safe environment before deploying to production codebases.

## Available Hook Events

| Event | Trigger | Common Use Cases |
|-------|---------|-----------------|
| **PreToolUse** | Before any tool executes | Validation, permission checks, file protection |
| **PostToolUse** | After tool completes successfully | Formatting, linting, test runs |
| **UserPromptSubmit** | When user submits a prompt | Context injection, prompt enhancement |
| **Notification** | When Claude needs user attention | Desktop alerts, sound notifications |
| **Stop** | When main agent finishes responding | Summary generation, cleanup |
| **SubagentStop** | When subagent completes | Subagent-specific cleanup |
| **SessionStart** | Beginning of Claude session | Environment setup, initialization |
| **SessionEnd** | End of Claude session | Cleanup, report generation |
| **PreCompact** | Before context compaction | Context preservation |

## Hook Configuration Structure

Hooks are configured in JSON format within settings files:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolNamePattern",
        "hooks": [
          {
            "type": "command",
            "command": "shell-command-here"
          }
        ]
      }
    ]
  }
}
```

### Key Configuration Features
- **Regex Matching**: Use patterns to match tool names (e.g., "Edit|Write")
- **Environment Variables**: Access `$CLAUDE_PROJECT_DIR` and other vars
- **Multiple Hooks**: Chain multiple hooks for the same event
- **Settings Hierarchy**: Configure in user, project, or local settings

### Hook Execution Details
- **Parallel Execution**: Hooks run in parallel for performance
- **Timeout**: 60-second default timeout
- **Input**: Receives JSON via stdin with event context
- **Output**: Exit code 0 (success), 2 (block operation), or JSON response
- **Working Directory**: Executes in project root by default

## Common Use Cases in Practice

### 1. Code Quality Enforcement
- Automatic code formatting (Prettier, Black, etc.)
- Linting and style checks
- Type checking for TypeScript projects
- Test execution after changes

### 2. Safety and Security
- Preventing modifications to sensitive files (.env, credentials)
- Blocking dangerous git operations
- Validating command parameters
- Creating backup copies before major changes

### 3. Workflow Automation
- Running related tests after code changes
- Building projects after modifications
- Updating documentation automatically
- Syncing changes across related files

### 4. Monitoring and Logging
- Activity logging for audit trails
- Performance monitoring
- Error tracking
- Change summaries

### 5. Developer Experience
- Desktop notifications when input needed
- Sound alerts for long-running operations
- Auto-fixing common issues
- Context-aware suggestions

## Project-Specific Recommendations

Based on the Class One Rapids project structure and rules, here are tailored hook configurations:

### 1. Critical File Protection Hook
Prevents accidental modifications to protected files per project rules.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json, sys, os; data=json.load(sys.stdin); path=data.get('tool_input',{}).get('file_path',''); protected_files=['.env', 'package-lock.json', 'jest.setup.js']; protected_dirs=['.git/', 'node_modules/']; file_name=os.path.basename(path); is_protected=any(p in path for p in protected_dirs) or file_name in protected_files; sys.exit(2 if is_protected else 0)\""
          }
        ]
      }
    ]
  }
}
```

### 2. Test Runner Hook
Automatically runs related tests after modifying test files.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -qE '\\.(test|spec)\\.(tsx?|jsx?)$'; then cd frontend && npm test -- --findRelatedTests \"${file_path#*/frontend/}\" --passWithNoTests; fi; }"
          }
        ]
      }
    ]
  }
}
```

### 3. TypeScript Type Checking Hook
Checks for type errors after TypeScript file changes.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -qE '\\.(tsx?|jsx?)$' && echo \"$file_path\" | grep -q 'frontend/'; then cd frontend && npx tsc --noEmit --skipLibCheck 2>&1 | head -20; fi; }"
          }
        ]
      }
    ]
  }
}
```

### 4. Expo Command Validator
Enforces the rule about not running expo start automatically.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | { read cmd; if echo \"$cmd\" | grep -qE '^(npx )?expo start'; then echo 'ERROR: Please ask user to run expo start manually (per CLAUDE.md rules)'; exit 2; fi; exit 0; }"
          }
        ]
      }
    ]
  }
}
```

### 5. Package Version Protection
Prevents unauthorized package version changes.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | { read cmd; if echo \"$cmd\" | grep -qE 'npm (install|update|upgrade).*(react|react-native|expo)@'; then echo 'ERROR: Package version changes require explicit user approval (per CLAUDE.md)'; exit 2; fi; exit 0; }"
          }
        ]
      }
    ]
  }
}
```

### 6. Git Safety Hook
Prevents dangerous git operations without approval.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | { read cmd; if echo \"$cmd\" | grep -qE 'git (checkout|stash|reset --hard|push.*--force)'; then echo 'ERROR: Git operation requires user approval (per CLAUDE.md)'; exit 2; fi; exit 0; }"
          }
        ]
      }
    ]
  }
}
```

### 7. Activity Logger
Maintains an audit trail of all file modifications.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "mkdir -p .claude/logs && jq -r '\"[\\(now | strftime(\"%Y-%m-%d %H:%M:%S\"))] \\(.tool_name): \\(if .tool_input.file_path then .tool_input.file_path elif .tool_input.command then .tool_input.command else \"unknown\" end)\"' >> .claude/logs/activity.log"
          }
        ]
      }
    ]
  }
}
```

### 8. Legend State Import Checker
Ensures correct import patterns for Legend State v3.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -qE '\\.(tsx?|jsx?)$'; then grep -n '@legendapp/state' \"$file_path\" | grep -v '@legendapp/state/react' | while read line; do echo \"Warning in $file_path: $line - Consider using @legendapp/state/react for React components\"; done; fi; }"
          }
        ]
      }
    ]
  }
}
```

## Implementation Guide

### Step 1: Choose Initial Hooks
Start with 1-2 critical hooks:
1. Critical File Protection (safety)
2. Activity Logger (visibility)

### Step 2: Test in Safe Environment
1. Create a test branch
2. Add hooks to `.claude/settings.local.json`
3. Test with non-critical operations
4. Verify expected behavior

### Step 3: Gradual Rollout
1. Deploy tested hooks to main environment
2. Monitor for issues
3. Add additional hooks incrementally
4. Document any custom hooks

### Step 4: Maintenance
1. Review logs regularly
2. Update hooks as project evolves
3. Share useful hooks with team
4. Keep hooks simple and fast

## Best Practices

### Do's
✅ **Validate Input**: Always validate and sanitize input data
✅ **Use Absolute Paths**: Avoid relative path issues
✅ **Quote Variables**: Prevent shell injection with proper quoting
✅ **Test Thoroughly**: Test hooks in isolated environments first
✅ **Keep It Fast**: Hooks should complete quickly (< 5 seconds ideally)
✅ **Log Important Events**: Maintain audit trails for critical operations
✅ **Use Exit Codes**: Return 2 to block, 0 to allow
✅ **Handle Errors Gracefully**: Don't let hook failures crash Claude

### Don'ts
❌ **Don't Access Sensitive Data**: Avoid reading credentials or secrets
❌ **Don't Modify Critical System Files**: Stay within project boundaries
❌ **Don't Create Infinite Loops**: Ensure hooks can't trigger themselves
❌ **Don't Rely on External Services**: Hooks should work offline
❌ **Don't Make Assumptions**: Check file existence and permissions
❌ **Don't Over-Engineer**: Simple hooks are more maintainable

## Advanced Techniques

### 1. JSON Output for Complex Logic
Return structured data to Claude:
```bash
echo '{"message": "Custom validation failed", "suggestions": ["Fix A", "Fix B"]}' | jq -c
```

### 2. Conditional Execution
Use file patterns and content checks:
```bash
if [[ "$file_path" =~ \\.test\\.(ts|tsx)$ ]]; then
  # Test file specific logic
fi
```

### 3. Multi-Stage Hooks
Chain multiple operations:
```bash
format_code && run_tests && update_docs
```

### 4. Environment-Specific Hooks
Different hooks for dev/prod:
```bash
if [[ "$CLAUDE_ENV" == "production" ]]; then
  # Stricter validation
fi
```

### 5. Hook Communication
Share data between hooks using temp files:
```bash
echo "$data" > /tmp/claude_hook_data.json
```

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Hook not triggering | Check matcher pattern, verify event name |
| Hook blocking all operations | Review exit codes, ensure proper error handling |
| Slow performance | Optimize commands, use background processing |
| Permission errors | Check file permissions, use appropriate user |
| JSON parsing errors | Validate JSON structure, escape special characters |
| Hook timeout | Reduce operation complexity, increase timeout |

## Platform-Specific Considerations

### Windows (Current Environment)
- Use PowerShell or WSL for complex scripts
- Path separators: Use forward slashes in JSON
- Consider Windows-specific tools (findstr vs grep)
- Test with both CMD and PowerShell

### macOS/Linux
- Native shell scripting support
- Better command availability
- File system case sensitivity
- Different notification commands

## Monitoring and Metrics

### Recommended Metrics to Track
1. **Hook Execution Time**: Monitor performance impact
2. **Block Rate**: Track how often hooks prevent operations
3. **Error Frequency**: Identify problematic hooks
4. **Tool Usage Patterns**: Understand workflow patterns

### Sample Monitoring Hook
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date +%s),${TOOL_NAME},${DURATION_MS}\" >> .claude/metrics.csv"
          }
        ]
      }
    ]
  }
}
```

## Future Enhancements

### Potential Hook Improvements
1. **AI-Powered Validation**: Use LLMs to validate changes semantically
2. **Visual Regression Testing**: Capture screenshots after UI changes
3. **Dependency Analysis**: Check for breaking changes in dependencies
4. **Performance Profiling**: Automatic performance regression detection
5. **Documentation Generation**: Auto-generate docs from code changes

## Conclusion

Claude Code hooks provide powerful customization capabilities that can significantly improve development workflows, code quality, and safety. For the Class One Rapids project, implementing the recommended hooks will:

1. **Prevent Critical Errors**: Protect important files and configurations
2. **Maintain Code Quality**: Automatic testing and type checking
3. **Enforce Project Rules**: Ensure CLAUDE.md rules are followed
4. **Improve Visibility**: Activity logging and monitoring
5. **Enhance Developer Experience**: Automated workflows and safety nets

Start with the Critical File Protection and Activity Logger hooks, then gradually add more based on team needs and project evolution.

## References

- [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code Hooks Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide)
- [Claude Code Settings](https://docs.claude.com/en/docs/claude-code/settings)
- Project: Class One Rapids (Expo + React Native)
- Project Rules: CLAUDE.md

---

*Document generated: 2025-10-14*
*Last updated: 2025-10-14*
*Author: Claude Code Assistant*