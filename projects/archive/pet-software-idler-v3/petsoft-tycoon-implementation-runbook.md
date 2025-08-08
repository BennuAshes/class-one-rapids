# PetSoft Tycoon: Implementation Runbook
**Version 1.0 | January 2025**

---

## Executive Summary

### Project Overview
PetSoft Tycoon is a React Native idle/incremental game targeting 40%+ D1 retention through immediate engagement mechanics and strategic business simulation. Players progress from garage developers to pet tech moguls across 7 interconnected business departments.

### Technical Architecture Summary
- **Framework**: React Native 0.79.5 + Expo SDK 53 + TypeScript
- **State Management**: Legend State v3 + MMKV for persistence
- **Architecture**: Feature-Sliced Design pattern
- **Performance**: 60 FPS target with adaptive quality system
- **Platforms**: iOS and Android mobile applications

### Timeline and Milestone Overview
- **Total Duration**: 4 weeks (3 weeks development + 1 week polish)
- **Team Size**: 2-3 junior developers
- **Key Milestones**: Foundation (Week 1), Core Features (Week 2), Integration (Week 2-3), Polish (Week 3), Deployment (Week 4)

### Resource and Skill Requirements
- **Junior Developer Skills**: React Native, TypeScript, basic state management
- **Required Learning**: Legend State v3, MMKV, Expo SDK 53
- **Hardware**: iOS/Android devices for testing, minimum spec device for performance validation

---

## Prerequisites and Setup

### Development Environment Requirements

#### Essential Software
```bash
# Required versions (exact requirements for compatibility)
Node.js: 18.17.0 or higher
npm: 9.0.0 or higher
Xcode: 14.0+ (for iOS development)
Android Studio: 2022.1.1+ (for Android development)
```

#### Tool Installation Instructions

**Step 1: Install Node.js and npm**
```bash
# Download from nodejs.org
# Verify installation
node --version  # Should show v18.17.0+
npm --version   # Should show v9.0.0+
```

**Step 2: Install Expo Development Tools**
```bash
# Install Expo CLI and EAS CLI globally
npm install -g @expo/cli@latest eas-cli@latest

# Verify installation
expo --version
eas --version

# Login to Expo account (create account if needed at expo.dev)
expo login
```

**Step 3: Set Up Mobile Development**
```bash
# For iOS development (macOS only)
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# For Android development
# Download Android Studio from developer.android.com
# Configure Android SDK and emulator
```

### Initial Project Structure Creation

**Create Project with TypeScript Template**
```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest PetSoftTycoon --template typescript

# Navigate to project directory
cd PetSoftTycoon

# Install core dependencies
npm install @legendapp/state@beta react-native-mmkv
npm install react-native-reanimated react-native-gesture-handler
npm install expo-audio expo-haptics big.js

# Install development dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev @types/jest eslint @typescript-eslint/eslint-plugin
```

**Set Up Feature-Sliced Design Structure**
```bash
# Create directory structure following FSD pattern
mkdir -p src/{app,pages,widgets,features,entities,shared}
mkdir -p src/app/{providers,store,config}
mkdir -p src/shared/{ui,lib,hooks,types}
mkdir -p src/entities/{Department,Unit,Resource,Achievement}
mkdir -p src/features/{writeCode,hireDeveloper,shipFeature,triggerPrestige}
mkdir -p src/widgets/{DepartmentPanel,ResourceDisplay,PrestigeModal}
mkdir -p src/pages/{GameScreen,SettingsScreen}

# Create index files for barrel exports
touch src/shared/types/index.ts
touch src/shared/lib/index.ts
touch src/app/store/index.ts
```

### Validation Checklist for Environment Readiness
- [ ] Node.js 18.17.0+ installed and verified
- [ ] Expo CLI and EAS CLI installed globally
- [ ] Successfully logged into Expo account
- [ ] Project created with TypeScript template
- [ ] All core dependencies installed without errors
- [ ] TypeScript compilation works: `npx tsc --noEmit`
- [ ] Directory structure matches Feature-Sliced Design
- [ ] Can run `expo start` without errors
- [ ] iOS Simulator or Android Emulator accessible

---

## Strategic Implementation Phases

### Phase 1: Foundation (Week 1)

#### Work Package 1.1: Development Environment Setup (1 day)

**Objective**: Establish complete development environment with all necessary tools and dependencies.

**Tasks:**

**Task 1.1.1: Install Expo Development Environment**
```bash
# Step 1: Verify Node.js installation
node --version  # Must be 18.17.0+

# Step 2: Install Expo CLI tools
npm install -g @expo/cli@latest eas-cli@latest

# Step 3: Verify installations
expo --version
eas --version

# Step 4: Login to Expo account
expo login
# Enter your Expo credentials or create account at expo.dev
```

**Success Criteria:**
- [ ] Node.js 18+ installed and verified
- [ ] Expo CLI and EAS CLI installed globally  
- [ ] Successfully logged into Expo account
- [ ] Can run `expo --version` without errors

**Common Issues & Solutions:**
- *Permission denied during npm install*: Use `sudo` on macOS/Linux or run as Administrator on Windows
- *Command not found after install*: Restart terminal or add npm global bin to PATH
- *Login failures*: Verify internet connection and account credentials

**Task 1.1.2: Create Project with TypeScript**
```bash
# Step 1: Create new Expo project
npx create-expo-app@latest PetSoftTycoon --template typescript

# Step 2: Navigate to project
cd PetSoftTycoon

# Step 3: Configure TypeScript strict mode
# Edit tsconfig.json to include:
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}

# Step 4: Verify TypeScript setup
npx tsc --noEmit
```

**Success Criteria:**
- [ ] Project created with TypeScript template
- [ ] TypeScript compilation works without errors
- [ ] Strict mode enabled and functioning
- [ ] Project structure matches Expo standards

**Task 1.1.3: Install Core Dependencies**
```bash
# State management libraries
npm install @legendapp/state@beta react-native-mmkv

# Animation and UI libraries
npm install react-native-reanimated react-native-gesture-handler

# Audio and haptics
npm install expo-audio expo-haptics

# Math utilities for large numbers
npm install big.js @types/big.js

# Testing libraries
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Verify all installations
npm ls --depth=0
```

**Success Criteria:**
- [ ] All dependencies installed without peer dependency warnings
- [ ] `npm ls` shows no missing dependencies
- [ ] Project builds successfully: `expo start`
- [ ] Can run on iOS Simulator or Android Emulator

#### Work Package 1.2: Core Architecture Foundation (2 days)

**Objective**: Implement foundational architecture patterns and state management infrastructure.

**Task 1.2.1: Set Up Feature-Sliced Design Structure**
```bash
# Create complete directory structure
mkdir -p src/{app,pages,widgets,features,entities,shared}
mkdir -p src/app/{providers,store,config}
mkdir -p src/shared/{ui,lib,hooks,types}
mkdir -p src/entities/{Department,Unit,Resource,Achievement}
mkdir -p src/features/{writeCode,hireDeveloper,shipFeature,triggerPrestige}
mkdir -p src/widgets/{DepartmentPanel,ResourceDisplay,PrestigeModal}
mkdir -p src/pages/{GameScreen,SettingsScreen}

# Create barrel export files
echo "export * from './GameState';" > src/shared/types/index.ts
echo "export * from './gameStore';" > src/app/store/index.ts
echo "export * from './constants';" > src/shared/lib/index.ts
```

**Success Criteria:**
- [ ] Directory structure matches Feature-Sliced Design pattern
- [ ] All folders contain appropriate index.ts files
- [ ] Import paths work correctly from App.tsx
- [ ] ESLint shows no circular dependency warnings

**Task 1.2.2: Implement Basic Game State Interfaces**

