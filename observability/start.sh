#!/bin/bash
#
# Quick start script for Claude Code Observability Stack
#

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Claude Code Observability Stack${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

echo -e "\n${YELLOW}Waiting for services to be healthy...${NC}"
sleep 5

echo -e "\n${GREEN}Checking service status:${NC}"
docker-compose ps

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Observability stack is running!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Access URLs:${NC}"
echo -e "  Langfuse:   ${GREEN}http://localhost:3000${NC}  (LLM observability)"
echo -e "  Grafana:    ${GREEN}http://localhost:3001${NC}  (Metrics dashboards)"
echo -e "  Prometheus: ${GREEN}http://localhost:9090${NC}  (Raw metrics)"
echo ""

echo -e "${YELLOW}First-time setup:${NC}"
echo -e "  1. Open Langfuse at http://localhost:3000"
echo -e "  2. Create your admin account"
echo -e "  3. Create a project (e.g., 'Claude Code Workflows')"
echo -e "  4. Get API keys from Settings → API Keys"
echo -e "  5. Configure OTEL collector with keys (see README.md)"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  Run workflow: ${GREEN}./scripts/next-feature-full-flow-observable.sh \"feature\"${NC}"
echo -e "  View logs:    ${GREEN}docker-compose logs -f${NC}"
echo -e "  Stop stack:   ${GREEN}docker-compose down${NC}"
echo ""
