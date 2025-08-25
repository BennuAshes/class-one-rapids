# Knowledge Graph Extraction Strategies for Research Notes

## Core Extraction Strategies

### 1. Multi-Stage Pipeline
```
Raw Text → Chunking → Entity Extraction → Relationship Mapping → Deduplication → Graph
```
- **Chunking**: Split into ~500 word segments (LLM context limits)
- **Triple Extraction**: Extract Subject-Predicate-Object patterns
- **Entity Resolution**: Merge duplicates ("AI" = "artificial intelligence")
- **Relationship Inference**: Add transitive/logical connections

### 2. Schema-Guided Extraction
Provide LLM with predefined entity types and relationships:
```yaml
entities:
  - Research Topic
  - Technical Requirement
  - Implementation Detail
  - Decision Point
relationships:
  - informs
  - contradicts
  - depends-on
  - revises
```

### 3. Iterative Clustering (KGGen Approach)
- Pass entity list to LLM repeatedly
- Extract one cluster at a time
- Gradually consolidate similar concepts
- More accurate than single-pass extraction

## Practical Tools & Frameworks (2025)

### LLM-Powered Tools
- **Neo4j LLM Knowledge Graph Builder**: Web app for PDF/markdown → graph
- **KGGen**: Python package for text → knowledge graph with clustering
- **LangChain + OpenAI Functions**: Programmatic extraction pipeline
- **GFM-RAG**: Graph foundation model for retrieval

### Markdown-Compatible Systems
- **Obsidian**: Bidirectional links + graph visualization
- **Foam**: VSCode-based with GitHub integration
- **Dendron**: Hierarchical markdown notes with graph features
- **Roam Research**: Networked note-taking with graph overview

### Graph Storage/Query
- **Neo4j**: Industry standard graph database
- **FalkorDB**: High-performance graph database
- **Apache TinkerPop**: Graph computing framework
- **RDF/SPARQL**: Semantic web standards

## Implementation Strategy for Your Research

### Phase 1: Structure Your Research
```markdown
# Research: [Topic Name]
## Key Findings
- Finding 1
- Finding 2

## Relationships
- Depends on: [Other Research]
- Contradicts: [Previous Finding]
- Informs: [Command/Workflow]

## Metadata
- Date: 2025-01-24
- Confidence: High/Medium/Low
- Source: [URL/File]
```

### Phase 2: Extract Triples
Use LLM to extract from `/research/quick-ref.md`:
```python
prompt = """
Extract knowledge triples from this research:
Format: (Subject, Predicate, Object)
Example: (State Management, requires, Observable Pattern)
"""
```

### Phase 3: Build Graph
```python
# Pseudo-code
for chunk in research_chunks:
    triples = llm.extract_triples(chunk)
    graph.add_nodes_and_edges(triples)
    
# Deduplicate
graph.merge_similar_entities()
graph.infer_transitive_relationships()
```

### Phase 4: Query for Context
```cypher
// Neo4j Cypher example
MATCH (r:Research)-[:INFORMS]->(c:Command)
WHERE c.name = 'generate-prd'
RETURN r.content
```

## Specific Approach for Claude Code Integration

### Option 1: Lightweight Markdown Enhancement
Add structured metadata to research files:
```markdown
---
entities:
  - type: research
    name: State Management Patterns
relationships:
  - informs: generate-prd
  - depends-on: Legend-state Documentation
---
```

### Option 2: External Graph Service
1. Parse research folder periodically
2. Build graph in Neo4j/FalkorDB
3. Query via MCP server when needed
4. Return relevant context to Claude Code

### Option 3: Hybrid Approach
```bash
# Extract relationships
./extract-research-graph.sh

# Output: research-graph.json
{
  "nodes": [...],
  "edges": [...],
  "clusters": [...]
}

# Include in CLAUDE.md
@research/research-graph.json
```

## Key Challenges & Solutions

### Challenge: Entity Duplication
**Solution**: Use LLM for entity resolution in batches:
- Group by type first
- Merge within types
- Validate merges

### Challenge: Relationship Quality
**Solution**: Constrain predicates:
- Max 3 words (ideally 1-2)
- Predefined vocabulary
- Validate with examples

### Challenge: Context Window Limits
**Solution**: Chunk strategically:
- 500-word chunks with overlap
- Maintain chunk relationships
- Aggregate after processing

### Challenge: Graph Maintenance
**Solution**: Version control approach:
- Track graph snapshots
- Log extraction runs
- Diff changes over time

## Recommended Implementation Path

1. **Start Simple**: Add structured headers to research files
2. **Extract Manually**: Use LLM to extract initial graph
3. **Store Locally**: JSON or markdown-based graph representation
4. **Query Programmatically**: Simple scripts to find relevant research
5. **Iterate**: Refine schema based on actual usage patterns

## Example Workflow

```bash
# 1. Extract entities and relationships
cat research/quick-ref.md | \
  llm-extract --schema research-schema.yaml > graph.json

# 2. Query for relevant context
./query-graph.sh "generate-prd" > relevant-research.md

# 3. Include in command context
cat relevant-research.md | claude-code generate-prd
```

## Metrics for Success

- **Coverage**: % of research captured in graph
- **Precision**: Accuracy of extracted relationships
- **Recall**: Completeness of relevant context retrieval
- **Performance**: Query response time
- **Maintenance**: Hours/week to keep current

## Next Steps

1. Audit current `/research/` structure
2. Define entity/relationship schema
3. Test extraction on sample research
4. Build minimal viable graph
5. Integrate with workflow commands
6. Measure improvement in context relevance