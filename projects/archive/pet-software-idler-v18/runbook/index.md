# PetSoft Tycoon Development Runbook

## Executive Summary

This runbook implements the complete development lifecycle for PetSoft Tycoon, a React Native idle game targeting cross-platform deployment with 60fps performance and vertical-slicing architecture.

### Technology Stack
- **Framework:** React Native 0.76+ (New Architecture enabled)
- **Platform:** Expo SDK 53 managed workflow
- **State:** @legendapp/state@beta for optimal performance
- **Build:** EAS Build for cross-platform deployment
- **JavaScript Engine:** Hermes (default in RN 0.76+)

### Performance Targets
- <50ms input response time
- 60fps sustained animations
- <256MB peak memory usage
- <100MB total app size
- <5% battery drain per hour

## Phase Overview

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|--------|------------------|
| [00-Analysis](./00-analysis.md) | Week 1 | Requirements & Architecture | Technical spec, team setup |
| [01-Foundation](./01-foundation.md) | Weeks 2-3 | Core setup & game loop | MVP with development department |
| [02-Core Features](./02-core-features.md) | Weeks 4-7 | Department systems | All 7 departments functional |
| [03-Integration](./03-integration.md) | Weeks 8-9 | System integration | Cross-department features |
| [04-Quality](./04-quality.md) | Weeks 10-11 | Polish & optimization | Performance targets met |
| [05-Deployment](./05-deployment.md) | Week 12 | Build & launch | Production deployment |

## Vertical Slicing Strategy

Each department follows the vertical-slicing pattern for independent development:

```
features/
├── development/          # Development department slice
│   ├── state/           # @legendapp/state observables
│   ├── components/      # UI components with FlatList optimization
│   ├── hooks/          # Business logic hooks
│   ├── handlers/       # Event handlers
│   ├── validators/     # Input validation
│   └── index.ts        # Public API
├── sales/              # Sales department slice
├── customerExperience/ # Customer Experience slice
├── product/           # Product department slice
├── design/            # Design department slice
├── qa/                # QA department slice
├── marketing/         # Marketing department slice
└── core/              # Shared game mechanics
```

## Progress Tracking

Progress is tracked in [progress.json](./progress.json) with the following structure:

```json
{
  "currentPhase": "00-analysis",
  "completedTasks": [],
  "blockedTasks": [],
  "metrics": {
    "performance": {},
    "coverage": {},
    "features": {}
  },
  "lastUpdated": "2025-08-14T00:00:00Z"
}
```

## Research Dependencies

Key research patterns from [research-requirements.json](./research-requirements.json):

- **vertical-slicing**: Feature-owned complete stacks
- **new-architecture**: RN 0.76+ JSI, Fabric, TurboModules
- **@legendapp/state@beta**: 40% performance improvement
- **FlatList optimization**: Efficient list rendering
- **hierarchical-loading**: Token-efficient documentation

## Quality Gates

Each phase includes specific quality gates:

- **Code Quality**: ESLint/Prettier compliance, TypeScript strict mode
- **Performance**: <50ms response time, 60fps animations
- **Testing**: >90% unit test coverage, integration tests pass
- **Cross-platform**: iOS, Android, Web compatibility verified

## Getting Started

```bash
# Navigate to project
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler

# Follow phase sequence
./runbook/00-analysis.md      # Start here
./runbook/01-foundation.md    # Core setup
./runbook/02-core-features.md # Feature development
./runbook/03-integration.md   # System integration
./runbook/04-quality.md       # Polish phase
./runbook/05-deployment.md    # Launch preparation
```

## Team Requirements

**Essential Skills** (from research):
- Domain expertise in game development
- React Native/Expo experience
- Code smell identification and refactoring
- Vertical slicing methodology
- Cross-functional collaboration
- Agile development practices

**Tools Access**:
- EAS CLI for builds
- Expo development environment
- Git version control
- Testing frameworks (Jest, Cypress)
- Performance monitoring tools

## Emergency Procedures

**Build Failures**:
1. Check EAS build logs
2. Verify dependency versions
3. Test on fresh Expo development client

**Performance Issues**:
1. Use React Native Performance Monitor
2. Profile with Flipper
3. Analyze bundle size with Metro

**State Management Issues**:
1. Verify @legendapp/state observables
2. Check for cross-feature imports
3. Validate public API boundaries

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-14  
**Architecture Pattern:** Vertical Slicing  
**Research Reference:** [/research/quick-ref.md](../../research/quick-ref.md)