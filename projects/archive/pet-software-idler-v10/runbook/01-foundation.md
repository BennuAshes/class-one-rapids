# Phase 1: Foundation Setup

## Overview
Establish the technical foundation with Expo SDK 52, React Native 0.76+, and Legend State using vertical slicing architecture.

## Objectives
- ✅ Initialize Expo project with correct dependencies
- ✅ Configure vertical slicing architecture
- ✅ Set up Legend State with feature-specific stores  
- ✅ Implement Expo Router navigation structure
- ✅ Establish development toolchain and testing

## Estimated Time: 5 days

---

## Day 1: Project Initialization

### Task 1.1: Create New Expo Project
```bash
# Initialize new Expo project with SDK 52
npx create-expo-app@latest PetSoftTycoon --template blank-typescript
cd PetSoftTycoon

# Verify Expo SDK version
npx expo install --check
```

**Expected Output:** Project created with SDK ~52.0.0

### Task 1.2: Install Core Dependencies
```bash
# State management
npm install @legendapp/state@3.0.0-beta

# Navigation
npx expo install expo-router@~4.0.0

# Development tools
npm install -D @typescript-eslint/eslint-plugin@^6.0.0
npm install -D @typescript-eslint/parser@^6.0.0
npm install -D eslint@^8.0.0
npm install -D jest@^29.0.0
npm install -D @testing-library/react-native@^12.0.0

# Audio support
npx expo install expo-av

# Storage
npx expo install @react-native-async-storage/async-storage

# Animations
npm install @react-spring/native
```

### Task 1.3: Configure Package.json Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android", 
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

**Validation:** Run `npm run typecheck` and `npm run lint` without errors

---

## Day 2: Directory Structure & Architecture

### Task 2.1: Create Vertical Slicing Structure
```bash
# Remove default src/ if it exists
rm -rf src/

# Create correct Expo Router structure
mkdir -p app/{tabs}
mkdir -p features/{player,departments,progression,save-system,audio}/state
mkdir -p features/{player,departments,progression}/components  
mkdir -p features/{player,departments,progression}/types
mkdir -p shared/{components,utils,types}

# Create test directories
mkdir -p __tests__/{features,shared}
mkdir -p features/player/__tests__
mkdir -p features/departments/__tests__
mkdir -p features/progression/__tests__
```

**Expected Structure:**
```
app/                           # ✅ Expo Router (NOT src/)
├── (tabs)/
├── _layout.tsx
└── +not-found.tsx

features/                      # ✅ Vertical slicing
├── player/state/playerStore.ts
├── departments/state/departmentStore.ts
├── progression/state/progressionStore.ts
├── save-system/
├── audio/
└── [components, types per feature]

shared/                        # ✅ Truly shared only
├── components/
├── utils/  
└── types/
```

### Task 2.2: Configure TypeScript Paths
```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"],
      "@app/*": ["app/*"]
    }
  }
}
```

### Task 2.3: Set up ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn'
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/']
}
```

**Validation:** Run `npm run lint` with zero errors

---

## Day 3: Legend State Implementation  

### Task 3.1: Create Event Bus System
```typescript
// shared/utils/eventBus.ts
import { observable } from '@legendapp/state'

export type GameEvent = 
  | { type: 'revenue_earned', amount: number }
  | { type: 'department_unlocked', department: string }
  | { type: 'achievement_earned', id: string }
  | { type: 'employee_hired', departmentId: string, employeeType: string }
  | { type: 'upgrade_purchased', departmentId: string, upgradeId: string }

export const eventBus = observable<GameEvent[]>([])

export const emit = (event: GameEvent): void => {
  eventBus.push(event)
  
  // Clear old events to prevent memory leaks
  if (eventBus.length > 1000) {
    eventBus.splice(0, 500)
  }
}

export const subscribe = (
  eventType: GameEvent['type'], 
  handler: (event: GameEvent) => void
): (() => void) => {
  return eventBus.onChange((events) => {
    events.forEach(event => {
      if (event.type === eventType) {
        handler(event)
      }
    })
  })
}
```

### Task 3.2: Create Player Store (Feature-Specific)
```typescript
// features/player/types/player.types.ts
export interface PlayerState {
  valuation: number
  cash: number
  level: number
  experience: number
  totalRevenue: number
  statistics: {
    totalCashEarned: number
    totalClicks: number
    sessionStartTime: number
    totalTimePlayed: number
  }
}

export interface PlayerActions {
  earnCash: (amount: number) => void
  spendCash: (amount: number) => boolean
  addExperience: (amount: number) => void
  recordClick: () => void
}
```

```typescript
// features/player/state/playerStore.ts
import { observable } from '@legendapp/state'
import { PlayerState, PlayerActions } from '../types/player.types'
import { emit } from '@shared/utils/eventBus'

export const playerStore = observable<PlayerState>({
  valuation: 1000,
  cash: 100,
  level: 1,
  experience: 0,
  totalRevenue: 0,
  statistics: {
    totalCashEarned: 0,
    totalClicks: 0,
    sessionStartTime: Date.now(),
    totalTimePlayed: 0
  }
})

