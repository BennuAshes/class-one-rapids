# Phase 01: Foundation - Project Setup, Dependencies, Configuration

## Objectives

- Set up Expo SDK 53 project with TypeScript
- Install and configure Legend-State v3 beta
- Implement core infrastructure (EventBus, Result types)
- Create feature folder structure
- Establish development workflow

## Success Criteria

- [ ] Expo project running on development device
- [ ] Legend-State observables working correctly
- [ ] EventBus implementation functional
- [ ] Feature folder structure created
- [ ] Basic save/load system operational
- [ ] Development hot reload working

## Time Estimate: 1 Week

---

## Task 1: Project Initialization

### 1.1 Create Expo Project (30 minutes)

**Objective**: Initialize new Expo project with TypeScript

**Commands**:
```bash
# Create project with TypeScript template
npx create-expo-app PetSoftTycoon --template typescript

# Navigate to project
cd PetSoftTycoon

# Verify project structure
ls -la
```

**Expected Structure**:
```
PetSoftTycoon/
├── App.tsx
├── app.json
├── babel.config.js
├── package.json
├── tsconfig.json
├── assets/
└── node_modules/
```

**Validation**:
```bash
# Start development server
npx expo start

# Verify app loads correctly
# Should show "Open up App.tsx to start working on your app!"
```

### 1.2 Install Core Dependencies (15 minutes)

**Objective**: Add required packages using expo install

**Core Dependencies**:
```bash
# State Management (CRITICAL: Use beta version)
npx expo install @legendapp/state@beta

# Additional utilities
npx expo install react-native-async-storage
npx expo install expo-haptics
npx expo install expo-av
```

**Development Dependencies**:
```bash
# Testing framework
npm install --save-dev jest @types/jest
npm install --save-dev @testing-library/react-native

# Code quality
npm install --save-dev eslint prettier
npm install --save-dev @typescript-eslint/eslint-plugin
```

**Validation**:
```bash
# Check for version conflicts
npx expo install --check

# Verify no peer dependency warnings
npm ls --depth=0
```

### 1.3 Project Configuration (45 minutes)

**Objective**: Configure development environment and standards

**Update app.json**:
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": ["ios", "android"],
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

**Create .eslintrc.js**:
```javascript
module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Vertical slicing enforcement
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*/features/*'],
            message: 'Cross-feature imports not allowed. Use EventBus instead.'
          }
        ]
      }
    ],
    // State management rules
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

**Create prettier.config.js**:
```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5'
};
```

**Validation**: ESLint and Prettier run without errors

---

## Task 2: Core Infrastructure Implementation

### 2.1 EventBus Implementation (2 hours)

**Objective**: Create robust event system for feature coordination

**Create src/core/EventBus.ts**:
```typescript
type EventHandler<T = any> = (data: T) => void | Promise<void>;

