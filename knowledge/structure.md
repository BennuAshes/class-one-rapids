# Project Structure

## Guidelines

- Don't create a folder or file unless its actively being used

## Current Organization

PetSoft Tycoon - an idle/clicker game building a software company from startup to IPO.

```
/projects/pet-software-idler/
├── PetSoftTycoon/                  # Main application
├── specs/                          # Feature specifications
└── design-doc.md                   # Game design document
```

## State Management Architecture

### Core Principle: Feature State with Computed Integration

**CRITICAL**: State is organized by feature with a centralized game-state integration layer using Legend-state computed observables.

```typescript
// GOOD: Feature owns its state
// features/development/state.ts
export const developmentState$ = observable({
  units: { juniorDevs: 0, seniorDevs: 0 },
  upgrades: { betterIDE: false }
})

// GOOD: Integration through computed observables
// game-state/resources/code.ts
export const codePerSecond$ = computed(() => {
  const juniors = developmentState$.units.juniorDevs.get()
  return juniors * 0.1 * getDevelopmentBonus()
})

// BAD: Centralized monolithic state
const globalGameState$ = observable({
  development: { ... },
  sales: { ... },
  resources: { ... }
})
```

### State Organization Rules

1. **Each feature owns its state**: Create `state.ts` in each feature folder
2. **Cross-feature calculations go in game-state/**: Never directly reference another feature's state from a feature
3. **Use computed observables for integration**: All derived values should be computed observables
4. **Single persistence point**: Save all feature states together, but keep them separate in code

## Implementation Structure

### Expo React Native Structure with Feature State Pattern

```
/
├── src/                           # Source code
│   ├── app/                       # Expo Router navigation ONLY
│   │   ├── (tabs)/                # Tab screens (thin, delegate to features)
│   │   ├── _layout.tsx            # Root layout
│   │   └── index.tsx              # Entry point
│   ├── features/                  # Feature-based vertical slices WITH state
│   │   ├── development/           # Development department feature
│   │   │   ├── DevelopmentScreen.tsx # Main screen component
│   │   │   ├── WriteCodeButton.tsx # Primary interaction
│   │   │   ├── DeveloperList.tsx # Unit display
│   │   │   ├── state.ts          # developmentState$ observable
│   │   │   ├── calculations.ts   # Local calculations only
│   │   │   └── types.ts          # Development-specific types
│   │   ├── sales/                 # Sales department feature
│   │   │   ├── SalesScreen.tsx    # Sales management screen
│   │   │   ├── LeadGenerator.tsx  # Lead generation UI
│   │   │   ├── state.ts           # salesState$ observable
│   │   │   └── types.ts           # Sales-specific types
│   │   ├── customer-experience/   # CX department feature
│   │   │   ├── CXScreen.tsx       # CX management screen
│   │   │   ├── TicketResolver.tsx # Ticket handling UI
│   │   │   ├── state.ts           # cxState$ observable
│   │   │   └── types.ts           # CX-specific types
│   │   ├── product/               # Product department feature
│   │   │   ├── ProductScreen.tsx  # Product management
│   │   │   ├── state.ts           # productState$ observable
│   │   │   └── types.ts           # Product types
│   │   ├── design/                # Design department feature
│   │   │   ├── DesignScreen.tsx   # Design management
│   │   │   ├── state.ts           # designState$ observable
│   │   │   └── types.ts           # Design types
│   │   ├── qa/                    # QA department feature
│   │   │   ├── QAScreen.tsx       # QA management
│   │   │   ├── state.ts           # qaState$ observable
│   │   │   └── types.ts           # QA types
│   │   ├── marketing/             # Marketing department feature
│   │   │   ├── MarketingScreen.tsx # Marketing management
│   │   │   ├── state.ts           # marketingState$ observable
│   │   │   └── types.ts           # Marketing types
│   │   └── prestige/              # Investor rounds (prestige)
│   │       ├── PrestigeScreen.tsx # Prestige reset screen
│   │       ├── state.ts           # prestigeState$ observable
│   │       └── types.ts           # Prestige types
│   ├── game-state/                # CRITICAL: Cross-feature integration layer
│   │   ├── resources/             # Resource calculations
│   │   │   ├── money.ts           # moneyPerSecond$ computed
│   │   │   ├── code.ts            # codePerSecond$ computed
│   │   │   ├── features.ts        # featureConversion$ computed
│   │   │   ├── leads.ts           # leadGeneration$ computed
│   │   │   └── customers.ts       # customerRetention$ computed
│   │   ├── departments/           # Department interactions
│   │   │   ├── synergies.ts       # Cross-department bonuses
│   │   │   ├── unlocks.ts         # Department unlock conditions
│   │   │   └── totals.ts          # Aggregate production
│   │   ├── progression/           # Game progression
│   │   │   ├── milestones.ts      # Milestone detection
│   │   │   ├── achievements.ts    # Achievement tracking
│   │   │   └── valuation.ts       # Company valuation (victory)
│   │   ├── persistence.ts         # Save/load orchestration
│   │   └── index.ts               # Export all computed observables
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

## State Management Examples

### Feature State Example
```typescript
// src/features/development/state.ts
import { observable } from '@legendapp/state'

export const developmentState$ = observable({
  units: {
    juniorDevs: 0,
    seniorDevs: 0,
    techLeads: 0,
  },
  upgrades: {
    betterIDE: false,
    pairProgramming: false,
    codeReviews: false,
  },
  costs: {
    juniorDev: 10,
    seniorDev: 100,
    techLead: 1000,
  }
})

// NEVER export computed values from feature state
// Those belong in game-state/
```

### Game-State Integration Example
```typescript
// src/game-state/resources/code.ts
import { computed } from '@legendapp/state'
import { developmentState$ } from '@/features/development/state'
import { qaState$ } from '@/features/qa/state'

// Cross-feature calculation
export const codePerSecond$ = computed(() => {
  const juniors = developmentState$.units.juniorDevs.get()
  const seniors = developmentState$.units.seniorDevs.get()
  const techLeads = developmentState$.units.techLeads.get()
  
  // Base production
  let production = (juniors * 0.1) + (seniors * 2.5) + (techLeads * 10)
  
  // QA reduces bugs, increasing effective production
  const qaTesters = qaState$.units.testers.get()
  if (qaTesters >= 10) {
    production *= 1.5 // 50% bonus from QA
  }
  
  return production
})

// Department synergy calculation
export const developmentEfficiency$ = computed(() => {
  const devCount = developmentState$.units.juniorDevs.get() + 
                   developmentState$.units.seniorDevs.get()
  const hasProduct = productState$.units.managers.get() > 0
  
  let efficiency = 1.0
  
  // Product managers improve development efficiency
  if (hasProduct && devCount >= 10) {
    efficiency *= 1.25
  }
  
  // Pair programming bonus
  if (developmentState$.upgrades.pairProgramming.get() && devCount >= 25) {
    efficiency *= 2.0
  }
  
  return efficiency
})
```

### Component Usage Example
```typescript
// src/features/development/DevelopmentScreen.tsx
import { observer } from '@legendapp/state/react'
import { developmentState$ } from './state'
import { codePerSecond$, moneyPerSecond$ } from '@/game-state'

export const DevelopmentScreen = observer(() => {
  // Use local state directly
  const juniorDevs = developmentState$.units.juniorDevs.get()
  const juniorCost = developmentState$.costs.juniorDev.get()
  
  // Use computed values from game-state
  const codePerSec = codePerSecond$.get()
  const moneyPerSec = moneyPerSecond$.get()
  
  const buyJuniorDev = () => {
    // Modify local state
    developmentState$.units.juniorDevs.set(juniorDevs + 1)
    developmentState$.costs.juniorDev.set(juniorCost * 1.15)
  }
  
  return (
    <View>
      <Text>Junior Devs: {juniorDevs}</Text>
      <Text>Code/sec: {codePerSec.toFixed(1)}</Text>
      <Button onPress={buyJuniorDev} title={`Buy Junior Dev ($${juniorCost})`} />
    </View>
  )
})
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
