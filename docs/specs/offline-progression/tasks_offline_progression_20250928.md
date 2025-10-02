# Offline Progression System Implementation Tasks

## Document Metadata
- **Source TDD**: `/docs/specs/offline-progression/tdd_offline_progression_20250928.md`
- **Generated**: 2025-09-28T21:00:00Z
- **Total Tasks**: 15 executable tasks
- **Architecture Reference**: `/docs/architecture/organizing_expo_apps_by_feature_20250921_113000.md`

## Implementation Status Check

### Existing Components Found
- **[PARTIAL]** `frontend/App.tsx` - Contains Power system, XP, AsyncStorage integration
- **[PARTIAL]** `frontend/App.test.tsx` - Has tests for power progression
- **[MISSING]** Modular architecture - No `src/modules/` structure yet
- **[MISSING]** Offline progression features - Not implemented
- **[MISSING]** AppState lifecycle tracking - Not implemented

---

## Phase 1: First User-Visible Feature - Offline Time Tracking
*Duration: 2 days | Priority: P0 | Prerequisites: None*

**LEAN PRINCIPLE**: First task delivers immediate user value - app tracks time away and shows it on return.

### Task 1.1: Implement Basic Time Tracking with Welcome Message
**ROLE**: You are a senior React Native developer implementing the first user-visible offline feature

**CONTEXT**: The app currently has a power progression system in `frontend/App.tsx` with AsyncStorage for saving state. Per the TDD, we need to track when users leave and return to show them their time away.

**OBJECTIVE**: Create time tracking that shows "Welcome back! You were away for X minutes" when user returns

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test First
```typescript
// frontend/App.test.tsx - ADD this test
import { AppState } from 'react-native';

test('tracks time when app goes to background and shows on return', async () => {
  const { getByText } = render(<App />);
  
  // Simulate app going to background
  const mockTime = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(mockTime);
  AppState.currentState = 'background';
  
  // Simulate 5 minutes passing
  jest.spyOn(Date, 'now').mockReturnValue(mockTime + 300000);
  AppState.currentState = 'active';
  
  // Should show welcome back message
  await waitFor(() => {
    expect(getByText(/Welcome back.*5 minutes/)).toBeTruthy();
  });
});
```

#### Step 2: Minimal Implementation in App.tsx
1. Import AppState from 'react-native'
2. Add state: `const [timeAway, setTimeAway] = useState<number>(0);`
3. Add AppState listener in useEffect:
```typescript
useEffect(() => {
  let lastBackgroundTime: number | null = null;
  
  const subscription = AppState.addEventListener('change', nextAppState => {
    if (nextAppState === 'background') {
      lastBackgroundTime = Date.now();
      AsyncStorage.setItem('@last_close_time', lastBackgroundTime.toString());
    } else if (nextAppState === 'active' && lastBackgroundTime) {
      const timeAwayMs = Date.now() - lastBackgroundTime;
      setTimeAway(Math.floor(timeAwayMs / 60000)); // Convert to minutes
    }
  });
  
  // Check for previous session on mount
  AsyncStorage.getItem('@last_close_time').then(time => {
    if (time) {
      const timeAwayMs = Date.now() - parseInt(time);
      setTimeAway(Math.floor(timeAwayMs / 60000));
    }
  });
  
  return () => subscription.remove();
}, []);
```
4. Add simple UI to show time away:
```typescript
{timeAway > 0 && (
  <Text style={styles.welcomeText}>
    Welcome back! You were away for {timeAway} minutes
  </Text>
)}
```

**ACCEPTANCE CRITERIA**:
- [ ] Test for time tracking written and initially fails
- [ ] AppState listener tracks background/active transitions  
- [ ] Time away calculated and displayed on return
- [ ] Message shows for returns after 1+ minutes away
- [ ] Time persists across app restarts via AsyncStorage
- [ ] All existing tests still pass

**DELIVERABLE**: User sees how long they were away when returning to the app

