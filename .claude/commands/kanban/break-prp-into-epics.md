---
description: Break down PRP user stories into epic-based folder structure with implementation files
argument-hint: <prp-file-path> <output-base-folder>
allowed-tools: ["Read", "Write", "Edit", "TodoWrite", "LS", "Bash"]
---

<command>
  <role>Senior Product Manager and Software Architect with expertise in epic organization, vertical slicing, and implementation planning</role>
  <context>
    <purpose>
This command takes a completed PRP (Product Requirements Prompt) file and breaks down the user stories into organized epic/phase folders with detailed implementation files. It leverages the research already synthesized in the PRP to avoid redundant analysis.
    </purpose>
    <methodology>
Uses vertical slicing principles and epic organization to structure implementation-ready files:
- Groups related user stories into logical epics/phases
- Creates implementation files for each story within epic folders
- Maintains research context and architectural guidance from PRP
- Generates actionable development tasks with clear dependencies
    </methodology>
  </context>
  <task>
    <objective>EXHAUSTIVELY break down EVERY SINGLE user story from the PRP into a complete epic folder structure, ensuring 100% coverage with no stories left unprocessed: $ARGUMENTS</objective>
    <subtasks>
      <step1>Read and analyze the provided PRP file to extract ALL user stories and research context</step1>
      <step2>Create a complete inventory of all epics and stories found - THIS IS CRITICAL</step2>
      <step3>Group user stories into logical epics/phases based on functionality and dependencies</step3>
      <step4>Create epic folder structure in the specified output location</step4>
      <step5>EXHAUSTIVELY generate implementation files for EVERY user story within appropriate epic folders</step5>
      <step6>Validate that file count matches inventory count - DO NOT SKIP THIS</step6>
      <step7>Ensure each file contains necessary research context and implementation guidance</step7>
      <step8>Create cross-epic dependency documentation and integration guidance</step8>
    </subtasks>
  </task>
  <output_format>
    <folder_structure>
output-folder/
├── kanban/
│   ├── backlog/
│   │   ├── epic-1-story-1.1-[name].md
│   │   ├── epic-1-story-1.2-[name].md
│   │   ├── epic-2-story-2.1-[name].md
│   │   └── epic-2-story-2.2-[name].md
│   ├── in-progress/         # Initially empty
│   ├── review/             # Initially empty
│   ├── blocked/            # Initially empty
│   └── done/               # Initially empty
├── epics/
│   ├── epic-1-[name].md
│   └── epic-2-[name].md
├── integration/
│   ├── cross-epic-dependencies.md
│   ├── system-architecture.md
│   └── deployment-strategy.md
└── [workflow scripts]
    ├── move-story.sh
    ├── list-stories.sh
    └── generate-dashboard.sh
    </folder_structure>
    <file_templates>
Each story is a single markdown file with YAML frontmatter containing:
- **YAML frontmatter**: Epic/story metadata, status, dependencies, estimates
- **User Story**: Acceptance criteria and business value
- **Technical Design**: Architecture, APIs, data models
- **Implementation Plan**: Step-by-step development workflow
- **Tasks**: Granular development tasks with estimates
- **Dependencies**: What blocks/is blocked by this story
- **Definition of Done**: Completion criteria and quality standards
    </file_templates>
  </output_format>
</command>

**EXECUTION INSTRUCTIONS:**

## PHASE 1: PRP ANALYSIS
1. **Read PRP file** from provided path to extract:
   - User stories and acceptance criteria
   - Research context and architectural guidance
   - Technical requirements and constraints
   - Success metrics and business objectives

2. **Parse user stories** to identify:
   - Story titles, descriptions, and acceptance criteria
   - Technical complexity and dependencies
   - Business value and priority levels
   - Integration points and shared components

## PHASE 1.5: CREATE COMPLETE STORY INVENTORY (CRITICAL - DO NOT SKIP)
**This phase ensures 100% story coverage**:

1. **Extract ALL epics and stories** from the PRP
2. **Create inventory tracking list**:
   ```
   STORY INVENTORY CHECKLIST:
   ========================
   Total Epics Found: [X]
   
   Epic 1: [Name] - [Y] stories
   - [ ] Story 1.1: [Name]
   - [ ] Story 1.2: [Name]
   - [ ] Story 1.N: [Name]
   
   Epic 2: [Name] - [Z] stories
   - [ ] Story 2.1: [Name]
   - [ ] Story 2.2: [Name]
   - [ ] Story 2.N: [Name]
   
   TOTAL STORIES TO PROCESS: [Total Count]
   ```
3. **Use this inventory as a mandatory checklist** - check off each story only after the single story file is created
4. **DO NOT PROCEED** to Phase 5 until EVERY checkbox is marked

## PHASE 2: EPIC ORGANIZATION
1. **Group stories into epics** based on:
   - Functional cohesion and related capabilities
   - Technical dependencies and shared components
   - User journey phases and workflow sequences
   - Delivery timeline and prioritization

2. **Define epic structure** with:
   - Clear epic names and descriptions
   - Story assignment and sequencing
   - Cross-epic dependencies identification
   - Integration and deployment considerations

## PHASE 3: FOLDER STRUCTURE CREATION
1. **Create base output folder** if it doesn't exist
2. **Create kanban folder structure** (backlog/in-progress/review/blocked/done)
3. **Create epics folder** for epic overview documents
4. **Create integration folder** for cross-epic documentation
5. **Create workflow scripts** (move-story.sh, list-stories.sh, generate-dashboard.sh)

