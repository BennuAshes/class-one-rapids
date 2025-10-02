# Offline Progression System - Technical Design Document

## Document Control
| Version | Author | Date | Status | Changes |
|---------|--------|------|--------|---------|
| v1.0 | TDD Generator | 2025-09-28 | Draft | Initial TDD generated from PRD |

## Executive Summary
Implement automatic offline progression through time-based calculation system that simulates player combat and reward accumulation while the app is closed, using React Native's AppState API and AsyncStorage for persistence. This system addresses player retention by ensuring progression continues between sessions while maintaining game balance through efficiency rates and time caps.

## 1. Overview & Context

### Problem Statement
Players currently lose 100% of potential progression when the app closes, creating a 73% abandonment rate within the first week. The technical challenge is calculating accurate offline rewards while preventing time manipulation exploits and ensuring instant calculations on app resume.

### Solution Approach
Implement a deterministic calculation engine that:
- Captures exact timestamp on app background/close using AppState API
- Stores timestamp and player state in AsyncStorage
- Calculates rewards based on elapsed time and Power level on resume
- Presents results through a modal overlay with one-tap collection
- Validates time integrity to prevent exploitation

### Success Criteria
- Welcome back modal appears within 500ms of app resume
- Offline calculations complete in <50ms for 8-hour sessions
- Zero false positive cheat detections (<0.1% of users)
- D1 retention increases from 15% to 45% within 2 weeks
- 40-60% of total progression comes from offline gains

## 2. Requirements Analysis

### Functional Requirements

**Core Calculation Engine:**
- Calculate enemies defeated: `Math.floor((power * 2) * (minutesOffline / 60) * 0.25)`
- XP per enemy: `10 * 0.25` (2.5 XP per enemy at base efficiency)
- Pyreal per enemy: `Math.floor(Math.random() * 5 + 1) * 0.25`
- Process level-ups sequentially, updating Power after each level
- Hard cap at 28,800 seconds (8 hours) of offline time
- Minimum 60 seconds offline required for any rewards

**Time Management:**
- Save timestamp on `AppState` change to 'background' or 'inactive'
- Load and validate timestamp on 'active' state
- Handle edge cases: negative time, device restarts, time zone changes
- Maintain rolling buffer of last 5 sessions for debugging

**UI Presentation:**
- Modal overlay with 70% background opacity
- Time format: "2h 34m" style display
- Number animations: 0 to final value over 1.5 seconds
- Golden glow pulse on "Collect All" button
- Automatic dismissal after collection

### Non-Functional Requirements

**Performance:**
- AppState listener setup: <10ms
- Timestamp save operation: <100ms
- Full calculation for 8 hours: <50ms
- Modal render time: <500ms
- Collection animation: 60 FPS maintained

**Security:**
- Time validation: Reject negative deltas
- Maximum reward caps: 10,000 XP, 50,000 Pyreal per session
- Checksum on stored timestamps using SHA-256
- Anomaly detection: Flag repeated exact 8-hour sessions
- AsyncStorage encryption using react-native-keychain

**Accessibility:**
- VoiceOver/TalkBack support for modal content
- Minimum touch target: 44x44 points
- Text scales with system font size up to 200%
- High contrast mode support (WCAG AA)
- Reduced motion option skips animations

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────┐
│          App.tsx (Main)             │
│  - Registers AppState listener      │
│  - Manages offline modal display    │
└─────────────┬───────────────────────┘
              │
              ├──────────────┐
              │              │
    ┌─────────▼──────┐ ┌────▼─────────┐
    │ TimeTracker    │ │OfflineModal  │
    │   Service      │ │   Component  │
    └────────┬───────┘ └──────────────┘
             │
    ┌────────▼───────────────┐
    │ OfflineCalculator      │
    │ - Compute rewards      │
    │ - Process level-ups    │
    └────────┬───────────────┘
             │
    ┌────────▼───────────────┐
    │   AsyncStorage          │
    │ - Persist timestamps    │
    │ - Store player state    │
    └────────────────────────┘
