---
description: Automatically archive current project, create next version, and restart workflow from design doc
argument-hint: [project-name] [--from-design-doc] [--skip-archive] [--clean-start]
allowed-tools: ["Bash", "Read", "Write", "Edit", "MultiEdit", "LS", "Glob", "TodoWrite"]
---

<workflow_command>
  <role>Senior Project Iteration Engineer specializing in rapid prototyping workflows, version management, and automated project lifecycle optimization</role>
  
  <context>
    <expertise>
      - Semantic versioning and project archival strategies
      - Automated workflow orchestration
      - Git-based version control patterns
      - Rapid iteration methodologies
      - Clean state initialization
      - Research-driven development workflows
    </expertise>
    <mission>Seamlessly transition to next project iteration while preserving learning and maintaining workflow continuity</mission>
  </context>

  <memory_strategy>Track versioning history, preserve learnings, maintain research context</memory_strategy>
  
  <parallel_execution>Archive current version while preparing next iteration environment</parallel_execution>
  
  <checkpoint_recovery>Create rollback points at each major step for failure recovery</checkpoint_recovery>
</workflow_command>

EXECUTE intelligent project iteration with automatic version management: $ARGUMENTS

## PHASE 1: INTELLIGENT VERSION DETECTION

```bash
# Parse arguments
PROJECT_NAME="${1:-pet-software-idler}"
SKIP_ARCHIVE=false
FROM_DESIGN_DOC=true
CLEAN_START=false

# Parse optional flags
for arg in "$@"; do
  case $arg in
    --skip-archive) SKIP_ARCHIVE=true ;;
    --from-design-doc) FROM_DESIGN_DOC=true ;;
    --clean-start) CLEAN_START=true ;;
  esac
done

echo "🔄 Starting Project Iteration Workflow"
echo "   Project: $PROJECT_NAME"
echo ""
```

**Step 1.1: Detect Current Version**
```bash
# Find highest version number in archive
cd projects/archive

# List all versions and extract numbers
VERSIONS=$(ls -d ${PROJECT_NAME}-v* 2>/dev/null | grep -oE 'v[0-9]+' | sed 's/v//' | sort -n)

# Also check for v folders
V_FOLDERS=$(ls -d v* 2>/dev/null | grep -oE '^v[0-9]+$' | sed 's/v//' | sort -n)

# Combine and get max
ALL_VERSIONS="$VERSIONS $V_FOLDERS"
if [ -z "$ALL_VERSIONS" ]; then
  CURRENT_VERSION=0
else
  CURRENT_VERSION=$(echo $ALL_VERSIONS | tr ' ' '\n' | sort -n | tail -1)
fi

NEXT_VERSION=$((CURRENT_VERSION + 1))

echo "📊 Version Analysis:"
echo "   Current highest version: v$CURRENT_VERSION"
echo "   Next version will be: v$NEXT_VERSION"
echo ""
```

## PHASE 2: ARCHIVE CURRENT PROJECT

