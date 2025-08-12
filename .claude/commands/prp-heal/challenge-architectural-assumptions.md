---
description: Challenge architectural assumptions in PRDs and design documents before generating technical requirements
argument-hint: <document-path>
---

# Challenge Architectural Assumptions

Analyze a PRD or design document for architectural anti-patterns and propose corrections before technical implementation.

## Usage
```bash
/challenge-architectural-assumptions design-doc.md
/challenge-architectural-assumptions petsoft-tycoon-advanced-prd.md
```

## Process

### Phase 1: Detect Architectural Smells
Scan the document for language indicating:
- Global state assumptions ("global store", "central state", "shared context")
- Tight coupling ("directly modifies", "updates", "accesses")
- Horizontal layering ("UI layer", "business layer", "data layer")
- Synchronous dependencies ("waits for", "blocks until", "depends on")
- Missing boundaries ("everything in", "all features", "entire application")

### Phase 2: Identify Bounded Contexts
For each feature or domain area mentioned:
1. What data does it own?
2. What operations does it perform?
3. What events does it produce?
4. What information does it need from others?

### Phase 3: Propose Architectural Corrections

#### For Global State
**Detect**: "The game state will track player currency, departments, achievements..."
**Challenge**: "Why does one object need to know about all domains?"
**Propose**: 
```typescript
// Instead of:
const gameState = { player: {...}, departments: {...} }

// Decompose into:
class PlayerService { #currency; spend(); earn(); }
class DepartmentService { #employees; hire(); fire(); }
// Coordinate through events
```

#### For Direct Dependencies
**Detect**: "When hiring, deduct currency from player"
**Challenge**: "Why does hiring know about player internals?"
**Propose**:
```typescript
// Instead of:
player.currency -= hireCost;

// Use capability:
const result = await economy.requestFunds(hireCost);
if (result.approved) { /* hire */ }
```

#### For Missing Boundaries
**Detect**: "All game logic in the main game loop"
**Challenge**: "How do we test/modify features independently?"
**Propose**:
```typescript
// Instead of:
gameLoop() { 
  updateEverything();
}

// Separate concerns:
gameLoop() {
  features.forEach(f => f.tick(deltaTime));
  eventBus.flush();
}
```

### Phase 4: Generate Architectural Principles

Based on the analysis, generate principles that MUST be followed:

```markdown
## Architectural Principles (MANDATORY)

1. **State Isolation**: Each feature owns its state completely
   - ❌ NO global state objects
   - ✅ Private state with public capabilities

2. **Event-Driven Coordination**: Features communicate through events
   - ❌ NO direct cross-feature method calls
   - ✅ EventBus or message passing

3. **Bounded Contexts**: Clear feature boundaries
   - ❌ NO shared mutable state
   - ✅ Each feature is a mini-application

4. **Testability First**: Every component testable in isolation
   - ❌ NO complex setup for unit tests
   - ✅ Zero dependencies for feature tests

5. **Progressive Complexity**: Start simple, evolve through composition
   - ❌ NO big ball of mud
   - ✅ Small, composable services
```

### Phase 5: Create Validation Rules

Generate concrete rules that can be checked:

```typescript
// Architecture Validation Rules
const rules = [
  {
    name: 'no-global-state',
    pattern: /export const \w+State\$ = observable\({.*player.*departments.*}/s,
    message: 'Global state detected. Decompose into feature services.'
  },
  {
    name: 'no-cross-feature-imports',
    pattern: /from ['"]\.\.\/\.\.\/features\/\w+\/state/,
    message: 'Cross-feature state import. Use events instead.'
  },
  {
    name: 'capability-not-data',
    pattern: /get\w+State\(\)/,
    message: 'Exposing state directly. Expose capabilities instead.'
  }
];
```

### Phase 6: Output Report

Generate a comprehensive report:

```markdown
# Architectural Assumptions Challenge Report

## Detected Anti-Patterns
1. **Global State**: Found X references to centralized state
2. **Tight Coupling**: Found Y direct cross-domain dependencies
3. **Missing Boundaries**: Z features lack clear boundaries

## Proposed Corrections

### State Architecture
FROM: Single global state object
TO: Feature-isolated services with event coordination

[Detailed decomposition plan]

### Communication Pattern
FROM: Direct method calls and property access
TO: Event-driven architecture with capability exposure

[Event catalog and contracts]

### Testing Strategy
FROM: Complex integration tests
TO: Isolated unit tests per feature

[Testing patterns and examples]

## Implementation Impact

### Positive Changes
- True feature independence
- Parallel development capability
- Simplified testing
- Better performance isolation

### Migration Effort
- Estimated effort: X days
- Risk level: Low/Medium/High
- Team training required: Y hours

## Validation Checklist
- [ ] No global state objects
- [ ] No direct cross-feature imports
- [ ] All features have clear boundaries
- [ ] Event contracts defined
- [ ] Capability-based interfaces
- [ ] Isolated test suites

## Next Steps
1. Review and approve architectural corrections
2. Update technical requirements with new architecture
3. Generate runbook following corrected patterns
4. Add architecture fitness tests to CI/CD
```

## Integration with Workflow

This command should be run:
1. **Before** `prd-to-technical-requirements`
2. **After** any PRD or design doc is created
3. **During** architecture reviews

It acts as an architectural conscience, preventing anti-patterns from propagating through the development pipeline.

## Success Metrics

- Zero global state objects in generated code
- 100% of features testable in isolation
- No cross-feature state dependencies
- Event-driven coordination throughout
- Clear bounded contexts for each feature

## Example Usage

```bash
# Challenge assumptions in design doc
/challenge-architectural-assumptions design-doc.md

# Review output and apply corrections
cat ARCHITECTURAL-ASSUMPTIONS-CHALLENGE.md

# Then proceed with corrected architecture
/prd-to-technical-requirements prd.md

# Validate the architecture matches corrections
/validate-architecture-alignment runbook/
```

This command ensures architectural integrity from the earliest stages of development, preventing the accumulation of technical debt and anti-patterns.