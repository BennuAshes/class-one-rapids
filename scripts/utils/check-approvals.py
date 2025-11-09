#!/usr/bin/env python3
"""
Check and fix approval files in workflow outputs

Usage:
    python3 check-approvals.py                  # Check all approval files
    python3 check-approvals.py --fix            # Fix malformed approval files
    python3 check-approvals.py --list-pending   # List pending approvals
"""

import json
import sys
from pathlib import Path

WORKFLOW_DIR = Path("./workflow-outputs")

def check_approval_file(approval_file: Path, fix: bool = False):
    """Check if approval file is valid JSON"""
    try:
        with open(approval_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check for response file
        response_file = Path(str(approval_file) + ".response")
        has_response = response_file.exists()
        
        status = data.get('status', 'unknown')
        checkpoint = data.get('checkpoint', 'unknown')
        
        if has_response:
            print(f"✓ {approval_file.name}: {checkpoint} - {status} (has response)")
        else:
            print(f"⏳ {approval_file.name}: {checkpoint} - {status} (pending)")
            
        return True, data
        
    except json.JSONDecodeError as e:
        print(f"✗ {approval_file.name}: MALFORMED JSON - {e}")
        
        if fix:
            print(f"  Attempting to fix...")
            try:
                # Try to read the raw content
                with open(approval_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create a minimal valid approval file
                exec_dir = approval_file.parent.name
                checkpoint = approval_file.stem.replace('.approval_', '')
                
                fixed_data = {
                    "execution_id": exec_dir,
                    "checkpoint": checkpoint,
                    "file": str(approval_file.parent / f"{checkpoint.lower()}.md"),
                    "timestamp": "",
                    "status": "pending",
                    "timeout_seconds": 0,
                    "preview": "Preview unavailable - file was malformed and reconstructed"
                }
                
                # Backup the original
                backup_file = approval_file.with_suffix('.json.backup')
                with open(backup_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Write the fixed version
                with open(approval_file, 'w', encoding='utf-8') as f:
                    json.dump(fixed_data, f, indent=2)
                
                print(f"  ✓ Fixed! Backup saved to: {backup_file.name}")
                return True, fixed_data
                
            except Exception as fix_error:
                print(f"  ✗ Failed to fix: {fix_error}")
                return False, None
        
        return False, None
        
    except Exception as e:
        print(f"✗ {approval_file.name}: ERROR - {e}")
        return False, None

def main():
    fix_mode = '--fix' in sys.argv
    list_pending = '--list-pending' in sys.argv
    
    if not WORKFLOW_DIR.exists():
        print(f"Workflow directory not found: {WORKFLOW_DIR}")
        return
    
    print("Checking approval files...\n")
    
    total = 0
    valid = 0
    malformed = 0
    pending = []
    
    for exec_dir in WORKFLOW_DIR.iterdir():
        if not exec_dir.is_dir():
            continue
            
        for approval_file in exec_dir.glob(".approval_*.json"):
            total += 1
            is_valid, data = check_approval_file(approval_file, fix=fix_mode)
            
            if is_valid:
                valid += 1
                # Check if truly pending
                response_file = Path(str(approval_file) + ".response")
                if not response_file.exists() and data and data.get('status') == 'pending':
                    pending.append({
                        'file': str(approval_file),
                        'checkpoint': data.get('checkpoint'),
                        'execution_id': data.get('execution_id')
                    })
            else:
                malformed += 1
    
    print(f"\n{'='*50}")
    print(f"Total approval files: {total}")
    print(f"Valid: {valid}")
    print(f"Malformed: {malformed}")
    print(f"Truly pending (no response file): {len(pending)}")
    
    if list_pending and pending:
        print(f"\n{'='*50}")
        print("Pending Approvals:")
        for p in pending:
            print(f"  - {p['checkpoint']} ({p['execution_id']})")
            print(f"    {p['file']}")
            print(f"    To approve: echo '{{\"status\":\"approved\"}}' > {p['file']}.response")
            print()

if __name__ == "__main__":
    main()

