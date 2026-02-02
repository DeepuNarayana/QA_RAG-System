#!/bin/bash
# docker-build.sh - Build all Docker images
# Usage: ./docker-build.sh

set -e

echo "🐳 Building Docker images..."
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build images
echo -e "${BLUE}Building backend...${NC}"
docker-compose build backend

echo -e "${BLUE}Building frontend...${NC}"
docker-compose build frontend

echo -e "${BLUE}Building mock-llm...${NC}"
docker-compose build mock-llm

echo ""
echo -e "${GREEN}✅ All images built successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Create .env file: cp .env.example .env"
echo "  2. Start services: ./docker-run.sh"
echo "  3. Access application: http://localhost:3000"
