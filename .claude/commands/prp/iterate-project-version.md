---
description: Intelligently manage project iterations with automatic versioning and workflow execution
argument-hint: [project-name] [--skip-archive] [--from-design-doc] [--clean-start]
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "LS", "Bash", "Task", "TodoWrite"]
---

# Iterate Project Version

Seamlessly transition to next project iteration while preserving learning and maintaining workflow continuity.

## Usage
```
/prp:iterate-project-version [project-name] [options]
```

## Options
- `project-name`: Name of the project (default: pet-software-idler)
- `--skip-archive`: Skip archiving current version
- `--from-design-doc`: Copy design-doc.md from projects folder (default: true)
- `--clean-start`: Start fresh without copying design doc

## Arguments: $ARGUMENTS

---

## PHASE 1: VERSION DETECTION

**Using Task to determine current and next version:**

Task prompt:
```
Navigate to /mnt/c/dev/class-one-rapids/projects/archive directory.
Find all directories matching pattern "pet-software-idler-v*" (or specified project name).
Extract version numbers from directory names (e.g., v11 → 11).
Determine the highest version number found.
Calculate next version as highest + 1.
If no versions found, start with version 1.

Return a summary:
- Current highest version: v[N]
- Next version will be: v[N+1]
- List of found versions

IMPORTANT: Work from /mnt/c/dev/class-one-rapids/projects/ directory context.
```

---

## PHASE 2: ARCHIVE CURRENT PROJECT

**Using Task to archive existing project:**

Task prompt:
```
Check if directory exists: /mnt/c/dev/class-one-rapids/projects/pet-software-idler

If it exists and --skip-archive flag is NOT set:
1. Determine archive name: pet-software-idler-v[NEXT_VERSION]
2. Check if archive/pet-software-idler-v[NEXT_VERSION] already exists
   - If yes: Report error and stop (do not overwrite)
3. Move projects/pet-software-idler to projects/archive/pet-software-idler-v[NEXT_VERSION]
4. Verify the move was successful
5. Report: "✅ Successfully archived as: archive/pet-software-idler-v[NEXT_VERSION]"

If --skip-archive flag IS set:
- Report: "⏭️ Skipping archive (--skip-archive flag)"

If directory doesn't exist:
- Report: "ℹ️ No current project to archive"

Handle any errors with detailed diagnostics:
- Check for open files/processes
- Verify permissions
- Suggest solutions

IMPORTANT: All paths relative to /mnt/c/dev/class-one-rapids/
```

---

## PHASE 3: CREATE NEW PROJECT STRUCTURE

**Using Task to initialize new project:**

Task prompt:
```
Working in /mnt/c/dev/class-one-rapids/projects/ directory:

1. Create new directory: pet-software-idler (or specified project name)
2. Navigate into the new directory
3. Create .version file containing: v[NEXT_VERSION]
4. Create iteration-metadata.json with:
   {
     "version": "[NEXT_VERSION]",
     "created": "[current UTC timestamp]",
     "previous_version": "[CURRENT_VERSION]",
     "workflow_stage": "initialized",
     "artifacts": {
       "design_doc": false,
       "prd": false,
       "technical_requirements": false,
       "runbook": false
     },
     "flags": {
       "from_design_doc": [true/false based on flag],
       "skip_archive": [true/false based on flag],
       "clean_start": [true/false based on flag]
     }
   }

5. If --from-design-doc flag is set AND design-doc.md exists in projects/:
   - Copy projects/design-doc.md to new project directory
   - Update artifacts.design_doc to true in metadata

6. Create QUICK_START.md with project information and next steps

Report:
- ✅ Project structure created successfully
- Location: projects/pet-software-idler
- Version: v[NEXT_VERSION]

IMPORTANT: Ensure all artifacts are created within the project directory, NOT in root.
```

---

## PHASE 4: FINAL SUMMARY AND NEXT STEPS

**Using Task to provide summary and guidance:**

