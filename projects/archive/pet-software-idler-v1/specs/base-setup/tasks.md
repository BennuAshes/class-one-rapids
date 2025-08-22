# Implementation Plan

## Phase 1: Expo Setup & First Playable (Day 1)

- [ ] 1. Create Expo project with tabs template and verify navigation
  - Run `npx create-expo-app@latest PetSoftTycoon --template tabs`
  - Verify iOS Simulator, Android Emulator, and web browser launch
  - Confirm Expo Router file-based navigation works
  - Test hot reload is under 2 seconds
  - _Requirements: 1.2_

- [ ] 2. Install and configure Legend-State v3 with MMKV
  - Install `@legendapp/state@beta react-native-mmkv`
  - Create `src/shared/state/gameState.ts` with observable game state
  - Configure `syncObservable` with MMKV plugin for persistence
  - Verify state persists across app restarts
  - _Requirements: 1.3_

- [ ] 3. Implement "WRITE CODE" button with instant feedback
  - Create `src/features/development/WriteCodeButton.tsx`
  - Add button animation with 50ms response time
  - Implement click handler updating `linesOfCode` resource
  - Add haptic feedback for iOS/Android
  - Test rapid clicking (10+ clicks/second) all register
  - _Requirements: 1.1, 1.6_

- [ ] 4. Add resource display showing lines of code
  - Create `src/shared/components/ResourceDisplay.tsx`
  - Display current `linesOfCode` count with reactive updates
  - Add number formatting (1K, 1M, etc.)
  - Verify only this component re-renders on state change
  - _Requirements: 1.3, 1.6_

## Phase 2: Game Loop & Visual Feedback (Day 1-2)

- [ ] 5. Implement core game loop with 100ms updates
  - Create `src/shared/gameLoop/gameLoop.ts`
  - Set up 100ms interval timer for resource updates
  - Add department production calculations (stub for now)
  - Implement play time tracking
  - Test consistent timing under load
  - _Requirements: 1.5_

- [ ] 6. Create number popup animations
  - Create `src/shared/visual/numberPopup.ts`
  - Implement object pooling for performance
  - Add fade-up animation over 1 second
  - Style differently for code/money/features
  - Verify 60fps with multiple popups
  - _Requirements: 1.6_

- [ ] 7. Add first department (Development) with basic production
  - Create `src/features/development/` folder structure
  - Implement Junior Dev unit (0.1 lines/sec for $10)
  - Add purchase button with cost scaling (1.15x)
  - Update game loop to process development production
  - Display auto-generated lines of code
  - _Requirements: 1.4, 1.5_

## Phase 3: Navigation & Multiple Departments (Day 2)

- [ ] 8. Set up tab navigation with proper screens
  - Configure `app/(tabs)/_layout.tsx` with 4 tabs
  - Create Company, Departments, Upgrades, Investors screens
  - Add tab icons using Ionicons
  - Test navigation between screens maintains state
  - _Requirements: 1.2, 1.4_

- [ ] 9. Implement Sales department structure
  - Create `src/features/sales/` following vertical slice pattern
  - Add Sales Rep unit generating leads
  - Implement lead → money conversion (1 lead + 1 feature = $50)
  - Update game loop for sales processing
  - _Requirements: 1.4, 1.5_

- [ ] 10. Add feature conversion mechanic
  - Create feature conversion in development calculations
  - 10 lines of code = 1 basic feature
  - Add "Ship Feature" button when enough code available
  - Connect features to sales conversion
  - _Requirements: 1.5_

## Phase 4: Offline Progress & Polish (Day 2-3)

- [ ] 11. Implement offline progress calculation
  - Add `calculateOfflineProgress` function
  - Track last save timestamp in state
  - Calculate up to 12 hours of progress on app resume
  - Display offline earnings popup on return
  - Test calculations match online progression
  - _Requirements: 1.5_

- [ ] 12. Add milestone particles and effects
  - Create `src/shared/visual/particles.ts`
  - Trigger particles at $100, $1K, $10K milestones
  - Add screen shake for big numbers
  - Implement different particle types (money, unlock)
  - Maintain 60fps during particle bursts
  - _Requirements: 1.6_

- [ ] 13. Configure TypeScript and path aliases
  - Set up strict TypeScript in `tsconfig.json`
  - Configure path aliases (@/features, @/shared, etc.)
  - Add ESLint and Prettier configs from tech.md
  - Verify 100% type coverage for core systems
  - Run type checking with `npx tsc --noEmit`
  - _Requirements: 1.2, 1.4_

## Phase 5: Department System Foundation (Day 3)

- [ ] 14. Create department unlock system
  - Add unlock costs to each department state
  - Sales unlocks at $500
  - Display locked departments with unlock requirements
  - Animate department unlock with "unfold" effect
  - _Requirements: 1.4, 1.6_

- [ ] 15. Implement department synergies
  - Add synergy calculations when thresholds met
  - 25+ developers = 2x efficiency
  - Cross-department bonuses (Dev + QA = fewer bugs)
  - Display active synergies in UI
  - _Requirements: 1.5_

- [ ] 16. Add save system triggers
  - Auto-save every 30 seconds
  - Save on significant actions (purchases, unlocks)
  - Save on app background/foreground
  - Verify MMKV persistence is working
  - Add save indicator animation
  - _Requirements: 1.3_

## Phase 6: Performance & Testing (Day 3-4)

- [ ] 17. Optimize animations and rendering
  - Profile with React DevTools
  - Ensure only affected components re-render
  - Verify game maintains 60fps with 100+ elements
  - Test on low-end devices (30fps minimum)
  - Check bundle size is under 3MB
  - _Requirements: 1.1, 1.6_

- [ ] 18. Add input queue for rapid actions
  - Implement click queue to prevent dropped inputs
  - Process all queued actions in order
  - Test with automated rapid clicking
  - Verify no clicks are lost
  - _Requirements: 1.1_

- [ ] 19. Create development utilities
  - Add debug panel showing FPS and render count
  - Create dev commands for adding resources
  - Add time skip for testing progression
  - Include state reset function
  - _Requirements: 1.5_

- [ ] 20. Final integration testing
  - Test full first 5 minutes experience
  - Verify all navigation flows work
  - Test offline progress after force quit
  - Validate persistence across app updates
  - Ensure no runtime errors in base setup
  - _Requirements: All_

## Notes
- **Dependencies**: Expo SDK 51+, @legendapp/state@beta, react-native-mmkv
- **Estimated Timeline**: 3-4 days for complete base setup
- **Risk Factors**: Legend-State v3 beta stability, MMKV platform differences
- **Success Criteria**: Playable game loop with persistent state and smooth performance