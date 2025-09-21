# LLM Task Description Guide: Best Practices for Agent Instructions

*Research compilation date: 2025-09-17*

## Quick Reference: Key Principles

### Core Task Description Principles
1. **Be Specific and Clear** - Avoid ambiguity, use concrete language
2. **Provide Context** - Give role, background, and purpose
3. **Structure Instructions** - Break complex tasks into steps
4. **Define Output Format** - Specify exactly what you want
5. **Include Examples** - Show don't just tell
6. **Test and Iterate** - Validate effectiveness systematically

### The COSTAR Framework
- **C**ontext: Set the scene and background
- **O**bjective: Define what needs to be accomplished
- **S**tyle: Specify the approach or methodology
- **T**one: Set the communication style
- **A**udience: Define who the output is for
- **R**esponse: Specify the format and structure of output

## Frameworks and Methodologies

### 1. Structured Prompt Architecture

#### Role-Task-Specifics-Instructions (RTSI)
```
ROLE: You are [specific role with expertise]
TASK: [Clear, actionable task statement]
SPECIFICS: [Detailed requirements and constraints]
INSTRUCTIONS: [Step-by-step process to follow]
```

#### Situation-Action-Result (SAR)
```
SITUATION: [Context and background]
ACTION: [What the agent should do]
RESULT: [Expected outcome and format]
```

### 2. Chain of Thought (CoT) Prompting

**When to Use**: Complex reasoning, multi-step problems, calculations
**Implementation**: Add "Think step by step" or "Let's work through this systematically"

**Variations**:
- **Zero-Shot CoT**: "Let's think step by step"
- **Few-Shot CoT**: Provide examples showing reasoning process
- **Auto-CoT**: Let the model generate its own reasoning chain

### 3. Few-Shot Learning Design

**Guidelines**:
- Use 2-5 examples for most tasks
- Ensure examples are diverse and representative
- Include both input and ideal output
- Maintain consistent formatting across examples
- Quality over quantity - better examples trump more examples

**Template**:
```
Here are examples of the task:

Example 1:
Input: [sample input]
Output: [ideal response]

Example 2:
Input: [sample input]
Output: [ideal response]

Now complete this task:
Input: [actual input]
Output:
```

### 4. Advanced Prompting Techniques

#### Tree of Thoughts (ToT)
For complex decision-making requiring exploration of multiple paths:
```
Consider multiple approaches to this problem:
1. First approach: [reasoning path 1]
2. Second approach: [reasoning path 2]
3. Third approach: [reasoning path 3]

Evaluate each approach and select the best one.
```

#### Prompt Chaining
Breaking complex tasks across multiple prompts:
```
Step 1 Prompt: Analyze the problem and identify key components
Step 2 Prompt: Using the analysis from Step 1, develop potential solutions
Step 3 Prompt: Evaluate solutions and recommend the best approach
```

## Industry Best Practices

### OpenAI GPT Best Practices

1. **Write Clear Instructions**
   - Be specific about desired output length, format, style
   - Ask the model to adopt a persona
   - Use delimiters to clearly indicate distinct parts

2. **Provide Reference Text**
   - Include relevant documents or context
   - Cite sources to reduce hallucinations

3. **Split Complex Tasks into Simpler Subtasks**
   - Use intent classification for multi-purpose applications
   - Summarize or filter long conversations

4. **Give Models Time to "Think"**
   - Request reasoning before conclusions
   - Use "work out your own solution first" approach

5. **Use External Tools**
   - Compensate for model weaknesses
   - Integrate with retrieval systems, calculators, etc.

6. **Test Changes Systematically**
   - Evaluate on representative datasets
   - Measure performance improvements quantitatively

### Anthropic Claude Guidelines

1. **Detailed Context Setting**
   - Think of Claude as a newly-hired contractor
   - Provide all necessary background information
   - Be explicit about constraints and requirements

2. **XML Structuring**
   - Use XML tags like `<example>`, `<document>`, `<instructions>`
   - Claude was trained with XML formatting
   - Helps organize complex prompts clearly

3. **Prefilling Responses**
   - Start Claude's response to guide format
   - Ensure specific output structures
   - Control initial direction of response

4. **Thinking Time**
   - Allow Claude to think before responding
   - Use "Let me think through this step by step"
   - Improves quality for complex tasks

