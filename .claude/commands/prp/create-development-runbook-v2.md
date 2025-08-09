---
description: Transform PRDs into structured runbooks with chunked output to avoid token limits
argument-hint: <prd-path> [--phases phase1,phase2] [--output-dir ./runbook]
allowed-tools: ["Task", "Read", "Glob", "Write", "Edit", "Bash", "TodoWrite", "LS"]
---

EXECUTE chunked PRD-to-runbook transformation: $ARGUMENTS

<role>Senior Development Process Engineer specializing in chunked task decomposition and token-efficient generation</role>

<context>
  <expertise>
    - Chunked output generation for token management
    - Phase-based task decomposition
    - Junior developer mentoring
    - Progressive elaboration techniques
  </expertise>
  <mission>Transform PRDs into phase-separated runbook files with controlled token usage</mission>
</context>

**INITIALIZATION: Parse Arguments and Setup**

```bash
# Parse arguments
PRD_PATH="${1:-}"
PHASES=""

# Safety check: Ensure we're in a project directory (has package.json, app.json, or PRD file)
# Check if we're in projects/ subdirectory or have project files
IS_PROJECT_DIR=false

# Check for package.json or app.json (existing projects)
if [ -f "package.json" ] || [ -f "app.json" ] || [ -f "../package.json" ] || [ -f "../app.json" ]; then
  IS_PROJECT_DIR=true
fi

# Check if we're in a projects/ subdirectory (new projects with PRD)
if [[ "$(pwd)" == */projects/* ]]; then
  IS_PROJECT_DIR=true
fi

# Check for PRD files (new projects)
if ls *.md 2>/dev/null | grep -q "prd\|PRD"; then
  IS_PROJECT_DIR=true
fi

if [ "$IS_PROJECT_DIR" = false ]; then
  echo "⚠️ ERROR: Not in a project directory!"
  echo ""
  echo "Please navigate to your project directory first:"
  echo "  cd projects/{project-name}/"
  echo ""
  echo "Then run this command again with your PRD path."
  echo ""
  echo "Current directory: $(pwd)"
  echo "Looking for: package.json, app.json, or PRD files in projects/ subdirectory"
  exit 1
fi

# Set default output directory relative to PRD location if PRD path provided
if [ -n "$PRD_PATH" ] && [ -f "$PRD_PATH" ]; then
  PRD_DIR="$(dirname "$PRD_PATH")"
  OUTPUT_DIR="${PRD_DIR}/runbook"
else
  OUTPUT_DIR="./runbook"
fi

# Parse optional arguments
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --phases)
      PHASES="$2"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Default phases if not specified
if [ -z "$PHASES" ]; then
  PHASES="analysis,foundation,core,integration,quality,deployment"
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo "✅ Creating runbook in: $OUTPUT_DIR"
```

**PHASE 0: PRD ANALYSIS** (Always runs first)

1. Read and analyze the PRD to extract:
   - Business objectives and metrics
   - Technical requirements
   - Feature specifications
   - Dependencies and constraints

