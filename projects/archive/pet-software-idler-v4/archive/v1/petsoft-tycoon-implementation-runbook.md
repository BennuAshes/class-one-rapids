# PetSoft Tycoon: Implementation Runbook
## Building the Ultimate Pet Business Software Company - Interactive Idle Game
### Comprehensive Development Guide for Junior to Senior Developers

---

## Document Control & Overview

| **Field** | **Details** |
|-----------|-------------|
| **Project** | PetSoft Tycoon Interactive Idle Game |
| **Runbook Version** | 1.0 |
| **Based on PRD** | Version 3.1 - Technical Requirements Analysis |
| **Target Audience** | Development team with junior to senior skill levels |
| **Implementation Timeline** | 6 weeks (MVP + Polish) |
| **Methodology** | Structured task decomposition with cognitive optimization |

---

## Executive Summary

### Project Overview
PetSoft Tycoon is an idle/incremental game where players build and manage a pet software company from garage startup to tech giant. This runbook provides comprehensive, step-by-step implementation guidance based on proven task decomposition principles and junior developer optimization.

### Technical Architecture Summary
- **Framework**: React Native + Expo for cross-platform development
- **State Management**: Legend State for reactive, persistent game state
- **Type Safety**: TypeScript for reliability and maintainability
- **Testing**: Comprehensive pyramid with Jest + React Native Testing Library + Maestro
- **Performance Target**: 60 FPS, <50ms response, <50MB memory usage

### Timeline and Milestone Overview
| **Phase** | **Duration** | **Key Deliverables** | **Success Criteria** |
|-----------|-------------|---------------------|---------------------|
| **Phase 1: Foundation** | Week 1 | Development environment, core architecture | Build system operational, Legend State configured |
| **Phase 2: Core Features** | Weeks 2-3 | Game loop, departments, basic progression | All user stories US-PST-001 to US-PST-005 complete |
| **Phase 3: Advanced Features** | Week 4 | Prestige system, department synergies | US-PST-006 to US-PST-007 complete |
| **Phase 4: Polish & UX** | Week 5 | Visual/audio feedback, animations | US-PST-008 to US-PST-010 complete |
| **Phase 5: Quality Assurance** | Week 6 | Testing, optimization, deployment prep | All acceptance criteria met, performance validated |

### Resource and Skill Requirements
- **Team Size**: 2-4 developers (1 senior + 1-3 junior/mid-level)
- **Skills Required**: React Native, TypeScript, Git workflow, testing practices
- **Skills to Learn**: Legend State patterns, Expo development, idle game mechanics
- **Tools Required**: VS Code, Git, Expo CLI, testing frameworks, performance monitoring

---

## Prerequisites and Setup

### Development Environment Requirements

#### System Requirements
- **Operating System**: macOS, Windows 10+, or Ubuntu 18.04+
- **Node.js**: Version 18+ (LTS recommended)
- **Git**: Latest stable version
- **Mobile Testing**: iOS Simulator (macOS) or Android emulator
- **IDE**: VS Code with React Native extensions

#### Tool Installation Checklist
```bash
# 1. Install Node.js (if not already installed)
# Download from https://nodejs.org/

# 2. Install Expo CLI globally
npm install -g @expo/cli

# 3. Verify installations
node --version  # Should be 18+
npm --version   # Should be 8+
expo --version  # Should be latest

# 4. Install iOS Simulator (macOS only)
# Install Xcode from App Store, then:
xcode-select --install

# 5. Install Android Studio (all platforms)
# Download from https://developer.android.com/studio
# Follow Android emulator setup instructions
```

#### Required VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-react-native"
  ]
}
```

#### Initial Project Structure Creation
```bash
# Create new Expo project with TypeScript
npx create-expo-app PetSoftTycoon --template blank-typescript

# Navigate to project directory
cd PetSoftTycoon

# Install required dependencies
npm install @legendapp/state @legendapp/state-persist-localstorage
npm install react-native-reanimated react-native-vector-icons
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Start development server to verify setup
npx expo start
```

#### Environment Readiness Validation Checklist
- [ ] Node.js 18+ installed and accessible
- [ ] Expo CLI installed globally
- [ ] Project created and dependencies installed
- [ ] Development server starts without errors
- [ ] Can access project on mobile device or simulator
- [ ] VS Code extensions installed and active
- [ ] Git repository initialized and first commit made

---

## Strategic Implementation Phases

### Phase 1: Foundation and Architecture
*Duration: Week 1 | Complexity: High | Lead: Senior Developer*

#### 1.1 Development Environment and Project Setup

##### Task 1.1.1: Expo Project Initialization and Configuration
**Objective**: Create production-ready Expo project with TypeScript and required dependencies

**Steps**:
1. **Create Expo project with TypeScript template**
   ```bash
   npx create-expo-app PetSoftTycoon --template blank-typescript
   cd PetSoftTycoon
   ```

2. **Install core dependencies**
   ```bash
   # State management
   npm install @legendapp/state @legendapp/state-persist-localstorage
   
   # Animation and UI
   npm install react-native-reanimated react-native-vector-icons
   
   # Testing framework
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   
   # Development tools
   npm install --save-dev eslint prettier typescript
   ```

3. **Configure app.json for cross-platform support**
   ```json
   {
     "expo": {
       "name": "PetSoft Tycoon",
       "slug": "petsoft-tycoon",
       "version": "1.0.0",
       "orientation": "portrait",
       "platforms": ["ios", "android", "web"],
       "assetBundlePatterns": ["**/*"],
       "web": {
         "bundler": "metro"
       }
     }
   }
   ```

4. **Set up ESLint and Prettier configuration**
   ```javascript
   // .eslintrc.js
   module.exports = {
     extends: ['expo', '@react-native-community', 'prettier'],
     plugins: ['prettier'],
     rules: {
       'prettier/prettier': 'error',
     },
   };
   ```

**Success Criteria**:
- [ ] Project builds and starts without errors
- [ ] Can access development server on mobile device
- [ ] TypeScript compilation works correctly
- [ ] ESLint and Prettier run without errors

**Time Estimate**: 2-3 hours
**Skills Required**: Basic React Native, command line usage
**Support Resources**: [Expo Getting Started Guide](https://docs.expo.dev/get-started/introduction/)

##### Task 1.1.2: Project Structure and Architectural Foundation
**Objective**: Create feature-based folder structure following vertical slicing principles

**Steps**:
1. **Create feature-based directory structure**
   ```
   src/
   ├── features/                    # Vertical slices by feature
   │   ├── core-gameplay/
   │   │   ├── components/         # UI components for core gameplay
   │   │   ├── hooks/             # Custom hooks for game logic
   │   │   ├── state/             # Legend State observables
   │   │   └── __tests__/         # Feature-specific tests
   │   ├── department-systems/
   │   ├── prestige-system/
   │   └── audio-visual/
   ├── shared/                     # Shared utilities and components
   │   ├── components/
   │   ├── hooks/
   │   ├── utils/
   │   └── types/
   └── App.tsx                     # Root application component
   ```

2. **Create TypeScript type definitions**
   ```typescript
   // src/shared/types/GameState.ts
   export interface GameState {
     resources: {
       linesOfCode: number;
       money: number;
       customerLeads: number;
     };
     departments: {
       development: DevelopmentDepartment;
       sales: SalesDepartment;
     };
     prestige: PrestigeState;
     gameTime: number;
     lastSaveTime: number;
   }

   export interface DevelopmentDepartment {
     employees: Employee[];
     productivity: number;
     upgrades: Upgrade[];
   }

   // Add additional interfaces as needed
   ```

3. **Set up barrel exports for clean imports**
   ```typescript
   // src/shared/types/index.ts
   export * from './GameState';
   export * from './Employee';
   export * from './Department';
   ```

**Success Criteria**:
- [ ] All directories created with proper structure
- [ ] TypeScript types compile without errors
- [ ] Import/export system works correctly
- [ ] Code follows project conventions

**Time Estimate**: 1-2 hours
**Skills Required**: TypeScript basics, file system organization
**Support Resources**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)

#### 1.2 Legend State Core Architecture Implementation

##### Task 1.2.1: Core Game State Setup with Legend State
**Objective**: Implement reactive game state management with automatic persistence

**Steps**:
1. **Create core game state structure**
   ```typescript
   // src/shared/state/gameState.ts
   import { observable } from '@legendapp/state';
   import { syncObservable } from '@legendapp/state-persist-localstorage';
   import { GameState } from '../types';

   export const gameState$ = observable<GameState>({
     resources: {
       linesOfCode: 0,
       money: 0,
       customerLeads: 0,
     },
     departments: {
       development: {
         employees: [],
         productivity: 0,
         upgrades: [],
       },
       sales: {
         employees: [],
         leadGeneration: 0,
         upgrades: [],
       },
     },
     prestige: {
       investorPoints: 0,
       currentRound: 0,
       permanentBonuses: {
         globalSpeedMultiplier: 1,
         startingCapitalBonus: 0,
       },
     },
     gameTime: Date.now(),
     lastSaveTime: Date.now(),
   });
   ```

2. **Implement automatic persistence**
   ```typescript
   // Configure automatic save/load
   syncObservable(gameState$, {
     persist: {
       name: 'petsoft-tycoon-save',
       plugin: ObservablePersistLocalStorage,
     },
     initial: gameState$.peek(), // Use current state as initial
   });
   ```

3. **Create computed properties for derived values**
   ```typescript
   // Add computed values to game state
   export const computedValues$ = observable({
     totalIncome: () => {
       const devOutput = gameState$.departments.development.productivity.get();
       const salesMultiplier = gameState$.departments.sales.leadGeneration.get();
       const prestigeMultiplier = gameState$.prestige.permanentBonuses.globalSpeedMultiplier.get();
       return devOutput * (1 + salesMultiplier * 0.1) * prestigeMultiplier;
     },
     
     nextPrestigeThreshold: () => {
       const currentRound = gameState$.prestige.currentRound.get();
       return Math.pow(10, 7 + currentRound); // $10M, $100M, $1B, etc.
     },
   });
   ```

**Success Criteria**:
- [ ] Game state loads and saves automatically
- [ ] Computed properties update reactively
- [ ] No memory leaks or performance issues
- [ ] State persists across app restarts

**Time Estimate**: 3-4 hours
**Skills Required**: Legend State patterns, reactive programming concepts
**Support Resources**: [Legend State Documentation](https://legendapp.com/open-source/state/)

##### Task 1.2.2: Game Loop and Timer System Implementation
**Objective**: Create 60fps game loop with background resource generation

**Steps**:
1. **Create game loop hook**
   ```typescript
   // src/shared/hooks/useGameLoop.ts
   import { useEffect, useRef } from 'react';
   import { gameState$, computedValues$ } from '../state/gameState';

   export const useGameLoop = () => {
     const animationRef = useRef<number>();
     const lastUpdateRef = useRef<number>(Date.now());

     useEffect(() => {
       const gameLoop = () => {
         const currentTime = Date.now();
         const deltaTime = (currentTime - lastUpdateRef.current) / 1000; // Convert to seconds
         
         // Update resources based on time elapsed
         updateResources(deltaTime);
         
         // Update game time
         gameState$.gameTime.set(currentTime);
         
         // Save every 30 seconds
         if (currentTime - gameState$.lastSaveTime.get() > 30000) {
           gameState$.lastSaveTime.set(currentTime);
           // Save is automatic with Legend State persistence
         }

         lastUpdateRef.current = currentTime;
         animationRef.current = requestAnimationFrame(gameLoop);
       };

       animationRef.current = requestAnimationFrame(gameLoop);

       return () => {
         if (animationRef.current) {
           cancelAnimationFrame(animationRef.current);
         }
       };
     }, []);
   };

   const updateResources = (deltaTime: number) => {
     const totalIncome = computedValues$.totalIncome.get();
     const currentMoney = gameState$.resources.money.get();
     const newMoney = currentMoney + (totalIncome * deltaTime);
     
     gameState$.resources.money.set(newMoney);
   };
   ```

2. **Create offline progress calculation**
   ```typescript
   // src/shared/utils/offlineProgress.ts
   export const calculateOfflineProgress = (lastSaveTime: number): OfflineProgress => {
     const currentTime = Date.now();
     const offlineTime = Math.min(currentTime - lastSaveTime, 12 * 60 * 60 * 1000); // 12 hour cap
     const offlineSeconds = offlineTime / 1000;
     
     const totalIncome = computedValues$.totalIncome.get();
     const offlineEarnings = totalIncome * offlineSeconds;
     
     return {
       timeAway: offlineTime,
       resourcesGained: {
         money: offlineEarnings,
         linesOfCode: 0, // Manual clicking only when active
       },
     };
   };
   ```

**Success Criteria**:
- [ ] Game loop runs at stable 60fps
- [ ] Resources update smoothly in real-time
- [ ] Offline progress calculates correctly
- [ ] No performance degradation over time

**Time Estimate**: 4-5 hours
**Skills Required**: React hooks, requestAnimationFrame, performance optimization
**Support Resources**: [React Native Performance](https://reactnative.dev/docs/performance)

#### 1.3 Testing Framework Foundation

##### Task 1.3.1: Testing Environment Setup and Configuration
**Objective**: Establish comprehensive testing framework for all development phases

**Steps**:
1. **Configure Jest for React Native**
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'react-native',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)'],
     transform: {
       '^.+\\.(ts|tsx)$': 'ts-jest',
     },
     moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
   };
   ```