## Concrete Examples: Good vs Bad

### Example 1: Task Assignment

**❌ Bad**:
```
Write about climate change.
```

**✅ Good**:
```
ROLE: You are an environmental science communicator writing for business executives.

TASK: Create a 500-word brief on climate change impacts that will affect supply chain decisions in the next 5 years.

STRUCTURE:
1. Executive summary (2 sentences)
2. Top 3 climate risks to supply chains
3. Specific recommendations for mitigation
4. Timeline for implementation

TONE: Professional, data-driven, action-oriented
FORMAT: Business brief with bullet points and clear headings
```

### Example 2: Data Analysis

**❌ Bad**:
```
Analyze this data and tell me what you find.
```

**✅ Good**:
```
CONTEXT: You are a data analyst reviewing quarterly sales performance for a SaaS company.

TASK: Analyze the attached sales data to identify trends, anomalies, and opportunities.

ANALYSIS FRAMEWORK:
1. Calculate key metrics (MRR, churn rate, CAC)
2. Identify top 3 trends (positive and negative)
3. Flag any statistical anomalies requiring investigation
4. Recommend 3 specific actions for next quarter

OUTPUT FORMAT:
- Executive summary (3 bullet points)
- Detailed findings with supporting data
- Risk assessment (High/Medium/Low for each finding)
- Actionable recommendations with expected impact

CONSTRAINTS: Use only the provided data, note any limitations in the analysis.
```

### Example 3: Code Generation

**❌ Bad**:
```
Write a function to sort data.
```

**✅ Good**:
```
ROLE: You are a senior Python developer writing production-ready code.

TASK: Create a robust sorting function for user profile data in our web application.

REQUIREMENTS:
- Input: List of user dictionaries with keys: name, email, join_date, subscription_tier
- Sort by: subscription_tier (priority), then join_date (ascending)
- Handle: Missing fields, invalid data types, empty inputs
- Return: Sorted list with error handling

SPECIFICATIONS:
- Include comprehensive docstring
- Add type hints
- Include error handling for edge cases
- Write accompanying unit tests
- Follow PEP 8 style guidelines

EXAMPLE INPUT:
[{"name": "Alice", "email": "alice@example.com", "join_date": "2023-01-15", "subscription_tier": "premium"}]

DELIVERABLES:
1. Main function with documentation
2. Helper functions if needed
3. Unit test class
4. Usage example
```

## Common Patterns and Anti-Patterns

### ✅ Effective Patterns

1. **Context Laddering**
   ```
   Context: [Broad context]
   Specific Situation: [Narrow context]
   Your Role: [Specific expertise needed]
   Task: [Exact requirement]
   ```

2. **Constraint Definition**
   ```
   Must include: [Required elements]
   Must avoid: [Prohibited content]
   Format requirements: [Structure/length/style]
   Success criteria: [How to measure quality]
   ```

3. **Progressive Disclosure**
   ```
   First, understand [high-level goal]
   Then, focus on [specific aspect]
   Finally, deliver [concrete output]
   ```

### ❌ Anti-Patterns to Avoid

1. **Vague Instructions**
   - "Make it better"
   - "Do something creative"
   - "Help me with this"

2. **Conflicting Requirements**
   - "Be comprehensive but brief"
   - "Be creative but follow this exact template"
   - "Consider all options but give one answer"

3. **Assumption-Heavy Prompts**
   - Assuming the model knows your domain
   - Not defining technical terms
   - Expecting knowledge of your specific context

4. **Output Format Ambiguity**
   - Not specifying structure
   - Unclear length requirements
   - Mixing different output types

## Implementation Guidelines

### 1. Task Analysis Phase

**Questions to Ask**:
- What is the end goal?
- Who is the audience?
- What level of detail is needed?
- What format works best?
- What constraints exist?
- What would success look like?

**Documentation Template**:
```markdown
## Task Definition
**Objective**: [Clear goal statement]
**Success Metrics**: [How to measure success]
**Constraints**: [Limitations and requirements]
**Context**: [Background information needed]

## Agent Specifications
**Role**: [Expertise and perspective needed]
**Tone**: [Communication style]
**Approach**: [Methodology to use]

## Output Requirements
**Format**: [Structure and presentation]
**Length**: [Specific length requirements]
**Elements**: [Required components]
```

