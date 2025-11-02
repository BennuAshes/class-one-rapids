---
description: "Generate a comprehensive Product Requirements Document from feature description"
argument-hint: "<feature-description>"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob"
---

# PRD Generator

## Input Processing

The feature description is provided as: $ARGUMENTS

If this is a file path (contains `/` or ends with `.md`), use the Read tool to load the file contents. Otherwise, treat it as the feature description text directly.

Generate a lean, actionable Product Requirements Document for the feature.

## Analysis Phase

First, analyze the feature description to extract (following @docs/guides/lean-task-generation-guide.md principles):
1. **Core Problem**: What user problem does this solve?
2. **Target Users**: Who will benefit from this feature?
3. **Business Value**: Why is this worth building?
4. **Technical Scope**: What systems/components are involved?
5. **Success Indicators**: How will we know it's successful?

## PRD Generation Requirements

Create a comprehensive PRD following these specifications:

### Document Structure
Generate a markdown PRD with these sections in order:

#### 1. Header & Metadata
- Document title with feature name
- Version control table (start at v1.0)
- Author, date, status
- Executive summary (2-3 sentences)

#### 2. Problem & Opportunity
- **Problem Statement**: Clear description with evidence
- **User Impact**: Who's affected and how often
- **Business Impact**: Cost of not solving
- **Evidence**: Include hypothetical but realistic metrics

#### 3. Solution Overview
- **Approach**: High-level solution description
- **Value Proposition**: Why users will care
- **Key Differentiators**: What makes this unique

#### 4. Success Metrics
Format as a table with:
| Metric | Current | Target | Timeline | Type |
- Include 2-3 primary metrics (business impact)
- Include 2-3 secondary metrics (user engagement)
- Include 1-2 counter-metrics (watch for negative impact)

#### 5. User Stories & Requirements
For each major capability:
```
**Story: [Title]**
As a [user type]
I want to [action]
So that I can [benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]
- [ ] [Additional criteria using Given/When/Then or rules]
```

#### 6. Functional Requirements
Organize by feature area:
- **[Feature Category]**
  - Requirement 1: [Specific, measurable description]
  - Requirement 2: [Specific, measurable description]

#### 7. Non-Functional Requirements
- **Performance**: [Specific benchmarks, e.g., <2s load time, that are relevant to the technology used]
- **Security**: [Authentication, data protection requirements]
- **Accessibility**: [WCAG standards compliance]
- **Scalability**: [User/data volume requirements]
- **Browser/Device Support**: [Specific requirements]

#### 8. Scope Definition
Following @docs/guides/lean-task-generation-guide.md - focus on deliverable features, not infrastructure:

**MVP (Must Have):**
- P0: [Critical user-visible feature]
- P0: [Critical user-visible feature]

**Nice to Have:**
- P1: [Important but not critical]
- P2: [Future enhancement]

**Out of Scope:**
- [Explicitly excluded feature]
- [Future iteration item]

#### 9. Dependencies & Risks
| Type | Description | Owner | Mitigation | Status |
Include 2-3 realistic dependencies/risks

#### 10. Timeline & Milestones
- Discovery & Design: [X weeks]
- Development: [X weeks]
- Testing & QA: [X weeks]
- Launch: [Target date]

Total: [X-X weeks]

#### 11. Open Questions
- [ ] [Question needing resolution]
- [ ] [Decision to be made]

#### 12. Appendix
- Glossary of terms
- References and links
- Related documents

### Quality Requirements

The PRD must be:
1. **Specific**: No vague terms like "easy" or "fast" - use measurable criteria
2. **User-Focused**: Write from user perspective, not system perspective
3. **Measurable**: Every requirement should be testable
4. **Realistic**: Timeline and scope should be achievable
5. **Complete**: Address all aspects including edge cases and error states

### Format Guidelines
- Use tables for structured data
- Use checkboxes for criteria and questions
- Use priority labels (P0/P1/P2) for features
- Include realistic but hypothetical metrics
- Keep descriptions concise (1-2 sentences max)

### Example Quality Markers
✅ GOOD: "Users can reset password in <3 clicks with email confirmation within 2 minutes"
❌ BAD: "Easy password reset functionality"

✅ GOOD: "Page loads in <2 seconds for 95% of users on 4G connections"
❌ BAD: "Fast page loading"

## Output

Generate the complete PRD and save to:
- Filename: `prd_[feature_name_snake_case]_[YYYYMMDD].md`
- Location: Same directory as the feature description file
- Include generation timestamp at bottom

The PRD should be immediately actionable for a development team while remaining flexible for iteration based on feedback and learning.