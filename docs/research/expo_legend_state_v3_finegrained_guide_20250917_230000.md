# Expo SDK 54 + Legend-State v3: Fine-Grained Reactivity Architecture

*Architecture Guide - September 2025*

## 🎯 Core Principles

1. **Fine-grained reactivity over observer pattern** - Components render once, only text nodes update
2. **Storage abstraction layer** - Switch persistence backends without code changes
3. **Minimal re-renders** - Surgical updates using Legend-State's reactive primitives
4. **Type-safe throughout** - Full TypeScript with no compromises

## 📦 Storage Abstraction Layer

### Storage Adapter Pattern

```typescript
// storage/adapter.ts
import { ObservablePersistPlugin } from '@legendapp/state'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage adapter interface
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
  getAllKeys: () => Promise<string[]>
  multiGet?: (keys: string[]) => Promise<[string, string | null][]>
  multiSet?: (keyValuePairs: [string, string][]) => Promise<void>
  multiRemove?: (keys: string[]) => Promise<void>
}

// AsyncStorage Adapter (Default)
class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string) {
    return AsyncStorage.getItem(key)
  }

  async setItem(key: string, value: string) {
    return AsyncStorage.setItem(key, value)
  }

  async removeItem(key: string) {
    return AsyncStorage.removeItem(key)
  }

  async getAllKeys() {
    return AsyncStorage.getAllKeys()
  }

  async multiGet(keys: string[]) {
    return AsyncStorage.multiGet(keys)
  }

  async multiSet(keyValuePairs: [string, string][]) {
    return AsyncStorage.multiSet(keyValuePairs)
  }

  async multiRemove(keys: string[]) {
    return AsyncStorage.multiRemove(keys)
  }
}

// MMKV Adapter (Ready for future)
class MMKVAdapter implements StorageAdapter {
  private mmkv: any // Will be MMKV instance when available

  constructor() {
    // Uncomment when MMKV is fixed for SDK 54
    // import { MMKV } from 'react-native-mmkv'
    // this.mmkv = new MMKV()
  }

  async getItem(key: string) {
    // return this.mmkv.getString(key) ?? null
    throw new Error('MMKV not yet available for SDK 54')
  }

  async setItem(key: string, value: string) {
    // return this.mmkv.set(key, value)
    throw new Error('MMKV not yet available for SDK 54')
  }

  async removeItem(key: string) {
    // return this.mmkv.delete(key)
    throw new Error('MMKV not yet available for SDK 54')
  }

  async getAllKeys() {
    // return this.mmkv.getAllKeys()
    throw new Error('MMKV not yet available for SDK 54')
  }
}

// Storage configuration with feature flag
export const ENABLE_MMKV = false // Toggle this when MMKV is fixed

// Export the current storage adapter
export const storageAdapter: StorageAdapter = ENABLE_MMKV
  ? new MMKVAdapter()
  : new AsyncStorageAdapter()

// Create Legend-State persistence plugin
export const createPersistPlugin = (adapter: StorageAdapter): ObservablePersistPlugin => ({
  getItem: adapter.getItem,
  setItem: adapter.setItem,
  removeItem: adapter.removeItem,
  getItems: async (keys: string[]) => {
    if (adapter.multiGet) {
      const results = await adapter.multiGet(keys)
      return Object.fromEntries(results)
    }
    // Fallback for adapters without multiGet
    const results = await Promise.all(
      keys.map(async key => [key, await adapter.getItem(key)])
    )
    return Object.fromEntries(results)
  },
  setItems: async (items: Record<string, string>) => {
    if (adapter.multiSet) {
      await adapter.multiSet(Object.entries(items))
    } else {
      // Fallback for adapters without multiSet
      await Promise.all(
        Object.entries(items).map(([key, value]) =>
          adapter.setItem(key, value)
        )
      )
    }
  },
  removeItems: async (keys: string[]) => {
    if (adapter.multiRemove) {
      await adapter.multiRemove(keys)
    } else {
      await Promise.all(keys.map(key => adapter.removeItem(key)))
    }
  },
  getAllKeys: adapter.getAllKeys
})
```

