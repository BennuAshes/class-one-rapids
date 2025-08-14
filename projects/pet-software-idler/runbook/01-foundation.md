# Phase 1: Foundation & Project Setup

## Overview

This phase establishes the technical infrastructure for PetSoft Tycoon, including project initialization, core dependencies, and architectural foundation. All subsequent phases build upon this foundation.

**Duration**: 2-3 weeks (2 sprints)  
**Team Size**: 1-2 senior engineers  
**Dependencies**: Analysis phase completion

## Sprint 1: Core Infrastructure (Week 1-2)

### Objectives
- [ ] Initialize Expo project with React Native 0.76+ and new architecture
- [ ] Configure development environment and tooling
- [ ] Set up folder structure following vertical slicing patterns
- [ ] Implement basic state management with Legend State
- [ ] Create save/load system foundation

### Tasks & Implementation

#### Task 1.1: Project Initialization
**Time Estimate**: 4 hours  
**Description**: Create new Expo project with React Native new architecture enabled

```bash
# Prerequisites check
node --version    # Requires Node 18+
npm --version     # Requires npm 8+

# Create new Expo project
npx create-expo-app@latest PetSoftTycoon --template blank-typescript

# Navigate to project
cd PetSoftTycoon

# Install Expo CLI
npm install -g @expo/cli@latest

# Verify Expo setup
npx expo --version
```

**Validation Criteria**:
- [ ] Project created successfully with TypeScript
- [ ] `expo --version` shows latest CLI
- [ ] `npx expo start` launches development server

#### Task 1.2: React Native New Architecture Configuration
**Time Estimate**: 2 hours  
**Description**: Enable React Native 0.76+ new architecture features

```bash
# Update to React Native 0.76+
npm install react-native@0.76.0

# Install required dependencies for new architecture
npm install react-native-reanimated@3.6.0
```

Create `metro.config.js`:
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
};

module.exports = config;
```

Update `app.json`:
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "newArchEnabled": true
          },
          "ios": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}
```

**Validation Criteria**:
- [ ] New architecture flags enabled in build properties
- [ ] Project builds without warnings on Android/iOS
- [ ] Metro bundler resolves @/ alias correctly

#### Task 1.3: Development Environment Setup
**Time Estimate**: 3 hours  
**Description**: Configure linting, formatting, and development tools

```bash
# Install development dependencies
npm install --save-dev \
  @typescript-eslint/eslint-plugin@6.0.0 \
  @typescript-eslint/parser@6.0.0 \
  eslint@8.50.0 \
  eslint-config-expo@7.0.0 \
  prettier@3.0.0 \
  @types/react@18.2.0 \
  @types/react-native@0.72.0
```

Create `.eslintrc.js`:
```javascript
module.exports = {
  extends: ['expo', '@react-native-community'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-const': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
  },
};
```

Create `prettier.config.js`:
```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 80,
};
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx}",
    "type-check": "tsc --noEmit"
  }
}
```

**Validation Criteria**:
- [ ] `npm run lint` runs without errors
- [ ] `npm run format` successfully formats code
- [ ] `npm run type-check` validates TypeScript

#### Task 1.4: Folder Structure Implementation
**Time Estimate**: 2 hours  
**Description**: Create vertical slicing folder structure

```bash
# Create base folder structure
mkdir -p src/{features,shared,app}

# Create feature folders (vertical slices)
mkdir -p src/features/{core,development,sales,customer-exp,product,design,qa,marketing}

# Create feature subfolders for each department
for feature in core development sales customer-exp product design qa marketing; do
  mkdir -p "src/features/$feature"/{state,components,hooks,handlers,validators}
  touch "src/features/$feature/index.ts"
done

# Create shared utilities
mkdir -p src/shared/{ui,audio,persistence,utils,types}

# Create app structure
mkdir -p src/app/{navigation,themes,config}

# Create entry files
touch src/shared/ui/index.ts
touch src/shared/audio/index.ts
touch src/shared/persistence/index.ts
touch src/shared/utils/index.ts
touch src/shared/types/index.ts
touch src/app/App.tsx
```

**Validation Criteria**:
- [ ] All feature folders contain required subfolders
- [ ] Structure matches vertical slicing patterns from research
- [ ] No horizontal layering in folder organization

#### Task 1.5: Legend State Integration
**Time Estimate**: 4 hours  
**Description**: Install and configure Legend State for per-feature state management

```bash
# Install Legend State beta
npm install @legendapp/state@beta
```

