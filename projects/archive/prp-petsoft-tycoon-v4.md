# Product Requirements Prompt (PRP): PetSoft Tycoon

## Prompt Overview
**Product:** PetSoft Tycoon: Professional Edition v1.0
**Prompt Type:** Comprehensive PRP (PRD + Research + Technical Architecture + AI Agent Runbook)
**Created:** 2025-08-03
**Owner:** Product Development Team
**AI Agent Compatibility:** Structured for autonomous execution with full architectural guidance

---

## SECTION 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Document Header
**Title:** PetSoft Tycoon: Professional Edition v1.0
**Owner:** Product Development Team
**Status:** Approved for Development
**Last Updated:** 2025-08-03
**Change History:** v1.0 - Initial comprehensive PRP with architectural specifications

### Executive Overview

**Product Vision:** 
PetSoft Tycoon is a premium idle/incremental mobile game that simulates building a pet software company from garage startup to IPO. Players experience the entrepreneurial journey through engaging automation mechanics, strategic department management, and satisfying progression systems.

**Problem Statement:** 
The mobile idle game market lacks sophisticated business simulation games that combine the addictive progression of clicker games with the strategic depth of business management. Existing idle games focus on simple mechanics without meaningful strategic choices or compelling business narratives.

**Solution Overview:** 
PetSoft Tycoon delivers a premium idle game experience that combines proven incremental mechanics with deep business simulation elements. Seven interconnected departments create strategic gameplay depth while maintaining the satisfying automation and progression that defines the genre.

### Success Metrics

**Primary KPIs:**
- D1 Retention: >40% (industry benchmark: 35%)
- D7 Retention: >20% (industry benchmark: 15%)
- D30 Retention: >10% (industry benchmark: 8%)
- Session Length: 8+ minutes (industry benchmark: 5 minutes)
- Sessions/Day: 5+ (industry benchmark: 3)

**Secondary Metrics:**
- Tutorial Completion Rate: >90%
- First Prestige Achievement: >60%
- Second Prestige Achievement: >40%
- IPO Achievement (Victory): >10%
- Audio Enabled Rate: >70%
- Share/Recommendation Rate: >30%

**Success Timeline:**
- Beta Launch: Week 4 (MVP completion)
- Public Launch: Week 6 (Polish + Marketing)
- First Major Update: Week 12 (Conference Update)
- Platform Expansion: Week 16 (Desktop/Console)

### User Stories and Requirements

#### Epic 1: Core Foundation
**Story 1.1:** Project Architecture Setup
- **As a** development team, **I want** a properly configured React Native Expo project **so that** we can build efficiently with modern architecture
- **Acceptance Criteria:**
  - Expo SDK 52+ with TypeScript configuration
  - Legend State v3 with MMKV persistence setup
  - Vertical slice folder structure implemented
  - Testing framework configured (Jest + React Native Testing Library)
  - Build targets iOS, Android, and Web successfully

**Story 1.2:** Instant Click Gratification
- **As a** new player, **I want** immediate satisfying feedback from clicking **so that** I'm instantly engaged
- **Acceptance Criteria:**
  - Single click produces +1 Line of Code with visual feedback
  - Typewriter sound effect plays on each click
  - Number animations show progress clearly
  - First upgrade appears within 10 seconds of play
  - Visual particle effects celebrate achievements

**Story 1.3:** Resource System Foundation
- **As a** player, **I want** clear resource management **so that** I understand how to progress
- **Acceptance Criteria:**
  - Lines of Code primary resource with real-time display
  - Money secondary resource generated from features
  - Resource conversion system (10 lines = 1 feature)
  - Clear visual indicators for resource flow
  - Persistent resource storage between sessions

**Story 1.4:** First Automation Unlock
- **As a** player, **I want** to automate repetitive tasks **so that** I can focus on strategy
- **Acceptance Criteria:**
  - First Junior Developer hireable at $10
  - Automated code generation (0.1 lines/sec)
  - Visual representation of developer working
  - Clear indication that automation is active
  - Progression path to more automation visible

**Story 1.5:** UI Foundation System
- **As a** player, **I want** a polished interface **so that** I can navigate and understand the game easily
- **Acceptance Criteria:**
  - Clean, intuitive department navigation
  - Responsive design for mobile and tablet
  - Accessibility support for screen readers
  - Consistent visual design system
  - Smooth transitions and animations (60 FPS)

**Story 1.6:** Feedback System (Particles & Sound)
- **As a** player, **I want** satisfying audiovisual feedback **so that** every action feels rewarding
- **Acceptance Criteria:**
  - Particle effects for all major actions
  - Layered sound design with adaptive mixing
  - Visual feedback hierarchy for different achievements
  - Audio settings for volume control
  - Performance optimization for continuous effects

#### Epic 2: Department Systems
**Story 2.1:** Development Department
- **As a** player, **I want** to build and manage a development team **so that** I can produce software features
- **Acceptance Criteria:**
  - Four developer types with unique production rates
  - Upgrade system for enhanced productivity
  - Visual representation of team working
  - Department synergies with other teams
  - Scaling economics (costs increase with team size)

**Story 2.2:** Sales Department
- **As a** player, **I want** to convert features into revenue **so that** I can fund expansion
- **Acceptance Criteria:**
  - Sales team generates customer leads
  - Lead + Feature conversion system for revenue
  - Sales process visualization
  - Customer relationship management mechanics
  - Revenue optimization through team upgrades

