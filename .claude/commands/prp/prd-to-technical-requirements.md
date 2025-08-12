---
description: Enhances a PRD by adding comprehensive technical implementation details directly under each user story while preserving the original structure
argument-hint: <prd-file-path> [output-file-name]
allowed-tools: Read, Write, MultiEdit, Edit, LS, Glob, Grep, TodoWrite, Task
---

<command>
  <role>Senior Technical Architect and Requirements Engineer with expertise in enhancing PRDs with detailed technical specifications</role>
  
  <context>
    <expertise>
      - Systems architecture and design patterns
      - Technical requirements engineering
      - Implementation decision frameworks
      - Risk analysis and mitigation
      - Technology stack selection
      - Performance and scalability planning
      - Security and compliance requirements
    </expertise>
    <knowledge_sources>
      - Technical research from /research/tech/ folder
      - Quick reference from /research/quick-ref.md
      - Architecture patterns and best practices
      - Framework-specific implementation guidance
      - Dependency management strategies
    </knowledge_sources>
  </context>

  <task>
    <objective>Create an enhanced copy of a PRD that preserves the original structure exactly while adding comprehensive technical implementation details directly under each user story</objective>
    
    <execution_phases>
      <phase1_knowledge_loading>
        <step>Load technical research from /research/quick-ref.md if it exists</step>
        <step>Load any available technical research from /research/tech/ folder</step>
        <step>Index architecture patterns, frameworks, and best practices</step>
        <step>Build comprehensive technical knowledge base</step>
      </phase1_knowledge_loading>
      
      <phase2_prd_analysis>
        <step>Read the provided PRD file completely</step>
        <step>Identify all user stories and their structure</step>
        <step>Map each story to required technical capabilities</step>
        <step>Identify project-wide technical requirements</step>
        <step>Note any constraints and assumptions</step>
      </phase2_prd_analysis>
      
      <phase3_technical_analysis>
        <for_each_story>
          <analyze>Required components and services</analyze>
          <analyze>Data models and storage needs</analyze>
          <analyze>API endpoints and contracts</analyze>
          <analyze>State management requirements</analyze>
          <analyze>Business logic implementation</analyze>
          <analyze>Error handling and edge cases</analyze>
          <analyze>Performance considerations</analyze>
          <analyze>Security requirements</analyze>
          <analyze>Testing approach</analyze>
          <analyze>Dependencies and integrations</analyze>
        </for_each_story>
      </phase3_technical_analysis>
      
      <phase4_prd_enhancement>
        <step>Create a copy of the original PRD</step>
        <step>Locate each user story in the document</step>
        <step>For each story, add a "Technical Implementation" section immediately after the story details</step>
        <step>Populate technical sections with comprehensive implementation specifications</step>
        <step>Ensure all original content remains unchanged</step>
        <step>Add a technical overview section at the end if needed for project-wide decisions</step>
      </phase4_prd_enhancement>
    </execution_phases>
  </task>

  <story_technical_section_format>
    <placement>Directly after each user story's acceptance criteria or description</placement>
    <structure>
### Technical Implementation

#### Components & Architecture
- **Frontend Components**: [Specific React/Vue/etc components needed]
- **Backend Services**: [Services, controllers, handlers required]
- **State Management**: [Redux stores, contexts, local state needs]
- **Data Flow**: [How data moves through the system for this story]

#### Data Model
- **Entities**: [Database tables/collections affected]
- **Schema Changes**: [New fields, tables, or relationships]
- **Validation Rules**: [Data validation requirements]
```typescript
// Example schema
interface ExampleEntity {
  id: string;
  // ... specific fields
}
```

#### API Specifications
- **Endpoints**: 
  - `GET /api/...` - [Description]
  - `POST /api/...` - [Description]
- **Request/Response Format**:
```json
{
  // Example request/response
}
```

#### Business Logic
- **Core Logic**: [Step-by-step logic flow]
- **Algorithms**: [Any special calculations or processing]
- **Business Rules**: [Validation, constraints, workflows]

#### Integration Points
- **External Services**: [Third-party APIs, services]
- **Internal Dependencies**: [Other features/modules this depends on]
- **Events/Hooks**: [System events to emit or listen for]

#### Error Handling
- **Expected Errors**: [List of error scenarios and handling]
- **Recovery Strategies**: [How to recover from failures]
- **User Feedback**: [Error messages and UX considerations]

#### Performance Considerations
- **Optimization**: [Caching, lazy loading, pagination needs]
- **Expected Load**: [Number of users, data volume]
- **Response Time Target**: [Performance SLAs]

#### Security Requirements
- **Authentication**: [Auth requirements for this feature]
- **Authorization**: [Permission checks needed]
- **Data Protection**: [Encryption, sanitization needs]

#### Testing Strategy
- **Unit Tests**: [Key functions to test]
- **Integration Tests**: [API and service integration tests]
- **E2E Scenarios**: [User flow test cases]
- **Edge Cases**: [Boundary conditions to test]

#### Implementation Notes
- **Complexity**: [Estimated complexity and effort]
- **Dependencies**: [What needs to be built first]
- **Risks**: [Technical risks and mitigation]
    </structure>
  </story_technical_section_format>

  <output_guidelines>
    <preservation_rules>
      - Keep ALL original PRD content exactly as is
      - Do not modify any existing sections, headings, or content
      - Only ADD technical sections, never remove or alter existing content
      - Maintain the original document structure and flow
      - Preserve all formatting, lists, and markdown elements
    </preservation_rules>
    
    <technical_detail_requirements>
      - Be specific with technology choices (e.g., "React 18.2" not just "React")
      - Include code examples where helpful
      - Specify exact API contracts and data schemas
      - List all error scenarios and handling approaches
      - Define clear performance metrics and targets
      - Document security considerations thoroughly
      - Provide enough detail for immediate implementation
    </technical_detail_requirements>

    <file_naming>
      - If output-file-name not provided, use: [original-name]-with-technical-details.md
      - Save in the same directory as the original PRD unless specified otherwise
    </file_naming>
  </output_guidelines>

  <verification>
    <checklist>
      - [ ] Original PRD content preserved completely
      - [ ] Technical section added for every user story
      - [ ] All technical decisions are explicit
      - [ ] Implementation details are actionable
      - [ ] No ambiguity in technical specifications
      - [ ] Code examples provided where appropriate
      - [ ] API contracts fully specified
      - [ ] Error scenarios documented
      - [ ] Performance targets defined
      - [ ] Security requirements clear
    </checklist>
  </verification>

  <error_handling>
    <scenario condition="PRD file not found">
      Provide clear error message and request valid file path
    </scenario>
    <scenario condition="No user stories found">
      Add technical overview section at appropriate location
    </scenario>
    <scenario condition="Research files not available">
      Proceed with best practices and standard patterns, note the absence
    </scenario>
    <scenario condition="Ambiguous story structure">
      Best effort to identify story boundaries, add technical details conservatively
    </scenario>
  </error_handling>
</command>