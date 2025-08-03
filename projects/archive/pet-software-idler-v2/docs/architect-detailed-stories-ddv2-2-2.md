# Pet Software Idler - Detailed Technical Implementation Stories

## Tech Stack Overview
- **Framework**: React Native with Expo (SDK 52+)
- **State Management**: Legend State v3
- **Data Fetching**: TanStack Query v5 (for future API integration)
- **Language**: TypeScript with strict mode
- **Persistence**: Legend State sync with AsyncStorage/MMKV
- **Build Tool**: Expo with EAS Build
- **Architecture**: Component-based with SOLID principles

## Project Setup and Foundation

### Technical Story 1: Initialize Expo Project with TypeScript
**Parent Story**: Core Gameplay Foundation setup
**Complexity**: Low
**Time Estimate**: 2 hours

**Technical Requirements**:
1. Initialize new Expo project with TypeScript template
2. Configure strict TypeScript settings
3. Set up project structure following research patterns
4. Configure path aliases for clean imports

**Implementation Steps**:
```bash
# 1. Create project
npx create-expo-app pet-software-idler --template expo-template-blank-typescript

# 2. Navigate to project
cd pet-software-idler

# 3. Install additional dependencies
npx expo install expo-dev-client expo-font expo-splash-screen
npm install @legendapp/state @legendapp/state/react @legendapp/state/persist-plugins/mmkv
npm install react-native-mmkv
npm install @tanstack/react-query
```

**File Structure**:
```
src/
├── components/          # Reusable UI components
│   ├── game/           # Game-specific components
│   ├── ui/             # Generic UI components
│   └── feedback/       # Visual feedback components
├── screens/            # Screen components
├── state/              # Legend State observables
│   ├── gameState.ts    # Main game state
│   ├── persistence.ts  # Save/load logic
│   └── selectors.ts    # Computed values
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── constants/          # Game constants
├── types/              # TypeScript type definitions
└── assets/             # Images, fonts, sounds
```

**tsconfig.json**:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "jsx": "react-native",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/state/*": ["src/state/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/constants/*": ["src/constants/*"]
    }
  },
  "include": ["src/**/*", "App.tsx"],
  "exclude": ["node_modules"]
}
```

**Testing Requirements**:
- Project builds successfully with `npx expo start`
- TypeScript compilation has no errors
- Path aliases work correctly

---

### Technical Story 2: Set Up Legend State Core Game State
**Parent Story**: Story 1 - Basic Code Production
**Complexity**: Medium
**Time Estimate**: 3 hours

**Technical Requirements**:
1. Create main game state observable with Legend State v3
2. Define TypeScript interfaces for all game entities
3. Set up computed values for derived state
4. Implement state persistence with MMKV

**Type Definitions** (`src/types/game.ts`):
```typescript
export interface GameState {
  resources: {
    linesOfCode: number;
    money: number;
    customerLeads: number;
  };
  
  units: {
    developers: {
      junior: number;
      mid: number;
      senior: number;
    };
    sales: {
      rep: number;
      manager: number;
    };
  };
  
  stats: {
    totalLinesWritten: number;
    totalMoneyEarned: number;
    totalFeaturesShipped: number;
    gameStartTime: number;
    lastSaveTime: number;
  };
  
  unlocks: {
    juniorDevUnlocked: boolean;
    salesDepartmentUnlocked: boolean;
    midDevUnlocked: boolean;
    seniorDevUnlocked: boolean;
  };
  
  settings: {
    soundEnabled: boolean;
    particlesEnabled: boolean;
  };
}

export interface ProductionRates {
  linesPerSecond: number;
  leadsPerSecond: number;
  moneyPerSecond: number;
}

export interface UnitCost {
  base: number;
  scaling: number; // 1.15 for all units
}

export interface UnitDefinition {
  id: string;
  name: string;
  cost: UnitCost;
  production: number; // per second
  unlockRequirement?: () => boolean;
}
```

**Game State Implementation** (`src/state/gameState.ts`):
```typescript
import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';
import type { GameState } from '@/types/game';

// Initial state factory
const createInitialState = (): GameState => ({
  resources: {
    linesOfCode: 0,
    money: 0,
    customerLeads: 0,
  },
  units: {
    developers: {
      junior: 0,
      mid: 0,
      senior: 0,
    },
    sales: {
      rep: 0,
      manager: 0,
    },
  },
  stats: {
    totalLinesWritten: 0,
    totalMoneyEarned: 0,
    totalFeaturesShipped: 0,
    gameStartTime: Date.now(),
    lastSaveTime: Date.now(),
  },
  unlocks: {
    juniorDevUnlocked: false,
    salesDepartmentUnlocked: false,
    midDevUnlocked: false,
    seniorDevUnlocked: false,
  },
  settings: {
    soundEnabled: true,
    particlesEnabled: true,
  },
});

// Create the main game state observable
export const gameState$ = observable<GameState>(createInitialState());

// Set up persistence
syncObservable(gameState$, {
  persist: {
    name: 'pet-software-idler-save',
    plugin: ObservablePersistMMKV,
  },
});

// Computed values using Legend State v3 lazy evaluation
export const productionRates$ = observable(() => {
  const devs = gameState$.units.developers.get();
  const sales = gameState$.units.sales.get();
  
  return {
    linesPerSecond: 
      devs.junior * 0.1 + 
      devs.mid * 0.5 + 
      devs.senior * 2.5,
    leadsPerSecond:
      sales.rep * 0.2 +
      sales.manager * 1.0,
    moneyPerSecond: 0, // Calculated based on features + leads
  };
});

