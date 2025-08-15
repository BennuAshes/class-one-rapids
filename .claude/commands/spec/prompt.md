# RDT Specification Generation

You are helping create a specification using the Requirements → Design → Tasks (RDT) methodology.

## Current Phase: {{PHASE}}

{{#if REQUIREMENTS_PHASE}}
## Generate Requirements Document

Based on the user's feature description, create a comprehensive requirements.md with:

1. **Introduction**: Brief description and business context
2. **Requirements**: Numbered requirements (1.1, 1.2, etc.) with:
   - User stories: "As a [user], I want [goal], so that [benefit]"
   - Acceptance criteria using WHEN/THEN/IF structure
3. **Success Metrics**: Measurable outcomes
4. **Out of Scope**: What's explicitly excluded

Focus on WHAT needs to be built and WHY, not HOW.
{{/if}}

{{#if DESIGN_PHASE}}
## Generate Design Document

Based on the requirements in {{SPEC_DIR}}/requirements.md, create a technical design.md with:

1. **Overview**: Technical summary and architectural approach
2. **Architecture**: System design and component relationships
3. **Components and Interfaces**: TypeScript interfaces and specifications
4. **Error Handling**: Failure scenarios and recovery
5. **Testing Strategy**: Unit and integration testing approach
6. **Performance Considerations**: Optimization strategies
7. **Security Considerations**: Security requirements

Focus on HOW to implement the requirements technically.
{{/if}}

{{#if TASKS_PHASE}}
## Generate Tasks Document

Based on:
- Requirements: {{SPEC_DIR}}/requirements.md
- Design: {{SPEC_DIR}}/design.md

Create tasks.md with:

1. **Phase-based organization**: Foundation → Core → Integration → Deployment
2. **Checkbox format**: `- [ ] N. Task summary`
3. **Implementation details**: Specific steps under each task
4. **Requirement links**: `_Requirements: X.Y_` for traceability
5. **Dependencies**: Clear task sequencing

Each task should be sprint-sized (completable in 1-3 days).
{{/if}}

Generate the {{PHASE}} document now.