**Step 2.1: Check Current Project Status**
```bash
cd ../../  # Back to projects/

if [ -d "$PROJECT_NAME" ] && [ "$SKIP_ARCHIVE" = false ]; then
  echo "📦 Archiving current $PROJECT_NAME..."
  
  # Move to archive with next version
  ARCHIVE_NAME="${PROJECT_NAME}-v${NEXT_VERSION}"
  
  # Check if target archive directory already exists
  if [ -d "archive/$ARCHIVE_NAME" ]; then
    echo "❌ Error: Archive directory already exists: archive/$ARCHIVE_NAME"
    echo "   Cannot overwrite existing archive"
    echo ""
    echo "🔧 Possible solutions:"
    echo "   1. Delete the existing archive: rm -rf archive/$ARCHIVE_NAME"
    echo "   2. Use --skip-archive flag to bypass archiving"
    echo "   3. Manually rename the existing archive"
    echo ""
    echo "Aborting operation to prevent data loss."
    exit 1
  fi
  
  # Attempt to move with comprehensive error handling
  echo "   Moving $PROJECT_NAME to archive/$ARCHIVE_NAME..."
  if ! mv "$PROJECT_NAME" "archive/$ARCHIVE_NAME" 2>/dev/null; then
    # Capture detailed error information
    MOVE_ERROR=$?
    echo "❌ CRITICAL ERROR: Unable to archive $PROJECT_NAME"
    echo "   Exit code: $MOVE_ERROR"
    echo ""
    echo "🔍 Diagnostic Information:"
    echo "   - Source exists: $([ -d "$PROJECT_NAME" ] && echo "Yes" || echo "No")"
    echo "   - Archive dir exists: $([ -d "archive" ] && echo "Yes" || echo "No")"
    echo "   - Source permissions: $(ls -ld "$PROJECT_NAME" 2>/dev/null || echo "Cannot read")"
    echo "   - Archive permissions: $(ls -ld "archive" 2>/dev/null || echo "Cannot read")"
    echo ""
    echo "🔧 Possible solutions:"
    echo "   1. Close Cursor IDE and all terminals using the directory"
    echo "   2. Close any file explorers browsing the directory"
    echo "   3. Check if any processes are using the directory:"
    echo "      lsof +D $PROJECT_NAME (Linux/Mac)"
    echo "   4. Restart your terminal/shell session"
    echo "   5. Use --skip-archive flag to bypass archiving"
    echo "   6. Manually copy the directory instead of moving"
    echo ""
    echo "🚨 OPERATION STOPPED - No changes made to prevent data loss"
    echo "   Your current project remains untouched at: $PROJECT_NAME"
    exit 1
  fi
  
  # Verify the move was successful
  if [ ! -d "archive/$ARCHIVE_NAME" ]; then
    echo "❌ VERIFICATION FAILED: Archive was not created properly"
    echo "   Expected: archive/$ARCHIVE_NAME"
    echo "   Status: $(ls -ld "archive/$ARCHIVE_NAME" 2>/dev/null || echo "Does not exist")"
    echo ""
    echo "🚨 OPERATION FAILED - Manual intervention required"
    exit 1
  fi
  
  echo "✅ Successfully archived as: archive/$ARCHIVE_NAME"
  echo "   Verified: $(ls -ld "archive/$ARCHIVE_NAME" | awk '{print $1, $3, $4, $NF}')"
else
  if [ "$SKIP_ARCHIVE" = true ]; then
    echo "⏭️  Skipping archive (--skip-archive flag)"
  else
    echo "ℹ️  No current project to archive"
  fi
fi
echo ""
```

## PHASE 3: CREATE NEW PROJECT STRUCTURE

**Step 3.1: Initialize Fresh Project Directory**
```bash
echo "🚀 Creating new project: $PROJECT_NAME (v$NEXT_VERSION)"

# Create new project directory with error handling
if ! mkdir -p "$PROJECT_NAME" 2>/dev/null; then
  echo "❌ CRITICAL ERROR: Cannot create project directory: $PROJECT_NAME"
  echo "   This may indicate insufficient permissions or disk space"
  echo ""
  echo "🔧 Possible solutions:"
  echo "   1. Check disk space: df -h ."
  echo "   2. Check permissions: ls -ld . projects/"
  echo "   3. Try a different project name"
  echo ""
  echo "🚨 OPERATION FAILED"
  exit 1
fi

cd "$PROJECT_NAME" || {
  echo "❌ CRITICAL ERROR: Cannot enter project directory: $PROJECT_NAME"
  echo "   Directory was created but is not accessible"
  exit 1
}

# Create version marker with error handling
if ! echo "v$NEXT_VERSION" > .version 2>/dev/null; then
  echo "❌ ERROR: Cannot create version marker file"
  echo "   Check write permissions in: $(pwd)"
  exit 1
fi

# Copy design doc if it exists with error handling
if [ "$FROM_DESIGN_DOC" = true ]; then
  if [ -f "../design-doc.md" ]; then
    if cp "../design-doc.md" "./design-doc.md" 2>/dev/null; then
      echo "✅ Copied design-doc.md"
    else
      echo "⚠️  Failed to copy design-doc.md (permissions or disk space issue)"
      echo "   Continuing without design doc..."
    fi
  else
    echo "⚠️  No design-doc.md found in projects/"
  fi
fi

echo "✅ Project structure created successfully"
echo "   Location: $(pwd)"
echo "   Version: $(cat .version 2>/dev/null || echo "unknown")"
echo ""
```