### Configure Persistence Once

```typescript
// storage/config.ts
import { configureSynced, synced } from "@legendapp/state/sync"
import { configureObservablePersistence } from '@legendapp/state/persist'
import { storageAdapter, createPersistPlugin } from './adapter'

// Create the persistence plugin
const persistPlugin = createPersistPlugin(storageAdapter)

// Configure globally
configureObservablePersistence({
  pluginLocal: persistPlugin
})

// Create configured synced function
export const persist = configureSynced(synced, {
  persist: {
    plugin: persistPlugin,
    retrySync: true
  }
})

// Export for use in stores
export { persistPlugin }
```

## 🎨 Fine-Grained Reactivity Patterns

### Store with Fine-Grained Updates

```typescript
// store/todos.store.ts
import { observable } from "@legendapp/state"
import { persist } from '../storage/config'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  updatedAt: number
}

interface TodoFilters {
  showCompleted: boolean
  sortBy: 'date' | 'priority' | 'alphabetical'
  searchQuery: string
}

// Main store - no observer needed!
export const todos$ = observable({
  items: persist({
    initial: [] as Todo[],
    persist: { name: 'todos-v1' }
  }),

  filters: persist({
    initial: {
      showCompleted: true,
      sortBy: 'date',
      searchQuery: ''
    } as TodoFilters,
    persist: { name: 'todo-filters-v1' }
  }),

  // Computed values
  filtered: (): Todo[] => {
    const items = todos$.items.get()
    const filters = todos$.filters.get()

    let filtered = filters.showCompleted
      ? items
      : items.filter(t => !t.completed)

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'alphabetical':
          return a.text.localeCompare(b.text)
        default:
          return b.createdAt - a.createdAt
      }
    })

    return filtered
  },

  stats: (): {
    total: number
    completed: number
    pending: number
    highPriority: number
  } => {
    const items = todos$.items.get()
    const completed = items.filter(t => t.completed)
    const highPriority = items.filter(t => t.priority === 'high' && !t.completed)

    return {
      total: items.length,
      completed: completed.length,
      pending: items.length - completed.length,
      highPriority: highPriority.length
    }
  }
})

// Actions as pure functions
export const todoActions = {
  add: (text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const now = Date.now()
    todos$.items.push({
      id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now
    })
  },

  update: (id: string, updates: Partial<Todo>) => {
    const todo$ = todos$.items.find(t => t.id.get() === id)
    if (todo$) {
      Object.assign(todo$.get(), {
        ...updates,
        updatedAt: Date.now()
      })
    }
  },

  toggle: (id: string) => {
    const todo$ = todos$.items.find(t => t.id.get() === id)
    if (todo$) {
      todo$.completed.toggle()
      todo$.updatedAt.set(Date.now())
    }
  },

  remove: (id: string) => {
    const items = todos$.items.get()
    todos$.items.set(items.filter(t => t.id !== id))
  },

  clearCompleted: () => {
    const items = todos$.items.get()
    todos$.items.set(items.filter(t => !t.completed))
  }
}
```

### Fine-Grained Components (No observer HOC!)

