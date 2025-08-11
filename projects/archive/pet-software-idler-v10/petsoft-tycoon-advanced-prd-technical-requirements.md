# PetSoft Tycoon: Technical Requirements Document

## Document Metadata
- **Version:** 2.0  
- **Date:** August 10, 2025  
- **Based on:** PetSoft Tycoon PRD v1.0  
- **Architecture:** React Native + Expo SDK 52+ + Legend State + Vertical Slicing

---

## 1. Technology Stack & Architecture

### 1.1 Core Technology Requirements

| Component | Version | Purpose | Critical Features |
|-----------|---------|---------|------------------|
| **React Native** | 0.76.9+ | Mobile framework | New Architecture enabled, Hermes engine |
| **Expo SDK** | ~52.0.0 | Development platform | Managed workflow, EAS services, Metro bundler |
| **@legendapp/state** | 3.0.0-beta | State management | Observable pattern, 5KB bundle, fine-grained reactivity |
| **TypeScript** | ^5.3.0 | Type safety | Strict mode, path mapping |
| **Expo Router** | ~4.0.0 | Navigation | File-based routing, typed routes |

### 1.2 Architecture Pattern: Vertical Slicing

**CRITICAL:** This project MUST use vertical slicing architecture, NOT centralized stores.

#### ✅ CORRECT Structure
```
features/
├── departments/
│   ├── state/
│   │   └── departmentStore.ts     # Feature-specific store
│   ├── components/
│   │   ├── DepartmentCard.tsx
│   │   └── DepartmentList.tsx
│   ├── screens/
│   │   └── DepartmentScreen.tsx
│   └── types/
│       └── department.types.ts
├── progression/
│   ├── state/
│   │   └── progressionStore.ts    # Separate feature store
│   └── [components, screens, types]
└── player/
    ├── state/
    │   └── playerStore.ts         # Player-specific store
    └── [components, screens, types]
```

#### ❌ WRONG Structure (Current Implementation)
```
src/core/state/gameStore.ts        # ❌ Centralized store
├── departments: []                # ❌ All features mixed together
├── player: {}                     # ❌ Tight coupling
└── progression: {}                # ❌ Violates vertical slicing
```

### 1.3 Directory Structure Requirements

#### Expo Router Structure (MANDATORY)
```
app/                               # ✅ REQUIRED by Expo Router
├── (tabs)/
│   ├── _layout.tsx               # Tab navigation configuration
│   ├── index.tsx                 # Home/Dashboard tab
│   ├── departments.tsx           # Departments management
│   ├── progression.tsx           # Achievements & prestige
│   └── settings.tsx              # Game settings
├── _layout.tsx                   # Root layout with state providers
├── +html.tsx                     # Web-specific HTML wrapper
└── +not-found.tsx                # 404 handler

features/                          # ✅ Feature-specific logic
├── departments/
├── progression/
├── player/
├── automation/
├── achievements/
├── audio/
└── save-system/

shared/                            # ✅ Truly shared utilities
├── components/
│   ├── BaseButton.tsx
│   ├── NumberDisplay.tsx
│   └── ProgressBar.tsx
├── utils/
│   ├── formatting.ts
│   ├── calculations.ts
│   └── performance.ts
└── types/
    └── index.ts
```

---

## 2. State Management Architecture

### 2.1 Legend State Implementation per Feature

#### Department Store Example (CORRECT)
```typescript
// features/departments/state/departmentStore.ts
import { observable } from '@legendapp/state'
import { DepartmentState, Department } from '../types/department.types'

export const departmentStore = observable<DepartmentState>({
  departments: [],
  selectedDepartment: null,
  unlockThresholds: {
    development: 0,      // Available at start
    sales: 500,          // $500 total revenue
    marketing: 50000,    // $50K total revenue
    // ... other thresholds from PRD
  },
  production: {
    codePerSecond: 0,
    featuresGenerated: 0,
    leadsGenerated: 0
  }
})

// Feature-specific actions
export const departmentActions = {
  hireDeveloper: (type: 'junior' | 'mid' | 'senior' | 'lead') => {
    // Implementation here
  },
  
  purchaseUpgrade: (departmentId: string, upgradeId: string) => {
    // Implementation here
  },
  
  calculateProduction: () => {
    // Production calculations
  }
}
```

