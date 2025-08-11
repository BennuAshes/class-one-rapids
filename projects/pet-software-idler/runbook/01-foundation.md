# Phase 1: Foundation
## Project Setup and Core Architecture Implementation

**Estimated Time**: 2-3 days  
**Prerequisites**: Completed analysis phase, development environment setup  
**Deliverables**: Functional Expo project with hybrid routing and Legend State v3 integration

---

## Objectives

1. **Initialize Expo Project**: Set up React Native project with TypeScript and required dependencies
2. **Implement Hybrid Routing**: Create route delegation pattern with Expo Router + vertical slicing
3. **Integrate Legend State v3**: Set up reactive state management with MMKV persistence
4. **Establish Performance Baseline**: Achieve 60 FPS target on reference devices
5. **Create Development Infrastructure**: Testing framework, build system, performance monitoring

---

## Task Checklist

### Project Initialization
- [ ] **Create Expo Project** (45 min)
  ```bash
  # Create new Expo project with TypeScript template
  npx create-expo-app PetSoftTycoon --template
  cd PetSoftTycoon
  
  # Verify project structure
  ls -la
  
  # Initial build test
  npx expo start --clear
  ```

- [ ] **Configure TypeScript** (30 min)
  ```bash
  # Install TypeScript dependencies
  npm install --save-dev typescript @types/react @types/react-native
  
  # Create tsconfig.json
  cat > tsconfig.json << 'EOF'
  {
    "compilerOptions": {
      "target": "esnext",
      "lib": ["dom", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noFallthroughCasesInSwitch": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"],
        "@/components/*": ["src/shared/components/*"],
        "@/features/*": ["src/features/*"],
        "@/core/*": ["src/core/*"]
      }
    },
    "include": [
      "**/*.ts",
      "**/*.tsx"
    ],
    "exclude": [
      "node_modules"
    ]
  }
  EOF
  
  # Verify TypeScript compilation
  npx tsc --noEmit
  ```

### Directory Structure Setup
- [ ] **Create Hybrid Architecture Structure** (30 min)
  ```bash
  # Create directory structure following hybrid pattern
  mkdir -p src/{core,features,shared}
  mkdir -p src/core/{state,game-loop,save-system,analytics}
  mkdir -p src/features/{dashboard,departments,progression}
  mkdir -p src/shared/{components,hooks,utils,types}
  mkdir -p src/shared/components/{ui,game}
  
  # Create app directory for Expo Router
  mkdir -p app/{modal,\(tabs\)}
  
  # Create barrel export files
  echo "export {};" > src/core/index.ts
  echo "export {};" > src/shared/index.ts
  echo "export {};" > src/features/index.ts
  
  # Verify structure
  tree src/ app/ || find . -type d -name "src" -o -name "app" | head -20
  ```

### Dependency Installation
- [ ] **Install Core Dependencies** (20 min)
  ```bash
  # Install Expo Router
  npx expo install expo-router
  
  # Install Legend State v3 (beta)
  npm install @legendapp/state@beta
  
  # Install MMKV for persistence
  npm install react-native-mmkv
  npx expo install expo-build-properties
  
  # Install performance and animation libraries
  npm install react-native-reanimated
  npm install react-native-gesture-handler
  npx expo install expo-av
  
  # Install BigNumber.js for large value handling
  npm install bignumber.js
  npm install --save-dev @types/bignumber.js
  ```

- [ ] **Configure app.json for Dependencies** (15 min)
  ```bash
  # Update app.json with required configurations
  cat > app.json << 'EOF'
  {
    "expo": {
      "name": "PetSoft Tycoon",
      "slug": "petsoft-tycoon",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "dark",
      "splash": {
        "image": "./assets/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#0a0a0a"
      },
      "assetBundlePatterns": ["**/*"],
      "ios": {
        "supportsTablet": true,
        "bundleIdentifier": "com.petsoft.tycoon"
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#0a0a0a"
        },
        "package": "com.petsoft.tycoon"
      },
      "web": {
        "favicon": "./assets/favicon.png",
        "bundler": "metro"
      },
      "plugins": [
        "expo-router",
        [
          "expo-build-properties",
          {
            "android": {
              "extraMavenRepos": ["../../node_modules/react-native-mmkv/android/build/maven"]
            }
          }
        ]
      ],
      "scheme": "petsoft-tycoon",
      "experiments": {
        "typedRoutes": true
      }
    }
  }
  EOF
  ```

