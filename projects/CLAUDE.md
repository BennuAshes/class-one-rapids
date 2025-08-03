# General
- Don't guess
- Ask questions if you're not confident about something
- If you encounter any missing dependencies, unclear requirements, or need to create files not mentioned in the story, stop and ask first.

# Project Context

## Quick Start
- Always check for existing implementations before creating new files
- Prefer editing existing files over creating new ones
- Run tests and linting after making changes
- Follow existing code patterns and conventions

## Common Commands
```bash
# Development
npm run dev         # Start development server
npm run build       # Build for production
npm run test        # Run tests
npm run lint        # Run linting
npm run typecheck   # Run type checking

# Git
git status          # Check current changes
git diff            # View unstaged changes
git log --oneline -10  # Recent commits
```

## Code Style
- Use 2-space indentation for JavaScript/TypeScript
- Use 4-space indentation for Python
- Follow existing naming conventions in the codebase
- Keep functions small and focused
- Write descriptive variable and function names

## Architecture Patterns
- Separation of concerns: Keep business logic separate from UI
- Use dependency injection for testability
- Follow SOLID principles where applicable
- Prefer composition over inheritance
- Keep external dependencies minimal

## Testing
- Write tests for new functionality
- Ensure tests pass before marking tasks complete
- Use descriptive test names that explain what is being tested
- Test edge cases and error conditions

## File Organization
- Group related functionality together
- Use clear, descriptive file names
- Follow existing directory structure patterns
- Keep files focused on a single responsibility

## Error Handling
- Always handle errors appropriately
- Provide meaningful error messages
- Log errors for debugging
- Never expose sensitive information in error messages

## Documentation
- Document complex logic inline (only when necessary)
- Keep README up to date with setup instructions
- Document API endpoints and their parameters
- Include examples for complex functionality

## Security
- Never commit secrets or API keys
- Validate all user inputs
- Use environment variables for configuration
- Follow principle of least privilege

## Performance
- Optimize only when necessary
- Profile before optimizing
- Consider caching for expensive operations
- Be mindful of bundle size in frontend projects

## Workflow
1. Understand the requirement fully
2. Research existing code and patterns
3. Plan the implementation
4. Write code following conventions
5. Test the implementation
6. Run linting and type checking
7. Review changes before completion