#### Player Store Example (CORRECT)
```typescript
// features/player/state/playerStore.ts
import { observable } from '@legendapp/state'
import { PlayerState } from '../types/player.types'

export const playerStore = observable<PlayerState>({
  valuation: 1000,
  cash: 100,
  level: 1,
  experience: 0,
  totalRevenue: 0,    // For unlock thresholds
  statistics: {
    totalCashEarned: 0,
    totalClicks: 0,
    sessionStartTime: Date.now()
  }
})
```

### 2.2 Cross-Feature Communication

#### Event System for Feature Coordination
```typescript
// shared/utils/eventBus.ts
import { observable } from '@legendapp/state'

type GameEvent = 
  | { type: 'revenue_earned', amount: number }
  | { type: 'department_unlocked', department: string }
  | { type: 'achievement_earned', id: string }

export const eventBus = observable<GameEvent[]>([])

export const emit = (event: GameEvent) => {
  eventBus.push(event)
}

// Features can subscribe to relevant events
export const subscribe = (eventType: string, handler: (event: GameEvent) => void) => {
  // Implementation
}
```

### 2.3 Performance Optimizations

#### Reactive Updates Without Re-renders
```typescript
// ✅ CORRECT: Legend State reactive patterns
import { useObservable } from '@legendapp/state/react'

function DepartmentCard({ departmentId }: Props) {
  // Only re-renders when specific department changes
  const department = departmentStore.departments[departmentId].use()
  
  return (
    <View>
      <Text>{department.name}</Text>
      <Text>{department.employees.length} employees</Text>
    </View>
  )
}

// ❌ WRONG: useState causes unnecessary re-renders
function WrongDepartmentCard() {
  const [gameState, setGameState] = useState<ComplexState>()
  // Entire component re-renders on any game state change
}
```

---

## 3. Performance Requirements & Implementation

### 3.1 Target Metrics (from PRD)

| Metric | Target | Implementation Strategy |
|--------|--------|------------------------|
| **Frame Rate** | 60 FPS consistent | RequestAnimationFrame game loop, memoized components |
| **Load Time** | <3s cold start | Code splitting, lazy loading, optimized bundles |
| **Response Time** | <50ms input to feedback | Optimistic updates, immediate UI feedback |
| **Memory Usage** | <200MB runtime | FlatList virtualization, image optimization |
| **Bundle Size** | <50MB iOS, <30MB Android | Tree-shaking, dynamic imports |

### 3.2 Game Loop Architecture

#### Core Game Loop Implementation
```typescript
// features/automation/gameLoop.tsx
import { useEffect, useRef } from 'react'
import { departmentStore } from '../departments/state/departmentStore'
import { playerStore } from '../player/state/playerStore'

export function GameLoop() {
  const frameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = now - lastUpdateRef.current
      
      // Only update if enough time has passed (16.67ms for 60fps)
      if (deltaTime >= 16.67) {
        updateProduction(deltaTime)
        updateAutomation(deltaTime)
        lastUpdateRef.current = now
      }
      
      frameRef.current = requestAnimationFrame(gameLoop)
    }
    
    frameRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return null // This is a logic-only component
}

function updateProduction(deltaTime: number) {
  // Calculate production based on deltaTime
  const codeProduced = calculateCodeProduction(deltaTime)
  departmentStore.production.codePerSecond.set(codeProduced)
}
```

### 3.3 Animation System Requirements

#### Smooth Number Animations
```typescript
// shared/components/AnimatedNumber.tsx
import { useSpring, animated } from '@react-spring/native'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (value: number) => string
}

export function AnimatedNumber({ value, duration = 500, format = (v) => v.toString() }: AnimatedNumberProps) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration }
  })

  return (
    <animated.Text>
      {number.to(n => format(Math.floor(n)))}
    </animated.Text>
  )
}
```

---

## 4. Data Models & Business Logic

