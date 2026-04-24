#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# .github/skills/scripts/setup-swagger.sh
#
# Purpose : Install Swagger dependencies for a NestJS project
#           and optionally verify the Swagger UI is reachable.
#
# Usage   : bash .github/skills/scripts/setup-swagger.sh [--verify]
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}[INFO]${RESET}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }

# ── Config ───────────────────────────────────────────────────
SWAGGER_PKG="@nestjs/swagger"
SWAGGER_UI_PKG="swagger-ui-express"
APP_PORT="${PORT:-3000}"
SWAGGER_PATH="api/docs"
VERIFY=false

# ── Parse args ───────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --verify) VERIFY=true ;;
    *) warn "Unknown argument: $arg" ;;
  esac
done

# ── Resolve project root ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# ── Check package.json exists ────────────────────────────────
[[ -f "package.json" ]] || error "No package.json found in $PROJECT_ROOT"

# ── Detect package manager ───────────────────────────────────
if [[ -f "pnpm-lock.yaml" ]]; then
  PKG_MGR="pnpm"
elif [[ -f "yarn.lock" ]]; then
  PKG_MGR="yarn"
else
  PKG_MGR="npm"
fi
info "Package manager detected: $PKG_MGR"

# ── Check if Swagger is already installed ────────────────────
check_installed() {
  node -e "require('$1')" 2>/dev/null && return 0 || return 1
}

install_pkg() {
  local pkg="$1"
  if check_installed "$pkg"; then
    info "$pkg is already installed — skipping."
  else
    info "Installing $pkg ..."
    case $PKG_MGR in
      pnpm) pnpm add "$pkg" ;;
      yarn) yarn add "$pkg" ;;
      npm)  npm install "$pkg" --save ;;
    esac
    info "$pkg installed successfully."
  fi
}

install_pkg "$SWAGGER_PKG"
install_pkg "$SWAGGER_UI_PKG"

# ── Verify Swagger UI is reachable (optional) ────────────────
if [[ "$VERIFY" == true ]]; then
  SWAGGER_URL="http://localhost:${APP_PORT}/${SWAGGER_PATH}"
  info "Verifying Swagger UI at $SWAGGER_URL ..."

  # Give the server a moment if it was just started
  sleep 2

  HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$SWAGGER_URL" || echo "000")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    info "✅ Swagger UI is reachable at $SWAGGER_URL"
  elif [[ "$HTTP_STATUS" == "000" ]]; then
    warn "Could not reach $SWAGGER_URL — is the dev server running?"
    warn "Start it with:  npm run start:dev"
  else
    warn "Swagger UI responded with HTTP $HTTP_STATUS at $SWAGGER_URL"
    warn "Check that SwaggerModule.setup('${SWAGGER_PATH}', ...) is configured in main.ts"
  fi
fi

info "Done. ✅"