### Legend State v3 Integration
- [ ] **Create Core Game State Structure** (60 min)
  ```bash
  # Create game state types
  cat > src/core/state/gameStore.ts << 'EOF'
  import { observable, computed, batch } from '@legendapp/state';
  import { syncObservable } from '@legendapp/state/sync';
  import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
  import { BigNumber } from 'bignumber.js';
  
  // Type definitions
  interface PlayerState {
    currency: string; // Use string to preserve BigNumber precision
    linesOfCode: string;
    features: {
      basic: number;
      advanced: number;
      premium: number;
    };
    startTime: number;
    lastActiveTime: number;
  }
  
  interface DevelopmentDepartment {
    employees: {
      junior: number;
      mid: number;
      senior: number;
      techLead: number;
    };
    upgrades: {
      betterIde: number; // 0-3 levels
      pairProgramming: boolean;
      codeReviews: boolean;
    };
    production: {
      linesPerSecond: number;
      efficiency: number;
    };
  }
  
  interface GameState {
    player: PlayerState;
    departments: {
      development: DevelopmentDepartment;
      // Other departments to be added later
    };
    progression: {
      investorPoints: string;
      prestigeCount: number;
      lastPrestigeTime: number;
      achievements: string[]; // Achievement IDs
    };
    ui: {
      activeScreen: string;
      showOfflineProgress: boolean;
      lastSaveTime: number;
    };
  }
  
  // Initial state
  const initialState: GameState = {
    player: {
      currency: '0',
      linesOfCode: '0',
      features: { basic: 0, advanced: 0, premium: 0 },
      startTime: Date.now(),
      lastActiveTime: Date.now()
    },
    departments: {
      development: {
        employees: { junior: 0, mid: 0, senior: 0, techLead: 0 },
        upgrades: { betterIde: 0, pairProgramming: false, codeReviews: false },
        production: { linesPerSecond: 0, efficiency: 1 }
      }
    },
    progression: {
      investorPoints: '0',
      prestigeCount: 0,
      lastPrestigeTime: 0,
      achievements: []
    },
    ui: {
      activeScreen: 'dashboard',
      showOfflineProgress: false,
      lastSaveTime: Date.now()
    }
  };
  
  // Create main game observable
  export const gameState$ = observable<GameState>(initialState);
  
  // Computed values
  export const totalValuation$ = computed(() => {
    const player = gameState$.player.get();
    const currency = new BigNumber(player.currency);
    const linesOfCode = new BigNumber(player.linesOfCode);
    
    // Simple valuation formula: currency * 0.1 + linesOfCode * 10
    return currency.multipliedBy(0.1).plus(linesOfCode.multipliedBy(10)).toString();
  });
  
  export const currentRevenue$ = computed(() => {
    const dev = gameState$.departments.development.get();
    return dev.production.linesPerSecond * dev.production.efficiency;
  });
  
  // Game actions
  export const gameActions = {
    writeCode: () => {
      batch(() => {
        const currentLines = new BigNumber(gameState$.player.linesOfCode.peek());
        const newLines = currentLines.plus(1);
        gameState$.player.linesOfCode.set(newLines.toString());
        gameState$.player.lastActiveTime.set(Date.now());
      });
    },
    
    hireDeveloper: (type: keyof DevelopmentDepartment['employees']) => {
      const cost = getDeveloperCost(type, gameState$.departments.development.employees[type].peek());
      const currentCurrency = new BigNumber(gameState$.player.currency.peek());
      
      if (currentCurrency.gte(cost)) {
        batch(() => {
          const newCurrency = currentCurrency.minus(cost);
          gameState$.player.currency.set(newCurrency.toString());
          gameState$.departments.development.employees[type].set(prev => prev + 1);
          updateProductionRates();
        });
      }
    },
    
    forceSave: () => {
      gameState$.ui.lastSaveTime.set(Date.now());
      // Trigger sync explicitly if needed
    }
  };
  
  // Helper functions
  function getDeveloperCost(type: keyof DevelopmentDepartment['employees'], currentCount: number): BigNumber {
    const baseCosts = {
      junior: 100,
      mid: 500, 
      senior: 2000,
      techLead: 8000
    };
    
    return new BigNumber(baseCosts[type]).multipliedBy(Math.pow(1.15, currentCount));
  }
  
  function updateProductionRates() {
    const dev = gameState$.departments.development.peek();
    const employees = dev.employees;
    
    const totalProduction = 
      employees.junior * 1 +
      employees.mid * 3 +
      employees.senior * 8 +
      employees.techLead * 20;
    
    gameState$.departments.development.production.linesPerSecond.set(totalProduction);
  }
  
  // Setup persistence
  syncObservable(gameState$, {
    persist: {
      name: 'petsoft-tycoon-save',
      plugin: ObservablePersistMMKV,
      transform: {
        save: (value) => JSON.stringify(value),
        load: (value) => JSON.parse(value)
      }
    },
    retry: {
      infinite: true,
      delay: 1000
    }
  });
  EOF
  ```

