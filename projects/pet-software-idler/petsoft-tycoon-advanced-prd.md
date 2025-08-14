# PetSoft Tycoon: Product Requirements Document
*Version 1.0 | Generated: 2025-08-14*

## Executive Summary

### Product Vision
PetSoft Tycoon is a mobile idle clicker game that simulates building and managing a software company. Players progress from writing individual lines of code to commanding a multi-department tech empire generating billions in revenue through strategic resource management and automated systems.

### Value Proposition
- **Instant Gratification**: Core clicking mechanic provides immediate feedback with typewriter sounds and animated counters
- **Strategic Depth**: Seven interconnected departments create complex optimization puzzles as players scale
- **Progression Satisfaction**: Prestige system with Investor Points ensures long-term engagement through meaningful resets
- **Educational Entertainment**: Realistic software development workflow teaches business concepts through gameplay

### Target Market
- **Primary**: Mobile gaming enthusiasts aged 18-35 interested in incremental/idle games
- **Secondary**: Software professionals seeking relaxing gameplay that mirrors their work environment
- **Tertiary**: Business simulation fans looking for accessible entry point to the genre

### Success Criteria
- **Engagement**: 7-day retention rate >40%, 30-day retention >15%
- **Monetization**: Ready for freemium model with optional cosmetic purchases
- **Technical**: Maintains 30+ FPS on low-end Android devices, <3 second load times
- **Platform**: Successful React Native implementation proving cross-platform viability

## Product Architecture

### Technical Foundation
Following vertical slicing architecture with per-feature state management:

```
src/
├── features/
│   ├── development/     # Code generation & developer management
│   ├── sales/          # Lead generation & revenue conversion
│   ├── customer-exp/   # Support tickets & retention systems
│   ├── product/        # Feature enhancement & roadmap
│   ├── design/         # Polish & user experience systems
│   ├── qa/             # Bug detection & prevention
│   ├── marketing/      # Brand building & lead multiplication
│   └── core/           # Cross-cutting concerns (save, audio, etc.)
├── shared/
│   ├── ui/             # Reusable components
│   ├── audio/          # Sound management
│   ├── persistence/    # Save system
│   └── types/          # Shared type definitions
└── app/                # Root app configuration
```

### Technology Stack
- **Platform**: React Native 0.76+ with new architecture (JSI, Fabric, Hermes)
- **Framework**: Expo SDK 53 with managed workflow
- **State Management**: Legend State @beta with observable patterns
- **Build**: EAS Build for production deployments
- **Testing**: Jest for unit tests, future Cypress for E2E

## User Stories & Acceptance Criteria

### Epic 1: Core Clicking Experience
**As a new player, I want to immediately understand how to generate resources so I can start progressing.**

#### Story 1.1: Initial Code Generation
**User Story**: As a player, I want to click a button to generate lines of code so I can start building features.

**Acceptance Criteria**:
- [ ] "WRITE CODE" button is prominently displayed on startup
- [ ] Each click generates +1 Line of Code with typewriter sound effect
- [ ] Code counter animates with smooth number transitions
- [ ] Button responds within 50ms of touch interaction
- [ ] Counter persists between app sessions

**Definition of Done**: Player can click button, see immediate feedback, and return to same state after closing/reopening app.

#### Story 1.2: Resource Conversion Discovery
**User Story**: As a player, I want to convert accumulated code into features so I can unlock revenue generation.

**Acceptance Criteria**:
- [ ] Conversion ratios clearly displayed: 10 lines = 1 Basic Feature
- [ ] Convert button appears when sufficient resources available
- [ ] Conversion triggers satisfying animation and sound
- [ ] Feature counter updates with animated number popup
- [ ] Conversion requirements scale appropriately (10/100/1000 lines)

**Definition of Done**: Player successfully converts code to features and understands the progression pathway.

### Epic 2: Department Unlock Progression
**As a player, I want to unlock automated systems so I can scale beyond manual clicking.**

