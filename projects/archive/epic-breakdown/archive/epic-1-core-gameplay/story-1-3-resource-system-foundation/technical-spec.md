# Story 1.3: Resource System Foundation - Technical Specification

## Story Overview
**As a** player, **I want** to see my progress accumulate **so that** I understand the core progression loop.

## Acceptance Criteria
- [ ] Lines of Code counter with proper formatting (1K, 1M notation)
- [ ] Money counter appears after first feature conversion
- [ ] Smooth number animations for all changes
- [ ] Resource conversion system (10 lines = 1 feature = $15)
- [ ] Real-time calculation and display updates

## Technical Architecture

### Resource System Design
```typescript
interface ResourceSystem {
  resources: GameResources;
  converters: ResourceConverter[];
  formatters: ResourceFormatter[];
  validators: ResourceValidator[];
}

interface GameResources {
  linesOfCode: number;
  features: number;
  money: number;
  
  // Computed properties
  totalLinesWritten: number;
  totalFeaturesShipped: number;
  totalRevenue: number;
}

interface ResourceConverter {
  from: ResourceType;
  to: ResourceType;
  conversionRate: number;
  minRequired: number;
  convert(amount: number): ConversionResult;
}
```

### Number Formatting System
```typescript
interface NumberFormatter {
  format(value: number): string;
  formatWithSuffix(value: number): string;
  formatForDisplay(value: number): string;
}

// Examples:
// 1000 -> "1K"
// 1000000 -> "1M" 
// 1234567 -> "1.23M"
// 1500 -> "1.5K"
```

### Resource Update Architecture
```typescript
interface ResourceUpdate {
  type: 'add' | 'subtract' | 'set' | 'convert';
  resource: ResourceType;
  amount: number;
  source: string;
  timestamp: number;
}

interface ResourceAnimation {
  from: number;
  to: number;
  duration: number;
  easing: EasingFunction;
  onComplete?: () => void;
}
```

## API Contracts

### Resource Management Interface
```typescript
export interface IResourceManager {
  getResource(type: ResourceType): number;
  updateResource(type: ResourceType, amount: number, source: string): void;
  convertResource(from: ResourceType, to: ResourceType, amount: number): boolean;
  canAfford(cost: ResourceCost[]): boolean;
  purchaseWithCost(cost: ResourceCost[]): boolean;
}

export interface ResourceCost {
  resource: ResourceType;
  amount: number;
}

export type ResourceType = 'linesOfCode' | 'features' | 'money';
```

### Display System Integration
```typescript
export interface IResourceDisplay {
  updateDisplay(resource: ResourceType, newValue: number): void;
  animateChange(resource: ResourceType, from: number, to: number): void;
  formatForDisplay(value: number): string;
  showNewResourceUnlock(resource: ResourceType): void;
}
```

### Conversion System Interface
```typescript
export interface IConversionSystem {
  registerConverter(converter: ResourceConverter): void;
  getAvailableConversions(): ConversionOption[];
  executeConversion(conversionId: string, amount: number): ConversionResult;
  canExecuteConversion(conversionId: string, amount: number): boolean;
}
```

## Security & Compliance
- **Bounds Checking**: Prevent negative resources and overflow
- **Validation**: Ensure all resource operations are mathematically valid
- **Audit Trail**: Track all resource changes for debugging
- **State Consistency**: Maintain resource invariants across operations

## Research Context
- **State Management**: Immutable updates for predictable resource tracking
- **Performance**: Efficient large number handling for idle game scaling
- **TypeScript**: Type safety prevents calculation errors in resource math
- **Animation**: Smooth number transitions for satisfying progression feedback