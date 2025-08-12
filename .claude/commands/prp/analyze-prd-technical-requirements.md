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
    - Modern state management (Legend State, TanStack Query)
    - Vertical slicing methodology and INVEST principles
    - TypeScript integration and type-safe development
    - Performance optimization and testing strategies
    - SOLID principles and clean architecture patterns
  </expertise>
  <mission>Analyze PRDs and extract comprehensive technical requirements using deep technical knowledge synthesis and ULTRATHINK processing</mission>
</context>

**PHASE 1: OPTIMIZED KNOWLEDGE SYNTHESIS WITH QUICK-REF**
Build complete technical knowledge base efficiently:

1. **Read and analyze the target PRD** to understand:
   - Business objectives and success metrics
   - User personas and use cases  
   - Feature descriptions and functional requirements
   - Technical constraints and dependencies
   - Timeline and delivery expectations
   - Success criteria and acceptance conditions

2. **LOAD ULTRA-CONDENSED RESEARCH** (200 tokens total):
   - **Read research/quick-ref.md** for ALL package versions and patterns
   - Contains pre-validated package versions with correct tags (@beta, @next)
   - Includes architecture rules, patterns, and gotchas
   - No need to scan multiple files - everything critical is condensed here
   
3. **AUTOMATIC VALIDATION**:
   - Cross-reference PRD technologies with quick-ref.md
   - All versions and patterns are pre-validated
   - Flag any PRD technologies NOT in quick-ref as "NEEDS RESEARCH"