**DEPENDENCIES**: None - uses existing AsyncStorage setup
**COMPLEXITY**: Low
**FILES TO MODIFY**: `frontend/App.tsx`, `frontend/App.test.tsx`

---

### Task 1.2: Calculate and Display Offline Rewards
**ROLE**: You are implementing the core offline progression calculations

**CONTEXT**: With time tracking working, now calculate XP and Pyreal earned while away based on the TDD formula

**OBJECTIVE**: Show actual rewards earned during offline time

**TDD IMPLEMENTATION**:

#### Step 1: Write Failing Test for Calculations
```typescript
// frontend/App.test.tsx - ADD this test
test('calculates offline rewards based on power and time', () => {
  const playerState = { power: 10, xp: 100, pyreal: 50 };
  const minutesOffline = 60; // 1 hour
  
  // Formula from TDD: enemies = (power * 2) * (minutes / 60) * 0.25
  // Expected: (10 * 2) * 1 * 0.25 = 5 enemies
  // XP: 5 * 2.5 = 12.5, Pyreal: ~5-25 (random)
  
  const rewards = calculateOfflineRewards(minutesOffline, playerState);
  
  expect(rewards.enemiesDefeated).toBe(5);
  expect(rewards.xpGained).toBe(12.5);
  expect(rewards.pyrealGained).toBeGreaterThan(0);
});
```

#### Step 2: Implement Calculation Function
Add to App.tsx:
```typescript
const calculateOfflineRewards = (minutesOffline: number, state: any) => {
  // Cap at 8 hours (480 minutes)
  const cappedMinutes = Math.min(minutesOffline, 480);
  
  // Only calculate if offline for 1+ minutes
  if (cappedMinutes < 1) return null;
  
  const efficiency = 0.25;
  const enemiesDefeated = Math.floor(
    (state.power * 2) * (cappedMinutes / 60) * efficiency
  );
  
  const xpGained = enemiesDefeated * 2.5;
  const pyrealGained = enemiesDefeated * (Math.random() * 4 + 1) * efficiency;
  
  return {
    timeOffline: cappedMinutes,
    enemiesDefeated,
    xpGained: Math.floor(xpGained),
    pyrealGained: Math.floor(pyrealGained)
  };
};
```

#### Step 3: Display Rewards
Replace simple welcome text with rewards display:
```typescript
{offlineRewards && (
  <View style={styles.rewardsContainer}>
    <Text style={styles.welcomeTitle}>Welcome Back!</Text>
    <Text>You were away for {formatTime(offlineRewards.timeOffline)}</Text>
    <Text>Enemies Defeated: {offlineRewards.enemiesDefeated}</Text>
    <Text>XP Gained: +{offlineRewards.xpGained}</Text>
    <Text>Pyreal Earned: +{offlineRewards.pyrealGained}</Text>
    <TouchableOpacity onPress={collectRewards}>
      <Text>Tap to Collect</Text>
    </TouchableOpacity>
  </View>
)}
```

**ACCEPTANCE CRITERIA**:
- [ ] Calculation test written and initially fails
- [ ] Rewards calculate correctly using TDD formula
- [ ] 8-hour cap applied to offline time
- [ ] Minimum 1 minute required for rewards
- [ ] Rewards display with tap to collect
- [ ] Player stats update when collected

**DELIVERABLE**: User sees and can collect specific rewards earned while away

**DEPENDENCIES**: Task 1.1 (time tracking)
**COMPLEXITY**: Medium
**FILES TO MODIFY**: `frontend/App.tsx`, `frontend/App.test.tsx`

---

## Phase 2: Modular Architecture Migration
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 1*

**LEAN PRINCIPLE**: Create structure only when extracting working features.

### Task 2.1: Extract Offline Progression Module
**ROLE**: You are refactoring working code into modular architecture

**CONTEXT**: Offline progression is working in App.tsx. Now extract it following the feature-based architecture.

