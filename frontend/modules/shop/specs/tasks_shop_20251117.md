# Task List: Shop System Feature
**Generated From:** tdd_shop_20251117.md
**Date:** 2025-11-17
**Status:** Ready for Execution
**Methodology:** Test-Driven Development (TDD)

---

## Overview

This task list breaks down the implementation of the Shop System feature into atomic, agent-executable tasks following TDD methodology. Each task is clearly defined with specific file paths, code requirements, and dependencies.

**Key Principles:**
1. Write test first, then implement
2. Each task is atomic and independently testable
3. Tasks build upon each other sequentially
4. All tests must pass using cmd.exe as per project guidelines

---

## Phase 1: Navigation Setup

### Task 1.1: Update App.tsx - Add Navigation State Management
**Status:** Pending
**Priority:** HIGH
**Dependencies:** None
**Estimated Time:** 15 minutes

**Objective:** Add navigation state management to App.tsx to support switching between main screen and shop screen.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/App.tsx`

**Implementation Details:**
1. Import `useState` from React (if not already imported)
2. Import `ShopScreen` from './modules/shop/ShopScreen'
3. Define `Screen` type: `type Screen = 'main' | 'shop';`
4. Add state: `const [currentScreen, setCurrentScreen] = useState<Screen>('main');`
5. Update JSX to conditionally render screens:
   ```typescript
   {currentScreen === 'main' ? (
     <AttackButtonScreen onNavigateToShop={() => setCurrentScreen('shop')} />
   ) : (
     <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
   )}
   ```
6. Ensure SafeAreaProvider wraps the conditional rendering

**Acceptance Criteria:**
- [ ] Type `Screen` defined correctly
- [ ] Navigation state managed with useState
- [ ] Conditional rendering based on currentScreen
- [ ] TypeScript compiles without errors (will fail until ShopScreen exists)

---

### Task 1.2: Write Tests for AttackButtonScreen - Shop Navigation
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.1
**Estimated Time:** 15 minutes

**Objective:** Write tests for shop navigation button on AttackButtonScreen before implementation.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('shop navigation', () => { ... })`
2. Create mock navigation function: `const mockNavigateToShop = jest.fn();`
3. Write tests:
   - Test: 'renders shop button'
   - Test: 'calls onNavigateToShop when shop button pressed'
   - Test: 'shop button has correct accessibility label'
   - Test: 'shop button meets minimum touch target size (44x44)'

**Test Code Reference:**
```typescript
describe('shop navigation', () => {
  test('renders shop button', () => {
    const mockNavigateToShop = jest.fn();
    const { getByText } = render(
      <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
    );

    expect(getByText('Shop')).toBeTruthy();
  });

  test('calls onNavigateToShop when shop button pressed', () => {
    const mockNavigateToShop = jest.fn();
    const { getByText } = render(
      <AttackButtonScreen onNavigateToShop={mockNavigateToShop} />
    );

    const shopButton = getByText('Shop');
    fireEvent.press(shopButton);

    expect(mockNavigateToShop).toHaveBeenCalledTimes(1);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Navigation callback tested
- [ ] Accessibility tested
- [ ] Touch target size verified

---

### Task 1.3: Implement AttackButtonScreen - Add Shop Navigation Button
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.2
**Estimated Time:** 20 minutes

**Objective:** Add shop navigation button to AttackButtonScreen to pass tests from Task 1.2.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/attack-button/AttackButtonScreen.tsx`

**Implementation Details:**
1. Update component props interface:
   ```typescript
   interface AttackButtonScreenProps {
     onNavigateToShop: () => void;
   }

   export const AttackButtonScreen = observer(({ onNavigateToShop }: AttackButtonScreenProps) => {
     // ... existing code
   });
   ```
2. Add shop button in JSX (after scrap display, before feed button):
   ```typescript
   <Pressable
     onPress={onNavigateToShop}
     accessibilityRole="button"
     accessibilityLabel="Shop"
     accessibilityHint="Tap to browse and purchase upgrades"
     style={({ pressed }) => [
       styles.shopButton,
       pressed && styles.buttonPressed,
     ]}
   >
     <Text style={styles.shopButtonText}>Shop</Text>
   </Pressable>
   ```
3. Add styles to StyleSheet:
   ```typescript
   shopButton: {
     minWidth: 44,
     minHeight: 44,
     paddingHorizontal: 24,
     paddingVertical: 12,
     backgroundColor: '#34C759',
     borderRadius: 8,
     marginBottom: 12,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   shopButtonText: {
     fontSize: 16,
     color: '#FFFFFF',
     fontWeight: '600',
   },
   ```

**Acceptance Criteria:**
- [ ] Tests from Task 1.2 pass
- [ ] Shop button renders correctly
- [ ] onNavigateToShop callback works
- [ ] Button styling matches design specs
- [ ] Accessibility props present

