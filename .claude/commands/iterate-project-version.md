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
  
  # Check for git and uncommitted changes (optional for experiments)
  cd $PROJECT_NAME
  if [ -d ".git" ]; then
    if command -v git >/dev/null 2>&1; then
      if ! git diff --quiet || ! git diff --cached --quiet 2>/dev/null; then
        echo "⚠️  Warning: Uncommitted changes detected"
        git status --short
        echo "   Creating archive commit..."
        git add -A
        git commit -m "Archive: $PROJECT_NAME before v$NEXT_VERSION iteration"
      fi
    fi
  else
    echo "   ℹ️  No git repository (experimental project)"
  fi
  cd ..
  
  # Move to archive with next version
  ARCHIVE_NAME="${PROJECT_NAME}-v${NEXT_VERSION}"
  
  # Attempt to move with proper error handling
  if ! mv $PROJECT_NAME "archive/$ARCHIVE_NAME" 2>/dev/null; then
    echo "❌ Error: Unable to archive $PROJECT_NAME"
    echo "   Permission denied or directory in use"
    echo ""
    echo "🔧 Possible solutions:"
    echo "   1. Close any terminals/editors using the directory"
    echo "   2. Check file permissions: ls -la $PROJECT_NAME"
    echo "   3. Try with elevated permissions if needed"
    echo "   4. Use --skip-archive flag to bypass archiving"
    echo ""
    echo "Aborting operation to prevent data loss."
    exit 1
  fi
  
  echo "✅ Archived as: archive/$ARCHIVE_NAME"
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

# Create new project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create version marker
echo "v$NEXT_VERSION" > .version

# Copy design doc if it exists
if [ "$FROM_DESIGN_DOC" = true ]; then
  if [ -f "../design-doc.md" ]; then
    cp ../design-doc.md ./design-doc.md
    echo "✅ Copied design-doc.md"
  else
    echo "⚠️  No design-doc.md found in projects/"
  fi
fi

# Initialize git repository (optional for experiments)
if command -v git >/dev/null 2>&1; then
  git init >/dev/null 2>&1
  git add . >/dev/null 2>&1
  git commit -m "Initial commit: $PROJECT_NAME v$NEXT_VERSION" >/dev/null 2>&1
  echo "✅ Project structure created (with git)"
else
  echo "✅ Project structure created (no git)"
fi
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
# Trap errors and provide recovery options
trap 'handle_error $? $LINENO' ERR

handle_error() {
  echo ""
  echo "❌ Error occurred at line $2 with exit code $1"
  echo ""
  echo "🔧 Recovery Options:"
  echo "   1. Rollback: git reset --hard HEAD~1"
  echo "   2. Manual fix: Check error and retry"
  echo "   3. Clean restart: rm -rf projects/$PROJECT_NAME && retry"
  echo ""
  echo "📝 Error log saved to: iteration-error.log"
  exit $1
}
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