### 2. Prompt Development Process

1. **Draft Initial Prompt** (5 minutes)
   - Basic structure and requirements
   - Include key constraints and context

2. **Test with Sample Inputs** (15 minutes)
   - Try 3-5 different realistic scenarios
   - Note where the output falls short

3. **Refine Based on Results** (10 minutes)
   - Add missing context
   - Clarify ambiguous instructions
   - Adjust output format requirements

4. **Validate with Edge Cases** (10 minutes)
   - Test with minimal input
   - Try with complex/unusual input
   - Check for consistent behavior

5. **Optimize for Efficiency** (5 minutes)
   - Remove unnecessary words
   - Ensure key information is prominent
   - Check that examples are clear

### 3. Testing and Validation Strategies

#### A/B Testing for Prompts
```python
# Example evaluation framework
test_cases = [
    {"input": "sample_input_1", "expected_output_type": "analysis"},
    {"input": "sample_input_2", "expected_output_type": "recommendation"},
]

prompt_variants = {
    "version_a": "original_prompt",
    "version_b": "improved_prompt"
}

# Measure: accuracy, relevance, format compliance, usefulness
```

#### Quality Metrics
- **Accuracy**: Does it produce correct information?
- **Relevance**: Does it address the actual need?
- **Completeness**: Does it cover all required elements?
- **Clarity**: Is the output easy to understand?
- **Consistency**: Does it behave predictably across inputs?
- **Efficiency**: Does it produce results in reasonable time?

## Tool-Specific Recommendations

### For Code Generation Agents

**Essential Elements**:
- Programming language specification
- Code style and formatting requirements
- Error handling expectations
- Testing requirements
- Documentation standards

**Template**:
```
ROLE: Senior [Language] developer
CONTEXT: [Project context and architecture]
TASK: [Specific coding requirement]

REQUIREMENTS:
- Language: [Specific version]
- Dependencies: [Allowed/required libraries]
- Style: [Coding standards to follow]
- Testing: [Test coverage expectations]
- Documentation: [Documentation requirements]

DELIVERABLES:
1. Implementation code
2. Unit tests
3. Documentation/comments
4. Usage examples
```

### For Research and Analysis Agents

**Essential Elements**:
- Scope of research
- Quality of sources required
- Analysis framework
- Synthesis requirements
- Citation standards

**Template**:
```
ROLE: Research analyst specializing in [domain]
OBJECTIVE: [Research question or goal]

SCOPE:
- Focus areas: [Specific topics to cover]
- Source requirements: [Quality/type of sources]
- Time period: [Relevant timeframe]
- Geographic scope: [If applicable]

METHODOLOGY:
1. [Research approach]
2. [Analysis framework]
3. [Synthesis method]

OUTPUT STRUCTURE:
- Executive summary
- Key findings (with evidence)
- Analysis and insights
- Recommendations
- Source citations
```

### For Customer Service Agents

**Essential Elements**:
- Brand voice and personality
- Escalation procedures
- Knowledge boundaries
- Response templates
- Compliance requirements

**Template**:
```
ROLE: Customer service representative for [Company]

PERSONALITY:
- Tone: [Professional, friendly, empathetic]
- Style: [Conversational, formal, casual]
- Values: [Company values to embody]

CAPABILITIES:
- Can help with: [List of supported topics]
- Cannot help with: [Out of scope items]
- Escalation triggers: [When to involve humans]

RESPONSE FRAMEWORK:
1. Acknowledge the customer's concern
2. Provide clear, helpful information
3. Offer next steps or solutions
4. Ensure customer satisfaction

COMPLIANCE:
- Data privacy requirements
- Legal disclaimers needed
- Regulatory considerations
```

### For Creative Content Agents

**Essential Elements**:
- Brand guidelines
- Content style requirements
- Target audience definition
- Platform-specific considerations
- Content goals and KPIs

**Template**:
```
ROLE: Creative content specialist for [Brand/Platform]

BRAND VOICE:
- Personality: [Brand personality traits]
- Tone: [Communication tone]
- Values: [Core brand values]

CONTENT REQUIREMENTS:
- Platform: [Social media, blog, email, etc.]
- Format: [Text, video script, infographic, etc.]
- Length: [Specific length requirements]
- Audience: [Target demographic and psychographics]

CREATIVE GUIDELINES:
- Style elements to include
- Visual/textual motifs
- Call-to-action requirements
- Hashtag/keyword requirements

SUCCESS METRICS:
- Engagement targets
- Brand alignment score
- Message clarity rating
```

