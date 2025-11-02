# Score Configuration Setup Guide

Langfuse score configurations can be set up in **three ways**:

## Method 1: Via Configuration File (Recommended) ✅

**Advantages**: Version control, declarative, easy to manage

### 1. Edit the YAML config file

```yaml
# observability/score-configs.yaml
prd_scores:
  - name: prd_completeness
    dataType: NUMERIC
    minValue: 0
    maxValue: 10
    description: "PRD completeness score"
```

### 2. Run the setup script

```bash
# Install dependencies (if not already installed)
pip install pyyaml requests langfuse

# Apply configuration
python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml
```

### 3. Verify in Langfuse UI

Open http://localhost:3000 → Settings → Score Configs

## Method 2: Via Python API

**Advantages**: Programmatic, can integrate into deployment scripts

```python
import requests
import os

LANGFUSE_HOST = os.getenv("LANGFUSE_HOST")
LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")

url = f"{LANGFUSE_HOST}/api/public/score-configs"

score_config = {
    "name": "prd_completeness",
    "dataType": "NUMERIC",
    "minValue": 0,
    "maxValue": 10,
    "description": "PRD completeness score"
}

response = requests.post(
    url,
    json=score_config,
    auth=(LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY)
)

print(response.json())
```

## Method 3: Via Langfuse UI

**Advantages**: Visual, no coding required

1. Open Langfuse: http://localhost:3000
2. Navigate to: Settings → Score Configs
3. Click "Create Score Config"
4. Fill in the form:
   - Name: `prd_completeness`
   - Data Type: Numeric
   - Min Value: 0
   - Max Value: 10
   - Description: "PRD completeness score"
5. Click "Save"

## Comparison

| Method          | Pros                                             | Cons                           | Best For                 |
| --------------- | ------------------------------------------------ | ------------------------------ | ------------------------ |
| **Config File** | Version control, declarative, batch operations   | Requires script                | Production, teams        |
| **Python API**  | Programmatic, flexible, can integrate with CI/CD | Requires coding                | Automation, CI/CD        |
| **UI**          | Visual, easy, no coding                          | Manual, not version controlled | Quick setup, exploration |

## Recommended Workflow

1. **Development**: Use config file approach

   - Edit `observability/score-configs.yaml`
   - Version control the file
   - Apply with setup script

2. **CI/CD**: Automate with setup script

   ```bash
   # In your deployment script
   python scripts/setup_langfuse_score_configs.py
   ```

3. **Production**: Same config file, different Langfuse instance
   ```bash
   export LANGFUSE_HOST="https://your-prod-langfuse.com"
   python scripts/setup_langfuse_score_configs.py
   ```

## Complete Setup Example

```bash
# 1. Start Langfuse
cd observability
docker-compose up -d
cd ..

# 2. Set environment variables
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_HOST="http://localhost:3000"

# 3. Install dependencies
pip install pyyaml requests

# 4. Apply score configurations
python scripts/setup_langfuse_score_configs.py

# 5. Verify
# Open http://localhost:3000 → Settings → Score Configs
```

## Updating Configurations

To add new scores:

1. Edit `observability/score-configs.yaml`
2. Add new score configuration
3. Run setup script again (it will skip existing configs)

```yaml
# Add to observability/score-configs.yaml
custom_scores:
  - name: my_custom_score
    dataType: NUMERIC
    minValue: 0
    maxValue: 100
    description: "My custom evaluation metric"
```

```bash
python scripts/setup_langfuse_score_configs.py
```

## Troubleshooting

### "Config file not found"

- Make sure you're running from project root
- Check file path: `observability/score-configs.yaml`

### "Connection refused"

- Langfuse is not running: `docker-compose up -d`
- Check LANGFUSE_HOST is correct

### "Authentication failed"

- Check LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY
- Verify keys in Langfuse UI: Settings → API Keys

### "Score config already exists"

- This is normal, configs are idempotent
- Existing configs are skipped automatically

## Advanced: Managing Multiple Environments

```bash
# Development
export LANGFUSE_HOST="http://localhost:3000"
python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml

# Staging
export LANGFUSE_HOST="https://staging-langfuse.yourcompany.com"
python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml

# Production
export LANGFUSE_HOST="https://langfuse.yourcompany.com"
python scripts/setup_langfuse_score_configs.py --config observability/score-configs.yaml
```

## See Also

- [Langfuse Scores Documentation](https://langfuse.com/docs/scores)
- [Langfuse API Reference](https://langfuse.com/docs/api)
- [LANGFUSE_SCORES_OBSERVATIONS_GUIDE.md](./LANGFUSE_SCORES_OBSERVATIONS_GUIDE.md)