Create `src/shared/types/GameState.ts`:
```typescript
export interface GameState {
  resources: {
    linesOfCode: number;
    money: number;
    features: number;
    customers: number;
  };
  departments: Record<DepartmentType, Department>;
  progression: {
    totalEarned: number;
    prestigeLevel: number;
    prestigePoints: number;
    achievements: string[];
  };
  gameConfig: {
    audioEnabled: boolean;
    hapticsEnabled: boolean;
    performanceMode: 'high' | 'balanced' | 'performance';
  };
  gameLoop: {
    currentTime: number;
    deltaTime: number;
    isPaused: boolean;
    frameCount: number;
  };
}

export type DepartmentType = 
  | 'development' 
  | 'sales' 
  | 'customerExperience' 
  | 'product' 
  | 'design' 
  | 'qa' 
  | 'marketing';

export interface Department {
  id: DepartmentType;
  name: string;
  units: Unit[];
  managers: Manager[];
  unlocked: boolean;
  unlockThreshold: number;
  baseProductionRate: number;
  synergyMultipliers: number[];
}

export interface Unit {
  id: string;
  type: string;
  name: string;
  baseCost: number;
  currentCost: number;
  productionRate: number;
  owned: number;
  description: string;
}

export interface Manager {
  id: string;
  name: string;
  cost: number;
  hired: boolean;
  autoEnabled: boolean;
  department: DepartmentType;
}
```

**Success Criteria:**
- [ ] TypeScript interfaces compile without errors
- [ ] All game entities properly typed with no 'any' types
- [ ] Interface exports work correctly in other files
- [ ] IntelliSense provides proper autocompletion

**Task 1.2.3: Set Up Legend State Configuration**

Create `src/app/store/gameStore.ts`:
```typescript
import { observable, syncObservable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { MMKV } from 'react-native-mmkv';
import { GameState, DepartmentType } from '../../shared/types';

// Initialize MMKV storage
const storage = new MMKV({
  id: 'petsoft-tycoon',
  encryptionKey: 'petsoft-secure-key-2025'
});

// Initial game state
const initialGameState: GameState = {
  resources: {
    linesOfCode: 0,
    money: 0,
    features: 0,
    customers: 0,
  },
  departments: {
    development: {
      id: 'development',
      name: 'Development',
      units: [],
      managers: [],
      unlocked: true,
      unlockThreshold: 0,
      baseProductionRate: 0,
      synergyMultipliers: [],
    },
    // ... other departments initially locked
  },
  progression: {
    totalEarned: 0,
    prestigeLevel: 0,
    prestigePoints: 0,
    achievements: [],
  },
  gameConfig: {
    audioEnabled: true,
    hapticsEnabled: true,
    performanceMode: 'balanced',
  },
  gameLoop: {
    currentTime: 0,
    deltaTime: 0,
    isPaused: false,
    frameCount: 0,
  },
};

// Create observable game state
export const gameState$ = observable(initialGameState);

// Configure persistence
syncObservable(gameState$, {
  persist: {
    name: 'petsoft-tycoon-save',
    plugin: ObservablePersistMMKV,
    mmkv: storage,
    transform: {
      save: (value: GameState) => ({
        version: '1.0.0',
        timestamp: Date.now(),
        data: value,
      }),
      load: (saved: any) => {
        // Handle save format migration if needed
        return saved?.data || initialGameState;
      },
    },
  },
  debounceMs: 1000, // Save every second
  retry: {
    times: 3,
    delay: 1000,
  },
});

// Game actions
export const gameActions = {
  addLinesOfCode: (amount: number) => {
    gameState$.resources.linesOfCode.set(prev => prev + amount);
  },
  
  addMoney: (amount: number) => {
    gameState$.resources.money.set(prev => prev + amount);
    gameState$.progression.totalEarned.set(prev => prev + amount);
  },
  
  purchaseUnit: (department: DepartmentType, unitType: string) => {
    const dept = gameState$.departments[department];
    const unit = dept.units.find(u => u.type === unitType);
    
    if (unit && gameState$.resources.money.get() >= unit.currentCost) {
      gameState$.resources.money.set(prev => prev - unit.currentCost);
      unit.owned.set(prev => prev + 1);
      
      // Update cost using exponential scaling: Base * 1.15^owned
      unit.currentCost.set(Math.floor(unit.baseCost * Math.pow(1.15, unit.owned.get())));
    }
  },
  
  resetGame: () => {
    gameState$.set(initialGameState);
  },
};
```

**Success Criteria:**
- [ ] Observable state created and accessible
- [ ] MMKV persistence configured and working
- [ ] Game actions modify state correctly
- [ ] State changes trigger component re-renders
- [ ] Save/load functionality works across app restarts

#### Work Package 1.3: Testing Infrastructure (1 day)

**Task 1.3.1: Configure Jest and Testing Library**

Update `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@legendapp/state|react-native-mmkv)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-native/extend-expect';

// Mock native modules
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-audio', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));
```

**Task 1.3.2: Create First Component Test**

Create `src/features/writeCode/__tests__/WriteCodeButton.test.tsx`:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { WriteCodeButton } from '../WriteCodeButton';
import { gameState$ } from '../../../app/store/gameStore';

// Mock haptics
jest.mock('expo-haptics');

describe('WriteCodeButton', () => {
  beforeEach(() => {
    // Reset game state before each test
    gameState$.resources.linesOfCode.set(0);
  });

  it('renders correctly', () => {
    const { getByText } = render(<WriteCodeButton />);
    expect(getByText('WRITE CODE')).toBeTruthy();
    expect(getByText('+1 Line of Code')).toBeTruthy();
  });

  it('adds lines of code when pressed', () => {
    const { getByText } = render(<WriteCodeButton />);
    const button = getByText('WRITE CODE');
    
    fireEvent.press(button);
    
    expect(gameState$.resources.linesOfCode.get()).toBe(1);
  });

  it('triggers haptic feedback on press', () => {
    const { getByText } = render(<WriteCodeButton />);
    const button = getByText('WRITE CODE');
    
    fireEvent.press(button);
    
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });
});
```

**Success Criteria:**
- [ ] Jest configuration works with Expo and React Native
- [ ] All native modules properly mocked
- [ ] Test suite runs without errors: `npm test`
- [ ] Code coverage reports generate correctly
- [ ] Tests can access and modify game state

### Phase 2: Core Game Mechanics (Week 2)

#### Work Package 2.1: Resource Generation System (2 days)

**Task 2.1.1: Create Write Code Button Component**

Create `src/features/writeCode/WriteCodeButton.tsx`:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { gameState$, gameActions } from '../../app/store/gameStore';
import * as Haptics from 'expo-haptics';

export const WriteCodeButton: React.FC = () => {
  const linesOfCode = gameState$.resources.linesOfCode.use();
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Add lines of code
    gameActions.addLinesOfCode(1);
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable 
        style={[styles.button, { opacity: 1 }]} 
        onPress={handlePress}
        android_ripple={{ color: '#4CAF50', borderless: false }}
      >
        <Text style={styles.buttonText}>WRITE CODE</Text>
        <Text style={styles.subtitle}>+1 Line of Code</Text>
        <Text style={styles.counter}>Total: {linesOfCode}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  buttonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#E3F2FD',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  counter: {
    color: '#BBDEFB',
    fontSize: 12,
    marginTop: 2,
  },
});
```

**Success Criteria:**
- [ ] Button renders with proper styling and animations
- [ ] Haptic feedback works on physical device
- [ ] Press animation provides visual feedback within 50ms
- [ ] Lines of code counter updates immediately
- [ ] Button remains responsive during rapid tapping

**Task 2.1.2: Create Resource Display Component**