4. **Apply methodologies from quick-ref**:
   - Vertical slicing: features/* structure
   - INVEST criteria for feature decomposition
   - Modular observables with $ suffix
   - Custom hooks over utility functions

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

**PHASE 5: ARCHITECTURE SYNTHESIS GENERATION**
Create comprehensive architecture synthesis document:

1. **Generate architecture-synthesis.md** with complete architectural decision record:

```markdown
# Architecture Synthesis

## Executive Summary
[High-level overview of architectural decisions and trade-offs]

## Pattern Reconciliations

### Framework Structure Conflicts
#### Expo Router + Vertical Slicing
**Conflict**: Expo expects `app/` directory for file-based routing, vertical slicing demands `features/` organization
**Analysis**: 
- Expo's file-based routing requires specific directory structure
- Vertical slicing improves feature isolation and team scalability
- Both patterns have valid architectural benefits
**Resolution**: Hybrid approach with clear separation of concerns
- `app/` contains thin routing shells (navigation only)
- `features/` contains thick domain logic (business logic)
- Bridge pattern: `app/(tabs)/[screen].tsx` imports from `features/[feature]/screens/`
- Shared components in `shared/components/` for cross-feature reuse
**Trade-offs**:
- Pro: Maintains both Expo conventions and vertical slicing benefits
- Con: Slightly more complex import paths
- Mitigation: Path aliases in tsconfig.json

### State Management Architecture
**Conflict**: Multiple state management patterns available (Legend State, TanStack Query, Context)
**Analysis**:
- Legend State offers fine-grained reactivity
- TanStack Query excels at server state
- Context API is built-in but less performant
**Resolution**: Layered state architecture
- Legend State for client state and game logic
- TanStack Query for server state and API calls
- Context only for truly global, rarely-changing values
**Implementation Pattern**:
```typescript
// Client state with Legend State
const gameState$ = observable({ score: 0, level: 1 });

// Server state with TanStack Query
const { data: leaderboard } = useQuery(leaderboardOptions);

// Global config with Context (theme, locale)
const { theme } = useTheme();
```

## Architecture Decision Records (ADRs)

### ADR-001: Hybrid Directory Structure
**Status**: Accepted
**Context**: Need to balance Expo conventions with vertical slicing
**Decision**: Use dual directory structure with clear boundaries
**Consequences**: 
- Developers must understand both patterns
- Documentation critical for onboarding
- Path aliases required for clean imports

### ADR-002: Fine-Grained Reactivity for Game State
**Status**: Accepted
**Context**: Game loops require high-performance state updates
**Decision**: Legend State v3 for game state management
**Consequences**:
- Learning curve for team
- Less ecosystem support
- Superior performance for game mechanics

### ADR-003: MMKV for Persistence
**Status**: Accepted
**Context**: Need fast, synchronous storage for game saves
**Decision**: react-native-mmkv over AsyncStorage
**Consequences**:
- Additional native dependency
- Platform-specific setup required
- 30x performance improvement



**PHASE 6: DEEP REFLECTION AND VALIDATION**
Perform comprehensive reflection on architectural decisions:

1. **Pattern Compatibility Analysis**:
   <deep_reflection>
   - Validate that chosen patterns work together without conflicts
   - Check for circular dependencies between features
   - Ensure state management patterns don't conflict
   - Verify navigation patterns work with feature isolation
   - Confirm testing strategies cover all architectural layers
   </deep_reflection>

2. **Dependency Graph Validation**:
   - Analyze peer dependency requirements
   - Check for version conflicts between packages
   - Validate that beta dependencies have stable APIs
   - Ensure native dependencies work with Expo managed workflow

3. **Edge Case Identification**:
   <edge_case_analysis>
   - What happens during state migrations between app versions?
   - How do we handle corrupted MMKV storage?
   - What's the fallback if Legend State has breaking changes?
   - How do we manage feature flags across the hybrid structure?
   - What if Expo's routing changes in future versions?
   </edge_case_analysis>

4. **Integration Risk Assessment**:
   - Identify integration points with highest failure risk
   - Document rollback procedures for each high-risk decision
   - Create monitoring requirements for critical paths
   - Define success metrics for architecture validation

5. **Performance Impact Analysis**:
   <performance_reflection>
   - Calculate cumulative bundle size impact
   - Estimate memory footprint with all state managers
   - Project render performance with fine-grained reactivity
   - Assess startup time with dependency injection
   </performance_reflection>

6. **Team and Process Implications**:
   - Document required team training
   - Identify documentation needs
   - Plan architecture review cadence
   - Define code review focus areas

7. **Update Synthesis with Reflection Insights**:
   - Add discovered edge cases to "Unresolved Tensions"
   - Update risk assessments based on deeper analysis
   - Refine mitigation strategies with specific actions
   - Add monitoring and validation requirements

**PHASE 7: FINAL SYNTHESIS VALIDATION**
Perform final validation loop:

1. **Cross-Reference with Research**:
   - Verify all decisions align with research/quick-ref.md
   - Confirm no contradictions with established patterns
   - Validate version selections against research

2. **Completeness Check**:
   - Every PRD feature has architectural support
   - All conflicts have documented resolutions
   - Each high-risk decision has a mitigation plan
   - Testing strategy covers all architectural layers

3. **Generate Validation Report**:
   Append to architecture-synthesis.md:
   ```markdown
   ## Validation Report
   
   ### Research Alignment
   ✅ All patterns validated against research/quick-ref.md
   ✅ Package versions confirmed from research
   ⚠️ [Any deviations with justification]
   
   ### Completeness Metrics
   - Features Covered: X/Y (100%)
   - Conflicts Resolved: X/Y
   - Risks Mitigated: X/Y
   - Test Coverage Planned: X%
   
   ### Confidence Assessment
   - Architecture Stability: High/Medium/Low
   - Implementation Readiness: Score/10
   - Risk Level: Acceptable/Needs Review
   
   ### Next Steps
   1. [Specific actions required before implementation]
   2. [Research needed for unresolved items]
   3. [Team alignment requirements]
   ```

**QUALITY ASSURANCE VALIDATION:**
Ensure technical requirements meet the following criteria:
- **Completeness**: Cover all PRD features with appropriate technical depth
- **Feasibility**: Align with React Native/Expo capabilities and constraints  
- **Testability**: Include measurable acceptance criteria
- **Maintainability**: Follow SOLID principles and clean architecture patterns
- **Scalability**: Support future growth and feature additions
- **Traceability**: Clear connections between business and technical requirements

**If a package is NOT in research**: Flag as "NEEDS RESEARCH VALIDATION"

Any deviation from these patterns or package versions should HALT implementation.

**DELIVERABLES**: 
1. **Enhanced PRD Copy** (`[original-name]-technical-requirements.md`) that:
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

2. **Architecture Synthesis Document** (`architecture-synthesis.md`) that:
   - Documents all architectural decisions and trade-offs
   - Reconciles conflicting patterns (e.g., Expo vs vertical slicing)
   - Records version lock decisions with detailed rationale
   - Lists unresolved tensions requiring testing or research
   - Provides comprehensive risk assessments and mitigation strategies
   - Includes Architecture Decision Records (ADRs) for key choices
   - Contains validation report with confidence metrics
   - Undergoes deep reflection phase for conflict detection
   - Serves as the authoritative architectural decision record for the project

Both documents work together to provide complete technical clarity: the PRD copy for feature-specific technical details, and the synthesis for overarching architectural decisions and pattern reconciliations.