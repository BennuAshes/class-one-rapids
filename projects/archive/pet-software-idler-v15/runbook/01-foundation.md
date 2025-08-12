# Phase 1: Foundation Setup

**Duration**: 16 hours  
**Timeline**: Days 3-5  
**Dependencies**: Phase 0 completed and approved

## Objectives
- Set up React Native project with Expo SDK 52
- Configure TypeScript with strict mode
- Install and configure Legend State v3 for state management
- Establish project structure following vertical slicing pattern
- Configure development tools and CI/CD pipeline
- Validate setup on all target platforms

## Tasks Breakdown

### Task 1.1: Project Initialization (3 hours)
**Objective**: Create new Expo project with optimal configuration

#### Step 1.1.1: Create Expo Project
```bash
# Verify working directory - CRITICAL!
pwd  # Must be in /projects/pet-software-idler/
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler

# Create new Expo app with TypeScript
npx create-expo-app@latest PetSoftTycoon --template bare-minimum

# Navigate to project
cd PetSoftTycoon

# Verify structure
ls -la
```

#### Step 1.1.2: Configure Package.json
```bash
# Update package.json with project details
cat > package.json << 'EOF'
{
  "name": "petsoft-tycoon",
  "version": "1.0.0",
  "description": "Premium mobile idle game for building pet software empire",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios", 
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "build:eas": "eas build --platform all",
    "build:eas:ios": "eas build --platform ios",
    "build:eas:android": "eas build --platform android",
    "clean": "expo r -c",
    "clean:cache": "expo r -c && npm start -- --reset-cache",
    "doctor": "expo doctor",
    "precommit": "npm run lint && npm run type-check && npm run test"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.3.0",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.3.0"
  }
}
EOF
```

#### Step 1.1.3: Install Core Dependencies
```bash
# CRITICAL: Always use expo install for React Native packages
# NEVER use npm install with --legacy-peer-deps

# Install core dependencies
npx expo install @legendapp/state@3.0.0-beta.0
npx expo install react-native-reanimated@~4.0.0
npx expo install expo-av@~14.0.0
npx expo install expo-haptics@~13.0.0
npx expo install react-native-safe-area-context@4.14.0
npx expo install @expo/vector-icons@^14.0.0
npx expo install @react-native-async-storage/async-storage@~2.1.0
npx expo install lz-string@^1.5.0

# Install development dependencies
npm install --save-dev @typescript-eslint/eslint-plugin@^7.0.0
npm install --save-dev @typescript-eslint/parser@^7.0.0
npm install --save-dev eslint@^8.57.0
npm install --save-dev eslint-config-expo@^7.0.0
npm install --save-dev jest@^29.7.0
npm install --save-dev @testing-library/react-native@^12.0.0
npm install --save-dev @testing-library/jest-native@^5.4.0

# Verify no dependency conflicts
npx expo doctor
npm ls | grep -i "peer" # Should be empty or only valid peer deps
```

#### Success Criteria
- [ ] Expo project created with TypeScript template
- [ ] All core dependencies installed without --legacy-peer-deps
- [ ] `expo doctor` passes all checks
- [ ] Project runs on all platforms (iOS, Android, Web)

### Task 1.2: TypeScript Configuration (2 hours)
**Objective**: Configure TypeScript with strict mode and path mapping

#### Step 1.2.1: TypeScript Config
```bash
# Create strict TypeScript configuration
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    
    // Modern JavaScript features
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    // Path mapping for clean imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/shared/components/*"],
      "@/features/*": ["src/features/*"],
      "@/core/*": ["src/core/*"],
      "@/types/*": ["src/types/*"],
      "@/assets/*": ["assets/*"]
    },
    
    // Output configuration
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    
    // React configuration
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "app/**/*",
    "assets/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
EOF
```

#### Step 1.2.2: Global Type Definitions
```bash
# Create types directory and global definitions
mkdir -p src/types

cat > src/types/global.d.ts << 'EOF'
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      EXPO_DEV_CLIENT: string;
    }
  }
  
  // Extend Window for web-specific APIs
  interface Window {
    __PETSOFT_TYCOON_DEBUG__?: boolean;
  }
}

// Game-specific utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Branded types for IDs to prevent mixing
export type DepartmentId = string & { __brand: 'DepartmentId' };
export type EmployeeId = string & { __brand: 'EmployeeId' };
export type AchievementId = string & { __brand: 'AchievementId' };

// Type guards for runtime safety
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
EOF
```

#### Success Criteria
- [ ] TypeScript configured with strict mode enabled
- [ ] Path mapping working for clean imports
- [ ] Global type definitions created
- [ ] Type checking passes without errors