### Expo Router Setup
- [ ] **Configure Root Layout** (30 min)
  ```bash
  # Create root layout with Legend State integration
  cat > app/_layout.tsx << 'EOF'
  import { Stack } from 'expo-router';
  import { StatusBar } from 'expo-status-bar';
  import { SafeAreaProvider } from 'react-native-safe-area-context';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';
  
  // Import Legend State configuration
  import '../src/core/state/gameStore';
  
  export default function RootLayout() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="modal" 
              options={{ 
                presentation: 'modal',
                title: 'Game Modal'
              }} 
            />
          </Stack>
          <StatusBar style="light" backgroundColor="#0a0a0a" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
  EOF
  ```

- [ ] **Create Tab Layout** (20 min)
  ```bash
  # Create tab navigation layout
  cat > app/\(tabs\)/_layout.tsx << 'EOF'
  import { Tabs } from 'expo-router';
  import { Platform } from 'react-native';
  import { TabIcon } from '../../src/shared/components/TabIcon';
  
  export default function TabLayout() {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333333',
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            height: Platform.OS === 'ios' ? 90 : 70
          },
          headerStyle: {
            backgroundColor: '#1a1a1a'
          },
          headerTintColor: '#ffffff'
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="dashboard" color={color} focused={focused} />
            )
          }}
        />
        <Tabs.Screen
          name="departments"
          options={{
            title: 'Departments',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="departments" color={color} focused={focused} />
            )
          }}
        />
        <Tabs.Screen
          name="progression"
          options={{
            title: 'Progression',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="progression" color={color} focused={focused} />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="settings" color={color} focused={focused} />
            )
          }}
        />
      </Tabs>
    );
  }
  EOF
  ```

### Basic Route Implementation
- [ ] **Create Dashboard Route** (30 min)
  ```bash
  # Create dashboard route (delegation pattern)
  cat > app/\(tabs\)/index.tsx << 'EOF'
  import { DashboardScreen } from '../../src/features/dashboard';
  
  export default DashboardScreen;
  EOF
  
  # Create actual dashboard screen component
  mkdir -p src/features/dashboard
  cat > src/features/dashboard/DashboardScreen.tsx << 'EOF'
  import React from 'react';
  import { View, Text, StyleSheet, Pressable } from 'react-native';
  import { use$, observer } from '@legendapp/state/react';
  import { gameState$, gameActions, totalValuation$, currentRevenue$ } from '../../core/state/gameStore';
  import { BigNumber } from 'bignumber.js';
  
  const DashboardScreen = observer(() => {
    const player = use$(gameState$.player);
    const totalValuation = use$(totalValuation$);
    const currentRevenue = use$(currentRevenue$);
    
    const formatCurrency = (value: string | number) => {
      const bn = new BigNumber(value);
      if (bn.lt(1000)) return bn.toFixed(0);
      if (bn.lt(1000000)) return bn.div(1000).toFixed(1) + 'K';
      if (bn.lt(1000000000)) return bn.div(1000000).toFixed(2) + 'M';
      return bn.div(1000000000).toFixed(2) + 'B';
    };
    
    return (
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Currency</Text>
            <Text style={styles.statValue}>${formatCurrency(player.currency)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lines of Code</Text>
            <Text style={styles.statValue}>{formatCurrency(player.linesOfCode)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Valuation</Text>
            <Text style={styles.statValue}>${formatCurrency(totalValuation)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Revenue/sec</Text>
            <Text style={styles.statValue}>{currentRevenue.toFixed(1)}</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={gameActions.writeCode}
          >
            <Text style={styles.actionButtonText}>Write Code</Text>
            <Text style={styles.actionButtonSubtext}>+1 line of code</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => console.log('Ship feature - to be implemented')}
          >
            <Text style={styles.actionButtonText}>Ship Feature</Text>
            <Text style={styles.actionButtonSubtext}>Convert code to currency</Text>
          </Pressable>
        </View>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0a0a0a',
      padding: 16
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32
    },
    statItem: {
      backgroundColor: '#1a1a1a',
      padding: 16,
      borderRadius: 8,
      width: '48%',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#333333'
    },
    statLabel: {
      color: '#8E8E93',
      fontSize: 14,
      marginBottom: 4
    },
    statValue: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold'
    },
    actionsContainer: {
      gap: 16
    },
    actionButton: {
      backgroundColor: '#007AFF',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center'
    },
    secondaryButton: {
      backgroundColor: '#34C759'
    },
    actionButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4
    },
    actionButtonSubtext: {
      color: '#ffffff',
      fontSize: 14,
      opacity: 0.8
    }
  });
  
  export default DashboardScreen;
  EOF
  
  # Create barrel export
  echo "export { default as DashboardScreen } from './DashboardScreen';" > src/features/dashboard/index.ts
  ```

