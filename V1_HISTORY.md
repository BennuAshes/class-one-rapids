# Class One Rapids v1 - Historical Documentation

This document preserves the v1 approach and learnings from the initial Class One Rapids development (August 3-20, 2025).

## Original Vision

The project originally answered the question: "How to create a PRP (Product Document Prompt), or spec-driven style system?"

### Variations Explored
The goal was to provide a toolkit, or prompts and a methodology to create different types of projects with a central LLM-related mechanism for researching, remembering knowledge, and searching that knowledge when relevant.

## Early Research & Experiments (August 3-15, 2025)

### Initial Research Focus
The earliest research in v1 focused on:
- **Command system architectures**: Initially tried JavaScript and Python approaches before discovering markdown-based commands
- **Knowledge representation**: Explored knowledge graphs for organizing development knowledge
- **Research compression techniques**: Experimented with shell scripts to compress and validate research outputs
- **Self-healing methodologies**: Researched how systems could self-improve through analysis

### Branches & Approaches
Based on git history, v1 explored multiple approaches:

- **Agent-heavy automation** (abandoned with "no-agent first" commit)
- **Knowledge graphs** (working-knowledge-graph branch) - Tried representing development knowledge as interconnected graphs
- **Simpler PRP process** (simpler-prp-8-21-25 branch) - Attempted to streamline Product Requirements Document generation
- **Self-repair systems** (self-repair-claude branch) - Experimented with self-correcting commands
- **Back to basics** approach (back-to-basics branch) - Stripped down to essentials when complexity grew

## Issues Discovered in v1

These issues were documented during the v1 development phase and informed the v2 redesign:

### General Development Issues
- Folder organization: organizing by feature is not super common for react apps as the apps tend to be small
- Fine-grained state management for non-established patterns
- Starting new projects (agent tends to overthink)
- Creating configs ahead of time instead of incrementally
- Should update configs step by step per item relevant to the step
- Don't use a "standard config" it suggests - start with a seed project and build on that
- Big focus on marketing, metrics, and full testing suite when talking about an "MVP" - should use "POC" instead
- Tries adding a babel config - no knowledge of babel-preset-expo or other modern built-in expo options
- Tries to validate code in ways that cause it to freeze/pause
- Jest compatibility issues
- Research becomes bloated and overwhelming
- Memory capabilities limitations
- Hard time giving up, or realizing something isn't their fault
- Data flow and architecture understanding

### PRD Specific Issues
- Inappropriate focus on 60 FPS coming from the PRD generation for mobile games

### Patterns & Thoughts from v1

These were exploratory notes that didn't make it into v2:

- Consideration of a /plan command to replace /prp with 1 human in the loop for the plan that includes both product and tech overview
- Pros and cons to roles to narrow focus
- Making a /plan command (as well as context/prompting techniques for executing that plan)

## Architecture Questions from v1

These were open questions that v2 ultimately answered:

- State management including how to do fine-grained by-feature state/hooks
- Folder structure best practices
- Setting up the project properly
- Best practices for react as far as separating out features into components and sub-components for UX clarity

## Transition to v2

On September 20, 2025, the project was formally transitioned to v2 with the commit:
```
f206122 - "v2 - quick save before redoing tech design doc/task generation"
```

This marked the shift from experimental agent approaches to the structured command-based workflow that defines v2.

## What v1 Research Revealed

### Research Methodology Evolution
Through v1, the research approach needed fundamental changes:

**Initial Approach (Failed)**:
- Broad, unfocused research gathering everything possible
- Created massive documents that overwhelmed context
- No clear connection between research and implementation

**Key Discovery**:
August 10 pivot: "Research should focus on practical applications and examples specifically for feeding into this system"

**Research Principles Established**:
- Research must be balanced (multiple perspectives)
- Example-driven (concrete code samples, not abstract theory)
- Actionable for LLM context (directly usable in commands)

## Lessons Learned

The key lessons from v1 that shaped v2:

1. **No-agent first**: Over-engineered agent systems created more problems than they solved
2. **Research needs focus**: Unfocused research creates bloat and confusion - led to multi-phase research methodology in v2
3. **Commands over complexity**: Simple markdown commands beat complex JavaScript/Python scripts
4. **Incremental over upfront**: Build configs and structure as needed, not all at once
5. **Reflection is critical**: Without systematic analysis of failures, mistakes repeat - this became the foundation for `/reflect` commands

## See Also

- [PROJECT_EVOLUTION.md](PROJECT_EVOLUTION.md) - Comprehensive breakdown of v2 development
- [README.md](README.md) - Current documentation