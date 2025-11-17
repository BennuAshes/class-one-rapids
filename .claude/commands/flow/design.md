---
description: "Generate a comprehensive Technical Design Document from a Product Requirements Document"
argument-hint: "<prd-file-path> (provide via stdin or as first line of input)"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob, Task"
---

# Technical Design Document Generator

## Input Processing & Validation

**IMPORTANT**: Due to slash command argument handling, this command receives the PRD file path through **stdin** (piped input), similar to `/flow:prd`.

The workflow script will pipe the PRD file path as: `echo "$PRD_FILE_PATH" | claude /flow:design`

### Step 1: Extract PRD File Path from Input

The PRD file path will be provided as the first line of stdin input.

**Process**:

1. Read the input to get the PRD file path
2. Validate the file path is not empty
3. Check if file exists
4. Load PRD contents using Read tool

---

## 📚 MANDATORY ARCHITECTURE GUIDES

**Consult these guides while creating the Technical Design Document**:

1. **Lean Development Principles**: @docs/architecture/lean-task-generation-guide.md

   - Focus on user-visible features in implementation plan
   - Just-in-time infrastructure approach
   - Avoid over-engineering

2. **File Organization**: @docs/architecture/file-organization-patterns.md

   - Component structure and module organization
   - Co-located tests (NO `__tests__` folders)
   - NO barrel exports (index.ts files)

3. **Working Directory Context**: @docs/architecture/working-directory-context.md

   - Understand project structure and paths
   - Directory organization conventions

4. **State Management**: @docs/architecture/state-management-hooks-guide.md

   - Hook-based architecture patterns
   - **Behavior-Based Hook Naming**: See §🧭 Hook Decision Tree & Behavior-Based Naming
   - **When to use useState vs custom hooks vs Legend-State stores**
   - **Hook naming focuses on BEHAVIOR not entity**: `usePersistedCounter` not `usePet`
   - Fine-grained reactivity patterns
   - **Effect hooks**: See §🔄 Advanced Hook Patterns - Effect Hooks Pattern (lines 759-830)

5. **Legend-State Implementation**: @docs/research/expo_legend_state_v3_guide_20250917_225656.md

   - Legend-State v3 patterns for data model design
   - Observable primitives and persistence

6. **React Native Testing**: @docs/research/react_native_testing_library_guide_20250918_184418.md
   - Testing best practices for TDD strategy
   - Query priorities and async handling

7. **React Native UI Guidelines**: @docs/architecture/react-native-ui-guidelines.md
   - Safe area handling (avoid deprecated SafeAreaView)
   - Component selection patterns (Pressable vs TouchableOpacity)
   - Accessibility requirements (44pt touch targets, WCAG)
   - Platform-specific considerations

---

**Error Handling**:

- If no path provided in stdin:

  - STOP execution immediately
  - Output: "ERROR: PRD file path required. Usage: echo '/path/to/prd.md' | claude /flow:design"
  - DO NOT create any output files
  - EXIT

- If file does not exist:

  - STOP execution immediately
  - Output: "ERROR: PRD file not found at: {path}"
  - DO NOT create any output files
  - EXIT

- If file is empty or invalid:
  - STOP execution immediately
  - Output: "ERROR: PRD file is empty or invalid"
  - DO NOT create any output files
  - EXIT

### Step 2: Load and Validate PRD Contents

ONLY proceed if validation passes:

1. Use Read tool to load PRD file contents
2. Verify PRD contains required sections (Problem Statement, Requirements, etc.)
3. Extract key information for TDD generation

**CRITICAL**: Never save error messages as TDD output. If ANY step fails, report the error clearly and exit without creating files.

Generate a comprehensive Technical Design Document based on the PRD.

## Phase 0: Validate PRD Against Original Feature Request (MANDATORY)

**CRITICAL**: Before doing ANY work, validate that the PRD scope matches the original user request.