### 4.1 Department System Data Model

#### Core Department Structure
```typescript
// features/departments/types/department.types.ts
export interface Department {
  id: DepartmentType
  name: string
  type: DepartmentType
  unlocked: boolean
  
  // Employee management
  employees: Employee[]
  managers: Manager[]
  
  // Production metrics
  production: {
    baseRate: number        // Base production per second
    efficiency: number      // Efficiency multiplier (1.0 = 100%)
    automation: number      // Automation level (0-1)
    resourceType: ResourceType
  }
  
  // Upgrade system
  upgrades: Upgrade[]
  milestones: Milestone[]
}

export type DepartmentType = 
  | 'development'    // Lines of Code → Features
  | 'sales'         // Customer Leads → Revenue  
  | 'marketing'     // Brand Points → Lead Multiplier
  | 'product'       // Enhanced Features (2x value)
  | 'design'        // Polish Multiplier
  | 'qa'            // Bug Prevention
  | 'customer_exp'  // Retention Multiplier

export interface Employee {
  id: string
  type: 'junior' | 'mid' | 'senior' | 'lead'
  baseProduction: number
  cost: number
  specialAbility?: string
}
```

### 4.2 Resource Flow System

#### Production Chain Implementation
```typescript
// features/departments/utils/productionCalculator.ts
export class ProductionCalculator {
  // Development: Manual Clicks + Employees → Lines of Code
  static calculateCodeProduction(department: Department): number {
    const baseProduction = department.employees.reduce((total, emp) => {
      return total + emp.baseProduction
    }, 0)
    
    const efficiency = department.production.efficiency
    const automation = department.production.automation
    
    return baseProduction * efficiency * automation
  }
  
  // Feature Conversion: Lines of Code → Features
  static convertCodeToFeatures(linesOfCode: number): FeatureOutput {
    return {
      basic: Math.floor(linesOfCode / 10),      // 10 lines = 1 Basic Feature
      advanced: Math.floor(linesOfCode / 100),   // 100 lines = 1 Advanced Feature  
      premium: Math.floor(linesOfCode / 1000)    // 1000 lines = 1 Premium Feature
    }
  }
  
  // Sales: Customer Leads + Features → Revenue
  static calculateRevenue(leads: number, features: FeatureOutput): number {
    const basicRevenue = Math.min(leads, features.basic) * 50
    const advancedRevenue = Math.min(leads, features.advanced) * 500
    const premiumRevenue = Math.min(leads, features.premium) * 5000
    
    return basicRevenue + advancedRevenue + premiumRevenue
  }
}
```

### 4.3 Progression & Prestige System

#### Investor Points Calculation
```typescript
// features/progression/utils/prestigeCalculator.ts
export class PrestigeCalculator {
  static calculateInvestorPoints(valuation: number): number {
    if (valuation < 10_000_000) return 0  // $10M minimum for prestige
    
    let baseIP = Math.floor(valuation / 1_000_000)  // 1 IP per $1M
    
    // Enhanced rates for funding rounds
    if (valuation >= 1_000_000_000) {      // Series C (≥$1B)
      baseIP *= 3
    } else if (valuation >= 100_000_000) {  // Series B (≥$100M)  
      baseIP *= 2
    } else if (valuation >= 10_000_000) {   // Series A (≥$10M)
      baseIP *= 1.5
    }
    
    return Math.floor(baseIP)
  }
  
  static calculatePrestigeBonuses(investorPoints: number) {
    return {
      startingCapital: Math.pow(1.1, investorPoints), // +10% compound per IP
      globalSpeed: investorPoints * 0.01,              // +1% additive per IP
      syneryBonus: Math.floor(investorPoints / 10) * 0.02 // +2% per 10 IP
    }
  }
}
```

---

## 5. Cross-Platform Implementation

### 5.1 Expo Router Navigation Structure

