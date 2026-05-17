import os
import io
import pypdf
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from services.ai_service import ai_service
import json
from database import Session, engine, CandidateDB, JobDescriptionDB, to_db_model, to_api_model, select, init_db

app = FastAPI(
    title="AI Recruitment Dashboard API",
    description="FastAPI Backend Engine for processing resumes and analyzing matching metrics using Gemini/Groq.",
    version="1.0.0"
)

# Configure CORS for Next.js app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthStatus(BaseModel):
    status: str
    engine: str
    providers: dict

class PromptTestRequest(BaseModel):
    prompt: str
    provider: str  # 'gemini' or 'groq'
    model_name: str | None = None
    system_instruction: str | None = None

class PromptTestResponse(BaseModel):
    success: bool
    response: str
    provider: str
    model: str

@app.get("/", tags=["Root"])
def read_root():
    return {
        "status": "online",
        "message": "AI Recruitment Dashboard Backend Engine is operational.",
        "docs_url": "/docs"
    }

@app.get("/api/health", response_model=HealthStatus, tags=["Diagnostics"])
def health_check():
    providers = ai_service.get_available_providers()
    return {
        "status": "healthy",
        "engine": "FastAPI with uv",
        "providers": providers
    }

@app.get("/api/config", tags=["Diagnostics"])
def config_check():
    providers = ai_service.get_available_providers()
    
    return {
        "active_llm_providers": {
            "gemini": {
                "active": providers["gemini"],
                "models": ["gemini-2.5-flash", "gemini-2.5-pro"] if providers["gemini"] else []
            },
            "groq": {
                "active": providers["groq"],
                "models": ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"] if providers["groq"] else []
            }
        },
        "default_mode": "gemini" if providers["gemini"] else ("groq" if providers["groq"] else "none")
    }

@app.post("/api/test-prompt", response_model=PromptTestResponse, tags=["AI Utilities"])
async def test_ai_prompt(request: PromptTestRequest):
    providers = ai_service.get_available_providers()
    provider_name = request.provider.lower()
    
    if provider_name not in ["gemini", "groq"]:
        raise HTTPException(status_code=400, detail="Invalid provider option. Select 'gemini' or 'groq'.")
        
    if not providers[provider_name]:
        raise HTTPException(
            status_code=412, 
            detail=f"{provider_name.capitalize()} API key is not configured in the backend environment variables."
        )
        
    try:
        # Determine target model
        model = request.model_name
        if not model:
            model = "gemini-2.5-flash" if provider_name == "gemini" else "llama-3.3-70b-versatile"
            
        system = request.system_instruction or "You are a helpful AI recruitment assistant."
        
        response_text = await ai_service.generate_response(
            prompt=request.prompt,
            system_instruction=system,
            provider=provider_name,
            model_name=model
        )
        
        return {
            "success": True,
            "response": response_text,
            "provider": provider_name,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM API Call failed: {str(e)}")

@app.on_event("startup")
def on_startup():
    init_db()

class StageUpdate(BaseModel):
    stage: str

@app.post("/api/upload-resume", tags=["Candidates"])
async def upload_resume(
    file: UploadFile = File(...),
    provider: str = "gemini",
    model_name: str | None = None
):
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT files are accepted.")
    
    try:
        content = await file.read()
        extracted_text = ""
        
        if filename.endswith(".pdf"):
            pdf_file = io.BytesIO(content)
            reader = pypdf.PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
            
        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Resume file appears to be empty or contains no extractable text."
            )
            
        parsed_candidate = await ai_service.parse_resume(
            resume_text=extracted_text,
            provider=provider,
            model_name=model_name
        )
        
        return parsed_candidate
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and parse resume: {str(e)}")

@app.post("/api/candidates/apply", tags=["Candidates"])
async def apply_job(
    file: UploadFile = File(...),
    job_id: str = Body(...),
    candidate_email: str = Body(...),
    candidate_name: str = Body(...),
    provider: str = Body("gemini"),
    model_name: str | None = Body(None)
):
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT files are accepted.")
        
    try:
        content = await file.read()
        extracted_text = ""
        
        if filename.endswith(".pdf"):
            pdf_file = io.BytesIO(content)
            reader = pypdf.PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
            
        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Resume file appears to be empty or contains no extractable text."
            )
            
        # Get Job Description from DB
        with Session(engine) as session:
            db_job = session.get(JobDescriptionDB, job_id)
            if not db_job:
                # Fallback to default
                jd_dict = {
                    "title": "Senior Backend Engineer",
                    "summary": "Core scaling role.",
                    "min_experience": 5,
                    "education": "BS in CS",
                    "required_skills": ["Node.js", "PostgreSQL"],
                    "preferred_skills": ["Kubernetes"]
                }
            else:
                jd_dict = {
                    "title": db_job.title,
                    "summary": db_job.summary,
                    "min_experience": db_job.min_experience,
                    "education": db_job.education,
                    "required_skills": json.loads(db_job.required_skills_json),
                    "preferred_skills": json.loads(db_job.preferred_skills_json)
                }
                
        # Parse and Match using AI Service
        parsed_candidate = await ai_service.parse_and_match_resume(
            resume_text=extracted_text,
            jd=jd_dict,
            provider=provider,
            model_name=model_name
        )
        
        # Override name and email with form params if they were provided
        if candidate_name and candidate_name.strip():
            parsed_candidate["name"] = candidate_name
        if candidate_email and candidate_email.strip():
            parsed_candidate["email"] = candidate_email
            
        # Assign job_id and starting stage
        parsed_candidate["job_id"] = job_id
        parsed_candidate["stage"] = "applied"
        
        # Save candidate to DB
        import uuid
        parsed_candidate["id"] = "cand_" + uuid.uuid4().hex[:10]
        
        with Session(engine) as session:
            db_cand = to_db_model(parsed_candidate)
            session.add(db_cand)
            session.commit()
            session.refresh(db_cand)
            return to_api_model(db_cand)
            
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and apply resume: {str(e)}")

