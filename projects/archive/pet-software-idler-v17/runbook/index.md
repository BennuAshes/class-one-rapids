# PetSoft Tycoon Development Runbook

## Overview

This runbook provides a comprehensive, step-by-step development guide for PetSoft Tycoon, an incremental idle game built with Expo SDK 53 and Legend-State v3 beta. The project follows a vertical slicing architecture with event-driven coordination between features.

## Architecture Summary

- **Framework**: React Native with Expo SDK 53
- **State Management**: Legend-State v3 beta
- **Architecture**: Vertical slicing with private state and public capabilities
- **Coordination**: Event-driven communication via EventBus
- **Organization**: Feature folders (not by file type)

## Development Phases

| Phase | Focus | Duration | Key Deliverables |
|-------|-------|----------|------------------|
| [00-analysis](./00-analysis.md) | Requirements analysis & architecture | 1 week | Architecture docs, feature breakdown |
| [01-foundation](./01-foundation.md) | Project setup & core infrastructure | 1 week | Project scaffold, core services |
| [02-core-features](./02-core-features.md) | Game loop, clicking, currency | 1 week | Playable core mechanics |
| [03-integration](./03-integration.md) | Department systems & upgrades | 2 weeks | All departments functional |
| [04-quality](./04-quality.md) | Polish, performance, testing | 1 week | Production-ready quality |
| [05-deployment](./05-deployment.md) | Build, release, launch | 1 week | App store submission |

## Quick Start

1. **Prerequisites Check**: Ensure Node.js 18+, Expo CLI, Android Studio/Xcode
2. **Project Setup**: Follow [01-foundation](./01-foundation.md) for initial setup
3. **Development**: Use the phase-specific guides for implementation
4. **Progress Tracking**: Update [progress.json](./progress.json) after each milestone

## Key Principles

### Vertical Slicing
Each feature is a complete mini-application:
```
features/
├── clicking/
│   ├── ClickingService.ts    # Private state, public capabilities
│   ├── ClickButton.tsx       # UI components
│   ├── ClickEvents.ts        # Event definitions
│   └── index.ts             # Public API only
```

### Event-Driven Coordination
Features communicate only through events:
```typescript
// ❌ NEVER: Direct coupling
playerService.currency -= cost;

// ✅ ALWAYS: Event-based
eventBus.emit('funds.requested', { amount: cost, purpose: 'hire' });
```

### Private State Pattern
```typescript
class PlayerService {
  #state$ = observable({ currency: 1000 });  // Private!
  
  // Public capability, not data
  spend(amount: number): Result<void, Error> {
    if (this.#state$.currency.peek() < amount) {
      return Result.err(new InsufficientFundsError());
    }
    this.#state$.currency.set(c => c - amount);
    return Result.ok();
  }
}
```

## Critical Anti-Patterns to Avoid

1. **Global State Objects** - Each feature owns its state
2. **npm install --legacy-peer-deps** - Use `npx expo install`
3. **Direct Cross-Feature Imports** - Use events or dependency injection
4. **Centralized Stores** - No `/store/gameStore.ts`
5. **Horizontal Layering** - Organize by feature, not file type

## Development Commands

```bash
# Development
npx expo start                    # Start dev server
npx expo start --clear            # Clear cache

# Dependencies (ALWAYS use expo install)
npx expo install [package]        # ✅ Correct
npm install [package]             # ❌ Avoid

# Common Fixes
npx expo doctor                  # Check for issues
npx expo install --check         # Fix version conflicts
```

## Performance Targets

- **Response Time**: All button interactions <50ms
- **Frame Rate**: 60fps minimum on target devices
- **Memory Usage**: <100MB RAM
- **Load Time**: <3 seconds to gameplay
- **Save Reliability**: 99.9%+ save success rate

## Success Metrics

- **7-Day Retention**: 30%+ retention rate
- **Session Duration**: Average 15+ minutes
- **Feature Adoption**: 70%+ reach Sales unlock
- **Daily Active Users**: 10,000+ within 6 months

## Dependencies & Research

- **Research Requirements**: See [research-requirements.json](./research-requirements.json)
- **Core Dependencies**: Expo SDK 53, Legend-State v3 beta
- **Architecture Reference**: [/mnt/c/dev/class-one-rapids/research/quick-ref.md](file:///mnt/c/dev/class-one-rapids/research/quick-ref.md)

## Getting Help

- Review the architecture patterns in the research documentation
- Each phase has specific troubleshooting sections
- Use the progress tracking to identify blockers
- Reference the PRD for detailed requirements and acceptance criteria

---

**Next Step**: Begin with [00-analysis.md](./00-analysis.md) for requirements analysis and architecture planning.