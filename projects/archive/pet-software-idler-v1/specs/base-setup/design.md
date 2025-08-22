# Design Document

## Overview

This technical design establishes a React Native idle game architecture using Expo SDK 51+ with the tabs template, Legend-State v3 @beta for fine-grained reactive state management with MMKV persistence, and Expo Router for type-safe navigation. The architecture prioritizes <50ms input response, 60fps animations, and efficient game loop calculations while maintaining a vertical feature slice organization that enables rapid iteration on PetSoft Tycoon's department-based gameplay.

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                   PetSoft Tycoon App                      │
├─────────────────────────────────────────────────────────┤
│                  Expo Router (Tabs)                       │
│              app/(tabs)/ Navigation Structure             │
├─────────────────────────────────────────────────────────┤
│                   Feature Slices                          │
│     Development | Sales | CX | Product | Design | QA      │
├─────────────────────────────────────────────────────────┤
│                 Shared Game Systems                       │
│          Game Loop | Resources | Visual Feedback          │
├─────────────────────────────────────────────────────────┤
│              Legend-State v3 + MMKV                       │
│         Reactive State with Auto-Persistence              │
├─────────────────────────────────────────────────────────┤
│                    Platform Layer                         │
│             iOS | Android | Web (Expo SDK)                │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Tap** → Touch Handler (<50ms response)
2. **State Mutation** → Legend-State observable update
3. **Auto-Persist** → MMKV sync via plugin
4. **React Update** → Fine-grained component re-render
5. **Visual Feedback** → Animation at 60fps
6. **Game Loop** → 100ms tick updates resources

## Components and Interfaces

### Core State Management (Requirement 1.3)
**Purpose**: Reactive game state with automatic MMKV persistence

**Interface**:
```typescript
// src/shared/state/gameState.ts
import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';

// Enable React tracking for optimal re-renders
enableReactTracking({ auto: true });

interface GameState {
  resources: {
    money: number;
    linesOfCode: number;
    features: number;
    customers: number;
    leads: number;
  };
  departments: {
    development: DepartmentState;
    sales: DepartmentState;
    customerExperience: DepartmentState;
    product: DepartmentState;
    design: DepartmentState;
    qa: DepartmentState;
    marketing: DepartmentState;
  };
  stats: {
    totalClicks: number;
    totalMoneyEarned: number;
    playTime: number;
    offlineTime: number;
  };
  settings: {
    soundEnabled: boolean;
    particlesEnabled: boolean;
    numberFormat: 'short' | 'scientific' | 'engineering';
  };
}

interface DepartmentState {
  unlocked: boolean;
  units: {
    tier1: { count: number; production: number };
    tier2: { count: number; production: number };
    tier3: { count: number; production: number };
    tier4: { count: number; production: number };
  };
  upgrades: Record<string, boolean>;
  totalProduction: number;
}

// Create observable with correct v3 API
export const gameState$ = observable<GameState>({
  resources: {
    money: 0,
    linesOfCode: 0,
    features: 0,
    customers: 0,
    leads: 0
  },
  departments: {
    development: createDepartmentState(),
    sales: createDepartmentState(),
    customerExperience: createDepartmentState(),
    product: createDepartmentState(),
    design: createDepartmentState(),
    qa: createDepartmentState(),
    marketing: createDepartmentState()
  },
  stats: {
    totalClicks: 0,
    totalMoneyEarned: 0,
    playTime: 0,
    offlineTime: 0
  },
  settings: {
    soundEnabled: true,
    particlesEnabled: true,
    numberFormat: 'short'
  }
});

// Configure MMKV persistence with v3 sync API
syncObservable(gameState$, {
  persist: {
    name: 'gameState',
    plugin: ObservablePersistMMKV
  }
});

function createDepartmentState(): DepartmentState {
  return {
    unlocked: false,
    units: {
      tier1: { count: 0, production: 0 },
      tier2: { count: 0, production: 0 },
      tier3: { count: 0, production: 0 },
      tier4: { count: 0, production: 0 }
    },
    upgrades: {},
    totalProduction: 0
  };
}
```

