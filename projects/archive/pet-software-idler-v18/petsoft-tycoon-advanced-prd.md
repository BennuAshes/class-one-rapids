# PetSoft Tycoon: Product Requirements Document

## Executive Summary

### Product Vision
PetSoft Tycoon is an engaging idle/incremental game that simulates building a software company from a garage startup to a billion-dollar IPO. Players experience the authentic journey of software entrepreneurship through seven interconnected departments, each with unique mechanics and progression paths.

### Strategic Objectives
- Create an accessible idle game that demonstrates software industry dynamics
- Deliver 2-4 weeks of engaged gameplay culminating in IPO achievement
- Target mobile and web platforms with offline-first functionality
- Establish foundation for potential monetization without pay-to-win mechanics

### Success Criteria
- Player retention: 70% Day 1, 40% Day 7, 20% Day 30
- Average session length: 5-15 minutes
- Time to IPO: 2-4 weeks of engaged play
- Performance: <50ms input response, 60fps animations

## User Personas

### Primary: The Casual Incrementalist
- **Demographics:** 25-45 years old, mobile-first, plays during commute/breaks
- **Motivations:** Progression satisfaction, minimal time commitment, achievement unlocks
- **Pain Points:** Complex UIs, forced engagement, unclear progression
- **Usage Pattern:** 3-5 sessions/day, 5-10 minutes each

### Secondary: The Software Professional
- **Demographics:** 22-50 years old, understands tech industry dynamics
- **Motivations:** Industry humor, realistic progression simulation, depth
- **Pain Points:** Unrealistic mechanics, shallow gameplay, lack of authenticity
- **Usage Pattern:** Longer sessions, deeper engagement with mechanics

### Tertiary: The Hardcore Idler
- **Demographics:** Wide range, experienced with idle games
- **Motivations:** Optimization, prestige mechanics, mathematical progression
- **Pain Points:** Unbalanced economies, lack of depth, poor prestige systems
- **Usage Pattern:** Extended play sessions, spreadsheet optimization

## User Stories & Acceptance Criteria

### Epic 1: Core Gameplay Loop

#### Story 1.1: First-Time Player Onboarding
**As a new player, I want immediate feedback from my first action so I feel engaged from second one.**

**Acceptance Criteria:**
- [ ] "WRITE CODE" button is center screen with pulsing animation
- [ ] First click produces +1 Line of Code with typewriter sound
- [ ] Code counter animates with each increment
- [ ] After 5 clicks, "Hire Junior Dev $10" button appears
- [ ] All feedback occurs within 100ms of click

#### Story 1.2: Automation Discovery
**As a player, I want to understand automation benefits within 30 seconds so I stay engaged.**

**Acceptance Criteria:**
- [ ] Junior Dev produces 0.1 lines/second with visible typing animation
- [ ] "Ship Feature" button appears after first hire
- [ ] Feature shipping converts 10 lines → $15 with audio feedback
- [ ] Money counter updates with cash register sound
- [ ] Second dev option appears at $25

#### Story 1.3: Department Progression
**As a player, I want to unlock new departments so I experience growth and complexity.**

**Acceptance Criteria:**
- [ ] Sales department unlocks at $500 with visual office expansion
- [ ] Each department has unique visual identity and mechanics
- [ ] Department synergies are clearly communicated
- [ ] Progression path is always visible to player

### Epic 2: Department Systems

#### Story 2.1: Development Department
**As a player, I want to build a development team that produces code efficiently.**

**Acceptance Criteria:**
- [ ] Four unit types: Junior Dev ($10), Mid Dev ($100), Senior Dev ($1K), Tech Lead ($10K)
- [ ] Production rates: 0.1, 0.5, 2.5, 10 lines/sec respectively
- [ ] Tech Lead provides 10% department boost
- [ ] Three upgrade paths: IDEs, Pair Programming, Code Reviews
- [ ] Cost formula: Base × 1.15^owned

#### Story 2.2: Sales Department
**As a player, I want to convert features into revenue through sales activities.**