---

## Phase 2: Shop Header Implementation

### Task 2.1: Write Tests for ShopScreen - Header Rendering
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 1.3
**Estimated Time:** 20 minutes

**Objective:** Write tests for shop header rendering before implementing ShopScreen.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Create test file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`
2. Import necessary testing utilities from '@testing-library/react-native'
3. Import gameStore functions for state management in tests
4. Create mock navigation function: `const mockNavigateBack = jest.fn();`
5. Add `beforeEach` hook to reset game state and clear mocks
6. Write test suite: `describe('ShopScreen', () => { ... })`
7. Add nested suite: `describe('header rendering', () => { ... })`
8. Write tests:
   - Test: 'renders shop title'
   - Test: 'renders back button'
   - Test: 'renders scrap balance in header'
   - Test: 'calls onNavigateBack when back button pressed'
   - Test: 'scrap balance updates reactively'

**Test Code Reference:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';

describe('ShopScreen', () => {
  const mockNavigateBack = jest.fn();

  beforeEach(() => {
    resetGameState();
    mockNavigateBack.mockClear();
  });

  describe('header rendering', () => {
    test('renders shop title', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('Shop')).toBeTruthy();
    });

    test('renders back button', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('← Back')).toBeTruthy();
    });

    test('renders scrap balance in header', () => {
      gameState$.scrap.set(500);
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      expect(screen.getByText('500')).toBeTruthy();
    });

    test('calls onNavigateBack when back button pressed', () => {
      render(<ShopScreen onNavigateBack={mockNavigateBack} />);
      const backButton = screen.getByText('← Back');
      fireEvent.press(backButton);
      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Test file compiles with TypeScript
- [ ] Header scenarios covered
- [ ] Navigation callback tested

---

### Task 2.2: Implement ShopScreen - Basic Structure and Header
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.1
**Estimated Time:** 30 minutes

**Objective:** Implement basic ShopScreen component with header to pass tests from Task 2.1.

**File to Create:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Create file at `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`
2. Import necessary dependencies:
   ```typescript
   import React from 'react';
   import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
   import { SafeAreaView } from 'react-native-safe-area-context';
   import { observer } from '@legendapp/state/react';
   import { useGameState } from '../../shared/hooks/useGameState';
   import { Upgrade } from '../../shared/types/game';
   ```
3. Define props interface:
   ```typescript
   interface ShopScreenProps {
     onNavigateBack: () => void;
   }
   ```
4. Create component wrapped with observer:
   ```typescript
   export const ShopScreen = observer(({ onNavigateBack }: ShopScreenProps) => {
     const { scrap$, upgrades$, purchasedUpgrades$ } = useGameState();
     const scrap = scrap$.get();

     // Component implementation
   });
   ```
5. Implement header JSX:
   ```typescript
   <SafeAreaView style={styles.container}>
     <View style={styles.header}>
       <Pressable
         onPress={onNavigateBack}
         accessibilityRole="button"
         accessibilityLabel="Back to main screen"
         style={({ pressed }) => [
           styles.backButton,
           pressed && styles.backButtonPressed,
         ]}
       >
         <Text style={styles.backButtonText}>← Back</Text>
       </Pressable>

       <Text style={styles.title}>Shop</Text>

       <View style={styles.scrapContainer}>
         <Text style={styles.scrapLabel}>Scrap:</Text>
         <Text style={styles.scrapValue}>{scrap}</Text>
       </View>
     </View>

     <ScrollView style={styles.scrollView}>
       {/* Content will be added in next phase */}
     </ScrollView>
   </SafeAreaView>
   ```
6. Create initial StyleSheet with header styles (see TDD document section 3.6)

**Acceptance Criteria:**
- [ ] Tests from Task 2.1 pass
- [ ] Component renders without errors
- [ ] Header displays correctly
- [ ] Back button functional
- [ ] Scrap display reactive

---

## Phase 3: Empty State and Upgrade List

### Task 3.1: Write Tests for ShopScreen - Empty State
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 2.2
**Estimated Time:** 15 minutes

**Objective:** Write tests for empty state display when no upgrades available.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('empty state', () => { ... })`
2. Write tests:
   - Test: 'displays empty state when no upgrades available'
   - Test: 'shows helpful message in empty state'
   - Test: 'does not display empty state when upgrades exist'

