# TanStack Query v5 Comprehensive Report (2024-2025)

## 1. Core Concepts and Philosophy

TanStack Query is a powerful asynchronous state management library that provides server-state utilities and data fetching capabilities across multiple frameworks (React, Vue, Solid, Svelte, Angular). The core philosophy centers around three main concepts:

### Queries
- **Declarative data fetching**: Queries automatically handle loading states, errors, and caching
- **Background synchronization**: Keeps data fresh without user intervention
- **Deduplication**: Multiple components requesting the same data trigger only one network request

### Mutations
- **Server state changes**: Handle POST, PUT, DELETE operations with automatic invalidation
- **Optimistic updates**: Update UI immediately while request is in flight
- **Error handling**: Built-in rollback mechanisms for failed mutations

### Caching
- **Intelligent caching**: Automatic background refetching with configurable staleness
- **Memory management**: Garbage collection for unused queries
- **Persistence**: Optional cache persistence across sessions

## 2. Query Lifecycle and Automatic Background Refetching

### Query States
```typescript
const { data, isLoading, error, isStale, isFetching } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes (was cacheTime in v4)
});
```

### Automatic Refetching Triggers
- **Window focus**: `refetchOnWindowFocus` (default: true)
- **Network reconnect**: `refetchOnReconnect` (default: true)
- **Component mount**: `refetchOnMount` (default: true)
- **Interval refetching**: `refetchInterval`

### Background Refetching Example
```typescript
const usePostsQuery = () => useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 30 * 1000,        // Consider fresh for 30 seconds
  refetchInterval: 60 * 1000,  // Refetch every minute
  refetchIntervalInBackground: true,
});
```

## 3. Mutations with Optimistic Updates

### Basic Mutation
```typescript
const createPostMutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

### Optimistic Updates (v5 Simplified)
```typescript
const updatePostMutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (updatedPost) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    
    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(['posts']);
    
    // Optimistically update
    queryClient.setQueryData(['posts'], (old) =>
      old?.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
    
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context?.previousPosts);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});

// Usage with variables access (v5 feature)
const { mutate, variables, isPending } = updatePostMutation;

// Display optimistic state directly from mutation
const optimisticPost = variables || currentPost;
```

## 4. Query Invalidation Strategies

### Targeted Invalidation
```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['posts'] });

// Invalidate queries matching pattern
queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'draft'
});
```

### Partial Matching
```typescript
// Invalidate all post-related queries
queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });

// Refetch instead of just invalidating
queryClient.refetchQueries({ queryKey: ['posts'] });
```

### Smart Invalidation in Mutations
```typescript
const deletePostMutation = useMutation({
  mutationFn: deletePost,
  onSuccess: (data, postId) => {
    // Remove from cache
    queryClient.removeQueries({ queryKey: ['post', postId] });
    
    // Update list cache
    queryClient.setQueryData(['posts'], (old) =>
      old?.filter(post => post.id !== postId)
    );
  },
});
```

## 5. Infinite Queries for Pagination

### Basic Infinite Query (v5 with required initialPageParam)
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts({ page: pageParam }),
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.hasMore ? allPages.length + 1 : undefined;
  },
  getPreviousPageParam: (firstPage, allPages) => {
    return firstPage.page > 1 ? firstPage.page - 1 : undefined;
  },
  maxPages: 5, // v5 feature: limit cached pages
});
```

### Performance Optimization with maxPages
```typescript
const useInfinitePostsQuery = () => useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  maxPages: 3, // Only keep 3 pages in memory for performance
});
```

### Accessing Infinite Data
```typescript
const posts = data?.pages.flatMap(page => page.posts) ?? [];
```

## 6. Parallel and Dependent Queries

### Parallel Queries
```typescript
const useUserDashboard = (userId: string) => {
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  const postsQuery = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchUserPosts(userId),
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', userId],
    queryFn: () => fetchUserComments(userId),
  });

  return { userQuery, postsQuery, commentsQuery };
};
```

### Dependent Queries with skipToken
```typescript
import { skipToken } from '@tanstack/react-query';

const useUserProfile = (userId?: string) => {
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: userId ? () => fetchUser(userId) : skipToken,
  });

  const settingsQuery = useQuery({
    queryKey: ['settings', userId],
    queryFn: userQuery.data ? () => fetchUserSettings(userId!) : skipToken,
  });

  return { userQuery, settingsQuery };
};
```

