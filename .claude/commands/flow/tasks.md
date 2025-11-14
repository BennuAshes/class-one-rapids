---
description: "Generate explicit, agent-executable task list from Technical Design Document"
argument-hint: "<tdd-file-path> (provide via stdin or as first line of input)"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob, Task"
---

# Agent Task List Generator

### Step 1: Extract TDD File Path from Input

The TDD file path is $ARGUMENTS

**Process**:

1. Read the input to get the TDD file path
2. Validate the file path is not empty
3. Check if file exists
4. Load TDD contents using Read tool

---

## 📚 MANDATORY ARCHITECTURE GUIDES

**Consult these guides while generating the task list**:

1. **Lean Development Principles**: @docs/architecture/lean-task-generation-guide.md

   - **CRITICAL**: First task MUST deliver user-visible functionality
   - No infrastructure-only tasks
   - Just-in-time file/folder creation
   - Each task independently demo-able

2. **File Organization**: @docs/architecture/file-organization-patterns.md

   - Feature-based module organization
   - Co-located tests (NO `__tests__` folders)
   - NO barrel exports (index.ts files)
   - File structure patterns for different feature sizes

3. **Working Directory Context**: @docs/architecture/working-directory-context.md

   - You are in `c:\dev\class-one-rapids\frontend\`
   - NEVER create `frontend/frontend/` nested structures
   - Path and directory conventions

4. **State Management**: @docs/architecture/state-management-hooks-guide.md

   - Hook-based architecture (NO service classes for state)
   - **Behavior-Based Hook Naming**: See §🧭 Hook Decision Tree & Behavior-Based Naming
   - **When to use useState vs custom hooks vs Legend-State stores**
   - **Name hooks after BEHAVIOR**: `useFilteredList`, `usePersistedCounter`, `useDebounced`
   - Fine-grained reactivity patterns
   - **Effect hooks**: See §🔄 Advanced Hook Patterns - Effect Hooks Pattern (lines 759-830)

5. **Expo App Organization**: @docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md

   - Feature-based architecture details
   - Expo Router integration
   - Module boundaries

6. **React Native Testing**: @docs/research/react_native_testing_library_guide_20250918_184418.md
   - TDD best practices
   - Testing Library query priorities
   - Async handling patterns

---

**Error Handling**:

- If no path provided in stdin:

  - STOP execution immediately
  - Output: "ERROR: TDD file path required. Usage: echo '/path/to/tdd.md' | claude /flow:tasks"
  - DO NOT create any output files
  - EXIT

- If file does not exist:

  - STOP execution immediately
  - Output: "ERROR: TDD file not found at: {path}"
  - DO NOT create any output files
  - EXIT

- If file is empty or invalid:
  - STOP execution immediately
  - Output: "ERROR: TDD file is empty or invalid"
  - DO NOT create any output files
  - EXIT

### Step 2: Load and Validate TDD Contents

ONLY proceed if validation passes:

1. Use Read tool to load TDD file contents
2. Verify TDD contains required sections (Architecture, Implementation Plan, etc.)
3. Extract key information for task generation

**CRITICAL**: Never save error messages as task list output. If ANY step fails, report the error clearly and exit without creating files.

Generate a comprehensive, executable task list based on the TDD.

**IMPORTANT**: Follow @docs/architecture/lean-task-generation-guide.md principles throughout - focus on user-visible functionality, not infrastructure.

## Phase 1: Check Existing Implementations & Architecture

### File Structure Reference

**Consult**: @docs/architecture/file-organization-patterns.md for complete folder structure patterns including:

- Feature module organization (flat for <10 items, organized by type for ≥10)
- Co-located test placement (ALWAYS next to implementation files)
- State management file types (stores, hooks, types)
- Shared vs feature-specific organization

### Implementation Check

1. **Scan for existing files according to architecture**:

   ```bash
   # Check feature modules and their tests (co-located)
   ls -la src/modules/*/*.ts 2>/dev/null
   ls -la src/modules/*/*.tsx 2>/dev/null
   ls -la src/modules/*/*.test.ts 2>/dev/null
   ls -la src/modules/*/*.test.tsx 2>/dev/null

   # Check shared resources and their tests
   ls -la src/shared/components/*.tsx 2>/dev/null
   ls -la src/shared/components/*.test.tsx 2>/dev/null
   ls -la src/shared/services/*.ts 2>/dev/null
   ls -la src/shared/services/*.test.ts 2>/dev/null

   # Check app routes
   ls -la src/app/*.tsx 2>/dev/null
   ```

2. **Mark task status in the generated list**:
   - **[COMPLETED]**: Task fully implemented with tests
   - **[PARTIAL]**: Task partially implemented, specify what's missing
   - **No prefix**: Task not started

## Phase 2: TDD Analysis

Read and analyze the Technical Design Document to extract:

1. **System Components**: All components that need implementation
2. **Development Phases**: Timeline and milestone breakdown
3. **Technical Requirements**: APIs, data models, infrastructure needs
4. **Testing Requirements**: Component testing needs
5. **Deployment Tasks**: CI/CD, monitoring, operational requirements
6. **Dependencies**: Order of implementation and blockers

## Phase 3: Task Decomposition

Transform TDD elements into explicit, actionable tasks following these principles (aligned with @docs/architecture/lean-task-generation-guide.md):

### Task Clarity Standards (from LLM Task Description Guide)

- **Specific**: Each task has one clear objective
- **Measurable**: Clear acceptance criteria and definition of done
- **Actionable**: Start with action verbs (Create, Implement, Configure, Test)
- **Relevant**: Directly tied to TDD requirements

### Task Structure Template

Each task should follow the COSTAR framework:

- **Context**: Background from TDD
- **Objective**: What needs to be accomplished
- **Style**: Technical approach or methodology
- **Tone**: Professional, technical
- **Audience**: Development team
- **Response**: Expected deliverable

## Phase 4: Task List Generation

Generate the task list with this structure:

```markdown
# [Project Name] Implementation Tasks

## Document Metadata

- **Source TDD**: [filename]
- **Generated**: [timestamp]
- **Total Tasks**: [count]

## Phase 1: First User-Visible Feature (Per @docs/architecture/lean-task-generation-guide.md)

_Duration: [X] days | Priority: P0 | Prerequisites: None_

**LEAN PRINCIPLE**: First task MUST deliver working functionality a user can interact with. NO infrastructure-only tasks.

### Task 1.1: [STATUS] Implement Simplest Working Feature

**ROLE**: You are a senior developer implementing the first user-visible feature

**CONTEXT**: Based on the TDD architecture requirements at [TDD section reference]

**OBJECTIVE**: Create and configure the project repository with proper structure

**REQUIREMENTS**:

- Initialize Git repository with main branch protection
- Create directory structure following feature-based architecture:
```

src/
├── app/ # Expo Router pages only
├── modules/ # Feature modules
├── shared/ # Cross-cutting concerns
├── assets/ # Static assets
├── constants/ # App constants
└── types/ # Global types

````
Reference: @docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md
- Set up .gitignore for [technology stack from TDD]
- Configure pre-commit hooks for code quality
- Create README.md with architecture overview

**ACCEPTANCE CRITERIA**:
- [ ] Repository created and accessible
- [ ] Directory structure matches TDD specifications
- [ ] All configuration files in place
- [ ] CI/CD hooks configured
- [ ] Documentation initialized

**DELIVERABLES**:
1. Initialized repository
2. Configuration files
3. Basic documentation

**DEPENDENCIES**: None
**TOOLS NEEDED**: Git, [specific tools from TDD]

---

### Task 1.2: [STATUS] Set Up Development Environment
**ROLE**: You are a senior full-stack developer configuring the development environment

**CONTEXT**: Technology stack from TDD includes [list from TDD]

**OBJECTIVE**: Configure local development environment with all required dependencies

**STEP-BY-STEP INSTRUCTIONS**:
1. Install most recent [language/runtime] version
2. Set up package manager ([npm/pip/cargo] from TDD)
3. Install dependencies listed in TDD section [X]
4. Configure environment variables:
 - DATABASE_URL: [specification from TDD]
 - API_KEY: [placeholder for services from TDD]
5. Set up local database ([type from TDD])
6. Verify setup with test connection

**ACCEPTANCE CRITERIA**:
- [ ] All dependencies installed and versions match TDD
- [ ] Environment variables configured
- [ ] Local database running
- [ ] Test connection successful
- [ ] Development server starts without errors

**VALIDATION COMMANDS**:
```bash
# Verify installation
[language] --version  # Should output [version]
[package-manager] list  # Should show all dependencies
[test-command]  # Should pass initial checks
````

**DEPENDENCIES**: Task 1.1
**POTENTIAL BLOCKERS**: System permissions, network access for package downloads

---

## Phase 2: Core Infrastructure

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 1_

### Task 2.1: Implement Database Schema

**ROLE**: You are a database architect implementing the data model

**CONTEXT**: Data model defined in TDD section [X] requires [summary of model]

**OBJECTIVE**: Create database schema with all tables, relationships, and constraints

**TECHNICAL SPECIFICATIONS**:

```sql
-- From TDD Data Model section
CREATE TABLE [table_name] (
    [fields from TDD with types and constraints]
);
-- Include all tables from TDD
```

**IMPLEMENTATION STEPS**:

1. Create migration files for each entity
2. Define primary keys and indexes as per TDD
3. Set up foreign key relationships
4. Add constraints and validations from TDD
5. Create seed data for development
6. Test migrations up and down

**ACCEPTANCE CRITERIA**:

- [ ] All tables from TDD created
- [ ] Relationships match TDD specifications
- [ ] Indexes optimized per TDD performance requirements
- [ ] Migrations are reversible
- [ ] Seed data loads successfully
- [ ] Performance meets TDD benchmarks: [specific metrics]

**TESTING**:

- Tests for database models
- Test data access patterns
- Verify constraints and validations

**DEPENDENCIES**: Task 1.2
**RISKS**: [From TDD risk assessment]

---

### Task 2.2: Implement API Gateway

**ROLE**: You are a backend engineer building RESTful APIs

**CONTEXT**: API specifications from TDD section [X] define [endpoint count] endpoints

**OBJECTIVE**: Implement all API endpoints with proper routing, validation, and error handling

**API SPECIFICATIONS**:
[For each endpoint from TDD]

```
Endpoint: [Method] [Path]
Purpose: [From TDD]
Request Schema: [From TDD]
Response Schema: [From TDD]
Authentication: [From TDD]
Rate Limiting: [From TDD]
```

**IMPLEMENTATION CHECKLIST**:

- [ ] Set up routing framework
- [ ] Implement each endpoint from TDD
- [ ] Add request validation per TDD schemas
- [ ] Implement authentication/authorization from TDD
- [ ] Add rate limiting per TDD requirements
- [ ] Implement error handling with proper HTTP codes
- [ ] Add logging and monitoring hooks
- [ ] Create API documentation

**QUALITY REQUIREMENTS**:

- Response time < [value from TDD] for 95th percentile
- Support [concurrent users from TDD]
- Error rate < [threshold from TDD]
- Test coverage for all API endpoints

**DEPENDENCIES**: Task 2.1
**DELIVERABLES**: Working API, tests, documentation

---

## Phase 3: Business Logic Implementation

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 2_

### Task 3.1: Implement [Component Name from TDD]

**ROLE**: You are a senior developer implementing core business logic

**CONTEXT**: Component design from TDD section [X] specifies [component purpose]

**OBJECTIVE**: Build [component] with all required functionality

**COMPONENT SPECIFICATIONS**:

- **Purpose**: [From TDD]
- **Interfaces**: [From TDD]
- **Dependencies**: [From TDD]
- **Performance Requirements**: [From TDD]

**IMPLEMENTATION GUIDE**:

1. Create component structure following TDD architecture
2. Implement interfaces defined in TDD:
   - [Interface 1]: [Specification]
   - [Interface 2]: [Specification]
3. Add business logic for:
   - [Feature 1 from TDD]
   - [Feature 2 from TDD]
4. Implement error handling per TDD specs
5. Add logging at key decision points
6. Write tests for business logic

**CODE STRUCTURE**: See @docs/architecture/file-organization-patterns.md for complete patterns including:

- Feature module organization (flat vs organized by type)
- Co-located test placement (ALWAYS next to implementation)
- Shared vs feature-specific file locations
- State management file organization (hooks, stores, types)

**SUCCESS METRICS**:

- Passes all test cases from TDD
- Meets performance benchmarks: [specific metrics from TDD]
- Code coverage > [threshold from TDD]
- Zero critical security vulnerabilities

**DEPENDENCIES**: Task 2.2
**COMPLEXITY**: High

---

## Phase 3: Test-Driven Development (TDD) Implementation

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 2_
_CRITICAL: All features must follow Test-Driven Development approach_

### Task 3.1: TDD Implementation for [Component/Feature Name]

**ROLE**: You are a senior developer following strict TDD practices
**ARCHITECTURE**: Follow feature-based organization from @docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md

**CONTEXT**: Component design from TDD section [X] requires implementation using test-first approach

**OBJECTIVE**: Build [component] using Red-Green-Refactor TDD cycle

**FILE LOCATIONS**:

- Feature Module: `src/modules/[feature]/`
- **Tests are co-located**: Always place test files next to the files they test with `.test.ts` or `.test.tsx` extension

For features with < 10 total items (flat structure):

- Component: `src/modules/[feature]/[ComponentName].tsx`
- Component Test: `src/modules/[feature]/[ComponentName].test.tsx`
- Hook: `src/modules/[feature]/use[Feature].ts`
- Hook Test: `src/modules/[feature]/use[Feature].test.ts`
- Service: `src/modules/[feature]/[feature]Service.ts`
- Service Test: `src/modules/[feature]/[feature]Service.test.ts`
- Store: `src/modules/[feature]/[feature]Store.ts`
- Types: `src/modules/[feature]/[feature].types.ts`

For features with ≥ 10 items (organized by type):

- Component: `src/modules/[feature]/components/[ComponentName].tsx`
- Component Test: `src/modules/[feature]/components/[ComponentName].test.tsx`
- Service: `src/modules/[feature]/services/[serviceName].ts`
- Service Test: `src/modules/[feature]/services/[serviceName].test.ts`
- Store: `src/modules/[feature]/stores/[feature]Store.ts`
- Store Test: `src/modules/[feature]/stores/[feature]Store.test.ts`
- Types: `src/modules/[feature]/types/[feature].types.ts`

- Shared UI: `src/shared/components/ui/[ComponentName].tsx`
- Shared UI Test: `src/shared/components/ui/[ComponentName].test.tsx`

**TDD IMPLEMENTATION CYCLE** (Repeat for each requirement):

#### Step 1: RED - Write Failing Test First

```typescript
// Test file co-located with component: [ComponentName].test.tsx
// Using React Native Testing Library guide from @docs/research/react_native_testing_library_guide_20250918_184418.md
import { render, screen, userEvent } from '@testing-library/react-native';
import { [ComponentName] } from './[ComponentName]';  // Import from same directory

describe('[ComponentName]', () => {
  test('should [specific behavior from requirement]', async () => {
    // Write test for ONE specific behavior ONLY
    // Test should FAIL initially (component doesn't exist yet)

    const user = userEvent.setup();
    render(<ComponentName />);

    // Example: Test that a button displays correct text
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });
});
```

#### Step 2: GREEN - Write Minimal Code to Pass

```typescript
// Write ONLY enough code to make the test pass
// No extra features, no optimization yet
export const ComponentName = () => {
  return <Text>Expected Text</Text>;
};
```

#### Step 3: REFACTOR - Improve Code Quality

- Refactor implementation while keeping tests green
- Extract constants, improve naming, remove duplication
- Run tests after each change to ensure nothing breaks

#### Step 4: Add Next Test for Next Behavior

```typescript
test("should [next specific behavior]", async () => {
  // Add test for next requirement
  // This test should fail initially
});
```

**UI/VISUAL SPECIFICATIONS** (when applicable):
Use YAML format for visual requirements:

```yaml
visual_requirements:
  component_name: "[ComponentName]"

  dimensions:
    min_width: "44px" # Accessibility minimum
    min_height: "44px"
    responsive: true

  colors:
    primary: "#FFD700" # Gold/Yellow
    secondary: "#FF0000"
    states:
      hover: "#FFA500"
      active: "#FF8C00"
      disabled: "#808080"

  typography:
    font_family: "System Default"
    font_size: "16px"
    font_weight: "400"
    line_height: "1.5"

  spacing:
    padding: "8px"
    margin: "4px"
    gap: "12px"

  animations:
    type: "pulse"
    duration: "300ms"
    easing: "ease-in-out"
    iterations: "infinite"

  interactions:
    tap_target_size: "44x44px minimum"
    feedback: "haptic + visual"
    response_time: "<100ms"

  accessibility:
    min_contrast_ratio: "4.5:1"
    screen_reader_label: "[descriptive label]"
    focusable: true
    keyboard_navigable: true
```

Or use Markdown table format for simpler requirements:

```markdown
### Visual Requirements

| Property      | Value                         | Notes               |
| ------------- | ----------------------------- | ------------------- |
| **Size**      | 44x44px minimum               | WCAG touch target   |
| **Color**     | Glowing yellow/gold (#FFD700) | High contrast       |
| **Animation** | Pulsing glow                  | 2-3 second duration |
| **Position**  | Random on enemy               | Constrained to body |
| **Feedback**  | Flash on hit                  | 200ms duration      |
| **Opacity**   | 0.8 default, 1.0 on hover     | Smooth transition   |
```

**VISUAL REQUIREMENTS FORMAT GUIDELINES**:

- Use YAML format for complex UI components with multiple states and properties
- Use Markdown tables for simple visual requirements (5 or fewer properties)
- NEVER use pseudo-TypeScript or invalid JSON formats
- Always include accessibility requirements (WCAG compliance)
- Include actual color values (hex/rgb) not just descriptions

**TDD CHECKLIST** (for each feature/component):

- [ ] Write failing test for first requirement
- [ ] Write minimal code to pass test
- [ ] Refactor if needed (keeping test green)
- [ ] Write failing test for second requirement
- [ ] Write code to pass new test (keeping old tests green)
- [ ] Continue until all requirements have tests
- [ ] Final refactor for code quality
- [ ] All tests remain green

**TEST CATEGORIES TO IMPLEMENT** (in order):

1. **Render Tests** (What appears on screen)

   - [ ] Component renders without crashing
   - [ ] Required UI elements are present
   - [ ] Correct initial state/props

2. **User Interaction Tests** (How users interact)

   - [ ] Button presses trigger correct actions
   - [ ] Form inputs update correctly
   - [ ] Navigation works as expected

3. **State Management Tests** (How data changes)

   - [ ] State updates trigger re-renders
   - [ ] Computed values update correctly
   - [ ] Side effects occur when expected

4. **Integration Tests** (How parts work together)

   - [ ] API calls are made correctly
   - [ ] Data flows between components
   - [ ] Context/Redux state updates propagate

5. **Edge Case Tests** (Unusual situations)
   - [ ] Loading states display correctly
   - [ ] Error states handle gracefully
   - [ ] Empty states show appropriate UI

**TESTING TOOLS & PATTERNS**:
Reference: @docs/research/react_native_testing_library_guide_20250918_184418.md

- Use `userEvent` over `fireEvent` for realistic interactions
- Query by user-visible text/labels, not testIds
- Use `waitFor` for async operations
- Mock external dependencies (APIs, navigation)
- Create test utilities for common scenarios

**SUCCESS METRICS**:

- Every feature has test written BEFORE implementation
- Test coverage > 80% for all new code
- All tests pass before moving to next feature
- Tests document expected behavior clearly

**DEPENDENCIES**: Task 2.1, 2.2
**DELIVERABLES**: Fully tested component with TDD history

---

## Phase 4: Component Testing & Integration

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 3_

### Task 4.1: Integration Testing Suite

**ROLE**: You are a QA engineer validating system integration

**CONTEXT**: Components built with TDD need integration testing

**OBJECTIVE**: Verify components work together correctly

**INTEGRATION TEST STRATEGY**:

1. **Component Integration**

   - Test data flow between parent/child components
   - Verify context providers work across component tree
   - Test navigation flows end-to-end

2. **API Integration**

   - Test real API calls (using MSW from testing guide)
   - Verify error handling across layers
   - Test retry logic and timeouts

3. **State Management Integration**
   - Test Redux/Context updates across components
   - Verify side effects trigger correctly
   - Test persistence and hydration

---

## Phase 5: Security & Compliance

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 4_

### Task 5.1: Security Implementation

**ROLE**: You are a security engineer hardening the application

**CONTEXT**: Security requirements from TDD section [X] mandate [security measures]

**OBJECTIVE**: Implement all security controls specified in TDD

**SECURITY CHECKLIST** (from TDD):

- [ ] Authentication: [Method from TDD]
- [ ] Authorization: [Model from TDD]
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implementation
- [ ] Rate limiting per TDD specs
- [ ] Encryption at rest: [Method from TDD]
- [ ] Encryption in transit: TLS 1.3+
- [ ] Security headers configured
- [ ] Secrets management: [Method from TDD]
- [ ] Audit logging: [Requirements from TDD]

**IMPLEMENTATION STEPS**:

1. Configure authentication system per TDD
2. Implement authorization checks at all levels
3. Add input validation using [library from TDD]
4. Configure security headers
5. Set up audit logging
6. Implement rate limiting
7. Configure TLS/SSL
8. Run security scanning tools
9. Fix identified vulnerabilities
10. Document security measures

**VALIDATION**:

- OWASP Top 10 compliance check
- Penetration testing (if specified in TDD)
- Security audit checklist from TDD

**DEPENDENCIES**: Task 4.1
**PRIORITY**: Critical

---

## Phase 6: Deployment & Operations

_Duration: [X] days | Priority: P0 | Prerequisites: Phase 5_

### Task 6.1: CI/CD Pipeline Setup

**ROLE**: You are a DevOps engineer automating deployment

**CONTEXT**: Deployment strategy from TDD section [X] requires [deployment approach]

**OBJECTIVE**: Create fully automated CI/CD pipeline

**PIPELINE STAGES** (from TDD):

1. **Build Stage**

   - Checkout code
   - Install dependencies
   - Compile/build application
   - Create artifacts

2. **Test Stage**

   - Run component tests
   - Generate coverage reports
   - Security scanning

3. **Deploy Stage**
   - Deploy to staging
   - Run smoke tests
   - Deploy to production (with approval)
   - Run health checks

**CONFIGURATION**:

```yaml
# CI/CD configuration based on TDD requirements
pipeline:
  stages:
    - build
    - test
    - deploy
  # Specific configuration from TDD
```

**ACCEPTANCE CRITERIA**:

- [ ] Automated builds on every commit
- [ ] All tests run automatically
- [ ] Deployment to staging automatic
- [ ] Production deployment with approval
- [ ] Rollback capability implemented
- [ ] Build time < [threshold from TDD]

**DEPENDENCIES**: Task 5.1
**DELIVERABLES**: Pipeline configuration, deployment scripts, documentation

---

### Task 6.2: Monitoring & Alerting Setup

**ROLE**: You are a site reliability engineer ensuring observability

**CONTEXT**: Monitoring requirements from TDD section [X] specify [monitoring needs]

**OBJECTIVE**: Implement comprehensive monitoring and alerting

**MONITORING REQUIREMENTS** (from TDD):

1. **Application Metrics**

   - Request rate
   - Error rate
   - Response time
   - Business metrics: [from TDD]

2. **Infrastructure Metrics**

   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Log Aggregation**
   - Centralized logging
   - Log retention: [period from TDD]
   - Search capabilities

**ALERT CONFIGURATIONS**:
| Alert Name | Condition | Severity | Action |
|------------|-----------|----------|---------|
| [From TDD alerts table] | | | |

**IMPLEMENTATION CHECKLIST**:

- [ ] Set up monitoring tools: [from TDD]
- [ ] Configure application instrumentation
- [ ] Set up dashboards for key metrics
- [ ] Configure alerts per TDD specifications
- [ ] Set up log aggregation
- [ ] Create runbooks for alerts
- [ ] Test alert notifications
- [ ] Document monitoring setup

**DEPENDENCIES**: Task 6.1
**DELIVERABLES**: Monitoring dashboards, alert configurations, runbooks

---

## Phase 7: Documentation & Handoff

_Duration: [X] days | Priority: P1 | Prerequisites: Phase 6_

### Task 7.1: Technical Documentation

**ROLE**: You are a technical writer creating comprehensive documentation

**CONTEXT**: Documentation needs for system maintenance and operation

**OBJECTIVE**: Create complete technical documentation package

**DOCUMENTATION DELIVERABLES**:

1. **API Documentation**

   - OpenAPI/Swagger specification
   - Usage examples
   - Authentication guide
   - Rate limiting information

2. **System Architecture Documentation**

   - Component diagrams
   - Data flow diagrams
   - Deployment architecture
   - Technology stack details

3. **Operations Manual**

   - Deployment procedures
   - Monitoring guide
   - Troubleshooting guide
   - Disaster recovery procedures

4. **Developer Guide**
   - Setup instructions
   - Development workflow
   - Testing procedures
   - Contribution guidelines

**QUALITY CHECKLIST**:

- [ ] All endpoints documented
- [ ] Code examples provided
- [ ] Diagrams clear and accurate
- [ ] Procedures tested and verified
- [ ] Documentation reviewed by team

**DEPENDENCIES**: Task 6.2
**FORMAT**: Markdown, diagrams, API specs

---

## Task Execution Guidelines

### For Human Developers

1. Tasks can be executed in parallel within phases
2. Update task status as: Not Started → In Progress → Complete
3. Log blockers immediately for resolution
4. Ensure acceptance criteria met before marking complete

### For AI Agents

1. Execute tasks sequentially within assigned scope
2. Validate prerequisites before starting
3. Run validation commands after completion
4. Report completion with evidence
5. Escalate blockers that cannot be resolved

## Risk Mitigation Tasks

[Include specific tasks for each risk identified in TDD]

### Risk Task Template

**RISK**: [From TDD risk assessment]
**MITIGATION TASK**: [Specific action to address risk]
**OWNER**: [Responsible party]
**DUE DATE**: [Before affected phase]

## Summary Statistics

- **Total Tasks**: [count]
- **Critical Path Tasks**: [list of blocking tasks]
- **Parallel Execution Potential**: [percentage of tasks that can run in parallel]
- **Risk Coverage**: [percentage of TDD risks addressed]

---

_Generated from TDD: [filename]_
_Generation timestamp: [date/time]_
_Optimized for: [Human execution / AI agent execution / Hybrid]_

```

## Status Indicators

Each task title should include a status based on implementation check:
- **[COMPLETED]**: Skip during execution, include evidence paths
- **[PARTIAL: missing X]**: Only implement missing parts
- **No status**: Task not started, full implementation needed

Example:
```

### Task 2.1: [COMPLETED] TDD Implementation - Tap Input System

Evidence: src/services/InputService.ts, src/**tests**/services/InputService.test.ts
(This task can be skipped during execution)

