# Claude Code Feature Generator - n8n Workflow

**Version**: 1.0
**Created**: November 16, 2025
**Purpose**: Automated feature code generation using Claude Code CLI and the flow workflow

---

## Overview

This n8n workflow automates the complete feature development lifecycle using Claude Code's flow commands. It transforms a feature description into fully implemented code by executing the following pipeline:

1. **PRD Generation** (`/flow:prd`)
2. **Technical Design** (`/flow:design`)
3. **Task Generation** (`/flow:tasks`)
4. **Code Execution** (`/flow:execute-task`)

## Architecture

### Workflow Pattern
This workflow implements the **Chained Requests** AI agentic pattern - a series of predefined commands executed in a specific order, with each step processing data and passing output to the next node.

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      📥 INPUT VALIDATION                            │
├─────────────────────────────────────────────────────────────────────┤
│ Webhook → Validate Input → Verify Codebase Path                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    🤖 FLOW EXECUTION PIPELINE                       │
├─────────────────────────────────────────────────────────────────────┤
│ Write Feature File → Execute PRD → Parse PRD Output                │
│                  ↓                                                  │
│ Execute Design → Parse TDD Output                                  │
│                  ↓                                                  │
│ Execute Tasks → Parse Tasks Output                                 │
│                  ↓                                                  │
│ Execute Code Generation → Parse Execution Output                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   📤 OUTPUT & CLEANUP                               │
├─────────────────────────────────────────────────────────────────────┤
│ Cleanup Temp Files → Format Response → Send Response               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     ⚠️ ERROR HANDLING                               │
├─────────────────────────────────────────────────────────────────────┤
│ On Error → Format Error → Cleanup → Send Error Response            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

1. **n8n Installation** (self-hosted):
   ```bash
   npm install -g n8n
   ```

2. **Claude Code CLI**:
   - Must be installed and configured on the host machine
   - Workflow assumes `claude` command is available in PATH

3. **Environment**:
   - Self-hosted n8n instance (Execute Command node not available on n8n Cloud)
   - Linux/macOS/WSL environment with bash
   - Git repository with `.claude/` directory structure

### Import Workflow

1. **Via n8n UI**:
   - Open n8n interface
   - Go to Workflows → Import
   - Select `claude_code_feature_generator_workflow.json`
   - Click Import

2. **Via CLI**:
   ```bash
   n8n import:workflow --input=claude_code_feature_generator_workflow.json
   ```

### Activate Workflow

1. Open the imported workflow in n8n
2. Click "Activate" toggle in top-right corner
3. Note the webhook URL (will be displayed in webhook trigger node)

---

## Usage

### API Endpoint

**Method**: POST
**URL**: `https://your-n8n-instance.com/webhook/generate-feature`

### Request Body

```json
{
  "feature_description": "Create a todo list screen with filtering by status",
  "codebase_path": "/absolute/path/to/your/project"
}
```

**Parameters**:
- `feature_description` (required): Text description of the feature to implement
- `codebase_path` (required): Absolute path to the codebase root directory

### Example cURL Request

```bash
curl -X POST https://your-n8n-instance.com/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add a settings screen with dark mode toggle",
    "codebase_path": "/home/user/projects/my-app"
  }'
```

### Example Node.js Request

```javascript
const axios = require('axios');

async function generateFeature() {
  try {
    const response = await axios.post(
      'https://your-n8n-instance.com/webhook/generate-feature',
      {
        feature_description: 'Create a user profile screen with avatar upload',
        codebase_path: '/Users/dev/projects/mobile-app'
      }
    );

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateFeature();
```

### Example Python Request

```python
import requests

def generate_feature():
    url = 'https://your-n8n-instance.com/webhook/generate-feature'
    payload = {
        'feature_description': 'Implement a search bar with autocomplete',
        'codebase_path': '/home/developer/repos/webapp'
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print('Success:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error:', e)

generate_feature()
```

---

## Response Format

### Success Response (200)

```json
{
  "status": "success",
  "message": "Feature code generated successfully",
  "prd_file": "prd_todo_list_filtering_20251116.md",
  "tdd_file": "tdd_todo_list_filtering_20251116.md",
  "tasks_file": "tasks_todo_list_filtering_20251116.md",
  "execution_summary": "Completed 5 tasks: PRD generation, TDD creation, task breakdown...",
  "timestamp": "2025-11-16T15:30:45.123Z"
}
```

