# PetSoft Tycoon: Design Document v2.0
## Building the Ultimate Pet Business Software Company

### Table of Contents
1. [Research Findings & Design Justification](#research-findings--design-justification)
2. [Game Overview](#game-overview)
3. [Core Loop & First 5 Minutes](#core-loop--first-5-minutes)
4. [Department Systems](#department-systems)
5. [Progression & Balance](#progression--balance)
6. [Polish & Feedback Systems](#polish--feedback-systems)
7. [MVP Feature Set](#mvp-feature-set)
8. [Future Features](#future-features)

---

## Research Findings & Design Justification

### Key Learnings from Successful Idle Games

**From Cookie Clicker:**
- Start incredibly simple (single click = single resource)
- Buildings that automate production create satisfying progression
- Prestige systems with permanent bonuses drive long-term retention
- Golden Cookie random events add active play elements
- 20+ building types create depth without complexity

**From Adventure Capitalist:**
- Manager automation removes tedium
- x2 multipliers at 25/50 units create purchase spikes
- Multiple business types with interconnected bonuses
- Angel Investors as prestige currency works perfectly
- Time warps monetize impatience effectively

**From Egg Inc & Factory Games:**
- Visual feedback of production (chickens running, eggs flowing)
- Multiple interconnected departments create strategic depth
- Transport/logistics bottlenecks add management elements
- Research trees provide long-term goals
- Offline progression with limits drives daily returns

**Critical First 5 Minutes:**
- NO tutorials - learn by doing
- First upgrade within 10 seconds
- 3-5 upgrades in first minute
- Visible automation by minute 2
- Department unlock teaser by minute 3
- First prestige hint by minute 5

---

## Game Overview

### Theme & Story
You're a developer who just quit their corporate job to build software for pet businesses. Starting from your garage with a single laptop, you'll grow into a tech empire helping pet stores, vets, groomers, and sitters manage their operations better.

### Core Fantasy
"From garage coder to pet tech mogul" - Watch your ideas transform into products that make pet businesses thrive while building a company culture that developers dream about.

### Victory Condition (MVP)
Successfully launch your IPO after reaching $1B valuation (approximately 2-4 weeks of engaged play).

---

## Core Loop & First 5 Minutes

### Second 0-10: Immediate Action
```
SCREEN: Simple garage office with single desk
ACTION: Big pulsing "WRITE CODE" button center screen
RESULT: 
- Click button → +1 Line of Code
- Code counter animates with typewriter sound
- After 5 clicks → "Hire Junior Dev $10" button appears
```

### Second 10-30: First Automation
```
Junior Dev automating:
- Produces 0.1 lines/second
- Visual: Dev sprite typing at desk
- After hiring → "Ship Feature" button appears
- Ship Feature: Convert 10 lines → $15
- Money counter appears with cash register sound
```

### Second 30-60: Growth Loop Established
```
Feedback loop emerges:
Code → Features → Money → More Devs → More Code
- Second dev costs $25
- Third dev costs $50
- "Upgrade Laptop" appears at $100 (2x code speed)
```

### Minute 1-2: Department Tease
```
At $200 total earned:
- Office expands (camera zooms out)
- Empty desks appear labeled "SALES COMING SOON"
- Excitement building for what's next
```

### Minute 2-3: Sales Department Unlock
```
At $500:
- Sales department unlocks
- First sales rep costs $100
- Sales reps generate Customer Leads
- Leads + Features = Product Sales (higher $ than raw features)
```

### Minute 3-5: Full Loop Revealed
```
Complete business cycle visible:
Development → Features → Sales → Customers → Revenue → Growth
- Multiple upgrade paths available
- Department synergies becoming clear
- First "Big Number" threshold approaching ($10K)
```

---

## Department Systems

### 1. Development Department
**Purpose:** Code production and feature creation

**Units:**
- Junior Dev: 0.1 lines/sec (Base: $10)
- Mid Dev: 0.5 lines/sec (Base: $100)
- Senior Dev: 2.5 lines/sec (Base: $1,000)
- Tech Lead: 10 lines/sec + 10% dept boost (Base: $10,000)

**Conversions:**
- 10 lines = 1 Basic Feature
- 100 lines = 1 Advanced Feature
- 1,000 lines = 1 Premium Feature

**Upgrades:**
- Better IDEs: +25/50/100% coding speed
- Pair Programming: +2x efficiency at 25 devs
- Code Reviews: -50% bugs at 50 devs

### 2. Sales Department
**Purpose:** Generate leads and convert features to revenue

**Units:**
- Sales Rep: 0.2 leads/sec (Base: $100)
- Account Manager: 1 lead/sec (Base: $1,000)
- Sales Director: 5 leads/sec (Base: $10,000)
- VP Sales: 20 leads/sec + 15% dept boost (Base: $100,000)

**Conversions:**
- 1 Lead + 1 Basic Feature = $50
- 1 Lead + 1 Advanced Feature = $500
- 1 Lead + 1 Premium Feature = $5,000

**Upgrades:**
- CRM System: +30% lead generation
- Sales Training: 2x multiplier at 25 reps
- Partnership Deals: +50% revenue per sale

### 3. Customer Experience Department
**Purpose:** Increase customer lifetime value

**Units:**
- Support Agent: 0.1 tickets/sec (Base: $250)
- CX Specialist: 0.5 tickets/sec (Base: $2,500)
- CX Manager: 2.5 tickets/sec (Base: $25,000)
- CX Director: 10 tickets/sec + retention bonus (Base: $250,000)

**Mechanics:**
- Resolved tickets increase customer retention
- Retention multiplies revenue (1.1x → 3x)
- Happy customers generate referral leads

**Upgrades:**
- Help Desk Software: +40% ticket resolution
- Knowledge Base: Auto-resolve 25% of tickets
- Customer Success Program: +50% retention impact

### 4. Product Department
**Purpose:** Multiply feature value through research

**Units:**
- Product Analyst: Generates insights (Base: $500)
- Product Manager: Converts insights → specs (Base: $5,000)
- Senior PM: Premium specs + roadmap bonus (Base: $50,000)
- CPO: Global multipliers (Base: $500,000)

**Mechanics:**
- Insights + Features = Enhanced Features (2x value)
- Product roadmap provides global efficiency bonuses
- User research unlocks new feature types

### 5. Design Department
**Purpose:** Polish multiplies everything

**Units:**
- UI Designer: Polish points/sec (Base: $1,000)
- UX Designer: Experience points/sec (Base: $10,000)
- Design Lead: Team multipliers (Base: $100,000)
- Creative Director: Global polish (Base: $1,000,000)

**Mechanics:**
- Polish points make features more valuable
- Experience points increase conversion rates
- Design system unlocks at 50 designers (2x all production)

### 6. QA Department
**Purpose:** Bug prevention saves money

**Units:**
- QA Tester: Catches bugs (Base: $750)
- QA Engineer: Prevents bugs (Base: $7,500)
- QA Lead: Process improvements (Base: $75,000)
- QA Director: Zero-defect bonuses (Base: $750,000)

**Mechanics:**
- Each bug caught saves 10x its cost
- Bug prevention reduces support tickets
- Quality multiplier affects customer retention

### 7. Marketing Department
**Purpose:** Amplify everything

**Units:**
- Content Writer: Brand points (Base: $2,000)
- Marketing Manager: Campaign power (Base: $20,000)
- Growth Hacker: Viral coefficients (Base: $200,000)
- CMO: Market domination (Base: $2,000,000)

**Mechanics:**
- Brand points multiply lead generation
- Campaigns create temporary 10x spikes
- Viral mechanics exponentially grow customers

---

## Progression & Balance

### Early Game (0-30 minutes)
```
Focus: Learn departments, establish rhythms
- $0 → $10K: Single department focus
- $10K → $100K: Two departments synergy
- $100K → $1M: Three departments complexity
Key unlock: Manager automation at $50K
```

### Mid Game (30 min - 4 hours)
```
Focus: Optimization and strategic choices
- $1M → $100M: Full department integration
- Prestige system unlocks at $10M
- Strategic reset decisions
- Upgrade path specialization
```

### Late Game (4+ hours)
```
Focus: Prestige cycling and big numbers
- $100M → $1B: Prestige optimization
- Multiple prestige layers
- Investor meetings mini-game
- IPO preparation
```

### Prestige System: "Investor Rounds"
```
Reset at strategic points for Investor Points (IP):
- Seed Round: 1 IP per $1M valuation
- Series A: Enhanced at $10M+
- Series B: Major bonuses at $100M+

IP Bonuses:
- Starting Capital: +10% per IP
- Global Speed: +1% per IP
- Department Synergy: +2% per 10 IP
- Unlock Super Units: At 100, 1K, 10K IP
```

### Mathematical Progression
```
Cost Formula: Base * 1.15^owned
Production: Linear growth with multiplier jumps
Key ratios:
- 10 seconds to afford first purchase
- 30 seconds between early purchases
- 2-minute cycles in mid-game
- 10-minute strategic decisions late game
```

---

## Polish & Feedback Systems

### Visual Feedback Hierarchy

**Primary Actions (Code/Sales):**
- Instant number popup (+1, +10, +100)
- Screen shake on big numbers
- Particle burst on milestones
- Color progression (white → green → gold)

**Department Activity:**
- Animated sprites for each unit
- Speed increases visible as animation
- Department "glow" when optimized
- Connection lines between synergies

**Office Evolution:**
- Garage → Small Office (at $10K)
- Small → Medium Office (at $1M)
- Medium → Campus (at $100M)
- Campus → Tech Giant HQ (at $1B)

### Audio Design

**Core Sounds:**
- Keyboard click: Code writing (pitch varies)
- Cash register: Sales (pitch by amount)
- Notification: Feature complete
- Level up: Department upgrade
- Prestige: Investor funding (champagne pop)

**Audio Rules:**
- Never repeat same sound within 0.5 seconds
- Volume scales inverse to frequency
- Milestone sounds override normal sounds
- Music adapts to game pace

### Animation Polish

**Number Animations:**
```
Small numbers: Fade up and out (0.3s)
Big numbers: Scale bounce + trail (0.5s)
Milestones: Spiral up + fireworks (1s)
```

**UI Transitions:**
```
Button hover: Scale 1.05 + glow
Button click: Scale 0.95 → 1.1 → 1.0
Panel slides: EaseOutBack curve
Department unlock: Unfold animation (1.5s)
```

**Particle Systems:**
- Code particles: Matrix-style text
- Money particles: Dollar signs
- Customer particles: Heart emojis
- Bug particles: Red error symbols

### Game Feel Details

**Responsive Controls:**
- All buttons respond in <50ms
- Visual feedback before calculation
- Queue system for rapid clicks
- No action ever "lost"

**Progress Indicators:**
- Progress bars fill smoothly
- Next unlock always visible
- Milestone progress tracker
- Department efficiency meters

**Celebration Moments:**
- First of each unit type
- Power of 10 milestones
- Department connections
- Prestige activation

---

## MVP Feature Set

### Core Systems (Phase 1)
- [x] Seven departments with unique mechanics
- [x] Basic automation (managers)
- [x] Save system (local storage)
- [x] Offline progression
- [x] Core audio/visual feedback

### Progression Systems (Phase 2)
- [x] Cost/production balance
- [x] Prestige system (Investor Rounds)
- [x] Achievement system (50 achievements)
- [x] Statistics tracking
- [x] Reset confirmation

### Polish Phase (Phase 3)
- [x] All animations smooth
- [x] Audio mixing balanced
- [x] Tutorial-free onboarding
- [x] Performance optimization
- [x] Cross-platform testing

### MVP Deliverables
- Mobile and Web
- Works offline
- No monetization

---

## Future Features

### Version 1.1: "The Conference Update"
- Industry conferences for temporary boosts
- Competitor companies as rivals
- Talent recruitment mini-game
- Office customization

### Version 1.2: "Going Global"
- Multiple office locations
- Localization challenges
- Time zone management
- Cultural adaptation bonuses

### Version 1.3: "The Platform Play"
- Build app marketplace
- Third-party developers
- API economy
- Platform fees as new revenue

### Monetization (Post-MVP)
- Time Warps: $0.99 - $4.99
- Starter Packs: $2.99 - $9.99
- Ad Boost: Watch for 2x production (30 min)
- Premium: $9.99 removes all friction

## Conclusion

PetSoft Tycoon takes proven idle game mechanics and executes them with exceptional polish. By focusing on traditional design excellence rather than innovation, we create an experience that feels immediately familiar yet endlessly satisfying. Every click matters, every number feels good, and every department adds meaningful depth without overwhelming complexity.

The pet software theme provides narrative justification for our mechanics while the business simulation adds strategic depth to the classic idle formula. With careful attention to pacing, progression, and polish, PetSoft Tycoon will be the idle game players return to again and again - not because it's new, but because it's crafted with such care that the simple joy of watching numbers go up never gets old.
