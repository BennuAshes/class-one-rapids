---
description: Create Product Requirements Prompt (PRP) - PRD plus synthesized research runbook for AI agents
argument-hint: <product_concept_or_prompt>
allowed-tools: ["Read", "Write", "Edit", "TodoWrite", "Glob", "Grep"]
---

<command>
  <role>Senior Product Manager and AI Systems Architect with expertise in product requirements, research synthesis, and AI agent runbook development</role>
  <context>
    <research_foundation>
2024-2025 Product Requirements Research Integration:
- Modern PRDs are living documents that evolve with product lifecycle
- Quality requirements: Testability, Traceability, Completeness, Clarity, Maintainability
- Cross-functional collaboration and Documentation as Code practices
- INVEST criteria for user stories: Independent, Negotiable, Valuable, Estimable, Small, Testable

AI Agent Runbook Best Practices:
- Autonomous runbooks with self-healing capabilities and 24/7 reliability
- Structured task models with directed graph dependencies
- Multi-agent coordination patterns and clear communication protocols
- Governance frameworks: Trust, Auditability, Security, Risk Management
- Human-AI collaboration points with escalation procedures
    </research_foundation>
    <output_structure>
PRP = Comprehensive PRD + Relevant Research Synthesis + AI Agent Implementation Runbook
Must be self-contained with all necessary context for AI agents to execute
    </output_structure>
  </context>
  <task>
    <objective>Create comprehensive Product Requirements Prompt (PRP) from user prompt: $ARGUMENTS</objective>
    <subtasks>
      <step1>Read and analyze ALL research files in ./research folder to build comprehensive knowledge base</step1>
      <step2>Generate comprehensive PRD following 2024-2025 best practices by using the /create-prd command</step2>
      <step3>Identify research areas relevant to the specific product concept</step3>
      <step4>Synthesize relevant research into actionable insights</step4>
      <step3.5>Generate detailed technical architecture specifications using software-architect agent</step3.5>
      <step5>Create AI agent runbook integrating research synthesis and architectural specifications</step5>
      <step6>Structure complete PRP with clear navigation and implementation guidance</step6>
      <step7>Validate completeness and quality against frameworks</step7>
      <step8>Save the generated PRP to an appropriate file location using Write tool</step8>
      <step9>Use /break-prp-into-epics command to organize user stories into epic-based folder structure</step9>
    </subtasks>
  </task>
  <output_format>
    <structure>
# Product Requirements Prompt (PRP)

## Prompt Overview
**Product:** [Product Name and Version]
**Prompt Type:** Comprehensive PRP (PRD + Research + AI Agent Runbook)
**Created:** [Date]
**Owner:** [Product Manager/Team]
**AI Agent Compatibility:** [Structured for autonomous execution]

---

## SECTION 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Document Header
**Title:** [Product Name and Version]
**Owner:** [Product Manager Name/Role]
**Status:** [Draft/In Review/Approved]
**Last Updated:** [Date]
**Change History:** [Version, Date, Author, Changes]

### Executive Overview
**Product Vision:** [Brief product description and strategic context]
**Problem Statement:** [What problem are we solving?]
**Solution Overview:** [High-level approach to solving the problem]

### Success Metrics
**Primary KPIs:** [Quantifiable goals indicating success]
**Secondary Metrics:** [Supporting measurements]
**Success Timeline:** [When we expect to achieve these metrics]

### User Stories and Requirements
[Complete user stories following INVEST criteria with acceptance criteria]

### Technical Requirements
[System, integration, platform, and compliance requirements]

### Assumptions, Constraints, and Dependencies
[Critical external factors and limitations]

### Risk Assessment
[Identified risks with mitigation strategies]

### Timeline and Milestones
[Phased delivery approach with key dates]

---

## SECTION 2: RELEVANT RESEARCH SYNTHESIS

### Research Methodology
**Analysis Scope:** [Which research areas were analyzed]
**Relevance Criteria:** [How research relevance was determined]
**Synthesis Approach:** [How insights were integrated]

