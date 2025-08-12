# Phase 1: Foundation Setup

## Overview
**Duration:** 8-12 hours  
**Prerequisites:** Phase 0 complete, development environment validated  
**Deliverables:** Working Expo project, core architecture, basic navigation, Legend State integration

This phase establishes the project foundation with modern React Native architecture, TypeScript configuration, and core systems needed for the idle game mechanics.

## Objectives

### Primary Objectives
- [ ] Create Expo project with React Native 0.76+ and New Architecture
- [ ] Implement comprehensive TypeScript configuration
- [ ] Integrate Legend State v3 for state management and persistence
- [ ] Set up Expo Router for file-based navigation
- [ ] Create base component library and theming system
- [ ] Establish project structure following technical requirements

### Success Criteria
- Expo development server runs at 60 FPS with hot reload
- TypeScript compilation with zero errors
- Legend State persistence working with test data
- Navigation between screens functional
- Base components render correctly across platforms
- Performance monitoring integrated and operational

## Task Breakdown

### Task 1: Expo Project Creation (1-2 hours)

**Objective:** Create optimized Expo project with modern React Native architecture

**Steps:**
1. **Initialize Expo Project**
   ```bash
   # Create project with TypeScript template
   npx create-expo-app@latest PetSoftTycoon --template blank-typescript
   cd PetSoftTycoon
   
   # Verify project creation
   npx expo --version
   ```

2. **Configure App.json for Optimal Settings**
   ```bash
   # Edit app.json
   code app.json
   ```
   
   **Configuration:**
   ```json
   {
     "expo": {
       "name": "PetSoft Tycoon",
       "slug": "petsoft-tycoon",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "userInterfaceStyle": "automatic",
       "platforms": ["ios", "android", "web"],
       "experiments": {
         "typedRoutes": true
       },
       "plugins": [
         "expo-router",
         [
           "expo-screen-orientation",
           {
             "initialOrientation": "PORTRAIT_UP"
           }
         ]
       ],
       "splash": {
         "image": "./assets/splash-icon.png",
         "resizeMode": "contain",
         "backgroundColor": "#1a1a2e"
       }
     }
   }
   ```

3. **Install Core Dependencies**
   ```bash
   # Install Expo Router for navigation
   npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
   
   # Install Legend State for state management
   npm install @legendapp/state
   
   # Install performance and utility libraries
   npx expo install react-native-reanimated
   npm install react-native-vector-icons
   npx expo install expo-font expo-asset
   
   # Install development dependencies
   npm install -D @types/react @types/react-native
   npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier
   ```

4. **Configure TypeScript**
   ```bash
   # Create comprehensive tsconfig.json
   code tsconfig.json
   ```
   
   **TypeScript Configuration:**
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "target": "ES2022",
       "lib": ["ES2022", "DOM"],
       "allowJs": false,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@/components/*": ["./src/components/*"],
         "@/hooks/*": ["./src/hooks/*"],
         "@/utils/*": ["./src/shared/utils/*"],
         "@/types/*": ["./src/shared/types/*"],
         "@/constants/*": ["./src/shared/constants/*"]
       }
     },
     "include": [
       "**/*.ts",
       "**/*.tsx",
       ".expo/types/**/*.ts",
       "expo-env.d.ts"
     ]
   }
   ```

**Validation Commands:**
```bash
# Test project creation
npx expo start --tunnel

# Verify TypeScript compilation
npx tsc --noEmit

# Check dependency installation
npm ls --depth=0
```

**Expected Output:** Working Expo project with development server running at 60 FPS

### Task 2: Project Structure Implementation (1-2 hours)

**Objective:** Create organized project structure following technical requirements

**Steps:**
1. **Create Core Directory Structure**
   ```bash
   # Create main source directories
   mkdir -p src/{core,features,components,hooks,shared}
   mkdir -p src/core/{services,state}
   mkdir -p src/features/{departments,employees,prestige,achievements}
   mkdir -p src/components/{common,ui}
   mkdir -p src/shared/{constants,utils,types,styles}
   
   # Create feature subdirectories
   mkdir -p src/features/departments/{components,hooks,state}
   mkdir -p src/features/employees/{components,hooks,state}
   mkdir -p src/features/prestige/{components,hooks,state}
   mkdir -p src/features/achievements/{components,hooks,data}
   ```

2. **Set Up Expo Router Structure**
   ```bash
   # Create app directory for file-based routing
   mkdir -p app/\(tabs\)
   
   # Create route files
   touch app/_layout.tsx
   touch app/index.tsx
   touch app/\(tabs\)/_layout.tsx
   touch app/\(tabs\)/index.tsx
   touch app/\(tabs\)/statistics.tsx
   touch app/\(tabs\)/settings.tsx
   ```

3. **Create Asset Directories**
   ```bash
   # Create asset organization
   mkdir -p assets/{images,sounds,fonts}
   
   # Create placeholder assets
   touch assets/images/.gitkeep
   touch assets/sounds/.gitkeep
   touch assets/fonts/.gitkeep
   ```

4. **Initialize Core Type Definitions**
   ```bash
   # Create foundational type files
   touch src/shared/types/gameTypes.ts
   touch src/shared/types/stateTypes.ts
   touch src/shared/constants/gameConfig.ts
   ```

**Validation Commands:**
```bash
# Verify directory structure
tree src/ -I node_modules

