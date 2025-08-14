# Agentic Research - Implementation Reference
*Compressed from /research/agentic/ (8 files, ~15000 tokens → 2847 tokens, 81% reduction)*
*Generated: 2025-08-14*

## Quick Reference Table

| Category | Key Patterns | Priority | Confidence |
|----------|-------------|----------|------------|
| Compression | semantic-compression, hierarchical-loading, pattern-language | Critical | ✅✅✅ |
| Format | markdown>JSON (15% efficient), XML-structure, tables | Critical | ✅✅✅ |
| Memory | tiered-memory, context-pruning, importance-decay | High | ✅✅ |
| Architecture | multi-agent, task-model, directed-graph | High | ✅✅ |
| Optimization | token-counting, salience-scoring, template-expansion | Medium | ✅✅ |

## L0: Index (48 tokens)
semantic-compression, hierarchical-loading, pattern-language, markdown-format, XML-structure, tiered-memory, context-pruning, multi-agent, task-model, salience-scoring, template-expansion, token-counting, knowledge-graph, dynamic-loading, error-recovery

## L1: Critical Patterns (148 tokens)

### Compression Fundamentals
- **semantic-compression**: LLMLingua achieves 20x reduction keeping 85% meaning
- **hierarchical-loading**: L0(10)→L1(100)→L2(500)→L3(2000) progressive context
- **pattern-language**: name/intent/solution/anti-pattern preserves semantics
- **markdown>JSON**: 15% more token-efficient, natural LLM processing

### Architecture Patterns  
- **multi-agent**: Specialized agents reduce tokens vs exhaustive lists
- **XML-structure**: Claude responds best to XML-tagged prompts
- **tiered-memory**: Short(session)/Medium(project)/Long(organizational)

### Critical Rules
- ✅ Use tiktoken for accurate counting (NOT length/4)
- ✅ Tables for repeated data structures
- ✅ Progressive loading based on task
- ❌ Never use JSON for LLM context
- ❌ Avoid flat information architecture

## L2: Implementation Guide (652 tokens)

### Semantic Compression Implementation
**Pattern**: LLMLingua-style compression
**Intent**: Reduce tokens while preserving critical meaning
**Solution**: 
```markdown
1. Split content into sentences
2. Score importance: relevance(0.4) + density(0.3) + recency(0.3)
3. Keep sentences scoring >0.7 threshold
4. Preserve structural words
```
**Anti-pattern**: Blind truncation, character limits
**Metrics**: 20x compression, <0.4% performance drop
**Example**: 1000 tokens → 50 tokens preserving implementation details

### Hierarchical Information Architecture
**Pattern**: Progressive context loading
**Implementation**:
```markdown
# Token Budget Allocation
L0: Index only (10 tokens) - pattern names
L1: Critical (100 tokens) - patterns + intent
L2: Implementation (500 tokens) - add solutions
L3: Complete (2000 tokens) - include examples
L4: Research (unlimited) - source documents
```
**Loading Strategy**:
| Query Type | Load Levels | Total Tokens |
|------------|-------------|--------------|
| "implement X" | L1+L2 | 600 |
| "debug Y" | L1+L5 | 250 |
| "optimize Z" | L1+L3 | 2100 |

### Pattern Language Format
**Structure**:
```markdown
Pattern: [2-3 words]
Intent: [why - 10 words]
Solution: [how - 20 words]
Anti-pattern: [avoid - 10 words]
```
**Compression**: 1000 words → 60 words preserving meaning
**Example**:
```
Pattern: vertical-slicing
Intent: Enable independent feature development
Solution: features/{name}/ owns complete stack
Anti-pattern: src/store/gameStore.ts centralized
```

### Memory Management Strategy
**Tiered System**:
- **Short-term**: Current task, recent decisions, active files
- **Medium-term**: Project patterns, conventions, requirements
- **Long-term**: Organization standards, best practices
**Pruning**: Importance-based truncation with decay functions
**Refresh**: Summarize→spin up new instance with summary

### Token Optimization Techniques
- **Accurate counting**: tiktoken/cl100k_base not length/4
- **Format selection**: Markdown>JSON (72.7% reduction possible)
- **Smart routing**: Haiku for formatting, Opus for reasoning
- **Chunking**: Process large datasets in parallel
- **Abbreviations**: Consistent short forms for common terms

## L3: Complete Reference (1999 tokens)

### Advanced Compression Strategies

#### Salience-Based Token Selection
**Implementation Details**:
- Use GPT-2 or small model to score token importance
- Threshold-based filtering (typically 0.7)
- Preserve structural/grammatical tokens regardless of score
- Position-aware scoring (beginning/end higher weight)