#### Story 2.1: Development Department
**User Story**: As a player, I want to hire developers so I can automate code generation.

**Acceptance Criteria**:
- [ ] Department unlocks at $10 milestone with celebratory animation
- [ ] Four developer types available with clear cost/benefit ratios
- [ ] Exponential cost scaling (baseCost * 1.15^owned) implemented
- [ ] Per-second production clearly displayed for each unit type
- [ ] Tech Lead provides 10% department-wide boost when hired

**Definition of Done**: Player hires first developer, observes automated production, and understands scaling economics.

#### Story 2.2: Sales Department Integration
**User Story**: As a player, I want to convert features into revenue so I can afford better developers.

**Acceptance Criteria**:
- [ ] Sales department unlocks at $500 milestone
- [ ] Lead generation system produces leads per second
- [ ] Revenue conversion requires both leads and features
- [ ] Three revenue tiers clearly communicated (Basic: $50, Advanced: $500, Premium: $5000)
- [ ] Sales reps, managers, and directors scale with exponential costs

**Definition of Done**: Player successfully converts first feature into revenue and understands the lead + feature = money equation.

### Epic 3: Advanced Department Synergies
**As an experienced player, I want complex department interactions so I can optimize sophisticated strategies.**

#### Story 3.1: Customer Experience Department
**User Story**: As a player, I want to resolve support tickets so I can multiply my revenue through customer satisfaction.

**Acceptance Criteria**:
- [ ] Support tickets generate automatically from sales activity
- [ ] Resolved tickets provide revenue multipliers (1.1x up to 3x maximum)
- [ ] Four support roles with exponential cost scaling
- [ ] Happy customers generate referral leads
- [ ] Department upgrade effects clearly visible in UI

**Definition of Done**: Player hires support staff, resolves tickets, and observes revenue multiplication effects.

#### Story 3.2: Product Department Enhancement
**User Story**: As a player, I want to enhance my features through product insights so I can increase their value.

**Acceptance Criteria**:
- [ ] Product Analysts generate insights per second
- [ ] Product Managers convert insights into specs
- [ ] Enhanced Features worth 2x normal feature value
- [ ] Senior PM provides roadmap bonuses
- [ ] CPO provides global multipliers

**Definition of Done**: Player creates first Enhanced Feature and observes 2x value increase in revenue calculations.

### Epic 4: Prestige System
**As a long-term player, I want meaningful progression resets so I can continue growing beyond initial limits.**

#### Story 4.1: Investor Rounds
**User Story**: As a player, I want to reset my progress for permanent bonuses so I can break through progression walls.

**Acceptance Criteria**:
- [ ] Prestige system unlocks at $10M valuation
- [ ] Clear explanation of reset consequences and benefits
- [ ] Investor Points calculated at 1 IP per $1M valuation
- [ ] IP bonuses: +10% starting capital, +1% global speed, +2% synergy per 10 IP
- [ ] Confirmation dialog prevents accidental resets

**Definition of Done**: Player completes first prestige, receives IP bonuses, and starts second run with visible advantages.

## Technical Requirements

### Performance Standards
- **Response Time**: All interactive elements respond within 50ms
- **Frame Rate**: Maintain minimum 30 FPS on Android 5.0+ devices
- **Memory Usage**: Stay under 200MB RAM on low-end devices
- **Battery Impact**: Minimal background processing, efficient animations

### Data Persistence
**Save System Requirements**:
- Automatic save every 30 seconds
- Manual save on app background/foreground transitions
- Save on prestige events
- Local storage only (no backend dependency)

**Data Schema**:
```typescript
interface GameSave {
  version: string;
  timestamp: number;
  resources: {
    linesOfCode: number;
    money: number;
    features: { basic: number; advanced: number; premium: number };
    leads: number;
    // ... other resources
  };
  departments: {
    [key: string]: {
      units: { [unitType: string]: number };
      upgrades: { [upgradeId: string]: boolean };
    };
  };
  prestige: {
    investorPoints: number;
    totalRuns: number;
  };
  statistics: {
    totalPlaytime: number;
    totalClicks: number;
    totalMoney: number;
    // ... tracking data
  };
}
```