**OBJECTIVE**: Create offline-progression module with proper structure

**IMPLEMENTATION STEPS**:

1. **Create module structure** (feature has <10 items, use flat structure):
```bash
mkdir -p frontend/src/modules/offline-progression
```

2. **Extract and test TimeTracker service**:
```typescript
// frontend/src/modules/offline-progression/timeTrackerService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const STORAGE_KEY = '@last_close_time';

export class TimeTrackerService {
  private lastBackgroundTime: number | null = null;
  private subscription: any = null;

  startTracking(onResume: (minutesAway: number) => void) {
    this.subscription = AppState.addEventListener('change', 
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          this.saveTimestamp();
        } else if (nextAppState === 'active') {
          this.calculateTimeAway().then(onResume);
        }
      }
    );
    
    // Check previous session
    this.calculateTimeAway().then(onResume);
  }

  async saveTimestamp() {
    const now = Date.now();
    this.lastBackgroundTime = now;
    await AsyncStorage.setItem(STORAGE_KEY, now.toString());
  }

  async calculateTimeAway(): Promise<number> {
    const savedTime = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      const timeAwayMs = Date.now() - parseInt(savedTime);
      return Math.floor(timeAwayMs / 60000); // minutes
    }
    return 0;
  }

  stopTracking() {
    this.subscription?.remove();
  }
}
```

3. **Co-located test file**:
```typescript
// frontend/src/modules/offline-progression/timeTrackerService.test.ts
import { TimeTrackerService } from './timeTrackerService';
// Tests from Task 1.1
```

4. **Extract calculator**:
```typescript
// frontend/src/modules/offline-progression/offlineCalculator.ts
export interface PlayerState {
  power: number;
  xp: number;
  pyreal: number;
  level: number;
}

export interface OfflineRewards {
  timeOffline: number;
  enemiesDefeated: number;
  xpGained: number;
  pyrealGained: number;
}

export const calculateOfflineRewards = (
  minutesOffline: number, 
  state: PlayerState
): OfflineRewards | null => {
  // Implementation from Task 1.2
};
```

5. **Create WelcomeBackModal component**:
```typescript
// frontend/src/modules/offline-progression/WelcomeBackModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { OfflineRewards } from './offlineCalculator';

export interface WelcomeBackModalProps {
  rewards: OfflineRewards | null;
  isVisible: boolean;
  onCollect: () => void;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  rewards,
  isVisible,
  onCollect
}) => {
  if (!rewards || !isVisible) return null;
  
  return (
    <Modal transparent animationType="fade">
      {/* Implementation from Task 1.2 */}
    </Modal>
  );
};
```

6. **Update App.tsx to use module**:
```typescript
import { TimeTrackerService } from './src/modules/offline-progression/timeTrackerService';
import { calculateOfflineRewards } from './src/modules/offline-progression/offlineCalculator';
import { WelcomeBackModal } from './src/modules/offline-progression/WelcomeBackModal';
```

**ACCEPTANCE CRITERIA**:
- [ ] Module folder structure created
- [ ] TimeTracker service extracted with tests
- [ ] Calculator extracted with tests  
- [ ] Modal component extracted with tests
- [ ] App.tsx uses module imports
- [ ] All tests pass in new structure

**DELIVERABLE**: Clean modular architecture with separated concerns

**DEPENDENCIES**: Tasks 1.1, 1.2 must be working
**COMPLEXITY**: Medium
**FILES CREATED**: 
- `frontend/src/modules/offline-progression/timeTrackerService.ts`
- `frontend/src/modules/offline-progression/timeTrackerService.test.ts`
- `frontend/src/modules/offline-progression/offlineCalculator.ts`
- `frontend/src/modules/offline-progression/offlineCalculator.test.ts`
- `frontend/src/modules/offline-progression/WelcomeBackModal.tsx`
- `frontend/src/modules/offline-progression/WelcomeBackModal.test.tsx`
- `frontend/src/modules/offline-progression/types.ts`