### Shared Components Setup
- [ ] **Create TabIcon Component** (20 min)
  ```bash
  # Create shared TabIcon component
  cat > src/shared/components/TabIcon.tsx << 'EOF'
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  
  interface TabIconProps {
    name: string;
    color: string;
    focused: boolean;
  }
  
  const iconMap: Record<string, string> = {
    dashboard: '📊',
    departments: '🏢',
    progression: '🎯',
    settings: '⚙️'
  };
  
  export function TabIcon({ name, color, focused }: TabIconProps) {
    return (
      <View style={styles.container}>
        <Text style={[styles.icon, focused && styles.iconFocused]}>
          {iconMap[name] || '❓'}
        </Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    icon: {
      fontSize: 24,
      opacity: 0.6
    },
    iconFocused: {
      opacity: 1
    }
  });
  EOF
  ```

### Performance Monitoring Setup
- [ ] **Create Performance Monitor** (45 min)
  ```bash
  # Create performance monitoring system
  cat > src/core/analytics/PerformanceMonitor.ts << 'EOF'
  export interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    timestamp: number;
  }
  
  export class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private frameCount = 0;
    private startTime = performance.now();
    private rafId?: number;
    
    start() {
      this.measureFPS();
    }
    
    stop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    }
    
    private measureFPS() {
      const currentTime = performance.now();
      this.frameCount++;
      
      // Calculate FPS every second
      if (currentTime - this.startTime >= 1000) {
        const fps = this.frameCount;
        this.frameCount = 0;
        this.startTime = currentTime;
        
        const metrics: PerformanceMetrics = {
          fps,
          memoryUsage: this.getMemoryUsage(),
          renderTime: currentTime,
          timestamp: Date.now()
        };
        
        this.metrics.push(metrics);
        
        // Keep only last 60 seconds of metrics
        if (this.metrics.length > 60) {
          this.metrics.shift();
        }
        
        // Log performance issues
        if (fps < 55) {
          console.warn('Performance warning: FPS dropped to', fps);
        }
      }
      
      this.rafId = requestAnimationFrame(() => this.measureFPS());
    }
    
    private getMemoryUsage(): number {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
      }
      return 0;
    }
    
    getLatestMetrics(): PerformanceMetrics | null {
      return this.metrics[this.metrics.length - 1] || null;
    }
    
    getAverageMetrics(seconds: number = 30): PerformanceMetrics | null {
      const recentMetrics = this.metrics.slice(-seconds);
      if (recentMetrics.length === 0) return null;
      
      const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
      const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;
      const avgRenderTime = recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;
      
      return {
        fps: Math.round(avgFps),
        memoryUsage: Math.round(avgMemory * 100) / 100,
        renderTime: Math.round(avgRenderTime * 100) / 100,
        timestamp: Date.now()
      };
    }
  }
  
  export const performanceMonitor = new PerformanceMonitor();
  EOF
  
  # Create barrel export
  echo "export * from './PerformanceMonitor';" > src/core/analytics/index.ts
  ```