### useQueries for Dynamic Parallel Queries
```typescript
const useMultipleUsers = (userIds: string[]) => {
  const queries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
    })),
    combine: (results) => ({
      data: results.map(result => result.data),
      pending: results.some(result => result.isPending),
    }),
  });

  return queries;
};
```

## 7. Error Handling and Retry Mechanisms

### Default Retry Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Client-side default (0 on server in v5)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      throwOnError: false, // Was useErrorBoundary in v4
    },
    mutations: {
      retry: 0, // Don't retry mutations by default
    },
  },
});
```

### Custom Error Handling
```typescript
const usePostsWithErrorHandling = () => {
  const { data, error, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    retry: (failureCount, error) => {
      // Don't retry for 404s
      if (error.status === 404) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle errors in component
  if (isError) {
    console.error('Query failed:', error);
  }

  return { data, error, isError };
};
```

### Global Error Handling
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => error.status >= 500,
    },
  },
});

// Error Boundary will catch 5xx errors
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MyComponent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

## 8. TypeScript Integration Best Practices

### Type-Safe Query Options
```typescript
import { queryOptions } from '@tanstack/react-query';

const postOptions = (id: string) => queryOptions({
  queryKey: ['post', id],
  queryFn: () => fetchPost(id),
});

// Type-safe usage
const { data } = useQuery(postOptions('123'));
// data is automatically typed as Post | undefined

// Type-safe prefetching
queryClient.prefetchQuery(postOptions('123'));

// Type-safe cache access
const post = queryClient.getQueryData(postOptions('123').queryKey);
```

### Suspense Queries (Never Undefined)
```typescript
const { data: post } = useSuspenseQuery({
  // ^? data is Post (never undefined)
  queryKey: ['post', postId],
  queryFn: () => fetchPost(postId),
});
```

### Custom Hook with TypeScript
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
}

const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: (): Promise<Post> => fetchPost(id),
    enabled: !!id,
  });
};
```

### Mutation State Hook (v5 Feature)
```typescript
const allMutations = useMutationState({
  filters: { status: 'pending' },
  select: (mutation) => ({
    id: mutation.mutationId,
    variables: mutation.state.variables,
  }),
});
```

## 9. Performance Optimization Techniques

### Query Key Factories
```typescript
const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
```

### Selective Re-rendering
```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  select: (data) => data.map(post => ({
    id: post.id,
    title: post.title,
  })), // Only re-render when id or title changes
});
```

### Prefetching Strategies
```typescript
const usePostsWithPrefetch = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  // Prefetch next page
  useEffect(() => {
    if (query.data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ['posts', 'next'],
        queryFn: () => fetchPosts({ page: 2 }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [query.data, queryClient]);

  return query;
};
```

### Memory Management
```typescript
const usePostsWithCleanup = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

## 10. DevTools and Debugging

### Setup
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Debugging Helpers
```typescript
// Query state inspection
const query = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
console.log({
  status: query.status,
  fetchStatus: query.fetchStatus,
  failureCount: query.failureCount,
  failureReason: query.failureReason,
});

// Cache inspection
const cache = queryClient.getQueryCache();
console.log('All queries:', cache.getAll());
```

## 11. Brief Comparison with Other Libraries

| Feature | TanStack Query v5 | SWR | Apollo Client | RTK Query |
|---------|-------------------|-----|---------------|-----------|
| **Bundle Size** | ~13kb | ~4kb | ~30kb+ | ~9kb (with RTK) |
| **Framework Support** | Multi-framework | React only | React + others | Redux-based |
| **GraphQL Focus** | Agnostic | Agnostic | GraphQL-first | Agnostic |
| **Normalized Caching** | Manual | Manual | Automatic | Manual |
| **DevTools** | Excellent | Basic | Excellent | Redux DevTools |
| **TypeScript** | Excellent | Good | Excellent | Excellent |
| **Learning Curve** | Moderate | Easy | Steep | Moderate |
| **Offline Support** | Good | Limited | Good | Good |

### When to Choose Each:
- **TanStack Query**: Maximum flexibility, cross-framework support, complex apps
- **SWR**: Simple React apps, minimal bundle size, basic needs
- **Apollo Client**: GraphQL-heavy applications, normalized caching needs
- **RTK Query**: Already using Redux, tight integration with Redux state

## 12. Essential Practical Examples

### Basic Query
```typescript
import { useQuery } from '@tanstack/react-query';

const Posts = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};
```

### Mutation Example
```typescript
const CreatePost = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};
```

### Infinite Query Example
```typescript
const InfinitePostsList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts?page=${pageParam}`);
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    maxPages: 5, // v5 performance optimization
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
};
```