---

## Phase 3: Enhanced Modal & Animations
*Duration: 2 days | Priority: P1 | Prerequisites: Phase 2*

### Task 3.1: Implement Modal with Proper Styling
**ROLE**: You are creating a polished UI for the offline rewards modal

**CONTEXT**: Basic modal exists, needs proper styling per TDD specifications

**OBJECTIVE**: Create visually appealing modal with 70% backdrop, golden glow button

**TDD IMPLEMENTATION**:

#### Step 1: Write Visual Test
```typescript
test('modal has correct visual properties', () => {
  const { getByTestId } = render(
    <WelcomeBackModal 
      rewards={mockRewards} 
      isVisible={true}
      onCollect={jest.fn()}
    />
  );
  
  const backdrop = getByTestId('modal-backdrop');
  expect(backdrop.props.style.opacity).toBe(0.7);
  
  const collectButton = getByTestId('collect-button');
  expect(collectButton.props.style.backgroundColor).toBe('#FFD700');
});
```

#### Step 2: Implement Styling

**VISUAL REQUIREMENTS**:
```yaml
visual_requirements:
  component_name: "WelcomeBackModal"
  
  modal:
    backdrop_opacity: 0.7
    backdrop_color: "#000000"
    animation_type: "fade"
    animation_duration: "300ms"
    
  container:
    background_color: "#1a1a2e"
    border_radius: "20px"
    padding: "24px"
    width: "90%"
    max_width: "400px"
    shadow:
      color: "#000000"
      offset: { width: 0, height: 4 }
      opacity: 0.3
      radius: 8
      
  title:
    font_size: "28px"
    font_weight: "bold"
    color: "#FFD700"
    text_align: "center"
    margin_bottom: "16px"
    
  collect_button:
    background_color: "#FFD700"
    padding: "16px 32px"
    border_radius: "12px"
    min_width: "200px"
    animation:
      type: "pulse"
      duration: "2000ms"
      iterations: "infinite"
      
  text_colors:
    primary: "#FFFFFF"
    secondary: "#B8B8B8"
    accent: "#FFD700"
    
  accessibility:
    min_touch_target: "44x44px"
    contrast_ratio: "4.5:1"
    focusable: true
```