#### Root Layout with Providers
```typescript
// app/_layout.tsx
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GameLoop } from '../features/automation/GameLoop'
import { AudioProvider } from '../features/audio/AudioProvider'
import { SaveSystemProvider } from '../features/save-system/SaveSystemProvider'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <AudioProvider>
        <SaveSystemProvider>
          <GameLoop />
          <Slot />
        </SaveSystemProvider>
      </AudioProvider>
    </>
  )
}
```

#### Tab Navigation Configuration
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { TabBarIcon } from '../../shared/components/TabBarIcon'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="departments"
        options={{
          title: 'Departments',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="building" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}
```

### 5.2 Platform-Specific Optimizations

#### iOS/Android/Web Considerations
```typescript
// shared/utils/platform.ts
import { Platform, Dimensions } from 'react-native'

export const PLATFORM_CONFIG = {
  isWeb: Platform.OS === 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // Performance settings per platform
  maxParticles: Platform.OS === 'web' ? 100 : 50,
  animationDuration: Platform.OS === 'web' ? 300 : 200,
  
  // Screen dimensions
  screen: Dimensions.get('screen'),
  window: Dimensions.get('window'),
  
  // Storage limits
  maxSaveSize: Platform.OS === 'web' ? 10 * 1024 * 1024 : 50 * 1024 * 1024
}

// Platform-specific component loading
export const PlatformButton = Platform.select({
  web: () => require('../components/WebButton').WebButton,
  default: () => require('../components/NativeButton').NativeButton,
})()
```

---

## 6. Audio System Requirements

### 6.1 Audio Architecture

#### Dynamic Audio System
```typescript
// features/audio/audioSystem.ts
import { Audio } from 'expo-av'

export class AudioSystem {
  private sounds: Map<string, Audio.Sound> = new Map()
  private isEnabled = true
  private volume = 0.7
  
  async loadSounds() {
    const soundFiles = {
      click: require('../../assets/sounds/click.mp3'),
      purchase: require('../../assets/sounds/purchase.mp3'),
      achievement: require('../../assets/sounds/achievement.mp3'),
      prestige: require('../../assets/sounds/prestige.mp3'),
    }
    
    for (const [name, source] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: this.volume
      })
      this.sounds.set(name, sound)
    }
  }
  
  play(soundName: string, options?: { volume?: number }) {
    if (!this.isEnabled) return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.setVolumeAsync(options?.volume ?? this.volume)
      sound.playAsync()
    }
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach(sound => {
      sound.setVolumeAsync(this.volume)
    })
  }
}
```

### 6.2 Audio Integration with Game Events

#### Contextual Audio Feedback
```typescript
// features/audio/hooks/useGameAudio.ts
import { useEffect } from 'react'
import { audioSystem } from '../audioSystem'
import { eventBus } from '../../shared/utils/eventBus'

export function useGameAudio() {
  useEffect(() => {
    const unsubscribe = eventBus.onChange((events) => {
      events.forEach(event => {
        switch (event.type) {
          case 'revenue_earned':
            if (event.amount > 1000) {
              audioSystem.play('big_purchase')
            } else {
              audioSystem.play('small_purchase')
            }
            break
            
          case 'achievement_earned':
            audioSystem.play('achievement')
            break
            
          case 'prestige_activated':
            audioSystem.play('prestige')
            break
        }
      })
    })
    
    return unsubscribe
  }, [])
}
```

---

## 7. Save/Load System Implementation

### 7.1 Save System Architecture

#### Comprehensive Save System
```typescript
// features/save-system/SaveSystem.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { compress, decompress } from 'lz-string'

export interface SaveData {
  version: string
  timestamp: number
  departments: DepartmentSaveData[]
  player: PlayerSaveData
  progression: ProgressionSaveData
  settings: SettingsSaveData
  checksum: string
}

export class SaveSystem {
  private readonly SAVE_KEY = 'petsoft_tycoon_save'
  private readonly CURRENT_VERSION = '2.0.0'
  private readonly AUTO_SAVE_INTERVAL = 30000 // 30 seconds
  
