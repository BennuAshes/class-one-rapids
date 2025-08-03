# Product Requirements Prompt (PRP)

## Prompt Overview
**Product:** PetSoft Tycoon - Idle Game v2.0
**Prompt Type:** Comprehensive PRP (PRD + Research + AI Agent Runbook)
**Created:** December 2024
**Owner:** Product Development Team  
**AI Agent Compatibility:** Structured for autonomous execution

---

## SECTION 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Document Header
**Title:** PetSoft Tycoon v2.0 - Ultimate Pet Business Software Company Idle Game
**Owner:** Product Manager / Game Design Lead
**Status:** Ready for Implementation
**Last Updated:** December 2024
**Change History:**
- v1.0 - Initial design document with research findings
- v2.0 - Comprehensive PRP with implementation guidance

### Executive Overview
**Product Vision:** Build the most polished and engaging idle game that combines proven mechanics with exceptional execution, creating an addictive "garage coder to pet tech mogul" experience.

**Problem Statement:** The idle game market lacks titles that deliver both immediate accessibility and long-term strategic depth, particularly in the underserved business simulation space with modern polish standards.

**Solution Overview:** PetSoft Tycoon leverages research-backed idle game mechanics (Cookie Clicker simplicity, Adventure Capitalist automation, Egg Inc visual feedback) with cutting-edge web technology and meticulous attention to game feel.

### Success Metrics
**Primary KPIs:**
- D1 Retention: >40% (industry benchmark: 25%)
- D7 Retention: >20% (industry benchmark: 12%)
- D30 Retention: >10% (industry benchmark: 5%)
- Session Length: 8+ minutes average
- Sessions/Day: 5+ average
- First Prestige: >60% of players
- IPO Achievement: >10% of players

**Secondary Metrics:**
- Tutorial-free onboarding: 100% success rate
- Audio enabled: >70% retention
- Social sharing: >30% of engaged players
- 60 FPS stability: >95% of sessions
- Load time: <3 seconds globally

**Success Timeline:**
- Week 1: Core mechanics validated, 60 FPS stable
- Week 2: All departments implemented and balanced
- Week 3: Polish and progression perfected
- Week 4: MVP launch ready
- Month 2: Target retention metrics achieved

### User Stories and Requirements

#### Epic 1: Core Gameplay Foundation
**Epic Goal:** Establish the addictive click-to-automate loop that hooks players immediately

**Story 1.1: Project Architecture Setup**
**As a** developer, **I want** a robust technical foundation **so that** I can build features efficiently with excellent performance.