// Helper functions for state mutations
export const gameActions = {
  addLinesOfCode: (amount: number) => {
    gameState$.resources.linesOfCode.set(current => current + amount);
    gameState$.stats.totalLinesWritten.set(current => current + amount);
  },
  
  addMoney: (amount: number) => {
    gameState$.resources.money.set(current => current + amount);
    gameState$.stats.totalMoneyEarned.set(current => current + amount);
  },
  
  purchaseUnit: (unitType: 'developers' | 'sales', unitTier: string) => {
    const unitPath = gameState$.units[unitType][unitTier];
    unitPath.set(current => current + 1);
  },
  
  resetGame: () => {
    gameState$.set(createInitialState());
  },
};
```

**Persistence Setup** (`src/state/persistence.ts`):
```typescript
import { gameState$ } from './gameState';
import { batch } from '@legendapp/state';

// Auto-save every 30 seconds
export const startAutoSave = () => {
  const interval = setInterval(() => {
    saveGame();
  }, 30000);
  
  return () => clearInterval(interval);
};

export const saveGame = () => {
  batch(() => {
    gameState$.stats.lastSaveTime.set(Date.now());
  });
  // Legend State automatically persists with MMKV
};

// Calculate offline progress
export const calculateOfflineProgress = () => {
  const lastSave = gameState$.stats.lastSaveTime.get();
  const now = Date.now();
  const offlineSeconds = Math.min((now - lastSave) / 1000, 12 * 60 * 60); // Cap at 12 hours
  
  if (offlineSeconds > 0) {
    const rates = productionRates$.get();
    
    batch(() => {
      gameState$.resources.linesOfCode.set(current => 
        current + (rates.linesPerSecond * offlineSeconds)
      );
      gameState$.resources.customerLeads.set(current =>
        current + (rates.leadsPerSecond * offlineSeconds)
      );
    });
    
    return {
      timeOffline: offlineSeconds,
      linesEarned: rates.linesPerSecond * offlineSeconds,
      leadsEarned: rates.leadsPerSecond * offlineSeconds,
    };
  }
  
  return null;
};
```

**Testing Requirements**:
- State mutations work correctly
- Persistence saves and loads data
- Computed values update automatically
- Offline progress calculates correctly

---

### Technical Story 3: Implement Click Button Component
**Parent Story**: Story 1 - Basic Code Production
**Complexity**: Low
**Time Estimate**: 2 hours

**Technical Requirements**:
1. Create reusable game button component
2. Implement touch feedback and animations
3. Add sound effect support
4. Handle rapid clicking properly

**Game Button Component** (`src/components/game/GameButton.tsx`):
```typescript
import React, { useCallback, useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Audio } from 'expo-av';
import { gameState$ } from '@/state/gameState';
import { use$ } from '@legendapp/state/react';

interface GameButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  soundEffect?: string;
  cooldown?: number; // milliseconds
  disabled?: boolean;
  particleEffect?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  soundEffect,
  cooldown = 0,
  disabled = false,
  particleEffect = false,
}) => {
  const soundEnabled = use$(gameState$.settings.soundEnabled);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastPress = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Preload sound effect
  React.useEffect(() => {
    if (soundEffect && soundEnabled) {
      const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
          require(`@/assets/sounds/${soundEffect}`)
        );
        soundRef.current = sound;
      };
      loadSound();
      
      return () => {
        soundRef.current?.unloadAsync();
      };
    }
  }, [soundEffect, soundEnabled]);
  
  const handlePress = useCallback(async () => {
    const now = Date.now();
    if (cooldown > 0 && now - lastPress.current < cooldown) {
      return;
    }
    lastPress.current = now;
    
    // Visual feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Play sound effect
    if (soundEnabled && soundRef.current) {
      try {
        await soundRef.current.replayAsync();
      } catch (error) {
        console.warn('Failed to play sound:', error);
      }
    }
    
    // Trigger the action
    onPress();
    
    // Particle effect would be triggered here
    if (particleEffect) {
      // Emit particle event
    }
  }, [onPress, cooldown, soundEnabled, scaleAnim, particleEffect]);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
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
});
```

**Write Code Button Implementation** (`src/components/game/WriteCodeButton.tsx`):
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GameButton } from './GameButton';
import { gameActions } from '@/state/gameState';
import { FloatingNumber } from '@/components/feedback/FloatingNumber';

export const WriteCodeButton: React.FC = () => {
  const [showFloatingNumber, setShowFloatingNumber] = React.useState(false);
  
  const handleCodeWrite = () => {
    gameActions.addLinesOfCode(1);
    
    // Trigger floating number animation
    setShowFloatingNumber(true);
    setTimeout(() => setShowFloatingNumber(false), 1000);
  };
  
  return (
    <View style={styles.container}>
      <GameButton
        title="Write Code"
        onPress={handleCodeWrite}
        soundEffect="click.mp3"
        particleEffect={true}
        style={styles.button}
      />
      {showFloatingNumber && (
        <FloatingNumber 
          value="+1" 
          style={styles.floatingNumber}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  floatingNumber: {
    position: 'absolute',
    top: -20,
  },
});
```

**Testing Requirements**:
- Button responds to touches with visual feedback
- Sound plays when enabled
- Rapid clicking is handled properly
- Animations are smooth

---

### Technical Story 4: Create Resource Display Component
**Parent Story**: Story 1 - Basic Code Production
**Complexity**: Low
**Time Estimate**: 2 hours

**Technical Requirements**:
1. Display current resources (lines of code, money, leads)
2. Format large numbers appropriately (K, M, B)
3. Update in real-time using Legend State
4. Animate value changes

**Number Formatting Utility** (`src/utils/formatters.ts`):
```typescript
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return Math.floor(num).toString();
  } else if (num < 1_000_000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1_000_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num < 1_000_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  } else {
    return (num / 1_000_000_000_000).toFixed(1) + 'T';
  }
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
```

