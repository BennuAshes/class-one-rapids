---
description: Generate comprehensive status report and dashboard for kanban story workflow management
argument-hint: <epic-breakdown-folder-path>
allowed-tools: ["Bash", "Read", "Glob", "Write", "LS"]
---

EXECUTE comprehensive kanban story status analysis for: $ARGUMENTS

**PHASE 1: KANBAN STRUCTURE DISCOVERY**
Analyze the kanban folder structure to understand current state:

1. Use LS tool to verify kanban folder structure exists:
   - kanban/backlog/
   - kanban/in-progress/ 
   - kanban/review/
   - kanban/blocked/
   - kanban/done/

2. Use Glob tool to discover all story files across kanban states:
   - Pattern: `kanban/**/*.md`
   - Extract epic and story numbers from filenames
   - Build comprehensive story inventory

**PHASE 2: STORY METADATA ANALYSIS**
For each discovered story file:

1. Read YAML frontmatter to extract:
   - Epic and story numbers (epic: X, story: X.Y)
   - Current status and folder alignment verification
   - Assignment information and ownership
   - Time estimates vs actual hours tracking
   - Blocking relationships and dependencies
   - Completion dates and progress tracking

2. Validate data consistency:
   - Verify story status matches kanban folder location
   - Check for orphaned or misplaced stories
   - Identify inconsistent YAML frontmatter

**PHASE 3: PROGRESS ANALYTICS**
Calculate comprehensive project metrics:

1. **Story Distribution Analysis**:
   - Count stories in each kanban state
   - Calculate completion percentages by epic
   - Identify bottlenecks and workflow impediments

2. **Time Tracking Analysis**:
   - Sum estimated hours vs actual hours by epic
   - Calculate average story completion time
   - Identify stories with significant time overruns

3. **Dependency Analysis**:
   - Map blocking relationships between stories
   - Identify critical path dependencies
   - Flag circular dependencies or deadlocks

4. **Team Workload Analysis**:
   - Stories assigned per team member
   - Work distribution and load balancing
   - Unassigned stories requiring allocation

**PHASE 4: WORKFLOW HEALTH ASSESSMENT**
Analyze kanban workflow effectiveness:

1. **Flow Metrics**:
   - Lead time: backlog → done
   - Cycle time: in-progress → done
   - Work in progress (WIP) limits analysis
   - Throughput: stories completed per time period

2. **Quality Indicators**:
   - Stories returning from review to in-progress
   - Block frequency and resolution time
   - Definition of done completion rates

3. **Risk Assessment**:
   - Stories blocked for extended periods
   - Unassigned critical path items
   - Dependencies on external teams or systems

**PHASE 5: DASHBOARD GENERATION**
Create comprehensive status dashboard using Write tool:

Generate markdown dashboard file with sections:

1. **Executive Summary**
   - Overall project completion percentage
   - Key metrics and milestone progress
   - Critical blockers and urgent actions needed

2. **Epic Progress Summary**
   - Epic-by-epic completion status
   - Story count and distribution per epic
   - Estimated vs actual time tracking

3. **Kanban State Analysis**
   - Current story distribution across kanban states
   - WIP limits and flow optimization opportunities
   - Stories requiring immediate attention

4. **Dependency Map**
   - Critical path visualization
   - Blocking relationships and resolution priorities
   - Cross-epic dependencies

5. **Team Assignment Overview**
   - Work distribution per team member
   - Unassigned stories requiring ownership
   - Workload balancing recommendations

6. **Action Items and Recommendations**
   - High-priority blockers to resolve
   - Process improvements for workflow optimization
   - Resource allocation adjustments needed

**PHASE 6: WORKFLOW SCRIPT VALIDATION**
Test kanban workflow scripts and provide status:

1. Execute `./list-stories.sh` to verify story discovery functionality
2. Execute `./generate-dashboard.sh` to validate dashboard generation
3. Test `./move-story.sh` with sample story to verify state transitions
4. Report on script functionality and any issues discovered

**DELIVERABLE**: Comprehensive kanban status report enabling:
- Data-driven project management decisions
- Workflow optimization insights
- Resource allocation guidance
- Risk mitigation planning
- Team coordination and communication