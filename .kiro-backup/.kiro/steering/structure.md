# Project Structure

## Guidelines

- Don't create a folder or file unless its actively being used

## Current Organization

This is a design-phase project focused on comprehensive game design documentation.

```
/
├── .kiro/                          # Kiro AI assistant configuration
│   └── steering/                   # AI guidance documents
├── .vscode/                        # VSCode editor settings
│   └── settings.json              # Project-specific VS Code config
└── asherons-call-idler-poc-design.md  # Main design document
```

## Planned Implementation Structure

When development begins, the project should follow this Expo/React Native organization with vertical slicing:

### Expo React Native Structure

```
/
├── src/                           # Source code
│   ├── app/                       # App entry point and navigation
│   │   ├── (tabs)/                # Tab-based navigation screens
│   │   ├── _layout.tsx            # Root layout component
│   │   └── index.tsx              # Main app entry
│   ├── features/                  # Feature-based vertical slices
│   │   ├── character/             # Character management feature
│   │   │   ├── CharacterSheet.tsx # Main character display component
│   │   │   ├── AttributePanel.tsx # Attribute display and upgrade
│   │   │   ├── CharacterScreen.tsx # Character management screen
│   │   │   ├── useCharacterStats.ts # Character calculation hook
│   │   │   ├── characterService.ts # Character business logic
│   │   │   ├── characterStore.ts  # Legend-state store
│   │   │   └── types.ts           # Character type definitions
│   │   ├── combat/                # Automated combat feature
│   │   │   ├── CombatDisplay.tsx  # Combat visualization
│   │   │   ├── CombatScreen.tsx   # Combat management screen
│   │   │   ├── useCombatEngine.ts # Combat calculation hook
│   │   │   ├── combatService.ts   # Combat engine logic
│   │   │   ├── combatStore.ts     # Combat state management
│   │   │   └── types.ts           # Combat type definitions
│   │   ├── skills/                # Skill system feature
│   │   │   ├── SkillTree.tsx      # Skill progression display
│   │   │   ├── SkillScreen.tsx    # Skill management screen
│   │   │   ├── useSkillProgression.ts # Skill calculation hook
│   │   │   ├── skillService.ts    # Skill calculation logic
│   │   │   ├── skillStore.ts      # Skill state store
│   │   │   └── types.ts           # Skill type definitions
│   │   ├── magic/                 # Magic system feature
│   │   │   ├── SpellBook.tsx      # Spell display component
│   │   │   ├── MagicScreen.tsx    # Magic management screen
│   │   │   ├── useSpellResearch.ts # Magic system hook
│   │   │   ├── magicService.ts    # Spell research logic
│   │   │   ├── magicStore.ts      # Magic state management
│   │   │   └── types.ts           # Magic type definitions
│   │   ├── equipment/             # Equipment and tinkering
│   │   │   ├── EquipmentSheet.tsx # Equipment display
│   │   │   ├── TinkeringPanel.tsx # Tinkering interface
│   │   │   ├── EquipmentScreen.tsx # Equipment screen
│   │   │   ├── useEquipment.ts    # Equipment hook
│   │   │   ├── equipmentService.ts # Tinkering logic
│   │   │   ├── equipmentStore.ts  # Equipment state
│   │   │   └── types.ts           # Equipment types
│   │   ├── world/                 # World exploration feature
│   │   │   ├── WorldMap.tsx       # World map component
│   │   │   ├── AreaDisplay.tsx    # Current area display
│   │   │   ├── WorldScreen.tsx    # World exploration screen
│   │   │   ├── useExploration.ts  # Exploration hook
│   │   │   ├── worldService.ts    # Exploration logic
│   │   │   ├── worldStore.ts      # World state
│   │   │   └── types.ts           # World types
│   │   └── progression/           # Meta-progression (Heritage)
│   │       ├── HeritageSelector.tsx # Heritage selection UI
│   │       ├── ProgressionScreen.tsx # Progression screen
│   │       ├── useProgression.ts  # Progression hook
│   │       ├── progressionService.ts # Prestige logic
│   │       ├── progressionStore.ts # Progression state
│   │       └── types.ts           # Progression types
│   ├── shared/                    # Shared utilities and components
│   │   ├── Button.tsx             # Reusable button component
│   │   ├── ProgressBar.tsx        # Progress bar component
│   │   ├── NumberDisplay.tsx      # Formatted number display
│   │   ├── useGameLoop.ts         # Main game loop hook
│   │   ├── useOfflineProgress.ts  # Offline calculation hook
│   │   ├── storage.ts             # AsyncStorage utilities
│   │   ├── analytics.ts           # Analytics service
│   │   ├── calculations.ts        # Shared game calculations
│   │   ├── gameState.ts           # Global game state store
│   │   ├── settings.ts            # App settings store
│   │   ├── gameBalance.ts         # Balance constants
│   │   ├── uiConstants.ts         # UI constants
│   │   ├── gameTypes.ts           # Core game types
│   │   ├── mathUtils.ts           # Math utilities
│   │   ├── timeUtils.ts           # Time utilities
│   │   └── formatUtils.ts         # Formatting utilities
│   └── data/                      # Static game data
│       ├── skills.json            # Skill definitions
│       ├── spells.json            # Spell data
│       ├── items.json             # Equipment data
│       ├── areas.json             # World areas
│       └── heritage.json          # Heritage bonuses
├── assets/                        # Static assets
│   ├── images/                    # Image assets
│   ├── icons/                     # Icon assets
│   └── fonts/                     # Custom fonts
├── __tests__/                     # Test files
│   ├── features/                  # Feature tests
│   ├── shared/                    # Shared utility tests
│   └── __mocks__/                 # Test mocks
├── app.json                       # Expo configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── babel.config.js                # Babel configuration
├── metro.config.js                # Metro bundler config
├── jest.config.js                 # Jest test configuration
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
└── expo-env.d.ts                  # Expo type definitions
```