### Validation Error Response (400)

```json
{
  "status": "error",
  "error": "Missing required fields: feature_description and codebase_path"
}
```

### Execution Error Response (500)

```json
{
  "status": "error",
  "message": "Failed to extract TDD file path from command output",
  "step": "parse-tdd-output"
}
```

---

## Workflow Nodes Reference

### 1. Input Validation Section

#### 🎯 Webhook - Receive Feature Request
- **Type**: Webhook Trigger
- **Purpose**: Receives POST requests with feature description and codebase path
- **Configuration**:
  - Path: `generate-feature`
  - HTTP Method: POST
  - Response Mode: Using "Respond to Webhook" node

#### ✅ Validate - Input Schema
- **Type**: IF Node
- **Purpose**: Validates required fields are present
- **Conditions**:
  - `feature_description` is not empty
  - `codebase_path` is not empty

#### ⚠️ Set - Validation Error
- **Type**: Set Node
- **Purpose**: Formats validation error message
- **Triggered**: When validation fails

#### 📂 Verify - Codebase Path Exists
- **Type**: Execute Command
- **Purpose**: Verifies the codebase path is valid
- **Command**: `cd "$codebase_path" && ls -la`
- **Timeout**: 5 seconds

### 2. Flow Execution Section

#### 📝 Write - Feature Description File
- **Type**: Execute Command
- **Purpose**: Creates temporary feature description file
- **Command**: `echo "$feature_description" > .claude/temp_feature_request.md`
- **Timeout**: 5 seconds

#### 🤖 Execute - Claude PRD Generation
- **Type**: Execute Command
- **Purpose**: Generates Product Requirements Document
- **Command**: `claude /flow:prd < .claude/temp_feature_request.md`
- **Timeout**: 5 minutes (300 seconds)

#### 📝 Parse - PRD Output
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts PRD file path from command output
- **Logic**:
  - Parses stdout for PRD filename pattern
  - Validates file path was generated
  - Passes path to next node

#### 🤖 Execute - Claude Design Generation
- **Type**: Execute Command
- **Purpose**: Generates Technical Design Document
- **Command**: `echo "$prd_file_path" | claude /flow:design`
- **Timeout**: 5 minutes

#### 📝 Parse - TDD Output
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts TDD file path from command output
- **Logic**: Similar to PRD parsing

#### 🤖 Execute - Claude Tasks Generation
- **Type**: Execute Command
- **Purpose**: Generates task list from TDD
- **Command**: `echo "$tdd_file_path" | claude /flow:tasks`
- **Timeout**: 5 minutes

#### 📝 Parse - Tasks Output
- **Type**: Code Node (JavaScript)
- **Purpose**: Extracts tasks file path from command output

#### 🤖 Execute - Claude Code Generation
- **Type**: Execute Command
- **Purpose**: Executes tasks and generates actual code
- **Command**: `echo "$tasks_file_path" | claude /flow:execute-task`
- **Timeout**: 30 minutes (1800 seconds)
- **Note**: Longest timeout due to actual code generation

#### 📝 Parse - Execution Output
- **Type**: Code Node (JavaScript)
- **Purpose**: Validates code generation success
- **Logic**:
  - Checks exit code
  - Formats output and error messages
  - Determines success/failure status

### 3. Output & Cleanup Section

#### 🧹 Cleanup - Temp Files
- **Type**: Execute Command
- **Purpose**: Removes temporary feature description file
- **Command**: `rm -f .claude/temp_feature_request.md`
- **Timeout**: 5 seconds

#### ✨ Format - Success Response
- **Type**: Set Node
- **Purpose**: Formats final success response with all file paths

#### ✉️ Send - Success Response
- **Type**: Respond to Webhook
- **Purpose**: Sends successful response to client
- **HTTP Code**: 200

### 4. Error Handling Section

#### ⚠️ On Error
- **Type**: Error Trigger
- **Purpose**: Catches any error from workflow nodes
- **Mode**: Catch errors

#### ⚠️ Format - Error Response
- **Type**: Set Node
- **Purpose**: Formats error information
- **Fields**:
  - status: "error"
  - message: Error description
  - step: Node where error occurred