**Story 2.3:** Testing Department
- **As a** player, **I want** quality assurance **so that** I can prevent costly bugs
- **Acceptance Criteria:**
  - QA team catches and prevents bugs
  - Bug prevention saves money and reduces support costs
  - Quality multipliers affect customer satisfaction
  - Testing process visualization
  - Quality gates unlock at team milestones

**Story 2.4:** Design Department
- **As a** player, **I want** design team **so that** I can polish products for higher value
- **Acceptance Criteria:**
  - Design team generates polish points
  - Polish multiplies feature value and conversion rates
  - Visual design system unlocks team bonuses
  - Creative process visualization
  - Design-development collaboration bonuses

#### Epic 3: Employee Management
**Story 3.1:** Employee Hiring System
- **As a** player, **I want** to hire and manage employees **so that** I can scale my business
- **Acceptance Criteria:**
  - Individual employee hiring across departments
  - Salary and performance management
  - Employee satisfaction mechanics
  - Hiring cost progression with supply/demand
  - Performance metrics and KPIs

**Story 3.2:** Employee Types and Roles
- **As a** player, **I want** different employee specializations **so that** I can optimize for different strategies
- **Acceptance Criteria:**
  - Junior, Mid, Senior, and Leadership roles
  - Unique abilities and production rates per role
  - Role progression and promotion systems
  - Specialization bonuses (full-stack, frontend, backend)
  - Leadership roles provide team multipliers

**Story 3.3:** Employee Upgrades
- **As a** player, **I want** to improve employee capabilities **so that** I can increase productivity
- **Acceptance Criteria:**
  - Training programs for skill development
  - Equipment upgrades (laptops, tools)
  - Certification and education bonuses
  - Workplace improvement investments
  - Performance tracking and optimization

**Story 3.4:** Department Synergies
- **As a** player, **I want** departments to work together **so that** I create strategic gameplay depth
- **Acceptance Criteria:**
  - Cross-department collaboration bonuses
  - Project-based team formations
  - Communication and efficiency multipliers
  - Bottleneck identification and resolution
  - Organizational culture bonuses

**Story 3.5:** Performance Management
- **As a** player, **I want** to optimize team performance **so that** I can achieve business goals
- **Acceptance Criteria:**
  - Individual and team performance metrics
  - Motivation and satisfaction systems
  - Performance review and feedback cycles
  - Goal setting and achievement tracking
  - Retention and turnover management

#### Epic 4: Progression & Monetization
**Story 4.1:** Achievement System
- **As a** player, **I want** recognition for accomplishments **so that** I feel motivated to continue
- **Acceptance Criteria:**
  - 50+ achievements across all game systems
  - Achievement categories (milestones, efficiency, creativity)
  - Visual badge system with rarity tiers
  - Achievement bonuses and rewards
  - Social sharing capabilities

**Story 4.2:** Prestige System
- **As a** player, **I want** strategic reset mechanics **so that** I can pursue long-term progression
- **Acceptance Criteria:**
  - Investor Round prestige system (Seed, Series A, B, C)
  - Investor Points currency with permanent bonuses
  - Strategic reset timing decisions
  - Prestige unlocks and new content
  - Multiple prestige layer depth

**Story 4.3:** Coffee Shop Soft Currency
- **As a** player, **I want** secondary progression currency **so that** I have additional goals
- **Acceptance Criteria:**
  - Office coffee shop generates premium currency
  - Premium upgrades and cosmetic purchases
  - Employee happiness bonuses from coffee
  - Social gathering and culture bonuses
  - Limited-time coffee shop events

**Story 4.4:** Premium Features
- **As a** player, **I want** optional premium content **so that** I can enhance my experience
- **Acceptance Criteria:**
  - Time warp purchases for progression acceleration
  - Starter packs for new player convenience
  - Premium aesthetic upgrades (themes, animations)
  - No pay-to-win mechanics (convenience only)
  - Fair pricing structure ($0.99 - $9.99)

**Story 4.5:** Social Features & Leaderboards
- **As a** player, **I want** to compete and compare **so that** I can share my success
- **Acceptance Criteria:**
  - Global leaderboards by multiple metrics
  - Friend comparison and sharing
  - Guild/company alliance systems
  - Weekly competitions and events
  - Social achievement sharing

**Story 4.6:** Events and Special Content
- **As a** player, **I want** fresh content regularly **so that** I stay engaged
- **Acceptance Criteria:**
  - Monthly themed events (conferences, trade shows)
  - Limited-time bonuses and challenges
  - Special unlockable content during events
  - Event leaderboards and rewards
  - Seasonal cosmetic content

#### Epic 5: Polish & Infrastructure
**Story 5.1:** Performance Optimization
- **As a** player, **I want** smooth gameplay **so that** the experience is always enjoyable
- **Acceptance Criteria:**
  - Consistent 60 FPS on 5-year-old devices
  - <50MB memory usage during extended play
  - <3MB initial download size
  - Battery optimization for mobile devices
  - Automatic quality settings based on device

**Story 5.2:** Analytics and Monitoring
- **As a** development team, **I want** comprehensive analytics **so that** I can improve the game
- **Acceptance Criteria:**
  - Player progression analytics and funnels
  - Performance monitoring and crash reporting
  - A/B testing framework for optimization
  - Business metrics and monetization tracking
  - Privacy-compliant data collection

