---
description: Refine individual user stories into detailed kanban-ready implementation files using architectural expertise
argument-hint: <story-file-path> <output-file-path>
allowed-tools: ["Task", "Read", "Glob", "Write", "Edit", "Bash", "TodoWrite", "LS"]
---

EXECUTE comprehensive story refinement for individual kanban story files: $ARGUMENTS

**PHASE 1: STORY CONTEXT ANALYSIS**
Read and analyze the specified story file and relevant context:

1. Read the target story file to understand:
   - Current user story and acceptance criteria
   - Existing technical design elements
   - Implementation tasks already defined
   - Dependencies and blocking relationships
   - Current completeness level

2. Use Glob tool to identify relevant research files: `research/**/*.md`
3. Read applicable research files to gather:
   - Technical constraints and capabilities for this story domain
   - Relevant architectural patterns and best practices
   - Implementation strategies for similar functionality

**PHASE 2: STORY ANALYSIS AND REFINEMENT PLANNING**
Conduct systematic analysis of the individual story:

- DECOMPOSE the story into atomic, actionable development tasks
- IDENTIFY missing technical design elements and implementation details
- ANALYZE technical complexity, risk factors, and integration challenges
- SYNTHESIZE research insights with the story's specific requirements
- EVALUATE gaps in current architectural specifications
- ASSESS completeness of acceptance criteria and definition of done
- PLAN refinement improvements for technical design, tasks, and dependencies

**PHASE 3: STORY REFINEMENT EXECUTION**
Directly refine the story file using Edit tool with enhanced content:

REFINEMENT MISSION: Enhance the existing story file with comprehensive implementation details:

1. **Enhanced Technical Design Section**
   - Detailed architecture decisions and design patterns
   - Complete API contracts and data model specifications
   - Integration points and system interfaces
   - Security considerations and compliance requirements
   - Performance requirements and optimization strategies

2. **Comprehensive Implementation Plan**
   - Step-by-step development workflow with clear phases
   - Code structure and organization patterns
   - Testing strategies for unit, integration, and end-to-end tests
   - Quality assurance and code review procedures
   - Deployment and integration procedures

3. **Detailed Development Tasks**
   - Granular, actionable development tickets with clear scope
   - Accurate time estimates based on complexity analysis
   - Explicit dependencies and blocking relationships
   - Clear definition of done criteria for each task
   - Resource and skill requirements for successful completion

**REFINEMENT METHODOLOGY:** 
- Apply domain-driven design principles to technical specifications
- Ensure loose coupling and high cohesion in architectural decisions
- Follow SOLID principles and clean architecture patterns
- Consider scalability, maintainability, and extensibility requirements
- Integrate security-by-design and accessibility standards
- Align with existing codebase patterns and conventions

**VERTICAL SLICING VALIDATION:**
Ensure the refined story maintains vertical slicing principles:
- **End-to-End Value**: Story delivers complete functionality across all layers
- **INVEST Criteria**: Story remains Independent, Negotiable, Valuable, Estimable, Small, and Testable
- **Feature Completeness**: Implementation creates a complete, working feature slice
- **Cross-Functional Delivery**: Tasks can be completed by cross-functional teams
- **Testable Increments**: Story can be independently tested and demonstrated
- **User-Centric Focus**: Maintains clear user value and feedback potential

**PHASE 4: STORY FILE ENHANCEMENT**
Use Edit tool to enhance the story file with:

1. **Preserve existing YAML frontmatter** - update estimated_hours if significantly changed
2. **Enhance Technical Design section** with detailed architecture and API specifications
3. **Expand Implementation Plan** with comprehensive development workflow
4. **Refine Tasks section** with granular, accurately estimated development tasks
5. **Update Dependencies section** with explicit blocking relationships
6. **Enhance Definition of Done** with comprehensive completion criteria
7. **Add Notes section** with implementation insights and technical considerations

**DELIVERABLE**: Enhanced story file ready for development team execution with:
- Technical accuracy and architectural soundness
- Comprehensive implementation guidance embedded within the single file
- Actionable, developer-ready specifications without external dependencies
- **Self-contained completeness**: All research insights and technical context embedded