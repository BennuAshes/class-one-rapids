# Legend State v3 Best Practices with Examples

## Executive Summary

Legend State v3 is a revolutionary signal-based state management library for React and React Native that achieves unparalleled performance through fine-grained reactivity. It eliminates traditional React patterns like useMemo, useCallback, and useEffect while providing a powerful sync engine for local-first applications. This research document provides comprehensive best practices, implementation patterns, and real-world examples for leveraging Legend State v3 in modern React Native applications.

## Key Findings & Insights

### Performance Superiority
- **Fastest React state library** - Outperforms all competitors in benchmarks (Legend State: 1.02 vs Jotai: 1.41 vs Redux: 1.55)
- **Fine-grained reactivity** - Components only re-render when specific observed values change
- **Minimal bundle size** - Only 4kb with massive reduction in boilerplate code
- **Array optimization** - So optimized it beats vanilla JavaScript on certain array operations

### Developer Experience Revolution
- **Zero boilerplate** - No contexts, actions, reducers, dispatchers, sagas, thunks, or epics
- **Direct manipulation** - Simple `get()` and `set()` pattern for all state operations
- **Automatic persistence** - Built-in sync system with offline-first capabilities
- **TypeScript-first** - Built in strict mode with excellent type inference

### React Native Advantages
- **MMKV integration** - 30x faster than AsyncStorage with synchronous operations
- **Reactive Native components** - Pre-built `$TextInput`, `$View`, etc., for two-way binding
- **Local-first architecture** - Seamless offline support with automatic retry and sync

## Best Practices & Recommendations

### 1. State Architecture

#### Observable Creation Pattern
```typescript
// Define typed interfaces for your state
interface AppState {
  user: {
    id: string;
    name: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  todos: Todo[];
  // Computed properties as functions
  completedCount: () => number;
  // Actions as methods
  addTodo: (text: string) => void;
}

// Create the observable with TypeScript types
const appState$ = observable<AppState>({
  user: {
    id: '',
    name: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  },
  todos: [],
  completedCount: () => {
    return appState$.todos.get().filter(t => t.completed).length;
  },
  addTodo: (text: string) => {
    appState$.todos.push({
      id: Date.now().toString(),
      text,
      completed: false
    });
  }
});
```

### 2. React Native Component Patterns

#### Fine-Grained Reactive Components
```tsx
import { observer, Memo, Show, For } from '@legendapp/state/react';
import { $TextInput, $View, $Text } from '@legendapp/state/react-native';

// Use Memo for fine-grained updates
function TodoItem({ item$ }: { item$: Observable<Todo> }) {
  return (
    <$View style={styles.todoItem}>
      <Memo>
        {() => (
          <Checkbox 
            value={item$.completed.get()}
            onValueChange={(val) => item$.completed.set(val)}
          />
        )}
      </Memo>
      <$TextInput 
        $value={item$.text}
        style={styles.todoText}
      />
    </$View>
  );
}

// Use For component for optimized list rendering
function TodoList() {
  return (
    <For each={appState$.todos}>
      {(item$) => <TodoItem key={item$.id.peek()} item$={item$} />}
    </For>
  );
}
```

#### Control Flow Components
```tsx
// Conditional rendering with Show
function UserProfile() {
  return (
    <Show if={appState$.user.id}>
      <$Text>Welcome, {appState$.user.name}</$Text>
    </Show>
  );
}

// Switch component for multiple conditions
function ThemeSelector() {
  return (
    <Switch value={appState$.user.preferences.theme}>
      {{
        light: () => <LightTheme />,
        dark: () => <DarkTheme />
      }}
    </Switch>
  );
}
```

### 3. Persistence & Sync Configuration

#### MMKV Setup (Recommended for React Native)
```typescript
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { configureSynced, syncObservable } from '@legendapp/state/sync';
import { MMKV } from 'react-native-mmkv';

// Create and export storage instance
export const storage = new MMKV();

// Configure global sync settings
configureSynced({
  persist: {
    plugin: ObservablePersistMMKV,
    retrySync: true,  // Retry failed syncs
    syncMode: 'auto'   // Auto-sync on changes
  }
});

// Sync observable with persistence
syncObservable(appState$, {
  persist: {
    name: 'appState',
    plugin: ObservablePersistMMKV
  }
});
```

