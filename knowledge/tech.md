# Technology Stack

## Platform Target

- **Primary**: iOS (iPhone focus)
- **Secondary**: Android and Web browser support
- **Architecture**: Cross-platform React Native with Expo

## Core Technologies

- **Framework**: Expo (latest version) with React Native
- **Programming Language**: TypeScript
- **State Management**: Legend-state v3 (@beta)
- **UI Framework**: React Native with Expo components
- **Data Storage**: MMKV with Legend-state built-in persistence
- **Analytics**: Expo Analytics or similar tracking system

## Legend-state v3 (@beta) Persistence Guide

### Research-Based Implementation

Based on official Legend-state documentation and community patterns:

**Key Principles:**

1. **Separate Creation from Persistence**: Create observables first, then configure persistence
2. **Plugin Architecture**: Use specific plugins for different storage backends
3. **Automatic Synchronization**: Persistence happens automatically once configured
4. **Cross-platform Support**: Different plugins for different platforms

### Correct Persistence Pattern

```typescript
// Make sure MMKV is installed, if not: npm i react-native-mmkv
// Then configure it as the persist plugin.

import { syncObservable } from '@legendapp/state/sync'
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'
const state$ = observable({
    settings: { theme: 'dark' }
})
syncObservable(state$, {
    persist: {
        name: "documents",
        plugin: ObservablePersistMMKV
    }
})
```

### Configuration and Setup

```typescript
// Global configuration (optional, do once at app startup)
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";

// Enable React tracking for better performance
enableReactTracking();
```

### React Integration

```typescript
import { observer } from "@legendapp/state/react";

// Components that read observable state must be wrapped with observer
const MyComponent = observer(() => {
  const character = characterState.get();
  return <Text>{character.name}</Text>;
});
```

### Common Issues and Solutions

1. **Import Errors**:
   - `persistObservable` may not be exported from main package
   - Try importing from `@legendapp/state/sync` instead
   - Check package.json exports for correct paths

2. **Plugin Configuration**:
   - MMKV plugin requires `react-native-mmkv` peer dependency
   - Web fallback needed for cross-platform apps
   - Encryption only works on native platforms

3. **Persistence Not Working**:
   - Ensure persistence is configured after observable creation
   - Check that storage plugin is properly initialized
   - Verify platform-specific requirements are met

### Debugging Persistence

```typescript
// Add logging to verify persistence is working
persistObservable(state, {
  local: plugin,
  onLoad: () => console.log("Data loaded from storage"),
  onSave: () => console.log("Data saved to storage"),
});
```

const CharacterSheet = observer(() => {
const character = characterState.get();

return (
<View>
<Text>{character.name}</Text>
<Text>Level: {character.level}</Text>
</View>
);
});

// For fine-grained reactivity, access specific properties
const CharacterName = observer(() => {
// This component only re-renders when name changes
const name = characterState.name.get();
return <Text>{name}</Text>;
});

````

### State Mutations

```typescript
// Direct mutations (automatically persisted)
characterState.name.set("NewName");
characterState.level.set(5);

// Batch mutations for performance
characterState.assign({
  level: 10,
  experience: 2500,
  attributes: {
    ...characterState.attributes.get(),
    strength: 15,
  },
});

// Computed values
const totalAttributePoints = computed(() => {
  const attrs = characterState.attributes.get();
  return Object.values(attrs).reduce((sum, val) => sum + val, 0);
});
````

### Persistence Lifecycle

```typescript
// Wait for persistence to load before rendering
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
  // Legend-state v3 provides persistence status
  const unsubscribe = characterState.onChange(({ isLoaded }) => {
    if (isLoaded) {
      setIsLoaded(true);
    }
  });

  return unsubscribe;
}, []);

if (!isLoaded) {
  return <LoadingScreen />;
}
```

### Error Handling

```typescript
// Handle persistence errors
characterState.persist.onError((error) => {
  console.error("Persistence error:", error);
  // Implement fallback or user notification
});

// Check persistence status
const isPersisting = characterState.persist.isPersisting.get();
const lastSaved = characterState.persist.lastSaved.get();
```

### Performance Optimizations

1. **Fine-grained Subscriptions**: Access specific properties instead of entire objects
2. **Batch Updates**: Use `assign()` for multiple property updates
3. **Computed Values**: Use `computed()` for derived state
4. **Selective Persistence**: Configure which parts of state to persist

### Migration from v2 to v3

Key changes when upgrading:

- `onChange` callback signature changed
- Persistence configuration moved to observable creation
- New `configureLegendState` for global settings
- Enhanced TypeScript support requires type annotations

## Key Technical Requirements

### Performance Optimization

- Battery-efficient idle processing using React Native background tasks
- Smart calculation throttling with requestAnimationFrame
- Memory management for extended play sessions
- Offline progression calculation (up to 12 hours) using MMKV

### Data Management

- MMKV for high-performance local storage
- Legend-state for reactive state management with built-in persistence
- Cross-device synchronization support
- Automatic save during critical moments
- Recovery systems for data corruption

### Calculation Engine

- JavaScript-based attribute and skill calculations
- Real-time combat resolution with damage formulas
- Experience distribution and skill advancement
- Equipment effectiveness scaling

## Project Bootstrap

### Initial Setup (Expo Best Practices)

```bash
# Create new Expo project with Navigation/Tabs template (includes Expo Router setup)
npx create-expo-app@latest AshersonsCallIdler --template tabs