# Test file imports with TypeScript
npx tsc --noEmit --skipLibCheck
```

**Expected Output:** Complete project structure with organized directories and proper TypeScript path resolution

### Task 3: Legend State Integration (2-3 hours)

**Objective:** Implement Legend State v3 with persistence and core game state

**Steps:**
1. **Create Core Game State**
   ```bash
   # Create game state file
   code src/core/state/gameState.ts
   ```
   
   **Game State Implementation:**
   ```typescript
   import { observable } from '@legendapp/state';
   import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
   import { configureObservablePersistence } from '@legendapp/state/persist';
   
   // Configure persistence
   configureObservablePersistence({
     persistLocal: ObservablePersistLocalStorage,
   });
   
   export const gameState = observable({
     // Core game progress
     core: {
       money: 0,
       linesOfCode: 0,
       currentTime: Date.now(),
       lastSaveTime: Date.now(),
       gameStartTime: Date.now(),
       totalPlaytime: 0,
     },
   
     // Department system
     departments: {
       development: {
         employees: [],
         manager: null,
         productivity: 1.0,
         automationLevel: 0,
         unlocked: true,
       },
       sales: {
         employees: [],
         manager: null,
         productivity: 1.0,
         automationLevel: 0,
         unlocked: false,
       },
     },
   
     // Performance monitoring
     performance: {
       fps: 60,
       frameTimeHistory: [],
       memoryUsage: 0,
       lastOptimization: 0,
     },
   
     // Settings
     settings: {
       audioEnabled: true,
       animationsEnabled: true,
       autoSave: true,
       numberFormat: 'scientific' as const,
     },
   });
   ```

2. **Configure Persistence**
   ```bash
   # Create persistence configuration
   code src/core/state/persistConfig.ts
   ```
   
   **Persistence Configuration:**
   ```typescript
   import { persistObservable } from '@legendapp/state/persist';
   import { gameState } from './gameState';
   
   export const setupPersistence = () => {
     persistObservable(gameState, {
       local: 'PetSoftTycoon_SaveGame',
       transform: {
         save: (value) => ({
           ...value,
           performance: undefined, // Don't persist performance data
         }),
         load: (value) => ({
           ...value,
           performance: {
             fps: 60,
             frameTimeHistory: [],
             memoryUsage: 0,
             lastOptimization: 0,
           },
         }),
       },
     });
   };
   ```

3. **Create State Management Hooks**
   ```bash
   # Create custom hooks for state management
   code src/hooks/useGameState.ts
   ```
   
   **State Management Hooks:**
   ```typescript
   import { useObservable } from '@legendapp/state/react';
   import { gameState } from '@/core/state/gameState';
   
   export const useGameState = () => {
     const state = useObservable(gameState);
     return state;
   };
   
   export const useMoney = () => {
     const money = useObservable(gameState.core.money);
     return money;
   };
   
   export const usePerformance = () => {
     const performance = useObservable(gameState.performance);
     return performance;
   };
   ```

4. **Test State Persistence**
   ```bash
   # Create test component for state verification
   code src/components/common/StateTest.tsx
   ```

**Validation Commands:**
```bash
# Test state compilation
npx tsc --noEmit src/core/state/*.ts src/hooks/*.ts

# Verify Legend State integration
npm run type-check
```

**Expected Output:** Working Legend State integration with persistence and type-safe hooks

### Task 4: Expo Router Navigation (1-2 hours)

**Objective:** Implement file-based navigation with tab structure

**Steps:**
1. **Create Root Layout**
   ```bash
   # Edit app/_layout.tsx
   code app/_layout.tsx
   ```
   
   **Root Layout Implementation:**
   ```typescript
   import { Stack } from 'expo-router';
   import { StatusBar } from 'expo-status-bar';
   import { setupPersistence } from '@/core/state/persistConfig';
   import { useEffect } from 'react';
   
   // Initialize persistence
   setupPersistence();
   
   export default function RootLayout() {
     return (
       <>
         <StatusBar style="light" backgroundColor="#1a1a2e" />
         <Stack>
           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         </Stack>
       </>
     );
   }
   ```

2. **Create Tab Navigation Layout**
   ```bash
   # Edit app/(tabs)/_layout.tsx
   code app/\(tabs\)/_layout.tsx
   ```
   
   **Tab Layout Implementation:**
   ```typescript
   import { Tabs } from 'expo-router';
   import { Ionicons } from '@expo/vector-icons';
   
   export default function TabLayout() {
     return (
       <Tabs
         screenOptions={{
           tabBarActiveTintColor: '#0EA5E9',
           tabBarInactiveTintColor: '#6B7280',
           tabBarStyle: {
             backgroundColor: '#1a1a2e',
             borderTopColor: '#374151',
           },
           headerStyle: {
             backgroundColor: '#1a1a2e',
           },
           headerTintColor: '#FFFFFF',
         }}
       >
         <Tabs.Screen
           name="index"
           options={{
             title: 'Game',
             tabBarIcon: ({ color, focused }) => (
               <Ionicons name={focused ? 'game-controller' : 'game-controller-outline'} size={24} color={color} />
             ),
           }}
         />
         <Tabs.Screen
           name="statistics"
           options={{
             title: 'Stats',
             tabBarIcon: ({ color, focused }) => (
               <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
             ),
           }}
         />
         <Tabs.Screen
           name="settings"
           options={{
             title: 'Settings',
             tabBarIcon: ({ color, focused }) => (
               <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
             ),
           }}
         />
       </Tabs>
     );
   }
   ```

3. **Create Screen Components**
   ```bash
   # Create main game screen
   code app/\(tabs\)/index.tsx
   ```
   
   **Main Game Screen:**
   ```typescript
   import { View, Text, StyleSheet } from 'react-native';
   import { SafeAreaView } from 'react-native-safe-area-context';
   import { useGameState } from '@/hooks/useGameState';
   
   export default function GameScreen() {
     const gameState = useGameState();
     
     return (
       <SafeAreaView style={styles.container}>
         <View style={styles.content}>
           <Text style={styles.title}>PetSoft Tycoon</Text>
           <Text style={styles.money}>
             Money: ${gameState.core.money.get().toLocaleString()}
           </Text>
           <Text style={styles.lines}>
             Lines of Code: {gameState.core.linesOfCode.get().toLocaleString()}
           </Text>
         </View>
       </SafeAreaView>
     );
   }
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#1a1a2e',
     },
     content: {
       flex: 1,
       alignItems: 'center',
       justifyContent: 'center',
       padding: 20,
     },
     title: {
       fontSize: 32,
       fontWeight: 'bold',
       color: '#FFFFFF',
       marginBottom: 20,
     },
     money: {
       fontSize: 18,
       color: '#0EA5E9',
       marginBottom: 10,
     },
     lines: {
       fontSize: 18,
       color: '#10B981',
       marginBottom: 10,
     },
   });
   ```

**Validation Commands:**
```bash
# Test navigation compilation
npx tsc --noEmit app/**/*.tsx