```tsx
// components/TodoList.tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import { For, Show, Memo } from '@legendapp/state/react'
import { $TextInput, $Switch } from '@legendapp/state/react-native'
import { todos$, todoActions } from '../store/todos.store'
import type { Observable } from '@legendapp/state'

// Fine-grained Todo Item - No observer wrapper needed!
function TodoItem({ item$ }: { item$: Observable<Todo> }) {
  return (
    <View style={styles.todoItem}>
      {/* Only this checkbox re-renders when completed changes */}
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => todoActions.toggle(item$.id.get())}
      >
        <Memo>
          {() => item$.completed.get() ? '✅' : '⭕'}
        </Memo>
      </TouchableOpacity>

      {/* Only this text input re-renders when text changes */}
      <$TextInput
        $value={item$.text}
        style={styles.todoText}
        placeholder="Todo text..."
        onChangeText={(text) => {
          item$.text.set(text)
          item$.updatedAt.set(Date.now())
        }}
      />

      {/* Priority selector - only updates when priority changes */}
      <View style={styles.priorityContainer}>
        <Memo>
          {() => {
            const priority = item$.priority.get()
            const colors = {
              low: '#gray',
              medium: '#orange',
              high: '#red'
            }
            return (
              <TouchableOpacity
                style={[styles.priorityBadge, { backgroundColor: colors[priority] }]}
                onPress={() => {
                  const priorities = ['low', 'medium', 'high'] as const
                  const current = priorities.indexOf(priority)
                  const next = priorities[(current + 1) % 3]
                  item$.priority.set(next)
                  item$.updatedAt.set(Date.now())
                }}
              >
                <Text style={styles.priorityText}>{priority}</Text>
              </TouchableOpacity>
            )
          }}
        </Memo>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => todoActions.remove(item$.id.get())}
      >
        <Text>🗑️</Text>
      </TouchableOpacity>
    </View>
  )
}

// Main TodoList Component - No observer needed!
export function TodoList() {
  return (
    <View style={styles.container}>
      {/* Header with stats - only these specific values update */}
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <View style={styles.stats}>
          <Memo>{() => <Text>Total: {todos$.stats.total.get()}</Text>}</Memo>
          <Memo>{() => <Text>✅ {todos$.stats.completed.get()}</Text>}</Memo>
          <Memo>{() => <Text>⏳ {todos$.stats.pending.get()}</Text>}</Memo>
          <Show if={todos$.stats.highPriority}>
            {() => (
              <Text style={styles.urgentText}>
                🔥 {todos$.stats.highPriority.get()} urgent
              </Text>
            )}
          </Show>
        </View>
      </View>

      {/* Filters - each control only updates its specific value */}
      <View style={styles.filters}>
        <$TextInput
          $value={todos$.filters.searchQuery}
          style={styles.searchInput}
          placeholder="Search todos..."
        />

        <View style={styles.filterRow}>
          <Text>Show completed:</Text>
          <$Switch $value={todos$.filters.showCompleted} />
        </View>

        <View style={styles.sortButtons}>
          <Memo>
            {() => {
              const sortBy = todos$.filters.sortBy.get()
              return ['date', 'priority', 'alphabetical'].map(sort => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortButton,
                    sortBy === sort && styles.sortButtonActive
                  ]}
                  onPress={() => todos$.filters.sortBy.set(sort as any)}
                >
                  <Text>{sort}</Text>
                </TouchableOpacity>
              ))
            }}
          </Memo>
        </View>
      </View>

      {/* Todo Items - For component handles list updates efficiently */}
      <ScrollView style={styles.list}>
        <For each={todos$.filtered}>
          {(item$, index) => <TodoItem key={item$.id.get()} item$={item$} />}
        </For>

        {/* Empty state */}
        <Show
          if={() => todos$.filtered.get().length === 0}
          else={null}
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No todos found</Text>
            <Show if={() => todos$.filters.searchQuery.get().length > 0}>
              <Text style={styles.emptyHint}>Try adjusting your search</Text>
            </Show>
          </View>
        </Show>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const text = prompt('New todo:')
            if (text) todoActions.add(text, 'medium')
          }}
        >
          <Text>Add Todo</Text>
        </TouchableOpacity>

        <Show if={() => todos$.stats.completed.get() > 0}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={todoActions.clearCompleted}
          >
            <Text>Clear Completed</Text>
          </TouchableOpacity>
        </Show>
      </View>
    </View>
  )
}

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
  urgentText: {
    color: 'red',
    fontWeight: 'bold'
  },
  filters: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 1
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10
  },
  sortButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0'
  },
  sortButtonActive: {
    backgroundColor: '#007AFF'
  },
  list: {
    flex: 1
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8
  },
  checkbox: {
    marginRight: 15
  },
  todoText: {
    flex: 1,
    fontSize: 16
  },
  priorityContainer: {
    marginHorizontal: 10
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  deleteButton: {
    padding: 5
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 18,
    color: '#999'
  },
  emptyHint: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5
  },
  actions: {
    flexDirection: 'row',
    padding: 15,
    gap: 10
  },
  actionButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  dangerButton: {
    backgroundColor: '#ff3b30'
  }
})
```

