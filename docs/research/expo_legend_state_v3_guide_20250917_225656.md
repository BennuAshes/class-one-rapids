# Expo SDK 54 + Legend-State v3 Beta - Implementation Guide

*Research compiled on 2025-09-17*

## 🚀 Quick Start

### Installation Commands
```bash
# Create new Expo app with SDK 54
npx create-expo-app my-app --template blank-typescript@sdk-54

# Navigate to project
cd my-app

# Install Legend-State v3 beta
npm install @legendapp/state@beta

# Install persistence layer
npx expo install @react-native-async-storage/async-storage  # Recommended for SDK 54
```

### Minimum Requirements
- Expo SDK 54 (React Native 0.81)
- Node.js 18+
- TypeScript 5.0+
- New Architecture enabled (default in SDK 54)

## 📋 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `npx create-expo-app` | Create new Expo project | `npx create-expo-app my-app --template blank-typescript@sdk-54` |
| `npx expo install` | Install Expo-compatible packages | `npx expo install @react-native-async-storage/async-storage` |
| `npm run ios` | Run on iOS simulator | `npm run ios` |
| `npm run android` | Run on Android emulator | `npm run android` |
| `npx expo prebuild` | Generate native projects | `npx expo prebuild --clean` |

## 💻 Code Examples

### Basic State Store Setup

```typescript
// store/index.ts
import { observable, Observable } from "@legendapp/state"
import { configureSynced, synced } from "@legendapp/state/sync"
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage"
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure persistence globally
const mySynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage })
  }
})

// Define types
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

interface AppState {
  todos: Todo[]
  user: {
    name: string
    preferences: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
  // Computed values
  completedCount: number
  pendingCount: number
}

// Create global observable store
export const store$ = observable<AppState>({
  todos: mySynced({
    initial: [],
    persist: { name: 'todos-storage' }
  }),
  user: mySynced({
    initial: {
      name: '',
      preferences: {
        theme: 'light',
        notifications: true
      }
    },
    persist: { name: 'user-storage' }
  }),
  // Computed observables
  completedCount: (): number => {
    return store$.todos.get().filter(t => t.completed).length
  },
  pendingCount: (): number => {
    return store$.todos.get().filter(t => !t.completed).length
  }
})

// Actions
export const todoActions = {
  add: (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    }
    store$.todos.push(newTodo)
  },

  toggle: (id: string) => {
    const todo$ = store$.todos.find(t => t.id.get() === id)
    if (todo$) {
      todo$.completed.toggle()
    }
  },

  remove: (id: string) => {
    const todos = store$.todos.get()
    store$.todos.set(todos.filter(t => t.id !== id))
  },

  clear: () => {
    store$.todos.set([])
  }
}
```

### React Native Component with Legend-State

```tsx
// screens/TodoScreen.tsx
import React from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { observer, use$, useObservable, Memo } from "@legendapp/state/react"
import { $TextInput } from "@legendapp/state/react-native"
import { store$, todoActions } from '../store'
import type { Observable } from "@legendapp/state"

// Individual Todo Item Component
const TodoItem = observer(({ item$ }: { item$: Observable<Todo> }) => {
  const item = use$(item$)

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => todoActions.toggle(item.id)}
      >
        <Text>{item.completed ? '✅' : '⭕'}</Text>
      </TouchableOpacity>

      <$TextInput
        $value={item$.text}
        style={[
          styles.todoText,
          item.completed && styles.completedText
        ]}
        placeholder="Enter todo text"
        editable={!item.completed}
      />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => todoActions.remove(item.id)}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )
})

// Main Todo Screen
export const TodoScreen = observer(() => {
  const todos = use$(store$.todos)
  const completedCount = use$(store$.completedCount)
  const pendingCount = use$(store$.pendingCount)
  const newTodo$ = useObservable('')

  const handleAdd = () => {
    const text = newTodo$.get().trim()
    if (text) {
      todoActions.add(text)
      newTodo$.set('')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Legend-State Todo App</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Pending: {pendingCount}</Text>
          <Text style={styles.statText}>Completed: {completedCount}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <$TextInput
          $value={newTodo$}
          style={styles.input}
          placeholder="Add a new todo..."
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TodoItem item$={store$.todos[index]} />
        )}
        contentContainerStyle={styles.list}
      />

      {todos.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={todoActions.clear}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statText: {
    fontSize: 16,
    color: '#666'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 1
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  list: {
    paddingVertical: 10
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  checkbox: {
    marginRight: 15
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  deleteButton: {
    padding: 5
  },
  deleteText: {
    fontSize: 20
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
})
```

