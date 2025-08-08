# Phase 1: Foundation Setup

## Objective
Establish core infrastructure, development environment, and project structure for PetSoft Tycoon MVP.

## Work Packages

### WP 1.1: Environment Setup
**Goal:** Configure development environment with all required tools

#### Task 1.1.1: Initialize Project
- **Steps:**
  1. Create new React/Expo project based on architecture decision
  2. Initialize git repository
  3. Configure .gitignore for node_modules, build artifacts
  4. Set up branch structure (main, develop, feature branches)
- **Validation:** Project runs with `npm start` or `expo start`
- **Time estimate:** 30 minutes
- **Dependencies:** Architecture decision from Phase 0

#### Task 1.1.2: Install Core Dependencies
- **Steps:**
  ```bash
  # Core packages
  npm install @legendapp/state@beta
  npm install react react-dom # or react-native for mobile
  
  # Math utilities
  npm install decimal.js
  
  # Development tools
  npm install -D typescript @types/react
  npm install -D eslint prettier
  ```
- **Validation:** All packages installed, no peer dependency warnings
- **Time estimate:** 15 minutes

#### Task 1.1.3: Configure TypeScript
- **Steps:**
  1. Create tsconfig.json with strict mode enabled
  2. Configure path aliases for clean imports
  3. Set up type definitions for game state
- **Config snippet:**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "target": "ES2022",
      "jsx": "react-jsx",
      "paths": {
        "@features/*": ["src/features/*"],
        "@shared/*": ["src/shared/*"]
      }
    }
  }
  ```
- **Validation:** TypeScript compiles without errors
- **Time estimate:** 20 minutes

### WP 1.2: Project Structure

#### Task 1.2.1: Create Directory Structure
- **Steps:**
  ```bash
  mkdir -p src/features/codeProduction/components
  mkdir -p src/features/codeProduction/hooks
  mkdir -p src/features/codeProduction/services
  mkdir -p src/features/departments
  mkdir -p src/features/prestige
  mkdir -p src/shared/hooks
  mkdir -p src/shared/types
  mkdir -p src/app/store
  ```
- **Files to create:** 
  - src/shared/types/index.ts
  - src/app/store/index.ts
  - Feature index files
- **Validation:** Directory structure matches architecture pattern
- **Time estimate:** 15 minutes

#### Task 1.2.2: Define Core Types
- **Steps:**
  1. Create GameState interface
  2. Define Resource types
  3. Create Department interfaces
  4. Set up Action types
- **Code example:**
  ```typescript
  // src/shared/types/GameState.ts
  export interface GameResources {
    linesOfCode: number;
    features: number;
    money: number;
    customerLeads: number;
  }
  
  export interface Department {
    employees: number;
    managers: number;
    efficiency: number;
    productionRate: number;
  }
  ```
- **Validation:** Types compile and are importable
- **Time estimate:** 30 minutes

### WP 1.3: State Management Setup

#### Task 1.3.1: Initialize Legend State Store
- **Steps:**
  1. Create root observable
  2. Set up modular state structure
  3. Configure persistence plugin
- **Code example:**
  ```typescript
  // src/app/store/gameStore.ts
  import { observable } from '@legendapp/state';
  
  export const gameState$ = observable({
    resources: {
      linesOfCode: 0,
      features: 0,
      money: 0
    },
    settings: {
      audioEnabled: true,
      autoSaveInterval: 30000
    }
  });
  ```
- **Validation:** State updates trigger re-renders
- **Time estimate:** 45 minutes

#### Task 1.3.2: Create State Hooks
- **Steps:**
  1. Create useGameState hook
  2. Implement useResources hook
  3. Set up useGameActions hook
- **Code pattern:**
  ```typescript
  // src/shared/hooks/useGameState.ts
  import { use$ } from '@legendapp/state/react';
  
  export const useResources = () => {
    return use$(gameState$.resources);
  };
  ```
- **Validation:** Hooks work in components
- **Time estimate:** 30 minutes

### WP 1.4: Basic UI Foundation

#### Task 1.4.1: Create Main Game Layout
- **Steps:**
  1. Design responsive layout structure
  2. Create GameScreen component
  3. Set up navigation/routing if needed
  4. Implement basic styling system
- **Structure:**
  - Header with resource display
  - Main game area
  - Department panel
  - Footer with settings
- **Validation:** Layout renders on all screen sizes
- **Time estimate:** 1 hour

#### Task 1.4.2: Implement Resource Display
- **Steps:**
  1. Create ResourceDisplay component
  2. Connect to Legend State
  3. Format large numbers appropriately
  4. Add basic styling
- **Code snippet:**
  ```typescript
  const ResourceDisplay = () => {
    const resources = use$(gameState$.resources);
    return (
      <div>
        <span>Code: {formatNumber(resources.linesOfCode)}</span>
        <span>Money: ${formatNumber(resources.money)}</span>
      </div>
    );
  };
  ```
- **Validation:** Resources update in real-time
- **Time estimate:** 30 minutes

### WP 1.5: Testing Infrastructure

#### Task 1.5.1: Configure Testing Framework
- **Steps:**
  ```bash
  npm install -D jest @testing-library/react
  npm install -D @testing-library/user-event
  ```
  1. Create jest.config.js
  2. Set up test utilities
  3. Configure coverage reporting
- **Validation:** `npm test` runs successfully
- **Time estimate:** 30 minutes

#### Task 1.5.2: Write Initial Tests
- **Steps:**
  1. Test state initialization
  2. Test resource display
  3. Test type definitions
- **Example test:**
  ```typescript
  describe('GameState', () => {
    it('initializes with correct defaults', () => {
      expect(gameState$.resources.linesOfCode.get()).toBe(0);
    });
  });
  ```
- **Validation:** All tests pass
- **Time estimate:** 45 minutes

### WP 1.6: Development Workflow

#### Task 1.6.1: Set Up Development Scripts
- **Steps:**
  1. Configure npm scripts in package.json
  2. Set up hot reload
  3. Create build script
  4. Add linting/formatting scripts
- **Scripts to add:**
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "test": "jest",
      "lint": "eslint src/",
      "format": "prettier --write src/"
    }
  }
  ```