**Implementation Notes**:
- Use `gameState$.resources.money.set()` for mutations
- Use `gameState$.resources.money.get()` for reading
- Components use `observer()` HOC or `useSelector()` for reactivity
- MMKV handles persistence automatically on state changes

### Navigation Structure (Requirement 1.2)
**Purpose**: Tab-based navigation with Expo Router

**Interface**:
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Company',
          tabBarIcon: ({ color }) => <Ionicons name="business" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="departments" 
        options={{ 
          title: 'Departments',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="upgrades" 
        options={{ 
          title: 'Upgrades',
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="prestige" 
        options={{ 
          title: 'Investors',
          tabBarIcon: ({ color }) => <Ionicons name="rocket" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
```

### First Click Response (Requirement 1.1)
**Purpose**: Instant feedback for primary game action

**Interface**:
```typescript
// src/features/development/WriteCodeButton.tsx
import { observer } from '@legendapp/state/react';
import { Pressable, Text, Animated } from 'react-native';
import { gameState$ } from '@/shared/state/gameState';
import { hapticFeedback } from '@/shared/utils/haptics';
import { createNumberPopup } from '@/shared/visual/numberPopup';

export const WriteCodeButton = observer(() => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = useCallback(() => {
    // Immediate visual feedback (< 50ms)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();
    
    // Haptic feedback (iOS/Android)
    hapticFeedback('impact');
    
    // Update state
    const currentLines = gameState$.resources.linesOfCode.get();
    const increment = calculateCodeIncrement();
    gameState$.resources.linesOfCode.set(currentLines + increment);
    gameState$.stats.totalClicks.set(gameState$.stats.totalClicks.get() + 1);
    
    // Visual feedback
    createNumberPopup(`+${increment}`, 'code');
  }, [scaleAnim]);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable 
        onPress={handlePress}
        style={styles.button}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <Text style={styles.buttonText}>WRITE CODE</Text>
      </Pressable>
    </Animated.View>
  );
});
```

### Game Loop Foundation (Requirement 1.5)
**Purpose**: Consistent resource generation at 100ms intervals

**Interface**:
```typescript
// src/shared/gameLoop/gameLoop.ts
import { gameState$ } from '@/shared/state/gameState';

let gameLoopInterval: NodeJS.Timeout | null = null;
let lastUpdateTime = Date.now();

export function startGameLoop() {
  if (gameLoopInterval) return;
  
  gameLoopInterval = setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = now;
    
    // Update each department's production
    updateDepartmentProduction('development', deltaTime);
    updateDepartmentProduction('sales', deltaTime);
    // ... other departments
    
    // Process resource conversions
    processResourceConversions(deltaTime);
    
    // Update play time
    const currentPlayTime = gameState$.stats.playTime.get();
    gameState$.stats.playTime.set(currentPlayTime + deltaTime);
    
  }, 100); // 100ms tick rate
}

export function stopGameLoop() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

function updateDepartmentProduction(deptName: string, deltaTime: number) {
  const dept = gameState$.departments[deptName];
  if (!dept.unlocked.get()) return;
  
  const production = dept.totalProduction.get();
  if (production > 0) {
    const resourceMap = {
      development: 'linesOfCode',
      sales: 'leads',
      // ... mapping for each department
    };
    
    const resourceKey = resourceMap[deptName];
    const current = gameState$.resources[resourceKey].get();
    gameState$.resources[resourceKey].set(current + (production * deltaTime));
  }
}

// Offline progress calculation
export function calculateOfflineProgress(offlineSeconds: number) {
  const maxOfflineHours = 12;
  const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
  
  // Calculate production for each department
  Object.keys(gameState$.departments.get()).forEach(deptName => {
    updateDepartmentProduction(deptName, cappedSeconds);
  });
  
  // Process conversions
  processResourceConversions(cappedSeconds);
  
  // Update offline time stat
  gameState$.stats.offlineTime.set(cappedSeconds);
}
```

### Visual Feedback System (Requirement 1.6)
**Purpose**: Satisfying animations and particle effects

**Interface**:
```typescript
// src/shared/visual/numberPopup.ts
import { Animated, Text } from 'react-native';

interface PopupConfig {
  value: string;
  type: 'money' | 'code' | 'feature' | 'customer';
  x: number;
  y: number;
}

const popupPool: Animated.View[] = [];

export function createNumberPopup(value: string, type: PopupConfig['type']) {
  const config = getPopupStyle(type);
  
  // Get or create animated view from pool
  const popup = popupPool.pop() || createNewPopup();
  
  // Animate
  Animated.parallel([
    Animated.timing(popup.translateY, {
      toValue: -100,
      duration: 1000,
      useNativeDriver: true
    }),
    Animated.timing(popup.opacity, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    })
  ]).start(() => {
    // Return to pool
    resetPopup(popup);
    popupPool.push(popup);
  });
}

// src/shared/visual/particles.ts
export function createMilestoneParticles(type: 'money' | 'unlock' | 'prestige') {
  const particleCount = type === 'prestige' ? 50 : 20;
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(type));
  }
  
  // Animate all particles
  particles.forEach(p => animateParticle(p, type));
}
```

### Vertical Feature Structure (Requirement 1.4)
**Purpose**: Self-contained feature modules

**Folder Structure**:
```
src/
├── features/
│   ├── development/
│   │   ├── DevelopmentScreen.tsx
│   │   ├── WriteCodeButton.tsx
│   │   ├── DeveloperList.tsx
│   │   ├── useDevelopmentProduction.ts
│   │   └── developmentCalculations.ts
│   ├── sales/
│   │   ├── SalesScreen.tsx
│   │   ├── LeadGenerator.tsx
│   │   ├── useSalesConversion.ts
│   │   └── salesCalculations.ts
│   └── [other departments following same pattern]
├── shared/
│   ├── state/
│   │   └── gameState.ts
│   ├── gameLoop/
│   │   └── gameLoop.ts
│   ├── visual/
│   │   ├── numberPopup.ts
│   │   └── particles.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── haptics.ts
│   └── components/
│       ├── Button.tsx
│       └── ResourceDisplay.tsx
└── app/
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── departments.tsx
    │   ├── upgrades.tsx
    │   └── prestige.tsx
    └── _layout.tsx
