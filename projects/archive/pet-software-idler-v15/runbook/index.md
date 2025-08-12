# PetSoft Tycoon Development Runbook

*Implementation Guide for Advanced Mobile Idle Game*

## Project Overview

**PetSoft Tycoon** is a premium mobile idle game built with React Native 0.76+ and Expo SDK 52, utilizing Legend State v3 for reactive state management. The game simulates building a software company focused on pet-related applications, featuring department management, employee progression, and prestige mechanics.

### Key Technical Constraints
- **Performance**: 60 FPS minimum, <50ms input response
- **Memory**: <200MB RAM consumption on target devices  
- **Storage**: <100MB total app size after installation
- **Load Time**: <3 seconds from launch to gameplay
- **Battery**: <5% drain per 30-minute session
- **Offline**: 12-hour progression cap with instant catchup

### Target Platforms
- iOS 12+ (iPhone and iPad)
- Android 8+ (API 26+)
- Web (Progressive Web App)

## Development Phases

### Phase 0: Analysis & Planning (8 hours)
**Timeline**: Days 1-2  
**Deliverables**: Requirements validation, architecture decisions, risk assessment  
**Success Criteria**: All technical requirements validated, architecture approved

### Phase 1: Foundation Setup (16 hours)
**Timeline**: Days 3-5  
**Deliverables**: Project scaffolding, core dependencies, development environment  
**Success Criteria**: App runs on all target platforms, hot reload functional

### Phase 2: Core Features (40 hours)
**Timeline**: Days 6-15  
**Deliverables**: Game loop, state management, basic UI, save system  
**Success Criteria**: Core idle game mechanics functional, performance targets met

### Phase 3: Integration & Features (32 hours)
**Timeline**: Days 16-23  
**Deliverables**: Department systems, employee management, achievement system  
**Success Criteria**: All 7 departments implemented, progression system working

### Phase 4: Quality & Polish (24 hours)
**Timeline**: Days 24-27  
**Deliverables**: Animations, audio, performance optimization, testing  
**Success Criteria**: 60 FPS maintained, comprehensive test coverage

### Phase 5: Deployment (16 hours)
**Timeline**: Days 28-30  
**Deliverables**: Production builds, app store preparation, launch materials  
**Success Criteria**: Successfully deployed to app stores, monitoring in place

## Total Effort Estimate
**136 hours** (approximately 17 days at 8 hours/day)

## Team Requirements
- **Senior React Native Engineer** (primary developer)
- **DevOps/CI Engineer** (build pipeline setup)
- **QA Engineer** (testing and validation)
- **UI/UX Designer** (asset creation and polish)

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | 60 FPS | React DevTools Profiler |
| Memory Usage | <200MB | Device monitoring |
| Load Time | <3s | App launch metrics |
| Bundle Size | <50MB | EAS build analyzer |
| Test Coverage | >80% | Jest coverage reports |
| Crash Rate | <0.1% | Production monitoring |

## Development Environment Requirements
- **Node.js**: 18+ LTS
- **npm**: 9+ (NO --legacy-peer-deps usage)
- **Expo CLI**: @expo/eas-cli@latest
- **Xcode**: 15+ (iOS development)
- **Android Studio**: Latest (Android development)
- **VSCode**: Recommended with React Native extensions

## Quality Gates
Each phase must pass quality gates before proceeding:
1. **Code Review**: All code peer-reviewed
2. **Performance**: Performance targets validated
3. **Testing**: Automated tests passing, manual testing complete
4. **Documentation**: Implementation documented
5. **Stakeholder Approval**: Product owner sign-off

## Risk Mitigation
- **Performance Risk**: Daily performance monitoring, optimization at each phase
- **Dependency Risk**: Use Expo-compatible packages only, avoid --legacy-peer-deps
- **Platform Risk**: Test on physical devices regularly, not just simulators
- **Timeline Risk**: 20% buffer built into estimates, daily standups for tracking

## Next Steps
1. Review technical requirements document
2. Begin Phase 0: Analysis & Planning
3. Set up development environment
4. Establish CI/CD pipeline
5. Create project repository structure

---

## Quick Navigation
- [Phase 0: Analysis](./00-analysis.md) - Requirements validation and planning
- [Phase 1: Foundation](./01-foundation.md) - Project setup and scaffolding
- [Phase 2: Core Features](./02-core-features.md) - Game mechanics implementation  
- [Phase 3: Integration](./03-integration.md) - Department systems and features
- [Phase 4: Quality](./04-quality.md) - Polish and performance optimization
- [Phase 5: Deployment](./05-deployment.md) - Production builds and launch

## Progress Tracking
See [progress.json](./progress.json) for current development status and completed milestones.

## Research References
See [research-requirements.json](./research-requirements.json) for technical research needs and implementation patterns.