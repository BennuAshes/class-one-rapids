# Deprecated Scripts

This directory contains scripts that have been deprecated and replaced by newer implementations.

## Archived on: 2025-01-07

## Files

### feature-to-code.sh
- **Status**: Deprecated
- **Reason**: Redirected to feature-to-code-unified.sh
- **Replaced by**: `feature-to-code-unified.sh` (main entry point)
- **Last modified**: October 27, 2024

### feature-to-code-traced.sh
- **Status**: Superseded
- **Reason**: Python telemetry wrapper version
- **Replaced by**: `feature-to-code-unified.sh` with telemetry integration
- **Last modified**: October 26, 2024

### send-workflow-telemetry.sh
- **Status**: Obsolete
- **Reason**: Bash telemetry functions replaced by Python implementation
- **Replaced by**: `scripts/workflow/services/telemetry.py`
- **Last modified**: October 26, 2024

### workflow-approval-ui.html
- **Status**: Legacy UI
- **Reason**: Static HTML approval interface replaced by dynamic web server
- **Replaced by**: `workflow-approval-server.py` (root level)
- **Last modified**: November 5, 2024

## Migration Notes

All functionality from these scripts has been incorporated into:
1. **feature-to-code-unified.sh** - Main workflow entry point
2. **scripts/workflow/** - Python workflow implementation
3. **workflow-approval-server.py** - Dynamic approval UI with REST API

These files are preserved for historical reference and can be safely deleted after confirming the new implementations work correctly.
