# PetSoft Tycoon Development Runbook

## Overview

This runbook provides a comprehensive, phase-based implementation guide for PetSoft Tycoon, a mobile idle clicker game built with React Native 0.76+ and vertical slicing architecture patterns. Each phase delivers working, testable features with clear validation criteria.

### Architecture Philosophy

- **Vertical Slicing**: Each feature owns its complete stack from UI to persistence
- **Per-Feature State**: Individual observable stores using @legendapp/state@beta
- **Modern React Native**: 0.76+ with new architecture (JSI, Fabric, Hermes)
- **Performance First**: Optimized for 30+ FPS on Android 5.0+ devices

### Technology Stack

- **React Native**: 0.76+ (new architecture enabled)
- **Expo**: SDK 53 with managed workflow
- **State Management**: @legendapp/state@beta with observable patterns
- **Build System**: EAS Build for production deployments
- **Testing**: Jest for unit tests, future Cypress for E2E

## Runbook Navigation

### Development Phases

| Phase | Document | Focus | Duration | Dependencies |
|-------|----------|-------|----------|--------------|
| **Analysis** | [00-analysis.md](./00-analysis.md) | Requirements analysis and technical planning | 1 week | PRD review |
| **Foundation** | [01-foundation.md](./01-foundation.md) | Project setup, dependencies, basic structure | 2-3 weeks | None |
| **Core Features** | [02-core-features.md](./02-core-features.md) | Core game loop (clicking, basic state) | 2-3 weeks | Foundation |
| **Integration** | [03-integration.md](./03-integration.md) | Department systems and feature integration | 4-5 weeks | Core Features |
| **Quality** | [04-quality.md](./04-quality.md) | Polish, performance optimization, testing | 2-3 weeks | Integration |
| **Deployment** | [05-deployment.md](./05-deployment.md) | Build, release, and monitoring setup | 1-2 weeks | Quality |

### Support Documents

| Document | Purpose | Usage |
|----------|---------|--------|
| [progress.json](./progress.json) | Task completion tracking | Update after each task completion |
| [research-requirements.json](./research-requirements.json) | Research validation requirements | Reference during implementation |

## Quick Start

For immediate development start, follow this sequence:

1. **Read Analysis**: Review [00-analysis.md](./00-analysis.md) for technical understanding
2. **Setup Foundation**: Execute commands in [01-foundation.md](./01-foundation.md)
3. **Implement Core**: Build basic clicking mechanics from [02-core-features.md](./02-core-features.md)
4. **Add Departments**: Integrate features following [03-integration.md](./03-integration.md)
5. **Polish & Test**: Apply optimizations from [04-quality.md](./04-quality.md)
6. **Deploy**: Prepare release using [05-deployment.md](./05-deployment.md)

## Key Implementation Requirements

### Vertical Slicing Structure
```
src/features/
├── development/     # Code generation & developer management
├── sales/          # Lead generation & revenue conversion
├── customer-exp/   # Support tickets & retention systems
├── product/        # Feature enhancement & roadmap
├── design/         # Polish & user experience systems
├── qa/            # Bug detection & prevention
├── marketing/     # Brand building & lead multiplication
└── core/          # Cross-cutting concerns (player, prestige)
```

### Critical Anti-Patterns to Avoid
- ❌ Centralized global state (src/store/gameStore.ts)
- ❌ Horizontal component layers (src/components/shared/)
- ❌ EventBus patterns for feature coordination
- ❌ Cross-feature direct imports

### Success Metrics
- **Performance**: 30+ FPS on Android 5.0+ devices
- **Memory**: <200MB RAM usage
- **Load Time**: <3 seconds app launch
- **Architecture**: Independent feature development
- **Retention**: 40% 7-day, 15% 30-day retention

## Development Standards

### Code Organization
- Features use complete vertical slices
- Shared utilities have no business logic
- State management is per-feature only
- Components are pure UI or feature-specific

### Quality Gates
- All features include comprehensive tests
- Performance benchmarks must be met
- Code reviews required for all changes
- Deployment must pass all automated checks

### Timeline Overview
- **Weeks 1-4**: Foundation & Development department
- **Weeks 5-8**: Sales & Customer Experience departments  
- **Weeks 9-12**: Product, Design, QA & Marketing departments
- **Weeks 13-16**: Prestige system & production polish

## Getting Help

- **Technical Issues**: Reference specific phase documentation
- **Architecture Questions**: Review vertical slicing patterns in analysis
- **Performance Problems**: Check optimization guidelines in quality phase
- **Deployment Issues**: Follow deployment checklist and troubleshooting

---

*This runbook is designed for senior engineers with React Native experience. Each phase includes executable commands, code examples, and validation criteria to ensure successful implementation.*