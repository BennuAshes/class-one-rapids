# Legend-State Persistence & Sync

*Official API Reference for Legend-State Sync System*

## Core Concepts

Legend-State's sync system enables automatic persisting and syncing while supporting local-first applications. Changes made offline persist between sessions for retry when reconnected.

### Multi-Step Sync Flow

The sync engine follows this process:
1. Save pending changes to local storage
2. Persist changes locally
3. Sync to remote storage
4. Update observable with server responses (timestamps, etc.)
5. Clear pending changes

## Setup Methods

### Using `synced()` Constructor

Creates lazy-loaded computed function activating on `get()`:
```typescript
import { synced } from '@legendapp/state/sync'

const store$ = observable(synced({
  initial: [],
  persist: { name: 'persistKey' }
}))
```

### Using `syncObservable()`

Apply sync to existing observables:
```typescript
import { syncObservable } from '@legendapp/state/sync'

const state$ = observable({ initialKey: 'value' })
syncObservable(state$, {
  persist: { name: 'test' }
})
```

## Persistence Plugins

### React Native - AsyncStorage

**Recommended for React Native/Expo** - Requires `@react-native-async-storage/async-storage`:
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

### Web - Local Storage

```typescript
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

syncObservable(state$, {
  persist: {
    name: "documents",
    plugin: ObservablePersistLocalStorage
  }
})
```

### Web - IndexedDB

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

## Key Configuration Options

| Option | Type | Purpose | Example |
|--------|------|---------|---------|
| `persist.name` | string | Storage key identifier | `'user-settings'` |
| `persist.plugin` | Plugin | Storage backend selection | `observablePersistAsyncStorage({ AsyncStorage })` |
| `persist.retrySync` | boolean | Persist pending changes for retry | `true` |
| `persist.debounceSet` | number | Delay before syncing changes (ms) | `1000` |
| `initial` | any | Default value before loading | `[]` or `{}` |
| `mode` | string | Update strategy | `'set'`, `'assign'`, `'merge'`, `'append'`, `'prepend'` |
| `retry.infinite` | boolean | Continuous retry on failure | `true` |

## Remote Sync Patterns

### Basic Server Sync

```typescript
import { syncedFetch } from '@legendapp/state/sync'

const store$ = observable({
  users: syncedFetch({
    get: 'https://api.example/users',
    set: 'https://api.example/users'
  })
})
```

### Paging Implementation

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

### Offline-First Configuration

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

## Status Monitoring

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

### Available Properties

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

## Async Persistence Handling

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

## Data Transformation

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

### Helper Utilities

- `transformStringifyDates`: Convert dates to/from strings
- `transformStringifyKeys`: Convert Map/Set to/from objects
- `combineTransforms`: Combine multiple transformations

## Global Configuration Pattern

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

## Update Modes

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

## Debouncing Writes

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

## Important Notes

1. **Lazy Activation**: `synced` creates lazy computed functions—only activate on `get()`
2. **Observing Context**: `get()` is an observing context enabling dynamic query updates
3. **Plugin Inheritance**: Plugins build atop `synced`, inheriting all configuration options
4. **Retry Mechanism**: Ensure offline changes sync when reconnected via `retrySync: true`
5. **Transform Hooks**: Enable encryption, stringification, and versioning via `transform`

## Common Patterns

### Debounced Auto-Save

```typescript
const document$ = observable(synced({
  initial: { title: '', content: '' },
  persist: {
    name: 'draft',
    debounceSet: 2000 // Save 2 seconds after typing stops
  }
}))
```

### Version Migration

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

### Manual Sync Trigger

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

*See also: [State Management with Hooks Guide](./state-management-hooks-guide.md)*