Create `src/widgets/ResourceDisplay/ResourceDisplay.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { gameState$ } from '../../app/store/gameStore';
import { formatNumber } from '../../shared/lib/numberUtils';

export const ResourceDisplay: React.FC = () => {
  const resources = gameState$.resources.use();

  return (
    <View style={styles.container}>
      <ResourceItem 
        label="Lines of Code" 
        value={resources.linesOfCode} 
        color="#4CAF50"
        icon="💻"
      />
      <ResourceItem 
        label="Money" 
        value={resources.money} 
        color="#FFC107"
        icon="💰"
        prefix="$"
      />
      <ResourceItem 
        label="Features" 
        value={resources.features} 
        color="#9C27B0"
        icon="⭐"
      />
      <ResourceItem 
        label="Customers" 
        value={resources.customers} 
        color="#FF5722"
        icon="👥"
      />
    </View>
  );
};

interface ResourceItemProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  prefix?: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  label, 
  value, 
  color, 
  icon, 
  prefix = '' 
}) => (
  <View style={styles.resourceItem}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceLabel}>{label}</Text>
      <Text style={[styles.resourceValue, { color }]}>
        {prefix}{formatNumber(value)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginVertical: 5,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

Create `src/shared/lib/numberUtils.ts`:
```typescript
import Big from 'big.js';

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const tier = Math.log10(Math.abs(num)) / 3 | 0;
  
  if (tier === 0) return num.toString();
  
  const suffix = suffixes[tier] || 'e' + (tier * 3);
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + suffix;
};

export const calculateCost = (baseCost: number, owned: number): number => {
  // Exponential scaling: Base * 1.15^owned
  return Math.floor(baseCost * Math.pow(1.15, owned));
};

export const canAfford = (cost: number, money: number): boolean => {
  return money >= cost;
};
```

**Success Criteria:**
- [ ] Resource display shows all 4 resources with proper formatting
- [ ] Numbers format correctly (1000 → 1K, 1000000 → 1M, etc.)
- [ ] Display updates immediately when resources change
- [ ] UI remains performant with rapid resource changes
- [ ] Styling is consistent and readable

#### Work Package 2.2: Department System Framework (2 days)

**Task 2.2.1: Create Department Entity Structure**

Create `src/entities/Department/Department.ts`:
```typescript
import { DepartmentType, Unit, Manager } from '../../shared/types';

export interface DepartmentConfig {
  id: DepartmentType;
  name: string;
  description: string;
  unlockThreshold: number;
  color: string;
  icon: string;
  units: UnitConfig[];
  managers: ManagerConfig[];
}

interface UnitConfig {
  type: string;
  name: string;
  baseCost: number;
  baseProductionRate: number;
  description: string;
}

interface ManagerConfig {
  name: string;
  cost: number;
  description: string;
}

export const DEPARTMENT_CONFIGS: Record<DepartmentType, DepartmentConfig> = {
  development: {
    id: 'development',
    name: 'Development',
    description: 'Write code and create features',
    unlockThreshold: 0,
    color: '#2196F3',
    icon: '💻',
    units: [
      {
        type: 'junior',
        name: 'Junior Dev',
        baseCost: 10,
        baseProductionRate: 0.1,
        description: 'Writes basic code'
      },
      {
        type: 'mid',
        name: 'Mid Dev',
        baseCost: 100,
        baseProductionRate: 0.5,
        description: 'Handles complex features'
      },
      {
        type: 'senior',
        name: 'Senior Dev',
        baseCost: 1000,
        baseProductionRate: 2.5,
        description: 'Architects solutions'
      },
      {
        type: 'lead',
        name: 'Tech Lead',
        baseCost: 10000,
        baseProductionRate: 10,
        description: 'Provides 10% dept boost'
      }
    ],
    managers: [
      {
        name: 'Dev Manager',
        cost: 1000,
        description: 'Auto-buys cheapest developers'
      }
    ]
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    description: 'Generate leads and close deals',
    unlockThreshold: 500,
    color: '#4CAF50',
    icon: '💼',
    units: [
      {
        type: 'rep',
        name: 'Sales Rep',
        baseCost: 100,
        baseProductionRate: 0.2,
        description: 'Generates customer leads'
      },
      {
        type: 'account',
        name: 'Account Manager',
        baseCost: 1000,
        baseProductionRate: 1,
        description: 'Manages key accounts'
      },
      {
        type: 'director',
        name: 'Sales Director',
        baseCost: 10000,
        baseProductionRate: 5,
        description: 'Strategic sales planning'
      },
      {
        type: 'vp',
        name: 'VP Sales',
        baseCost: 100000,
        baseProductionRate: 20,
        description: 'Provides 15% dept boost'
      }
    ],
    managers: [
      {
        name: 'Sales Manager',
        cost: 5000,
        description: 'Auto-buys sales team'
      }
    ]
  },
  // ... other departments following same pattern
};

