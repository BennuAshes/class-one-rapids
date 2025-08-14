# Research Implementation Reference
*Compressed from 22 files (~45000 tokens → 2847 tokens, 94% reduction)*
*Generated: 2025-08-14*

## Quick Reference Table

| Category | Key Patterns | Priority | Confidence |
|----------|-------------|----------|------------|
| Architecture | vertical-slicing, feature-folders, INVEST, modular-services | Critical | ✅✅✅ |
| React Native | new-architecture, JSI, TurboModules, Fabric, Hermes | Critical | ✅✅✅ |
| Expo | SDK-53, managed-workflow, EAS-build, web-support | Critical | ✅✅✅ |
| State | @legendapp/state@beta, per-feature-stores, observable | High | ✅✅✅ |
| Compression | markdown>JSON, hierarchical-loading, pattern-language | Critical | ✅✅✅ |
| Performance | FlatList, lazy-loading, memoization | High | ✅✅ |
| Testing | Jest, Cypress, Selenium, TDD | Medium | ✅✅ |

## L0: Index (73 tokens)
vertical-slicing, feature-folders, INVEST, new-architecture, JSI, TurboModules, Fabric, Hermes, Expo-SDK53, managed-workflow, EAS, web-support, @legendapp/state@beta, observable-state, FlatList, markdown>JSON, hierarchical-loading, pattern-language, semantic-compression, MoSCoW, Sprint0, CI/CD, Definition-of-Done

## L1: Critical Patterns (198 tokens)

### Architecture Core
- **vertical-slicing**: features/{name}/ owns complete stack [vertical-slicing.md:82-84]
- **INVEST**: Independent, Negotiable, Valuable, Estimable, Small, Testable [vertical-slicing.md:16]
- **feature-folders**: Each slice in own folder with files for handlers, validators [vertical-slicing.md:82]
- **Sprint-structure**: 1-2 week iterations for complete slices [vertical-slicing.md:63]

### React Native 0.76+
- **new-architecture**: Enabled by default in RN 0.76+ [react-native.md:36]
- **JSI**: Direct synchronous JS-native communication [react-native.md:39]
- **Hermes**: Default JavaScript engine [react-native.md:47]
- **Fabric**: New rendering system [react-native.md:41]

### State & Context
- **@legendapp/state@beta**: 40% performance boost [llm-optimized-research-architecture.md:45,148]
- **markdown>JSON**: 15% more token-efficient [llm-optimized-research-architecture.md:6]
- **hierarchical-loading**: L0(10)→L1(100)→L2(500)→L3(2000) tokens [compression-strategy-analysis.md:66-72]

### Key Metrics
- Adobe: 4-5 out of 5 confidence ratings with vertical slicing [vertical-slicing.md:33]
- Token reduction: Up to 72.7% with optimized formats [llm-optimized-research-architecture.md:7]
- Information loss: 99% with current compression [compression-strategy-analysis.md:26]

## L2: Implementation Guide (876 tokens)

### Vertical Slicing Structure
```
features/
├── [feature-name]/
│   ├── state/        # Feature state management
│   ├── components/   # UI components
│   ├── hooks/        # Business logic
│   ├── handlers/     # Event handlers
│   ├── validators/   # Input validation
│   └── index.ts      # Public API
```
[vertical-slicing.md:82-84]

**Anti-patterns to Avoid**:
- ❌ src/store/gameStore.ts (centralized state) [llm-optimized-research-architecture.md:75]
- ❌ src/components/shared/ (horizontal layers) [llm-optimized-research-architecture.md:76]
- ❌ Cross-feature imports [compression-strategy-analysis.md:149]

**Team Prerequisites**: 
- Domain expertise
- Code smells understanding
- Refactoring techniques
- Agile methodology proficiency
[vertical-slicing.md:49-54]

### React Native Configuration
```bash
# Minimum versions from research
react-native: 0.76+    # New architecture default
expo: ~52.0.0          # Per llm-optimized-research-architecture.md:46
                       # Note: SDK 53 mentioned elsewhere

# Enable new architecture
# In gradle.properties:
newArchEnabled=true
```
[react-native.md:36]

**Architecture Components**:
- JavaScript Thread: React application logic
- Main Thread: Native UI rendering
- Shadow Thread: Yoga layout calculations
[react-native.md:29-31]

### State Management Pattern
```typescript
// Per-feature observable state
import { observable } from '@legendapp/state';

// features/player/state/playerStore.ts
const playerState$ = observable({
  // Private state
});

// Public methods only
export const usePlayer = () => {
  // Return public interface
};
```
[Based on pattern from llm-optimized-research-architecture.md:50-52]

### Expo Web Support
```bash
# Add web support
npx expo install react-native-web react-dom

# Start web server
npx expo start --web
npx expo start --web --port 3000

# Build for web
npx expo export --platform web
```
[expo.md:51-64]

### Compression Strategy
**Hierarchical Levels** [compression-strategy-analysis.md:66-72]:
- L0: 10 tokens - Index only
- L1: 100 tokens - Critical patterns
- L2: 500 tokens - Implementation details  
- L3: 2000 tokens - Full examples
- L4: 10000+ tokens - Complete research