### Core Research Insights
[Synthesized insights from relevant research areas with direct application to this product]

### Technical Architecture Recommendations
[Research-backed technical decisions and patterns]

### Implementation Best Practices
[Proven methodologies and approaches from research]

### Risk Mitigation Strategies
[Research-informed risk management approaches]

---

## SECTION 3: TECHNICAL ARCHITECTURE SPECIFICATIONS

### System Architecture Overview
**Architecture Pattern:** [Selected architectural approach (e.g., Vertical Slice, Feature-Driven)]
**Technology Stack:** [Confirmed technology selections with rationale]
**Integration Strategy:** [How components integrate and communicate]
**Scalability Design:** [Performance and scaling considerations]

### Project Structure and Organization

#### Folder Structure Standard
```
/src
├── /features              # Vertical slice features
│   ├── /[feature-name]   # Individual feature slices
│   │   ├── /components   # Feature-specific React components
│   │   ├── /hooks        # Feature-specific custom hooks
│   │   ├── /services     # Feature business logic
│   │   ├── /types        # Feature TypeScript interfaces
│   │   ├── /utils        # Feature utility functions
│   │   └── index.ts      # Feature barrel exports
├── /shared               # Cross-cutting concerns
│   ├── /components       # Shared UI components
│   ├── /hooks            # Global custom hooks
│   ├── /services         # Shared business services
│   ├── /state            # Global state management
│   ├── /types            # Global TypeScript interfaces
│   ├── /utils            # Shared utility functions
│   └── /constants        # Application constants
├── /assets               # Static assets (images, fonts)
├── /screens              # Top-level screen components
├── App.tsx               # Root application component
└── index.ts              # Application entry point
```