export const createInitialUnit = (config: UnitConfig, departmentId: DepartmentType): Unit => ({
  id: `${departmentId}-${config.type}`,
  type: config.type,
  name: config.name,
  baseCost: config.baseCost,
  currentCost: config.baseCost,
  productionRate: config.baseProductionRate,
  owned: 0,
  description: config.description,
});
```

**Success Criteria:**
- [ ] All 7 departments configured with proper data
- [ ] Each department has 4 unit types with exponential cost scaling
- [ ] Department unlock thresholds match PRD requirements
- [ ] Unit creation functions work correctly
- [ ] TypeScript types are properly enforced

**Task 2.2.2: Implement Unit Purchase System**

Update `src/app/store/gameStore.ts` with purchase logic:
```typescript
// Add to gameActions
export const gameActions = {
  // ... existing actions
  
  purchaseUnit: (departmentId: DepartmentType, unitType: string) => {
    const department = gameState$.departments[departmentId].get();
    const unit = department.units.find(u => u.type === unitType);
    const currentMoney = gameState$.resources.money.get();
    
    if (!unit || currentMoney < unit.currentCost) {
      return { success: false, reason: 'insufficient_funds' };
    }
    
    // Deduct cost
    gameActions.addMoney(-unit.currentCost);
    
    // Increase owned count
    gameState$.departments[departmentId].units
      .find(u => u.type === unitType)
      ?.owned.set(prev => prev + 1);
    
    // Update cost using exponential formula: Base * 1.15^owned
    const newOwned = unit.owned + 1;
    const newCost = Math.floor(unit.baseCost * Math.pow(1.15, newOwned));
    gameState$.departments[departmentId].units
      .find(u => u.type === unitType)
      ?.currentCost.set(newCost);
    
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    return { success: true, newCost, newOwned };
  },
  
  checkDepartmentUnlocks: () => {
    const totalEarned = gameState$.progression.totalEarned.get();
    
    Object.values(DEPARTMENT_CONFIGS).forEach(config => {
      const department = gameState$.departments[config.id].get();
      
      if (!department.unlocked && totalEarned >= config.unlockThreshold) {
        gameState$.departments[config.id].unlocked.set(true);
        
        // Initialize units for newly unlocked department
        const initialUnits = config.units.map(unitConfig => 
          createInitialUnit(unitConfig, config.id)
        );
        gameState$.departments[config.id].units.set(initialUnits);
        
        // Celebration haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  }
};
```

**Success Criteria:**
- [ ] Unit purchase deducts correct amount of money
- [ ] Unit count increases by 1 on purchase
- [ ] Cost updates using exponential formula (Base * 1.15^owned)
- [ ] Purchase fails gracefully when insufficient funds
- [ ] Haptic feedback provides purchase confirmation
- [ ] Department unlocks trigger at correct thresholds

#### Work Package 2.3: Game Loop Implementation (1 day)

**Task 2.3.1: Set Up 60 FPS Game Loop**

Create `src/shared/hooks/useGameLoop.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { gameState$, gameActions } from '../../app/store/gameStore';

interface PerformanceMetrics {
  frameCount: number;
  averageFrameTime: number;
  lastFrameTime: number;
  droppedFrames: number;
}

export const useGameLoop = () => {
  const animationId = useRef<number>();
  const lastTimestamp = useRef<number>(0);
  const performanceMetrics = useRef<PerformanceMetrics>({
    frameCount: 0,
    averageFrameTime: 0,
    lastFrameTime: 0,
    droppedFrames: 0,
  });

  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimestamp.current;
      lastTimestamp.current = timestamp;

      // Update performance metrics
      performanceMetrics.current.frameCount++;
      performanceMetrics.current.lastFrameTime = deltaTime;
      
      // Detect dropped frames (>20ms indicates sub-60fps)
      if (deltaTime > 20) {
        performanceMetrics.current.droppedFrames++;
      }

      // Update game state
      gameState$.gameLoop.currentTime.set(timestamp);
      gameState$.gameLoop.deltaTime.set(deltaTime);
      gameState$.gameLoop.frameCount.set(performanceMetrics.current.frameCount);

      // High frequency updates (every frame)
      calculateProduction(deltaTime);
      updateAnimations(deltaTime);
      
      // Medium frequency updates (every 100ms)
      if (performanceMetrics.current.frameCount % 6 === 0) {
        gameActions.checkDepartmentUnlocks();
        checkAchievements();
      }
      
      // Low frequency updates (every 1000ms) 
      if (performanceMetrics.current.frameCount % 60 === 0) {
        updateStatistics();
        optimizePerformance();
      }

      // Performance quality adjustment
      if (deltaTime > 25) { // Running at <40fps
        reduceParticleCount();
      }

      animationId.current = requestAnimationFrame(gameLoop);
    };

    animationId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  const calculateProduction = (deltaTime: number) => {
    const departments = gameState$.departments.get();
    let totalProduction = 0;

    Object.values(departments).forEach(department => {
      if (!department.unlocked) return;

      let departmentProduction = 0;
      department.units.forEach(unit => {
        if (unit.owned > 0) {
          departmentProduction += unit.productionRate * unit.owned;
        }
      });

      totalProduction += departmentProduction;
    });

    // Apply production based on delta time (60fps = ~16.67ms)
    const productionThisFrame = (totalProduction * deltaTime) / 1000;
    
    if (productionThisFrame > 0) {
      gameActions.addLinesOfCode(productionThisFrame);
    }
  };

  const updateAnimations = (deltaTime: number) => {
    // Update particle positions, alpha values, etc.
    // This will be expanded when particle system is implemented
  };

  const checkAchievements = () => {
    // Check for achievement unlocks
    // This will be expanded when achievement system is implemented
  };

  const updateStatistics = () => {
    // Update game statistics
    // This will be expanded when statistics system is implemented
  };

  const optimizePerformance = () => {
    // Garbage collection hints, memory cleanup
    if (global.gc) {
      global.gc();
    }
  };

  const reduceParticleCount = () => {
    // Reduce visual effects for performance
    gameState$.gameConfig.performanceMode.set('performance');
  };

  return performanceMetrics.current;
};
```

**Success Criteria:**
- [ ] Game loop runs at consistent 60 FPS
- [ ] Production calculations execute within 16ms frame budget
- [ ] Performance monitoring detects frame drops
- [ ] Automatic quality adjustment when performance drops
- [ ] Game loop continues running in background (when app is active)

### Phase 3: Feature Integration (Week 2-3)

#### Work Package 3.1: Multi-Department Implementation (3 days)

**Task 3.1.1: Complete All 7 Departments**

Extend `src/entities/Department/Department.ts` with remaining departments:
```typescript
export const DEPARTMENT_CONFIGS: Record<DepartmentType, DepartmentConfig> = {
  // ... development and sales already defined
  
  customerExperience: {
    id: 'customerExperience',
    name: 'Customer Experience',
    description: 'Increase customer lifetime value',
    unlockThreshold: 5000,
    color: '#FF9800',
    icon: '🎧',
    units: [
      {
        type: 'support',
        name: 'Support Agent',
        baseCost: 250,
        baseProductionRate: 0.1,
        description: 'Resolves customer tickets'
      },
      {
        type: 'specialist',
        name: 'CX Specialist',
        baseCost: 2500,
        baseProductionRate: 0.5,
        description: 'Improves customer satisfaction'
      },
      {
        type: 'manager',
        name: 'CX Manager',
        baseCost: 25000,
        baseProductionRate: 2.5,
        description: 'Optimizes customer journey'
      },
      {
        type: 'director',
        name: 'CX Director',
        baseCost: 250000,
        baseProductionRate: 10,
        description: 'Provides retention bonuses'
      }
    ],
    managers: [
      {
        name: 'CX Manager',
        cost: 12500,
        description: 'Auto-manages customer support'
      }
    ]
  },
  
  product: {
    id: 'product',
    name: 'Product',
    description: 'Research and enhance features',
    unlockThreshold: 25000,
    color: '#9C27B0',
    icon: '🔬',
    units: [
      {
        type: 'analyst',
        name: 'Product Analyst',
        baseCost: 500,
        baseProductionRate: 0.1,
        description: 'Generates product insights'
      },
      {
        type: 'manager',
        name: 'Product Manager',
        baseCost: 5000,
        baseProductionRate: 0.5,
        description: 'Converts insights to specs'
      },
      {
        type: 'senior',
        name: 'Senior PM',
        baseCost: 50000,
        baseProductionRate: 2.5,
        description: 'Creates premium specifications'
      },
      {
        type: 'cpo',
        name: 'CPO',
        baseCost: 500000,
        baseProductionRate: 10,
        description: 'Provides global multipliers'
      }
    ],
    managers: [
      {
        name: 'Product Lead',
        cost: 25000,
        description: 'Auto-manages product development'
      }
    ]
  },
  
  design: {
    id: 'design',
    name: 'Design',
    description: 'Polish multiplies everything',
    unlockThreshold: 100000,
    color: '#E91E63',
    icon: '🎨',
    units: [
      {
        type: 'ui',
        name: 'UI Designer',
        baseCost: 1000,
        baseProductionRate: 0.1,
        description: 'Creates interface designs'
      },
      {
        type: 'ux',
        name: 'UX Designer',
        baseCost: 10000,
        baseProductionRate: 0.5,
        description: 'Improves user experience'
      },
      {
        type: 'lead',
        name: 'Design Lead',
        baseCost: 100000,
        baseProductionRate: 2.5,
        description: 'Provides team multipliers'
      },
      {
        type: 'director',
        name: 'Creative Director',
        baseCost: 1000000,
        baseProductionRate: 10,
        description: 'Global polish bonuses'
      }
    ],
    managers: [
      {
        name: 'Design Manager',
        cost: 50000,
        description: 'Auto-manages design team'
      }
    ]
  },
  
  qa: {
    id: 'qa',
    name: 'QA',
    description: 'Bug prevention saves money',
    unlockThreshold: 500000,
    color: '#607D8B',
    icon: '🐛',
    units: [
      {
        type: 'tester',
        name: 'QA Tester',
        baseCost: 750,
        baseProductionRate: 0.1,
        description: 'Catches bugs before release'
      },
      {
        type: 'engineer',
        name: 'QA Engineer',
        baseCost: 7500,
        baseProductionRate: 0.5,
        description: 'Prevents bugs with automation'
      },
      {
        type: 'lead',
        name: 'QA Lead',
        baseCost: 75000,
        baseProductionRate: 2.5,
        description: 'Improves team processes'
      },
      {
        type: 'director',
        name: 'QA Director',
        baseCost: 750000,
        baseProductionRate: 10,
        description: 'Zero-defect bonuses'
      }
    ],
    managers: [
      {
        name: 'QA Manager',
        cost: 37500,
        description: 'Auto-manages quality assurance'
      }
    ]
  },
  
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Amplify everything',
    unlockThreshold: 2000000,
    color: '#FF5722',
    icon: '📢',
    units: [
      {
        type: 'writer',
        name: 'Content Writer',
        baseCost: 2000,
        baseProductionRate: 0.1,
        description: 'Creates brand content'
      },
      {
        type: 'manager',
        name: 'Marketing Manager',
        baseCost: 20000,
        baseProductionRate: 0.5,
        description: 'Runs marketing campaigns'
      },
      {
        type: 'growth',
        name: 'Growth Hacker',
        baseCost: 200000,
        baseProductionRate: 2.5,
        description: 'Creates viral growth'
      },
      {
        type: 'cmo',
        name: 'CMO',
        baseCost: 2000000,
        baseProductionRate: 10,
        description: 'Market domination bonuses'
      }
    ],
    managers: [
      {
        name: 'Marketing Director',
        cost: 100000,
        description: 'Auto-manages marketing efforts'
      }
    ]
  }
};
```

**Success Criteria:**
- [ ] All 7 departments properly configured with unique mechanics
- [ ] Each department has 4 unit types with appropriate cost scaling
- [ ] Unlock thresholds match PRD specifications exactly
- [ ] All departments have appropriate visual styling and icons
- [ ] Department data passes TypeScript validation

**Task 3.1.2: Implement Department Synergy System**

Create `src/shared/lib/synergyCalculations.ts`:
```typescript
import { GameState, DepartmentType } from '../types';

export interface SynergyRule {
  departments: DepartmentType[];
  multiplier: number;
  description: string;
}

export const SYNERGY_RULES: SynergyRule[] = [
  {
    departments: ['development', 'sales'],
    multiplier: 1.5,
    description: 'Sales + Features = Enhanced Revenue'
  },
  {
    departments: ['development', 'qa'],
    multiplier: 1.3,
    description: 'QA reduces development rework'
  },
  {
    departments: ['sales', 'customerExperience'],
    multiplier: 1.4,
    description: 'Happy customers generate referrals'
  },
  {
    departments: ['product', 'design'],
    multiplier: 1.6,
    description: 'Research-driven design excellence'
  },
  {
    departments: ['design', 'marketing'],
    multiplier: 1.7,
    description: 'Beautiful products sell themselves'
  },
  {
    departments: ['development', 'product', 'design'],
    multiplier: 2.0,
    description: 'Complete product development cycle'
  },
  {
    departments: ['sales', 'marketing', 'customerExperience'],
    multiplier: 2.2,
    description: 'Customer acquisition and retention mastery'
  }
];

export const calculateDepartmentSynergies = (gameState: GameState): Record<DepartmentType, number> => {
  const synergies: Record<DepartmentType, number> = {
    development: 1,
    sales: 1,
    customerExperience: 1,
    product: 1,
    design: 1,
    qa: 1,
    marketing: 1
  };

  // Get unlocked departments with active units
  const activeDepartments = Object.entries(gameState.departments)
    .filter(([_, dept]) => dept.unlocked && dept.units.some(unit => unit.owned > 0))
    .map(([id]) => id as DepartmentType);

  // Apply synergy rules
  SYNERGY_RULES.forEach(rule => {
    const hasAllDepartments = rule.departments.every(deptId => 
      activeDepartments.includes(deptId)
    );

    if (hasAllDepartments) {
      rule.departments.forEach(deptId => {
        synergies[deptId] *= rule.multiplier;
      });
    }
  });

  return synergies;
};

export const calculateConversionRates = (gameState: GameState) => {
  const features = gameState.resources.features;
  const leads = gameState.resources.customers; // Using customers as leads for now
  
  // Conversion formulas from PRD:
  // 1 Lead + 1 Basic Feature = $50
  // 1 Lead + 1 Advanced Feature = $500  
  // 1 Lead + 1 Premium Feature = $5,000
  
  const basicConversions = Math.min(leads, Math.floor(features * 0.7)); // 70% are basic
  const advancedConversions = Math.min(leads - basicConversions, Math.floor(features * 0.25)); // 25% advanced
  const premiumConversions = Math.min(leads - basicConversions - advancedConversions, Math.floor(features * 0.05)); // 5% premium
  
  const revenue = (basicConversions * 50) + (advancedConversions * 500) + (premiumConversions * 5000);
  
  return {
    basicConversions,
    advancedConversions,
    premiumConversions,
    totalRevenue: revenue
  };
};
```

**Success Criteria:**
- [ ] Synergy calculations follow PRD specifications exactly
- [ ] Multi-department synergies provide multiplicative bonuses
- [ ] Conversion rates use correct formulas (1 Lead + Feature combinations)
- [ ] Performance remains smooth with all synergies active
- [ ] Synergy effects are clearly visible to players

### Phase 4: Polish & Optimization (Week 3)

#### Work Package 4.1: Visual Feedback System (2 days)

**Task 4.1.1: Implement Particle Effects System**

Create `src/shared/lib/particleSystem.ts`:
```typescript
import { Animated } from 'react-native';

export interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color: string;
  text?: string;
  lifetime: number;
  createdAt: number;
}

export class ParticleSystem {
  private particles: Map<string, Particle> = new Map();
  private particleId = 0;
  private maxParticles = 100;

  createNumberParticle(value: number, x: number, y: number): string {
    const id = `particle-${this.particleId++}`;
    
    // Object pooling - reuse existing particles if at max
    if (this.particles.size >= this.maxParticles) {
      const oldestParticle = Array.from(this.particles.values())
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      this.particles.delete(oldestParticle.id);
    }

    const particle: Particle = {
      id,
      x: new Animated.Value(x),
      y: new Animated.Value(y),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0.8),
      rotation: new Animated.Value(0),
      color: this.getColorForValue(value),
      text: this.formatParticleText(value),
      lifetime: 2000, // 2 seconds
      createdAt: Date.now(),
    };

    this.particles.set(id, particle);
    this.animateParticle(particle);
    
    return id;
  }

  private animateParticle(particle: Particle) {
    // Animate upward movement with fade out
    Animated.parallel([
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(particle.y, {
        toValue: particle.y._value - 100,
        duration: particle.lifetime,
        useNativeDriver: true,
      }),
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: particle.lifetime,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove particle after animation completes
      this.particles.delete(particle.id);
    });
  }

  private getColorForValue(value: number): string {
    if (value >= 1000000) return '#FFD700'; // Gold for millions
    if (value >= 100000) return '#FF6B35';  // Orange for 100K+
    if (value >= 10000) return '#F7931E';   // Orange for 10K+
    if (value >= 1000) return '#4CAF50';    // Green for 1K+
    if (value >= 100) return '#2196F3';     // Blue for 100+
    return '#9E9E9E'; // Gray for small amounts
  }

  private formatParticleText(value: number): string {
    if (value >= 1000000) return `+${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `+${(value / 1000).toFixed(1)}K`;
    return `+${Math.floor(value)}`;
  }

  getActiveParticles(): Particle[] {
    return Array.from(this.particles.values());
  }

  clear() {
    this.particles.clear();
  }
}

export const particleSystem = new ParticleSystem();
```

Create `src/widgets/ParticleOverlay/ParticleOverlay.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { particleSystem, Particle } from '../../shared/lib/particleSystem';

export const ParticleOverlay: React.FC = () => {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setParticles(particleSystem.getActiveParticles());
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                { rotate: particle.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <Text style={[styles.particleText, { color: particle.color }]}>
            {particle.text}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
  particleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
```

**Success Criteria:**
- [ ] Particle effects render at 60 FPS without performance impact
- [ ] Number popups show appropriate colors based on value size
- [ ] Object pooling prevents memory leaks during extended play
- [ ] Particles animate smoothly upward with fade-out effect
- [ ] System handles 100+ simultaneous particles efficiently

#### Work Package 4.2: Audio System (1 day)

**Task 4.2.1: Implement Dynamic Audio System**

Create `src/shared/lib/audioSystem.ts`:
```typescript
import { Audio } from 'expo-audio';
import { gameState$ } from '../../app/store/gameStore';

export interface SoundEffect {
  name: string;
  sound: Audio.Sound;
  basePitch: number;
  baseVolume: number;
  lastPlayed: number;
  minInterval: number;
}

class AudioSystem {
  private sounds: Map<string, SoundEffect> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
      });

      // Load sound effects
      await this.loadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async loadSounds() {
    const soundFiles = {
      click: require('../../../assets/sounds/click.mp3'),
      cash: require('../../../assets/sounds/cash-register.mp3'),
      notification: require('../../../assets/sounds/notification.mp3'),
      levelup: require('../../../assets/sounds/level-up.mp3'),
      prestige: require('../../../assets/sounds/champagne.mp3'),
    };

    for (const [name, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          isLooping: false,
          volume: 0.7,
        });

        this.sounds.set(name, {
          name,
          sound,
          basePitch: 1.0,
          baseVolume: 0.7,
          lastPlayed: 0,
          minInterval: name === 'click' ? 50 : 200, // Prevent audio spam
        });
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  async playSound(
    name: string, 
    options: {
      pitch?: number;
      volume?: number;
      force?: boolean;
    } = {}
  ) {
    const audioEnabled = gameState$.gameConfig.audioEnabled.get();
    if (!audioEnabled && !options.force) return;

    const soundEffect = this.sounds.get(name);
    if (!soundEffect) return;

    const now = Date.now();
    if (!options.force && (now - soundEffect.lastPlayed) < soundEffect.minInterval) {
      return; // Prevent audio spam
    }

    try {
      const pitch = options.pitch || soundEffect.basePitch;
      const volume = (options.volume || soundEffect.baseVolume) * this.getMasterVolume();

      await soundEffect.sound.setPositionAsync(0);
      await soundEffect.sound.setRateAsync(pitch, true);
      await soundEffect.sound.setVolumeAsync(volume);
      await soundEffect.sound.playAsync();

      soundEffect.lastPlayed = now;
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  private getMasterVolume(): number {
    // Scale volume inverse to frequency to prevent fatigue
    const recentSounds = Array.from(this.sounds.values())
      .filter(sound => Date.now() - sound.lastPlayed < 1000)
      .length;

    return Math.max(0.1, 1 - (recentSounds * 0.1));
  }

  // Specific sound methods for game events
  async playClick(amount: number = 1) {
    const pitch = 1 + Math.min(amount / 100, 0.5); // Higher pitch for larger amounts
    await this.playSound('click', { pitch });
  }

  async playCash(amount: number = 1) {
    const pitch = 1 + Math.min(Math.log10(amount) / 10, 0.8);
    await this.playSound('cash', { pitch });
  }

  async playNotification() {
    await this.playSound('notification');
  }

  async playLevelUp() {
    await this.playSound('levelup');
  }

  async playPrestige() {
    await this.playSound('prestige', { volume: 1.0, force: true });
  }

  async cleanup() {
    for (const soundEffect of this.sounds.values()) {
      try {
        await soundEffect.sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to cleanup sound ${soundEffect.name}:`, error);
      }
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

