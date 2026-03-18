# Smart Decision Engine

A production-ready affiliate marketing platform that helps users discover, evaluate, and act on digital opportunities (AI tools, online courses, affiliate programs) — powered by CrewAI agents, scored recommendations, and a live news digest.

## Stack

| Layer | Technology |
|---|---|
| Agents | CrewAI (Python 3.11+) |
| Backend | Node.js + Express |
| Frontend | React + Vite + Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Deployment | Railway |

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Eliranshopen/smart-decision-engine.git
cd smart-decision-engine
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and fill in your credentials:
#   - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   - RAILWAY_TOKEN
#   - OPENAI_API_KEY (for CrewAI agents)
#   - AFFILIATE_ID_* (your affiliate tracking IDs — see .env.example for signup links)
```

### 3. Deploy everything

```bash
bash deploy.sh
```

This single script:
- Installs all dependencies (Node + Python)
- Pushes the database schema to Supabase
- Creates staging + production environments on Railway
- Deploys backend, frontend, and agent worker
- Pushes all code to GitHub

## Development

### Backend only
```bash
cd backend
npm install
npm run dev     # starts on PORT=3001
```

### Frontend only
```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173
```

### Agents only
```bash
cd agents
pip install -r requirements.txt
python main.py  # runs all 3 agents once then exits
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /api/affiliates | List affiliates (filters: category, sort, limit) |
| GET | /api/affiliates/:id | Single affiliate |
| GET | /api/news | Paginated news digest |
| GET | /api/recommendations | 5 recommendation sections |
| POST | /api/subscription | Email signup |

## About Affiliate IDs

Affiliate IDs are YOUR unique tracking codes from each affiliate network. When users click your links and make purchases, you earn commissions. Sign up at:

- **ShareASale**: https://www.shareasale.com
- **CJ Affiliate**: https://www.cj.com
- **ClickBank**: https://www.clickbank.com
- **PartnerStack**: https://partnerstack.com
- **Impact**: https://impact.com

Once signed up, replace the `TODO` values in your `.env` file.

## Architecture

```
User → Frontend (React)
         ↓ React Query (every 5 min)
       Backend (Express API)
         ↓ Supabase client
       Supabase (PostgreSQL + RLS)
         ↑ daily upserts
       CrewAI Agents (Railway Worker)
         ↑ scrapes
       HackerNews / Reddit / ProductHunt / Affiliate Networks
```
