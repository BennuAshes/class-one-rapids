---
description: Extract only implementation-relevant content from research files to create a concise quick-ref.md
argument-hint: [optional-output-path]
---

# Extract Implementation Research

Creates a condensed reference guide from research files, including ONLY content that directly helps with implementation.

## Usage
```bash
/extract-implementation-research
/extract-implementation-research /custom/output/path.md
```

## Process

### Phase 1: Content Classification

Scan all `.md` files in `/research/` and classify content blocks:

#### INCLUDE (Implementation-Relevant)
- **Code blocks** - All code examples, configurations, commands
- **Package versions** - Exact version numbers with dependencies
- **CLI commands** - Actual executable commands
- **File structures** - Directory layouts and organization patterns
- **Configuration files** - tsconfig.json, package.json, etc.
- **Error patterns** - Common errors and their solutions
- **Anti-patterns** - What NOT to do with clear examples
- **Implementation steps** - Numbered procedures that build something
- **API signatures** - Function signatures and interfaces
- **Performance metrics** - Actual numbers (ms, MB, fps targets)
- **Validation rules** - Concrete checks and tests

#### EXCLUDE (Non-Implementation)
- **Marketing language** - "revolutionary", "game-changing", "best-in-class"
- **Historical context** - "In 2024...", "Previously...", "Originally..."
- **Future roadmaps** - "Coming soon", "Planned features", "Future updates"
- **Introductions** - "This document explains...", "Welcome to..."
- **Conclusions** - "In summary...", "To conclude..."
- **Company info** - Unless directly relevant to tool usage
- **Philosophical discussions** - "The nature of...", "One might argue..."
- **Testimonials** - "Users report...", "Teams say..."
- **Comparisons without specifics** - "Better than X" without metrics
- **Background theory** - Unless it directly impacts implementation

### Phase 2: Intelligent Extraction

For each research file, extract content using pattern recognition AND semantic understanding:

```typescript
interface ExtractedContent {
  dependencies: Map<string, {
    version: string;
    installCommand: string;
    criticalGotchas: string[];
  }>;
  
  patterns: Map<string, {
    implementation: string; // Actual code
    antiPattern: string;    // What to avoid
    context: string;        // When to use
  }>;
  
  codeExamples: {
    description: string;
    code: string;
    language: string;
  }[];
  
  configurations: {
    filename: string;
    content: string;
    purpose: string;
  }[];
  
  commands: {
    command: string;
    description: string;
    flags?: string[];
  }[];
  
  gotchas: {
    issue: string;
    solution: string;
    example?: string;
  }[];
}
```

### Phase 3: Content Processing Rules

#### Rule 1: Preserve Code Context
```typescript
// When extracting code, include:
// - The problem it solves (1 line max)
// - The code itself (complete, runnable)
// - Critical gotchas (if any)

// ✅ GOOD extraction:
"Event-driven coordination prevents coupling:
\`\`\`typescript
class PlayerService {
  emit('funds.requested', { amount, purpose });
}
\`\`\`
Never import other features' state directly."

// ❌ BAD extraction:
"Use events for coordination" // No implementation detail
```

#### Rule 2: Version Specificity
```typescript
// Always preserve exact versions and compatibility notes
"expo ~53.0.0 // SDK 53, not 54!"
"@legendapp/state@beta // Must use beta for v3"
"react-native 0.76+ // New Architecture required"
```

#### Rule 3: Anti-Pattern Prominence
```typescript
// Anti-patterns get special treatment:
"🚨 NEVER: npm install --legacy-peer-deps
✅ ALWAYS: npx expo install [package]"
```

#### Rule 4: Command Completeness
```bash
# Include full command with common flags
npx expo install package-name
# Flags: --check, --fix, --npm
# Why: Resolves SDK-compatible versions automatically
```

### Phase 4: Output Structure

Generate `/research/quick-ref.md` with this structure:

```markdown
# Implementation Quick Reference
*Generated: [timestamp] | Files processed: [count]*

## Critical Dependencies
| Package | Version | Install | Gotcha |
|---------|---------|---------|--------|
| expo | ~53.0.0 | `npx create-expo-app` | Never npm install |

## Architecture Patterns
### [Pattern Name]
**When**: [One line context]
**Implementation**:
\`\`\`typescript
[Actual code]
\`\`\`
**Anti-pattern**: [What to avoid]

## Code Recipes
### [Task Name]
\`\`\`typescript
// Complete, copy-pasteable solution
\`\`\`

## Configuration Files
### tsconfig.json
\`\`\`json
{
  // Actual config with comments
}
\`\`\`

## Commands Cheatsheet
\`\`\`bash
# Development
npx expo start

# Installation (ALWAYS use expo install)
npx expo install [package]

# Building
eas build --platform all
\`\`\`

## Critical Anti-Patterns
1. 🚨 Global state object - Violates vertical slicing
2. 🚨 npm --legacy-peer-deps - Masks conflicts
3. 🚨 Direct cross-feature imports - Creates coupling

## Performance Targets (not guarantees)
- Initial load: <3s
- Frame rate: 60fps target
- Bundle size: <10MB
- Memory: <75MB

## File Organization
\`\`\`
features/
├── player/
│   ├── service.ts      # Private state, public capabilities
│   ├── events.ts       # Event definitions
│   └── index.ts        # Public API only
\`\`\`

## Gotchas & Solutions
| Issue | Solution | Example |
|-------|----------|---------|
| [Issue] | [Fix] | [Code if needed] |
```

