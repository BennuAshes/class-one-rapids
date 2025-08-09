---
description: Orchestrates complete development workflow using Tasks instead of shell commands
argument-hint: [--pause] [--from-step N] [--dry-run]
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "LS", "Bash", "Task", "TodoWrite"]
---

Execute the complete development workflow from design document to implementation using Task tool for each phase.

## Usage Options
- `--pause`: Pause between each major step for review (default: continuous)
- `--from-step N`: Start from specific step (1-6)  
- `--dry-run`: Show what would be executed without running

## Arguments: $ARGUMENTS

## 🚀 WORKFLOW INITIALIZATION

### Parse Arguments
First, parse the command arguments to determine execution mode:
- Check for `--pause` flag (default: false)
- Check for `--from-step N` option (default: 1)
- Check for `--dry-run` flag (default: false)

### Initialize State
Load or create `.workflow-state.json` to track progress:
```json
{
  "started_at": "2025-08-09T00:00:00Z",
  "current_phase": 0,
  "phases_completed": [],
  "artifacts": {},
  "mode": "continuous|pause",
  "notes": []
}
```

### Display Workflow Plan
Show user what will be executed:

```
╔════════════════════════════════════════════════════════════╗
║     🚀 FULL DEVELOPMENT WORKFLOW (TASK-BASED)              ║
╚════════════════════════════════════════════════════════════╝

Mode: [Continuous/Pause after each step/Dry run]
Starting from: Step [N]

Steps to execute:
1. ✅ Validate Prerequisites 
2. 📝 Generate Advanced PRD
3. 🔍 Analyze Technical Requirements
4. 📚 Create Development Runbook
5. ✅ Validate Architecture Alignment
6. 🚀 Execute Implementation
```

### Initialize Todo Tracking
Use TodoWrite to create task list:
- Validate design document exists
- Generate advanced PRD
- Analyze technical requirements
- Create development runbook
- Validate architecture alignment
- Execute runbook implementation

---

---

## STEP 1: VALIDATE PREREQUISITES

**Using Task to validate design document and project structure:**

Task prompt:
```
Verify that design-doc.md exists in the current directory.
Check that the project structure is ready for development.
Load research/quick-ref.md if available for context.
Report any missing files or issues.
```

Expected output:
- ✅ Design document found
- ✅ Project structure validated
- ✅ Research context loaded (if available)

If pause mode: Wait for user confirmation before proceeding.

---

## STEP 2: GENERATE ADVANCED PRD

**Using Task to generate comprehensive PRD:**

Task prompt:
```
Read the design document at design-doc.md and create a comprehensive
Product Requirements Document following best practices.
Include:
- Executive summary
- User stories with acceptance criteria
- Technical requirements
- Success metrics
- Development timeline

Save as petsoft-tycoon-advanced-prd.md
```

Expected output:
- 📝 PRD created: petsoft-tycoon-advanced-prd.md
- Contains all required sections
- Ready for technical analysis

If pause mode: Display "PRD generated. Review and press Enter to continue..."

---

## STEP 3: ANALYZE TECHNICAL REQUIREMENTS

**Using Task to analyze technical requirements:**

Task prompt:
```
Analyze the PRD at petsoft-tycoon-advanced-prd.md and create a detailed
technical requirements document.

Focus on:
- Architecture specifications (React Native with Expo, Legend State)
- Performance requirements (60 FPS, <3s load time)
- Data models and state management structure
- Component hierarchy and organization
- Animation and audio system requirements
- Save/load system implementation details
- Cross-platform considerations

Use research from research/quick-ref.md for best practices.
Save as petsoft-tycoon-advanced-prd-technical-requirements.md
```

Expected output:
- 🔍 Technical requirements documented
- Architecture patterns defined
- Performance metrics specified

If pause mode: Display "Technical analysis complete. Review and press Enter to continue..."

---

## STEP 4: CREATE DEVELOPMENT RUNBOOK

**Using Task to create comprehensive runbook:**
Task prompt:
```
Create a comprehensive development runbook based on the technical requirements
at petsoft-tycoon-advanced-prd-technical-requirements.md

Create a runbook/ directory with:
- index.md - Main overview
- 00-analysis.md - Requirements analysis
- 01-foundation.md - Project setup
- 02-core-features.md - Core game loop
- 03-integration.md - Department systems
- 04-quality.md - Polish and performance
- 05-deployment.md - Build and launch
- progress.json - Progress tracking
- research-requirements.json - Research needs

Each phase should have:
- Clear objectives
- Specific tasks with commands
- Validation criteria
- Time estimates

Make it executable by a senior engineer.
```

Expected output:
- 📚 Runbook directory created
- 6 phase files generated
- Progress tracking initialized

