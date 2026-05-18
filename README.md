# ScriptVault AI

**High-end repository for AI-generated social, professional, and networking scripts.**

---

## Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS + TanStack Query |
| Backend   | Python 3.12 + FastAPI + Pydantic v2             |
| Database  | MongoDB 7 via Motor (async)                     |
| AI        | OpenAI GPT-4o-mini                              |
| Payments  | M-Pesa Daraja STK Push (Safaricom Kenya)        |
| Auth      | JWT (python-jose) + bcrypt                      |

---

## Quickstart

### Prerequisites
- Docker + Docker Compose
- OpenAI API key
- M-Pesa Daraja credentials (sandbox works for dev)

### 1. Clone & configure

```bash
git clone <repo> scriptvault-ai && cd scriptvault-ai

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — add OPENAI_API_KEY, JWT_SECRET, etc.

# Frontend
cp frontend/.env.example frontend/.env
```

### 2. Run

```bash
# Dev stack (includes Mongo Express on :8081)
docker compose --profile dev up --build

# Production stack
docker compose up --build
```

| Service       | URL                         |
|---------------|-----------------------------|
| React UI      | http://localhost:5173        |
| FastAPI docs  | http://localhost:8000/docs   |
| Mongo Express | http://localhost:8081        |

---

## Project Structure

```
scriptvault-ai/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                  ← FastAPI entry point
│       ├── core/
│       │   ├── config.py            ← Settings (pydantic-settings)
│       │   └── logger.py
│       ├── models/
│       │   └── schemas.py           ← All Pydantic schemas
│       ├── routers/
│       │   ├── auth.py              ← /api/v1/auth
│       │   ├── scripts.py           ← /api/v1/scripts  (generate + vault)
│       │   └── payments.py          ← /api/v1/payments (M-Pesa STK Push)
│       ├── services/
│       │   ├── auth_service.py      ← JWT + bcrypt
│       │   └── openai_service.py    ← LLM orchestration
│       ├── utils/
│       │   └── telecom.py           ← Kenyan network prefix detection
│       └── middleware/
│           └── rate_limiter.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── index.css                ← Global styles + CSS vars
        ├── config/
        │   └── ThemeConfig.js       ← Design system tokens
        ├── components/
        │   ├── forge/               ← Script generator UI
        │   ├── vault/               ← Saved scripts grid
        │   └── shared/              ← Buttons, inputs, modals
        ├── hooks/                   ← TanStack Query hooks
        ├── services/                ← Axios API client
        └── store/                   ← Zustand auth/UI state
```

---

## Design System

Theme: **Deep Space / Premium Utility**

- Background: `#050505` (void black)
- Primary accent: `#00FF41` (Matrix Green)
- Secondary accent: `#007AFF` (Electric Blue)
- **No purple. No heavy gradients.**
- Glassmorphism: opacity + border only (`glass-card` CSS class)
- Body font: Inter
- Script preview font: JetBrains Mono

All tokens live in `frontend/src/config/ThemeConfig.js`.

---

## API Endpoints

| Method | Path                                   | Description                        |
|--------|----------------------------------------|------------------------------------|
| POST   | `/api/v1/auth/register`                | Create account                     |
| POST   | `/api/v1/auth/login`                   | Get JWT                            |
| POST   | `/api/v1/scripts/generate`             | Generate 3 AI script variations    |
| POST   | `/api/v1/scripts/save`                 | Save script to Vault               |
| GET    | `/api/v1/scripts/`                     | List saved scripts                 |
| PATCH  | `/api/v1/scripts/{id}/usage`           | Track copy/send events             |
| DELETE | `/api/v1/scripts/{id}`                 | Delete script                      |
| POST   | `/api/v1/payments/stk-push`            | M-Pesa STK Push (Pro tier upgrade) |
| POST   | `/api/v1/payments/mpesa/callback`      | Daraja webhook                     |
| GET    | `/api/v1/payments/status/{id}`         | Poll transaction status            |
| GET    | `/health`                              | Liveness probe                     |

---

## M-Pesa Notes

- Only **Safaricom** numbers (07XX / 01XX with Safaricom allocations) support STK Push.
- The `telecom.py` utility auto-detects the network; if non-Safaricom, the frontend shows an appropriate message.
- In `ENV=development`, a simulated STK push response is returned so the UI can be tested without real Daraja credentials.

---

## Next Steps (Phase 2 → Phase 3)

- [ ] Build `TheForge` React component (intent/tone selector + generate)
- [ ] Build `TheVault` grid with glass cards + action bar
- [ ] Implement TanStack Query hooks (`useGenerateScript`, `useVault`)
- [ ] Zustand auth store + JWT persistence
- [ ] M-Pesa upgrade modal + polling for payment status
- [ ] Deploy: backend → Railway/Render, frontend → Vercel
