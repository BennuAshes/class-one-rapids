# System Architecture Overview

## Architecture Principles

### Research-Driven Design
Based on comprehensive research synthesis from PRP:
- **State Management**: Immutable updates with efficient reactivity (Legend State patterns)
- **Vertical Slicing**: Feature-complete modules enabling parallel development
- **Performance-First**: 60 FPS stability with efficient calculation patterns
- **TypeScript**: Type safety preventing calculation errors critical in idle games

### Modular Architecture
```
src/
├── core/                    # Core game systems
│   ├── gameLoop.ts         # RequestAnimationFrame game loop
│   ├── stateManager.ts     # Immutable state with subscriptions
│   ├── eventSystem.ts      # Decoupled event communication
│   └── performanceMonitor.ts # FPS and memory tracking
├── features/               # Vertical slice features
│   ├── clicking/           # Epic 1: Core gameplay
│   ├── departments/        # Epic 2: Department systems
│   ├── progression/        # Epic 3: Prestige and achievements
│   ├── audioVisual/       # Epic 4: Polish systems
│   └── persistence/       # Epic 5: Save/load system
├── shared/                # Shared utilities
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript interfaces
│   └── constants/         # Game balance constants
└── ui/                    # UI component library
    ├── components/        # Reusable UI components
    ├── layouts/           # Responsive layout system
    └── animations/        # Animation utilities
```

## Core System Integration

### Game Loop Architecture
```typescript
interface GameLoop {
  // Fixed timestep for consistent simulation
  fixedTimeStep: number; // 16.67ms for 60 FPS
  
  // System updates in dependency order
  update(deltaTime: number): void {
    this.inputSystem.update(deltaTime);
    this.departmentSystem.update(deltaTime);
    this.achievementSystem.update(deltaTime);
    this.audioVisualSystem.update(deltaTime);
    this.persistenceSystem.update(deltaTime);
  }
  
  // Render all visual systems
  render(): void {
    this.uiSystem.render();
    this.particleSystem.render();
    this.animationSystem.render();
  }
}
```

### State Management Architecture
```typescript
interface RootGameState {
  // Core resources (Epic 1)
  resources: {
    linesOfCode: number;
    features: number;
    money: number;
  };
  
  // Department systems (Epic 2)
  departments: {
    [departmentId: string]: DepartmentState;
  };
  
  // Progression systems (Epic 3)
  progression: {
    investorPoints: number;
    achievements: Achievement[];
    statistics: GameStatistics;
  };
  
  // Meta game state (Epic 5)
  meta: {
    version: number;
    lastSave: number;
    totalPlayTime: number;
    settings: GameSettings;
  };
}
```

### Department System Architecture
```typescript
interface DepartmentSystem {
  departments: Map<string, Department>;
  
  // Calculation pipeline
  calculateProduction(): ProductionResult {
    const baseProduction = this.calculateBaseProduction();
    const bonuses = this.calculateDepartmentBonuses();
    const synergies = this.calculateSynergies();
    
    return {
      total: baseProduction * bonuses * synergies,
      breakdown: this.getProductionBreakdown()
    };
  }
  
  // Synergy calculation (Story 2.8)
  calculateSynergies(): number {
    // Cross-department efficiency bonuses
    // Example: Sales + Development synergy
    // Example: QA + Development quality bonus
  }
}
```

## Performance Architecture

### Calculation Optimization
Based on state management and performance research:

```typescript
interface PerformanceOptimizations {
  // Efficient large number handling
  numberSystem: 'BigNumber' | 'Scientific'; // For extreme idle game values
  
  // Batched updates
  updateBatching: {
    resourceUpdates: ResourceUpdate[];
    batchSize: number;
    flushInterval: number;
  };
  
  // Calculation caching
  calculationCache: {
    departmentProduction: Map<string, CachedResult>;
    invalidationStrategy: 'time' | 'dependency';
  };
}
```

### Visual Performance
```typescript
interface VisualPerformance {
  // Animation optimization
  animationPool: ObjectPool<Animation>;
  particlePool: ObjectPool<Particle>;
  
  // Adaptive quality
  qualitySettings: {
    particleDensity: number;
    animationComplexity: number;
    renderDistance: number;
  };
  
  // Performance monitoring
  performanceMetrics: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
    drawCalls: number;
  };
}
```

## Data Flow Architecture

### Resource Flow
```
User Input → State Update → Calculation → UI Update → Visual Feedback
    ↓           ↓              ↓            ↓             ↓
  Click      Resource      Department    Display      Animation
  Purchase   Validation    Production    Update       Effects
  Upgrade    State Change  Calculation   Reactive     Particles
```

### Department Integration Flow
```
Development → Features → Sales → Revenue → All Departments
     ↓           ↓         ↓        ↓           ↓
   Code       Products   Leads    Money    Expansion
   Lines      Created    Generated Earned   Unlocks
```

### Achievement Integration Flow
```
All Game Actions → Achievement Tracker → Progress Calculation → Rewards
       ↓                   ↓                    ↓              ↓
   Purchases           Milestone          Completion       Bonuses
   Production          Detection          Validation       Applied
   Upgrades            Progress Update    Notification     Unlocks
```

## Scalability Considerations

### Performance Scaling
- Department calculations: O(n) where n = number of departments
- Unit calculations: O(n) where n = total units across all departments
- Achievement checking: O(1) with efficient milestone tracking
- Save operations: O(1) with compression and incremental saves

### Memory Management
- Object pooling for animations and particles
- Lazy loading for department assets
- Garbage collection optimization
- Memory leak prevention in event systems

### Feature Extensibility
- Plugin architecture for new departments
- Event-driven system for cross-feature communication
- Configurable balance constants for rapid iteration
- Modular UI components for interface extension

## Technology Integration

### Browser API Usage
```typescript
interface BrowserAPIs {
  // Core technologies
  requestAnimationFrame: GameLoop; // Smooth 60 FPS
  localStorage: SaveSystem; // State persistence
  webAudio: AudioSystem; // Low-latency sound
  canvas: ParticleSystem; // High-performance visuals
  
  // Progressive enhancement
  webWorkers?: ComplexCalculations; // Future optimization
  indexedDB?: LargeSaveFiles; // Future save expansion
  webGL?: AdvancedVisuals; // Future visual enhancement
}
```

### TypeScript Integration
```typescript
// Type-safe game state
interface TypeSafetyBenefits {
  calculationAccuracy: 'Compile-time math validation';
  refactoringSafety: 'Automated dependency tracking';
  developerExperience: 'Enhanced IDE support';
  bugPrevention: 'Early error detection';
}
```

This architecture provides a solid foundation for implementing all 23 user stories while maintaining performance, extensibility, and code quality throughout the development process.