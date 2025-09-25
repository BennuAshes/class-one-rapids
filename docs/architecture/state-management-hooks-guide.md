# State Management with Hooks & Fine-Grained Reactivity

*Architecture Guide - Complete Hook-Based State Management*

## 🎯 Core Principles

1. **Components never import observables directly** - All state access through hooks
2. **Hooks provide fine-grained reactive primitives** - Return observables for surgical updates
3. **Single source of truth** - Stores are private, hooks are the public API
4. **Type-safe throughout** - Full TypeScript with no compromises

## 📁 Project Structure

```
src/
├── state/
│   ├── stores/              # Private observable stores
│   │   ├── todos.store.ts   # Internal todo state
│   │   └── user.store.ts    # Internal user state
│   ├── hooks/               # Public API hooks
│   │   ├── useTodos.ts      # Todo state hook
│   │   └── useUser.ts       # User state hook
│   └── config/              # Storage configuration
│       └── persistence.ts   # Persistence setup
└── components/              # UI Components (only use hooks)
    └── TodoList.tsx         # Uses useTodos hook
```

## 🔧 Storage Configuration

```typescript
// state/config/persistence.ts
import { configureSynced, synced } from "@legendapp/state/sync"
import { configureObservablePersistence } from '@legendapp/state/persist'
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure persistence globally
const persistPlugin = ObservablePersistAsyncStorage({
  AsyncStorage
})

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
```

## 🏪 Private Store Implementation

```typescript
// state/stores/todos.store.ts
import { observable } from "@legendapp/state"
import { persist } from '../config/persistence'

// Types
export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  updatedAt: number
  tags: string[]
}

export interface TodoFilters {
  showCompleted: boolean
  sortBy: 'date' | 'priority' | 'alphabetical'
  searchQuery: string
  selectedTags: string[]
}

// Private store - NOT exported!
const todos$ = observable({
  items: persist({
    initial: [] as Todo[],
    persist: { name: 'todos-v1' }
  }),

  filters: persist({
    initial: {
      showCompleted: true,
      sortBy: 'date',
      searchQuery: '',
      selectedTags: []
    } as TodoFilters,
    persist: { name: 'todo-filters-v1' }
  }),

  // UI state (not persisted)
  ui: {
    isLoading: false,
    error: null as string | null,
    selectedIds: [] as string[]
  }
})

// Export only for use by the hook
export { todos$ }
```

## 🪝 Hook Implementation with Fine-Grained Returns

