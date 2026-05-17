# Horizon AI — Next.js Frontend

This is the Next.js and React 19 frontend client for the **Horizon AI** recruitment dashboard. The interface features custom CSS styling, Kanban boards, and side-by-side candidate comparison screens with print-ready CSS layouts.

---

## 🎨 Key Features & Interfaces

*   **Dark Theme Design**: Built using a clean graphite dark theme with CSS variables and glassmorphism styling.
*   **Kanban Board**: Drag candidates across different interview stages with instant database synchronization.
*   **Print-Ready CSS Layouts**: Custom media styles automatically strip dashboard sidebars and headers when printing, outputting a clean, paper-friendly candidate comparison sheet.
*   **Responsive Layouts**: Fully responsive interface blocks optimized for recruiter dashboards and candidate career pages.

---

## 📸 Product Tour & Showcase

Here is a visual walkthrough of the frontend layouts:

### 1. Recruiter Dashboard (Applicants Overview)
Displays candidate statistics and database connection statuses:
![Recruiter Dashboard](../screenshots/pipeline_applicant.png)

### 2. Candidate Kanban Pipeline
Track and manage candidates across hiring stages in real-time:
![Kanban Pipeline](../screenshots/kaban_pipeline.png)

### 3. Candidate Comparison Matrix
Select up to 4 candidates to benchmark side-by-side and read automated AI hiring committee reports:
![Candidate Comparison](../screenshots/candidate_compare.png)

### 4. Careers Portal (Candidate View)
A public board where job seekers can view active listings and upload their resumes:
![Candidate Jobs View](../screenshots/candidate_jobs_view.png)

### 5. Application Tracking Board
Allows candidates to track their application reviews and check status history:
![Application Status](../screenshots/candidate_application_status.png)

### 🎬 Workflow Highlight Loop & Full Video
Here is a 15-second looping preview of the candidate tracking pipeline:

![Horizon AI Workflow Loop](../screenshots/system_demo_highlight.gif)

*   🎥 **[Watch the Full 6-Minute Demo Video (Google Drive)](https://drive.google.com/file/d/1dgyjOxtX7f-Yu5i4rTx5_qADaS7mLGAQ/view?usp=sharing)**

---

## 🔐 Authentication Modes

The client operates on two authentication pathways:
1.  **Cloud Supabase Auth (Production)**: Handles secure logins and Google OAuth handshakes directly on the live domain.
2.  **Sandbox Local Simulation**: Defaults to a mock recruiter session if Supabase keys are missing, allowing you to test the resume matching features immediately.

---

## 📋 Environment Configuration

Create a `.env` file in this directory with the following variables:
```env
# URL pointing to your live FastAPI backend server
NEXT_PUBLIC_API_URL=https://horizon-ai-backend.vercel.app

# Supabase Auth configuration (Optional: Sandbox mock is active if left blank)
NEXT_PUBLIC_SUPABASE_URL=https://clwtylsgsktgzxfzozez.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Local Installation & Launch

Make sure you have Node.js (v18+) and **Bun** installed:

```bash
# 1. Install dependencies
bun install

# 2. Run the development server
bun run dev
```
*Browse to `http://localhost:3000` to interact with the dashboard.*

---

## 🛡️ Production Security Headers (`vercel.json`)
The custom `vercel.json` file configures headers to enforce security policies:
*   `X-Frame-Options: DENY` (Clickjacking prevention)
*   `X-Content-Type-Options: nosniff` (Forced MIME validation)
*   `X-XSS-Protection: 1; mode=block` (Script injection blocking)
*   `Referrer-Policy: strict-origin-when-cross-origin` (Strict referrer tracking)