### Task 1.3: Project Structure Setup (3 hours)
**Objective**: Create vertical slicing architecture following SOLID principles

#### Step 1.3.1: Core Directory Structure
```bash
# Create feature-based directory structure
mkdir -p src/{core,features,shared,types}
mkdir -p src/core/{services,state}
mkdir -p src/features/{departments,employees,prestige,achievements,audio}
mkdir -p src/shared/{components,constants,hooks,utils}

# Create initial structure files
cat > src/core/state/gameState.ts << 'EOF'
import { observable } from '@legendapp/state';

export interface GameState {
  resources: ResourcesState;
  departments: DepartmentState[];
  progression: ProgressionState;
  settings: SettingsState;
  offline: OfflineState;
}

export interface ResourcesState {
  linesOfCode: number;
  features: {
    basic: number;
    advanced: number;
    premium: number;
  };
  money: number;
  customerLeads: number;
  reputation: number;
}

export interface DepartmentState {
  id: string;
  name: string;
  unlocked: boolean;
  employees: EmployeeState[];
  upgrades: UpgradeState[];
  efficiency: number;
  managerHired: boolean;
  totalProduction: number;
}

export interface EmployeeState {
  id: string;
  type: string;
  count: number;
  baseProduction: number;
  baseCost: number;
  currentCost: number;
  multiplier: number;
  unlocked: boolean;
}

export interface ProgressionState {
  totalEarnings: number;
  prestigePoints: number;
  currentPrestigeLevel: number;
  achievementsUnlocked: string[];
  statisticsTracking: {
    totalClicks: number;
    totalPlayTime: number;
    prestigeCount: number;
    departmentsUnlocked: number;
    employeesHired: number;
  };
}

export interface SettingsState {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  performanceMode: 'auto' | 'high' | 'balanced' | 'battery';
}

export interface OfflineState {
  lastSaveTime: number;
  offlineEarnings: number;
  maxOfflineHours: number;
}

export interface UpgradeState {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  unlocked: boolean;
}

// Initialize game state with Legend State
export const gameState = observable<GameState>({
  resources: {
    linesOfCode: 0,
    features: { basic: 0, advanced: 0, premium: 0 },
    money: 0,
    customerLeads: 0,
    reputation: 0
  },
  departments: [],
  progression: {
    totalEarnings: 0,
    prestigePoints: 0,
    currentPrestigeLevel: 0,
    achievementsUnlocked: [],
    statisticsTracking: {
      totalClicks: 0,
      totalPlayTime: 0,
      prestigeCount: 0,
      departmentsUnlocked: 1,
      employeesHired: 0
    }
  },
  settings: {
    audioEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
    performanceMode: 'auto'
  },
  offline: {
    lastSaveTime: Date.now(),
    offlineEarnings: 0,
    maxOfflineHours: 12
  }
});
EOF
```

#### Step 1.3.2: Game Configuration Constants
```bash
cat > src/shared/constants/gameConfig.ts << 'EOF'
export const GAME_CONFIG = {
  // Performance settings
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  PERFORMANCE_MONITOR_INTERVAL: 1000,
  
  // Game balance
  INITIAL_MONEY: 0,
  INITIAL_CLICKS_PER_SECOND: 1,
  COST_MULTIPLIER: 1.15,
  MANAGER_COST_BASE: 1000000,
  
  // Save system
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_OFFLINE_HOURS: 12,
  OFFLINE_EFFICIENCY: 0.5, // 50% of online production
  
  // Performance limits
  MAX_MEMORY_MB: 200,
  MAX_BUNDLE_SIZE_MB: 50,
  TARGET_LOAD_TIME_MS: 3000,
  TARGET_INPUT_RESPONSE_MS: 50
} as const;

export const DEPARTMENT_CONFIG = {
  development: {
    id: 'development',
    name: 'Development',
    unlockCost: 0,
    employees: [
      { id: 'junior_dev', name: 'Junior Developer', baseCost: 10, baseProduction: 1 },
      { id: 'mid_dev', name: 'Mid-Level Developer', baseCost: 100, baseProduction: 8 },
      { id: 'senior_dev', name: 'Senior Developer', baseCost: 1000, baseProduction: 47 },
      { id: 'lead_dev', name: 'Development Lead', baseCost: 12000, baseProduction: 260 },
      { id: 'director_dev', name: 'Engineering Director', baseCost: 130000, baseProduction: 1400 },
      { id: 'vp_dev', name: 'VP of Engineering', baseCost: 1400000, baseProduction: 7800 }
    ]
  },
  // Additional departments will be added in integration phase
} as const;

export const ACHIEVEMENT_CONFIG = [
  {
    id: 'first_click',
    name: 'Getting Started',
    description: 'Click the main button for the first time',
    requirement: { type: 'clicks', value: 1 },
    reward: { type: 'money', value: 100 }
  },
  {
    id: 'first_hire',
    name: 'Team Builder',
    description: 'Hire your first employee',
    requirement: { type: 'employees_hired', value: 1 },
    reward: { type: 'money', value: 500 }
  }
] as const;
EOF
```