### Offline Progression
- Calculate up to 24 hours of offline gains
- Apply 10% efficiency multiplier to offline calculations
- Display summary modal on return with total gains
- Prevent exploitation through time manipulation

### Audio System
**Sound Effects Specification**:
- `keyboard_click.wav`: Code writing (pitch variation based on volume)
- `cash_register.wav`: Revenue generation (pitch scales with amount)
- `notification.wav`: Feature completion and milestones
- `level_up.wav`: Department upgrades and unlocks
- `prestige.wav`: Investor funding events

**Audio Rules**:
- Prevent duplicate sounds within 500ms
- Volume inversely proportional to frequency
- Milestone sounds take priority over regular actions
- Respect system volume settings and mute switches

## Development Timeline

### Phase 1: Foundation (Weeks 1-4)
**Sprint 1-2: Core Infrastructure**
- [ ] Expo project setup with React Native 0.76+
- [ ] Legend State integration with observable patterns
- [ ] Basic UI framework and theme system
- [ ] Save/load system implementation
- [ ] Audio system foundation

**Deliverable**: Playable clicking mechanic with persistence

**Sprint 3-4: Development Department**
- [ ] Complete development department with 4 unit types
- [ ] Exponential cost scaling system
- [ ] Automated production calculations
- [ ] First department upgrade system
- [ ] UI animations for hiring and production

**Deliverable**: Fully functional automated code generation

### Phase 2: Core Departments (Weeks 5-8)
**Sprint 5-6: Sales & Revenue**
- [ ] Sales department with lead generation
- [ ] Revenue conversion system (leads + features = money)
- [ ] Three revenue tiers with proper scaling
- [ ] Department synergy bonuses
- [ ] Milestone unlock system

**Deliverable**: Complete revenue generation loop

**Sprint 7-8: Customer Experience**
- [ ] Support ticket generation and resolution
- [ ] Revenue multiplication system
- [ ] Referral lead generation
- [ ] Department upgrade effects
- [ ] Customer satisfaction feedback

**Deliverable**: Advanced revenue optimization through customer service

### Phase 3: Advanced Systems (Weeks 9-12)
**Sprint 9-10: Product & Design Departments**
- [ ] Product insight generation and spec conversion
- [ ] Enhanced feature creation (2x value)
- [ ] Design polish and experience points
- [ ] Global design system multipliers
- [ ] Cross-department synergy effects

**Deliverable**: Feature enhancement and design systems

**Sprint 11-12: QA & Marketing**
- [ ] Bug detection and prevention systems
- [ ] Marketing brand building and viral mechanics
- [ ] Campaign spike multipliers
- [ ] Department automation at $50K milestone
- [ ] Advanced progression mechanics

**Deliverable**: Complete seven-department ecosystem

### Phase 4: Progression & Polish (Weeks 13-16)
**Sprint 13-14: Prestige System**
- [ ] Investor Points calculation and bonuses
- [ ] Prestige reset functionality with confirmation
- [ ] Super unit unlocks at high IP levels
- [ ] Long-term progression balancing
- [ ] Achievement system foundation

**Deliverable**: Functional prestige system enabling long-term play

**Sprint 15-16: Polish & Optimization**
- [ ] Performance optimization for low-end devices
- [ ] UI/UX refinements based on playtesting
- [ ] Sound effect implementation and balancing
- [ ] Offline progression fine-tuning
- [ ] Final balancing and bug fixes

**Deliverable**: Production-ready MVP

## Success Metrics & KPIs

