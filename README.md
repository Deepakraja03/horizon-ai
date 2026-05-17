# Horizon AI — AI Recruitment Dashboard

Welcome to **Horizon AI** — an AI recruitment dashboard with JD-aware resume scoring, Kanban pipeline, and candidate comparison. The system parses raw job descriptions, benchmarks candidates dynamically, lets you compare applicants side-by-side using an AI Hiring Committee synthesis, and generates clean PDF evaluation reports.

---

## 🌐 Live Production URLs

*   **Frontend Client**: [https://horizon-ai-app.vercel.app](https://horizon-ai-app.vercel.app)
*   **Backend API Server**: [https://horizon-ai-backend.vercel.app](https://horizon-ai-backend.vercel.app)

---

## 📸 Product Tour & Video Demo

Here is a quick tour of the dashboard interfaces:

### 1. Recruiter Dashboard
Displays candidate applicant statistics, database connection health, and current active roles:
![Recruiter Dashboard](screenshots/pipeline_applicant.png)

### 2. Candidate Kanban Pipeline
Move candidates across hiring stages. All changes sync with the database in real-time:
![Kanban Pipeline](screenshots/kaban_pipeline.png)

### 3. Candidate Comparison Matrix
Select up to 4 candidates to benchmark side-by-side. You can trigger an automated AI hiring committee evaluation and download a clean PDF report:
![Candidate Comparison](screenshots/candidate_compare.png)

### 4. Careers Portal (Candidate View)
A clean public page where job seekers can view active listings and upload their resumes:
![Candidate Jobs View](screenshots/candidate_jobs_view.png)

### 5. Application Tracking Board
Allows applicants to view their real-time application review stages and progress logs:
![Application Status](screenshots/candidate_application_status.png)

### 🎬 Workflow Highlight Loop & Full Video
Here is a 15-second looping preview of the candidate tracking pipeline:

![Horizon AI Workflow Loop](screenshots/system_demo_highlight.gif)

*   🎥 **[Watch the Full 6-Minute Demo Video (Google Drive)](https://drive.google.com/file/d/1dgyjOxtX7f-Yu5i4rTx5_qADaS7mLGAQ/view?usp=sharing)**

---

## 🏗️ Project Architecture

The workspace is structured as a unified Git repository with two decoupled subprojects:

```mermaid
graph TD
    subgraph Workspace Root [ai-project]
        ROOT_GIT[.gitignore]
        ROOT_README[README.md]
        
        subgraph Frontend [horizon-ai]
            FE_CODE[Next.js Client / React 19]
            FE_CONFIG[vercel.json]
        end

        subgraph Backend [backend]
            BE_CODE[FastAPI Python API]
            BE_CONFIG[vercel.json]
            BE_DEPS[requirements.txt]
        end
    end

    FE_CODE <-->|JSON REST APIs| BE_CODE
    BE_CODE <-->|Postgres Pooler / SQLite| DB[(Supabase Postgres / SQLite)]
    BE_CODE <-->|Gemini & Groq SDKs| LLM[Google Gemini / Groq Llama]
```

---

## 🔌 Environment & Credentials Setup

Each subproject manages its own local configuration file:

### 1. Backend Configuration (`/backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
HOST=0.0.0.0
PORT=8000

# AI Provider API Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Supabase Postgres Connection Pooler String (IPv4 Transaction Pooler on Port 6543)
# If left empty, the server automatically defaults to a local SQLite backup database!
SUPABASE_DATABASE_URL=postgresql://postgres.your-ref-id:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Frontend Configuration (`/horizon-ai/.env`)
Create a `.env` file inside the `horizon-ai/` directory:
```env
# Backend API Base Endpoint
NEXT_PUBLIC_API_URL=https://horizon-ai-backend.vercel.app

# Supabase Auth Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Unified Local Startup Guide

Launch both frontend and backend concurrently with a single command:

### 1-Click Dev Server (Recommended)
From the root of the project directory, run:
```bash
make dev
```
This automatically activates the backend virtual environment (`.venv`), starts your FastAPI serverless backend (`uvicorn`) on port `8000`, launches your Next.js client (`bun dev`) on port `3000`, and cleanly shuts down both servers when you press `Ctrl+C` to avoid orphaned port locks.

---

### Manual Multi-Terminal Startup (Optional)

If you prefer to run the services in separate terminals:

#### Step 1: Start the Backend Server
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
uv venv
source .venv/bin/activate

# Install dependencies and start the dev server
uv pip install -r requirements.txt
uv run uvicorn main:app --reload
```
*Your FastAPI documentation and interactive Swagger playground will be available at `http://localhost:8000/docs`.*

#### Step 2: Start the Frontend UI Client
```bash
# Navigate to the frontend directory
cd horizon-ai

# Install node dependencies and start the dev server
bun install
bun run dev
```
*Your interactive dashboard will launch immediately at `http://localhost:3000`.*

---

## 🛡️ Key Features & Database Fallbacks

*   **SQLite Database Fallback**: If the Supabase Postgres connection is unavailable, the backend automatically sets up a local SQLite database (`/tmp/pipeline.db`), ensuring the server always boots and runs cleanly.
*   **Vercel Routing & Security**: A custom `vercel.json` configures clean routing and enforces clickjacking protection, XSS blocking, and strict referrer guidelines.
*   **IPv4 Transaction Connection Pooler**: Outbound connections to Supabase are routed over IPv4 port `6543`, bypassing direct IPv6 outbound network limitations in serverless environments like Vercel.

---

For technical details specific to each subproject, please consult the respective manuals:
*   📖 **Frontend Client Manual**: [/horizon-ai/README.md](file:///Users/deepakraja/deepakproject/ai-project/horizon-ai/README.md)
*   📖 **Backend Server Manual**: [/backend/README.md](file:///Users/deepakraja/deepakproject/ai-project/backend/README.md)