**Story 5.3:** Testing and Quality Assurance
- **As a** development team, **I want** comprehensive testing **so that** we ship quality releases
- **Acceptance Criteria:**
  - Automated unit testing for game logic
  - Integration testing for feature interactions
  - Performance testing and regression detection
  - Cross-platform compatibility validation
  - Manual QA processes for gameplay experience

**Story 5.4:** Deployment and Launch
- **As a** development team, **I want** reliable deployment **so that** we can deliver updates
- **Acceptance Criteria:**
  - App store deployment pipeline (iOS/Android)
  - Over-the-air update system via Expo
  - Staged rollout capabilities for risk management
  - Monitoring and rollback procedures
  - Launch marketing and user acquisition

### Technical Requirements

**Platform Support:**
- iOS 14+ (React Native 0.76+ requirement)
- Android API 23+ (Android 6.0+)
- Web Progressive Web App (PWA)
- Responsive design for phones and tablets

**Performance Requirements:**
- 60 FPS gameplay on 5-year-old devices (iPhone 8, Samsung Galaxy S8)
- <50MB RAM usage during extended play sessions
- <3MB initial download bundle size
- <5 second cold start time
- Battery optimization for 4+ hour play sessions

**Data & Storage:**
- Local persistence with MMKV (encrypted save data)
- Cloud save backup and sync (optional)
- Offline progression calculations (up to 12 hours)
- Save game integrity validation
- Data compression for large save files

**Security:**
- Client-side save game validation
- Anti-cheat measures for leaderboards
- Secure cloud save synchronization
- Privacy-compliant analytics
- COPPA compliance for younger players

### Assumptions, Constraints, and Dependencies

**Assumptions:**
- Players have mobile devices with 2GB+ RAM
- Internet connectivity available for initial download
- Players prefer incremental/idle game mechanics
- Touch interface is primary interaction method
- Players will engage in multiple short sessions daily

**Constraints:**
- 4-week development timeline for MVP
- Small development team (2-3 developers)
- Limited initial marketing budget
- Must work without internet after download
- App store approval processes and guidelines

**Dependencies:**
- Expo SDK 52+ for cross-platform deployment
- Legend State v3 for state management
- React Native MMKV for persistence
- App store review and approval times
- Third-party analytics and monitoring services

### Risk Assessment

**High Risk:**
- Performance optimization complexity for continuous calculations
- App store rejection for idle game mechanics
- Player retention in competitive mobile game market
- Balance tuning for progression satisfaction

**Medium Risk:**
- Cross-platform compatibility issues
- Save game corruption or loss
- Audio performance on older devices
- Monetization strategy effectiveness

**Low Risk:**
- Technical implementation of core mechanics
- Expo platform stability and updates
- Development timeline adherence
- Basic functionality delivery

**Mitigation Strategies:**
- Early performance testing and optimization
- Incremental app store submission process
- Comprehensive analytics for retention insights
- Extensive playtesting for balance validation
- Robust save system with backup mechanisms

### Timeline and Milestones

**Week 1: Foundation (Epic 1)**
- Project setup and architecture
- Core clicking mechanics
- Basic resource system
- First automation unlock
- UI foundation

**Week 2: Core Systems (Epic 2)**
- Department system implementation
- Employee management basics
- Department interconnections
- Save/load system
- Basic testing framework

**Week 3: Progression (Epic 3-4)**
- Advanced employee management
- Achievement system
- Prestige mechanics
- Performance optimization
- Cross-platform testing

**Week 4: Polish (Epic 5)**
- Audio/visual polish
- Final performance optimization
- Comprehensive testing
- App store preparation
- Launch readiness validation

---

## SECTION 2: RELEVANT RESEARCH SYNTHESIS

### Research Methodology
**Analysis Scope:** Comprehensive analysis of mobile game development, state management, React Native ecosystem, testing strategies, and modern software architecture patterns
**Relevance Criteria:** Direct applicability to idle game development, mobile performance optimization, and modern React Native development practices
**Synthesis Approach:** Integration of technical research insights with game design requirements to create actionable implementation guidance

### Core Research Insights

**Legend State v3 State Management:**
- Provides 30x performance improvement over AsyncStorage through MMKV integration
- Enables real-time reactive state updates essential for idle game mechanics
- Observable pattern perfectly matches incremental game state requirements
- Built-in persistence system eliminates custom save/load complexity

**React Native Mobile Optimization:**
- New architecture (Fabric, TurboModules) provides synchronous native communication
- Hermes JavaScript engine optimizes startup time and memory usage
- Performance monitoring capabilities enable production optimization
- Cross-platform deployment reduces development overhead by 60-70%

**Vertical Slice Architecture:**
- Feature-driven development enables parallel team development
- Reduces integration complexity through clear module boundaries
- Improves code maintainability and testing isolation
- Accelerates delivery timelines through independent feature development

**Automated Testing for AI Development:**
- Headless testing strategies enable AI-driven development workflows
- Static analysis provides immediate feedback without device dependencies
- Performance benchmarking validates optimization requirements
- Continuous integration enables automated quality assurance

### Technical Architecture Recommendations

**State Management Strategy:**
- Implement Legend State v3 as primary state management solution
- Use MMKV for encrypted persistence with 30x performance benefit
- Design observable state structure that mirrors game progression logic
- Implement computed values for derived game state calculations

**Performance Optimization Approach:**
- Target 60 FPS through fixed timestep game loop implementation
- Use object pooling for frequently created/destroyed game objects
- Implement batched state updates to reduce render frequency
- Cache complex calculations and use memoization for expensive operations