Task prompt:
```
Generate final summary report for the project iteration:

   ╔════════════════════════════════════════════════════════════╗
   ║     🎉 PROJECT ITERATION COMPLETE                          ║
   ╚════════════════════════════════════════════════════════════╝
   
   📊 Summary:
   • Archived: v[CURRENT] → archive/pet-software-idler-v[NEXT]
   • Created:  v[NEXT] → projects/pet-software-idler
   • Files copied: design-doc.md (if exists)
   • Status: Project structure ready
   
   📁 Project Location:
   /mnt/c/dev/class-one-rapids/projects/pet-software-idler
   
   📄 Created Files:
   • .version (v[NEXT])
   • iteration-metadata.json
   • QUICK_START.md
   • design-doc.md (if copied)
   
   🚀 Next Steps - Run these commands as needed:
   1. Generate PRD: /prp:generate-advanced-prd design-doc.md
   2. Add technical requirements: /prp:prd-to-technical-requirements [prd-file]
   3. Create runbook: /prp:create-development-runbook-v2 [tech-file]
   4. Follow runbook: /prp:follow-runbook-with-senior-engineer ./runbook/

NOTE: This command ONLY sets up the project structure. It does NOT generate PRDs, technical requirements, or runbooks. Run the above commands separately as needed.

IMPORTANT: Verified all artifacts are in project directory, not root.
```

---

## ERROR HANDLING

**Using Task for comprehensive error recovery:**

Task prompt:
```
If any errors occur during the workflow:

1. Capture error details:
   - What operation failed
   - Error message
   - Current state of project

2. Provide recovery options:
   - Safe rollback procedures
   - Manual fix instructions
   - Alternative approaches

3. Log errors to iteration-error.log in project directory

4. Ensure no data loss:
   - Don't delete anything without confirmation
   - Preserve existing work
   - Create backups if needed

5. Suggest next steps:
   - How to retry the operation
   - How to manually complete the step
   - How to skip and continue

CRITICAL: Never leave the project in an inconsistent state.
```

---

## VALIDATION CHECKLIST

**Final Task to ensure everything is correct:**

Task prompt:
```
Validate the iteration was successful:

1. Check project directory exists at correct location:
   - /mnt/c/dev/class-one-rapids/projects/pet-software-idler ✓

2. Verify NO artifacts in root directory:
   - No /mnt/c/dev/class-one-rapids/runbook/
   - No /mnt/c/dev/class-one-rapids/PetSoftTycoon/
   - No /mnt/c/dev/class-one-rapids/*.md files (except README)

3. Confirm version management:
   - .version file contains correct version
   - iteration-metadata.json is valid JSON
   - Archive contains previous version (if applicable)

4. List all created artifacts with their locations

5. Report any issues found

Return validation summary.
```

---

## SUCCESS CRITERIA

The iteration is successful when:
- ✅ Previous version archived (unless skipped)
- ✅ New project directory created in correct location
- ✅ Version tracking files created
- ✅ Design doc copied (if exists and --from-design-doc)
- ✅ NO files created in root directory
- ✅ Clear next steps provided

NOTE: This command does NOT generate PRDs, technical requirements, or runbooks - only sets up the project structure.

## USAGE EXAMPLES

```bash
# Standard iteration (archives current, starts from design-doc)
/prp:iterate-project-version

# Specific project iteration
/prp:iterate-project-version my-game-project

# Skip archiving (useful for retries)
/prp:iterate-project-version --skip-archive

# Clean start (no design doc copy)
/prp:iterate-project-version --clean-start

# Full control
/prp:iterate-project-version pet-software-idler --from-design-doc --skip-archive
```

## BENEFITS

This Task-based approach:
1. **Works within Claude's system** - No bash script execution needed
2. **Maintains state** - Task context preserves information between steps
3. **Better error handling** - Can provide intelligent recovery options
4. **Directory safety** - Explicitly prevents root-level artifacts
5. **Validation built-in** - Checks for common issues automatically
6. **Progress tracking** - Clear reporting at each phase