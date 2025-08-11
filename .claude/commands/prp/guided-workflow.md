---
description: Interactive workflow guide that tracks progress and provides exact commands to run at each step
argument-hint: [--resume] [--reset] [--status]
---

# 🎯 GUIDED WORKFLOW ORCHESTRATOR

This command provides an interactive, stateful guide through the complete development workflow, tracking your progress and telling you exactly what to run next.

## Initialize Workflow Tracking

```bash
# Parse arguments
COMMAND_ARG="${1:-}"
WORKFLOW_STATE=".workflow-state.json"
WORKFLOW_CHECKLIST=".workflow-checklist.md"

# Handle command arguments
case "$COMMAND_ARG" in
  --reset)
    echo "🔄 Resetting workflow state..."
    rm -f $WORKFLOW_STATE $WORKFLOW_CHECKLIST
    echo "✅ Workflow reset complete"
    ;;
  --status)
    if [ -f "$WORKFLOW_STATE" ]; then
      echo "📊 Current Workflow Status:"
      CURRENT_PHASE=$(jq -r '.current_phase' $WORKFLOW_STATE)
      COMPLETED=$(jq -r '.phases_completed[]' $WORKFLOW_STATE | wc -l)
      echo "   Current Phase: $CURRENT_PHASE"
      echo "   Phases Completed: $COMPLETED/6"
      echo ""
      echo "📁 Artifacts Created:"
      jq -r '.artifacts | to_entries[] | "   • \(.key): \(.value)"' $WORKFLOW_STATE
    else
      echo "❌ No workflow in progress. Start with: /guided-workflow"
    fi
    exit 0
    ;;
esac
```

## Load or Initialize State

```bash
if [ -f "$WORKFLOW_STATE" ] && [ "$COMMAND_ARG" != "--reset" ]; then
  echo "📂 Loading existing workflow state..."
  CURRENT_PHASE=$(jq -r '.current_phase' $WORKFLOW_STATE)
  echo "   Resuming from Phase $CURRENT_PHASE"
  echo ""
else
  echo "🆕 Initializing new workflow..."
  cat > $WORKFLOW_STATE << 'EOF'
{
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "current_phase": 1,
  "phases_completed": [],
  "artifacts": {},
  "notes": []
}
EOF
  CURRENT_PHASE=1
fi
```

## Display Workflow Header

```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🎯 GUIDED DEVELOPMENT WORKFLOW v8                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This guide will walk you through each step of the development"
echo "workflow, tracking your progress and providing exact commands."
echo ""
```

## Phase Detection and Guidance