If pause mode: Display "Runbook created. Review runbook/ directory and press Enter to continue..."

---

## STEP 5: VALIDATE ARCHITECTURE ALIGNMENT

**Using Task to validate architecture:**
Task prompt:
```
Validate that the runbook in runbook/ directory aligns with
architecture patterns and best practices.

Check against research/quick-ref.md for:
- Correct package versions (Expo SDK 52, Legend State @beta)
- Vertical slicing architecture pattern
- Performance optimization strategies
- State management patterns
- TypeScript configuration
- Build and deployment best practices

Create a validation report highlighting:
- ✅ Correctly aligned items
- ⚠️ Potential issues or deviations
- 💡 Recommendations for improvement
- 🚨 Critical misalignments

Save report as runbook/validation-report.md
```

Expected output:
- ✅ Architecture validation complete
- Validation report created
- Score: 90%+ alignment

If pause mode: Display "Validation complete. Review runbook/validation-report.md and press Enter to continue..."

---

## STEP 6: EXECUTE IMPLEMENTATION

**Using Task to begin implementation:**
Task prompt:
```
Begin implementing Phase 1 (Foundation) of the runbook.

Read runbook/01-foundation.md and:
1. Set up the project structure
2. Install dependencies with Expo SDK 52 and React Native 0.76+
3. Configure TypeScript with strict mode
4. Create initial application skeleton
5. Set up Legend State for state management
6. Configure Metro for package exports

Ensure all package versions match research/quick-ref.md
Update runbook/progress.json as you complete tasks.
```

Expected output:
- 🚀 Project initialized
- Dependencies installed
- TypeScript configured
- Basic app running

If pause mode: Display "Foundation phase complete. Project ready for development. Press Enter to finish..."

---

## 📊 WORKFLOW COMPLETION

Display final summary:

```
╔════════════════════════════════════════════════════════════╗
║            🎉 WORKFLOW COMPLETE!                           ║
╚════════════════════════════════════════════════════════════╝

📁 Artifacts Created:
• PRD: petsoft-tycoon-advanced-prd.md
• Technical Requirements: petsoft-tycoon-advanced-prd-technical-requirements.md
• Runbook: runbook/
• Validation Report: runbook/validation-report.md
• Project: [project directory if step 6 completed]

📊 All Steps Completed:
✅ Prerequisites validated
✅ PRD generated
✅ Technical requirements analyzed
✅ Runbook created
✅ Architecture validated
✅ Implementation started

🚀 Next Steps:
1. Continue development using runbook phases
2. Run tests as you build
3. Check progress in runbook/progress.json

Workflow state saved in .workflow-state.json
```

---

## 📖 USAGE EXAMPLES

```bash
# Run entire workflow continuously (default)
/execute-full-workflow

# Run with pauses between steps for review
/execute-full-workflow --pause

# Resume from step 3
/execute-full-workflow --from-step 3

# Preview what will be executed without running
/execute-full-workflow --dry-run

# Pause mode starting from step 4
/execute-full-workflow --pause --from-step 4
```

## 🎯 KEY BENEFITS

### Why This Approach Works
1. **Uses Task Tool**: Executes complex operations via Task instead of shell commands
2. **No Command Chaining**: Doesn't try to call other Claude commands from bash
3. **Flexible Control**: Pause mode lets you review outputs between steps
4. **Resumable**: Can start from any step if interrupted
5. **Transparent**: Shows exactly what will be done before doing it

## 💡 HOW IT WORKS

### The Task-Based Approach
Instead of trying to invoke Claude commands from bash (which doesn't work), this command uses the **Task tool** to perform the same operations each command would do:

1. **Step 1**: Task validates prerequisites
2. **Step 2**: Task generates PRD from design doc
3. **Step 3**: Task analyzes technical requirements
4. **Step 4**: Task creates runbook structure
5. **Step 5**: Task validates architecture
6. **Step 6**: Task begins implementation

Each Task receives the same detailed prompts the original commands would use, ensuring identical results.

## 📦 IMPLEMENTATION DETAILS

### Pause Mode Implementation
When `--pause` is specified:
1. After each step completes, display results
2. Show message: "Review outputs and press Enter to continue..."
3. Wait for user confirmation
4. Proceed to next step

### State Management
- State tracked in `.workflow-state.json`
- TodoWrite updates task status in real-time
- Each step updates state upon completion
- Can resume from any step using state file

### Error Handling
- If a step fails, workflow stops
- State is preserved for resumption
- Error details logged for debugging
- User can fix issues and resume with `--from-step`

---

**Note**: This command solves the workflow automation challenge by using Tasks instead of trying to chain Claude commands, which was the key insight we discovered during our conversation!