**Resource Display Component** (`src/components/game/ResourceDisplay.tsx`):
```typescript
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { gameState$ } from '@/state/gameState';
import { formatNumber } from '@/utils/formatters';

interface ResourceItemProps {
  label: string;
  value: number;
  icon?: string;
  color?: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  label, 
  value, 
  icon, 
  color = '#333' 
}) => {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const previousValue = useRef(value);
  
  useEffect(() => {
    if (value !== previousValue.current) {
      // Animate value change
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 300,
        useNativeDriver: false,
      }).start();
      previousValue.current = value;
    }
  }, [value, animatedValue]);
  
  return (
    <View style={styles.resourceItem}>
      <Text style={[styles.resourceLabel, { color }]}>{label}</Text>
      <Animated.Text style={[styles.resourceValue, { color }]}>
        {animatedValue.interpolate({
          inputRange: [0, value],
          outputRange: ['0', formatNumber(value)],
        })}
      </Animated.Text>
    </View>
  );
};

export const ResourceDisplay: React.FC = () => {
  const linesOfCode = use$(gameState$.resources.linesOfCode);
  const money = use$(gameState$.resources.money);
  const customerLeads = use$(gameState$.resources.customerLeads);
  const salesUnlocked = use$(gameState$.unlocks.salesDepartmentUnlocked);
  
  return (
    <View style={styles.container}>
      <ResourceItem 
        label="Lines of Code" 
        value={linesOfCode} 
        color="#2196F3"
      />
      
      {money > 0 && (
        <ResourceItem 
          label="Money" 
          value={money} 
          color="#4CAF50"
        />
      )}
      
      {salesUnlocked && (
        <ResourceItem 
          label="Customer Leads" 
          value={customerLeads} 
          color="#FF9800"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resourceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

**Testing Requirements**:
- Resources display correctly
- Numbers format properly at different scales
- Values update in real-time
- Hidden resources don't show until unlocked

---

### Technical Story 5: Implement Junior Developer Automation
**Parent Story**: Story 2 - First Automation - Junior Developer
**Complexity**: Medium
**Time Estimate**: 4 hours

**Technical Requirements**:
1. Create unit purchase system with cost scaling
2. Implement automatic resource generation
3. Add hire button that appears after conditions met
4. Create developer sprite animation component

**Unit Constants** (`src/constants/units.ts`):
```typescript
import type { UnitDefinition } from '@/types/game';

export const DEVELOPER_UNITS: Record<string, UnitDefinition> = {
  junior: {
    id: 'junior',
    name: 'Junior Developer',
    cost: {
      base: 10,
      scaling: 1.15,
    },
    production: 0.1, // lines per second
    unlockRequirement: () => true, // Always available
  },
  mid: {
    id: 'mid',
    name: 'Mid Developer',
    cost: {
      base: 100,
      scaling: 1.15,
    },
    production: 0.5,
    unlockRequirement: () => gameState$.units.developers.junior.get() >= 3,
  },
  senior: {
    id: 'senior',
    name: 'Senior Developer',
    cost: {
      base: 1000,
      scaling: 1.15,
    },
    production: 2.5,
    unlockRequirement: () => gameState$.units.developers.mid.get() >= 2,
  },
};

export const SALES_UNITS: Record<string, UnitDefinition> = {
  rep: {
    id: 'rep',
    name: 'Sales Rep',
    cost: {
      base: 100,
      scaling: 1.15,
    },
    production: 0.2, // leads per second
    unlockRequirement: () => gameState$.stats.totalMoneyEarned.get() >= 500,
  },
  manager: {
    id: 'manager',
    name: 'Sales Manager',
    cost: {
      base: 1000,
      scaling: 1.15,
    },
    production: 1.0,
    unlockRequirement: () => gameState$.units.sales.rep.get() >= 3,
  },
};
```

**Cost Calculation Hook** (`src/hooks/useUnitCost.ts`):
```typescript
import { use$ } from '@legendapp/state/react';
import { gameState$ } from '@/state/gameState';
import type { UnitDefinition } from '@/types/game';

export const useUnitCost = (
  unitType: 'developers' | 'sales',
  unitTier: string,
  unitDef: UnitDefinition
): number => {
  const owned = use$(gameState$.units[unitType][unitTier]);
  
  // Cost = Base * (Scaling ^ Owned)
  return Math.floor(unitDef.cost.base * Math.pow(unitDef.cost.scaling, owned));
};
```

**Unit Purchase Component** (`src/components/game/UnitPurchase.tsx`):
```typescript
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { batch } from '@legendapp/state';
import { gameState$, gameActions } from '@/state/gameState';
import { GameButton } from './GameButton';
import { useUnitCost } from '@/hooks/useUnitCost';
import { formatNumber } from '@/utils/formatters';
import type { UnitDefinition } from '@/types/game';

interface UnitPurchaseProps {
  unitType: 'developers' | 'sales';
  unitTier: string;
  unitDef: UnitDefinition;
}

