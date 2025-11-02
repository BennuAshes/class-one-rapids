---
description: "Generate a comprehensive Technical Design Document from a Product Requirements Document"
argument-hint: "<prd-file-path>"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob, Task"
---

# Technical Design Document Generator

## Input Processing

The PRD file path is provided as: $ARGUMENTS

Use the Read tool to load the PRD file contents from the provided path.

Generate a comprehensive Technical Design Document based on the PRD.

## Phase 1: PRD Analysis

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
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | [Generated] | [Date] | Draft | Initial TDD from PRD |

## Executive Summary
[2-3 sentence technical overview linking to PRD goals]

## 1. Overview & Context
### Problem Statement
[Extract from PRD with technical perspective]

### Solution Approach
[High-level technical approach to solve the problem]

### Success Criteria
[Technical metrics aligned with PRD business metrics]

## 2. Requirements Analysis
### Functional Requirements
[Map PRD user stories to technical capabilities]

### Non-Functional Requirements
- Performance: [Specific benchmarks from PRD]
- Scalability: [User/data volume projections]
- Security: [Authentication, authorization, data protection]
- Availability: [Uptime requirements]
- Compliance: [Regulatory requirements if any]

## 3. System Architecture
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

## 4. API Design
### Internal APIs
| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| /api/[resource] | GET/POST/etc | [Purpose] | [Schema] | [Schema] |

### External Integrations
[Any third-party services or APIs]

## 5. Data Model
### Entity Design
```
[Entity Name]
- field1: type (constraints)
- field2: type (constraints)
- relationships
```

### Database Schema
- Tables/Collections structure
- Indexes for performance
- Data validation rules
- Migration strategy

### Data Access Patterns
- Common queries
- Caching strategy
- Data consistency approach

## 6. Security Design
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

## 7. Test-Driven Development (TDD) Strategy
### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- Framework: React Native Testing Library
- Reference: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
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
   ```

2. **GREEN Phase - Minimal Implementation**
   - Write ONLY enough code to pass the test
   - No extra features or optimizations
   - Focus on making test green

3. **REFACTOR Phase - Improve Code**
   - Clean up implementation
   - Extract components/functions
   - Maintain all green tests

#### Test Categories (in order of implementation)

### Unit Testing (TDD First Layer)
- **Render Tests**: Component displays correctly
- **Interaction Tests**: User actions work properly
- **State Tests**: Data changes trigger correct updates
- Coverage target: > 80% for new code
- Testing approach: Test behavior, not implementation

### Integration Testing (TDD Second Layer)
- **Component Integration**: Parent-child data flow
- **API Integration**: MSW mock handlers
- **Navigation Testing**: Screen transitions
- **Context/State Management**: Global state updates

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

## 8. Infrastructure & Deployment
### Infrastructure Requirements
| Component | Specification | Justification |
|-----------|--------------|---------------|
| Compute | [CPU/Memory] | [Why needed] |
| Storage | [Type/Size] | [Data requirements] |
| Network | [Bandwidth] | [Traffic expectations] |

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
| Alert | Condition | Priority | Action |
|-------|-----------|----------|--------|
| [Alert name] | [Trigger] | P0/P1/P2 | [Response] |

## 9. Scalability & Performance
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

## 10. Risk Assessment & Mitigation
### Technical Risks
| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| [From PRD + new technical risks] | High/Med/Low | High/Med/Low | [Strategy] | [Team] |

### Dependencies
[Map PRD dependencies to technical components]

## 11. Implementation Plan (TDD-Driven)
### Development Phases
Following @docs/guides/lean-task-generation-guide.md principles - prioritize user-visible functionality:

#### Phase 1: Foundation & Test Setup [X weeks]
- Set up testing infrastructure (Jest, React Native Testing Library)
- Configure MSW for API mocking
- Create test utilities and custom renderers
- Set up CI/CD with test automation
- Core data models with tests first

#### Phase 2: TDD Feature Implementation [X weeks]
[Map to PRD MVP features - each with TDD cycle]

**For Each Feature:**
1. **Day 1-2: Test Planning**
   - Break down feature into testable behaviors
   - Write all failing tests for feature
   - Review tests against requirements

2. **Day 3-4: Implementation**
   - Implement code to pass each test
   - Follow Red-Green-Refactor for each behavior
   - Keep all previous tests green

3. **Day 5: Integration**
   - Write integration tests
   - Connect feature to system
   - Ensure end-to-end flow works

Example Feature Breakdown:
- **[Feature 1]**: User Authentication
  - Test 1: Login form renders with email/password fields
  - Test 2: Validation shows errors for invalid email
  - Test 3: Successful login navigates to home
  - Test 4: Failed login shows error message
  - Test 5: Token stored securely after login

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
| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | [Technical deliverable] | [Date] | [What's needed] |

## 12. Decision Log
### Architecture Decisions
| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| [Database] | [SQL, NoSQL, etc] | [Choice] | [Why] |
| [Framework] | [Options] | [Choice] | [Why] |

### Trade-offs
- [Trade-off 1]: Chose [X] over [Y] because [reason]
- [Trade-off 2]: Accepted [limitation] for [benefit]

## 13. Open Questions
Technical questions requiring resolution:
- [ ] [Technical question from PRD analysis]
- [ ] [Architecture decision pending]
- [ ] [Integration clarification needed]

## 14. Appendices
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
*Generated from PRD: [filename]*
*Generation Date: [timestamp]*
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
- Location: `/docs/specs/` if it exists, otherwise `/docs/` or project root
- Include generation timestamp and source PRD reference

The TDD should enable the development team to immediately begin implementation with clear technical direction and architectural decisions already made.