**Acceptance Criteria:**
- [ ] Lead generation: Sales Rep (0.2/sec), Account Manager (1/sec), Sales Director (5/sec), VP Sales (20/sec)
- [ ] Revenue conversion: Basic Feature + Lead = $50, Advanced = $500, Premium = $5K
- [ ] VP Sales provides 15% department boost
- [ ] Upgrades: CRM System (+30% leads), Sales Training (2x at 25 reps), Partnerships (+50% revenue)

#### Story 2.3: Customer Experience Department
**As a player, I want to increase customer lifetime value through support activities.**

**Acceptance Criteria:**
- [ ] Support ticket resolution increases retention (1.1x → 3x revenue multiplier)
- [ ] Happy customers generate referral leads
- [ ] Four unit types with escalating costs and production
- [ ] Knowledge Base auto-resolves 25% of tickets at upgrade

### Epic 3: Progression & Prestige

#### Story 3.1: Prestige System (Investor Rounds)
**As a player, I want meaningful reset mechanics that accelerate future progress.**

**Acceptance Criteria:**
- [ ] Prestige available at $10M valuation
- [ ] Formula: 1 IP per $1M valuation at reset
- [ ] IP bonuses: Starting Capital (+10%), Global Speed (+1%), Department Synergy (+2% per 10 IP)
- [ ] Super Units unlock at 100, 1K, 10K IP thresholds

#### Story 3.2: Mathematical Balance
**As a developer, I want balanced progression that maintains engagement across all game phases.**

**Acceptance Criteria:**
- [ ] Purchase timing: 10s first, 30s early game, 2min mid-game, 10min late game
- [ ] No impossible progression walls
- [ ] Offline progression accurately calculated
- [ ] Achievement milestones aligned with natural progression

### Epic 4: Polish & Feedback

#### Story 4.1: Visual Feedback Systems
**As a player, I want immediate visual feedback that makes my actions feel impactful.**

**Acceptance Criteria:**
- [ ] Number popups with color progression (white → green → gold)
- [ ] Screen shake on milestone achievements
- [ ] Particle systems for major events
- [ ] Department activity animations scale with production speed

#### Story 4.2: Audio Design
**As a player, I want audio feedback that enhances the experience without becoming annoying.**

**Acceptance Criteria:**
- [ ] Core sounds: keyboard clicks, cash register, notifications
- [ ] No sound repetition within 0.5 seconds
- [ ] Volume scales inverse to frequency
- [ ] Milestone sounds override normal sounds
- [ ] Music adapts to game pace

### Epic 5: Technical Requirements

#### Story 5.1: Performance Standards
**As a player, I want responsive gameplay regardless of device capabilities.**

**Acceptance Criteria:**
- [ ] <50ms input response time
- [ ] 60fps animations and progress bars
- [ ] Efficient save/load system (local storage)
- [ ] Accurate offline progression calculation
- [ ] Cross-platform compatibility (iOS, Android, Web)

## Technical Requirements

### Platform Requirements
- **Primary Platforms:** iOS, Android, Web
- **Technology Stack:** React Native with web export capability
- **Minimum iOS:** 12.0
- **Minimum Android:** API 21 (Android 5.0)
- **Web Browsers:** Chrome 80+, Safari 13+, Firefox 75+

### Performance Specifications
- **Input Latency:** <50ms button response
- **Frame Rate:** 60fps sustained during gameplay
- **Battery Impact:** <5% drain per hour on mobile
- **Storage:** <100MB total app size
- **Memory:** <256MB peak usage

### Data Management
- **Save System:** Local storage with cloud backup option
- **Offline Progression:** Accurate calculation up to 7 days
- **Data Persistence:** Atomic saves every 30 seconds
- **Export/Import:** JSON-based save file system

### Accessibility
- **Visual:** High contrast mode, adjustable font sizes
- **Audio:** Volume controls, sound effect toggles
- **Motor:** Large touch targets (44pt minimum)
- **Cognitive:** Clear visual hierarchy, optional tutorial

## Success Metrics

### Player Engagement
- **Day 1 Retention:** 70% target
- **Day 7 Retention:** 40% target  
- **Day 30 Retention:** 20% target
- **Session Length:** 5-15 minutes average
- **Sessions per Day:** 3-5 target

