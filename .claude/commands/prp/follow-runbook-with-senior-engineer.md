# Follow Runbook with Senior Software Engineer

**Description**: Execute runbook tasks using senior software engineer expertise and methodology, supporting both single-file and phased runbook structures

## Overview

This command processes implementation runbooks and executes them using the technical approach, quality standards, and development practices of an experienced Senior Software Engineer. It supports both traditional single-file runbooks and the new phased runbook structure with automatic progress tracking and token-efficient execution.

## AUTOMATIC RESEARCH VALIDATION SYSTEM

### Package Installation Auto-Validation

**This command AUTOMATICALLY validates EVERY npm/yarn/pnpm install command against research:**

1. **Automatic Package Extraction**: When encountering any install command, automatically:
   - Parse package name and version from command
   - Search ALL research/tech/*.md files for package references
   - Build comprehensive version map

2. **Intelligent Version Resolution**:
   ```
   ALGORITHM:
   - Extract package from command (e.g., @legendapp/state)
   - Search research files with: grep -r "packagename" research/tech/
   - If found in research:
     - Extract version/tag (@beta, @next, specific version)
     - OVERRIDE runbook version with research version
     - Log: "✅ Using research version: package@version"
   - If NOT in research:
     - Use runbook version
     - Log: "ℹ️ No research override, using runbook version"
   ```

3. **Automatic Correction**: The command will:
   - **AUTOMATICALLY CORRECT** package versions to match research
   - **NO MANUAL INTERVENTION** required
   - **LOG ALL CORRECTIONS** for transparency

**Example Auto-Corrections:**
```bash
# Runbook says: npm install @legendapp/state
# Research has: @legendapp/state@beta
# EXECUTED: npm install @legendapp/state@beta
# LOG: "✅ Auto-corrected to @beta version from research/tech/legend-state.md"

# Runbook says: npm install react-native-testing-library
# Research has: @testing-library/react-native
# EXECUTED: npm install @testing-library/react-native
# LOG: "✅ Package name corrected from research/tech/react-native.md"
```

### Architecture Pattern Auto-Validation

**Directory structures and code patterns are AUTOMATICALLY validated against research-requirements.json:**

1. **Architecture Rules Loading**:
   ```
   On command start:
   - Load research-requirements.json from runbook directory
   - Extract architectureRules section
   - Build validation engine from rules
   ```

2. **Real-Time Architecture Validation**:
   ```
   For EVERY file creation/modification:
   - Check against architectureRules.folderStructure
   - Check against architectureRules.stateManagement
   - Check against architectureRules.codePatterns
   - Check against architectureRules.componentPatterns
   ```

3. **Automatic Architecture Corrections**:
   ```bash
   # Example: Creating monolithic state
   Task: Create gameStore.ts with all game state
   
   ⚠️ Architecture Violation Detected:
   Rule: stateManagement.modular-observables
   Source: research/tech/legend-state.md:606-631
   Issue: Monolithic state observable detected
   
   ✅ Auto-Correction Applied:
   - Created: features/resources/state/resourceState.ts
   - Created: features/departments/state/departmentState.ts
   - Created: features/prestige/state/prestigeState.ts
   - Created: app/store/index.ts (composition only)
   Log: "Split monolithic state into feature observables"
   ```

4. **Pattern Enforcement Examples**:
   - **Folder Structure**: Empty features → populate with required subdirs
   - **State Management**: Single store → modular feature stores
   - **Code Patterns**: Utils → custom hooks for React logic
   - **Components**: Shared components → feature-scoped components

## Core Capabilities

### Senior Engineer Approach
- **Test-Driven Development**: Write tests first when possible, aim for high coverage of critical paths
- **Technical Excellence**: Focus on clean, readable, well-structured code with comprehensive error handling
- **Systematic Problem Solving**: Understand requirements thoroughly, break down complex problems, consider edge cases
- **Quality Standards**: Apply SOLID principles, maintain documentation, follow security best practices
- **Performance Optimization**: Profile before optimizing, design for real-world usage patterns

### Phased Runbook Support
- **Directory-Based Execution**: Process runbooks organized as multiple phase files
- **Automatic Progress Tracking**: Integration with progress.json for session continuity
- **Token-Efficient Loading**: Load only current phase to preserve context window
- **State Persistence**: Maintain execution state across sessions
- **Phase Dependencies**: Respect phase ordering and prerequisites

## Usage

```bash
# For phased runbooks (directory with index.md)
/follow-runbook-with-senior-engineer <runbook-directory> [options]

# For single-file runbooks (backward compatibility)
/follow-runbook-with-senior-engineer <runbook-file.md> [options]
```

### Parameters
- `runbook-path`: Path to runbook directory (with index.md) or single runbook file
- `--phase`: Execute specific phase only (for phased runbooks)
- `--work-package`: Execute specific work package only
- `--task`: Execute specific task only
- `--dry-run`: Analyze runbook without executing
- `--skip-tests`: Skip test execution (not recommended)
- `--continue`: Resume from last saved progress (default for phased)
- `--no-progress-update`: Disable automatic progress.json updates

### Examples

```bash
# Execute phased runbook from beginning or resume from saved progress
/follow-runbook-with-senior-engineer projects/pet-software-idler/runbook/

# Execute specific phase
/follow-runbook-with-senior-engineer projects/pet-software-idler/runbook/ --phase=foundation

# Execute specific phase file directly
/follow-runbook-with-senior-engineer projects/pet-software-idler/runbook/01-foundation.md

# Continue from last checkpoint (automatic for phased runbooks)
/follow-runbook-with-senior-engineer projects/pet-software-idler/runbook/ --continue

# Execute single-file runbook (backward compatibility)
/follow-runbook-with-senior-engineer projects/old-runbook.md

# Dry run to analyze structure
/follow-runbook-with-senior-engineer projects/pet-software-idler/runbook/ --dry-run
```

## Command Behavior

### 1. Runbook Detection and Analysis
```
📋 ANALYZING RUNBOOK STRUCTURE
├── Detect runbook type (phased directory vs single file)
├── For phased runbooks:
│   ├── Read index.md for phase structure
│   ├── Check progress.json for current state
│   ├── Identify next phase/task to execute
│   └── Load only current phase file
├── For single-file runbooks:
│   ├── Parse markdown structure
│   └── Extract phases/tasks
└── Generate execution plan
```

### 2. Progress State Management (Phased Runbooks)
```
📊 LOADING EXECUTION STATE
├── Check for existing progress.json
├── If exists:
│   ├── Read last completed task
│   ├── Load decision log
│   ├── Restore file creation history
│   └── Resume from next task
├── If not exists:
│   ├── Initialize progress tracking
│   └── Start from Phase 1
└── Create session context summary
```

### 3. Phase-by-Phase Execution with Architecture Validation
```
🚀 EXECUTING CURRENT PHASE
├── Load complete current phase file
├── Load research-requirements.json with architecture rules
├── Load summary of previous phases (if any)
├── For each Work Package in phase:
│   ├── Read task requirements
│   ├── **AUTO-VALIDATE PACKAGES: Check ALL install commands against research**
│   │   ├── Automatically correct versions to match research
│   │   ├── Log all package corrections for transparency
│   │   └── Proceed with corrected versions
│   ├── **AUTO-VALIDATE ARCHITECTURE: Check ALL code generation**
│   │   ├── Validate folder structure against architectureRules
│   │   ├── Validate state patterns against architectureRules
│   │   ├── Auto-correct violations (split stores, move files, etc.)
│   │   ├── Log all architecture corrections with research references
│   │   └── Generate compliant code structure
│   ├── Write tests (TDD approach)
│   ├── Implement solution with validated architecture
│   ├── Validate success criteria
│   ├── Update progress.json with architecture decisions
│   └── Log decisions made
├── Generate phase completion summary
└── Prepare handoff for next phase
```

### 4. Token-Efficient Context Management
```
💾 MANAGING CONTEXT WINDOW
├── Current phase: Load complete file
├── Previous phases: Load only:
│   ├── Success criteria results
│   ├── Key decisions made
│   ├── Files created/modified
│   └── Performance baselines
├── Code files: Load only when actively modifying
└── Documentation: Load on-demand for specific patterns
```

### 5. Progress Tracking Updates
```
✅ UPDATING PROGRESS
├── After each task completion:
│   ├── Update progress.json with task status
│   ├── Record files created/modified
│   ├── Log architectural decisions
│   └── Save performance metrics
├── After each work package:
│   ├── Run tests and record results
│   ├── Update completed_tasks count
│   └── Generate work package summary
└── After each phase:
    ├── Mark phase as complete
    ├── Generate phase handoff document
    └── Create compressed summary for future reference
```

## Phased Runbook Structure

The command expects phased runbooks to follow this structure:

```
runbook/
├── index.md                 # Phase overview and dependencies
├── 00-analysis.md          # Requirements and analysis
├── 01-foundation.md        # Phase 1 tasks
├── 02-core-features.md     # Phase 2 tasks
├── 03-integration.md       # Phase 3 tasks
├── 04-quality.md           # Phase 4 tasks
├── 05-deployment.md        # Phase 5 tasks
├── progress.json           # Progress tracking (auto-created)
└── runbook-progress.sh     # Progress visualization script
```

### Progress.json Structure
```json
{
  "phases": {
    "foundation": {
      "status": "completed",
      "completed_tasks": 10,
      "total_tasks": 10,
      "key_decisions": ["React Native + Expo", "Legend State"],
      "files_created": ["src/app/store/gameStore.ts"]
    }
  },
  "current_position": {
    "phase": "core_features",
    "work_package": "WP 2.1",
    "task": "Task 2.1.2"
  },
  "session_history": [],
  "overall": {
    "started_at": "2024-01-15T10:00:00Z",
    "last_updated": "2024-01-15T14:30:00Z",
    "total_progress": 35
  }
}
```

## Senior Engineer Development Methodology

### Problem-Solving Approach
1. **Requirement Analysis**: Read specifications thoroughly
2. **Technical Design**: Consider architecture implications
3. **Implementation Strategy**: Start simple, refactor iteratively
4. **Testing Strategy**: Write tests at appropriate levels
5. **Code Review**: Self-review for quality and edge cases
6. **Documentation**: Update decisions and complex logic

### Quality Standards Applied
- **Code Quality**: Clean, self-documenting code
- **Test Coverage**: Comprehensive testing of critical paths
- **Performance**: Optimized for real-world usage
- **Security**: Input validation, secure practices
- **Maintainability**: Modular design, clear interfaces

## State Persistence Features

### Session Continuity
The command maintains state across sessions for phased runbooks:

```typescript
interface SessionState {
  // Current position in runbook
  currentPhase: string;
  currentWorkPackage: string;
  currentTask: string;
  
  // Execution history
  completedTasks: string[];
  filesCreated: string[];
  filesModified: string[];
  
  // Technical decisions
  decisionsLog: {
    decision: string;
    rationale: string;
    impact: string;
  }[];
  
  // Quality metrics
  testResults: {
    passing: number;
    failing: number;
    coverage: number;
  };
}
```

### Recovery and Resumption
- **Automatic checkpoint**: After each task completion
- **Resume capability**: Start from last completed task
- **Decision preservation**: Maintain architectural choices
- **File tracking**: Know what was created/modified

## Integration with Development Workflow

### Version Control Integration
- **Meaningful commits**: After each work package
- **Branch management**: Appropriate branching per phase
- **Progress commits**: Include progress.json updates

### Testing Integration
- **Continuous testing**: Run tests after each task
- **Coverage tracking**: Monitor test coverage trends
- **Quality gates**: Enforce standards before progression

## Optimizations for AI Execution

### Token Management
- **Single phase loading**: Only current phase in context
- **Summary compression**: Previous phases compressed to <1000 tokens
- **Selective file loading**: Only load files being modified
- **On-demand documentation**: Load patterns when needed

### Execution Efficiency
- **Batch similar operations**: Group related tasks
- **Pattern reuse**: Apply learned patterns within session
- **Decision caching**: Reuse architectural decisions
- **Progress persistence**: Survive session boundaries

## Error Handling and Recovery

### Task-Level Error Handling
- **Validation failures**: Detailed analysis and remediation
- **Test failures**: Specific guidance on fixes
- **Missing dependencies**: Clear resolution steps

### Session-Level Recovery
- **Progress restoration**: Resume from any checkpoint
- **State consistency**: Validate state on resume
- **Partial completion**: Handle incomplete tasks gracefully

## Success Metrics

### Execution Quality
- **Task completion rate**: Track successful completions
- **Test pass rate**: Monitor quality metrics
- **Decision consistency**: Maintain architectural coherence
- **Progress velocity**: Track completion speed

### Technical Excellence
- **Code quality**: Maintainability and clarity
- **Test coverage**: Comprehensive validation
- **Performance**: Meet specified requirements
- **Documentation**: Complete and accurate

---

## Implementation Notes

This enhanced command supports both traditional single-file runbooks and the new phased runbook structure, with automatic progress tracking and token-efficient execution. It maintains the senior engineer quality standards while optimizing for AI execution contexts.

The phased runbook support enables better session continuity, progress visualization, and incremental delivery of complex projects while staying within token limits.