Create `src/shared/types/GameState.ts`:
```typescript
// Base resource types
export interface PlayerResources {
  linesOfCode: number;
  money: number;
  features: {
    basic: number;
    advanced: number;
    premium: number;
    enhanced: number;
  };
  leads: number;
  supportTickets: number;
  insights: number;
  experiencePoints: number;
  bugs: number;
  brandValue: number;
}

// Developer types for development department
export type DeveloperType = 'junior' | 'mid' | 'senior' | 'techLead';

export interface DeveloperUnits {
  junior: number;
  mid: number;
  senior: number;
  techLead: number;
}

// Department upgrade types
export interface DepartmentUpgrades {
  betterIdes: boolean;
  pairProgramming: boolean;
  codeReviews: boolean;
}
```

Create `src/features/core/state/playerStore.ts`:
```typescript
import { observable } from '@legendapp/state';
import { PlayerResources } from '@/shared/types/GameState';

// Private observable state
const playerState$ = observable<PlayerResources>({
  linesOfCode: 0,
  money: 0,
  features: { basic: 0, advanced: 0, premium: 0, enhanced: 0 },
  leads: 0,
  supportTickets: 0,
  insights: 0,
  experiencePoints: 0,
  bugs: 0,
  brandValue: 0,
});

// Public interface only - no direct state export
export const usePlayer = () => {
  return {
    // Read-only resource access
    resources: playerState$.get(),
    
    // Resource modification with validation
    modifyResource: <K extends keyof PlayerResources>(
      type: K,
      amount: number | Partial<PlayerResources[K]>
    ) => {
      if (typeof amount === 'number') {
        const currentValue = playerState$[type].get() as number;
        playerState$[type].set(Math.max(0, currentValue + amount));
      } else {
        // Handle object updates for features
        if (type === 'features' && typeof amount === 'object') {
          Object.entries(amount).forEach(([key, value]) => {
            const currentFeatures = playerState$.features.get();
            playerState$.features.set({
              ...currentFeatures,
              [key]: Math.max(0, currentFeatures[key as keyof typeof currentFeatures] + value),
            });
          });
        }
      }
    },
    
    // Get specific resource value
    getResource: <K extends keyof PlayerResources>(type: K): PlayerResources[K] => {
      return playerState$[type].get();
    },
    
    // Reset all resources (for prestige)
    reset: () => {
      playerState$.set({
        linesOfCode: 0,
        money: 0,
        features: { basic: 0, advanced: 0, premium: 0, enhanced: 0 },
        leads: 0,
        supportTickets: 0,
        insights: 0,
        experiencePoints: 0,
        bugs: 0,
        brandValue: 0,
      });
    },
  };
};

// Export observable for save/load operations only
export const playerState = playerState$;
```

**Validation Criteria**:
- [ ] Legend State observable created successfully
- [ ] usePlayer hook provides proper encapsulation
- [ ] No direct state export except for save/load
- [ ] Resource modifications work correctly

#### Task 1.6: Basic Save/Load System
**Time Estimate**: 6 hours  
**Description**: Implement AsyncStorage-based save/load with validation

```bash
# Install AsyncStorage
npm install @react-native-async-storage/async-storage
```

Create `src/shared/persistence/SaveManager.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerResources } from '@/shared/types/GameState';

const SAVE_KEY = 'petsoft_tycoon_save';
const CURRENT_VERSION = '1.0.0';

export interface GameSave {
  version: string;
  timestamp: number;
  playerId: string;
  resources: PlayerResources;
  // Department states will be added in later phases
}

export class SaveManager {
  private static saveInterval: NodeJS.Timeout | null = null;
  
  // Auto-save every 30 seconds
  static startAutoSave(getGameState: () => GameSave): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    this.saveInterval = setInterval(async () => {
      try {
        await this.saveGame(getGameState());
        console.log('Auto-save completed');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000);
  }
  
  static stopAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
  
  static async saveGame(gameState: GameSave): Promise<void> {
    try {
      gameState.version = CURRENT_VERSION;
      gameState.timestamp = Date.now();
      
      const serialized = JSON.stringify(gameState, null, 0);
      await AsyncStorage.setItem(SAVE_KEY, serialized);
    } catch (error) {
      throw new Error(`Save failed: ${error}`);
    }
  }
  
  static async loadGame(): Promise<GameSave | null> {
    try {
      const saved = await AsyncStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      
      const gameState = JSON.parse(saved) as GameSave;
      
      // Basic validation
      if (!gameState.version || !gameState.resources) {
        console.warn('Invalid save file format');
        return null;
      }
      
      return gameState;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }
  
  static async clearSave(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Clear save failed:', error);
    }
  }
}
```