- **Validation:** All scripts run without errors
- **Time estimate:** 20 minutes

#### Task 1.6.2: Configure Git Hooks
- **Steps:**
  1. Install husky and lint-staged
  2. Set up pre-commit hooks
  3. Configure commit message format
- **Validation:** Commits trigger linting
- **Time estimate:** 15 minutes

## Deliverables Checklist

- [ ] Project initialized and running
- [ ] All dependencies installed
- [ ] TypeScript configured with strict mode
- [ ] Feature-based directory structure created
- [ ] Core types defined
- [ ] Legend State store initialized
- [ ] Custom hooks created
- [ ] Basic UI layout implemented
- [ ] Resource display working
- [ ] Testing framework configured
- [ ] Initial tests passing
- [ ] Development scripts working
- [ ] Git hooks configured

## Next Phase Dependencies
Phase 2 (Core Features) requires:
- Working state management system
- Basic UI components
- Type definitions
- Testing infrastructure

## Time Summary
- **Total estimated time:** 6-8 hours
- **Critical path:** Environment → Types → State → UI
- **Parallelizable:** Testing setup, development workflow

## Common Issues & Solutions

### Issue: Legend State Beta Version
- **Problem:** Beta version may have breaking changes
- **Solution:** Pin to specific beta version, monitor changelog

### Issue: TypeScript Strict Mode Errors
- **Problem:** Strict mode reveals type issues
- **Solution:** Fix incrementally, use `// @ts-expect-error` sparingly

### Issue: Performance in Development
- **Problem:** Hot reload slow with large state
- **Solution:** Use React DevTools Profiler, optimize re-renders