```

### Component Design

#### TimeTracker Service
- **Purpose**: Monitor app state transitions and manage timestamps
- **Responsibilities**: 
  - Listen to AppState changes
  - Save/load timestamps from AsyncStorage
  - Validate time integrity
- **Interfaces**:
  ```typescript
  interface TimeTracker {
    startTracking(): void;
    stopTracking(): void;
    getElapsedTime(): number; // seconds
    saveTimestamp(): Promise<void>;
    loadLastSession(): Promise<SessionData | null>;
  }
  ```
- **Dependencies**: AppState API, AsyncStorage, CryptoJS for checksums

#### OfflineCalculator Service
- **Purpose**: Calculate offline progression rewards
- **Responsibilities**:
  - Compute enemies defeated based on Power and time
  - Calculate XP and Pyreal rewards
  - Process sequential level-ups
  - Apply efficiency rates and caps
- **Interfaces**:
  ```typescript
  interface OfflineRewards {
    timeOffline: number;
    enemiesDefeated: number;
    xpGained: number;
    pyrealGained: number;
    levelsGained: number;
    newLevel: number;
    newPower: number;
  }
  
  interface OfflineCalculator {
    calculateRewards(timeOfflineSeconds: number, currentState: PlayerState): OfflineRewards;
    processLevelUps(currentXP: number, xpGained: number, currentLevel: number): LevelUpResult[];
  }
  ```
- **Dependencies**: Player state management, XP tables

#### WelcomeBackModal Component
- **Purpose**: Display offline rewards to returning players
- **Responsibilities**:
  - Render modal overlay with rewards
  - Animate number increments
  - Handle collection interaction
  - Manage modal lifecycle
- **Interfaces**:
  ```typescript
  interface WelcomeBackModalProps {
    rewards: OfflineRewards;
    isVisible: boolean;
    onCollect: () => void;
    onDismiss: () => void;
  }
  ```
- **Dependencies**: React Native Reanimated 3 for animations

### Data Flow

```
1. App Background:
   AppState('active' → 'background') 
   → TimeTracker.saveTimestamp() 
   → AsyncStorage.setItem('lastCloseTime', encrypted_timestamp)

2. App Resume:
   AppState('background' → 'active')
   → TimeTracker.loadLastSession()
   → Validate timestamp integrity
   → OfflineCalculator.calculateRewards()
   → Show WelcomeBackModal
   → User taps "Collect"
   → Apply rewards to player state
   → Save updated state
   → Dismiss modal
```

## 4. API Design

### Internal APIs

| Module | Method | Purpose | Input | Output |
|--------|--------|---------|-------|--------|
| TimeTracker | `saveTimestamp()` | Save current time on background | None | Promise<void> |
| TimeTracker | `getElapsedTime()` | Get seconds since last save | None | number |
| OfflineCalculator | `calculateRewards()` | Compute offline gains | timeSeconds, playerState | OfflineRewards |
| PlayerState | `applyRewards()` | Add rewards to player | OfflineRewards | UpdatedPlayerState |
| Analytics | `trackOfflineSession()` | Log offline progression | OfflineRewards | void |

### External Integrations
None required for MVP - all calculations are client-side.

## 5. Data Model

### Entity Design

```typescript
// Stored in AsyncStorage
interface SessionData {
  timestamp: number;        // Unix timestamp in milliseconds
  checksum: string;        // SHA-256 hash for validation
  playerLevel: number;     // Level at time of close
  playerPower: number;     // Power at time of close
  playerXP: number;        // XP at time of close
  playerPyreal: number;    // Pyreal at time of close
}

// Runtime calculation result
interface OfflineRewards {
  timeOffline: number;     // Seconds offline (capped at 28800)
  enemiesDefeated: number; // Total enemies calculated
  xpGained: number;        // Total XP earned
  pyrealGained: number;    // Total Pyreal earned
  levelsGained: number;    // Number of level-ups
  newLevel: number;        // Final level after gains
  newPower: number;        // Final power after level-ups
  breakdown: CalculationBreakdown; // For transparency
}

