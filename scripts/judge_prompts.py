"""
LLM-as-Judge prompt templates for artifact evaluation

These prompts are designed to produce consistent, structured evaluations
of PRDs, Technical Designs, and Task Lists.
"""

# PRD Evaluation Prompt
PRD_JUDGE_PROMPT = """You are an expert product manager evaluating a Product Requirements Document (PRD) for quality.

Evaluate the PRD on the following criteria using a 0-10 scale:

1. **Completeness** (0-10): Does the PRD include all necessary sections?
   - Goals and objectives
   - Scope (in-scope and out-of-scope items)
   - Functional and non-functional requirements
   - Success metrics
   - Technical considerations
   - Dependencies
   - Timeline

2. **Clarity** (0-10): Is the language clear, specific, and unambiguous?
   - Clear problem definition
   - Specific, measurable requirements
   - No ambiguous or vague statements
   - Consistent terminology

3. **Technical Depth** (0-10): Is there sufficient technical detail?
   - Technical constraints identified
   - Technology stack considerations
   - Integration points defined
   - Security and performance requirements

4. **Overall Quality**: Provide an overall assessment
   - "excellent": Outstanding quality, ready for implementation
   - "good": Solid quality with minor gaps
   - "needs_improvement": Significant gaps or clarity issues
   - "poor": Major deficiencies, requires substantial rework

PRD to evaluate:
{prd_content}

Respond ONLY with valid JSON in this exact format:
{{
  "completeness": <score 0-10>,
  "clarity": <score 0-10>,
  "technical_depth": <score 0-10>,
  "overall": "<excellent|good|needs_improvement|poor>",
  "reasoning": "<brief 1-2 sentence explanation of the scores>"
}}
"""

# Design Evaluation Prompt
DESIGN_JUDGE_PROMPT = """You are an expert software architect evaluating a Technical Design Document for quality.

Evaluate the design on the following criteria using a 0-10 scale:

1. **Architecture** (0-10): Is the system architecture well-designed?
   - Clear component breakdown
   - Logical separation of concerns
   - Scalability considerations
   - Architecture diagrams or descriptions

2. **Feasibility** (0-10): Is the design practical and implementable?
   - Realistic timeline
   - Available technology choices
   - Team capabilities considered
   - Risk assessment

3. **Completeness** (0-10): Are all necessary design elements present?
   - Data models defined
   - API specifications
   - Interface contracts
   - Deployment strategy
   - Testing approach

4. **Security**: Does the design address security considerations?
   - Boolean: true if security section exists and is substantive, false otherwise

5. **Overall Quality**: Provide an overall assessment
   - "excellent": Outstanding design, ready for implementation
   - "good": Solid design with minor gaps
   - "needs_improvement": Significant design flaws or gaps
   - "poor": Major architectural issues, requires redesign

Design to evaluate:
{design_content}

Respond ONLY with valid JSON in this exact format:
{{
  "architecture": <score 0-10>,
  "feasibility": <score 0-10>,
  "completeness": <score 0-10>,
  "has_security": <true|false>,
  "overall": "<excellent|good|needs_improvement|poor>",
  "reasoning": "<brief 1-2 sentence explanation of the scores>"
}}
"""

# Tasks Evaluation Prompt
TASKS_JUDGE_PROMPT = """You are an expert engineering manager evaluating a Task List for implementation quality.

Evaluate the task list on the following criteria using a 0-10 scale:

1. **Actionability** (0-10): Are the tasks specific and executable?
   - Clear, actionable descriptions
   - Single responsibility per task
   - No vague or ambiguous tasks
   - Reasonable scope per task

2. **Completeness** (0-10): Do the tasks cover all aspects of the design?
   - All features addressed
   - Database, API, and UI tasks included
   - Testing tasks present
   - Deployment considerations

3. **Clarity** (0-10): Are task descriptions clear and detailed?
   - Unambiguous instructions
   - Context provided
   - Dependencies noted
   - Estimated effort included

4. **Acceptance Criteria**: Do tasks have clear completion criteria?
   - Boolean: true if most tasks have defined acceptance criteria, false otherwise

5. **Overall Quality**: Provide an overall assessment
   - "excellent": Outstanding task list, ready for execution
   - "good": Solid task list with minor gaps
   - "needs_improvement": Significant gaps in clarity or coverage
   - "poor": Tasks are too vague or incomplete

Task list to evaluate:
{tasks_content}

Respond ONLY with valid JSON in this exact format:
{{
  "actionability": <score 0-10>,
  "completeness": <score 0-10>,
  "clarity": <score 0-10>,
  "has_criteria": <true|false>,
  "overall": "<excellent|good|needs_improvement|poor>",
  "reasoning": "<brief 1-2 sentence explanation of the scores>"
}}
"""


def format_prd_judge_prompt(prd_content: str) -> str:
    """
    Format PRD judge prompt with actual PRD content
    
    Args:
        prd_content: The PRD text to evaluate
        
    Returns:
        Formatted prompt ready for LLM
    """
    return PRD_JUDGE_PROMPT.format(prd_content=prd_content)


def format_design_judge_prompt(design_content: str) -> str:
    """
    Format Design judge prompt with actual design content
    
    Args:
        design_content: The design document text to evaluate
        
    Returns:
        Formatted prompt ready for LLM
    """
    return DESIGN_JUDGE_PROMPT.format(design_content=design_content)


def format_tasks_judge_prompt(tasks_content: str) -> str:
    """
    Format Tasks judge prompt with actual tasks content
    
    Args:
        tasks_content: The task list text to evaluate
        
    Returns:
        Formatted prompt ready for LLM
    """
    return TASKS_JUDGE_PROMPT.format(tasks_content=tasks_content)


