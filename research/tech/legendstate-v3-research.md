# Legend State v3 Research for React Native

## Overview

Legend State v3 is a significant update with improved performance, better React Native support, and a powerful sync/persistence system. The v3 beta is currently available at `@legendapp/state@beta`.

## Key API Changes from v2 to v3

### 1. Observable Creation
- Still use `observable()` but with improved TypeScript support 
- Lazy computed values can be defined directly in the observable
- Better support for nested observables

### 2. React Integration
- `use$()` hook remains the primary way to consume observables
- `observer()` HOC for making components reactive
- React Native specific components from `@legendapp/state/react-native`

### 3. Persistence System
- New unified sync/persist API with `syncObservable()`
- Configurable sync system with `configureSynced()`
- MMKV plugin available at `@legendapp/state/persist-plugins/mmkv`

### 4. Computed Values
- Can define computed properties as functions directly in the observable
- Automatic dependency tracking
- Lazy evaluation for performance

## MMKV Integration for React Native

### Requirements
- react-native-mmkv v3 requires React Native 0.74+ with new architecture
- For older RN versions, use react-native-mmkv v2.x

### Setup Process

1. **Install Dependencies**
```bash
npm install @legendapp/state@beta react-native-mmkv
cd ios && pod install
```

2. **Create MMKV Instance**
```javascript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'pet-software-idler',
  encryptionKey: 'optional-encryption-key'
});
```

3. **Configure Legend State Persistence**
```javascript
import { configureSynced, synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

export const mySynced = configureSynced(synced, {
  persist: {
    plugin: ObservablePersistMMKV,
    mmkv: storage
  }
});
```

4. **Create Persisted Observables**
```javascript
import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';

// Method 1: Using synced
const state$ = observable({
  data: mySynced({
    initial: { /* initial state */ },
    persist: { name: 'data-key' }
  })
});

// Method 2: Using syncObservable
const state$ = observable({ /* state */ });
syncObservable(state$, {
  persist: {
    name: 'state-key',
    plugin: ObservablePersistMMKV,
    mmkv: storage
  }
});
```

## Best Practices for Pet Software Idler

### 1. State Structure
- Keep game state in a single observable for simplicity
- Use computed values for derived state (production rates)
- Separate concerns (resources, units, stats, etc.)

### 2. Performance Optimization
- Use `batch()` for multiple state updates
- Leverage computed values for calculations
- Avoid creating observables in render

### 3. Persistence Strategy
- Persist entire game state to single key
- Use auto-save with debouncing
- Handle migration for save format changes

### 4. React Native Specific
- Use `observer()` for reactive components
- Prefer `use$()` hook over `get()` in components
- Use `peek()` for non-reactive access

## Implementation Plan for Story #2

1. Create game state interfaces ✓
2. Set up MMKV storage instance
3. Configure Legend State with MMKV plugin
4. Create main game state observable
5. Implement computed production rates
6. Add game action helpers
7. Set up auto-save functionality
8. Test persistence and state mutations

## Potential Issues & Solutions

### Issue 1: React Native Version Compatibility
- Our Expo SDK 53 uses RN 0.79.5 which supports new architecture
- MMKV v3 should work fine

### Issue 2: TypeScript Types
- Legend State v3 has improved TypeScript support
- May need to explicitly type observables for complex state

### Issue 3: Migration from v2
- API is mostly compatible
- Main changes in sync/persist configuration

## References
- [Legend State v3 Docs](https://legendapp.com/open-source/state/v3/)
- [MMKV GitHub](https://github.com/mrousavy/react-native-mmkv)
- [Legend State GitHub](https://github.com/LegendApp/legend-state)
- NPM: @legendapp/state@beta (v3.0.0-beta.31)