# Project Directory Management Standards

## Critical Rule: NEVER Create Artifacts in Root Directory

### Project Structure Requirements

All development artifacts MUST be created within the appropriate project version directory:

```
/projects/
├── [project-name]/           # Current active version
│   ├── .version              # Version identifier
│   ├── iteration-metadata.json
│   ├── design-doc.md
│   ├── runbook/              # Project-specific runbook
│   ├── [AppName]/            # Application code
│   └── *.md                  # Project documentation
└── archive/
    └── [project-name]-v[N]/  # Archived versions
```

### Workflow Directory Rules

#### 1. **Always Verify Working Directory**
```bash
# Before creating any artifacts, ALWAYS:
pwd  # Confirm you're in the right directory

# If in root (/mnt/c/dev/class-one-rapids/), navigate to project:
cd projects/pet-software-idler  # Or appropriate project
```

#### 2. **Project Version Management**
```bash
# When starting new iteration:
1. Check current version: cat .version
2. Archive current if needed: mv ../pet-software-idler ../archive/pet-software-idler-v$(cat .version)
3. Create new version directory: mkdir ../pet-software-idler-v$(($(cat .version | sed 's/v//') + 1))
4. Work in the new directory
```

#### 3. **Artifact Creation Patterns**

**❌ WRONG - Creating in root:**
```bash
# Being in /mnt/c/dev/class-one-rapids/
mkdir runbook
npx create-expo-app PetSoftTycoon
```

**✅ CORRECT - Creating in project directory:**
```bash
# First navigate to project
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler
# OR create new version
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler-v12

# Then create artifacts
mkdir runbook
npx create-expo-app PetSoftTycoon
```

### Workflow Command Requirements

All workflow commands MUST:

1. **Determine Target Directory First**
   - Check for existing active project
   - Create new version if needed
   - NEVER assume root directory

2. **Use Relative Paths from Project Directory**
   ```typescript
   // In Task prompts, specify:
   "Create runbook/ directory in the current project folder"
   "Save as ./petsoft-tycoon-advanced-prd.md"  // Relative to project
   // NOT: "Save as /mnt/c/dev/class-one-rapids/petsoft-tycoon-advanced-prd.md"
   ```

3. **Validate Directory Before Operations**
   ```typescript
   // Task should verify:
   "Ensure you are in /projects/[project-name]/ directory"
   "If in root, navigate to appropriate project directory first"
   ```

### Implementation in Workflows

#### For PRD Generation:
```
"Save the PRD in the current project directory as petsoft-tycoon-advanced-prd.md"
NOT: "Save as petsoft-tycoon-advanced-prd.md" (ambiguous)
```

#### For Runbook Creation:
```
"Create a runbook/ directory within the current project folder"
NOT: "Create a runbook/ directory" (could be anywhere)
```

#### For App Initialization:
```
"In the current project directory, run: npx create-expo-app PetSoftTycoon"
NOT: "npx create-expo-app PetSoftTycoon" (creates in current working directory)
```

### Directory Context in Task Tool

When using Task tool, ALWAYS include directory context:

```typescript
Task prompt should include:
"Working in the project directory at projects/pet-software-idler/..."
"Ensure all artifacts are created within the project directory..."
"Do not create files in the root /mnt/c/dev/class-one-rapids/ directory..."
```

### Validation Checklist

Before any workflow execution:
- [ ] Confirm current working directory
- [ ] Verify project version directory exists
- [ ] Check no artifacts will be created in root
- [ ] Ensure all paths are relative to project directory
- [ ] Validate .version file matches expected version

### Common Mistakes to Avoid

1. **Assuming Current Directory**: Always explicitly check/set directory
2. **Using Absolute Root Paths**: Use project-relative paths
3. **Missing Directory Context in Tasks**: Always specify where to create files
4. **Not Checking Existing Versions**: May overwrite existing work

### Recovery from Root-Level Artifacts

If artifacts are accidentally created in root:
```bash
# 1. Identify the intended version
ls -la /mnt/c/dev/class-one-rapids/projects/

# 2. Create new version directory if needed
mkdir -p /mnt/c/dev/class-one-rapids/projects/pet-software-idler-v13

# 3. Move artifacts to correct location
mv /mnt/c/dev/class-one-rapids/{runbook,PetSoftTycoon,*.md} \
   /mnt/c/dev/class-one-rapids/projects/pet-software-idler-v13/

# 4. Update version file
echo "v13" > /mnt/c/dev/class-one-rapids/projects/pet-software-idler-v13/.version
```