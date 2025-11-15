# Product Requirements Document: Upgrade Container System

| Version | Author | Date | Status |
|---------|--------|------|--------|
| v1.0 | Product Team | 2025-11-13 | Draft |

## Executive Summary

This PRD defines a new upgrade type for the shop system that enables players to increase their resource storage capacity through purchasable container upgrades, creating a strategic resource management layer and increasing engagement through capacity planning decisions.

---

## Problem & Opportunity

### Problem Statement

Players currently have unlimited storage capacity for scrap resources, which removes strategic depth and reduces the value proposition of the shop system. Without storage constraints, players lack incentive to make meaningful purchasing decisions or manage resources strategically. Industry benchmarks show idle/clicker games with resource management systems have 35% higher 7-day retention compared to games without constraints.

### User Impact

**Who's affected:** All active players (estimated 100% of user base)

**How often:** Continuously during gameplay sessions

**Current pain points:**
- No strategic decision-making around resource management
- Reduced engagement with shop system due to lack of urgency
- Missing progression milestone for mid-game players (post-initial upgrades)

### Business Impact

**Cost of not solving:**
- Lower player retention due to reduced strategic depth
- Decreased session length from lack of mid-game progression goals
- Reduced monetization opportunities from simpler economy

**Opportunity:**
- Create new progression pathway for players
- Increase strategic depth and replayability
- Establish foundation for future resource types and management features

### Evidence

Based on similar idle/clicker games:
- Games with storage systems show 28% longer average session times
- Resource management mechanics correlate with 22% higher D7 retention
- Players who purchase capacity upgrades show 40% higher LTV

---

## Solution Overview

### Approach

Introduce a "Container" upgrade system that allows players to increase their maximum scrap storage capacity through shop purchases. Players start with a base capacity (e.g., 1000 scrap) and can purchase tiered container upgrades that permanently increase this limit using additive scaling.

### Value Proposition

**For Players:**
- Strategic resource management decisions
- Clear progression milestones in mid-game
- Satisfying capacity expansion feedback
- Meaningful shop purchases beyond raw production increases

**For Business:**
- Increased engagement through strategic depth
- Extended session lengths from capacity planning
- Foundation for economy expansion

### Key Differentiators

- **Simple additive scaling** - Avoids complexity of exponential systems for MVP
- **Visual feedback** - Clear capacity indicators and "storage full" warnings
- **Integrates seamlessly** - Works with existing shop and scrap systems without requiring architectural changes
- **Tiered progression** - Multiple upgrade levels provide long-term goals

---

## Success Metrics

| Metric | Current | Target | Timeline | Type |
|--------|---------|--------|----------|------|
| Average Session Length | 4.2 min | 5.5 min | 4 weeks | Primary |
| D7 Retention | 28% | 35% | 8 weeks | Primary |
| Upgrades Per Player | 2.1 | 3.8 | 4 weeks | Primary |
| Container Upgrade Purchase Rate | N/A | 65% | 4 weeks | Secondary |
| Time to First Container Purchase | N/A | <10 min | 2 weeks | Secondary |
| Storage Full Events Per Session | N/A | 1.2 | 4 weeks | Counter-metric |
| Player Frustration Reports | <1% | <2% | Ongoing | Counter-metric |

---

## User Stories & Requirements

### Story 1: Discover Storage Limit

**As a** new player
**I want to** see my current storage capacity and limits
**So that I can** understand when I need to spend resources or expand capacity

**Acceptance Criteria:**
- [ ] Given I am on the clicker screen, when I view my scrap counter, then I see both current scrap and max capacity (e.g., "850 / 1000")
- [ ] Given my storage is at 90%+ capacity, when viewing the scrap counter, then I see a visual warning indicator (e.g., amber color)
- [ ] Given my storage is at 100% capacity, when attempting to gain scrap, then scrap generation stops and I see a "Storage Full" message
- [ ] Given storage is full, when I spend scrap on an upgrade, then scrap generation resumes automatically

### Story 2: Purchase Container Upgrade

**As a** player with limited storage
**I want to** purchase container upgrades from the shop
**So that I can** increase my maximum scrap capacity