# Start development server and test navigation
npx expo start
```

**Expected Output:** Working tab navigation with state display and proper theming

### Task 5: Base Component Library (2-3 hours)

**Objective:** Create reusable UI components with consistent theming

**Steps:**
1. **Create Theme System**
   ```bash
   # Create theme configuration
   code src/shared/constants/theme.ts
   ```
   
   **Theme Configuration:**
   ```typescript
   export const theme = {
     colors: {
       primary: '#0EA5E9',
       secondary: '#10B981',
       background: '#1a1a2e',
       surface: '#16213e',
       text: '#FFFFFF',
       textSecondary: '#9CA3AF',
       accent: '#8B5CF6',
       success: '#10B981',
       warning: '#F59E0B',
       error: '#EF4444',
       border: '#374151',
     },
     spacing: {
       xs: 4,
       sm: 8,
       md: 16,
       lg: 24,
       xl: 32,
     },
     typography: {
       sizes: {
         small: 12,
         medium: 16,
         large: 20,
         xlarge: 24,
         xxlarge: 32,
       },
       weights: {
         regular: '400',
         medium: '500',
         semibold: '600',
         bold: '700',
       },
     },
     borderRadius: {
       sm: 4,
       md: 8,
       lg: 16,
       full: 9999,
     },
   } as const;
   
   export type Theme = typeof theme;
   ```

2. **Create Base Button Component**
   ```bash
   # Create button component
   code src/components/common/Button.tsx
   ```
   
   **Button Component:**
   ```typescript
   import React from 'react';
   import {
     TouchableOpacity,
     Text,
     StyleSheet,
     ViewStyle,
     TextStyle,
     ActivityIndicator,
   } from 'react-native';
   import { theme } from '@/shared/constants/theme';
   
   interface ButtonProps {
     title: string;
     onPress: () => void;
     variant?: 'primary' | 'secondary' | 'outline';
     size?: 'small' | 'medium' | 'large';
     disabled?: boolean;
     loading?: boolean;
     style?: ViewStyle;
   }
   
   export const Button: React.FC<ButtonProps> = ({
     title,
     onPress,
     variant = 'primary',
     size = 'medium',
     disabled = false,
     loading = false,
     style,
   }) => {
     const buttonStyle = [
       styles.button,
       styles[`button_${variant}`],
       styles[`button_${size}`],
       disabled && styles.button_disabled,
       style,
     ];
   
     const textStyle = [
       styles.text,
       styles[`text_${variant}`],
       styles[`text_${size}`],
       disabled && styles.text_disabled,
     ];
   
     return (
       <TouchableOpacity
         style={buttonStyle}
         onPress={onPress}
         disabled={disabled || loading}
         activeOpacity={0.8}
       >
         {loading ? (
           <ActivityIndicator color={theme.colors.text} />
         ) : (
           <Text style={textStyle}>{title}</Text>
         )}
       </TouchableOpacity>
     );
   };
   
   const styles = StyleSheet.create({
     button: {
       alignItems: 'center',
       justifyContent: 'center',
       borderRadius: theme.borderRadius.md,
     },
     // Variant styles
     button_primary: {
       backgroundColor: theme.colors.primary,
     },
     button_secondary: {
       backgroundColor: theme.colors.secondary,
     },
     button_outline: {
       backgroundColor: 'transparent',
       borderWidth: 2,
       borderColor: theme.colors.primary,
     },
     // Size styles
     button_small: {
       paddingHorizontal: theme.spacing.sm,
       paddingVertical: theme.spacing.xs,
       minHeight: 32,
     },
     button_medium: {
       paddingHorizontal: theme.spacing.md,
       paddingVertical: theme.spacing.sm,
       minHeight: 44,
     },
     button_large: {
       paddingHorizontal: theme.spacing.lg,
       paddingVertical: theme.spacing.md,
       minHeight: 56,
     },
     // State styles
     button_disabled: {
       opacity: 0.6,
     },
     // Text styles
     text: {
       fontWeight: theme.typography.weights.semibold,
       textAlign: 'center',
     },
     text_primary: {
       color: theme.colors.text,
     },
     text_secondary: {
       color: theme.colors.text,
     },
     text_outline: {
       color: theme.colors.primary,
     },
     text_small: {
       fontSize: theme.typography.sizes.small,
     },
     text_medium: {
       fontSize: theme.typography.sizes.medium,
     },
     text_large: {
       fontSize: theme.typography.sizes.large,
     },
     text_disabled: {
       opacity: 0.6,
     },
   });
   ```

3. **Create Number Display Component**
   ```bash
   # Create number display component
   code src/components/common/NumberDisplay.tsx
   ```
   
   **Number Display Component:**
   ```typescript
   import React from 'react';
   import { Text, StyleSheet, TextStyle } from 'react-native';
   import { theme } from '@/shared/constants/theme';
   
   interface NumberDisplayProps {
     value: number;
     prefix?: string;
     suffix?: string;
     format?: 'standard' | 'scientific' | 'compact';
     style?: TextStyle;
     color?: string;
   }
   
   export const NumberDisplay: React.FC<NumberDisplayProps> = ({
     value,
     prefix = '',
     suffix = '',
     format = 'compact',
     style,
     color = theme.colors.text,
   }) => {
     const formatNumber = (num: number): string => {
       if (format === 'scientific' && num >= 1000) {
         return num.toExponential(2);
       }
       
       if (format === 'compact') {
         if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
         if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
         if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
         if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
       }
       
       return num.toLocaleString();
     };
   
     return (
       <Text style={[styles.text, { color }, style]}>
         {prefix}{formatNumber(value)}{suffix}
       </Text>
     );
   };
   
   const styles = StyleSheet.create({
     text: {
       fontSize: theme.typography.sizes.medium,
       fontWeight: theme.typography.weights.medium,
     },
   });
   ```

4. **Create Progress Bar Component**
   ```bash
   # Create progress bar component
   code src/components/common/ProgressBar.tsx
   ```

**Validation Commands:**
```bash
# Test component compilation
npx tsc --noEmit src/components/**/*.tsx

