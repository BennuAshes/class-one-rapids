 ---
description: "Technical research focused on code, APIs, and implementation details for LLM context"
argument-hint: "<technical topic, framework, or tool>"
allowed-tools: "WebSearch, WebFetch, Task, Write, Read, Bash(mkdir:*), Grep"
---

# Technical Research Agent - Code & Implementation Focus

Technical topic: **"$ARGUMENTS"**

**Think hard** about the most practical implementation patterns and code examples that will enable immediate application.

## Mission: Generate Production-Ready Technical Documentation

Create comprehensive technical research with working code, real implementations, and battle-tested patterns. Every section must provide actionable, copy-paste ready solutions.

## Research Strategy

### 🔍 Phase 1: Technical Foundation
**Search aggressively for code and documentation:**
1. Official docs, API references, and SDKs
2. GitHub repos with high stars and recent activity
3. Stack Overflow solutions and discussions
4. Technical blogs and implementation tutorials
5. Version compatibility and breaking changes

**Critical searches:**
- `"$ARGUMENTS" site:github.com stars:>100`
- `"$ARGUMENTS" site:stackoverflow.com accepted answer`
- `"$ARGUMENTS" implementation example production`
- `"$ARGUMENTS" API reference documentation`
- `"$ARGUMENTS" common errors troubleshooting`

### 💻 Phase 2: Code Extraction & Testing
**Think deeply** about code quality and patterns:
1. Extract minimal working examples
2. Identify production-ready implementations
3. Find error handling and edge cases
4. Collect performance optimization techniques
5. Gather testing strategies and test code

### 🏗️ Phase 3: Architecture & Patterns
**Think harder** about scalable, maintainable solutions:
1. Design patterns and architectural decisions
2. Integration with popular frameworks
3. Dependency management and versioning
4. Build and deployment configurations
5. CI/CD pipeline examples

### 🔐 Phase 4: Production Considerations
**Think hard** about production requirements and real-world constraints:
1. Security best practices and vulnerabilities
2. Performance benchmarks and optimization
3. Monitoring, logging, and debugging
4. Scaling strategies and limitations
5. Migration paths and upgrade guides

## Document Structure Template

Create `/specs/research/<descriptive_name>_YYYYMMDD_HHMMSS.md` with this structure:

```markdown
# [Topic Name] - Implementation Guide

## 🚀 Quick Start
- Installation command: `npm install package-name`
- Basic usage in 3 lines of code
- Minimum requirements and dependencies

## 📋 Command Reference
| Command | Description | Example |
|---------|-------------|---------|
| `cmd1`  | What it does | `cmd1 --flag` |
| `cmd2`  | What it does | `cmd2 arg` |

## 💻 Code Examples

### Basic Implementation
\`\`\`javascript
// Minimal working example with comments
const example = require('package');
example.doSomething({ option: true });
\`\`\`

### Advanced Patterns
\`\`\`javascript
// Production-ready implementation
// Error handling, typing, best practices
\`\`\`

### Common Use Cases
1. **Scenario A**: Code solution
2. **Scenario B**: Code solution
3. **Edge Case**: How to handle

## 🔧 Configuration

### Options Table
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | "default" | What it controls |

### Environment Variables
- `ENV_VAR_1`: Purpose and values
- `ENV_VAR_2`: Purpose and values

## ✅ Best Practices
- **DO**: Use async/await for better readability
  \`\`\`js
  const result = await fetchData();
  \`\`\`
- **DON'T**: Nest callbacks deeply
  \`\`\`js
  // Avoid: callback(callback(callback()))
  \`\`\`

## 🐛 Troubleshooting
| Error | Cause | Solution |
|-------|-------|----------|
| "Error message" | Why it happens | How to fix |

## 🔍 Testing Patterns
\`\`\`javascript
// Unit test example
describe('Feature', () => {
  test('should work', () => {
    expect(feature()).toBe(expected);
  });
});
\`\`\`

## 📚 Resources
- [Official Docs](https://docs.example.com)
- [GitHub Repo](https://github.com/org/repo)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/topic)

## ⚠️ Known Limitations
- Current gaps in functionality
- Version-specific issues
- Workarounds available
```

## Execution Checklist

### Pre-Research Setup
```bash
mkdir -p research
```

### Research Process
1. **Initial Search** (5-10 queries)
   - Use WebSearch with varied query formulations
   - Target: GitHub, official docs, Stack Overflow, technical blogs
   - Focus on 2024-2025 content for latest practices

2. **Deep Dive** (WebFetch for details)
   - Official documentation pages
   - README files from popular repositories
   - Implementation guides and tutorials
   - API references and specifications

3. **Code Collection**
   - Prioritize working, tested examples
   - Include error handling patterns
   - Show both minimal and production versions
   - Add inline comments for clarity

4. **Format & Structure**
   - Use consistent markdown formatting
   - Create tables for comparisons
   - Add emojis for section headers (sparingly)
   - Include language tags in code blocks
   - Keep sections focused and scannable

5. **Quality Checks**
   - Verify code syntax is correct
   - Ensure examples are self-contained
   - Check that links are current
   - Confirm version information is included

### File Naming Convention
```
/specs/research/[topic_keywords]_YYYYMMDD_HHMMSS.md
```
Examples:
- `react_hooks_patterns_20250916_143022.md`
- `docker_security_guide_20250916_143022.md`
- `api_auth_methods_20250916_143022.md`

### Success Criteria
✅ Document contains runnable code examples
✅ Tables summarize key information
✅ Clear DO/DON'T patterns provided
✅ Testing approaches included
✅ Troubleshooting section populated
✅ Resources link to authoritative sources
✅ Knowledge gaps explicitly stated

## Final Note
**Think harder** about what code examples and implementations will be most valuable for immediate use. The output must be **immediately actionable** for an LLM agent. Every section should provide concrete value through code, commands, or clear specifications. Avoid theory without practice.