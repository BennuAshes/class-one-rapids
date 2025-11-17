---
description: "Generate a comprehensive Product Requirements Document from feature description"
argument-hint: "<feature-file>"
allowed-tools: "Write, Read, Edit, Bash(date:*), Grep, Glob"
---

# PRD Generator

Generate a lean, actionable Product Requirements Document based on the file at $ARGUMENTS.

**Process**:

1. Read the file to get the task list file path
2. Validate the file path is not empty
3. Check if file exists
4. Load task list contents using Read tool

---

## 📚 REFERENCE GUIDES

**Consult these guides while creating the PRD**:

1. **Lean Development Principles**: @docs/architecture/lean-task-generation-guide.md

   - Focus on user-visible features over infrastructure
   - Just-in-time approach to scope definition
   - Avoid premature optimization

2. **File Organization**: @docs/architecture/file-organization-patterns.md

   - Understand project structure for technical scope
   - Component organization patterns

3. **State Management**: @docs/architecture/state-management-hooks-guide.md
   - Inform technical requirements and architecture decisions
   - Hook-based patterns for feature state

4. **React Native UI Guidelines**: @docs/architecture/react-native-ui-guidelines.md
   - UI component requirements (use modern, non-deprecated components)
   - Accessibility baselines (44pt touch targets, WCAG compliance)
   - Platform compatibility considerations

---

## Analysis Phase - LEAN APPROACH

**CRITICAL PRINCIPLE**: Only document features explicitly requested by the user. Do NOT infer or add features based on "typical" patterns for this type of application.

**STRICT RULE**: If the user's request describes a single screen/view, the PRD scope MUST be limited to that single screen. Do NOT assume multi-screen architecture, navigation, or additional views unless explicitly requested.

**SINGLE-SCREEN DETECTION**: Before adding ANY navigation or additional screens:
1. Count how many distinct screens/views the user explicitly mentioned
2. If count = 1 (or 0), the PRD MUST NOT include:
   - Navigation between screens
   - Additional placeholder screens
   - Multi-screen architecture
   - "Coming soon" screens for future features
3. Integration with existing App.tsx should be MINIMAL:
   - Mount the component directly in App.tsx
   - Do NOT create wrapper screens unless explicitly needed for the component to function

First, analyze the feature description to extract (following @docs/architecture/lean-task-generation-guide.md principles):

1. **Explicitly Requested Features**: What did the user specifically ask for?
2. **Core Problem**: What user problem does this solve?
3. **Target Users**: Who will benefit from this feature?
4. **Minimal Technical Scope**: What's the MINIMUM needed to deliver requested features?
5. **Success Indicators**: How will we know the REQUESTED features work?

**FORBIDDEN ASSUMPTIONS - DO NOT ADD UNLESS USER EXPLICITLY REQUESTED**:
- ❌ DO NOT add persistence/storage if user didn't mention saving data, "remembering", or "across sessions"
- ❌ DO NOT add authentication if user didn't mention users/accounts/login
- ❌ DO NOT add analytics/tracking if user didn't mention metrics/monitoring
- ❌ DO NOT add undo/redo if user didn't mention it
- ❌ DO NOT add multi-device sync if user didn't mention it
- ❌ DO NOT add offline support if user didn't mention it
- ❌ DO NOT add complex error recovery beyond preventing crashes
- ❌ DO NOT add navigation/routing if user didn't mention multiple screens or navigation
- ❌ DO NOT add additional screens/views beyond what user specified
- ❌ DO NOT add shop/store/inventory/game systems unless explicitly requested
- ❌ DO NOT add multi-screen architecture for single-screen requests

**WHEN TO ADD BEYOND USER REQUEST** (minimal platform requirements only):
- ✅ Basic error states (loading, error) - ONLY to prevent crashes, not comprehensive error handling
- ✅ Accessibility minimums (WCAG touch targets ≥44x44pt, contrast ratios) - required by platform standards
- ✅ Performance baselines (60fps, <100ms interactions) - expected by platform, not custom benchmarks
- ✅ Input validation - ONLY to prevent crashes, not business rules

**Example Analysis**:
```
User Request: "I want a button that increments a counter"

✅ CORRECT PRD Scope:
- Button component
- Counter display
- Increment action on button press
- Basic styling (touch target, contrast)
- Platform performance (60fps, responsive)

❌ INCORRECT PRD Scope (adds unrequested features):
- + localStorage persistence (user didn't ask to save)
- + error recovery mechanisms (beyond crash prevention)
- + analytics tracking (user didn't mention)
- + undo/redo functionality (user didn't mention)
- + custom animations (user didn't specify)
```

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

**ONLY include platform baselines unless user explicitly requested custom requirements**:

- **Performance**: Platform baselines only (60fps UI, <100ms interactions). NO custom benchmarks unless user specified.
- **Security**: ONLY include if user mentioned security, authentication, or sensitive data
- **Accessibility**: WCAG minimums only (≥44x44pt touch targets, 4.5:1 contrast). NO custom accessibility unless user requested.
- **Scalability**: ONLY include if user mentioned scale, volume, or concurrent users
- **Browser/Device Support**: Platform defaults (iOS/Android/Web). NO specific versions unless user mentioned.

#### 8. Scope Definition

Following @docs/architecture/lean-task-generation-guide.md - focus on deliverable features, not infrastructure:

**CRITICAL VALIDATION BEFORE LISTING MVP**:

Before writing ANY feature in the MVP section below, you MUST:

1. **Re-read the original feature description word-by-word**
2. **For EACH feature you plan to list as P0/MVP**:
   - Find and quote the EXACT text from the feature description that requested it
   - If you cannot find explicit mention in the original request, it MUST go in "Out of Scope" instead
3. **Check for explicit EXCLUSIONS** in the feature description:
   - Look for phrases like: "Don't [do X]", "Not yet", "Skip [Y]", "Without [Z]", "Except", "Avoid"
   - Any feature explicitly excluded MUST be listed in "Out of Scope" section
   - Example: "Don't create any items yet" → item definitions go in "Out of Scope"

**Validation Example**:
```
Original request: "Create a todo list screen that links from the main one. Don't create any items yet."

✅ CORRECT MVP:
- P0: Todo list screen with navigation from main screen (quoted: "Create a todo list screen that links from the main one")
- P0: Empty/placeholder todo list (infrastructure for future items)

✅ CORRECT Out of Scope:
- Specific todo item definitions (quoted exclusion: "Don't create any items yet")

❌ WRONG MVP:
- P0: 5 todo item definitions with titles and descriptions (EXPLICITLY EXCLUDED!)
```

**MVP (Must Have - USER REQUESTED FEATURES ONLY):**

- P0: [Feature explicitly requested - QUOTE REQUEST: "..."]
- P0: [Feature explicitly requested - QUOTE REQUEST: "..."]

**CRITICAL**: Do NOT add features user didn't request. If a feature isn't in the original user request, it goes in "Out of Scope" or "Future Enhancements".

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
  - **IMPORTANT**: Extract `feature_name` from the PRD document title or feature description content, NOT from the folder name
  - Example: If PRD title is "Passive Resource Generation System", use `prd_passive_resource_generation_20251111.md`
  - Convert to snake_case: spaces→underscores, lowercase, remove special chars
- Location: Same directory as the feature description file
- Include generation timestamp at bottom

The PRD should be immediately actionable for a development team while remaining flexible for iteration based on feedback and learning.