**Architecture Pattern Selection:**
- Vertical slice organization around game features (departments, progression, UI)
- Clear separation between game logic, state management, and presentation
- Service layer pattern for complex business logic isolation
- Component composition for reusable UI elements

**Cross-Platform Strategy:**
- Expo SDK 52+ for unified development and deployment platform
- React Native new architecture for optimal native performance
- Web deployment for broader accessibility and marketing
- Progressive Web App capabilities for installation and engagement

### Implementation Best Practices

**Development Workflow:**
- Feature-driven development with complete vertical slices
- Continuous integration with automated testing and validation
- Performance monitoring and optimization throughout development
- Incremental delivery with rapid feedback cycles

**Code Quality Standards:**
- TypeScript for type safety and development productivity
- ESLint and Prettier for consistent code formatting
- Comprehensive testing coverage for game logic and interactions
- Documentation as code for architectural decisions

**Performance Monitoring:**
- Real-time FPS monitoring with automatic quality adjustment
- Memory usage tracking and optimization alerts
- Battery usage optimization for extended play sessions
- Crash reporting and error tracking for production stability

**User Experience Optimization:**
- Tutorial-free onboarding through intuitive design
- Progressive complexity introduction for sustained engagement
- Accessibility support for inclusive gaming experience
- Responsive design for diverse device capabilities

### Risk Mitigation Strategies

**Technical Risk Management:**
- Early prototype development for performance validation
- Comprehensive device testing across iOS and Android platforms
- Incremental complexity introduction to maintain performance
- Robust error handling and recovery mechanisms

**User Experience Risk Management:**
- Extensive playtesting for balance and engagement validation
- Analytics-driven optimization for retention improvements
- A/B testing for feature effectiveness measurement
- Community feedback integration for iterative improvements

**Platform Risk Management:**
- App store compliance validation throughout development
- Alternative distribution strategies (web deployment)
- Regular platform update compatibility testing
- Community-driven support and documentation

---

## SECTION 3: TECHNICAL ARCHITECTURE SPECIFICATIONS

### System Architecture Overview
**Architecture Pattern:** Vertical Slice with Feature-Driven Development
**Technology Stack:** TypeScript + React Native + Expo SDK 52+ + Legend State v3 + MMKV
**Integration Strategy:** Reactive state management with persistent game progression
**Scalability Design:** Modular feature architecture supporting parallel development and content expansion

### Project Structure and Organization

#### Folder Structure Standard
```
/src
├── /core                    # Core game systems
│   ├── /engine             # Game loop and core mechanics
│   ├── /state              # Global state management
│   ├── /services           # Business logic services
│   └── /constants          # Game configuration and constants
├── /features               # Vertical slice features
│   ├── /clicking           # Core clicking mechanics
│   │   ├── /components     # Click-related UI components
│   │   ├── /hooks          # Click state and logic hooks
│   │   ├── /services       # Click calculation services
│   │   └── index.ts        # Feature barrel exports
│   ├── /departments        # Department management
│   │   ├── /components     # Department UI components
│   │   ├── /hooks          # Department state hooks
│   │   ├── /services       # Department business logic
│   │   ├── /types          # Department type definitions
│   │   └── index.ts        # Department barrel exports
│   ├── /progression        # Player progression systems
│   │   ├── /achievements   # Achievement system
│   │   ├── /prestige       # Prestige mechanics
│   │   ├── /components     # Progression UI
│   │   └── index.ts        # Progression exports
│   └── /analytics          # Game analytics and metrics
├── /shared                 # Cross-cutting concerns
│   ├── /components         # Reusable UI components
│   │   ├── /buttons        # Button components
│   │   ├── /cards          # Card layouts
│   │   ├── /counters       # Number display components
│   │   └── /modals         # Modal dialogs
│   ├── /hooks              # Global custom hooks
│   ├── /services           # Shared business services
│   ├── /utils              # Utility functions
│   ├── /types              # Global TypeScript interfaces
│   └── /constants          # Application constants
├── /ui                     # Presentation layer
│   ├── /screens            # Top-level screen components
│   ├── /navigation         # Navigation configuration
│   ├── /theme              # Design system and themes
│   └── /animations         # Animation components
├── /assets                 # Static assets
│   ├── /images             # Image assets
│   ├── /sounds             # Audio files
│   └── /fonts              # Custom fonts
├── App.tsx                 # Root application component
└── index.ts                # Application entry point
```

#### File Naming Conventions
- **Components**: PascalCase (e.g., `ClickButton.tsx`, `DepartmentCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useGameLoop.ts`, `useDepartment.ts`)
- **Services**: camelCase with descriptive suffix (e.g., `calculationService.ts`, `persistenceService.ts`)
- **Types**: PascalCase with descriptive suffix (e.g., `GameState.ts`, `DepartmentTypes.ts`)
- **Utils**: camelCase with descriptive name (e.g., `formatNumbers.ts`, `gameCalculations.ts`)
- **State Files**: camelCase with '.state.ts' suffix (e.g., `gameState.ts`, `departmentState.ts`)

### Component Architecture

#### Component Boundaries and Responsibilities
**Screen Components:**
- Top-level navigation and layout management
- Global state orchestration and data flow
- Screen-specific business logic coordination
- Cross-feature integration and communication

