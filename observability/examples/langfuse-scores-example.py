#!/usr/bin/env python3
"""
Example: Using Langfuse Scores for Artifact Evaluation

Demonstrates how to:
1. Evaluate PRD, Design, and Task artifacts
2. Add scores to traces
3. View scores in Langfuse UI

Prerequisites:
- Langfuse server running (docker-compose up in observability/)
- Set LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST env vars
- Set ANTHROPIC_API_KEY for LLM-as-judge evaluations
"""

import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from langfuse import Langfuse
from langfuse_evaluators import evaluate_prd, evaluate_design, evaluate_tasks
from workflow_telemetry import score_artifact

# Sample artifacts
SAMPLE_PRD = """
# Product Requirements Document: User Authentication

## Goals
- Implement secure user authentication
- Support OAuth2 providers (Google, GitHub)
- Enable password reset functionality

## Requirements
### Functional
- User registration with email/password
- Social login via OAuth2
- Password reset via email
- Session management

### Non-Functional
- Security: bcrypt password hashing, JWT tokens
- Performance: <200ms API response time
- Scalability: Support 10,000 concurrent users

## Success Metrics
- 95% login success rate
- <2 second average login time
"""

SAMPLE_DESIGN = """
# Technical Design Document: User Authentication

## Architecture
- API Gateway: Route requests, rate limiting
- Auth Service: Core authentication logic
- Database: PostgreSQL with user/session tables

## API Endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/reset-password

## Security
- bcrypt for password hashing (cost 12)
- JWT tokens (RS256, 30-day expiry)
- Rate limiting: 5 login attempts per 15 min

## Data Models
- User: id, email, password_hash, verified, created_at
- Session: id, user_id, token, expires_at

## Implementation Timeline
- Week 1: Database and core auth
- Week 2: OAuth integration
- Week 3: Testing and deployment
"""

SAMPLE_TASKS = """
# Task List: User Authentication

## Task 1: Database Setup
**Priority**: High
**Time**: 2 hours

Create database migrations for user and session tables.

**Acceptance Criteria**:
- [ ] Users table with proper constraints
- [ ] Sessions table with foreign keys
- [ ] Indexes on email and token columns

## Task 2: User Registration
**Priority**: High
**Time**: 4 hours

Implement POST /auth/register endpoint.

**Acceptance Criteria**:
- [ ] Email validation
- [ ] Password strength check
- [ ] Password hashing with bcrypt
- [ ] Duplicate email detection
- [ ] Unit and integration tests

## Task 3: User Login
**Priority**: High
**Time**: 4 hours

Implement POST /auth/login endpoint.

**Acceptance Criteria**:
- [ ] Credential validation
- [ ] JWT token generation
- [ ] Rate limiting implementation
- [ ] Integration tests
"""


def main():
    """Demonstrate scoring workflow artifacts"""
    print("=" * 60)
    print("Langfuse Scores Example")
    print("=" * 60)
    print()
    
    # Initialize Langfuse client
    langfuse = Langfuse()
    execution_id = "example_scores_demo"
    
    # Create a trace for this demo
    trace = langfuse.trace(
        name="artifact-evaluation-demo",
        session_id=execution_id,
        metadata={"demo": "scores-example"}
    )
    
    print("Step 1: Evaluating PRD...")
    print("-" * 60)
    try:
        prd_scores = evaluate_prd(SAMPLE_PRD)
        print(f"✓ PRD Evaluated")
        print(f"  Completeness: {prd_scores.completeness}/10")
        print(f"  Clarity: {prd_scores.clarity}/10")
        print(f"  Technical Depth: {prd_scores.technical_depth}/10")
        print(f"  Overall: {prd_scores.overall}")
        print(f"  Reasoning: {prd_scores.reasoning}")
        print()
        
        # Add scores to trace
        for name, value in prd_scores.to_dict().items():
            if name != "reasoning":
                score_artifact(
                    execution_id=execution_id,
                    name=f"prd_{name}",
                    value=value,
                    comment=prd_scores.reasoning if name == "overall" else None
                )
    except Exception as e:
        print(f"✗ PRD Evaluation failed: {e}")
        print()
    
    print("Step 2: Evaluating Design...")
    print("-" * 60)
    try:
        design_scores = evaluate_design(SAMPLE_DESIGN)
        print(f"✓ Design Evaluated")
        print(f"  Architecture: {design_scores.architecture}/10")
        print(f"  Feasibility: {design_scores.feasibility}/10")
        print(f"  Completeness: {design_scores.completeness}/10")
        print(f"  Has Security: {design_scores.has_security}")
        print(f"  Overall: {design_scores.overall}")
        print(f"  Reasoning: {design_scores.reasoning}")
        print()
        
        # Add scores to trace
        for name, value in design_scores.to_dict().items():
            if name != "reasoning":
                score_artifact(
                    execution_id=execution_id,
                    name=f"design_{name}",
                    value=value,
                    comment=design_scores.reasoning if name == "overall" else None
                )
    except Exception as e:
        print(f"✗ Design Evaluation failed: {e}")
        print()
    
    print("Step 3: Evaluating Tasks...")
    print("-" * 60)
    try:
        tasks_scores = evaluate_tasks(SAMPLE_TASKS)
        print(f"✓ Tasks Evaluated")
        print(f"  Actionability: {tasks_scores.actionability}/10")
        print(f"  Completeness: {tasks_scores.completeness}/10")
        print(f"  Clarity: {tasks_scores.clarity}/10")
        print(f"  Has Criteria: {tasks_scores.has_criteria}")
        print(f"  Overall: {tasks_scores.overall}")
        print(f"  Reasoning: {tasks_scores.reasoning}")
        print()
        
        # Add scores to trace
        for name, value in tasks_scores.to_dict().items():
            if name != "reasoning":
                score_artifact(
                    execution_id=execution_id,
                    name=f"tasks_{name}",
                    value=value,
                    comment=tasks_scores.reasoning if name == "overall" else None
                )
    except Exception as e:
        print(f"✗ Tasks Evaluation failed: {e}")
        print()
    
    # Flush to ensure all scores are sent
    langfuse.flush()
    
    print("=" * 60)
    print("✓ Demo Complete!")
    print()
    print("View scores in Langfuse:")
    print(f"  URL: http://localhost:3000")
    print(f"  Session ID: {execution_id}")
    print()
    print("You can now:")
    print("  1. View all scores in the Scores tab")
    print("  2. Compare scores across artifacts")
    print("  3. Filter traces by score thresholds")
    print("  4. Create custom dashboards with score metrics")
    print("=" * 60)


if __name__ == "__main__":
    main()

