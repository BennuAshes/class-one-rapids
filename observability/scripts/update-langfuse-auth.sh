#!/bin/bash

# Script to update Langfuse authentication in OTEL Collector config
# Usage: ./update-langfuse-auth.sh <public-key> <secret-key>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <public-key> <secret-key>"
    echo ""
    echo "Example:"
    echo "  $0 pk-lf-abc123... sk-lf-xyz789..."
    echo ""
    echo "Get your keys from: http://localhost:3000 → Settings → API Keys"
    exit 1
fi

PUBLIC_KEY="$1"
SECRET_KEY="$2"

# Create base64 encoded auth string
AUTH_STRING=$(echo -n "${PUBLIC_KEY}:${SECRET_KEY}" | base64)

echo "🔑 Generated auth string:"
echo "   ${AUTH_STRING}"
echo ""

# Update the otel-collector-config.yaml file
if [ -f "otel-collector-config.yaml" ]; then
    # Backup original
    cp otel-collector-config.yaml otel-collector-config.yaml.backup
    
    # Update the authorization header
    sed -i.tmp "s|authorization: \"Basic .*\"|authorization: \"Basic ${AUTH_STRING}\"|g" otel-collector-config.yaml
    rm -f otel-collector-config.yaml.tmp
    
    echo "✅ Updated otel-collector-config.yaml"
    echo ""
    echo "📋 Next steps:"
    echo "   1. docker-compose restart otel-collector"
    echo "   2. Run a test workflow"
    echo "   3. Check http://localhost:3000 for traces"
else
    echo "❌ Error: otel-collector-config.yaml not found"
    exit 1
fi

