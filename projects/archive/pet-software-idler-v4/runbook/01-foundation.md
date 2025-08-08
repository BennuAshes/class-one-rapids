# Phase 1: Foundation Setup

## Objective
Establish core infrastructure and development environment for PetSoft Tycoon using React Native, Expo, and Legend State.

## Work Packages

### WP 1.1: Environment Setup
#### Task 1.1.1: Install Expo and create project
- **Steps:**
  1. Install Node.js (v18+ recommended)
  2. Install Expo CLI globally: `npm install -g expo-cli`
  3. Create new Expo project: `npx create-expo-app PetSoftTycoon --template blank-typescript`
  4. Navigate to project: `cd PetSoftTycoon`
  5. Start development server: `npx expo start`
- **Validation:** 
  - Expo development server runs without errors
  - Can access app via Expo Go on mobile or web browser
- **Time estimate:** 30-45 minutes
- **Dependencies:** Node.js installed

#### Task 1.1.2: Configure TypeScript
- **Steps:**
  1. Verify tsconfig.json exists (created by template)
  2. Update tsconfig.json with strict settings:
     ```json
     {
       "compilerOptions": {
         "strict": true,
         "noImplicitAny": true,
         "strictNullChecks": true
       }
     }
     ```
  3. Install type definitions: `npm install --save-dev @types/react @types/react-native`
- **Validation:** 
  - Run `npx tsc --noEmit` without errors
  - IDE shows TypeScript intellisense
- **Time estimate:** 15-20 minutes

#### Task 1.1.3: Install Legend State
- **Steps:**
  1. Install Legend State v3 beta: `npm install @legendapp/state@beta`
  2. Note: Persistence is included in v3 (no separate plugin needed)
  3. Create state configuration file at `src/app/store/config.ts`
- **Validation:**
  - Package installed without peer dependency warnings
  - Can import Legend State modules
- **Time estimate:** 10-15 minutes

### WP 1.2: Project Structure
#### Task 1.2.1: Create directory structure
- **Steps:**
  1. Remove default App.tsx content
  2. Create the following directory structure:
     ```
     src/
     ├── app/
     │   └── store/         # Legend State stores
     ├── features/          # Feature-based modules
     │   ├── core-gameplay/
     │   ├── departments/
     │   ├── prestige/
     │   └── audio-visual/
     ├── shared/
     │   ├── components/    # Reusable UI components
     │   ├── hooks/         # Custom React hooks
     │   ├── utils/         # Utility functions
     │   └── types/         # TypeScript types
     ├── pages/             # Screen components
     └── widgets/           # Complex UI widgets
     ```
  3. Create index.ts files in each directory for exports
- **Files to create:**
  - `src/app/store/index.ts`
  - `src/features/core-gameplay/index.ts`
  - `src/shared/components/index.ts`
  - `src/shared/types/index.ts`
  - `src/pages/index.ts`
- **Validation:** 
  - Directory structure matches specification
  - All index files created
- **Time estimate:** 20-30 minutes

#### Task 1.2.2: Set up base components
- **Steps:**
  1. Create main game screen: `src/pages/GameScreen.tsx`
  2. Create base button component: `src/shared/components/Button.tsx`
  3. Update App.tsx to use GameScreen
  4. Add basic styling with StyleSheet
- **Validation:**
  - App displays GameScreen
  - Button component renders and responds to taps
- **Time estimate:** 30-45 minutes

### WP 1.3: State Management Foundation
#### Task 1.3.1: Create game state structure
- **Steps:**
  1. Define TypeScript interfaces in `src/shared/types/GameState.ts`:
     ```typescript
     interface GameState {
       resources: Resources;
       departments: Departments;
       prestige: PrestigeState;
     }
     ```
  2. Create observable state in `src/app/store/gameStore.ts`
  3. Configure automatic persistence
- **Validation:**
  - State updates trigger re-renders
  - State persists across app restarts
- **Time estimate:** 45-60 minutes

#### Task 1.3.2: Implement state hooks
- **Steps:**
  1. Create `useGameState` hook in `src/shared/hooks/useGameState.ts`
  2. Create `useResources` hook for resource management
  3. Create `usePersistence` hook for save/load
- **Validation:**
  - Hooks provide reactive state access
  - Components using hooks update automatically
- **Time estimate:** 30-45 minutes

### WP 1.4: Testing Infrastructure
#### Task 1.4.1: Set up testing framework
- **Steps:**
  1. Install testing libraries:
     ```bash
     npm install --save-dev jest @testing-library/react-native
     npm install --save-dev @testing-library/jest-native
     ```
  2. Configure Jest in package.json
  3. Create jest.config.js with React Native preset
  4. Add test script to package.json
- **Validation:**
  - `npm test` runs without configuration errors
  - Sample test passes
- **Time estimate:** 30-40 minutes

#### Task 1.4.2: Create initial tests
- **Steps:**
  1. Create test for Button component
  2. Create test for gameStore initialization
  3. Create test for state persistence
- **Validation:**
  - All tests pass
  - Coverage report generates
- **Time estimate:** 45-60 minutes

### WP 1.5: Development Tools
#### Task 1.5.1: Configure linting and formatting
- **Steps:**
  1. Install ESLint and Prettier:
     ```bash
     npm install --save-dev eslint prettier
     npm install --save-dev eslint-config-expo
     ```
  2. Create .eslintrc.js configuration
  3. Create .prettierrc configuration
  4. Add lint scripts to package.json
- **Validation:**
  - `npm run lint` executes successfully
  - Code formatting applied consistently
- **Time estimate:** 20-30 minutes

#### Task 1.5.2: Set up Git hooks
- **Steps:**
  1. Install husky: `npm install --save-dev husky`
  2. Configure pre-commit hooks for linting
  3. Configure pre-push hooks for testing
  4. Add .gitignore entries for build artifacts
- **Validation:**
  - Commits blocked if linting fails
  - Pushes blocked if tests fail
- **Time estimate:** 15-20 minutes

## Success Criteria
- [ ] Expo development environment running
- [ ] TypeScript configured with strict mode
- [ ] Legend State integrated and persisting
- [ ] Project structure follows vertical slice architecture
- [ ] Basic components rendering
- [ ] Testing framework operational
- [ ] Linting and formatting configured

## Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| Expo CLI not found | Use npx expo instead of expo directly |
| TypeScript errors in node_modules | Add skipLibCheck: true to tsconfig.json |
| Legend State persistence not working | Ensure AsyncStorage is installed for React Native |
| Tests failing with "Cannot find module" | Check jest moduleNameMapper configuration |

## Next Phase Dependencies
Phase 2 (Core Features) requires:
- Completed project structure
- Working state management
- Basic component library
- Testing infrastructure

## Estimated Total Time: 5-7 hours