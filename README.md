# Class One Rapids
- Class one rapids are straight, fast, and a smooth ride. That's what this system aims to be.
- Look at other branches for example files
- This is a live experiment and is overengineered, messy, and unrefined. I would only use it as inspiration for your own ideas for now.
- The start is unclear, because I'm not really providing prompts to use. Thats to come.
## Main flow in the end
```
# outputs: "prd.md"
/create-prd
# outputs: "prd-technical.md"
/add-tech-prd prd.md
# outputs: runbook folder
/create-runbook technical-prd.md
```
## Phase 0 - Setup
Create a CLAUDE.md, Cursor rule or similar that says,
```
- Be concise
- If doing research, make sure you look in the /research folder before searching the web. Do not search the web if there is something that matches in the /research folder
- Do not guess, ask questions if you are not confident about something

```
## Phase 1 - Create the basic commands
### A system for self-bootstrapping a context engineering system.
```
# create a command that creates commands
/create-command
# use that to create a command that researches a topic:
/research best practices for context engineering and prompt engineering and put it in /research/agentic
/research best practices for [LLM] prompting and context and put it in /research/agentic
/research best practices creating slash commands in [for your IDE/host, eg Cursor, Claude Code, etc] using the most recent documentation and put it in /research/agentic
/create-command-advanced - read all the files in the folder /research to create an advanced create-command 

```
## Phase 2 - Create Research
```
/research-advanced - use research and the new advanced command to create an advanced research command
(optional) /research-advanced [any of the research topics in phase 1]
/research-advanced product requirements document
/research-advanced best practices for [each framework used]
/research-advanced best practices for [language used]
/research-advanced best practices for state management
/research-advanced best practices for [specific state management you like] {optional}
/research-advanced software development cycle
/research Create a file "roles.md" of the different roles within the software development cycle. Be concise and only list the roles as a bulleted list (using '-')
/research-advanced each role in roles.md and save a different file for each role. put these in a folder "/research/roles"
/research-advanced vertical slicing
/research-advanced SOLID principles
(optiona) /research-advanced automated testing best practices for [framework or language] including unit, component, integration, e2e, and contract testing
(optional) /research-advanced [specific framework + testing suite, eg "react-native expo component testing with testing-library"

```
Phase 3 - Create Flow Commands
```
/create-command-advanced that creates a file for a prd based on a md file or text entered using a name based on the contents of the PRD
/create-command-advanced that adds a section to each user-story, directly under the user-story. do not change any part of the user story itself, only add technical details
/create-command-advanced that creates a runbook for an AI Agent to follow using the research in /research/agentic. This runbook should follow the specifications in the technical section of the inputed PRD (which should have a technical section under each story)
/create-command-advanced that executes a runbook by assuming the role of the /research/roles/
```

Phase 3 - Generate an app/create features
```
/research-advanced Idler/clicker games
/research-advanced design documents for games
/create-command-advanced Create a command that does the follow, "Use /research/games folder to create a design document by using ULTRATHINK and think deeper and think longer"
/create-prp design-doc.md
/add-tech-prd prp.md
/create-runbook prp-technical.md
/execute-runbook /path/to/runbook/
```
## Paradigm and other commands to create

### Explanation
- Research folder organized by topic (planning, tech, etc)
- Commands reference the research folder and subfolders as needed
- Runbook created using gates that confirm with research based on a PRD+technical details
- Runbook is split into files, verstile:
  - mark progress in the file
  - physically moved for local kanban system
- Each step validates itself against the research
- Role/persona used for each step

### Experimental
```
# checks the flow by looking at the README.md (which should list the flow, can be created via a prompt) and the commands being used, and traces down what is causing concerns with the results
/analyze-flow [what went wrong with the flow]

# "Compresses" research into smaller chunks to reduce token usage = uses /research/agentic to make smart decisions about what to keep and what to remove
/compress-research [research-file.md] 
```

### Brainstorming
- the idea of having the "creative" mind of the LLM create logical checks by creating scripts that can, in a very concrete way, verify logic. This is a human approach (e.g. using a linter to prevent silly mistakes).
- research organized and used via tags
- hook watching for changes in research folder -> update single files? INDEX.md within each subfolder? "Read each INDEX.md within each subfolder of the /research folder
- once things are working more consistently, condense into two commands, generate + execute