export const UnitPurchase: React.FC<UnitPurchaseProps> = ({
  unitType,
  unitTier,
  unitDef,
}) => {
  const money = use$(gameState$.resources.money);
  const owned = use$(gameState$.units[unitType][unitTier]);
  const cost = useUnitCost(unitType, unitTier, unitDef);
  
  const canAfford = money >= cost;
  const meetsRequirement = useMemo(
    () => !unitDef.unlockRequirement || unitDef.unlockRequirement(),
    [unitDef, owned] // Re-evaluate when owned changes
  );
  
  const handlePurchase = () => {
    if (canAfford && meetsRequirement) {
      batch(() => {
        // Deduct cost
        gameState$.resources.money.set(current => current - cost);
        
        // Add unit
        gameActions.purchaseUnit(unitType, unitTier);
        
        // Check for unlocks
        if (unitType === 'developers' && unitTier === 'junior' && owned === 0) {
          gameState$.unlocks.juniorDevUnlocked.set(true);
        }
      });
    }
  };
  
  if (!meetsRequirement) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{unitDef.name}</Text>
        <Text style={styles.owned}>Owned: {owned}</Text>
        <Text style={styles.production}>
          Produces: {formatNumber(unitDef.production)}/sec
        </Text>
      </View>
      
      <GameButton
        title={`Hire ($${formatNumber(cost)})`}
        onPress={handlePurchase}
        disabled={!canAfford}
        soundEffect="purchase.mp3"
        style={[
          styles.button,
          !canAfford && styles.buttonDisabled
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  owned: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  production: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  button: {
    marginLeft: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
```

**Production System Hook** (`src/hooks/useProductionSystem.ts`):
```typescript
import { useEffect, useRef } from 'react';
import { batch } from '@legendapp/state';
import { gameState$, productionRates$ } from '@/state/gameState';

export const useProductionSystem = () => {
  const lastUpdate = useRef(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdate.current) / 1000; // Convert to seconds
      lastUpdate.current = now;
      
      const rates = productionRates$.get();
      
      if (rates.linesPerSecond > 0 || rates.leadsPerSecond > 0) {
        batch(() => {
          // Update resources based on production rates
          if (rates.linesPerSecond > 0) {
            gameState$.resources.linesOfCode.set(current => 
              current + (rates.linesPerSecond * deltaTime)
            );
            gameState$.stats.totalLinesWritten.set(current =>
              current + (rates.linesPerSecond * deltaTime)
            );
          }
          
          if (rates.leadsPerSecond > 0) {
            gameState$.resources.customerLeads.set(current =>
              current + (rates.leadsPerSecond * deltaTime)
            );
          }
        });
      }
    }, 100); // Update 10 times per second for smooth display
    
    return () => clearInterval(interval);
  }, []);
};
```

**Developer Animation Component** (`src/components/game/DeveloperSprite.tsx`):
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface DeveloperSpriteProps {
  type: 'junior' | 'mid' | 'senior';
  isActive: boolean;
}

export const DeveloperSprite: React.FC<DeveloperSpriteProps> = ({
  type,
  isActive,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      // Simple typing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive, animValue]);
  
  const backgroundColor = {
    junior: '#4CAF50',
    mid: '#2196F3',
    senior: '#9C27B0',
  }[type];
  
  return (
    <Animated.View
      style={[
        styles.sprite,
        { backgroundColor },
        {
          transform: [{
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  sprite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
});
```

**Testing Requirements**:
- Junior developer appears after 5 manual clicks
- Cost scaling works correctly
- Production happens automatically
- UI updates smoothly
- Purchase button disables when can't afford

---

### Technical Story 6: Implement Feature Shipping System
**Parent Story**: Story 3 - Feature Shipping System
**Complexity**: Medium
**Time Estimate**: 3 hours

**Technical Requirements**:
1. Create ship feature button that converts code to money
2. Implement conversion logic (10 lines = $15)
3. Show money counter when first money earned
4. Add visual feedback for successful shipment

**Feature Shipping Component** (`src/components/game/FeatureShipping.tsx`):
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { batch } from '@legendapp/state';
import { gameState$, gameActions } from '@/state/gameState';
import { GameButton } from './GameButton';
import { formatNumber } from '@/utils/formatters';

const LINES_PER_FEATURE = 10;
const MONEY_PER_FEATURE = 15;

