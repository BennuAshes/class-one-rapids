---
description: Create comprehensive Product Requirements Document (PRD) using research-backed best practices
argument-hint: <product_concept_or_prompt>
allowed-tools: ["Read", "Write", "Edit", "TodoWrite"]
---

<command>
  <role>Senior Product Manager with expertise in modern PRD development, agile methodologies, and stakeholder collaboration</role>
  <context>
    <research_foundation>
Based on comprehensive 2024-2025 research into product document requirements:
- Modern PRDs are "living documents" that evolve with the product lifecycle (Minal Mehta, YouTube)
- Successful organizations adopt dynamic, collaborative approaches balancing structure with flexibility
- Quality requirements exhibit: Testability, Traceability, Completeness, Clarity, Maintainability
- Cross-functional ownership emphasizes collaborative creation over handoff-based documentation
- Documentation as Code (DaC) practices treat documentation with same rigor as software code
    </research_foundation>
    <quality_framework>
Essential PRD components for 2024-2025:
- Document Header: Title, Change History, Owner, Status
- Core Content: Overview, Success Metrics, User Stories, Acceptance Criteria, Technical Requirements
- Quality Gates: Messaging, Risk Assessment, Timeline, Assumptions/Constraints/Dependencies
    </quality_framework>
    <user_story_standards>
INVEST Criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable
Format: "As a <role>, I want <goal> so that <benefit>"
Focus on outcomes, not implementation details
    </user_story_standards>
  </context>
  <task>
    <objective>Generate comprehensive, modern PRD from user prompt: $ARGUMENTS</objective>
    <subtasks>
      <step1>Analyze user prompt and identify core product concept, target users, and key requirements</step1>
      <step2>Structure PRD using 2024-2025 best practices with complete essential components</step2>
      <step3>Create user stories following INVEST criteria with clear acceptance criteria</step3>
      <step4>Include technical requirements, success metrics, and risk assessment</step4>
      <step5>Validate PRD completeness against quality framework and suggest improvements</step5>
    </subtasks>
  </task>
  <output_format>
    <structure>
# Product Requirements Document (PRD)

## Document Header
**Title:** [Product Name and Version]
**Owner:** [Product Manager Name/Role]
**Status:** [Draft/In Review/Approved]
**Last Updated:** [Date]
**Change History:** [Version, Date, Author, Changes]

## Executive Overview
**Product Vision:** [Brief product description and strategic context]
**Problem Statement:** [What problem are we solving?]
**Solution Overview:** [High-level approach to solving the problem]

## Success Metrics
**Primary KPIs:** [Quantifiable goals indicating success]
**Secondary Metrics:** [Supporting measurements]
**Success Timeline:** [When we expect to achieve these metrics]

## User Stories and Requirements

### Epic 1: [Major Feature Area]
**As a** [user role], **I want** [goal] **so that** [benefit]

**Acceptance Criteria:**
- [ ] [Specific, testable condition 1]
- [ ] [Specific, testable condition 2]
- [ ] [Specific, testable condition 3]

**Priority:** [High/Medium/Low]
**Estimated Effort:** [Story points or time estimate]

[Repeat for each user story]

## Technical Requirements
**System Requirements:** [Performance, scalability, security specifications]
**Integration Requirements:** [APIs, third-party services, data flows]
**Platform Requirements:** [Supported devices, browsers, operating systems]
**Compliance Requirements:** [Regulatory, security, accessibility standards]

## Assumptions, Constraints, and Dependencies
**Assumptions:** [What we expect to be true]
**Constraints:** [Limitations on budget, timeline, technology]
**Dependencies:** [External factors required for success]

## Risk Assessment
**High Risk:** [Major risks and mitigation strategies]
**Medium Risk:** [Moderate risks and monitoring plans]
**Low Risk:** [Minor risks to track]

## Messaging and Positioning
**Target Audience:** [Primary and secondary user segments]
**Value Proposition:** [Core benefits and differentiators]
**Key Messages:** [How we'll communicate about this product]

## Timeline and Milestones
**Phase 1:** [Initial delivery scope and timeline]
**Phase 2:** [Subsequent iterations and enhancements]
**Key Milestones:** [Critical dates and deliverables]

## Quality Validation Checklist
- [ ] All user stories follow INVEST criteria
- [ ] Acceptance criteria are specific and testable
- [ ] Success metrics are quantifiable and time-bound
- [ ] Technical requirements address scalability and security
- [ ] Risks are identified with mitigation strategies
- [ ] Dependencies and constraints are clearly documented
- [ ] Stakeholder roles and responsibilities are defined
    </structure>
    <quality_check>After generating PRD, provide brief analysis of:
1. Completeness against modern PRD standards
2. User story quality and INVEST criteria adherence  
3. Testability and measurability of requirements
4. Suggestions for improvement or iteration
    </quality_check>
  </output_format>
</command>

**EXECUTION INSTRUCTIONS:**

1. **ANALYZE** the provided prompt to extract:
   - Core product concept and vision
   - Target user segments and use cases
   - Key functional and non-functional requirements
   - Business objectives and success criteria

2. **GENERATE** comprehensive PRD following the structured format above, ensuring:
   - All sections are populated with relevant, specific content
   - User stories follow proper format and INVEST criteria
   - Acceptance criteria are testable and measurable
   - Technical requirements address scalability, security, and integration needs

3. **VALIDATE** the generated PRD against quality standards:
   - Verify completeness of essential components
   - Check user story quality and independence
   - Ensure success metrics are quantifiable
   - Confirm technical feasibility and constraint clarity

4. **ITERATE** if needed based on validation results to improve quality and completeness

Create a living document that can evolve with product development while maintaining structure and clarity for all stakeholders.