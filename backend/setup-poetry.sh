#!/bin/bash

# Script para inicializar Poetry y generar el archivo lock

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Verificar si Poetry está instalado
if ! command -v poetry &> /dev/null; then
    echo -e "${RED}Poetry no está instalado. Instalando...${NC}"
    curl -sSL https://install.python-poetry.org | python3 -
    echo -e "${GREEN}Poetry instalado correctamente.${NC}"
else
    echo -e "${GREEN}Poetry ya está instalado.${NC}"
fi

# Eliminar el archivo lock si existe y está vacío
if [ -f "poetry.lock" ] && [ ! -s "poetry.lock" ]; then
    echo -e "${YELLOW}Eliminando archivo lock vacío...${NC}"
    rm poetry.lock
fi

# Inicializar Poetry y generar el archivo lock
echo -e "${YELLOW}Generando archivo lock e instalando dependencias...${NC}"
poetry lock --no-update
poetry install

echo -e "${GREEN}✓ Entorno de Poetry configurado correctamente${NC}"
echo -e "${YELLOW}Para activar el entorno virtual, ejecuta: ${NC}poetry shell"

# Verificar instalación
echo -e "${YELLOW}Verificando instalación...${NC}"
poetry show 