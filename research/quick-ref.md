# Research Quick-Reference (Ultimate Edition)

## L1: CRITICAL (Always Load - 228 tokens)
### Package Versions (CURRENT) | Package | Version | Critical Note | |---------|---------|---------------| | @legendapp/state | @beta | 40% perf, React18 required | | expo | ~53.0.0 | SDK53 = RN0.79 current | | react-native | 0.79+ | New Arch enabled | | TS | ^5.8.0 | strict: true required | | expo-router | ~5.0.0 | file-based routing | ### Architecture Rules (ENFORCE) | ✅ MUST | ❌ NEVER | Auto-Fix | |---------|----------|----------| | feat/*/comp/ | src/comp/ | mv to feat | | gameState$ observables | single store | split by feature | | useGameLogic() hooks | gameUtils.js | convert to hooks | | vertical slicing | horizontal layers | restructure | | INVEST criteria | big bang feat | decompose | ### Anti-Patterns (BLOCK) - ❌ Monolithic state → ✅ Feature observables - ❌ Utils for React → ✅ Custom hooks - ❌ Any types → ✅ Strict TS - ❌ Class comp → ✅ Functional only - ❌ Manual navigation → ✅ expo-router
## L2: IMPLEMENTATION (Load for Tasks - 400 tokens)
### Package Config Requirements ```markdown # Metro (REQUIRED for @legendapp/state@beta) resolver.unstable_enablePackageExports: true resolver.unstable_conditionNames: ['react-native'] # Babel (REQUIRED for reanimated) plugins: ['react-native-reanimated/plugin'] # TS (STRICT) strict: true, noImplicitAny: true, strictNullChecks: true ``` ### Vertical Slicing Pattern ``` feat/ ├── auth/ │ ├── comp/ # Feature UI │ ├── hooks/ # useAuth() │ ├── state/ # authState$ │ └── services/ # authAPI ├── game-core/ │ ├── comp/ # GameView │ ├── hooks/ # useGameLoop() │ ├── state/ # gameState$ │ └── services/ # gameEngine ``` ### State Management (Legend State) ```TS // Feature observable pattern export const resourceState$ = observable({ gold: 0, gems: 0, // Computed values get total() { return this.gold + this.gems } }) // Batch updates (40% perf boost) batch(() => { resourceState$.gold.set(100) resourceState$.gems.set(50) }) ``` ### perf Critical | Optimization | Impact | Implementation | |-------------|--------|---------------| | Hermes Engine | 30% faster | android/app/build.gradle | | Bundle splitting | 50% smaller | expo-router lazy() | | Image optimization | 60% smaller | expo-image + webp | | List virtualization | 90% memory | FlashList not FlatList | | Batch state updates | 40% faster | Legend batch() | ### Testing Stack | Type | Tool | Config | |------|------|--------| | Unit | Vitest | workspace:* resolution | | Component | Testing Library | @testing-library/react-native | | E2E | Maestro | .maestro/flows/ | | Visual | Percy | CI integration | ### perf Updates - 20% improvement
## L3: ADVANCED (Reference - 209 tokens)


### LLM Optimization Patterns
- **Token Efficiency**: Markdown 15% better than JSON
- **Context Hierarchy**: L1→L2→L3 progressive loading
- **XML Structure**: Best for Claude models
- **Quick-Ref Pattern**: 90% token reduction

### Security Requirements
- **SAST**: semgrep in CI/CD
- **Dependency scan**: npm audit weekly
- **Secrets**: NEVER in code, use expo-secure-store
- **API keys**: Server-side only via proxy

### Platform Specific
| Platform | Requirement | Config |
|----------|------------|--------|
| iOS | 13.4+ | Info.plist |
| Android | SDK 23+ (6.0) | build.gradle |
| Web | Modern browsers | babel targets |
| Expo Go | SDK 52 only | app.json |

### Breaking Changes Watch
- RN 0.76: New Architecture default
- Expo 52: Removes classic updates
- Metro: Package exports required
- TypeScript 5.8: Stricter inference


## L4: FRAMEWORK ALTERNATIVES (Deep Dive - 97 tokens)


### When NOT React Native
| Use Case | Framework | Why |
|----------|-----------|-----|
| Web-first | SolidJS | 10x smaller |
| Data-heavy | TanStack Query | Better caching |
| Desktop | Tauri | Native performance |
| Simple app | Flutter | Faster development |

### AI Agent Patterns
- Multi-agent orchestration
- Memory management tiers
- Context engineering
- Prompt optimization


## L5: EMERGENCY FIXES (As Needed)
### Common Build Failures  ### Recovery Commands  --- ## Research Sources (For Deep Dives) - Full tech details: research/tech/*.md - Architecture: research/planning/vertical-slicing.md - AI patterns: research/agentic/*.md - Task decomposition: research/planning/structured-task-decomposition.md ## Usage Strategy 1. **Always load L1** (200 tokens) - Non-negotiable requirements 2. **Load L2 for implementation** (400 tokens) - When building 3. **Reference L3-L5 as needed** - Specific situations only 4. **Total typical load**: 600 tokens vs 2000+ old approach
---

## Research Sources (For Deep Dives)
- Full tech details: research/tech/*.md
- Architecture: research/planning/vertical-slicing.md
- AI patterns: research/agentic/*.md
- Task decomposition: research/planning/structured-task-decomposition.md

## Usage Strategy
1. **Always load L1** (200 tokens) - Non-negotiable requirements
2. **Load L2 for implementation** (400 tokens) - When building
3. **Reference L3-L5 as needed** - Specific situations only
4. **Total typical load**: 600 tokens vs 2000+ old approach