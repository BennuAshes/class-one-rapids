# Phase 4: Quality Assurance

## Objective
Ensure code quality and test coverage, optimize performance, and validate cross-platform compatibility.

## Work Packages

### WP 4.1: Unit Testing
#### Task 4.1.1: Test game logic calculations
- **Test files to create:**
  ```typescript
  // src/features/core-gameplay/__tests__/calculations.test.ts
  describe('Game Calculations', () => {
    test('exponential cost scaling', () => {
      expect(calculateCost(1, 2.5)).toBe(10);
      expect(calculateCost(2, 2.5)).toBe(25);
      expect(calculateCost(3, 2.5)).toBe(62.5);
    });
    
    test('department synergy bonuses', () => {
      const synergy = calculateSynergy(devDept, salesDept);
      expect(synergy).toBe(1.5);
    });
  });
  ```
- **Coverage target:** 80% for all calculation functions
- **Key areas:**
  - Cost calculations
  - Resource generation rates
  - Synergy multipliers
  - Prestige bonuses
- **Time estimate:** 3-4 hours

#### Task 4.1.2: Test state management
- **Test scenarios:**
  ```typescript
  // src/app/store/__tests__/gameStore.test.ts
  test('state persistence across sessions', async () => {
    const initialState = createGameState();
    await persistState(initialState);
    const loadedState = await loadState();
    expect(loadedState).toEqual(initialState);
  });
  ```
- **Coverage areas:**
  - State initialization
  - State updates
  - Persistence/loading
  - Computed properties
- **Time estimate:** 2-3 hours

#### Task 4.1.3: Test React components
- **Component tests:**
  ```typescript
  // src/shared/components/__tests__/Button.test.tsx
  test('Button triggers callback on press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} title="Click" />
    );
    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  ```
- **Components to test:**
  - Interactive buttons
  - Department views
  - Resource displays
  - Modal dialogs
- **Time estimate:** 2-3 hours

### WP 4.2: Integration Testing
#### Task 4.2.1: Test feature interactions
- **Integration test example:**
  ```typescript
  // src/__tests__/integration/gameplay.test.ts
  test('complete first automation flow', async () => {
    const { getByTestId } = render(<App />);
    
    // Click to earn initial money
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByTestId('write-code-btn'));
    }
    
    // Purchase junior dev
    fireEvent.press(getByTestId('hire-junior-dev'));
    
    // Verify automation started
    await waitFor(() => {
      expect(getByTestId('lines-of-code')).toHaveTextContent('1.0');
    });
  });
  ```
- **Test flows:**
  - Manual → Automation transition
  - Department unlocking
  - Prestige reset flow
  - Offline progression
- **Time estimate:** 3-4 hours

#### Task 4.2.2: Test save system integrity
- **Test scenarios:**
  - Normal save/load cycle
  - Corruption recovery
  - Migration from older saves
  - Concurrent save operations
- **Validation:**
  - No data loss
  - Graceful corruption handling
  - Backward compatibility
- **Time estimate:** 2 hours

### WP 4.3: End-to-End Testing
#### Task 4.3.1: Set up Maestro for E2E testing
- **Setup steps:**
  ```bash
  # Install Maestro
  curl -Ls "https://get.maestro.mobile.dev" | bash
  
  # Create test flow
  # maestro/first-hour.yaml
  appId: com.petsofttycoon
  ---
  - launchApp
  - tapOn: "WRITE CODE"
  - repeat:
      times: 10
      commands:
        - tapOn: "WRITE CODE"
  - tapOn: "Hire Junior Dev"
  - assertVisible: "0.1 lines/sec"
  ```
- **Time estimate:** 1-2 hours

#### Task 4.3.2: Create critical user journey tests
- **Test journeys:**
  - First 5 minutes (onboarding)
  - First prestige (30-45 min)
  - Multi-department management
  - Long session stability (2+ hours)
- **Validation criteria:**
  - No crashes or freezes
  - Expected progression pace
  - UI remains responsive
- **Time estimate:** 2-3 hours

### WP 4.4: Performance Optimization
#### Task 4.4.1: Profile and optimize render performance
- **Optimization checklist:**
  ```typescript
  // Before optimization
  const ExpensiveComponent = ({ data }) => {
    const processed = heavyCalculation(data); // Runs every render
    return <View>{processed}</View>;
  };
  
  // After optimization
  const OptimizedComponent = React.memo(({ data }) => {
    const processed = useMemo(() => heavyCalculation(data), [data]);
    return <View>{processed}</View>;
  });
  ```
- **Areas to optimize:**
  - List rendering (virtualization)
  - Animation performance
  - State update batching
  - Image/asset loading
- **Time estimate:** 3-4 hours

#### Task 4.4.2: Memory leak detection and fixes
- **Detection approach:**
  1. Run game for extended period
  2. Monitor memory usage
  3. Identify growing allocations
  4. Fix cleanup in useEffect hooks
- **Common leak sources:**
  - Uncleared timers
  - Event listener cleanup
  - Animation cleanup
  - State observer cleanup
- **Time estimate:** 2-3 hours

### WP 4.5: Cross-Platform Testing
#### Task 4.5.1: Test on multiple browsers
- **Browser matrix:**
  | Browser | Version | Priority |
  |---------|---------|----------|
  | Chrome | 90+ | Critical |
  | Safari | 14+ | Critical |
  | Firefox | 88+ | Important |
  | Edge | 90+ | Important |
  
- **Test areas:**
  - Audio compatibility
  - LocalStorage access
  - Animation performance
  - Touch/click events
- **Time estimate:** 2 hours

#### Task 4.5.2: Test on mobile devices
- **Device testing:**
  - iOS: iPhone 12+, iPad
  - Android: Pixel 5+, Samsung Galaxy
  - Tablets: iPad, Android tablets
- **Mobile-specific tests:**
  - Touch responsiveness
  - Screen orientation
  - Performance on older devices
  - Battery usage
- **Time estimate:** 2-3 hours

### WP 4.6: Bug Fixing and Polish
#### Task 4.6.1: Fix critical bugs
- **Bug priority levels:**
  - P0: Game breaking (immediate fix)
  - P1: Major feature broken (same day)
  - P2: Minor feature issue (this week)
  - P3: Polish/enhancement (if time)
- **Common bug categories:**
  - State inconsistencies
  - Visual glitches
  - Audio issues
  - Performance problems
- **Time estimate:** 4-6 hours

#### Task 4.6.2: Polish user experience
- **Polish tasks:**
  - Smooth all animations
  - Consistent visual feedback
  - Loading state indicators
  - Error message clarity
  - Tutorial hints
- **Validation:**
  - No jarring transitions
  - Clear user feedback
  - Intuitive interactions
- **Time estimate:** 2-3 hours

## Success Criteria
- [ ] 80%+ unit test coverage
- [ ] All critical user journeys tested
- [ ] 60 FPS performance achieved
- [ ] No memory leaks detected
- [ ] Cross-platform compatibility verified
- [ ] Zero P0/P1 bugs remaining

## Testing Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Unit Test Coverage | 80% | - |
| Integration Tests | 20 scenarios | - |
| E2E Tests | 5 journeys | - |
| Performance (FPS) | 60 | - |
| Memory Usage | <50MB | - |
| Bug Count (P0/P1) | 0 | - |

## Quality Gates
Before proceeding to deployment:
1. All tests passing (unit, integration, E2E)
2. Performance benchmarks met
3. No critical bugs
4. Cross-platform verification complete
5. Code review approved

## Estimated Total Time: 30-40 hours