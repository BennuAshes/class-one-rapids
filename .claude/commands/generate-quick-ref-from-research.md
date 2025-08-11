---
description: Generate optimized quick-ref.md from research files using context engineering best practices
argument-hint: [output-file]
---

<command>
  <role>Context Engineering Specialist with expertise in LLM optimization and research synthesis</role>
  
  <context>
    <expertise>
      - Information compression with semantic preservation
      - Pattern Language documentation (Gang of Four format)
      - Hierarchical context loading (L1/L2/L3 patterns)
      - Token efficiency optimization for Claude
      - Markdown table formatting for LLMs
    </expertise>
    
    <guidelines>
      - Follow research from /research/agentic/llm-optimized-research-architecture.md
      - Apply compression strategies from /research/agentic/compression-strategy-analysis.md
      - Use Pattern Language format from /research/agentic/pattern-template-formal-terminology.md
      - Implement hierarchical loading as documented
    </guidelines>
  </context>
  
  <task>
    <objective>Generate an optimized quick-ref.md that preserves semantic meaning while achieving 90%+ token reduction</objective>
    
    <process>
      <step1>Read all research files in /research/ (excluding /research/agentic/)</step1>
      <step2>Extract patterns WITH their implementation details (not just names)</step2>
      <step3>Identify critical packages with versions and reasons</step3>
      <step4>Create hierarchical levels (L1: Critical, L2: Implementation, L3: Reference)</step4>
      <step5>Generate markdown tables for maximum token efficiency</step5>
      <step6>Include anti-patterns to prevent common mistakes</step6>
    </process>
  </task>
  
  <requirements>
    <pattern_extraction>
      For each architectural pattern found, extract:
      - Pattern name (the term)
      - Intent (why use it)
      - Implementation (how - with concrete examples)
      - Anti-pattern (what NOT to do - with examples)
      
      Example:
      ```
      | Pattern | Intent | Implementation | Anti-Pattern |
      |---------|--------|----------------|--------------|
      | vertical-slicing | Independent features | features/{name}/state/store.ts | NOT: core/state/gameStore.ts |
      ```
    </pattern_extraction>
    
    <package_documentation>
      For each critical package, include:
      - Package name with EXACT version
      - Key benefit (why use it)
      - Critical gotcha (what to watch for)
      
      Example:
      ```
      | Package | Version | Benefit | Watch Out |
      |---------|---------|---------|-----------|
      | @legendapp/state | @beta | 40% perf boost | Metro config needed |
      ```
    </package_documentation>
    
    <hierarchical_structure>
      L1: Critical (50-100 tokens) - ALWAYS loaded
      - Top 5 packages with versions
      - Top 5 patterns with implementation hints
      - Critical anti-patterns
      
      L2: Implementation (200-500 tokens) - Loaded for development
      - Full pattern descriptions with examples
      - Package configuration snippets
      - Common fixes and solutions
      
      L3: Reference (links only) - For deep dives
      - Links to source research files with line numbers
      - Full examples in research docs
    </hierarchical_structure>
  </requirements>
  
  <output_format>
    <structure>
      ```markdown
      # Quick-Ref (Context-Engineered)
      *Generated: [date]*
      *Method: LLM synthesis with semantic preservation*
      
      ## L1: CRITICAL (Always Load) ~[token count]
      
      ### Essential Packages
      [markdown table with package, version, benefit, gotcha]
      
      ### Core Patterns
      [markdown table with pattern, intent, implementation, anti-pattern]
      
      ## L2: IMPLEMENTATION (Development) ~[token count]
      
      ### Pattern Details
      [Expanded pattern descriptions with code examples]
      
      ### Configuration Examples
      [Key configs extracted from research]
      
      ## L3: REFERENCE (Deep Dive)
      
      ### Source Documents
      [Links to research files with specific line numbers]
      ```
    </structure>
    
    <quality_checks>
      - Each pattern MUST have implementation details (not just the name)
      - Anti-patterns MUST have concrete examples
      - Package versions MUST be exact (including @beta tags)
      - Token counts MUST be included for each section
      - Examples MUST show both correct and incorrect approaches
    </quality_checks>
  </output_format>
  
  <validation>
    After generating, verify:
    1. Would a developer reading ONLY L1 understand the core architecture?
    2. Does each pattern have enough context to prevent misimplementation?
    3. Are anti-patterns clear enough to avoid mistakes like centralized gameStore?
    4. Is the total L1 section under 200 tokens?
    5. Does L2 provide enough detail for implementation without reading full research?
  </validation>
</command>

## Instructions

Read all research files in `/research/` (except `/research/agentic/` which contains meta-research about this process) and synthesize an optimized quick-ref.md following the context engineering best practices documented in the agentic research itself.

The key innovation: Extract patterns with their FULL CONTEXT (intent, implementation, anti-pattern) not just their names. This prevents the "vertical slicing → gameStore.ts" mistake.

Use markdown tables for maximum token efficiency and organize content hierarchically for progressive loading.

The output file should be saved to: ${1:-/research/quick-ref.md}