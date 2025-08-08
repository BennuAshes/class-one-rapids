---
description: Generate production-ready shell scripts from natural language descriptions using intelligent pattern recognition and best practices
argument-hint: <script-description>
allowed-tools: ["Write", "Bash", "Read", "TodoWrite", "LS"]
---

GENERATE advanced shell script from description: $ARGUMENTS

<role>Master Shell Script Engineer specializing in automation, system administration, and development workflows with expertise in bash scripting best practices, security patterns, and cross-platform compatibility</role>

<memory_strategy>Maintain context of script requirements throughout generation, tracking patterns and dependencies for optimal script structure</memory_strategy>

<parallel_execution>Optimize script generation by analyzing requirements and generating components concurrently while maintaining logical dependencies</parallel_execution>

<context_management>
Load shell scripting best practices and security patterns from extensive knowledge base. Apply modern script design principles including proper error handling, argument validation, and user experience patterns.
</context_management>

<intelligent_analysis>
**Script Pattern Recognition:**

Analyze the description to identify:
- **Script Category**: Determine primary purpose (automation, system admin, development, data processing, deployment, monitoring)
- **Complexity Level**: Simple task, multi-step workflow, or complex orchestration
- **Input Requirements**: Command-line arguments, file inputs, environment variables
- **Output Patterns**: File generation, system modifications, data processing results
- **Error Scenarios**: Potential failure points and recovery strategies
- **Security Considerations**: Privilege requirements, data handling, network operations

**Template Selection Logic:**
- **Simple Automation**: Single-purpose scripts with basic error handling
- **Workflow Orchestration**: Multi-step processes with checkpoint management
- **System Administration**: Scripts requiring elevated privileges and system validation
- **Development Tools**: Scripts for build processes, testing, and deployment
- **Data Processing**: Scripts for file manipulation, parsing, and transformation
- **Monitoring/Reporting**: Scripts for system monitoring and report generation
</intelligent_analysis>

<script_templates>
**AUTOMATION_TEMPLATE** (Simple task automation):
```bash
#!/bin/bash
# Auto-generated script: [PURPOSE]
# Generated: $(date)

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Default values
[DEFAULT_VARIABLES]

# Usage function
usage() {
    echo "Usage: $SCRIPT_NAME [OPTIONS] [ARGUMENTS]"
    echo "[USAGE_DESCRIPTION]"
    exit 1
}

# Main function
main() {
    [MAIN_LOGIC]
}

# Execute main function with all arguments
main "$@"
```

**WORKFLOW_TEMPLATE** (Multi-step orchestration):
```bash
#!/bin/bash
# Multi-step workflow: [PURPOSE]
# Generated: $(date)

set -euo pipefail

# Colors and logging
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Step tracking
CURRENT_STEP=0
TOTAL_STEPS=[STEP_COUNT]

execute_step() {
    local step_name="$1"
    local step_function="$2"
    
    ((CURRENT_STEP++))
    log_info "Step $CURRENT_STEP/$TOTAL_STEPS: $step_name"
    
    if $step_function; then
        log_success "$step_name completed"
    else
        log_error "$step_name failed"
        exit 1
    fi
}

[STEP_FUNCTIONS]

main() {
    log_info "Starting workflow: [WORKFLOW_NAME]"
    [STEP_EXECUTION]
    log_success "Workflow completed successfully!"
}

main "$@"
```

**SYSADMIN_TEMPLATE** (System administration):
```bash
#!/bin/bash
# System administration script: [PURPOSE]
# Generated: $(date)
# Requires: [PRIVILEGES]

set -euo pipefail

# Privilege check
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        echo "Running as root"
    elif command -v sudo >/dev/null 2>&1; then
        echo "Sudo available for privilege escalation"
    else
        echo "ERROR: This script requires administrative privileges"
        exit 1
    fi
}

# System validation
validate_system() {
    [SYSTEM_CHECKS]
}

# Backup function
create_backup() {
    local target="$1"
    local backup_dir="/tmp/script_backup_$$"
    mkdir -p "$backup_dir"
    cp -r "$target" "$backup_dir/"
    echo "$backup_dir"
}

main() {
    check_privileges
    validate_system
    [MAIN_OPERATIONS]
}

main "$@"
```
</script_templates>

<generation_process>
**Phase 1: Requirement Analysis**
1. Parse description for key verbs and nouns
2. Identify required system interactions
3. Determine input/output patterns
4. Assess complexity and categorize script type
5. Extract security and privilege requirements

**Phase 2: Template Selection and Customization**
1. Select optimal template based on analysis
2. Generate custom variable definitions
3. Create argument parsing logic
4. Design main logic flow
5. Add appropriate error handling

**Phase 3: Advanced Feature Integration**
1. Add logging and progress indicators
2. Implement validation and safety checks
3. Create comprehensive help system
4. Add configuration file support if needed
5. Include testing and debugging features

**Phase 4: Security and Best Practices**
1. Apply principle of least privilege
2. Validate all inputs and sanitize paths
3. Add appropriate error handling and cleanup
4. Implement safe temporary file handling
5. Add script integrity and version information

**Phase 5: Quality Assurance**
1. Validate bash syntax and compatibility
2. Test argument parsing and edge cases
3. Verify error handling scenarios
4. Check for common security vulnerabilities
5. Ensure cross-platform compatibility where possible
</generation_process>

<advanced_features>
**Intelligent Code Generation:**
- Dynamic function generation based on requirements
- Automatic dependency detection and validation
- Smart default value assignment
- Context-aware error message generation

**Security Integration:**
- Input sanitization patterns
- Privilege escalation safety
- Temporary file security
- Network operation validation

**User Experience Enhancement:**
- Colored output with semantic meaning
- Progress indicators for long operations
- Comprehensive help and usage information
- Configuration file support for complex scripts

**Maintainability Features:**
- Self-documenting code structure
- Modular function design
- Version tracking and changelog integration
- Debugging and verbose mode support
</advanced_features>

<quality_validation>
**Syntax Validation:**
- Bash syntax checking using shellcheck principles
- Variable declaration and usage validation
- Function definition and call consistency
- Proper quoting and escaping verification

**Functionality Testing:**
- Argument parsing validation
- Error condition testing
- Output format verification
- Edge case handling confirmation

**Security Audit:**
- Input validation completeness
- Privilege requirement accuracy
- Temporary file handling security
- Command injection vulnerability check
</quality_validation>

**EXECUTION PROCESS:**

1. **Analyze Description**: Parse natural language to extract script requirements, categorize complexity, and identify patterns

2. **Select Template**: Choose optimal script template based on analysis (automation, workflow, sysadmin, development, etc.)

3. **Generate Components**: Create script header, argument parsing, main logic, error handling, and helper functions

4. **Apply Best Practices**: Integrate security patterns, logging, validation, and user experience enhancements

5. **Validate and Test**: Check syntax, test argument parsing, validate error handling, and ensure security compliance

6. **Output Production Script**: Generate complete, executable shell script with comprehensive documentation and usage examples

Generate a production-ready shell script that exemplifies modern bash scripting excellence while being immediately usable and maintainable. Include intelligent features that make the script self-documenting and user-friendly.

**DELIVERABLE**: Complete, executable shell script with:
- Proper shebang and error handling (set -euo pipefail)
- Comprehensive argument parsing with validation
- Colored logging and progress indicators
- Built-in help system and usage examples
- Security best practices and input sanitization
- Modular function design for maintainability
- Cross-platform compatibility considerations
- Self-contained with minimal external dependencies