**Validation Criteria**:
- [ ] Save system creates valid JSON files
- [ ] Load system handles missing/corrupted saves
- [ ] Auto-save works without blocking UI
- [ ] Clear save function works correctly

## Sprint 2: Core Game Loop (Week 3-4)

### Objectives
- [ ] Implement main clicking mechanic with audio
- [ ] Create development department (complete vertical slice)
- [ ] Build basic UI components and themes
- [ ] Integrate production calculations and display

### Tasks & Implementation

#### Task 2.1: Audio System Foundation
**Time Estimate**: 4 hours  
**Description**: Set up audio management for game feedback

```bash
# Install Expo AV
npx expo install expo-av
```

Create `src/shared/audio/AudioManager.ts`:
```typescript
import { Audio } from 'expo-av';

export type SoundEffect = 
  | 'click' 
  | 'cash' 
  | 'levelup' 
  | 'notification';

interface SoundConfig {
  volume: number;
  cooldown?: number; // ms
}

export class AudioManager {
  private static sounds: Map<SoundEffect, Audio.Sound> = new Map();
  private static lastPlayed: Map<SoundEffect, number> = new Map();
  private static enabled: boolean = true;
  
  private static soundConfigs: Record<SoundEffect, SoundConfig> = {
    click: { volume: 0.3, cooldown: 50 },
    cash: { volume: 0.5, cooldown: 100 },
    levelup: { volume: 0.7, cooldown: 500 },
    notification: { volume: 0.8, cooldown: 1000 },
  };
  
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // For now, create placeholder sounds (will add actual audio files later)
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
  
  static async playSound(soundType: SoundEffect): Promise<void> {
    if (!this.enabled) return;
    
    const config = this.soundConfigs[soundType];
    const now = Date.now();
    const lastPlayed = this.lastPlayed.get(soundType) || 0;
    
    // Respect cooldown
    if (config.cooldown && now - lastPlayed < config.cooldown) {
      return;
    }
    
    // Log sound (actual sound playback will be added in polish phase)
    console.log(`Playing sound: ${soundType}`);
    this.lastPlayed.set(soundType, now);
  }
  
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
```

**Validation Criteria**:
- [ ] Audio system initializes without errors
- [ ] Sound cooldowns work correctly
- [ ] Sound enable/disable functions properly

#### Task 2.2: Basic UI Components
**Time Estimate**: 6 hours  
**Description**: Create reusable UI components following design system

Create `src/shared/ui/Button.tsx`:
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AudioManager } from '@/shared/audio/AudioManager';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  cost?: number;
  canAfford?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  cost,
  canAfford = true,
}) => {
  const handlePress = () => {
    AudioManager.playSound('click');
    onPress();
  };
  
  const isDisabled = disabled || (cost !== undefined && !canAfford);
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        variant === 'primary' ? styles.primaryText : styles.secondaryText,
        isDisabled && styles.disabledText,
      ]}>
        {title}
        {cost !== undefined && ` ($${cost.toLocaleString()})`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#333333',
  },
  disabledText: {
    color: '#999999',
  },
});
```

Create `src/shared/ui/AnimatedNumber.tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  formatter?: (n: number) => string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  formatter = (n) => n.toLocaleString(),
  duration = 300,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  const [displayText, setDisplayText] = React.useState(formatter(0));
  
  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    });
    
    const listener = animatedValue.addListener(({ value: currentValue }) => {
      displayValue.current = Math.round(currentValue);
      setDisplayText(formatter(displayValue.current));
    });
    
    animation.start();
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);
  
  return <Text style={style}>{displayText}</Text>;
};
```

**Validation Criteria**:
- [ ] Button component handles press events and audio
- [ ] AnimatedNumber smoothly transitions between values
- [ ] Components follow consistent styling patterns

#### Task 2.3: Development Department Implementation
**Time Estimate**: 8 hours  
**Description**: Complete vertical slice for development department

Create `src/features/development/state/developmentStore.ts`:
```typescript
import { observable } from '@legendapp/state';
import { DeveloperUnits, DeveloperType, DepartmentUpgrades } from '@/shared/types/GameState';

interface DevelopmentState {
  developers: DeveloperUnits;
  upgrades: DepartmentUpgrades;
  production: {
    linesPerSecond: number;
    totalProduced: number;
  };
}

const developmentState$ = observable<DevelopmentState>({
  developers: { junior: 0, mid: 0, senior: 0, techLead: 0 },
  upgrades: { betterIdes: false, pairProgramming: false, codeReviews: false },
  production: { linesPerSecond: 0, totalProduced: 0 },
});

