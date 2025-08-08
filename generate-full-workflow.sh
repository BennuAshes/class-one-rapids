#!/bin/bash
# Auto-generated script: Execute Complete PRD-to-Implementation Workflow
# Generated: $(date)

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

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

# Default values
DESCRIPTION=""
PRD_FILE=""
TECH_REQ_FILE=""
RUNBOOK_FILE=""
VALIDATION_FILE=""
PROJECT_DIR="projects/generated"
AUTO_MODE=false
SKIP_VALIDATION=false

# Usage function
usage() {
    echo "Usage: $SCRIPT_NAME [OPTIONS]"
    echo ""
    echo "Execute the complete PRD-to-Implementation workflow using Claude CLI"
    echo ""
    echo "Options:"
    echo "  -d, --description TEXT    Description of app/feature to build"
    echo "  -p, --project-dir DIR     Project directory (default: projects/generated)"
    echo "  -a, --auto                Auto-mode: use defaults and continue on success"
    echo "  -s, --skip-validation     Skip architecture validation step"
    echo "  -h, --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $SCRIPT_NAME -d \"Build a task management app with offline sync\""
    echo "  $SCRIPT_NAME -d \"Create a real-time chat application\" -p projects/chat-app"
    echo "  $SCRIPT_NAME -d \"Develop an AI-powered code review tool\" --auto"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -p|--project-dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        -a|--auto)
            AUTO_MODE=true
            shift
            ;;
        -s|--skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DESCRIPTION" ]]; then
    log_error "Description is required. Use -d or --description"
    usage
fi

# Create project directory if it doesn't exist
mkdir -p "$PROJECT_DIR"

# Function to prompt for continuation
prompt_continue() {
    if [[ "$AUTO_MODE" == true ]]; then
        return 0
    fi
    
    local prompt_msg="$1"
    echo ""
    read -p "$prompt_msg (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Workflow cancelled by user"
        exit 1
    fi
}

# Function to find the most recently created markdown file matching a pattern
find_generated_file() {
    local pattern="$1"
    local dir="$2"
    
    # Find the most recent markdown file matching the pattern
    local file=$(find "$dir" -name "$pattern" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -n "$file" ]]; then
        echo "$file"
    else
        return 1
    fi
}

# Step tracking
CURRENT_STEP=0
TOTAL_STEPS=5
if [[ "$SKIP_VALIDATION" == true ]]; then
    TOTAL_STEPS=4
fi

execute_step() {
    local step_name="$1"
    local step_function="$2"
    
    ((CURRENT_STEP++))
    echo ""
    log_info "Step $CURRENT_STEP/$TOTAL_STEPS: $step_name"
    log_info "=========================================="
    
    if $step_function; then
        log_success "$step_name completed"
    else
        log_error "$step_name failed"
        exit 1
    fi
}

# Step 1: Generate Advanced PRD
generate_prd() {
    log_info "Generating PRD for: $DESCRIPTION"
    
    # Execute the command using Claude CLI
    if claude -p .claude/commands/prp/generate-advanced-prd.md "$DESCRIPTION"; then
        # Try to find the generated PRD file
        PRD_FILE=$(find_generated_file "*prd*.md" "$PROJECT_DIR") || PRD_FILE=$(find_generated_file "*prd*.md" ".")
        
        if [[ -n "$PRD_FILE" ]]; then
            log_success "PRD generated: $PRD_FILE"
            prompt_continue "Continue to technical requirements analysis?"
            return 0
        else
            log_warning "PRD generation completed but file not found automatically"
            read -p "Enter the path to the generated PRD file: " PRD_FILE
            if [[ -f "$PRD_FILE" ]]; then
                return 0
            else
                log_error "PRD file not found: $PRD_FILE"
                return 1
            fi
        fi
    else
        log_error "Failed to generate PRD"
        return 1
    fi
}

# Step 2: Analyze PRD Technical Requirements
analyze_technical_requirements() {
    if [[ -z "$PRD_FILE" ]]; then
        log_error "PRD file not set"
        return 1
    fi
    
    log_info "Analyzing technical requirements for: $PRD_FILE"
    
    if claude -p .claude/commands/prp/analyze-prd-technical-requirements.md "$PRD_FILE"; then
        # Try to find the generated technical requirements file
        TECH_REQ_FILE=$(find_generated_file "*technical-requirements*.md" "$(dirname "$PRD_FILE")") || \
        TECH_REQ_FILE=$(find_generated_file "*technical*.md" "$PROJECT_DIR") || \
        TECH_REQ_FILE="${PRD_FILE%.md}-technical-requirements.md"
        
        if [[ -f "$TECH_REQ_FILE" ]]; then
            log_success "Technical requirements analyzed: $TECH_REQ_FILE"
            prompt_continue "Continue to runbook creation?"
            return 0
        else
            log_warning "Technical requirements file not found automatically"
            read -p "Enter the path to the technical requirements file: " TECH_REQ_FILE
            if [[ -f "$TECH_REQ_FILE" ]]; then
                return 0
            else
                log_error "Technical requirements file not found: $TECH_REQ_FILE"
                return 1
            fi
        fi
    else
        log_error "Failed to analyze technical requirements"
        return 1
    fi
}