## PHASE 4: STORY FILE GENERATION
**CRITICAL: This phase must be completed EXHAUSTIVELY for ALL stories in the inventory**

**DO NOT SKIP ANY STORY - Process them systematically:**

1. **Start with Epic 1, Story 1.1** from your inventory
2. **For EACH AND EVERY story** in the inventory checklist:
   - Create single story file with format: epic-[X]-story-[X.Y]-[name].md
   - Fill file with YAML frontmatter and complete content from template below
   - Place file in kanban/backlog/ folder initially
   - CHECK OFF the story in your inventory list
   - DO NOT move to next story until the file is complete

3. **Progress Tracking**:
   - After each epic, count the story files created
   - Verify count matches the inventory for that epic
   - Log progress: "Epic 1: Created 5/5 stories with 5 files total"

4. **MANDATORY**: Do not proceed to Phase 5 until:
   - Every story in inventory has been checked off
   - Total file count = Total Stories (1 file per story)

For each user story, create a single consolidated file:

### **Story File Template:**
```markdown
---
epic: [X]
story: [X.Y]
title: "[Story Title]"
status: "backlog"
assigned: ""
blocked_by: []
blocks: []
estimated_hours: 0
actual_hours: 0
completion_date: null
last_updated: [ISO timestamp]
---

# Story [X.Y]: [Story Title]

## User Story
**As a** [role], **I want** [goal] **so that** [benefit]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Technical Design

### [System Component] Architecture
```typescript
[Type definitions and interfaces]
```

### [System Component] Design
```typescript
[Implementation patterns and data structures]
```

## API Contracts

### [Interface Name]
```typescript
export interface I[InterfaceName] {
  [method signatures and documentation]
}
```

## Implementation Plan

### Step 1: [Phase Name]
1. [Implementation step]
2. [Implementation step]

### Step 2: [Phase Name]
1. [Implementation step]
2. [Implementation step]

## Tasks

### Phase 1: [Phase Name] ([X] hours)
- [ ] **Task 1.1:** [Description] (Estimate: X hours)
- [ ] **Task 1.2:** [Description] (Estimate: X hours)

### Phase 2: [Phase Name] ([X] hours)
- [ ] **Task 2.1:** [Description] (Estimate: X hours)
- [ ] **Task 2.2:** [Description] (Estimate: X hours)

**Total Estimated Time: [X] hours**

## Dependencies

### Blocks
- **[Story/Epic]**: [Description of what this blocks]

### Blocked by
- **[Story/Epic]**: [Description of what blocks this]

### Technical Dependencies
- [Technical requirements and constraints]

## Definition of Done

### Core Functionality
- [ ] [Functional completion criteria]

### Performance Standards
- [ ] [Performance requirements]

### Integration Completeness
- [ ] [Integration requirements]

## Notes
- [Any additional context or special considerations]
```

## PHASE 5: INTEGRATION DOCUMENTATION
Create cross-epic documentation:

1. **cross-epic-dependencies.md**: Dependency mapping and coordination requirements
2. **system-architecture.md**: Overall system design from PRP research
3. **deployment-strategy.md**: Phased deployment and integration approach

## PHASE 6: VALIDATION AND COMPLETION (MANDATORY COMPLETENESS CHECK)
**DO NOT MARK THIS TASK COMPLETE WITHOUT PASSING ALL VALIDATION STEPS**

1. **Quantitative Validation** (REQUIRED):
   - Count total story files created: [Actual Count]
   - Count workflow scripts created: [Actual Count]
   - Compare to inventory: Should be [Total Stories] story files
   - **FAIL if counts don't match** - find and create missing files

2. **Structural Validation** (REQUIRED):
   - Kanban folder structure complete (backlog/in-progress/review/blocked/done)
   - All story files in kanban/backlog/ initially
   - All story files have YAML frontmatter with required fields
   - Epic overview files created in epics/ folder
   - Integration folder has all 3 required files
   - Workflow scripts executable and functional

3. **Content Validation**:
   - Validate file content against PRP research and requirements
   - Ensure self-contained guidance in each story file
   - Verify no placeholder text remains (like [Story Title])
   - YAML frontmatter properly formatted with period notation (1.1, 2.3)

4. **Workflow Validation**:
   - move-story.sh script functions with period notation
   - list-stories.sh provides story discovery capabilities
   - generate-dashboard.sh creates meaningful progress visualization

5. **Final Report** (REQUIRED):
   ```
   KANBAN BREAKDOWN COMPLETION REPORT:
   ==================================
   Total Epics Processed: [X]
   Total Stories Processed: [Y] 
   Total Story Files Created: [Z]
   Expected Story Files: [Y]
   
   ✅ All stories from PRP processed
   ✅ All story files created and populated in kanban/backlog/
   ✅ Kanban folder structure validated
   ✅ Workflow scripts functional
   ✅ Content reviewed and period notation applied
   
   KANBAN BREAKDOWN COMPLETE: 100% coverage achieved
   Ready for story workflow management
   ```

5. **Create summary report** of epic organization and next steps only AFTER all validation passes

Generate implementation-ready epic structure that enables parallel development while maintaining architectural coherence and research-backed guidance.