**Test Code Reference:**
```typescript
describe('empty state', () => {
  test('displays empty state when no upgrades available', () => {
    gameState$.upgrades.set([]);
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('No upgrades available yet.')).toBeTruthy();
    expect(screen.getByText('Check back soon for new upgrades!')).toBeTruthy();
  });

  test('does not display empty state when upgrades exist', () => {
    const mockUpgrade: Upgrade = {
      id: 'test-1',
      name: 'Test Upgrade',
      description: 'A test upgrade',
      scrapCost: 100,
      effectType: 'scrapMultiplier',
      effectValue: 2,
    };

    gameState$.upgrades.set([mockUpgrade]);
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.queryByText('No upgrades available yet.')).toBeNull();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Empty state scenarios covered
- [ ] Conditional rendering tested

---

### Task 3.2: Implement ShopScreen - Empty State Component
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.1
**Estimated Time:** 15 minutes

**Objective:** Implement empty state subcomponent to pass tests from Task 3.1.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Create EmptyState subcomponent:
   ```typescript
   const EmptyState: React.FC = () => (
     <View style={styles.emptyState}>
       <Text style={styles.emptyStateTitle}>
         No upgrades available yet.
       </Text>
       <Text style={styles.emptyStateSubtitle}>
         Check back soon for new upgrades!
       </Text>
     </View>
   );
   ```
2. Update ScrollView content to conditionally render:
   ```typescript
   <ScrollView
     style={styles.scrollView}
     contentContainerStyle={styles.scrollContent}
   >
     {upgrades.length === 0 ? (
       <EmptyState />
     ) : (
       // Upgrade list will be added in next task
       <View />
     )}
   </ScrollView>
   ```
3. Add empty state styles to StyleSheet (see TDD document section 3.4)

**Acceptance Criteria:**
- [ ] Tests from Task 3.1 pass
- [ ] Empty state displays when no upgrades
- [ ] Conditional rendering works correctly
- [ ] Styling matches design specs

---

### Task 3.3: Write Tests for ShopScreen - Upgrade Card Rendering
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.2
**Estimated Time:** 25 minutes

**Objective:** Write tests for rendering upgrade cards.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Create mock upgrade data at top of test file:
   ```typescript
   const mockUpgrade: Upgrade = {
     id: 'test-upgrade-1',
     name: 'Test Upgrade',
     description: 'A test upgrade',
     scrapCost: 100,
     effectType: 'scrapMultiplier',
     effectValue: 2,
   };
   ```
2. Add nested suite: `describe('upgrade card rendering', () => { ... })`
3. Write tests:
   - Test: 'renders upgrade name'
   - Test: 'renders upgrade description'
   - Test: 'renders upgrade cost'
   - Test: 'renders upgrade effect (scrapMultiplier)'
   - Test: 'renders upgrade effect (petBonus)'
   - Test: 'renders multiple upgrade cards'
   - Test: 'each upgrade card has unique key'

**Test Code Reference:**
```typescript
describe('upgrade card rendering', () => {
  test('renders upgrade name, description, and cost', () => {
    gameState$.upgrades.set([mockUpgrade]);
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Test Upgrade')).toBeTruthy();
    expect(screen.getByText('A test upgrade')).toBeTruthy();
    expect(screen.getByText('Cost: 100 scrap')).toBeTruthy();
  });

  test('renders upgrade effect for scrapMultiplier', () => {
    gameState$.upgrades.set([mockUpgrade]);
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText(/Scrap Multiplier x2/)).toBeTruthy();
  });

  test('renders multiple upgrade cards', () => {
    const upgrade1: Upgrade = { ...mockUpgrade, id: 'up1', name: 'Upgrade 1' };
    const upgrade2: Upgrade = { ...mockUpgrade, id: 'up2', name: 'Upgrade 2' };

    gameState$.upgrades.set([upgrade1, upgrade2]);
    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Upgrade 1')).toBeTruthy();
    expect(screen.getByText('Upgrade 2')).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All upgrade data fields tested
- [ ] Multiple upgrades tested
- [ ] Effect display tested

---

### Task 3.4: Implement ShopScreen - UpgradeCard Component
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.3
**Estimated Time:** 35 minutes

**Objective:** Implement UpgradeCard subcomponent to pass tests from Task 3.3.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Define UpgradeCard props interface:
   ```typescript
   interface UpgradeCardProps {
     upgrade: Upgrade;
     isOwned: boolean;
     canPurchase: boolean;
     onPurchase: () => void;
     buttonLabel: string;
   }
   ```
2. Create UpgradeCard subcomponent (see TDD document section 3.5):
   ```typescript
   const UpgradeCard: React.FC<UpgradeCardProps> = ({
     upgrade,
     isOwned,
     canPurchase,
     onPurchase,
     buttonLabel,
   }) => {
     const cardOpacity = isOwned ? 0.6 : 1;

     return (
       <View style={[styles.card, { opacity: cardOpacity }]}>
         <Text style={styles.upgradeName}>{upgrade.name}</Text>
         <Text style={styles.upgradeDescription}>{upgrade.description}</Text>

         <View style={styles.effectContainer}>
           <Text style={styles.effectLabel}>
             Effect: {upgrade.effectType === 'scrapMultiplier'
               ? `Scrap Multiplier x${upgrade.effectValue}`
               : `Pet Bonus +${upgrade.effectValue}`
             }
           </Text>
         </View>

         <View style={styles.costContainer}>
           <Text style={styles.costLabel}>
             Cost: {upgrade.scrapCost} scrap
           </Text>
         </View>

         {/* Purchase button will be implemented in next phase */}
         <View />
       </View>
     );
   };
   ```
3. Update ScrollView to render UpgradeCards:
   ```typescript
   {upgrades.length === 0 ? (
     <EmptyState />
   ) : (
     upgrades.map((upgrade) => (
       <UpgradeCard
         key={upgrade.id}
         upgrade={upgrade}
         isOwned={false} // Will implement logic in next phase
         canPurchase={false} // Will implement logic in next phase
         onPurchase={() => {}} // Will implement in next phase
         buttonLabel="Buy" // Will implement logic in next phase
       />
     ))
   )}
   ```
4. Add upgrade card styles to StyleSheet (see TDD document section 3.6)
5. Add placeholder helper functions at top of component:
   ```typescript
   const isOwned = (upgradeId: string): boolean => false;
   const canPurchase = (upgrade: Upgrade): boolean => false;
   const handlePurchase = (upgrade: Upgrade): void => {};
   const getButtonLabel = (upgrade: Upgrade): string => 'Buy';
   ```

**Acceptance Criteria:**
- [ ] Tests from Task 3.3 pass
- [ ] Upgrade cards render correctly
- [ ] All data fields display
- [ ] Effect type logic works
- [ ] Multiple cards render
- [ ] Styling matches design specs

---

## Phase 4: Purchase Logic

### Task 4.1: Write Tests for ShopScreen - Purchase Button States
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 3.4
**Estimated Time:** 25 minutes

**Objective:** Write tests for purchase button states (available, insufficient scrap, owned).

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('purchase button states', () => { ... })`
2. Write tests:
   - Test: 'shows "Buy" button when scrap is sufficient and not owned'
   - Test: 'shows "Not enough scrap" when scrap is insufficient'
   - Test: 'shows "Owned" when upgrade already purchased'
   - Test: 'button is enabled when can purchase'
   - Test: 'button is disabled when insufficient scrap'
   - Test: 'button is disabled when already owned'

**Test Code Reference:**
```typescript
describe('purchase button states', () => {
  test('shows "Buy" button when scrap is sufficient and not owned', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Buy')).toBeTruthy();
  });

  test('shows "Not enough scrap" when scrap is insufficient', () => {
    gameState$.scrap.set(50);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Not enough scrap')).toBeTruthy();
  });

  test('shows "Owned" when upgrade already purchased', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set(['test-upgrade-1']);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Owned')).toBeTruthy();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] All button states tested
- [ ] Disabled states verified
- [ ] Labels tested

---

### Task 4.2: Implement ShopScreen - Helper Functions for Purchase Logic
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.1
**Estimated Time:** 20 minutes

**Objective:** Implement helper functions for purchase logic to pass button state tests.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Update helper functions in component (see TDD document section 3.3):
   ```typescript
   const { scrap$, upgrades$, purchasedUpgrades$ } = useGameState();
   const scrap = scrap$.get();
   const upgrades = upgrades$.get();
   const purchasedUpgrades = purchasedUpgrades$.get();

   const isOwned = (upgradeId: string): boolean => {
     return purchasedUpgrades.includes(upgradeId);
   };

   const canPurchase = (upgrade: Upgrade): boolean => {
     return !isOwned(upgrade.id) && scrap >= upgrade.scrapCost;
   };

   const getButtonLabel = (upgrade: Upgrade): string => {
     if (isOwned(upgrade.id)) {
       return 'Owned';
     }
     if (scrap < upgrade.scrapCost) {
       return 'Not enough scrap';
     }
     return 'Buy';
   };

   // handlePurchase will be implemented in next task
   const handlePurchase = (upgrade: Upgrade): void => {};
   ```
2. Update UpgradeCard mapping to use real logic:
   ```typescript
   upgrades.map((upgrade) => (
     <UpgradeCard
       key={upgrade.id}
       upgrade={upgrade}
       isOwned={isOwned(upgrade.id)}
       canPurchase={canPurchase(upgrade)}
       onPurchase={() => handlePurchase(upgrade)}
       buttonLabel={getButtonLabel(upgrade)}
     />
   ))
   ```

**Acceptance Criteria:**
- [ ] Tests from Task 4.1 pass
- [ ] isOwned function works correctly
- [ ] canPurchase function works correctly
- [ ] getButtonLabel function returns correct labels
- [ ] Button states reflect game state

---

### Task 4.3: Implement ShopScreen - Purchase Button with States
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.2
**Estimated Time:** 25 minutes

**Objective:** Implement purchase button with all states in UpgradeCard component.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Update UpgradeCard component to include purchase button (see TDD document section 3.5):
   ```typescript
   <Pressable
     onPress={onPurchase}
     disabled={!canPurchase}
     accessibilityRole="button"
     accessibilityLabel={`Buy ${upgrade.name} for ${upgrade.scrapCost} scrap`}
     accessibilityHint={canPurchase ? 'Double tap to purchase' : undefined}
     accessibilityState={{ disabled: !canPurchase }}
     style={({ pressed }) => [
       styles.purchaseButton,
       isOwned && styles.purchaseButtonOwned,
       !canPurchase && !isOwned && styles.purchaseButtonDisabled,
       pressed && canPurchase && styles.purchaseButtonPressed,
     ]}
   >
     <Text
       style={[
         styles.purchaseButtonText,
         isOwned && styles.purchaseButtonTextOwned,
         !canPurchase && !isOwned && styles.purchaseButtonTextDisabled,
       ]}
     >
       {buttonLabel}
     </Text>
   </Pressable>
   ```
2. Add purchase button styles to StyleSheet (see TDD document section 3.6)

**Acceptance Criteria:**
- [ ] Purchase button renders in all states
- [ ] Button disabled when appropriate
- [ ] Visual states reflect functionality
- [ ] Accessibility props correct
- [ ] Styling matches design specs

---

### Task 4.4: Write Tests for ShopScreen - Purchase Flow
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.3
**Estimated Time:** 30 minutes

**Objective:** Write tests for actual purchase functionality.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('purchase flow', () => { ... })`
2. Write tests:
   - Test: 'deducts scrap when purchase button pressed'
   - Test: 'adds upgrade to purchasedUpgrades when purchased'
   - Test: 'updates button to "Owned" after purchase'
   - Test: 'allows purchase when scrap equals cost'
   - Test: 'prevents double purchase of same upgrade'
   - Test: 'handles multiple different purchases correctly'
   - Test: 'does not purchase when button is disabled'

**Test Code Reference:**
```typescript
describe('purchase flow', () => {
  test('deducts scrap when purchase button pressed', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);

    expect(gameState$.scrap.get()).toBe(100);
  });

  test('adds upgrade to purchasedUpgrades when purchased', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);

    expect(gameState$.purchasedUpgrades.get()).toContain('test-upgrade-1');
  });

  test('prevents double purchase', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);
    fireEvent.press(buyButton); // Try to buy again

    expect(gameState$.purchasedUpgrades.get().length).toBe(1);
    expect(gameState$.scrap.get()).toBe(100); // Not 0
  });

  test('allows purchase when scrap equals cost', () => {
    gameState$.scrap.set(100);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);

    expect(gameState$.scrap.get()).toBe(0);
    expect(gameState$.purchasedUpgrades.get()).toContain('test-upgrade-1');
  });
});
```

**Acceptance Criteria:**
- [ ] Tests written but fail (expected - TDD red phase)
- [ ] Purchase scenarios covered
- [ ] Edge cases tested
- [ ] Validation scenarios tested

---

### Task 4.5: Implement ShopScreen - Purchase Handler Function
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.4
**Estimated Time:** 20 minutes

**Objective:** Implement handlePurchase function to pass tests from Task 4.4.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Implement handlePurchase function (see TDD document section 3.3):
   ```typescript
   const handlePurchase = (upgrade: Upgrade): void => {
     // Validation
     if (isOwned(upgrade.id)) {
       console.warn('Upgrade already owned:', upgrade.id);
       return;
     }

     if (scrap < upgrade.scrapCost) {
       console.warn('Insufficient scrap for upgrade:', upgrade.id);
       return;
     }

     // Execute purchase
     scrap$.set((prev) => prev - upgrade.scrapCost);
     purchasedUpgrades$.set((prev) => [...prev, upgrade.id]);
   };
   ```

**Acceptance Criteria:**
- [ ] Tests from Task 4.4 pass
- [ ] Scrap deducted correctly
- [ ] purchasedUpgrades updated correctly
- [ ] Validation prevents invalid purchases
- [ ] Double purchase prevented
- [ ] Functional updates used for state changes

---

### Task 4.6: Write Tests for ShopScreen - Reactive Updates
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.5
**Estimated Time:** 15 minutes

**Objective:** Write tests for reactive UI updates during purchases.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('reactive updates', () => { ... })`
2. Write tests:
   - Test: 'scrap display updates when scrap changes'
   - Test: 'button state updates immediately after purchase'
   - Test: 'button label changes from "Buy" to "Owned" after purchase'
   - Test: 'updates from external state changes (e.g., scrap from main screen)'