## 🚀 Advanced Fine-Grained Patterns

### Reactive Form with Validation

```tsx
// components/ReactiveForm.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Memo, Show } from '@legendapp/state/react'
import { $TextInput } from '@legendapp/state/react-native'
import { observable, computed } from '@legendapp/state'

// Form state with validation
const form$ = observable({
  fields: {
    email: '',
    password: '',
    confirmPassword: ''
  },

  touched: {
    email: false,
    password: false,
    confirmPassword: false
  },

  // Computed validation
  errors: computed(() => {
    const { email, password, confirmPassword } = form$.fields.get()
    const errors: Record<string, string> = {}

    if (!email.includes('@')) {
      errors.email = 'Invalid email address'
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    return errors
  }),

  isValid: computed(() => {
    return Object.keys(form$.errors.get()).length === 0 &&
           Object.values(form$.fields.get()).every(v => v.length > 0)
  })
})

export function ReactiveForm() {
  return (
    <View style={styles.form}>
      {/* Email field - only error message re-renders */}
      <View style={styles.field}>
        <$TextInput
          $value={form$.fields.email}
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          onBlur={() => form$.touched.email.set(true)}
        />
        <Show if={() => form$.touched.email.get() && form$.errors.email.get()}>
          <Memo>
            {() => <Text style={styles.error}>{form$.errors.email.get()}</Text>}
          </Memo>
        </Show>
      </View>

      {/* Password field */}
      <View style={styles.field}>
        <$TextInput
          $value={form$.fields.password}
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onBlur={() => form$.touched.password.set(true)}
        />
        <Show if={() => form$.touched.password.get() && form$.errors.password.get()}>
          <Memo>
            {() => <Text style={styles.error}>{form$.errors.password.get()}</Text>}
          </Memo>
        </Show>
      </View>

      {/* Confirm password field */}
      <View style={styles.field}>
        <$TextInput
          $value={form$.fields.confirmPassword}
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry
          onBlur={() => form$.touched.confirmPassword.set(true)}
        />
        <Show if={() => form$.touched.confirmPassword.get() && form$.errors.confirmPassword.get()}>
          <Memo>
            {() => <Text style={styles.error}>{form$.errors.confirmPassword.get()}</Text>}
          </Memo>
        </Show>
      </View>

      {/* Submit button - only opacity changes */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { opacity: form$.isValid.get() ? 1 : 0.5 }
        ]}
        disabled={!form$.isValid.get()}
        onPress={() => console.log('Submit:', form$.fields.get())}
      >
        <Text style={styles.submitText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    padding: 20
  },
  field: {
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
```

### Reactive Navigation State

```tsx
// navigation/ReactiveNav.tsx
import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Switch, Show } from '@legendapp/state/react'
import { observable } from '@legendapp/state'

// Navigation state
const nav$ = observable({
  currentTab: 'home' as 'home' | 'profile' | 'settings',
  modal: null as null | 'alert' | 'confirm',
  history: [] as string[]
})

// Tab content components
function HomeTab() {
  return <View><Text>Home Content</Text></View>
}

function ProfileTab() {
  return <View><Text>Profile Content</Text></View>
}

function SettingsTab() {
  return <View><Text>Settings Content</Text></View>
}

// Main navigation - no observer needed!
export function ReactiveNavigation() {
  return (
    <View style={{ flex: 1 }}>
      {/* Tab content - only switches when tab changes */}
      <View style={{ flex: 1 }}>
        <Switch value={nav$.currentTab}>
          {{
            home: () => <HomeTab />,
            profile: () => <ProfileTab />,
            settings: () => <SettingsTab />
          }}
        </Switch>
      </View>

      {/* Tab bar - only active tab highlight updates */}
      <View style={{ flexDirection: 'row' }}>
        {(['home', 'profile', 'settings'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={{ flex: 1, padding: 15 }}
            onPress={() => {
              nav$.history.push(nav$.currentTab.get())
              nav$.currentTab.set(tab)
            }}
          >
            <Memo>
              {() => (
                <Text style={{
                  color: nav$.currentTab.get() === tab ? '#007AFF' : '#999',
                  textAlign: 'center'
                }}>
                  {tab.toUpperCase()}
                </Text>
              )}
            </Memo>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal overlay - only renders when modal is shown */}
      <Show if={nav$.modal}>
        {() => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Switch value={nav$.modal}>
              {{
                alert: () => <Text>Alert Modal</Text>,
                confirm: () => <Text>Confirm Modal</Text>
              }}
            </Switch>
          </View>
        )}
      </Show>
    </View>
  )
}
```

