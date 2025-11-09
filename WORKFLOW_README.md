# Feature to Code Workflow - v2.0

A streamlined, Python-based workflow automation tool for generating PRDs, technical designs, task lists, and executing implementation tasks.

## Quick Start

```bash
# Basic usage
./workflow "Add user authentication with OAuth2"

# From a feature file
./workflow docs/features/oauth.md

# Resume existing workflow
./workflow workflow-outputs/20251108_123456
```

## Installation

The workflow tool is already set up in this repository. Requirements:
- Python 3.7+
- Claude CLI (`claude` command)
- Git (for file tracking)
- Langfuse (optional, for telemetry)

## Approval Modes

Choose an approval mode that fits your workflow:

### 🚀 Minimal (`--approval minimal`)
- Auto-approves PRD, Design, and Tasks
- **Always** requires approval for Execute Tasks
- Best for rapid prototyping

```bash
./workflow --approval minimal "Quick feature"
```

### 📋 Standard (`--approval standard`) - Default
- File-based approval for each step
- Create `.response` files to approve/reject
- Best for CI/CD pipelines

```bash
./workflow "Feature needing review"
```

### 🔒 Strict (`--approval strict`)
- Requires approval for everything
- Including command improvements
- Best for production workflows

```bash
./workflow --approval strict "Critical feature"
```

### 💬 Interactive (`--approval interactive`)
- Terminal prompts for approval
- Immediate feedback
- Best for local development

```bash
./workflow --approval interactive "Dev feature"
```

## Command-Line Options

```
workflow [OPTIONS] FEATURE

Arguments:
  FEATURE           Feature description, file path, or workflow directory

Options:
  --approval MODE   Approval mode: minimal, standard, strict, interactive
  --output DIR      Output directory (default: workflow-outputs)
  --timeout SEC     Approval timeout in seconds (0 = unlimited)
  --webhook URL     Webhook URL for notifications
  --no-telemetry    Disable Langfuse telemetry
  --help            Show help message
  --version         Show version
```

## Examples

### Basic Feature Implementation
```bash
./workflow "Add shopping cart to e-commerce site"
```

### Quick Prototyping (Auto-Approval)
```bash
./workflow --approval minimal "Add login button"
```

### Production Feature with Reviews
```bash
./workflow --approval strict --webhook https://hooks.slack.com/xxx \
  "Implement payment processing"
```

### Custom Output Location
```bash
./workflow --output projects/new-feature "Feature description"
```

### Local Development (Interactive)
```bash
./workflow --approval interactive feature.md
```

## Workflow Steps

1. **Generate PRD** - Creates Product Requirements Document
2. **Generate Technical Design** - Creates Technical Design Document
3. **Generate Task List** - Creates executable task list
4. **Execute Tasks** ⚠️ - Runs implementation (always requires explicit approval)
5. **Generate Summary** - Creates workflow summary

## Features

### ✅ Always Enabled
- **Artifact Extraction** - Readable docs from JSON output
- **File Change Tracking** - Git-based change tracking
- **Step Status Tracking** - Persistent workflow state
- **Resume Capability** - Continue interrupted workflows

### 🎯 Configurable
- **Approval Mode** - Choose your workflow style
- **Telemetry** - Langfuse integration (optional)
- **Webhooks** - External notifications
- **Output Location** - Custom directories

### 🔄 Feedback & Improvements
When a step is rejected with feedback:
1. System analyzes the feedback
2. Suggests command improvements
3. Can auto-apply improvements (based on profile)
4. Can auto-retry with improvements

## File Structure

```
workflow-outputs/
└── 20251108_123456/          # Execution ID
    ├── workflow-status.json   # Workflow state
    ├── prd_20251108.md       # Generated PRD
    ├── tdd_20251108.md       # Technical Design
    ├── tasks_20251108.md     # Task List
    ├── .git/                 # Change tracking
    └── .approval_*.json      # Approval requests
```

## Environment Variables

Only needed for Langfuse telemetry:
- `LANGFUSE_PUBLIC_KEY` - Your public key
- `LANGFUSE_SECRET_KEY` - Your secret key
- `LANGFUSE_HOST` - Langfuse URL (default: http://localhost:3000)

## Migration from Old System

See [MIGRATION_GUIDE.md](scripts/MIGRATION_GUIDE.md) for details on migrating from the old bash-based system.

### Quick Migration

Old:
```bash
APPROVAL_MODE=auto DISABLE_TELEMETRY=1 \
  ./scripts/feature-to-code-unified.sh "feature"
```

New:
```bash
./workflow --approval minimal --no-telemetry "feature"
```

## Troubleshooting

### Python Not Found
```bash
# Install Python 3
sudo apt install python3  # Ubuntu/Debian
brew install python3      # macOS
```

### Claude CLI Not Found
Make sure `claude` is in your PATH and properly configured.

### Langfuse Connection Error
- Telemetry fails gracefully
- Use `--no-telemetry` to disable
- Or start Langfuse: `cd observability && docker-compose up -d`

### Approval Timeout
- Default is unlimited (0)
- Set timeout: `--timeout 300` (5 minutes)

### Git Not Found
File tracking requires git. Install with your package manager.

## Best Practices

1. **Start with Minimal Mode** for quick iterations
2. **Use Standard Mode** for team workflows
3. **Enable Telemetry** to track costs and performance
4. **Review Extracted Docs** in `docs/specs/`
5. **Keep Workflow Outputs** for audit trail

## Support

- **Issues**: Report at [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: See `scripts/README.md` for detailed docs
- **Help**: Run `./workflow --help`

## Version

Current version: 2.0.0

### What's New in v2.0
- Simplified Python-only implementation
- Approval profiles for easier configuration
- Enhanced feedback and retry system
- Git-based file tracking
- Better error handling and recovery