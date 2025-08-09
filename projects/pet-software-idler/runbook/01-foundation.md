# Phase 1: Foundation Setup

## Objectives
- Initialize Expo project with correct configuration
- Set up development dependencies and tools
- Implement base architecture with vertical slicing
- Configure TypeScript, Metro, and Babel for optimal performance

## Prerequisites
- Phase 0 Analysis completed ✅
- Development environment verified ✅
- Risk mitigation strategies defined ✅

## Tasks Checklist

### 1. Project Initialization

- [ ] **Create Expo Project**
  ```bash
  cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler
  npx create-expo-app PetSoftTycoon --template blank-typescript
  cd PetSoftTycoon
  ```
  **Validation**: Project created with TypeScript template

- [ ] **Verify Expo SDK Version**
  ```bash
  cat package.json | grep expo
  npx expo install --fix
  ```
  **Validation**: Expo ~52.0.0 configured

### 2. Core Dependencies Installation

- [ ] **Install Legend State (Performance Critical)**
  ```bash
  npm install @legendapp/state@beta
  npm install @legendapp/state-react@beta
  ```
  **Validation**: Beta versions installed successfully

- [ ] **Install Animation and UI Dependencies**
  ```bash
  npx expo install react-native-reanimated
  npx expo install expo-av
  npx expo install expo-router
  npx expo install @shopify/flash-list
  ```

- [ ] **Install Storage and Security**
  ```bash
  npx expo install expo-secure-store
  npx expo install @react-native-async-storage/async-storage
  ```

- [ ] **Development Dependencies**
  ```bash
  npm install --save-dev @types/react
  npm install --save-dev @react-native/metro-config
  npm install --save-dev typescript@^5.8.0
  ```

### 3. Critical Configuration Setup

- [ ] **Metro Configuration (MANDATORY for Legend State)**
  ```javascript
  // metro.config.js
  const { getDefaultConfig } = require('expo/metro-config');
  
  const config = getDefaultConfig(__dirname);
  
  config.resolver.unstable_enablePackageExports = true;
  config.resolver.unstable_conditionNames = ['react-native'];
  
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });
  
  module.exports = config;
  ```

- [ ] **Babel Configuration (REQUIRED for Reanimated)**
  ```javascript
  // babel.config.js
  module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: ['react-native-reanimated/plugin'],
    };
  };
  ```

- [ ] **TypeScript Strict Configuration**
  ```json
  // tsconfig.json
  {
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "noImplicitReturns": true,
      "noImplicitThis": true,
      "baseUrl": "./",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```

### 4. Directory Structure Implementation

- [ ] **Create Vertical Slice Architecture**
  ```bash
  mkdir -p src/features/game-core/{components,hooks,state,services}
  mkdir -p src/features/departments/{components,hooks,state,services}
  mkdir -p src/features/prestige/{components,hooks,state,services}
  mkdir -p src/features/achievements/{components,hooks,state,services}
  mkdir -p src/features/ui/{components,hooks,theme}
  mkdir -p src/types
  mkdir -p assets/{audio,images,animations}
  ```

- [ ] **Validate Directory Structure**
  ```bash
  tree src -d
  ```
  **Expected Output**:
  ```
  src/
  ├── features/
  │   ├── achievements/
  │   ├── departments/
  │   ├── game-core/
  │   ├── prestige/
  │   └── ui/
  └── types/
  ```

### 5. Core State Management Setup

- [ ] **Create Global Game State**
  ```typescript
  // src/features/game-core/state/gameState$.ts
  import { observable } from '@legendapp/state';
  
  export const gameState$ = observable({
    // Core Resources
    resources: {
      code: 0,
      features: 0,
      money: 0,
      leads: 0,
      // Computed total value
      get totalValue() {
        return this.money + (this.features * 15) + (this.leads * 5);
      }
    },
    
    // Game Meta
    meta: {
      startTime: Date.now(),
      lastSave: Date.now(),
      prestigeCount: 0,
      investorPoints: 0,
      version: '8.0.0'
    },
    
    // Performance tracking
    performance: {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0
    },
    
    // Settings
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      particlesEnabled: true,
      autoSaveInterval: 30000,
      qualityLevel: 'auto' as 'low' | 'medium' | 'high' | 'auto'
    }
  });
  ```

- [ ] **Create Department State**
  ```typescript
  // src/features/departments/state/departmentState$.ts
  import { observable } from '@legendapp/state';
  
  export const departmentState$ = observable({
    development: {
      unlocked: true,
      employees: {
        junior: { count: 0, cost: 10, production: 0.1 },
        mid: { count: 0, cost: 100, production: 1 },
        senior: { count: 0, cost: 1000, production: 10 },
        lead: { count: 0, cost: 10000, production: 100 }
      },
      manager: { unlocked: false, hired: false, cost: 50000 },
      // Dynamic cost calculation
      get juniorCost() {
        return Math.floor(10 * Math.pow(1.15, this.employees.junior.count));
      }
    },
    
    sales: {
      unlocked: false,
      unlockThreshold: 500,
      employees: {
        rep: { count: 0, cost: 25, production: 0.2 },
        manager: { count: 0, cost: 500, production: 2 },
        director: { count: 0, cost: 5000, production: 20 }
      }
    }
  });
  ```

### 6. Expo Router Setup

