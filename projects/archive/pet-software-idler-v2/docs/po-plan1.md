# Pet Sitting Software Tycoon - AI Agent Implementation Backlog

## Overview
This product backlog is specifically designed for AI agent implementation of the Pet Sitting Software Tycoon idle game POC. Each story includes clear acceptance criteria and technical constraints optimized for AI development.

## Priority Legend
- **P0**: Core game loop (must have for POC validation)
- **P1**: Essential features (should have for complete experience)
- **P2**: Nice to have enhancements

---

## P0: Core Game Loop Stories

### CORE-001: Basic Income Generation
**User Story**: As a player, I want to click a button to generate money so that I can start building my software company.

**Acceptance Criteria**:
- [ ] Clicking "Generate Income" button adds $10 to the player's balance
- [ ] Money value updates immediately in the UI
- [ ] Click event is properly debounced (max 10 clicks/second)
- [ ] Money display shows currency format (e.g., $1,234.56)

**Technical Notes for AI**:
- Implement using simple event listener
- Store money as float with 2 decimal precision
- Use requestAnimationFrame for UI updates
- No server-side validation needed for POC

**Dependencies**: None

---

### CORE-002: Money Display and Persistence
**User Story**: As a player, I want to see my current money balance persistently so that I know my progress.

**Acceptance Criteria**:
- [ ] Money balance displays prominently on main dashboard
- [ ] Balance persists in localStorage
- [ ] Balance restores on page reload
- [ ] Format large numbers with abbreviations (e.g., $1.2M)

**Technical Notes for AI**:
- Use localStorage with key "petSittingTycoon_money"
- Implement number formatting utility function
- Handle edge cases (negative values, NaN)

**Dependencies**: CORE-001

---

### CORE-003: First Developer Hire
**User Story**: As a player, I want to hire a Junior Developer so that I can generate Development Points automatically.

**Acceptance Criteria**:
- [ ] "Hire Junior Developer" button visible when player has $100
- [ ] Hiring costs $100 and deducts from balance
- [ ] Junior Developer generates 1 DP every 2 seconds
- [ ] Display current number of Junior Developers hired
- [ ] DP generation continues when tab is inactive

**Technical Notes for AI**:
- Use setInterval for DP generation
- Implement offline progress calculation using timestamps
- Store developer count in localStorage
- Max 10 Junior Developers for POC

**Dependencies**: CORE-001, CORE-002

---

### CORE-004: Development Points System
**User Story**: As a player, I want to see and use Development Points so that I can create new features.

**Acceptance Criteria**:
- [ ] DP displays on main dashboard
- [ ] DP accumulates from hired developers
- [ ] Manual "Code Feature" button generates 1 DP per click
- [ ] DP persists in localStorage
- [ ] Cannot go negative

**Technical Notes for AI**:
- Similar implementation to money system
- Float with 1 decimal precision
- Shared utility functions for persistence

**Dependencies**: CORE-003

---

### CORE-005: First Feature Development
**User Story**: As a player, I want to develop my first software feature so that I can increase revenue and customer satisfaction.

**Acceptance Criteria**:
- [ ] "Research Basic Scheduling" button appears when player has 10 DP and $50
- [ ] Costs 10 DP and $50 to unlock
- [ ] Increases passive income by $1/second
- [ ] Increases Customer Satisfaction by 10%
- [ ] Shows completion notification
- [ ] Feature marked as "unlocked" permanently

**Technical Notes for AI**:
- Implement feature registry system
- Each feature has: id, name, dpCost, moneyCost, incomeBoost, satisfactionBoost
- Store unlocked features array in localStorage

**Dependencies**: CORE-002, CORE-004

---

### CORE-006: Customer Base Growth
**User Story**: As a player, I want to see my customer base grow so that I understand my company's reach.

**Acceptance Criteria**:
- [ ] Customer count starts at 10
- [ ] Displays on main dashboard
- [ ] Grows by 1 customer per 5 seconds at 50% satisfaction
- [ ] Growth rate doubles at 75% satisfaction
- [ ] Growth rate triples at 90% satisfaction
- [ ] Persists in localStorage