2. **Set up testing utilities**
   ```typescript
   // jest.setup.js
   import '@testing-library/jest-native/extend-expect';
   
   // Mock Expo modules
   jest.mock('expo-constants', () => ({
     default: {
       statusBarHeight: 0,
     },
   }));
   ```

3. **Create test utilities for game state**
   ```typescript
   // src/shared/utils/testUtils.ts
   import { gameState$ } from '../state/gameState';
   import { GameState } from '../types';

   export const createTestGameState = (overrides?: Partial<GameState>): GameState => ({
     resources: { linesOfCode: 0, money: 100, customerLeads: 0 },
     departments: {
       development: { employees: [], productivity: 1, upgrades: [] },
       sales: { employees: [], leadGeneration: 0, upgrades: [] },
     },
     prestige: {
       investorPoints: 0,
       currentRound: 0,
       permanentBonuses: { globalSpeedMultiplier: 1, startingCapitalBonus: 0 },
     },
     gameTime: Date.now(),
     lastSaveTime: Date.now(),
     ...overrides,
   });

   export const resetGameStateForTest = () => {
     gameState$.set(createTestGameState());
   };
   ```

**Success Criteria**:
- [ ] Jest runs without configuration errors
- [ ] Test utilities work correctly
- [ ] Can run sample tests successfully
- [ ] TypeScript compilation works in test environment