```typescript
// state/hooks/useTodos.ts
import { useMemo } from 'react'
import { observable, Observable, computed } from '@legendapp/state'
import { todos$ } from '../stores/todos.store'
import type { Todo, TodoFilters } from '../stores/todos.store'

// Hook return type for type safety
interface UseTodosReturn {
  // Fine-grained observables for components
  items$: Observable<Todo[]>
  filters$: Observable<TodoFilters>

  // Computed observables
  filtered$: Observable<Todo[]>
  stats$: Observable<{
    total: number
    completed: number
    pending: number
    highPriority: number
  }>

  // UI state observables
  isLoading$: Observable<boolean>
  error$: Observable<string | null>
  selectedIds$: Observable<string[]>

  // Actions (regular functions, not observables)
  actions: {
    add: (text: string, priority?: Todo['priority']) => void
    update: (id: string, updates: Partial<Todo>) => void
    toggle: (id: string) => void
    remove: (id: string) => void
    clearCompleted: () => void

    // Bulk operations
    toggleAll: () => void
    removeSelected: () => void

    // Filter actions
    setSearchQuery: (query: string) => void
    setSortBy: (sort: TodoFilters['sortBy']) => void
    toggleShowCompleted: () => void
    toggleTag: (tag: string) => void

    // Selection actions
    toggleSelection: (id: string) => void
    clearSelection: () => void
    selectAll: () => void
  }
}

export function useTodos(): UseTodosReturn {
  // Memoize the return object but not the observables themselves
  return useMemo(() => {
    // Computed filtered todos
    const filtered$ = computed(() => {
      const items = todos$.items.get()
      const filters = todos$.filters.get()

      let filtered = filters.showCompleted
        ? items
        : items.filter(t => !t.completed)

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(t =>
          t.text.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }

      if (filters.selectedTags.length > 0) {
        filtered = filtered.filter(t =>
          filters.selectedTags.every(tag => t.tags.includes(tag))
        )
      }

      // Sort
      return [...filtered].sort((a, b) => {
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
    })

    // Computed stats
    const stats$ = computed(() => {
      const items = todos$.items.get()
      const completed = items.filter(t => t.completed)
      const highPriority = items.filter(t =>
        t.priority === 'high' && !t.completed
      )

      return {
        total: items.length,
        completed: completed.length,
        pending: items.length - completed.length,
        highPriority: highPriority.length
      }
    })

    // Actions
    const actions = {
      add: (text: string, priority: Todo['priority'] = 'medium') => {
        const now = Date.now()
        todos$.items.push({
          id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
          text,
          completed: false,
          priority,
          createdAt: now,
          updatedAt: now,
          tags: []
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
        // Also remove from selection
        const selected = todos$.ui.selectedIds.get()
        todos$.ui.selectedIds.set(selected.filter(sid => sid !== id))
      },

      clearCompleted: () => {
        const items = todos$.items.get()
        todos$.items.set(items.filter(t => !t.completed))
      },

      toggleAll: () => {
        const items = todos$.items.get()
        const allCompleted = items.every(t => t.completed)
        items.forEach(item => {
          const todo$ = todos$.items.find(t => t.id.get() === item.id)
          if (todo$) {
            todo$.completed.set(!allCompleted)
            todo$.updatedAt.set(Date.now())
          }
        })
      },

      removeSelected: () => {
        const selectedIds = todos$.ui.selectedIds.get()
        const items = todos$.items.get()
        todos$.items.set(items.filter(t => !selectedIds.includes(t.id)))
        todos$.ui.selectedIds.set([])
      },

      setSearchQuery: (query: string) => {
        todos$.filters.searchQuery.set(query)
      },

      setSortBy: (sort: TodoFilters['sortBy']) => {
        todos$.filters.sortBy.set(sort)
      },

      toggleShowCompleted: () => {
        todos$.filters.showCompleted.toggle()
      },

      toggleTag: (tag: string) => {
        const tags = todos$.filters.selectedTags.get()
        if (tags.includes(tag)) {
          todos$.filters.selectedTags.set(tags.filter(t => t !== tag))
        } else {
          todos$.filters.selectedTags.set([...tags, tag])
        }
      },

      toggleSelection: (id: string) => {
        const selected = todos$.ui.selectedIds.get()
        if (selected.includes(id)) {
          todos$.ui.selectedIds.set(selected.filter(sid => sid !== id))
        } else {
          todos$.ui.selectedIds.set([...selected, id])
        }
      },

      clearSelection: () => {
        todos$.ui.selectedIds.set([])
      },

      selectAll: () => {
        const items = todos$.items.get()
        todos$.ui.selectedIds.set(items.map(t => t.id))
      }
    }

    return {
      // Observable references (not values!)
      items$: todos$.items,
      filters$: todos$.filters,
      filtered$,
      stats$,
      isLoading$: todos$.ui.isLoading,
      error$: todos$.ui.error,
      selectedIds$: todos$.ui.selectedIds,
      actions
    }
  }, []) // Empty deps - hook always returns same observables
}
```

## 🎨 Component Implementation (Hook-Only Access)

