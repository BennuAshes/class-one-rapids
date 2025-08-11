# PetSoft Tycoon Development Runbook

## Project Overview

**PetSoft Tycoon** is a React Native mobile game implementing an incremental/idle business tycoon where players build a software company from startup to IPO. The game features department management, employee hiring, resource production chains, and prestige mechanics.

## Architecture & Technology Stack

- **React Native:** 0.76.9+ with New Architecture
- **Expo SDK:** ~52.0.0 with managed workflow
- **State Management:** Legend State 3.0.0-beta (Observable pattern)
- **Navigation:** Expo Router ~4.0.0 (File-based routing)
- **Architecture Pattern:** Vertical Slicing (feature-specific stores)

## Critical Architecture Requirements

**✅ MANDATORY: Use Vertical Slicing Pattern**
```
features/{name}/state/store.ts  // NOT centralized gameStore.ts
app/                           // NOT src/ directory  
```

## Development Phases

### Phase 0: Foundation Setup (Week 1)
**Status:** Not Started  
**Estimated Time:** 5 days  
**Focus:** Project initialization and architecture setup

- Set up Expo SDK 52 project with React Native 0.76+
- Configure Legend State for vertical slicing
- Implement Expo Router file-based navigation
- Set up development toolchain (ESLint, TypeScript, Jest)

### Phase 1: Core Game Loop (Week 2)
**Status:** Not Started  
**Estimated Time:** 7 days  
**Focus:** Basic clicking mechanics and resource system

- Implement player state management
- Create click-to-earn mechanics
- Build fundamental UI components
- Establish game loop with 60 FPS performance

### Phase 2: Department System (Week 3-4) 
**Status:** Not Started  
**Estimated Time:** 10 days  
**Focus:** Multi-department resource production

- Development department (Code production)
- Sales department (Lead generation → Revenue)
- Marketing department (Brand building)
- Department unlock thresholds and progression

### Phase 3: Advanced Features (Week 5-6)
**Status:** Not Started  
**Estimated Time:** 10 days  
**Focus:** Employee management and automation

- Employee hiring system (Junior → Lead)
- Department upgrades and automation
- Milestone achievements
- Production optimization

### Phase 4: Progression Systems (Week 7)
**Status:** Not Started  
**Estimated Time:** 7 days  
**Focus:** Prestige and long-term progression

- Investor Points prestige system
- Achievement system (50+ achievements)
- Offline progression calculation
- Advanced department unlocks

### Phase 5: Polish & Launch (Week 8)
**Status:** Not Started  
**Estimated Time:** 7 days  
**Focus:** Performance, audio, and deployment

- Audio system with contextual feedback
- Animation polish and particle effects
- Performance optimization and testing
- Platform builds and deployment

## Key Performance Targets

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| **Frame Rate** | 60 FPS consistent | Performance monitoring |
| **Input Response** | <50ms | Input lag testing |
| **Load Time** | <3s cold start | App startup measurement |
| **Memory Usage** | <200MB runtime | Memory profiling |
| **Bundle Size** | <50MB iOS, <30MB Android | Build size analysis |

## Quality Gates

Each phase must pass these validation criteria before proceeding:

1. **Architecture Compliance:** Vertical slicing pattern enforced
2. **Performance Targets:** All metrics within acceptable ranges  
3. **Test Coverage:** >80% unit test coverage for business logic
4. **Code Quality:** ESLint passing, TypeScript strict mode
5. **Platform Testing:** iOS, Android, and Web compatibility verified

## Development Workflow

1. **Start Phase:** Review phase objectives and create task breakdown
2. **Implementation:** Follow architecture guidelines and performance targets
3. **Validation:** Run automated tests and performance benchmarks
4. **Review:** Ensure compliance with PRD requirements
5. **Progress Update:** Update progress.json and move to next phase

## File Structure Overview

```
app/                        # Expo Router navigation
├── (tabs)/                 # Tab-based navigation
├── _layout.tsx            # Root layout with providers
└── +not-found.tsx         # 404 handling

features/                   # Vertical slicing architecture
├── departments/state/      # Department-specific store
├── player/state/          # Player-specific store  
├── progression/state/     # Progression-specific store
├── audio/                 # Audio system
└── save-system/          # Save/load functionality

shared/                    # Truly shared utilities
├── components/           # Reusable UI components
├── utils/               # Helper functions
└── types/              # Shared TypeScript types
```

## Next Steps

1. **Begin Phase 0:** Review [01-foundation.md](./01-foundation.md)
2. **Setup Development Environment:** Install dependencies and toolchain
3. **Initialize Architecture:** Create vertical slicing structure
4. **Validate Setup:** Ensure all quality gates pass

---

**Important:** This runbook enforces VERTICAL SLICING architecture. Do NOT create centralized stores like `gameStore.ts`. Each feature must have its own isolated state management.