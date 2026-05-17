import os
import json
from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session, select
from dotenv import load_dotenv

# Load environments
load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

if not DATABASE_URL or not DATABASE_URL.strip():
    raise ValueError("❌ SUPABASE_DATABASE_URL is not set in backend/.env. Supabase database connection is strictly required.")

# Standardize connection string
db_url = DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Create engine for Cloud Supabase PostgreSQL database
engine = create_engine(
    db_url, 
    pool_pre_ping=True
)

print("==================================================")
print("🚀 Connected to Cloud Supabase Database!")
print("==================================================")

class JobDescriptionDB(SQLModel, table=True):
    __tablename__ = "job_descriptions"
    
    id: str = Field(primary_key=True)
    title: str
    summary: str
    min_experience: int
    education: str
    required_skills_json: str  # JSON list
    preferred_skills_json: str  # JSON list
    posted_by_org: str = "Horizon AI"

class CandidateDB(SQLModel, table=True):
    __tablename__ = "candidates"
    
    id: str = Field(primary_key=True)
    name: str
    email: str
    avatar: Optional[str] = None
    score: int
    title: str
    stage: str
    category: str
    experience: int
    skills_json: str  # JSON list
    education: str
    match_details_json: str  # JSON object
    job_id: str = Field(default="job-1")

def to_db_model(candidate: dict) -> CandidateDB:
    return CandidateDB(
        id=candidate["id"],
        name=candidate["name"],
        email=candidate["email"],
        avatar=candidate.get("avatar"),
        score=candidate["score"],
        title=candidate["title"],
        stage=candidate["stage"],
        category=candidate["category"],
        experience=candidate["experience"],
        skills_json=json.dumps(candidate["skills"]),
        education=candidate["education"],
        match_details_json=json.dumps(candidate["matchDetails"]),
        job_id=candidate.get("job_id", "job-1")
    )

def to_api_model(db_candidate: CandidateDB) -> dict:
    return {
        "id": db_candidate.id,
        "name": db_candidate.name,
        "email": db_candidate.email,
        "avatar": db_candidate.avatar,
        "score": db_candidate.score,
        "title": db_candidate.title,
        "stage": db_candidate.stage,
        "category": db_candidate.category,
        "experience": db_candidate.experience,
        "skills": json.loads(db_candidate.skills_json),
        "education": db_candidate.education,
        "matchDetails": json.loads(db_candidate.match_details_json),
        "job_id": db_candidate.job_id
    }

# Mock JDs seed data
MOCK_JOBS = [
    {
        "id": "job-1",
        "title": "Senior Backend Engineer",
        "summary": "We are seeking an elite Senior Backend Engineer to architect, build, and scale our core SaaS services. You will design distributed systems, microservices, and ensure database performance.",
        "min_experience": 5,
        "education": "Bachelor's in Computer Science",
        "required_skills": ["Node.js", "Go", "PostgreSQL", "Redis", "Kafka"],
        "preferred_skills": ["Docker", "Kubernetes", "GraphQL", "AWS"]
    },
    {
        "id": "job-2",
        "title": "DevOps Engineer",
        "summary": "Join our platform operations team to automate configuration management, container orchestrations, and secure deployment pipelines across global cloud regions.",
        "min_experience": 6,
        "education": "Bachelor's in Computer Science or equivalent",
        "required_skills": ["AWS", "Kubernetes", "Terraform", "CI/CD"],
        "preferred_skills": ["Python", "Golang", "Helm", "Prometheus"]
    },
    {
        "id": "job-3",
        "title": "Product Manager",
        "summary": "We are looking for a data-driven Product Manager to lead roadmap designs, stakeholder communications, and grow core customer conversion metrics.",
        "min_experience": 4,
        "education": "MBA or related technical degree",
        "required_skills": ["Product Strategy", "A/B Testing", "Agile", "Jira"],
        "preferred_skills": ["SQL", "Figma", "Data Analytics"]
    },
    {
        "id": "job-4",
        "title": "UI/UX Designer",
        "summary": "Work closely with engineering teams to design interactive, pixel-perfect modern SaaS application layouts and maintain unified design systems.",
        "min_experience": 3,
        "education": "BFA or related Interaction Design degree",
        "required_skills": ["Figma", "Design Systems", "Prototyping", "User Research"],
        "preferred_skills": ["Tailwind CSS", "HTML/JS", "Framer Motion"]
    }
]