## Key Architectural Principles

### Vertical Slicing

- Each feature contains all its layers (UI, logic, state, types)
- Features are self-contained and can be developed independently
- Shared code is extracted to the `shared/` directory
- Clear separation between feature-specific and global concerns

### Legend-state Integration

- Each feature has its own stores for local state management
- Global state managed in `shared/stores/`
- Reactive state updates across components
- Optimized re-renders with fine-grained reactivity

### TypeScript Best Practices

- Strict TypeScript configuration
- Feature-specific type definitions
- Shared types in `shared/types/`
- Proper type safety for game calculations

### Performance Considerations

- Efficient calculation systems for idle processing
- Optimized Legend-state usage for minimal re-renders
- Battery optimization for mobile platforms

## File Naming Conventions

- **Components**: PascalCase (e.g., `CharacterSheet.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useCharacterStats.ts`)
- **Services**: camelCase (e.g., `combatEngine.ts`)
- **Stores**: camelCase (e.g., `characterStore.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `Character`, `Skill`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SKILL_LEVEL`)
- **Data Files**: kebab-case (e.g., `war-magic-spells.json`)

## Development Patterns

### Folder Organization Rules

- **Start Simple**: Keep files flat in feature folders initially
- **9+ Item Rule**: Only create subfolders when a folder has 9+ items
- **2+ Same Type Rule**: Only move items to subfolders when there are 2+ of the same type
- **Example**: If a feature has 12 files with 5 components, 3 hooks, 2 services, 1 store, and 1 types file, create `components/` and `hooks/` subfolders only

### Feature Structure Template

Each feature should follow this consistent structure:

- Start with flat files: `FeatureComponent.tsx`, `useFeatureHook.ts`, `featureService.ts`, `featureStore.ts`, `types.ts`
- Create subfolders only when needed based on the rules above
- Always include a `types.ts` file for feature-specific TypeScript definitions

### Migration Pattern

When a feature grows beyond 9 items:

1. Identify file types with 2+ instances
2. Create subfolders for those types only
3. Move related files to appropriate subfolders
4. Keep single instances in the root feature folder