## Security and Safety Considerations

### Prompt Injection Prevention

**Input Validation**:
```
Before processing user input:
1. Validate input format and length
2. Sanitize special characters
3. Check for injection patterns
4. Apply content filters
```

**Output Monitoring**:
```
Monitor agent outputs for:
- Inappropriate content
- Sensitive information disclosure
- Policy violations
- Unexpected behavior patterns
```

**Safe Prompt Design**:
```
ROLE: [Define clear boundaries]
CAPABILITIES: [Explicitly list what agent can/cannot do]
ESCALATION: [Define when to seek human oversight]
SAFETY: [Include safety constraints and guidelines]
```

### Content Filtering Framework

```markdown
## Content Guidelines
**Allowed Topics**: [Explicitly list permitted subjects]
**Restricted Topics**: [List prohibited or sensitive areas]
**Quality Standards**: [Define minimum quality requirements]
**Fact-Checking**: [Specify verification requirements]

## Response Validation
Before providing output, ensure:
- [ ] Content aligns with stated purpose
- [ ] No sensitive information disclosed
- [ ] Appropriate tone and language used
- [ ] Facts are verifiable or marked as uncertain
- [ ] Response serves user's legitimate needs
```

## Advanced Topics

### Multi-Modal Task Design

For agents handling text, images, audio, or other media:

```
MULTI-MODAL TASK TEMPLATE:

INPUT SPECIFICATIONS:
- Text: [Format and length requirements]
- Images: [Resolution, format, content requirements]
- Audio: [Duration, quality, format specifications]

PROCESSING REQUIREMENTS:
- Cross-modal analysis needed
- Integration requirements between modalities
- Priority ranking of different input types

OUTPUT SPECIFICATIONS:
- Primary output format
- Secondary formats if needed
- How different modalities should be combined
```

### Context Window Management

For long-form or multi-turn conversations:

```
CONTEXT MANAGEMENT STRATEGY:

MEMORY STRUCTURE:
- Core context: [Always retain]
- Session context: [Maintain during conversation]
- Temporary context: [Short-term working memory]

PRIORITIZATION RULES:
1. Mission-critical information
2. Recent conversation context
3. User preferences and history
4. Background knowledge

COMPRESSION STRATEGIES:
- Summarization triggers
- Information hierarchies
- Context refresh points
```

### Performance Optimization

**Latency Optimization**:
```
EFFICIENCY GUIDELINES:
- Front-load critical instructions
- Use clear, unambiguous language
- Minimize unnecessary context
- Structure for parallel processing where possible
- Include early stopping criteria
```

**Quality vs Speed Trade-offs**:
```
PERFORMANCE MODES:
- Fast Mode: [Simplified processing, basic quality]
- Standard Mode: [Balanced approach]
- High Quality Mode: [Comprehensive analysis, detailed output]

MODE SELECTION CRITERIA:
- Task complexity
- Time constraints
- Quality requirements
- Resource availability
```

## Conclusion

Effective LLM task description requires a systematic approach combining clear communication, structured frameworks, and iterative refinement. The key is treating prompt engineering as a design discipline with measurable outcomes rather than ad-hoc instruction writing.

**Remember**: The best prompts are specific, testable, and aligned with clear success criteria. Start with proven frameworks, customize for your specific use case, and continuously optimize based on empirical results.

## Additional Resources

### Official Documentation
- [Anthropic Claude Prompt Engineering Guide](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
- [OpenAI GPT Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

### Research Papers
- "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Wei et al.)
- "Instruction-Following Evaluation for Large Language Models" (Zhou et al.)
- "Guidelines for Empirical Studies in Software Engineering involving Large Language Models"

### Frameworks and Tools
- COSTAR Framework by Sheila Teo
- DSPy Framework (Stanford)
- Microsoft Semantic Kernel
- LangChain Prompt Templates

---

*This guide synthesizes current best practices as of September 2025 and should be updated regularly as the field evolves rapidly.*