**Scoring Formula**:
```
Score = 0.4(semantic_relevance) + 0.3(information_density) + 0.2(position_weight) + 0.1(frequency)
```

#### Template-Based Compression
**Concept**: Store templates, expand on demand
**Example Templates**:
```markdown
vert-slice → "vertical slicing: features/{name}/ owns private state, components, hooks"
obs-state → "observable state using @legendapp/state@beta per-feature stores"
```
**Expansion Rate**: 10 tokens → 50-100 tokens contextual expansion

#### Knowledge Graph Integration
**Structure**:
```markdown
Entities:
- @legendapp/state: {aliases: ["Legend State"], requires: ["react@18+"]}
- vertical-slicing: {enables: ["parallel-dev"], prevents: ["coupling"]}

Relationships:
- @legendapp/state →requires→ react@18+
- vertical-slicing →enables→ independent-testing
```
**Benefits**: Preserves relationships, enables smart retrieval

### Multi-Agent Architecture Patterns

#### Agent Specialization
- Each agent handles specific domain (reduces token load)
- Agents reference relevant action subsets only
- Chain agents for complex workflows
- Parallel execution for independent tasks

#### Coordination Patterns
```markdown
1. Sequential: Agent1 → Agent2 → Agent3
2. Parallel: Agent1 || Agent2 || Agent3
3. Hierarchical: Orchestrator → [Worker1, Worker2]
4. Pub/Sub: Events trigger specialized agents
```

### Error Recovery & Validation

#### Self-Correcting Compression
**Process**: Error → Analyze → Update compression → Regenerate
**Example**:
```markdown
Error: "vertical-slicing" → created gameStore.ts
Fix: Add clarification "(NOT src/store/gameStore.ts)"
Update salience: "features/" weight ×2.0
```

#### Validation Metrics
- **Semantic similarity**: >0.85 cosine similarity target
- **Information retention**: >85% critical info preserved  
- **Recovery rate**: >80% meaning reconstructible
- **Implementation accuracy**: >90% structural match

### Implementation Checklist

#### Essential Setup
- [ ] Install tiktoken for accurate token counting
- [ ] Configure hierarchical level thresholds
- [ ] Define pattern extraction markers
- [ ] Set importance scoring weights
- [ ] Create compression templates

#### Optimization Targets
- [ ] Token reduction: >80%
- [ ] Semantic preservation: >85%
- [ ] Load time: <100ms per level
- [ ] Cache hit rate: >60%

#### Quality Assurance
- [ ] No marketing language in output
- [ ] All technical terms preserved exactly
- [ ] Version numbers maintained
- [ ] Anti-patterns documented
- [ ] Source traceability preserved

### Performance Benchmarks

| Technique | Compression | Accuracy | Speed |
|-----------|------------|----------|-------|
| LLMLingua | 20x | 99.6% | Fast |
| Hierarchical | 10x | 100% | Instant |
| Pattern Language | 15x | 95% | Fast |
| Template Expansion | 10-20x | 98% | Very Fast |
| Salience Scoring | 5-10x | 92% | Moderate |

### Common Anti-Patterns to Avoid

1. **Over-compression**: Losing critical implementation details
2. **Flat loading**: No hierarchy, everything loaded always
3. **JSON context**: 15% less efficient than markdown
4. **Character estimation**: Use proper tokenization
5. **Static architecture**: No dynamic loading based on query
6. **Information destruction**: Compression without preservation
7. **Redundant context**: Not deduplicating similar patterns

### Integration Examples

#### With Claude Code Commands
```xml
<command>
  <role>Implementation focused on [extracted-patterns]</role>
  <context>[compressed-L1-context]</context>
  <implementation>[load-L2-if-needed]</implementation>
</command>
```

#### Progressive Enhancement
```markdown
Query: "Help implement state management"
1. Load L1 (100 tokens) - pattern overview
2. Detect "implement" → Load L2 (500 tokens)
3. If complex → Load L3 sections selectively
```

## Source References

- semantic-compression: compression-strategy-analysis.md:18-42
- hierarchical-loading: llm-context-optimization-research-2025.md:104-236
- pattern-language: pattern-language-extraction-strategy.md:28-85
- markdown-efficiency: llm-optimized-research-architecture.md:5-33
- multi-agent: ai-agent-runbooks.md:25-29
- memory-management: prompt-context-engineering-claude-code.md:94-122
- token-counting: llm-context-optimization-research-2025.md:106-114
- knowledge-graph: llm-context-optimization-research-2025.md:138-157