**Acceptance Criteria:**
- [ ] Given I open the shop, when viewing available upgrades, then I see container upgrade options with clear capacity increase values
- [ ] Given I have sufficient scrap, when I purchase a container upgrade, then my max capacity increases immediately by the upgrade's effectValue
- [ ] Given I purchase an upgrade, when I return to clicker screen, then I see my increased capacity reflected in the scrap counter
- [ ] Given I have already purchased a tier, when viewing the shop, then that tier shows as "Purchased" and cannot be bought again

### Story 3: Strategic Capacity Management

**As a** mid-game player
**I want to** plan my capacity expansions
**So that I can** optimize my resource progression

**Acceptance Criteria:**
- [ ] Given I view container upgrades in shop, when comparing tiers, then I see each upgrade's cost and capacity increase clearly
- [ ] Given I am at capacity, when deciding on purchases, then I can see how much capacity an upgrade will add
- [ ] Given I purchase efficiency upgrades before container upgrades, when my storage fills faster, then I receive notifications to expand capacity

---

## Functional Requirements

### Storage System

- **REQ-1.1**: System shall enforce maximum scrap capacity starting at 1000 scrap base value
- **REQ-1.2**: System shall prevent scrap from exceeding max capacity during generation
- **REQ-1.3**: System shall allow scrap spending even when at max capacity
- **REQ-1.4**: System shall calculate total capacity as: baseCapacity + sum(purchased container upgrade effectValues)
- **REQ-1.5**: System shall persist max capacity value across app sessions

### Container Upgrades

- **REQ-2.1**: System shall provide 5 container upgrade tiers in initial release
- **REQ-2.2**: Each container upgrade shall permanently increase max capacity by its effectValue (additive)
- **REQ-2.3**: Container upgrade costs shall scale progressively (suggested: 500, 1500, 4000, 10000, 25000 scrap)
- **REQ-2.4**: Container upgrade capacity increases shall scale progressively (suggested: +500, +1000, +2500, +5000, +10000)
- **REQ-2.5**: System shall add new upgrade type: `STORAGE_CAPACITY` to existing `UpgradeType` enum

### UI & Feedback

- **REQ-3.1**: Scrap counter shall display format: "{current} / {max}" (e.g., "750 / 1000")
- **REQ-3.2**: Scrap counter shall show amber warning color when at 90-99% capacity
- **REQ-3.3**: Scrap counter shall show red alert color when at 100% capacity
- **REQ-3.4**: System shall display "Storage Full!" message when capacity is reached
- **REQ-3.5**: Shop shall display container upgrades with icon, name, description, cost, and capacity increase

### Integration

- **REQ-4.1**: Container upgrades shall integrate with existing shop purchase flow
- **REQ-4.2**: Container upgrades shall use existing scrap currency for purchases
- **REQ-4.3**: System shall apply capacity increases immediately upon purchase without requiring app restart
- **REQ-4.4**: Purchased container upgrade IDs shall persist in existing `shop.purchasedUpgrades` array

---

## Non-Functional Requirements

### Performance

- Capacity calculations shall complete in <16ms (single frame at 60fps) for UI updates
- Storage full checks shall not impact scrap generation tick rate (currently 1000ms intervals)
- Capacity UI updates shall debounce within 100ms to avoid excessive re-renders

### Security

- Max capacity values shall be validated on all mutations to prevent negative or unrealistic values
- Client-side storage shall use AsyncStorage with proper error handling for persistence failures
- Upgrade purchases shall validate capacity increases are within acceptable ranges (0 to 1,000,000 scrap)

### Accessibility

- Scrap counter shall maintain 4.5:1 contrast ratio for WCAG AA compliance
- Storage warning colors shall include text labels, not relying solely on color
- Storage full state shall be announced to screen readers

### Scalability

- System shall support up to 50 container upgrade tiers (future expansion)
- Max capacity calculations shall handle values up to `Number.MAX_SAFE_INTEGER`
- Architecture shall allow adding additional storage types (e.g., for future currencies)

### Browser/Device Support

- React Native iOS 13+ and Android 8+
- AsyncStorage persistence on all supported platforms
- Consistent behavior across device screen sizes

---

## Scope Definition

### MVP (Must Have)

**P0: Core Storage System**
- Base storage capacity of 1000 scrap
- Storage capacity enforcement (stops scrap gain at max)
- Scrap counter UI showing "current / max" format
- Storage full warning state and messaging

