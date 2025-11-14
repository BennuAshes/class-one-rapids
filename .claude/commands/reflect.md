- Read the files listed in @FLOW.md and determine what we can change in those files or in the research those files reference such that: $ARGUMENTS
- If it relates to how to write the code, like its style, behavior, how concerns are separated, etc then find appropriate knowledge or research files mostly at docs/architecture/ but also docs/
- If it relates to the process of that flow command, then **identify what needs changing in the command**

**CRITICAL: When proposing changes to flow commands**:
1. **ALWAYS analyze first** - Read the command file, understand its current structure, identify specific issues
2. **Propose changes, don't implement immediately** - Explain what should be changed and why
3. **Ask for permission before modifying** - Especially for workflow infrastructure files
4. **Use Edit tool, not Write** - Preserve existing content, make surgical changes
5. **Never overwrite critical files during analysis** - The reflect command is for thinking, not immediate action

**Example of CORRECT behavior**:
> "I've identified that the execute-task command uses passive voice like 'The agent will execute...' instead of imperative instructions. I recommend changing lines 116-130 to use active voice like 'YOU MUST NOW execute...'. Should I make this change?"

**Example of WRONG behavior**:
> *Immediately uses Write tool to overwrite execute-task.md without asking*