### Testing Framework Setup
- [ ] **Install and Configure Jest** (30 min)
  ```bash
  # Install testing dependencies
  npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
  npm install --save-dev @types/jest
  
  # Create Jest configuration
  cat > jest.config.js << 'EOF'
  module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|expo|@expo|@legendapp|react-native-mmkv)/)'
    ],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!src/**/*.types.ts'
    ]
  };
  EOF
  
  # Create test setup file
  cat > src/test-setup.ts << 'EOF'
  import '@testing-library/jest-native/extend-expect';
  
  // Mock Legend State persist plugin
  jest.mock('@legendapp/state/persist-plugins/mmkv', () => ({
    ObservablePersistMMKV: {}
  }));
  
  // Mock React Native components
  jest.mock('react-native-mmkv', () => ({
    MMKV: jest.fn()
  }));
  
  // Silence console warnings during tests
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn()
  };
  EOF
  ```

### Build and Validation
- [ ] **Test Initial Build** (15 min)
  ```bash
  # Verify TypeScript compilation
  npx tsc --noEmit
  
  # Test Metro bundling
  npx expo export --platform web --dev
  
  # Run tests
  npm test -- --passWithNoTests
  
  # Start development server
  npx expo start --clear
  ```

- [ ] **Performance Validation** (30 min)
  ```bash
  # Create performance test script
  cat > scripts/validate-performance.js << 'EOF'
  const { exec } = require('child_process');
  
  async function validatePerformance() {
    console.log('🔍 Running performance validation...');
    
    // Start the app and run automated tests
    const results = {
      buildTime: 0,
      bundleSize: 0,
      coldStartTime: 0,
      fpsTarget: 60
    };
    
    try {
      // Measure build time
      const buildStart = Date.now();
      await new Promise((resolve, reject) => {
        exec('npx expo export --platform ios --dev', (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });
      results.buildTime = Date.now() - buildStart;
      
      // Check bundle size (rough estimate)
      const fs = require('fs');
      if (fs.existsSync('dist')) {
        const stats = fs.statSync('dist');
        results.bundleSize = stats.size;
      }
      
      console.log('📊 Performance Results:');
      console.log(`Build Time: ${results.buildTime}ms`);
      console.log(`Bundle Size: ${Math.round(results.bundleSize / 1024 / 1024 * 100) / 100}MB`);
      console.log(`Target FPS: ${results.fpsTarget}`);
      
      // Basic validation
      const passed = results.buildTime < 60000; // 1 minute max
      console.log(passed ? '✅ Performance validation passed' : '❌ Performance validation failed');
      
      return results;
    } catch (error) {
      console.error('❌ Performance validation failed:', error);
      return null;
    }
  }
  
  validatePerformance();
  EOF
  
  # Run performance validation
  node scripts/validate-performance.js
  ```

---

## Quality Gates & Validation

### Technical Validation
- [ ] **Build System Verification**
  ```bash
  # Verify all platforms build successfully
  npx expo export --platform ios --dev
  npx expo export --platform android --dev  
  npx expo export --platform web --dev
  
  # Check for any critical warnings or errors
  echo "Build verification completed"
  ```

- [ ] **Legend State Integration Test**
  ```bash
  # Create integration test
  cat > src/core/state/__tests__/gameStore.test.ts << 'EOF'
  import { gameState$, gameActions, totalValuation$ } from '../gameStore';
  import { BigNumber } from 'bignumber.js';
  
  describe('Game Store Integration', () => {
    beforeEach(() => {
      // Reset to initial state
      gameState$.set({
        player: {
          currency: '0',
          linesOfCode: '0',
          features: { basic: 0, advanced: 0, premium: 0 },
          startTime: Date.now(),
          lastActiveTime: Date.now()
        },
        departments: {
          development: {
            employees: { junior: 0, mid: 0, senior: 0, techLead: 0 },
            upgrades: { betterIde: 0, pairProgramming: false, codeReviews: false },
            production: { linesPerSecond: 0, efficiency: 1 }
          }
        },
        progression: {
          investorPoints: '0',
          prestigeCount: 0,
          lastPrestigeTime: 0,
          achievements: []
        },
        ui: {
          activeScreen: 'dashboard',
          showOfflineProgress: false,
          lastSaveTime: Date.now()
        }
      });
    });
  
    test('writeCode action updates state correctly', () => {
      const initialLines = gameState$.player.linesOfCode.peek();
      gameActions.writeCode();
      const newLines = gameState$.player.linesOfCode.peek();
      
      expect(new BigNumber(newLines).minus(initialLines).toNumber()).toBe(1);
    });
  
    test('totalValuation computed value updates correctly', () => {
      gameState$.player.currency.set('1000');
      gameState$.player.linesOfCode.set('100');
      
      const valuation = totalValuation$.peek();
      const expected = new BigNumber('1000').multipliedBy(0.1).plus(new BigNumber('100').multipliedBy(10));
      
      expect(new BigNumber(valuation).eq(expected)).toBe(true);
    });
  });
  EOF
  
  # Run the test
  npm test gameStore.test.ts
  ```