```

## Data Models

```typescript
// src/shared/types/index.ts
export interface Resource {
  current: number;
  total: number;
  perSecond: number;
}

export interface Unit {
  id: string;
  name: string;
  baseCost: number;
  baseProduction: number;
  count: number;
  currentCost: number;
  currentProduction: number;
}

export interface Department {
  id: string;
  name: string;
  unlocked: boolean;
  unlockCost: number;
  units: Unit[];
  upgrades: Upgrade[];
  resourceType: keyof GameState['resources'];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  effect: () => void;
}
```

## Error Handling

- **State Corruption**: MMKV persistence includes validation and fallback to defaults
- **Rapid Clicks**: Input queue prevents click drops, all inputs processed
- **Performance Degradation**: Game loop throttles automatically under load
- **Offline Progress**: Capped at 12 hours to prevent overflow
- **Animation Overlap**: Object pooling prevents memory leaks from animations

## Testing Strategy

- **Click Response**: Measure time from touch to visual feedback
- **State Persistence**: Verify MMKV saves and restores correctly
- **Game Loop**: Test resource calculations are deterministic
- **Performance**: Monitor FPS during heavy animation loads
- **Offline Progress**: Validate calculations match online progression

## Performance Considerations

- Legend-State v3's fine-grained reactivity minimizes re-renders
- Object pooling for animations prevents garbage collection spikes
- Game loop uses fixed timestep for consistent calculations
- MMKV provides synchronous storage without async overhead
- Lazy loading of department screens via Expo Router

## Security Considerations

- Input validation on all user actions to prevent exploits
- Resource calculations server-side validated (future multiplayer)
- No sensitive data in MMKV storage
- Offline progress capped to prevent time manipulation
- TypeScript strict mode prevents common vulnerabilities