# PetSoft Tycoon: Development Runbook

## Overview

This runbook provides a comprehensive, executable guide for developing PetSoft Tycoon - a software company idle game built with React Native and Expo SDK 53+. The project follows vertical slicing architecture and modern React Native best practices.

## Project Goals

### Primary Objectives
1. **Performance First**: Maintain 60 FPS throughout all interactions
2. **Platform Coverage**: iOS, Android, and Web via single codebase
3. **Modern Architecture**: Vertical slicing with TypeScript strict mode
4. **Scalable Foundation**: Support for complex game mechanics and large numbers

### Key Success Metrics
- **Frame Rate**: Sustained 60 FPS during all animations
- **Response Time**: <50ms for all user interactions  
- **Load Time**: <3 seconds on 4G connection
- **Memory Usage**: <100MB peak memory on device
- **Battery Impact**: <5% drain per hour of active play

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React Native + Expo | SDK 53+ | Cross-platform mobile/web |
| **Language** | TypeScript | 5.8+ | Type safety and performance |
| **State Management** | Zustand + TanStack Query | v5+ | Client + server state |
| **Navigation** | Expo Router | Latest | File-based routing |
| **Animation** | React Native Reanimated | 3.0+ | 60 FPS animations |
| **Audio** | Expo AV | Latest | Sound effects and music |
| **Storage** | Expo SecureStore | Latest | Save data persistence |
| **Testing** | Jest + RN Testing Library | Latest | Unit and integration tests |

## Phase Overview

### Phase 0: Analysis & Planning
**Duration**: 1-2 days  
**Output**: Architecture decisions and implementation strategy
- Requirements analysis
- Architecture review  
- Risk assessment
- Resource planning

### Phase 1: Foundation Setup
**Duration**: 3-5 days  
**Output**: Working development environment with core systems
- Project initialization with Expo SDK 53
- TypeScript configuration
- Core game loop implementation
- Basic state management with Zustand
- Save/load system foundation

### Phase 2: Core Game Features  
**Duration**: 1-2 weeks
**Output**: Playable game with basic mechanics
- Click mechanics and manual earning
- Development department with 4 unit types
- Automated production system
- BigNumber implementation for large values
- Basic UI and interactions

### Phase 3: Department Integration
**Duration**: 1-2 weeks  
**Output**: Complete department system
- All 7 departments implemented
- Employee hiring and management
- Department synergies and bonuses
- Prestige system foundation
- Achievement system

### Phase 4: Polish & Optimization
**Duration**: 1 week
**Output**: Production-ready game experience  
- Animation polish with React Native Reanimated
- Audio integration and sound effects
- Performance optimization and monitoring
- Visual polish and UI refinements
- Cross-platform testing and fixes

### Phase 5: Deployment & Launch
**Duration**: 3-5 days
**Output**: Published application
- Build optimization and asset bundling
- App store submission preparation
- Production deployment
- Monitoring and analytics setup
- Launch execution

## Architecture Principles

### Vertical Slicing Pattern
```
src/features/[feature-name]/
├── index.ts              # Barrel export
├── [Feature]Screen.tsx   # Main component  
├── use[Feature].ts       # Custom hook with TanStack Query
├── [feature].types.ts    # Feature-specific types
├── [feature]Api.ts       # API calls/business logic
├── components/           # Feature-specific components
└── __tests__/           # Feature tests
```

### Critical Rules
- **NEVER** use `npm install --legacy-peer-deps`
- **ALWAYS** use `npx expo install` for React Native packages
- **NEVER** use `any` type in TypeScript
- **ALWAYS** follow vertical slicing over horizontal layers
- **NEVER** ignore performance monitoring

## Quick Start Commands

```bash
# Navigate to project directory
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler/PetSoftTycoon

# Install dependencies (if not already done)
npx expo install

# Start development server
npx expo start

# Run tests
npm test

# Build for production
npx expo build
```

## Phase Execution Order

1. **[00-analysis.md](./00-analysis.md)** - Requirements analysis and architecture review
2. **[01-foundation.md](./01-foundation.md)** - Project setup with Expo SDK 53, React Native, Zustand  
3. **[02-core-features.md](./02-core-features.md)** - Core game loop, click mechanics, resource system
4. **[03-integration.md](./03-integration.md)** - Department systems, employee management
5. **[04-quality.md](./04-quality.md)** - Polish, animations, audio, performance optimization
6. **[05-deployment.md](./05-deployment.md)** - Build, test, and launch procedures

## Progress Tracking

Current progress is tracked in `progress.json`. Each phase contains:
- **Clear objectives** with specific deliverables
- **Specific tasks** with exact commands to execute
- **Validation criteria** for completion verification  
- **Time estimates** for planning purposes
- **Architecture compliance** checks

## Support Files

- **`progress.json`** - Current development progress tracking
- **`research-requirements.json`** - Outstanding research needs and dependencies

## Next Steps

Start with Phase 0 by reviewing **[00-analysis.md](./00-analysis.md)** for requirements analysis and architecture planning.