export const FeatureShipping: React.FC = () => {
  const linesOfCode = use$(gameState$.resources.linesOfCode);
  const juniorDevUnlocked = use$(gameState$.unlocks.juniorDevUnlocked);
  const [shipAnimation] = useState(new Animated.Value(0));
  
  const canShip = linesOfCode >= LINES_PER_FEATURE;
  const featuresAvailable = Math.floor(linesOfCode / LINES_PER_FEATURE);
  
  // Only show after first developer hired
  if (!juniorDevUnlocked) {
    return null;
  }
  
  const handleShipFeature = () => {
    if (canShip) {
      // Animate shipment
      Animated.sequence([
        Animated.timing(shipAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shipAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      batch(() => {
        // Deduct lines of code
        gameState$.resources.linesOfCode.set(current => 
          current - LINES_PER_FEATURE
        );
        
        // Add money
        gameActions.addMoney(MONEY_PER_FEATURE);
        
        // Update stats
        gameState$.stats.totalFeaturesShipped.set(current => current + 1);
      });
    }
  };
  
  const handleShipAll = () => {
    const toShip = featuresAvailable;
    if (toShip > 0) {
      batch(() => {
        gameState$.resources.linesOfCode.set(current => 
          current - (toShip * LINES_PER_FEATURE)
        );
        gameActions.addMoney(toShip * MONEY_PER_FEATURE);
        gameState$.stats.totalFeaturesShipped.set(current => current + toShip);
      });
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{
            translateX: shipAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50],
            }),
          }],
          opacity: shipAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.5, 0],
          }),
        },
      ]}
    >
      <View style={styles.info}>
        <Text style={styles.title}>Ship Features</Text>
        <Text style={styles.conversion}>
          {LINES_PER_FEATURE} lines → ${MONEY_PER_FEATURE}
        </Text>
        <Text style={styles.available}>
          Available: {featuresAvailable} feature{featuresAvailable !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.buttons}>
        <GameButton
          title="Ship Feature"
          onPress={handleShipFeature}
          disabled={!canShip}
          soundEffect="ship.mp3"
          style={[styles.button, !canShip && styles.buttonDisabled]}
        />
        
        {featuresAvailable > 1 && (
          <GameButton
            title={`Ship All (${featuresAvailable})`}
            onPress={handleShipAll}
            soundEffect="ship.mp3"
            style={[styles.button, styles.shipAllButton]}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  info: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  conversion: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  available: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginRight: 5,
  },
  shipAllButton: {
    backgroundColor: '#FF9800',
    marginRight: 0,
    marginLeft: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
```

**Testing Requirements**:
- Ship button appears after first dev hired
- Conversion math is correct
- Money counter shows after first shipment
- Ship all functionality works
- Animation plays on shipment

---

### Technical Story 7: Implement Sales Department
**Parent Story**: Story 4 - Sales Department Unlock
**Complexity**: High
**Time Estimate**: 4 hours

**Technical Requirements**:
1. Unlock sales department at $500 earned
2. Add visual expansion animation
3. Implement lead generation system
4. Create lead-to-revenue conversion logic

**Department Unlock System** (`src/hooks/useDepartmentUnlocks.ts`):
```typescript
import { useEffect } from 'react';
import { batch } from '@legendapp/state';
import { gameState$ } from '@/state/gameState';

export const useDepartmentUnlocks = () => {
  useEffect(() => {
    // Check for department unlocks
    const unsubscribe = gameState$.stats.totalMoneyEarned.onChange((value) => {
      batch(() => {
        // Sales department unlock
        if (value >= 500 && !gameState$.unlocks.salesDepartmentUnlocked.get()) {
          gameState$.unlocks.salesDepartmentUnlocked.set(true);
          // Trigger unlock animation/notification
        }
        
        // Mid developer unlock
        if (value >= 1000 && !gameState$.unlocks.midDevUnlocked.get()) {
          gameState$.unlocks.midDevUnlocked.set(true);
        }
        
        // Senior developer unlock
        if (value >= 10000 && !gameState$.unlocks.seniorDevUnlocked.get()) {
          gameState$.unlocks.seniorDevUnlocked.set(true);
        }
      });
    });
    
    return () => unsubscribe();
  }, []);
};
```

**Sales Department Component** (`src/components/game/SalesDepartment.tsx`):
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { gameState$ } from '@/state/gameState';
import { UnitPurchase } from './UnitPurchase';
import { SALES_UNITS } from '@/constants/units';

export const SalesDepartment: React.FC = () => {
  const salesUnlocked = use$(gameState$.unlocks.salesDepartmentUnlocked);
  const expandAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (salesUnlocked) {
      Animated.spring(expandAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [salesUnlocked, expandAnim]);
  
  if (!salesUnlocked) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: expandAnim,
          transform: [{
            scale: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sales Department</Text>
        <Text style={styles.subtitle}>Convert leads to revenue!</Text>
      </View>
      
      <UnitPurchase
        unitType="sales"
        unitTier="rep"
        unitDef={SALES_UNITS.rep}
      />
      
      {gameState$.units.sales.rep.get() >= 3 && (
        <UnitPurchase
          unitType="sales"
          unitTier="manager"
          unitDef={SALES_UNITS.manager}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
```

**Lead Conversion System** (`src/components/game/LeadConversion.tsx`):
```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { batch } from '@legendapp/state';
import { gameState$, gameActions, productionRates$ } from '@/state/gameState';
import { formatNumber } from '@/utils/formatters';

const LEAD_CONVERSION_RATE = 50; // $50 per lead + feature

export const LeadConversion: React.FC = () => {
  const leads = use$(gameState$.resources.customerLeads);
  const linesOfCode = use$(gameState$.resources.linesOfCode);
  const leadsPerSecond = use$(productionRates$.leadsPerSecond);
  
  // Auto-convert leads when both resources available
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLeads = gameState$.resources.customerLeads.get();
      const currentLines = gameState$.resources.linesOfCode.get();
      
      if (currentLeads >= 1 && currentLines >= 10) {
        const conversions = Math.min(
          Math.floor(currentLeads),
          Math.floor(currentLines / 10)
        );
        
        if (conversions > 0) {
          batch(() => {
            gameState$.resources.customerLeads.set(current => 
              current - conversions
            );
            gameState$.resources.linesOfCode.set(current =>
              current - (conversions * 10)
            );
            gameActions.addMoney(conversions * LEAD_CONVERSION_RATE);
          });
        }
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, []);
  
  if (!gameState$.unlocks.salesDepartmentUnlocked.get()) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lead Conversion</Text>
      <Text style={styles.info}>
        1 Lead + 1 Feature = ${LEAD_CONVERSION_RATE}
      </Text>
      <Text style={styles.rate}>
        Generating {formatNumber(leadsPerSecond)} leads/sec
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  rate: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
});
```

**Testing Requirements**:
- Sales department unlocks at $500
- Visual expansion animation plays
- Sales reps generate leads correctly
- Lead conversion happens automatically
- Conversion rate is correct

---

### Technical Story 8: Implement Save System
**Parent Story**: Story 8 - Save System
**Complexity**: Medium
**Time Estimate**: 3 hours

**Technical Requirements**:
1. Auto-save every 30 seconds
2. Manual save button
3. Visual save indicator
4. Handle save errors gracefully

**Save Indicator Component** (`src/components/ui/SaveIndicator.tsx`):
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { gameState$ } from '@/state/gameState';
import { formatTime } from '@/utils/formatters';

export const SaveIndicator: React.FC = () => {
  const lastSaveTime = use$(gameState$.stats.lastSaveTime);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [timeSinceLastSave, setTimeSinceLastSave] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceLastSave(
        Math.floor((Date.now() - lastSaveTime) / 1000)
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastSaveTime]);
  
  useEffect(() => {
    // Show save animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [lastSaveTime, fadeAnim]);
  
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.saveNotification,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.saveText}>Game Saved!</Text>
      </Animated.View>
      
      <Text style={styles.timeText}>
        Last save: {formatTime(timeSinceLastSave)} ago
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end',
  },
  saveNotification: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 5,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});
```

**Manual Save Button** (`src/components/ui/ManualSaveButton.tsx`):
```typescript
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { saveGame } from '@/state/persistence';