**ACCEPTANCE CRITERIA**:
- [ ] Visual test for styling written
- [ ] 70% black backdrop opacity
- [ ] Golden glow (#FFD700) on collect button
- [ ] Smooth fade animation on appear
- [ ] Proper spacing and typography
- [ ] Accessible touch targets (44x44 minimum)

**DELIVERABLE**: Professional looking modal matching game aesthetic

**DEPENDENCIES**: Task 2.1
**COMPLEXITY**: Low
**FILES TO MODIFY**: 
- `frontend/src/modules/offline-progression/WelcomeBackModal.tsx`
- `frontend/src/modules/offline-progression/WelcomeBackModal.test.tsx`

---

### Task 3.2: Add Number Animation to Rewards
**ROLE**: You are implementing animated number counting

**CONTEXT**: Modal shows static numbers, needs animation from 0 to final value over 1.5 seconds

**OBJECTIVE**: Implement smooth number animations using react-native-reanimated

**TDD IMPLEMENTATION**:

#### Step 1: Test Animation Values
```typescript
test('animates reward numbers from 0 to final value', () => {
  const rewards = { xpGained: 100, pyrealGained: 50 };
  const { getByTestId } = render(
    <WelcomeBackModal rewards={rewards} isVisible={true} />
  );
  
  // Initially should show 0
  const xpText = getByTestId('xp-animated');
  expect(xpText.props.children).toBe('0');
  
  // After animation completes (1.5 seconds)
  jest.advanceTimersByTime(1500);
  expect(xpText.props.children).toBe('100');
});
```

#### Step 2: Install and Implement Reanimated
```bash
npm install react-native-reanimated@3
```

```typescript
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue
} from 'react-native-reanimated';

const AnimatedNumber = ({ value, duration = 1500 }) => {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value]);
  
  const animatedText = useDerivedValue(() => {
    return Math.floor(animatedValue.value).toString();
  });
  
  return (
    <AnimatedText text={animatedText} />
  );
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Animation test written
- [ ] react-native-reanimated installed
- [ ] Numbers animate from 0 over 1.5 seconds
- [ ] Smooth 60 FPS animation
- [ ] All reward numbers animated

**DELIVERABLE**: Satisfying animated number counting effect

**DEPENDENCIES**: Task 3.1
**COMPLEXITY**: Medium
**FILES TO MODIFY**: 
- `frontend/package.json`
- `frontend/src/modules/offline-progression/WelcomeBackModal.tsx`

---

## Phase 4: Security & Edge Cases
*Duration: 1 day | Priority: P0 | Prerequisites: Phase 3*

### Task 4.1: Implement Time Validation & Anti-Cheat
**ROLE**: You are implementing security measures to prevent exploitation

**CONTEXT**: System needs protection against time manipulation

**OBJECTIVE**: Add validation, checksums, and reward caps

**TDD IMPLEMENTATION**:

#### Step 1: Test Security Measures
```typescript
test('rejects negative time differences', async () => {
  const futureTime = Date.now() + 3600000;
  await AsyncStorage.setItem('@last_close_time', futureTime.toString());
  
  const rewards = calculateOfflineRewards(-60, playerState);
  expect(rewards).toBeNull();
});

test('caps rewards at maximum values', () => {
  const playerState = { power: 9999, xp: 0, pyreal: 0 };
  const rewards = calculateOfflineRewards(9999, playerState);
  
  expect(rewards.xpGained).toBeLessThanOrEqual(10000);
  expect(rewards.pyrealGained).toBeLessThanOrEqual(50000);
});

test('validates timestamp integrity with checksum', async () => {
  const timestamp = Date.now();
  const tamperedData = { timestamp, checksum: 'invalid' };
  
  await AsyncStorage.setItem('@last_close_time', JSON.stringify(tamperedData));
  const isValid = await validateTimestamp();
  
  expect(isValid).toBe(false);
});
```

#### Step 2: Implement Security Features

1. **Add checksum validation**:
```typescript
// frontend/src/modules/offline-progression/security.ts
import CryptoJS from 'crypto-js';

const SECRET_SALT = 'your-secret-salt'; // Move to env in production

export const createSecureTimestamp = (timestamp: number) => {
  return {
    timestamp,
    checksum: CryptoJS.SHA256(`${timestamp}:${SECRET_SALT}`).toString()
  };
};

export const validateTimestamp = (data: any): boolean => {
  if (!data?.timestamp || !data?.checksum) return false;
  
  const expected = CryptoJS.SHA256(
    `${data.timestamp}:${SECRET_SALT}`
  ).toString();
  
  return data.checksum === expected;
};
```

2. **Add reward caps**:
```typescript
const MAX_XP_PER_SESSION = 10000;
const MAX_PYREAL_PER_SESSION = 50000;

// In calculateOfflineRewards:
return {
  xpGained: Math.min(xpGained, MAX_XP_PER_SESSION),
  pyrealGained: Math.min(pyrealGained, MAX_PYREAL_PER_SESSION),
  // ...
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Tests for all security measures written
- [ ] Negative time rejected
- [ ] 8-hour cap enforced
- [ ] Maximum rewards capped
- [ ] Checksum validation implemented
- [ ] Suspicious patterns logged

**DELIVERABLE**: Secure system resistant to common exploits

**DEPENDENCIES**: Phase 3 complete
**COMPLEXITY**: High
**FILES TO CREATE**:
- `frontend/src/modules/offline-progression/security.ts`
- `frontend/src/modules/offline-progression/security.test.ts`

---

### Task 4.2: Handle Edge Cases & Error Recovery
**ROLE**: You are ensuring system robustness

**CONTEXT**: System needs to handle crashes, corrupted data, timezone changes

**OBJECTIVE**: Implement comprehensive error handling

**TDD IMPLEMENTATION**:

#### Test Edge Cases
```typescript
test('recovers from corrupted AsyncStorage data', async () => {
  await AsyncStorage.setItem('@last_close_time', 'corrupted-not-json');
  
  const tracker = new TimeTrackerService();
  const timeAway = await tracker.calculateTimeAway();
  
  expect(timeAway).toBe(0); // Should return 0, not crash
});

test('handles timezone changes correctly', async () => {
  // Save timestamp in UTC
  const utcTime = Date.now();
  await saveTimestamp(utcTime);
  
  // Change timezone (mock)
  process.env.TZ = 'America/New_York';
  
  const timeAway = await calculateTimeAway();
  expect(timeAway).toBeGreaterThanOrEqual(0); // Should still work
});
```

**IMPLEMENTATION**:
1. Add try-catch blocks around AsyncStorage operations
2. Use UTC timestamps exclusively
3. Validate data structure before parsing
4. Provide fallback values for corrupted data
5. Log errors for debugging

**ACCEPTANCE CRITERIA**:
- [ ] Tests for edge cases written
- [ ] Corrupted storage handled gracefully
- [ ] App crashes don't lose progress
- [ ] Timezone changes handled
- [ ] Network issues don't break offline calculation
- [ ] Clear error messages logged

**DELIVERABLE**: Robust system that never crashes

**DEPENDENCIES**: Task 4.1
**COMPLEXITY**: Medium

---

## Phase 5: Level-Up Integration
*Duration: 1 day | Priority: P1 | Prerequisites: Phase 4*

### Task 5.1: Process Sequential Level-Ups During Offline
**ROLE**: You are implementing level progression logic

**CONTEXT**: Players can gain enough XP offline to level up multiple times

**OBJECTIVE**: Calculate and apply level-ups with power increases

**TDD IMPLEMENTATION**:

#### Test Level-Up Processing
```typescript
test('processes multiple level-ups sequentially', () => {
  const startState = { level: 1, power: 2, xp: 90, pyreal: 100 };
  // Level 2 at 200 XP, Level 3 at 450 XP
  
  const rewards = calculateOfflineRewards(120, startState); // 2 hours
  
  expect(rewards.levelsGained).toBe(2);
  expect(rewards.newLevel).toBe(3);
  expect(rewards.newPower).toBe(6); // level * 2
});

test('updates power after each level for calculations', () => {
  // Power should increase mid-calculation affecting enemy count
  const startState = { level: 5, power: 10, xp: 1240, pyreal: 500 };
  // 10 XP to level 6, then power becomes 12
  
  const rewards = calculateWithLevelUps(60, startState);
  
  // Should calculate with power 10 until level up, then power 12
  expect(rewards.enemiesDefeated).toBeGreaterThan(
    calculateWithoutLevelUps(60, startState).enemiesDefeated
  );
});
```

**IMPLEMENTATION**:
```typescript
const processLevelUps = (currentXP: number, xpGained: number, currentLevel: number) => {
  let level = currentLevel;
  let totalXP = currentXP + xpGained;
  let levelsGained = 0;
  
  while (totalXP >= getXPForNextLevel(level)) {
    totalXP -= getXPForNextLevel(level);
    level++;
    levelsGained++;
  }
  
  return {
    newLevel: level,
    newPower: level * 2,
    levelsGained,
    remainingXP: totalXP
  };
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Test for level-up processing written
- [ ] Multiple level-ups handled correctly
- [ ] Power updates after each level
- [ ] XP carries over properly
- [ ] Level-up notifications prepared

**DELIVERABLE**: Correct level progression during offline time

**DEPENDENCIES**: Phase 4 complete
**COMPLEXITY**: High

---

## Phase 6: Polish & Optimization
*Duration: 1 day | Priority: P2 | Prerequisites: Phase 5*

### Task 6.1: Add Haptic Feedback and Sound Effects
**ROLE**: You are adding game feel improvements

**CONTEXT**: Collection should feel satisfying with haptic and audio feedback

**OBJECTIVE**: Add haptic pulse and coin sound on collection

**IMPLEMENTATION**:
```typescript
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const playCollectSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('../assets/sounds/coin-collect.mp3')
  );
  await sound.playAsync();
};