**Feature Components:**
- Encapsulated feature functionality within vertical slices
- Local state management within feature boundaries
- Feature-specific user interactions and feedback
- Integration with global state through well-defined interfaces

**Shared Components:**
- Reusable UI elements without business logic
- Consistent design system implementation
- Pure or minimally stateful components
- Cross-feature utility and presentation components

#### Integration Patterns
**State Management Integration:**
```typescript
// Legend State v3 integration pattern for game state
import { observable, computed } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';

const gameState$ = observable({
  resources: {
    lines: 0,
    money: 0,
    features: 0
  },
  departments: {
    development: {
      employees: 0,
      production: () => gameState$.departments.development.employees.get() * 0.1
    }
  },
  // Computed values for derived state
  totalValue: () => {
    const lines = gameState$.resources.lines.get();
    const money = gameState$.resources.money.get();
    return lines + money;
  }
});

// React component integration with observer pattern
import { observer } from '@legendapp/state/react';
import { use$ } from '@legendapp/state/react';

const GameComponent = observer(() => {
  const linesCount = use$(gameState$.resources.lines);
  const totalValue = use$(gameState$.totalValue);
  
  return (
    <View>
      <Text>Lines: {linesCount}</Text>
      <Text>Total Value: {totalValue}</Text>
    </View>
  );
});
```

**Game Loop Architecture:**
```typescript
// Fixed timestep game loop for consistent 60 FPS
import { useGameLoop } from '@shared/hooks/useGameLoop';

const GameEngine = () => {
  const { fps, deltaTime } = useGameLoop({
    targetFPS: 60,
    onUpdate: (dt) => {
      // Update all game systems with deltaTime
      departmentService.update(dt);
      progressionService.update(dt);
      analyticsService.update(dt);
    }
  });

  return null; // Headless game engine component
};
```

**Service Layer Patterns:**
```typescript
// Service interface contract with dependency injection
interface DepartmentService {
  readonly state$: Observable<DepartmentState>;
  hireDeveloper(count: number): Promise<boolean>;
  calculateProduction(deltaTime: number): number;
  upgradeEquipment(upgradeId: string): Promise<boolean>;
}

// Service implementation with Legend State integration
class DepartmentServiceImpl implements DepartmentService {
  public readonly state$ = gameState$.departments;

  async hireDeveloper(count: number): Promise<boolean> {
    const cost = this.calculateHiringCost(count);
    if (gameState$.resources.money.get() >= cost) {
      gameState$.resources.money.set(prev => prev - cost);
      gameState$.departments.development.employees.set(prev => prev + count);
      return true;
    }
    return false;
  }

  calculateProduction(deltaTime: number): number {
    const employees = this.state$.development.employees.get();
    const baseRate = 0.1; // lines per second per employee
    return employees * baseRate * deltaTime;
  }
}
```

### Data Flow and State Management

#### State Architecture
**Global Game State (Legend State v3):**
- Player progression data (levels, achievements, statistics)
- Resource management (lines, money, features, premium currency)
- Department states (employees, upgrades, production rates)
- Prestige system data (investor points, unlocks, bonuses)
- Game settings and preferences (audio, graphics quality)

**Local Component State:**
- UI-specific state (modal visibility, form inputs, animations)
- Temporary interaction state (button press feedback, hover effects)
- Component-scoped derived state (filtered lists, sorted data)
- Animation and transition states

**Service State:**
- Business logic calculations and intermediate results
- External API integration state (leaderboards, analytics)
- Background processing state (offline progression calculation)
- Caching and memoization of expensive computations

#### Persistence Strategy
**MMKV Integration:**
```typescript
// MMKV storage configuration for encrypted game saves
import { MMKV } from 'react-native-mmkv';
import { configureSynced } from '@legendapp/state/sync';

const gameStorage = new MMKV({
  id: 'petsoft-tycoon-save',
  encryptionKey: 'game-save-encryption-key'
});

// Configure Legend State sync with MMKV
configureSynced({
  persist: {
    plugin: {
      getItem: (key) => gameStorage.getString(key),
      setItem: (key, value) => gameStorage.set(key, value),
    }
  }
});

// Synced observable with automatic persistence
const persistedGameState$ = observable(
  syncObservable({
    initial: defaultGameState,
    persist: {
      name: 'game-state',
      transform: {
        save: (value) => gameStateSerializer(value),
        load: (value) => gameStateDeserializer(value)
      }
    }
  })
);
```

**Save Game Validation:**
```typescript
// Save game integrity validation to prevent tampering
const gameStateSerializer = (state: GameState): string => {
  const serialized = JSON.stringify(state);
  const hash = generateHash(serialized + SECRET_SALT);
  return JSON.stringify({ data: serialized, hash });
};

const gameStateDeserializer = (value: string): GameState => {
  try {
    const { data, hash } = JSON.parse(value);
    const expectedHash = generateHash(data + SECRET_SALT);
    
    if (hash !== expectedHash) {
      console.warn('Save game validation failed, using default state');
      return defaultGameState;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.warn('Save game parsing failed, using default state');
    return defaultGameState;
  }
};
```

### Testing Architecture