#### AsyncStorage Alternative (Legacy)
```typescript
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure AsyncStorage (required)
ObservablePersistAsyncStorage.configure({ AsyncStorage });

// Note: AsyncStorage is async, so wait for load
const syncState$ = syncObservable(appState$, {
  persist: {
    name: 'appState',
    plugin: ObservablePersistAsyncStorage
  }
});

// Wait for async load
await when(syncState$.isPersistLoaded);
```

### 4. TanStack Query Integration

```typescript
import { useObservableSyncedQuery } from '@legendapp/state/sync-plugins/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function UserProfile() {
  const user$ = useObservableSyncedQuery({
    queryClient,
    queryKey: ['user', userId],
    queryFn: fetchUser,
    // Mutation configuration
    mutationFn: updateUser,
    // Auto-save changes
    debounceSet: 500
  });

  return (
    <$View>
      <$TextInput $value={user$.name} />
      <Show if={user$.isLoading}>
        <ActivityIndicator />
      </Show>
    </$View>
  );
}
```

### 5. TypeScript Best Practices

#### Typed Computed Observables
```typescript
// Explicitly type computed return values
const state$ = observable({
  items: [] as Item[],
  filter: 'all' as 'all' | 'active' | 'completed',
  
  // Type the return value of computed
  filteredItems: computed((): Observable<Item[]> => {
    const filter = state$.filter.get();
    const items = state$.items.get();
    
    return observable(
      filter === 'all' 
        ? items 
        : items.filter(i => filter === 'completed' ? i.done : !i.done)
    );
  })
});
```

#### Strict Null Handling
```typescript
interface User {
  id: string;
  profile?: {
    name: string;
    avatar?: string;
  };
}

const user$ = observable<User | null>(null);

// Safe access with optional chaining
const userName$ = computed(() => 
  user$.profile?.name?.get() ?? 'Anonymous'
);
```

### 6. Performance Optimization Techniques

#### Use peek() for Non-Reactive Reads
```typescript
// Use peek() when you don't want to track changes
const logCurrentState = () => {
  console.log('Current todos:', appState$.todos.peek());
};

// Inside useObservable with initial value
const localState$ = useObservable(() => ({
  // peek() prevents this from being reactive
  initialCount: appState$.todos.peek().length,
  currentFilter: 'all'
}));
```

#### Batch Updates
```typescript
import { batch } from '@legendapp/state';

// Batch multiple updates to prevent multiple renders
const resetApp = () => {
  batch(() => {
    appState$.user.set(null);
    appState$.todos.set([]);
    appState$.settings.theme.set('light');
  });
};
```

#### Selective Observation
```typescript
// Only observe specific properties
function TodoCounter() {
  const count$ = appState$.todos.length;
  
  return <Text>{use$(count$)} todos</Text>;
}
```

### 7. Migration Strategy from v2 to v3

#### Step 1: Update Dependencies
```bash
npm install @legendapp/state@beta
npm install @legendapp/state/persist-plugins/mmkv
```

#### Step 2: Replace Deprecated Patterns
```typescript
// Old (v2)
const computed$ = computed(() => state$.value.get() * 2);
const persisted$ = persistObservable(state$, { key: 'state' });

// New (v3)
const computed$ = observable(() => state$.value.get() * 2);
const synced$ = syncObservable(state$, { 
  persist: { name: 'state' }
});
```

#### Step 3: Update React Components
```typescript
// Old (v2)
const Component = observer(() => {
  const value = state$.value.get();
  return <Text>{value}</Text>;
});

// New (v3)
function Component() {
  const value = use$(state$.value);
  return <Text>{value}</Text>;
}
```

### 8. Local-First Architecture Pattern