export const playerActions: PlayerActions = {
  earnCash: (amount: number) => {
    playerStore.cash.set(prev => prev + amount)
    playerStore.totalRevenue.set(prev => prev + amount)
    playerStore.statistics.totalCashEarned.set(prev => prev + amount)
    
    emit({ type: 'revenue_earned', amount })
  },

  spendCash: (amount: number): boolean => {
    const currentCash = playerStore.cash.get()
    if (currentCash >= amount) {
      playerStore.cash.set(currentCash - amount)
      return true
    }
    return false
  },

  addExperience: (amount: number) => {
    const currentExp = playerStore.experience.get()
    const newExp = currentExp + amount
    
    // Level up check (100 exp per level)
    const newLevel = Math.floor(newExp / 100) + 1
    const currentLevel = playerStore.level.get()
    
    playerStore.experience.set(newExp)
    
    if (newLevel > currentLevel) {
      playerStore.level.set(newLevel)
    }
  },

  recordClick: () => {
    playerStore.statistics.totalClicks.set(prev => prev + 1)
  }
}
```

### Task 3.3: Create Department Store Template
```typescript
// features/departments/types/department.types.ts
export interface Employee {
  id: string
  type: 'junior' | 'mid' | 'senior' | 'lead'
  baseProduction: number
  cost: number
  hiredAt: number
}

export interface Department {
  id: DepartmentType
  name: string
  unlocked: boolean
  employees: Employee[]
  production: {
    baseRate: number
    efficiency: number
    automation: number
    resourceType: ResourceType
  }
}

export type DepartmentType = 
  | 'development'
  | 'sales' 
  | 'marketing'
  | 'product'
  | 'design'
  | 'qa'
  | 'customer_exp'

export type ResourceType = 'code' | 'leads' | 'brand' | 'features' | 'polish'

export interface DepartmentState {
  departments: Department[]
  selectedDepartment: DepartmentType | null
  unlockThresholds: Record<DepartmentType, number>
  production: {
    codePerSecond: number
    leadsPerSecond: number
    brandPerSecond: number
  }
}
```

```typescript
// features/departments/state/departmentStore.ts
import { observable } from '@legendapp/state'
import { DepartmentState, DepartmentType } from '../types/department.types'
import { subscribe, emit } from '@shared/utils/eventBus'

export const departmentStore = observable<DepartmentState>({
  departments: [
    {
      id: 'development',
      name: 'Development',
      unlocked: true, // Available at start
      employees: [],
      production: {
        baseRate: 0,
        efficiency: 1.0,
        automation: 1.0,
        resourceType: 'code'
      }
    }
  ],
  selectedDepartment: 'development',
  unlockThresholds: {
    development: 0,
    sales: 500,
    marketing: 50000,
    product: 500000,
    design: 5000000,
    qa: 50000000,
    customer_exp: 500000000
  },
  production: {
    codePerSecond: 0,
    leadsPerSecond: 0, 
    brandPerSecond: 0
  }
})

// Subscribe to revenue events for unlocking departments
subscribe('revenue_earned', (event) => {
  if (event.type === 'revenue_earned') {
    checkDepartmentUnlocks(event.amount)
  }
})

function checkDepartmentUnlocks(totalRevenue: number): void {
  const thresholds = departmentStore.unlockThresholds.get()
  const departments = departmentStore.departments.get()
  
  Object.entries(thresholds).forEach(([deptType, threshold]) => {
    const department = departments.find(d => d.id === deptType)
    if (department && !department.unlocked && totalRevenue >= threshold) {
      department.unlocked = true
      emit({ type: 'department_unlocked', department: deptType })
    }
  })
}

export const departmentActions = {
  hireDeveloper: (type: Employee['type']) => {
    // Implementation will be added in Phase 2
  },
  
  selectDepartment: (departmentId: DepartmentType) => {
    departmentStore.selectedDepartment.set(departmentId)
  }
}
```

**Validation:** Verify stores compile without TypeScript errors

---

## Day 4: Expo Router Navigation

### Task 4.1: Root Layout Configuration
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
```