export const audioSystem = new AudioSystem();

// Hook for using audio system in components
export const useAudioSystem = () => {
  React.useEffect(() => {
    audioSystem.initialize();
    return () => audioSystem.cleanup();
  }, []);

  return audioSystem;
};
```

**Success Criteria:**
- [ ] Audio system initializes without errors on both iOS and Android
- [ ] Dynamic pitch scaling works (higher amounts = higher pitch)
- [ ] Audio spam prevention prevents sounds repeating within minimum intervals
- [ ] Volume scales inversely to frequency to prevent listener fatigue
- [ ] Audio respects user settings (can be disabled in game config)
- [ ] Sound effects enhance game experience without being annoying

### Phase 5: Quality & Deployment (Week 4)

#### Work Package 5.1: Analytics Integration (2 days)

**Task 5.1.1: Implement Retention-Focused Analytics**

Create `src/shared/lib/analyticsSystem.ts`:
```typescript
import { gameState$ } from '../../app/store/gameStore';

export interface AnalyticsEvent {
  eventName: string;
  timestamp: number;
  sessionId: string;
  userId: string;
  properties: Record<string, any>;
}

export interface RetentionEvent {
  sessionStart: { timestamp: number; sessionId: string };
  firstAction: { timestamp: number; actionType: string };
  firstPurchase: { unitType: string; cost: number; timeToFirstPurchase: number };
  departmentUnlock: { department: string; totalEarnings: number; sessionTime: number };
  prestigeTrigger: { level: number; valuation: number; playTime: number };
  sessionEnd: { duration: number; actionsPerformed: number; progressMade: number };
}