**Time Estimate**: 2-3 hours
**Skills Required**: Jest configuration, testing concepts
**Support Resources**: [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

---

### Phase 2: Core Features Implementation
*Duration: Weeks 2-3 | Complexity: Medium-High | Lead: Senior Developer with Junior Support*

#### 2.1 Core Gameplay Loop (US-PST-001 to US-PST-003)

##### Task 2.1.1: Initial Code Writing Feature (US-PST-001)
**Objective**: Implement immediate click-to-reward gameplay with 50ms response time

**Steps**:
1. **Create WriteCodeButton component**
   ```typescript
   // src/features/core-gameplay/components/WriteCodeButton.tsx
   import React from 'react';
   import { Pressable, Text, StyleSheet, Animated } from 'react-native';
   import { observer } from '@legendapp/state-react';
   import { gameState$ } from '../../../shared/state/gameState';

   export const WriteCodeButton = observer(() => {
     const linesOfCode = gameState$.resources.linesOfCode.get();
     const animatedValue = new Animated.Value(1);

     const handlePress = () => {
       // Update state immediately (sub-50ms requirement)
       const currentLines = gameState$.resources.linesOfCode.get();
       gameState$.resources.linesOfCode.set(currentLines + 1);

       // Trigger button animation
       Animated.sequence([
         Animated.timing(animatedValue, { toValue: 0.9, duration: 50, useNativeDriver: true }),
         Animated.timing(animatedValue, { toValue: 1, duration: 100, useNativeDriver: true }),
       ]).start();

       // TODO: Add audio feedback in Phase 4
       // TODO: Add particle effects in Phase 4
     };

     return (
       <Animated.View style={[styles.container, { transform: [{ scale: animatedValue }] }]}>
         <Pressable style={styles.button} onPress={handlePress}>
           <Text style={styles.buttonText}>WRITE CODE</Text>
           <Text style={styles.counterText}>Lines: {linesOfCode}</Text>
         </Pressable>
       </Animated.View>
     );
   });

   const styles = StyleSheet.create({
     container: {
       alignItems: 'center',
       marginVertical: 20,
     },
     button: {
       backgroundColor: '#4CAF50',
       paddingHorizontal: 40,
       paddingVertical: 20,
       borderRadius: 10,
       elevation: 3,
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.25,
       shadowRadius: 3.84,
     },
     buttonText: {
       color: 'white',
       fontSize: 18,
       fontWeight: 'bold',
       textAlign: 'center',
     },
     counterText: {
       color: 'white',
       fontSize: 14,
       textAlign: 'center',
       marginTop: 5,
     },
   });
   ```

2. **Create first automation unlock logic**
   ```typescript
   // src/features/core-gameplay/hooks/useAutomationUnlocks.ts
   import { useEffect } from 'react';
   import { observer } from '@legendapp/state-react';
   import { gameState$ } from '../../../shared/state/gameState';

   export const useAutomationUnlocks = () => {
     useEffect(() => {
       const unsubscribe = gameState$.resources.linesOfCode.onChange((linesOfCode) => {
         // Unlock Junior Dev option after 5 clicks
         if (linesOfCode >= 5 && gameState$.resources.money.get() >= 10) {
           // Logic to show Junior Dev purchase option
           // This will be handled in the UI component
         }
       });

       return unsubscribe;
     }, []);
   };
   ```

3. **Write comprehensive tests**
   ```typescript
   // src/features/core-gameplay/__tests__/WriteCodeButton.test.tsx
   import React from 'react';
   import { fireEvent, render } from '@testing-library/react-native';
   import { WriteCodeButton } from '../components/WriteCodeButton';
   import { resetGameStateForTest } from '../../../shared/utils/testUtils';

   describe('WriteCodeButton', () => {
     beforeEach(() => {
       resetGameStateForTest();
     });

     it('increments lines of code when pressed', () => {
       const { getByText } = render(<WriteCodeButton />);
       const button = getByText('WRITE CODE');

       fireEvent.press(button);

       expect(getByText('Lines: 1')).toBeTruthy();
     });

     it('responds within 50ms requirement', async () => {
       const { getByText } = render(<WriteCodeButton />);
       const button = getByText('WRITE CODE');

       const startTime = Date.now();
       fireEvent.press(button);
       const endTime = Date.now();

       expect(endTime - startTime).toBeLessThan(50);
       expect(getByText('Lines: 1')).toBeTruthy();
     });
   });
   ```

**Success Criteria**:
- [ ] Button responds within 50ms of touch
- [ ] Lines of Code counter updates immediately
- [ ] Visual feedback animation plays smoothly
- [ ] Tests pass with >90% coverage
- [ ] No memory leaks or performance issues

**Time Estimate**: 4-6 hours
**Skills Required**: React Native components, Animated API, Legend State reactivity
**Assignment**: Junior developer with senior review
**Support Resources**: [React Native Pressable](https://reactnative.dev/docs/pressable), [Animated API](https://reactnative.dev/docs/animated)

##### Task 2.1.2: First Automation Implementation (US-PST-002)
**Objective**: Create automated resource generation with visual developer sprites

**Steps**:
1. **Create Employee system**
   ```typescript
   // src/shared/types/Employee.ts
   export interface Employee {
     id: string;
     name: string;
     type: 'junior-dev' | 'mid-dev' | 'senior-dev' | 'tech-lead';
     productivity: number;
     cost: number;
     hiredAt: number;
   }

   export const EMPLOYEE_TYPES = {
     'junior-dev': {
       name: 'Junior Developer',
       baseProductivity: 0.1, // lines per second
       baseCost: 10,
       description: 'Writes basic code functionality',
     },
     // Add other types as needed
   };
   ```

2. **Implement hire developer functionality**
   ```typescript
   // src/features/core-gameplay/hooks/useEmployeeHiring.ts
   import { gameState$ } from '../../../shared/state/gameState';
   import { Employee, EMPLOYEE_TYPES } from '../../../shared/types/Employee';

   export const useEmployeeHiring = () => {
     const hireEmployee = (type: keyof typeof EMPLOYEE_TYPES) => {
       const employeeConfig = EMPLOYEE_TYPES[type];
       const currentMoney = gameState$.resources.money.get();
       
       if (currentMoney < employeeConfig.baseCost) {
         return false; // Cannot afford
       }

       const newEmployee: Employee = {
         id: `${type}-${Date.now()}`,
         name: employeeConfig.name,
         type,
         productivity: employeeConfig.baseProductivity,
         cost: employeeConfig.baseCost,
         hiredAt: Date.now(),
       };

       // Deduct cost and add employee
       gameState$.resources.money.set(currentMoney - employeeConfig.baseCost);
       gameState$.departments.development.employees.push(newEmployee);
       
       return true;
     };

     const canAfford = (type: keyof typeof EMPLOYEE_TYPES): boolean => {
       const cost = EMPLOYEE_TYPES[type].baseCost;
       return gameState$.resources.money.get() >= cost;
     };

     return { hireEmployee, canAfford };
   };
   ```

3. **Update game loop to process automation**
   ```typescript
   // Update src/shared/hooks/useGameLoop.ts updateResources function
   const updateResources = (deltaTime: number) => {
     const employees = gameState$.departments.development.employees.get();
     
     // Calculate automated line generation
     const automatedLinesPerSecond = employees.reduce((sum, emp) => sum + emp.productivity, 0);
     const automatedLines = automatedLinesPerSecond * deltaTime;
     
     if (automatedLines > 0) {
       const currentLines = gameState$.resources.linesOfCode.get();
       gameState$.resources.linesOfCode.set(currentLines + automatedLines);
     }

     // Existing total income calculation...
     const totalIncome = computedValues$.totalIncome.get();
     const currentMoney = gameState$.resources.money.get();
     const newMoney = currentMoney + (totalIncome * deltaTime);
     
     gameState$.resources.money.set(newMoney);
   };
   ```

**Success Criteria**:
- [ ] Can hire Junior Dev when conditions are met
- [ ] Automated line generation works correctly
- [ ] Developer sprite appears in office view
- [ ] "Ship Feature" button unlocks at correct threshold
- [ ] All calculations are mathematically accurate

**Time Estimate**: 6-8 hours
**Skills Required**: React Native, business logic implementation, mathematical calculations
**Assignment**: Mid-level developer with senior review
**Support Resources**: Game design patterns, idle game mechanics documentation

#### 2.2 Department Systems Implementation (US-PST-004 to US-PST-005)

##### Task 2.2.1: Sales Department Implementation (US-PST-004)
**Objective**: Create multi-department gameplay with sales team mechanics

**Steps**:
1. **Extend department system for sales**
   ```typescript
   // src/shared/types/Department.ts
   export interface SalesDepartment {
     employees: SalesEmployee[];
     leadGeneration: number; // leads per second
     upgrades: DepartmentUpgrade[];
     unlocked: boolean;
   }

   export interface SalesEmployee extends Employee {
     type: 'sales-rep' | 'account-manager' | 'sales-director' | 'vp-sales';
     leadsPerSecond: number;
   }

   export const SALES_EMPLOYEE_TYPES = {
     'sales-rep': {
       name: 'Sales Rep',
       baseLeadGeneration: 0.2,
       baseCost: 100,
       description: 'Generates customer leads',
     },
     // Add other sales roles
   };
   ```

2. **Implement sales department unlock logic**
   ```typescript
   // src/features/department-systems/hooks/useDepartmentUnlocks.ts
   import { useEffect } from 'react';
   import { gameState$ } from '../../../shared/state/gameState';

   export const useDepartmentUnlocks = () => {
     useEffect(() => {
       const unsubscribe = gameState$.resources.money.onChange((totalMoney) => {
         // Unlock sales department at $500 total earned
         if (totalMoney >= 500 && !gameState$.departments.sales.unlocked.get()) {
           gameState$.departments.sales.unlocked.set(true);
           // TODO: Show office expansion animation in Phase 4
         }
       });

       return unsubscribe;
     }, []);
   };
   ```

3. **Create revenue conversion system**
   ```typescript
   // src/features/department-systems/utils/revenueCalculations.ts
   export const calculateRevenue = (leads: number, features: number): number => {
     const basicFeatureRevenue = 15;
     const leadBoostedRevenue = 50;
     
     // Convert leads + features to higher revenue
     const boostedSales = Math.min(leads, features);
     const regularFeatureSales = Math.max(0, features - boostedSales);
     
     return (boostedSales * leadBoostedRevenue) + (regularFeatureSales * basicFeatureRevenue);
   };
   ```

**Success Criteria**:
- [ ] Sales department unlocks at $500 total revenue
- [ ] Office visual expands to show new department
- [ ] Can hire Sales Reps for $100 each
- [ ] Lead generation rate is accurate (0.2 per second)
- [ ] Revenue conversion works correctly (1 Lead + 1 Feature = $50)

**Time Estimate**: 5-7 hours
**Skills Required**: Complex state management, business logic, UI updates
**Assignment**: Mid-level developer with senior consultation

##### Task 2.2.2: Department Synergies Implementation (US-PST-005)
**Objective**: Create strategic depth through department interactions

**Steps**:
1. **Implement synergy calculation system**
   ```typescript
   // src/features/department-systems/utils/synergyCalculations.ts
   import { gameState$ } from '../../../shared/state/gameState';

   export const calculateDepartmentSynergies = () => {
     const devEmployees = gameState$.departments.development.employees.get();
     const salesEmployees = gameState$.departments.sales.employees.get();
     
     const devCount = devEmployees.length;
     const salesCount = salesEmployees.length;
     
     // Synergy bonus based on balanced departments
     const balanceRatio = Math.min(devCount, salesCount) / Math.max(devCount, salesCount, 1);
     const synergyMultiplier = 1 + (balanceRatio * 0.2); // Up to 20% bonus
     
     return {
       multiplier: synergyMultiplier,
       devBonus: synergyMultiplier - 1,
       salesBonus: synergyMultiplier - 1,
       balanced: balanceRatio > 0.8, // Consider balanced if within 20%
     };
   };
   ```

2. **Create visual connection system**
   ```typescript
   // src/features/department-systems/components/DepartmentConnections.tsx
   import React from 'react';
   import { View, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state-react';
   import { calculateDepartmentSynergies } from '../utils/synergyCalculations';

   export const DepartmentConnections = observer(() => {
     const synergies = calculateDepartmentSynergies();
     
     if (!synergies.balanced) return null;

     return (
       <View style={styles.connectionContainer}>
         <View style={[styles.connectionLine, { opacity: synergies.multiplier }]} />
         {/* Add visual effects for active synergies */}
       </View>
     );
   });

   const styles = StyleSheet.create({
     connectionContainer: {
       position: 'absolute',
       top: '50%',
       left: '20%',
       right: '20%',
       height: 2,
     },
     connectionLine: {
       backgroundColor: '#FFD700', // Gold for active synergy
       height: 2,
       shadowColor: '#FFD700',
       shadowOffset: { width: 0, height: 0 },
       shadowOpacity: 0.8,
       shadowRadius: 10,
     },
   });
   ```

3. **Create efficiency meters**
   ```typescript
   // src/features/department-systems/components/EfficiencyMeter.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state-react';

   interface EfficiencyMeterProps {
     department: 'development' | 'sales';
     efficiency: number; // 0-1 range
   }

   export const EfficiencyMeter = observer(({ department, efficiency }: EfficiencyMeterProps) => {
     const percentage = Math.round(efficiency * 100);
     
     return (
       <View style={styles.container}>
         <Text style={styles.label}>{department} Efficiency</Text>
         <View style={styles.meterBackground}>
           <View style={[styles.meterFill, { width: `${percentage}%` }]} />
         </View>
         <Text style={styles.percentage}>{percentage}%</Text>
       </View>
     );
   });
   ```

**Success Criteria**:
- [ ] Department synergy calculations are accurate
- [ ] Visual connection lines appear when departments are balanced
- [ ] Efficiency meters update in real-time
- [ ] Synergy bonuses apply correctly to revenue
- [ ] UI clearly shows department performance

**Time Estimate**: 4-6 hours
**Skills Required**: Complex calculations, visual effects, real-time UI updates
**Assignment**: Junior developer with detailed guidance and senior review

---

### Phase 3: Advanced Features Implementation
*Duration: Week 4 | Complexity: High | Lead: Senior Developer*

#### 3.1 Prestige System Implementation (US-PST-006 to US-PST-007)

##### Task 3.1.1: Basic Investor Rounds (Prestige) System (US-PST-006)
**Objective**: Implement reset mechanics with permanent progression bonuses

**Steps**:
1. **Create prestige calculation system**
   ```typescript
   // src/features/prestige-system/utils/prestigeCalculations.ts
   import { gameState$ } from '../../../shared/state/gameState';

   export const calculatePrestigeRewards = () => {
     const currentValuation = gameState$.resources.money.get();
     const minimumPrestige = 10_000_000; // $10M minimum
     
     if (currentValuation < minimumPrestige) {
       return { canPrestige: false, investorPoints: 0, newBonuses: null };
     }

     const investorPoints = Math.floor(currentValuation / 1_000_000); // 1 IP per $1M
     const currentIP = gameState$.prestige.investorPoints.get();
     
     const newBonuses = {
       globalSpeedMultiplier: 1 + ((currentIP + investorPoints) * 0.01), // +1% per IP
       startingCapitalBonus: (currentIP + investorPoints) * 0.1, // +10% per IP
     };

     return { canPrestige: true, investorPoints, newBonuses };
   };

   export const executePrestige = () => {
     const rewards = calculatePrestigeRewards();
     if (!rewards.canPrestige) return false;

     // Add investor points
     const currentIP = gameState$.prestige.investorPoints.get();
     gameState$.prestige.investorPoints.set(currentIP + rewards.investorPoints);
     
     // Update permanent bonuses
     gameState$.prestige.permanentBonuses.set(rewards.newBonuses);
     
     // Increment round counter
     const currentRound = gameState$.prestige.currentRound.get();
     gameState$.prestige.currentRound.set(currentRound + 1);

     // Reset transient state
     resetGameState();
     
     return true;
   };

   const resetGameState = () => {
     // Reset everything except prestige data
     gameState$.resources.set({
       linesOfCode: 0,
       money: gameState$.prestige.permanentBonuses.startingCapitalBonus.get(),
       customerLeads: 0,
     });
     
     gameState$.departments.development.employees.set([]);
     gameState$.departments.sales.employees.set([]);
     
     // Reset department unlock status
     gameState$.departments.sales.unlocked.set(false);
   };
   ```

2. **Create prestige confirmation dialog**
   ```typescript
   // src/features/prestige-system/components/PrestigeDialog.tsx
   import React, { useState } from 'react';
   import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state-react';
   import { calculatePrestigeRewards, executePrestige } from '../utils/prestigeCalculations';

   interface PrestigeDialogProps {
     visible: boolean;
     onClose: () => void;
   }

   export const PrestigeDialog = observer(({ visible, onClose }: PrestigeDialogProps) => {
     const [isConfirming, setIsConfirming] = useState(false);
     const rewards = calculatePrestigeRewards();

     const handlePrestige = () => {
       if (!isConfirming) {
         setIsConfirming(true);
         return;
       }

       const success = executePrestige();
       if (success) {
         onClose();
         setIsConfirming(false);
       }
     };

     const handleCancel = () => {
       setIsConfirming(false);
       onClose();
     };

     return (
       <Modal visible={visible} transparent animationType="fade">
         <View style={styles.overlay}>
           <View style={styles.dialog}>
             <Text style={styles.title}>Investor Round</Text>
             <Text style={styles.description}>
               Reset your progress to gain {rewards.investorPoints} Investor Points!
             </Text>
             
             <Text style={styles.bonusText}>
               New Bonuses:
               {'\n'}• Global Speed: +{(rewards.newBonuses?.globalSpeedMultiplier - 1) * 100}%
               {'\n'}• Starting Capital: +{rewards.newBonuses?.startingCapitalBonus}
             </Text>

             <Text style={styles.warning}>
               {isConfirming 
                 ? 'Are you sure? This will reset all current progress!' 
                 : 'This will reset your current company but provide permanent bonuses.'}
             </Text>

             <View style={styles.buttonContainer}>
               <Pressable style={styles.cancelButton} onPress={handleCancel}>
                 <Text style={styles.cancelText}>Cancel</Text>
               </Pressable>
               <Pressable 
                 style={[styles.confirmButton, isConfirming && styles.dangerButton]} 
                 onPress={handlePrestige}
               >
                 <Text style={styles.confirmText}>
                   {isConfirming ? 'CONFIRM RESET' : 'Start Investor Round'}
                 </Text>
               </Pressable>
             </View>
           </View>
         </View>
       </Modal>
     );
   });
   ```

3. **Create prestige history display**
   ```typescript
   // src/features/prestige-system/components/PrestigeHistory.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import { observer } from '@legendapp/state-react';
   import { gameState$ } from '../../../shared/state/gameState';

   export const PrestigeHistory = observer(() => {
     const investorPoints = gameState$.prestige.investorPoints.get();
     const currentRound = gameState$.prestige.currentRound.get();
     const bonuses = gameState$.prestige.permanentBonuses.get();

     return (
       <View style={styles.container}>
         <Text style={styles.title}>Prestige Progress</Text>
         
         <View style={styles.statRow}>
           <Text style={styles.label}>Investor Points:</Text>
           <Text style={styles.value}>{investorPoints}</Text>
         </View>
         
         <View style={styles.statRow}>
           <Text style={styles.label}>Investment Round:</Text>
           <Text style={styles.value}>{getRoundName(currentRound)}</Text>
         </View>
         
         <View style={styles.bonusSection}>
           <Text style={styles.bonusTitle}>Active Bonuses:</Text>
           <Text style={styles.bonus}>Speed Bonus: +{((bonuses.globalSpeedMultiplier - 1) * 100).toFixed(1)}%</Text>
           <Text style={styles.bonus}>Starting Capital: ${bonuses.startingCapitalBonus.toFixed(0)}</Text>
         </View>
       </View>
     );
   });

   const getRoundName = (round: number): string => {
     const rounds = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'IPO'];
     return rounds[round] || `Series ${String.fromCharCode(65 + round - 2)}`;
   };
   ```

**Success Criteria**:
- [ ] Prestige available at $10M company valuation
- [ ] Confirmation dialog prevents accidental resets
- [ ] IP calculated correctly (1 IP per $1M valuation)
- [ ] Permanent bonuses apply correctly after reset
- [ ] Prestige history saves and displays correctly

**Time Estimate**: 8-10 hours
**Skills Required**: Complex state management, modal UI, mathematical calculations
**Assignment**: Senior developer with junior support on UI components

##### Task 3.1.2: Advanced Prestige Tiers (US-PST-007)
**Objective**: Implement enhanced prestige benefits and Super Units

**Steps**:
1. **Create tiered prestige system**
   ```typescript
   // src/features/prestige-system/utils/advancedPrestige.ts
   import { gameState$ } from '../../../shared/state/gameState';

   export interface PrestigeTier {
     name: string;
     threshold: number; // IP required
     benefits: {
       ipMultiplier: number;
       synergyBonus: number;
       superUnitsUnlocked: string[];
     };
   }

   export const PRESTIGE_TIERS: PrestigeTier[] = [
     {
       name: 'Seed Stage',
       threshold: 0,
       benefits: { ipMultiplier: 1, synergyBonus: 0, superUnitsUnlocked: [] },
     },
     {
       name: 'Series A',
       threshold: 100,
       benefits: { ipMultiplier: 1.5, synergyBonus: 0.02, superUnitsUnlocked: ['ai-assistant'] },
     },
     {
       name: 'Series B',
       threshold: 1000,
       benefits: { ipMultiplier: 2, synergyBonus: 0.05, superUnitsUnlocked: ['automation-bot'] },
     },
     {
       name: 'Series C',
       threshold: 10000,
       benefits: { ipMultiplier: 3, synergyBonus: 0.1, superUnitsUnlocked: ['quantum-computer'] },
     },
   ];

   export const getCurrentPrestigeTier = (): PrestigeTier => {
     const currentIP = gameState$.prestige.investorPoints.get();
     
     // Find highest tier that player qualifies for
     return PRESTIGE_TIERS
       .slice()
       .reverse()
       .find(tier => currentIP >= tier.threshold) || PRESTIGE_TIERS[0];
   };

   export const calculateEnhancedPrestigeRewards = (valuation: number): number => {
     const baseTier = getCurrentPrestigeTier();
     const baseIP = Math.floor(valuation / 1_000_000);
     
     return Math.floor(baseIP * baseTier.benefits.ipMultiplier);
   };
   ```

2. **Implement Super Units system**
   ```typescript
   // src/shared/types/SuperUnit.ts
   export interface SuperUnit {
     id: string;
     name: string;
     description: string;
     cost: number;
     unlockRequirement: number; // IP required
     effects: {
       globalMultiplier?: number;
       departmentBonus?: { [key: string]: number };
       specialAbility?: string;
     };
   }

   export const SUPER_UNITS: { [key: string]: SuperUnit } = {
     'ai-assistant': {
       id: 'ai-assistant',
       name: 'AI Assistant',
       description: 'Multiplies all productivity by 2x',
       cost: 50,
       unlockRequirement: 100,
       effects: { globalMultiplier: 2 },
     },
     'automation-bot': {
       id: 'automation-bot',
       name: 'Automation Bot',
       description: 'Reduces employee costs by 50%',
       cost: 500,
       unlockRequirement: 1000,
       effects: { specialAbility: 'cost-reduction' },
     },
     // Add more super units as needed
   };
   ```

3. **Create enhanced prestige animations**
   ```typescript
   // src/features/prestige-system/components/PrestigeAnimation.tsx
   import React, { useEffect, useRef } from 'react';
   import { Animated, View, Text, StyleSheet } from 'react-native';

   interface PrestigeAnimationProps {
     visible: boolean;
     tier: PrestigeTier;
     onComplete: () => void;
   }

   export const PrestigeAnimation: React.FC<PrestigeAnimationProps> = ({
     visible,
     tier,
     onComplete,
   }) => {
     const fadeAnim = useRef(new Animated.Value(0)).current;
     const scaleAnim = useRef(new Animated.Value(0.5)).current;

     useEffect(() => {
       if (visible) {
         Animated.sequence([
           Animated.parallel([
             Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
             Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
           ]),
           Animated.delay(2000), // Show animation for 2 seconds
           Animated.parallel([
             Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
             Animated.timing(scaleAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
           ]),
         ]).start(() => onComplete());
       }
     }, [visible]);

     if (!visible) return null;

     return (
       <View style={styles.overlay}>
         <Animated.View 
           style={[
             styles.animationContainer,
             { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
           ]}
         >
           <Text style={styles.title}>🎉 {tier.name} Achieved! 🎉</Text>
           <Text style={styles.subtitle}>Investor Meeting Successfully Completed</Text>
         </Animated.View>
       </View>
     );
   };
   ```

**Success Criteria**:
- [ ] Enhanced IP conversion rates work for Series A ($10M+) and Series B ($100M+) thresholds
- [ ] Super Units unlock at correct IP milestones (100, 1K, 10K IP)
- [ ] Department synergy bonuses increase by +2% per 10 IP
- [ ] Prestige progression shows investor meeting animations
- [ ] All tier calculations are mathematically accurate

**Time Estimate**: 6-8 hours
**Skills Required**: Complex mathematical systems, advanced animations, tier-based progression
**Assignment**: Senior developer exclusively (high complexity)

---

### Phase 4: Polish & User Experience Implementation
*Duration: Week 5 | Complexity: Medium | Lead: Mid-level Developer with Design Support*

#### 4.1 Visual Feedback Systems (US-PST-008)

##### Task 4.1.1: Animation and Visual Effects System
**Objective**: Create satisfying visual feedback for all player actions

**Steps**:
1. **Create feedback animation components**
   ```typescript
   // src/features/audio-visual/components/NumberPopup.tsx
   import React, { useEffect, useRef } from 'react';
   import { Animated, Text, StyleSheet } from 'react-native';

   interface NumberPopupProps {
     value: number;
     position: { x: number; y: number };
     onComplete: () => void;
   }

   export const NumberPopup: React.FC<NumberPopupProps> = ({ value, position, onComplete }) => {
     const translateY = useRef(new Animated.Value(0)).current;
     const opacity = useRef(new Animated.Value(1)).current;
     const scale = useRef(new Animated.Value(1)).current;

     useEffect(() => {
       Animated.parallel([
         Animated.timing(translateY, { toValue: -50, duration: 1000, useNativeDriver: true }),
         Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
         Animated.sequence([
           Animated.timing(scale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
           Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
         ]),
       ]).start(onComplete);
     }, []);

     const getColor = (value: number): string => {
       if (value >= 1000) return '#FFD700'; // Gold for big numbers
       if (value >= 100) return '#32CD32';  // Green for medium
       return '#FFFFFF';                    // White for small
     };

     return (
       <Animated.View
         style={[
           styles.container,
           {
             left: position.x,
             top: position.y,
             transform: [{ translateY }, { scale }],
             opacity,
           },
         ]}
       >
         <Text style={[styles.text, { color: getColor(value) }]}>
           +{value < 1 ? value.toFixed(1) : Math.floor(value)}
         </Text>
       </Animated.View>
     );
   };
   ```

2. **Implement screen shake system**
   ```typescript
   // src/features/audio-visual/hooks/useScreenShake.ts
   import { useRef } from 'react';
   import { Animated } from 'react-native';

   export const useScreenShake = () => {
     const shakeAnimation = useRef(new Animated.Value(0)).current;

     const shake = (intensity: number = 1) => {
       const shakeDistance = intensity * 10;
       
       Animated.sequence([
         Animated.timing(shakeAnimation, { toValue: shakeDistance, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnimation, { toValue: -shakeDistance, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnimation, { toValue: shakeDistance / 2, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
       ]).start();
     };

     return {
       shakeTransform: [{ translateX: shakeAnimation }],
       shake,
     };
   };
   ```

3. **Create particle effect system**
   ```typescript
   // src/features/audio-visual/components/ParticleSystem.tsx
   import React, { useEffect, useRef } from 'react';
   import { Animated, View, StyleSheet } from 'react-native';

   interface Particle {
     id: number;
     x: number;
     y: number;
     vx: number;
     vy: number;
     life: number;
     color: string;
   }

   interface ParticleSystemProps {
     active: boolean;
     particleCount: number;
     origin: { x: number; y: number };
     colors: string[];
   }

   export const ParticleSystem: React.FC<ParticleSystemProps> = ({
     active,
     particleCount,
     origin,
     colors,
   }) => {
     const particles = useRef<Particle[]>([]);
     const animationRef = useRef<number>();

     const createParticle = (index: number): Particle => ({
       id: index,
       x: origin.x + (Math.random() - 0.5) * 20,
       y: origin.y + (Math.random() - 0.5) * 20,
       vx: (Math.random() - 0.5) * 100,
       vy: -Math.random() * 50 - 25,
       life: 1,
       color: colors[Math.floor(Math.random() * colors.length)],
     });

     const updateParticles = () => {
       particles.current = particles.current
         .map(particle => ({
           ...particle,
           x: particle.x + particle.vx * 0.016,
           y: particle.y + particle.vy * 0.016,
           vy: particle.vy + 98 * 0.016, // gravity
           life: particle.life - 0.016,
         }))
         .filter(particle => particle.life > 0);

       if (particles.current.length > 0) {
         animationRef.current = requestAnimationFrame(updateParticles);
       }
     };

     useEffect(() => {
       if (active) {
         // Create initial particles
         particles.current = Array.from({ length: particleCount }, (_, i) => createParticle(i));
         updateParticles();
       }

       return () => {
         if (animationRef.current) {
           cancelAnimationFrame(animationRef.current);
         }
       };
     }, [active]);

     return (
       <View style={styles.container} pointerEvents="none">
         {particles.current.map(particle => (
           <View
             key={particle.id}
             style={[
               styles.particle,
               {
                 left: particle.x,
                 top: particle.y,
                 backgroundColor: particle.color,
                 opacity: particle.life,
               },
             ]}
           />
         ))}
       </View>
     );
   };
   ```

**Success Criteria**:
- [ ] Number popups appear for all value changes
- [ ] Screen shake intensity scales with action significance
- [ ] Particle effects trigger on major milestones
- [ ] Color progression follows white → green → gold for value tiers
- [ ] All animations maintain 60fps performance

**Time Estimate**: 6-8 hours
**Skills Required**: Advanced React Native animations, performance optimization
**Assignment**: Mid-level developer with performance monitoring

#### 4.2 Audio Design Implementation (US-PST-009)

##### Task 4.2.1: Contextual Audio System
**Objective**: Create enhanced audio feedback without repetition or annoyance

**Steps**:
1. **Create audio management system**
   ```typescript
   // src/features/audio-visual/hooks/useAudioManager.ts
   import { useRef, useCallback } from 'react';
   import { Audio } from 'expo-av';

   interface AudioManager {
     playSound: (soundName: string, volume?: number) => Promise<void>;
     setMasterVolume: (volume: number) => void;
     setEnabled: (enabled: boolean) => void;
   }

   export const useAudioManager = (): AudioManager => {
     const soundsRef = useRef<{ [key: string]: Audio.Sound }>({});
     const lastPlayedRef = useRef<{ [key: string]: number }>({});
     const masterVolumeRef = useRef(1);
     const enabledRef = useRef(true);

     const loadSound = async (soundName: string, uri: string): Promise<Audio.Sound> => {
       if (soundsRef.current[soundName]) {
         return soundsRef.current[soundName];
       }

       const { sound } = await Audio.Sound.createAsync({ uri });
       soundsRef.current[soundName] = sound;
       return sound;
     };

     const playSound = useCallback(async (soundName: string, volume: number = 1) => {
       if (!enabledRef.current) return;

       const now = Date.now();
       const lastPlayed = lastPlayedRef.current[soundName] || 0;
       
       // Prevent sounds from repeating within 500ms
       if (now - lastPlayed < 500) return;

       try {
         const sound = await loadSound(soundName, getSoundUri(soundName));
         const adjustedVolume = Math.min(volume * masterVolumeRef.current, 1);
         
         await sound.setVolumeAsync(adjustedVolume);
         await sound.replayAsync();
         
         lastPlayedRef.current[soundName] = now;
       } catch (error) {
         console.warn('Failed to play sound:', soundName, error);
       }
     }, []);

     const setMasterVolume = useCallback((volume: number) => {
       masterVolumeRef.current = Math.max(0, Math.min(1, volume));
     }, []);

     const setEnabled = useCallback((enabled: boolean) => {
       enabledRef.current = enabled;
     }, []);

     return { playSound, setMasterVolume, setEnabled };
   };

   const getSoundUri = (soundName: string): string => {
     const soundMap = {
       'keyboard-click': require('../../../assets/sounds/keyboard-click.wav'),
       'cash-register': require('../../../assets/sounds/cash-register.wav'),
       'notification': require('../../../assets/sounds/notification.wav'),
       'level-up': require('../../../assets/sounds/level-up.wav'),
       'prestige': require('../../../assets/sounds/prestige.wav'),
     };
     
     return soundMap[soundName] || soundMap['notification'];
   };
   ```

2. **Implement intelligent volume scaling**
   ```typescript
   // src/features/audio-visual/utils/audioScaling.ts
   export class AudioScaler {
     private frequencies: { [key: string]: number } = {};
     private lastReset = Date.now();

     trackSound(soundName: string) {
       this.frequencies[soundName] = (this.frequencies[soundName] || 0) + 1;
       
       // Reset frequency counters every minute
       if (Date.now() - this.lastReset > 60000) {
         this.frequencies = {};
         this.lastReset = Date.now();
       }
     }

     getScaledVolume(soundName: string, baseVolume: number = 1): number {
       const frequency = this.frequencies[soundName] || 0;
       
       // Reduce volume based on frequency (inverse relationship)
       if (frequency > 10) {
         return baseVolume * 0.3; // Very quiet for frequent sounds
       } else if (frequency > 5) {
         return baseVolume * 0.6; // Moderately quiet
       }
       
       return baseVolume; // Full volume for infrequent sounds
     }
   }

   export const audioScaler = new AudioScaler();
   ```

3. **Create milestone celebration audio**
   ```typescript
   // src/features/audio-visual/hooks/useCelebrationAudio.ts
   import { useEffect } from 'react';
   import { gameState$ } from '../../../shared/state/gameState';
   import { useAudioManager } from './useAudioManager';

   export const useCelebrationAudio = () => {
     const audioManager = useAudioManager();

     useEffect(() => {
       // Listen for major milestone achievements
       const unsubscribeMoney = gameState$.resources.money.onChange((money, previousMoney) => {
         const milestones = [1000, 10000, 100000, 1000000, 10000000];
         
         for (const milestone of milestones) {
           if (previousMoney < milestone && money >= milestone) {
             // Override normal sounds with celebration
             audioManager.playSound('level-up', 1.0);
             break;
           }
         }
       });

       const unsubscribePrestige = gameState$.prestige.currentRound.onChange((round, previousRound) => {
         if (round > previousRound) {
           // Prestige sound overrides everything
           audioManager.playSound('prestige', 1.0);
         }
       });

       return () => {
         unsubscribeMoney();
         unsubscribePrestige();
       };
     }, []);
   };
   ```

**Success Criteria**:
- [ ] Each action type has distinct sound (keyboard clicks for coding, cash register for sales)
- [ ] Sounds never repeat within 0.5 seconds
- [ ] Volume scales inversely with frequency (frequent actions quieter)
- [ ] Milestone achievements override normal sounds with celebration audio
- [ ] Can disable audio while maintaining visual feedback

**Time Estimate**: 5-7 hours
**Skills Required**: Expo Audio API, sound management, frequency analysis
**Assignment**: Junior developer with detailed audio requirements documentation

#### 4.3 Office Evolution Implementation (US-PST-010)

##### Task 4.3.1: Dynamic Visual Environment System
**Objective**: Implement visual progression representation through office evolution

**Steps**:
1. **Create office layout system**
   ```typescript
   // src/features/audio-visual/components/OfficeLayout.tsx
   import React from 'react';
   import { View, StyleSheet, Dimensions } from 'react-native';
   import { observer } from '@legendapp/state-react';
   import { gameState$ } from '../../../shared/state/gameState';

   interface OfficeStage {
     name: string;
     threshold: number;
     dimensions: { width: number; height: number };
     backgroundImage: string;
     departmentPositions: { [key: string]: { x: number; y: number } };
   }

   const OFFICE_STAGES: OfficeStage[] = [
     {
       name: 'Garage',
       threshold: 0,
       dimensions: { width: 300, height: 200 },
       backgroundImage: 'garage-bg',
       departmentPositions: {
         development: { x: 150, y: 100 },
       },
     },
     {
       name: 'Small Office',
       threshold: 10000,
       dimensions: { width: 500, height: 300 },
       backgroundImage: 'small-office-bg',
       departmentPositions: {
         development: { x: 200, y: 150 },
         sales: { x: 350, y: 150 },
       },
     },
     {
       name: 'Medium Office',
       threshold: 1000000,
       dimensions: { width: 800, height: 500 },
       backgroundImage: 'medium-office-bg',
       departmentPositions: {
         development: { x: 200, y: 200 },
         sales: { x: 600, y: 200 },
         customer_experience: { x: 400, y: 350 },
       },
     },
     // Add more stages as needed
   ];

   export const OfficeLayout = observer(() => {
     const currentMoney = gameState$.resources.money.get();
     
     const getCurrentStage = (): OfficeStage => {
       return OFFICE_STAGES
         .slice()
         .reverse()
         .find(stage => currentMoney >= stage.threshold) || OFFICE_STAGES[0];
     };

     const currentStage = getCurrentStage();

     return (
       <View style={[styles.container, currentStage.dimensions]}>
         <OfficeBackground stage={currentStage} />
         <DepartmentPositions stage={currentStage} />
       </View>
     );
   });
   ```

2. **Implement smooth camera transitions**
   ```typescript
   // src/features/audio-visual/hooks/useCameraTransition.ts
   import { useEffect, useRef } from 'react';
   import { Animated } from 'react-native';
   import { gameState$ } from '../../../shared/state/gameState';

   export const useCameraTransition = () => {
     const scaleAnim = useRef(new Animated.Value(1)).current;
     const translateXAnim = useRef(new Animated.Value(0)).current;
     const translateYAnim = useRef(new Animated.Value(0)).current;

     const transitionToStage = (stage: OfficeStage) => {
       const targetScale = Math.min(1, 800 / stage.dimensions.width);
       
       Animated.parallel([
         Animated.timing(scaleAnim, {
           toValue: targetScale,
           duration: 1500,
           useNativeDriver: true,
         }),
         Animated.timing(translateXAnim, {
           toValue: 0,
           duration: 1500,
           useNativeDriver: true,
         }),
         Animated.timing(translateYAnim, {
           toValue: 0,
           duration: 1500,
           useNativeDriver: true,
         }),
       ]).start();
     };

     useEffect(() => {
       const unsubscribe = gameState$.resources.money.onChange((money, previousMoney) => {
         const thresholds = [10000, 1000000, 100000000, 1000000000];
         
         for (const threshold of thresholds) {
           if (previousMoney < threshold && money >= threshold) {
             // Trigger office evolution
             const newStage = getCurrentOfficeStage(money);
             transitionToStage(newStage);
             break;
           }
         }
       });

       return unsubscribe;
     }, []);

     return {
       cameraTransform: [
         { scale: scaleAnim },
         { translateX: translateXAnim },
         { translateY: translateYAnim },
       ],
     };
   };
   ```

3. **Create celebration animations for office evolution**
   ```typescript
   // src/features/audio-visual/components/OfficeEvolutionCelebration.tsx
   import React, { useEffect, useRef } from 'react';
   import { Animated, View, Text, StyleSheet } from 'react-native';

   interface OfficeEvolutionCelebrationProps {
     visible: boolean;
     stageName: string;
     onComplete: () => void;
   }

   export const OfficeEvolutionCelebration: React.FC<OfficeEvolutionCelebrationProps> = ({
     visible,
     stageName,
     onComplete,
   }) => {
     const fadeAnim = useRef(new Animated.Value(0)).current;
     const slideAnim = useRef(new Animated.Value(100)).current;
     const confettiAnim = useRef(new Animated.Value(0)).current;

     useEffect(() => {
       if (visible) {
         Animated.sequence([
           Animated.parallel([
             Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
             Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
           ]),
           Animated.timing(confettiAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
           Animated.delay(2000),
           Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
         ]).start(onComplete);
       }
     }, [visible]);

     if (!visible) return null;

     return (
       <View style={styles.overlay}>
         <Animated.View 
           style={[
             styles.celebrationContainer,
             { 
               opacity: fadeAnim,
               transform: [{ translateY: slideAnim }],
             },
           ]}
         >
           <Text style={styles.title}>🏢 Office Upgraded! 🏢</Text>
           <Text style={styles.subtitle}>Welcome to your {stageName}!</Text>
         </Animated.View>
         
         {/* Confetti effect */}
         <Animated.View 
           style={[
             styles.confetti,
             { opacity: confettiAnim },
           ]}
         >
           {/* Render confetti particles */}
         </Animated.View>
       </View>
     );
   };
   ```

**Success Criteria**:
- [ ] Office visually evolves at correct revenue milestones ($10K, $1M, $100M, $1B)
- [ ] Camera smoothly zooms out to accommodate larger spaces
- [ ] New departments appear in appropriate office areas
- [ ] Office evolution triggers celebration animations
- [ ] All transitions maintain 60fps performance

**Time Estimate**: 8-10 hours
**Skills Required**: Complex animations, layout management, visual design coordination
**Assignment**: Mid-level developer with design team collaboration

---

### Phase 5: Quality Assurance and Optimization
*Duration: Week 6 | Complexity: Medium-High | Lead: Senior Developer with QA Focus*

#### 5.1 Performance Optimization and Validation

##### Task 5.1.1: 60fps Performance Validation and Optimization
**Objective**: Ensure consistent 60fps performance under all gameplay conditions

**Steps**:
1. **Implement performance monitoring system**
   ```typescript
   // src/shared/utils/performanceMonitor.ts
   export class PerformanceMonitor {
     private frameCount = 0;
     private lastFPSCheck = Date.now();
     private fpsHistory: number[] = [];
     private memoryUsage: number[] = [];

     startMonitoring() {
       const monitor = () => {
         this.frameCount++;
         const now = Date.now();
         
         if (now - this.lastFPSCheck >= 1000) {
           const fps = this.frameCount;
           this.fpsHistory.push(fps);
           
           // Keep only last 60 seconds of data
           if (this.fpsHistory.length > 60) {
             this.fpsHistory.shift();
           }
           
           // Log performance issues
           if (fps < 50) {
             console.warn(`Low FPS detected: ${fps}`);
           }
           
           this.frameCount = 0;
           this.lastFPSCheck = now;
         }
         
         // Track memory usage
         if ((performance as any).memory) {
           const memoryMB = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
           this.memoryUsage.push(memoryMB);
           
           if (memoryMB > 50) {
             console.warn(`High memory usage: ${memoryMB.toFixed(1)}MB`);
           }
         }
         
         requestAnimationFrame(monitor);
       };
       
       requestAnimationFrame(monitor);
     }

     getAverageFPS(): number {
       return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length || 0;
     }

     getCurrentMemoryUsage(): number {
       return this.memoryUsage[this.memoryUsage.length - 1] || 0;
     }
   }

   export const performanceMonitor = new PerformanceMonitor();
   ```

2. **Create performance optimization utilities**
   ```typescript
   // src/shared/utils/optimizationUtils.ts
   import { gameState$ } from '../state/gameState';

   export const optimizeForPerformance = () => {
     const currentFPS = performanceMonitor.getAverageFPS();
     const memoryUsage = performanceMonitor.getCurrentMemoryUsage();
     
     if (currentFPS < 50 || memoryUsage > 40) {
       // Reduce visual effects
       disableNonCriticalAnimations();
       reduceParticleEffects();
       
       console.log('Performance optimization activated');
     }
   };

   const disableNonCriticalAnimations = () => {
     // Disable particle effects for non-milestone events
     // Reduce animation complexity
     // Simplify visual feedback
   };

   const reduceParticleEffects = () => {
     // Limit particle count
     // Reduce particle lifetime
     // Simplify particle physics
   };
   ```

3. **Implement comprehensive performance tests**
   ```typescript
   // src/__tests__/performance.test.ts
   import { performanceMonitor } from '../shared/utils/performanceMonitor';
   import { gameState$ } from '../shared/state/gameState';
   import { createTestGameState } from '../shared/utils/testUtils';

   describe('Performance Tests', () => {
     beforeEach(() => {
       gameState$.set(createTestGameState());
       performanceMonitor.startMonitoring();
     });

     it('maintains 60fps during normal gameplay', async () => {
       // Simulate 10 seconds of gameplay
       for (let i = 0; i < 600; i++) { // 60fps * 10 seconds
         // Trigger game loop updates
         await new Promise(resolve => requestAnimationFrame(resolve));
       }
       
       const averageFPS = performanceMonitor.getAverageFPS();
       expect(averageFPS).toBeGreaterThanOrEqual(58); // Allow 2fps tolerance
     });

     it('stays under 50MB memory usage', () => {
       // Run memory-intensive operations
       for (let i = 0; i < 1000; i++) {
         gameState$.resources.linesOfCode.set(i);
         gameState$.resources.money.set(i * 100);
       }
       
       const memoryUsage = performanceMonitor.getCurrentMemoryUsage();
       expect(memoryUsage).toBeLessThan(50);
     });

     it('responds to interactions under 50ms', async () => {
       const startTime = performance.now();
       
       // Simulate button press
       gameState$.resources.linesOfCode.set(gameState$.resources.linesOfCode.get() + 1);
       
       const responseTime = performance.now() - startTime;
       expect(responseTime).toBeLessThan(50);
     });
   });
   ```

**Success Criteria**:
- [ ] Consistent 60 FPS during normal gameplay with up to 100 active animations
- [ ] All interactions respond within 50ms under normal load conditions
- [ ] Memory usage stays below 50MB after 8 hours of continuous gameplay
- [ ] Performance monitoring system detects and logs issues automatically
- [ ] Automatic optimization system activates when performance degrades

**Time Estimate**: 6-8 hours
**Skills Required**: Performance optimization, profiling, automated testing
**Assignment**: Senior developer with performance expertise

##### Task 5.1.2: Cross-platform Compatibility Testing
**Objective**: Ensure consistent functionality across web, iOS, and Android platforms

**Steps**:
1. **Set up cross-platform testing environment**
   ```bash
   # Test on web
   npx expo start --web

   # Test on iOS simulator (macOS only)
   npx expo start --ios

   # Test on Android emulator
   npx expo start --android

   # Build for all platforms
   eas build --platform all
   ```

2. **Create platform-specific compatibility tests**
   ```typescript
   // src/__tests__/crossPlatform.test.ts
   import { Platform } from 'react-native';
   import { gameState$ } from '../shared/state/gameState';

   describe('Cross-platform Compatibility', () => {
     it('state persistence works on all platforms', async () => {
       // Set test data
       gameState$.resources.money.set(1000);
       gameState$.prestige.investorPoints.set(5);
       
       // Simulate app restart by clearing and reloading state
       // This tests the persistence layer
       expect(gameState$.resources.money.get()).toBe(1000);
       expect(gameState$.prestige.investorPoints.get()).toBe(5);
     });

     it('audio system works on all platforms', () => {
       // Test audio loading and playback capability
       // This should gracefully handle platform differences
     });

     it('animations perform consistently across platforms', () => {
       // Test animation performance on different devices
       // May need platform-specific optimizations
     });

     it('touch interactions work on mobile platforms', () => {
       if (Platform.OS !== 'web') {
         // Test mobile-specific touch handling
         // Verify gesture recognition works correctly
       }
     });
   });
   ```

**Success Criteria**:
- [ ] Game functions identically on web, iOS, and Android
- [ ] Save system works consistently across all platforms
- [ ] Performance targets met on all supported devices
- [ ] Touch interactions optimized for mobile devices
- [ ] Audio system handles platform-specific requirements

**Time Estimate**: 4-6 hours
**Skills Required**: Cross-platform development, device testing
**Assignment**: Mid-level developer with access to multiple devices

#### 5.2 Comprehensive Testing and Quality Validation

##### Task 5.2.1: End-to-End Testing with Maestro
**Objective**: Validate complete user journeys with automated E2E testing

**Steps**:
1. **Set up Maestro testing framework**
   ```bash
   # Install Maestro CLI
   curl -Ls "https://get.maestro.mobile.dev" | bash

   # Create test directory
   mkdir e2e-tests
   ```

2. **Create core gameplay flow tests**
   ```yaml
   # e2e-tests/core-gameplay.yaml
   appId: com.yourcompany.petsofttycoon
   
   ---
   - launchApp
   - assertVisible: "WRITE CODE"
   
   # Test initial code writing (US-PST-001)
   - tapOn: "WRITE CODE"
   - assertVisible: "Lines: 1"
   - tapOn: "WRITE CODE"
   - tapOn: "WRITE CODE" 
   - tapOn: "WRITE CODE"
   - tapOn: "WRITE CODE"
   - assertVisible: "Lines: 5"
   - assertVisible: "Hire Junior Dev"
   
   # Test first automation (US-PST-002)
   - tapOn: "Hire Junior Dev"
   - assertVisible: "Junior Developer"
   - wait: 2000  # Wait for automated generation
   - assertVisible: "Lines: 5.2"  # Should have generated some lines
   
   # Test sales department unlock (US-PST-004)
   - repeat:
       times: 100
       commands:
         - tapOn: "Ship Feature"
         - wait: 100
   - assertVisible: "Sales Department"
   
   # Test prestige system (US-PST-006)
   - repeat:
       times: 1000  
       commands:
         - wait: 1000  # Let automation run
   - assertVisible: "Investor Round"
   - tapOn: "Investor Round"
   - assertVisible: "Reset your progress"
   - tapOn: "Start Investor Round"
   - assertVisible: "CONFIRM RESET"
   - tapOn: "CONFIRM RESET"
   - assertVisible: "Lines: 0"  # Should be reset
   - assertVisible: "Investor Points: 1"  # Should have gained IP
   ```

3. **Create performance validation tests**
   ```yaml
   # e2e-tests/performance.yaml
   appId: com.yourcompany.petsofttycoon
   
   ---
   - launchApp
   - assertVisible: "WRITE CODE"
   
   # Stress test rapid interactions
   - repeat:
       times: 100
       commands:
         - tapOn: "WRITE CODE"
         - wait: 50  # Test 50ms response requirement
   
   # Long session stability test
   - repeat:
       times: 600  # 10 minutes at 1 action per second
       commands:
         - tapOn: "WRITE CODE"
         - wait: 1000
   
   - assertVisible: "Lines:"  # Should still be responsive
   ```

4. **Set up automated test execution**
   ```bash
   #!/bin/bash
   # scripts/run-e2e-tests.sh
   
   echo "Starting E2E testing..."
   
   # Start development server
   npx expo start --clear &
   SERVER_PID=$!
   
   # Wait for server to be ready
   sleep 30
   
   # Run Maestro tests
   maestro test e2e-tests/core-gameplay.yaml
   maestro test e2e-tests/performance.yaml
   maestro test e2e-tests/cross-platform.yaml
   
   # Cleanup
   kill $SERVER_PID
   
   echo "E2E testing completed"
   ```

**Success Criteria**:
- [ ] All critical user journeys complete successfully
- [ ] Performance requirements validated through automated testing
- [ ] Long-session stability confirmed (10+ minute sessions)
- [ ] Cross-platform compatibility verified on real devices
- [ ] Regression testing prevents feature breaks

**Time Estimate**: 8-10 hours
**Skills Required**: Maestro framework, E2E testing patterns, test automation
**Assignment**: QA engineer or senior developer with testing expertise

##### Task 5.2.2: Final Quality Validation and Bug Fixing
**Objective**: Comprehensive quality assurance and issue resolution

**Steps**:
1. **Create comprehensive quality checklist**
   ```typescript
   // Quality Validation Checklist
   interface QualityCheckpoint {
     category: string;
     requirements: QualityRequirement[];
   }

   interface QualityRequirement {
     id: string;
     description: string;
     testMethod: string;
     status: 'pending' | 'pass' | 'fail';
     notes?: string;
   }

   const QUALITY_CHECKPOINTS: QualityCheckpoint[] = [
     {
       category: 'Performance',
       requirements: [
         {
           id: 'PERF-001',
           description: 'Consistent 60 FPS during normal gameplay',
           testMethod: 'Performance monitoring over 10-minute session',
           status: 'pending',
         },
         {
           id: 'PERF-002', 
           description: 'All interactions respond within 50ms',
           testMethod: 'Automated response time testing',
           status: 'pending',
         },
         {
           id: 'PERF-003',
           description: 'Memory usage below 50MB after 8 hours',
           testMethod: 'Extended session memory monitoring',
           status: 'pending',
         },
       ],
     },
     {
       category: 'Functionality',
       requirements: [
         {
           id: 'FUNC-001',
           description: 'All user stories meet acceptance criteria',
           testMethod: 'Manual testing against PRD requirements',
           status: 'pending',
         },
         {
           id: 'FUNC-002',
           description: 'Save system reliably persists game state',
           testMethod: 'Save/load testing with app restarts',
           status: 'pending',
         },
         {
           id: 'FUNC-003',
           description: 'Offline progression calculations accurate',
           testMethod: 'Offline time simulation testing',
           status: 'pending',
         },
       ],
     },
     // Add more categories as needed
   ];
   ```

2. **Implement bug tracking and resolution workflow**
   ```typescript
   // src/shared/utils/bugReporting.ts
   interface BugReport {
     id: string;
     title: string;
     description: string;
     severity: 'low' | 'medium' | 'high' | 'critical';
     category: string;
     steps: string[];
     expectedResult: string;
     actualResult: string;
     status: 'open' | 'in-progress' | 'resolved' | 'closed';
     assignee?: string;
     createdAt: Date;
     resolvedAt?: Date;
   }

   export class BugTracker {
     private bugs: BugReport[] = [];

     reportBug(bug: Omit<BugReport, 'id' | 'createdAt' | 'status'>): string {
       const id = `BUG-${Date.now()}`;
       const newBug: BugReport = {
         ...bug,
         id,
         status: 'open',
         createdAt: new Date(),
       };
       
       this.bugs.push(newBug);
       
       // Log critical bugs immediately
       if (bug.severity === 'critical') {
         console.error('CRITICAL BUG REPORTED:', newBug);
       }
       
       return id;
     }

     getCriticalBugs(): BugReport[] {
       return this.bugs.filter(bug => 
         bug.severity === 'critical' && 
         ['open', 'in-progress'].includes(bug.status)
       );
     }
   }
   ```

**Success Criteria**:
- [ ] All acceptance criteria from PRD validated and passing
- [ ] No critical or high-severity bugs remaining
- [ ] Performance requirements met and documented
- [ ] Cross-platform compatibility verified
- [ ] <1% bug report rate validated through user testing

**Time Estimate**: 10-12 hours
**Skills Required**: QA methodologies, bug analysis, systematic testing
**Assignment**: QA lead with development team support

---

## Multi-Perspective Validation Framework

### Technical Perspective Validation
- [ ] **Resource Availability**: All required tools, libraries, and development environment components available and configured
- [ ] **Skill Alignment**: Task complexity matches assigned developer skill levels with appropriate support and escalation paths
- [ ] **Technical Accuracy**: All code examples, architectural patterns, and implementation strategies follow best practices
- [ ] **Integration Consistency**: All components integrate correctly with chosen technology stack (React Native + Expo + Legend State)

### Temporal Perspective Validation  
- [ ] **Timeline Realism**: 6-week timeline achievable with specified team size and skill distribution
- [ ] **Dependency Management**: Task dependencies clearly identified and critical path established
- [ ] **Iteration Flexibility**: Scope adjustment mechanisms built into each phase for agile response to challenges
- [ ] **Progress Visibility**: Clear milestones and success criteria enable stakeholder tracking and team coordination

### Stakeholder Perspective Validation
- [ ] **Business Requirement Alignment**: All tasks directly trace to PRD requirements and acceptance criteria
- [ ] **Success Metric Achievement**: Implementation approach designed to meet specified engagement, retention, and quality targets
- [ ] **Value Delivery**: Each phase delivers working functionality that can be tested and validated by stakeholders
- [ ] **Risk Mitigation**: Identified risks have specific mitigation strategies and contingency plans

### Risk Perspective Validation
- [ ] **Technical Risk Management**: Performance optimization, cross-platform compatibility, and state management complexity addressed
- [ ] **Resource Risk Mitigation**: Junior developer support systems, learning resources, and escalation paths established
- [ ] **Quality Risk Prevention**: Comprehensive testing strategy prevents regression and ensures reliability
- [ ] **Timeline Risk Control**: Phase-gate approach allows for scope adjustment and quality validation at each milestone

---

## Cognitive Optimization Compliance

### Hierarchical Organization ✓
- **Strategic Level**: 5 major phases respecting 7±2 cognitive limit
- **Tactical Level**: Work packages sized for 1-3 day completion by junior developers
- **Operational Level**: Step-by-step task instructions with clear validation criteria
- **Progressive Detail**: Information revealed at appropriate level of detail for task complexity

### Atomic Actionability ✓
- **Single Point of Accountability**: Each task clearly assigned to specific developer skill level
- **Complete Implementation**: Every task produces working, testable code rather than empty structure
- **Clear Boundaries**: Specific start and end conditions for every task with measurable success criteria
- **No Further Decomposition**: Tasks sized appropriately for assigned skill level without additional breakdown

### Junior Developer Focus ✓
- **Skill-Appropriate Assignments**: Complex architecture to senior developers, guided implementation to junior developers
- **Learning Integration**: Each junior task includes relevant documentation links and skill-building opportunities
- **Support Systems**: Clear escalation paths and senior developer review requirements established
- **Growth Opportunities**: Tasks progressively increase in complexity to support junior developer advancement

---

## Resource Integration and Support Systems

### Learning Resources by Phase
- **Phase 1**: [Expo Documentation](https://docs.expo.dev/), [Legend State Guide](https://legendapp.com/open-source/state/), [React Native TypeScript](https://reactnative.dev/docs/typescript)
- **Phase 2**: [Idle Game Design Patterns](https://gamedevelopment.tutsplus.com/tutorials/numbers-getting-bigger-the-design-and-math-of-incremental-games--cms-24023), [React Native Performance](https://reactnative.dev/docs/performance)
- **Phase 3**: [Advanced Animation Techniques](https://reactnative.dev/docs/animated), [Cross-Platform Development](https://docs.expo.dev/guides/platform-specific-code/)
- **Phase 4**: [Audio Integration](https://docs.expo.dev/versions/latest/sdk/audio/), [Visual Effects](https://reactnative.dev/docs/animations)
- **Phase 5**: [Testing Best Practices](https://callstack.github.io/react-native-testing-library/), [Performance Optimization](https://reactnative.dev/docs/profiling)

### Support Escalation Procedures
1. **Junior Developer Blocked**: Escalate to mid-level developer within 2 hours
2. **Mid-level Developer Blocked**: Escalate to senior developer within 4 hours  
3. **Technical Architecture Questions**: Direct to senior developer immediately
4. **Performance Issues**: Engage performance specialist and senior developer
5. **Critical Bugs**: Immediate escalation to project lead and stakeholder notification

### Quality Assurance Integration
- **Daily**: Code review requirements for all junior developer contributions
- **Weekly**: Progress validation against phase success criteria with go/no-go decisions
- **End of Phase**: Comprehensive stakeholder review and approval before proceeding
- **Continuous**: Automated testing and performance monitoring throughout development

---

## Conclusion

This comprehensive implementation runbook transforms the technically detailed PetSoft Tycoon PRD into an actionable, junior developer-optimized development plan. The structured task decomposition approach, based on cognitive psychology principles and proven project management methodologies, ensures successful delivery of all PRD requirements while supporting team learning and growth.

**Key Success Factors:**
- **Cognitive-Optimized Structure**: Respects human processing limitations with 7±2 hierarchical organization
- **Junior Developer Focus**: Tasks appropriately sized and supported with learning resources and escalation paths
- **Quality-First Approach**: Comprehensive testing and validation integrated throughout development lifecycle
- **Stakeholder Alignment**: Clear traceability from business requirements through technical implementation
- **Risk Management**: Proactive identification and mitigation of technical, resource, and timeline risks

The 6-week timeline, when executed following this runbook's guidance, will deliver a production-ready PetSoft Tycoon game meeting all technical performance requirements, engagement targets, and quality standards specified in the original PRD.

---

**Total Estimated Effort**: 240-300 developer hours across 6 weeks
**Team Composition**: 1 Senior + 2-3 Junior/Mid-level developers
**Success Probability**: High (85%+) with proper resource allocation and runbook adherence