# Mock candidates seed data
MOCK_CANDIDATES = [
    {
      "id": "c1",
      "name": "Alex Rivera",
      "email": "alex.rivera@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      "score": 92,
      "title": "Senior Backend Engineer",
      "stage": "applied",
      "category": "Engineering",
      "experience": 6,
      "skills": ["Node.js", "Go", "PostgreSQL", "Redis", "Kafka"],
      "education": "BS Computer Science",
      "matchDetails": {
        "accuracy": 92,
        "seniorityIndex": 8,
        "gaps": ["Frontend Frameworks", "GraphQL"],
        "strengths": ["Scale architecture", "Distributed caching", "Microservices"],
        "summary": "Exceptional system design skills. Built microservices scaled to 5M daily users. Highly recommended for the core infrastructure team.",
      },
      "job_id": "job-1"
    },
    {
      "id": "c2",
      "name": "Sofia Chen",
      "email": "sofia.c@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704e",
      "score": 88,
      "title": "Fullstack Engineer",
      "stage": "screening",
      "category": "Engineering",
      "experience": 4,
      "skills": ["React", "TypeScript", "Node.js", "Tailwind"],
      "education": "MS Software Engineering",
      "matchDetails": {
        "accuracy": 88,
        "seniorityIndex": 6,
        "gaps": ["Docker deployment", "Kubernetes"],
        "strengths": ["State management", "DB performance tuning", "UI craft"],
        "summary": "Strong UI craft and deep understanding of modern web performance. Needs slight ramp-up on advanced DevOps.",
      },
      "job_id": "job-1"
    },
    {
      "id": "c3",
      "name": "Marcus Vance",
      "email": "mvance@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704f",
      "score": 85,
      "title": "Product Manager",
      "stage": "interview",
      "category": "Product",
      "experience": 5,
      "skills": ["Product Strategy", "A/B Testing", "Agile", "Jira"],
      "education": "MBA",
      "matchDetails": {
        "accuracy": 85,
        "seniorityIndex": 7,
        "gaps": ["SQL query writing", "Technical architecture"],
        "strengths": ["Product roadmap strategy", "A/B testing analytics", "Stakeholder management"],
        "summary": "Proven record of growing user engagement by 40% in a B2B SaaS startup. Excellent product intuition.",
      },
      "job_id": "job-3"
    },
    {
      "id": "c4",
      "name": "Elena Rostova",
      "email": "elena.r@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704a",
      "score": 95,
      "title": "DevOps Engineer",
      "stage": "offer",
      "category": "DevOps",
      "experience": 8,
      "skills": ["AWS", "Kubernetes", "Terraform", "CI/CD"],
      "education": "BS Computer Science",
      "matchDetails": {
        "accuracy": 95,
        "seniorityIndex": 9,
        "gaps": ["Python coding expertise"],
        "strengths": ["Terraform IaC", "CI/CD orchestration", "Zero-downtime migrations"],
        "summary": "Architected zero-downtime migrations of 200+ container instances on AWS. Absolute perfect fit for the platform team.",
      },
      "job_id": "job-2"
    },
    {
      "id": "c5",
      "name": "Jordan Miller",
      "email": "jordan.m@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704b",
      "score": 89,
      "title": "UI/UX Designer",
      "stage": "interview",
      "category": "Design",
      "experience": 4,
      "skills": ["Figma", "Design Systems", "Prototyping", "User Research"],
      "education": "BFA Interaction Design",
      "matchDetails": {
        "accuracy": 89,
        "seniorityIndex": 5,
        "gaps": ["HTML/JS implementation"],
        "strengths": ["Prototyping", "Design system consistency", "User empathy"],
        "summary": "Designed SaaS application dashboards featured in TechCrunch. Highly pixel-perfect execution.",
      },
      "job_id": "job-4"
    },
    {
      "id": "c6",
      "name": "Liam Gallagher",
      "email": "liam.g@example.com",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704c",
      "score": 78,
      "title": "Frontend Developer",
      "stage": "screening",
      "category": "Engineering",
      "experience": 2,
      "skills": ["React", "CSS", "JavaScript"],
      "education": "Bootcamp Graduate",
      "matchDetails": {
        "accuracy": 78,
        "seniorityIndex": 3,
        "gaps": ["GraphQL", "Next.js App Router", "Advanced state management"],
        "strengths": ["Clean markup", "Tailwind CSS"],
        "summary": "Mid-level frontend engineer eager to learn. Good CSS craft but needs strong mentorship in React patterns.",
      },
      "job_id": "job-1"
    }
]

def init_db():
    SQLModel.metadata.create_all(engine)
    
    # Self-healing Schema Migration for existing databases (e.g. Supabase PostgreSQL)
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "candidates" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("candidates")]
            if "job_id" not in columns:
                print("🔧 Schema Migration: Adding 'job_id' column to candidates table...")
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN job_id VARCHAR DEFAULT 'job-1';"))
                print("✅ Schema Migration completed successfully!")
    except Exception as e:
        print(f"⚠️ Schema Migration Failed or Skipped: {e}")

    with Session(engine) as session:
        # 1. Seed JDs
        statement_jds = select(JobDescriptionDB)
        has_jds = session.exec(statement_jds).first()
        if not has_jds:
            print("Seeding database with default mock JDs...")
            for jd in MOCK_JOBS:
                db_jd = JobDescriptionDB(
                    id=jd["id"],
                    title=jd["title"],
                    summary=jd["summary"],
                    min_experience=jd["min_experience"],
                    education=jd["education"],
                    required_skills_json=json.dumps(jd["required_skills"]),
                    preferred_skills_json=json.dumps(jd["preferred_skills"]),
                    posted_by_org="Horizon AI"
                )
                session.add(db_jd)
            session.commit()
            print("Job descriptions seeding completed.")

        # 2. Seed candidates
        statement_cands = select(CandidateDB)
        results = session.exec(statement_cands).first()
        if not results:
            print("Seeding recruitment database with premium mock candidates...")
            for candidate in MOCK_CANDIDATES:
                db_cand = to_db_model(candidate)
                session.add(db_cand)
            session.commit()
            print("Database seeding completed.")