// For showing calculation details
interface CalculationBreakdown {
  baseRate: number;        // Enemies per hour at 100% efficiency
  efficiency: number;      // Offline efficiency (0.25)
  timeCapped: boolean;     // Was 8-hour cap applied?
  actualTime: number;      // Real time offline
  cappedTime: number;      // Time used for calculation
}
```

### AsyncStorage Schema

```javascript
// Keys used in AsyncStorage
const STORAGE_KEYS = {
  LAST_CLOSE_TIME: '@offline_last_close',
  SESSION_HISTORY: '@offline_session_history',
  PLAYER_STATE: '@player_state',
  OFFLINE_SETTINGS: '@offline_settings'
};

// Stored as encrypted JSON strings
{
  "@offline_last_close": {
    "timestamp": 1696784400000,
    "checksum": "a3f5b8c9d2e1...",
    "playerLevel": 5,
    "playerPower": 10,
    "playerXP": 1250,
    "playerPyreal": 500
  },
  "@offline_session_history": [
    // Last 5 sessions for debugging
    { "timestamp": 1696784400000, "duration": 7200, "rewards": {...} },
    // ...
  ]
}
```

### Data Access Patterns
- **Write on background**: Single AsyncStorage.setItem() call
- **Read on resume**: Single AsyncStorage.getItem() call
- **History maintenance**: Append to array, trim to 5 items
- **State updates**: Batch all changes in single transaction

## 6. Security Design

### Authentication & Authorization
Not applicable - offline progression is client-side only for MVP.

### Data Security

**Timestamp Integrity:**
```typescript
function saveSecureTimestamp(timestamp: number): Promise<void> {
  const data = {
    timestamp,
    checksum: SHA256(`${timestamp}:${SECRET_SALT}`).toString()
  };
  const encrypted = await Keychain.setInternetCredentials(
    'offline_timestamp',
    'timestamp',
    JSON.stringify(data)
  );
  return encrypted;
}

function validateTimestamp(data: SessionData): boolean {
  const expected = SHA256(`${data.timestamp}:${SECRET_SALT}`).toString();
  return data.checksum === expected;
}
```

**Anti-Cheat Measures:**
- Reject time differences > 28,800 seconds
- Reject negative time differences
- Cap maximum rewards per session
- Log anomalies for pattern detection
- Store device fingerprint with sessions

### Security Controls
- Input validation: All numeric values checked for range
- Rate limiting: Maximum 1 offline calculation per app resume
- State validation: Player stats checked for consistency
- Audit logging: All reward grants logged with metadata

## 7. Test-Driven Development (TDD) Strategy

### TDD Approach (MANDATORY)
**All implementation must follow Red-Green-Refactor cycle**

#### Testing Framework & Tools
- Framework: React Native Testing Library
- Reference: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Test Runner: Jest with React Native preset
- Mocking: MSW for future API mocking, Jest mocks for AppState and AsyncStorage
- Time mocking: Jest fake timers for time-based calculations

#### TDD Implementation Process

### Phase 1: Time Tracking Tests (RED → GREEN → REFACTOR)

```typescript
// TimeTracker.test.ts - Write FIRST before implementation

// Test 1: RED Phase - Basic timestamp saving
test('saves timestamp when app goes to background', async () => {
  const tracker = new TimeTracker();
  const mockTime = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(mockTime);
  
  await tracker.saveTimestamp();
  
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CLOSE_TIME);
  const parsed = JSON.parse(saved);
  expect(parsed.timestamp).toBe(mockTime);
});

// Test 2: RED Phase - Time calculation
test('calculates elapsed time correctly', async () => {
  const tracker = new TimeTracker();
  const pastTime = Date.now() - 3600000; // 1 hour ago
  
  await AsyncStorage.setItem(
    STORAGE_KEYS.LAST_CLOSE_TIME,
    JSON.stringify({ timestamp: pastTime })
  );
  
  const elapsed = await tracker.getElapsedTime();
  expect(elapsed).toBe(3600); // 3600 seconds
});