### Progression Metrics
- **Time to First Prestige:** 2-4 hours
- **Time to IPO:** 14-28 days
- **Feature Completion Rate:** 95% core loop, 80% all departments
- **Achievement Unlock Rate:** 60% casual players, 90% hardcore

### Technical Performance
- **Crash Rate:** <0.1% sessions
- **Load Time:** <3 seconds cold start
- **Battery Impact:** <5% per hour
- **User Rating:** 4.2+ average

### Business Metrics (Post-Launch)
- **Daily Active Users:** Growth trajectory target
- **User Acquisition Cost:** Platform-specific targets
- **Lifetime Value:** Engagement-based modeling
- **Organic Growth:** Viral coefficient tracking

## Competitive Analysis

### Direct Competitors

#### AdVenture Capitalist
- **Strengths:** Proven business model, clear progression, popular theme
- **Weaknesses:** Simplified mechanics, heavy monetization, aging design
- **Differentiation:** More authentic software industry simulation, deeper department interactions

#### Egg, Inc.
- **Strengths:** Beautiful visuals, satisfying progression, regular updates
- **Weaknesses:** Single theme, limited strategic depth
- **Differentiation:** Multi-department strategy, prestige complexity, industry relevance

#### Cookie Clicker
- **Strengths:** Addictive core loop, extensive upgrade trees, cult following
- **Weaknesses:** Basic visuals, web-only, overwhelming late game
- **Differentiation:** Mobile-first, professional theme, balanced progression

### Indirect Competitors
- **Game Dev Tycoon:** Similar theme but different genre
- **Two Point Hospital:** Management simulation with humor
- **RollerCoaster Tycoon Touch:** Established tycoon brand on mobile

### Competitive Advantages
1. **Authentic Industry Experience:** Realistic software development progression
2. **Balanced Monetization:** No pay-to-win mechanics in MVP
3. **Cross-Platform:** Web and mobile from launch
4. **Department Synergies:** Strategic depth beyond simple clicking
5. **Performance Focus:** 60fps on mid-range devices

## Development Timeline

### Phase 1: Core Foundation (Weeks 1-4)
**Deliverables:**
- [ ] Basic game loop (code → features → money)
- [ ] Development department with 4 unit types
- [ ] Save/load system with offline progression
- [ ] Core UI framework and basic animations
- [ ] Development environment and build pipeline

**Dependencies:** Technology stack selection, art style guide
**Risk Factors:** Platform compatibility issues, performance bottlenecks

### Phase 2: Department Systems (Weeks 5-8)
**Deliverables:**
- [ ] Sales department with lead/conversion mechanics
- [ ] Customer Experience department with retention system
- [ ] Product, Design, QA departments
- [ ] Department interaction systems
- [ ] Achievement framework

**Dependencies:** Core foundation stability, art asset production
**Risk Factors:** Complexity scaling, balance tuning requirements

### Phase 3: Progression & Polish (Weeks 9-12)
**Deliverables:**
- [ ] Marketing department completion
- [ ] Prestige system (Investor Rounds)
- [ ] Audio system and sound effects
- [ ] Visual polish and particle systems
- [ ] Performance optimization

**Dependencies:** All departments functional, audio asset creation
**Risk Factors:** Polish scope creep, platform-specific issues

### Phase 4: Testing & Launch Prep (Weeks 13-16)
**Deliverables:**
- [ ] Cross-platform testing and optimization
- [ ] Balance tuning based on playtesting
- [ ] Store preparation and marketing materials
- [ ] Launch day infrastructure
- [ ] Post-launch monitoring setup

**Dependencies:** Complete feature set, app store approval
**Risk Factors:** Approval delays, critical bugs, market timing

## MVP Scope Definition

### Must-Have Features (Launch Blockers)
- [ ] Complete seven-department system
- [ ] Functional prestige mechanics
- [ ] Save/load with offline progression
- [ ] Core audio/visual feedback
- [ ] Cross-platform compatibility
- [ ] Performance standards met