  async saveGame(): Promise<boolean> {
    try {
      const saveData: SaveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        departments: this.serializeDepartments(),
        player: this.serializePlayer(),
        progression: this.serializeProgression(),
        settings: this.serializeSettings(),
        checksum: ''
      }
      
      saveData.checksum = this.calculateChecksum(saveData)
      const compressed = compress(JSON.stringify(saveData))
      
      await AsyncStorage.setItem(this.SAVE_KEY, compressed)
      return true
    } catch (error) {
      console.error('Save failed:', error)
      return false
    }
  }
  
  async loadGame(): Promise<SaveData | null> {
    try {
      const compressed = await AsyncStorage.getItem(this.SAVE_KEY)
      if (!compressed) return null
      
      const saveData: SaveData = JSON.parse(decompress(compressed) || '')
      
      // Validate checksum
      const expectedChecksum = this.calculateChecksum({...saveData, checksum: ''})
      if (saveData.checksum !== expectedChecksum) {
        throw new Error('Save data corrupted')
      }
      
      // Handle version migration
      return this.migrateVersion(saveData)
    } catch (error) {
      console.error('Load failed:', error)
      return null
    }
  }
  
  private calculateChecksum(data: Omit<SaveData, 'checksum'>): string {
    // Simple checksum for save validation
    return btoa(JSON.stringify(data)).slice(0, 16)
  }
  
  private migrateVersion(saveData: SaveData): SaveData {
    // Handle version migration logic
    if (saveData.version === '1.0.0') {
      // Migrate from v1.0.0 to v2.0.0
      return this.migrateFromV1(saveData)
    }
    return saveData
  }
}
```

### 7.2 Auto-Save Implementation

#### Background Auto-Save
```typescript
// features/save-system/AutoSaveManager.ts
export class AutoSaveManager {
  private saveSystem: SaveSystem
  private intervalId: NodeJS.Timeout | null = null
  private isDirty = false
  
  constructor(saveSystem: SaveSystem) {
    this.saveSystem = saveSystem
  }
  
  start() {
    this.intervalId = setInterval(async () => {
      if (this.isDirty) {
        const success = await this.saveSystem.saveGame()
        if (success) {
          this.isDirty = false
        }
      }
    }, 30000) // 30 seconds
  }
  
  markDirty() {
    this.isDirty = true
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
```

---

## 8. Testing Requirements

### 8.1 Testing Architecture per Feature

#### Feature-Specific Test Structure
```
features/departments/
├── __tests__/
│   ├── departmentStore.test.ts     # State management tests
│   ├── DepartmentCard.test.tsx     # Component tests  
│   ├── productionCalculator.test.ts # Business logic tests
│   └── integration.test.ts         # Feature integration tests
```

### 8.2 Critical Test Coverage

#### Unit Tests - Business Logic
```typescript
// features/departments/__tests__/productionCalculator.test.ts
import { ProductionCalculator } from '../utils/productionCalculator'
import { Department } from '../types/department.types'

describe('ProductionCalculator', () => {
  describe('calculateCodeProduction', () => {
    it('should calculate base production correctly', () => {
      const department: Department = {
        // Mock department with employees
        employees: [
          { type: 'junior', baseProduction: 0.1 },
          { type: 'senior', baseProduction: 2.5 }
        ],
        production: {
          efficiency: 1.0,
          automation: 1.0
        }
      }
      
      const result = ProductionCalculator.calculateCodeProduction(department)
      expect(result).toBe(2.6) // 0.1 + 2.5
    })
    
    it('should apply efficiency multiplier', () => {
      // Test efficiency calculations
    })
    
    it('should handle edge cases', () => {
      // Test zero employees, extreme values, etc.
    })
  })
})
```

#### Integration Tests - Feature Interactions  
```typescript
// features/departments/__tests__/integration.test.ts
import { departmentStore, departmentActions } from '../state/departmentStore'
import { playerStore } from '../../player/state/playerStore'

describe('Department Integration', () => {
  it('should unlock sales department when revenue threshold met', async () => {
    // Set player revenue to $500
    playerStore.totalRevenue.set(500)
    
    // Check that sales department unlocks
    expect(departmentStore.departments.get().find(d => d.id === 'sales')?.unlocked).toBe(true)
  })
  
  it('should calculate department synergies correctly', () => {
    // Test multi-department interactions
  })
})
```

### 8.3 Performance Testing

#### FPS Monitoring Tests
```typescript
// shared/utils/__tests__/performance.test.ts
describe('Performance Requirements', () => {
  it('should maintain 60fps during normal gameplay', async () => {
    const fpsMonitor = new FPSMonitor()
    fpsMonitor.start()
    
    // Simulate 1000 game loop iterations
    for (let i = 0; i < 1000; i++) {
      await gameLoop()
    }
    
    const averageFPS = fpsMonitor.getAverage()
    expect(averageFPS).toBeGreaterThanOrEqual(58) // Allow 2fps buffer
  })
  
  it('should respond to input within 50ms', async () => {
    const startTime = performance.now()
    await simulateButtonClick()
    const responseTime = performance.now() - startTime
    
    expect(responseTime).toBeLessThan(50)
  })
})
```

---

## 9. Development & Deployment Pipeline

### 9.1 Development Commands

#### Required Package Scripts
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
    "typecheck": "tsc --noEmit",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "build:web": "expo export --platform web"
  }
}
```

### 9.2 Build Configuration

#### EAS Build Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      },
      "optimization": "minify"
    }
  }
}
```

### 9.3 Performance Monitoring

#### Production Metrics Collection
```typescript
// features/analytics/PerformanceMonitor.ts
export class PerformanceMonitor {
  private fps: number[] = []
  private memoryUsage: number[] = []
  