```tsx
// components/TodoList.tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native'
import { For, Show, Memo, Switch } from '@legendapp/state/react'
import { $TextInput, $Switch } from '@legendapp/state/react-native'
import { useTodos } from '../state/hooks/useTodos'
import type { Observable } from '@legendapp/state'
import type { Todo } from '../state/stores/todos.store'

// TodoItem receives observable from parent via For
function TodoItem({
  item$,
  onToggle,
  onRemove,
  isSelected$,
  onToggleSelect
}: {
  item$: Observable<Todo>
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  isSelected$: Observable<boolean>
  onToggleSelect: (id: string) => void
}) {
  return (
    <View style={styles.todoItem}>
      {/* Selection checkbox */}
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => onToggleSelect(item$.id.get())}
      >
        <Memo>
          {() => isSelected$.get() ? '☑️' : '⬜'}
        </Memo>
      </TouchableOpacity>

      {/* Complete checkbox */}
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(item$.id.get())}
      >
        <Memo>
          {() => item$.completed.get() ? '✅' : '⭕'}
        </Memo>
      </TouchableOpacity>

      {/* Todo text - only this updates when text changes */}
      <View style={styles.textContainer}>
        <Memo>
          {() => (
            <Text style={[
              styles.todoText,
              item$.completed.get() && styles.completedText
            ]}>
              {item$.text.get()}
            </Text>
          )}
        </Memo>
      </View>

      {/* Priority badge */}
      <Memo>
        {() => {
          const priority = item$.priority.get()
          const colors = {
            low: '#gray',
            medium: '#orange',
            high: '#red'
          }
          return (
            <View style={[
              styles.priorityBadge,
              { backgroundColor: colors[priority] }
            ]}>
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          )
        }}
      </Memo>

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onRemove(item$.id.get())}
      >
        <Text>🗑️</Text>
      </TouchableOpacity>
    </View>
  )
}

// Main component - only uses the hook
export function TodoList() {
  // Get everything from the hook
  const {
    filters$,
    filtered$,
    stats$,
    isLoading$,
    error$,
    selectedIds$,
    actions
  } = useTodos()

  return (
    <View style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <View style={styles.stats}>
          <Memo>{() => <Text>Total: {stats$.total.get()}</Text>}</Memo>
          <Memo>{() => <Text>✅ {stats$.completed.get()}</Text>}</Memo>
          <Memo>{() => <Text>⏳ {stats$.pending.get()}</Text>}</Memo>
          <Show if={() => stats$.highPriority.get() > 0}>
            <Memo>
              {() => (
                <Text style={styles.urgentText}>
                  🔥 {stats$.highPriority.get()} urgent
                </Text>
              )}
            </Memo>
          </Show>
        </View>
      </View>

      {/* Filters section */}
      <View style={styles.filters}>
        <$TextInput
          $value={filters$.searchQuery}
          style={styles.searchInput}
          placeholder="Search todos..."
        />

        <View style={styles.filterRow}>
          <Text>Show completed:</Text>
          <$Switch $value={filters$.showCompleted} />
        </View>

        {/* Sort buttons */}
        <View style={styles.sortButtons}>
          <Memo>
            {() => {
              const sortBy = filters$.sortBy.get()
              return (['date', 'priority', 'alphabetical'] as const).map(sort => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortButton,
                    sortBy === sort && styles.sortButtonActive
                  ]}
                  onPress={() => actions.setSortBy(sort)}
                >
                  <Text style={sortBy === sort ? styles.activeText : styles.inactiveText}>
                    {sort}
                  </Text>
                </TouchableOpacity>
              ))
            }}
          </Memo>
        </View>
      </View>

      {/* Selection controls */}
      <Show if={() => selectedIds$.get().length > 0}>
        <View style={styles.selectionBar}>
          <Memo>
            {() => <Text>{selectedIds$.get().length} selected</Text>}
          </Memo>
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={actions.removeSelected}
            >
              <Text>Delete Selected</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={actions.clearSelection}
            >
              <Text>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Show>

      {/* Loading state */}
      <Show if={isLoading$}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </Show>

      {/* Error state */}
      <Show if={error$}>
        <Memo>
          {() => (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error$.get()}</Text>
            </View>
          )}
        </Memo>
      </Show>

      {/* Todo list */}
      <ScrollView style={styles.list}>
        <For each={filtered$}>
          {(item$) => {
            const id = item$.id.get()
            const isSelected$ = computed(() =>
              selectedIds$.get().includes(id)
            )
            return (
              <TodoItem
                key={id}
                item$={item$}
                onToggle={actions.toggle}
                onRemove={actions.remove}
                isSelected$={isSelected$}
                onToggleSelect={actions.toggleSelection}
              />
            )
          }}
        </For>

        {/* Empty state */}
        <Show if={() => filtered$.get().length === 0}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No todos found</Text>
            <Show if={() => filters$.searchQuery.get().length > 0}>
              <Text style={styles.emptyHint}>Try adjusting your search</Text>
            </Show>
          </View>
        </Show>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            const text = prompt('New todo:')
            if (text) actions.add(text)
          }}
        >
          <Text style={styles.buttonText}>Add Todo</Text>
        </TouchableOpacity>

        <Show if={() => stats$.completed.get() > 0}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.dangerButton]}
            onPress={actions.clearCompleted}
          >
            <Text style={styles.buttonText}>Clear Completed</Text>
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
  activeText: {
    color: '#fff'
  },
  inactiveText: {
    color: '#333'
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f4ff'
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 10
  },
  loading: {
    padding: 20,
    alignItems: 'center'
  },
  error: {
    padding: 10,
    backgroundColor: '#ffebee'
  },
  errorText: {
    color: 'red'
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
  selectBox: {
    marginRight: 10
  },
  checkbox: {
    marginRight: 15
  },
  textContainer: {
    flex: 1
  },
  todoText: {
    fontSize: 16
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginHorizontal: 10
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
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 5
  },
  primaryButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  dangerButton: {
    backgroundColor: '#ff3b30'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
```

