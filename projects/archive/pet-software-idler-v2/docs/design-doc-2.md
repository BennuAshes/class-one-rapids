# Pet Software Idler - Design Document v2
## Traditional Excellence in Idle Game Design

### Executive Summary
Pet Software Idler is a polished idle game that celebrates the joy of writing code through satisfying mechanics and exceptional feedback. By focusing on proven idle game patterns executed with meticulous attention to detail, we create an experience that feels instantly familiar yet delightfully refined. This is not about innovation - it's about crafting the most satisfying code-writing idle game possible.

### Core Design Philosophy
"Every click should feel like typing the perfect line of code. Every automation should feel like watching your tests pass. Every number going up should feel like your skills improving. We're not reinventing idle games - we're perfecting them."

---

## 1. Core Loop Design

### The Fundamental Cycle (10-15 second loop)

1. **CLICK** (0.1s) → Write a line of code
   - Immediate visual feedback: Code appears on screen with typewriter effect
   - Sound: Satisfying mechanical keyboard "clack" (randomized from 5 variations)
   - Particle effect: Small text characters float up (+1 LOC)
   - Screen shake: Subtle 2-pixel shake on click

2. **ACCUMULATE** (5-10s) → Watch numbers grow
   - Lines of Code counter ticks up smoothly (not jumpy)
   - Experience bar fills with easing curve
   - Currency (Commits) accumulates with floating +1 animations
   - Background code scrolls past creating movement

3. **PURCHASE** (2-3s) → Buy an upgrade
   - Hover preview shows exact benefit before purchase
   - Purchase button glows when affordable
   - Sound: Cash register "cha-ching" mixed with Git commit sound
   - Visual: Screen flash + particle burst from purchase button

4. **OBSERVE** (2-5s) → See the impact
   - New automation visibly working (visual indicator)
   - Production rate number updates with smooth transition
   - Achievement toast if threshold crossed
   - Satisfaction pause before next action

### Click Mechanics
- **Base Click Value**: 1 Line of Code (LOC)
- **Click Feedback Layers**:
  1. Visual: Code appears instantly (<50ms response)
  2. Audio: Keyboard sound with slight pitch variation
  3. Haptic: Controller rumble (if applicable)
  4. Numeric: +1 floats up with physics
  5. Persistent: Code stays on screen for 3 seconds before fading

### Timing Specifications
- Click response: <50ms (feels instant)
- Number increment animation: 200ms ease-out
- Purchase animation: 300ms with bounce
- Achievement toast: 500ms slide-in, 2s display, 300ms slide-out
- Automation tick rate: Every 1000ms exactly (creates rhythm)

---

## 2. First 5 Minutes Experience Design

### Minute 0-1: The Hook
**Goal**: Get player clicking and understanding core value proposition

0:00 - Game loads to simple screen: Big Terminal, Big Click Button
0:05 - First click tutorial: "Click to write code!" (arrow pointing)
0:10 - After 5 clicks: "Great! You've written 5 lines of code!"
0:20 - First upgrade appears: "Junior Dev Helper - Auto-writes 0.1 lines/sec"
0:30 - Currency introduced: "Earn Commits to buy upgrades!"
0:45 - Purchase first automation (costs only 10 Commits)
0:55 - See automation working with visual indicator

**Feedback Density**: Something happens every 2-3 seconds

### Minute 1-2: The Power Fantasy
**Goal**: Make player feel progression acceleration

1:00 - Second upgrade unlocked: "Better Keyboard - 2x click power"
1:15 - First achievement: "Hello World! - Write 100 lines of code"
1:30 - Third upgrade: "Coffee Machine - All helpers 25% faster"
1:45 - Production rate now ~5 lines/second (feels fast)

### Minute 2-3: The Depth Reveal
**Goal**: Show there's more to discover

2:00 - New automation tier: "Code Reviewer - 1 line/sec base"
2:20 - First prestige mention: "At 1000 lines, you can Ship It!"
2:40 - Offline progress preview: "Your code writes itself while away!"

### Minute 3-5: The Commitment
**Goal**: Lock in the gameplay loop

3:00 - First mini-goal: "Reach 1000 lines to Ship Your First App!"
4:00 - Multiple automations running, ~20 lines/second
4:30 - Upgrade decisions matter (save for big upgrade vs. incremental)
5:00 - First Ship It! opportunity (soft reset with bonus)

### Critical Success Metrics
- 90% of players make first purchase within 45 seconds
- 80% reach 100 LOC within 90 seconds  
- 70% are producing 10+ lines/second by minute 3
- 60% complete first prestige within 5 minutes

---

## 3. Progression Mathematics

### Cost Scaling Formula
```
cost = base_cost * (1.15 ^ owned)
```

### Base Costs and Production

