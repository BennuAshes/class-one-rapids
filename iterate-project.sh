#!/bin/bash

# iterate-project.sh - Project iteration script
# Usage: ./iterate-project.sh [project-name] [--skip-archive] [--from-design-doc] [--clean-start]

set -e  # Exit on error

# Default values
PROJECT_NAME="${1:-pet-software-idler}"
SKIP_ARCHIVE=false
FROM_DESIGN_DOC=true
CLEAN_START=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-archive)
            SKIP_ARCHIVE=true
            ;;
        --no-design-doc|--clean-start)
            FROM_DESIGN_DOC=false
            CLEAN_START=true
            ;;
        --from-design-doc)
            FROM_DESIGN_DOC=true
            ;;
    esac
done

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 PROJECT ITERATION SCRIPT                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure we're in the right directory
if [ ! -d "/mnt/c/dev/class-one-rapids/projects" ]; then
    echo -e "${RED}❌ Error: projects directory not found${NC}"
    echo "Please run this script from /mnt/c/dev/class-one-rapids/"
    exit 1
fi

cd /mnt/c/dev/class-one-rapids

# PHASE 1: VERSION DETECTION
echo -e "${YELLOW}📊 PHASE 1: VERSION DETECTION${NC}"
echo "----------------------------------------"

# Find highest version in archive
if [ -d "projects/archive" ]; then
    VERSIONS=$(ls -d projects/archive/${PROJECT_NAME}-v* 2>/dev/null | grep -oE 'v[0-9]+' | sed 's/v//' | sort -n)
    
    if [ -z "$VERSIONS" ]; then
        CURRENT_VERSION=0
    else
        CURRENT_VERSION=$(echo "$VERSIONS" | tail -1)
    fi
else
    CURRENT_VERSION=0
fi

NEXT_VERSION=$((CURRENT_VERSION + 1))

echo "  Current highest version: v${CURRENT_VERSION}"
echo "  Next version will be: v${NEXT_VERSION}"
echo ""

# PHASE 2: ARCHIVE CURRENT PROJECT
echo -e "${YELLOW}📦 PHASE 2: ARCHIVE CURRENT PROJECT${NC}"
echo "----------------------------------------"

if [ -d "projects/${PROJECT_NAME}" ] && [ "$SKIP_ARCHIVE" = false ]; then
    ARCHIVE_NAME="${PROJECT_NAME}-v${NEXT_VERSION}"
    
    # Check if archive already exists
    if [ -d "projects/archive/${ARCHIVE_NAME}" ]; then
        echo -e "${RED}❌ Error: Archive already exists: projects/archive/${ARCHIVE_NAME}${NC}"
        echo "Use --skip-archive to bypass archiving"
        exit 1
    fi
    
    # Create archive directory if it doesn't exist
    mkdir -p projects/archive
    
    # Move current project to archive
    echo "  Moving projects/${PROJECT_NAME} → projects/archive/${ARCHIVE_NAME}"
    mv "projects/${PROJECT_NAME}" "projects/archive/${ARCHIVE_NAME}"
    
    if [ -d "projects/archive/${ARCHIVE_NAME}" ]; then
        echo -e "${GREEN}  ✅ Successfully archived as: archive/${ARCHIVE_NAME}${NC}"
    else
        echo -e "${RED}❌ Error: Archive failed${NC}"
        exit 1
    fi
elif [ "$SKIP_ARCHIVE" = true ]; then
    echo "  ⏭️  Skipping archive (--skip-archive flag)"
else
    echo "  ℹ️  No current project to archive"
fi
echo ""

# PHASE 3: CREATE NEW PROJECT STRUCTURE
echo -e "${YELLOW}🏗️  PHASE 3: CREATE NEW PROJECT STRUCTURE${NC}"
echo "----------------------------------------"

# Create new project directory
mkdir -p "projects/${PROJECT_NAME}"
cd "projects/${PROJECT_NAME}"

# Create version file
echo "v${NEXT_VERSION}" > .version
echo "  Created: .version (v${NEXT_VERSION})"

# Create iteration metadata
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > iteration-metadata.json << EOF
{
  "version": "${NEXT_VERSION}",
  "created": "${TIMESTAMP}",
  "previous_version": "${CURRENT_VERSION}",
  "workflow_stage": "initialized",
  "artifacts": {
    "design_doc": false,
    "prd": false,
    "technical_requirements": false,
    "runbook": false
  },
  "flags": {
    "from_design_doc": ${FROM_DESIGN_DOC,,},
    "skip_archive": ${SKIP_ARCHIVE,,},
    "clean_start": ${CLEAN_START,,}
  }
}
EOF
echo "  Created: iteration-metadata.json"

# Copy design-doc.md if it exists and flag is set
if [ "$FROM_DESIGN_DOC" = true ] && [ -f "../design-doc.md" ]; then
    cp "../design-doc.md" "./design-doc.md"
    # Update metadata to reflect design_doc is available
    sed -i 's/"design_doc": false/"design_doc": true/' iteration-metadata.json
    echo "  Created: design-doc.md (copied from projects/)"
