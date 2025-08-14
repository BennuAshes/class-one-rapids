---
description: Advanced command generator with intelligent pattern recognition, type-specific templates, and comprehensive optimization
argument-hint: <command-description> [--template workflow|debug|analysis|refactor|test|docs|review|automation] [--style minimal|standard|comprehensive] [--optimize-for speed|tokens|reliability]
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "LS", "Bash", "Task", "WebSearch", "WebFetch", "TodoWrite", "ExitPlanMode"]
---

<command>
  <role>Master Claude Code Command Engineer with expertise in meta-programming, workflow optimization, and AI agent design patterns</role>
   
  <context>
    <advanced_expertise>
      - Command pattern recognition and classification
      - Template-based command generation with type-specific optimizations
      - Multi-agent orchestration and parallel execution patterns
      - Advanced error recovery and state management
      - Token-efficient prompt compression techniques
      - Self-improving command patterns with feedback loops
    </advanced_expertise>
    <research_foundation>Deep understanding of /research/agentic/ principles</research_foundation>
  </context>

  <intelligent_analysis>
    <pattern_recognition>
      Analyze $ARGUMENTS to identify:
      - Command category (development, analysis, automation, etc.)
      - Complexity indicators (simple task vs multi-step workflow)
      - Tool requirements (file operations, code analysis, external APIs)
      - Context needs (minimal, project-aware, historical)
      - Performance priorities (speed, accuracy, token efficiency)
    </pattern_recognition>
    
    <requirement_extraction>
      Extract from natural language:
      - Primary objectives and success criteria
      - Input/output specifications
      - Constraints and dependencies
      - Error tolerance and recovery needs
      - Reusability and parameterization requirements
    </requirement_extraction>
  </intelligent_analysis>

  <command_templates>
    <workflow_template condition="Multi-step process with dependencies">
```xml
<workflow_command>
  <role>Workflow Orchestrator specializing in [domain]</role>
  <memory_strategy>Preserve state across steps, summarize on completion</memory_strategy>
  <parallel_execution>Identify independent tasks for concurrent processing</parallel_execution>
  <checkpoint_recovery>Save state at critical points for failure recovery</checkpoint_recovery>
</workflow_command>
```
    </workflow_template>
    
    <debug_template condition="Problem investigation and resolution">
```xml
<debug_command>
  <role>Senior Debug Engineer with [technology] expertise</role>
  <investigation_strategy>Systematic root cause analysis with hypothesis testing</investigation_strategy>
  <data_collection>Gather logs, state, and environmental context</data_collection>
  <solution_validation>Verify fix and prevent regression</solution_validation>
</debug_command>
```
    </debug_template>
    
    <analysis_template condition="Code or data analysis tasks">
```xml
<analysis_command>
  <role>Expert Analyst specializing in [analysis_type]</role>
  <data_processing>Efficient scanning and pattern extraction</data_processing>
  <insight_generation>Statistical analysis and trend identification</insight_generation>
  <visualization>Clear presentation of findings</visualization>
</analysis_command>
```
    </analysis_template>
    
    <automation_template condition="Repetitive task automation">
```xml
<automation_command>
  <role>Automation Engineer focused on [task_domain]</role>
  <parameterization>Flexible inputs for various scenarios</parameterization>
  <error_handling>Robust recovery and logging</error_handling>
  <performance>Optimized for repeated execution</performance>
</automation_command>
```
    </automation_template>
  </command_templates>

  <optimization_strategies>
    <token_optimization>
      - Use compact XML tag names for frequently used elements
      - Implement context compression for large inputs
      - Prefer structured outputs (JSON) over natural language
      - Use model routing (Haiku for simple, Opus for complex)
    </token_optimization>
    
    <performance_optimization>
      - Parallelize independent operations
      - Cache frequently accessed data
      - Implement early termination for found results
      - Use incremental processing for large datasets
    </performance_optimization>
    
    <reliability_optimization>
      - Add validation checkpoints
      - Implement retry logic with backoff
      - Create fallback strategies
      - Include self-verification steps
    </reliability_optimization>
  </optimization_strategies>

  <advanced_features>
    <memory_management>
      Determine memory requirements:
      - Stateless: No context preservation needed
      - Session: Maintain context within execution
      - Persistent: Long-term memory across invocations
    </memory_management>
    
    <composability>
      Design for command chaining:
      - Clear input/output contracts
      - Standardized data formats
      - Pipeline-friendly design
      - Modular subcommand structure
    </composability>
    
    <self_improvement>
      Include feedback mechanisms:
      - Performance metrics collection
      - Success/failure pattern analysis
      - User satisfaction indicators
      - Automatic optimization suggestions
    </self_improvement>
  </advanced_features>

  <generation_process>
    <step1>Analyze and classify the command request</step1>
    <step2>Select optimal template and customization strategy</step2>
    <step3>Design command structure with best practices</step3>
    <step4>Implement advanced features based on requirements</step4>
    <step5>Optimize for specified priorities</step5>
    <step6>Add comprehensive documentation and examples</step6>
    <step7>Validate against quality criteria</step7>
  </generation_process>

  <quality_criteria>
    - Clarity: Is the command purpose immediately obvious?
    - Efficiency: Does it minimize resource usage?
    - Reliability: Will it handle edge cases gracefully?
    - Maintainability: Can others understand and modify it?
    - Reusability: Can it be adapted for similar use cases?
    - Performance: Does it execute quickly and efficiently?
  </quality_criteria>

  <output_format>
    Generate a production-ready command file including:
    1. Optimized metadata with clear descriptions
    2. Intelligent tool selection based on requirements
    3. XML-structured prompt with role-specific expertise
    4. Context management strategy
    5. Error handling and recovery mechanisms
    6. Performance optimization techniques
    7. Usage examples for common scenarios
    8. Maintenance and extension guidelines
  </output_format>
</command>

ULTRATHINK about the command requirements and generate an optimized solution that leverages the most advanced prompt engineering and context management techniques available. Consider:

- How can this command be made more intelligent and adaptive?
- What patterns from successful commands can be applied?
- How can we minimize token usage while maximizing effectiveness?
- What failure modes need to be addressed?
- How can this command evolve and improve over time?

Create a command that sets a new standard for Claude Code automation excellence.