| Automation | Base Cost | Base Production | Cost Growth |
|------------|-----------|-----------------|-------------|
| Junior Dev | 10 | 0.1/s | 1.15x |
| Code Reviewer | 100 | 1/s | 1.15x |
| Senior Dev | 1,100 | 8/s | 1.15x |
| Tech Lead | 12,000 | 47/s | 1.15x |
| AI Assistant | 130,000 | 260/s | 1.15x |

### Click Upgrades

| Upgrade | Cost | Effect | Unlock Requirement |
|---------|------|--------|-------------------|
| Better Keyboard | 100 | 2x click | 10 clicks |
| Mechanical Keys | 500 | 2x click | 50 clicks |
| Vim Mode | 2,500 | 3x click | 100 clicks |
| Touch Typing | 10,000 | 2x click | 500 clicks |

### Prestige System ("Ship It!")
- First prestige: 1,000 LOC
- Prestige formula: `bonus = sqrt(total_loc / 1000)`
- Bonus applies to: All production multiplied by (1 + bonus)
- Prestige resets: Automation ownership and current LOC
- Prestige keeps: Upgrades and achievements

### Balance Goals
- First automation affordable in ~30 seconds of clicking
- Second automation tier reachable in ~2 minutes
- Prestige attractive at ~5 minutes first run
- Post-prestige: 50% faster to reach same point
- Exponential wall hits at ~10 minutes per run

---

## 4. Polish & Juice Specifications

### Visual Feedback Hierarchy

#### Primary Actions (Clicks)
- **Code Text**: Monospace font, syntax highlighted
- **Particle System**: 3-5 small text chars float up
- **Screen Effects**: 2px shake, 5% brightness pulse
- **Button Animation**: Depress 5px with shadow change

#### Secondary Actions (Purchases)
- **Button States**: Disabled (gray) → Available (glow) → Pressed (flash)
- **Purchase Effect**: Radial burst of particles
- **Number Changes**: Count up animation over 300ms
- **New Item**: Slide in from right with bounce

#### Ambient Feedback
- **Background Code**: Scrolls continuously at 20px/second
- **Production Indicators**: Pulse every production tick
- **Number Changes**: Smooth transitions, never jump
- **Hover States**: All interactive elements respond

### Audio Design

#### Sound Palette
1. **Click Sounds** (5 variations):
   - Mechanical keyboard: "clack" (60%)
   - Mechanical keyboard: "thock" (20%)
   - Model M: "click" (15%)
   - Cherry MX Blue: "click-clack" (5%)
   
2. **Purchase Sounds**:
   - Success: "cha-ching" + git commit sound
   - Can't afford: Error beep (gentle, not harsh)
   
3. **Automation Sounds**:
   - Tick: Subtle typewriter sound (volume: 20%)
   - Level up: Power-up chord progression
   
4. **Achievement Sounds**:
   - Unlock: Triumphant fanfare (1 second)
   - Progress: Soft ding

#### Audio Rules
- No sound longer than 1 second
- All sounds normalized to -12db
- Slight pitch variation (±5%) to prevent monotony
- Overlapping sounds duck previous by 50%

### Animation Timing

All animations follow these curves:
- **Interactions**: Ease-out-cubic (snappy)
- **Transitions**: Ease-in-out-quad (smooth)
- **Continuous**: Linear (predictable)
- **Emphasis**: Ease-out-back (slight overshoot)

Standard durations:
- Instant feedback: 0-100ms
- Quick transitions: 200-300ms
- Normal transitions: 300-500ms
- Emphasis animations: 500-800ms

### Color Psychology
- **Primary Action** (Click): #00FF00 (classic terminal green)
- **Currency**: #FFD700 (gold, valuable)
- **Automation**: #00CED1 (cyan, futuristic)
- **Prestige**: #FF00FF (magenta, special)
- **Background**: #0A0A0A (near black, easy on eyes)
- **Text**: #00FF00 on dark, #FFFFFF on light

---

## 5. Flow State Engineering

### Micro-Flow (5-30 second loops)
1. **Clear Goal**: Number at top shows next unlock
2. **Immediate Feedback**: Every action has 3+ feedback layers
3. **Low Friction**: One-click purchases, no confirmations
4. **Rhythm**: Automation ticks create metronome

### Macro-Flow (5-30 minute sessions)
1. **Difficulty Curve**: Exponential costs create natural walls
2. **Power Spikes**: Prestige provides massive boost
3. **Discovery**: New automations unlock at set thresholds
4. **Achievement**: Regular dopamine hits via unlocks

### Flow Maintenance Techniques
- **Never Nothing**: Always something happening on screen
- **Always Progress**: Numbers always going up somewhere
- **Clear Next Step**: UI highlights next affordable purchase
- **No Dead Ends**: Prestige always available as escape valve
- **Momentum Building**: Each purchase makes next one faster

### Anti-Frustration Features
- **Offline Progress**: 50% speed while away (capped at 2 hours)
- **No Missables**: All upgrades eventually obtainable
- **No Timers**: Play at your own pace
- **Clear Math**: Show exact effects before purchase
- **Undo**: Can refund last purchase within 10 seconds

