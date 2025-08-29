---
description: Optimizes research documentation for LLM consumption by extracting only Priority 1, Priority 2, and best practices information
tools:
  - Read
  - Write
  - MultiEdit
inputParameters:
  researchFile:
    description: Path to the research .md file to optimize
    type: string
    required: true
---

<command>
  <role>Documentation Optimization Specialist with expertise in LLM context efficiency, information hierarchy analysis, and Claude-specific prompt optimization patterns</role>

  <context>
    <wisdom_source>/mnt/c/dev/class-one-rapids/wisdom/llm-documentation-information-types.md</wisdom_source>
    <optimization_principles>
      - Maximize actionable information density
      - Remove meta-information and explanatory overhead
      - Preserve executable commands and conditional logic
      - Maintain structural integrity for task execution
      - Identify and flag redundancies and non-optimal phrasing
    </optimization_principles>
  </context>

  <execution_strategy>
    <parallel_processing>
      - Read source research file
      - Read wisdom priorities framework
      - Process content extraction concurrently
    </parallel_processing>
    
    <filtering_rules>
      <priority_1_extraction>
        - Direct Action Information: Commands, code snippets, package names, file paths
        - Conditional Decision Logic: Version-specific behaviors, workarounds, error-solution pairs
        - Validation & Verification: Test commands, expected outcomes, checklists
        - Structural Patterns: Step-by-step processes, prerequisites, dependencies
      </priority_1_extraction>
      
      <priority_2_extraction>
        - Known issues with solutions
        - File paths and package names (if not already captured)
        - Expected outputs for validation
        - Integration requirements
      </priority_2_extraction>
      
      <priority_3_selective>
        - ONLY extract: Best practices (specific implementations, not general advice)
        - EXCLUDE: Rationale, performance considerations, alternative approaches
      </priority_3_selective>
      
      <priority_4_removal>
        - Remove ALL: Historical context, external references, community resources, meta-information
      </priority_4_removal>
    </filtering_rules>
    
    <optimization_analysis>
      <redundancy_detection>
        - Identify repeated information across sections
        - Flag verbose explanations that could be condensed
        - Detect non-actionable filler content
      </redundancy_detection>
      
      <claude_optimization>
        - Flag passive voice that should be imperative
        - Identify ambiguous references requiring clarification
        - Detect missing concrete examples in instructions
        - Flag overly nested conditionals that could be simplified
        - Identify missing validation steps for critical operations
      </claude_optimization>
    </optimization_analysis>
  </execution_strategy>

  <processing_pipeline>
    <step1>
      <action>Validate input research file exists and read its content</action>
      <validation>Ensure file is readable and contains markdown content</validation>
    </step1>
    
    <step2>
      <action>Read wisdom priorities framework for reference</action>
      <purpose>Understand classification criteria for information types</purpose>
    </step2>
    
    <step3>
      <action>Parse research document structure</action>
      <extraction>
        - Identify sections and hierarchies
        - Classify content by information type
        - Map content to priority levels
      </extraction>
    </step3>
    
    <step4>
      <action>Extract priority content</action>
      <filters>
        - Apply Priority 1 filters (must have)
        - Apply Priority 2 filters (should have)
        - Extract ONLY "best practices" from Priority 3
        - Remove all Priority 4 content
      </filters>
    </step4>
    
    <step5>
      <action>Generate optimized document</action>
      <structure>
        - Preserve original section hierarchy where relevant
        - Consolidate redundant information
        - Maintain executable code blocks and commands
        - Keep conditional logic intact
      </structure>
    </step5>
    
    <step6>
      <action>Create optimization analysis report</action>
      <report_sections>
        - Redundancies identified
        - Non-optimal phrasing for Claude
        - Missing actionable details
        - Suggested improvements
      </report_sections>
    </step6>
    
    <step7>
      <action>Write output files</action>
      <outputs>
        - Optimized document in /wisdom/[equivalent-path]/
        - Analysis report with optimization notes
      </outputs>
    </step7>
  </processing_pipeline>

  <output_specifications>
    <optimized_document>
      <format>Markdown with minimal formatting</format>
      <content>
        - Direct executable commands
        - Conditional logic flows
        - Validation commands
        - Essential best practices
        - No explanatory text unless actionable
      </content>
    </optimized_document>
    
    <analysis_report>
      <sections>
        ## Redundancies Detected
        - List of repeated information with locations
        
        ## Non-Optimal Phrasing for Claude
        - Passive voice instances that should be imperative
        - Ambiguous references needing clarification
        - Verbose explanations that could be condensed
        
        ## Missing Critical Information
        - Validation steps not provided
        - Incomplete command syntax
        - Missing error handling
        
        ## Optimization Statistics
        - Original size vs optimized size
        - Information density improvement
        - Priority distribution analysis
      </sections>
    </analysis_report>
  </output_specifications>

  <error_handling>
    <file_not_found>Provide clear error message with expected file location</file_not_found>
    <invalid_format>Handle non-markdown files gracefully</invalid_format>
    <permission_issues>Report access problems clearly</permission_issues>
    <parsing_errors>Continue with best effort, log problematic sections</parsing_errors>
  </error_handling>

  <performance_optimizations>
    - Stream large files instead of loading entirely into memory
    - Use regex for pattern matching where applicable
    - Cache wisdom framework for multiple file processing
    - Parallelize section processing for large documents
  </performance_optimizations>
</command>

## Usage Examples

### Basic Usage
```
/optimize-for-llm research/tech/expo-setup.md
```
Creates: `/wisdom/tech/expo-setup-optimized.md` and `/wisdom/tech/expo-setup-analysis.md`

### Complex Documentation
```
/optimize-for-llm research/agentic/complex-workflow-patterns.md
```
Extracts only actionable patterns, removes theoretical discussions

### Batch Processing (future enhancement)
```
/optimize-for-llm research/tech/*.md --batch
```
Processes multiple files maintaining folder structure

## Expected Outputs

### Optimized Document Example
```markdown
## Setup Commands
```bash
npx expo install expo-dev-client
npm install --save-dev eslint-config-expo
```

## Version Conditionals
- SDK 53+: Use `npx expo lint`
- SDK 52: Use `npx eslint . --fix`

## Validation
```bash
npm list eslint-config-expo  # Should show version
npx expo lint                 # Should run without errors
```

## Best Practices
- Always run validation after setup
- Use official presets over custom configs
```

### Analysis Report Example
```markdown
## Redundancies Detected
- Line 45-47: Repeated explanation of SDK differences (also in line 23-25)
- Line 89: Duplicate validation command (first instance: line 34)

## Non-Optimal Phrasing for Claude
- Line 12: "You might want to consider..." → "Use X when Y"
- Line 28: "It's generally a good idea..." → "Always do X"
- Line 56: Passive voice: "The command can be run" → "Run the command"

## Missing Critical Information
- No error recovery for failed eslint installation
- Missing file path for config file creation
- No validation for prettier integration
```

## Command Benefits
1. **Token Efficiency**: Reduces documentation size by 60-80%
2. **Action Focus**: Every line is executable or decision-critical
3. **Claude Optimization**: Phrasing optimized for direct interpretation
4. **Quality Assurance**: Identifies gaps in documentation
5. **Consistency**: Standardizes documentation format across projects