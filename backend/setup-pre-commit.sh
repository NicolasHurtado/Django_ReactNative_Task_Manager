#!/bin/bash

# Script para configurar el pre-commit hook

set -e  # Exit on error

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"
LINT_SCRIPT="$REPO_ROOT/backend/lint.sh"
CONFIG_FILE="$REPO_ROOT/backend/pre-commit-config.toml"

# Dar permisos de ejecución al script de lint
chmod +x "$LINT_SCRIPT"

# Crear el pre-commit hook
cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash

# Pre-commit hook que ejecuta lint.sh

REPO_ROOT=$(git rev-parse --show-toplevel)
LINT_SCRIPT="$REPO_ROOT/backend/lint.sh"
CONFIG_FILE="$REPO_ROOT/backend/pre-commit-config.toml"

# Obtener archivos a verificar (solo archivos Python)
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.py$')

# Si no hay archivos Python para verificar, salir con éxito
if [ -z "$FILES" ]; then
  echo "No hay archivos Python para verificar."
  exit 0
fi

# Verificar si algún archivo está en directorios excluidos
if [ -f "$CONFIG_FILE" ]; then
  # Leer directorios excluidos del archivo de configuración
  EXCLUDE_DIRS=$(grep -A 10 "exclude_dirs" "$CONFIG_FILE" | grep -E '".*"' | sed 's/[",]//g' | tr -d ' ')
  
  # Filtrar archivos que no estén en directorios excluidos
  for EXCLUDE_DIR in $EXCLUDE_DIRS; do
    FILES=$(echo "$FILES" | grep -v "$EXCLUDE_DIR")
  done
fi

# Si después del filtrado no quedan archivos, salir con éxito
if [ -z "$FILES" ]; then
  echo "Todos los archivos Python están en directorios excluidos."
  exit 0
fi

# Ejecutar el script de lint
"$LINT_SCRIPT"

# Si el script de lint falló, abortar el commit
if [ $? -ne 0 ]; then
  echo "Las verificaciones de calidad de código fallaron. Commit abortado."
  exit 1
fi

exit 0
EOF

# Dar permisos de ejecución al pre-commit hook
chmod +x "$HOOK_PATH"

echo "✅ Pre-commit hook configurado exitosamente en $HOOK_PATH"
echo "🚀 Ahora se ejecutará automáticamente al hacer commit" 