### Task 2.2: [PARTIAL: missing UI components] Enemy Component with Weakness System

Completed: Type definitions, EnemyStore
Missing: Enemy.tsx component, WeaknessSpot.tsx, animations

```

## Generation Requirements

The task list must:
1. **Cover all TDD requirements** - Every component, API, and feature gets tasks
2. **Follow LLM best practices** - Clear context, specific instructions, measurable outcomes
3. **Be immediately actionable** - No ambiguity, all information included
4. **Include dependencies** - Clear task ordering and prerequisites
5. **Provide validation** - Acceptance criteria and testing for each task
6. **Support both humans and agents** - Appropriate level of detail for both

## Quality Validation

✅ **GOOD Task**:
```

Implement user authentication using JWT tokens with 15-minute expiry, refresh tokens stored in Redis with 7-day TTL, following OAuth 2.0 standards specified in TDD section 6.2

```

❌ **BAD Task**:
```

Add authentication to the system

```

✅ **GOOD Acceptance Criteria**:
```

- [ ] JWT tokens generated with correct claims (user_id, roles, exp)
- [ ] Tokens expire after 15 minutes verified by test
- [ ] Refresh endpoint returns new token pair
- [ ] Invalid tokens return 401 status code

```

❌ **BAD Acceptance Criteria**:
```

- [ ] Authentication works

```

## Lean Task Validation Checklist (from @docs/architecture/lean-task-generation-guide.md)

Before finalizing the task list, verify:
- [ ] Task 1 delivers user-visible functionality (NOT just setup)
- [ ] Every task allows user to DO something new
- [ ] Files/folders created only when needed for the current feature
- [ ] Dependencies installed only when used in the current task
- [ ] Each task is independently demo-able
- [ ] NO infrastructure-only tasks (those are created just-in-time)

## Output

Save the generated task list to:
- Filename: `tasks_[feature_name_snake_case]_[YYYYMMDD].md`
  - **IMPORTANT**: Extract `feature_name` from the task list document title or TDD content, NOT from the folder name
  - Example: If task list is for "Passive Resource Generation Implementation", use `tasks_passive_resource_generation_20251111.md`
  - Convert to snake_case: spaces→underscores, lowercase, remove special chars
- Location: Same directory as the source TDD file
- Include generation timestamp and source TDD reference

The task list should enable immediate execution by development teams or AI agents with all necessary context and specifications included.
```