### Phase 5: Quality Validation

After generation, validate the output:

1. **No fluff check**: Scan for marketing words
2. **Code completeness**: Verify all code blocks are runnable
3. **Version accuracy**: Check all versions are specific
4. **Anti-pattern coverage**: Ensure critical mistakes are warned against
5. **Implementation focus**: Every section must help BUILD something

### Phase 6: Metrics Reporting

Report extraction metrics:
```
Extraction Complete:
- Files processed: 15
- Code blocks preserved: 47
- Patterns extracted: 12
- Anti-patterns identified: 8
- Commands documented: 23
- Total size: 15KB (from 250KB)
- Compression ratio: 94%
- Implementation relevance: 100%
```

## Implementation Algorithm

```typescript
async function extractImplementationResearch() {
  const research = await globResearchFiles('/research/**/*.md');
  const extracted = new Map<string, ExtractedContent>();
  
  for (const file of research) {
    const content = await readFile(file);
    
    // Extract code blocks
    const codeBlocks = extractCodeBlocks(content);
    
    // Extract dependencies with versions
    const dependencies = extractDependencies(content);
    
    // Extract patterns with implementation
    const patterns = extractPatterns(content);
    
    // Extract commands
    const commands = extractCommands(content);
    
    // Extract anti-patterns
    const antiPatterns = extractAntiPatterns(content);
    
    // Skip non-implementation content
    const filtered = filterNonImplementation(content);
    
    extracted.set(file, {
      codeBlocks,
      dependencies,
      patterns,
      commands,
      antiPatterns
    });
  }
  
  // Generate quick-ref.md
  const output = generateQuickRef(extracted);
  
  // Validate quality
  validateOutput(output);
  
  // Write file
  await writeFile('/research/quick-ref.md', output);
  
  // Report metrics
  reportMetrics(extracted, output);
}

function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const [, language, code] = match;
    
    // Get context (line before code block)
    const contextStart = content.lastIndexOf('\n', match.index - 1);
    const contextEnd = match.index;
    const context = content.slice(contextStart, contextEnd).trim();
    
    // Skip if context is fluff
    if (!isFluff(context)) {
      blocks.push({ language, code, context });
    }
  }
  
  return blocks;
}

function isFluff(text: string): boolean {
  const fluffPatterns = [
    /^(introduction|conclusion|summary)/i,
    /in (2024|2025|the future)/i,
    /revolutionary|game-changing/i,
    /this (document|guide|tutorial)/i,
    /^welcome to/i
  ];
  
  return fluffPatterns.some(pattern => pattern.test(text));
}

function extractDependencies(content: string): Dependency[] {
  const deps = [];
  
  // Match package@version patterns
  const versionRegex = /@?([\w-]+\/)?[\w-]+@[\^~]?[\d.]+(-\w+)?/g;
  
  // Match install commands
  const installRegex = /(?:npm|yarn|pnpm|npx expo) install [^\n]+/g;
  
  // Extract and correlate
  // ... implementation
  
  return deps;
}
```

## Success Criteria

The generated quick-ref.md should:
1. Be immediately useful for implementation
2. Contain zero marketing fluff
3. Have complete, runnable code examples
4. Warn against all critical anti-patterns
5. Fit common implementation scenarios
6. Be under 20KB while preserving all essential information

## Integration

This command should be run:
1. After adding new research files
2. Before running development workflows
3. As part of CI/CD to keep references current

The output directly feeds into:
- `/prd-to-technical-requirements`
- `/create-development-runbook-v2`
- `/validate-architecture-alignment`

## Example Output Snippet

```markdown
## Vertical State Isolation
**When**: Features need independent state
**Implementation**:
\`\`\`typescript
class PlayerService {
  #state$ = observable({ currency: 1000 });
  
  spend(amount: number): Result<void, Error> {
    if (this.#state$.currency.peek() < amount) {
      return Result.err(new InsufficientFundsError());
    }
    this.#state$.currency.set(c => c - amount);
    return Result.ok();
  }
  
  readonly currency$ = computed(() => this.#state$.currency.get());
}
\`\`\`
**Anti-pattern**: Never use global `gameState$` object
```

This ensures every piece of information directly contributes to building working software.