**Acceptance Criteria:**
- [ ] Vanilla JavaScript/TypeScript project with no external dependencies
- [ ] 60 FPS game loop using RequestAnimationFrame
- [ ] Modular architecture supporting feature addition
- [ ] Performance monitoring built-in (FPS, memory, load time)
- [ ] Cross-browser compatibility (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [ ] Mobile responsive design (tablet+)

**Story 1.2: Instant Click Gratification**
**As a** player, **I want** to click and see immediate response **so that** I feel instant satisfaction.

**Acceptance Criteria:**
- [ ] "WRITE CODE" button responds in <50ms
- [ ] +1 Line of Code with typewriter sound effect
- [ ] Number popup animation with smooth easing
- [ ] Visual button feedback (hover, active states)
- [ ] Touch support for mobile devices
- [ ] Anti-spam protection (max 20 clicks/second)

**Story 1.3: Resource System Foundation**
**As a** player, **I want** to see my progress accumulate **so that** I understand the core progression loop.

**Acceptance Criteria:**
- [ ] Lines of Code counter with proper formatting (1K, 1M notation)
- [ ] Money counter appears after first feature conversion
- [ ] Smooth number animations for all changes
- [ ] Resource conversion system (10 lines = 1 feature = $15)
- [ ] Real-time calculation and display updates

**Story 1.4: First Automation Unlock**
**As a** player, **I want** to hire my first developer **so that** I experience automation satisfaction.

**Acceptance Criteria:**
- [ ] Junior Dev purchasable for $10 after 5 clicks
- [ ] Produces 0.1 lines/second with visual confirmation
- [ ] Animated dev sprite typing at desk
- [ ] Cost scaling formula: base * 1.15^owned
- [ ] Purchase confirmation with celebration effect

**Story 1.5: UI Foundation System**
**As a** player, **I want** an intuitive interface **so that** I can focus on the game experience.

**Acceptance Criteria:**
- [ ] Clean, minimalist design following mobile-first principles
- [ ] Responsive layout adapting to different screen sizes
- [ ] Visual hierarchy guiding player attention
- [ ] Accessibility features (color contrast, font sizes)
- [ ] Smooth transitions between interface states

#### Epic 2: Department Systems Implementation
**Epic Goal:** Provide strategic depth through interconnected business departments

**Story 2.1: Development Department Core**
**As a** player, **I want** to build a development team **so that** I can scale code production efficiently.

**Acceptance Criteria:**
- [ ] Four unit types: Junior Dev ($10), Mid Dev ($100), Senior Dev ($1K), Tech Lead ($10K)
- [ ] Production rates: 0.1, 0.5, 2.5, 10 lines/second respectively
- [ ] Tech Lead provides 10% department boost
- [ ] Three upgrade tiers: Better IDEs (+25/50/100% speed)
- [ ] Visual department panel with unit count display

**Story 2.2: Sales Department Integration**
**As a** player, **I want** to convert features into revenue **so that** I can fund expansion.

**Acceptance Criteria:**
- [ ] Unlocks at $500 total revenue
- [ ] Four unit types: Sales Rep ($100), Account Manager ($1K), Sales Director ($10K), VP Sales ($100K)
- [ ] Lead generation: 0.2, 1, 5, 20 leads/second respectively
- [ ] Revenue conversion: Lead + Feature = $50 (Basic), $500 (Advanced), $5K (Premium)
- [ ] VP Sales provides 15% department boost

**Story 2.3: Customer Experience Department**
**As a** player, **I want** to improve customer retention **so that** I can multiply revenue through loyalty.

**Acceptance Criteria:**
- [ ] Unlocks at $5K revenue milestone
- [ ] Support tickets resolved increase customer retention
- [ ] Retention multiplier from 1.1x to 3x based on service quality
- [ ] Happy customers generate referral leads
- [ ] Visual satisfaction meter showing customer happiness

**Story 2.4: Product Department Strategy**
**As a** player, **I want** to enhance features through research **so that** I can increase their market value.

**Acceptance Criteria:**
- [ ] Generates insights that combine with features for 2x value
- [ ] Product roadmap provides global efficiency bonuses
- [ ] User research unlocks new premium feature types
- [ ] Four unit progression with increasing complexity

**Story 2.5: Design Department Polish**
**As a** player, **I want** to add polish to my products **so that** I can maximize their market appeal.

**Acceptance Criteria:**
- [ ] Polish points increase feature value multipliers
- [ ] Experience points improve conversion rates across all sales
- [ ] Design system unlocks at 50 designers (2x all production)
- [ ] Visual polish meter showing current enhancement level

**Story 2.6: QA Department Quality**
**As a** player, **I want** to prevent bugs **so that** I can save money and maintain reputation.

**Acceptance Criteria:**
- [ ] Each bug caught saves 10x its prevention cost
- [ ] Bug prevention reduces customer support tickets
- [ ] Quality multiplier affects overall customer retention
- [ ] Zero-defect achievements unlock special bonuses

**Story 2.7: Marketing Department Amplification**
**As a** player, **I want** to amplify my reach **so that** I can grow exponentially.

**Acceptance Criteria:**
- [ ] Brand points multiply lead generation effectiveness
- [ ] Campaigns create temporary 10x revenue spikes
- [ ] Viral mechanics enable exponential customer growth
- [ ] Market domination unlocks at maximum investment

**Story 2.8: Department Synergy System**
**As a** player, **I want** departments to work together **so that** I can optimize for maximum efficiency.

**Acceptance Criteria:**
- [ ] Visual connections showing department interactions
- [ ] Synergy bonuses when departments reach milestone ratios
- [ ] Department efficiency meters showing optimization status
- [ ] Strategic decision points for resource allocation

#### Epic 3: Progression and Prestige Systems
**Epic Goal:** Provide long-term goals and meta-progression for sustained engagement

**Story 3.1: Investor Rounds Prestige**
**As a** player, **I want** to reset for permanent bonuses **so that** I can progress through different scales of business.

**Acceptance Criteria:**
- [ ] Prestige unlocks at $10M valuation
- [ ] Three rounds: Seed (1 IP per $1M), Series A ($10M+), Series B ($100M+)
- [ ] IP bonuses: Starting Capital (+10% per IP), Global Speed (+1% per IP)
- [ ] Clear visualization of prestige benefits before reset
- [ ] Prestige feels like advancement, not loss

**Story 3.2: Achievement System**
**As a** player, **I want** recognition for milestones **so that** I feel accomplished and discover new goals.

**Acceptance Criteria:**
- [ ] 50+ achievements covering all game aspects
- [ ] Achievement notifications with celebration effects
- [ ] Achievement rewards (bonus multipliers, unlocks)
- [ ] Progress tracking for incremental achievements
- [ ] Hidden achievements for discovery and exploration

**Story 3.3: Statistics and Analytics**
**As a** player, **I want** to track my progress **so that** I can understand my growth and optimize strategies.

**Acceptance Criteria:**
- [ ] Comprehensive statistics tracking all player actions
- [ ] Visual charts showing progress over time
- [ ] Comparison metrics (efficiency, growth rate, optimization)
- [ ] Export functionality for external analysis
- [ ] Performance benchmarks and personal records

#### Epic 4: Audio and Visual Polish
**Epic Goal:** Create satisfying feedback for every player action

**Story 4.1: Visual Feedback System**
**As a** player, **I want** satisfying visual responses **so that** every action feels impactful.

**Acceptance Criteria:**
- [ ] Number animations scale with magnitude (small fade, big bounce)
- [ ] Particle systems for milestone achievements
- [ ] Screen shake for major purchases and milestones
- [ ] Color progression (white → green → gold) for value tiers
- [ ] Smooth transitions for all UI state changes

**Story 4.2: Audio Design Excellence**
**As a** player, **I want** audio that enhances the experience **so that** I feel more engaged and immersed.

**Acceptance Criteria:**
- [ ] Unique sounds for different action types and values
- [ ] Audio never repeats within 0.5 seconds (variety system)
- [ ] Volume scales inverse to frequency (prevents audio spam)
- [ ] Adaptive music responding to game pace
- [ ] Audio settings with individual volume controls

**Story 4.3: Animation Polish**
**As a** player, **I want** smooth, delightful animations **so that** the game feels premium and responsive.

**Acceptance Criteria:**
- [ ] All animations run at 60 FPS with proper easing curves
- [ ] Button interactions with hover and click feedback
- [ ] Department unlock animations with anticipation
- [ ] Office evolution showing visual progress
- [ ] Celebration moments for major milestones

**Story 4.4: Particle Effects System**
**As a** player, **I want** spectacular visual effects **so that** achievements feel momentous.

**Acceptance Criteria:**
- [ ] Themed particles: code (Matrix text), money (dollars), customers (hearts)
- [ ] Performance-optimized particle pooling system
- [ ] Scalable effects based on achievement magnitude
- [ ] Optional effects for performance considerations
- [ ] Canvas-based rendering for smooth animation

#### Epic 5: Persistence and Progression
**Epic Goal:** Ensure player progress is safe and available across sessions

**Story 5.1: Save System Implementation**
**As a** player, **I want** my progress automatically saved **so that** I never lose achievements.

**Acceptance Criteria:**
- [ ] Auto-save every 30 seconds to LocalStorage
- [ ] Save compression for efficient storage
- [ ] Version migration for compatibility
- [ ] Export/import functionality for backup
- [ ] Save validation to prevent corruption

**Story 5.2: Offline Progression**
**As a** player, **I want** to make progress while away **so that** I'm motivated to return regularly.

**Acceptance Criteria:**
- [ ] Offline calculation with 12-hour cap
- [ ] Welcome back modal showing offline gains
- [ ] Accurate simulation of all department production
- [ ] Offline time bonus for extended sessions
- [ ] Clear indication of offline progress calculation

**Story 5.3: Performance Optimization**
**As a** player, **I want** smooth gameplay **so that** I can focus on strategy without technical distractions.

**Acceptance Criteria:**
- [ ] Stable 60 FPS on Intel HD Graphics 4000
- [ ] <50MB RAM usage at peak
- [ ] <3 second load time globally
- [ ] Instant response to all user inputs
- [ ] Graceful degradation on older devices

### Technical Requirements

**System Requirements:**
- **Platform**: Web-based HTML5/JavaScript
- **Performance**: 60 FPS on 5-year-old devices
- **Memory**: <50MB active usage
- **Load Time**: <3 seconds initial, <1 second subsequent loads
- **Network**: Fully functional offline after initial load

**Integration Requirements:**
- **Storage**: LocalStorage for saves (with IndexedDB fallback)
- **Audio**: Web Audio API with sound pooling
- **Graphics**: Canvas API for particle systems
- **Timing**: RequestAnimationFrame for all animations
- **Architecture**: Modular ES6 modules with TypeScript

**Platform Requirements:**
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive**: Tablet and desktop (phone not required for MVP)
- **Performance**: 60 FPS minimum on Intel HD Graphics 4000

**Compliance Requirements:**
- **Privacy**: No data collection, COPPA compliant by design
- **Accessibility**: WCAG 2.1 AA color contrast, scalable fonts
- **Security**: Client-side only, no user data transmission
- **Content**: Family-friendly, no gambling mechanics

### Assumptions, Constraints, and Dependencies

**Assumptions:**
- Players are familiar with idle game conventions
- JavaScript performance is sufficient for real-time calculations
- LocalStorage is available in all target browsers
- Players will appreciate business simulation theme

**Constraints:**
- 4-week development timeline with small team (2-3 developers)
- No external dependencies (vanilla JS/TS only)
- Must work on 5-year-old hardware
- No monetization in MVP (focus on engagement)

**Dependencies:**
- Browser API availability (LocalStorage, Web Audio, Canvas)
- TypeScript compilation toolchain
- Design asset creation and optimization
- Sound effect licensing and creation

### Risk Assessment

**High Risk:**
- **Balancing progression pacing**: Too fast = no retention, too slow = abandonment
- **Performance on older mobile devices**: Particle effects may cause frame drops
- **Initial player retention without tutorial**: Relies on intuitive design

**Mitigation Strategies:**
- Extensive playtesting with configurable balance constants
- Progressive enhancement with performance monitoring
- Tutorial-free design validated through user testing

**Medium Risk:**
- **Browser compatibility edge cases**: Audio/Canvas API differences
- **Save system corruption**: LocalStorage limitations and errors
- **Department balance complexity**: Seven systems require careful tuning

**Low Risk:**
- **Theme resonance**: Business simulation appeals to target demographic
- **Technical implementation**: Well-understood web technologies
- **Basic mechanic execution**: Proven idle game patterns

### Messaging and Positioning

**Target Audience:**
- **Primary**: Idle game enthusiasts (18-35, tech-savvy)
- **Secondary**: Casual strategy gamers seeking depth
- **Tertiary**: Tech workers who appreciate the business theme

**Value Proposition:**
- "From garage coder to pet tech mogul - the most polished idle game ever made"
- Zero learning curve with infinite strategic depth
- Satisfying progression without pay-to-win mechanics
- Premium quality execution of beloved idle game formula

**Key Messages:**
- Build your dream tech company from scratch
- Help pet businesses thrive through software innovation
- Experience perfect idle game execution with modern polish
- Strategic depth that rewards optimization and planning

### Timeline and Milestones

**Phase 1: Foundation (Week 1)**
- Core game loop and basic clicking mechanics
- First three departments (Dev, Sales, Customer Experience)
- Basic save system and offline progression
- Performance framework and monitoring

**Phase 2: Full Implementation (Week 2-3)**
- All seven departments with unique mechanics
- Complete prestige system with investor rounds
- Achievement system and statistics tracking
- Advanced audio and visual polish

**Phase 3: Polish and Launch (Week 4)**
- Animation refinement and particle effects
- Balance tuning based on internal testing
- Cross-browser compatibility verification
- Performance optimization and final testing

### Quality Validation Checklist
- [ ] All user stories follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [ ] Acceptance criteria are specific, measurable, and testable
- [ ] Success metrics are quantifiable with clear targets
- [ ] Technical requirements address performance and compatibility
- [ ] Risk assessment includes mitigation strategies
- [ ] Timeline is realistic with clear milestones
- [ ] Dependencies and constraints are explicitly documented

---

## SECTION 2: RELEVANT RESEARCH SYNTHESIS

### Research Methodology
**Analysis Scope:** All 16 research files analyzed for relevance to web-based idle game development
**Relevance Criteria:** Performance optimization, state management, architecture patterns, testing strategies, development workflows
**Synthesis Approach:** Extract actionable patterns while adapting mobile-focused research to web game context

### Core Research Insights

#### From Idle Game Design Research (Design Document)
**Proven Success Patterns:**
- **Cookie Clicker Simplicity**: Single click = single resource, buildings automate production
- **Adventure Capitalist Automation**: Manager automation, x2 multipliers at milestones, angel investors
- **Egg Inc Visual Feedback**: Production visualization, interconnected departments, transport bottlenecks
- **Critical First 5 Minutes**: No tutorials, first upgrade <10 seconds, automation visible by minute 2

**Key Learnings Applied:**
- Immediate gratification (first upgrade within 10 seconds)
- Visual production feedback (animated sprites, flowing resources)
- Prestige systems with permanent bonuses for long-term retention
- Department synergies creating strategic depth without complexity

#### From State Management Research (Highly Relevant)
**Performance-Critical Insights:**
- **Legend State**: 45ms updates vs 220ms traditional React state (5x faster)
- **MMKV Storage**: 30x faster than AsyncStorage for save operations
- **Feature-Sliced Design**: Organize code around complete features, not technical layers
- **Offline-First Architecture**: Essential for idle games with offline progression

**Applied Architecture Decisions:**
- Separate stores for game state, UI state, and persistent data
- Immutable state updates for predictable game behavior
- Computed values for derived statistics (efficiency, production rates)
- High-performance persistence with compression for save files

#### From Vertical Slicing Research (Critical for Development)
**INVEST Criteria Application:**
- **Independent**: Each feature can be developed and tested separately
- **Negotiable**: Stories can be adjusted based on playtesting feedback
- **Valuable**: Every feature delivers immediate player value
- **Estimable**: Clear scope enables accurate development planning
- **Small**: Features completable within iteration cycles
- **Testable**: Clear acceptance criteria enable validation

**Development Organization:**
- Features as modules: `/features/clicking`, `/features/departments`, `/features/prestige`
- End-to-end slices spanning UI, logic, and persistence
- Parallel development enabling multiple team members
- Risk reduction through early validation of core mechanics

#### From TypeScript Research (Essential for Quality)
**Type Safety Benefits:**
- Catch calculation errors at compile time (critical for idle game math)
- Self-documenting code through interface definitions
- Safe refactoring across large codebase
- Enhanced IDE support for development velocity

**Performance Considerations:**
- Zero runtime overhead (compilation only)
- Better optimization through static analysis
- Improved developer experience with autocompletion
- Compile-time validation prevents production bugs

#### From Automated Testing Research (Quality Assurance)
**Testing Strategy Priorities:**
- **Static Analysis**: TypeScript + ESLint for immediate error detection
- **Unit Testing**: Game calculation logic isolation and validation
- **Performance Testing**: FPS monitoring and memory profiling
- **Integration Testing**: Save/load cycle verification

**AI-Friendly Testing:**
- Headless testing without GUI dependencies
- Fast feedback loops (<30 seconds)
- Deterministic results for reliable CI/CD
- CLI-based execution for automation

### Technical Architecture Recommendations

#### Game State Architecture
Based on state management and vertical slicing research:

```typescript
interface GameState {
  // Core resources (from clicking epic)
  resources: {
    linesOfCode: number;
    money: number;
    features: number;
  };
  
  // Department states (from department epic)
  departments: {
    [key: string]: DepartmentState;
  };
  
  // Progression state (from prestige epic)
  progression: {
    investorPoints: number;
    achievements: Achievement[];
    statistics: GameStatistics;
  };
  
  // Meta state (from persistence epic)
  meta: {
    version: number;
    lastSave: number;
    totalPlayTime: number;
  };
}
```

#### Performance Optimization Strategy
From React Native and performance research:

1. **Render Optimization**:
   - RequestAnimationFrame for smooth 60 FPS
   - Object pooling for particle systems
   - Dirty checking for UI updates
   - Canvas rendering for complex visuals

2. **Memory Management**:
   - Efficient data structures for large numbers
   - Garbage collection optimization
   - Resource cleanup on component unmount
   - Memory leak prevention

3. **Calculation Optimization**:
   - Lazy evaluation for expensive computations
   - Caching of frequently used values
   - Batched updates to prevent calculation thrashing
   - Web Workers for complex calculations (future)

#### Code Organization Pattern
Applying vertical slicing principles:

```
src/
├── features/
│   ├── clicking/           # Epic 1: Core gameplay
│   │   ├── clickHandler.ts
│   │   ├── clickEffects.ts
│   │   └── clickState.ts
│   ├── departments/        # Epic 2: Department systems
│   │   ├── development/
│   │   ├── sales/
│   │   └── shared/
│   ├── progression/        # Epic 3: Prestige and achievements
│   │   ├── prestige.ts
│   │   ├── achievements.ts
│   │   └── statistics.ts
│   ├── audio-visual/      # Epic 4: Polish systems
│   │   ├── animations/
│   │   ├── particles/
│   │   └── audio/
│   └── persistence/       # Epic 5: Save system
│       ├── saveManager.ts
│       ├── offlineProgress.ts
│       └── migration.ts
├── shared/
│   ├── utils/
│   ├── types/
│   └── constants/
└── core/
    ├── gameLoop.ts
    ├── eventSystem.ts
    └── stateManager.ts
```

### Implementation Best Practices

#### From SOLID Principles Research
- **Single Responsibility**: Each department class handles only its own logic
- **Open/Closed**: Extension points for new departments without modifying existing code
- **Dependency Inversion**: Abstract interfaces for departments, audio, and persistence
- **Interface Segregation**: Specific interfaces for different system concerns

#### From Software Development Cycle Research
- **Test-Driven Development**: Write tests for game calculations before implementation
- **Continuous Integration**: Automated testing and deployment pipeline
- **Incremental Development**: Working game at every stage of development
- **Code Review**: Systematic review process for all changes

#### From Performance Research
- **Profile Before Optimizing**: Measure actual performance bottlenecks
- **Optimize Only When Necessary**: Don't sacrifice maintainability prematurely
- **Consider Caching**: Cache expensive calculations and derived values
- **Bundle Size Awareness**: Keep initial load minimal for fast startup

---

## SECTION 3: AI AGENT IMPLEMENTATION RUNBOOK

### Agent Role Definition
**Primary Role:** Full-stack web game developer implementing PetSoft Tycoon idle game
**Expertise Domain:** JavaScript/TypeScript, game development, idle game mechanics, web performance optimization
**Decision Authority:** Technical implementation choices within design constraints and research guidelines
**Success Criteria:** Deliver fully functional MVP meeting all acceptance criteria within 4-week timeline

### Structured Task Model

#### Phase 1: Technical Foundation (Week 1)
**Task Dependencies:**
```
Project Setup → Core Game Loop → State Management → Basic UI Framework
```

**Agent Instructions:**

1. **Project Initialization**
   - Create project structure following vertical slicing pattern
   - Set up TypeScript with strict configuration
   - Implement ES6 module architecture
   - Configure development server with hot reload
   - Initialize git repository with proper .gitignore

2. **Core Game Loop Implementation**
   - Implement RequestAnimationFrame-based game loop
   - Create fixed timestep logic for consistent simulation
   - Add performance monitoring (FPS, memory usage)
   - Implement frame rate limiting and adaptive quality
   - Test loop stability under various conditions

3. **State Management System**
   - Design immutable state architecture following research patterns
   - Implement state update system with validation
   - Create subscription system for UI updates
   - Add state history for debugging and undo functionality
   - Implement efficient dirty checking

4. **Basic UI Framework**
   - Create responsive layout system (mobile-first)
   - Implement component system for reusable UI elements
   - Add event handling with proper cleanup
   - Create number formatting utilities (1K, 1M notation)
   - Implement smooth animation utilities

#### Phase 2: Core Gameplay Implementation (Week 1-2)
**Task Dependencies:**
```
Click System → Resource Management → First Automation → Department Framework
```

**Agent Instructions:**

1. **Click Mechanics Implementation**
   - Create click handler with <50ms response time
   - Implement visual feedback (number popups, button states)
   - Add audio system with typewriter sound effects
   - Implement anti-spam protection (rate limiting)
   - Add touch support for mobile devices

2. **Resource System Development**
   - Implement resource counters with smooth updates
   - Create conversion system (code → features → money)
   - Add resource validation and bounds checking
   - Implement efficient large number handling
   - Create resource display formatters

3. **First Automation System**
   - Implement Junior Dev unit with purchase logic
   - Create cost scaling formula (base * 1.15^owned)
   - Add automated production with visual feedback
   - Implement unit management system
   - Create upgrade purchasing interface

4. **Department Framework**
   - Design abstract department system
   - Implement department state management
   - Create unit purchasing and management
   - Add department-specific UI panels
   - Implement synergy calculation system

#### Phase 3: Department Systems (Week 2)
**Task Dependencies:**
```
Development Dept → Sales Dept → CX Dept → Product/Design/QA/Marketing Depts → Synergies
```

**Agent Instructions:**

1. **Development Department**
   - Implement all four unit types with proper scaling
   - Create code production with visual feedback
   - Add feature conversion system
   - Implement department upgrades (IDEs, pair programming)
   - Create visual department panel

2. **Sales Department**
   - Implement lead generation mechanics
   - Create lead + feature → revenue conversion
   - Add sales unit types and progression
   - Implement department-specific bonuses
   - Create sales pipeline visualization

3. **Customer Experience Department**
   - Implement ticket resolution mechanics
   - Create retention multiplier system (1.1x to 3x)
   - Add referral lead generation
   - Implement customer satisfaction meter
   - Create support workflow simulation

4. **Remaining Departments (Product, Design, QA, Marketing)**
   - Implement unique mechanics for each department
   - Create department-specific resources and conversions
   - Add visual feedback for department activities
   - Implement milestone unlocks and bonuses
   - Create department interaction systems

5. **Department Synergy System**
   - Implement cross-department bonus calculations
   - Create visual connection indicators
   - Add efficiency optimization metrics
   - Implement strategic decision points
   - Create synergy discovery mechanics

#### Phase 4: Progression Systems (Week 2-3)
**Task Dependencies:**
```
Prestige System → Achievement System → Statistics Tracking → Balance Tuning
```

**Agent Instructions:**

1. **Prestige System Implementation**
   - Create Investor Rounds (Seed, Series A, Series B)
   - Implement Investor Points calculation and bonuses
   - Add prestige preview and confirmation UI
   - Create permanent multiplier system
   - Implement prestige celebration effects

2. **Achievement System**
   - Design 50+ achievements covering all game aspects
   - Implement achievement tracking and notification
   - Create achievement rewards (bonuses, unlocks)
   - Add achievement discovery and progress display
   - Implement hidden achievement system

3. **Statistics and Analytics**
   - Track comprehensive player action data
   - Create statistical analysis and reporting
   - Implement progress visualization charts
   - Add performance benchmarking system
   - Create data export functionality

4. **Balance Tuning**
   - Implement configurable balance constants
   - Create balance testing and adjustment tools
   - Add progression pace monitoring
   - Implement A/B testing framework
   - Create balance validation metrics

#### Phase 5: Audio-Visual Polish (Week 3)
**Task Dependencies:**
```
Animation System → Particle Effects → Audio System → Visual Polish
```

**Agent Instructions:**

1. **Animation System**
   - Implement smooth easing curves for all transitions
   - Create scalable animation based on value magnitude
   - Add button interaction feedback
   - Implement object animation with proper lifecycle
   - Create animation queue management

2. **Particle Effects System**
   - Implement Canvas-based particle rendering
   - Create particle pooling for performance
   - Add themed particle types (code, money, customers)
   - Implement celebration particle effects
   - Create performance scaling based on device capability

3. **Audio System Excellence**
   - Implement Web Audio API with sound pooling
   - Create variety system (no repeats within 0.5s)
   - Add adaptive volume based on frequency
   - Implement music system with pace adaptation
   - Create audio settings and control interface

4. **Visual Polish Implementation**
   - Add office evolution with progress milestones
   - Implement color progression system
   - Create screen shake for major events
   - Add smooth visual transitions
   - Implement celebration moments for achievements

#### Phase 6: Persistence and Performance (Week 3-4)
**Task Dependencies:**
```
Save System → Offline Progression → Performance Optimization → Testing
```

**Agent Instructions:**

1. **Save System Implementation**
   - Implement LocalStorage with compression
   - Create save versioning and migration system
   - Add auto-save every 30 seconds
   - Implement export/import functionality
   - Create save validation and corruption recovery

2. **Offline Progression**
   - Calculate offline production with 12-hour cap
   - Implement welcome back modal with gains summary
   - Create accurate simulation of all systems
   - Add offline time bonus system
   - Implement offline calculation optimization

3. **Performance Optimization**
   - Profile and optimize for 60 FPS stability
   - Implement memory usage monitoring and optimization
   - Add load time optimization and asset management
   - Create performance scaling based on device capability
   - Implement graceful degradation for older devices

4. **Testing and Quality Assurance**
   - Create comprehensive test suite
   - Implement cross-browser compatibility testing
   - Add performance regression testing
   - Create balance validation testing
   - Implement user acceptance testing procedures

### Decision Trees and Escalation Procedures

#### Performance Optimization Decision Matrix
| Scenario | Agent Action | Escalation Trigger | Human Intervention Required |
|----------|--------------|-------------------|----------------------------|
| FPS drops below 55 | Reduce particle density, optimize render calls | FPS below 45 | Architecture review needed |
| Memory usage >40MB | Implement object pooling, optimize state | Memory >60MB | Fundamental refactoring |
| Load time >2 seconds | Optimize assets, implement lazy loading | Load >4 seconds | Infrastructure change |
| Save operation >200ms | Compress save data, optimize serialization | Save >500ms | Redesign save format |

#### Balance Tuning Decision Tree
```
IF first_upgrade_time > 15_seconds:
    REDUCE costs by 25%
ELIF first_upgrade_time < 8_seconds:
    INCREASE costs by 15%

IF prestige_first_time < 45_minutes:
    INCREASE prestige_requirements by 40%
ELIF prestige_first_time > 3_hours:
    REDUCE prestige_requirements by 30%

IF retention_d1 < 35%:
    REVIEW progression_pacing AND early_game_flow
ELIF retention_d7 < 15%:
    REVIEW prestige_system AND mid_game_balance
```

#### Technical Issue Escalation
- **Browser Compatibility**: Feature detection with graceful degradation
- **Audio Issues**: Fallback to simpler audio system
- **Performance Issues**: Progressive quality reduction
- **Save Corruption**: Backup system activation with user notification

### Error Handling and Recovery

#### Common Error Patterns
1. **Save Data Corruption**
   - Validate save structure before loading
   - Maintain rolling backup of last 3 valid saves
   - Offer manual save import/export for recovery
   - Graceful degradation to default state if necessary

2. **Performance Degradation**
   - Monitor FPS and memory usage continuously
   - Automatically reduce particle effects and animations
   - Disable non-essential visual features dynamically
   - Provide performance settings for user control

3. **Browser Compatibility Issues**
   - Feature detection for all Web APIs used
   - Polyfills for missing functionality where possible
   - Graceful degradation of advanced features
   - Clear error messages for unsupported browsers

4. **Calculation Overflow**
   - Use BigNumber library for extremely large values
   - Implement safe arithmetic operations
   - Cap maximum values to prevent overflow
   - Scientific notation for display of large numbers

#### Self-Healing Mechanisms
1. **Automatic Performance Scaling**
   - Dynamic quality adjustment based on performance metrics
   - Automatic particle system scaling
   - Render optimization based on device capability
   - Memory cleanup and garbage collection optimization

2. **Save System Resilience**
   - Multiple save slots with rotation
   - Incremental saves to prevent full corruption
   - Automatic save verification after write
   - Cloud save backup (future enhancement)

3. **State Validation**
   - Continuous game state validation
   - Automatic correction of invalid states
   - Bounds checking on all numeric values
   - Consistency validation between related systems

### Communication Protocols

#### Development Progress Reporting
```markdown
## Daily Development Update
**Date:** [Current Date]
**Epic Progress:** [Current Epic] - [Completion %]

### Completed Today:
- [ ] Feature X implementation with Y acceptance criteria met
- [ ] Performance optimization achieving Z FPS improvement
- [ ] Bug fixes: [List resolved issues]

### In Progress:
- [ ] Feature A (Expected completion: [Date])
- [ ] Testing for Epic B (Coverage: X%)

### Performance Metrics:
- FPS: [Current] / 60 target
- Memory: [Current MB] / 50MB target  
- Load Time: [Current] / 3s target

### Blockers:
- [Any technical challenges requiring attention]

### Next Steps:
- [Planned work for next session]
```

#### Testing Checklist Template
```markdown
## Epic Testing: [Epic Name]
### Functional Testing:
- [ ] All user stories acceptance criteria met
- [ ] Cross-browser compatibility verified
- [ ] Performance requirements satisfied
- [ ] Error handling tested

### Technical Testing:
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Performance tests within budget
- [ ] Memory leak testing complete

### User Experience Testing:
- [ ] Intuitive interface confirmed
- [ ] Responsive design verified
- [ ] Audio/visual polish complete
- [ ] Accessibility requirements met

### Ready for Next Epic: [ ] Yes / [ ] No
**If No, list remaining items:**
```

### Continuous Improvement Framework

#### Performance Monitoring and Optimization
1. **Real-time Metrics**
   - FPS monitoring with historical tracking
   - Memory usage patterns and leak detection
   - Save/load performance profiling
   - User interaction response time measurement

2. **Automated Optimization**
   - Dynamic quality scaling based on performance
   - Automatic particle system tuning
   - Memory cleanup scheduling
   - Render optimization based on usage patterns

3. **User Feedback Integration**
   - Performance issue reporting system
   - User preference tracking for optimization
   - A/B testing framework for improvements
   - Analytics integration for usage patterns

#### Code Quality and Maintenance
1. **Continuous Refactoring**
   - Regular code review and cleanup sessions
   - Architecture improvement based on learnings
   - Performance hotspot identification and optimization
   - Documentation updates with implementation

2. **Testing Improvement**
   - Test coverage expansion for new features
   - Performance regression test development
   - User acceptance test automation
   - Cross-browser testing automation

3. **Knowledge Management**
   - Implementation decision documentation
   - Performance optimization playbook
   - Common issue resolution guides
   - Best practice extraction and sharing

---

## SECTION 4: IMPLEMENTATION VALIDATION

### Quality Assurance Checklist
- [ ] **PRD Completeness**: All game mechanics defined with measurable acceptance criteria
- [ ] **Research Integration**: Technical patterns properly applied from relevant research
- [ ] **Runbook Clarity**: Step-by-step implementation path with decision support
- [ ] **Decision Trees**: Common scenarios covered with clear escalation paths
- [ ] **Error Handling**: Likely failure modes addressed with recovery procedures
- [ ] **Communication**: Progress tracking and reporting protocols established
- [ ] **Performance**: Clear targets and optimization strategies defined
- [ ] **Testing**: Comprehensive validation approach for all epics

### Success Validation Framework

#### 1. PRD Quality Assessment
**Completeness Criteria:**
- All 5 epics with complete user stories and acceptance criteria
- Technical requirements addressing performance, compatibility, and security
- Clear success metrics with quantifiable targets
- Risk assessment with identified mitigation strategies
- Realistic timeline with clear dependencies

**Quality Validation:**
- User stories follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Acceptance criteria are specific, measurable, and testable
- Technical requirements address scalability and maintainability
- Success metrics align with business objectives

#### 2. Research Integration Verification
**Relevant Research Applied:**
- State management patterns for game state architecture
- Vertical slicing principles for development organization
- TypeScript benefits for code quality and developer experience
- Performance optimization techniques from mobile research
- Testing strategies adapted for web game development

**Integration Quality:**
- Research insights directly inform technical decisions
- Architecture recommendations based on proven patterns
- Performance targets derived from research benchmarks
- Development workflow optimized using research findings

#### 3. Implementation Readiness Assessment
**Runbook Completeness:**
- Clear phase-by-phase implementation guide
- Structured task dependencies and sequencing
- Decision trees for common technical scenarios
- Error handling and recovery procedures
- Performance monitoring and optimization guidelines

**Execution Feasibility:**
- 4-week timeline achievable with provided guidance
- Technical complexity appropriate for team capabilities
- Clear success criteria for each development phase
- Risk mitigation strategies for identified challenges

### Iteration Recommendations

#### Short-term Enhancements (Post-MVP)
1. **Cloud Save Integration**
   - Implement cloud save synchronization
   - Add cross-device progression continuity
   - Create save backup and restore capabilities

2. **Advanced Analytics**
   - Player behavior tracking and analysis
   - A/B testing framework for balance optimization
   - Performance analytics and optimization insights

3. **Social Features**
   - Achievement sharing and comparison
   - Leaderboards for progression milestones
   - Community challenges and events

#### Medium-term Expansion (Month 2-3)
1. **Mobile Application**
   - React Native port using existing research
   - Native mobile optimizations and features
   - Cross-platform progression synchronization

2. **Advanced Content**
   - Additional departments and mechanics
   - Seasonal events and time-limited content
   - Advanced prestige systems and meta-progression

3. **Monetization Integration**
   - Time warp purchases and convenience features
   - Premium progression bonuses and cosmetics
   - Ad-supported bonus systems

#### Long-term Vision (Month 4+)
1. **Steam Release**
   - Desktop application packaging
   - Steam Workshop integration for user content
   - Achievement and trading card integration

2. **Sequel Development**
   - Expanded universe with new business themes
   - Advanced simulation mechanics
   - Multiplayer competitive and cooperative modes

3. **Platform Expansion**
   - Console adaptations for casual gaming
   - VR experience development
   - Educational institution licensing

---

## APPENDIX: RESEARCH REFERENCE INDEX

### Applied Research Areas
**High Impact Research:**
- **State Management**: Core architecture for game state and persistence
- **Vertical Slicing**: Development organization and feature delivery
- **TypeScript**: Code quality, developer experience, and maintainability
- **Automated Testing**: Quality assurance and continuous integration
- **Performance Optimization**: 60 FPS requirements and optimization strategies

**Medium Impact Research:**
- **Software Development Cycle**: Development workflow and team practices
- **SOLID Principles**: Code architecture and maintainability patterns
- **AI Agent Runbooks**: Implementation guidance and decision frameworks

**Supporting Research:**
- **React Native/Expo**: Mobile development insights adapted for web
- **Context Engineering**: Advanced prompt and instruction optimization
- **Product Document Requirements**: PRD structure and best practices

### Research Integration Map

#### State Management → Game Architecture
- **Legend State Performance**: Informed decision to use efficient state updates
- **Feature-Sliced Design**: Organized code around game features rather than technical layers
- **Offline-First Patterns**: Essential for idle game offline progression
- **MMKV Performance**: LocalStorage optimization strategies for save system

#### Vertical Slicing → Development Organization
- **INVEST Criteria**: User story quality and independence
- **End-to-End Delivery**: Complete features spanning UI to persistence
- **Parallel Development**: Enable multiple developers to work simultaneously
- **Risk Reduction**: Early validation through minimal viable features

#### TypeScript → Code Quality
- **Type Safety**: Prevent calculation errors critical in idle games
- **Developer Experience**: Enhanced IDE support and refactoring safety
- **Documentation**: Self-documenting code through interface definitions
- **Performance**: Zero runtime overhead with compile-time optimization

#### Testing Strategy → Quality Assurance
- **Static Analysis**: TypeScript and ESLint for immediate error detection
- **Unit Testing**: Game calculation logic isolation and validation
- **Performance Testing**: FPS monitoring and memory profiling
- **Headless Testing**: AI-friendly testing without GUI dependencies

### Additional Research Recommendations

#### For Future Development Phases
1. **WebAssembly Research**
   - High-performance calculations for complex simulations
   - Cross-platform native performance for mobile ports
   - Advanced graphics rendering for 3D visualizations

2. **Progressive Web App (PWA) Research**
   - Offline capability enhancement beyond current implementation
   - Native app-like experience on mobile devices
   - Push notification systems for engagement

3. **WebGL and Advanced Graphics Research**
   - Advanced particle systems and visual effects
   - 3D visualization of business growth and office evolution
   - Shader-based effects for premium visual experience

4. **Multiplayer and Real-time Systems Research**
   - WebSocket implementation for competitive features
   - Peer-to-peer networking for community features
   - Server architecture for persistent world features

#### For Team Development
1. **Game Analytics Research**
   - Player behavior analysis and retention optimization
   - A/B testing methodologies for game balance
   - Conversion funnel analysis for engagement improvement

2. **Accessibility Research**
   - Screen reader compatibility for visually impaired players
   - Motor accessibility for players with limited mobility
   - Cognitive accessibility for players with attention challenges

3. **Localization Research**
   - International market expansion strategies
   - Cultural adaptation for different regions
   - Technical implementation of multi-language support