const onCollect = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await playCollectSound();
  applyRewards();
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Haptic feedback on collect button press
- [ ] Coin collection sound plays
- [ ] Can be disabled in settings
- [ ] No delay in response

**DELIVERABLE**: Satisfying collection experience

---

### Task 6.2: Performance Optimization
**ROLE**: You are optimizing performance

**CONTEXT**: Ensure modal appears within 500ms and calculations complete in <50ms

**OBJECTIVE**: Profile and optimize performance bottlenecks

**IMPLEMENTATION**:
1. Use React.memo for modal component
2. Memoize calculations with useMemo
3. Optimize animation performance
4. Profile with React DevTools
5. Add performance monitoring

```typescript
const MemoizedModal = React.memo(WelcomeBackModal);

const memoizedRewards = useMemo(
  () => calculateOfflineRewards(timeAway, playerState),
  [timeAway, playerState.power]
);
```

**ACCEPTANCE CRITERIA**:
- [ ] Modal appears in <500ms
- [ ] Calculations complete in <50ms
- [ ] Animations maintain 60 FPS
- [ ] Memory usage <5MB additional
- [ ] Performance metrics logged

**DELIVERABLE**: Optimized, smooth experience

---

## Phase 7: Analytics & Monitoring
*Duration: 0.5 days | Priority: P2 | Prerequisites: Phase 6*

