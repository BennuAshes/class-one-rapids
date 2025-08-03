# Pet Software Idler - Product Backlog (POC)

## Core Gameplay Foundation

### Story 1: Basic Code Production
**As a** player  
**I want** to click a button to write code  
**So that** I can start producing my first resource and feel immediate engagement

**Acceptance Criteria:**
- Clicking "Write Code" button produces +1 Line of Code
- Code counter displays current total lines
- Visual feedback (animation/sound) on each click
- Counter updates immediately (< 50ms response)

### Story 2: First Automation - Junior Developer
**As a** player  
**I want** to hire my first Junior Developer  
**So that** I can automate code production and experience the idle mechanic

**Acceptance Criteria:**
- "Hire Junior Dev" button appears after 5 manual clicks
- Junior Dev costs 10 Lines of Code
- Produces 0.1 lines/second automatically
- Visual representation of dev working (sprite animation)
- Production rate clearly displayed

### Story 3: Feature Shipping System
**As a** player  
**I want** to convert lines of code into shippable features  
**So that** I can generate revenue and progress in the game

**Acceptance Criteria:**
- "Ship Feature" button appears after hiring first dev
- Converts 10 Lines of Code → $15
- Money counter appears and updates on first sale
- Visual/audio feedback on successful ship
- Clear indication of conversion rate

## Department Systems

### Story 4: Sales Department Unlock
**As a** player  
**I want** to unlock the Sales department  
**So that** I can expand my business and create more complex revenue streams

**Acceptance Criteria:**
- Sales department unlocks at $500 total earned
- Visual expansion of office space when unlocked
- First Sales Rep costs $100
- Sales Reps generate Customer Leads (0.2/sec)
- Lead counter appears in UI

### Story 5: Lead-to-Revenue Conversion
**As a** player  
**I want** to convert customer leads and features into sales  
**So that** I can earn more revenue than raw feature shipping

**Acceptance Criteria:**
- 1 Lead + 1 Basic Feature = $50 revenue
- Automatic matching of leads to features
- Clear visual indication of conversion happening
- Revenue rate display shows improvement over basic shipping

### Story 6: Development Team Scaling
**As a** player  
**I want** to hire different tiers of developers  
**So that** I can scale my code production efficiently

**Acceptance Criteria:**
- Junior Dev: 0.1 lines/sec ($10 base)
- Mid Dev: 0.5 lines/sec ($100 base)
- Senior Dev: 2.5 lines/sec ($1,000 base)
- Cost scaling formula: Base * 1.15^owned
- Visual distinction between developer tiers

## Economy & Progression

### Story 7: Dynamic Cost Scaling
**As a** player  
**I want** costs to scale with my purchases  
**So that** the game maintains challenge and strategic decision-making

**Acceptance Criteria:**
- All unit costs follow formula: Base * 1.15^owned
- Costs update immediately on purchase
- Next purchase cost always visible
- Costs displayed with appropriate formatting (K, M, B)

### Story 8: Save System
**As a** player  
**I want** my progress to be saved automatically  
**So that** I can return to the game without losing progress

**Acceptance Criteria:**
- Auto-save every 30 seconds
- Save to browser local storage
- Save includes all currencies, units, and unlock states
- Visual indication when save occurs
- Manual save button available

### Story 9: Offline Progress
**As a** player  
**I want** to earn progress while offline  
**So that** I'm rewarded for returning to the game

**Acceptance Criteria:**
- Calculate production during offline time
- Show offline earnings summary on return
- Cap offline progress at 12 hours
- Accurate calculation based on automation levels

## User Experience & Polish

### Story 10: Achievement System
**As a** player  
**I want** to unlock achievements for reaching milestones  
**So that** I have goals to work toward and feel accomplishment

**Acceptance Criteria:**
- Track key milestones (first hire, $1K earned, 100 features shipped, etc.)
- Visual notification when achievement unlocked
- Achievement list viewable in UI
- At least 10 achievements for POC
- Persistent achievement state in saves

### Story 11: Visual Feedback System
**As a** player  
**I want** satisfying visual feedback for my actions  
**So that** the game feels responsive and rewarding

**Acceptance Criteria:**
- Number popups for resource gains (+1, +10, +100)
- Particle effects for major milestones
- Smooth progress bar animations
- Screen shake for big numbers
- All animations complete in < 1 second

### Story 12: Audio Feedback
**As a** player  
**I want** audio cues for different actions  
**So that** I get multisensory feedback and the game feels polished

**Acceptance Criteria:**
- Unique sounds for: code writing, money earning, unit purchasing
- Volume scales inversely with frequency
- No sound repetition within 0.5 seconds
- Mute button available
- Sounds don't overlap jarringly

## Advanced Features (POC Validation)

### Story 13: Department Synergies
**As a** player  
**I want** departments to work together  
**So that** I can discover optimal strategies and feel clever

**Acceptance Criteria:**
- Sales leads + Dev features = Enhanced revenue
- Visual indication of department connections
- Synergy multipliers displayed in UI
- At least 2 department types interact

### Story 14: Prestige System Preview
**As a** player  
**I want** to see hints about the prestige system  
**So that** I understand there's more depth beyond the initial loop

**Acceptance Criteria:**
- "Investor Interest" meter appears at $10K
- Tooltip explains future prestige benefits
- Visual tease of prestige currency
- No actual prestige in POC, just the promise

### Story 15: Performance Optimization
**As a** player  
**I want** the game to run smoothly  
**So that** I can enjoy uninterrupted gameplay

**Acceptance Criteria:**
- Maintain 60 FPS on 5-year-old devices
- No memory leaks over 1-hour session
- Efficient number formatting for large values
- Smooth animations even with many units

## POC Success Validation

### Story 16: Core Loop Validation
**As a** player  
**I want** to understand the full game loop within 5 minutes  
**So that** I'm engaged and want to continue playing

**Acceptance Criteria:**
- Can hire first automation within 30 seconds
- Unlock second department within 3 minutes
- See clear progression path
- No tutorial needed - mechanics are self-evident
- Generate at least $10K within 10 minutes of active play

---

## Prioritization Notes

**Must Have for POC:**
- Stories 1-3 (Core clicking and first automation)
- Stories 7-9 (Economy and persistence)
- Story 11 (Visual feedback)
- Story 16 (Loop validation)

**Should Have for POC:**
- Stories 4-6 (Department expansion)
- Story 10 (Achievements)
- Story 12 (Audio)

**Nice to Have for POC:**
- Stories 13-15 (Advanced features and optimization)

**Out of Scope for POC:**
- Full prestige implementation
- All 7 departments
- Monetization
- Platform/API features
- Conference events
- Mobile optimization