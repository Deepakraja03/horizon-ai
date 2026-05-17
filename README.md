# Horizon AI — Unified Recruitment Telemetry & System Blueprint

Welcome to **Horizon AI** — an elite, premium talent acquisition and recruitment dashboard telemetry suite. The system is engineered to automate Job Description parsing, orchestrate multi-provider LLM evaluations (Google Gemini & Groq), manage candidates in a dynamic Kanban telemetry pipeline, and output side-by-side executive print-bleed comparison matrices with single-click PDF compilers.

---

## 🌐 Live Production Environments

Both modules of **Horizon AI** are fully hosted, serverless, and operational:

| Module | Deployment URL | Hosting Provider | Features |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | [https://horizon-ai-app.vercel.app](https://horizon-ai-app.vercel.app) | **Vercel** | Next.js, Google/Supabase Auth, Premium Glassmorphic UI, Print-Bleed CSS |
| **Backend API** | [https://horizon-ai-backend.vercel.app](https://horizon-ai-backend.vercel.app) | **Vercel Serverless** | FastAPI, Dual Supabase/SQLite ORM, Gemini & Groq LLMs |

---

## 🏗️ Decoupled Workspace Architecture

The workspace is organized as a single, unified Git repository with two distinct top-level modules. This makes tracking code, managing dependencies, and pushing to cloud hosting providers extremely simple and secure.

```mermaid
graph TD
    subgraph Workspace Root [ai-project]
        ROOT_GIT[.gitignore]
        ROOT_README[README.md]
        
        subgraph Frontend [horizon-ai]
            FE_CODE[Next.js App / React 19]
            FE_CONFIG[vercel.json]
            FE_ENV[.env.example]
        end

        subgraph Backend [backend]
            BE_CODE[FastAPI Python API]
            BE_CONFIG[vercel.json]
            BE_DEPS[requirements.txt]
            BE_ENV[.env.example]
        end
    end

    FE_CODE <-->|JSON REST APIs| BE_CODE
    BE_CODE <-->|Supabase Pooler / SQLite| DB[(Supabase Postgres / SQLite)]
    BE_CODE <-->|Google / Groq SDKs| LLM[Gemini 2.5 Flash / Llama 3.3]
```

---

## 🔌 Environment & Credentials Setup

Each module contains its own configuration file. For local development, copy the templates below:

### 1. Backend Settings (`/backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
HOST=0.0.0.0
PORT=8000

# Google Gemini API Key (Obtain from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Groq API Key (Obtain from Groq Console)
GROQ_API_KEY=your_groq_api_key

# Supabase PostgreSQL Connection Pooler String (Transaction mode on Port 6543)
# If left empty, the server automatically boots with a local SQLite fallback!
SUPABASE_DATABASE_URL=postgresql://postgres.your-ref-id:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Frontend Settings (`/horizon-ai/.env`)
Create a `.env` file in the `horizon-ai/` directory:
```env
# Backend API Base Endpoint URL
NEXT_PUBLIC_API_URL=https://horizon-ai-backend.vercel.app

# Supabase Auth Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Unified Local Startup Guide

Run the entire suite locally by spinning up both workspaces:

### Step 1: Start the Backend Server (Python / FastAPI)
Make sure you have Python 3.11+ and `uv` installed:
```bash
# Navigate to the backend directory
cd backend

# Create and activate a clean virtual environment
uv venv
source .venv/bin/activate

# Install compiled dependencies
uv pip install -r requirements.txt

# Start the local development server
uv run uvicorn main:app --reload
```
*Your FastAPI documentation and interactive Swagger playground will launch at `http://localhost:8000/docs`.*

### Step 2: Start the Frontend UI Client (Next.js)
```bash
# Navigate to the frontend directory
cd horizon-ai

# Install node dependencies (Using Bun, npm, or Yarn)
bun install  # or npm install

# Start the hot-reloading Next.js dev server
bun run dev  # or npm run dev
```
*Your interactive dashboard will boot instantly at `http://localhost:3000`.*

---

## 🛡️ Telemetry & System Resilience Features
*   **Dual-Database Fallback**: In serverless production environments (or when local database connections fail), the backend engine dynamically downgrades to a highly performant SQLite sandboxed database (`/tmp/pipeline.db`). This guarantees **100% server uptime and zero-crash booting**.
*   **Production Vercel Routing**: The frontend includes a dedicated `vercel.json` enforcing Clickjacking prevention, XSS-protection, MIME-sniffing blocks, and clean URL routing out-of-the-box.
*   **Supabase Transaction Pooler Integration**: Designed for Serverless architectures, connecting seamlessly over outbound IPv4 ports to prevent serverless execution connection limits.

---

For technical features specific to each subproject, please consult the respective modular manuals:
*   📖 **Frontend Client Manual**: [/horizon-ai/README.md](file:///Users/deepakraja/deepakproject/ai-project/horizon-ai/README.md)
*   📖 **Backend Server Manual**: [/backend/README.md](file:///Users/deepakraja/deepakproject/ai-project/backend/README.md)