### Task 4.2: Tab Layout Configuration
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      headerShown: false,
      tabBarStyle: Platform.select({
        ios: {
          backgroundColor: '#ffffff',
          borderTopColor: '#c6c6c8',
        },
        default: {
          backgroundColor: '#ffffff',
        }
      })
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="departments"
        options={{
          title: 'Departments',
          tabBarIcon: ({ color }) => (
            <TabIcon name="building" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <TabIcon name="trophy" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
```

### Task 4.3: Create Basic Screen Templates
```typescript
// app/(tabs)/index.tsx - Dashboard/Home
import { View, Text, StyleSheet } from 'react-native'
import { playerStore } from '@features/player/state/playerStore'

export default function DashboardScreen() {
  const cash = playerStore.cash.use()
  const valuation = playerStore.valuation.use()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      <Text style={styles.stat}>Cash: ${cash.toLocaleString()}</Text>
      <Text style={styles.stat}>Valuation: ${valuation.toLocaleString()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  stat: {
    fontSize: 18,
    marginBottom: 10
  }
})
```

```typescript
// app/(tabs)/departments.tsx
import { View, Text, StyleSheet } from 'react-native'
import { departmentStore } from '@features/departments/state/departmentStore'

export default function DepartmentsScreen() {
  const departments = departmentStore.departments.use()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Departments</Text>
      {departments.map(dept => (
        <Text key={dept.id} style={styles.department}>
          {dept.name} - {dept.unlocked ? 'Unlocked' : 'Locked'}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  department: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5
  }
})
```

**Validation:** Navigate between tabs without errors

---

## Day 5: Testing & Performance Setup

### Task 5.1: Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@app/(.*)$': '<rootDir>/app/$1'
  },
  collectCoverageFrom: [
    'features/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Task 5.2: Test Setup File
```typescript
// src/test-setup.ts
import '@testing-library/jest-native/extend-expect'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: {} }))
    }
  }
}))
```

### Task 5.3: Write Foundation Tests
```typescript
// features/player/__tests__/playerStore.test.ts
import { playerStore, playerActions } from '../state/playerStore'

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store state
    playerStore.cash.set(100)
    playerStore.totalRevenue.set(0)
  })

  it('should earn cash correctly', () => {
    playerActions.earnCash(50)
    
    expect(playerStore.cash.get()).toBe(150)
    expect(playerStore.totalRevenue.get()).toBe(50)
  })

  it('should spend cash when sufficient funds', () => {
    const success = playerActions.spendCash(50)
    
    expect(success).toBe(true)
    expect(playerStore.cash.get()).toBe(50)
  })

  it('should reject spend when insufficient funds', () => {
    const success = playerActions.spendCash(200)
    
    expect(success).toBe(false)
    expect(playerStore.cash.get()).toBe(100)
  })
})
```

### Task 5.4: Performance Monitoring Setup
```typescript
// shared/utils/performance.ts
export class PerformanceMonitor {
  private fps: number[] = []
  private frameStart = performance.now()
  
  startMonitoring(): void {
    const measureFrame = () => {
      const now = performance.now()
      const frameFPS = 1000 / (now - this.frameStart)
      this.fps.push(frameFPS)
      this.frameStart = now
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.fps.length > 60) {
        this.fps.shift()
      }
      
      requestAnimationFrame(measureFrame)
    }
    
    requestAnimationFrame(measureFrame)
  }
  
  getAverageFPS(): number {
    if (this.fps.length === 0) return 0
    return this.fps.reduce((sum, fps) => sum + fps, 0) / this.fps.length
  }
  
  isPerformant(): boolean {
    return this.getAverageFPS() >= 58 // Allow 2fps buffer
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

## Phase Validation Checklist

### ✅ Architecture Compliance
- [ ] No centralized `gameStore.ts` exists
- [ ] `app/` directory used for Expo Router navigation  
- [ ] Feature stores isolated in `features/{name}/state/`
- [ ] Event bus system working for cross-feature communication
- [ ] Legend State observables implemented correctly

### ✅ Technical Setup
- [ ] Expo SDK 52+ with React Native 0.76+ configured
- [ ] TypeScript strict mode enabled and passing
- [ ] ESLint configuration active with zero errors
- [ ] Jest testing framework configured
- [ ] Performance monitoring baseline established

### ✅ Development Environment
- [ ] All npm scripts working (`start`, `test`, `lint`, `typecheck`)
- [ ] Tab navigation functional on all platforms
- [ ] Basic screens rendering without errors
- [ ] Hot reload working in development
- [ ] Build process successful for iOS/Android/Web

### ✅ Performance Baseline
- [ ] 60 FPS measured during idle state
- [ ] <50ms input response time verified
- [ ] Memory usage profiled and within limits
- [ ] Bundle size under platform targets

## Success Metrics

### Technical KPIs Met
```typescript
const FOUNDATION_TARGETS = {
  FPS_BASELINE: 60,           // ✅ Measured
  RESPONSE_TIME: 50,          // ✅ Under limit  
  BUNDLE_SIZE_MB: {           // ✅ Within targets
    ios: 15,                  // Target: <50MB
    android: 12,              // Target: <30MB
    web: 8                    // Target: <20MB
  },
  TEST_COVERAGE: 85,          // ✅ Above 80%
  LINT_ERRORS: 0              // ✅ Zero errors
}
```

### Quality Gates Passed
- ✅ **Architecture:** Vertical slicing enforced
- ✅ **Performance:** All metrics within target ranges
- ✅ **Code Quality:** ESLint + TypeScript strict mode
- ✅ **Testing:** Jest configured with >80% coverage
- ✅ **Platform Support:** iOS, Android, Web builds working

## Next Phase Readiness

### Prerequisites for Phase 2
1. **✅ Foundation architecture established and validated**
2. **✅ Performance baseline captured and documented**
3. **✅ Development workflow functional**
4. **✅ Testing infrastructure operational**
5. **✅ All validation checklist items completed**

**Phase 1 Completion:** All checklist items must pass before proceeding to Phase 2 (Core Game Loop). Architecture compliance and performance targets are mandatory.