# Kanban-Integrated Story Implementation Command

Use the Task tool to invoke the senior-software-engineer agent to implement the following story with full kanban integration:

$ARGUMENTS

## Pre-Implementation Setup

**Important**: Before starting implementation, run these validation steps:

1. **Validate Story Readiness**:
   ```bash
   cd projects/pet-software-idler/epic-breakdown
   ./check-dependencies.sh $STORY_ID
   ```

2. **Move Story to In-Progress** (if dependencies are met):
   ```bash
   ./move-story.sh $STORY_ID in-progress
   ./update-story.sh $STORY_ID assigned "senior-software-engineer"
   ```

3. **Extract Story Context**:
   - Read the story file to get technical design, implementation guide, and acceptance criteria
   - Note any specific technical requirements or constraints
   - Review the epic context and cross-dependencies

## Instructions for the Senior Software Engineer:

### Phase 1: Story Analysis & Planning

1. **Read the Complete Story File**:
   - Load the story markdown file from `projects/pet-software-idler/epic-breakdown/kanban/in-progress/`
   - Extract technical design specifications
   - Review implementation guide and development tasks
   - Understand acceptance criteria and definition of done

2. **Codebase Context Analysis**:
   - Review PRP at `projects/pet-software-idler/prp-petsoft-tycoon.md` for overall vision
   - Analyze existing code patterns in the project
   - Check for any existing implementations related to this story
   - Identify integration points with other completed stories

3. **Technical Planning**:
   - Design implementation approach based on story's technical spec
   - Plan file structure and component organization
   - Identify required dependencies and imports
   - Consider performance implications per PRP requirements (60 FPS, <200MB memory)

### Phase 2: Implementation

1. **Follow Story-Specific Technical Design**:
   - Implement exactly what's specified in the story's technical design section
   - Use the implementation guide as a roadmap
   - Follow the development tasks checklist
   - Adhere to PRP architecture decisions (Legend State v3, vertical slicing, etc.)

2. **Code Quality Standards**:
   - Follow existing TypeScript patterns in codebase
   - Use Legend State v3 for state management as specified in PRP
   - Implement proper error handling and edge cases
   - Add meaningful comments only for complex business logic
   - Ensure type safety throughout

3. **PRP Compliance**:
   - Follow React Native Expo SDK 52+ patterns
   - Use vertical slice architecture for feature organization
   - Implement performance optimizations per PRP specifications
   - Follow SOLID principles and clean code practices

### Phase 3: Validation & Testing

1. **Acceptance Criteria Validation**:
   - Test each acceptance criteria item from the story
   - Verify functionality matches story requirements exactly
   - Test edge cases and error conditions
   - Ensure integration with existing completed stories

2. **Technical Validation**:
   - Run any existing tests and ensure they pass
   - Verify TypeScript compilation with no errors
   - Check for memory leaks or performance issues
   - Test on multiple platforms if specified in story

### Phase 4: Completion & Kanban Update

1. **Story Completion Tracking**:
   ```bash
   # Update actual hours worked (estimate from implementation time)
   ./update-story.sh $STORY_ID actual_hours [HOURS_WORKED]
   
   # Move to review status
   ./move-story.sh $STORY_ID review
   
   # Set completion date
   ./update-story.sh $STORY_ID completion_date "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
   ```

2. **Documentation & Handoff**:
   - List all files created or modified
   - Document any deviations from original technical design
   - Note any follow-up tasks or technical debt
   - Provide testing instructions for the implementation

### Phase 5: Final Reporting

**Required Output Format:**

```markdown
## Story Implementation Summary

**Story**: [STORY_ID] - [STORY_TITLE]
**Status**: Moved to Review
**Time Invested**: [X.X] hours
**Implementation Date**: [YYYY-MM-DD]

### ✅ Completed Acceptance Criteria
- [ ] [List each AC item with completion status]

### 📁 Files Modified/Created
- `path/to/file1.ts` - [Brief description of changes]
- `path/to/file2.tsx` - [Brief description of changes]

### 🔧 Technical Implementation
- [Brief summary of technical approach]
- [Any architecture decisions made]
- [Performance considerations addressed]

### 🧪 Testing Instructions
1. [Step-by-step testing guide]
2. [Expected behaviors to verify]
3. [Edge cases to test]

### 📝 Notes & Follow-ups
- [Any important notes about the implementation]
- [Potential future improvements]
- [Dependencies for follow-up stories]

### 🔄 Kanban Status
- Moved from: In-Progress
- Moved to: Review
- Ready for: QA validation and merge approval
```

### CRITICAL REQUIREMENTS

1. **NO GIT COMMITS**: Do not commit any changes - leave for manual review
2. **Kanban Integration**: Always update story status and tracking fields
3. **Story Fidelity**: Implement exactly what's in the story's technical design
4. **PRP Compliance**: Follow all technical decisions from the PRP document
5. **Performance Focus**: Consider 60 FPS and memory constraints in all implementations
6. **Dependency Awareness**: Understand how this story integrates with completed dependencies

### Error Handling

If implementation cannot be completed:
1. Document the blocker clearly
2. Move story to "blocked" status with reason
3. Suggest alternative approaches or prerequisite work needed
4. Do not leave incomplete implementations

Remember: Quality over speed. Each story should be a complete, production-ready feature slice.