#### 🧹 Cleanup - On Error
- **Type**: Execute Command
- **Purpose**: Cleanup temp files even on error
- **Configuration**: `continueOnFail: true`

#### ✉️ Send - Error Response Final
- **Type**: Respond to Webhook
- **Purpose**: Sends error response to client
- **HTTP Code**: 500

---

## Timeouts Configuration

| Node | Timeout | Rationale |
|------|---------|-----------|
| Verify Codebase | 5s | Simple directory check |
| Write Feature File | 5s | Write small file |
| PRD Generation | 5min | AI analysis + document generation |
| Design Generation | 5min | Architecture design + exploration |
| Tasks Generation | 5min | Task breakdown and planning |
| Code Execution | 30min | Actual code generation (TDD cycles) |
| Cleanup | 5s | File deletion |

**Note**: Adjust timeouts based on your codebase size and complexity.

---

## Error Handling Strategy

### Validation Errors (400)
- Missing required parameters
- Invalid parameter format
- Codebase path doesn't exist

### Execution Errors (500)
- Claude Code command failures
- Parse errors (file path extraction)
- Code generation failures
- Timeout errors

### Recovery Mechanisms

1. **Automatic Cleanup**: Temp files are removed on both success and error paths
2. **Detailed Error Messages**: Include failing node and error description
3. **Exit Code Tracking**: Monitors command exit codes for validation
4. **Timeout Protection**: All commands have reasonable timeouts

---

## Monitoring & Logging

### What Gets Logged

1. **Input Validation**:
   - Received parameters
   - Validation results

2. **Command Execution**:
   - Command output (stdout)
   - Error output (stderr)
   - Exit codes

3. **File Paths**:
   - Generated PRD file path
   - Generated TDD file path
   - Generated tasks file path

4. **Execution Status**:
   - Success/failure per step
   - Timestamp of completion

### Accessing Logs

**Via n8n UI**:
1. Navigate to Executions tab
2. Find your workflow execution
3. Click to view detailed logs
4. Expand nodes to see input/output

**Via n8n API**:
```bash
curl https://your-n8n-instance.com/rest/executions?workflowId=<workflow-id>
```

---

## Performance Optimization

### Current Configuration

- **Sequential Execution**: Steps run one after another (required for dependencies)
- **Minimal Data Transfer**: Only essential data passed between nodes
- **Early Validation**: Fail fast on invalid inputs
- **Efficient Parsing**: Regex-based file path extraction

### Potential Optimizations

1. **Parallel Validation**: Could run codebase verification in parallel with schema validation
2. **Caching**: Cache frequently used codebase metadata
3. **Resource Limits**: Configure n8n worker limits for concurrent executions

---

## Security Considerations

### Current Security Measures

1. **No Credential Hardcoding**: Workflow doesn't store sensitive data
2. **Path Validation**: Codebase path is verified before use
3. **Command Injection Prevention**: Uses proper quoting for shell commands
4. **Timeout Protection**: All commands have maximum execution time

### Recommended Additional Security

1. **Authentication**: Add authentication to webhook endpoint
2. **Rate Limiting**: Implement rate limiting on webhook
3. **Input Sanitization**: Additional validation on feature_description
4. **Allowlist**: Restrict codebase_path to approved directories
5. **Audit Logging**: Log all requests for security review