interface EventSubscription {
  unsubscribe(): void;
}

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private isDestroyed = false;

  public emit<T>(event: string, data: T): void {
    if (this.isDestroyed) return;
    
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    // Execute handlers asynchronously to prevent blocking
    Promise.resolve().then(() => {
      eventHandlers.forEach(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`EventBus: Error in handler for ${event}:`, error);
        }
      });
    });
  }

  public on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (this.isDestroyed) {
      throw new Error('EventBus has been destroyed');
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    return {
      unsubscribe: () => {
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
          eventHandlers.delete(handler);
          if (eventHandlers.size === 0) {
            this.handlers.delete(event);
          }
        }
      }
    };
  }

  public once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const subscription = this.on<T>(event, async (data) => {
      subscription.unsubscribe();
      await handler(data);
    });
    return subscription;
  }

  public off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(event);
    } else {
      const eventHandlers = this.handlers.get(event);
      if (eventHandlers) {
        eventHandlers.delete(handler);
        if (eventHandlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    }
  }

  public destroy(): void {
    this.handlers.clear();
    this.isDestroyed = true;
  }

  // Development helper
  public getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Global instance
export const eventBus = new EventBus();
```

**Create src/core/EventTypes.ts**:
```typescript
// Resource Events
export interface ResourceGeneratedEvent {
  type: 'linesOfCode' | 'basicFeatures' | 'advancedFeatures' | 'premiumFeatures' | 'revenue';
  amount: number;
  source: string;
  deltaTime?: number;
}

export interface ResourceConsumedEvent {
  type: 'linesOfCode' | 'basicFeatures' | 'advancedFeatures' | 'premiumFeatures' | 'revenue';
  amount: number;
  purpose: string;
}

export interface FundsRequestEvent {
  amount: number;
  purpose: string;
  requester: string;
}

export interface FundsResponseEvent {
  success: boolean;
  error?: string;
}

// Employee Events
export interface EmployeeHiredEvent {
  department: string;
  employeeType: string;
  cost: number;
  newCount: number;
}

export interface ProductionEvent {
  department: string;
  amount: number;
  rate: number;
  deltaTime: number;
}

// Department Events
export interface DepartmentUnlockedEvent {
  department: string;
  milestone: number;
  unlockRequirement: string;
}

// UI Events
export interface ClickEvent {
  element: string;
  position: { x: number; y: number };
  timestamp: number;
}

export interface NavigationEvent {
  from: string;
  to: string;
  method: 'tap' | 'swipe' | 'programmatic';
}

// Game Events
export interface GameStateEvent {
  type: 'save' | 'load' | 'reset' | 'pause' | 'resume';
  timestamp: number;
}
```

**Validation**:
```typescript
// Test EventBus functionality
const testHandler = (data: ResourceGeneratedEvent) => {
  console.log('Resource generated:', data);
};

const subscription = eventBus.on('resources.generated', testHandler);
eventBus.emit('resources.generated', { 
  type: 'linesOfCode', 
  amount: 10, 
  source: 'test' 
});
subscription.unsubscribe();
```

### 2.2 Result Type Implementation (1 hour)

**Objective**: Implement error handling pattern for service methods

**Create src/core/Result.ts**:
```typescript
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export const Result = {
  ok<T>(data: T): Success<T> {
    return { success: true, data };
  },

  err<E>(error: E): Failure<E> {
    return { success: false, error };
  },

  from<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  },

  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const data = await fn();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Helper functions
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.success;
}

// Common error types
export class InsufficientFundsError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient funds: required ${required}, available ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

