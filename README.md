# Sovereign AI — Career Agent Platform

An AI-powered autonomous career management platform that discovers jobs, matches your resume using Gemini AI embeddings, finds recruiter contacts, and drafts personalized outreach emails.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │  Jobs    │ │ Emails   │ │Settings│ │
│  │ + Stats  │ │ + Match  │ │ + Draft  │ │ + Keys │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Profile  │ │ Code AI  │ │  Logs    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
┌───────────────────────┴─────────────────────────────┐
│                 Backend (FastAPI)                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ Auth (JWT  │ │ Agents API │ │ Background │       │
│  │ + Google)  │ │ + Profile  │ │  Workers   │       │
│  └────────────┘ └────────────┘ └──────┬─────┘       │
│                                       │              │
│  ┌────────────────────────────────────┘              │
│  │  AI Agent Pipeline                                │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │  │Job Agent│→│Match    │→│HR Agent │→│Email   ││
│  │  │(Adzuna) │ │(Gemini) │ │(Hunter) │ │(Gemini)││
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘│
│  └──────────────────────────────────────────────────│
└───────────────────────┬─────────────────────────────┘
              ┌─────────┴─────┐
              │   MongoDB     │
              │   Redis       │
              └───────────────┘
```

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind 4  |
| Backend    | FastAPI, Pydantic, Python 3.11    |
| Database   | MongoDB (PyMongo)                 |
| Queue      | Celery + Redis                    |
| AI         | Google Gemini (text + embeddings) |
| Auth       | JWT + Google OAuth 2.0            |
| APIs       | Adzuna Jobs, Hunter.io, GitHub    |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 22+
- MongoDB (Atlas or local)
- Redis (for background tasks)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env          # Fill in your API keys
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 3. Docker (Alternative)
```bash
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MongoDB connection string |
| `SECRET_KEY` | ✅ | JWT signing key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | ❌ | For Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | ❌ | For Google OAuth login |
| `ADZUNA_APP_ID` | ❌ | Adzuna job API |
| `ADZUNA_API_KEY` | ❌ | Adzuna job API |
| `HUNTER_API_KEY` | ❌ | Hunter.io email lookup |
| `GITHUB_TOKEN` | ❌ | GitHub repo analysis |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Features

- **Job Discovery** — Scrapes live jobs from Adzuna API based on your preferences
- **Semantic Matching** — Uses Gemini embeddings to score jobs against your resume
- **HR Contact Lookup** — Finds recruiter emails via Hunter.io API
- **AI Email Drafting** — Generates personalized cold outreach using Gemini
- **Code Analysis** — Reviews GitHub repos with AI-powered suggestions
- **Live Pipeline** — Visual real-time workflow status on the dashboard
- **Activity Logs** — Persistent activity logging stored in MongoDB
- **Google OAuth** — One-click sign-in with Google
- **Settings Dashboard** — Monitor which integrations are configured

## License

MIT