## 🔄 Advanced Hook Patterns

### Async Operations Hook

```typescript
// state/hooks/useTodosAsync.ts
import { useMemo, useCallback } from 'react'
import { observable, Observable } from '@legendapp/state'
import { useTodos } from './useTodos'

interface UseTodosAsyncReturn extends ReturnType<typeof useTodos> {
  // Async actions
  asyncActions: {
    fetchTodos: () => Promise<void>
    saveTodo: (todo: Partial<Todo>) => Promise<void>
    syncWithServer: () => Promise<void>
  }
}

export function useTodosAsync(): UseTodosAsyncReturn {
  const todos = useTodos()

  const asyncActions = useMemo(() => ({
    fetchTodos: async () => {
      todos.isLoading$.set(true)
      todos.error$.set(null)

      try {
        const response = await fetch('/api/todos')
        const data = await response.json()
        todos.items$.set(data)
      } catch (error) {
        todos.error$.set(error.message)
      } finally {
        todos.isLoading$.set(false)
      }
    },

    saveTodo: async (todo: Partial<Todo>) => {
      todos.isLoading$.set(true)

      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          body: JSON.stringify(todo)
        })
        const saved = await response.json()
        todos.actions.add(saved.text, saved.priority)
      } catch (error) {
        todos.error$.set(error.message)
      } finally {
        todos.isLoading$.set(false)
      }
    },

    syncWithServer: async () => {
      // Sync logic here
    }
  }), [todos])

  return {
    ...todos,
    asyncActions
  }
}
```

### Derived State Hook

```typescript
// state/hooks/useTodosDerived.ts
import { computed, Observable } from '@legendapp/state'
import { useTodos } from './useTodos'

interface UseTodosDerivedReturn {
  // All original hook returns
  base: ReturnType<typeof useTodos>

  // Additional derived state
  hasTodos$: Observable<boolean>
  allCompleted$: Observable<boolean>
  hasUrgent$: Observable<boolean>
  completionPercentage$: Observable<number>

  // Tag-related computed values
  allTags$: Observable<string[]>
  tagCounts$: Observable<Map<string, number>>
}

export function useTodosDerived(): UseTodosDerivedReturn {
  const base = useTodos()

  const hasTodos$ = computed(() => base.items$.get().length > 0)

  const allCompleted$ = computed(() => {
    const items = base.items$.get()
    return items.length > 0 && items.every(t => t.completed)
  })

  const hasUrgent$ = computed(() =>
    base.stats$.highPriority.get() > 0
  )

  const completionPercentage$ = computed(() => {
    const stats = base.stats$.get()
    if (stats.total === 0) return 0
    return Math.round((stats.completed / stats.total) * 100)
  })

  const allTags$ = computed(() => {
    const items = base.items$.get()
    const tagSet = new Set<string>()
    items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  })

  const tagCounts$ = computed(() => {
    const items = base.items$.get()
    const counts = new Map<string, number>()
    items.forEach(item => {
      item.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })
    return counts
  })

  return {
    base,
    hasTodos$,
    allCompleted$,
    hasUrgent$,
    completionPercentage$,
    allTags$,
    tagCounts$
  }
}
```