### Advanced Patterns

#### Sync with Remote Server

```typescript
// store/sync.ts
import { configureSynced, syncedFetch } from "@legendapp/state/sync"
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage"
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure synced fetch with persistence and retry
const mySyncedFetch = configureSynced(syncedFetch, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
    retrySync: true // Retry failed syncs on reconnection
  },
  retry: {
    infinite: true,
    delay: 1000,
    backoff: 'exponential'
  },
})

// Create synced observable with server
export const serverTodos$ = observable({
  todos: mySyncedFetch({
    get: 'https://api.example.com/todos',
    set: 'https://api.example.com/todos',
    initial: [],
    persist: { name: 'server-todos' },
    mode: 'merge' // Merge server and local changes
  })
})
```

#### Using Computed Observables

```typescript
// store/computed.ts
import { observable, computed } from "@legendapp/state"

interface Analytics {
  totalTodos: number
  completionRate: number
  averageTextLength: number
  oldestTodo: Todo | null
  newestTodo: Todo | null
}

// Create computed analytics
export const analytics$ = computed((): Analytics => {
  const todos = store$.todos.get()

  if (todos.length === 0) {
    return {
      totalTodos: 0,
      completionRate: 0,
      averageTextLength: 0,
      oldestTodo: null,
      newestTodo: null
    }
  }

  const completed = todos.filter(t => t.completed).length
  const totalLength = todos.reduce((sum, t) => sum + t.text.length, 0)
  const sorted = [...todos].sort((a, b) => a.createdAt - b.createdAt)

  return {
    totalTodos: todos.length,
    completionRate: (completed / todos.length) * 100,
    averageTextLength: totalLength / todos.length,
    oldestTodo: sorted[0],
    newestTodo: sorted[sorted.length - 1]
  }
})

// Usage in component
const AnalyticsView = observer(() => {
  const stats = use$(analytics$)

  return (
    <View>
      <Text>Total: {stats.totalTodos}</Text>
      <Text>Completion: {stats.completionRate.toFixed(1)}%</Text>
      <Text>Avg Length: {stats.averageTextLength.toFixed(0)} chars</Text>
    </View>
  )
})
```

## ✅ Best Practices

### DO: Use Fine-Grained Reactivity
```typescript
// Good - Only re-renders when specific todo changes
const TodoTitle = observer(({ todo$ }: { todo$: Observable<Todo> }) => {
  const text = use$(todo$.text)
  return <Text>{text}</Text>
})

// Bad - Re-renders entire component on any change
const TodoTitle = ({ todo }: { todo: Todo }) => {
  return <Text>{todo.text}</Text>
}
```

### DO: Use Computed for Derived State
```typescript
// Good - Automatically updates when dependencies change
const stats$ = computed(() => ({
  total: store$.todos.length,
  completed: store$.todos.filter(t => t.completed.get()).length
}))

// Bad - Manual calculation on every render
const getStats = () => ({
  total: store$.todos.get().length,
  completed: store$.todos.get().filter(t => t.completed).length
})
```

### DON'T: Mutate Arrays Directly
```typescript
// Bad - Direct mutation
store$.todos.get().push(newTodo)

// Good - Use observable methods
store$.todos.push(newTodo)
```

### DON'T: Use Direct Assignment on Observables
```typescript
// Bad - Direct assignment (will not trigger reactivity)
scrapStore.lastTickTime = Date.now()
store$.user.name = 'John'

// Good - Use .set() method
scrapStore.lastTickTime.set(Date.now())
store$.user.name.set('John')
```

### DO: Configure Persistence Globally
```typescript
// Good - Configure once, use everywhere
configureSynced(synced, {
  persist: { plugin: observablePersistAsyncStorage({ AsyncStorage }) }
})

// Bad - Configure in every observable
const todos$ = observable({
  items: synced({
    persist: { plugin: observablePersistAsyncStorage({ AsyncStorage }) }
  })
})
```

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot find module '@legendapp/state'" | Package not installed | Run `npm install @legendapp/state@beta` |
| "AsyncStorage is null" | AsyncStorage not installed | Run `npx expo install @react-native-async-storage/async-storage` |
| "Observable is not a function" | Incorrect import | Import from `@legendapp/state` not `@legendapp/state/core` |
| "Component not re-rendering" | Missing observer wrapper | Wrap component with `observer()` HOC |
| "Computed not updating" | Not accessing with get() | Use `.get()` to access observable values in computed |
| "Persistence not loading" | Async storage not awaited | Use `await when(syncState(obs$).isPersistLoaded)` |