#### Test Organization Structure
```
/__tests__
├── /unit                   # Unit tests for isolated components
│   ├── /features
│   │   ├── /clicking       # Click mechanics unit tests
│   │   ├── /departments    # Department logic unit tests
│   │   └── /progression    # Progression system unit tests
│   ├── /shared             # Shared utility unit tests
│   │   ├── /services       # Service layer unit tests
│   │   ├── /utils          # Utility function tests
│   │   └── /hooks          # Custom hook tests
├── /integration            # Integration tests for feature interactions
│   ├── /department-synergy # Cross-department interaction tests
│   ├── /progression-flow   # End-to-end progression tests
│   └── /state-management   # State consistency tests
├── /e2e                    # End-to-end gameplay tests
│   ├── /new-player-flow    # Complete new player experience
│   ├── /prestige-cycle     # Full prestige cycle validation
│   └── /performance        # Performance and stress tests
├── /utils                  # Test utilities and helpers
│   ├── /mocks              # Mock implementations
│   ├── /fixtures           # Test data fixtures
│   └── /helpers            # Test helper functions
└── setup.ts                # Test environment configuration
```

#### Testing Strategies
**Unit Testing:**
```typescript
// Game logic unit testing example
describe('DepartmentService', () => {
  let service: DepartmentService;
  
  beforeEach(() => {
    service = new DepartmentServiceImpl();
    resetGameState();
  });
  
  test('should calculate correct production rate', () => {
    gameState$.departments.development.employees.set(10);
    const production = service.calculateProduction(1.0); // 1 second
    expect(production).toBe(1.0); // 10 employees * 0.1 rate * 1 second
  });
  
  test('should enforce hiring cost requirements', async () => {
    gameState$.resources.money.set(50);
    const result = await service.hireDeveloper(1); // Costs 100
    expect(result).toBe(false);
    expect(gameState$.departments.development.employees.get()).toBe(0);
  });
});
```

**Performance Testing:**
```typescript
// Performance validation for 60 FPS requirement
describe('Performance Requirements', () => {
  test('should maintain 60 FPS during intensive calculations', () => {
    const startTime = performance.now();
    
    // Simulate 1000 department updates
    for (let i = 0; i < 1000; i++) {
      departmentService.update(0.016); // 60 FPS frame time
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should complete 1000 updates in less than 16ms (one frame)
    expect(totalTime).toBeLessThan(16);
  });
  
  test('should handle large numbers without precision loss', () => {
    gameState$.resources.money.set(Number.MAX_SAFE_INTEGER - 1000);
    departmentService.addMoney(500);
    
    const finalAmount = gameState$.resources.money.get();
    expect(finalAmount).toBe(Number.MAX_SAFE_INTEGER - 500);
  });
});
```

**Integration Testing:**
```typescript
// Cross-feature integration testing
describe('Department Synergy Integration', () => {
  test('should apply development-sales synergy bonus', () => {
    // Setup development department
    gameState$.departments.development.employees.set(25);
    gameState$.departments.development.upgrades.pairProgramming.set(true);
    
    // Setup sales department
    gameState$.departments.sales.employees.set(10);
    
    // Test synergy calculation
    const synergyBonus = calculationService.calculateDepartmentSynergy('sales');
    expect(synergyBonus).toBeGreaterThan(1.0); // Should have bonus
    
    // Test actual production with synergy
    const baseProduction = 100;
    const finalProduction = baseProduction * synergyBonus;
    expect(finalProduction).toBeGreaterThan(baseProduction);
  });
});
```

### Performance Optimization Patterns

#### React Native Specific Optimizations
**Memory Management:**
```typescript
// Component memoization for expensive renders
const DepartmentCard = React.memo(({ department }: DepartmentCardProps) => {
  const employeeCount = use$(department.employees);
  const production = use$(department.production);
  
  return (
    <Card>
      <Text>Employees: {employeeCount}</Text>
      <Text>Production: {formatNumber(production)}</Text>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return prevProps.department === nextProps.department;
});

// Callback memoization for event handlers
const GameScreen = observer(() => {
  const handleClick = useCallback(() => {
    gameActions.performClick();
  }, []);
  
  const handleUpgrade = useCallback((upgradeId: string) => {
    gameActions.purchaseUpgrade(upgradeId);
  }, []);
  
  return (
    <View>
      <ClickButton onPress={handleClick} />
      <UpgradeList onUpgrade={handleUpgrade} />
    </View>
  );
});
```

**State Update Optimization:**
```typescript
// Batched state updates for performance
import { batch } from '@legendapp/state';

const performComplexGameUpdate = () => {
  batch(() => {
    // Multiple state updates batched into single render
    gameState$.resources.lines.set(prev => prev + 100);
    gameState$.resources.money.set(prev => prev + 500);
    gameState$.statistics.totalClicks.set(prev => prev + 1);
    gameState$.achievements.clickMilestone.set(true);
  });
};
```