// Test 3: RED Phase - Edge case handling
test('returns 0 for negative time differences', async () => {
  const tracker = new TimeTracker();
  const futureTime = Date.now() + 3600000; // 1 hour in future
  
  await AsyncStorage.setItem(
    STORAGE_KEYS.LAST_CLOSE_TIME,
    JSON.stringify({ timestamp: futureTime })
  );
  
  const elapsed = await tracker.getElapsedTime();
  expect(elapsed).toBe(0);
});

// GREEN Phase: Implement ONLY enough to pass these tests
// REFACTOR Phase: Clean up implementation while keeping tests green
```

### Phase 2: Offline Calculator Tests

```typescript
// OfflineCalculator.test.ts - Write FIRST

// Test 1: Basic reward calculation
test('calculates enemies defeated based on power and time', () => {
  const calculator = new OfflineCalculator();
  const playerState = { level: 5, power: 10, xp: 1000, pyreal: 500 };
  
  // 1 hour offline at power 10: (10 * 2) * 1 * 0.25 = 5 enemies
  const rewards = calculator.calculateRewards(3600, playerState);
  
  expect(rewards.enemiesDefeated).toBe(5);
  expect(rewards.xpGained).toBe(12.5); // 5 * 2.5 XP per enemy
});

// Test 2: 8-hour cap application
test('caps offline time at 8 hours', () => {
  const calculator = new OfflineCalculator();
  const playerState = { level: 5, power: 10, xp: 1000, pyreal: 500 };
  
  // 10 hours offline should cap at 8
  const rewards = calculator.calculateRewards(36000, playerState);
  
  expect(rewards.timeOffline).toBe(28800); // 8 hours in seconds
  expect(rewards.breakdown.timeCapped).toBe(true);
});

// Test 3: Level-up processing
test('processes multiple level-ups sequentially', () => {
  const calculator = new OfflineCalculator();
  const playerState = { level: 1, power: 2, xp: 90, pyreal: 100 };
  
  // Should level up from 1→2→3
  const rewards = calculator.calculateRewards(7200, playerState); // 2 hours
  
  expect(rewards.levelsGained).toBe(2);
  expect(rewards.newLevel).toBe(3);
  expect(rewards.newPower).toBe(6); // Power = level * 2
});

// Test 4: Minimum time requirement
test('returns no rewards for less than 60 seconds offline', () => {
  const calculator = new OfflineCalculator();
  const playerState = { level: 5, power: 10, xp: 1000, pyreal: 500 };
  
  const rewards = calculator.calculateRewards(30, playerState);
  
  expect(rewards.enemiesDefeated).toBe(0);
  expect(rewards.xpGained).toBe(0);
  expect(rewards.pyrealGained).toBe(0);
});
```

### Phase 3: Welcome Back Modal Tests

```typescript
// WelcomeBackModal.test.tsx - Write FIRST

import { render, screen, userEvent } from '@testing-library/react-native';

// Test 1: Modal display
test('displays offline rewards when visible', () => {
  const rewards = {
    timeOffline: 3600,
    enemiesDefeated: 5,
    xpGained: 12.5,
    pyrealGained: 10,
    levelsGained: 0,
    newLevel: 5,
    newPower: 10
  };
  
  render(
    <WelcomeBackModal 
      rewards={rewards} 
      isVisible={true}
      onCollect={jest.fn()}
    />
  );
  
  expect(screen.getByText('Welcome Back!')).toBeTruthy();
  expect(screen.getByText('You were away for 1h 0m')).toBeTruthy();
  expect(screen.getByText('5 Enemies Defeated')).toBeTruthy();
  expect(screen.getByText('+12 XP')).toBeTruthy();
  expect(screen.getByText('+10 Pyreal')).toBeTruthy();
});

// Test 2: Collection interaction
test('calls onCollect when Collect All button pressed', async () => {
  const user = userEvent.setup();
  const handleCollect = jest.fn();
  const rewards = { /* ... */ };
  
  render(
    <WelcomeBackModal 
      rewards={rewards} 
      isVisible={true}
      onCollect={handleCollect}
    />
  );
  
  await user.press(screen.getByText('Collect All'));
  expect(handleCollect).toHaveBeenCalledTimes(1);
});