### Task 7.1: Add Analytics Tracking
**ROLE**: You are implementing analytics for offline sessions

**CONTEXT**: Need to track offline progression metrics for optimization

**OBJECTIVE**: Log key metrics about offline sessions

**IMPLEMENTATION**:
```typescript
// frontend/src/modules/offline-progression/analytics.ts
export const trackOfflineSession = (rewards: OfflineRewards) => {
  // Use your analytics service (e.g., Amplitude, Mixpanel)
  Analytics.track('offline_session_completed', {
    duration_minutes: rewards.timeOffline,
    enemies_defeated: rewards.enemiesDefeated,
    xp_gained: rewards.xpGained,
    pyreal_gained: rewards.pyrealGained,
    levels_gained: rewards.levelsGained || 0,
    was_capped: rewards.timeOffline >= 480,
    timestamp: Date.now()
  });
};

export const trackCheatAttempt = (type: string, details: any) => {
  Analytics.track('possible_cheat_attempt', {
    type,
    details,
    timestamp: Date.now()
  });
};
```

**ACCEPTANCE CRITERIA**:
- [ ] Session completion tracked
- [ ] Time cap hits tracked
- [ ] Cheat attempts logged
- [ ] Performance metrics tracked
- [ ] Error events logged

**DELIVERABLE**: Complete analytics for offline progression

---

### Task 7.2: Create Debug Mode for Testing
**ROLE**: You are adding developer tools

**CONTEXT**: Need ability to test offline progression without waiting

**OBJECTIVE**: Add debug controls in development mode

**IMPLEMENTATION**:
```typescript
{__DEV__ && (
  <View style={styles.debugPanel}>
    <Text>Debug Controls</Text>
    <Button 
      title="Simulate 1 hour offline" 
      onPress={() => simulateOfflineTime(60)}
    />
    <Button 
      title="Simulate 8 hours offline" 
      onPress={() => simulateOfflineTime(480)}
    />
    <Button 
      title="Reset offline data" 
      onPress={resetOfflineData}
    />
  </View>
)}
```