  startMonitoring() {
    // FPS monitoring
    let lastTime = performance.now()
    const measureFPS = () => {
      const currentTime = performance.now()
      const fps = 1000 / (currentTime - lastTime)
      this.fps.push(fps)
      lastTime = currentTime
      requestAnimationFrame(measureFPS)
    }
    requestAnimationFrame(measureFPS)
    
    // Memory monitoring (if available)
    if ('memory' in performance) {
      setInterval(() => {
        this.memoryUsage.push(performance.memory.usedJSHeapSize)
      }, 1000)
    }
  }
  
  getMetrics() {
    return {
      averageFPS: this.fps.reduce((a, b) => a + b, 0) / this.fps.length,
      averageMemory: this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length,
      // Other metrics...
    }
  }
}
```

---

## 10. Migration Strategy from Current Implementation

### 10.1 Current Architecture Issues

The existing codebase has these architectural violations that MUST be fixed:

❌ **Problem:** Centralized `gameStore.ts` with all features mixed together  
✅ **Solution:** Extract to separate feature stores using vertical slicing

❌ **Problem:** `src/` directory structure with Expo Router  
✅ **Solution:** Use `app/` directory for routing, `features/` for logic

### 10.2 Step-by-Step Migration Plan

#### Phase 1: Extract Department Store (Week 1)
```bash
# 1. Create new department feature structure
mkdir -p features/departments/{state,components,screens,types}

# 2. Extract department logic from gameStore.ts
# Move department-related code to features/departments/state/departmentStore.ts

# 3. Update imports in existing components
# Change: import { gameStore } from '../../../core/state/gameStore'
# To: import { departmentStore } from '../../../features/departments/state/departmentStore'
```

#### Phase 2: Extract Player & Progression Stores (Week 2)  
```bash
# Extract player state
mkdir -p features/player/{state,components,types}

# Extract progression state
mkdir -p features/progression/{state,components,types}

