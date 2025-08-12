# PetSoft Tycoon: Implementation Specification

## Core Game Loop

### Initial State
- Starting resources: 0 Lines of Code, $0
- Single "WRITE CODE" button center screen
- Click produces: +1 Line of Code
- Code counter animates with typewriter sound

### Resource Conversions
- 10 lines = 1 Basic Feature
- 100 lines = 1 Advanced Feature  
- 1,000 lines = 1 Premium Feature
- 1 Lead + 1 Basic Feature = $50
- 1 Lead + 1 Advanced Feature = $500
- 1 Lead + 1 Premium Feature = $5,000

### Cost Formula
`cost = baseCost * 1.15^owned`

## Departments

### 1. Development Department
**Units & Base Costs:**
- Junior Dev: 0.1 lines/sec, $10
- Mid Dev: 0.5 lines/sec, $100
- Senior Dev: 2.5 lines/sec, $1,000
- Tech Lead: 10 lines/sec + 10% dept boost, $10,000

**Upgrades:**
- Better IDEs: +25/50/100% coding speed
- Pair Programming: +2x efficiency at 25 devs
- Code Reviews: -50% bugs at 50 devs

### 2. Sales Department
**Units & Base Costs:**
- Sales Rep: 0.2 leads/sec, $100
- Account Manager: 1 lead/sec, $1,000
- Sales Director: 5 leads/sec, $10,000
- VP Sales: 20 leads/sec + 15% dept boost, $100,000

**Upgrades:**
- CRM System: +30% lead generation
- Sales Training: 2x multiplier at 25 reps
- Partnership Deals: +50% revenue per sale

### 3. Customer Experience Department
**Units & Base Costs:**
- Support Agent: 0.1 tickets/sec, $250
- CX Specialist: 0.5 tickets/sec, $2,500
- CX Manager: 2.5 tickets/sec, $25,000
- CX Director: 10 tickets/sec + retention bonus, $250,000

**Mechanics:**
- Resolved tickets multiply revenue (1.1x → 3x)
- Happy customers generate referral leads

**Upgrades:**
- Help Desk Software: +40% ticket resolution
- Knowledge Base: Auto-resolve 25% of tickets
- Customer Success Program: +50% retention impact

### 4. Product Department
**Units & Base Costs:**
- Product Analyst: Generates insights, $500
- Product Manager: Converts insights → specs, $5,000
- Senior PM: Premium specs + roadmap bonus, $50,000
- CPO: Global multipliers, $500,000

**Mechanics:**
- Insights + Features = Enhanced Features (2x value)

### 5. Design Department
**Units & Base Costs:**
- UI Designer: Polish points/sec, $1,000
- UX Designer: Experience points/sec, $10,000
- Design Lead: Team multipliers, $100,000
- Creative Director: Global polish, $1,000,000

**Mechanics:**
- Polish points increase feature value
- Experience points increase conversion rates
- Design system unlocks at 50 designers (2x all production)

### 6. QA Department
**Units & Base Costs:**
- QA Tester: Catches bugs, $750
- QA Engineer: Prevents bugs, $7,500
- QA Lead: Process improvements, $75,000
- QA Director: Zero-defect bonuses, $750,000

**Mechanics:**
- Each bug caught saves 10x its cost
- Bug prevention reduces support tickets

### 7. Marketing Department
**Units & Base Costs:**
- Content Writer: Brand points, $2,000
- Marketing Manager: Campaign power, $20,000
- Growth Hacker: Viral coefficients, $200,000
- CMO: Market domination, $2,000,000

**Mechanics:**
- Brand points multiply lead generation
- Campaigns create temporary 10x spikes

## Progression Milestones

### Unlock Schedule
- $10: First Junior Dev available
- $200: Office expands (visual only)
- $500: Sales department unlocks
- $10K: Small Office visual upgrade
- $50K: Manager automation unlocks
- $1M: Medium Office visual upgrade
- $10M: Prestige system unlocks
- $100M: Campus visual upgrade
- $1B: Tech Giant HQ, Victory condition

### Prestige System: Investor Rounds
**Reset Formula:**
- Seed Round: 1 IP per $1M valuation
- IP Bonuses:
  - Starting Capital: +10% per IP
  - Global Speed: +1% per IP
  - Department Synergy: +2% per 10 IP
  - Super Units unlock at 100, 1K, 10K IP

## Technical Specifications

### Performance Requirements
- All buttons respond in <50ms
- Minimum 30 FPS on low-end devices
- Save every 30 seconds
- Offline progression calculation on resume

### Animations
**Number Popups:**
- Small: Fade up 0.3s
- Big: Scale bounce 0.5s
- Milestone: Spiral + particles 1s

**Button Interactions:**
- Hover: Scale to 1.05 + glow
- Click: Scale 0.95 → 1.1 → 1.0

**Department Unlock:**
- Unfold animation 1.5s

### Audio Requirements
**Sound Effects:**
- keyboard_click.wav: Code writing (vary pitch)
- cash_register.wav: Sales (pitch by amount)
- notification.wav: Feature complete
- level_up.wav: Department upgrade
- prestige.wav: Investor funding

**Audio Rules:**
- Prevent same sound within 0.5s
- Volume inversely proportional to frequency
- Milestone sounds have priority

### Save System
**Data to Persist:**
- All resource amounts
- Unit counts per department
- Upgrade states
- Prestige points
- Total playtime
- Achievement progress
- Statistics

**Save Triggers:**
- Every 30 seconds
- On prestige
- On app background/close

### Offline Progression
**Calculation:**
- Maximum 24 hours offline gains
- Calculate at 10% efficiency
- Show summary on return

## MVP Requirements

### Phase 1: Core Systems
- Seven departments with specified mechanics
- Manager automation at $50K
- Local storage save system
- Offline progression (24hr max)
- Basic audio/visual feedback

### Phase 2: Progression Systems
- Cost scaling (1.15^owned)
- Prestige system with IP bonuses
- 50 achievements minimum
- Statistics tracking (all-time stats)
- Reset confirmation dialog

### Platform Requirements
- Mobile (Android for MVP) through Expo + React-Native
- Works offline
- Responsive design (phones to tablets)
- Local storage only (no backend)