```typescript
// Complete local-first setup with Supabase
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { configureSynced } from '@legendapp/state/sync';

configureSynced({
  mode: 'auto',
  persist: {
    plugin: ObservablePersistMMKV,
    retrySync: true
  },
  retry: {
    times: 3,
    delay: 1000
  }
});

const todos$ = observable(
  syncedSupabase({
    supabase,
    collection: 'todos',
    select: (from) => from.select('*').order('created_at'),
    actions: ['read', 'create', 'update', 'delete'],
    realtime: true,
    persist: { name: 'todos' }
  })
);
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Setup & Configuration**
   - Install Legend State v3 beta
   - Configure TypeScript strict mode
   - Setup MMKV for persistence
   - Create base observable architecture

2. **Core State Structure**
   - Define TypeScript interfaces
   - Create main app observable
   - Setup computed properties
   - Implement actions/methods

### Phase 2: Component Migration (Week 2)
1. **Reactive Components**
   - Replace useState with useObservable
   - Convert to reactive native components
   - Implement fine-grained updates with Memo
   - Add control flow components (Show, For, Switch)

2. **Performance Optimization**
   - Remove unnecessary useMemo/useCallback
   - Implement batch updates
   - Add selective observation
   - Profile and optimize renders

### Phase 3: Persistence & Sync (Week 3)
1. **Local Persistence**
   - Setup MMKV storage
   - Configure auto-persistence
   - Implement offline queue
   - Add migration logic

2. **Remote Sync**
   - Integrate TanStack Query plugin
   - Setup optimistic updates
   - Configure conflict resolution
   - Implement retry logic

### Phase 4: Production Ready (Week 4)
1. **Testing & Validation**
   - Unit tests for observables
   - Integration tests for sync
   - Performance benchmarks
   - Error boundary implementation

2. **Documentation & Training**
   - Code documentation
   - Team training materials
   - Migration guides
   - Best practices documentation

## Tools & Resources

### Official Resources
- [Legend State v3 Documentation](https://legendapp.com/open-source/state/v3/)
- [GitHub Repository](https://github.com/LegendApp/legend-state)
- [Discord Community](https://discord.gg/5CBaNtADNX)
- [Migration Guide](https://legendapp.com/open-source/state/v3/other/migrating/)

### Required Packages
```json
{
  "dependencies": {
    "@legendapp/state": "^3.0.0-beta",
    "@legendapp/state/persist-plugins/mmkv": "^3.0.0-beta",
    "@legendapp/state/sync-plugins/tanstack-react-query": "^3.0.0-beta",
    "react-native-mmkv": "^3.0.2",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### Development Tools
- **Legend Kit CLI** - Scaffolding tool for Legend State projects
- **React DevTools** - Debugging React components
- **Flipper** - React Native debugging platform
- **Reactotron** - State inspection for React Native

### Performance Monitoring
```typescript
// Performance monitoring setup
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';

if (__DEV__) {
  enableReactTracking({
    auto: true,  // Auto-track all components
    warnUnobserved: true,  // Warn about unobserved gets
    warnMounts: true  // Warn about excessive mounts
  });
}
```

## Key Takeaways

1. **Performance First**: Legend State v3 provides the fastest React state management through fine-grained reactivity
2. **Developer Experience**: Eliminates boilerplate and complex patterns while maintaining type safety
3. **React Native Optimized**: Built-in support for React Native with MMKV persistence and reactive components
4. **Local-First Ready**: Powerful sync engine enables offline-first applications with automatic retry
5. **Future-Proof**: Active development with v3 beta representing significant improvements
6. **Migration Path**: Clear upgrade path from v2 with helpful migration tools and documentation

## Conclusion

Legend State v3 represents a paradigm shift in React Native state management, offering unprecedented performance and developer experience improvements. By adopting its fine-grained reactivity model and following these best practices, teams can build faster, more maintainable applications with significantly less code. The combination of TypeScript support, MMKV persistence, and TanStack Query integration makes it an ideal choice for modern React Native applications requiring local-first capabilities and real-time synchronization.

## References & Sources

1. Legend State Official Documentation v3 - https://legendapp.com/open-source/state/v3/
2. GitHub Repository - https://github.com/LegendApp/legend-state
3. Local-first Realtime Apps with Expo and Legend-State (Supabase, 2024)
4. Legend State Performance Benchmarks
5. React Native MMKV Documentation
6. TanStack Query Integration Guide
7. Legend State Discord Community
8. Migration Guide v2 to v3

---

*Document created: August 10, 2025*
*Legend State Version: 3.0.0-beta*
*Research compiled from official documentation, community resources, and real-world implementations*