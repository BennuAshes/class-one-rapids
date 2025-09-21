---
description: "Comprehensive research on any topic with examples and multiple perspectives for LLM context"
argument-hint: "<topic to research>"
allowed-tools: "WebSearch, WebFetch, Task, Write, Read, Bash(mkdir:*)"
---

# Universal Research Agent

Research topic: **"$ARGUMENTS"**

**Think** carefully about what aspects of this topic will be most valuable for an LLM to understand and apply.

## Objective
Generate comprehensive, balanced research optimized for LLM context. Create a document that provides deep understanding through concrete examples, multiple perspectives, and actionable insights - regardless of whether the topic is technical, academic, business, scientific, or cultural.

## Research Framework

### 🔍 Phase 1: Foundation & Scope
1. Define the topic clearly and establish boundaries
2. Identify key concepts, terminology, and definitions
3. Determine whether topic is technical, academic, theoretical, practical, or mixed
4. Search for authoritative sources and current information:
   - `"$ARGUMENTS" overview introduction basics 2024 2025`
   - `"$ARGUMENTS" definition explained guide`
   - `"$ARGUMENTS" fundamentals principles`

### 🌐 Phase 2: Multiple Perspectives
**Think deeply** about different viewpoints and their validity:
1. Mainstream/consensus views
2. Alternative approaches and minority opinions
3. Cultural and geographical variations
4. Historical evolution and future trends
5. Criticisms and counterarguments
6. Search variations:
   - `"$ARGUMENTS" different perspectives approaches`
   - `"$ARGUMENTS" criticism controversy debate`
   - `"$ARGUMENTS" alternatives comparison`

### 📊 Phase 3: Evidence & Examples
**Think** about the most compelling and relevant examples:
1. **For Technical Topics**: Code samples, configurations, implementations
2. **For Academic Topics**: Case studies, research findings, data
3. **For Business Topics**: Market examples, company cases, strategies
4. **For Scientific Topics**: Experiments, studies, observations
5. **For Social Topics**: Statistics, surveys, real-world scenarios
6. **For Historical Topics**: Primary sources, timeline events, artifacts

### 🔬 Phase 4: Deep Analysis
**Think hard** about the deeper implications and hidden connections:
1. Identify patterns and connections across domains
2. Examine cause-and-effect relationships
3. Explore edge cases and exceptions
4. Consider second-order and third-order effects
5. Analyze strengths and weaknesses objectively
6. Evaluate evidence quality and potential biases

### 💡 Phase 5: Practical Applications
**Think deeply** about real-world implications and applications:
1. Real-world applications and use cases
2. Implementation strategies (where applicable)
3. Best practices and common pitfalls
4. Success stories and failures
5. Actionable recommendations and next steps

## Document Structure

Create `/specs/research/<descriptive_name>_YYYYMMDD_HHMMSS.md` with adaptive structure:

```markdown
# [Topic] - Comprehensive Research

## Executive Summary
- Core insights in 3-5 bullet points
- Why this matters
- Key takeaways for immediate application

## Foundation
### Definitions & Concepts
- Clear explanations with examples
- Key terminology
- Scope and boundaries

### Context & Background
- Historical development
- Current state
- Future trajectory

## Core Content

### Main Aspects
[Organized by what makes sense for the topic:]
- Theories/Frameworks
- Methods/Approaches
- Components/Elements
- Principles/Rules
- Categories/Types

### Examples & Evidence
[Format depends on topic type:]

#### Example 1: [Descriptive Name]
- Context and setup
- Details/implementation/process
- Results/outcomes
- Lessons learned

#### Example 2: [Descriptive Name]
[Similar structure, adapted to topic]

### Comparative Analysis
| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| [Key criteria] | Details | Details | Details |

## Multiple Perspectives

### Mainstream View
- Consensus position
- Supporting evidence
- Typical applications

### Alternative Approaches
- Different schools of thought
- Contrarian views
- Edge cases and exceptions

### Critical Analysis
- Strengths and weaknesses
- Assumptions and limitations
- Potential biases

## Practical Applications

### Use Cases
1. **Scenario A**: How it applies
2. **Scenario B**: Implementation approach
3. **Edge Case**: Special considerations

### Best Practices
- **DO**: Specific recommendations with reasoning
  - Example or evidence
- **DON'T**: Common mistakes to avoid
  - Why it's problematic

### Implementation Guide
[If applicable to topic:]
1. Step-by-step approach
2. Required resources
3. Success metrics
4. Troubleshooting tips

## Synthesis & Insights

**Think harder** about the big picture and generate novel insights:

### Key Patterns
- Recurring themes
- Universal principles
- Cross-domain applications

### Connections
- Related concepts
- Interdisciplinary links
- System interactions

### Future Directions
- Emerging trends
- Open questions
- Research opportunities

## Knowledge Gaps & Uncertainties
- What remains unknown
- Conflicting evidence
- Areas needing research
- Alternative interpretations

## Resources & References
- Primary sources
- Authoritative references
- Further reading
- Communities and experts

## Metadata
- Research date: [timestamp]
- Confidence levels noted where appropriate
- Version/recency of information
```

## Execution Guidelines

### Quality Criteria
✅ Examples make abstract concepts concrete
✅ Multiple viewpoints fairly represented
✅ Practical value clearly demonstrated
✅ Knowledge gaps explicitly acknowledged
✅ Sources are authoritative and current
✅ Structure adapts to topic nature
✅ Balance between depth and accessibility

### Search Strategy
1. Start broad, then narrow based on findings
2. Use 10-15 varied search queries minimum
3. Seek contrasting sources and viewpoints
4. Prioritize recent information (2023-2025) while including historical context
5. Verify controversial claims with multiple sources

### Adaptive Formatting
- **Technical topics**: Include code, configs, command examples
- **Academic topics**: Include methodologies, citations, data
- **Business topics**: Include case studies, metrics, strategies
- **Scientific topics**: Include studies, data, visualizations
- **Cultural topics**: Include examples, contexts, perspectives
- **Mixed topics**: Blend appropriate elements

### File Naming
Generate concise, descriptive filename (max 40 chars):
- `quantum_computing_intro_20250916_120000.md`
- `renaissance_art_analysis_20250916_120000.md`
- `startup_funding_guide_20250916_120000.md`
- `climate_change_impacts_20250916_120000.md`

## Remember
**Think harder** about what information will be most useful for an LLM to understand and apply this knowledge.

The output must serve as high-quality context for an LLM agent. Prioritize:
1. **Concrete examples** over abstract descriptions
2. **Practical applications** over pure theory
3. **Multiple perspectives** over single viewpoints
4. **Honest uncertainty** over false confidence
5. **Structured clarity** over exhaustive detail

Execute research with intellectual honesty, depth, and practical focus.