---
description: Compress research folder into implementation-focused, LLM-optimized context using hierarchical pattern extraction
argument-hint: <research-folder-path> [output-filename]
allowed-tools: ["Read", "Write", "LS", "Glob"]
---

<command>
  <role>Research Compression Specialist with expertise in LLM context optimization, pattern extraction, and semantic compression</role>
  
  <context>
    <compression_principles>
      - Markdown is 15% more token-efficient than JSON
      - Hierarchical loading (L0-L4) for progressive context
      - Pattern language format preserves semantic meaning
      - Negative examples prevent misinterpretation
      - Tables provide highest information density
    </compression_principles>
    <filtering_criteria>
      - Implementation patterns and technical solutions
      - Best practices and anti-patterns
      - Tools, libraries, and dependencies
      - Performance metrics and benchmarks
      - Architecture decisions and trade-offs
    </filtering_criteria>
    <exclusions>
      - Marketing language and promotional content
      - Historical context without practical relevance
      - Redundant explanations and verbose descriptions
      - Non-technical background information
      - Generic introductions and conclusions
    </exclusions>
  </context>

  <extraction_strategy>
    <pattern_identification>
      Scan for implementation patterns using markers:
      - Solution indicators: "implement", "use", "apply", "configure"
      - Pattern markers: "pattern", "approach", "technique", "method"
      - Best practice signals: "should", "must", "recommended", "optimal"
      - Anti-pattern warnings: "avoid", "don't", "never", "instead of"
      - Tool mentions: package names, libraries, frameworks
      - Metric indicators: percentages, performance numbers, benchmarks
    </pattern_identification>
    
    <semantic_clustering>
      Group related information into clusters:
      - Architecture patterns
      - State management approaches
      - Performance optimizations
      - Security considerations
      - Testing strategies
      - Deployment patterns
    </semantic_clustering>
    
    <importance_scoring>
      Score content based on:
      - Frequency of mention across files
      - Presence of "critical", "essential", "required" markers
      - Concrete implementation examples
      - Quantified benefits or metrics
      - Direct applicability to implementation
    </importance_scoring>
  </extraction_strategy>

  <compression_techniques>
    <hierarchical_structure>
```markdown
# L0: Index (10 tokens)
Pattern names only for quick reference

# L1: Critical (100 tokens)  
Essential patterns with implementation path

# L2: Implementation (500 tokens)
Detailed patterns with examples and anti-patterns

# L3: Deep Context (2000 tokens)
Complete reference with all extracted patterns

# L4: Source Links
References to original research files
```
    </hierarchical_structure>
    
    <pattern_template>
```markdown
## Pattern: [Name]
**Intent**: [Why use it - 10 words max]
**Solution**: [Implementation approach - 20 words max]
**Anti-pattern**: [What to avoid - 10 words max]
**Example**: [Concrete implementation reference]
**Metrics**: [Performance/benefit if available]
```
    </pattern_template>
    
    <compression_rules>
      - Convert verbose descriptions to bullet points
      - Replace examples with references unless critical
      - Combine similar patterns into single entries
      - Use abbreviations for common terms
      - Preserve exact tool names and versions AS WRITTEN
      - Maintain critical numbers and metrics FROM SOURCE ONLY
      - NEVER infer or add metrics not explicitly in the text
      - Mark uncertain extractions with [?] for review
    </compression_rules>
  </compression_techniques>

  <output_structure>
    <metadata>
```markdown
# Research Compression Summary
*Generated: [timestamp]*
*Source: [research-folder]*
*Files processed: [count]*
*Compression ratio: [original/compressed tokens]*
```
    </metadata>
    
    <quick_reference>
```markdown
## Quick Reference Table
| Category | Key Patterns | Priority | Confidence |
|----------|-------------|----------|------------|
| [category] | [pattern1, pattern2] | Critical/High/Medium | ✅✅✅/✅✅/✅ |
```
    </quick_reference>
    
    <hierarchical_content>
      Generate L0 through L3 sections based on importance scores
      Include source file references for traceability
    </hierarchical_content>
    
    <implementation_checklist>