# Navigate to project directory
cd AshersonsCallIdler

# Install additional dependencies
npx expo install @legendapp/state@beta
npx expo install react-native-mmkv
npx expo install expo-constants

# Development dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev @expo/eslint-config
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# iOS specific (if targeting iPhone primarily)
npx expo install expo-dev-client
```

### IMPORTANT: Expo Router Setup

When setting up Expo Router manually (not using the tabs template), ensure:

1. **Package.json main entry**: Must be `"main": "expo-router/entry"`
2. **App.json plugin**: Must include `"plugins": ["expo-router"]` in the expo config
3. **Required dependencies**: Install `react-native-safe-area-context`, `react-native-screens`, `expo-linking`, `expo-splash-screen`
4. **No conflicting App.tsx**: Remove any existing App.tsx file when using Expo Router
5. **App directory structure**: Use `app/_layout.tsx` and `app/index.tsx` for routing

### Recommended Approach

Use the `--template tabs` when creating new projects to get proper Expo Router setup automatically, then customize as needed.

### Configuration Files Setup

```bash
# Initialize TypeScript config (if not already present)
npx tsc --init

# Setup ESLint (use Expo's recommended config)
# Create .eslintrc.js manually with Expo config

# Create Prettier config
echo '{"semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5"}' > .prettierrc

# Setup Jest config for React Native
npx jest --init
```

### ESLint and Prettier Best Practices for Expo

#### Recommended ESLint Configuration

Use Expo's official ESLint config as the base, which includes React Native and TypeScript rules:

```javascript
// .eslintrc.js
module.exports = {
  extends: ["expo", "@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    "react-native/react-native": true,
  },
};
```

#### Recommended Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid"
}
```

#### Package.json Scripts for Development

Add these scripts to package.json for consistent development workflow:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --fix",
    "lint:check": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint:check && npm run format:check"
  }
}
```

#### TypeScript Configuration Enhancements

Enhance tsconfig.json with strict settings and path mapping:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/shared/*"],
      "@/features/*": ["src/features/*"],
      "@/data/*": ["src/data/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

#### VS Code Integration

Create .vscode/settings.json for consistent editor behavior:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

#### Installation Order and Dependencies

Install development dependencies in this specific order to avoid conflicts:

```bash
# Core TypeScript and React types
npm install --save-dev @types/react @types/react-native typescript

# ESLint with Expo config (includes React Native rules)
npm install --save-dev eslint @expo/eslint-config

# TypeScript ESLint support
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Prettier integration
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# React Native specific ESLint rules (if not included in @expo/eslint-config)
npm install --save-dev eslint-plugin-react-native
```

#### Common Issues and Solutions

1. **Expo ESLint Config Not Found**: Ensure @expo/eslint-config is installed and extends 'expo' in .eslintrc.js
2. **TypeScript Path Mapping**: Configure baseUrl and paths in tsconfig.json for clean imports
3. **Prettier Conflicts**: Always put 'prettier' last in extends array to override other formatting rules
4. **React Native Rules**: Use eslint-plugin-react-native for platform-specific linting
5. **Performance**: Use .eslintignore to exclude node_modules, .expo, and build directories

#### Pre-commit Hooks (Optional)

For teams, consider adding Husky for pre-commit linting:

```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Command Execution Guidelines

**CRITICAL ISSUES WITH executePwsh TOOL ON WINDOWS:**

The executePwsh tool has several problematic behaviors that cause consistent failures:

1. **Working Directory Instability**: The working directory frequently resets to workspace root between commands
2. **Path Parameter Issues**: Using the path parameter causes "system cannot find path" errors
3. **Shell Confusion**: Tool claims to be PowerShell but actually runs cmd.exe
4. **Command Chaining Failures**: Semicolon syntax and complex commands fail unpredictably
5. **Development Server Issues**: Starting development servers (`npx expo start`) can hang or fail to terminate properly

**MANDATORY APPROACH FOR RELIABLE COMMAND EXECUTION:**

1. **Always check current directory first**: Use `dir` before any npm/expo commands
2. **Navigate explicitly when needed**: Use `cd AshersonsCallIdler` as separate command if not in project directory
3. **Never use path parameter**: Always use executePwsh without path parameter
4. **One simple command per call**: Never chain commands or use complex syntax
5. **Verify success**: Check command output for actual success, not just completion
6. **Don't ignore failures**: Address "system cannot find path" errors immediately