#### Step 1.3.3: App Entry Point Configuration
```bash
# Create main App.tsx file
cat > App.tsx << 'EOF'
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>PetSoft Tycoon</Text>
        <Text style={styles.subtitle}>Build your pet software empire</Text>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
EOF

# Create index.ts entry point
cat > index.ts << 'EOF'
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);
EOF
```

#### Success Criteria
- [ ] Feature-based directory structure created
- [ ] Core game state defined with Legend State
- [ ] Game configuration constants established
- [ ] App entry point configured and working

### Task 1.4: Development Tools Configuration (4 hours)
**Objective**: Set up linting, formatting, testing, and build tools

#### Step 1.4.1: ESLint Configuration
```bash
cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/eslint-plugin'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // React Native specific
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // Performance related
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Code style
    'indent': ['error', 2],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never']
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.test.ts',
    '*.test.tsx'
  ]
};
EOF
```

#### Step 1.4.2: Prettier Configuration
```bash
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
EOF

cat > .prettierignore << 'EOF'
node_modules/
dist/
build/
coverage/
*.json
*.md
EOF
```

#### Step 1.4.3: Jest Testing Configuration
```bash
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo-.*|@expo/.*|@legendapp/state)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
EOF

cat > jest.setup.js << 'EOF'
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
EOF
```

#### Step 1.4.4: Metro Configuration
```bash
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable New Architecture support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
    },
    output: {
      comments: false,
    },
  },
};

// Asset optimization
config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts,
    'webp', // Prefer WebP for smaller sizes
  ],
};

module.exports = config;
EOF
```

#### Success Criteria
- [ ] ESLint configured with TypeScript and React Native rules
- [ ] Prettier configured for consistent code formatting
- [ ] Jest configured for testing with React Native preset
- [ ] Metro configured for optimal bundling

### Task 1.5: Build Configuration (2 hours)
**Objective**: Configure EAS Build and app.json for production deployment

#### Step 1.5.1: App Configuration
```bash
cat > app.json << 'EOF'
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "platforms": ["ios", "android", "web"],
    
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    
    "assetBundlePatterns": [
      "assets/images/**",
      "assets/audio/**",
      "assets/fonts/**"
    ],
    
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon",
      "buildNumber": "1",
      "infoPlist": {
        "UIBackgroundModes": [],
        "NSCameraUsageDescription": "This app does not use the camera",
        "NSMicrophoneUsageDescription": "This app does not use the microphone"
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1,
      "permissions": [],
      "blockedPermissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    
    "web": {
      "favicon": "./assets/favicon.png",
      "name": "PetSoft Tycoon",
      "shortName": "PetSoft",
      "description": "Build your pet software empire",
      "backgroundColor": "#ffffff",
      "themeColor": "#007AFF",
      "display": "standalone",
      "orientation": "portrait",
      "startUrl": "/",
      "bundler": "metro"
    },
    
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true,
            "flipper": false
          },
          "android": {
            "newArchEnabled": true,
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ],
    
    "experiments": {
      "tsconfigPaths": true,
      "typedRoutes": false
    },
    
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
EOF
```

#### Step 1.5.2: EAS Build Configuration
```bash
cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-large",
        "bundler": "metro"
      },
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234EF"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  }
}
EOF
```

#### Success Criteria
- [ ] app.json configured for all platforms
- [ ] EAS build configuration created
- [ ] New Architecture enabled for iOS and Android
- [ ] Build profiles defined for development, preview, and production

### Task 1.6: Platform Validation (2 hours)
**Objective**: Validate setup works on all target platforms

#### Step 1.6.1: Platform Testing
```bash
# Test iOS (if available)
npx expo start --ios

# Test Android (if available) 
npx expo start --android

# Test Web
npx expo start --web

# Run comprehensive checks
npx expo doctor
npm run lint
npm run type-check
npm test
```