export const ManualSaveButton: React.FC = () => {
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      await saveGame();
      // Save happens synchronously with Legend State + MMKV
    } catch (error) {
      Alert.alert(
        'Save Failed',
        'Unable to save game. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleSave}
      disabled={saving}
    >
      <Text style={styles.text}>
        {saving ? 'Saving...' : 'Save Game'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    margin: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

**Testing Requirements**:
- Auto-save triggers every 30 seconds
- Manual save works correctly
- Save indicator shows confirmation
- Game state persists across app restarts
- Error handling works properly

---

### Technical Story 9: Implement Offline Progress
**Parent Story**: Story 9 - Offline Progress
**Complexity**: Medium
**Time Estimate**: 3 hours

**Technical Requirements**:
1. Calculate production during offline time
2. Show offline earnings summary
3. Cap at 12 hours maximum
4. Handle edge cases (time manipulation)

**Offline Progress Modal** (`src/components/ui/OfflineProgressModal.tsx`):
```typescript
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { formatNumber, formatTime } from '@/utils/formatters';

interface OfflineProgressModalProps {
  visible: boolean;
  onClose: () => void;
  timeOffline: number;
  linesEarned: number;
  leadsEarned: number;
}

export const OfflineProgressModal: React.FC<OfflineProgressModalProps> = ({
  visible,
  onClose,
  timeOffline,
  linesEarned,
  leadsEarned,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            You were away for {formatTime(timeOffline)}
          </Text>
          
          <View style={styles.earnings}>
            <Text style={styles.earningLabel}>While you were gone:</Text>
            
            {linesEarned > 0 && (
              <Text style={styles.earningItem}>
                +{formatNumber(linesEarned)} Lines of Code
              </Text>
            )}
            
            {leadsEarned > 0 && (
              <Text style={styles.earningItem}>
                +{formatNumber(leadsEarned)} Customer Leads
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  earnings: {
    width: '100%',
    marginBottom: 20,
  },
  earningLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  earningItem: {
    fontSize: 18,
    color: '#4CAF50',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

**App Entry Point with Offline Progress** (`src/hooks/useAppInitialization.ts`):
```typescript
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { calculateOfflineProgress, startAutoSave } from '@/state/persistence';

export const useAppInitialization = () => {
  const [offlineProgress, setOfflineProgress] = useState(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  
  useEffect(() => {
    // Calculate offline progress on app start
    const progress = calculateOfflineProgress();
    if (progress && progress.timeOffline > 10) { // Show if offline > 10 seconds
      setOfflineProgress(progress);
      setShowOfflineModal(true);
    }
    
    // Start auto-save
    const stopAutoSave = startAutoSave();
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        saveGame(); // Save when app goes to background
      } else if (nextAppState === 'active') {
        const progress = calculateOfflineProgress();
        if (progress && progress.timeOffline > 10) {
          setOfflineProgress(progress);
          setShowOfflineModal(true);
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      stopAutoSave();
      subscription.remove();
    };
  }, []);
  
  return {
    offlineProgress,
    showOfflineModal,
    hideOfflineModal: () => setShowOfflineModal(false),
  };
};
```

**Testing Requirements**:
- Offline progress calculates correctly
- Modal shows when returning after time away
- Progress caps at 12 hours
- Handles negative time differences
- Works across app suspensions

---

### Technical Story 10: Implement Achievement System
**Parent Story**: Story 10 - Achievement System
**Complexity**: High
**Time Estimate**: 4 hours

**Technical Requirements**:
1. Define achievement data structure
2. Track progress for each achievement
3. Show unlock notifications
4. Create achievement list UI
5. Persist achievement state

**Achievement Definitions** (`src/constants/achievements.ts`):
```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (state: GameState) => boolean;
  progress?: (state: GameState) => { current: number; target: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_line',
    name: 'Hello World',
    description: 'Write your first line of code',
    icon: '👶',
    requirement: (state) => state.stats.totalLinesWritten >= 1,
  },
  {
    id: 'first_hire',
    name: 'Team Builder',
    description: 'Hire your first developer',
    icon: '👥',
    requirement: (state) => 
      Object.values(state.units.developers).some(count => count > 0),
  },
  {
    id: 'first_thousand',
    name: 'Millionaire',
    description: 'Earn $1,000',
    icon: '💰',
    requirement: (state) => state.stats.totalMoneyEarned >= 1000,
    progress: (state) => ({
      current: state.stats.totalMoneyEarned,
      target: 1000,
    }),
  },
  {
    id: 'hundred_features',
    name: 'Shipping Machine',
    description: 'Ship 100 features',
    icon: '🚀',
    requirement: (state) => state.stats.totalFeaturesShipped >= 100,
    progress: (state) => ({
      current: state.stats.totalFeaturesShipped,
      target: 100,
    }),
  },
  {
    id: 'sales_department',
    name: 'Business Expansion',
    description: 'Unlock the Sales department',
    icon: '💼',
    requirement: (state) => state.unlocks.salesDepartmentUnlocked,
  },
  {
    id: 'full_team',
    name: 'Full Stack',
    description: 'Have at least one of each developer type',
    icon: '🏆',
    requirement: (state) => 
      state.units.developers.junior > 0 &&
      state.units.developers.mid > 0 &&
      state.units.developers.senior > 0,
  },
  {
    id: 'idle_master',
    name: 'Idle Master',
    description: 'Earn $10,000',
    icon: '👑',
    requirement: (state) => state.stats.totalMoneyEarned >= 10000,
    progress: (state) => ({
      current: state.stats.totalMoneyEarned,
      target: 10000,
    }),
  },
  {
    id: 'code_warrior',
    name: 'Code Warrior',
    description: 'Write 100,000 lines of code',
    icon: '⚔️',
    requirement: (state) => state.stats.totalLinesWritten >= 100000,
    progress: (state) => ({
      current: state.stats.totalLinesWritten,
      target: 100000,
    }),
  },
  {
    id: 'sales_force',
    name: 'Sales Force',
    description: 'Have 10 sales representatives',
    icon: '📈',
    requirement: (state) => state.units.sales.rep >= 10,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 10 lines per second production',
    icon: '⚡',
    requirement: (state) => productionRates$.linesPerSecond.get() >= 10,
  },
];
```

**Achievement State** (`src/state/achievementState.ts`):
```typescript
import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

interface AchievementState {
  unlocked: Record<string, boolean>;
  unlockedAt: Record<string, number>;
  newUnlocks: string[]; // Queue of achievements to show
}

export const achievementState$ = observable<AchievementState>({
  unlocked: {},
  unlockedAt: {},
  newUnlocks: [],
});

// Persist achievements
syncObservable(achievementState$, {
  persist: {
    name: 'pet-software-idler-achievements',
    plugin: ObservablePersistMMKV,
  },
});
```

**Achievement Tracker Hook** (`src/hooks/useAchievementTracker.ts`):
```typescript
import { useEffect } from 'react';
import { batch } from '@legendapp/state';
import { gameState$ } from '@/state/gameState';
import { achievementState$ } from '@/state/achievementState';
import { ACHIEVEMENTS } from '@/constants/achievements';

export const useAchievementTracker = () => {
  useEffect(() => {
    // Check achievements on state changes
    const unsubscribe = gameState$.onChange(() => {
      const currentState = gameState$.get();
      const unlockedAchievements = achievementState$.unlocked.get();
      
      batch(() => {
        ACHIEVEMENTS.forEach(achievement => {
          if (!unlockedAchievements[achievement.id] && 
              achievement.requirement(currentState)) {
            // Unlock achievement
            achievementState$.unlocked[achievement.id].set(true);
            achievementState$.unlockedAt[achievement.id].set(Date.now());
            achievementState$.newUnlocks.push(achievement.id);
          }
        });
      });
    });
    
    return () => unsubscribe();
  }, []);
};
```

**Achievement Notification** (`src/components/ui/AchievementNotification.tsx`):
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { achievementState$ } from '@/state/achievementState';
import { ACHIEVEMENTS } from '@/constants/achievements';

export const AchievementNotification: React.FC = () => {
  const newUnlocks = use$(achievementState$.newUnlocks);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const slideAnim = useState(new Animated.Value(-100))[0];
  
  useEffect(() => {
    if (newUnlocks.length > 0 && !currentAchievement) {
      const achievementId = newUnlocks[0];
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      
      if (achievement) {
        setCurrentAchievement(achievement);
        
        // Show notification
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Remove from queue
          achievementState$.newUnlocks.set(current => current.slice(1));
          setCurrentAchievement(null);
        });
      }
    }
  }, [newUnlocks, currentAchievement, slideAnim]);
  
  if (!currentAchievement) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.notification,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={styles.icon}>{currentAchievement.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Achievement Unlocked!</Text>
        <Text style={styles.name}>{currentAchievement.name}</Text>
        <Text style={styles.description}>{currentAchievement.description}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    fontSize: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
});
```

**Testing Requirements**:
- Achievements unlock at correct thresholds
- Notifications show when unlocked
- Progress tracking works correctly
- Achievement list displays properly
- State persists across sessions

---

### Technical Story 11: Implement Visual Feedback System
**Parent Story**: Story 11 - Visual Feedback System
**Complexity**: Medium
**Time Estimate**: 4 hours

**Technical Requirements**:
1. Create floating number component
2. Implement particle effects
3. Add progress bar animations
4. Create screen shake for big numbers

**Floating Number Component** (`src/components/feedback/FloatingNumber.tsx`):
```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface FloatingNumberProps {
  value: string;
  style?: any;
  color?: string;
  duration?: number;
}

export const FloatingNumber: React.FC<FloatingNumberProps> = ({
  value,
  style,
  color = '#4CAF50',
  duration = 1000,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration]);
  
  return (
    <Animated.Text
      style={[
        styles.text,
        style,
        {
          color,
          opacity: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          }),
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50],
              }),
            },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.2, 0.8],
              }),
            },
          ],
        },
      ]}
    >
      {value}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
  },
});
```

**Particle System** (`src/components/feedback/ParticleSystem.tsx`):
```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface ParticleSystemProps {
  active: boolean;
  particleCount?: number;
  colors?: string[];
  origin: { x: number; y: number };
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  active,
  particleCount = 10,
  colors = ['#FFD700', '#FFA500', '#FF6347'],
  origin,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particle: Particle = {
          id: Date.now() + i,
          x: new Animated.Value(0),
          y: new Animated.Value(0),
          opacity: new Animated.Value(1),
          scale: new Animated.Value(0),
        };
        
        // Random direction
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const velocity = 100 + Math.random() * 50;
        
        // Animate particle
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * velocity,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * velocity,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
        
        newParticles.push(particle);
      }
      
      setParticles(newParticles);
      
      // Clean up after animation
      setTimeout(() => {
        setParticles([]);
      }, 1000);
    }
  }, [active, particleCount]);
  
  return (
    <View style={[styles.container, { left: origin.x, top: origin.y }]}>
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: colors[index % colors.length],
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
```

**Progress Bar Component** (`src/components/ui/AnimatedProgressBar.tsx`):
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  label,
  height = 20,
  color = '#4CAF50',
  backgroundColor = '#e0e0e0',
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      friction: 10,
      tension: 20,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);
  
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.background, { backgroundColor }]} />
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
```

**Screen Shake Effect** (`src/hooks/useScreenShake.ts`):
```typescript
import { useRef } from 'react';
import { Animated } from 'react-native';