### Example: Adding Webhook Authentication

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "generate-feature",
    "authentication": "headerAuth",
    "options": {
      "rawBody": true
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "your-credential-id",
      "name": "API Key Auth"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Command not found: claude"

**Problem**: Claude Code CLI not in PATH

**Solution**:
```bash
# Find where claude is installed
which claude

# Add to PATH in workflow or n8n environment
export PATH="$PATH:/path/to/claude/bin"
```

#### 2. "Failed to extract file path"

**Problem**: Command output format changed or command failed

**Solution**:
- Check command output in execution logs
- Verify regex pattern in parse nodes matches actual output
- Check Claude Code version compatibility

#### 3. Timeout Errors

**Problem**: Execution taking longer than configured timeout

**Solution**:
- Increase timeout values for relevant nodes
- Check system resources (CPU, memory)
- Verify codebase size isn't abnormally large

#### 4. Permission Denied Errors

**Problem**: n8n process doesn't have file system permissions

**Solution**:
```bash
# Ensure n8n has access to codebase directory
chmod -R u+rw /path/to/codebase/.claude

# Run n8n with appropriate user permissions
```

#### 5. Workflow Doesn't Activate

**Problem**: Execute Command node only works on self-hosted n8n

**Solution**:
- Must use self-hosted n8n instance
- Cannot use n8n Cloud for this workflow
- Consider Docker-based deployment

---

## Customization

### Adding Notifications

Add email/Slack notification on completion:

```json
{
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#dev-notifications",
    "text": "Feature generation complete: {{$json.message}}"
  },
  "name": "📢 Notify - Slack",
  "type": "n8n-nodes-base.slack"
}
```

### Adding Git Commit

Auto-commit generated code:

```json
{
  "parameters": {
    "command": "cd \"={{$json.body.codebase_path}}\" && git add . && git commit -m \"feat: {{$json.feature_description}}\"",
    "timeout": 30000
  },
  "name": "📦 Git - Commit Changes",
  "type": "n8n-nodes-base.executeCommand"
}
```

### Adding Code Review

Integrate with GitHub for PR creation:

```json
{
  "parameters": {
    "resource": "pullRequest",
    "operation": "create",
    "owner": "your-org",
    "repository": "your-repo",
    "title": "AI Generated: {{$json.feature_description}}",
    "body": "Generated via Claude Code Flow\n\nPRD: {{$json.prd_file}}\nTDD: {{$json.tdd_file}}"
  },
  "name": "🔀 GitHub - Create PR",
  "type": "n8n-nodes-base.github"
}
```

---

## Alternative Input Methods

### File-Based Input

Instead of feature_description text, accept file path:

```json
{
  "feature_file_path": "/path/to/feature-description.md"
}
```

Modify workflow to read file instead of creating temp file.

### GitHub Issue Integration

Trigger workflow from GitHub issue creation:

1. Replace Webhook trigger with GitHub trigger
2. Extract issue body as feature_description
3. Use repository path as codebase_path

### Scheduled Batch Processing

Process multiple features from a queue:

1. Add Schedule trigger
2. Read feature requests from database/file
3. Process each in loop
4. Store results back to database

---

## Deployment Best Practices

### Docker Deployment

```dockerfile
FROM n8nio/n8n:latest

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Set environment variables
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=change-this

# Mount volume for data persistence
VOLUME /home/node/.n8n

EXPOSE 5678

CMD ["n8n", "start"]
```

### Environment Variables

```bash
# n8n Configuration
export N8N_HOST=your-domain.com
export N8N_PORT=5678
export N8N_PROTOCOL=https

# Claude Code Configuration
export CLAUDE_API_KEY=your-api-key

# Workflow Configuration
export MAX_EXECUTION_TIMEOUT=1800000
export N8N_PAYLOAD_SIZE_MAX=16
```

### Production Checklist

- [ ] Enable workflow error notifications
- [ ] Set up monitoring/alerting
- [ ] Configure backup for workflow definitions
- [ ] Enable execution data persistence
- [ ] Set up SSL/TLS for webhook endpoint
- [ ] Implement authentication on webhook
- [ ] Configure rate limiting
- [ ] Test with production-size codebases
- [ ] Document recovery procedures
- [ ] Set up log aggregation

---

## Version History

### v1.0 (2025-11-16)
- Initial release
- Implements complete flow pipeline (PRD → Design → Tasks → Code)
- Error handling with automatic cleanup
- Configurable timeouts per step
- JSON response with all generated file paths

---

## Support & Contributing

### Getting Help

1. Check this README for common issues
2. Review n8n execution logs
3. Check Claude Code documentation
4. Open GitHub issue with execution logs

### Contributing

1. Fork the workflow
2. Make modifications in n8n UI
3. Export workflow JSON
4. Submit pull request with description

---

## License

This workflow configuration is provided as-is for use with n8n and Claude Code.

---

## Related Resources

- **n8n Documentation**: https://docs.n8n.io/
- **Claude Code Docs**: https://code.claude.com/docs/
- **Flow Commands**: See `.claude/commands/flow/` in your repository
- **Best Practices**: See `research/n8n_workflow_best_practices_2025.md`

---

**Last Updated**: 2025-11-16
**Workflow Version**: 1.0
**Compatible with**: n8n v1.0+, Claude Code latest
