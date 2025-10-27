#!/usr/bin/env python3
"""
Extract final artifacts from Claude CLI JSON streaming output
This script parses the JSON output and extracts the actual generated content
"""

import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime

def extract_content_from_json_stream(json_file_path):
    """
    Extract the final generated content from Claude's JSON streaming output
    """
    content_lines = []
    metadata = {
        'session_id': None,
        'execution_id': None,
        'model': None,
        'total_cost_usd': None,
        'total_tokens': 0,
        'duration_ms': None,
        'generated_file': None
    }
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            try:
                data = json.loads(line)
                
                # Extract metadata
                if data.get('type') == 'system' and data.get('subtype') == 'init':
                    metadata['session_id'] = data.get('session_id')
                    metadata['model'] = data.get('model')
                
                # Look for file write operations (the actual content)
                if data.get('type') == 'assistant' and 'message' in data:
                    message = data['message']
                    if 'content' in message:
                        for content_item in message['content']:
                            if content_item.get('name') == 'Write' and 'input' in content_item:
                                # Found a file write operation
                                file_path = content_item['input'].get('file_path')
                                file_content = content_item['input'].get('content', '')
                                
                                if file_path and file_content:
                                    metadata['generated_file'] = file_path
                                    return file_content, metadata
                
                # Extract result summary
                if data.get('type') == 'result':
                    metadata['duration_ms'] = data.get('duration_ms')
                    metadata['total_cost_usd'] = data.get('total_cost_usd')
                    if 'usage' in data:
                        metadata['total_tokens'] = data['usage'].get('output_tokens', 0)
                        
            except json.JSONDecodeError:
                # Skip malformed JSON lines
                continue
    
    # If no Write operation found, look for the final result
    with open(json_file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            try:
                data = json.loads(line)
                if data.get('type') == 'result' and 'result' in data:
                    return data['result'], metadata
            except json.JSONDecodeError:
                continue
    
    return None, metadata

def extract_workflow_artifacts(workflow_dir, target_spec_dir=None):
    """
    Extract all artifacts from a workflow directory
    """
    workflow_path = Path(workflow_dir)
    
    if not workflow_path.exists():
        print(f"Error: Workflow directory not found: {workflow_dir}")
        return False
    
    # Find all JSON artifact files
    artifact_files = {
        'prd': list(workflow_path.glob('prd_*.md')),
        'tdd': list(workflow_path.glob('tdd_*.md')),
        'tasks': list(workflow_path.glob('tasks_*.md'))
    }
    
    extracted_count = 0
    
    for artifact_type, files in artifact_files.items():
        for json_file in files:
            print(f"\nProcessing {artifact_type.upper()}: {json_file.name}")
            
            # Check if it's actually JSON by reading first line
            with open(json_file, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
                if not first_line.startswith('{'):
                    print(f"  → Already extracted (not JSON format)")
                    continue
            
            # Extract content
            content, metadata = extract_content_from_json_stream(json_file)
            
            if content:
                # Determine output path
                if target_spec_dir:
                    output_dir = Path(target_spec_dir)
                    output_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Create a meaningful filename
                    timestamp = datetime.now().strftime('%Y%m%d')
                    if artifact_type == 'prd':
                        output_filename = f"prd_extracted_{timestamp}.md"
                    elif artifact_type == 'tdd':
                        output_filename = f"technical_design_{timestamp}.md"
                    else:
                        output_filename = f"{artifact_type}_{timestamp}.md"
                    
                    output_path = output_dir / output_filename
                else:
                    # Save in same directory with .extracted suffix
                    output_path = json_file.with_suffix('.extracted.md')
                
                # Write extracted content
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"  ✓ Extracted to: {output_path}")
                print(f"    - Model: {metadata['model']}")
                print(f"    - Tokens: {metadata['total_tokens']}")
                print(f"    - Cost: ${metadata['total_cost_usd']:.4f}" if metadata['total_cost_usd'] else "    - Cost: N/A")
                
                # Also create a metadata file
                metadata_path = output_path.with_suffix('.metadata.json')
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2)
                
                extracted_count += 1
            else:
                print(f"  ✗ No content found in JSON stream")
    
    print(f"\n{'='*50}")
    print(f"Extraction complete: {extracted_count} artifacts extracted")
    
    # Create a summary file
    summary_path = workflow_path / 'extraction_summary.json'
    summary = {
        'extraction_timestamp': datetime.now().isoformat(),
        'workflow_dir': str(workflow_dir),
        'target_spec_dir': str(target_spec_dir) if target_spec_dir else None,
        'artifacts_extracted': extracted_count,
        'files_processed': {k: len(v) for k, v in artifact_files.items()}
    }
    
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    return extracted_count > 0

def main():
    if len(sys.argv) < 2:
        print("Usage: extract-artifacts.py <workflow_dir> [target_spec_dir]")
        print("\nExamples:")
        print("  extract-artifacts.py workflow-outputs/20251025_215307")
        print("  extract-artifacts.py workflow-outputs/20251025_215307 docs/specs/my-feature")
        sys.exit(1)
    
    workflow_dir = sys.argv[1]
    target_spec_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = extract_workflow_artifacts(workflow_dir, target_spec_dir)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

