# Story Implementation Command

Use the Task tool to invoke the senior-software-engineer agent to implement the following story:

$ARGUMENTS

## Instructions for the Senior Software Engineer:

### Analysis Phase
1. Analyze the story to determine if it's a bug fix or feature implementation
2. Identify all affected files and components
3. Review existing code patterns and conventions in the codebase
4. Consider edge cases and potential impacts

### Implementation Phase
1. **For Features:**
   - Design the implementation approach
   - Create new files if necessary
   - Implement the feature following existing patterns
   - Add appropriate error handling
   - Include logging where appropriate
   - Write or update tests for new functionality
   - Update any affected documentation

2. **For Bugs:**
   - Reproduce the issue if possible
   - Identify the root cause
   - Implement the fix with minimal changes
   - Add tests to prevent regression
   - Verify the fix doesn't introduce new issues
   - Document any workarounds or special cases

### Code Quality Requirements
- Follow existing code style and conventions
- Use TypeScript/type safety where applicable
- Ensure proper error handling
- Add meaningful comments for complex logic
- Maintain backward compatibility unless explicitly stated otherwise
- Consider performance implications
- Follow SOLID principles

### Testing Requirements
- Write unit tests for new functionality
- Update existing tests if behavior changes
- Ensure all tests pass
- Add integration tests for complex features
- Include edge case testing

### Final Steps
1. Run linting and formatting tools if configured
2. Verify the implementation works as expected
3. Review your own changes for quality
4. List all files modified or created
5. Provide a summary of changes made

### IMPORTANT: Do NOT commit the changes
- Make all necessary code changes but DO NOT use git commit
- DO NOT create a commit message
- DO NOT push any changes
- Leave all changes unstaged for review
- The user will review and commit the changes manually

### Output Format
After implementation, provide:
1. Summary of what was implemented
2. List of all files modified/created
3. Any important notes or considerations
4. Suggestions for testing the implementation
5. Any follow-up tasks that might be needed

Remember: Focus on implementation quality over speed. It's better to do it right than to do it fast.