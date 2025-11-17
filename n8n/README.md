# Claude Code n8n Workflows

Complete collection of n8n workflows for automated feature generation and code quality evaluation.

---

## Available Workflows

### 1. Base Feature Generator
**File**: `claude_code_feature_generator_workflow.json`

**What it does**: Generates code from feature description using Claude Code flow commands

**Use when**: You want simple, fast code generation without evaluation

**Features**:
- PRD → Design → Tasks → Code generation
- No evaluation
- Fast execution
- Minimal configuration

---

### 2. Feature Generator with Inline Evaluation
**File**: `claude_code_feature_generator_with_evaluation.json`

**What it does**: Generates code AND runs quality checks synchronously

**Use when**: CI/CD pipeline needs blocking quality gates

**Features**:
- All base features
- Tests, linting, type checking
- Quality scoring (0-100)
- Synchronous (waits for evaluation)
- Optional (enable via parameter)

**Request**:
```json
{
  "feature_description": "...",
  "codebase_path": "...",
  "enable_evaluation": true
}
```

---

### 3. Feature Generator with Evaluation Trigger ⭐ **RECOMMENDED**
**Files**:
- `claude_code_feature_generator_with_trigger.json` (main)
- `claude_code_evaluation_trigger_workflow.json` (separate)

**What it does**: Generates code, triggers separate evaluation workflow asynchronously

**Use when**: Production deployment with background quality monitoring

**Features**:
- All base features
- **Non-blocking** - returns immediately
- Separate evaluation workflow
- Saves reports to file system
- Optional Slack notifications
- Scalable architecture

**How it works**:
1. Import BOTH workflows
2. Activate BOTH workflows
3. Main workflow triggers evaluation via webhook
4. Evaluation runs in background
5. Results saved to `.claude/evaluation_results/eval_{execution_id}.json`

---

## Quick Start

### Option 1: Simple Generation (No Evaluation)

```bash
# 1. Import workflow
#    n8n UI → Import → claude_code_feature_generator_workflow.json

# 2. Activate workflow

# 3. Use it
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add settings screen",
    "codebase_path": "/path/to/project"
  }'
```

### Option 2: With Evaluation Trigger (Recommended)

```bash
# 1. Import BOTH workflows
#    - claude_code_feature_generator_with_trigger.json
#    - claude_code_evaluation_trigger_workflow.json

# 2. Activate BOTH workflows

# 3. Create directory
mkdir -p .claude/evaluation_results

# 4. Use it
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Add settings screen",
    "codebase_path": "/path/to/project"
  }'

# 5. Check results later
cat .claude/evaluation_results/eval_{execution_id}.json
```

---

## Comparison Table

| Feature | Base | Inline Eval | Eval Trigger |
|---------|------|-------------|--------------|
| **Code Generation** | ✅ | ✅ | ✅ |
| **Test Execution** | ❌ | ✅ | ✅ |
| **Linting** | ❌ | ✅ | ✅ |
| **Type Checking** | ❌ | ✅ | ✅ |
| **Quality Score** | ❌ | ✅ | ✅ |
| **Response Time** | Fast | Slow | Fast |
| **Blocking** | No | Yes | No |
| **Workflows Needed** | 1 | 1 | 2 |
| **Slack Notifications** | ❌ | ❌ | ✅ |
| **Saved Reports** | ❌ | ❌ | ✅ |
| **Best For** | Prototypes | CI/CD Gates | Production |

---

## Documentation

- **`n8n_workflow_best_practices_2025.md`** - Research on n8n best practices
- **`CLAUDE_CODE_N8N_WORKFLOW_README.md`** - Base workflow documentation
- **`EVALUATION_WORKFLOW_README.md`** - Inline evaluation documentation
- **`EVALUATION_TRIGGER_README.md`** - Evaluation trigger documentation (⭐ start here)

---

## Architecture Diagrams

### Base Workflow
```
User → Webhook → PRD → Design → Tasks → Code → Response
```

### Inline Evaluation
```
User → Webhook → PRD → Design → Tasks → Code → Eval → Response
                                                  ↓
                                           (Tests, Lint, Types)
```

### Evaluation Trigger
```
User → Webhook → PRD → Design → Tasks → Code → Trigger Eval → Response
                                                      ↓
                                                 (async call)
                                                      ↓
Eval Workflow: Tests → Lint → Types → Save Report → Notify
```

---

## Requirements

- **n8n**: Self-hosted instance (Execute Command node not on Cloud)
- **Claude Code CLI**: Installed and in PATH
- **Node.js**: For npm test, lint, tsc commands
- **Git Repository**: With `.claude/` directory

---

## Setup Checklist

- [ ] n8n installed and running
- [ ] Claude Code CLI installed
- [ ] Import workflow(s)
- [ ] Activate workflow(s)
- [ ] Create `.claude/evaluation_results/` (if using evaluation)
- [ ] Configure Slack (optional)
- [ ] Test with sample request

---

## Example Request

```bash
curl -X POST http://localhost:5678/webhook/generate-feature \
  -H "Content-Type: application/json" \
  -d '{
    "feature_description": "Create a user profile screen with avatar upload and bio editing",
    "codebase_path": "/home/developer/projects/my-react-native-app"
  }'
```

---

## Example Response (with Evaluation Trigger)

```json
{
  "status": "success",
  "message": "Feature code generated successfully",
  "execution_id": "exec_1700000000_abc123",
  "prd_file": "prd_user_profile_20251116.md",
  "tdd_file": "tdd_user_profile_20251116.md",
  "tasks_file": "tasks_user_profile_20251116.md",
  "execution_summary": "Generated 5 components, 12 tests...",
  "timestamp": "2025-11-16T15:30:45.123Z",
  "evaluation": {
    "triggered": true,
    "message": "Evaluation workflow triggered asynchronously",
    "check_results_at": ".claude/evaluation_results/eval_exec_1700000000_abc123.json"
  }
}
```

---

## Common Issues

### "Command not found: claude"
- Claude Code CLI not in PATH
- Solution: Install Claude Code or add to PATH

### "Execute Command node not available"
- Using n8n Cloud (not supported)
- Solution: Use self-hosted n8n

### "Evaluation never completes"
- Evaluation trigger workflow not activated
- Solution: Activate both workflows

### "Permission denied"
- n8n can't write to `.claude/evaluation_results/`
- Solution: `chmod 755 .claude/evaluation_results`

---

## Support

For issues:
1. Check the relevant README for your workflow
2. Review n8n execution logs
3. Test commands manually (npm test, etc.)
4. Verify all prerequisites are met

---

## License

These workflows are provided as-is for use with n8n and Claude Code.

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Recommended**: Use evaluation trigger pattern for production
