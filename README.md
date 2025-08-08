# Class One Rapids
Class one rapids are straight, fast, and a smooth ride. That's what this system aims to be.

## Main flow in the end
```
/create-prd (outputs: "prd.md")
/add-tech-prd [prd.md] (outputs: "prd-technical.md")
/create-runbook [technical-prd] (outputs: runbook folder)
```

## Phase 1 - create-command and research
A system for self-bootstrapping a context engineering system.

1) /create-command - create a command that creates commands 
2) /research - use that to create a command that researches a topic:
    - research best practices for context engineering and prompt engineering
    - research best practices for gpt5 prompting and context    
    - research best practices creating slash commands in [for your IDE/host, eg Cursor, Claude Code, etc] using the most recent documentation
3) /create-command-advanced - use research to create an advanced create-command
4) /research-advanced - use research and the new advanced command to create an advanced research command


## Paradigm
- Research folder organized by topic (planning, tech, etc)
- Commands reference the research folder as needed
- Runbook created using gates that confirm with research based on a PRD with technical details
- Runbook is split into files that can be internally marked or physically moved for local kanban
- Each step validates itself against the research
- Role assumed for each step
- Final step: use role + runbook to execute

## Generating the Main Commands

### Research first
/research product requirements document
/research best practices for [each framework used]
/research best practices for [language used]
/research best practices for state management
/research best practices for [specific state management you like] {optional}
/research software development cycle
Using [research for software-development-cycle.md] , create a role/persona for each role typically used during the 
/research vertical slicing
/research SOLID principles
/research automated testing best practices for [framework or language] including unit, component, e2e, and contract testing. 
/create-command-advanced that creates a prd based on a md file or text entered. create a file called "prd-[timestamp].md"
/create-command-advanced that adds a section to each user-story, with the story, underneath the main details. do not change any part of the user story itself, only add technical details.

## Self-healing
/analyze-flow - checks the flow and the commands being used, and traces down what is causing concerns with the results


## Experimental
/compress-research - takes in a research md and outputs a stripped down version that contains only a summary optimized for use by Agentic AI.