## 🔍 Testing Patterns

```typescript
// store.test.ts
import { observable } from '@legendapp/state'
import { todoActions, store$ } from '../store'

describe('Todo Store', () => {
  beforeEach(() => {
    // Reset store
    store$.todos.set([])
  })

  test('should add todo', () => {
    todoActions.add('Test todo')

    const todos = store$.todos.get()
    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('Test todo')
    expect(todos[0].completed).toBe(false)
  })

  test('should toggle todo', () => {
    todoActions.add('Test todo')
    const todo = store$.todos[0].get()

    todoActions.toggle(todo.id)
    expect(store$.todos[0].completed.get()).toBe(true)

    todoActions.toggle(todo.id)
    expect(store$.todos[0].completed.get()).toBe(false)
  })

  test('computed values should update', () => {
    todoActions.add('Todo 1')
    todoActions.add('Todo 2')

    expect(store$.pendingCount.get()).toBe(2)
    expect(store$.completedCount.get()).toBe(0)

    const firstId = store$.todos[0].id.get()
    todoActions.toggle(firstId)

    expect(store$.pendingCount.get()).toBe(1)
    expect(store$.completedCount.get()).toBe(1)
  })
})
```

### Testing Legend-State with Rapid User Interactions

Legend-State observables update asynchronously. When testing rapid user interactions, always use `waitFor` to ensure state has settled between actions.

```typescript
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'

// Good - Use waitFor for each interaction
test('handles multiple rapid taps accurately', async () => {
  render(<ClickerScreen />)
  const user = userEvent.setup()
  const button = screen.getByRole('button', { name: /feed/i })

  for (let i = 0; i < 5; i++) {
    await user.press(button)

    // Wait for observable state to settle after each tap
    await waitFor(() => {
      expect(screen.getByText(`Count: ${i + 1}`)).toBeTruthy()
    })
  }

  // Final assertion
  expect(screen.getByText('Count: 5')).toBeTruthy()
})

// Bad - No waiting between rapid interactions
test('handles multiple rapid taps', async () => {
  render(<ClickerScreen />)
  const user = userEvent.setup()
  const button = screen.getByRole('button')

  // Rapid taps without waiting for observables to settle
  for (let i = 0; i < 5; i++) {
    await user.press(button)
  }

  // ❌ May fail with race condition - expected 5, got 6 (or other count)
  expect(screen.getByText('Count: 5')).toBeTruthy()
})

// Alternative - Single waitFor after all interactions (less reliable)
test('handles multiple rapid taps - alternative', async () => {
  render(<ClickerScreen />)
  const user = userEvent.setup()
  const button = screen.getByRole('button')

  for (let i = 0; i < 5; i++) {
    await user.press(button)
  }

  // Wait for final state
  await waitFor(() => {
    expect(screen.getByText('Count: 5')).toBeTruthy()
  }, { timeout: 2000 }) // May need longer timeout
})
```

### Testing Custom Hooks with Legend-State Observables

When testing custom hooks that return Legend-State observables, ensure you're accessing the observable's value with `.get()` in your assertions.

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'

describe('usePersistedCounter', () => {
  test('increments count on action', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-key'))

    act(() => {
      result.current.actions.increment()
    })

    // Use waitFor for observable updates in hooks too
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1)
    })
  })

  test('handles rapid increments', async () => {
    const { result } = renderHook(() => usePersistedCounter('test-key'))

    // Rapid actions may need waitFor between each
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.actions.increment()
      })

      await waitFor(() => {
        expect(result.current.count$.get()).toBe(i + 1)
      })
    }
  })
})
```

### Key Principles for Testing Legend-State

1. **Always use `waitFor` when testing state changes from user interactions** - Observables update asynchronously
2. **For rapid interactions, verify state after EACH action** - Don't just check the final state
3. **Use `.get()` to access observable values in tests** - Never try to access the value directly
4. **Increase timeouts if needed** - Complex observable chains may take longer to settle

## ⚠️ Known Limitations

### Current Issues (September 2025)
- **React Compiler**: Still in experimental phase, may have edge cases
- **Legend-State v3**: Still in beta, API may change before stable release

### Workarounds
- Monitor Legend-State v3 changelog for breaking changes
- Test thoroughly on both platforms before production deployment
- Use AsyncStorage for persistence (recommended and fully compatible with Expo SDK 54)

### Migration Considerations
- Legend-State v2 to v3 has breaking changes (see [migration guide](https://legendapp.com/open-source/state/v3/other/migrating/))
- Expo SDK 54 requires New Architecture (cannot be disabled)
- React Native 0.81 has edge-to-edge enabled by default on Android

## Performance Optimization Tips

1. **Use Shallow Observables for Large Lists**
```typescript
const list$ = observable(largeArray, { shallow: true })
```

2. **Batch Updates**
```typescript
import { batch } from '@legendapp/state'