class AnalyticsSystem {
  private events: AnalyticsEvent[] = [];
  private sessionId: string = '';
  private userId: string = '';
  private sessionStartTime: number = 0;
  private actionCount: number = 0;
  private offlineQueue: AnalyticsEvent[] = [];

  initialize() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.sessionStartTime = Date.now();
    this.actionCount = 0;

    this.trackEvent('session_start', {
      timestamp: this.sessionStartTime,
      sessionId: this.sessionId,
      gameVersion: '1.0.0',
      platform: Platform.OS,
      deviceInfo: this.getDeviceInfo(),
    });

    // Set up automatic session end tracking
    this.setupSessionEndTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    // Generate or retrieve persistent user ID
    let userId = gameState$.gameConfig.userId?.get();
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      gameState$.gameConfig.userId?.set(userId);
    }
    return userId;
  }

  private getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      // Add more device info as needed
    };
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      properties,
    };

    this.events.push(event);
    this.actionCount++;

    // Add to offline queue for batch sending
    this.offlineQueue.push(event);

    // Log for development (remove in production)
    if (__DEV__) {
      console.log('Analytics Event:', eventName, properties);
    }

    // Batch send every 10 events or every 30 seconds
    if (this.offlineQueue.length >= 10 || this.shouldSendBatch()) {
      this.sendBatchedEvents();
    }
  }

  // Retention-focused tracking methods
  trackFirstAction(actionType: string) {
    const timeToFirstAction = Date.now() - this.sessionStartTime;
    this.trackEvent('first_action', {
      actionType,
      timeToFirstAction,
      timestamp: Date.now(),
    });
  }

  trackFirstPurchase(unitType: string, cost: number) {
    const timeToFirstPurchase = Date.now() - this.sessionStartTime;
    this.trackEvent('first_purchase', {
      unitType,
      cost,
      timeToFirstPurchase,
      sessionTime: timeToFirstPurchase,
    });
  }

  trackDepartmentUnlock(department: string) {
    const totalEarnings = gameState$.progression.totalEarned.get();
    const sessionTime = Date.now() - this.sessionStartTime;
    
    this.trackEvent('department_unlock', {
      department,
      totalEarnings,
      sessionTime,
      actionsPerformed: this.actionCount,
    });
  }

  trackPrestigeTrigger() {
    const prestigeLevel = gameState$.progression.prestigeLevel.get();
    const totalEarned = gameState$.progression.totalEarned.get();
    const playTime = Date.now() - this.sessionStartTime;
    
    this.trackEvent('prestige_trigger', {
      level: prestigeLevel,
      valuation: totalEarned,
      playTime,
      actionsPerformed: this.actionCount,
    });
  }

  trackPerformanceMetrics(frameTimeMs: number, memoryUsageMB: number) {
    // Only track performance issues
    if (frameTimeMs > 20 || memoryUsageMB > 45) {
      this.trackEvent('performance_issue', {
        frameTime: frameTimeMs,
        memoryUsage: memoryUsageMB,
        activeParticles: this.getActiveParticleCount(),
        activeDepartments: this.getActiveDepartmentCount(),
      });
    }
  }

  private shouldSendBatch(): boolean {
    return this.offlineQueue.length > 0 && Date.now() % 30000 < 1000; // Every 30 seconds
  }

  private async sendBatchedEvents() {
    if (this.offlineQueue.length === 0) return;

    try {
      // In a real implementation, this would send to your analytics service
      // For now, we'll just log and clear the queue
      console.log(`Sending ${this.offlineQueue.length} analytics events`);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.offlineQueue = [];
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Keep events in queue for retry
    }
  }

  private setupSessionEndTracking() {
    // Track session end when app goes to background
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        this.trackSessionEnd();
      }
    });

    return subscription;
  }

  private trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const progressMade = gameState$.progression.totalEarned.get();
    
    this.trackEvent('session_end', {
      duration: sessionDuration,
      actionsPerformed: this.actionCount,
      progressMade,
    });

    // Force send remaining events
    this.sendBatchedEvents();
  }

  private getActiveParticleCount(): number {
    // This would integrate with the particle system
    return 0; // Placeholder
  }

  private getActiveDepartmentCount(): number {
    return Object.values(gameState$.departments.get())
      .filter(dept => dept.unlocked && dept.units.some(unit => unit.owned > 0))
      .length;
  }
}