**Technical Notes for AI**:
- Implement growth rate calculation function
- Use same interval system as DP generation
- Integer values only

**Dependencies**: CORE-005

---

### CORE-007: Customer Satisfaction Mechanic
**User Story**: As a player, I want to manage customer satisfaction so that my customer base grows faster.

**Acceptance Criteria**:
- [ ] Satisfaction starts at 50%
- [ ] Decreases by 1% every 10 seconds if no new features
- [ ] Cannot go below 20% or above 100%
- [ ] Visual indicator (color coding: red < 40%, yellow 40-70%, green > 70%)
- [ ] Persists in localStorage

**Technical Notes for AI**:
- Implement satisfaction decay timer
- Reset decay timer on feature unlock
- Use CSS classes for color coding

**Dependencies**: CORE-005, CORE-006

---

### CORE-008: Passive Income System
**User Story**: As a player, I want to earn money automatically from customers so that I can progress while idle.

**Acceptance Criteria**:
- [ ] Base income = $0.10 per customer per second
- [ ] Income multiplied by unlocked features count
- [ ] Updates money balance automatically
- [ ] Shows income rate on dashboard (e.g., "+$12.50/sec")
- [ ] Calculates offline earnings on return

**Technical Notes for AI**:
- Combine with existing money update loop
- Calculate offline earnings using timestamp diff
- Cap offline earnings at 2 hours

**Dependencies**: CORE-002, CORE-006

---

## P1: Essential Features

### FEAT-001: Additional Software Features
**User Story**: As a player, I want to unlock more software features so that I can further increase revenue and satisfaction.

**Acceptance Criteria**:
- [ ] Add "Simple Client Portal" (20 DP, $200, +$2/sec income, +15% satisfaction)
- [ ] Add "Basic Payment System" (40 DP, $500, +$5/sec income, +20% satisfaction)
- [ ] Features unlock in sequence
- [ ] Each shows lock/unlock status

**Technical Notes for AI**:
- Extend feature registry from CORE-005
- Implement prerequisite system
- Show progress bars for locked features

**Dependencies**: CORE-005

---

### FEAT-002: Bug Risk Management
**User Story**: As a player, I want to manage bug risk so that I can prevent customer satisfaction drops.

**Acceptance Criteria**:
- [ ] Bug Risk meter increases by 5% with each feature unlock
- [ ] "Fix Bugs" button costs 5 DP, resets risk to 0%
- [ ] At 100% risk, satisfaction drops by 20% instantly
- [ ] Visual warning at > 80% risk
- [ ] Meter displayed prominently

**Technical Notes for AI**:
- Implement risk accumulation system
- Trigger satisfaction penalty at threshold
- Use CSS animations for warnings

**Dependencies**: CORE-005, CORE-007

---

### FEAT-003: Server Upgrades
**User Story**: As a player, I want to upgrade servers so that all my operations run more efficiently.

**Acceptance Criteria**:
- [ ] "Upgrade Servers" button in Operations tab
- [ ] Level 1: $500, +25% to all income and DP generation
- [ ] Level 2: $2000, +50% total (not cumulative)
- [ ] Level 3: $10000, +100% total
- [ ] Shows current level and next upgrade cost

**Technical Notes for AI**:
- Implement multiplier system
- Apply to all generation rates
- Store upgrade level in localStorage

**Dependencies**: CORE-003, CORE-008

---

### FEAT-004: Delight Score System
**User Story**: As a player, I want to see my Delight Score increase so that I can track my ultimate progress.

**Acceptance Criteria**:
- [ ] Delight Score starts at 0
- [ ] Displays with star emoji (✨) on dashboard
- [ ] Increases by 10 when satisfaction stays above 90% for 60 seconds
- [ ] Increases by 50 when unlocking all features
- [ ] Shows celebration animation on increase

**Technical Notes for AI**:
- Implement event-based scoring system
- Track satisfaction duration with timestamp
- Use CSS keyframes for animations

**Dependencies**: CORE-007, FEAT-001

---

### FEAT-005: Achievement Notifications
**User Story**: As a player, I want to see notifications for important events so that I feel rewarded for progress.