## 🧪 Testing Hooks

```typescript
// __tests__/hooks/useTodos.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useTodos } from '../../state/hooks/useTodos'

describe('useTodos Hook', () => {
  test('should add todo', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.add('Test todo', 'high')
    })

    // Access the observable value
    expect(result.current.items$.get()).toHaveLength(1)
    expect(result.current.items$.get()[0].text).toBe('Test todo')
    expect(result.current.items$.get()[0].priority).toBe('high')
  })

  test('should compute stats correctly', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.add('Todo 1', 'high')
      result.current.actions.add('Todo 2', 'low')
      result.current.actions.add('Todo 3', 'high')
    })

    // Mark one as completed
    const firstId = result.current.items$.get()[0].id
    act(() => {
      result.current.actions.toggle(firstId)
    })

    const stats = result.current.stats$.get()
    expect(stats.total).toBe(3)
    expect(stats.completed).toBe(1)
    expect(stats.pending).toBe(2)
    expect(stats.highPriority).toBe(1) // One high priority uncompleted
  })

  test('should filter todos', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.add('Buy milk', 'low')
      result.current.actions.add('Write code', 'high')
      result.current.actions.add('Buy bread', 'medium')
    })

    // Set search query
    act(() => {
      result.current.actions.setSearchQuery('buy')
    })

    const filtered = result.current.filtered$.get()
    expect(filtered).toHaveLength(2)
    expect(filtered.every(t => t.text.toLowerCase().includes('buy'))).toBe(true)
  })
})
```

## 📋 Best Practices

### ✅ DO

1. **Always access state through hooks**
   ```tsx
   // Good
   const { items$, actions } = useTodos()
   ```

2. **Return observables from hooks for fine-grained updates**
   ```tsx
   // Good - returns observable
   return { items$: todos$.items }
   ```

3. **Use computed for derived state**
   ```tsx
   // Good
   const filtered$ = computed(() => /* filter logic */)
   ```

4. **Keep actions as regular functions**
   ```tsx
   // Good
   const actions = {
     add: (text: string) => { /* ... */ }
   }
   ```

### ❌ DON'T

1. **Never import stores directly in components**
   ```tsx
   // Bad
   import { todos$ } from '../stores/todos.store'
   ```

2. **Don't return observable values from hooks**
   ```tsx
   // Bad - returns value, not observable
   return { items: todos$.items.get() }
   ```

3. **Don't wrap components with observer**
   ```tsx
   // Bad - use fine-grained updates instead
   export default observer(TodoList)
   ```

4. **Don't create observables in components**
   ```tsx
   // Bad
   const localState$ = observable({ value: 0 })
   ```

## 🎯 Benefits of This Architecture

1. **Complete Separation of Concerns**
   - Components know nothing about state implementation
   - Easy to mock hooks for testing
   - Can swap state management without touching components

2. **Fine-Grained Performance**
   - Components render once
   - Only specific values update
   - No unnecessary re-renders

3. **Type Safety Throughout**
   - Hooks provide typed returns
   - Observables maintain type information
   - Actions are type-checked

4. **Testability**
   - Hooks can be tested in isolation
   - Components can be tested with mock hooks
   - State logic is separate from UI

5. **Scalability**
   - Easy to compose hooks
   - Can split stores as needed
   - Async operations handled cleanly

## 📝 Migration Checklist

- [ ] Move all observables to private stores
- [ ] Create hooks for each store
- [ ] Return observables from hooks, not values
- [ ] Use computed for all derived state
- [ ] Remove all direct store imports from components
- [ ] Replace observer HOC with fine-grained components
- [ ] Add TypeScript types for hook returns
- [ ] Test hooks in isolation
- [ ] Document hook APIs

---

*State Management Architecture Guide - Hook-Based Fine-Grained Reactivity*