**Test Code Reference:**
```typescript
describe('reactive updates', () => {
  test('scrap display updates when scrap changes', () => {
    gameState$.scrap.set(100);
    const { rerender } = render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('100')).toBeTruthy();

    gameState$.scrap.set(200);
    rerender(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('200')).toBeTruthy();
  });

  test('button label changes from "Buy" to "Owned" after purchase', () => {
    gameState$.scrap.set(200);
    gameState$.upgrades.set([mockUpgrade]);
    gameState$.purchasedUpgrades.set([]);

    render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    expect(screen.getByText('Buy')).toBeTruthy();

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);

    expect(screen.getByText('Owned')).toBeTruthy();
    expect(screen.queryByText('Buy')).toBeNull();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests pass (implementation already reactive due to observer)
- [ ] Reactive behavior verified
- [ ] UI updates immediately
- [ ] External state changes reflected

---

## Phase 5: Testing and Polish

### Task 5.1: Write Tests for ShopScreen - Accessibility
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 4.6
**Estimated Time:** 20 minutes

**Objective:** Write tests for accessibility attributes.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.test.tsx`

**Implementation Details:**
1. Add nested suite: `describe('accessibility', () => { ... })`
2. Write tests:
   - Test: 'back button has correct accessibility attributes'
   - Test: 'purchase button has correct accessibility label'
   - Test: 'purchase button accessibility state reflects disabled state'
   - Test: 'scrap display has accessibility role'
   - Test: 'shop title has accessibility role'

