---
description: Generate comprehensive epic analysis and coordination documentation for kanban project management
argument-hint: <epic-breakdown-folder-path> <epic-number>
allowed-tools: ["Read", "Glob", "Write", "LS", "Task", "TodoWrite"]
---

EXECUTE comprehensive epic analysis and documentation for: $ARGUMENTS

**PHASE 1: EPIC SCOPE DISCOVERY**
Analyze the specified epic structure and stories:

1. Use Glob tool to discover all stories belonging to the specified epic:
   - Pattern: `kanban/**/epic-[EPIC-NUMBER]-story-*.md`
   - Extract story numbers and titles from filenames
   - Build complete epic story inventory

2. Read epic overview file if exists:
   - Path: `epics/epic-[EPIC-NUMBER]-[name].md`
   - Extract epic vision, goals, and success criteria
   - Identify overall epic architecture and integration points

**PHASE 2: STORY ANALYSIS AND AGGREGATION**
For each story in the epic:

1. Read story file to extract:
   - User story and acceptance criteria
   - Technical design and architecture decisions
   - Implementation tasks and time estimates
   - Dependencies (blocks/blocked by)
   - Current status and completion progress

2. Aggregate epic-level metrics:
   - Total estimated hours vs actual hours
   - Story completion percentage
   - Technical complexity distribution
   - Cross-story dependencies within epic

**PHASE 3: EPIC ARCHITECTURE SYNTHESIS**
Analyze technical coherence across epic stories:

1. **System Integration Analysis**:
   - Identify shared components and interfaces
   - Map data flow between epic stories
   - Analyze API contracts and integration points
   - Document architectural decisions and patterns

2. **Dependency Mapping**:
   - Internal epic dependencies (story-to-story)
   - External epic dependencies (cross-epic)
   - Critical path analysis within epic
   - Potential parallel development opportunities

3. **Technical Risk Assessment**:
   - Complexity hotspots and integration challenges
   - Technology stack dependencies
   - Performance and scalability considerations
   - Security and compliance requirements

**PHASE 4: EPIC WORKFLOW ANALYSIS**
Evaluate epic progress and delivery planning:

1. **Progress Tracking**:
   - Stories by kanban state (backlog/in-progress/review/blocked/done)
   - Completion timeline and milestone tracking
   - Resource allocation and team assignments
   - Bottlenecks and workflow impediments

2. **Delivery Planning**:
   - Optimal story sequencing for value delivery
   - Minimum viable epic (MVE) identification
   - Incremental delivery milestones
   - Integration and testing strategy

3. **Risk Mitigation**:
   - Blocked stories and resolution planning
   - External dependencies and coordination needs
   - Resource constraints and skill gap analysis

**PHASE 5: EPIC DOCUMENTATION GENERATION**
Create comprehensive epic overview documentation:

Generate epic analysis file with sections:

1. **Epic Summary**
   - Epic vision and business objectives
   - Story count and completion status
   - Key metrics and progress indicators
   - Success criteria and definition of done

2. **Technical Architecture**
   - System components and integration points
   - Shared interfaces and API contracts
   - Data models and architectural patterns
   - Technology stack and framework decisions

3. **Story Breakdown**
   - Complete story inventory with status
   - Story descriptions and acceptance criteria
   - Time estimates and complexity ratings
   - Dependencies and sequencing requirements

4. **Integration Strategy**
   - Component integration approach
   - Testing and validation strategy
   - Deployment and rollout planning
   - Cross-epic coordination requirements

5. **Delivery Planning**
   - Recommended story sequencing
   - Milestone and deliverable planning
   - Resource requirements and assignments
   - Risk mitigation strategies

6. **Success Metrics**
   - Epic completion criteria
   - Quality gates and acceptance testing
   - Performance benchmarks
   - User experience validation

**PHASE 6: COORDINATION DOCUMENTATION**
Generate epic coordination artifacts:

1. **Team Communication**
   - Sprint planning guidance
   - Cross-team coordination requirements
   - Stakeholder communication plan
   - Progress reporting framework

2. **Development Guidelines**
   - Code organization and structure
   - Testing and quality standards
   - Integration and deployment procedures
   - Documentation and knowledge sharing

**DELIVERABLE**: Comprehensive epic overview enabling:
- Strategic epic planning and execution
- Technical architecture coordination
- Cross-story dependency management
- Resource allocation optimization
- Risk identification and mitigation
- Team coordination and communication
- Progress tracking and milestone planning