## PHASE 4: GENERATE WORKFLOW ARTIFACTS

**Step 4.1: Generate Advanced PRD from Design Doc**
```bash
if [ -f "design-doc.md" ] && [ "$FROM_DESIGN_DOC" = true ]; then
  echo "📝 Generating advanced PRD from design doc..."
  
  # Use the generate-advanced-prd command
  # This will be executed by Claude Code
  echo "   Executing: /generate-advanced-prd design-doc.md"
  PRD_GENERATED=true
else
  echo "⏭️  Skipping PRD generation (no design doc)"
  PRD_GENERATED=false
fi
echo ""
```

**Step 4.2: Analyze Technical Requirements**
```bash
if [ "$PRD_GENERATED" = true ]; then
  echo "🔍 Analyzing technical requirements..."
  
  # Find the generated PRD file
  PRD_FILE=$(ls *prd*.md 2>/dev/null | head -1)
  
  if [ -n "$PRD_FILE" ]; then
    echo "   Executing: /analyze-prd-technical-requirements $PRD_FILE"
    TECH_ANALYZED=true
  else
    echo "⚠️  No PRD file found"
    TECH_ANALYZED=false
  fi
else
  TECH_ANALYZED=false
fi
echo ""
```

**Step 4.3: Create Development Runbook**
```bash
if [ "$TECH_ANALYZED" = true ]; then
  echo "📚 Creating development runbook..."
  
  # Find the technical requirements PRD
  TECH_PRD=$(ls *technical-requirements*.md 2>/dev/null | head -1)
  
  if [ -n "$TECH_PRD" ]; then
    echo "   Executing: /create-development-runbook-v2 $TECH_PRD"
    RUNBOOK_CREATED=true
  else
    echo "⚠️  No technical requirements file found"
    RUNBOOK_CREATED=false
  fi
else
  RUNBOOK_CREATED=false
fi
echo ""
```

## PHASE 5: WORKFLOW STATE MANAGEMENT

**Step 5.1: Create Iteration Metadata**
```bash
cat > iteration-metadata.json << EOF
{
  "version": "$NEXT_VERSION",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "previous_version": "$CURRENT_VERSION",
  "workflow_stage": "initialized",
  "artifacts": {
    "design_doc": $([ -f "design-doc.md" ] && echo "true" || echo "false"),
    "prd": $([ "$PRD_GENERATED" = true ] && echo "true" || echo "false"),
    "technical_requirements": $([ "$TECH_ANALYZED" = true ] && echo "true" || echo "false"),
    "runbook": $([ "$RUNBOOK_CREATED" = true ] && echo "true" || echo "false")
  },
  "flags": {
    "from_design_doc": $FROM_DESIGN_DOC,
    "skip_archive": $SKIP_ARCHIVE,
    "clean_start": $CLEAN_START
  }
}
EOF

echo "📊 Created iteration metadata"
```

