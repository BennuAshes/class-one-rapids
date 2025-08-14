# Phase 4: Quality Assurance

## Objective
Ensure code quality, test coverage, performance optimization, and cross-browser compatibility.

## Work Packages

### WP 4.1: Unit Testing

#### Task 4.1.1: Test Game Logic
- **Steps:**
  1. Test resource calculations
  2. Test cost formulas
  3. Test production rates
  4. Test multiplier stacking
- **Test examples:**
  ```typescript
  describe('Resource Calculations', () => {
    it('calculates employee cost correctly', () => {
      const cost = calculateCost('juniorDev', 5);
      expect(cost).toBe(10 * Math.pow(1.15, 5));
    });
    
    it('applies synergy bonuses correctly', () => {
      const base = 100;
      const withSynergy = applySynergies(base, ['dev-sales']);
      expect(withSynergy).toBe(150);
    });
  });
  ```
- **Coverage target:** 70% of game logic
- **Time estimate:** 2 hours

#### Task 4.1.2: Test State Management
- **Steps:**
  1. Test Legend State updates
  2. Test computed observables
  3. Test batch operations
  4. Test persistence
- **State tests:**
  ```typescript
  describe('Game State', () => {
    it('updates resources atomically', () => {
      batch(() => {
        gameState$.resources.money.set(100);
        gameState$.resources.code.set(50);
      });
      
      expect(gameState$.get()).toMatchSnapshot();
    });
  });
  ```
- **Validation:** All state operations tested
- **Time estimate:** 1.5 hours

#### Task 4.1.3: Test Components
- **Steps:**
  1. Test user interactions
  2. Test rendering logic
  3. Test prop handling
  4. Test hooks
- **Component test pattern:**
  ```typescript
  describe('WriteCodeButton', () => {
    it('increases code on click', async () => {
      const user = userEvent.setup();
      render(<WriteCodeButton />);
      
      await user.click(screen.getByRole('button'));
      
      expect(gameState$.resources.linesOfCode.get()).toBe(1);
    });
  });
  ```
- **Time estimate:** 2 hours

### WP 4.2: Integration Testing

#### Task 4.2.1: Test Game Flows
- **Steps:**
  1. Test tutorial flow
  2. Test progression to prestige
  3. Test department unlocking
  4. Test achievement unlocks
- **Flow test example:**
  ```typescript
  describe('Game Progression', () => {
    it('unlocks sales at $500', async () => {
      // Simulate earning $500
      await playUntilMoney(500);
      
      expect(departments.sales.unlocked).toBe(true);
    });
  });
  ```
- **Coverage target:** Critical user paths
- **Time estimate:** 1.5 hours

#### Task 4.2.2: Test Save/Load Cycle
- **Steps:**
  1. Test save integrity
  2. Test load restoration
  3. Test version migration
  4. Test corruption handling
- **Validation:** No data loss
- **Time estimate:** 1 hour

### WP 4.3: Performance Optimization

#### Task 4.3.1: Profile and Optimize
- **Steps:**
  1. Run performance profiler
  2. Identify bottlenecks
  3. Optimize hot paths
  4. Reduce re-renders
- **Optimization targets:**
  ```typescript
  // Before: Multiple state updates
  setCode(code + 1);
  setMoney(money - 10);
  
  // After: Batched update
  batch(() => {
    gameState$.resources.code.set(c => c + 1);
    gameState$.resources.money.set(m => m - 10);
  });
  ```
- **Target:** Maintain 60 FPS
- **Time estimate:** 2 hours

#### Task 4.3.2: Memory Management
- **Steps:**
  1. Implement object pooling
  2. Clean up event listeners
  3. Optimize asset loading
  4. Monitor memory growth
- **Memory optimization:**
  ```typescript
  // Object pool for particles
  class ParticlePool {
    private pool: Particle[] = [];
    
    get(): Particle {
      return this.pool.pop() || new Particle();
    }
    
    release(particle: Particle): void {
      particle.reset();
      this.pool.push(particle);
    }
  }
  ```
- **Target:** <50MB heap usage
- **Time estimate:** 1.5 hours

#### Task 4.3.3: Bundle Optimization
- **Steps:**
  1. Analyze bundle size
  2. Code split features
  3. Lazy load assets
  4. Minify and compress
- **Bundle commands:**
  ```bash
  npm run build
  npm run analyze-bundle
  # Target: <3MB initial load
  ```
- **Validation:** Fast initial load
- **Time estimate:** 1 hour

### WP 4.4: Cross-Browser Testing

