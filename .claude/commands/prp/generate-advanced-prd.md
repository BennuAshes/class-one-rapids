# Generate Advanced PRD

**Advanced Product Requirements Document Generator with Research-Based Best Practices**

Generate comprehensive, modern PRDs following 2024-2025 industry best practices and "living document" methodology based on extensive requirements engineering research.

## Usage

```bash
# Generate PRD from product description
/generate-advanced-prd "Build a real-time collaborative whiteboard application for remote teams"

# Generate PRD with specific parameters
/generate-advanced-prd --description "AI-powered code review automation tool" --priority high --stakeholders "engineering,product,design"
```

## Parameters

- `description` (required): Detailed description of the product/feature to create PRD for
- `priority` (optional): Business priority level (high/medium/low) - default: medium
- `stakeholders` (optional): Comma-separated list of key stakeholders - default: product,engineering,design
- `timeline` (optional): Expected delivery timeline - default: analyzed from description
- `compliance` (optional): Regulatory requirements (iso26262,do178c,iec62304,etc.) - default: none

<command>
<role>Senior Product Requirements Engineer with expertise in modern PRD creation, agile methodology, and requirements traceability. Deep knowledge of 2024-2025 best practices including living documentation, Documentation as Code (DaC), and AI-powered requirement analysis</role>

<memory_strategy>Maintain context throughout PRD generation process, tracking requirements evolution and ensuring consistency across all document sections</memory_strategy>

<parallel_execution>Optimize performance by generating independent PRD sections concurrently while maintaining logical dependencies and cross-references</parallel_execution>

<context_management>
Load research foundation from research/planning/product-document-requirements.md to ensure adherence to proven best practices and industry standards. Apply modern PRD philosophy treating document as living, evolving artifact aligned with agile development practices.
</context_management>

<analysis_phase>
**Input Analysis and Requirements Extraction:**

1. **Product Context Analysis**
   - Parse product/feature description for core functionality
   - Identify target users and primary use cases  
   - Extract business objectives and success indicators
   - Determine technical complexity and architectural considerations
   - Assess market context and competitive landscape

2. **Stakeholder Mapping**
   - Identify primary and secondary stakeholders
   - Map stakeholder needs to product requirements
   - Define communication and approval workflows
   - Establish feedback loops for iterative refinement

3. **Scope and Constraint Definition**
   - Define MVP scope and future iteration boundaries
   - Identify technical constraints and dependencies
   - Assess regulatory and compliance requirements
   - Establish timeline and resource constraints
</analysis_phase>

<generation_framework>
**PRD Structure Generation (Following Research Best Practices):**

**Document Header Section:**
- Generate unique project identifier and version control
- Create comprehensive change history template
- Establish clear ownership and accountability structure
- Define document status and approval workflow

**Core Content Framework:**
- **Executive Overview**: Concise product vision and business context
- **Success Metrics**: Quantifiable KPIs and business outcomes
- **User Stories**: Feature-oriented descriptions following "As a <role>, I want <goal> so that <benefit>" format
- **Acceptance Criteria**: Testable, binary pass/fail validation conditions
- **Technical Requirements**: System specifications, performance criteria, integration needs
- **Assumptions, Constraints, Dependencies**: Critical external factors and limitations

**Quality Gates Implementation:**
- **Product Messaging**: Market positioning and communication strategy
- **Risk Assessment**: Failure mode analysis with mitigation strategies
- **Timeline & Milestones**: Delivery schedule with key checkpoints
</generation_framework>

<quality_assurance>
**Requirements Quality Framework Application:**

Ensure all requirements exhibit:
- **Testability**: Clear, measurable acceptance criteria enabling objective validation
- **Traceability**: Bidirectional links from business needs through implementation
- **Completeness**: Comprehensive functional and non-functional requirement coverage
- **Clarity**: Unambiguous language preventing misinterpretation
- **Maintainability**: Structure supporting ongoing updates and evolution

**User Story Quality Validation:**
- Independent: Developable and deliverable autonomously
- Negotiable: Details refinable through stakeholder collaboration
- Valuable: Tangible benefit delivery to users or business
- Estimable: Reasonably estimatable scope for planning
- Small: Completable within single iteration
- Testable: Clear validation and acceptance criteria
</quality_assurance>

<advanced_features>
**Modern PRD Enhancements:**

1. **Living Document Integration**
   - Include version control recommendations
   - Design for collaborative editing workflows
   - Establish update triggers and maintenance cycles
   - Create feedback integration points

2. **Automated Traceability Preparation**
   - Generate unique requirement IDs for RTM integration
   - Create dependency mapping structure
   - Prepare test case linking framework
   - Include impact analysis considerations

3. **Agile Integration Patterns**
   - Structure for sprint planning integration
   - Include definition of ready criteria
   - Design for progressive elaboration
   - Create backlog grooming guidelines
</advanced_features>

<output_optimization>
**Token-Efficient Generation Strategy:**
- Use structured markdown for consistent formatting
- Implement modular section generation for reusability
- Create cross-referenced content to avoid duplication
- Generate actionable, concise requirement statements
- Include template sections for future expansion
</output_optimization>

<validation_checkpoints>
**Quality Assurance Gates:**

1. **Completeness Validation**
   - Verify all essential PRD components present
   - Confirm requirement coverage for described functionality
   - Validate stakeholder perspective representation
   - Check compliance requirement integration if specified

2. **Clarity and Consistency Review**
   - Ensure consistent terminology throughout document
   - Validate requirement statement clarity and precision
   - Confirm acceptance criteria testability
   - Review dependency and assumption completeness

3. **Agile Compatibility Check**
   - Verify user story format compliance
   - Confirm acceptance criteria follow Given/When/Then or rule-based format
   - Validate story independence and estimability
   - Check iteration sizing appropriateness
</validation_checkpoints>

<error_recovery>
**Robust Generation Process:**
- Implement fallback content for incomplete input descriptions
- Provide structured templates when specific details unavailable
- Create placeholder sections for stakeholder refinement
- Include guidance for iterative document evolution
- Generate quality checklists for manual validation
</error_recovery>

**Execution Process:**

1. **Context Loading**: Read research/planning/product-document-requirements.md for framework foundation
2. **Input Analysis**: Parse description and extract key product/feature characteristics
3. **Stakeholder Mapping**: Identify roles and create perspective-based requirements
4. **Content Generation**: Create comprehensive PRD following research-validated structure
5. **Quality Validation**: Apply requirements quality framework and agile compatibility checks
6. **Output Formatting**: Generate professional, actionable document with living document characteristics
7. **Enhancement Recommendations**: Provide guidance for ongoing PRD evolution and maintenance

Generate a production-ready PRD that exemplifies modern requirements engineering excellence while maintaining practical utility for development teams. Ensure the document serves as both comprehensive specification and collaborative workspace for iterative product development.
</command>