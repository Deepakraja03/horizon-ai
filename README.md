# Horizon AI — Elite Engineering Manual & System Blueprint

Welcome to the ultimate **AI Recruitment Dashboard** — a world-class, premium talent acquisition platform powered by a robust **FastAPI backend** and a high-fidelity **Next.js frontend**. The system features a unified multi-agent recruitment telemetry pipeline, combining automated Job Description Parsing, Kanban pipelines, multi-provider LLM configurations, and side-by-side candidate comparison matrices with pixel-perfect executive PDF reporting.

---

## 🏗️ System Architecture & Telemetry Flow

The application is structured into two main decoupled modules designed for extreme performance, clean type safety, and real-time state management:

```mermaid
graph TD
    A[Next.js Client app:3000] <-->|JSON REST APIs| B[FastAPI Server backend:8000]
    B <-->|ORM / PgSQL Drivers| C[(Supabase / SQLite Database)]
    B <-->|genai SDK / HTTP REST| D[Google Gemini 2.5 Flash]
    B <-->|groq SDK / HTTP REST| E[Groq Llama 3.3 70B]
```

### 1. Unified Telemetry Flow
*   **Job Description Extraction**: Recruiters paste raw job postings. The system analyzes the criteria using structured Gemini/Groq schema output modes, isolating target titles, minimum experience caps, required technical skills, and preferred bonus skills.
*   **Semantic Scoring Engine**: Candidates in the database are benchmarked on the fly using our multi-dimensional formula, calculating technical overlap indices and seniority suitability scores.
*   **Hiring Committee Comparison Matrix**: Up to 4 candidates can be selected for a side-by-side evaluation against custom roles or the active parsed JD criteria. A simulated AI Hiring Committee synthesizes pros, cons, and elects an executive winner.
*   **Pristine Print Bleed PDF Engine**: A single click compiles comparative metrics into a monochrome executive report, instantly stripping sidebars and dashboard chrome.

---

## 🛠️ Tech Stack & Key Abstractions

### Frontend (Next.js)
*   **Core**: React 19, Next.js 16 (App Router), TypeScript.
*   **Styling**: Premium Graphite/Glassmorphic theme tailored with curated vanilla CSS tokens, Inter/Outfit typography, and micro-interactions.
*   **State**: Reactive layout keys enforcing robust component mounting and synchronous resets on new parsed inputs.
*   **Auth**: Dual-Mode Authentication (Segmented Local Mock Session vs Live Cloud Supabase JWT handshake).

### Backend (FastAPI)
*   **Core**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
*   **Database ORM**: Dynamic Postgres driver (`psycopg2`) connecting to a **Supabase** instance, with automated, zero-config sqlite fallbacks.
*   **AI Orchestrators**: Dual Google GenerativeAI and Groq SDK adapters.

---

## 🔌 Database Setup & Credentials

The system operates on an automated dual-database architecture:
1.  **Supabase Postgres Instance**: Connected via standard URL strings for production persistence.
2.  **Local SQLite Fallback**: If the PostgreSQL network connection fails or credentials are unset, the system dynamically spins up a local SQLite instance (`pipeline.db`) so that you have zero downtime during testing!

### Environment Configuration

#### Backend Configuration (`/backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
# Server settings
HOST=127.0.0.1
PORT=8000

# LLM Keys
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Database credentials
DATABASE_URL=postgresql://postgres.your-ref-id:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### Frontend Configuration (`/horizon-ai/.env`)
Create a `.env` file inside the `horizon-ai/` directory:
```env
# Backend API Base Endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Auth Project Credentials (optional for live mode testing)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🌍 1-Click Production Deployment Guides

This project is 100% cloud-ready and decoupled for lightning-fast deployments on modern serverless stacks:

### 1. Database & Authentication Setup (Supabase)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. In the **Database** settings, copy the **Transaction Pooler Connection String** (`postgresql://...`).
3. In the **Authentication** panel:
   * Go to **Users** and click **Add User -> Create User**.
   * Create an email/password user account (e.g. `lead.recruiter@horizon.ai`). This account will be used to log in when testing **Cloud Supabase Auth** mode!
4. Save the Project URL and Anon API key from the **API** settings.

### 2. Backend Server Deployment (Railway.app)
The backend includes a fully optimized production [Dockerfile](file:///Users/deepakraja/deepakproject/ai-project/backend/Dockerfile) ready for 1-click cloud builds on Railway:
1. Log in to [Railway.app](https://railway.app) and click **New Project -> Deploy from GitHub**.
2. Select your repository.
3. In **Settings**, set the **Root Directory** to `/backend`.
4. Add the following **Environment Variables** in the Railway panel:
   * `DATABASE_URL`: Your Supabase connection string.
   * `GEMINI_API_KEY`: Your Google Gemini API Key.
   * `GROQ_API_KEY`: Your Groq API Key.
5. Railway will automatically build the container via the Dockerfile and generate a public live HTTPS URL (e.g., `https://backend-production-xyz.up.railway.app`).

### 3. Frontend UI Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Link your GitHub repository.
3. Set the **Root Directory** to `horizon-ai`.
4. Configure the **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: Your live Railway backend HTTPS URL.
   * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
5. Click **Deploy**. Vercel will build the React bundle and make your interactive premium recruitment suite live!

---

## 🚀 Local Startup & Launch Procedures

Follow these simple steps to spin up the local development clusters:

### Prerequisites
Make sure you have `node` (v18+), `npm`, and `python` (v3.11+) installed. We highly recommend `uv` for python environments.

### 1. Launch the Backend Server
```bash
# Navigate to backend workspace
cd backend

# Create and activate virtual environment
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Start the uvicorn API server
uv run uvicorn main:app --reload
```
The FastAPI documentation will be exposed immediately at `http://localhost:8000/docs`.

### 2. Launch the Frontend UI
```bash
# Navigate to dashboard workspace
cd horizon-ai

# Install packages
npm install

# Start the Next.js development server
npm run dev
```
Open your browser of choice and browse to `http://localhost:3000` to interact with the platform!

---

## 🎯 Verification & Testing Suite

### 1. Production Compilation
Verify there are no TypeScript or compilation bottlenecks in the frontend:
```bash
npm run build
```

### 2. Lints & Rules Enforcement
The codebase is 100% compliant with strict TypeScript types and ESLint hooks:
```bash
npm run lint
```
