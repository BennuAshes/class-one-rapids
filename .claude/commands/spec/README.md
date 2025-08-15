# RDT Specification Process

A human-validated approach to feature development using Requirements → Design → Tasks (RDT) methodology.

## Process Flow with Human Validation

```
1. Requirements (what & why) → Human Review → 
2. Design (how) → Human Review → 
3. Tasks (when) → Human Review → 
4. Implementation
```

### Phase 1: Requirements First
- **Document**: `requirements.md`
- **Purpose**: Define what needs to be built and why from user/business perspective
- **Human Check**: Product/stakeholder review for business alignment
- **Gate**: Requirements approval before proceeding to design

### Phase 2: Design from Requirements  
- **Document**: `design.md`
- **Purpose**: Technical architecture to fulfill requirements
- **Human Check**: Engineering review for technical soundness
- **Gate**: Design approval before task breakdown

### Phase 3: Tasks from Design
- **Document**: `tasks.md`
- **Purpose**: Break design into actionable work items
- **Human Check**: Development team review for sprint planning
- **Gate**: Task approval before implementation

## Why Requirements First?

- **Business Value**: Ensures solution addresses actual user needs
- **Clear Goals**: Business objectives drive technical decisions
- **Stakeholder Alignment**: Early agreement on feature scope
- **Traceability**: All work traces back to business requirements

## Human Validation Gates

Each phase requires explicit human approval:

1. **Requirements Gate**: Product owner/stakeholder sign-off
2. **Design Gate**: Senior engineer/architect sign-off  
3. **Tasks Gate**: Development team/scrum master sign-off

## Benefits

- **Validated Progression**: Each step builds on approved foundation
- **Clear Handoffs**: Product → Engineering → Development workflow
- **Reduced Rework**: Early validation prevents late-stage changes
- **Quality Assurance**: Human review catches issues automation misses

## Usage

```bash
# Start new specification
/spec new [feature-name]

# Validate current phase
/spec validate

# Progress to next phase
/spec next
```