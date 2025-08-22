# Development Methodology

## Vertical Slicing Principles

### Task Creation Rules

When creating implementation plans or task lists, ALWAYS follow these vertical slicing principles:

#### 1. User-Visible Value First

- Every task must result in something the user can see, interact with, or experience
- No "setup-only" tasks that don't deliver visible functionality
- Avoid tasks that only create infrastructure without demonstrating it works

#### 2. End-to-End Feature Slices

- Each task should implement a complete user journey or interaction
- Example: "Create character creation screen with state management" (good)
- Example: "Set up state management foundation" (bad - no user value)

#### 3. Just-In-Time Development

- Only create shared components, utilities, or infrastructure when they're needed by a specific feature
- Don't create "reusable" components until there's a second use case
- Don't set up testing infrastructure until there's actual functionality to test

#### 4. Incremental Complexity

- Start with the simplest possible implementation that works
- Each task should build incrementally on the previous task
- Avoid big jumps in complexity or functionality

#### 5. Avoid Horizontal Layers

- Don't create tasks like "Set up all data models" or "Create all API endpoints"
- Instead: "Implement character creation with data persistence"
- Focus on complete features rather than technical layers

### Task Structure Guidelines

#### Good Task Examples:

- "Create welcome screen with game branding and navigation to character creation"
- "Implement character creation form with real-time validation and save functionality"
- "Add character sheet display with live experience progression"

#### Bad Task Examples:

- "Set up project structure and folders"
- "Configure all development tools"
- "Create shared utility functions"
- "Set up testing framework"

### Implementation Order Priority

1. **Core User Flow**: The main path users will take through the app
2. **Essential Features**: Features that make the app functional and valuable
3. **Quality Tools**: Development tools, testing, and code quality (only after core functionality exists)
4. **Polish & Optimization**: Performance improvements, edge cases, advanced features

### Shared Code Creation Rules

- **Components**: Only create shared components when you have 2+ actual use cases
- **Utilities**: Only extract utilities when the same logic is needed in 2+ places
- **Services**: Create feature-specific services first, extract shared logic later
- **Types**: Start with feature-specific types, move to shared when actually shared

### Testing Strategy

- Do not write any tests yet

## Spec Creation Guidelines

When creating specs (requirements, design, tasks), ensure:

1. **Requirements** focus on user value and business outcomes
2. **Design** addresses the requirements with technical solutions
3. **Tasks** implement the design through vertical feature slices

Each task should answer: "What can the user do after this task is complete that they couldn't do before?"