export class InvalidOperationError extends Error {
  constructor(operation: string, reason: string) {
    super(`Invalid operation '${operation}': ${reason}`);
    this.name = 'InvalidOperationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}
```

**Validation**:
```typescript
// Test Result patterns
const divide = (a: number, b: number): Result<number, string> => {
  if (b === 0) return Result.err('Division by zero');
  return Result.ok(a / b);
};

const result = divide(10, 2);
if (isSuccess(result)) {
  console.log('Result:', result.data); // 5
}
```

### 2.3 Legend-State Integration (1.5 hours)

**Objective**: Set up reactive state management foundation

**Create src/core/StateManager.ts**:
```typescript
import { observable, computed, enableReactUse } from '@legendapp/state';

// Enable React hooks
enableReactUse();

// Base service class for all features
export abstract class BaseService {
  protected abstract _state$: any;
  
  // Helper for safe state access
  protected peek<T>(selector: () => T): T {
    return selector();
  }

  // Helper for state updates
  protected update<T>(updater: () => void): void {
    updater();
  }

  // Cleanup method for service destruction
  public destroy(): void {
    // Override in subclasses if needed
  }
}

// Service registry for dependency injection
class ServiceRegistry {
  private services = new Map<string, any>();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service;
  }
  
  clear(): void {
    // Destroy all services
    this.services.forEach(service => {
      if (service.destroy) service.destroy();
    });
    this.services.clear();
  }
}

export const serviceRegistry = new ServiceRegistry();

// Helper for creating observable stores
export function createStore<T>(initialState: T) {
  return observable(initialState);
}

// Helper for creating computed values
export function createComputed<T>(computation: () => T) {
  return computed(computation);
}
```

**Create src/core/types.ts**:
```typescript
// Common types across features
export interface Point {
  x: number;
  y: number;
}

export interface TimeStamp {
  created: number;
  updated: number;
}

export interface Identifiable {
  id: string;
}

export interface Purchasable {
  cost: number;
  purchased: boolean;
}

export interface Upgradeable {
  level: number;
  maxLevel?: number;
}

// Resource types
export type ResourceType = 
  | 'linesOfCode' 
  | 'basicFeatures' 
  | 'advancedFeatures' 
  | 'premiumFeatures' 
  | 'revenue'
  | 'leads'
  | 'tickets'
  | 'insights'
  | 'intellectualProperty';

export interface ResourceAmount {
  type: ResourceType;
  amount: number;
}

export interface Cost {
  currency: 'revenue';
  amount: number;
}

// Employee types
export interface EmployeeType {
  id: string;
  name: string;
  department: string;
  baseCost: number;
  productionRate: number;
  description: string;
}

// Department types
export interface Department {
  id: string;
  name: string;
  unlocked: boolean;
  unlockThreshold: number;
  unlockCurrency: ResourceType;
}
```

**Validation**:
```bash
# Test Legend-State setup
npm run test -- --testNamePattern="StateManager"
```

---

## Task 3: Feature Folder Structure

### 3.1 Create Folder Structure (30 minutes)

**Objective**: Establish consistent feature organization

**Commands**:
```bash
# Create main structure
mkdir -p src/{core,features,components,utils,assets}

# Create feature folders
mkdir -p src/features/{clicking,currency,employees,departments,upgrades,managers,prestige,progression,ui,persistence}

# Create standard files for each feature
for feature in clicking currency employees departments upgrades managers prestige progression ui persistence; do
  mkdir -p "src/features/$feature/components"
  mkdir -p "src/features/$feature/types" 
  mkdir -p "src/features/$feature/utils"
  touch "src/features/$feature/${feature^}Service.ts"
  touch "src/features/$feature/${feature^}Events.ts"
  touch "src/features/$feature/index.ts"
done
```

**Expected Structure**:
```
src/
├── core/                    # Core infrastructure
│   ├── EventBus.ts
│   ├── Result.ts
│   ├── StateManager.ts
│   └── types.ts
├── features/                # Feature modules
│   ├── clicking/
│   │   ├── ClickingService.ts
│   │   ├── ClickingEvents.ts
│   │   ├── components/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── currency/
│   │   ├── CurrencyService.ts
│   │   ├── CurrencyEvents.ts
│   │   ├── components/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   └── [other features...]
├── components/              # Shared UI components
├── utils/                   # Shared utilities
└── assets/                  # Images, sounds, etc.
```

### 3.2 Feature Index Templates (1 hour)

**Objective**: Create consistent public API pattern

**Template for src/features/*/index.ts**:
```typescript
// Public API exports only - no internal implementation details

export { [Feature]Service } from './[Feature]Service';
export type { 
  [Feature]Events,
  [Feature]State,
  [Feature]Config 
} from './types/[Feature]Types';

// Re-export any public types needed by other features
export type { PublicType } from './types/PublicTypes';

// Do NOT export:
// - Internal state observables
// - Private methods
// - Implementation details
// - Internal event handlers
```

**Example for src/features/currency/index.ts**:
```typescript
export { CurrencyService } from './CurrencyService';
export type { 
  ResourceType,
  ResourceAmount,
  CurrencyBalance,
  CurrencyEvents 
} from './types/CurrencyTypes';
```

### 3.3 Service Base Templates (2 hours)

**Objective**: Create service templates following patterns

**Template for [Feature]Service.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result } from '../../core/Result';
import type { [Feature]State, [Feature]Config } from './types/[Feature]Types';

export class [Feature]Service extends BaseService {
  // Private state - never expose directly
  protected _state$ = observable<[Feature]State>({
    // Initial state here
  });

  // Computed values for UI consumption
  private _displayData$ = computed(() => ({
    // Computed display values
  }));

  constructor(config?: [Feature]Config) {
    super();
    // Initialize with config
    this._setupEventListeners();
  }

  // Public capabilities only
  public performAction(params: ActionParams): Result<ActionResult, ActionError> {
    // Validate inputs
    if (!this._validateAction(params)) {
      return Result.err(new ActionError('Invalid parameters'));
    }

    // Perform action
    try {
      const result = this._executeAction(params);
      this._emitEvents(result);
      return Result.ok(result);
    } catch (error) {
      return Result.err(error as ActionError);
    }
  }

  // Read-only data for UI
  public getDisplayData() {
    return this._displayData$.peek();
  }

  // Subscription for reactive updates
  public subscribe(callback: (data: DisplayData) => void) {
    return this._displayData$.onChange(callback);
  }

  // Private methods
  private _setupEventListeners(): void {
    // Listen to events from other features
    eventBus.on('relevant.event', this._handleEvent.bind(this));
  }

  private _handleEvent(data: EventData): void {
    // Handle events from other features
  }

  private _validateAction(params: ActionParams): boolean {
    // Validation logic
    return true;
  }

  private _executeAction(params: ActionParams): ActionResult {
    // Core business logic
    return {} as ActionResult;
  }

  private _emitEvents(result: ActionResult): void {
    // Emit events for other features
    eventBus.emit('feature.action.completed', result);
  }

  public destroy(): void {
    // Cleanup subscriptions
    super.destroy();
  }
}
```

**Validation**: Each service follows the established pattern

---

## Task 4: Basic Save System

### 4.1 Persistence Service (2 hours)

**Objective**: Implement save/load functionality

**Create src/features/persistence/PersistenceService.ts**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Result } from '../../core/Result';

