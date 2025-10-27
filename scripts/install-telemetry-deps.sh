#!/bin/bash
#
# Install dependencies for telemetry support
#

echo "========================================="
echo "Installing Telemetry Dependencies"
echo "========================================="
echo ""

# Check if python3 is available
if ! command -v python3 &>/dev/null; then
    echo "Error: Python 3 is required but not found"
    echo ""
    echo "Install Python 3:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  macOS: brew install python3"
    echo "  Windows: Download from python.org"
    exit 1
fi

echo "Python 3: $(python3 --version)"
echo ""

# Check if pip is available
if ! command -v pip3 &>/dev/null && ! python3 -m pip --version &>/dev/null; then
    echo "Error: pip is required but not found"
    echo ""
    echo "Install pip:"
    echo "  Ubuntu/Debian: sudo apt install python3-pip"
    echo "  macOS: python3 -m ensurepip"
    exit 1
fi

echo "Installing langfuse SDK..."
echo ""

# Try different installation methods based on system
INSTALL_SUCCESS=false

# Method 1: Try pipx (recommended for externally-managed environments)
if command -v pipx &>/dev/null; then
    echo "Using pipx (recommended)..."
    if pipx install langfuse; then
        INSTALL_SUCCESS=true
    fi
fi

# Method 2: Try regular pip install
if [ "$INSTALL_SUCCESS" = false ]; then
    echo "Trying pip install..."
    if python3 -m pip install langfuse 2>/dev/null; then
        INSTALL_SUCCESS=true
    fi
fi

# Method 3: Try with --user flag
if [ "$INSTALL_SUCCESS" = false ]; then
    echo "Trying pip install --user..."
    if python3 -m pip install --user langfuse 2>/dev/null; then
        INSTALL_SUCCESS=true
    fi
fi

# Method 4: Suggest virtual environment or system override
if [ "$INSTALL_SUCCESS" = false ]; then
    echo ""
    echo "========================================="
    echo "⚠ Standard Installation Methods Failed"
    echo "========================================="
    echo ""
    echo "Your system uses externally-managed Python environment."
    echo ""
    echo "Choose one of these options:"
    echo ""
    echo "Option 1: Use pipx (recommended)"
    echo "  sudo apt install pipx  # or: brew install pipx"
    echo "  pipx install langfuse"
    echo ""
    echo "Option 2: Install with --user flag"
    echo "  python3 -m pip install --user langfuse"
    echo ""
    echo "Option 3: Use virtual environment (best for development)"
    echo "  python3 -m venv ~/.venvs/langfuse"
    echo "  ~/.venvs/langfuse/bin/pip install langfuse"
    echo "  # Then use: ~/.venvs/langfuse/bin/python3 scripts/..."
    echo ""
    echo "Option 4: Override system protection (not recommended)"
    echo "  python3 -m pip install --break-system-packages langfuse"
    echo ""
    echo "Option 5: Disable telemetry"
    echo "  DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh \"feature\""
    echo ""
    exit 1
fi

echo ""
echo "========================================="
echo "✓ Installation Complete!"
echo "========================================="
echo ""
echo "Telemetry is now ready to use."
echo ""
echo "Next steps:"
echo "  1. Start Langfuse: cd observability && docker-compose up -d"
echo "  2. Run workflow: ./scripts/feature-to-code-unified.sh \"your feature\""
echo "  3. View traces: http://localhost:3000"
echo ""
