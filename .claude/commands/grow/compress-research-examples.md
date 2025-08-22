# Compress Research Command - Usage Examples

## Basic Usage

```bash
# Compress a research folder to default output
/compress-research /research/agentic/

# Specify custom output filename
/compress-research /research/agentic/ agentic-implementation-guide.md

# Compress project-specific research
/compress-research /research/tech/ tech-stack-compressed.md
```

## Example Input/Output

### Input: Research folder with multiple files
```
/research/example/
├── llm-optimization.md (5000 tokens)
├── pattern-extraction.md (3000 tokens)
├── compression-techniques.md (4000 tokens)
└── marketing-overview.md (2000 tokens)
```

### Output: Compressed implementation reference
```markdown
# LLM Optimization - Implementation Reference
*Compressed from 4 files (14000 tokens → 2863 tokens, 80% reduction)*

## Quick Reference
| Pattern | Implementation | Avoid | Confidence |
|---------|---------------|-------|------------|
| semantic-compression | LLMLingua with salience scoring | blind truncation | ✅✅✅ |
| hierarchical-loading | L0-L4 progressive context | flat loading | ✅✅✅ |
| pattern-language | name/intent/solution/anti-pattern | verbose descriptions | ✅✅ |
| markdown-format | 15% more efficient than JSON | structured data | ✅✅✅ |

## L0: Index (10 tokens)
semantic-compression, hierarchical-loading, pattern-language, markdown-format, token-counting

## L1: Critical Patterns (95 tokens)
- **semantic-compression**: Keep salient tokens using importance scoring
- **hierarchical-loading**: L0(10) → L1(100) → L2(500) → L3(2000) tokens
- **pattern-language**: Compress to name/intent/solution/anti-pattern format
- **markdown-format**: Use markdown over JSON for 15% token savings
- **token-counting**: Use tiktoken/cl100k_base not char/4 estimation

## L2: Implementation Guide (487 tokens)
### Semantic Compression
**Intent**: Reduce tokens while preserving meaning
**Solution**: Score sentence importance, keep high-scoring content
**Implementation**: 
```
1. Split into sentences
2. Score by relevance + density + recency  
3. Keep top sentences until target
```
**Anti-pattern**: Random truncation loses critical information
**Metrics**: 20x compression with 85% meaning retention

### Hierarchical Loading
**Intent**: Progressive context based on task needs
**Solution**: Tiered information architecture
**Structure**:
- L0: Pattern names only (always load)
- L1: Critical patterns + intent
- L2: Add implementation details
- L3: Include examples and edge cases
- L4: Link to source documents
**Anti-pattern**: Loading everything regardless of task

### Pattern Language Format
**Intent**: Preserve semantic relationships in compression
**Solution**: Structured 4-part template
**Template**:
- Pattern Name: 2-3 word identifier
- Intent: Why use it (10-15 words)
- Solution: How to implement (20-30 words)  
- Anti-pattern: What to avoid (10-15 words)
**Benefit**: 60 words vs 1000, preserves critical meaning

## L3: Complete Reference (1876 tokens)
[Full extracted patterns with detailed examples, metrics, and source references...]

## Source References
- semantic-compression: llm-optimization.md:234-567
- hierarchical-loading: compression-techniques.md:89-145
- pattern-language: pattern-extraction.md:12-78
```

## Advanced Features

### Pattern Clustering
The command automatically groups related patterns:
```markdown
## Architecture Patterns
- vertical-slicing
- feature-folders
- bounded-contexts

## State Management
- observable-state
- legend-state
- per-feature-stores
```

### Importance Scoring
Content is scored based on:
- Mention frequency (×10 points)
- Critical markers (+50 points)
- Multi-file validation (×5 points)
- Implementation examples (+20 points)

### Automatic Filtering
Excludes automatically:
- Marketing language ("revolutionary", "game-changing")
- Historical context without implementation value
- Redundant descriptions
- Non-technical background

### Confidence Indicators
- ✅✅✅ High: Tested in production, metrics available
- ✅✅ Medium: Well-documented, limited testing
- ✅ Low: Experimental or theoretical

## Integration with Other Commands

```bash
# Compress research then generate implementation plan
/compress-research /research/tech/ tech-guide.md
/generate-implementation-plan tech-guide.md

# Compress multiple research areas
/compress-research /research/agentic/ agentic.md
/compress-research /research/architecture/ arch.md
/merge-compressions agentic.md arch.md combined-guide.md
```

## Customization Options

Future versions could support:
- `--max-tokens=1000` - Set maximum output size
- `--level=L2` - Generate only up to specified level
- `--format=table` - Output as tables only
- `--focus=performance` - Prioritize specific pattern types
- `--exclude=testing` - Skip certain categories

## Performance Metrics

Typical compression ratios:
- Research papers: 85-90% reduction
- Technical documentation: 80-85% reduction
- Architecture documents: 75-80% reduction
- Mixed content: 70-85% reduction

Token efficiency:
- Original: 10,000-50,000 tokens per research folder
- Compressed: 2,000-5,000 tokens
- L1 only: 100-200 tokens for quick reference

## Troubleshooting

**Issue**: Output too large
**Solution**: Increase importance threshold, focus on L0-L1 only

**Issue**: Missing critical patterns
**Solution**: Check extraction markers, adjust importance scoring

**Issue**: Too much compression
**Solution**: Preserve more examples in L2-L3 sections

## Best Practices

1. **Pre-organize research**: Group related files in subfolders
2. **Use consistent terminology**: Helps pattern detection
3. **Include metrics**: Quantified benefits improve scoring
4. **Mark critical sections**: Use "CRITICAL:", "MUST:", "REQUIRED:"
5. **Provide examples**: Concrete implementations score higher

## Command Evolution

This command implements research from `/research/agentic/`:
- LLM context optimization techniques
- Pattern language extraction strategies
- Semantic compression algorithms
- Hierarchical information architecture

Future improvements:
- Machine learning-based importance scoring
- Cross-reference detection and deduplication
- Automatic pattern relationship mapping
- Dynamic compression based on query context