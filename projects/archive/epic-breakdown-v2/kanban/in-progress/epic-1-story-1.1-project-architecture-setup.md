---
epic: 1
story: 1.1
title: "Project Architecture Setup"
status: "in-progress"
assigned: ""
blocked_by: []
blocks: ["1.2", "1.3", "1.4", "1.5", "1.6"]
estimated_hours: 8
actual_hours: 0
completion_date: null
last_updated: 2025-08-03T05:10:28Z
---

# Story 1.1: Project Architecture Setup

## User Story
**As a** development team, **I want** a properly configured React Native Expo project **so that** we can build efficiently with modern architecture and best practices from day one.

## Acceptance Criteria
- [ ] Expo SDK 52+ project initialized with TypeScript configuration
- [ ] Legend State v3 configured with MMKV persistence
- [ ] Vertical slice folder structure implemented following specifications
- [ ] Testing framework (Jest + React Native Testing Library) configured
- [ ] ESLint and Prettier configured for code quality
- [ ] Build targets work for iOS, Android, and Web
- [ ] All required dependencies installed and compatible
- [ ] Performance monitoring baseline established

## Technical Design

### Project Architecture
```typescript
// Core technology stack configuration
interface ProjectArchitecture {
  platform: 'expo' | 'bare-react-native';
  sdkVersion: '52+';
  language: 'typescript';
  stateManagement: 'legend-state-v3';
  persistence: 'mmkv';
  testing: 'jest + react-native-testing-library';
  architecture: 'vertical-slice';
}
```

### Folder Structure Design
```typescript
// Vertical slice architecture organization
const projectStructure = {
  src: {
    core: ['engine', 'state', 'services', 'constants'],
    features: ['clicking', 'departments', 'progression', 'analytics'],
    shared: ['components', 'hooks', 'services', 'utils', 'types'],
    ui: ['screens', 'navigation', 'theme', 'animations']
  },
  assets: ['images', 'sounds', 'fonts'],
  tests: ['unit', 'integration', 'e2e']
};
```

## API Contracts

### Configuration Interfaces
```typescript
export interface ExpoConfig {
  name: string;
  slug: string;
  version: string;
  sdkVersion: string;
  platforms: ('ios' | 'android' | 'web')[];
  plugins: string[];
}

export interface LegendStateConfig {
  persist: {
    plugin: 'mmkv';
    encryption: boolean;
  };
  observables: {
    gameState: GameState;
    userPreferences: UserPreferences;
  };
}
```

## Implementation Plan

### Step 1: Expo Project Initialization
1. Initialize new Expo project with TypeScript template
2. Configure app.json with platform settings and plugins
3. Set up Metro bundler configuration with path aliases
4. Configure TypeScript with strict mode and path mapping
5. Verify initial build works across all target platforms

### Step 2: State Management Setup
1. Install Legend State v3 beta and MMKV dependencies
2. Configure MMKV storage with encryption
3. Set up base observable structure for game state
4. Create persistence configuration with sync
5. Test state persistence and loading functionality

### Step 3: Architecture Implementation
1. Create vertical slice folder structure
2. Set up barrel exports for each feature module
3. Configure TypeScript path aliases for clean imports
4. Create shared component library foundation
5. Implement core service layer architecture

### Step 4: Development Tooling
1. Configure ESLint with React Native and TypeScript rules
2. Set up Prettier for consistent code formatting
3. Configure Jest and React Native Testing Library
4. Set up testing utilities and mock frameworks
5. Create development scripts and automation

## Tasks

### Phase 1: Project Foundation (4 hours)
- [ ] **Task 1.1:** Initialize Expo SDK 52+ project with TypeScript (Estimate: 1 hour)
- [ ] **Task 1.2:** Configure app.json with platform settings and required plugins (Estimate: 1 hour)
- [ ] **Task 1.3:** Set up Metro bundler with path aliases and optimization (Estimate: 1 hour)
- [ ] **Task 1.4:** Configure TypeScript with strict mode and path mapping (Estimate: 1 hour)

### Phase 2: State Management Integration (2 hours)
- [ ] **Task 2.1:** Install and configure Legend State v3 with MMKV (Estimate: 1 hour)
- [ ] **Task 2.2:** Set up encrypted storage and persistence configuration (Estimate: 1 hour)

### Phase 3: Architecture Implementation (2 hours)
- [ ] **Task 3.1:** Create vertical slice folder structure with barrel exports (Estimate: 1 hour)
- [ ] **Task 3.2:** Implement core service layer and shared utilities (Estimate: 1 hour)

**Total Estimated Time: 8 hours**

## Dependencies

### Blocks
- **Story 1.2**: Instant Click Gratification - requires project foundation
- **Story 1.3**: Resource System Foundation - requires state management setup
- **Story 1.4**: First Automation Unlock - requires architecture foundation
- **Story 1.5**: UI Foundation System - requires shared component structure
- **Story 1.6**: Feedback System - requires audio/visual framework setup

### Blocked by
- None (Foundation story)

### Technical Dependencies
- Expo SDK 52+ availability and stability
- Legend State v3 beta compatibility with React Native
- MMKV native module compilation for all target platforms
- TypeScript configuration compatibility with Expo

## Definition of Done

### Core Functionality
- [ ] Project builds successfully for iOS, Android, and Web
- [ ] TypeScript compilation passes with zero errors
- [ ] All path aliases resolve correctly
- [ ] Basic state management works with persistence

### Performance Standards
- [ ] Initial bundle size < 3MB for baseline
- [ ] Build time < 30 seconds for development
- [ ] Hot reload functionality works reliably

### Integration Completeness
- [ ] ESLint and Prettier integration functional
- [ ] Testing framework can run sample tests
- [ ] All folder structure and naming conventions implemented
- [ ] Development scripts and automation working

## Notes
- This is the critical foundation story that all other development depends on
- Pay special attention to performance configuration as this sets baseline
- Ensure all team members can run the project after completion
- Document any platform-specific setup requirements or issues encountered