#### Task 4.4.1: Test Browser Compatibility
- **Steps:**
  1. Test Chrome 90+
  2. Test Firefox 88+
  3. Test Safari 14+
  4. Test Edge 90+
- **Test matrix:**
  | Feature | Chrome | Firefox | Safari | Edge |
  |---------|--------|---------|--------|------|
  | Core Loop | ✓ | ✓ | ✓ | ✓ |
  | Audio | ✓ | ✓ | ✓ | ✓ |
  | Animations | ✓ | ✓ | ✓ | ✓ |
  | Save/Load | ✓ | ✓ | ✓ | ✓ |
- **Time estimate:** 2 hours

#### Task 4.4.2: Fix Compatibility Issues
- **Steps:**
  1. Add polyfills if needed
  2. Use feature detection
  3. Provide fallbacks
  4. Test fixes
- **Compatibility pattern:**
  ```typescript
  const supportsWebAudio = 'AudioContext' in window;
  
  if (supportsWebAudio) {
    initializeAudio();
  } else {
    console.log('Audio not supported');
  }
  ```
- **Time estimate:** 1.5 hours

### WP 4.5: Accessibility

#### Task 4.5.1: Implement Keyboard Navigation
- **Steps:**
  1. Add tabindex to buttons
  2. Handle keyboard events
  3. Show focus indicators
  4. Test with keyboard only
- **Keyboard support:**
  ```typescript
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };
  ```
- **Time estimate:** 1 hour

#### Task 4.5.2: Add Screen Reader Support
- **Steps:**
  1. Add ARIA labels
  2. Use semantic HTML
  3. Add live regions
  4. Test with screen reader
- **ARIA example:**
  ```html
  <button 
    aria-label="Write code. Current: 42 lines"
    aria-live="polite"
  >
    WRITE CODE
  </button>
  ```
- **Time estimate:** 1.5 hours

### WP 4.6: Polish and Bug Fixes

#### Task 4.6.1: Visual Polish
- **Steps:**
  1. Smooth all animations
  2. Add particle effects
  3. Polish UI transitions
  4. Ensure visual consistency
- **Polish checklist:**
  - [ ] Button hover states
  - [ ] Loading animations
  - [ ] Success feedback
  - [ ] Error states
- **Time estimate:** 2 hours

#### Task 4.6.2: Audio Polish
- **Steps:**
  1. Balance audio levels
  2. Add audio variations
  3. Implement volume controls
  4. Test audio timing
- **Audio implementation:**
  ```typescript
  class AudioManager {
    playClick() {
      const variations = ['click1.mp3', 'click2.mp3'];
      const sound = variations[Math.floor(Math.random() * 2)];
      this.play(sound, { volume: 0.5 });
    }
  }
  ```
- **Time estimate:** 1 hour

#### Task 4.6.3: Fix Critical Bugs
- **Steps:**
  1. Review bug reports
  2. Prioritize by severity
  3. Fix and test
  4. Verify fixes
- **Bug priority:**
  - P0: Game breaking
  - P1: Major feature broken
  - P2: Minor issues
  - P3: Polish items
- **Time estimate:** 2-3 hours

## Deliverables Checklist

- [ ] 70% unit test coverage
- [ ] Integration tests passing
- [ ] 60 FPS performance verified
- [ ] <50MB memory usage
- [ ] <3MB bundle size
- [ ] All browsers tested
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Visual polish complete
- [ ] Audio balanced
- [ ] No P0/P1 bugs

## Quality Gates

### Performance Gate
- Maintain 60 FPS during gameplay
- Response time <50ms
- Memory stable over 1 hour

### Compatibility Gate
- Works on all target browsers
- Mobile responsive
- Accessibility compliant

### Stability Gate
- No crashes in 1 hour play
- Save/load 100% reliable
- No data corruption

## Next Phase Dependencies
Phase 5 requires:
- All tests passing
- Performance optimized
- Bugs fixed
- Polish complete

## Time Summary
- **Total estimated time:** 20-22 hours
- **Critical path:** Testing → Optimization → Polish
- **Parallelizable:** Different test suites, browser testing

## Quality Metrics

### Code Quality
- ESLint: 0 errors
- TypeScript: strict mode, 0 errors
- Test coverage: >70%
- Bundle size: <3MB

### User Experience
- First click: <50ms response
- Save time: <100ms
- Load time: <3 seconds
- Frame rate: 58+ FPS

### Stability
- Crash rate: 0%
- Save corruption: 0%
- Bug reports: <1%