batch(() => {
  store$.todos.push(todo1)
  store$.todos.push(todo2)
  store$.user.name.set('New Name')
})
```

3. **Use Memo for Expensive Computations**
```typescript
const expensive$ = observable({
  result: () => computeExpensiveValue()
}, { lazy: true })
```

## 🔄 Persistence & Sync (Official Guidelines)

### Core Concepts

Legend-State's sync system enables automatic persisting and syncing while supporting local-first applications. Changes made offline persist between sessions for retry when reconnected.

#### Multi-Step Sync Flow

The sync engine follows this process:
1. Save pending changes to local storage
2. Persist changes locally
3. Sync to remote storage
4. Update observable with server responses (timestamps, etc.)
5. Clear pending changes

### Setup Methods

#### Using `synced()` Constructor
Creates lazy-loaded computed function activating on `get()`:
```typescript
import { synced } from '@legendapp/state/sync'

const store$ = observable(synced({
  initial: [],
  persist: { name: 'persistKey' }
}))
```

#### Using `syncObservable()`
Apply sync to existing observables:
```typescript
import { syncObservable } from '@legendapp/state/sync'

const state$ = observable({ initialKey: 'value' })
syncObservable(state$, {
  persist: { name: 'test' }
})
```

### Persistence Plugins

#### React Native - AsyncStorage
**Recommended for Expo SDK 54** - Requires `@react-native-async-storage/async-storage`:
```typescript
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureSynced, synced } from '@legendapp/state/sync'

const persist = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
    retrySync: true
  }
})

const store$ = observable({
  data: persist({
    initial: { count: 0 },
    persist: { name: 'my-data' }
  })
})
```

#### Web - Local Storage
```typescript
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

syncObservable(state$, {
  persist: {
    name: "documents",
    plugin: ObservablePersistLocalStorage
  }
})
```

#### Web - IndexedDB
Supports two modes: dictionary storage with ID fields, or individual object storage via `itemID`:
```typescript
import { observablePersistIndexedDB } from '@legendapp/state/persist-plugins/indexeddb'

const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistIndexedDB({
      databaseName: "Legend",
      version: 1,
      tableNames: ["documents", "store"]
    })
  }
})
```

### Key Configuration Options

| Option | Type | Purpose | Example |
|--------|------|---------|---------|
| `persist.name` | string | Storage key identifier | `'user-settings'` |
| `persist.plugin` | Plugin | Storage backend selection | `observablePersistAsyncStorage({ AsyncStorage })` |
| `persist.retrySync` | boolean | Persist pending changes for retry | `true` |
| `persist.debounceSet` | number | Delay before syncing changes (ms) | `1000` |
| `initial` | any | Default value before loading | `[]` or `{}` |
| `mode` | string | Update strategy | `'set'`, `'assign'`, `'merge'`, `'append'`, `'prepend'` |
| `retry.infinite` | boolean | Continuous retry on failure | `true` |

### Remote Sync Patterns

#### Basic Server Sync
```typescript
import { syncedFetch } from '@legendapp/state/sync'

const store$ = observable({
  users: syncedFetch({
    get: 'https://api.example/users',
    set: 'https://api.example/users'
  })
})
```

#### Paging Implementation
Uses observing context to rerun queries when dependencies change:
```typescript
const store$ = observable({
  usersPage: 1,
  users: syncedFetch({
    get: () => `https://api/users?page=${store$.usersPage.get()}`,
    mode: 'append'
  })
})
```

#### Offline-First Configuration
```typescript
import { syncedCrud } from '@legendapp/state/sync-plugins/crud'

const profile$ = observable(syncedCrud({
  list: async () => {/* fetch list */},
  create: async (item) => {/* create item */},
  update: async (item) => {/* update item */},
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
    retrySync: true // Persist pending changes for retry
  },
  retry: { infinite: true }, // Retry infinitely on failure
  changesSince: 'last-sync',
  fieldUpdatedAt: 'updatedAt'
}))
```

### Status Monitoring

Access sync state via `syncState()`:
```typescript
import { syncState } from '@legendapp/state/sync'

const status$ = syncState(obs$)