### Step 0: Scope Validation

1. **Read the Original Feature File**: Use Read tool to load the original feature description file (same directory as PRD, typically named `feature-*.md`)
2. **Extract Original Request**: Identify exactly what the user asked for
3. **Compare PRD Scope to Original**:
   - List all features in PRD MVP scope
   - Check if each feature was mentioned in original request
   - Flag any features NOT in original request
4. **Scope Creep Check**:
   - ❌ If PRD added screens not in original request → STOP and report
   - ❌ If PRD added navigation not in original request → STOP and report
   - ❌ If PRD added systems (authentication, notifications, etc.) not in original request → STOP and report
   - ✅ If PRD only contains requested features + platform minimums → PROCEED

5. **Explicit Exclusion Check** (NEW - CRITICAL):
   - **Read original feature description** and search for exclusion keywords:
     - "don't", "not yet", "skip", "without", "except", "avoid", "no need for"
   - **Extract all explicitly excluded items** from original request
   - **Check PRD MVP/P0 features** against exclusion list:
     - ❌ If PRD includes ANY explicitly excluded item → STOP and report
     - Example: Original says "Don't create items yet" but PRD MVP includes "5 item definitions" → STOP
   - **Quote the exclusion** in error message for clarity

   **Exclusion Detection Example**:
   ```
   Original: "Create a todo list screen. Don't create any items yet."
   Excluded items: ["item definitions", "specific items"]
   PRD MVP includes: "Define 5 initial todo items with titles"
   Result: STOP - "ERROR: PRD includes excluded feature 'item definitions'.
           Original request explicitly said: 'Don't create any items yet'"
   ```

6. **Architecture Creep Check**:
   - ❌ If original request is single-component, but PRD adds multi-screen architecture → STOP
   - ❌ If PRD adds "wrapper screens" not mentioned in original → STOP
   - ❌ If PRD adds navigation scaffolding for single component → STOP
   - ✅ If PRD scope exactly matches original request scope → PROCEED

**IF SCOPE CREEP DETECTED**:
- Output: "ERROR: PRD contains unrequested features. Original request: [summary]. PRD added: [list of extra features]. Please revise PRD to match original scope."
- DO NOT proceed with TDD generation
- EXIT

**ONLY IF VALIDATION PASSES**: Proceed to Phase 1.

## Phase 1: Codebase Exploration (MANDATORY)

**CRITICAL**: Before analyzing the PRD, explore the existing codebase to understand current implementations and integration points. This exploration will be documented in the TDD as Section 2.

### Step 1: Extract Components from PRD

Read the PRD to identify all components, screens, hooks, stores, and features mentioned:
- UI Components (buttons, screens, cards, etc.)
- State management (stores, hooks)
- Services and utilities
- Integration points

### Step 2: Launch Explore Subagent

Use the Task tool to launch an Explore subagent for comprehensive codebase analysis:

```typescript
Task({
  subagent_type: "Explore",
  description: "Explore codebase for PRD components",
  model: "haiku", // Fast and cost-effective for search tasks
  prompt: `
I need to explore the codebase before generating the Technical Design Document.

**PRD FILE**: Already read (analysis in context above)

**MISSION**: For EVERY component, screen, hook, store, or feature mentioned in the PRD:
1. Search for existing implementations
2. Identify integration points
3. Determine UPDATE vs CREATE decisions
4. Document exact property names from stores

**THOROUGHNESS**: very thorough

**SEARCH METHODOLOGY**:

For each component/screen mentioned (e.g., TodoListScreen, TodoCard):
1. Global search: Glob **/*{ComponentName}*.{ts,tsx}
2. Search variations: Glob **/*{component-name}*.{ts,tsx}
3. If found: Read file to understand current implementation
4. Check integration: Read App.tsx (or app/_layout.tsx for Expo Router)
5. Find imports: Grep "import.*{ComponentName}"

