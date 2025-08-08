#!/bin/bash

# Package Validation Script
# Run this before executing any runbook to validate package requirements

echo "================================================"
echo "     PACKAGE REQUIREMENTS VALIDATION"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find the project root (where research folder is)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REQUIREMENTS_FILE="$SCRIPT_DIR/research/PACKAGE-REQUIREMENTS.md"

# Check if PACKAGE-REQUIREMENTS.md exists
if [ ! -f "$REQUIREMENTS_FILE" ]; then
    echo -e "${RED}❌ ERROR: $REQUIREMENTS_FILE not found${NC}"
    echo "This file contains critical package version requirements."
    exit 1
fi

echo -e "${GREEN}✓${NC} Found research/PACKAGE-REQUIREMENTS.md"
echo ""
echo "Critical Package Requirements:"
echo "=============================="

# Extract and display Legend State requirement
echo -e "${YELLOW}Legend State:${NC}"
grep -A 2 "## Legend State" "$REQUIREMENTS_FILE" | tail -n 2
echo ""

# Check if package.json exists in current project
if [ -f "package.json" ]; then
    echo "Checking installed packages..."
    echo "=============================="
    
    # Check for Legend State
    if grep -q "@legendapp/state" package.json; then
        if grep -q "@legendapp/state.*beta" package.json; then
            echo -e "${GREEN}✓${NC} Legend State @beta correctly installed"
        else
            echo -e "${RED}❌ WARNING: Legend State installed without @beta tag!${NC}"
            echo "  Required: @legendapp/state@beta"
            echo "  Fix: npm uninstall @legendapp/state && npm install @legendapp/state@beta"
        fi
    fi
    
    # Check for other critical packages
    if grep -q "react-native" package.json && grep -q "@legendapp/state" package.json; then
        if grep -q "react-native-mmkv" package.json; then
            echo -e "${GREEN}✓${NC} react-native-mmkv installed (required for Legend State persistence)"
        else
            echo -e "${YELLOW}⚠${NC} react-native-mmkv not installed (required for Legend State persistence in React Native)"
        fi
    fi
fi

echo ""
echo "================================================"
echo "Pre-execution checklist:"
echo "================================================"
echo "[ ] Reviewed research/PACKAGE-REQUIREMENTS.md"
echo "[ ] Verified all package versions match requirements"
echo "[ ] Checked for technology-specific research files"
echo "[ ] Updated runbook if discrepancies found"
echo ""
echo -e "${YELLOW}Remember:${NC} ALWAYS check PACKAGE-REQUIREMENTS.md before ANY npm install"
echo ""