@app.get("/api/candidates", tags=["Candidates"])
def get_candidates(job_id: str | None = None):
    with Session(engine) as session:
        if job_id:
            statement = select(CandidateDB).where(CandidateDB.job_id == job_id)
        else:
            statement = select(CandidateDB)
        db_candidates = session.exec(statement).all()
        return [to_api_model(c) for c in db_candidates]

@app.get("/api/candidates/applications", tags=["Candidates"])
def get_applications(email: str):
    with Session(engine) as session:
        statement = select(CandidateDB).where(CandidateDB.email == email)
        db_candidates = session.exec(statement).all()
        return [to_api_model(c) for c in db_candidates]

@app.post("/api/candidates", tags=["Candidates"])
def create_candidate(candidate: dict = Body(...)):
    if "id" not in candidate or not candidate["id"]:
        import uuid
        candidate["id"] = "cand_" + uuid.uuid4().hex[:10]
    
    with Session(engine) as session:
        db_cand = session.get(CandidateDB, candidate["id"])
        if db_cand:
            # Overwrite/update matching attributes
            for key, val in to_db_model(candidate).dict().items():
                setattr(db_cand, key, val)
        else:
            db_cand = to_db_model(candidate)
            session.add(db_cand)
            
        session.commit()
        session.refresh(db_cand)
        return to_api_model(db_cand)

@app.patch("/api/candidates/{id}/stage", tags=["Candidates"])
def update_candidate_stage(id: str, payload: StageUpdate):
    with Session(engine) as session:
        db_cand = session.get(CandidateDB, id)
        if not db_cand:
            raise HTTPException(status_code=404, detail="Candidate not found")
        db_cand.stage = payload.stage
        session.commit()
        session.refresh(db_cand)
        return to_api_model(db_cand)

@app.delete("/api/candidates/{id}", tags=["Candidates"])
def delete_candidate(id: str):
    with Session(engine) as session:
        db_cand = session.get(CandidateDB, id)
        if not db_cand:
            raise HTTPException(status_code=404, detail="Candidate not found")
        session.delete(db_cand)
        session.commit()
        return {"success": True, "message": f"Candidate {id} has been deleted successfully."}

class JobDescriptionRequest(BaseModel):
    title: str
    summary: str
    min_experience: int
    education: str
    required_skills: list[str]
    preferred_skills: list[str]

@app.get("/api/jobs", tags=["Jobs"])
def get_jobs():
    with Session(engine) as session:
        statement = select(JobDescriptionDB)
        db_jobs = session.exec(statement).all()
        return [
            {
                "id": j.id,
                "title": j.title,
                "summary": j.summary,
                "min_experience": j.min_experience,
                "education": j.education,
                "required_skills": json.loads(j.required_skills_json),
                "preferred_skills": json.loads(j.preferred_skills_json),
                "posted_by_org": j.posted_by_org
            }
            for j in db_jobs
        ]

@app.post("/api/jobs", tags=["Jobs"])
def create_job(job: JobDescriptionRequest):
    import uuid
    job_id = "job_" + uuid.uuid4().hex[:8]
    with Session(engine) as session:
        db_job = JobDescriptionDB(
            id=job_id,
            title=job.title,
            summary=job.summary,
            min_experience=job.min_experience,
            education=job.education,
            required_skills_json=json.dumps(job.required_skills),
            preferred_skills_json=json.dumps(job.preferred_skills),
            posted_by_org="Horizon AI"
        )
        session.add(db_job)
        session.commit()
        session.refresh(db_job)
        return {
            "id": db_job.id,
            "title": db_job.title,
            "summary": db_job.summary,
            "min_experience": db_job.min_experience,
            "education": db_job.education,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
            "posted_by_org": db_job.posted_by_org
        }

class JDRequest(BaseModel):
    jd_text: str
    provider: str = "gemini"
    model_name: str | None = None