**VERIFICATION STRATEGY:**

For task completion verification:

1. **Use TypeScript compilation only**: `npx tsc --noEmit --skipLibCheck` for syntax verification
2. **Manual testing required**: Alert user to manually test functionality
3. **Never start development servers**: Avoid `npx expo start` or similar commands
4. **Focus on code quality**: Ensure imports, types, and logic are correct

**Correct Command Sequence:**

```bash
# Step 1: Check where you are
dir

# Step 2: Navigate if needed (separate command)
cd AshersonsCallIdler

# Step 3: Verify you're in the right place
dir

# Step 4: Run compilation check only
npx tsc --noEmit --skipLibCheck
```

**NEVER DO THIS:**

```bash
# Bad - using path parameter
executePwsh(path="AshersonsCallIdler", command="npm install")

# Bad - command chaining
cd AshersonsCallIdler ; npm install

# Bad - starting development servers
npx expo start --web

# Bad - assuming working directory persists
# (running npm commands without checking directory first)
```

**DEBUGGING COMMAND FAILURES:**

When commands fail:

1. **Check the actual error message** - don't ignore "system cannot find path" errors
2. **Verify working directory** with `dir` command
3. **Navigate explicitly** if in wrong directory
4. **Try command again** after confirming location
5. **Update steering** if new failure patterns emerge
6. **Never proceed without fixing command execution issues**

**ADDITIONAL COMMAND EXECUTION ISSUES DISCOVERED:**

- **Command hanging/pausing**: The executePwsh tool sometimes hangs indefinitely on certain commands
- **Complex command chaining fails**: Commands with `&&` or `pushd/popd` cause unpredictable behavior
- **TypeScript compilation checks**: Use manual file inspection instead of `npx tsc --noEmit` when command execution is unreliable
- **Alternative verification**: When compilation checks fail, manually review TypeScript files for syntax errors and import issues
- **Jest CLI issues**: Jest does not support `--run` flag. Use `--watchAll=false` to run tests without watch mode, or run specific tests with `npm test -- TestFile.test.tsx`
- **Development server termination**: Use `taskkill /F /IM node.exe` is unreliable - user should manually stop servers

### Troubleshooting Expo Router

If you see the default App.tsx instead of your Expo Router screens:

1. **Check package.json**: Ensure `"main": "expo-router/entry"`
2. **Check app.json**: Ensure `"plugins": ["expo-router"]` is present
3. **Remove App.tsx**: Delete any existing App.tsx file
4. **Install ALL required dependencies**:
   - `react-native-safe-area-context`
   - `react-native-screens`
   - `expo-linking`
   - `expo-splash-screen`
5. **Update layout**: Wrap root layout with `SafeAreaProvider`
6. **Restart development server**: Clear cache with `npx expo start --clear`

### Common Expo Router Issues

- **"Cannot resolve expo-router/entry"**: Install expo-router and required dependencies
- **"Unable to resolve ../Utilities/Platform"**: Missing navigation dependencies (safe-area-context, screens)
- **App.tsx still showing**: Remove App.tsx file and ensure package.json main entry is correct
- **Navigation not working**: Check that app/\_layout.tsx exists and is properly configured
- **Blank screen**: Ensure app/index.tsx exists and exports a default component
- **Web bundling fails**: Ensure all navigation dependencies are installed

### Required Dependencies for Manual Expo Router Setup

When adding Expo Router to a blank template, you MUST install these dependencies:

```bash
npm install react-native-safe-area-context react-native-screens expo-linking expo-splash-screen
```

These are not optional - Expo Router will fail without them.

## Development Commands

### Expo Development

```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npx expo start

# Run on iOS simulator (primary target)
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web
npx expo start --web

# Clear cache and restart
npx expo start --clear

# Build for production (EAS Build)
npx eas build --platform ios
npx eas build --platform android
npx eas build --platform web

# Submit to app stores
npx eas submit --platform ios
npx eas submit --platform android

# Run tests
npm test
# or
yarn test

# Run specific test file (Jest doesn't support --run flag)
npm test -- SpecificTest.test.tsx
# or run tests without watch mode
npm test -- --watchAll=false

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx

# Format code
npx prettier --write .
```

### EAS (Expo Application Services) Setup

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to Expo account
npx eas login

# Initialize EAS in project
npx eas build:configure

# Create development build
npx eas build --profile development --platform ios

# Create preview build for testing
npx eas build --profile preview --platform ios
```

### Development Tools

- **Metro Bundler**: For React Native bundling
- **TypeScript**: For type safety and better development experience
- **ESLint + Prettier**: Code formatting and linting
- **Jest**: Unit testing framework
- **Expo Dev Tools**: Development and debugging

## Analytics & Monitoring

- Player behavior tracking for balance optimization
- Performance monitoring for battery and memory usage
- A/B testing framework for UI and balance changes
- Live balance adjustment capabilities through over-the-air updates
