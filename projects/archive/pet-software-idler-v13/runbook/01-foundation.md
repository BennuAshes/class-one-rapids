# Phase 1: Foundation Setup

## 🎯 Objectives
- Initialize React Native project with Expo SDK 52
- Configure TypeScript with strict mode
- Set up Legend State for state management
- Create base architecture structure

## ✅ Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git initialized

## 📋 Tasks

### 1.1 Project Initialization
```bash
# Create new Expo project
npm create expo-app@latest PetSoftTycoon -- --template blank-typescript
cd PetSoftTycoon

# Verify Expo SDK version
npx expo --version
```

### 1.2 Core Dependencies
```bash
# Install Legend State beta (critical for performance)
npm install @legendapp/state@beta

# Install core game dependencies
npm install react-native-reanimated react-native-gesture-handler
npm install react-native-safe-area-context react-native-screens
npm install expo-av expo-haptics expo-font

# Development dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev prettier eslint typescript
```

### 1.3 TypeScript Configuration
Create `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "jsx": "react-native",
    "module": "esnext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

### 1.4 Metro Configuration
Create `metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for Legend State
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require'
];

module.exports = config;
```

### 1.5 Project Structure
```bash
# Create vertical slice architecture
mkdir -p src/{core,features,shared}
mkdir -p src/core/{state,services,hooks}
mkdir -p src/features/{departments,employees,prestige,ui}
mkdir -p src/shared/{components,utils,constants}

# Create initial files
touch src/core/state/gameState.ts
touch src/core/services/gameLoop.ts
touch src/shared/constants/gameConfig.ts
```

### 1.6 Initial State Setup
Create `src/core/state/gameState.ts`:
```typescript
import { observable } from '@legendapp/state';

export const gameState$ = observable({
  money: 0,
  valuation: 0,
  employees: [],
  departments: {},
  prestige: {
    level: 0,
    points: 0
  },
  settings: {
    sfxEnabled: true,
    musicEnabled: true,
    autoSave: true
  }
});
```

## 🧪 Validation
```bash
# Run TypeScript check
npx tsc --noEmit

# Start development server
npx expo start

# Verify no errors in console
# App should display on device/simulator
```

## ⏱️ Time Estimate
- Project setup: 30 minutes
- Dependencies: 30 minutes
- Configuration: 1 hour
- Structure creation: 1 hour
- State setup: 1 hour
- Total: **4 hours**

## ⚠️ Common Issues
- Ensure Expo SDK is exactly ~52.0.0
- Use @legendapp/state@beta, not stable
- Clear Metro cache if hot reload issues: `npx expo start -c`

## ✅ Success Criteria
- [ ] Project runs without errors
- [ ] TypeScript strict mode enabled
- [ ] Legend State configured
- [ ] Vertical slice structure created
- [ ] Basic state observable working