**Test Code Reference:**
```typescript
describe('accessibility', () => {
  test('back button has correct accessibility attributes', () => {
    const { getByLabelText } = render(
      <ShopScreen onNavigateBack={mockNavigateBack} />
    );

    const backButton = getByLabelText('Back to main screen');
    expect(backButton).toBeTruthy();
    expect(backButton.props.accessibilityRole).toBe('button');
  });

  test('purchase button accessibility state reflects disabled state', () => {
    gameState$.scrap.set(50); // Insufficient
    gameState$.upgrades.set([mockUpgrade]);

    const { getByText } = render(<ShopScreen onNavigateBack={mockNavigateBack} />);

    const button = getByText('Not enough scrap');
    expect(button.parent.props.accessibilityState.disabled).toBe(true);
  });
});
```

**Acceptance Criteria:**
- [ ] All accessibility attributes tested
- [ ] WCAG compliance verified
- [ ] Screen reader compatibility ensured

---

### Task 5.2: Run All Tests via cmd.exe
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.1
**Estimated Time:** 10 minutes

**Objective:** Execute all tests using cmd.exe to verify everything passes.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids && npm test -- ShopScreen.test.tsx"
```

**Expected Results:**
- All test suites pass
- No failing tests
- Coverage meets minimum requirements:
  - ShopScreen.tsx: ≥ 90%

**Acceptance Criteria:**
- [ ] All tests pass in cmd.exe
- [ ] Coverage thresholds met
- [ ] No console errors or warnings
- [ ] Test execution time reasonable

---

### Task 5.3: Generate Coverage Report for Shop Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.2
**Estimated Time:** 5 minutes

**Objective:** Generate and review test coverage report for shop module.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids && npm run test:coverage -- ShopScreen.test.tsx"
```

