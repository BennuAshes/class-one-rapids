# PetSoft Tycoon: Design Document

## Game Overview

### Victory Condition
Reach $1B valuation to launch IPO (2-4 weeks of engaged play).

---

## Core Loop & First 5 Minutes

### Second 0-10: Immediate Action
- "WRITE CODE" button center screen (pulsing animation)
- Click → +1 Line of Code
- Code counter animates with typewriter sound
- After 5 clicks → "Hire Junior Dev $10" button appears

### Second 10-30: First Automation
- Junior Dev: 0.1 lines/second (auto-production)
- Visual: Dev sprite typing animation
- "Ship Feature" button appears after first hire
- Ship Feature: Convert 10 lines → $15
- Money counter with cash register sound

### Second 30-60: Growth Loop
- Code → Features → Money → More Devs
- Second dev: $25
- Third dev: $50
- "Upgrade Laptop" at $100 (2x code speed)

### Minute 1-2: Department Tease
- At $200: Office expands (camera zoom out)
- Empty desks labeled "SALES COMING SOON"

### Minute 2-3: Sales Department Unlock
- At $500: Sales department unlocks
- First sales rep: $100
- Sales reps generate Customer Leads
- Leads + Features = Product Sales

### Minute 3-5: Full Loop
- Development → Features → Sales → Customers → Revenue
- Multiple upgrade paths available
- Department synergies active
- $10K milestone approaching

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
- $0 → $10K: Single department
- $10K → $100K: Two departments
- $100K → $1M: Three departments
- Manager automation unlocks at $50K

### Mid Game (30 min - 4 hours)
- $1M → $100M: All departments active
- Prestige unlocks at $10M
- Multiple upgrade paths
- Reset optimization

### Late Game (4+ hours)
- $100M → $1B: Prestige cycling
- Multiple prestige tiers
- IPO at $1B

### Prestige System: Investor Rounds
**Formula:** 1 IP per $1M valuation at reset

**IP Bonuses:**
- Starting Capital: +10% per IP
- Global Speed: +1% per IP
- Department Synergy: +2% per 10 IP
- Super Units unlock: 100, 1K, 10K IP

### Mathematical Progression
- **Cost Formula:** `Base * 1.15^owned`
- **Production:** Linear with multiplier jumps at 25/50/100 units
- **Timing:** 10s first purchase, 30s early game, 2min mid-game, 10min late game

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

### Animations

**Number Animations:**
- Small: Fade up 0.3s
- Large: Scale bounce 0.5s
- Milestone: Spiral + particles 1s

**UI Interactions:**
- Button hover: scale(1.05) + glow
- Button click: scale(0.95) → scale(1.1) → scale(1.0)
- Panel transitions: easeOutBack
- Department unlock: unfold 1.5s

**Particle Systems:**
- Code particles: Matrix-style text
- Money particles: Dollar signs
- Customer particles: Heart emojis
- Bug particles: Red error symbols

### Performance Requirements

**Input Response:**
- <50ms button response
- Visual feedback before computation
- Click queue for rapid input
- No dropped inputs

**UI Updates:**
- 60fps progress bars
- Next unlock always visible
- Real-time efficiency meters

**Milestone Triggers:**
- First unit purchase
- 10^n resource thresholds
- Department synergy activation
- Prestige reset

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

## Post-MVP Considerations

### Potential Features
- Industry conferences (temporary boosts)
- Competitor mechanics
- Multiple office locations
- Platform marketplace

### Monetization Options
- Time Warps: $0.99 - $4.99
- Starter Packs: $2.99 - $9.99
- Ad Boost: 2x production (30 min)
- Premium: $9.99

