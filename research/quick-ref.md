# Quick Reference: Context-Engineered Development Guide

*Token counts: L1=181, L2=467, L3=89. Total=737 tokens*

## L1 CRITICAL (181 tokens)

### Top 7 Packages with EXACT Versions
| Package | Version | Key Benefit | Critical Gotcha |
|---------|---------|-------------|----------------|
| `expo` | `~53.0.0` | Zero native config, cloud builds | Use `npx expo install`, never npm |
| `@tanstack/react-query` | `^5.0.0` | Server state management | Breaking v4→v5 API changes |
| `react-native` | `0.79.x` | New Architecture default | Hermes engine mandatory |
| `typescript` | `^5.8.0` | Type safety + performance | Requires `nodenext` module resolution |
| `@react-navigation/native` | `^7.0.0` | Static API with preloading | Async nav state changes |
| `react-native-reanimated` | `^3.0.0` | 60fps animations | Worklet thread complexity |
| `react-native-screens` | `^3.0.0` | Native navigation perf | iOS/Android behavior diffs |

### Top 5 Architecture Patterns with Implementation
| Pattern | Intent | Path | Anti-Pattern |
|---------|---------|------|-------------|
| **Vertical Slicing** | End-to-end user value | `/features/[feature]/index.ts` | Horizontal layers |
| **Feature Co-location** | Physical code proximity | All feature code in single folder | Scattered concerns |
| **Query Key Factories** | Type-safe cache access | `const keys = { users: ['users'] }` | String literals |
| **Barrel Exports** | Clean import paths | `export * from './components'` | Deep import paths |
| **Result Type Pattern** | No throw error handling | `Result<T, E>` union types | Exception throwing |

### Top 3 Critical Anti-Patterns
1. **🚨 NEVER** `npm install --legacy-peer-deps` - Masks dependency conflicts
2. **🚨 NEVER** Use `any` type - Destroys TypeScript benefits  
3. **🚨 NEVER** Horizontal architecture - Slows feature delivery

## L2 IMPLEMENTATION (467 tokens)

### React Native New Architecture Pattern
```typescript
// Modern RN component with Fabric/TurboModules
import { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

const OptimizedComponent = memo(({ data, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(data.id);
  }, [data.id, onPress]);

  return (
    <View style={{ flex: 1 }}>
      <Text>{data.title}</Text>
      <Pressable onPress={handlePress}>
        <Text>Action</Text>
      </Pressable>
    </View>
  );
});
```

### TanStack Query v5 Essential Pattern
```typescript
// Type-safe query with options factory
const postOptions = (id: string) => queryOptions({
  queryKey: ['post', id],
  queryFn: () => fetchPost(id),
  staleTime: 5 * 60 * 1000,
});

// Usage
const { data } = useQuery(postOptions('123'));

// Mutation with optimistic updates
const updateMutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (updatedPost) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previousPosts = queryClient.getQueryData(['posts']);
    
    queryClient.setQueryData(['posts'], (old) =>
      old?.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
    
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['posts'], context?.previousPosts);
  },
});
```

### TypeScript Modern Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

### Vertical Slice Structure
```
src/features/user-profile/
├── index.ts              # Barrel export
├── UserProfile.tsx       # Main component
├── useUserProfile.ts     # Custom hook
├── userProfile.types.ts  # Feature types
├── userProfileApi.ts     # API calls
└── userProfile.test.tsx  # Tests
```

### Expo Installation Pattern
```bash
# ✅ CORRECT - Always use expo install
npx expo install react-native-reanimated
npx expo install @react-navigation/native

# ❌ WRONG - Never use npm with legacy deps
npm install package --legacy-peer-deps
```

### Game Loop Architecture (Idle Game)
```typescript
// Core idle game loop
class GameLoop {
  private lastUpdate = 0;
  private accumulator = 0;
  
  update(timestamp: number) {
    const deltaTime = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;
    
    // Fixed timestep updates for consistency
    this.accumulator += deltaTime;
    while (this.accumulator >= FIXED_TIMESTEP) {
      this.gameLogic.update(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
    }
    
    // Render with interpolation
    this.render(this.accumulator / FIXED_TIMESTEP);
  }
}
```

## L3 REFERENCE (89 tokens)

### Source Files & Key Lines
- **Expo patterns**: `/research/tech/expo.md:225-235` (expo install usage)
- **React Native arch**: `/research/tech/react-native.md:806-815` (New Architecture)  
- **TypeScript config**: `/research/tech/typescript.md:269-339` (Modern tsconfig)
- **TanStack Query**: `/research/tech/tanstack-query.md:305-323` (queryOptions pattern)
- **Vertical slicing**: `/research/planning/vertical-slicing.md:80-85` (folder structure)
- **NPM anti-patterns**: `/research/tech/npm-dependency-management.md:5-12` (--legacy-peer-deps)
- **Game design**: `/research/game-design/idler-clicker-games-best-practices-2025.md:54-59` (core loop)
- **SDLC practices**: `/research/planning/software-development-cycle.md:9-13` (DevOps key practices)

*Last Updated: 2025-08-10 | Based on latest framework versions and industry best practices*