# Test import resolution
node -e "console.log(require('./src/shared/constants/theme.ts'))"
```

**Expected Output:** Reusable component library with consistent theming and proper TypeScript support

## Validation Criteria

### Project Setup Validation
- [ ] Expo development server starts without errors
- [ ] Hot reload functions correctly across all platforms
- [ ] TypeScript compilation produces zero errors
- [ ] All configured paths resolve correctly
- [ ] Performance maintains 60 FPS during development

### State Management Validation
- [ ] Legend State observable updates trigger re-renders
- [ ] Persistence saves and loads data correctly
- [ ] State changes are type-safe throughout the application
- [ ] Performance monitoring data updates in real-time
- [ ] No memory leaks detected during state operations

### Navigation Validation
- [ ] Tab navigation switches between screens correctly
- [ ] Deep linking works for all defined routes
- [ ] Navigation animations are smooth (60 FPS)
- [ ] Back button behavior functions correctly on Android
- [ ] Screen transitions are performant

### Component Library Validation
- [ ] All base components render correctly
- [ ] Theme system provides consistent styling
- [ ] Components are accessible and keyboard navigable
- [ ] Responsive behavior works across screen sizes
- [ ] No visual glitches or layout issues

## Common Issues & Solutions

### Metro Configuration Issues
**Issue:** Module resolution failures or import errors
**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro bundler
rm -rf node_modules/.cache
npx expo start
```

