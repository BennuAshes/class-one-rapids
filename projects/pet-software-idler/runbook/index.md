# PetSoft Tycoon Development Runbook
## Version 8.0 | React Native + Legend State Architecture

### Overview
This runbook provides a comprehensive, step-by-step development guide for implementing PetSoft Tycoon using React Native with Expo SDK 52 and Legend State for optimal performance. Each phase includes specific tasks, validation criteria, and executable commands.

### Architecture Summary
- **Framework**: React Native 0.76+ (New Architecture mandatory)
- **Platform**: Expo ~52.0.0 
- **State Management**: Legend State @beta (40% performance improvement)
- **Animation**: React Native Reanimated 3.x
- **Routing**: Expo Router ~4.0.0
- **TypeScript**: ^5.8.0 (strict mode enforced)

### Development Phases

#### Phase 0: Analysis & Planning
**File**: `00-analysis.md`
- Requirements validation
- Tech stack verification
- Architecture planning
- Risk assessment
**Duration**: 1 day

#### Phase 1: Foundation Setup
**File**: `01-foundation.md`
- Project initialization with Expo
- Dependencies and configuration
- Base architecture implementation
- Development environment setup
**Duration**: 2-3 days

#### Phase 2: Core Game Features
**File**: `02-core-features.md`
- Game loop implementation
- Resource management system
- Click mechanics and progression
- Basic UI components
**Duration**: 3-4 days

#### Phase 3: Department Systems
**File**: `03-integration.md`
- All 7 department implementations
- Employee hiring and management
- Manager automation systems
- Prestige and investor mechanics
**Duration**: 4-5 days

#### Phase 4: Quality & Polish
**File**: `04-quality.md`
- Performance optimization
- Audio and animation systems
- Cross-platform testing
- Save/Load robustness
**Duration**: 3-4 days

#### Phase 5: Deployment Preparation
**File**: `05-deployment.md`
- Build optimization
- Platform-specific configurations
- Testing and quality assurance
- Launch preparation
**Duration**: 2-3 days

### Progress Tracking
- **Progress Status**: `progress.json` - Tracks completion of each phase and task
- **Research Queue**: `research-requirements.json` - Items requiring investigation

### Prerequisites
- Node.js 18+
- Expo CLI latest
- React Native development environment
- iOS Simulator / Android Emulator
- VS Code with TypeScript support

### Quick Start
```bash
# Navigate to project
cd /mnt/c/dev/class-one-rapids/projects/pet-software-idler

# Start with analysis phase
open runbook/00-analysis.md

# Track progress
cat runbook/progress.json
```

### Critical Success Factors
1. **Performance**: Maintain 60 FPS on target devices
2. **Cross-Platform**: Ensure consistent experience iOS/Android
3. **State Management**: Leverage Legend State for optimal performance
4. **Save System**: Implement robust save/load with corruption protection
5. **User Experience**: Smooth animations and responsive interactions

### Support Resources
- Technical Requirements: `petsoft-tycoon-advanced-prd-technical-requirements.md`
- Research Quick-Ref: `/research/quick-ref.md`
- Architecture Patterns: Vertical slicing by feature
- Performance Monitoring: Built-in FPS and memory tracking

---
**Next Step**: Begin with Phase 0 - Analysis (`00-analysis.md`)