export const useScreenShake = () => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  const triggerShake = (intensity: number = 10, duration: number = 500) => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  return {
    shakeAnimation,
    triggerShake,
    shakeStyle: {
      transform: [{
        translateX: shakeAnimation,
      }],
    },
  };
};
```

**Testing Requirements**:
- Floating numbers appear and animate correctly
- Particle effects trigger on actions
- Progress bars animate smoothly
- Screen shake works for milestones
- Performance remains smooth with multiple effects

---

### Technical Story 12: Main Game Screen Integration
**Parent Story**: Story 16 - Core Loop Validation
**Complexity**: High
**Time Estimate**: 4 hours

**Technical Requirements**:
1. Integrate all components into main game screen
2. Set up proper layout and scrolling
3. Initialize all game systems
4. Handle app lifecycle properly

**Main Game Screen** (`src/screens/GameScreen.tsx`):
```typescript
import React from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { use$ } from '@legendapp/state/react';
import { gameState$ } from '@/state/gameState';

// Components
import { ResourceDisplay } from '@/components/game/ResourceDisplay';
import { WriteCodeButton } from '@/components/game/WriteCodeButton';
import { UnitPurchase } from '@/components/game/UnitPurchase';
import { FeatureShipping } from '@/components/game/FeatureShipping';
import { SalesDepartment } from '@/components/game/SalesDepartment';
import { LeadConversion } from '@/components/game/LeadConversion';
import { SaveIndicator } from '@/components/ui/SaveIndicator';
import { ManualSaveButton } from '@/components/ui/ManualSaveButton';
import { AchievementNotification } from '@/components/ui/AchievementNotification';
import { OfflineProgressModal } from '@/components/ui/OfflineProgressModal';