For stores mentioned:
1. Find all stores: Glob **/*.store.ts
2. Read each store file
3. Document EXACT property names (e.g., "items" not "itemList")
4. List observable properties with types

For hooks mentioned:
1. Global search: Glob **/*use{HookName}*.{ts,tsx}
2. Read existing hooks to understand patterns
3. Identify if UPDATE or CREATE new hook

**RETURN FORMAT** (use this exact structure):

## EXPLORATION RESULTS

### Existing Components
- **ComponentName**:
  - Path: modules/path/to/Component.tsx
  - Current state: [empty/partial/complete]
  - Purpose: [what it currently does]
  - Integration: [where it's used/imported]

OR

- **ComponentName**: NOT FOUND

### Existing Hooks
- **useHookName**:
  - Path: modules/path/to/useHook.ts
  - Purpose: [what it does]

### Store Properties (EXACT NAMES)
- **storeName.store.ts** (path):
  - property1: Observable<Type> (line X)
  - property2: Observable<Type> (line Y)

### Integration Points
- **App.tsx** (or app/_layout.tsx):
  - Imports: [list what's imported]
  - Navigation: [describe navigation structure]
  - Current screens: [list active screens]

### Architecture Decisions
For EACH component/feature in PRD, provide:

**Component: ComponentName**
- ✅ FOUND at: path/to/existing.tsx
  - DECISION: UPDATE existing file
  - RATIONALE: [module owns this responsibility, already integrated]

OR

- ❌ NOT FOUND
  - DECISION: CREATE at: path/to/new.tsx
  - RATIONALE: [new feature, belongs in X module because...]

**Store Property Validation**:
- todoStore.items ✅ (verified in store.ts line X)

## CRITICAL QUESTIONS ANSWERED
- Are there duplicate/similar components that would conflict?
- Which module owns which functionality?
- Will new components be accessible to users (wired to navigation)?
- What are the exact property names in existing stores?
`
})
```

### Step 3: Document Exploration Results

The Explore subagent will return structured exploration results. These results MUST be included in the TDD as Section 2 "Codebase Exploration & Integration Analysis" so that tasks.md and execute-task.md can reference them.

**CRITICAL**: Do NOT proceed with TDD generation until exploration is complete and results are ready to embed.

## Phase 2: PRD Analysis

Analyze the PRD to extract:

1. **Core Requirements**: Functional and non-functional requirements
2. **User Stories**: Understanding the user flows and acceptance criteria
3. **Success Metrics**: Performance targets and KPIs
4. **Scope Definition**: MVP features vs future enhancements
5. **Dependencies & Risks**: Technical constraints and mitigation needs

## Phase 2: Technical Solution Design

Based on the PRD analysis, design the technical solution covering:

### Architecture Decisions

- Choose appropriate architectural patterns (monolithic, microservices, serverless)
- Define system boundaries and component responsibilities
- Select technology stack based on requirements
- Design for scalability, reliability, and maintainability

### Implementation Strategy

- Break down features into technical components
- Define interfaces and contracts between components
- Plan data flow and state management
- Design error handling and recovery mechanisms

## Phase 3: TDD Generation

Generate a comprehensive Technical Design Document with these sections:

### Document Structure

```markdown
# [Feature Name] Technical Design Document

## Document Control

| Version | Author      | Date   | Status | Changes              |
| ------- | ----------- | ------ | ------ | -------------------- |
| v1.0    | [Generated] | [Date] | Draft  | Initial TDD from PRD |

## Executive Summary

[2-3 sentence technical overview linking to PRD goals]

## 1. Overview & Context

### Problem Statement

[Extract from PRD with technical perspective]

### Solution Approach

[High-level technical approach to solve the problem]

### Success Criteria

[Technical metrics aligned with PRD business metrics]

## 2. Codebase Exploration & Integration Analysis

**CRITICAL**: This section contains the authoritative exploration results from Phase 1. All implementation decisions (UPDATE vs CREATE) are documented here for reference by task generation and execution phases.

### Existing Components

[From Explore subagent - list all found components with paths and current state]

- **ComponentName**:
  - Path: `modules/path/to/Component.tsx`
  - Current state: [empty/partial/complete]
  - Purpose: [what it currently does]
  - Integration: [where it's used/imported]

### Existing Hooks

[From Explore subagent - list all found hooks]

- **useHookName**:
  - Path: `modules/path/to/useHook.ts`
  - Purpose: [what it does]
  - Used by: [which components]

### Store Properties (Verified)

[From Explore subagent - EXACT property names from store files]

- **storeName.store.ts** (`modules/path/to/store.ts`):
  - `propertyName`: Observable<Type> (line X)
  - `anotherProperty`: Observable<Type> (line Y)

### Integration Points

[From Explore subagent - navigation and app structure]

- **App.tsx** (or `app/_layout.tsx`):
  - Current imports: [list]
  - Navigation structure: [describe]
  - Active screens: [list]

### Architecture Decisions (UPDATE vs CREATE)

[From Explore subagent - authoritative decisions for each component]

**Component: ComponentName**
- ✅ **DECISION: UPDATE** existing file at `modules/path/to/Component.tsx`
  - RATIONALE: [module owns this responsibility, already integrated]

OR

- ❌ **DECISION: CREATE** new file at `modules/path/to/NewComponent.tsx`
  - RATIONALE: [new feature, belongs in X module because...]

### Integration Validation

- Are there duplicate/similar components? [Yes/No + details]
- Module ownership clarity: [which modules own which features]
- Navigation accessibility: [how new features will be accessed by users]

## 3. Requirements Analysis

### Functional Requirements

[Map PRD user stories to technical capabilities]

### Non-Functional Requirements

- Performance: [Specific benchmarks from PRD]
- Scalability: [User/data volume projections]
- Security: [Authentication, authorization, data protection]
- Availability: [Uptime requirements]
- Compliance: [Regulatory requirements if any]

## 4. System Architecture

### High-Level Architecture

[Architecture diagram showing major components]

- Component breakdown
- Service boundaries
- External dependencies

### Component Design

#### [Component Name]

- **Purpose**: [What it does]
- **Responsibilities**: [Core functions]
- **Interfaces**: [APIs/contracts]
- **Dependencies**: [What it needs]

### Data Flow

[Sequence diagrams for critical user flows from PRD]

## 5. API Design

### Internal APIs

| Endpoint        | Method       | Purpose   | Request  | Response |
| --------------- | ------------ | --------- | -------- | -------- |
| /api/[resource] | GET/POST/etc | [Purpose] | [Schema] | [Schema] |

### External Integrations

[Any third-party services or APIs]

## 6. Data Model

### Entity Design
```

[Entity Name]

- field1: type (constraints)
- field2: type (constraints)
- relationships

````

### Database Schema
- Tables/Collections structure
- Indexes for performance
- Data validation rules
- Migration strategy

### Data Access Patterns
- Common queries
- Caching strategy
- Data consistency approach

## 7. Security Design
### Authentication & Authorization
- Authentication method: [OAuth, JWT, etc.]
- Authorization model: [RBAC, ABAC, etc.]
- Session management

### Data Security
- Encryption at rest: [Method]
- Encryption in transit: [TLS/HTTPS]
- PII handling: [Approach]
- Audit logging: [What's logged]

### Security Controls
- Input validation
- Rate limiting
- CORS policies
- Security headers

## 8. Test-Driven Development (TDD) Strategy
### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- Framework: React Native Testing Library
- Reference: @docs/research/react_native_testing_library_guide_20250918_184418.md
- Test Runner: Jest with React Native preset
- Mocking: MSW for API mocking, Jest mocks for modules

#### TDD Implementation Process
For each feature/component, follow this strict order:

1. **RED Phase - Write Failing Test First**
   ```typescript
   // Example: Test for a new feature requirement
   test('should display user name in header', () => {
     render(<Header user={mockUser} />);
     expect(screen.getByText('John Doe')).toBeTruthy();
   });
   // This test MUST fail initially
````

2. **GREEN Phase - Minimal Implementation**

   - Write ONLY enough code to pass the test
   - No extra features or optimizations
   - Focus on making test green

3. **REFACTOR Phase - Improve Code**
   - Clean up implementation
   - Extract components/functions
   - Maintain all green tests

#### Test Categories (in order of implementation)

### App-Level Integration Testing (TDD Zero Layer - MANDATORY FIRST)

**CRITICAL**: Before implementing any feature components, write integration tests at the App.tsx level that validate the complete user journey including navigation and screen transitions.

#### Why App-Level Tests First?
- Catches missing imports/modules immediately (prevents "Unable to resolve" errors)
- Validates navigation integration works end-to-end
- Ensures all screens are actually accessible to users
- Tests fail until ALL required components exist (prevents orphaned features)

#### Required App-Level Integration Tests

```typescript
// App.test.tsx - Write these BEFORE implementing feature screens

describe('App Navigation Integration', () => {
  test('renders default screen without import errors', () => {
    // This test FAILS if any imported screen module doesn't exist
    const { getByText } = render(<App />);
    expect(getByText(/count/i)).toBeTruthy(); // Or whatever default screen shows
  });

  test('can navigate to todo list screen', () => {
    const { getByText } = render(<App />);

    // This test FAILS if TodoListScreen doesn't exist or isn't imported
    const todoButton = getByText(/todo/i);
    fireEvent.press(todoButton);

    // Verify todo list screen is displayed
    expect(getByText(/todo list/i)).toBeTruthy();
  });

  test('can navigate back to main screen', () => {
    const { getByText } = render(<App />);

    // Navigate to todo list
    fireEvent.press(getByText(/todo/i));

    // Navigate back to main
    const mainButton = getByText(/main/i);
    fireEvent.press(mainButton);

    // Verify main screen is displayed
    expect(getByText(/home/i)).toBeTruthy();
  });

  test('all navigation targets are importable', () => {
    // This test fails at import time if modules are missing
    expect(() => render(<App />)).not.toThrow();
  });
});
```

#### App Integration Test Checklist (MUST COMPLETE FIRST)

- [ ] App.test.tsx created with navigation tests
- [ ] Tests verify all screens referenced in App.tsx can be imported
- [ ] Tests validate user can navigate to each screen
- [ ] Tests verify navigation state persists correctly
- [ ] All App-level tests are FAILING (RED phase) before implementation
- [ ] Create skeleton components to make import tests pass
- [ ] Then implement features to make behavior tests pass

**Test Execution Order**:
1. **App-Level Integration Tests** (validates imports & navigation) ← START HERE
2. Unit Tests (individual screen components)
3. Component Integration Tests (parent-child data flow)
4. E2E Tests (complete user workflows)

### Unit Testing (TDD First Layer)

- **Render Tests**: Component displays correctly
- **Interaction Tests**: User actions work properly
- **State Tests**: Data changes trigger correct updates
- Coverage target: > 80% for new code
- Testing approach: Test behavior, not implementation

### Component Integration Testing (TDD Second Layer)

- **Component Integration**: Parent-child data flow
- **API Integration**: MSW mock handlers
- **State Management**: Global state updates
- **Hook Integration**: Hooks working with components

### End-to-End Testing (TDD Third Layer)

- **User Flows**: Complete feature workflows
- **Cross-Feature Integration**: Feature interactions
- **Performance Benchmarks**: Response time requirements

### TDD Checklist for Each Component

- [ ] First test written before any implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary
- [ ] Tests query by user-visible content
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before next feature

## 9. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification          |
| --------- | ------------- | ---------------------- |
| Compute   | [CPU/Memory]  | [Why needed]           |
| Storage   | [Type/Size]   | [Data requirements]    |
| Network   | [Bandwidth]   | [Traffic expectations] |

### Deployment Architecture

- Environment strategy: [Dev/Staging/Prod]
- Container strategy: [Docker/K8s if applicable]
- CI/CD pipeline design
- Blue-green deployment approach

### Monitoring & Observability

#### Metrics

- Application metrics: [Key metrics]
- Business metrics: [Aligned with PRD]
- Infrastructure metrics: [Resource utilization]

#### Logging

- Log levels and categories
- Centralized logging strategy
- Log retention policy

#### Alerting

| Alert        | Condition | Priority | Action     |
| ------------ | --------- | -------- | ---------- |
| [Alert name] | [Trigger] | P0/P1/P2 | [Response] |

## 10. Scalability & Performance

### Performance Requirements

[Extract from PRD and define technical targets]

- Response time: [<Xms for Y percentile]
- Throughput: [X requests/second]
- Concurrent users: [X users]

### Scalability Strategy

- Horizontal scaling approach
- Load balancing strategy
- Database scaling (read replicas, sharding)
- Caching layers (Redis, CDN)

### Performance Optimization

- Query optimization
- Asset optimization
- Code-level optimizations
- Resource pooling

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk                             | Impact       | Probability  | Mitigation | Owner  |
| -------------------------------- | ------------ | ------------ | ---------- | ------ |
| [From PRD + new technical risks] | High/Med/Low | High/Med/Low | [Strategy] | [Team] |

### Dependencies

[Map PRD dependencies to technical components]

## 12. Implementation Plan (TDD-Driven)

### Development Phases

Following @docs/architecture/lean-task-generation-guide.md principles - prioritize user-visible functionality:

#### Phase 1: Foundation & Test Setup [X weeks]

- Set up testing infrastructure (Jest, React Native Testing Library)
- Configure MSW for API mocking
- Create test utilities and custom renderers
- Set up CI/CD with test automation
- Core data models with tests first

#### Phase 2: TDD Feature Implementation [X weeks]

[Map to PRD MVP features - each with TDD cycle]

**CRITICAL FIRST STEP: App-Level Integration Tests**

Before implementing ANY feature screens, follow this strict order:

**Step 0: App Integration Test Setup (MANDATORY)**
1. Create `App.test.tsx` if it doesn't exist
2. Write failing tests for ALL navigation paths mentioned in PRD
3. Write tests that verify all screen imports resolve
4. Run tests - they MUST fail (RED phase)
5. Create skeleton/stub components for all screens to make import tests pass
6. Navigation behavior tests still fail - ready for feature implementation

Example App Integration Tests:
```typescript
// App.test.tsx - WRITE FIRST, BEFORE ANY FEATURE IMPLEMENTATION

describe('App Navigation Integration', () => {
  test('renders without import errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('displays main screen by default', () => {
    const { getByText } = render(<App />);
    expect(getByText(/todo/i)).toBeTruthy();
  });

  test('can navigate to settings screen', () => {
    const { getByText } = render(<App />);
    fireEvent.press(getByText(/settings/i));
    expect(getByText(/settings/i)).toBeTruthy();
  });
});
```

**For Each Feature (After App Tests Are Written):**

1. **Step 1: App Integration Tests (MUST BE FIRST)**

   - Write App.test.tsx tests for this feature's navigation
   - Write tests for screen transitions involving this feature
   - Verify tests FAIL (screens don't exist yet or are stubs)
   - Create skeleton component to pass import tests

2. **Step 2: Component Test Planning**

   - Break down feature into testable behaviors
   - Write all failing component tests for feature
   - Review tests against requirements

3. **Step 3: Implementation**

   - Implement code to pass each test
   - Follow Red-Green-Refactor for each behavior
   - Keep all previous tests green (including App tests!)

4. **Step 4: Integration Validation**
   - Verify App.test.tsx navigation tests now pass
   - Run full test suite (App + Component + Integration)
   - Ensure end-to-end flow works

Example Feature Breakdown:

- **[Feature 1]**: Todo List Screen
  - **App Test 1**: Can navigate to todo list (WRITE FIRST)
  - **App Test 2**: Can navigate back to main (WRITE FIRST)
  - Component Test 1: Todo list screen renders items
  - Component Test 2: Selecting item shows details
  - Component Test 3: Complete button works correctly
  - Integration Test 1: Completing item updates global state

#### Phase 3: Enhancement with TDD [X weeks]

[Map to PRD nice-to-have features]

- Write tests for enhanced features first
- Implement improvements test-by-test
- Performance optimization with benchmark tests

#### Phase 4: Hardening [X weeks]

- Security testing suite
- Performance test suite
- Documentation of all test scenarios
- Coverage report review (must be >80%)

### Technical Milestones

| Milestone | Deliverable             | Date   | Dependencies    |
| --------- | ----------------------- | ------ | --------------- |
| M1        | [Technical deliverable] | [Date] | [What's needed] |

## 13. Decision Log

### Architecture Decisions

| Decision    | Options Considered | Choice   | Rationale |
| ----------- | ------------------ | -------- | --------- |
| [Database]  | [SQL, NoSQL, etc]  | [Choice] | [Why]     |
| [Framework] | [Options]          | [Choice] | [Why]     |

### Trade-offs

- [Trade-off 1]: Chose [X] over [Y] because [reason]
- [Trade-off 2]: Accepted [limitation] for [benefit]

## 14. Open Questions

Technical questions requiring resolution:

- [ ] [Technical question from PRD analysis]
- [ ] [Architecture decision pending]
- [ ] [Integration clarification needed]

## 15. Appendices

### A. Technical Glossary

[Define technical terms used]

### B. Reference Architecture

[Links to similar systems or patterns]

### C. Proof of Concepts

[Any POCs or prototypes created]

### D. Related Documents

- Product Requirements Document: [Link to source PRD]
- Architecture Decision Records: [Links]
- API Documentation: [Links]

---

_Generated from PRD: [filename]_
_Generation Date: [timestamp]_

```

## Generation Requirements

The TDD must:
1. **Directly address all PRD requirements** with technical solutions
2. **Include specific technologies** not vague descriptions
3. **Define measurable performance criteria** aligned with PRD metrics
4. **Provide implementation-ready details** for developers
5. **Include realistic timelines** based on technical complexity
6. **Address all risks** from PRD plus new technical risks
7. **Follow best practices** from the research guide

## Quality Markers

✅ **GOOD**: "Use PostgreSQL 14+ with JSONB columns for flexible schema, indexed on user_id and created_at"
❌ **BAD**: "Use a database for data storage"

✅ **GOOD**: "Implement JWT tokens with 15-minute expiry, refresh tokens in Redis with 7-day TTL"
❌ **BAD**: "Implement secure authentication"

✅ **GOOD**: "Deploy using Kubernetes with 3 replicas, HPA scaling 2-10 pods based on 70% CPU"
❌ **BAD**: "Ensure the system is scalable"

## Implementation Steps

1. **Read the PRD** at the specified path
2. **Extract key information** including requirements, user stories, metrics, and scope
3. **Design technical solution** addressing each PRD requirement
4. **Generate comprehensive TDD** following the template
5. **Include realistic details** for immediate implementation
6. **Save the document** with proper naming and location

## Output

Save the generated TDD to:
- Filename: `tdd_[feature_name_snake_case]_[YYYYMMDD].md`
- Location: Same directory as the source PRD file
- Include generation timestamp and source PRD reference

The TDD should enable the development team to immediately begin implementation with clear technical direction and architectural decisions already made.
```
