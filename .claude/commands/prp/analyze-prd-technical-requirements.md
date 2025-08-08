---
description: Extract comprehensive technical requirements from Product Requirements Documents using ULTRATHINK analysis and technical knowledge synthesis
argument-hint: <prd-file-path>
allowed-tools: ["Task", "Read", "Glob", "Write", "Edit", "Bash", "TodoWrite", "LS"]
---

EXECUTE comprehensive PRD technical requirements analysis with ULTRATHINK processing: $ARGUMENTS

<role>Senior Technical Requirements Architect specializing in PRD analysis, cross-platform mobile development, and system design with expertise in React Native, Expo, TypeScript, state management, and modern software architecture patterns</role>

<context>
  <expertise>
    - Product Requirements Document (PRD) parsing and feature extraction
    - Technical architecture pattern recognition and recommendation
    - Cross-platform mobile development with React Native and Expo
    - Modern state management (Legend State, TanStack Query, Zustand)
    - Vertical slicing methodology and INVEST principles
    - TypeScript integration and type-safe development
    - Performance optimization and testing strategies
    - SOLID principles and clean architecture patterns
  </expertise>
  <mission>Analyze PRDs and extract comprehensive technical requirements using deep technical knowledge synthesis and ULTRATHINK processing</mission>
</context>

**PHASE 1: COMPREHENSIVE KNOWLEDGE SYNTHESIS WITH RESEARCH VALIDATION**
Build complete technical knowledge base from research files:

1. **Read and analyze the target PRD** to understand:
   - Business objectives and success metrics
   - User personas and use cases  
   - Feature descriptions and functional requirements
   - Technical constraints and dependencies
   - Timeline and delivery expectations
   - Success criteria and acceptance conditions