2. **OPTIMIZED RESEARCH LOADING** - Load ultra-condensed research summary
   - Read research/quick-ref.md (200 tokens total) for ALL package versions and patterns
   - This single file contains all critical information from research/*

3. **AUTOMATIC RESEARCH VALIDATION AND PACKAGE EXTRACTION**
   
   **Step 3.1: Extract Package Versions from Quick-Ref**
   - Package versions are pre-validated in research/quick-ref.md
   - All versions include correct tags (@beta, @next, specific versions)
   - No need to scan multiple files - everything is in quick-ref.md
   
   **Step 3.2: Extract Architecture Patterns from Quick-Ref**
   - Vertical slicing: features/* structure
   - Modular observables with $ suffix
   - Custom hooks over utility functions
   - All patterns pre-validated and condensed
   
   **Step 3.3: Validate PRD Against Research**
   - For EVERY technology mentioned in PRD:
     - If found in research → MUST use research version/pattern
     - If NOT found in research → Flag as "NEEDS RESEARCH" in runbook
     - Generate validation report in analysis phase
   
   **Step 3.4: Create Research Requirements Manifest with Architecture Rules**
   - Generate `$OUTPUT_DIR/research-requirements.json`:
     ```json
     {
       "packages": {
         "@legendapp/state": "@beta",
         "react-native": "0.76+",
         "expo": "~52.0.0"
       },
       "patterns": {
         "architecture": "vertical-slicing",
         "state": "modular-observables",
         "components": "feature-colocated"
       },
       "architectureRules": {
         "folderStructure": {
           "pattern": "feature-based-vertical-slicing",
           "source": "research/planning/vertical-slicing.md:83-84",
           "rules": [
             {
               "type": "folder_structure",
               "check": "no root-level entities/ or services/ folders",
               "correction": "move to features/*/entities/ or features/*/services/",
               "message": "Entities and services must be colocated with features"
             },
             {
               "type": "folder_structure",
               "check": "features/* folders must not be empty",
               "correction": "populate with {components/, hooks/, services/, state/}",
               "message": "Features must contain complete vertical slices"
             },
             {
               "type": "folder_structure",
               "check": "shared/ folder only contains truly shared code",
               "correction": "move feature-specific code to features/*/",
               "message": "Shared folder should only contain cross-cutting concerns"
             }
           ]
         },
         "stateManagement": {
           "pattern": "modular-observables",
           "source": "research/tech/legend-state.md:606-631",
           "rules": [
             {
               "type": "state_pattern",
               "check": "no single monolithic state observable",
               "correction": "split into feature-specific observables composed at app level",
               "example": "gameState$ → {resourceState$, departmentState$, prestigeState$}"
             },
             {
               "type": "state_pattern",
               "check": "each feature has own state slice in features/*/state/",
               "correction": "create featureState$ in features/*/state/index.ts",
               "message": "Features must manage their own state"
             }
           ]
         },
         "codePatterns": {
           "pattern": "custom-hooks-over-utils",
           "source": "research/tech/react-native.md:1589-1614",
           "rules": [
             {
               "type": "logic_pattern",
               "check": "no utility functions for React-specific logic",
               "correction": "convert to custom hooks in features/*/hooks/",
               "message": "React logic should use hooks pattern"
             },
             {
               "type": "logic_pattern",
               "check": "business logic colocated with features",
               "correction": "move from shared/utils/ to features/*/services/",
               "message": "Business logic belongs in feature services"
             }
           ]
         },
         "componentPatterns": {
           "pattern": "feature-first-components",
           "source": "research/planning/vertical-slicing.md:16-19",
           "rules": [
             {
               "type": "component_pattern",
               "check": "components organized by feature not by type",
               "correction": "move from components/Button to features/*/components/",
               "message": "Components should be feature-scoped"
             }
           ]
         }
       },
       "validationStatus": "PASS/FAIL"
     }
     ```

4. Generate analysis summary WITH research validation and save to: `$OUTPUT_DIR/00-analysis.md`

```markdown
# Runbook Analysis: [PRD Title]

## Research Validation Status
- ✅ Package versions extracted from research
- ✅ Architecture patterns validated
- ✅ All technologies cross-referenced
- [List any NEEDS RESEARCH items]

## Extracted Requirements
- Business objectives
- Technical architecture
- Feature list with priorities
- Constraints and dependencies

## Validated Package Versions (from research/)
- @legendapp/state: @beta (research/tech/legend-state.md)
- react-native: 0.76+ (research/tech/react-native.md)
- [List all packages with research sources]

## Architecture Patterns (from research/)
- Vertical slicing with feature-based organization
- Modular Legend State observables
- Custom hooks over utility functions
- [List all patterns with research sources]

## Phase Overview
- Phase 1: Foundation (estimated tasks)
- Phase 2: Core Features (estimated tasks)
- Phase 3: Integration (estimated tasks)
- Phase 4: Quality (estimated tasks)
- Phase 5: Deployment (estimated tasks)

## Resource Requirements
- Skills needed
- Tools and libraries
- External dependencies
```

**PHASE-SPECIFIC GENERATION**

For each requested phase, generate a separate file:

### Phase 1: Foundation (`$OUTPUT_DIR/01-foundation.md`)
```markdown
# Phase 1: Foundation Setup
## Objective
Establish core infrastructure and development environment

## Research Validation Checkpoints
- [ ] All packages use versions from research/
- [ ] Directory structure follows vertical-slicing pattern
- [ ] State management follows Legend State modular patterns

## Work Packages
### WP 1.1: Environment Setup
- Task 1.1.1: Install dependencies
  - **RESEARCH-VALIDATED PACKAGES:**
    - @legendapp/state@beta (MUST use @beta - research/tech/legend-state.md)
    - react-native@0.76+ (research/tech/react-native.md)
    - [Auto-populated from research scan]
  - Installation commands:
    ```bash
    npm install @legendapp/state@beta  # FROM RESEARCH
    npm install [other packages with research versions]
    ```
  - Validation: Package versions match research requirements
  - Time estimate: 1-2 hours
  
