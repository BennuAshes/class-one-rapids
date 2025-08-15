# /spec Command

Generate feature specifications using RDT methodology.

## Usage

```bash
/spec new [feature-name] [description]  # Start new specification
/spec generate                          # Generate next phase document
/spec status                            # Show current phase
/spec approve                           # Approve current phase and move to next
```

## Process Flow

1. **Start**: User provides feature description
2. **Requirements**: Claude generates requirements.md from description
3. **Review**: User reviews/edits, then approves
4. **Design**: Claude generates design.md from requirements
5. **Review**: User reviews/edits, then approves  
6. **Tasks**: Claude generates tasks.md from requirements + design
7. **Complete**: Specification ready for implementation

## Current Specification

The active specification is tracked in `/projects/specs/[feature-name]/`

Each specification contains:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Technical architecture and approach
- `tasks.md` - Implementation breakdown

## Commands

### /spec new [feature-name] "[description]"

Starts a new specification. Claude will:
1. Create `/projects/specs/[feature-name]/` directory
2. Generate `requirements.md` based on your description
3. Present it for review

### /spec generate

Generates the next phase document based on previous phases:
- If requirements approved → generates design.md
- If design approved → generates tasks.md

### /spec status

Shows current phase and approval status.

### /spec approve

Approves current phase and enables progression to next phase.