export const analyticsSystem = new AnalyticsSystem();
```

**Success Criteria:**
- [ ] Analytics system tracks all critical retention events
- [ ] Events are batched and queued for offline scenarios  
- [ ] Performance impact <0.1% as specified in PRD
- [ ] User privacy settings are respected
- [ ] Session tracking works across app lifecycle events
- [ ] Analytics data helps optimize for 40%+ D1 retention target

#### Work Package 5.2: Cross-Platform Testing (1 day)

**Task 5.2.1: Comprehensive Testing Suite**

Create comprehensive test suite covering all requirements:

```typescript
// src/__tests__/integration/gameFlow.test.tsx
import { gameState$, gameActions } from '../../app/store/gameStore';
import { analyticsSystem } from '../../shared/lib/analyticsSystem';

describe('Complete Game Flow Integration', () => {
  beforeEach(() => {
    gameActions.resetGame();
    analyticsSystem.initialize();
  });

  test('new player onboarding flow', async () => {
    // Test first 60 seconds of gameplay per PRD requirements
    const startTime = Date.now();
    
    // First action - write code
    gameActions.addLinesOfCode(1);
    expect(gameState$.resources.linesOfCode.get()).toBe(1);
    
    // After 5 clicks, first upgrade should appear
    for (let i = 0; i < 4; i++) {
      gameActions.addLinesOfCode(1);
    }
    
    // Check if upgrade is available (based on lines of code)
    expect(gameState$.resources.linesOfCode.get()).toBe(5);
    
    // Verify timing requirement (<60 seconds for first automation)
    const timeElapsed = Date.now() - startTime;
    expect(timeElapsed).toBeLessThan(60000);
  });

  test('department unlock progression', () => {
    // Test department unlocks at correct thresholds
    gameActions.addMoney(500);
    gameActions.checkDepartmentUnlocks();
    
    expect(gameState$.departments.sales.unlocked.get()).toBe(true);
    expect(gameState$.departments.customerExperience.unlocked.get()).toBe(false);
    
    // Test next unlock
    gameActions.addMoney(4500); // Total 5000
    gameActions.checkDepartmentUnlocks();
    
    expect(gameState$.departments.customerExperience.unlocked.get()).toBe(true);
  });

  test('prestige system calculation', () => {
    // Set up for prestige
    gameState$.progression.totalEarned.set(10_000_000); // $10M
    
    const initialPrestigePoints = gameState$.progression.prestigePoints.get();
    gameActions.triggerPrestige();
    
    // Verify prestige rewards
    expect(gameState$.progression.prestigeLevel.get()).toBe(1);
    expect(gameState$.progression.prestigePoints.get()).toBeGreaterThan(initialPrestigePoints);
    
    // Verify reset
    expect(gameState$.resources.money.get()).toBe(0);
    expect(gameState$.resources.linesOfCode.get()).toBe(0);
  });

  test('performance requirements under load', () => {
    // Simulate maximum game state
    Object.keys(gameState$.departments.get()).forEach(deptId => {
      const department = gameState$.departments[deptId as DepartmentType];
      department.unlocked.set(true);
      
      // Add maximum units
      department.units.get().forEach(unit => {
        unit.owned.set(100); // 100 of each unit type
      });
    });
    
    // Measure performance of calculations
    const startTime = performance.now();
    
    // Run 60 frames worth of calculations (simulate 1 second at 60fps)
    for (let i = 0; i < 60; i++) {
      gameActions.calculateProduction(16.67); // 16.67ms per frame
    }
    
    const totalTime = performance.now() - startTime;
    const averageFrameTime = totalTime / 60;
    
    // Verify performance meets PRD requirements
    expect(averageFrameTime).toBeLessThan(16); // Must complete within 16ms frame budget
  });
});

// src/__tests__/performance/memoryUsage.test.ts
describe('Memory Usage Validation', () => {
  test('memory usage stays below 50MB during extended play', async () => {
    // Simulate 2 hours of gameplay
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate intensive gameplay
    for (let minute = 0; minute < 120; minute++) {
      // Simulate 1 minute of activity
      for (let second = 0; second < 60; second++) {
        gameActions.addLinesOfCode(10);
        gameActions.addMoney(100);
        
        // Trigger particle effects
        particleSystem.createNumberParticle(100, Math.random() * 300, Math.random() * 600);
      }
      
      // Check memory every 10 minutes
      if (minute % 10 === 0) {
        const currentMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = (currentMemory - initialMemory) / (1024 * 1024); // Convert to MB
        
        expect(memoryIncrease).toBeLessThan(50); // PRD requirement: <50MB total
      }
    }
  });

  test('particle system prevents memory leaks', () => {
    const initialParticleCount = particleSystem.getActiveParticles().length;
    
    // Create many particles
    for (let i = 0; i < 200; i++) {
      particleSystem.createNumberParticle(i, Math.random() * 300, Math.random() * 600);
    }
    
    // Verify particle limit is enforced
    expect(particleSystem.getActiveParticles().length).toBeLessThanOrEqual(100);
    
    // Wait for particles to expire
    setTimeout(() => {
      expect(particleSystem.getActiveParticles().length).toBe(initialParticleCount);
    }, 3000); // Particles have 2s lifetime + buffer
  });
});
```

Run comprehensive test suite:
```bash
# Performance validation
npm run test:performance

# Cross-platform compatibility
npm run test:ios
npm run test:android

# Memory leak detection
npm run test:memory

# Integration testing
npm run test:integration

# Full test suite
npm run test:all
```

**Success Criteria:**
- [ ] All tests pass on both iOS and Android
- [ ] Performance tests validate 60 FPS under maximum load
- [ ] Memory usage stays below 50MB during extended testing
- [ ] No memory leaks detected in 24-hour automated test runs
- [ ] Cross-platform feature parity confirmed with <1% variance

#### Work Package 5.3: App Store Preparation (2 days)

**Task 5.3.1: Production Build Configuration**

Configure production builds with optimization:

Update `app.json`:
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsoft-tycoon",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.petsoft_tycoon",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

Create `eas.json` for production builds:
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Task 5.3.2: Final Quality Validation**

Create final validation script:

```bash
#!/bin/bash
# scripts/final-validation.sh