**Acceptance Criteria**:
- [ ] Toast notifications appear for: feature unlocked, delight event, milestone reached
- [ ] Auto-dismiss after 5 seconds
- [ ] Stack up to 3 notifications
- [ ] Include relevant emoji and color coding
- [ ] Click to dismiss

**Technical Notes for AI**:
- Implement notification queue system
- Use CSS transitions for smooth animations
- Position fixed at top-right

**Dependencies**: CORE-005, FEAT-004

---

## P2: Nice to Have Enhancements

### ENHANCE-001: Statistics Dashboard
**User Story**: As a player, I want to view detailed statistics so that I can optimize my strategy.

**Acceptance Criteria**:
- [ ] New "Stats" tab shows: total clicks, total earnings, time played, features unlocked
- [ ] Updates in real-time
- [ ] Persists all stats in localStorage
- [ ] Clean tabular layout

**Technical Notes for AI**:
- Extend persistence system for new stats
- Calculate time played from first launch
- Use CSS Grid for layout

**Dependencies**: All P0 stories

---

### ENHANCE-002: Visual Progress Bars
**User Story**: As a player, I want to see visual progress bars so that I can track timed events easily.

**Acceptance Criteria**:
- [ ] DP generation shows progress bar fill
- [ ] Feature research shows completion percentage
- [ ] Customer growth shows time to next customer
- [ ] Smooth animations

**Technical Notes for AI**:
- Use CSS width transitions
- Calculate percentages based on timers
- Sync with actual game timers

**Dependencies**: CORE-003, CORE-005, CORE-006

---

### ENHANCE-003: Auto-Save Indicator
**User Story**: As a player, I want to see when the game saves so that I know my progress is secure.

**Acceptance Criteria**:
- [ ] Small "Saving..." indicator appears every 10 seconds
- [ ] Changes to "Saved!" for 2 seconds
- [ ] Fades in/out smoothly
- [ ] Positioned unobtrusively

**Technical Notes for AI**:
- Tie to existing localStorage saves
- Use CSS opacity transitions
- Debounce rapid saves

**Dependencies**: CORE-002

---

### ENHANCE-004: Number Format Settings
**User Story**: As a player, I want to choose number display format so that I can view values in my preferred way.

**Acceptance Criteria**:
- [ ] Settings button opens modal
- [ ] Toggle between: Scientific (1.23e6), Abbreviated (1.23M), Full (1,234,567)
- [ ] Setting persists
- [ ] Applies to all number displays

**Technical Notes for AI**:
- Create formatting utility with modes
- Store preference in localStorage
- Update all number displays

**Dependencies**: CORE-002

---

### ENHANCE-005: Reset Game Function
**User Story**: As a player, I want to reset my game so that I can start fresh if desired.

**Acceptance Criteria**:
- [ ] "Reset Game" button in settings
- [ ] Confirmation dialog with warning
- [ ] Clears all localStorage data
- [ ] Refreshes page after reset
- [ ] Cannot be undone

**Technical Notes for AI**:
- List all localStorage keys to clear
- Use native confirm() for simplicity
- Add 3-second cooldown after click

**Dependencies**: All stories

---

## Technical Architecture Notes for AI Agents

### File Structure
```
/projects/pet-sitting/
├── index.html          # Main game interface
├── styles.css          # All styling
├── game.js            # Core game logic
├── utils.js           # Utility functions
└── constants.js       # Game configuration
```

### Key Systems to Implement
1. **Game Loop**: Single requestAnimationFrame loop for all updates
2. **Persistence**: Centralized save/load system
3. **Event System**: For achievements and notifications
4. **State Management**: Single source of truth object

### Testing Approach
- Each story should have console.log statements for debugging
- Implement developer console commands for testing (e.g., addMoney(1000))
- Save state snapshots for regression testing

### Performance Constraints
- Target 60 FPS for animations
- Limit DOM updates to changed values only
- Batch localStorage writes (max once per second)
- Support browsers from last 2 years

---

## Definition of Done for AI Agents
1. Feature works as described in acceptance criteria
2. No console errors during normal gameplay
3. Data persists correctly across page reloads
4. UI updates smoothly without flicker
5. Code includes inline comments explaining logic
6. Manual testing confirms all criteria met