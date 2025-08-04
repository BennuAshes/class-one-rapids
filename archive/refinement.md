---
description: Extract and refine features from Product Requirements Documents into detailed kanban-ready implementation files using architectural expertise
argument-hint: <prd-file-path> [output-directory]
allowed-tools: ["Task", "Read", "Glob", "Write", "Edit", "Bash", "TodoWrite", "LS"]
---

EXECUTE comprehensive PRD analysis and feature refinement for Product Requirements Documents: $ARGUMENTS

**PHASE 1: PRD CONTEXT ANALYSIS**
Read and analyze the specified PRD file and relevant context:

1. Read the target PRD file to understand:
   - Business objectives and success metrics
   - User personas and use cases
   - Feature descriptions and requirements
   - Technical constraints and dependencies
   - Timeline and release planning
   - Priority and scope definitions

2. Use Glob tool to identify relevant research files: `research/**/*.md`
3. Read applicable research files to gather:
   - Technical constraints and capabilities for PRD domains
   - Relevant architectural patterns and best practices
   - Implementation strategies for similar functionality

4. Extract feature list from PRD:
   - Identify major features and capabilities
   - Map features to user stories and use cases
   - Understand inter-feature dependencies
   - Assess feature complexity and technical requirements

**PHASE 2: PRD ANALYSIS AND FEATURE REFINEMENT PLANNING**
Conduct systematic analysis of the PRD and extracted features:

- DECOMPOSE each feature into atomic, actionable development tasks
- IDENTIFY missing technical design elements and implementation details for each feature
- ANALYZE technical complexity, risk factors, and integration challenges across features
- SYNTHESIZE research insights with each feature's specific requirements
- EVALUATE gaps in current architectural specifications for the product
- ASSESS completeness of user stories and acceptance criteria per feature
- PLAN refinement improvements for technical design, tasks, and cross-feature dependencies
- MAP PRD sections to individual features for traceability
- PRIORITIZE features based on PRD business objectives and technical dependencies

**PHASE 3: FEATURE REFINEMENT EXECUTION**
Create refined feature files for each extracted feature with enhanced content:

REFINEMENT MISSION: Generate comprehensive feature implementation files with detailed specifications:

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

**PHASE 4: FEATURE FILE GENERATION**
Create individual feature files in the output directory with:

1. **Generate YAML frontmatter** with feature metadata, priorities, and estimated_hours
2. **Create Technical Design section** with detailed architecture and API specifications
3. **Develop Implementation Plan** with comprehensive development workflow
4. **Define Tasks section** with granular, accurately estimated development tasks
5. **Establish Dependencies section** with explicit blocking relationships and cross-feature dependencies
6. **Create Definition of Done** with comprehensive completion criteria
7. **Add Notes section** with implementation insights and PRD traceability
8. **Include PRD Reference section** with links to source PRD sections

**ADDITIONAL OUTPUTS:**
- Generate `index.md` file summarizing all extracted features and their relationships
- Create `prd-mapping.md` documenting traceability from PRD sections to feature files
- Ensure each feature file maintains vertical slicing and INVEST principles

**DELIVERABLES**: Set of enhanced feature files ready for development team execution with:
- Technical accuracy and architectural soundness across all features
- Comprehensive implementation guidance for each feature
- Clear cross-feature dependency mapping
- Actionable, developer-ready specifications with PRD traceability
- **Holistic completeness**: All PRD insights and technical context distributed across feature files