# Runbook Analysis: PetSoft Tycoon MVP

## Extracted Requirements

### Business Objectives
- Create an idle clicker game focused on building a pet software company
- Achieve D1 retention >40%, D7 >20%, D30 >10%
- Average session length 8+ minutes, 5+ sessions per day
- 90% tutorial completion, 60% first prestige completion

### Technical Architecture Decision Required
**⚠️ Platform Mismatch Alert:**
- PRD specifies: Web-based HTML5/JavaScript with vanilla JS
- Framework context suggests: React Native/Expo mobile development
- **Decision needed before implementation**

### Feature Priorities
1. **Core Game Loop** - Click to write code, convert to features, earn money
2. **Department System** - 7 departments with synergies and automation
3. **Prestige System** - Reset progress for permanent bonuses
4. **Polish & Feedback** - Visual/audio feedback, save system, offline progression

### Key Constraints
- 4-week development timeline (3 weeks dev + 1 week polish)
- 60 FPS performance on 5-year-old devices
- <3MB initial download, <50MB memory usage
- No backend infrastructure for MVP

## Phase Overview

### Phase 1: Foundation (15 tasks)
- Development environment setup
- Project structure creation
- Core state management with Legend State
- Basic UI layout and routing
- Testing infrastructure

### Phase 2: Core Features (25 tasks)
- Write Code button implementation
- Resource system (Lines of Code, Features, Money)
- Basic department structure
- Employee hiring mechanics
- Production rate calculations

### Phase 3: Integration (20 tasks)
- Department synergy system
- Multiplier calculations
- Achievement framework
- Save/load functionality
- Offline progression engine

### Phase 4: Quality (15 tasks)
- Unit test coverage (70% target)
- Integration testing suite
- Performance optimization
- Cross-browser compatibility
- Accessibility implementation

### Phase 5: Deployment (10 tasks)
- Build configuration
- Bundle optimization
- Performance monitoring
- Production deployment
- Launch checklist

## Resource Requirements

### Skills Needed
- React/React Native development
- Legend State v3 expertise
- Game loop programming
- Performance optimization
- Testing (React Testing Library, Jest)

### Core Libraries
- **State:** @legendapp/state@beta (v3.0.0-beta.31+)
- **Framework:** React 18+ or React Native 0.76+
- **Testing:** React Testing Library, Jest, Maestro (E2E)
- **Build:** Vite or Expo SDK 52+
- **Math:** Big.js or Decimal.js for precision

### External Dependencies
- Audio assets (20+ sound effects)
- Visual assets (sprites, backgrounds, particles)
- Font assets for consistent typography

## Architecture Patterns (Mandatory)

### Feature-Based Structure
```
src/
├── features/
│   ├── codeProduction/
│   ├── departments/
│   ├── prestige/
│   └── achievements/
├── shared/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── app/
    ├── store/
    └── navigation/
```

### State Management Pattern
- Modular observables per feature
- Computed observables for derived values
- Batch updates for 60 FPS performance
- Legend State sync for persistence

## Risk Mitigation

### High Priority Risks
1. **Technology Stack Decision** - Must be resolved before Phase 1
2. **Performance Under Load** - Early benchmarking required
3. **Offline Progression Accuracy** - Needs comprehensive testing
4. **Save Data Integrity** - Multiple backup strategies needed

### Mitigation Strategies
- Immediate architecture decision required
- Performance budgets from Phase 1
- Automated testing throughout
- Incremental feature delivery

## Success Criteria

### Technical Metrics
- 60 FPS during normal gameplay
- <50ms UI response time
- <100ms save/load operations
- <3MB initial bundle size

### Quality Metrics
- 90% code coverage
- Zero critical bugs
- WCAG 2.1 AA compliance
- Cross-browser compatibility

## Next Steps
1. **Resolve architecture decision** (Web vs React Native)
2. Begin Phase 1: Foundation setup
3. Establish CI/CD pipeline early
4. Create performance monitoring baseline