# Update cross-feature dependencies using event bus
```

#### Phase 3: Refactor Components to Features (Week 3)
```bash
# Move components to appropriate feature folders
# Update app/ directory routing
# Implement proper feature boundaries
```

#### Phase 4: Remove Centralized Store (Week 4)
```bash
# Delete src/core/state/gameStore.ts
# Verify all imports updated
# Test full application functionality
```

### 10.3 Backwards Compatibility

During migration, maintain compatibility by:
```typescript
// Temporary compatibility layer
// features/migration/legacyCompat.ts
export const gameStore = {
  // Proxy to new feature stores for backwards compatibility
  get departments() { return departmentStore.departments.get() },
  get player() { return playerStore.get() },
  // Remove once migration complete
}
```

---

## 11. Quality Assurance & Validation

### 11.1 Pre-Launch Checklist

#### Architecture Validation
- [ ] ✅ All features use vertical slicing (no centralized stores)
- [ ] ✅ Expo Router `app/` directory structure implemented  
- [ ] ✅ Legend State observables used correctly (no useState for complex state)
- [ ] ✅ Each feature has independent store in `/state/` folder
- [ ] ✅ Cross-feature communication via event bus only

#### Performance Validation  
- [ ] ✅ 60 FPS maintained during normal gameplay
- [ ] ✅ <50ms input response time verified
- [ ] ✅ <3s cold start time measured
- [ ] ✅ Memory usage stays under 200MB
- [ ] ✅ Bundle size under platform limits

#### PRD Requirements Validation
- [ ] ✅ Seven departments implemented with unique mechanics
- [ ] ✅ Prestige system with Investor Points calculation  
- [ ] ✅ Achievement system with 50+ achievements
- [ ] ✅ Audio system with contextual feedback
- [ ] ✅ Save/load system with auto-save and validation
- [ ] ✅ Offline progression calculation (12 hour max)

### 11.2 Success Metrics Tracking

#### Technical KPIs
```typescript
// Automated performance tracking
export const PERFORMANCE_TARGETS = {
  FPS_TARGET: 60,
  RESPONSE_TIME_MAX: 50,   // milliseconds
  LOAD_TIME_MAX: 3000,     // milliseconds  
  MEMORY_MAX: 200,         // MB
  BUNDLE_SIZE_IOS_MAX: 50, // MB
  BUNDLE_SIZE_ANDROID_MAX: 30, // MB
}
```

---

## 12. Security & Data Protection

### 12.1 Save Data Security

#### Save Data Validation
```typescript
// Prevent save game manipulation
export class SaveDataValidator {
  static validateSaveData(saveData: SaveData): boolean {
    // Check reasonable value ranges
    if (saveData.player.cash < 0) return false
    if (saveData.player.valuation > 1e15) return false // Reasonable upper limit
    
    // Validate progression consistency  
    const expectedIP = PrestigeCalculator.calculateInvestorPoints(saveData.player.valuation)
    if (saveData.progression.investorPoints > expectedIP * 1.1) return false
    
    return true
  }
}
```

### 12.2 Client-Side Data Protection

#### Anti-Tampering Measures
```typescript
// Basic client-side protection (not foolproof but deters casual tampering)
export class GameDataProtection {
  private static obfuscate(data: any): string {
    return btoa(JSON.stringify(data))
      .split('')
      .reverse()
      .join('')
  }
  
  private static deobfuscate(data: string): any {
    return JSON.parse(atob(data.split('').reverse().join('')))
  }
  
  static protectedStore<T>(initialValue: T) {
    return observable({
      _data: this.obfuscate(initialValue),
      get value(): T {
        return this.deobfuscate(this._data)
      },
      set value(newValue: T) {
        this._data = this.obfuscate(newValue)
      }
    })
  }
}
```

---

## Summary

This technical requirements document provides the complete architecture specification for PetSoft Tycoon using:

1. **✅ Correct Architecture:** Vertical slicing with per-feature stores
2. **✅ Modern Stack:** React Native 0.76+ + Expo SDK 52+ + Legend State 3.0
3. **✅ Performance First:** 60 FPS, <50ms response, <3s load times
4. **✅ Cross-Platform:** iOS/Android/Web with platform-specific optimizations
5. **✅ Production Ready:** Comprehensive testing, monitoring, and deployment pipeline

**Key Architectural Requirements:**
- Use `features/{name}/state/store.ts` pattern (NOT centralized stores)
- Use `app/` directory for Expo Router (NOT `src/` directory)  
- Use Legend State observables for reactive state management
- Implement vertical slicing for independent feature development
- Follow PRD specifications exactly for game mechanics and progression

This document serves as the definitive technical specification for implementing PetSoft Tycoon according to modern React Native best practices and the specific requirements outlined in the PRD.