// Test 3: Animation values
test('animates numbers from 0 to final value', () => {
  const rewards = { xpGained: 100, pyrealGained: 50 };
  
  const { getByTestId } = render(
    <WelcomeBackModal rewards={rewards} isVisible={true} />
  );
  
  // Check initial animated values
  expect(getByTestId('xp-animated').props.children).toBe('0');
  
  // Fast-forward animations
  jest.runAllTimers();
  
  // Check final values
  expect(getByTestId('xp-animated').props.children).toBe('100');
});
```

### Phase 4: Integration Tests

```typescript
// App.integration.test.tsx

test('complete offline progression flow', async () => {
  const user = userEvent.setup();
  
  // Setup: App with player at level 5
  const { rerender } = render(<App />);
  
  // Simulate app going to background
  const mockTime = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(mockTime);
  AppState.currentState = 'background';
  AppState.emit('change', 'background');
  
  // Advance time by 2 hours
  jest.spyOn(Date, 'now').mockReturnValue(mockTime + 7200000);
  
  // Simulate app resuming
  AppState.currentState = 'active';
  AppState.emit('change', 'active');
  rerender(<App />);
  
  // Wait for modal to appear
  await waitFor(() => {
    expect(screen.getByText('Welcome Back!')).toBeTruthy();
  });
  
  // Verify calculations
  expect(screen.getByText(/2h 0m/)).toBeTruthy();
  
  // Collect rewards
  await user.press(screen.getByText('Collect All'));
  
  // Verify modal dismisses
  await waitForElementToBeRemoved(() => 
    screen.queryByText('Welcome Back!')
  );
  
  // Verify state updated
  const state = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_STATE);
  const parsed = JSON.parse(state);
  expect(parsed.xp).toBeGreaterThan(1000); // Started at 1000
});
```

### TDD Checklist for Each Component
- [ ] First test written before ANY implementation code
- [ ] Each test covers one specific behavior
- [ ] Tests use React Native Testing Library patterns
- [ ] No testIds unless absolutely necessary
- [ ] Tests query by user-visible content
- [ ] Async operations use waitFor/findBy
- [ ] All tests pass before next feature
- [ ] Coverage target: > 80% for all new code

## 8. Infrastructure & Deployment

### Infrastructure Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Client Storage | 5KB per user | SessionData + history |
| Memory | <5MB additional | Calculation overhead |
| CPU | Negligible | O(1) calculations |
| Network | None | All client-side |

### Deployment Architecture
- **Build Process**: Standard Expo/React Native build pipeline
- **Testing**: Jest unit tests run in CI before build
- **Distribution**: App Store / Google Play standard deployment
- **Updates**: Over-the-air updates via Expo for non-native changes

### Monitoring & Observability

#### Metrics
- Offline session duration distribution
- Reward amounts per session
- Time cap hit frequency
- Cheat detection triggers
- Modal dismissal time

#### Logging
```typescript
const logOfflineSession = (rewards: OfflineRewards) => {
  Analytics.track('offline_session_completed', {
    duration: rewards.timeOffline,
    enemies: rewards.enemiesDefeated,
    xp: rewards.xpGained,
    pyreal: rewards.pyrealGained,
    levels: rewards.levelsGained,
    capped: rewards.breakdown.timeCapped
  });
};
```

#### Alerting
Not required for client-side feature.

## 9. Scalability & Performance

### Performance Requirements
- Response time: <500ms modal appearance
- Calculation time: <50ms for any duration
- Animation FPS: 60 FPS during number animations
- Memory usage: <5MB peak during calculation
- Battery impact: None (no background processing)

### Scalability Strategy
- Calculation complexity: O(1) regardless of offline duration
- Storage growth: Limited to 5 sessions in history
- Level range support: 1-9999 without overflow
- Time range: 1 minute to 1 year handled correctly

### Performance Optimization
```typescript
// Optimized calculation with memoization
const calculateRewards = useMemo(() => {
  // Cache XP tables
  const xpTable = generateXPTable(1, 9999);
  
  return (timeSeconds: number, state: PlayerState) => {
    // Use lookup table instead of recalculation
    const levelData = xpTable[state.level];
    // ... calculation logic
  };
}, []);

