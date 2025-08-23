# Technical Specification Generator - Usage Examples

## Basic Usage

Generate a technical specification from a PRD:
```bash
/run prp/generate-technical-spec --prd ./prd.md
```

## With Custom Output Path

Specify where to save the technical specification:
```bash
/run prp/generate-technical-spec --prd ./requirements/feature-prd.md --output ./docs/technical-spec.md
```

## Focus on Specific Areas

### Architecture Focus
Deep dive into architectural decisions and patterns:
```bash
/run prp/generate-technical-spec --prd ./prd.md --focus architecture
```

### Testing Focus
Comprehensive testing strategy and quality assurance:
```bash
/run prp/generate-technical-spec --prd ./prd.md --focus testing
```

### Deployment Focus
Detailed deployment and operational excellence:
```bash
/run prp/generate-technical-spec --prd ./prd.md --focus deployment
```

### Security Focus
In-depth security analysis and compliance:
```bash
/run prp/generate-technical-spec --prd ./prd.md --focus security
```

### Full Analysis (Default)
Complete technical specification covering all areas:
```bash
/run prp/generate-technical-spec --prd ./prd.md --focus full
```

## What the Command Does

This command reads a Product Requirements Document (PRD) and generates a comprehensive technical specification by:

1. **Analyzing the PRD** - Extracts requirements, user stories, success metrics, and constraints
2. **Loading Research** - Incorporates best practices from:
   - Software development lifecycle methodologies
   - Vertical slicing and incremental delivery
   - Modern DevOps and testing practices
   - Security and architectural patterns
3. **Generating Technical Specs** - Produces detailed documentation including:
   - System architecture and design decisions
   - Implementation strategy with vertical slicing
   - Technical requirements for each feature
   - Testing and quality assurance plans
   - CI/CD pipeline specifications
   - Security integration (DevSecOps)
   - Deployment architecture
   - Monitoring and observability setup
   - Development timeline and phases
   - Risk assessment and mitigation
4. **Creating Traceability** - Maps PRD requirements to technical implementations

## Output Structure

The generated technical specification includes:

- **Executive Summary** - Technical overview and key decisions
- **System Architecture** - Component design and technology stack
- **Implementation Strategy** - Sprint planning and delivery approach
- **Technical Requirements** - Detailed specs for each PRD requirement
- **Testing Strategy** - TDD approach and test planning
- **DevOps Pipeline** - CI/CD and automation specifications
- **Security Integration** - DevSecOps practices and compliance
- **Deployment Architecture** - Infrastructure and deployment patterns
- **Monitoring & Observability** - APM, logging, and alerting
- **Development Timeline** - Phased implementation plan
- **Technical Decisions** - Framework choices with rationale
- **Risk Assessment** - Technical risks and mitigations
- **Documentation Plan** - API docs and knowledge transfer

## Prerequisites

Before running this command, ensure:

1. You have a valid PRD file following the standard template structure
2. The research directories exist at `/research/tech/` and `/research/planning/`
3. You have write permissions for the output directory

## Tips for Best Results

1. **Complete PRD** - Ensure your PRD has clear requirements, user stories, and acceptance criteria
2. **Focus Selection** - Use focused analysis for specific technical deep-dives
3. **Iterative Refinement** - Generate initial specs, review, and regenerate with updates
4. **Team Review** - Share generated specs with technical teams for validation
5. **Living Document** - Update the technical spec as requirements evolve

## Integration with Development Workflow

After generating the technical specification:

1. Review with technical team and stakeholders
2. Create development tasks from the implementation strategy
3. Use the testing strategy for QA planning
4. Configure CI/CD based on pipeline specifications
5. Set up monitoring according to observability requirements
6. Follow the development timeline for sprint planning

## Example PRD Structure

Your PRD should follow this structure for best results:

```markdown
# Product Requirements Document: [Feature Name]

## Introduction
Brief description and business context

## Requirements

### Requirement 1: [Title]
**User Story:** As a [user], I want [goal], so that [benefit]

#### Acceptance Criteria
- WHEN [condition] THEN [expected]
- IF [edge case] THEN [handling]

### Requirement 2: [Title]
...

## Success Metrics
- Metric 1
- Metric 2

## Out of Scope
- Exclusion 1
- Future consideration
```

## Troubleshooting

If the command fails:

1. **File Not Found** - Check PRD path is correct and file exists
2. **Missing Research** - Ensure research directories are populated
3. **Incomplete Output** - Review PRD for missing required sections
4. **Permission Denied** - Check write permissions for output path

## Support

For issues or enhancements, refer to the command implementation at:
`.claude/commands/prp/generate-technical-spec.md`