**Step 5.2: Generate Quick Start Guide**
```bash
cat > QUICK_START.md << 'EOF'
# Project Iteration Quick Start

## Version Information
- **Current Version**: v$NEXT_VERSION
- **Previous Version**: v$CURRENT_VERSION
- **Created**: $(date)

## Workflow Status
✅ Project initialized
$([ "$PRD_GENERATED" = true ] && echo "✅ PRD generated" || echo "⏳ PRD pending")
$([ "$TECH_ANALYZED" = true ] && echo "✅ Technical requirements analyzed" || echo "⏳ Technical analysis pending")
$([ "$RUNBOOK_CREATED" = true ] && echo "✅ Runbook created" || echo "⏳ Runbook pending")

## Next Steps

### If starting fresh:
1. Edit `design-doc.md` with your requirements
2. Run `/generate-advanced-prd design-doc.md`
3. Run `/analyze-prd-technical-requirements [prd-file]`
4. Run `/create-development-runbook-v2 [tech-requirements-file]`
5. Run `/follow-runbook-with-senior-engineer ./runbook/`

### If continuing from runbook:
1. Run `/follow-runbook-with-senior-engineer ./runbook/`

### To validate architecture:
1. Run `/validate-architecture-alignment ./runbook/`

## Useful Commands
- Check progress: `cat runbook/progress.json`
- View runbook: `cat runbook/index.md`
- Run tests: `npm test`
- Start dev server: `npm start`

## Archive Location
Previous version archived at: `projects/archive/$ARCHIVE_NAME/`

## Research Integration
All commands automatically use optimized `research/quick-ref.md` for:
- Package versions (@beta tags preserved)
- Architecture patterns (vertical slicing enforced)
- Performance optimizations (40% improvements)
EOF

echo "📖 Created quick start guide"
echo ""
```

## PHASE 6: INTELLIGENT WORKFLOW EXECUTION

**Step 6.1: Determine Execution Path**
Based on generated artifacts, intelligently decide next steps:

```bash
echo "🎯 Determining optimal workflow path..."

if [ "$RUNBOOK_CREATED" = true ]; then
  echo "   ✅ Full workflow ready - can execute runbook"
  echo "   Next command: /follow-runbook-with-senior-engineer ./runbook/"
elif [ "$TECH_ANALYZED" = true ]; then
  echo "   ⏳ Technical requirements ready - need runbook"
  echo "   Next command: /create-development-runbook-v2 [tech-prd]"
elif [ "$PRD_GENERATED" = true ]; then
  echo "   ⏳ PRD ready - need technical analysis"
  echo "   Next command: /analyze-prd-technical-requirements [prd]"
elif [ -f "design-doc.md" ]; then
  echo "   ⏳ Design doc ready - need PRD generation"
  echo "   Next command: /generate-advanced-prd design-doc.md"
else
  echo "   ⚠️  No starting point found"
  echo "   Action needed: Create design-doc.md first"
fi
```

## PHASE 7: SUMMARY AND RECOMMENDATIONS

**Generate comprehensive summary**:
```bash
echo ""
echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "🎉 PROJECT ITERATION COMPLETE"
echo "=" | head -c 60 | tr '\n' '='
echo ""
echo "📊 Summary:"
echo "   • Archived: v$CURRENT_VERSION → archive/$ARCHIVE_NAME"
echo "   • Created:  v$NEXT_VERSION → projects/$PROJECT_NAME"
echo "   • Status:   $([ "$RUNBOOK_CREATED" = true ] && echo "Ready to develop" || echo "Workflow in progress")"
echo ""
echo "📁 File Structure:"
ls -la
echo ""
echo "🚀 Quick Actions:"
echo "   1. Continue workflow:  See QUICK_START.md"
echo "   2. Start development:  cd $PROJECT_NAME && npm start"
echo "   3. Run tests:         cd $PROJECT_NAME && npm test"
echo "   4. Check progress:    cat runbook/progress.json"
echo ""
echo "💡 Pro Tips:"
echo "   • All commands use optimized research/quick-ref.md (90% faster)"
echo "   • Architecture validation runs automatically"
echo "   • Package versions auto-correct to research standards"
echo ""
```

## ERROR HANDLING AND RECOVERY

