# Open Source Knowledge Graph Options

## Knowledge Graph Extraction Tools

### 1. **Neo4j LLM Graph Builder** ⭐️ Best Overall
- **GitHub**: neo4j-labs/llm-graph-builder (2,800+ stars)
- **LLMs**: OpenAI, Gemini, Llama3, Claude, Qwen, **Ollama**
- **Input**: PDFs, docs, web pages, YouTube transcripts
- **Deploy**: Docker compose, local or cloud
- **License**: Apache 2.0
```bash
git clone https://github.com/neo4j-labs/llm-graph-builder
docker-compose up
```

### 2. **Graph Maker** ⭐️ Best for Custom Ontology
- **GitHub**: (900+ stars, 180+ forks)
- **LLMs**: Llama3, Mistral, Mixtral, Gemma (local)
- **Feature**: Forces LLM to use YOUR defined ontology
- **Language**: Python
```python
from graph_maker import GraphMaker
gm = GraphMaker(ontology="your-schema.yaml")
graph = gm.from_text(research_text)
```

### 3. **LLMGraph** (Dylan Hogg)
- **GitHub**: dylanhogg/llmgraph
- **LLMs**: Any via LiteLLM (including Ollama)
- **Output**: GraphML, GEXF, HTML
- **Feature**: Local caching, custom entity types
```bash
pip install llmgraph
llmgraph --model ollama/llama3 --input research.md
```

### 4. **DeepKE** ⭐️ Most Comprehensive
- **GitHub**: zjunlp/DeepKE (EMNLP 2022)
- **LLMs**: KnowLM, ChatGLM, LLaMA, GPT-series
- **Feature**: MCP service integration (2025)
- **Install**: `pip install deepke`

### 5. **LangChain LLMGraphTransformer** ⭐️ Most Flexible
- **Built-in** to LangChain
- **Issue**: Ollama doesn't support structured output directly
- **Workaround**: Use with OpenAI-compatible wrapper
```python
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_community.llms import Ollama

# Note: May need wrapper for structured output
llm = Ollama(model="llama3")
transformer = LLMGraphTransformer(llm=llm)
```

## Open Source Graph Databases

### 1. **Memgraph** ⭐️ Fastest
- **Speed**: 8x faster reads, 50x faster writes than Neo4j
- **Feature**: Neo4j drop-in replacement (Cypher compatible)
- **Architecture**: In-memory
- **Deploy**: Docker, local binary
```bash
docker run -p 7687:7687 memgraph/memgraph
```

### 2. **Neo4j Community Edition** ⭐️ Most Mature
- **GitHub**: 12,000+ stars
- **Language**: Cypher
- **Limits**: 34B nodes, 34B relationships
- **Free**: Yes, with some limitations
```bash
docker run -p 7474:7474 -p 7687:7687 neo4j:community
```

### 3. **FalkorDB** ⭐️ Best for AI/ML
- **Based on**: Redis modules
- **Feature**: Optimized for GraphRAG
- **Speed**: Very fast for AI workloads
```bash
docker run -p 6379:6379 falkordb/falkordb
```

### 4. **ArangoDB** ⭐️ Multi-Model
- **GitHub**: 13,000+ stars
- **Feature**: Graph + Document + Key-Value
- **Language**: AQL (similar to SQL)
```bash
docker run -p 8529:8529 arangodb
```

### 5. **NebulaGraph** ⭐️ Best for Scale
- **Feature**: Distributed, handles trillions of edges
- **Language**: nGQL, OpenCypher compatible
- **Deploy**: On-prem, cloud, hybrid
```bash
docker run --name nebula-graph -p 9669:9669 vesoft/nebula-graph
```

## Local LLM Options for Graph Extraction

### 1. **Ollama** (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3
ollama pull mistral
ollama pull phi3

# Use with Python
from langchain_community.llms import Ollama
llm = Ollama(model="llama3")
```

### 2. **LM Studio**
- GUI for running local LLMs
- Supports GGUF models
- OpenAI-compatible API

### 3. **LocalAI**
- Drop-in OpenAI replacement
- Supports multiple model formats
- REST API compatible

## Complete Open Source Stack Example

### Simple Python Implementation
```python
# 1. Extract graph using local LLM
from langchain_community.llms import Ollama
import json

llm = Ollama(model="llama3")

def extract_graph(text):
    prompt = """Extract entities and relationships as JSON:
    {"entities": [...], "relationships": [...]}"""
    
    response = llm.invoke(f"{prompt}\n\nText: {text}")
    return json.loads(response)

# 2. Store in Memgraph
from gqlalchemy import Memgraph

db = Memgraph(host="localhost", port=7687)

def store_graph(graph_data):
    for entity in graph_data["entities"]:
        db.execute(f"CREATE (n:Entity {{name: '{entity}'}})")
    
    for rel in graph_data["relationships"]:
        db.execute(f"""
            MATCH (a:Entity {{name: '{rel['from']}'}}),
                  (b:Entity {{name: '{rel['to']}'}})
            CREATE (a)-[:${rel['type']}]->(b)
        """)

# 3. Query for context
def get_context(topic):
    result = db.execute(f"""
        MATCH (n:Entity {{name: '{topic}'}})-[r]-(related)
        RETURN related.name, type(r)
    """)
    return result
```

### Docker Compose Setup
```yaml
version: '3.8'
services:
  memgraph:
    image: memgraph/memgraph
    ports:
      - "7687:7687"
  
  ollama:
    image: ollama/ollama
    volumes:
      - ./models:/root/.ollama
    ports:
      - "11434:11434"
```

## Recommended Stack for Your Use Case

### Option 1: Simplest
- **LLM**: Ollama + Llama3
- **Extraction**: Custom Python script
- **Storage**: JSON files
- **Cost**: $0

### Option 2: Production-Ready
- **LLM**: Ollama + Llama3/Mistral
- **Extraction**: Neo4j LLM Graph Builder
- **Database**: Memgraph (Neo4j compatible)
- **Cost**: $0

### Option 3: Most Powerful
- **LLM**: Ollama + multiple models
- **Extraction**: DeepKE or custom LangChain
- **Database**: Neo4j Community + Memgraph
- **Visualization**: Neo4j Browser
- **Cost**: $0

## Key Limitations of Open Source

1. **Ollama + LangChain**: Structured output issues (workarounds exist)
2. **Neo4j Community**: Some enterprise features locked
3. **Local LLMs**: Slower than GPT-4, less accurate extraction
4. **Graph size**: Memory constraints on local machines

## Getting Started Commands

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3

# 2. Clone Neo4j Graph Builder
git clone https://github.com/neo4j-labs/llm-graph-builder
cd llm-graph-builder
docker-compose up

# 3. Or use Memgraph
docker run -p 7687:7687 memgraph/memgraph

# 4. Install Python dependencies
pip install langchain-community neo4j gqlalchemy
```

All tools listed are:
- ✅ 100% Free
- ✅ Open Source
- ✅ Run Locally
- ✅ No API Keys Required (when using Ollama)
- ✅ Active Development in 2025