#!/usr/bin/env python3
"""
Setup Langfuse Score Configurations via API

This script creates all score configurations needed for the workflow
evaluation system. Run this once after setting up Langfuse.

Usage:
    python scripts/setup_langfuse_score_configs.py [--config CONFIG_FILE]
    
    Options:
        --config PATH    Load config from YAML file (default: observability/score-configs.yaml)

Environment Variables Required:
    LANGFUSE_PUBLIC_KEY
    LANGFUSE_SECRET_KEY
    LANGFUSE_HOST (default: http://localhost:3000)
"""

import os
import sys
import argparse
import requests
from pathlib import Path
from typing import Dict, List

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False

# Langfuse configuration
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST", "http://localhost:3000")
LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")

# Validate environment variables
if not LANGFUSE_PUBLIC_KEY or not LANGFUSE_SECRET_KEY:
    print("Error: LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be set")
    sys.exit(1)

# Score configurations to create
SCORE_CONFIGS = [
    # PRD Scores (Numeric 0-10)
    {
        "name": "prd_completeness",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "PRD completeness score - Are all required sections present?"
    },
    {
        "name": "prd_clarity",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "PRD clarity score - Is the language clear and specific?"
    },
    {
        "name": "prd_technical_depth",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "PRD technical depth score - Is there sufficient technical detail?"
    },
    
    # Design Scores (Numeric 0-10)
    {
        "name": "design_architecture",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Design architecture quality score - System design and component breakdown"
    },
    {
        "name": "design_feasibility",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Design feasibility score - Implementation practicality"
    },
    {
        "name": "design_completeness",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Design completeness score - All design elements present"
    },
    
    # Tasks Scores (Numeric 0-10)
    {
        "name": "tasks_actionability",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Tasks actionability score - Tasks are specific and executable"
    },
    {
        "name": "tasks_completeness",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Tasks completeness score - All aspects covered"
    },
    {
        "name": "tasks_clarity",
        "dataType": "NUMERIC",
        "minValue": 0,
        "maxValue": 10,
        "description": "Tasks clarity score - Descriptions are clear"
    },
    
    # Overall Quality Scores (Categorical)
    {
        "name": "prd_overall",
        "dataType": "CATEGORICAL",
        "categories": ["excellent", "good", "needs_improvement", "poor"],
        "description": "Overall PRD quality assessment"
    },
    {
        "name": "design_overall",
        "dataType": "CATEGORICAL",
        "categories": ["excellent", "good", "needs_improvement", "poor"],
        "description": "Overall Design quality assessment"
    },
    {
        "name": "tasks_overall",
        "dataType": "CATEGORICAL",
        "categories": ["excellent", "good", "needs_improvement", "poor"],
        "description": "Overall Tasks quality assessment"
    },
    
    # Boolean Scores
    {
        "name": "design_has_security",
        "dataType": "BOOLEAN",
        "description": "Design has security section - true if security section exists"
    },
    {
        "name": "tasks_has_criteria",
        "dataType": "BOOLEAN",
        "description": "Tasks have acceptance criteria - true if criteria are defined"
    },
    
    # Approval Scores (Numeric 0.0/1.0)
    {
        "name": "approval_prd",
        "dataType": "NUMERIC",
        "minValue": 0.0,
        "maxValue": 1.0,
        "description": "PRD approval decision - 1.0 = approved, 0.0 = rejected"
    },
    {
        "name": "approval_design",
        "dataType": "NUMERIC",
        "minValue": 0.0,
        "maxValue": 1.0,
        "description": "Design approval decision - 1.0 = approved, 0.0 = rejected"
    },
    {
        "name": "approval_tasks",
        "dataType": "NUMERIC",
        "minValue": 0.0,
        "maxValue": 1.0,
        "description": "Tasks approval decision - 1.0 = approved, 0.0 = rejected"
    },
]


