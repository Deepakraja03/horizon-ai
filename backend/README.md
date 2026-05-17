# Horizon AI — FastAPI Python Serverless Backend

This is the high-performance, asynchronous FastAPI backend engine powering the **Horizon AI** recruitment dashboard. It acts as the orchestration layer for all candidates, job descriptions, multi-provider LLM evaluations, and evaluation telemetry pipelines.

---

## ⚡ Key Architectural Abstractions

### 1. Multi-Provider LLM Orchestrator
The server wraps both `google-genai` and `groq` APIs inside custom adapters. 
*   **Google Gemini (`gemini-2.5-flash`)**: Used for structured, high-accuracy parsing of job descriptions and resume text into schema-conforming JSON formats.
*   **Groq Llama (`llama-3.3-70b-versatile`)**: Integrated for fast, conversational text analysis and system prompt evaluations.
*   *Configurable inside the settings interface of the frontend at runtime!*

### 2. Dual-Engine DB Connection Lifespan
Designed for modern serverless hosting environments, the database ORM (`database.py`) features a self-healing dual-engine pipeline:
1.  **Production Engine**: Tries to connect to your Supabase PostgreSQL instance using standard psycopg2 drivers. It is strongly recommended to connect via Supabase's **IPv4 Transaction Connection Pooler** on port `6543` to avoid serverless connection limits.
2.  **Zero-Crash Fallback Engine**: If the database URL is empty or a connection timeout is triggered, the system prints an explicit console warning and automatically constructs a local SQLite engine (storing records inside the `/tmp/pipeline.db` sandbox). This ensures **100% build and startup success**.

### 3. Serverless Routing (`vercel.json`)
The folder includes a custom `@vercel/python` routing map to launch as high-speed Vercel Serverless Functions.

---

## 📋 Environment Credentials

Create a `.env` file in this directory with the following variables:
```env
HOST=0.0.0.0
PORT=8000

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyCsD0qKeeC149C5Ug...

# Groq API Key
GROQ_API_KEY=gsk_ELvQzAxGWQdqhSmV...

# Supabase PostgreSQL URL (Port 6543)
SUPABASE_DATABASE_URL=postgresql://postgres.clwtylsgsktgzxfzozez:Jarvis_03_23_202@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🚀 Local Deployment & Startup

Ensure you have Python 3.11+ and the high-speed package manager `uv` installed.

```bash
# 1. Create a clean virtual environment
uv venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Install packages
uv pip install -r requirements.txt

# 4. Spin up the local development uvicorn server
uv run uvicorn main:app --reload
```
*   **Interactive Swagger Docs**: Browse to `http://localhost:8000/docs` to test all candidate matching and job parsing REST API endpoints interactively.
*   **Health Check Route**: Ping `/api/health` to confirm active database connection metrics and server statuses.