// Batch state updates
const applyRewards = async (rewards: OfflineRewards) => {
  const updates = {
    xp: state.xp + rewards.xpGained,
    pyreal: state.pyreal + rewards.pyrealGained,
    level: rewards.newLevel,
    power: rewards.newPower
  };
  
  // Single state update
  setState(prev => ({ ...prev, ...updates }));
  
  // Single storage write
  await AsyncStorage.setItem(
    STORAGE_KEYS.PLAYER_STATE,
    JSON.stringify(updates)
  );
};
```

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|---------|
| Time manipulation exploit | High | Medium | Checksum validation, caps, anomaly detection | Dev Team |
| AsyncStorage corruption | High | Low | Backup in session history, validation on load | Dev Team |
| AppState listener fails | Medium | Low | Fallback to manual save, error recovery | Dev Team |
| Animation performance issues | Low | Medium | Reduce motion option, frame dropping | Dev Team |
| Calculation errors | High | Low | Extensive unit tests, value capping | QA Team |

### Dependencies
- Power progression system must be stable ✓ (Already implemented per PRD)
- AsyncStorage available ✓ (Core React Native)
- AppState API available ✓ (Core React Native)

## 11. Implementation Plan (TDD-Driven)

Following lean principles from `/docs/guides/lean-task-generation-guide.md` - prioritize user-visible functionality:

### Phase 1: Core Offline Progression with TDD [Week 1]

#### Task 1.1: Basic Time Tracking (Day 1-2)
**TDD Cycle:**
1. Write failing tests for timestamp save/load
2. Implement minimal TimeTracker in App.tsx
3. User can close and reopen app with time tracked
4. Refactor for clean code

**Deliverable**: App tracks time between sessions

#### Task 1.2: Offline Calculation Engine (Day 2-3)
**TDD Cycle:**
1. Write failing tests for reward calculations
2. Implement OfflineCalculator service
3. Calculate XP and Pyreal based on time/power
4. Add level-up processing

**Deliverable**: Rewards calculate correctly for any duration

#### Task 1.3: Welcome Back Modal (Day 3-4)
**TDD Cycle:**
1. Write failing tests for modal display
2. Add modal to App.tsx with static rewards
3. Connect to real calculations
4. User sees and collects offline rewards

**Deliverable**: User can collect offline rewards on return

#### Task 1.4: State Persistence (Day 4-5)
**TDD Cycle:**
1. Write tests for state save/load
2. Integrate AsyncStorage for persistence
3. Apply rewards to player state
4. State persists across app restarts

**Deliverable**: Complete offline progression loop working

### Phase 2: Polish & Security [Week 2]

#### Task 2.1: Animations & Visual Polish (Day 1)
**TDD Cycle:**
1. Write tests for number animations
2. Add react-native-reanimated animations
3. Implement golden glow on collect button
4. Polish modal appearance

**Deliverable**: Polished, satisfying collection experience

#### Task 2.2: Anti-Cheat & Validation (Day 2)
**TDD Cycle:**
1. Write tests for time validation
2. Add checksum validation
3. Implement anomaly detection
4. Cap maximum rewards

**Deliverable**: Protected against common exploits

#### Task 2.3: Edge Cases & Error Handling (Day 3)
**TDD Cycle:**
1. Write tests for edge cases
2. Handle app crashes gracefully
3. Recover from corrupted storage
4. Handle timezone changes

**Deliverable**: Robust system handling all edge cases

### Phase 3: Testing & Launch [Week 3]

#### Task 3.1: Integration Testing (Day 1-2)
- Full end-to-end flow testing
- Device testing (iOS/Android)
- Performance profiling
- Accessibility testing

#### Task 3.2: Analytics & Monitoring (Day 3)
- Add analytics tracking
- Implement debug mode
- Session history viewer
- Metrics dashboard

#### Task 3.3: Launch Preparation (Day 4-5)
- Final QA pass
- Documentation
- Release notes
- App store submission

### Technical Milestones

| Milestone | Deliverable | Date | Dependencies |
|-----------|------------|------|--------------|
| M1 | Time tracking working | Oct 2 | AppState API |
| M2 | Calculations complete | Oct 4 | Power system |
| M3 | Modal collecting rewards | Oct 6 | UI components |
| M4 | Anti-cheat implemented | Oct 9 | Crypto library |
| M5 | Launch ready | Oct 12 | All tests pass |

## 12. Decision Log

### Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|---------|--------|
| Storage | AsyncStorage, MMKV, SQLite | AsyncStorage | Built-in, sufficient for needs, encrypted option available |
| Time tracking | AppState, Background tasks, Native module | AppState | Simplest, cross-platform, no battery drain |
| Animations | Animated API, Reanimated, Lottie | Reanimated 3 | Best performance, already in project |
| Security | Plain storage, Encryption, Keychain | Keychain + checksums | Balance of security and complexity |
| Calculation | Server-side, Client-side, Hybrid | Client-side | No server costs, instant results, sufficient security |

### Trade-offs
- **Client-side calculation**: Accepted exploit risk for instant gratification and no server costs
- **8-hour cap**: Chose player psychology (no FOMO) over potential longer engagement
- **25% efficiency**: Balanced to not devalue active play while providing meaningful progress
- **No background processing**: Chose battery life over real-time notifications

## 13. Open Questions

### Technical Questions Resolved
- [x] Storage encryption approach → Use react-native-keychain for sensitive data
- [x] Animation performance on low-end devices → Provide reduce motion option
- [x] Time zone handling → Always use UTC timestamps

### Remaining Questions for Product
- [ ] Should efficiency rate increase with player level? → Needs product decision
- [ ] Show each level-up or just final? → UX testing needed
- [ ] Preview earnings before close? → Consider for v2
- [ ] Different efficiency for XP vs Pyreal? → Keep simple for MVP

## 14. Appendices

### A. Technical Glossary
- **AppState**: React Native API for monitoring app lifecycle
- **AsyncStorage**: Persistent key-value storage system
- **Checksum**: Hash value for data integrity verification
- **Efficiency Rate**: Percentage of active rewards earned offline (25%)
- **Time Cap**: Maximum offline duration for rewards (8 hours)

### B. Code Snippets

```typescript
// XP required for each level
const getXPForLevel = (level: number): number => {
  return level * level * 50;
};

// Power calculation
const getPowerForLevel = (level: number): number => {
  return level * 2;
};

// Format time for display
const formatOfflineTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
```

### C. Related Documents
- Product Requirements Document: `/docs/specs/offline-progression/prd_offline_progression_20250928.md`
- React Native Testing Guide: `/docs/research/react_native_testing_library_guide_20250918_184418.md`
- Lean Task Generation Guide: `/docs/guides/lean-task-generation-guide.md`
- Player Power System PRD: `/docs/specs/player-power-progression/prd_player_power_progression_20250928.md`

### D. Implementation Checklist

**Pre-Implementation:**
- [ ] Review this TDD with team
- [ ] Confirm all technical decisions
- [ ] Set up test environment
- [ ] Create test file structure

**During Implementation:**
- [ ] Follow TDD cycle for each task
- [ ] Maintain >80% test coverage
- [ ] Document any deviations
- [ ] Regular code reviews

**Post-Implementation:**
- [ ] Performance profiling complete
- [ ] Security review passed
- [ ] Accessibility audit passed
- [ ] Analytics verified

---
*Generated from PRD: /docs/specs/offline-progression/prd_offline_progression_20250928.md*
*Generation Date: 2025-09-28T20:30:00Z*
*TDD Version: 1.0*