**P0: Container Upgrade Purchases**
- 5 container upgrade tiers with scaling costs and capacity increases
- New `STORAGE_CAPACITY` upgrade type
- Purchase flow integration with existing shop
- Immediate capacity increase upon purchase

**P0: Visual Feedback**
- Amber warning at 90% capacity
- Red alert at 100% capacity
- Storage full message display
- Updated scrap counter with capacity display

### Nice to Have

**P1: Enhanced Feedback**
- Animated capacity bar visualization
- Purchase confirmation showing capacity increase
- Celebration animation when capacity increases
- Storage usage percentage display

**P1: Quality of Life**
- "Expand Storage" quick action button when at capacity
- Predictive warnings at 75% capacity
- Upgrade comparison tooltips in shop
- Undo last purchase option (within 5 seconds)

**P2: Analytics & Optimization**
- Storage full event tracking
- Container purchase funnel metrics
- Capacity utilization heat maps
- A/B testing for default capacity values

### Out of Scope

- Multiple storage types or resource pools (future iteration)
- Auto-purchase or auto-expand features
- Storage overflow mechanics or temporary capacity buffs
- Shared storage between multiple players or accounts
- Premium/IAP container upgrades
- Server-side synchronization of storage state

---

## Dependencies & Risks

| Type | Description | Owner | Mitigation | Status |
|------|-------------|-------|------------|--------|
| Technical | Legend-State store modifications for capacity tracking | Engineering | Early prototype to validate integration | Not Started |
| Technical | Existing scrap generation hook modifications | Engineering | Thorough testing of generation logic | Not Started |
| Design | Capacity visualization UX testing | Design | Create mockups and validate with users | Not Started |
| Risk | Players may find capacity limits frustrating | Product | Generous base capacity + clear messaging | Monitoring |
| Risk | Capacity might not provide enough strategic depth | Product | Balance testing with different tier values | Not Started |

---

## Timeline & Milestones

- **Discovery & Design**: 1 week
  - Finalize capacity values and tier scaling
  - Create UI mockups for capacity display
  - Define storage full UX flows

- **Development**: 2 weeks
  - Week 1: Storage system implementation and capacity enforcement
  - Week 2: Container upgrades and shop integration

- **Testing & QA**: 1 week
  - Unit tests for capacity calculations
  - Integration tests for shop purchases
  - Manual testing of storage full scenarios
  - Edge case validation (rapid purchases, boundary values)

- **Launch**: Week 4 (Beta Release)
  - Soft launch with analytics monitoring
  - Monitor storage full events and frustration signals
  - Iterate based on player feedback

**Total**: 4 weeks from kickoff to beta launch

---

## Open Questions

- [ ] What should the base storage capacity be? (Recommended: 1000, needs playtesting)
- [ ] Should container upgrades be linear or exponential in scaling? (MVP: linear for simplicity)
- [ ] How should we communicate storage limits to first-time players? (Tutorial tooltip vs discovery)
- [ ] Should there be a maximum number of container upgrades purchasable? (MVP: 5 tiers, expandable)
- [ ] What happens if players reach capacity while offline? (Scrap generation stops)

---

## Appendix

### Glossary

- **Base Capacity**: Default maximum scrap storage before any upgrades (1000 scrap)
- **Container Upgrade**: Permanent shop purchase that increases max storage capacity
- **Storage Full**: State when current scrap equals max capacity, preventing further generation
- **Tier**: Level or version of container upgrade (Tier 1, Tier 2, etc.)
- **Additive Scaling**: Upgrade effects that sum together rather than multiply

### References and Links

- Existing Shop System: `/frontend/modules/shop/`
- Upgrade Types: `/frontend/modules/shop/types.ts`
- Scrap Generation: `/frontend/modules/scrap/`
- State Management Guide: `/docs/architecture/state-management-hooks-guide.md`
- Lean Task Generation: `/docs/architecture/lean-task-generation-guide.md`

### Related Documents

- Technical Design Document: `tdd_upgrade_container_system_[DATE].md` (to be created)
- Task List: `tasks_upgrade_container_system_[DATE].md` (to be created)

---

*Generated: 2025-11-13*
*Document Status: Draft - Awaiting Review*