// Hooks
import { useProductionSystem } from '@/hooks/useProductionSystem';
import { useDepartmentUnlocks } from '@/hooks/useDepartmentUnlocks';
import { useAchievementTracker } from '@/hooks/useAchievementTracker';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useScreenShake } from '@/hooks/useScreenShake';

// Constants
import { DEVELOPER_UNITS } from '@/constants/units';

export const GameScreen: React.FC = () => {
  // Initialize systems
  useProductionSystem();
  useDepartmentUnlocks();
  useAchievementTracker();
  
  const { 
    offlineProgress, 
    showOfflineModal, 
    hideOfflineModal 
  } = useAppInitialization();
  
  const { shakeStyle, triggerShake } = useScreenShake();
  
  // State subscriptions
  const totalMoney = use$(gameState$.stats.totalMoneyEarned);
  const juniorDevUnlocked = use$(gameState$.unlocks.juniorDevUnlocked);
  
  // Trigger shake on major milestones
  React.useEffect(() => {
    if (totalMoney >= 1000 && totalMoney < 1100) {
      triggerShake(15, 600);
    }
  }, [totalMoney, triggerShake]);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Fixed header */}
      <View style={styles.header}>
        <ResourceDisplay />
        <SaveIndicator />
      </View>
      
      {/* Scrollable content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={shakeStyle}>
          {/* Core gameplay */}
          <View style={styles.section}>
            <WriteCodeButton />
          </View>
          
          {/* Feature shipping */}
          <FeatureShipping />
          
          {/* Development team */}
          <View style={styles.section}>
            <UnitPurchase
              unitType="developers"
              unitTier="junior"
              unitDef={DEVELOPER_UNITS.junior}
            />
            
            {juniorDevUnlocked && gameState$.units.developers.junior.get() >= 3 && (
              <UnitPurchase
                unitType="developers"
                unitTier="mid"
                unitDef={DEVELOPER_UNITS.mid}
              />
            )}
            
            {gameState$.units.developers.mid.get() >= 2 && (
              <UnitPurchase
                unitType="developers"
                unitTier="senior"
                unitDef={DEVELOPER_UNITS.senior}
              />
            )}
          </View>
          
          {/* Sales department */}
          <SalesDepartment />
          <LeadConversion />
          
          {/* Settings */}
          <View style={styles.section}>
            <ManualSaveButton />
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Overlays */}
      <AchievementNotification />
      
      {offlineProgress && (
        <OfflineProgressModal
          visible={showOfflineModal}
          onClose={hideOfflineModal}
          timeOffline={offlineProgress.timeOffline}
          linesEarned={offlineProgress.linesEarned}
          leadsEarned={offlineProgress.leadsEarned}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginVertical: 10,
  },
});
```

**App Entry Point** (`App.tsx`):
```typescript
import React from 'react';
import { GameScreen } from '@/screens/GameScreen';
import { enableLegendStateReact } from '@legendapp/state/react';

// Enable Legend State React integration
if (__DEV__) {
  enableLegendStateReact();
}

export default function App() {
  return <GameScreen />;
}
```

**Testing Requirements**:
- All components render correctly
- State updates propagate properly
- Performance remains smooth
- Offline progress works
- Achievements unlock correctly

---

## Performance Optimization Guidelines

### Legend State Best Practices
1. Use `batch()` for multiple state updates
2. Leverage computed observables for derived state
3. Use `peek()` for non-reactive access
4. Avoid creating observables in render

### React Native Optimization
1. Use `FlatList` for long lists (future expansion)
2. Implement `memo` for expensive components
3. Use `useCallback` and `useMemo` appropriately
4. Optimize images and assets

### Expo Specific
1. Use `expo-splash-screen` for smooth loading
2. Optimize bundle size with tree shaking
3. Use `expo-updates` for OTA updates
4. Profile with React DevTools

## Additional Technical Notes

### Missing Information Needed
1. **Audio Assets**: Need sound effect files for clicks, purchases, achievements
2. **Visual Assets**: Developer sprites, icons, backgrounds
3. **Exact Formulas**: Specific balance numbers for later game progression
4. **Platform Features**: Details on conference events and monetization
5. **Analytics Integration**: Which analytics service to use

### Architecture Decisions Made
1. **State Management**: Legend State v3 chosen for performance and persistence
2. **Component Structure**: Atomic design with clear separation
3. **Persistence**: MMKV for fast native storage
4. **TypeScript**: Strict mode for better developer experience
5. **Testing**: Component-level testing with React Native Testing Library

### Future Considerations
1. **Monetization**: TanStack Query ready for API integration
2. **Cloud Saves**: Can add Supabase integration later
3. **Multiplayer**: Architecture supports adding real-time features
4. **Platform Expansion**: Code structure supports adding web version

This detailed technical backlog provides junior developers with clear, implementable stories that follow the established tech stack and best practices from the research. Each story includes specific code examples, file structures, and testing requirements to ensure successful implementation.