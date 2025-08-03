# Cross-Epic Dependencies

## Epic Dependency Mapping

### Epic 1: Core Foundation
**Dependencies**: None (Foundation epic)
**Blocks**: All other epics depend on Epic 1 completion
**Critical Path**: Stories 1.1 → 1.2 → 1.3 → 1.4 enable all department work

### Epic 2: Department Systems  
**Dependencies**: Epic 1 (Core Foundation)
**Blocks**: Epic 3 (Employee Management), Epic 4 (Progression features)
**Critical Path**: Department systems must be functional before advanced employee features

### Epic 3: Employee Management
**Dependencies**: Epic 2 (Department Systems)
**Blocks**: Epic 4 (Achievement/Prestige systems need employee metrics)
**Critical Path**: Employee systems enable prestige and achievement tracking

### Epic 4: Progression & Monetization
**Dependencies**: Epic 3 (Employee Management), partial Epic 2
**Blocks**: Epic 5 (Polish features need progression systems)
**Critical Path**: Achievement system enables social features

### Epic 5: Polish & Infrastructure
**Dependencies**: All other epics (Polish and infrastructure touches everything)
**Blocks**: None (Final epic)
**Critical Path**: Performance optimization must come after core features

## Integration Points

### Resource Flow Integration
- Clicking (1.2) → Resource System (1.3) → Department Production (2.1-2.4)
- Development (2.1) → Sales (2.2) → Revenue → More hiring (3.1)
- Design (2.4) → Quality (2.3) → Customer satisfaction multipliers

### State Management Integration
- All department states managed through unified Legend State architecture
- Cross-department synergies (3.4) affect all production calculations
- Achievement system (4.1) tracks progress across all departments

### UI/UX Integration
- UI Foundation (1.5) provides components for all departments
- Feedback System (1.6) enhances all player interactions
- Department navigation must be consistent across all systems