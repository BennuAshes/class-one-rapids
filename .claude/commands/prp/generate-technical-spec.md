---
description: Generates a streamlined technical specification optimized for AI task generation from a PRD file (minimal mode by default)
options:
  - name: prd
    required: true
    description: Path to the PRD (Product Requirements Document) file to analyze
  - name: output
    required: false
    description: Output path for the generated technical specification (defaults to ./technical-spec.md)
  - name: mode
    required: false
    description: Output mode (minimal for AI tasks, standard for balanced, extended for comprehensive)
    default: minimal
tools:
  - read
  - write
  - task
---

<cmd>
  <role>Pragmatic Technical Lead focused on actionable specifications and task decomposition</role>
  
  <expertise>
    - Vertical slicing and task breakdown
    - Minimal viable technical documentation
    - Sprint planning and story mapping
    - Clear acceptance criteria definition
  </expertise>

  <modes>
    <minimal>Core actionable items only - optimized for AI task parsing</minimal>
    <standard>Balanced technical detail with implementation focus</standard>
    <extended>Include optional architectural and operational details</extended>
  </modes>

  <process>
    <step1>
      <action>Read and extract PRD essentials</action>
      <extract>
        - Requirements and user stories
        - Acceptance criteria
        - Success metrics
        - Constraints and dependencies
      </extract>
    </step1>
    
    <step2>
      <action>Generate task-focused technical specification</action>
      
      <minimal_mode condition="mode=minimal">
        <structure>
          # Technical Specification: [PROJECT_NAME]
          
          ## Quick Summary
          [1-2 sentences describing what we're building and why]
          
          ## Implementation Tasks
          
          ### Requirement: [REQUIREMENT_NAME]
          **User Story:** [FROM_PRD]
          
          **Technical Tasks:**
          1. [ ] Setup: [specific setup task]
          2. [ ] Backend: [specific API/data task]
          3. [ ] Frontend: [specific UI task]
          4. [ ] Testing: [specific test task]
          5. [ ] Integration: [connection task]
          
          **Acceptance Tests:**
          - Test: [acceptance criterion as testable statement]
          - Test: [another criterion]
          
          **Definition of Done:**
          - Code complete and reviewed
          - Tests passing (unit + integration)
          - Documented (API/usage)
          - Deployed to staging
          
          [REPEAT FOR EACH REQUIREMENT]
          
          ## Technical Stack
          - Frontend: [framework/library]
          - Backend: [framework/language]
          - Database: [type/specific]
          - Testing: [framework]
          
          ## Development Phases
          
          ### Phase 1: Foundation (Week 1)
          - [ ] Project setup and tooling
          - [ ] Basic architecture
          - [ ] CI/CD pipeline
          
          ### Phase 2: Core Features (Weeks 2-3)
          - [ ] [Specific feature 1]
          - [ ] [Specific feature 2]
          - [ ] [Specific feature 3]
          
          ### Phase 3: Polish (Week 4)
          - [ ] Performance optimization
          - [ ] Error handling
          - [ ] Production prep
          
          ## Success Metrics
          - [ ] [Metric from PRD translated to technical measure]
          - [ ] [Another measurable outcome]
        </structure>
      </minimal_mode>
      
      <standard_mode condition="mode=standard">
        <additions>
          ## Architecture Decisions
          - Pattern: [MVC/microservices/etc]
          - State Management: [approach]
          - API Design: [REST/GraphQL]
          
          ## Data Model
          ```
          Entity: [name]
          - field: type
          - field: type
          Relationships: [description]
          ```
          
          ## Security Considerations
          - Authentication: [method]
          - Authorization: [approach]
          - Data validation: [strategy]
          
          ## Testing Strategy
          - Unit tests: [coverage target]
          - Integration tests: [key flows]
          - E2E tests: [critical paths]
        </additions>
      </standard_mode>
      
      <extended_mode condition="mode=extended">
        <additions>
          ## Deployment Architecture
          - Environment setup
          - Scaling approach
          - Monitoring setup
          
          ## Performance Requirements
          - Response time targets
          - Throughput requirements
          - Resource constraints
          
          ## Risk Mitigation
          - Technical risks and solutions
          - Dependencies and fallbacks
          
          ## Documentation Plan
          - API documentation
          - User guides
          - Runbooks
        </additions>
      </extended_mode>
    </step2>
    
    <step3>
      <action>Format for AI task generation</action>
      <formatting>
        - Use checkbox format for all tasks
        - Group related tasks together
        - Keep task descriptions specific and actionable
        - Include clear dependencies between tasks
        - Ensure each task is independently verifiable
      </formatting>
    </step3>
  </process>

  <output_optimization>
    <for_ai_parsing>
      - Clear task boundaries with checkboxes
      - Hierarchical structure for dependencies
      - Specific, actionable language
      - Measurable completion criteria
      - No ambiguous or open-ended items
    </for_ai_parsing>
    
    <task_granularity>
      - Each task completable in 0.5-2 days
      - Clear start and end conditions
      - Single responsibility per task
      - Testable outcome for each task
    </task_granularity>
  </output_optimization>

  <examples>
    <good_task>
      ✅ "[ ] Create REST API endpoint for user registration with email/password validation"
      - Specific action (create)
      - Clear scope (REST API endpoint)
      - Defined functionality (user registration)
      - Testable criteria (validation works)
    </good_task>
    
    <poor_task>
      ❌ "[ ] Implement user management"
      - Too vague
      - Multiple responsibilities
      - Unclear completion criteria
    </poor_task>
  </examples>
</cmd>

Focus on generating a **minimal, actionable specification** that an AI agent can easily parse into discrete development tasks. Prioritize clarity and specificity over comprehensive coverage.