class MatchJDRequest(BaseModel):
    title: str
    summary: str
    min_experience: int
    education: str
    required_skills: list[str]
    preferred_skills: list[str]

@app.post("/api/parse-jd", tags=["Job Descriptions"])
async def parse_job_description(request: JDRequest):
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    try:
        parsed_jd = await ai_service.parse_jd(
            jd_text=request.jd_text,
            provider=request.provider,
            model_name=request.model_name
        )
        
        # Save parsed JD directly to the Supabase Database to automatically broadcast it!
        with Session(engine) as session:
            import re
            import uuid
            title_slug = re.sub(r'[^a-zA-Z0-9]', '-', parsed_jd.get("title", "job").lower())
            title_slug = re.sub(r'-+', '-', title_slug).strip('-')
            job_id = f"job-{title_slug}-{str(uuid.uuid4())[:4]}"
            
            db_jd = JobDescriptionDB(
                id=job_id,
                title=parsed_jd.get("title", "Untitled Job"),
                summary=parsed_jd.get("summary", ""),
                min_experience=parsed_jd.get("min_experience", 0),
                education=parsed_jd.get("education", "Any"),
                required_skills_json=json.dumps(parsed_jd.get("required_skills", [])),
                preferred_skills_json=json.dumps(parsed_jd.get("preferred_skills", [])),
                posted_by_org="Horizon AI"
            )
            session.add(db_jd)
            session.commit()
            
            # Return the newly assigned persistent ID back to the client
            parsed_jd["id"] = job_id
            
        return parsed_jd
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse job description: {str(e)}")

@app.post("/api/match-jd-candidates", tags=["Job Descriptions"])
def match_jd_candidates(jd: MatchJDRequest):
    with Session(engine) as session:
        statement = select(CandidateDB)
        db_candidates = session.exec(statement).all()
        
        results = []
        for db_c in db_candidates:
            candidate = to_api_model(db_c)
            cand_skills = [s.lower() for s in candidate["skills"]]
            
            # 1. Skills Overlap and rating (Task 5.3)
            required_lower = [s.lower() for s in jd.required_skills]
            
            overlap_matrix = []
            skills_matched_count = 0
            
            for req_skill in jd.required_skills:
                req_skill_lower = req_skill.lower()
                
                # Check for exact match in lower skills array
                if req_skill_lower in cand_skills:
                    status = "matched"
                    skills_matched_count += 1
                # Check for partial match / Related competency check
                elif any(req_skill_lower in s or s in req_skill_lower for s in cand_skills):
                    status = "neutral"
                    skills_matched_count += 0.5
                else:
                    status = "missing"
                    
                overlap_matrix.append({
                    "name": req_skill,
                    "status": status
                })
                
            if required_lower:
                skills_score = (skills_matched_count / len(required_lower)) * 100
            else:
                skills_score = 100
                
            # 2. Seniority Match calculation
            exp_diff = candidate["experience"] - jd.min_experience
            if exp_diff >= 0:
                seniority_score = 100
            else:
                # Deduct 15% per missing year
                seniority_score = max(0, 100 - (abs(exp_diff) * 15))
                
            # 3. Overall Weighted Score: 60% skills, 40% experience
            overall_score = round((skills_score * 0.6) + (seniority_score * 0.4))
            
            # Synthesize custom AI text explanation
            if overall_score >= 85:
                summary = f"{candidate['name']} is an outstanding candidate with deep technical overlap in {', '.join(candidate['skills'][:3])} and sufficient experience ({candidate['experience']} years)."
            elif overall_score >= 70:
                summary = f"{candidate['name']} is a strong candidate but has slight gaps in required skills or experience. Excellent core alignment."
            else:
                summary = f"{candidate['name']} has lower semantic alignment with this specific role due to significant technical skills gaps."
                
            results.append({
                "candidate": candidate,
                "matchScore": overall_score,
                "skillsScore": round(skills_score),
                "seniorityScore": round(seniority_score),
                "skillsMatrix": overlap_matrix,
                "summary": summary
            })
            
        # Sort candidates by overall match score descending
        results.sort(key=lambda x: x["matchScore"], reverse=True)
        return results

class CompareCandidatesRequest(BaseModel):
    candidates: list[dict]
    target_role: str = "General Software Engineer"
    parsed_jd: dict | None = None
    provider: str = "gemini"
    model_name: str | None = None

@app.post("/api/compare-candidates", tags=["Candidates Comparison"])
async def compare_candidates_endpoint(request: CompareCandidatesRequest):
    if len(request.candidates) < 2:
        raise HTTPException(status_code=400, detail="At least 2 candidates are required for comparison.")
        
    try:
        comparison_result = await ai_service.compare_candidates(
            candidates_data=request.candidates,
            target_role=request.target_role,
            parsed_jd=request.parsed_jd,
            provider=request.provider,
            model_name=request.model_name
        )
        return comparison_result
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare candidates: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