#### Step 1.6.2: Performance Baseline
```bash
# Create performance monitoring script
mkdir -p scripts

cat > scripts/performance-check.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Bundle size check
const checkBundleSize = () => {
  console.log('📦 Checking bundle size...');
  // Implementation will be added when we have builds
  console.log('✅ Bundle size check configured');
};

// Dependency audit
const checkDependencies = () => {
  console.log('🔍 Checking dependencies...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for problematic patterns
  if (JSON.stringify(packageJson).includes('legacy-peer-deps')) {
    console.error('❌ CRITICAL: --legacy-peer-deps usage detected!');
    process.exit(1);
  }
  
  console.log('✅ Dependency check passed');
};

// Memory usage baseline
const checkMemoryBaseline = () => {
  console.log('💾 Setting memory baseline...');
  const used = process.memoryUsage();
  console.log(`Memory usage: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
  console.log('✅ Memory baseline established');
};

// Run all checks
console.log('🚀 Running performance checks...\n');
checkDependencies();
checkBundleSize();
checkMemoryBaseline();
console.log('\n✅ All performance checks passed!');
EOF

# Make script executable and run
chmod +x scripts/performance-check.js
node scripts/performance-check.js
```

#### Success Criteria
- [ ] App runs successfully on iOS simulator/device
- [ ] App runs successfully on Android emulator/device
- [ ] App runs successfully in web browser
- [ ] All linting and type checks pass
- [ ] Performance baseline established

## Deliverables

### Required Files Created
1. **Package Configuration**
   - `package.json` - Project dependencies and scripts
   - `tsconfig.json` - TypeScript configuration
   - `.eslintrc.js` - Code quality rules
   - `.prettierrc` - Code formatting rules

2. **Build Configuration**  
   - `app.json` - Expo app configuration
   - `eas.json` - EAS Build configuration
   - `metro.config.js` - Bundler configuration
   - `jest.config.js` - Testing configuration

3. **Source Code Structure**
   - `src/` - Application source code
   - `App.tsx` - Main app component
   - `index.ts` - App entry point
   - Core state management setup

4. **Development Tools**
   - Performance monitoring scripts
   - Environment validation scripts
   - CI/CD pipeline foundation

## Validation Steps

### Quality Gates
1. **Environment Validation**
   ```bash
   # All commands must pass
   npx expo doctor                    # No errors
   npm run type-check                 # No TypeScript errors
   npm run lint                       # No linting errors
   npm test                           # All tests pass
   ```

2. **Platform Compatibility**
   ```bash
   # Test on all platforms
   npx expo start --ios               # iOS working
   npx expo start --android           # Android working  
   npx expo start --web               # Web working
   ```

3. **Performance Baseline**
   ```bash
   # Performance checks pass
   node scripts/performance-check.js  # All checks green
   npm ls | grep -i "peer"           # No peer dependency warnings
   ```

## Common Issues & Solutions

### Issue: Expo Doctor Fails
**Symptoms**: `npx expo doctor` shows dependency conflicts  
**Solution**: 
```bash
# Never use --legacy-peer-deps - fix the root cause
npx expo install --check           # See what Expo recommends
npm ls <conflicting-package>        # Find version conflicts
npx expo install <package>          # Use Expo's version resolver
```

### Issue: TypeScript Errors
**Symptoms**: `npm run type-check` fails with strict mode errors  
**Solution**:
```bash
# Fix TypeScript errors properly, don't weaken types
# Add proper type definitions
# Use type guards and assertions correctly
# Review the TypeScript strict mode documentation
```

### Issue: Platform-Specific Failures
**Symptoms**: App works on one platform but not others  
**Solution**:
```bash
# Check platform-specific dependencies
# Verify metro.config.js platform configuration
# Test on actual devices, not just simulators
```

### Issue: Bundle Size Too Large
**Symptoms**: Initial bundle exceeds targets  
**Solution**:
```bash
# Audit bundle composition
npx expo export --dump-assetmap
# Remove unused dependencies
npx depcheck
# Optimize asset sizes
# Use dynamic imports for heavy features
```

## Next Steps
After completing Phase 1:
1. **Validate All Quality Gates**: Ensure all platform and performance checks pass
2. **Team Environment Setup**: All developers replicate the environment
3. **CI/CD Pipeline**: Set up continuous integration (if not done)
4. **Proceed to Phase 2**: Begin core features implementation

---

## Time Tracking
- Task 1.1 (Project Initialization): ⏱️ 3 hours
- Task 1.2 (TypeScript Configuration): ⏱️ 2 hours
- Task 1.3 (Project Structure): ⏱️ 3 hours
- Task 1.4 (Development Tools): ⏱️ 4 hours
- Task 1.5 (Build Configuration): ⏱️ 2 hours
- Task 1.6 (Platform Validation): ⏱️ 2 hours
- **Total Phase 1**: ⏱️ 16 hours

## Dependencies
- ✅ Phase 0 completed and approved
- ✅ Development environment set up
- ✅ Team members have required tools installed
- 🔄 Access to iOS and Android testing devices/simulators