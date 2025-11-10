# Workflow System - Quick Reference

## Common Commands

### Basic Usage
```bash
# Simple workflow
./workflow "Add user authentication"

# From file
./workflow feature.md

# Resume existing
./workflow workflow-outputs/20251108_123456
```

### With Options
```bash
# Fast iteration (auto-approve)
./workflow --approval minimal feature.md

# Production workflow
./workflow --approval strict feature.md

# Interactive mode
./workflow --approval interactive feature.md

# No telemetry
./workflow --no-telemetry feature.md
```

### Testing & Development
```bash
# Mock mode (instant, no API)
./workflow --mock --approval minimal test-feature.md

# Instant mock (0s delay)
./workflow --mock --mock-delay 0 --approval minimal test-feature.md

# Parallel execution
./workflow --parallel --approval minimal feature.md

# Run test suite
./test-workflow.sh
```

## Approval Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `minimal` | Auto-approve except Execute | Rapid prototyping |
| `standard` | File-based (default) | CI/CD pipelines |
| `strict` | Approve everything | Production |
| `interactive` | Terminal prompts | Local development |

## Performance Tips

### Cache Usage
```bash
# Build cache
./workflow --approval minimal feature.md

# Use cache (90%+ faster)
./workflow --approval minimal feature.md

# Clear cache
rm -rf .workflow-cache/
```

### Mock Testing
```bash
# Fastest testing
./workflow --mock --mock-delay 0 --approval minimal test-feature.md

# With realistic timing
./workflow --mock --mock-delay 0.5 --approval minimal test-feature.md
```

## File Locations

```
workflow-outputs/
└── YYYYMMDD_HHMMSS/
    ├── workflow-status.json    # State
    ├── prd_*.md               # PRD
    ├── tdd_*.md               # Design
    ├── tasks_*.md             # Tasks
    ├── .cache/                # Cache
    └── .approval_*.json       # Approvals
```

## Approval Responses

### Approve
```bash
echo '{"status":"approved"}' > workflow-outputs/*/approval_*.json.response
```

### Reject
```bash
echo '{"status":"rejected","reason":"Not complete"}' > workflow-outputs/*/approval_*.json.response
```

### Reject with Feedback
```bash
cat > workflow-outputs/*/approval_*.json.response << 'EOF'
{
  "status": "rejected",
  "structured_feedback": [{
    "category": "INCOMPLETE",
    "description": "Missing details",
    "severity": "high",
    "suggestions": ["Add X", "Include Y"]
  }]
}
EOF
```

## Troubleshooting

### Check Status
```bash
cat workflow-outputs/*/workflow-status.json | python3 -m json.tool
```

### View Cache Stats
```bash
cat workflow-outputs/*/.cache/cache_stats.json | python3 -m json.tool
```

### Clear Everything
```bash
rm -rf workflow-outputs/
```

### Test Installation
```bash
./workflow --help
./test-workflow.sh
```

## Environment Variables

```bash
# Langfuse telemetry
export LANGFUSE_PUBLIC_KEY="your-key"
export LANGFUSE_SECRET_KEY="your-secret"
export LANGFUSE_HOST="http://localhost:3000"
```

## Keyboard Shortcuts

None - all command-line based!

## Performance Expectations

| Scenario | Time |
|----------|------|
| Mock mode (instant) | 1-2s |
| Mock mode (default) | 2-3s |
| Cached workflow | 5-10s |
| Real workflow (first run) | 3-5 min |
| Real workflow (cached) | 30-60s |

## Help

```bash
# Show all options
./workflow --help

# Check version
./workflow --version

# Run tests
./test-workflow.sh
```

## Examples

### Development Cycle
```bash
./workflow --mock --approval minimal feature.md  # Test
./workflow --approval minimal feature.md          # Real run
./workflow --approval minimal feature.md          # Cached!
```

### CI/CD
```bash
./test-workflow.sh                                # Validate
./workflow --mock --approval minimal feature.md  # Quick test
```

### Production
```bash
./workflow --approval strict --webhook $SLACK_URL feature.md
```

## Feedback Categories

- `FACTUAL_ERROR` - Wrong information
- `INCOMPLETE` - Missing content
- `TONE` - Style issues
- `STRUCTURE` - Organization problems
- `MISSING_CONTEXT` - Lacks background
- `TECHNICAL_ISSUE` - Technical errors
- `CLARITY` - Hard to understand
- `REQUIREMENTS_MISMATCH` - Doesn't match specs
- `OTHER` - Other issues

## Best Practices

1. ✅ Use `--mock` for development
2. ✅ Run `./test-workflow.sh` before commits
3. ✅ Cache speeds up iterations
4. ✅ Use `minimal` for prototyping
5. ✅ Use `strict` for production
6. ✅ Provide structured feedback
7. ✅ Clear cache periodically

## Links

- Full Guide: `WORKFLOW_README.md`
- Testing: `MOCK_MODE_GUIDE.md`
- Optimizations: `COMPLETE_OPTIMIZATION_SUMMARY.md`
- Migration: `scripts/MIGRATION_GUIDE.md`