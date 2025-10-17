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

# Install persistence layer (choose one)
npx expo install @react-native-async-storage/async-storage  # Recommended for SDK 54
# OR (has compatibility issues with SDK 54 Android)
npm install react-native-mmkv
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
  debounceSet: 500 // Debounce updates to server
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
| "CMake error" with MMKV on Android | SDK 54 compatibility issue | Use AsyncStorage instead or monitor [GitHub Issue #38991](https://github.com/expo/expo/issues/38991) |
| "Observable is not a function" | Incorrect import | Import from `@legendapp/state` not `@legendapp/state/core` |
| "Component not re-rendering" | Missing observer wrapper | Wrap component with `observer()` HOC |
| "Computed not updating" | Not accessing with get() | Use `.get()` to access observable values in computed |

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

## ⚠️ Known Limitations

### Current Issues (September 2025)
- **MMKV Android Build**: react-native-mmkv has compatibility issues with Expo SDK 54 on Android
- **React Compiler**: Still in experimental phase, may have edge cases
- **Legend-State v3**: Still in beta, API may change before stable release

### Workarounds
- Use AsyncStorage instead of MMKV for persistence until Android issues resolved
- Monitor Legend-State v3 changelog for breaking changes
- Test thoroughly on both platforms before production deployment

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

---

*Generated: 2025-09-17 22:56:56*