interface SaveData {
  version: string;
  timestamp: number;
  gameState: {
    currency: any;
    employees: any;
    departments: any;
    upgrades: any;
    progression: any;
    prestige: any;
  };
}

export class PersistenceService {
  private static readonly SAVE_KEY = 'petsoft_tycoon_save';
  private static readonly VERSION = '1.0.0';
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  private autoSaveTimer?: NodeJS.Timeout;

  constructor() {
    this.startAutoSave();
  }

  public async save(gameState: SaveData['gameState']): Promise<Result<void, Error>> {
    try {
      const saveData: SaveData = {
        version: PersistenceService.VERSION,
        timestamp: Date.now(),
        gameState
      };

      const serialized = JSON.stringify(saveData);
      await AsyncStorage.setItem(PersistenceService.SAVE_KEY, serialized);
      
      console.log('Game saved successfully');
      return Result.ok(undefined);
    } catch (error) {
      console.error('Save failed:', error);
      return Result.err(error as Error);
    }
  }

  public async load(): Promise<Result<SaveData['gameState'] | null, Error>> {
    try {
      const serialized = await AsyncStorage.getItem(PersistenceService.SAVE_KEY);
      
      if (!serialized) {
        return Result.ok(null); // No save data
      }

      const saveData: SaveData = JSON.parse(serialized);
      
      // Version compatibility check
      if (saveData.version !== PersistenceService.VERSION) {
        console.warn('Save version mismatch, attempting migration');
        const migrated = this.migrateSave(saveData);
        if (!migrated.success) {
          return migrated;
        }
        saveData.gameState = migrated.data;
      }

      return Result.ok(saveData.gameState);
    } catch (error) {
      console.error('Load failed:', error);
      return Result.err(error as Error);
    }
  }

  public async reset(): Promise<Result<void, Error>> {
    try {
      await AsyncStorage.removeItem(PersistenceService.SAVE_KEY);
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  private migrateSave(saveData: SaveData): Result<SaveData['gameState'], Error> {
    // Handle save version migrations
    // For now, just return the data as-is
    return Result.ok(saveData.gameState);
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      // Auto-save will be triggered by game state changes
      console.log('Auto-save triggered');
    }, PersistenceService.AUTO_SAVE_INTERVAL);
  }

  public destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}
```

**Validation**:
```typescript
// Test save/load functionality
const persistence = new PersistenceService();
const testData = { currency: { revenue: 1000 } };

