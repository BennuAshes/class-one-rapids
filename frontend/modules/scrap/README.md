# Scrap Passive Generation System

## Overview

Tick-based passive resource generation system where AI Pets generate "scrap" resources every 1 second.

## Features

- ✅ Automatic scrap generation (1 scrap per pet per 3-second tick)
- ✅ Offline accumulation (max 4 hours / 48 ticks)
- ✅ Persistent storage with Legend-State + AsyncStorage
- ✅ Fine-grained reactive UI updates
- ✅ Number formatting for large values (K, M, B)

## Architecture

### Components

- **ScrapCounter**: Displays scrap count and generation rate
- **useScrapGeneration**: Hook providing tick-based generation behavior
- **scrapStore**: Legend-State store with persistence

### File Structure

```
frontend/modules/scrap/
├── ScrapCounter.tsx                 # Main UI component
├── hooks/
│   └── useScrapGeneration.ts        # Generation hook
├── stores/
│   ├── scrap.store.ts               # State store
│   └── scrap.store.test.ts          # Store tests (5/5 ✅)
├── utils/
│   ├── scrapValidation.ts           # Validation utility
│   ├── scrapValidation.test.ts      # Validation tests (5/5 ✅)
│   ├── scrapCalculations.ts         # Calculation utility
│   └── scrapCalculations.test.ts    # Calculation tests (4/4 ✅)
├── types.ts                         # Constants and types
└── README.md                        # This file
```

## Usage

### In Component

```typescript
import { ScrapCounter } from "@/modules/scrap/ScrapCounter";

function MyScreen() {
  const { count$ } = usePersistedCounter("pet-count", 0);

  return (
    <View>
      <ScrapCounter petCount={count$.get()} />
    </View>
  );
}
```

### Direct Hook Usage

```typescript
import { useScrapGeneration } from "@/modules/scrap/hooks/useScrapGeneration";

function CustomDisplay({ petCount }: { petCount: number }) {
  const { scrap$, generationRate$ } = useScrapGeneration(petCount);

  return <Memo>{() => <Text>Scrap: {scrap$.get()}</Text>}</Memo>;
}
```

## Testing

```bash
# Run all scrap module tests
npm test -- scrap

# Run with coverage
npm test -- scrap --coverage

# Run specific test file
npm test -- ScrapCounter.test
```

**Test Results**: 14/14 tests passing ✅

## Performance

- Tick interval: 3000ms (±100ms tolerance)
- UI update latency: < 50ms
- Storage write frequency: Max 1/second (debounced)
- Memory footprint: < 5MB

## Offline Accumulation

- Caps at 4 hours (48 ticks maximum)
- Calculation: `min(petCount * elapsedTicks, petCount * 48)`
- Applied on app resume (background → active transition)

## Implementation Status

### ✅ Completed (Phase 1-3)

- Task 1.1: Basic validation utilities (tests: 5/5 + 4/4)
- Task 1.2: Scrap store with persistence (tests: 5/5)
- Task 2.1: useScrapGeneration hook with tick timer
- Task 2.2: Offline accumulation (integrated into hook)
- Task 3.1: ScrapCounter component
- Task 3.2: Integration with ClickerScreen (already completed)

### Future Enhancements (Documented, not implemented)

- P1: Visual particle effects on tick
- P1: "Welcome back" modal with offline earnings
- P2: Boost mechanics (2x multiplier)
- P2: Resource spending system (shop/upgrades)