### WP 1.2: Project Structure
- Task 1.2.1: Create directory structure
  - **MUST follow vertical-slicing pattern from research/planning/vertical-slicing.md:**
    ```
    src/
    ├── features/           # Feature-based organization
    │   ├── feature1/      # Complete vertical slice
    │   │   ├── components/
    │   │   ├── hooks/     # Custom hooks, not utils
    │   │   ├── services/
    │   │   └── types/
    ```
  - Validation: Structure matches research patterns
```

### Phase 2: Core Features (`$OUTPUT_DIR/02-core-features.md`)
```markdown
# Phase 2: Core Feature Implementation
## Objective
Implement primary business functionality

## Work Packages
### WP 2.1: [Feature Name]
- Task 2.1.1: [Specific implementation]
  - Code example: [snippet]
  - Test criteria: [how to test]
  - Dependencies: [what must be done first]
```

### Phase 3: Integration (`$OUTPUT_DIR/03-integration.md`)
```markdown
# Phase 3: Integration
## Objective
Connect features and external services

## Work Packages
### WP 3.1: Internal Integration
- Task 3.1.1: Connect components
  - Integration points: [list]
  - Testing approach: [method]
```

### Phase 4: Quality (`$OUTPUT_DIR/04-quality.md`)
```markdown
# Phase 4: Quality Assurance
## Objective
Ensure code quality and test coverage

## Work Packages
### WP 4.1: Unit Testing
- Task 4.1.1: Write unit tests
  - Coverage target: [percentage]
  - Test framework: [tool]
```

### Phase 5: Deployment (`$OUTPUT_DIR/05-deployment.md`)
```markdown
# Phase 5: Deployment Preparation
## Objective
Prepare for production release

## Work Packages
### WP 5.1: Build Configuration
- Task 5.1.1: Configure build pipeline
  - Build steps: [list]
  - Artifacts: [what to generate]
```

**PHASE COORDINATION FILE** (`$OUTPUT_DIR/index.md`)

Generate an index file that ties all phases together:

```markdown
# Implementation Runbook Index

## Generated from: [PRD Path]
## Generated on: [Date]

## Phase Files
1. [Analysis](./00-analysis.md) - Requirements and overview
2. [Foundation](./01-foundation.md) - Environment and structure setup
3. [Core Features](./02-core-features.md) - Primary functionality
4. [Integration](./03-integration.md) - Component connections
5. [Quality](./04-quality.md) - Testing and validation
6. [Deployment](./05-deployment.md) - Release preparation

## Phase Dependencies
- Foundation → Core Features
- Core Features → Integration
- Integration → Quality
- Quality → Deployment

## Progress Tracking
Use `runbook-progress.sh` to track completion:
```bash
./runbook-progress.sh $OUTPUT_DIR
```
```

**TOKEN MANAGEMENT STRATEGIES**

Each phase file follows these limits:
- Maximum 500 lines per file
- Focus on actionable tasks only
- Reference external docs instead of embedding
- Use code snippets, not full implementations
- Link between phases for context

**VALIDATION PER PHASE**

Before writing each phase file:
1. Check token estimate (lines * avg_tokens_per_line)
2. If exceeding threshold, split into sub-phases
3. Ensure atomic actionability for all tasks
4. Validate against PRD requirements

**OUTPUT STRUCTURE**
```
$OUTPUT_DIR/
├── index.md                 # Coordination file
├── 00-analysis.md          # PRD analysis
├── 01-foundation.md        # Phase 1 tasks
├── 02-core-features.md     # Phase 2 tasks
├── 03-integration.md       # Phase 3 tasks
├── 04-quality.md           # Phase 4 tasks
├── 05-deployment.md        # Phase 5 tasks
└── progress.json           # Progress tracking data
```

**USAGE EXAMPLES**

Generate all phases:
```bash
claude code .claude/commands/prp/create-development-runbook-v2.md ./path/to/prd.md
```

Generate specific phases only:
```bash
claude code .claude/commands/prp/create-development-runbook-v2.md ./path/to/prd.md --phases foundation,core
```

Custom output directory:
```bash
claude code .claude/commands/prp/create-development-runbook-v2.md ./path/to/prd.md --output-dir ./my-runbook
```

**BENEFITS**
- Never exceeds token limits per generation
- Allows incremental review and refinement
- Supports parallel work on different phases
- Maintains clear phase dependencies
- Enables selective regeneration of phases