# PetSoft Tycoon Development Runbook

## Overview

This runbook provides a comprehensive, phase-based development guide for building PetSoft Tycoon, a premium idle game using React Native with Expo, Legend State, and modern cross-platform best practices.

**Target Performance:**
- 60 FPS sustained gameplay
- <3 second initial load time
- <200MB RAM usage during normal play
- Cross-platform deployment (iOS, Android, Web)

## Phase Structure

### [Phase 0: Analysis & Validation](./00-analysis.md)
**Duration:** 4-6 hours  
**Prerequisites:** None  
**Deliverables:** Validated requirements, environment setup verification, technical feasibility confirmed

- Requirements analysis and validation
- Development environment setup
- Technology stack verification
- Performance benchmarking baseline
- Cross-platform compatibility verification

### [Phase 1: Foundation Setup](./01-foundation.md)
**Duration:** 8-12 hours  
**Prerequisites:** Phase 0 complete  
**Deliverables:** Working Expo project, core architecture, basic navigation

- Expo project initialization with React Native 0.76+
- TypeScript configuration and project structure
- Legend State v3 integration and persistence setup
- Core routing with Expo Router
- Base component library and theming system

### [Phase 2: Core Features](./02-core-features.md)
**Duration:** 16-24 hours  
**Prerequisites:** Phase 1 complete  
**Deliverables:** Game loop, basic departments, employee system, save/load

- Game loop implementation (60 FPS target)
- Core state management architecture
- Department system foundation
- Employee hiring and management
- Save/load system with corruption protection
- Basic number formatting and display

### [Phase 3: Integration & Systems](./03-integration.md)
**Duration:** 20-30 hours  
**Prerequisites:** Phase 2 complete  
**Deliverables:** Full department integration, prestige system, achievements

- Advanced department mechanics and synergies
- Prestige system with investor points
- Achievement system with notifications
- Manager automation system
- Offline progress calculation
- Sound system integration

### [Phase 4: Quality & Performance](./04-quality.md)
**Duration:** 12-16 hours  
**Prerequisites:** Phase 3 complete  
**Deliverables:** Performance optimization, testing suite, polish

- Performance monitoring and optimization
- Memory management and leak detection
- Animation system refinement
- Comprehensive testing implementation
- UI/UX polish and accessibility
- Cross-platform testing and validation

### [Phase 5: Deployment & Launch](./05-deployment.md)
**Duration:** 8-10 hours  
**Prerequisites:** Phase 4 complete  
**Deliverables:** Production builds, deployment configuration, launch readiness

- EAS Build configuration for all platforms
- App Store and Play Store preparation
- Web deployment and PWA setup
- Analytics and crash reporting integration
- Final testing and launch procedures

## Development Workflow

### Daily Workflow
1. **Check Progress:** Review `progress.json` for current phase status
2. **Run Verification:** Execute phase-specific validation commands
3. **Development:** Follow phase-specific task guidelines
4. **Testing:** Run automated tests and performance checks
5. **Documentation:** Update progress and note any deviations

### Quality Gates
Each phase includes mandatory quality gates:
- **Performance Validation:** FPS and memory usage tests
- **Cross-Platform Testing:** iOS, Android, and Web compatibility
- **Code Quality:** TypeScript compilation, ESLint, and testing coverage
- **Feature Completeness:** All phase deliverables implemented and tested

### Emergency Procedures
- **Performance Regression:** See performance debugging guide in Phase 4
- **Build Failures:** Check platform-specific troubleshooting in Phase 5
- **Save Corruption:** Use backup recovery procedures in Phase 2
- **Memory Leaks:** Follow memory profiling guide in Phase 4

## Key Commands Reference

### Development
```bash
# Start development server
cd PetSoftTycoon && npx expo start

# Run tests
npm test

# Performance profiling
npm run profile

# Type checking
npm run type-check
```

### Building
```bash
# Development build
eas build --profile development --platform all

# Production build
eas build --profile production --platform all

# Web build
npx expo export --platform web
```

### Deployment
```bash
# Submit to app stores
eas submit --platform all

# Deploy web version
npm run deploy:web
```

## Project Structure

```
PetSoftTycoon/
├── app/                    # Expo Router (file-based routing)
├── src/
│   ├── core/              # Core game systems and services
│   ├── features/          # Feature-based vertical slicing
│   ├── components/        # Shared UI components
│   ├── hooks/             # Custom React hooks
│   └── shared/            # Utilities, constants, types
├── assets/                # Static assets (images, sounds, fonts)
├── __tests__/             # Test files
└── docs/                  # Additional documentation
```

## Success Metrics

### Technical Metrics
- **Performance:** >55 FPS sustained, <3s load time
- **Memory:** <200MB normal usage, <500MB peak
- **Bundle Size:** <50MB web, <100MB mobile
- **Test Coverage:** >70% for critical paths

### Quality Metrics
- **Cross-Platform Compatibility:** 100% feature parity
- **Save System Reliability:** <0.1% corruption rate
- **User Experience:** Smooth animations, responsive UI
- **Code Quality:** Zero TypeScript errors, comprehensive testing

## Support Resources

- **Technical Requirements:** See `petsoft-tycoon-advanced-prd-technical-requirements.md`
- **Research Requirements:** See `research-requirements.json`
- **Progress Tracking:** See `progress.json`
- **Expo Documentation:** https://docs.expo.dev/
- **Legend State Documentation:** https://legendapp.com/open-source/state/

---

**Next Step:** Begin with [Phase 0: Analysis & Validation](./00-analysis.md)