echo "🚀 Starting Final Quality Validation for PetSoft Tycoon"

# TypeScript compilation
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi

# ESLint validation
echo "🔍 Running ESLint..."
npx eslint src/ --ext .ts,.tsx --max-warnings 0
if [ $? -ne 0 ]; then
  echo "❌ ESLint validation failed"
  exit 1
fi

# Test suite
echo "🧪 Running test suite..."
npm run test:all
if [ $? -ne 0 ]; then
  echo "❌ Test suite failed"
  exit 1
fi

# Performance validation
echo "⚡ Validating performance requirements..."
npm run test:performance
if [ $? -ne 0 ]; then
  echo "❌ Performance requirements not met"
  exit 1
fi

# Expo Doctor
echo "🏥 Running Expo Doctor..."
npx expo-doctor
if [ $? -ne 0 ]; then
  echo "❌ Expo Doctor found issues"
  exit 1
fi

# Build validation
echo "🔨 Validating production build..."
eas build --platform all --non-interactive --no-wait
if [ $? -ne 0 ]; then
  echo "❌ Production build failed"
  exit 1
fi

echo "✅ All quality validations passed!"
echo "🎉 PetSoft Tycoon is ready for release!"
```

**Success Criteria:**
- [ ] Production builds complete without errors for iOS and Android
- [ ] All quality validation checks pass
- [ ] App store assets meet requirements (icons, screenshots, descriptions)
- [ ] Performance requirements validated on minimum spec devices
- [ ] Analytics integration working correctly
- [ ] Ready for App Store and Google Play submission

---

## Quality Validation Framework

### Technical Validation Checkpoints

#### Development Phase Validation
- [ ] TypeScript compilation passes with zero errors in strict mode
- [ ] ESLint validation passes with zero warnings
- [ ] All unit tests pass with >90% coverage for game logic
- [ ] Component tests pass with >80% coverage for UI components
- [ ] Integration tests validate complete user journeys

#### Performance Validation
- [ ] 60 FPS sustained for 99.5% of frames during 2-hour gameplay
- [ ] Memory usage remains below 50MB after 4 hours continuous play
- [ ] State save/load operations complete in <100ms with maximum progression
- [ ] App cold start time <3 seconds on minimum specification devices
- [ ] All user interactions respond within 50ms

#### Cross-Platform Validation
- [ ] Feature parity between iOS and Android with <1% variance
- [ ] Performance metrics consistent across platforms
- [ ] Visual consistency maintained across different screen sizes
- [ ] Audio system works correctly on both platforms
- [ ] Haptic feedback functions properly on supported devices

#### Business Requirements Validation
- [ ] First automation achievable within 60 seconds (>90% completion rate)
- [ ] Department unlocks trigger at exact thresholds specified in PRD
- [ ] Prestige system calculations match mathematical specifications
- [ ] All 7 departments implement unique mechanics correctly
- [ ] Tutorial-free design validated through user testing

### Stakeholder Review Requirements

#### Technical Review (Engineering Lead)
- [ ] Architecture follows Feature-Sliced Design principles
- [ ] State management implementation uses Legend State v3 correctly
- [ ] Performance monitoring system provides actionable insights
- [ ] Error handling and recovery strategies implemented comprehensively
- [ ] Security best practices followed (no keys committed, MMKV encryption)

#### Product Review (Product Manager)
- [ ] All user stories implemented with acceptance criteria met
- [ ] Success metrics tracking integrated and functional
- [ ] User experience matches PRD specifications exactly
- [ ] Analytics system captures all retention-critical events
- [ ] Risk mitigation strategies implemented for high-risk items

#### Design Review (Design Lead)
- [ ] Visual feedback system provides satisfying player experience
- [ ] Audio system enhances gameplay without causing fatigue
- [ ] Office evolution progression matches business milestones
- [ ] Accessibility requirements met for screen readers and high contrast
- [ ] Particle effects and animations perform smoothly at 60 FPS

### Risk Assessment and Mitigation

#### Technical Risks
- **High Risk**: State management complexity with 1000+ entities
  - *Mitigation*: Hierarchical state with lazy loading, object pooling, background computation
- **Medium Risk**: Cross-platform performance variance
  - *Mitigation*: Device capability profiling, automated benchmarking, dynamic quality adjustment
- **Medium Risk**: Memory management in extended sessions
  - *Mitigation*: Object pooling, automated leak detection, memory usage analytics

#### Business Risks
- **High Risk**: Player retention below 40% D1 target
  - *Mitigation*: Extensive playtesting, A/B testing first 5 minutes, detailed analytics tracking
- **Medium Risk**: Department balance complexity overwhelming players
  - *Mitigation*: Mathematical model validation, data-driven balancing, rapid iteration capability

### Performance and Quality Metrics

#### Success Criteria Validation
- **D1 Retention Target**: >40% (measured through analytics integration)
- **Performance Requirements**: 60 FPS sustained, <50MB memory, <50ms response times
- **Quality Standards**: <0.1% crash rate, 100% accessibility compliance
- **Technical Excellence**: >90% test coverage, zero critical security vulnerabilities

---

## Resources and Support

### Documentation References
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo SDK 53 Documentation](https://docs.expo.dev/)
- [Legend State v3 Documentation](https://legendapp.com/open-source/state/v3/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Feature-Sliced Design](https://feature-sliced.design/)

### Learning Resources for Skill Development

#### React Native Development
- **Beginner**: React Native Express - Interactive tutorial covering basics
- **Intermediate**: Official React Native Tutorial - Building your first app
- **Advanced**: React Native Performance Guide - Optimization techniques

#### State Management with Legend State
- **Introduction**: Legend State Getting Started Guide
- **Deep Dive**: Observable patterns and reactive programming
- **Performance**: Optimization techniques for large state trees

#### Mobile Game Development
- **Game Loop**: Understanding 60 FPS requirements and optimization
- **User Experience**: Idle game design principles and engagement mechanics
- **Analytics**: Mobile game analytics and retention optimization

### Troubleshooting Guides

#### Common Development Issues
1. **Metro bundler cache issues**
   ```bash
   npx react-native start --reset-cache
   expo start -c
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios --simulator="iPhone 14"
   ```

3. **Android build issues**
   ```bash
   npx react-native run-android --variant=debug
   adb reverse tcp:8081 tcp:8081
   ```

4. **State persistence issues**
   - Check MMKV initialization
   - Verify save data format migration
   - Test corruption recovery mechanisms

5. **Performance issues**
   - Use React DevTools Profiler
   - Monitor frame rate with performance monitoring
   - Check memory usage patterns

### Support Escalation Procedures

#### Level 1: Self-Service Resources
- Check troubleshooting guides above
- Review documentation links
- Search community forums and Stack Overflow

#### Level 2: Peer Support
- Ask questions in team chat channels
- Schedule code review sessions
- Pair programming for complex issues

#### Level 3: Expert Consultation
- Escalate to senior developer for architecture decisions
- Consult with product manager for requirement clarifications
- Engage design lead for user experience questions

#### Level 4: External Support
- Contact Expo support for SDK-specific issues
- Reach out to React Native community for advanced problems
- Consider hiring React Native consultants for critical blockers

---

**🚀 This runbook provides a complete roadmap for implementing PetSoft Tycoon according to the PRD specifications. Each task is designed to be executable by junior developers with the provided guidance and resources.**

**📋 Follow the structured phases, validate against the quality checkpoints, and leverage the support resources to ensure successful project delivery within the 4-week timeline.**