**ACCEPTANCE CRITERIA**:
- [ ] Debug panel only in DEV mode
- [ ] Can simulate various offline durations
- [ ] Can reset offline state
- [ ] Can view session history
- [ ] No debug code in production

**DELIVERABLE**: Easy testing of offline features

---

## Phase 8: Documentation & Testing
*Duration: 0.5 days | Priority: P1 | Prerequisites: Phase 7*

### Task 8.1: Complete Integration Tests
**ROLE**: You are ensuring end-to-end functionality

**CONTEXT**: All features implemented, need comprehensive testing

**OBJECTIVE**: Write full integration test suite

**TEST SUITE**:
```typescript
// frontend/src/modules/offline-progression/__tests__/integration.test.tsx
describe('Offline Progression Integration', () => {
  test('complete offline flow from background to collection', async () => {
    // Full test from TDD Phase 4 Integration Tests
  });
  
  test('handles rapid app switching', async () => {
    // Test multiple background/foreground switches
  });
  
  test('persists across app restarts', async () => {
    // Test data persistence
  });
  
  test('handles all edge cases', async () => {
    // Test all edge cases identified
  });
});
```

**ACCEPTANCE CRITERIA**:
- [ ] All unit tests passing
- [ ] Integration tests complete
- [ ] Edge cases tested
- [ ] Performance benchmarks met
- [ ] >80% code coverage

**DELIVERABLE**: Fully tested offline progression system

---

### Task 8.2: Update Documentation
**ROLE**: You are documenting the system

**CONTEXT**: System complete, needs user and developer documentation

**OBJECTIVE**: Create comprehensive documentation

**DOCUMENTATION**:
1. **User Guide** (in-game help)
   - How offline progression works
   - Efficiency rates explained
   - Tips for maximizing gains

2. **Developer Documentation**
   - Architecture overview
   - API reference
   - Testing guide
   - Debugging guide

3. **README Updates**
   - Feature description
   - Setup instructions
   - Configuration options

**ACCEPTANCE CRITERIA**:
- [ ] User help text added
- [ ] Developer docs complete
- [ ] README updated
- [ ] Code comments added
- [ ] Type definitions complete

**DELIVERABLE**: Complete documentation package

---

## Summary Statistics

- **Total Tasks**: 15 executable tasks
- **Estimated Duration**: 8 days
- **Critical Path Tasks**: 1.1 → 1.2 → 2.1 → 4.1 → 5.1
- **Parallel Execution Potential**: 40% (Phase 3 & 6 tasks)
- **Test Coverage Target**: >80%
- **Risk Coverage**: All TDD risks addressed

## Task Execution Order

### Recommended Sequence:
1. **Day 1-2**: Phase 1 (Tasks 1.1, 1.2) - Get basic feature working
2. **Day 3**: Phase 2 (Task 2.1) - Refactor to modules
3. **Day 4-5**: Phase 3 (Tasks 3.1, 3.2) - Polish UI/UX
4. **Day 6**: Phase 4 (Tasks 4.1, 4.2) - Security & robustness
5. **Day 7**: Phase 5 (Task 5.1) - Level progression
6. **Day 8**: Phases 6-8 - Polish, analytics, documentation

## Implementation Notes

### For Development Team:
- Start with Task 1.1 - it delivers immediate user value
- Each task builds on the previous - don't skip ahead
- Run tests after each task to ensure nothing breaks
- Keep the 8-hour cap and 25% efficiency as constants for easy tuning
- Use feature flags if deploying incrementally

### For AI Agents:
- Execute tasks sequentially as written
- Each task has clear test-first requirements
- Validate all tests pass before moving to next task
- Report any blocking issues immediately
- Focus on minimal implementation that passes tests

---
*Generated from TDD: /docs/specs/offline-progression/tdd_offline_progression_20250928.md*
*Generation timestamp: 2025-09-28T21:00:00Z*
*Optimized for: Hybrid execution (Human developers + AI assistance)*