2. **AUTOMATIC RESEARCH CROSS-REFERENCE**:
   - **Extract all technologies mentioned in PRD**
   - **Search research/tech/*.md for each technology**:
     ```bash
     # For each technology in PRD:
     grep -r "technology_name" research/tech/ --include="*.md"
     ```
   - **Build technology validation map**:
     - Technology → Research file(s) → Specific versions/patterns
     - Flag any PRD technologies NOT covered by research
   - **Extract package versions from research**:
     - Search for: npm install, yarn add, package.json examples
     - Map: package → version/tag from research

3. **Load PRD analysis framework** from research/planning/product-document-requirements.md:
   - Extract modern PRD best practices and quality frameworks
   - Understand requirements traceability patterns
   - Apply stakeholder collaboration insights
   - Leverage automated quality assurance principles

4. **Synthesize vertical slicing methodology** from research/planning/vertical-slicing.md:
   - Apply INVEST criteria for feature decomposition
   - Understand end-to-end value delivery principles
   - Extract architectural implementation patterns
   - Apply enterprise scaling considerations

5. **Gather and validate comprehensive technical knowledge** by reading ALL files in research/tech folder:
   - **Expo SDK**: Extract specific SDK version from research
   - **React Native**: Extract architecture version (New Architecture, 0.76+)
   - **Legend State**: Extract @beta tag requirement
   - **TypeScript**: Extract strict mode configuration
   - **Testing libraries**: Extract specific package names and versions
   - **Build comprehensive package requirements list**
   - **Document all architectural patterns from research**

**PHASE 2: PRD FEATURE EXTRACTION AND MAPPING**
Systematically extract and categorize features from the PRD:

1. **Parse PRD structure** using learned frameworks:
   - Identify core features and capabilities
   - Extract user stories and acceptance criteria
   - Map business requirements to technical needs
   - Understand cross-feature dependencies
   - Assess complexity and implementation challenges

2. **Apply vertical slicing analysis**:
   - Decompose features into independent, valuable slices
   - Validate INVEST criteria compliance
   - Identify cross-cutting concerns and shared components
   - Map feature dependencies and interaction patterns

3. **Create feature-to-technical mapping**:
   - Link each feature to relevant technical domains
   - Identify architectural implications
   - Assess performance and scalability requirements
   - Determine testing and validation needs

**PHASE 3: ULTRATHINK TECHNICAL REQUIREMENTS ANALYSIS**
Engage deep technical analysis using comprehensive knowledge synthesis:

<ultrathink_processing>
ULTRATHINK deeper about technical requirements by considering:

**Architecture Implications:**
- How do the PRD features map to React Native/Expo architectural patterns?
- What state management strategies are optimal for the identified features?
- How do cross-platform requirements affect technical decisions?
- What performance considerations emerge from the feature set?
- How do offline/sync requirements influence architecture choices?

**Implementation Complexity:**
- Which features require native modules or custom implementations?
- What third-party libraries and dependencies are needed?
- How do features interact and share common technical infrastructure?
- What are the testing and validation requirements for each feature?
- What end-to-end testing scenarios are critical for user journey validation?
- How do security and compliance requirements affect technical design?

**Technology Stack Alignment:**
- How do features leverage Expo SDK capabilities optimally?
- What TypeScript patterns and type safety measures are required?
- How should state be managed across different feature domains?
- What data persistence and synchronization patterns are needed?
- How do features integrate with external APIs and services?

**Scalability and Maintenance:**
- How will the technical architecture scale with additional features?
- What refactoring and code organization patterns should be established?
- How can vertical slicing principles be maintained during implementation?
- What automated testing strategies ensure long-term maintainability?
- How should end-to-end test suites be structured for scalable validation?
- How do DevOps and deployment considerations affect technical choices?

**Cross-Cutting Concerns:**
- What shared components and utilities emerge from feature analysis?
- How do authentication, authorization, and security cut across features?
- What monitoring, analytics, and error handling patterns are needed?
- How do accessibility and internationalization requirements affect design?
- What performance monitoring and optimization strategies are required?
</ultrathink_processing>

**PHASE 4: TECHNICAL REQUIREMENTS SYNTHESIS AND OUTPUT**
Generate comprehensive technical requirements based on ULTRATHINK analysis:

1. **Create a copy of the PRD** - First, create a copy of the original PRD file with `-technical-requirements` suffix (preserving the original filename structure)

2. **Preserve original story structure** - Work with the copy, preserving all original PRD content

3. **Add comprehensive technical note immediately after each story's acceptance criteria** in this format:

```markdown
**Technical Implementation Note:**
[Brief technical context for this specific story based on ULTRATHINK analysis]
- **Architecture**: [Relevant architectural patterns/components]
- **State Management**: [Required state management approach]  
- **Performance**: [Performance considerations and targets]
- **Testing**: [Testing strategy for this feature]
- **Dependencies**: [Key technical dependencies]
```

4. **Add technical requirements section** with the following structure:

```markdown
## Technical Requirements Analysis

### Architecture and Technology Stack
[Detailed technical architecture recommendations based on PRD features]

### State Management Strategy  
[Specific state management approaches for identified features]

### Performance and Scalability Requirements
[Performance targets and scalability considerations]

### Security and Compliance Considerations
[Security patterns and compliance requirements]

### Testing and Quality Assurance Strategy
[Comprehensive testing approach including unit, integration, and end-to-end testing]
- **Unit Testing**: Component and function-level validation
- **Integration Testing**: Feature interaction and API integration validation  
- **End-to-End Testing**: Critical user journey validation using Maestro for Expo projects (iOS focus)
- **Performance Testing**: Load testing and performance benchmarking
- **Accessibility Testing**: WCAG compliance and screen reader compatibility

### Third-Party Dependencies and Integrations
[Required libraries, services, and integration patterns]

### Development and Deployment Infrastructure
[DevOps, CI/CD, and deployment considerations]

### Cross-Cutting Technical Concerns
[Shared utilities, authentication, monitoring, error handling]

### Implementation Risk Assessment
[Technical risks and mitigation strategies]

### Technical Acceptance Criteria
[Measurable technical success criteria aligned with business requirements]
```

5. **Include traceability mapping**:
   - Link each technical requirement back to specific PRD features
   - Reference relevant research insights that influenced decisions
   - Provide implementation priority and dependency information

**QUALITY ASSURANCE VALIDATION:**
Ensure technical requirements meet the following criteria:
- **Completeness**: Cover all PRD features with appropriate technical depth
- **Feasibility**: Align with React Native/Expo capabilities and constraints  
- **Testability**: Include measurable acceptance criteria
- **Maintainability**: Follow SOLID principles and clean architecture patterns
- **Scalability**: Support future growth and feature additions
- **Traceability**: Clear connections between business and technical requirements

## MANDATORY IMPLEMENTATION CONSTRAINTS
Based on research synthesis, implementations MUST:
- Use feature-based folder structure (research/planning/vertical-slicing.md:83-84)
- Implement custom hooks over utilities (research/tech/react-native.md:1589-1614)
- Use modular Legend State patterns (research/tech/legend-state.md:388-417)
- Follow React Native component organization (research/tech/react-native.md:1656-1673)

## RESEARCH-VALIDATED PACKAGE REQUIREMENTS
**ALL package installations MUST use versions extracted from research:**
- **@legendapp/state**: @beta (from research/tech/legend-state.md)
- **React Native**: 0.76+ with New Architecture (from research/tech/react-native.md)
- **Expo SDK**: Latest stable version from research
- **Testing Libraries**: Specific versions from research files
- [Complete list auto-generated from research scan]

**If a package is NOT in research**: Flag as "NEEDS RESEARCH VALIDATION"

Any deviation from these patterns or package versions should HALT implementation.

**DELIVERABLE**: Enhanced PRD copy with comprehensive technical requirements section that:
- Creates a new file with `-technical-requirements` suffix, preserving the original PRD unchanged
- **INCLUDES RESEARCH VALIDATION SECTION** with:
  - Complete package version requirements from research
  - Architecture pattern requirements from research
  - Technologies cross-referenced with research files
  - List of any technologies needing research validation
- Adds detailed technical analysis based on ULTRATHINK processing
- Provides actionable technical guidance for development teams
- Maintains traceability from business requirements to technical implementation
- Leverages full spectrum of available technical knowledge and best practices
- Establishes mandatory implementation constraints that enforce research principles