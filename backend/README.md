# Horizon AI — FastAPI Backend

This is the FastAPI backend for the **Horizon AI** recruitment dashboard. It manages candidate databases, parses job descriptions, and coordinates LLM evaluations using Google Gemini and Groq.

---

## ⚡ Core Architecture

### 1. LLM Integrations
The backend uses a multi-provider LLM wrapper to select models at runtime:
*   **Google Gemini (`gemini-2.5-flash`)**: Used for structured, high-accuracy job description and resume parsing into schema-conforming JSON formats.
*   **Groq Llama (`llama-3.3-70b-versatile`)**: Used for candidate evaluations and prompt-engineering summaries.

### 2. Database Connections & SQLite Fallback
The database engine (`database.py`) includes a self-healing setup designed for serverless environments:
*   **Postgres Connection**: Connects to your Supabase PostgreSQL instance using standard psycopg2 drivers. Connecting via Supabase's **IPv4 Transaction Connection Pooler** on port `6543` is recommended to avoid serverless connection limits.
*   **SQLite Fallback**: If the PostgreSQL URL is missing or a network timeout is triggered, the system automatically falls back to a local SQLite database at `/tmp/pipeline.db`. This guarantees **100% build and startup success**.

### 3. Serverless Functions (`vercel.json`)
The directory contains a Vercel routing configuration file to build and serve FastAPI routes as high-speed python ASGI serverless functions.

---

## 📋 Environment Configuration

Create a `.env` file in this directory with the following variables:
```env
HOST=0.0.0.0
PORT=8000

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyCsD0qKeeC149C5Ug...

# Groq API Key
GROQ_API_KEY=gsk_ELvQzAxGWQdqhSmV...

# Supabase PostgreSQL Connection Pooler URL (Port 6543)
SUPABASE_DATABASE_URL=postgresql://postgres.clwtylsgsktgzxfzozez:Jarvis_03_23_202@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🚀 Local Installation & Startup

Make sure you have Python 3.11+ and the fast dependency manager **`uv`** installed:

```bash
# 1. Create a virtual environment
uv venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Install dependencies
uv pip install -r requirements.txt

# 4. Start the local server
uv run uvicorn main:app --reload
```
*   **Interactive API Docs**: Go to `http://localhost:8000/docs` to test candidate matching and JD parsing endpoints inside the interactive Swagger UI.
*   **Health Check**: Ping `/api/health` to verify database engine status and active connection health metrics.