## 13. v5 Breaking Changes and Migration from v4

### Major Breaking Changes

#### 1. Unified API (Single Object Parameter)
```typescript
// ❌ v4 - Multiple overloads
useQuery(['posts'], fetchPosts, { staleTime: 5000 });

// ✅ v5 - Single object only
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5000,
});
```

#### 2. Removed Callback Props
```typescript
// ❌ v4 - Callbacks in useQuery
useQuery(['posts'], fetchPosts, {
  onSuccess: (data) => console.log(data),
  onError: (error) => console.error(error),
});

// ✅ v5 - Use effects instead
const { data, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

useEffect(() => {
  if (data) console.log(data);
}, [data]);

useEffect(() => {
  if (error) console.error(error);
}, [error]);
```

#### 3. Infinite Query Changes
```typescript
// ❌ v4
useInfiniteQuery(['posts'], fetchPosts, {
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// ✅ v5 - Required initialPageParam
useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  initialPageParam: null, // Required!
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

#### 4. Renamed Options
```typescript
// ❌ v4
useQuery(['posts'], fetchPosts, {
  cacheTime: 300000,
  useErrorBoundary: true,
});

// ✅ v5
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  gcTime: 300000,        // Renamed from cacheTime
  throwOnError: true,    // Renamed from useErrorBoundary
});
```

### Migration Tools

#### ESLint Rule (Auto-fixable)
```bash
npm install @tanstack/eslint-plugin-query
```

```json
{
  "extends": ["plugin:@tanstack/eslint-plugin-query/recommended"]
}
```

#### Codemod
```bash
npx @tanstack/query-codemod v5/remove-overloads ./src
```

### TypeScript Updates
- Minimum TypeScript version: 4.7+
- `Error` is now default error type instead of `unknown`
- Private class fields are now truly private using ECMAScript features

## 14. Best Practices for 2024-2025

### 1. Query Key Management
```typescript
// Create query key factories
const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};
```

### 2. Custom Hooks Pattern
```typescript
// Encapsulate query logic
const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
```

### 3. Error Boundaries for Critical Queries
```typescript
const useCriticalData = () => {
  return useQuery({
    queryKey: ['critical-data'],
    queryFn: fetchCriticalData,
    throwOnError: true, // Will throw to nearest error boundary
  });
};
```

### 4. Optimistic Updates with Rollback
```typescript
const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items']);
      
      queryClient.setQueryData(['items'], (old) => 
        old.map(item => item.id === variables.id ? { ...item, ...variables } : item)
      );
      
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['items'], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
```

### 5. Suspense-First Architecture
```typescript
// Use suspense queries for critical data
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // user is never undefined here
  return <div>{user.name}</div>;
};
```

### 6. Performance Monitoring
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      meta: {
        // Track query performance
        startTime: Date.now(),
      },
    },
  },
});

// Custom hook for performance tracking
const useQueryWithMetrics = (options) => {
  const result = useQuery(options);
  
  useEffect(() => {
    if (result.dataUpdatedAt && options.meta?.startTime) {
      const duration = result.dataUpdatedAt - options.meta.startTime;
      analytics.track('query_duration', { duration, queryKey: options.queryKey });
    }
  }, [result.dataUpdatedAt]);
  
  return result;
};
```

### 7. Cache Warming Strategies
```typescript
// Prefetch on hover
const useHoverPrefetch = () => {
  const queryClient = useQueryClient();
  
  const prefetchUser = useCallback((userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
      staleTime: 30 * 1000,
    });
  }, [queryClient]);
  
  return { prefetchUser };
};
```

### 8. Testing Best Practices
```typescript
// Test utilities
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Component testing
const renderWithQuery = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

TanStack Query v5 represents a significant evolution in data fetching libraries, offering improved TypeScript support, better performance optimizations, and a more consistent API. The migration from v4 requires careful attention to breaking changes, but the improved developer experience and new features make it worthwhile for modern applications in 2024-2025.