### Performance Validation
- [ ] **FPS Target Verification**
  - Start the app on a target device
  - Monitor performance for 5 minutes of interaction
  - Verify consistent 60 FPS during normal gameplay
  - Document any frame drops or performance issues

- [ ] **Memory Usage Baseline**
  - Measure initial app launch memory usage
  - Test for memory leaks during 30 minutes of gameplay
  - Verify memory usage stays under 75MB target
  - Document baseline measurements for future comparison

### Architectural Compliance
- [ ] **Hybrid Routing Pattern Verification**
  ```bash
  # Verify route files only contain routing logic
  echo "Checking route delegation pattern..."
  
  # Check that route files are minimal
  find app -name "*.tsx" -exec wc -l {} \; | sort -n
  
  # Verify business logic is in features directory
  find src/features -name "*.tsx" -type f | wc -l
  echo "Route delegation pattern verification completed"
  ```

- [ ] **Legend State Best Practices Check**
  - Verify all state mutations use batch() for multiple updates
  - Confirm peek() is used for non-reactive reads
  - Check that observables are properly typed
  - Validate persistence configuration is working

---

## Deliverables

### Required Outputs
1. **Functional Expo Project** with all dependencies installed and configured
2. **Hybrid Routing Implementation** with delegation pattern working correctly
3. **Legend State Integration** with persistence and reactivity functional
4. **Basic Dashboard Screen** demonstrating state management and UI updates
5. **Performance Monitoring** system operational and collecting metrics
6. **Test Framework** configured and running with baseline tests

### Documentation Updates
- [ ] **Update Architecture Documentation**
  - Document any deviations from planned architecture
  - Record actual implementation details
  - Note any performance optimizations applied

- [ ] **Create Development Guidelines**
  ```bash
  cat > docs/development-guidelines.md << 'EOF'
  # Development Guidelines
  
  ## Hybrid Routing Pattern
  - Route files in /app should only contain routing configuration
  - Business logic goes in /src/features with proper barrel exports
  - Use delegation pattern: route imports feature screen component
  
  ## Legend State Best Practices
  - Use batch() for multiple state updates
  - Use peek() for non-reactive reads
  - Keep observables properly typed
  - Prefer computed values over manual calculations
  
  ## Performance Standards
  - Maintain 60 FPS during normal gameplay
  - Memory usage should not exceed 75MB
  - Use performance monitor to identify bottlenecks
  - Test on target devices regularly
  
  ## Code Organization
  - Follow vertical slicing for features
  - Co-locate related files within feature directories
  - Use barrel exports for clean imports
  - Maintain clear separation of concerns
  EOF
  ```

### Validation Checklist
- [ ] Project builds successfully on all target platforms
- [ ] Legend State persistence working correctly
- [ ] Navigation between screens functional
- [ ] Basic gameplay interaction (write code) working
- [ ] Performance monitoring collecting valid metrics
- [ ] 60 FPS target achieved on test device
- [ ] Memory usage within target limits
- [ ] Tests passing and coverage reporting
- [ ] No critical console errors or warnings
- [ ] Hybrid routing pattern implemented correctly

---

**Time Tracking**: Record actual time spent vs estimates
- [ ] Project initialization: __ hours (est: 1.5)
- [ ] Legend State setup: __ hours (est: 2)
- [ ] Routing implementation: __ hours (est: 1.5)
- [ ] Performance setup: __ hours (est: 1)
- [ ] Testing configuration: __ hours (est: 0.5)
- [ ] **Total Phase 1**: __ hours (est: 6-7 hours over 2-3 days)

**Next Phase**: [02-core-features.md](./02-core-features.md) - Core Game Loop Implementation

**Go/No-Go Decision**: This phase must achieve all validation criteria before proceeding. If critical issues emerge, revisit architecture decisions or adjust scope.