### Engagement Metrics
- **Day 1 Retention**: >60% (players return next day)
- **Day 7 Retention**: >40% (weekly engagement)
- **Day 30 Retention**: >15% (monthly active users)
- **Session Length**: Average 8-12 minutes per session
- **Sessions per Day**: 3-5 for active players

### Progression Metrics
- **Time to First Department**: <5 minutes from first launch
- **Time to First Prestige**: 2-4 hours of active play
- **Prestige Completion Rate**: >70% of players who reach $10M complete first prestige
- **Multi-Department Usage**: >80% of players unlock at least 4 departments

### Technical Performance
- **Crash Rate**: <1% of sessions
- **Load Time**: <3 seconds on average devices
- **Frame Rate**: 30+ FPS maintained 95% of gameplay time
- **Battery Usage**: <10% drain per hour of active play

### Business Readiness
- **Monetization Points Identified**: Ready for cosmetic purchases, optional boosts
- **Platform Compatibility**: 95%+ success rate on Android 5.0+ devices
- **Scaling Potential**: Architecture supports future features without major refactoring

## Risk Assessment & Mitigation

### Technical Risks
**Performance on Low-End Devices**
- *Risk*: Poor performance on minimum spec devices
- *Mitigation*: Early testing on Android 5.0 devices, performance budgets per feature
- *Contingency*: Simplified animation modes, optional quality settings

**State Management Complexity**
- *Risk*: Legend State @beta stability or learning curve
- *Mitigation*: Fallback to Zustand if critical issues arise, modular state design
- *Contingency*: Well-defined state interfaces enable migration

### Design Risks
**Progression Balance**
- *Risk*: Players hit progression walls or find optimal strategies too quickly
- *Mitigation*: Playtesting at each sprint, configurable progression parameters
- *Contingency*: Hot-fix capability for balance adjustments

**Feature Complexity**
- *Risk*: Seven departments overwhelm new players
- *Mitigation*: Gradual unlock system, clear tutorial progression
- *Contingency*: Optional simplified mode hiding advanced features

### Market Risks
**Platform Changes**
- *Risk*: React Native or Expo SDK breaking changes
- *Mitigation*: Conservative version pinning, regular dependency updates
- *Contingency*: Native development path if cross-platform fails

## Appendix A: Detailed Feature Specifications

### Department Specifications

#### Development Department
- **Junior Dev**: 0.1 lines/sec, $10 base cost
- **Mid Dev**: 0.5 lines/sec, $100 base cost  
- **Senior Dev**: 2.5 lines/sec, $1,000 base cost
- **Tech Lead**: 10 lines/sec + 10% department boost, $10,000 base cost

**Upgrades**:
- Better IDEs: +25/50/100% coding speed at 10/25/50 developers
- Pair Programming: +2x efficiency at 25 developers
- Code Reviews: -50% bugs at 50 developers

#### Sales Department
- **Sales Rep**: 0.2 leads/sec, $100 base cost
- **Account Manager**: 1 lead/sec, $1,000 base cost
- **Sales Director**: 5 leads/sec, $10,000 base cost
- **VP Sales**: 20 leads/sec + 15% department boost, $100,000 base cost

**Revenue Conversion**:
- 1 Lead + 1 Basic Feature = $50
- 1 Lead + 1 Advanced Feature = $500  
- 1 Lead + 1 Premium Feature = $5,000

### Milestone Unlocks
- $10: Development Department
- $500: Sales Department  
- $10K: Customer Experience Department
- $50K: Manager Automation, Product Department
- $1M: Design Department
- $10M: Prestige System, QA Department
- $100M: Marketing Department
- $1B: Victory Condition

### Cost Scaling Formula
All units follow exponential cost scaling: `cost = baseCost * 1.15^owned`

This ensures meaningful progression decisions while preventing trivial optimization strategies.

---

*This PRD represents a comprehensive specification for PetSoft Tycoon MVP, designed using vertical slicing principles and modern React Native architecture patterns. Each feature is independently valuable and testable, enabling iterative development and frequent user feedback.*