**Calculation Optimization:**
```typescript
// Cached calculation service for expensive operations
class CalculationService {
  private cache = new Map<string, { value: number; timestamp: number }>();
  private CACHE_TTL = 1000; // 1 second cache
  
  calculateDepartmentSynergy(departmentId: string): number {
    const cacheKey = `synergy_${departmentId}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.value;
    }
    
    // Expensive calculation
    const synergy = this.performComplexSynergyCalculation(departmentId);
    
    this.cache.set(cacheKey, { value: synergy, timestamp: now });
    return synergy;
  }
}
```

#### Target Performance Metrics
- **Frame Rate**: Consistent 60 FPS during active gameplay
- **Memory Usage**: <50MB peak memory consumption on target devices
- **App Launch Time**: <3 seconds cold start on 5-year-old devices
- **Battery Life**: <5% battery usage per hour of active gameplay
- **Bundle Size**: <3MB initial download, <10MB total app size

### Build and Deployment Configuration

#### Expo Configuration
```javascript
// app.config.js - Expo configuration for production
export default {
  expo: {
    name: "PetSoft Tycoon",
    slug: "petsoft-tycoon",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gamedev.petsoft-tycoon",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.gamedev.petsoft_tycoon",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    },
    plugins: [
      [
        "expo-dev-client",
        {
          addGeneratedScheme: false
        }
      ],
      "react-native-mmkv"
    ]
  }
};
```

#### TypeScript Configuration
```json
// tsconfig.json - TypeScript configuration with path aliases
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@ui/*": ["src/ui/*"],
      "@assets/*": ["assets/*"],
      "@/*": ["src/*"]
    },
    "skipLibCheck": true,
    "jsx": "react-native",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

#### Metro Configuration
```javascript
// metro.config.js - Metro bundler optimization
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add path resolution for absolute imports
config.resolver.alias = {
  '@core': './src/core',
  '@features': './src/features',
  '@shared': './src/shared',
  '@ui': './src/ui',
  '@assets': './assets'
};

// Optimize bundle for performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
```

#### EAS Build Configuration
```json
// eas.json - EAS Build configuration for deployment
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## SECTION 4: AI AGENT IMPLEMENTATION RUNBOOK

### Agent Role Definition
**Primary Role:** Full-stack mobile game development specialist with expertise in React Native, idle game mechanics, and performance optimization
**Expertise Domain:** Mobile game development, React Native architecture, state management, game balance, and cross-platform deployment
**Decision Authority:** Technical implementation decisions, code architecture, performance optimization, testing strategies
**Success Criteria:** Delivery of polished, performant idle game meeting all specified requirements and quality standards

### Structured Task Model

#### Phase 1: Foundation and Architecture
**Task Dependencies:**
```
Project Setup → State Management → Core Game Loop → Testing Framework → Performance Baseline
```

**Agent Instructions:**
1. **Project Architecture Setup**
   - Initialize Expo SDK 52+ project with TypeScript configuration
   - Configure Legend State v3 with MMKV persistence integration
   - Implement vertical slice folder structure following specifications
   - Set up testing framework with Jest and React Native Testing Library
   - Configure build pipeline and development tools

2. **Core State Management**
   - Design reactive state architecture using Legend State observables
   - Implement encrypted save system with MMKV integration
   - Create game state validation and integrity checking
   - Set up computed values for derived game statistics
   - Implement state persistence and loading mechanisms

3. **Game Loop Implementation**
   - Create fixed timestep game loop targeting 60 FPS
   - Implement delta time calculations for frame-independent updates
   - Set up performance monitoring and frame rate tracking
   - Create update system for all game components
   - Implement automatic quality adjustment based on performance

#### Phase 2: Core Game Mechanics
**Task Dependencies:**
```
Clicking System → Resource Management → Department Systems → Employee Management → Save/Load System
```

**Agent Instructions:**
1. **Clicking and Resource System**
   - Implement immediate click feedback with visual and audio effects
   - Create resource conversion system (lines → features → money)
   - Design number formatting and display systems for large values
   - Implement particle effects and screen shake for satisfaction
   - Add sound design with adaptive audio mixing

2. **Department Systems Implementation**
   - Create seven department types with unique mechanics and progression
   - Implement employee hiring and management systems
   - Design upgrade systems for departments and individual employees
   - Create department synergy and collaboration bonuses
   - Implement visual representation of department activity

3. **Automation and Production**
   - Design automated production calculations with real-time updates
   - Implement manager systems for automated department operations
   - Create production multipliers and efficiency bonuses
   - Design offline progression calculation for idle mechanics
   - Implement production optimization and bottleneck analysis

#### Phase 3: Progression and Polish
**Task Dependencies:**
```
Achievement System → Prestige Mechanics → UI Polish → Performance Optimization → Testing
```

**Agent Instructions:**
1. **Progression Systems**
   - Implement comprehensive achievement system with 50+ achievements
   - Create prestige mechanics with investor round system
   - Design permanent progression bonuses and unlocks
   - Implement social features and leaderboard integration
   - Create event system for special content and bonuses

2. **User Interface and Experience**
   - Polish all animations and transitions for smooth 60 FPS performance
   - Implement responsive design for various device sizes
   - Create accessibility features for inclusive gameplay
   - Design intuitive navigation without tutorial requirements
   - Implement visual hierarchy and information architecture

3. **Performance and Quality Assurance**
   - Optimize for target performance metrics (60 FPS, <50MB RAM)
   - Implement comprehensive testing coverage for all game systems
   - Create automated testing for regression prevention
   - Optimize bundle size and loading performance
   - Implement analytics and crash reporting for production monitoring

### Decision Trees and Escalation Procedures

#### Decision Matrix
| Scenario | Agent Action | Escalation Trigger | Human Intervention Required |
|----------|--------------|-------------------|----------------------------|
| Performance below 60 FPS | Implement automatic quality reduction, optimize calculations | Performance < 30 FPS after optimization | Game design changes needed |
| Save game corruption detected | Load backup save, log error, notify user | Multiple corruption instances | Architecture review required |
| Balance concerns (too easy/hard) | Adjust progression rates within 20% bounds | Player feedback indicates major issues | Game design consultation needed |
| Platform-specific issues | Implement platform-specific solutions | Functionality completely broken | Platform expertise consultation |
| Third-party integration failure | Implement fallback mechanisms | Core functionality affected | Business decision on alternatives |

#### Escalation Procedures
1. **Technical Blockers**: Log detailed technical issue, provide reproduction steps, escalate if blocking multiple features
2. **Performance Issues**: Implement immediate optimizations, escalate if target metrics cannot be achieved
3. **Design Questions**: Implement based on research and best practices, escalate for major game design decisions
4. **Platform Issues**: Research platform-specific solutions, escalate for fundamental compatibility problems

### Error Handling and Recovery

#### Common Error Patterns
- **Save Game Corruption**: Implement validation, backup systems, and graceful recovery
- **Performance Degradation**: Monitor FPS, implement automatic quality adjustment, log performance metrics
- **Memory Leaks**: Use React Native memory profiling, implement object pooling, monitor memory usage
- **Platform Compatibility**: Test across devices, implement feature detection, provide fallbacks

#### Self-Healing Mechanisms
- **Automatic Performance Scaling**: Reduce visual effects and calculation frequency when FPS drops
- **Save Game Recovery**: Multiple backup saves with rollback capability
- **Error Boundary Implementation**: Graceful error handling with user feedback and recovery options
- **Network Resilience**: Offline-first design with optional online features

### Communication Protocols

#### Status Reporting
- **Daily Progress Updates**: Feature completion status, performance metrics, blocking issues
- **Milestone Completion**: Demonstration of completed features with testing validation
- **Issue Identification**: Immediate notification of blocking issues with proposed solutions
- **Performance Metrics**: Regular reporting of FPS, memory usage, and other key performance indicators

#### Cross-Agent Coordination
- **Code Integration**: Clear merge procedures and conflict resolution protocols
- **Testing Coordination**: Shared testing frameworks and validation procedures
- **Documentation Sharing**: Centralized documentation for architectural decisions and patterns
- **Knowledge Transfer**: Regular sharing of lessons learned and optimization discoveries

### Continuous Improvement Framework

#### Learning Mechanisms
- **Performance Analysis**: Regular analysis of game performance and optimization opportunities
- **Player Feedback Integration**: Analytics-driven insights for gameplay improvements
- **Code Quality Metrics**: Tracking of technical debt and code quality improvements
- **Industry Best Practices**: Continuous learning from mobile game development advances

#### Optimization Cycles
- **Real-time**: Performance monitoring and automatic quality adjustment
- **Daily**: Code optimization and technical debt reduction
- **Weekly**: Feature performance analysis and improvement implementation
- **Release**: Comprehensive performance and quality assessment with optimization planning

---

## SECTION 5: IMPLEMENTATION VALIDATION

### Quality Assurance Checklist
- [x] PRD completeness against 2024-2025 mobile game standards
- [x] Research synthesis accuracy and direct applicability to idle game development
- [x] Technical architecture specifications provide concrete implementation guidance
- [x] Runbook clarity and actionability for AI agents with mobile game expertise
- [x] Decision trees cover common game development scenarios and edge cases
- [x] Escalation procedures are well-defined for technical and design issues
- [x] Error handling addresses likely failure modes in mobile game development
- [x] Communication protocols enable effective development coordination
- [x] Continuous improvement mechanisms support ongoing game optimization

### Success Validation Framework
1. **PRD Quality**: Comprehensive coverage of idle game mechanics, mobile platform requirements, and performance specifications
2. **Research Integration**: Direct application of Legend State v3, React Native optimization, and vertical slice architecture
3. **Agent Readiness**: Complete technical specifications enabling autonomous development without ambiguity
4. **Implementation Feasibility**: Validated architecture patterns and performance targets based on proven technologies

### Iteration Recommendations
1. **Post-MVP Enhancements**: Expand social features, add more department types, implement advanced prestige mechanics
2. **Platform Expansion**: Desktop and console versions using React Native for Windows and gaming platforms
3. **Monetization Evolution**: Implement ethical monetization with time warps, cosmetics, and convenience features
4. **Community Features**: Add guild systems, collaborative challenges, and user-generated content

---

## APPENDIX: RESEARCH REFERENCE INDEX

### Applied Research Areas
- **Legend State v3 Research**: State management architecture and MMKV integration patterns
- **React Native Mobile Development**: Performance optimization and cross-platform development strategies
- **Expo SDK Framework**: Modern mobile development workflow and deployment capabilities
- **Vertical Slicing Methodology**: Feature-driven architecture and development organization
- **Automated Testing Strategies**: AI-friendly testing approaches and quality assurance frameworks
- **Product Document Requirements**: Modern PRD structures and collaborative development practices

### Research Integration Map
- **Performance Requirements → React Native Optimization**: 60 FPS target using new architecture features
- **State Management → Legend State v3**: Observable patterns for reactive game state management
- **Architecture → Vertical Slicing**: Feature-driven development enabling parallel team development
- **Testing → Automated Strategies**: Headless testing enabling AI-driven development workflows
- **Deployment → Expo Platform**: Cross-platform deployment with over-the-air update capabilities

### Additional Research Recommendations
- **Advanced Game Analytics**: Player behavior analysis and retention optimization
- **Monetization Best Practices**: Ethical mobile game monetization strategies
- **Community Management**: Social features and user engagement optimization
- **Platform-Specific Optimization**: iOS and Android platform-specific performance tuning
- **Accessibility Standards**: Mobile game accessibility guidelines and implementation