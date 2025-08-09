# Phase 1: Foundation Setup

## Objective
Establish core infrastructure, development environment, and project structure for PetSoft Tycoon using React Native/Expo with research-validated architecture patterns.

## Research Validation Checkpoints
- [ ] All packages use versions from research/
- [ ] Directory structure follows vertical-slicing pattern
- [ ] State management follows Legend State modular patterns
- [ ] TypeScript configured with strict mode
- [ ] Testing infrastructure ready

## Work Packages

### WP 1.1: Project Initialization

#### Task 1.1.1: Create Expo Project
**Steps:**
```bash
# Create new Expo project with TypeScript template
npx create-expo-app PetSoftTycoon --template expo-template-blank-typescript

# Navigate to project
cd PetSoftTycoon

# Initialize git repository
git init
git add .
git commit -m "Initial Expo project setup"
```
**Validation:** Project runs with `npx expo start`
**Time:** 30 minutes

#### Task 1.1.2: Configure TypeScript
**Steps:**
1. Update `tsconfig.json` with strict configuration:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "target": "ES2024",
    "lib": ["ES2024"],
    "jsx": "react-native",
    "moduleResolution": "node",
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@app/*": ["./src/app/*"]
    }
  }
}
```
**Validation:** TypeScript compiles without errors
**Time:** 15 minutes

### WP 1.2: Core Dependencies Installation

#### Task 1.2.1: Install Research-Validated Packages
**CRITICAL: Use exact versions from research**
```bash
# Legend State v3 (MUST use @beta tag - research/tech/legend-state.md)
npm install @legendapp/state@beta
npm install react-native-mmkv

# Animation and feedback
npm install react-native-reanimated@~3.10.0
npm install expo-av@~14.0.0
npm install expo-haptics@~13.0.0

# Navigation (research/tech/react-native.md)
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Math precision for game calculations
npm install decimal.js

# Development dependencies
npm install -D @types/react@~18.2.0
npm install -D @testing-library/react-native@^12.4.0
npm install -D jest-expo@^51.0.0
npm install -D @testing-library/jest-native@^5.4.0
```
**Validation:** No peer dependency warnings, all packages installed
**Time:** 20 minutes

#### Task 1.2.2: Configure Native Modules
**Steps:**
```bash
# Install pods for iOS (if on macOS)
cd ios && pod install && cd ..

# Configure react-native-reanimated
# Add to babel.config.js:
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin']
};
```
**Validation:** Reanimated works without errors
**Time:** 15 minutes

### WP 1.3: Directory Structure Setup

#### Task 1.3.1: Create Vertical Slice Architecture
**MUST follow research/planning/vertical-slicing.md patterns**
```bash
# Create feature-based directory structure
mkdir -p src/features/codeProduction/{components,hooks,services,state}
mkdir -p src/features/departments/{components,hooks,services,state}
mkdir -p src/features/featureShipping/{components,hooks,services,state}
mkdir -p src/features/prestige/{components,hooks,services,state}
mkdir -p src/features/achievements/{components,hooks,services,state}
mkdir -p src/features/synergies/{components,hooks,services,state}
mkdir -p src/features/saving/{components,hooks,services,state}

# Shared modules (only cross-cutting concerns)
mkdir -p src/shared/{components,hooks,types,constants,feedback}

# App-level composition
mkdir -p src/app/{store,navigation,screens}

# Create index files for each feature
echo "export {}" > src/features/codeProduction/index.ts
echo "export {}" > src/features/departments/index.ts
# ... repeat for all features
```
**Validation:** Directory structure matches vertical slicing pattern
**Time:** 20 minutes

#### Task 1.3.2: Define Core Types
**Steps:**
Create `src/shared/types/index.ts`:
```typescript
// Core game types following research patterns
export interface GameResource {
  linesOfCode: number;
  features: number;
  money: number;
  customerLeads: number;
}

export interface Department {
  id: string;
  name: string;
  workers: number;
  managers: number;
  efficiency: number;
  productionRate: number;
  unlocked: boolean;
  unlockCost: number;
}

export interface PrestigeData {
  investorPoints: number;
  totalPrestigesCompleted: number;
  permanentBonuses: {
    capitalBonus: number;
    speedBonus: number;
  };
}
```
**Validation:** Types compile without errors
**Time:** 30 minutes

### WP 1.4: State Management Foundation

#### Task 1.4.1: Initialize Legend State Store
**MUST use modular pattern from research/tech/legend-state.md**
Create `src/features/codeProduction/state/codeProductionState.ts`:
```typescript
import { observable } from '@legendapp/state';

export const codeProductionState$ = observable({
  linesOfCode: 0,
  linesPerSecond: 0,
  workers: {
    juniorDevs: 0,
    seniorDevs: 0,
    architects: 0
  },
  costs: {
    juniorDev: 10,
    seniorDev: 100,
    architect: 1000
  }
});

// Actions
export const codeProductionActions = {
  writeCode: () => {
    codeProductionState$.linesOfCode.set(prev => prev + 1);
  },
  
  hireWorker: (type: keyof typeof codeProductionState$.workers) => {
    // Implementation with cost validation
  }
};
```
**Validation:** State updates trigger re-renders correctly
**Time:** 45 minutes

#### Task 1.4.2: Set Up State Persistence
Create `src/shared/persistence/index.ts`:
```typescript
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export function persistState<T>(
  observable: any,
  key: string
) {
  syncObservable(observable, {
    persist: {
      name: key,
      plugin: ObservablePersistMMKV,
      storage
    }
  });
}
```
**Validation:** State persists across app restarts
**Time:** 30 minutes

### WP 1.5: Basic UI Foundation

#### Task 1.5.1: Create Main Game Screen
Create `src/app/screens/GameScreen.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from '@legendapp/state/react';
import { codeProductionState$ } from '@features/codeProduction/state';

export function GameScreen() {
  const linesOfCode = useSelector(codeProductionState$.linesOfCode);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      <Text style={styles.resource}>Lines of Code: {linesOfCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resource: {
    fontSize: 18,
    marginTop: 20,
  },
});
```
**Validation:** Screen renders with state values
**Time:** 30 minutes

#### Task 1.5.2: Implement Code Button Component
Create `src/features/codeProduction/components/CodeButton.tsx`:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { codeProductionActions } from '../state/codeProductionState';

export function CodeButton() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    codeProductionActions.writeCode();
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>WRITE CODE</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```
**Validation:** Button animates and increments counter
**Time:** 30 minutes

### WP 1.6: Testing Setup

#### Task 1.6.1: Configure Jest and Testing Library
Update `package.json`:
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```
**Validation:** Jest runs without configuration errors
**Time:** 20 minutes

#### Task 1.6.2: Write Initial Tests
Create `src/features/codeProduction/__tests__/codeProduction.test.ts`:
```typescript
import { codeProductionState$, codeProductionActions } from '../state/codeProductionState';

describe('Code Production', () => {
  beforeEach(() => {
    codeProductionState$.linesOfCode.set(0);
  });
  
  test('writeCode increments lines of code', () => {
    codeProductionActions.writeCode();
    expect(codeProductionState$.linesOfCode.get()).toBe(1);
  });
  
  test('multiple writes accumulate correctly', () => {
    codeProductionActions.writeCode();
    codeProductionActions.writeCode();
    codeProductionActions.writeCode();
    expect(codeProductionState$.linesOfCode.get()).toBe(3);
  });
});
```
**Validation:** Tests pass with `npm test`
**Time:** 30 minutes

### WP 1.7: Development Environment

#### Task 1.7.1: Set Up Development Scripts
Update `package.json`:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```
**Validation:** All scripts run successfully
**Time:** 15 minutes

#### Task 1.7.2: Configure Git Hooks
```bash
# Install husky for pre-commit hooks
npm install -D husky lint-staged

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npm run type-check && npm run lint && npm test" > .husky/pre-commit
```
**Validation:** Commits trigger validation checks
**Time:** 15 minutes

## Phase Completion Checklist

### Core Infrastructure
- [ ] Expo project initialized with TypeScript
- [ ] All research-validated packages installed
- [ ] Native modules configured
- [ ] Git repository with proper .gitignore

### Architecture
- [ ] Vertical slice directory structure created
- [ ] Core types defined
- [ ] No horizontal layers (entities/, services/ at root)
- [ ] Features have complete folder structure

### State Management
- [ ] Legend State v3 (@beta) installed and configured
- [ ] Modular state slices created
- [ ] Persistence with MMKV implemented
- [ ] State actions follow patterns

### UI Foundation
- [ ] Main game screen renders
- [ ] Code button component works
- [ ] Animations with Reanimated functional
- [ ] State updates trigger re-renders

### Testing
- [ ] Jest configured with React Native Testing Library
- [ ] Initial tests passing
- [ ] Test structure follows features
- [ ] Coverage reporting enabled

### Development Experience
- [ ] TypeScript strict mode enabled
- [ ] Path aliases configured
- [ ] Development scripts ready
- [ ] Git hooks for quality checks

## Success Metrics
- Zero TypeScript errors
- All tests passing
- App runs on iOS Simulator and Android Emulator
- State persists across app restarts
- 60 FPS maintained during interactions

## Next Phase Dependencies
With foundation complete, Phase 2 can begin implementing:
- Core game mechanics
- Department systems
- Feature shipping
- Resource management
- Basic game loop

## Time Summary
**Total Estimated Time:** 5.5 hours
**Recommended Schedule:** Complete over 1-2 days to allow for environment setup and troubleshooting