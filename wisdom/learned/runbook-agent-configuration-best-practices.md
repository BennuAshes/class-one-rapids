# Best Practices for Configuring Runbook Agents in Claude Code

## Executive Summary

Creating effective agents that follow technical runbooks requires three core elements: **XML-structured role definitions**, **atomic task decomposition**, and **clear execution boundaries**. This research synthesizes current best practices (2025) for configuring Claude Code agents that can reliably execute technical runbooks with minimal supervision.

The key insight: Treat runbook agents as **pure functions** - they receive a task, execute it deterministically, return results, and maintain no state. This approach eliminates complexity while maximizing reliability and reproducibility.

## Core Configuration Principles

### 1. XML-Structured Agent Definition

Claude responds exceptionally well to XML-structured prompts. For runbook agents, use this template:

```xml
<agent>
  <role>Technical Runbook Executor</role>
  <expertise>[Specific technical domain]</expertise>
  <constraints>
    - Execute tasks exactly as specified
    - No creative interpretation unless requested
    - Report status at each step
    - Fail fast with clear error messages
  </constraints>
  <runbook>
    <step id="1">
      <action>[Specific action]</action>
      <verification>[How to verify success]</verification>
      <error_handling>[What to do if fails]</error_handling>
    </step>
  </runbook>
</agent>
```

### 2. Two-Level Architecture

**Primary Agent** (Orchestrator):
- Understands context and user intent
- Decomposes complex tasks into runbook steps
- Manages state and conversation history
- Handles error recovery and user communication

**Runbook Agents** (Executors):
- Pure function execution - same input = same output
- No memory or conversation history
- Single responsibility per agent
- Return structured results in XML format

### 3. Task Decomposition Pattern

Break complex workflows into atomic, verifiable steps:

```xml
<task_decomposition>
  <analyze>Break down the goal into discrete outcomes</analyze>
  <sequence>Order tasks by dependencies</sequence>
  <atomize>Ensure each task is independently executable</atomize>
  <verify>Define clear success criteria for each step</verify>
</task_decomposition>
```

## Runbook Creation Best Practices

### 1. Clear Action Specification

Each runbook step must include:
- **Action**: What to do (imperative, specific)
- **Context**: Required information and constraints
- **Verification**: How to confirm success
- **Error Path**: Explicit failure handling

### 2. Use Claude Code Tools Effectively

```xml
<runbook_step>
  <action>Search for implementation patterns</action>
  <tools>
    <primary>Grep for initial discovery</primary>
    <secondary>Read for detailed analysis</secondary>
    <validation>Bash for testing changes</validation>
  </tools>
  <output_format>List of file:line_number references</output_format>
</runbook_step>
```

### 3. Iterative Refinement Pattern

```xml
<refinement_cycle>
  <step1>Execute initial runbook</step1>
  <step2>Capture edge cases and failures</step2>
  <step3>Update runbook with handling</step3>
  <step4>Test on 5+ scenarios</step4>
  <step5>Version and template successful patterns</step5>
</refinement_cycle>
```

## Production-Ready Templates

### Software Development Runbook

```xml
<runbook name="feature_implementation">
  <phase name="discovery">
    <step>Use Grep to find existing patterns</step>
    <step>Read relevant files for context</step>
    <step>Document architectural decisions</step>
  </phase>
  
  <phase name="implementation">
    <step>Create/modify files using Edit/Write</step>
    <step>Follow existing code conventions</step>
    <step>Add appropriate error handling</step>
  </phase>
  
  <phase name="validation">
    <step>Run lint and typecheck commands</step>
    <step>Execute relevant tests</step>
    <step>Verify no regressions</step>
  </phase>
</runbook>
```

### Debugging Investigation Runbook

```xml
<runbook name="debug_issue">
  <step id="1">
    <action>Reproduce the issue</action>
    <command>Bash: Run failing command</command>
    <capture>Error message and stack trace</capture>
  </step>
  
  <step id="2">
    <action>Locate error source</action>
    <command>Grep: Search for error patterns</command>
    <command>Read: Examine identified files</command>
  </step>
  
  <step id="3">
    <action>Identify root cause</action>
    <analysis>Trace execution flow</analysis>
    <verification>Confirm hypothesis with targeted test</verification>
  </step>
  
  <step id="4">
    <action>Implement fix</action>
    <command>Edit: Apply minimal change</command>
    <validation>Rerun original failing case</validation>
  </step>
</runbook>
```

## Critical Success Factors

### 1. Deterministic Execution
- Same inputs must produce same outputs
- No reliance on conversation history
- Explicit state handling when needed

### 2. Error Handling Excellence
- Every step includes failure paths
- Clear error messages with context
- Graceful degradation strategies

### 3. Tool Selection Optimization
- Use Task agent for complex searches
- Batch Read operations for efficiency
- Prefer Edit over Write for existing files
- Run validation commands automatically

### 4. Context Management
```xml
<context_strategy>
  <essential>Core requirements and constraints</essential>
  <project>Codebase conventions and patterns</project>
  <ephemeral>Current task state only</ephemeral>
</context_strategy>
```

## Implementation Checklist

- [ ] Define agent role with XML structure
- [ ] Specify expertise domain and constraints
- [ ] Create atomic, verifiable task steps
- [ ] Include verification for each action
- [ ] Define error handling paths
- [ ] Test on 5+ edge cases
- [ ] Version successful patterns
- [ ] Document assumptions and dependencies

## Anti-Patterns to Avoid

1. **Monolithic Runbooks**: Break complex flows into phases
2. **Implicit Dependencies**: Make all requirements explicit
3. **Creative Interpretation**: Runbooks should be deterministic
4. **State Accumulation**: Each execution should be independent
5. **Missing Verification**: Every step needs success criteria

## Performance Optimization

### Token Efficiency
- Use concise XML tags
- Compress context to essentials
- Batch similar operations
- Cache frequently used patterns

### Execution Speed
- Parallelize independent steps
- Use appropriate tools (Grep > Task for simple searches)
- Minimize file reads through smart searching
- Batch validation commands

## Measuring Success

### Key Metrics
- **Reproducibility**: Same runbook produces consistent results
- **Completion Rate**: Percentage of successful executions
- **Error Recovery**: Ability to handle edge cases
- **Efficiency**: Token usage and execution time

### Quality Indicators
- Clear error messages when failures occur
- Minimal human intervention required
- Consistent code style and patterns
- Comprehensive validation coverage

## Conclusion

Effective runbook agents in Claude Code combine structured prompting, atomic task decomposition, and deterministic execution. By treating agents as pure functions with clear boundaries, organizations can create reliable, scalable automation that reduces complexity while maximizing reproducibility.

The key is to start simple, test thoroughly, and iteratively refine based on real-world execution patterns. Focus on making runbooks so clear that any agent (or human) can execute them successfully without additional context.