**Review:**
1. Check coverage percentage for ShopScreen.tsx
2. Identify any uncovered lines
3. Verify coverage meets target: ≥ 90%

**Acceptance Criteria:**
- [ ] Coverage report generated
- [ ] Coverage ≥ 90% for ShopScreen
- [ ] No critical uncovered code paths

---

## Phase 6: Manual Testing & Verification

### Task 6.1: Manual Testing - Shop Navigation
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 5.3
**Estimated Time:** 10 minutes

**Objective:** Manually test navigation between main screen and shop.

**Test Scenarios:**
1. **Navigate to Shop:**
   - Launch app
   - Click "Shop" button on main screen
   - Verify shop screen displays
   - Verify header shows correct elements

2. **Navigate Back:**
   - Click "← Back" button in shop
   - Verify return to main screen
   - Verify main screen state preserved

3. **Multiple Navigations:**
   - Navigate to shop and back 5 times
   - Verify no issues or state corruption

**Acceptance Criteria:**
- [ ] Navigation works smoothly
- [ ] No visual glitches during transitions
- [ ] State preserved during navigation
- [ ] No console errors

---

### Task 6.2: Manual Testing - Purchase Flow
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 6.1
**Estimated Time:** 15 minutes

**Objective:** Manually test the purchase flow with various scenarios.

**Test Scenarios:**
1. **Successful Purchase:**
   - Ensure sufficient scrap
   - Navigate to shop
   - Click "Buy" on an upgrade
   - Verify scrap deducted
   - Verify button shows "Owned"
   - Verify cannot purchase again

2. **Insufficient Scrap:**
   - Set scrap to less than upgrade cost (via main screen)
   - Navigate to shop
   - Verify button shows "Not enough scrap"
   - Verify button is disabled
   - Verify clicking does nothing

3. **Multiple Purchases:**
   - Ensure sufficient scrap for multiple upgrades
   - Purchase 3 different upgrades
   - Verify all scrap deductions correct
   - Verify all show "Owned"