### Should-Have Features (Launch Targets)
- [ ] Achievement system (50 achievements)
- [ ] Statistics tracking and display
- [ ] Advanced visual effects
- [ ] Balanced economy through IPO
- [ ] Tutorial-free onboarding

### Could-Have Features (Post-Launch)
- [ ] Cloud save synchronization  
- [ ] Social features (leaderboards)
- [ ] Additional prestige tiers
- [ ] Seasonal events/content
- [ ] Advanced statistics/analytics

### Won't-Have Features (Explicit Exclusions)
- [ ] Multiplayer functionality
- [ ] In-app purchases (MVP phase)
- [ ] Social media integration
- [ ] Platform-specific features
- [ ] Complex tutorial system

## Risk Assessment & Mitigation

### Technical Risks

#### High Priority
**Risk:** Performance degradation with large numbers
- **Impact:** Unplayable experience on mid-range devices
- **Probability:** Medium
- **Mitigation:** Early performance testing, number formatting optimization, efficient calculation batching

**Risk:** Save corruption or data loss
- **Impact:** Player frustration and churn
- **Probability:** Low
- **Mitigation:** Atomic saves, backup systems, extensive testing across platforms

#### Medium Priority
**Risk:** Cross-platform compatibility issues
- **Impact:** Delayed launch or platform exclusion
- **Probability:** Medium
- **Mitigation:** Regular testing on target devices, platform-specific QA cycles

### Design Risks

#### High Priority
**Risk:** Poor game balance leading to progression walls
- **Impact:** Player abandonment, negative reviews
- **Probability:** Medium
- **Mitigation:** Mathematical modeling, extensive playtesting, post-launch balance patches

**Risk:** Overwhelming complexity for casual players
- **Impact:** Low retention, market positioning failure
- **Probability:** Medium
- **Mitigation:** Progressive disclosure, intuitive UI design, casual player testing

### Market Risks

#### Medium Priority
**Risk:** Saturated idle game market
- **Impact:** Low discoverability, high acquisition costs
- **Probability:** High
- **Mitigation:** Strong differentiation, software industry appeal, organic growth focus

**Risk:** Platform policy changes affecting launch
- **Impact:** Launch delays, feature modifications
- **Probability:** Low
- **Mitigation:** Policy monitoring, compliance-first approach, multi-platform strategy

### Business Risks

#### Low Priority
**Risk:** Post-launch monetization challenges
- **Impact:** Revenue shortfall, sustainability issues
- **Probability:** Medium
- **Mitigation:** Engagement-first approach, proven monetization models, community feedback

## Post-Launch Strategy

### Content Updates (Months 1-3)
- [ ] Balance adjustments based on player data
- [ ] Additional achievement tiers
- [ ] Quality of life improvements
- [ ] Bug fixes and performance optimizations

### Feature Expansion (Months 4-6)
- [ ] Cloud save implementation
- [ ] Social features (leaderboards, sharing)
- [ ] Additional prestige content
- [ ] Platform-specific optimizations

### Monetization Introduction (Month 6+)
- [ ] Time Warp purchases ($0.99-$4.99)
- [ ] Starter Pack bundles ($2.99-$9.99)
- [ ] Ad-based temporary boosts
- [ ] Premium tier consideration ($9.99)

### Long-term Evolution (Year 1+)
- [ ] Industry event system
- [ ] Competitor mechanics
- [ ] Multiple office locations
- [ ] Platform marketplace features

## Appendix

### Glossary
- **IP (Investment Points):** Prestige currency earned through company valuation resets
- **Department Synergy:** Bonus effects from multiple departments working together
- **Prestige Reset:** Voluntary restart with permanent bonuses
- **Unit Scaling:** Mathematical progression of costs and production rates

### Technical Specifications
- **Save Format:** JSON with versioning and migration support
- **Animation System:** CSS-based with JavaScript timing control
- **Number Format:** Scientific notation with locale-appropriate formatting
- **Calculation Precision:** BigNumber.js for large value handling

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-14  
**Next Review:** Pre-development kickoff  
**Approvers:** Product Owner, Engineering Lead, Design Lead