- [ ] **Configure File-Based Routing**
  ```bash
  mkdir app
  ```

- [ ] **Create Root Layout**
  ```typescript
  // app/_layout.tsx
  import { Stack } from 'expo-router';
  import { useEffect } from 'react';
  import { gameState$ } from '../src/features/game-core/state/gameState$';
  
  export default function RootLayout() {
    useEffect(() => {
      // Initialize game state
      gameState$.meta.startTime.set(Date.now());
    }, []);
  
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
      </Stack>
    );
  }
  ```

- [ ] **Create Index Screen**
  ```typescript
  // app/index.tsx
  import { View, Text, StyleSheet } from 'react-native';
  import { Link } from 'expo-router';
  
  export default function IndexScreen() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PetSoft Tycoon</Text>
        <Link href="/game">Start Game</Link>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });
  ```

### 7. Basic Game Screen Setup

- [ ] **Create Main Game Component**
  ```typescript
  // app/game.tsx
  import { View, Text, StyleSheet } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { gameState$ } from '../src/features/game-core/state/gameState$';
  
  const GameScreen = observer(() => {
    const resources = gameState$.resources.get();
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Screen</Text>
        <Text>Code: {resources.code}</Text>
        <Text>Features: {resources.features}</Text>
        <Text>Money: ${resources.money}</Text>
        <Text>Leads: {resources.leads}</Text>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });
  
  export default GameScreen;
  ```

### 8. Essential Utilities and Types

- [ ] **Create Global Types**
  ```typescript
  // src/types/game.ts
  export interface Employee {
    count: number;
    cost: number;
    production: number;
  }
  
  export interface Department {
    unlocked: boolean;
    employees: Record<string, Employee>;
    manager?: {
      unlocked: boolean;
      hired: boolean;
      cost: number;
    };
  }
  
  export type ResourceType = 'code' | 'features' | 'money' | 'leads';
  export type QualityLevel = 'low' | 'medium' | 'high' | 'auto';
  ```

- [ ] **Create Format Utility**
  ```typescript
  // src/features/ui/utils/formatters.ts
  export const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
  };
  
  export const formatCurrency = (num: number): string => {
    return '$' + formatNumber(num);
  };
  ```

### 9. Performance Monitoring Foundation

- [ ] **Create Performance Monitor**
  ```typescript
  // src/features/game-core/services/performanceMonitor.ts
  import { gameState$ } from '../state/gameState$';
  
  export class PerformanceMonitor {
    private static frameTime = 0;
    private static lastTime = performance.now();
    
    static initialize() {
      const monitor = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        const fps = Math.round(1000 / deltaTime);
        gameState$.performance.fps.set(fps);
        
        if (deltaTime > 20) { // Frame drop
          gameState$.performance.frameDrops.set(prev => prev + 1);
        }
        
        this.lastTime = currentTime;
        requestAnimationFrame(monitor);
      };
      
      requestAnimationFrame(monitor);
    }
  }
  ```

### 10. Development Tools Setup

- [ ] **Create Development Scripts**
  ```json
  // package.json scripts section
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "eas build",
    "lint": "tsc --noEmit",
    "test": "jest"
  }
  ```

- [ ] **VS Code Workspace Settings**
  ```json
  // .vscode/settings.json
  {
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  }
  ```

## Validation Criteria

### Must Pass ✅
- [ ] Project builds successfully with `expo start`
- [ ] Legend State observables working in components
- [ ] TypeScript strict mode with no errors
- [ ] File-based routing navigation functional
- [ ] Performance monitoring shows FPS data

### Should Pass ⚠️
- [ ] Hot reload working consistently
- [ ] All dependencies installed without conflicts
- [ ] Directory structure follows vertical slicing
- [ ] Metro configuration loads Legend State properly

### Nice to Have 💡
- [ ] Development debugging tools configured
- [ ] Git hooks for linting setup
- [ ] VS Code intellisense fully functional

## Testing Commands

```bash
# Verify build
npm run lint
expo start --clear-cache

# Test state management
# Navigate to game screen and verify resources display

# Test performance monitoring
# Check that FPS counter shows in debug

# Platform testing
npm run ios
npm run android
```

## Troubleshooting

### Common Issues

1. **Legend State Import Errors**
   - **Solution**: Verify metro.config.js has package exports enabled
   - **Command**: `expo r -c`

2. **Reanimated Plugin Issues**
   - **Solution**: Clear cache and rebuild
   - **Command**: `expo r -c && cd ios && pod install`

3. **TypeScript Strict Errors**
   - **Solution**: Add proper type annotations
   - **Reference**: Check existing components for patterns

## Deliverables

### 1. Working Expo Project
- ✅ Builds and runs on simulator
- ✅ Legend State integration functional
- ✅ Basic navigation working

### 2. Architecture Foundation
- ✅ Vertical slice directory structure
- ✅ Core state management setup
- ✅ Performance monitoring initialized

### 3. Development Environment
- ✅ All necessary tools configured
- ✅ TypeScript strict mode enabled
- ✅ Hot reload and debugging ready

## Next Phase
Once foundation is solid and all validation criteria pass, proceed to **Phase 2: Core Game Features** (`02-core-features.md`)

**Estimated Duration**: 2-3 days
**Foundation Complete**: ✅/❌ (update after validation)