```bash
# Function to mark phase complete
mark_phase_complete() {
  local PHASE_NUM=$1
  local ARTIFACT_KEY=$2
  local ARTIFACT_VALUE=$3
  
  # Update JSON state
  jq ".phases_completed += [\"phase_$PHASE_NUM\"] | .current_phase = $((PHASE_NUM + 1)) | .artifacts.$ARTIFACT_KEY = \"$ARTIFACT_VALUE\"" $WORKFLOW_STATE > tmp.$$ && mv tmp.$$ $WORKFLOW_STATE
}

# Determine what to do based on current phase
case $CURRENT_PHASE in
  1)
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 PHASE 1: Prerequisites Check"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Check for design-doc.md
    if [ -f "design-doc.md" ]; then
      echo "✅ design-doc.md found ($(wc -l < design-doc.md) lines)"
      echo ""
      echo "📝 Next Step: Generate the PRD"
      echo ""
      echo "Run this command:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "/generate-advanced-prd design-doc.md"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "After running, continue with: /guided-workflow"
      
      mark_phase_complete 1 "design_doc" "design-doc.md"
    else
      echo "❌ design-doc.md not found!"
      echo ""
      echo "You need a design document first. Either:"
      echo "1. Copy one: cp ../design-doc.md ."
      echo "2. Create one with your game requirements"
      echo ""
      echo "Then run: /guided-workflow"
    fi
    ;;
    
  2)
    echo "═══════════════════════════════════════════════════════════════"
    echo "📝 PHASE 2: PRD Generation"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Check if PRD exists
    PRD_FILE=$(ls -t *prd*.md 2>/dev/null | grep -v technical-requirements | head -1)
    
    if [ -n "$PRD_FILE" ]; then
      echo "✅ PRD found: $PRD_FILE"
      echo ""
      echo "🔍 Next Step: Analyze technical requirements"
      echo ""
      echo "Run this command:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "/analyze-prd-technical-requirements $PRD_FILE"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "After running, continue with: /guided-workflow"
      
      mark_phase_complete 2 "prd" "$PRD_FILE"
    else
      echo "⏳ Waiting for PRD generation..."
      echo ""
      echo "You should have run:"
      echo "/generate-advanced-prd design-doc.md"
      echo ""
      echo "If it failed, check for errors and try again."
      echo "If successful, run: /guided-workflow"
    fi
    ;;
    
  3)
    echo "═══════════════════════════════════════════════════════════════"
    echo "🔍 PHASE 3: Technical Requirements Analysis"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Check if technical PRD exists
    TECH_PRD=$(ls -t *technical-requirements*.md 2>/dev/null | head -1)
    
    if [ -n "$TECH_PRD" ]; then
      echo "✅ Technical PRD found: $TECH_PRD"
      echo ""
      echo "📚 Next Step: Create development runbook"
      echo ""
      echo "Run this command:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "/create-development-runbook-v2 $TECH_PRD"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "After running, continue with: /guided-workflow"
      
      mark_phase_complete 3 "tech_prd" "$TECH_PRD"
    else
      echo "⏳ Waiting for technical analysis..."
      echo ""
      PRD_FILE=$(jq -r '.artifacts.prd' $WORKFLOW_STATE)
      echo "You should have run:"
      echo "/analyze-prd-technical-requirements $PRD_FILE"
      echo ""
      echo "If it failed, check for errors and try again."
      echo "If successful, run: /guided-workflow"
    fi
    ;;
    
  4)
    echo "═══════════════════════════════════════════════════════════════"
    echo "📚 PHASE 4: Runbook Creation"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Check if runbook exists
    if [ -d "runbook" ] && [ -f "runbook/index.md" ]; then
      echo "✅ Runbook found: ./runbook/"
      echo ""
      echo "✅ Next Step: Validate architecture"
      echo ""
      echo "Run this command:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "/validate-architecture-alignment ./runbook/"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "After running, continue with: /guided-workflow"
      
      mark_phase_complete 4 "runbook" "./runbook/"
    else
      echo "⏳ Waiting for runbook creation..."
      echo ""
      TECH_PRD=$(jq -r '.artifacts.tech_prd' $WORKFLOW_STATE)
      echo "You should have run:"
      echo "/create-development-runbook-v2 $TECH_PRD"
      echo ""
      echo "If it failed, check for errors and try again."
      echo "If successful, run: /guided-workflow"
    fi
    ;;
    
  5)
    echo "═══════════════════════════════════════════════════════════════"
    echo "✅ PHASE 5: Architecture Validation"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    echo "After validation completes (with or without warnings)..."
    echo ""
    echo "🚀 Final Step: Execute the runbook!"
    echo ""
    echo "Run this command:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "/follow-runbook-with-senior-engineer ./runbook/"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "This will start the actual development process."
    echo "After running, continue with: /guided-workflow"
    
    mark_phase_complete 5 "validation" "completed"
    ;;
    
  6)
    echo "═══════════════════════════════════════════════════════════════"
    echo "🚀 PHASE 6: Development Execution"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Check runbook progress
    if [ -f "runbook/progress.json" ]; then
      TOTAL_TASKS=$(jq '.tasks | length' runbook/progress.json 2>/dev/null || echo "0")
      COMPLETED_TASKS=$(jq '[.tasks[] | select(.status == "completed")] | length' runbook/progress.json 2>/dev/null || echo "0")
      
      echo "📊 Development Progress: $COMPLETED_TASKS/$TOTAL_TASKS tasks completed"
      echo ""
      
      if [ "$COMPLETED_TASKS" = "$TOTAL_TASKS" ] && [ "$TOTAL_TASKS" != "0" ]; then
        echo "🎉 DEVELOPMENT COMPLETE!"
        mark_phase_complete 6 "development" "completed"
      else
        echo "Development is in progress..."
        echo ""
        echo "To continue development:"
        echo "/follow-runbook-with-senior-engineer ./runbook/ --continue"
        echo ""
        echo "To check progress:"
        echo "cat runbook/progress.json"
      fi
    else
      echo "⏳ Waiting for development to start..."
      echo ""
      echo "You should run:"
      echo "/follow-runbook-with-senior-engineer ./runbook/"
    fi
    ;;
    
  7)
    echo "═══════════════════════════════════════════════════════════════"
    echo "🎉 WORKFLOW COMPLETE!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "All phases have been completed successfully!"
    echo ""
    echo "📁 Generated Artifacts:"
    jq -r '.artifacts | to_entries[] | "   • \(.key): \(.value)"' $WORKFLOW_STATE
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Test your application: npm test"
    echo "2. Start development server: npm start"
    echo "3. Review the code in PetSoftTycoon/"
    echo ""
    echo "To start a new iteration:"
    echo "/iterate-project-version"
    ;;
    
  *)
    echo "❌ Unknown phase: $CURRENT_PHASE"
    echo "Run: /guided-workflow --reset"
    ;;
esac
```

## Generate Workflow Checklist

```bash
# Create a markdown checklist for easy reference
cat > $WORKFLOW_CHECKLIST << 'EOF'
# 📋 Workflow Checklist

## Phase 1: Prerequisites ✅
- [x] Verify design-doc.md exists

## Phase 2: PRD Generation
- [ ] Run: `/generate-advanced-prd design-doc.md`
- [ ] Verify PRD file created

## Phase 3: Technical Analysis  
- [ ] Run: `/analyze-prd-technical-requirements [prd-file]`
- [ ] Verify technical PRD created

## Phase 4: Runbook Creation
- [ ] Run: `/create-development-runbook-v2 [tech-prd-file]`
- [ ] Verify runbook/ directory created

## Phase 5: Architecture Validation
- [ ] Run: `/validate-architecture-alignment ./runbook/`
- [ ] Review any warnings

## Phase 6: Development Execution
- [ ] Run: `/follow-runbook-with-senior-engineer ./runbook/`
- [ ] Monitor progress in runbook/progress.json

## Useful Commands
- Check status: `/guided-workflow --status`
- Resume workflow: `/guided-workflow`
- Reset workflow: `/guided-workflow --reset`
EOF

# Update checklist based on current phase
for i in $(seq 1 $((CURRENT_PHASE - 1))); do
  sed -i "s/\[ \] Phase $i/[x] Phase $i/g" $WORKFLOW_CHECKLIST 2>/dev/null || true
done
```

## Display Footer

```bash
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "💡 Workflow Commands:"
echo "   • Continue: /guided-workflow"
echo "   • Status:   /guided-workflow --status"
echo "   • Reset:    /guided-workflow --reset"
echo "   • Checklist: cat .workflow-checklist.md"
echo "═══════════════════════════════════════════════════════════════"
```