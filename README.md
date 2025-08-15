# Context Engineering From Scratch

## ⚡ Quick Start - Choose ONE Approach

### Option A: Fully Automated (Recommended)
```bash
# 1. Set up new project version
/iterate-project-version

# 2. Run complete automated workflow
/execute-full-workflow
```
**What it does:** Archives current work, creates new project structure, generates PRD → technical requirements → runbook → starts implementation

### Option B: Manual Step-by-Step
```bash
# 1. Generate PRD manually
/generate-advanced-prd design-doc.md

# 2. Create technical requirements
/prd-to-technical-requirements [prd-file]

# 3. Create runbook (optional validation step)
/validate-architecture-alignment [tech-requirements-file]

# 4. Follow implementation
/follow-runbook-with-senior-engineer ./runbook/
```
**When to use:** For custom control over each step or when debugging workflow issues

---

## 🔬 Research & Knowledge Management

### Research Creation
```bash
# Create new research on any topic
/research <topic> <objective> [filename]
```

### Research Compilation
```bash
# Extract implementation patterns from all research → quick-ref.md
/extract-implementation-research
```
**Note:** quick-ref.md is used by all commands for context. Run this when research changes.

---

## 🛠️ Troubleshooting & Advanced

### Workflow Debugging
```bash
# Step-by-step guided workflow with checks
/guided-workflow
```

### Important Notes
- **Never mix automated and manual approaches in the same session**
- **Automated workflow uses Task tool internally - don't run manual commands after**
- **Research commands can be run anytime but update /extract-implementation-research after**
- **All project work happens in `/projects/[name]/` - never in root directory**

---

# Thoughts
Research is good but also are observations about past behavior. It seems like it can integrate 
Not sure what to call these observations. Conflicts? Mistakes? Omissions/Errors?

Maybe "lessons"

So we have "knowledge" and "lessons". There is the information, and corrections to the application of that information.