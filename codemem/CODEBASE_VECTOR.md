Vector databases can store codebase embeddings for semantic search and context retrieval. Here's how to implement this:

## Basic Architecture

1. **Chunk the codebase** - Split files into logical chunks (functions, classes, documentation blocks)
2. **Generate embeddings** - Convert chunks to vectors using models like:
   - OpenAI's `text-embedding-3-small/large`
   - Sentence transformers
   - Code-specific models (CodeBERT, GraphCodeBERT)
3. **Store in vector DB** - Popular options:
   - Pinecone (managed)
   - Weaviate (open source, can self-host)
   - Chroma (lightweight, local-first)
   - Qdrant (Rust-based, fast)
   - pgvector (PostgreSQL extension)

## Storage Schema

Store metadata alongside vectors:

```json
{
  "id": "unique_chunk_id",
  "vector": [0.123, -0.456, ...],
  "metadata": {
    "file_path": "src/auth/login.ts",
    "start_line": 45,
    "end_line": 67,
    "chunk_type": "function",
    "function_name": "authenticateUser",
    "last_modified": "2025-01-15T10:30:00Z",
    "git_hash": "abc123"
  },
  "text": "actual code chunk content"
}
```

## Update Strategies

**Incremental updates:**

- Hook into git commits
- On file change: delete old chunks for that file, re-chunk, re-embed, store new chunks
- Track `git_hash` to identify outdated entries

**Full rebuilds:**

- Periodically re-index entire codebase
- Useful when switching embedding models

## Query Pattern

```python
# Pseudo-code
query = "how is authentication handled?"
query_vector = embed(query)
results = vector_db.search(
    vector=query_vector,
    limit=10,
    filters={"metadata.file_path": {"$regex": "auth/*"}}
)
```

## Implementation Questions

Do you want:

- Specific vector DB recommendation for your use case?
- Code examples for a particular stack?
- Strategies for handling different file types (code vs docs)?
- Advice on chunking strategies?
