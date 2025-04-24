#!/bin/bash

# Script to run quality code tools
# Can be used as a pre-commit hook

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}Executing black...${NC}"
poetry run black . 

echo -e "${YELLOW}Executing flake8...${NC}"
poetry run flake8 .

echo -e "${YELLOW}Executing mypy...${NC}"
poetry run mypy .

echo -e "${YELLOW}Executing pytest...${NC}"
poetry run pytest -v

# If we get here without errors, everything is fine
echo -e "${GREEN}✓ All quality checks passed successfully${NC}" 