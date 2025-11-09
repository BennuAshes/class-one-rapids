#!/bin/bash
#
# Setup Telemetry Environment Variables Permanently
# Adds OTEL and Langfuse environment variables to ~/.bashrc
#

BASHRC="$HOME/.bashrc"
BACKUP="$HOME/.bashrc.backup.$(date +%Y%m%d_%H%M%S)"

echo "Setting up permanent telemetry environment variables"
echo "====================================================="
echo ""

# Create backup
echo "Creating backup of ~/.bashrc..."
cp "$BASHRC" "$BACKUP"
echo "✓ Backup created: $BACKUP"
echo ""

# Check if already configured
if grep -q "CLAUDE_CODE_ENABLE_TELEMETRY" "$BASHRC"; then
  echo "⚠ Telemetry variables already exist in ~/.bashrc"
  echo "  Remove old entries manually or restore from backup if needed"
  echo ""
  exit 0
fi

# Add environment variables
echo "Adding telemetry environment variables to ~/.bashrc..."

cat >> "$BASHRC" << 'EOF'

# ============================================================
# Claude Code Observability - Telemetry Configuration
# ============================================================

# OpenTelemetry Configuration (Claude Code native telemetry)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# Langfuse SDK Configuration (for direct tracing)
export LANGFUSE_PUBLIC_KEY="pk-lf-e7b25b9c-356f-4268-96cf-07318a4a5ee4"
export LANGFUSE_SECRET_KEY="sk-lf-980bcde7-ff84-40b2-b127-1e68a0b6c406"
export LANGFUSE_HOST="http://localhost:3000"

# Note: service.name and execution.id should be set per-workflow
# The feature-to-code.sh script sets these dynamically

EOF

echo "✓ Environment variables added to ~/.bashrc"
echo ""
echo "====================================================="
echo "Setup Complete!"
echo "====================================================="
echo ""
echo "What was added:"
echo "  • CLAUDE_CODE_ENABLE_TELEMETRY=1"
echo "  • OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318"
echo "  • LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST"
echo ""
echo "To use the new environment variables:"
echo ""
echo "Option 1 - Reload your shell config:"
echo "  source ~/.bashrc"
echo ""
echo "Option 2 - Start a new terminal"
echo ""
echo "Verify it worked:"
echo "  echo \$CLAUDE_CODE_ENABLE_TELEMETRY"
echo "  # Should output: 1"
echo ""
echo "To remove these later:"
echo "  1. Edit ~/.bashrc and remove the 'Claude Code Observability' section"
echo "  2. Or restore from backup: cp $BACKUP ~/.bashrc"
echo ""
