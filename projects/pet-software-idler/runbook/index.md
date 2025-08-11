# PetSoft Tycoon: Development Runbook
## Mobile-First React Native Implementation | v1.0

---

## Quick Navigation

| Phase | Document | Time Estimate | Status |
|-------|----------|---------------|--------|
| **Analysis** | [00-analysis.md](./00-analysis.md) | 1-2 days | Not Started |
| **Foundation** | [01-foundation.md](./01-foundation.md) | 2-3 days | Not Started |
| **Core Features** | [02-core-features.md](./02-core-features.md) | 5-7 days | Not Started |
| **Integration** | [03-integration.md](./03-integration.md) | 3-4 days | Not Started |
| **Quality** | [04-quality.md](./04-quality.md) | 2-3 days | Not Started |
| **Deployment** | [05-deployment.md](./05-deployment.md) | 1-2 days | Not Started |

**Total Estimated Time: 14-21 days**

---

## Executive Summary

This runbook provides a comprehensive, executable development plan for implementing PetSoft Tycoon as a mobile-first React Native application. The implementation reconciles the original web-based PRD with modern mobile architecture patterns while maintaining the core 60 FPS performance requirement.

### Key Architectural Decisions
- **Platform**: React Native + Expo Router (file-based routing)
- **State Management**: Legend State v3 with fine-grained reactivity
- **Architecture Pattern**: Hybrid routing with vertical slicing
- **Persistence**: MMKV with synchronous operations
- **Performance Target**: 60 FPS on mid-tier devices

### Technology Stack
```typescript
const TECH_STACK = {
  framework: 'React Native 0.79.x',
  platform: 'Expo ~53.0.0',
  routing: 'Expo Router ^4.0.0',
  language: 'TypeScript ^5.8.0',
  state: 'Legend State v3',
  persistence: 'MMKV ^3.0.2',
  animation: 'React Native Reanimated 3',
  audio: 'Expo AV'
} as const;
```

---

## Development Philosophy

### Performance-First Approach
Following the original PRD's performance philosophy, adapted for mobile:
- **60 FPS maintained** on Snapdragon 660 / A10 Bionic equivalent devices
- **Fine-grained reactivity** to minimize unnecessary re-renders
- **Synchronous persistence** for instant save/load operations
- **Native animations** for smooth visual feedback

### Hybrid Architecture Benefits
- **Expo Router compliance** for type-safe navigation and deep linking
- **Vertical slicing preservation** for feature co-location and maintainability
- **Clear separation** between routing configuration and business logic
- **Future-proof** architecture supporting platform expansion

---

## Phase Overview

### Phase 0: Analysis & Planning (1-2 days)
- **Objective**: Understand requirements and validate architecture decisions
- **Deliverables**: Technical analysis, risk assessment, detailed task breakdown
- **Validation**: Architecture compliance confirmed, performance baselines established

### Phase 1: Foundation (2-3 days)
- **Objective**: Set up project foundation with core architecture patterns
- **Deliverables**: Expo project, Legend State integration, routing structure
- **Validation**: 60 FPS baseline achieved, build system functional

### Phase 2: Core Features (5-7 days)
- **Objective**: Implement core game loop and basic gameplay mechanics
- **Deliverables**: Game state system, basic UI, manual clicking mechanics
- **Validation**: Core gameplay loop functional, performance targets met

### Phase 3: Integration (3-4 days)
- **Objective**: Implement department systems and idle mechanics
- **Deliverables**: All 7 departments, employee hiring, upgrades system
- **Validation**: Full idle game mechanics working, progression system functional

### Phase 4: Quality & Polish (2-3 days)
- **Objective**: Performance optimization, animations, and user experience
- **Deliverables**: Smooth animations, audio system, visual effects
- **Validation**: Full performance benchmarks passed, user experience polished

### Phase 5: Deployment (1-2 days)
- **Objective**: Build optimization and deployment preparation
- **Deliverables**: Production builds, deployment configurations
- **Validation**: Apps successfully built and tested on devices

---

## Success Metrics

### Technical Metrics
```typescript
const SUCCESS_CRITERIA = {
  performance: {
    fps: 60, // Maintained on target devices
    memoryUsage: 75 * 1024 * 1024, // <75MB
    coldStartTime: 3000, // <3 seconds
    responseTime: 50 // <50ms for interactions
  },
  
  quality: {
    testCoverage: 80, // Minimum test coverage percentage
    buildSuccess: true, // iOS and Android builds successful
    noRegressions: true, // No performance regressions from baseline
    accessibilityCompliant: true // Basic accessibility requirements met
  },
  
  architecture: {
    routingCompliance: true, // Hybrid routing pattern followed
    verticalSlicing: true, // Features properly co-located
    performanceOptimized: true, // Legend State best practices applied
    crossPlatform: true // Consistent behavior iOS/Android
  }
} as const;
```

### Business Metrics
- **Core gameplay loop** functional and engaging
- **7 departments** fully implemented with progression
- **Offline progress** calculation working correctly
- **Save/load system** reliable with corruption recovery

---

## Prerequisites & Setup

### Development Environment
```bash
# Required software versions
node >= 18.0.0
npm >= 8.0.0
expo-cli >= 6.0.0

# Platform-specific requirements
# iOS: Xcode 14+, iOS Simulator
# Android: Android Studio, SDK 33+
```

### Team Knowledge Requirements
- **React Native**: Intermediate level with hooks and performance optimization
- **TypeScript**: Basic to intermediate, comfortable with interface definitions
- **Legend State**: Beginner (training provided in runbook)
- **Expo Router**: Beginner (examples provided)
- **Mobile Performance**: Basic understanding of memory management and FPS optimization

---

## Risk Mitigation Strategy

### High-Risk Areas
1. **Performance Regression**: Continuous monitoring and benchmarking
2. **Architecture Complexity**: Comprehensive documentation and examples
3. **Cross-Platform Issues**: Platform-specific testing matrix
4. **Team Knowledge Gaps**: Structured learning plan and pair programming

### Mitigation Approaches
- **Incremental Development**: Each phase has validation gates
- **Continuous Testing**: Performance and functional tests at every stage
- **Documentation-Driven**: Clear examples for all architectural patterns
- **Regular Reviews**: Code reviews focused on architectural compliance

---

## Getting Started

### Quick Start Commands
```bash
# Navigate to project directory
cd /path/to/pet-software-idler

# Follow the runbook phases in order
cat runbook/00-analysis.md     # Start here
cat runbook/01-foundation.md   # Then setup
# ... continue through each phase
```

### Progress Tracking
- **Status Updates**: Update `progress.json` after completing each major task
- **Time Tracking**: Record actual vs estimated time for future planning
- **Issue Logging**: Document any deviations from planned architecture
- **Performance Metrics**: Record benchmark results at each validation point

---

## Support & Resources

### Technical References
- [Technical Requirements Document](../petsoft-tycoon-advanced-prd-technical-requirements.md)
- [Architecture Synthesis Document](../architecture-synthesis.md)
- [Legend State v3 Documentation](https://legendapp.com/open-source/state/)
- [Expo Router Documentation](https://expo.github.io/router/)

### Team Communication
- **Daily Standup Topics**: Progress against runbook phases, blockers, architectural questions
- **Weekly Reviews**: Performance metrics, architecture compliance, risk assessment
- **Ad-hoc Support**: Pair programming sessions for complex architectural implementations

---

**Next Step**: Begin with [Phase 0: Analysis & Planning](./00-analysis.md)