#### File Naming Conventions
- **Components**: PascalCase (e.g., `GameButton.tsx`, `ProductionCounter.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useGameLoop.ts`, `useProductionRate.ts`)
- **Services**: camelCase with descriptive suffix (e.g., `gameService.ts`, `persistenceService.ts`)
- **Types**: PascalCase with descriptive suffix (e.g., `GameState.ts`, `ResourceTypes.ts`)
- **Utils**: camelCase with descriptive name (e.g., `formatNumbers.ts`, `gameCalculations.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `GAME_CONSTANTS.ts`, `API_ENDPOINTS.ts`)

### Component Architecture

#### Component Boundaries and Responsibilities
**Screen Components:**
- Top-level navigation and layout management
- Global state orchestration
- Screen-specific business logic coordination

**Feature Components:**
- Encapsulated feature functionality
- Local state management within feature boundaries
- Feature-specific user interactions

**Shared Components:**
- Reusable UI elements without business logic
- Consistent design system implementation
- Pure or minimally stateful components

#### Integration Patterns
**State Management Integration:**
```typescript
// Legend State v3 integration pattern
const gameState$ = observable<GameState>({
  resources: { lines: 0, revenue: 0 },
  production: { linesPerSecond: 0 },
  // Computed values for derived state
  totalValue: () => gameState$.resources.lines.get() * gameState$.resources.revenue.get()
});

// React component integration
const GameComponent = observer(() => {
  const linesCount = use$(gameState$.resources.lines);
  // Component implementation
});
```

**Service Layer Patterns:**
```typescript
// Service interface contract
interface GameService {
  readonly state$: Observable<GameState>;
  incrementLines(amount: number): void;
  purchaseUpgrade(upgradeId: string): Promise<boolean>;
  calculateProductionRate(): number;
}

// Service implementation
class GameServiceImpl implements GameService {
  // Implementation following dependency injection principles
}
```

### Data Flow and State Management

#### State Architecture
**Global State (Legend State v3):**
- Game progression data
- User preferences and settings
- Cross-feature shared state
- Persistent data requiring MMKV storage

**Local Component State:**
- UI-specific state (modals, forms, animations)
- Temporary interaction state
- Component-scoped derived state

**Service State:**
- Business logic state
- External API integration state
- Background processing state

#### Persistence Strategy
**MMKV Integration:**
```typescript
// Storage configuration
const gameStorage = new MMKV({
  id: 'game-state',
  encryptionKey: process.env.ENCRYPTION_KEY
});

// Synced observable configuration
const persistedGameState$ = observable(
  mySynced({
    initial: defaultGameState,
    persist: { 
      name: 'game-state-key',
      transform: {
        save: (value) => gameStateSerializer(value),
        load: (value) => gameStateDeserializer(value)
      }
    }
  })
);
```

### Testing Architecture

#### Test Organization Structure
```
/__tests__
├── /features             # Feature-specific tests
│   ├── /[feature-name]
│   │   ├── components.test.tsx
│   │   ├── hooks.test.ts
│   │   ├── services.test.ts
│   │   └── integration.test.tsx
├── /shared               # Shared component tests
│   ├── /components
│   ├── /hooks
│   └── /services
├── /e2e                  # End-to-end tests
├── /utils                # Test utilities and helpers
└── setup.ts              # Test environment setup
```

#### Testing Strategies
**Unit Testing:**
- Component testing with React Native Testing Library
- Service logic testing with Jest
- Utility function testing
- Hook testing with @testing-library/react-hooks

**Integration Testing:**
- Feature workflow testing
- State management integration
- Service integration testing
- API integration testing

**Performance Testing:**
- React Native performance monitoring
- Memory usage validation
- Frame rate testing (60 FPS target)
- Bundle size optimization validation

### Performance Optimization Patterns

#### React Native Specific Optimizations
**Memory Management:**
- Component memoization with React.memo()
- Callback memoization with useCallback()
- Value memoization with useMemo()
- Image optimization and lazy loading

**State Update Optimization:**
```typescript
// Batched state updates for performance
import { batch } from '@legendapp/state';

const performComplexUpdate = () => {
  batch(() => {
    gameState$.resources.lines.set(prev => prev + 100);
    gameState$.resources.revenue.set(prev => prev + 500);
    gameState$.stats.totalClicks.set(prev => prev + 1);
  });
};
```

**Rendering Performance:**
- FlatList optimization for large datasets
- Image caching and optimization
- Animation performance with react-native-reanimated
- Bundle splitting and lazy loading

#### Target Performance Metrics
- **Frame Rate**: Consistent 60 FPS during gameplay
- **Memory Usage**: < 200MB peak memory consumption
- **App Launch Time**: < 3 seconds cold start
- **Bundle Size**: < 50MB total app size

### Build and Deployment Configuration

#### Development Environment Setup
**Required Dependencies:**
```json
{
  "dependencies": {
    "@legendapp/state": "^3.0.0-beta.31",
    "react-native-mmkv": "^3.0.0",
    "expo": "~52.0.0",
    "react-native": "0.79.5"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Build Configuration:**
- Expo SDK 52+ configuration
- TypeScript strict mode enabled
- ESLint and Prettier integration
- Metro bundler optimization

#### Deployment Strategy
**Development Pipeline:**
1. Local development with Expo CLI
2. Testing with Jest and React Native Testing Library
3. E2E testing with Detox or Maestro
4. Build optimization and bundle analysis
5. Platform-specific builds (iOS/Android)

**Quality Gates:**
- All unit tests pass (> 80% coverage)
- Integration tests pass
- Performance benchmarks met
- Code quality standards enforced
- Security scanning passed

---

## SECTION 4: AI AGENT IMPLEMENTATION RUNBOOK

### Agent Role Definition
**Primary Role:** [AI agent's core responsibility for this product]
**Expertise Domain:** [Specialized knowledge required]
**Decision Authority:** [What the agent can decide vs. escalate]
**Success Criteria:** [How to measure agent performance]

### Structured Task Model

#### Phase 1: Planning and Architecture
**Task Dependencies:**
```
User Requirements Analysis → Technical Architecture Design → Implementation Planning
```

**Agent Instructions:**
1. **Requirement Analysis**
   - Parse user stories and acceptance criteria
   - Identify technical constraints and dependencies
   - Flag ambiguities for human clarification
   - Document assumptions and validation needs

2. **Architecture Design**  
   - Apply research-backed architectural patterns
   - Select appropriate technology stack based on requirements
   - Design system integration points
   - Define scalability and performance targets

3. **Implementation Planning**
   - Break down work into vertical slices
   - Sequence development based on dependencies
   - Identify testing and validation checkpoints
   - Create resource allocation recommendations

#### Phase 2: Development Execution
**Task Dependencies:**
```
Environment Setup → Feature Implementation → Testing → Integration
```

**Agent Instructions:**
[Detailed step-by-step implementation guidance based on research insights]

#### Phase 3: Validation and Deployment
**Task Dependencies:**
```
Quality Assurance → Performance Testing → Deployment → Monitoring
```

**Agent Instructions:**
[Testing, deployment, and monitoring procedures]

### Decision Trees and Escalation Procedures

#### Decision Matrix
| Scenario | Agent Action | Escalation Trigger | Human Intervention Required |
|----------|--------------|-------------------|----------------------------|
| [Common scenario 1] | [Autonomous action] | [Condition for escalation] | [When human needed] |
| [Common scenario 2] | [Autonomous action] | [Condition for escalation] | [When human needed] |
| [Edge case] | [Limited action] | [Immediate escalation] | [Human decision required] |

#### Escalation Procedures
1. **Technical Blockers:** [When and how to escalate technical issues]
2. **Requirement Ambiguity:** [Process for clarifying unclear requirements]
3. **Resource Constraints:** [Handling scope or resource limitations]
4. **Quality Concerns:** [When quality standards aren't met]

### Error Handling and Recovery

#### Common Error Patterns
- **Integration Failures:** [Detection and recovery procedures]
- **Performance Issues:** [Monitoring and optimization approaches]
- **Data Inconsistencies:** [Validation and correction methods]
- **Deployment Problems:** [Rollback and recovery strategies]

#### Self-Healing Mechanisms
- **Automated Testing:** [Continuous validation procedures]
- **Performance Monitoring:** [Real-time health checks]
- **Auto-scaling:** [Resource adjustment protocols]
- **Fallback Procedures:** [Graceful degradation strategies]

### Communication Protocols

#### Status Reporting
- **Progress Updates:** [Format and frequency of progress reports]
- **Milestone Completion:** [Validation and communication procedures]
- **Issue Identification:** [Problem reporting and escalation format]
- **Success Metrics:** [Performance measurement and reporting]

#### Cross-Agent Coordination
- **Data Sharing:** [How agents share information and state]
- **Task Handoffs:** [Procedures for transferring work between agents]
- **Conflict Resolution:** [Handling overlapping responsibilities]
- **Knowledge Updates:** [Sharing learnings and improvements]

### Continuous Improvement Framework

#### Learning Mechanisms
- **Performance Analysis:** [Measuring and improving agent effectiveness]
- **Feedback Integration:** [Incorporating human and system feedback]
- **Pattern Recognition:** [Identifying optimization opportunities]
- **Knowledge Updates:** [Keeping runbook current with new learnings]

#### Optimization Cycles
- **Daily:** [Immediate performance adjustments]
- **Weekly:** [Process refinement and improvement]
- **Monthly:** [Strategic capability enhancement]
- **Quarterly:** [Major framework updates and evolution]

---

## SECTION 4: IMPLEMENTATION VALIDATION

### Quality Assurance Checklist
- [ ] PRD completeness against 2024-2025 standards
- [ ] Research synthesis accuracy and relevance
- [ ] Architectural specifications provide concrete implementation guidance
- [ ] Folder structures and file naming conventions are clearly defined
- [ ] Component boundaries and integration patterns are specified
- [ ] Testing strategies and performance targets are established
- [ ] Build configuration and deployment pipeline are documented
- [ ] Runbook clarity and actionability for AI agents
- [ ] Decision trees cover common scenarios
- [ ] Escalation procedures are well-defined
- [ ] Error handling addresses likely failure modes
- [ ] Communication protocols enable coordination
- [ ] Continuous improvement mechanisms are operational
- [ ] Technical completeness prevents "sloppy" implementations

### Success Validation Framework
1. **PRD Quality:** [Validation criteria for requirements quality]
2. **Research Integration:** [Verification of research application]
3. **Architectural Completeness:** [Assessment of technical specification thoroughness]
4. **Implementation Clarity:** [Verification that stories have concrete guidance]
5. **Agent Readiness:** [Assessment of runbook completeness with architectural context]
6. **Technical Feasibility:** [Confirmation of implementation viability with specified architecture]

### Iteration Recommendations
[Specific suggestions for improving and evolving this PRP]

---

## APPENDIX: RESEARCH REFERENCE INDEX

### Applied Research Areas
[List of research files that were determined relevant and incorporated]

### Research Integration Map
[How specific research insights were applied to this product]

### Additional Research Recommendations
[Research areas that might become relevant as product evolves]
    </structure>
    <execution_steps>
1. Execute comprehensive research folder analysis
2. Generate complete PRD following established best practices  
3. Synthesize relevant research with clear application to product
4. Generate detailed technical architecture specifications using software-architect agent
5. Create detailed AI agent runbook integrating research synthesis and architectural specifications
6. Validate quality and completeness across all components including technical completeness
7. Save PRP to appropriate file location (e.g., docs/prp-[product-name].md or projects/[product-name]/prp.md)
8. Break down PRP into epic-based folder structure using /break-prp-into-epics command
9. Provide iteration recommendations for continuous improvement
    </execution_steps>
  </output_format>
</command>

**EXECUTION INSTRUCTIONS:**

## PHASE 1: COMPREHENSIVE RESEARCH ANALYSIS
First, systematically read and analyze EVERY file in the research folder:

1. **Use Glob tool** to identify all research files: `research/*.md`
2. **Read each research file** completely to understand:
   - Core concepts and methodologies
   - Best practices and proven patterns
   - Technical frameworks and tools
   - Implementation strategies
   - Risk factors and mitigation approaches

3. **Build comprehensive knowledge base** from all research areas
4. **Analyze relevance** of each research area to the specific product concept provided

## PHASE 2: PRD GENERATION
Create comprehensive PRD following modern best practices:

1. **Parse user prompt** to extract product concept, target users, and requirements
2. **Apply PRD structure** from product-document-requirements research
3. **Create user stories** following INVEST criteria
4. **Define acceptance criteria** that are specific and testable
5. **Include technical requirements** addressing scalability, security, integration

## PHASE 3: RESEARCH SYNTHESIS
Synthesize relevant research into actionable insights:

1. **Identify applicable research areas** based on product requirements
2. **Extract relevant insights** from each applicable research file  
3. **Synthesize insights** into cohesive recommendations
4. **Create research-to-implementation mapping** showing how insights apply

## PHASE 3.5: TECHNICAL ARCHITECTURE SPECIFICATION
Generate detailed technical specifications using software-architect agent:

<architectural_specification_prompt>
  <context>
    <product_requirements>$PRD_CONTENT</product_requirements>
    <research_synthesis>$RESEARCH_SYNTHESIS</research_synthesis>
    <target_frameworks>
      <primary>TypeScript + React Native + Expo SDK 52+ + Legend State v3</primary>
      <secondary>Jest + React Native Testing Library + ESLint + Prettier</secondary>
      <architecture>Vertical slice organization with feature-driven development</architecture>
    </target_frameworks>
  </context>
  
  <task>
    <objective>Create comprehensive technical architecture specifications that bridge research insights to concrete implementation guidance</objective>
    <deliverables>
      <folder_structures>Exact folder hierarchies with /src/features/[feature]/components/, /src/shared/hooks/, etc.</folder_structures>
      <file_naming>Comprehensive naming conventions for components, hooks, services, types, utils</file_naming>
      <component_boundaries>Clear separation of responsibilities between screen, feature, and shared components</component_boundaries>
      <integration_patterns>Specific patterns for Legend State v3, MMKV persistence, service layer design</integration_patterns>
      <testing_strategies>Detailed test organization, coverage requirements, performance validation</testing_strategies>
      <build_configuration>Expo configuration, dependency management, deployment pipeline</build_configuration>
    </deliverables>
  </task>
  
  <specifications_required>
    <system_architecture>
      - Architecture pattern selection with rationale
      - Technology stack confirmation with integration strategy
      - Scalability and performance design considerations
      - Component communication and data flow patterns
    </system_architecture>
    
    <project_organization>
      - Complete folder structure following vertical slice principles
      - File naming conventions for all asset types
      - Module organization and barrel export strategies
      - Cross-cutting concern management
    </project_organization>
    
    <implementation_patterns>
      - State management integration with Legend State v3
      - Service layer architecture and dependency injection
      - Component composition and reusability patterns
      - Error handling and validation strategies
    </implementation_patterns>
    
    <quality_standards>
      - Testing architecture with unit, integration, and E2E strategies
      - Performance optimization patterns for React Native
      - Code quality standards and automated enforcement
      - Security patterns and best practices
    </quality_standards>
    
    <development_workflow>
      - Build and deployment configuration
      - Development environment setup
      - Quality gates and validation checkpoints
      - Continuous integration and delivery pipeline
    </development_workflow>
  </specifications_required>
  
  <output_format>
    Provide detailed specifications for Section 3: Technical Architecture Specifications following the structure defined in the PRP template. Include concrete examples, code snippets, and specific file paths. Ensure every user story can be implemented with clear architectural guidance.
  </output_format>
</architectural_specification_prompt>

## PHASE 4: AI AGENT RUNBOOK CREATION
Transform synthesis and architecture into structured AI agent runbook:

1. **Apply runbook best practices** from ai-agent-runbooks research
2. **Integrate architectural specifications** into implementation guidance
3. **Create structured task models** with clear dependencies and technical constraints
4. **Design decision trees** for common scenarios and edge cases
5. **Define escalation procedures** and human intervention points
6. **Include error handling** and self-healing mechanisms
7. **Establish communication protocols** for coordination
8. **Embed concrete implementation patterns** from architectural specifications

## PHASE 5: QUALITY VALIDATION
Validate completeness and quality:

1. **Check PRD** against modern standards and completeness criteria
2. **Verify research integration** accuracy and relevance
3. **Validate architectural specifications** completeness and clarity
4. **Confirm technical guidance** provides concrete implementation direction
5. **Validate runbook** actionability for AI agent execution with architectural context
6. **Verify story implementability** with provided architectural guidance
7. **Confirm** all necessary context is embedded for self-contained operation
8. **Provide improvement recommendations** for iteration

## PHASE 6: FILE OUTPUT
Save the generated PRP:

1. **Determine appropriate filename** based on product concept (e.g., prp-[product-name].md)
2. **Choose save location** - prioritize existing project folders or create in docs/ or projects/ directory
3. **Use Write tool** to save the complete PRP content to the chosen file location
4. **Confirm successful save** and provide file path to user

## PHASE 7: EPIC BREAKDOWN
Organize PRP into implementation structure:

1. **Execute /break-prp-into-epics command** with saved PRP file path and appropriate output folder
2. **Verify epic organization** aligns with product delivery strategy
3. **Ensure implementation files** are properly generated with research and architectural context
4. **Provide overview** of created epic structure and next steps

Create a comprehensive, self-contained PRP that enables AI agents to successfully implement the product using research-backed best practices and structured guidance.