---

## 6. MVP Scope Definition

### Core Features (Must Have)
1. **Click to Code**: Basic interaction with full polish
2. **5 Automation Tiers**: Junior to AI Assistant
3. **4 Click Upgrades**: Power progression
4. **Currency System**: Lines of Code + Commits
5. **Prestige System**: Ship It! with multiplier bonus
6. **10 Achievements**: Clear progression milestones
7. **Save System**: Local storage, auto-save every 10 seconds
8. **Offline Progress**: Calculate time away (2 hour cap)

### Polish Features (Must Have)
1. **All Audio**: Click, purchase, achievement sounds
2. **All Particles**: Click, purchase, achievement effects
3. **All Animations**: Smooth transitions on everything
4. **Number Formatting**: 1.23K, 4.56M, etc.
5. **Visual Hierarchy**: Clear, readable, beautiful
6. **Tutorial**: First-time player onboarding
7. **Settings**: Sound on/off, particle on/off

### Cut for Later (Not MVP)
- Multiple prestige layers
- Skill tree system
- Mini-games
- Leaderboards
- Cloud saves
- Themes/skins
- Advanced statistics
- Social features

### Quality Benchmarks
- 60 FPS minimum on 5-year-old hardware
- <50ms click response time
- Zero jarring transitions
- Every number animates smoothly
- No gameplay bugs in core loop
- Playable without sound (visual feedback sufficient)
- 5-minute first-run to prestige

---

## 7. Technical Polish Requirements

### Performance Standards
- **Frame Rate**: Locked 60 FPS
- **Click Latency**: <50ms response
- **Memory Usage**: <100MB RAM
- **Save Size**: <1MB local storage
- **Load Time**: <2 seconds

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: Responsive design, touch optimized

### Responsive Design
- **Desktop**: Full experience, hover states
- **Tablet**: Touch-optimized, larger buttons
- **Mobile**: Vertical layout, thumb-reachable

### Accessibility
- **Keyboard**: Full keyboard navigation
- **Screen Reader**: Semantic HTML, ARIA labels
- **Color Blind**: Shapes + colors for all indicators
- **Motion**: Respect prefers-reduced-motion

---

## 8. Moment-to-Moment Excellence

### The Perfect Click Experience
1. Press mouse down
2. Button depresses (visual)
3. Click sound plays (audio)
4. Code appears on screen (reward)
5. Particle effects trigger (celebration)
6. Number increments (progress)
7. All within 50ms

### The Perfect Purchase Experience
1. Hover shows preview (information)
2. Button glows when affordable (invitation)
3. Click triggers purchase (action)
4. Sound confirms success (audio)
5. Visual burst effect (celebration)
6. New element slides in (revelation)
7. Production rate updates (impact)

### The Perfect Idle Experience
1. Automation ticks regularly (rhythm)
2. Numbers smoothly increment (progress)
3. Next goal clearly shown (direction)
4. Visual movement on screen (life)
5. Occasional achievement (surprise)

---

## 9. Retention Mechanics

### Daily Engagement Hooks
- **Offline Progress**: Return to collect accumulated code
- **Daily Achievement**: "Code for 7 days straight"
- **Sweet Spot Timing**: 2-hour offline cap encourages 3x daily

### Session Length Optimization
- **5-Minute Sessions**: Complete prestige cycle
- **15-Minute Sessions**: Multiple prestiges, see progress
- **30-Minute Sessions**: Unlock new automation tiers

### Long-Term Goals
- **Achievement Completion**: 40+ achievements total
- **All Upgrades**: Completionist goal
- **Big Numbers**: Quadrillions of lines of code
- **Prestige Levels**: Infinite progression

---

## 10. Success Metrics

### Launch Success Criteria
- **D1 Retention**: 40% (idle game standard)
- **D7 Retention**: 15% (top 25% of idle games)
- **Average Session**: 8 minutes
- **Sessions per Day**: 3.5
- **Tutorial Completion**: 90%
- **First Prestige**: 60% within first session

### Polish Success Criteria
- **Click Feel**: "Best clicking experience" in reviews
- **No Friction**: <1% quit due to confusion
- **Performance**: No frame drops reported
- **Bug-Free**: Zero core loop bugs
- **Addictive**: "One more upgrade" mentioned frequently

---

## Conclusion: Traditional Excellence

Pet Software Idler succeeds not through innovation but through flawless execution of proven idle game mechanics. Every click feels perfect. Every number increment satisfies. Every upgrade delivers tangible power growth. This is comfort food gaming at its finest - familiar mechanics polished until they gleam.

By respecting player intuition, leveraging proven patterns, and obsessing over feel, we create an idle game that players return to not because it's novel, but because it's simply the most satisfying code-clicking experience available.

"Innovation is easy. Excellence is hard. We choose excellence."