def create_score_config(config: Dict) -> bool:
    """
    Create a score configuration in Langfuse
    
    Args:
        config: Score configuration dictionary
        
    Returns:
        True if successful, False otherwise
    """
    url = f"{LANGFUSE_HOST}/api/public/score-configs"
    
    try:
        response = requests.post(
            url,
            json=config,
            auth=(LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY),
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200 or response.status_code == 201:
            return True
        elif response.status_code == 409:
            # Already exists
            print(f"  [WARN] Already exists")
            return True
        else:
            print(f"  [ERROR] Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  [ERROR] Error: {e}")
        return False


def list_existing_configs() -> List[str]:
    """
    List existing score configurations
    
    Returns:
        List of existing config names
    """
    url = f"{LANGFUSE_HOST}/api/public/score-configs"
    
    try:
        response = requests.get(
            url,
            auth=(LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY),
            timeout=10
        )
        
        if response.status_code == 200:
            configs = response.json()
            # API returns different structures, handle both
            if isinstance(configs, list):
                return [c.get('name', '') for c in configs]
            elif isinstance(configs, dict) and 'data' in configs:
                return [c.get('name', '') for c in configs['data']]
        return []
    except Exception as e:
        print(f"Warning: Could not list existing configs: {e}")
        return []


def load_configs_from_yaml(config_file: str) -> List[Dict]:
    """
    Load score configurations from YAML file
    
    Args:
        config_file: Path to YAML config file
        
    Returns:
        List of score configuration dictionaries
    """
    if not YAML_AVAILABLE:
        print("Error: PyYAML not installed. Install with: pip install pyyaml")
        sys.exit(1)
    
    config_path = Path(config_file)
    if not config_path.exists():
        print(f"Error: Config file not found: {config_file}")
        sys.exit(1)
    
    with open(config_path, 'r') as f:
        data = yaml.safe_load(f)
    
    # Flatten all score groups into single list
    configs = []
    for group_name, group_configs in data.items():
        if isinstance(group_configs, list):
            configs.extend(group_configs)
    
    return configs


def main():
    """Create all score configurations"""
    # Parse arguments
    parser = argparse.ArgumentParser(
        description="Setup Langfuse score configurations"
    )
    parser.add_argument(
        '--config',
        default='observability/score-configs.yaml',
        help='Path to YAML config file'
    )
    args = parser.parse_args()
    
    print("=" * 70)
    print("Langfuse Score Configuration Setup")
    print("=" * 70)
    print()
    print(f"Langfuse Host: {LANGFUSE_HOST}")
    
    # Load configurations
    global SCORE_CONFIGS
    if args.config and Path(args.config).exists():
        print(f"Config File: {args.config}")
        print()
        print("Loading configurations from YAML file...")
        SCORE_CONFIGS = load_configs_from_yaml(args.config)
        print(f"[OK] Loaded {len(SCORE_CONFIGS)} configurations")
    else:
        print("Config File: Built-in defaults")
        print()
        print(f"Using {len(SCORE_CONFIGS)} built-in configurations")
    print()
    
    # Check connection
    print("Testing connection to Langfuse...")
    try:
        response = requests.get(
            f"{LANGFUSE_HOST}/api/public/health",
            timeout=5
        )
        if response.status_code != 200:
            print(f"[ERROR] Langfuse not responding properly (status: {response.status_code})")
            print("  Make sure Langfuse is running: docker-compose up -d")
            sys.exit(1)
        print("[OK] Connected to Langfuse")
        print()
    except Exception as e:
        print(f"[ERROR] Cannot connect to Langfuse: {e}")
        print("  Make sure Langfuse is running: docker-compose up -d")
        sys.exit(1)
    
    # List existing configurations
    print("Checking for existing configurations...")
    existing = list_existing_configs()
    if existing:
        print(f"Found {len(existing)} existing configurations:")
        for name in existing:
            print(f"  - {name}")
    print()
    
    # Create score configurations
    print(f"Creating {len(SCORE_CONFIGS)} score configurations...")
    print("-" * 70)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for config in SCORE_CONFIGS:
        name = config['name']
        data_type = config['dataType']
        
        # Check if already exists
        if name in existing:
            print(f"[OK] {name} ({data_type}) - Already exists, skipping")
            skip_count += 1
            continue
        
        print(f"Creating: {name} ({data_type})...", end=" ")
        
        if create_score_config(config):
            print("[OK]")
            success_count += 1
        else:
            fail_count += 1
    
    print("-" * 70)
    print()
    print("Summary:")
    print(f"  [OK] Created: {success_count}")
    print(f"  [WARN] Skipped (already exist): {skip_count}")
    print(f"  [ERROR] Failed: {fail_count}")
    print()
    
    if fail_count > 0:
        print("[WARN] Some configurations failed to create. Check errors above.")
        sys.exit(1)
    
    print("=" * 70)
    print("[OK] Score configuration setup complete!")
    print()
    print("You can now:")
    print("  1. View configurations in Langfuse UI: Settings → Score Configs")
    print("  2. Use these scores in your evaluators")
    print("  3. Run the example scripts to see scores in action")
    print("=" * 70)


if __name__ == "__main__":
    main()