elif [ "$FROM_DESIGN_DOC" = true ]; then
    echo "  ⚠️  No design-doc.md found in projects/ to copy"
fi

# Create QUICK_START.md
cat > QUICK_START.md << EOF
# Project Quick Start - v${NEXT_VERSION}

## 📊 Project Information
- **Version**: v${NEXT_VERSION}
- **Previous Version**: v${CURRENT_VERSION}
- **Created**: ${TIMESTAMP}
- **Location**: /mnt/c/dev/class-one-rapids/projects/${PROJECT_NAME}

## 📄 Available Artifacts
EOF

if [ -f "design-doc.md" ]; then
    echo "- ✅ design-doc.md" >> QUICK_START.md
else
    echo "- ❌ design-doc.md (not available)" >> QUICK_START.md
fi

cat >> QUICK_START.md << EOF
- ⏳ PRD (not generated)
- ⏳ Technical Requirements (not generated)
- ⏳ Runbook (not generated)

## 🚀 Next Steps

Run these commands as needed:

1. **Generate PRD** (if design-doc.md exists):
   \`\`\`
   /prp:generate-advanced-prd design-doc.md
   \`\`\`

2. **Analyze Technical Requirements** (after PRD is generated):
   \`\`\`
   /prp:analyze-prd-technical-requirements [prd-file]
   \`\`\`

3. **Create Development Runbook** (after technical requirements):
   \`\`\`
   /prp:create-development-runbook-v2 [tech-requirements-file]
   \`\`\`

4. **Follow Runbook** (after runbook is created):
   \`\`\`
   /prp:follow-runbook-with-senior-engineer ./runbook/
   \`\`\`

## 📁 Project Structure
\`\`\`
${PROJECT_NAME}/
├── .version (v${NEXT_VERSION})
├── iteration-metadata.json
├── QUICK_START.md
EOF

if [ -f "design-doc.md" ]; then
    echo "└── design-doc.md" >> QUICK_START.md
else
    echo "└── (design-doc.md not present)" >> QUICK_START.md
fi

cat >> QUICK_START.md << EOF
\`\`\`

## 🔄 Archive Location
Previous version archived at: \`projects/archive/${PROJECT_NAME}-v${NEXT_VERSION}\`

---
*This project structure was created by the iteration script. No PRDs, technical requirements, or runbooks were generated automatically.*
EOF

echo "  Created: QUICK_START.md"
echo ""

# PHASE 4: FINAL SUMMARY
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 PROJECT ITERATION COMPLETE                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Summary:"
echo "  • Archived: v${CURRENT_VERSION} → archive/${PROJECT_NAME}-v${NEXT_VERSION}"
echo "  • Created:  v${NEXT_VERSION} → projects/${PROJECT_NAME}"
if [ -f "design-doc.md" ]; then
    echo "  • Files copied: design-doc.md ✓"
else
    echo "  • Files copied: none"
fi
echo "  • Status: Project structure ready"
echo ""
echo "📁 Project Location:"
echo "  $(pwd)"
echo ""
echo "📄 Created Files:"
echo "  • .version (v${NEXT_VERSION})"
echo "  • iteration-metadata.json"
echo "  • QUICK_START.md"
if [ -f "design-doc.md" ]; then
    echo "  • design-doc.md (copied from projects/)"
fi
echo ""
echo -e "${BLUE}🚀 Next Steps - Run these commands as needed:${NC}"
echo "  1. Generate PRD: /prp:generate-advanced-prd design-doc.md"
echo "  2. Analyze requirements: /prp:analyze-prd-technical-requirements [prd-file]"
echo "  3. Create runbook: /prp:create-development-runbook-v2 [tech-file]"
echo "  4. Follow runbook: /prp:follow-runbook-with-senior-engineer ./runbook/"
echo ""
echo -e "${YELLOW}NOTE: This script ONLY sets up the project structure.${NC}"
echo "It does NOT generate PRDs, technical requirements, or runbooks."
echo "Run the above commands separately as needed."
echo ""

# Validation check
if [ -f "/mnt/c/dev/class-one-rapids/runbook" ] || [ -f "/mnt/c/dev/class-one-rapids/PetSoftTycoon" ]; then
    echo -e "${RED}⚠️  WARNING: Found artifacts in root directory!${NC}"
    echo "Please check and clean up:"
    [ -d "/mnt/c/dev/class-one-rapids/runbook" ] && echo "  - /mnt/c/dev/class-one-rapids/runbook/"
    [ -d "/mnt/c/dev/class-one-rapids/PetSoftTycoon" ] && echo "  - /mnt/c/dev/class-one-rapids/PetSoftTycoon/"
else
    echo -e "${GREEN}✅ Verified: No artifacts in root directory${NC}"
fi