persistence.save(testData).then(result => {
  if (result.success) {
    persistence.load().then(loadResult => {
      console.log('Loaded:', loadResult.data);
    });
  }
});
```

---

## Task 5: Development Workflow

### 5.1 Hot Reload Setup (30 minutes)

**Objective**: Ensure smooth development experience

**Update package.json scripts**:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

**Create development helper script (scripts/dev.sh)**:
```bash
#!/bin/bash
# Development helper script

echo "Starting PetSoft Tycoon development..."

# Check for issues
npx expo doctor

# Install any missing dependencies
npx expo install --check

# Start with cache clear
npx expo start --clear
```

### 5.2 Basic App Integration (1 hour)

**Objective**: Wire up core services in main App.tsx

**Update App.tsx**:
```typescript
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { eventBus } from './src/core/EventBus';
import { PersistenceService } from './src/features/persistence/PersistenceService';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [persistenceService] = useState(() => new PersistenceService());

  useEffect(() => {
    initializeApp();
    return () => {
      persistenceService.destroy();
      eventBus.destroy();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Load save data
      const loadResult = await persistenceService.load();
      if (loadResult.success) {
        console.log('Game loaded:', loadResult.data ? 'existing save' : 'new game');
      }

      // Initialize services (will be added in next phase)
      
      setIsLoaded(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert('Error', 'Failed to initialize game');
    }
  };

  const testEventBus = () => {
    eventBus.emit('test.event', { message: 'Hello from EventBus!' });
  };

  const testSave = async () => {
    const result = await persistenceService.save({
      currency: { revenue: 1000 },
      employees: {},
      departments: {},
      upgrades: {},
      progression: {},
      prestige: {}
    });
    
    Alert.alert(
      'Save Test', 
      result.success ? 'Save successful!' : 'Save failed!'
    );
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading PetSoft Tycoon...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      <Text style={styles.subtitle}>Foundation Phase Complete</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Test EventBus" onPress={testEventBus} />
        <Button title="Test Save" onPress={testSave} />
      </View>
      
      <Text style={styles.info}>
        • Expo SDK 53 ✓{'\n'}
        • Legend-State v3 beta ✓{'\n'}
        • EventBus ✓{'\n'}
        • Save System ✓{'\n'}
        • Feature Structure ✓
      </Text>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 30,
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
});
```

**Validation**: App runs and displays foundation status

---

## Deliverables

### Project Setup
- [ ] Expo SDK 53 project created and running
- [ ] Legend-State v3 beta installed and configured
- [ ] TypeScript configuration optimized
- [ ] Development scripts and tools ready

### Core Infrastructure
- [ ] EventBus implementation complete and tested
- [ ] Result type system implemented
- [ ] Service base classes and patterns established
- [ ] Error handling patterns defined

### Feature Structure
- [ ] Feature folder structure created
- [ ] Service templates implemented
- [ ] Public API patterns established
- [ ] Cross-feature communication patterns tested

### Development Workflow
- [ ] Hot reload working correctly
- [ ] Code quality tools configured
- [ ] Save/load system functional
- [ ] Development helper scripts ready

---

## Validation Checklist

- [ ] `npx expo start` launches without errors
- [ ] Hot reload updates code changes immediately
- [ ] EventBus can emit and receive events
- [ ] Save/load operations work correctly
- [ ] All ESLint rules pass
- [ ] TypeScript compilation succeeds
- [ ] All feature folders follow established patterns
- [ ] No cross-feature imports (enforced by ESLint)

---

## Troubleshooting

### Common Issues

**Version Conflicts**:
```bash
# If you see peer dependency warnings
npx expo install --check
npx expo install --fix

# Never use legacy-peer-deps
# Instead, find compatible versions
```

**Metro Cache Issues**:
```bash
# Clear Metro cache
npx expo start --clear

# Reset node modules if needed
rm -rf node_modules
npm install
```

**TypeScript Errors**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Verify types are installed
npx expo install --check
```

**EventBus Not Working**:
```typescript
// Verify EventBus is imported correctly
import { eventBus } from './src/core/EventBus';

// Check event names match exactly
eventBus.emit('test.event', data);
eventBus.on('test.event', handler);
```

---

**Next Phase**: Proceed to [02-core-features.md](./02-core-features.md) for core game loop implementation.