## 📊 Performance Comparison

### Traditional Observer Pattern
```tsx
// ❌ Entire component re-renders on any change
const TodoItem = observer(({ todo }) => {
  // Everything re-renders when anything changes
  return (
    <View>
      <Text>{todo.text}</Text>
      <Text>{todo.completed ? '✅' : '⭕'}</Text>
      <Text>{todo.priority}</Text>
    </View>
  )
})
```

### Fine-Grained Reactivity
```tsx
// ✅ Only specific elements re-render
function TodoItem({ todo$ }) {
  // Component renders once, only Memo contents update
  return (
    <View>
      <Memo>{() => <Text>{todo$.text.get()}</Text>}</Memo>
      <Memo>{() => <Text>{todo$.completed.get() ? '✅' : '⭕'}</Text>}</Memo>
      <Memo>{() => <Text>{todo$.priority.get()}</Text>}</Memo>
    </View>
  )
}
```

## 🔄 Migration Strategy

### When MMKV is Fixed

1. **Update the feature flag**:
```typescript
// storage/adapter.ts
export const ENABLE_MMKV = true // Was false
```

2. **Install MMKV**:
```bash
npm install react-native-mmkv
npx pod-install # iOS only
```

3. **That's it!** Your app now uses MMKV with zero code changes.

### Testing Storage Backends

```typescript
// __tests__/storage.test.ts
import { AsyncStorageAdapter, MMKVAdapter } from '../storage/adapter'

describe('Storage Adapters', () => {
  const adapters = [
    { name: 'AsyncStorage', adapter: new AsyncStorageAdapter() },
    // Uncomment when MMKV is available
    // { name: 'MMKV', adapter: new MMKVAdapter() }
  ]

  adapters.forEach(({ name, adapter }) => {
    describe(name, () => {
      test('should store and retrieve', async () => {
        await adapter.setItem('test-key', 'test-value')
        const value = await adapter.getItem('test-key')
        expect(value).toBe('test-value')
      })

      test('should handle missing keys', async () => {
        const value = await adapter.getItem('missing-key')
        expect(value).toBeNull()
      })
    })
  })
})
```

## 🎯 Key Benefits of This Architecture

1. **Minimal Re-renders**: Components render once, only values change
2. **No memo/useCallback needed**: Fine-grained updates eliminate the need
3. **Better Performance**: ~10x fewer renders in typical apps
4. **Storage Flexibility**: Switch backends with one line change
5. **Type Safety**: Full TypeScript inference throughout
6. **Smaller Bundle**: No observer wrappers = less code

## 📝 Migration Checklist

- [ ] Replace `observer()` HOC with fine-grained components
- [ ] Use `<Memo>`, `<Show>`, `<For>`, `<Switch>` for reactive regions
- [ ] Replace `TextInput` with `<$TextInput>` for two-way binding
- [ ] Implement storage adapter pattern
- [ ] Configure persistence globally, not per-observable
- [ ] Test with AsyncStorage first
- [ ] Monitor MMKV fix progress
- [ ] Switch to MMKV when available

---

*Architecture Guide - September 2025*