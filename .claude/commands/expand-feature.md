---
description: "Expand brief game feature into comprehensive specification"
argument-hint: "<brief-feature-description> [reference-files]"
allowed-tools: "Read, Write, Grep, Glob"
---

# Expand Game Feature

You are tasked with expanding the brief feature description: $1

Additional reference files (if provided): $2

## Analysis Phase

1. Parse the brief feature description to identify:
   - Core mechanic being proposed
   - Target player experience
   - Integration points with existing systems (if mentioned)

2. If reference files are provided, read them to understand:
   - Existing game systems and patterns
   - Established design language and structure
   - Technical constraints or requirements

## Expansion Process

Using traditional game design principles and best practices, create a comprehensive feature specification that includes:

### Feature Overview
- Expanded description (2-3 paragraphs)
- Core value proposition to players
- How it enhances the core game loop

### Core Mechanics
- Detailed mechanical description
- Mathematical formulas/calculations (if applicable)
- State management and transitions
- Edge cases and failure conditions

### Player Psychology & Fun Factors
Based on traditional game design principles:
- **Feedback Systems**: Visual, audio, and tactile responses
- **Flow Maintenance**: Challenge-skill balance
- **Satisfaction Layers**: Primary action → Secondary effects → Meta progression
- **Polish Points**: Specific details that need refinement (animation curves, timing windows, etc.)

### User Interface & Experience
- Visual design requirements
- Control scheme/input methods
- Information hierarchy
- Accessibility considerations
- Mobile/platform-specific adaptations

### Progression Integration
- How the feature scales with player advancement
- Unlocking conditions or prerequisites
- Power scaling and balance considerations
- Long-term engagement mechanics

### Technical Requirements
- Performance constraints (FPS, response time)
- Data structures needed
- Save/load considerations
- Network requirements (if multiplayer)
- Platform-specific needs

### Balance Considerations
- Risk vs reward analysis
- Exploitation prevention
- Difficulty curve integration
- Economy impact (if applicable)

### Success Metrics
- Player experience goals (measurable)
- Engagement targets
- Technical performance benchmarks
- Fun validation criteria

### Implementation Priority
- MVP requirements (must-have)
- Enhancement features (nice-to-have)
- Future expansion potential
- Dependencies and blockers

## Output Format

Create a well-structured markdown document at:
`/docs/specs/[feature-name]/[feature-name].md`

The document should:
- Use clear headers and sections
- Include specific examples where helpful
- Provide concrete numbers/formulas
- Reference similar successful implementations
- Maintain consistency with any existing documentation style

## Quality Checklist

Before finalizing, verify:
- ✓ Feature enhances core fun, not distracts from it
- ✓ Players can understand it within 30 seconds
- ✓ It provides satisfying feedback loops
- ✓ The implementation is technically feasible
- ✓ It scales appropriately with game progression
- ✓ Success can be measured objectively

Remember: Focus on perfecting proven mechanics rather than inventing untested ones. A well-executed familiar feature beats a poorly-implemented novel one.