```markdown
## Implementation Checklist
- [ ] Critical patterns identified
- [ ] Dependencies and versions noted
- [ ] Anti-patterns documented
- [ ] Performance metrics included
- [ ] Source references preserved
```
    </implementation_checklist>
  </output_structure>

  <execution_plan>
    <step1>Scan research folder and list all files</step1>
    <step2>Read and analyze each file for implementation content</step2>
    <step3>Extract patterns using identification markers</step3>
    <step4>Score and cluster extracted information</step4>
    <step5>Apply compression techniques based on importance</step5>
    <step6>Generate hierarchical output structure</step6>
    <step7>Calculate compression metrics</step7>
    <step8>Write optimized output file</step8>
  </execution_plan>

  <quality_validation>
    - Verify no marketing/promotional content included
    - Ensure all critical implementation details preserved
    - Confirm compression ratio achieves >80% reduction
    - Validate pattern format consistency
    - Check source traceability maintained
    - CRITICAL: Verify ALL metrics, numbers, and targets come from source files
    - NEVER add assumed values or industry standards not in the research
    - Every technical claim must have a source file reference
  </quality_validation>
</command>

# Research Compression Command

ANALYZE the research folder at: $ARGUMENTS

## Process Instructions:

1. **Discovery Phase**
   - List all files in the research folder
   - Identify file types and structure
   - Estimate total token count

2. **Extraction Phase**
   - Read each file systematically
   - Extract ONLY implementation-relevant content:
     - Technical patterns and solutions
     - Concrete tools and libraries with versions
     - Performance metrics and benchmarks
     - Best practices and anti-patterns
     - Architecture decisions
   - EXCLUDE:
     - Marketing language
     - Historical background
     - Generic descriptions
     - Redundant explanations

3. **Compression Phase**
   Apply these techniques from /research/agentic/:
   - Pattern language format (name/intent/solution/anti-pattern)
   - Hierarchical compression (L0-L3)
   - Semantic clustering by topic
   - Frequency-based importance scoring
   - Template-based compression

4. **Output Generation**
   Create a single markdown file with:
   - Quick reference table (highest density)
   - L0: Pattern index (10 tokens)
   - L1: Critical patterns (100 tokens)
   - L2: Implementation guide (500 tokens)
   - L3: Complete reference (2000 tokens)
   - Source file mappings

5. **Optimization**
   - Use tables for repeated structures
   - Apply consistent abbreviations
   - Remove redundant context
   - Preserve exact technical terms

## Expected Output Format:

```markdown
# [Research Topic] - Implementation Reference
*Compressed from X files (Y tokens → Z tokens, N% reduction)*

## Quick Reference
| Pattern | Implementation | Avoid | Confidence |
|---------|---------------|-------|------------|
| ... | ... | ... | ✅✅✅ |

## L0: Index (10 tokens)
[pattern-names-only]

## L1: Critical Patterns (100 tokens)
[essential-patterns-with-brief-implementation]

## L2: Implementation Guide (500 tokens)
[detailed-patterns-with-examples]

## L3: Complete Reference (2000 tokens)
[all-patterns-with-full-context]

## Source References
- Pattern X: file.md:123-145
- Pattern Y: file2.md:67-89
```

Generate the compressed research output optimized for Claude Code consumption, achieving maximum information density while preserving all implementation-critical details.

## CRITICAL EXTRACTION RULES:
1. **ONLY include information explicitly stated in source files**
2. **NEVER add general knowledge or assumptions**
3. **Every metric, number, or target MUST come from the research**
4. **If a common metric (like fps, memory limits) isn't in the files, DON'T include it**
5. **When in doubt, leave it out**
6. **All technical claims need source file + line number references**