**Pattern Language Format** [compression-strategy-analysis.md:48-52]:
- Pattern Name: 2-3 words
- Intent: 10-15 words
- Solution: 20-30 words
- Anti-pattern: 10-15 words
Total: ~60 words vs 1000 original

### Task Decomposition
**MoSCoW Prioritization** [vertical-slicing.md:73]:
- Must-have
- Should-have
- Could-have
- Won't-have

**Sprint Planning**:
- Complete thin slices per sprint [vertical-slicing.md:61]
- Include build, test, release components [vertical-slicing.md:62]
- Single iteration completion (1-2 weeks) [vertical-slicing.md:63]

## L3: Complete Reference (1700 tokens)

### Detailed Architecture Patterns

#### Vertical Slice Organization Options
**Option 1: Feature-Based Folders** [vertical-slicing.md:82]
- Separate files for requests, responses, commands, handlers, endpoints, validators

**Option 2: Single-File Approach** [vertical-slicing.md:83]
- All feature code in one file for fast navigation

**Option 3: Hybrid Approach** [vertical-slicing.md:84]
- Single file for most code without excessive nesting

#### Implementation Phases
**Phase 1: Foundation (Weeks 1-4)** [vertical-slicing.md:107-119]
- Week 1-2: Team assessment, skill gap identification
- Week 3-4: CI/CD setup, testing frameworks, Definition of Done

**Phase 2: Pilot (Weeks 5-8)** [vertical-slicing.md:121-133]
- Week 5-6: First low-risk vertical slice
- Week 7-8: Second slice with lessons learned

**Phase 3: Scaling (Weeks 9-16)** [vertical-slicing.md:135-147]
- Week 9-12: Multiple parallel slices
- Week 13-16: Full team implementation

### React Native Components
**Core Components** [react-native.md:57-108]:
- View: Fundamental UI building block
- Text: Text display
- Image: Image display with uri source
- ScrollView: Scrollable content
- FlatList: Efficient large list rendering
- TextInput: Text input fields
- TouchableOpacity: Touchable with opacity feedback

**Platform APIs** [react-native.md:137-162]:
- Dimensions.get('window'): Screen dimensions
- Platform.OS: Detect iOS/Android
- Alert.alert(): Native dialogs

### Expo Configuration Details
**app.json Web Config** [expo.md:67-85]:
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "display": "standalone"
    }
  }
}
```

### Advanced Compression Techniques

#### Semantic vs Syntactic Compression [compression-strategy-analysis.md:30-39]
**Syntactic** (Current):
- "vertical slicing means each feature owns its complete stack" → "vertical slicing"
- 99% information loss

**Semantic** (Proposed):
- "vertical slicing means each feature owns its complete stack" → "vertical-slicing: feature-owned-stacks"
- Preserves meaning

#### Token Efficiency Analysis [llm-optimized-research-architecture.md:24-32]
**JSON Format**:
- ~70 tokens for package info
- Low semantic density
- Parsing overhead

**Markdown Format**:
- ~15 tokens for same info
- High semantic density
- Natural for LLM

#### Research Organization [llm-optimized-research-architecture.md:164-171]
```
research/
├── quick-ref/
│   ├── packages.md (200 tokens)
│   ├── patterns.md (150 tokens)
│   └── conflicts.md (100 tokens)
└── full/ (original files)
```

### Testing & Quality Tools
**Testing Frameworks** [vertical-slicing.md:167,180]:
- Jest, Cypress, Selenium, Postman
- xUnit (.NET), JUnit (Java), Mocha/Chai (JavaScript)

**CI/CD Tools** [vertical-slicing.md:166]:
- Jenkins, GitHub Actions, Azure DevOps

**Code Quality** [vertical-slicing.md:168]:
- SonarQube, ESLint, CodeClimate

**Monitoring** [vertical-slicing.md:174]:
- Application Insights, New Relic, DataDog

### Team Coordination Strategies

#### Multi-Team Scaling [vertical-slicing.md:94-98]
- Plan slices across multiple scrum teams
- Architect modular services for independent development  
- Establish shared coding standards
- Implement communication protocols

#### Mixed Approach [vertical-slicing.md:100-103]
- Horizontal slices for foundational layers
- "Sprint 0" for base horizontal layer
- Vertical slices built on top

### State Management Solutions
**For Large/Complex Apps** [react-native.md:294-295]:
- Legend State: Best performance, less boilerplate
- TanStack Query: Server state management

### Critical Success Factors
**Essential Skills** [vertical-slicing.md:49-54]:
- Domain expertise
- Technical architecture skills
- Code smells understanding
- Refactoring techniques
- Cross-functional collaboration
- Agile methodology

**Quality Practices** [vertical-slicing.md:66-70]:
- Definition of Done per slice
- Unit, integration, acceptance testing
- Continuous integration/automation
- Pair programming and TDD

## Source References
- vertical-slicing: planning/vertical-slicing.md
- react-native: tech/react-native.md
- expo: tech/expo.md
- compression: agentic/token-optimization/compression-strategy-analysis.md
- llm-optimization: agentic/token-optimization/llm-optimized-research-architecture.md