4. **Persistence:**
   - Purchase an upgrade
   - Close app completely
   - Reopen app
   - Navigate to shop
   - Verify upgrade still shows "Owned"
   - Verify scrap balance persisted

**Acceptance Criteria:**
- [ ] All purchase scenarios work correctly
- [ ] Button states accurate
- [ ] Scrap deductions correct
- [ ] Purchases persist across restarts

---

### Task 6.3: Manual Testing - Edge Cases
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.2
**Estimated Time:** 10 minutes

**Objective:** Test edge cases and boundary conditions.

**Test Scenarios:**
1. **Exact Scrap Amount:**
   - Set scrap to exactly match upgrade cost
   - Purchase upgrade
   - Verify scrap goes to 0
   - Verify purchase succeeds

2. **Empty Upgrades List:**
   - Set upgrades array to empty (via developer tools or code)
   - Navigate to shop
   - Verify empty state displays
   - Verify no errors

3. **Scrap Accumulation During Shop:**
   - Navigate to shop
   - Keep shop open
   - Verify scrap balance updates if scrap increases from background timer
   - Verify button states update reactively

**Acceptance Criteria:**
- [ ] Edge cases handled gracefully
- [ ] No crashes or errors
- [ ] UI updates correctly
- [ ] Boundary conditions work

---

### Task 6.4: Manual Testing - Accessibility
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.3
**Estimated Time:** 15 minutes

**Objective:** Test accessibility with screen readers.

**Test Scenarios:**
1. **Screen Reader Navigation:**
   - Enable screen reader (VoiceOver/TalkBack)
   - Navigate through shop elements
   - Verify all elements announced correctly
   - Verify button states announced
   - Verify scrap balance announced

2. **Touch Targets:**
   - Verify all buttons meet 44x44pt minimum
   - Verify buttons easy to tap
   - Verify no accidental presses

**Acceptance Criteria:**
- [ ] Screen reader announces all elements
- [ ] Button states properly communicated
- [ ] Touch targets adequate
- [ ] WCAG 2.1 AA compliant

---

## Phase 7: Documentation & Finalization

### Task 7.1: Add JSDoc Comments to ShopScreen
**Status:** Pending
**Priority:** MEDIUM
**Dependencies:** Task 6.4
**Estimated Time:** 20 minutes

**Objective:** Add comprehensive JSDoc comments to ShopScreen component and functions.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Implementation Details:**
1. Add JSDoc to main component:
   ```typescript
   /**
    * ShopScreen component displays the upgrade shop interface.
    *
    * Allows players to browse and purchase upgrades using scrap currency.
    * Integrates with gameState$ observable for reactive state management.
    *
    * @param onNavigateBack - Callback to return to main screen
    *
    * @example
    * ```typescript
    * <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
    * ```
    */
   export const ShopScreen = observer(({ onNavigateBack }: ShopScreenProps) => {
   ```
2. Add JSDoc to helper functions:
   ```typescript
   /**
    * Checks if an upgrade has been purchased.
    * @param upgradeId - The ID of the upgrade to check
    * @returns True if the upgrade is owned
    */
   const isOwned = (upgradeId: string): boolean => {
   ```
3. Add JSDoc to subcomponents
4. Document props interfaces

**Acceptance Criteria:**
- [ ] All public APIs documented
- [ ] Helper functions documented
- [ ] Usage examples provided
- [ ] Props interfaces documented

---

### Task 7.2: Add Inline Comments for Complex Logic
**Status:** Pending
**Priority:** LOW
**Dependencies:** Task 7.1
**Estimated Time:** 10 minutes

**Objective:** Add inline comments to explain complex or non-obvious logic.

**File to Modify:** `/mnt/c/dev/class-one-rapids/frontend/modules/shop/ShopScreen.tsx`

**Areas to Comment:**
1. Purchase validation logic
2. Button state determination
3. Effect type display logic
4. Conditional rendering logic

**Acceptance Criteria:**
- [ ] Complex logic has explanatory comments
- [ ] Comments explain "why" not just "what"
- [ ] Code is readable and maintainable

---

### Task 7.3: Final TypeScript Compilation Check
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.2
**Estimated Time:** 5 minutes

**Objective:** Verify TypeScript compilation is error-free.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids && npx tsc --noEmit"
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] No type warnings
- [ ] All imports resolve correctly

---

### Task 7.4: Final Test Run - All Tests
**Status:** Pending
**Priority:** HIGH
**Dependencies:** Task 7.3
**Estimated Time:** 5 minutes

**Objective:** Run all tests one final time to ensure everything still passes.