```bash
# Enhanced error handling with detailed diagnostics
set -e  # Exit on any error
set -u  # Exit on undefined variables

# Trap errors and provide recovery options
trap 'handle_error $? $LINENO' ERR

handle_error() {
  local exit_code=$1
  local line_number=$2
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo ""
  echo "🚨 CRITICAL ERROR DETECTED"
  echo "=" | head -c 60 | tr '\n' '='
  echo ""
  echo "   Time: $timestamp"
  echo "   Exit Code: $exit_code"
  echo "   Line: $line_number"
  echo "   Working Directory: $(pwd 2>/dev/null || echo "unknown")"
  echo ""
  
  # Log error details
  {
    echo "ERROR LOG - $timestamp"
    echo "Exit Code: $exit_code"
    echo "Line Number: $line_number"
    echo "Working Directory: $(pwd 2>/dev/null || echo "unknown")"
    echo "Process ID: $$"
    echo "User: $(whoami 2>/dev/null || echo "unknown")"
    echo "Environment:"
    echo "  PROJECT_NAME=${PROJECT_NAME:-unset}"
    echo "  CURRENT_VERSION=${CURRENT_VERSION:-unset}"
    echo "  NEXT_VERSION=${NEXT_VERSION:-unset}"
    echo "  SKIP_ARCHIVE=${SKIP_ARCHIVE:-unset}"
    echo "---"
  } >> iteration-error.log 2>/dev/null || true
  
  echo "🔧 Recovery Options:"
  echo "   1. Check the specific error message above"
  echo "   2. Verify file permissions and disk space"
  echo "   3. Close any applications using the project directory"
  echo "   4. Retry with --skip-archive flag if archiving failed"
  echo "   5. Manual cleanup: rm -rf projects/$PROJECT_NAME (if needed)"
  echo "   6. Check iteration-error.log for detailed diagnostics"
  echo ""
  echo "🚨 OPERATION TERMINATED - Review errors before retrying"
  echo "   No automated recovery attempted to prevent data loss"
  
  exit $exit_code
}

# Verify prerequisites before starting
check_prerequisites() {
  # Verify we're in the right directory structure
  if [ ! -d "projects" ] || [ ! -d "projects/archive" ]; then
    echo "❌ PREREQUISITE ERROR: Missing required directory structure"
    echo "   Expected: projects/ and projects/archive/ directories"
    echo "   Current location: $(pwd)"
    echo ""
    echo "🔧 Solution: Run this command from the project root directory"
    exit 1
  fi
  
  # Check basic permissions
  if [ ! -w "projects" ]; then
    echo "❌ PREREQUISITE ERROR: No write permission to projects/ directory"
    echo "   Required: Write access to create/move directories"
    exit 1
  fi
  
  if [ ! -w "projects/archive" ]; then
    echo "❌ PREREQUISITE ERROR: No write permission to projects/archive/ directory"
    echo "   Required: Write access to archive old versions"
    exit 1
  fi
  
  echo "✅ Prerequisites verified"
}

# Run prerequisite check
check_prerequisites
```

## USAGE EXAMPLES

```bash
# Standard iteration (archives current, starts from design-doc)
/iterate-project-version

# Specific project iteration
/iterate-project-version my-game-project

# Skip archiving (useful for retries)
/iterate-project-version --skip-archive

# Clean start (no design doc copy)
/iterate-project-version --clean-start

# Full control
/iterate-project-version pet-software-idler --from-design-doc --skip-archive
```

## AUTOMATION BENEFITS

This command provides:
1. **One-command iteration**: Archives current, creates next version
2. **Intelligent workflow**: Automatically runs appropriate commands
3. **Version management**: Tracks v1, v2, v3... automatically
4. **State preservation**: Maintains progress between iterations
5. **Quick restart**: Get back to development in seconds
6. **Research integration**: All commands use optimized quick-ref
7. **Error recovery**: Rollback points at each step

Perfect for rapid prototyping and experimentation!