# Step 3: Create Development Runbook
create_runbook() {
    if [[ -z "$TECH_REQ_FILE" ]]; then
        log_error "Technical requirements file not set"
        return 1
    fi
    
    log_info "Creating development runbook from: $TECH_REQ_FILE"
    
    if claude -p .claude/commands/prp/create-development-runbook.md "$TECH_REQ_FILE"; then
        # Try to find the generated runbook file
        RUNBOOK_FILE=$(find_generated_file "*runbook*.md" "$(dirname "$TECH_REQ_FILE")") || \
        RUNBOOK_FILE=$(find_generated_file "*runbook*.md" "$PROJECT_DIR") || \
        RUNBOOK_FILE="${TECH_REQ_FILE%.md}-runbook.md"
        
        if [[ -f "$RUNBOOK_FILE" ]]; then
            log_success "Runbook created: $RUNBOOK_FILE"
            if [[ "$SKIP_VALIDATION" == false ]]; then
                prompt_continue "Continue to architecture validation?"
            else
                prompt_continue "Continue to implementation?"
            fi
            return 0
        else
            log_warning "Runbook file not found automatically"
            read -p "Enter the path to the runbook file: " RUNBOOK_FILE
            if [[ -f "$RUNBOOK_FILE" ]]; then
                return 0
            else
                log_error "Runbook file not found: $RUNBOOK_FILE"
                return 1
            fi
        fi
    else
        log_error "Failed to create runbook"
        return 1
    fi
}

# Step 4: Validate Architecture Alignment
validate_architecture() {
    if [[ "$SKIP_VALIDATION" == true ]]; then
        log_info "Skipping architecture validation"
        return 0
    fi
    
    if [[ -z "$RUNBOOK_FILE" ]]; then
        log_error "Runbook file not set"
        return 1
    fi
    
    log_info "Validating architecture alignment for: $RUNBOOK_FILE"
    
    if claude -p .claude/commands/prp/validate-architecture-alignment.md "$RUNBOOK_FILE"; then
        # Try to find the validation report
        VALIDATION_FILE=$(find_generated_file "*validation*.md" "$(dirname "$RUNBOOK_FILE")") || \
        VALIDATION_FILE=$(find_generated_file "*validation*.md" "$PROJECT_DIR")
        
        if [[ -n "$VALIDATION_FILE" ]] && [[ -f "$VALIDATION_FILE" ]]; then
            log_success "Architecture validated: $VALIDATION_FILE"
        else
            log_success "Architecture validation completed"
        fi
        
        prompt_continue "Continue to implementation?"
        return 0
    else
        log_error "Architecture validation failed"
        log_warning "Please fix the issues and re-run the validation"
        return 1
    fi
}

# Step 5: Follow Runbook with Senior Engineer
implement_runbook() {
    if [[ -z "$RUNBOOK_FILE" ]]; then
        log_error "Runbook file not set"
        return 1
    fi
    
    log_info "Starting implementation with senior engineer approach"
    log_info "Runbook: $RUNBOOK_FILE"
    
    if [[ "$AUTO_MODE" == true ]]; then
        log_warning "Auto-mode: Implementation will proceed automatically"
        log_warning "This may take a while depending on the project complexity"
    else
        log_warning "Implementation will be interactive"
        log_warning "You will be prompted at various checkpoints"
    fi
    
    prompt_continue "Start implementation?"
    
    if claude -p .claude/commands/prp/follow-runbook-with-senior-engineer.md "$RUNBOOK_FILE"; then
        log_success "Implementation completed successfully!"
        return 0
    else
        log_error "Implementation encountered issues"
        log_warning "Please review the output and fix any issues"
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting PRD-to-Implementation Workflow"
    log_info "Project Description: $DESCRIPTION"
    log_info "Project Directory: $PROJECT_DIR"
    log_info "Mode: $([ "$AUTO_MODE" == true ] && echo "Automatic" || echo "Interactive")"
    
    execute_step "Generate Advanced PRD" generate_prd
    execute_step "Analyze Technical Requirements" analyze_technical_requirements
    execute_step "Create Development Runbook" create_runbook
    
    if [[ "$SKIP_VALIDATION" == false ]]; then
        execute_step "Validate Architecture Alignment" validate_architecture
    fi
    
    execute_step "Implement with Senior Engineer" implement_runbook
    
    echo ""
    log_success "🎉 Workflow completed successfully!"
    log_info "Generated files:"
    [[ -n "$PRD_FILE" ]] && log_info "  - PRD: $PRD_FILE"
    [[ -n "$TECH_REQ_FILE" ]] && log_info "  - Technical Requirements: $TECH_REQ_FILE"
    [[ -n "$RUNBOOK_FILE" ]] && log_info "  - Runbook: $RUNBOOK_FILE"
    [[ -n "$VALIDATION_FILE" ]] && [[ -f "$VALIDATION_FILE" ]] && log_info "  - Validation Report: $VALIDATION_FILE"
    
    echo ""
    log_info "Next steps:"
    log_info "  1. Review the generated code and documentation"
    log_info "  2. Run tests to ensure everything works correctly"
    log_info "  3. Deploy or continue development as needed"
}

# Execute main function
main