**Commands to Execute:**
```bash
cmd.exe /c "cd /mnt/c/dev/class-one-rapids && npm test -- --coverage"
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage meets all targets
- [ ] No flaky tests
- [ ] Test suite runs cleanly

---

## Summary

### Total Tasks: 35

**By Phase:**
- Phase 1 (Navigation Setup): 3 tasks
- Phase 2 (Shop Header): 2 tasks
- Phase 3 (Empty State & Upgrade List): 4 tasks
- Phase 4 (Purchase Logic): 6 tasks
- Phase 5 (Testing & Polish): 3 tasks
- Phase 6 (Manual Testing): 4 tasks
- Phase 7 (Documentation): 4 tasks

**By Priority:**
- HIGH: 26 tasks
- MEDIUM: 7 tasks
- LOW: 2 tasks

**Estimated Total Time:** 7-9 hours

### Key Success Metrics

1. **Functionality:**
   - ✓ Shop button navigates to shop screen
   - ✓ Back button returns to main screen
   - ✓ Upgrades display correctly
   - ✓ Purchase flow works correctly
   - ✓ Purchases persist across restarts

2. **Testing:**
   - ✓ All tests pass in cmd.exe
   - ✓ Coverage ≥ 90% for ShopScreen
   - ✓ No console errors

3. **Quality:**
   - ✓ TypeScript compiles without errors
   - ✓ WCAG 2.1 AA compliant
   - ✓ Code properly documented

4. **User Experience:**
   - ✓ Navigation smooth
   - ✓ Button states clear
   - ✓ Visual feedback on interactions
   - ✓ Empty state helpful

### Dependencies Graph

```
Task 1.1 (App Navigation State)
    ↓
Task 1.2 (AttackButtonScreen Tests - Shop Nav)
    ↓
Task 1.3 (AttackButtonScreen - Shop Button)
    ↓
Task 2.1 (ShopScreen Tests - Header)
    ↓
Task 2.2 (ShopScreen - Header Implementation)
    ↓
Task 3.1 (ShopScreen Tests - Empty State)
    ↓
Task 3.2 (ShopScreen - Empty State)
    ↓
Task 3.3 (ShopScreen Tests - Upgrade Cards)
    ↓
Task 3.4 (ShopScreen - Upgrade Card Component)
    ↓
Task 4.1 (ShopScreen Tests - Button States)
    ↓
Task 4.2 (ShopScreen - Helper Functions)
    ↓
Task 4.3 (ShopScreen - Purchase Button)
    ↓
Task 4.4 (ShopScreen Tests - Purchase Flow)
    ↓
Task 4.5 (ShopScreen - Purchase Handler)
    ↓
Task 4.6 (ShopScreen Tests - Reactive Updates)
    ↓
Task 5.1 (ShopScreen Tests - Accessibility)
    ↓
Task 5.2 (Run Tests)
    ↓
Task 5.3 (Coverage Report)
    ↓
Task 6.1 (Manual Testing - Navigation)
    ↓
Task 6.2 (Manual Testing - Purchase Flow)
    ↓
Task 6.3 (Manual Testing - Edge Cases)
    ↓
Task 6.4 (Manual Testing - Accessibility)
    ↓
Task 7.1 (JSDoc Comments)
    ↓
Task 7.2 (Inline Comments)
    ↓
Task 7.3 (TypeScript Check)
    ↓
Task 7.4 (Final Test Run)
```

### Notes for Execution

1. **TDD Workflow:**
   - Always write tests before implementation
   - Run tests after each implementation task
   - Expect tests to fail initially (red phase)
   - Implement minimal code to pass tests (green phase)
   - Refactor if needed (refactor phase)

2. **Testing with cmd.exe:**
   - Per project guidelines, always use cmd.exe to run Jest tests
   - Format: `cmd.exe /c "cd /mnt/c/dev/class-one-rapids && npm test"`
   - This avoids WSL/Windows slowness issues

3. **Hook Testing:**
   - Per project guidelines, test hooks through components
   - Don't create standalone hook tests
   - Integration tests are preferred

4. **File Paths:**
   - All file paths are absolute
   - Base path: `/mnt/c/dev/class-one-rapids/frontend/`
   - Ensure correct directory structure

5. **TypeScript:**
   - All code must be TypeScript
   - Strict type checking
   - No `any` types unless absolutely necessary

6. **State Management:**
   - Use Legend State observables
   - Prefer functional updates for safety
   - Wrap components with `observer` HOC

7. **Error Handling:**
   - Validate purchases before executing
   - Log warnings for invalid operations
   - Graceful degradation

8. **Accessibility:**
   - All interactive elements need accessibility props
   - Meet WCAG 2.1 AA standards
   - Test with screen readers when possible

9. **Integration with Existing Code:**
   - Shop integrates with existing gameStore
   - Uses existing types from shared/types/game.ts
   - Uses existing persistence layer
   - No changes needed to core state management

---

**Ready for Execution:** This task list can be executed sequentially by an agent or developer. Each task is atomic, well-defined, and includes specific acceptance criteria.