// Available properties
const isLoaded = status$.isLoaded.get()
const isPersistLoaded = status$.isPersistLoaded.get()
const error = status$.error.get()
const lastSync = status$.lastSync.get()
const pendingChanges = status$.getPendingChanges()

// Actions
status$.clearPersist() // Clear persisted data
status$.sync() // Trigger manual sync
```

**Available Properties:**
- `isPersistLoaded`: Has loaded from local persistence
- `isPersistEnabled`: Is persistence configured
- `isLoaded`: Has loaded from remote
- `isSyncEnabled`: Is remote sync configured
- `lastSync`: Timestamp of last successful sync
- `syncCount`: Number of successful syncs
- `error`: Last error encountered
- `clearPersist()`: Clear persisted data
- `sync()`: Trigger manual sync
- `getPendingChanges()`: Get pending changes for retry

### Async Persistence Handling

For asynchronous storage (IndexedDB, AsyncStorage):
```typescript
import { when } from '@legendapp/state'
import { syncState } from '@legendapp/state/sync'

const status$ = syncState(state$)

// Wait for persistence to load before accessing
await when(status$.isPersistLoaded)

// Now safe to access
const data = state$.get()
```

### Data Transformation

Transform data between persistence/remote storage:
```typescript
const state$ = observable(synced({
  get: async () => {/* fetch data */},
  persist: {
    name: 'state',
    transform: {
      load: (value) => {
        // Version migration example
        if (value.version === 2 && value.oldField) {
          value.newField = value.oldField
          delete value.oldField
          value.version = 3
        }
        return value
      },
      save: (value) => {
        // Encrypt before saving
        return { ...value, encrypted: true }
      }
    }
  }
}))
```

**Helper Utilities:**
- `transformStringifyDates`: Convert dates to/from strings
- `transformStringifyKeys`: Convert Map/Set to/from objects
- `combineTransforms`: Combine multiple transformations

### Global Configuration Pattern

Configure persistence once, use everywhere:
```typescript
import { configureSynced, synced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure globally
export const persist = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
    retrySync: true
  }
})

// Use in stores
export const userStore$ = observable({
  profile: persist({
    initial: {},
    persist: { name: 'user-profile' }
  }),
  settings: persist({
    initial: {},
    persist: { name: 'user-settings' }
  })
})
```

### Update Modes

Control how synced data merges with existing state:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `set` | Replace entire value | Complete overwrite |
| `assign` | Shallow merge (Object.assign) | Update top-level properties |
| `merge` | Deep merge | Nested object updates |
| `append` | Add to end of array | Pagination, infinite scroll |
| `prepend` | Add to start of array | Newest-first feeds |

```typescript
const feed$ = observable(syncedFetch({
  get: () => `https://api/posts?page=${page$.get()}`,
  mode: 'append', // Add new posts to end
  persist: { name: 'feed' }
}))
```

### Debouncing Writes

Reduce storage write frequency:
```typescript
const notes$ = observable(synced({
  initial: '',
  persist: {
    name: 'notes',
    debounceSet: 1000 // Wait 1 second after last change
  }
}))
```

### Important Notes

1. **Lazy Activation**: `synced` creates lazy computed functions—only activate on `get()`
2. **Observing Context**: `get()` is an observing context enabling dynamic query updates
3. **Plugin Inheritance**: Plugins build atop `synced`, inheriting all configuration options
4. **Retry Mechanism**: Ensure offline changes sync when reconnected via `retrySync: true`
5. **Transform Hooks**: Enable encryption, stringification, and versioning via `transform`

### Common Patterns

#### Debounced Auto-Save
```typescript
const document$ = observable(synced({
  initial: { title: '', content: '' },
  persist: {
    name: 'draft',
    debounceSet: 2000 // Save 2 seconds after typing stops
  }
}))
```

#### Version Migration
```typescript
const settings$ = observable(synced({
  initial: { version: 1, theme: 'light' },
  persist: {
    name: 'settings',
    transform: {
      load: (value) => {
        if (!value.version || value.version < 2) {
          // Migrate v1 to v2
          return { version: 2, theme: value.theme || 'light', lang: 'en' }
        }
        return value
      }
    }
  }
}))
```

#### Manual Sync Trigger
```typescript
const data$ = observable(synced({
  get: async () => {/* fetch */},
  persist: { name: 'data' }
}))

// Manually trigger sync
const status$ = syncState(data$)
await status$.sync()
```

---

*Last Updated: 2025-11-13 (Added Persistence & Sync Guidelines)*
*Generated: 2025-09-17 22:56:56*