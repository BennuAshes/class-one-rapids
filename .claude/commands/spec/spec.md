---
description: Generate and manage feature specifications using the RDT (Requirements-Design-Tasks) methodology with human validation gates
argument-hint: <action: new|generate|status|validate|approve> [project-name] [feature-name] [description]
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "LS", "TodoWrite"]
---

<command>
  <role>Senior Specification Architect specializing in Requirements Engineering, System Design, and Agile Task Decomposition</role>
  
  <context>
    <expertise>
      - Requirements elicitation and documentation (user stories, acceptance criteria)
      - System architecture and technical design patterns
      - Agile project management and sprint planning
      - Traceability and validation frameworks
      - Human-AI collaborative workflows
    </expertise>
    
    <methodology>RDT (Requirements-Design-Tasks) progressive specification with human validation gates</methodology>
    
    <knowledge_base>
      - SPECIFICATION_FORMAT_ANALYSIS.md patterns
      - AI agent runbook principles for structured workflows
      - Token-optimized document generation
      - Cross-functional collaboration patterns
    </knowledge_base>
  </context>

  <task>
    <objective>Manage feature specification lifecycle based on: $ARGUMENTS</objective>
    
    <action_parser>
      Parse the first argument to determine action:
      - "new [project] [feature] [description]": Start new specification for a feature in a project
      - "generate [project] [feature]": Generate next phase document
      - "status [project] [feature]": Show current specification status
      - "validate [project] [feature]": Run validation checks on current phase
      - "approve [project] [feature]": Approve current phase and enable progression
    </action_parser>
  </task>

  <workflow>
    <phase_1_requirements condition="action=new OR (action=generate AND phase=requirements)">
      <preparation>
        - Create /projects/[project-name]/specs/[feature-name]/ directory if needed
        - Initialize .spec-state.json with phase="requirements", status="draft"
      </preparation>
      
      <generation>
        <role_context>Product Owner defining business requirements</role_context>
        
        <document_structure>
          # Requirements Document
          
          ## Introduction
          [2-3 sentences of business context and value proposition]
          
          ## Requirements
          
          ### Requirement 1.1: [Core Feature Name]
          **User Story:** As a [specific user type], I want [specific goal], so that [business value].
          
          #### Acceptance Criteria
          1. WHEN [specific condition] THEN [observable behavior] SHALL [requirement]
          2. WHEN [edge case] THEN [expected handling] SHALL [requirement]
          3. IF [optional scenario] THEN [desired outcome] SHALL [requirement]
          
          ### Requirement 1.2: [Additional Feature]
          [Continue pattern for all requirements]
          
          ## Success Metrics
          - [Quantifiable metric with target]
          - [User satisfaction indicator]
          - [Business impact measure]
          
          ## Out of Scope
          - [Explicitly excluded feature]
          - [Future consideration]
          - [Related but separate concern]
        </document_structure>
        
        <generation_guidelines>
          - Focus on WHAT and WHY, never HOW
          - Use business language, avoid technical implementation
          - Make acceptance criteria testable and unambiguous
          - Number requirements for traceability (1.1, 1.2, 2.1, etc.)
          - Include edge cases and error scenarios
        </generation_guidelines>
      </generation>
      
      <validation>
        - Check all user stories follow standard format
        - Verify acceptance criteria use WHEN/THEN/IF structure
        - Ensure no technical implementation details present
        - Confirm success metrics are measurable
      </validation>
    </phase_1_requirements>
    
    <phase_2_design condition="action=generate AND phase=design">
      <preparation>
        - Read /projects/[project-name]/specs/[feature-name]/requirements.md
        - Verify requirements phase is approved
        - Update .spec-state.json with phase="design", status="draft"
      </preparation>
      
      <generation>
        <role_context>Senior Software Architect translating requirements to technical design</role_context>
        
        <analysis>
          Extract from requirements:
          - Core functional needs
          - Performance requirements
          - Integration points
          - Security considerations
          - Scalability needs
        </analysis>
        
        <document_structure>
          # Design Document
          
          ## Overview
          [Technical approach summary addressing requirements]
          
          ## Architecture
          
          ### System Design
          [High-level component architecture]
          
          ### Data Flow
          [How information moves through the system]
          
          ## Components and Interfaces
          
          ### [Component Name] (Requirement 1.1)
          **Purpose**: [What it does]
          
          **Interface**:
          ```typescript
          interface [ComponentInterface] {
            // Properties
            // Methods with signatures
          }
          ```
          
          **Implementation Notes**:
          - [Key technical decision]
          - [Integration approach]
          
          ## Data Models
          [TypeScript interfaces for core data structures]
          
          ## Error Handling
          - **[Error Scenario from Requirements]**: [Recovery strategy]
          
          ## Testing Strategy
          - Unit testing approach
          - Integration test scenarios
          - Performance test criteria
          
          ## Performance Considerations
          [Addressing any performance requirements]
          
          ## Security Considerations
          [Security implementation approach]
        </document_structure>
        
        <generation_guidelines>
          - Address every requirement from requirements.md
          - Use TypeScript for interfaces and examples
          - Focus on HOW to implement the WHAT
          - Include specific technical decisions and rationale
          - Map components back to requirement numbers
        </generation_guidelines>
      </generation>
      
      <validation>
        - Verify all requirements have design coverage
        - Check interfaces are properly defined
        - Ensure error scenarios are addressed
        - Confirm technical feasibility
      </validation>
    </phase_2_design>
    
    <phase_3_tasks condition="action=generate AND phase=tasks">
      <preparation>
        - Read /projects/[project-name]/specs/[feature-name]/requirements.md
        - Read /projects/[project-name]/specs/[feature-name]/design.md
        - Verify design phase is approved
        - Update .spec-state.json with phase="tasks", status="draft"
      </preparation>
      
      <generation>
        <role_context>Development Team Lead creating sprint-ready work items</role_context>
        
        <analysis>
          From requirements and design, identify:
          - Implementation sequence and dependencies
          - Component boundaries for parallel work
          - Testing requirements
          - Integration points
        </analysis>
        
        <document_structure>
          # Implementation Plan
          
          ## Phase 1: Foundation (Setup & Core Models)
          
          - [ ] 1. Initialize project structure
            - Create directory structure
            - Set up configuration files
            - Initialize version control
            - _Requirements: General setup_
          
          - [ ] 2. Implement data models
            - Create TypeScript interfaces from design
            - Set up validation schemas
            - Create mock data for testing
            - _Requirements: 1.1_
          
          ## Phase 2: Core Implementation
          
          - [ ] 3. Implement [Component from Design]
            - Create component structure
            - Implement business logic
            - Add error handling
            - Write unit tests
            - _Requirements: 1.1, 1.2_
          
          ## Phase 3: Integration & Testing
          
          - [ ] N. Integration testing
            - Test component interactions
            - Validate data flow
            - Performance testing
            - _Requirements: All_
          
          ## Phase 4: Documentation & Deployment
          
          - [ ] N. Finalize documentation
            - API documentation
            - User guides
            - Deployment instructions
            - _Requirements: All_
          
          ## Notes
          - **Dependencies**: [External dependencies]
          - **Estimated Timeline**: [Realistic estimates]
          - **Risk Factors**: [Potential blockers]
        </document_structure>
        
        <generation_guidelines>
          - Create tasks sized for 1-3 day completion
          - Use checkbox format for progress tracking
          - Include specific implementation steps
          - Link every task to requirement numbers
          - Organize in logical phases with dependencies
          - Make tasks concrete and actionable
        </generation_guidelines>
      </generation>
      
      <validation>
        - Verify all design components have tasks
        - Check all requirements are covered
        - Ensure logical task sequencing
        - Confirm realistic scope for tasks
      </validation>
    </phase_3_tasks>
    
    <action_status condition="action=status">
      - Read .spec-state.json from active specification
      - Display current phase and approval status
      - Show completed phases with checkmarks
      - List next available actions
    </action_status>
    
    <action_validate condition="action=validate">
      - Run phase-specific validation checks
      - Display checklist of validation criteria
      - Prompt for human review confirmation
      - Update .spec-state.json with validation results
    </action_validate>
    
    <action_approve condition="action=approve">
      - Verify current phase is validated or draft (allow direct approval)
      - Update .spec-state.json status to "approved"
      - Progress to next phase:
        - If requirements approved -> set phase to "design" and auto-generate design document
        - If design approved -> set phase to "tasks" and auto-generate tasks document
        - If tasks approved -> set phase to "complete"
      - Auto-generate next phase document (unless phase is complete)
      - Display generated document and next steps
    </action_approve>
  </workflow>
  
  <state_management>
    <file_location>/projects/[project-name]/specs/[feature-name]/.spec-state.json</file_location>
    <structure>
    {
      "project": "project-name",
      "feature": "feature-name",
      "created": "timestamp",
      "current_phase": "requirements|design|tasks|complete",
      "phases": {
        "requirements": {
          "status": "draft|validated|approved",
          "updated": "timestamp",
          "validator": "human-id"
        },
        "design": { ... },
        "tasks": { ... }
      },
      "history": [
        {
          "action": "action-name",
          "timestamp": "timestamp",
          "details": "action-details"
        }
      ]
    }
    </structure>
  </state_management>
  
  <error_handling>
    - If no active specification found, suggest using "new" action with project and feature names
    - If phase not approved, explain validation requirements
    - If files missing, offer to regenerate from saved state
    - If project directory doesn't exist, create it automatically
    - Provide clear, actionable error messages
  </error_handling>
  
  <output_format>
    <on_new>
      - Create project directory if needed (/projects/[project-name]/)
      - Create specification directory (/projects/[project-name]/specs/[feature-name]/)
      - Generate requirements.md
      - Display generated requirements
      - Prompt for review and editing
    </on_new>
    
    <on_generate>
      - Generate next phase document
      - Display generated content
      - Suggest validation command
    </on_generate>
    
    <on_status>
      - Show specification name and phase
      - Display progress visualization
      - List available actions
    </on_status>
    
    <on_validate>
      - Display validation checklist
      - Request human confirmation
      - Update state on success
    </on_validate>
    
    <on_approve>
      - Mark current phase as approved
      - If not complete phase:
        - Automatically generate next phase document
        - Display the generated document
        - Show "Next: /spec validate [project] [feature]" or "/spec approve [project] [feature]"
      - If complete phase:
        - Display "✅ Specification complete! All phases approved."
        - Show implementation ready message
    </on_approve>
  </output_format>
</command>

Execute the specification workflow based on the provided action and parameters. Maintain state across invocations and ensure proper phase progression with human validation at each step. When a phase is approved, automatically generate the next phase document to streamline the workflow.