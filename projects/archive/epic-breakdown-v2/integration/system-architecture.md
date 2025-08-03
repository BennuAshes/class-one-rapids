# System Architecture Overview

## Technical Architecture from PRP

### Core Technology Stack
- **Platform**: React Native + Expo SDK 52+
- **Language**: TypeScript with strict mode
- **State Management**: Legend State v3 with MMKV persistence
- **Architecture Pattern**: Vertical Slice with feature-driven development
- **Testing**: Jest + React Native Testing Library
- **Performance Target**: 60 FPS, <50MB RAM, <3MB bundle

### Vertical Slice Organization
```
/src
├── /core              # Game engine and core systems
├── /features          # Feature-based vertical slices
│   ├── /clicking      # Core clicking mechanics
│   ├── /departments   # Department management
│   ├── /progression   # Achievements and prestige
│   └── /analytics     # Game analytics
├── /shared            # Cross-cutting concerns
└── /ui               # Presentation layer
```

### State Management Architecture
- **Global Game State**: Resources, departments, progression, preferences
- **Local Component State**: UI-specific state and interactions  
- **Service State**: Business logic and external integrations
- **Persistence**: MMKV for encrypted save data with integrity validation

### Performance Optimization
- **Game Loop**: Fixed timestep targeting 60 FPS
- **Memory Management**: Object pooling for particles and animations
- **Calculation Optimization**: Batched updates and cached computations
- **Bundle Optimization**: Code splitting and lazy loading

## Integration Patterns

### Department System Integration
All departments follow consistent patterns:
- Observable state with computed production rates
- Standardized employee hiring and upgrade systems
- Unified synergy calculation framework
- Consistent UI components and animations

### Cross-Feature Communication
- Event-driven architecture for loose coupling
- Shared service layer for business logic
- Reactive state updates through Legend State observables
- Standardized interfaces for department interactions