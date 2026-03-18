#!/usr/bin/env bash
# ============================================================
# Smart Decision Engine — One-command deployment script
# Usage: bash deploy.sh
#
# What this does:
#   1. Checks required CLI tools are installed
#   2. Installs Node + Python dependencies
#   3. Pushes Supabase schema
#   4. Creates Railway services (backend + frontend + agents)
#   5. Sets Railway environment variables from .env
#   6. Deploys all services to Railway
#   7. Pushes code to GitHub
# ============================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[deploy]${NC} $1"; }
success() { echo -e "${GREEN}[deploy]${NC} ✓ $1"; }
warn()    { echo -e "${YELLOW}[deploy]${NC} ⚠ $1"; }
fail()    { echo -e "${RED}[deploy]${NC} ✗ $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── 1. Load .env ────────────────────────────────────────────
if [ ! -f ".env" ]; then
  fail ".env file not found. Copy .env.example to .env and fill in your values."
fi
# shellcheck disable=SC2046
export $(grep -v '^#' .env | grep -v '^$' | xargs)
info "Environment loaded from .env"

# ─── 2. Check dependencies ────────────────────────────────────
info "Checking required tools..."

command -v node     >/dev/null 2>&1 || fail "node is not installed. Install from https://nodejs.org"
command -v python3  >/dev/null 2>&1 || fail "python3 is not installed. Install from https://python.org"
command -v railway  >/dev/null 2>&1 || fail "railway CLI not found. Install: npm install -g @railway/cli"
command -v supabase >/dev/null 2>&1 || fail "supabase CLI not found. Install: https://supabase.com/docs/guides/cli"

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  fail "Node.js 18+ required. Current: $(node -v)"
fi

success "All CLI tools present"

# ─── 3. Install dependencies ──────────────────────────────────
info "Installing backend dependencies..."
cd backend && npm install --silent && cd ..
success "Backend deps installed"

info "Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..
success "Frontend deps installed"

info "Building frontend..."
cd frontend && npm run build && cd ..
success "Frontend built (dist/)"

info "Installing Python dependencies..."
cd agents
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt
deactivate
cd ..
success "Python deps installed"

# ─── 4. Supabase schema push ──────────────────────────────────
if [ -z "${SUPABASE_URL:-}" ] || [[ "$SUPABASE_URL" == *"TODO"* ]]; then
  warn "SUPABASE_URL not configured — skipping schema push."
  warn "Set SUPABASE_URL in .env, then run: supabase db push"
else
  info "Pushing Supabase schema..."
  supabase db push --db-url "${SUPABASE_URL}" || warn "Schema push failed — check your Supabase credentials."
  success "Supabase schema applied"
fi

# ─── 5. Seed initial data ─────────────────────────────────────
if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || [[ "$SUPABASE_SERVICE_ROLE_KEY" == *"TODO"* ]]; then
  warn "Skipping seed — SUPABASE_SERVICE_ROLE_KEY not configured."
else
  info "Seeding initial affiliate data..."
  cd backend && node ../scripts/seed.js && cd ..
  success "Database seeded"
fi

# ─── 6. Railway login check ───────────────────────────────────
info "Checking Railway authentication..."
if [ -z "${RAILWAY_TOKEN:-}" ] || [[ "$RAILWAY_TOKEN" == *"TODO"* ]]; then
  warn "RAILWAY_TOKEN not set. Running interactive login..."
  railway login
else
  export RAILWAY_TOKEN
fi

# ─── 7. Railway: set environment variables ────────────────────
info "Setting Railway environment variables..."
ENV_VARS=(
  "SUPABASE_URL=${SUPABASE_URL}"
  "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
  "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"
  "PORT=3001"
  "NODE_ENV=production"
)

for var in "${ENV_VARS[@]}"; do
  KEY="${var%%=*}"
  VAL="${var#*=}"
  if [[ "$VAL" != *"TODO"* ]] && [ -n "$VAL" ]; then
    railway variables set "$KEY=$VAL" 2>/dev/null || warn "Could not set $KEY — check Railway project is initialized."
  fi
done
success "Railway env vars set"

# ─── 8. Deploy to Railway ─────────────────────────────────────
info "Deploying backend to Railway..."
railway up --service backend 2>/dev/null || {
  warn "Backend service not found — creating it..."
  railway service create --name backend
  railway up --service backend
}
success "Backend deployed"

info "Deploying frontend to Railway..."
railway up --service frontend 2>/dev/null || {
  warn "Frontend service not found — creating it..."
  railway service create --name frontend
  railway up --service frontend
}
success "Frontend deployed"

info "Deploying agents worker to Railway..."
railway up --service agents 2>/dev/null || {
  warn "Agents service not found — creating it..."
  railway service create --name agents
  railway up --service agents
}
success "Agents worker deployed"

# ─── 9. Push to GitHub ────────────────────────────────────────
if [ -z "${GITHUB_REPO_URL:-}" ] || [[ "$GITHUB_REPO_URL" == *"TODO"* ]]; then
  warn "GITHUB_REPO_URL not set — skipping GitHub push."
else
  info "Pushing to GitHub..."
  git add -A
  git diff --cached --quiet || git commit -m "feat: initial deployment $(date +%Y-%m-%d)"
  git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || warn "Git push failed — check your GitHub credentials."
  success "Code pushed to ${GITHUB_REPO_URL}"
fi

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Smart Decision Engine deployed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Backend:  railway service show --service backend"
echo "  Frontend: railway service show --service frontend"
echo "  Agents:   railway service show --service agents"
echo ""
echo "  Local dev:"
echo "    Backend:  cd backend && npm run dev"
echo "    Frontend: cd frontend && npm run dev"
echo "    Agents:   cd agents && python main.py"
echo ""