// Cost calculations for developers
const getDeveloperCost = (type: DeveloperType, currentCount: number): number => {
  const baseCosts = {
    junior: 50,
    mid: 500,
    senior: 5000,
    techLead: 50000,
  };
  
  return Math.floor(baseCosts[type] * Math.pow(1.15, currentCount));
};

// Production rate calculations
const calculateProductionRate = (developers: DeveloperUnits, upgrades: DepartmentUpgrades): number => {
  const baseRates = {
    junior: 0.1,
    mid: 0.5,
    senior: 2.5,
    techLead: 10.0,
  };
  
  let totalRate = 0;
  Object.entries(developers).forEach(([type, count]) => {
    totalRate += baseRates[type as DeveloperType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.betterIdes) multiplier *= 1.25;
  if (upgrades.pairProgramming) multiplier *= 2.0;
  if (upgrades.codeReviews) multiplier *= 1.5;
  
  // Tech Lead department bonus
  if (developers.techLead > 0) multiplier *= 1.1;
  
  return totalRate * multiplier;
};

export const useDevelopment = () => {
  return {
    // Read-only state access
    developers: developmentState$.developers.get(),
    upgrades: developmentState$.upgrades.get(),
    production: developmentState$.production.get(),
    
    // Actions
    hireDeveloper: (type: DeveloperType, playerMoney: number): boolean => {
      const currentCount = developmentState$.developers[type].get();
      const cost = getDeveloperCost(type, currentCount);
      
      if (playerMoney >= cost) {
        developmentState$.developers[type].set(currentCount + 1);
        
        // Recalculate production
        const newRate = calculateProductionRate(
          developmentState$.developers.get(),
          developmentState$.upgrades.get()
        );
        developmentState$.production.linesPerSecond.set(newRate);
        
        return true;
      }
      
      return false;
    },
    
    getDeveloperCost: (type: DeveloperType): number => {
      const currentCount = developmentState$.developers[type].get();
      return getDeveloperCost(type, currentCount);
    },
    
    updateProduction: (deltaTime: number): number => {
      const rate = developmentState$.production.linesPerSecond.get();
      const production = rate * (deltaTime / 1000);
      
      const currentTotal = developmentState$.production.totalProduced.get();
      developmentState$.production.totalProduced.set(currentTotal + production);
      
      return production;
    },
  };
};

export const developmentState = developmentState$;
```

Create `src/features/development/components/DeveloperList.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDevelopment } from '../state/developmentStore';
import { usePlayer } from '@/features/core/state/playerStore';
import { Button } from '@/shared/ui/Button';
import { DeveloperType } from '@/shared/types/GameState';
import { AudioManager } from '@/shared/audio/AudioManager';

const developerInfo = {
  junior: { name: 'Junior Developer', description: '0.1 lines/sec' },
  mid: { name: 'Mid Developer', description: '0.5 lines/sec' },
  senior: { name: 'Senior Developer', description: '2.5 lines/sec' },
  techLead: { name: 'Tech Lead', description: '10.0 lines/sec + 10% dept bonus' },
};

export const DeveloperList: React.FC = () => {
  const development = useDevelopment();
  const player = usePlayer();
  const { money } = player.resources;
  
  const handleHireDeveloper = (type: DeveloperType) => {
    const cost = development.getDeveloperCost(type);
    const success = development.hireDeveloper(type, money);
    
    if (success) {
      player.modifyResource('money', -cost);
      AudioManager.playSound('levelup');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Development Department</Text>
      <Text style={styles.production}>
        Production: {development.production.linesPerSecond.toFixed(1)} lines/sec
      </Text>
      
      {Object.entries(developerInfo).map(([type, info]) => {
        const developerType = type as DeveloperType;
        const count = development.developers[developerType];
        const cost = development.getDeveloperCost(developerType);
        const canAfford = money >= cost;
        
        return (
          <View key={type} style={styles.developerRow}>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>
                {info.name} ({count})
              </Text>
              <Text style={styles.developerDescription}>
                {info.description}
              </Text>
            </View>
            <Button
              title="Hire"
              onPress={() => handleHireDeveloper(developerType)}
              cost={cost}
              canAfford={canAfford}
              variant={canAfford ? 'primary' : 'secondary'}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  production: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
  developerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  developerInfo: {
    flex: 1,
    marginRight: 12,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  developerDescription: {
    fontSize: 14,
    color: '#666',
  },
});
```

#### Task 2.4: Main Clicking Mechanic
**Time Estimate**: 4 hours  
**Description**: Implement core clicking mechanic with production integration

Create `src/features/core/components/MainClicker.tsx`:
```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayer } from '../state/playerStore';
import { useDevelopment } from '@/features/development/state/developmentStore';
import { Button } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { AudioManager } from '@/shared/audio/AudioManager';

export const MainClicker: React.FC = () => {
  const player = usePlayer();
  const development = useDevelopment();
  const { linesOfCode, money } = player.resources;
  
  // Production loop
  useEffect(() => {
    const interval = setInterval(() => {
      const linesProduced = development.updateProduction(1000);
      if (linesProduced > 0) {
        player.modifyResource('linesOfCode', linesProduced);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = () => {
    player.modifyResource('linesOfCode', 1);
    AudioManager.playSound('click');
  };
  
  const handleConvertToMoney = () => {
    if (linesOfCode >= 10) {
      const money = Math.floor(linesOfCode / 10);
      player.modifyResource('linesOfCode', -money * 10);
      player.modifyResource('money', money);
      AudioManager.playSound('cash');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      
      <View style={styles.resourceDisplay}>
        <View style={styles.resource}>
          <Text style={styles.resourceLabel}>Lines of Code</Text>
          <AnimatedNumber 
            value={linesOfCode} 
            style={styles.resourceValue}
          />
        </View>
        
        <View style={styles.resource}>
          <Text style={styles.resourceLabel}>Money</Text>
          <AnimatedNumber 
            value={money} 
            style={styles.resourceValue}
            formatter={(n) => `$${n.toLocaleString()}`}
          />
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Write Code"
          onPress={handleClick}
          variant="primary"
        />
        
        <Button
          title="Convert to Money"
          onPress={handleConvertToMoney}
          disabled={linesOfCode < 10}
          variant="secondary"
        />
      </View>
      
      <Text style={styles.hint}>
        Production: {development.production.linesPerSecond.toFixed(1)} lines/sec
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  resourceDisplay: {
    marginBottom: 40,
  },
  resource: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resourceLabel: {
    fontSize: 16,
    color: '#666',
  },
  resourceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actions: {
    marginBottom: 30,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
```

#### Task 2.5: App Integration
**Time Estimate**: 3 hours  
**Description**: Integrate all components into main app

Create `src/app/App.tsx`:
```typescript
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { MainClicker } from '@/features/core/components/MainClicker';
import { DeveloperList } from '@/features/development/components/DeveloperList';
import { SaveManager } from '@/shared/persistence/SaveManager';
import { AudioManager } from '@/shared/audio/AudioManager';

export default function App() {
  useEffect(() => {
    // Initialize audio system
    AudioManager.initialize();
    
    // Load saved game state (to be implemented)
    // loadGameState();
    
    // Start auto-save (to be implemented)
    // startAutoSave();
    
    return () => {
      SaveManager.stopAutoSave();
    };
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MainClicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

Update root `App.tsx`:
```typescript
import App from './src/app/App';
export default App;
```

**Validation Criteria**:
- [ ] App launches without errors
- [ ] Clicking increases lines of code
- [ ] Money conversion works correctly
- [ ] Development department displays properly
- [ ] Hiring developers increases production
- [ ] Audio feedback plays on interactions

## Validation & Testing

### Performance Validation
```bash
# Test on development build
npx expo start --dev-client

# Check memory usage during gameplay
# Use React Native Debugger or Flipper

# Test production build performance
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

**Performance Criteria**:
- [ ] App launches in <3 seconds
- [ ] Clicking responds within 50ms
- [ ] Memory usage stays <100MB
- [ ] No frame drops during normal gameplay

### Functionality Testing
- [ ] Manual clicking increases resources correctly
- [ ] Developer hiring deducts money properly
- [ ] Production calculations are accurate
- [ ] Save/load system preserves state
- [ ] Audio plays without errors

### Code Quality
```bash
# Run all quality checks
npm run lint
npm run type-check
npm run format
```

## Deliverables

At the end of Foundation phase:

1. **Working Game**: Playable clicking mechanic with one department
2. **Technical Infrastructure**: Project setup, tooling, and architecture
3. **Development Department**: Complete vertical slice with hiring and production
4. **Save System**: Basic persistence for game state
5. **Audio Foundation**: Sound system ready for expansion

## Next Steps

Foundation phase completion enables:
- **Core Features Phase**: Add sales and customer experience departments
- **Integration Phase**: Connect departments with resource flows
- **Quality Phase**: Performance optimization and polish
- **Deployment Phase**: Production builds and release preparation

---

**Foundation Phase Complete**: Core infrastructure established with playable game mechanics and scalable architecture for feature expansion.