### Legend State Type Errors
**Issue:** TypeScript errors with observable types
**Solution:**
```bash
# Ensure proper Legend State types
npm install @legendapp/state@latest
npx tsc --skipLibCheck
```

### Navigation Stack Issues
**Issue:** Screen flickers or navigation doesn't work
**Solution:**
```bash
# Verify Expo Router setup
npx expo install expo-router@latest react-native-screens react-native-safe-area-context
```

### Performance Issues
**Issue:** Development server running below 60 FPS
**Solution:**
```bash
# Enable Fast Refresh optimization
npx expo start --dev-client --clear
```

## Deliverables

### 1. Working Expo Project
**Location:** `PetSoftTycoon/`
**Contents:**
- Configured Expo project with TypeScript
- Proper app.json configuration
- All dependencies installed and verified
- Development server running at 60 FPS

### 2. Core State Management System
**Files:**
- `src/core/state/gameState.ts` - Main game state observable
- `src/core/state/persistConfig.ts` - Persistence configuration
- `src/hooks/useGameState.ts` - State management hooks

### 3. Navigation System
**Files:**
- `app/_layout.tsx` - Root layout
- `app/(tabs)/_layout.tsx` - Tab navigation
- `app/(tabs)/index.tsx` - Main game screen
- Additional screen files

### 4. Component Library Foundation
**Files:**
- `src/shared/constants/theme.ts` - Theme system
- `src/components/common/Button.tsx` - Button component
- `src/components/common/NumberDisplay.tsx` - Number formatting
- `src/components/common/ProgressBar.tsx` - Progress display

### 5. Project Documentation
**File:** `foundation-setup-report.md`
**Contents:**
- Setup verification results
- Performance baseline measurements
- Architecture decisions and rationale
- Known issues and workarounds

## Time Estimates

| Task | Minimum | Maximum | Notes |
|------|---------|---------|--------|
| Expo Project Creation | 1 hour | 2 hours | Includes dependency installation |
| Project Structure | 1 hour | 2 hours | Directory setup and configuration |
| Legend State Integration | 2 hours | 3 hours | State setup and testing |
| Navigation Implementation | 1 hour | 2 hours | Expo Router configuration |
| Component Library | 2 hours | 3 hours | Base components and theming |
| **Total** | **7 hours** | **12 hours** | **Average: 8-10 hours** |

## Success Metrics

### Technical Metrics
- Development server startup time: <30 seconds
- Hot reload response time: <2 seconds
- TypeScript compilation time: <10 seconds
- Memory usage during development: <300MB

### Quality Metrics
- Zero TypeScript compilation errors
- All ESLint rules passing
- Component rendering performance: 60 FPS
- State management overhead: <1ms per update

---

**Next Phase:** [Phase 2: Core Features](./02-core-features.md)

**Prerequisites for Next Phase:**
- Expo project running stably at 60 FPS
- Legend State integrated and tested
- Navigation system functional
- Base component library operational
- TypeScript configuration validated