# Runbook Analysis: PetSoft Tycoon MVP

## Research Validation Status
- ✅ Package versions extracted from research
- ✅ Architecture patterns validated
- ✅ All technologies cross-referenced
- ⚠️ Platform conflict resolved: Using React Native/Expo instead of vanilla JS

## Critical Platform Decision
**PRD Specified:** Web-based with vanilla JavaScript  
**Research Stack:** React Native with Expo SDK  
**Decision:** Implementing with React Native/Expo for cross-platform capability  
**Impact:** Development approach changes but timeline remains achievable with Expo's rapid development tools

## Extracted Requirements

### Business Objectives
- Build an idle clicker game simulating a pet software company
- Progress from garage startup to billion-dollar empire
- Seven interconnected departments with automation
- Prestige system for meta-progression
- 4-week development timeline (3 weeks dev + 1 week polish)

### Success Metrics
- D1 retention >40%, D7 >20%, D30 >10%
- Average session length 8+ minutes
- 90% tutorial completion rate
- 60 FPS performance on mid-range devices

### Core Features
1. **Click-to-Code Mechanic** - Primary interaction loop
2. **Feature Shipping** - Code-to-revenue conversion
3. **Department Management** - Seven departments with workers and managers
4. **Automation System** - Manager-driven offline progression
5. **Prestige System** - Reset for permanent bonuses
6. **Achievement System** - Goals and rewards
7. **Save System** - Automatic saves with offline progression

## Validated Package Versions (from research/)
```json
{
  "@legendapp/state": "@beta",
  "react-native": "0.76.0",
  "expo": "~52.0.0",
  "typescript": "^5.8.0",
  "@testing-library/react-native": "^12.4.0",
  "jest-expo": "^51.0.0",
  "react-native-reanimated": "~3.10.0",
  "expo-av": "~14.0.0",
  "react-native-mmkv": "^3.0.0"
}
```

## Architecture Patterns (from research/)
- **Vertical Slicing** - Feature-based folder organization (research/planning/vertical-slicing.md)
- **Modular Observables** - Separate state per feature (research/tech/legend-state.md)
- **Custom Hooks** - No utility functions for React logic (research/tech/react-native.md)
- **Component Colocation** - Components within feature folders

## Phase Overview

### Phase 1: Foundation (13 tasks)
- Project initialization with Expo
- Core dependencies installation
- Vertical slice directory structure
- Basic Legend State setup
- TypeScript configuration

### Phase 2: Core Features (15 tasks)
- Code production mechanic
- Feature shipping system
- Department implementation
- Basic UI components
- State management integration

### Phase 3: Integration (10 tasks)
- Department synergies
- Automation system
- Offline progression
- Save/load functionality
- Cross-feature coordination

### Phase 4: Quality (12 tasks)
- Unit test implementation
- Integration testing
- E2E test setup with Maestro
- Performance optimization
- Bug fixes

### Phase 5: Deployment (8 tasks)
- Build configuration
- Platform-specific builds
- Performance profiling
- Release preparation
- Documentation

## Resource Requirements

### Skills Needed
- React Native development
- Expo SDK knowledge
- TypeScript proficiency
- Legend State v3 understanding
- Mobile game development patterns

### Tools and Libraries
- Expo CLI and EAS Build
- React Native development environment
- iOS Simulator / Android Emulator
- Maestro for E2E testing
- Performance profiling tools

### External Dependencies
- App Store / Play Store accounts (for deployment)
- Design assets (sprites, backgrounds)
- Audio assets (sound effects, music)
- Testing devices (iOS and Android)

## Risk Assessment

### High Priority Risks
1. **Timeline vs Platform Change** - React Native instead of vanilla JS
   - Mitigation: Use Expo's rapid development tools
2. **Performance on Low-End Devices** - 60 FPS target
   - Mitigation: Early performance testing, optimization focus
3. **State Management Complexity** - Legend State learning curve
   - Mitigation: Start with simple patterns, refactor as needed

### Medium Priority Risks
1. **Cross-Platform Compatibility** - iOS/Android differences
   - Mitigation: Regular testing on both platforms
2. **Offline Progression Accuracy** - Complex calculations
   - Mitigation: Thorough testing, mathematical validation
3. **Save System Reliability** - Data persistence
   - Mitigation: MMKV for reliable storage, validation checks

## Development Approach

### Vertical Slicing Implementation
Each feature will be implemented as a complete vertical slice:
```
features/
├── codeProduction/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── state/
│   └── index.ts
```

### State Management Strategy
Modular observables with Legend State v3:
- Feature-specific state slices
- Composition at app level
- Persistence with MMKV
- Computed values for derived state

### Testing Strategy
- Unit tests with Jest and React Native Testing Library
- Integration tests for feature interactions
- E2E tests with Maestro for critical paths
- Performance monitoring throughout development

## Next Steps
1. Initialize Expo project with TypeScript template
2. Install research-validated dependencies
3. Create vertical slice directory structure
4. Implement basic game loop
5. Set up Legend State with persistence

## Success Criteria
- [ ] All research-validated packages installed
- [ ] Vertical slicing architecture implemented
- [ ] 60 FPS performance achieved
- [ ] All user stories completed
- [ ] Test coverage >80%
- [ ] Deployment-ready builds for iOS/Android