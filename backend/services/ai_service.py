import os
import json
from google import generativeai as genai
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        
        # Configure Google Gemini
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            
        # Configure Groq
        if self.groq_key:
            self.groq_client = Groq(api_key=self.groq_key)
        else:
            self.groq_client = None

    def get_available_providers(self):
        return {
            "gemini": self.gemini_key is not None and len(self.gemini_key.strip()) > 0,
            "groq": self.groq_key is not None and len(self.groq_key.strip()) > 0
        }

    async def generate_response(self, prompt: str, system_instruction: str = None, provider: str = "gemini", model_name: str = None) -> str:
        provider = provider.lower()
        
        if provider == "gemini":
            if not self.gemini_key:
                raise ValueError("Google Gemini API key is missing. Set GEMINI_API_KEY in your environment.")
            
            selected_model = model_name or "gemini-2.5-flash"
            
            # Create generative model configuration
            model = genai.GenerativeModel(
                model_name=selected_model,
                system_instruction=system_instruction
            )
            
            # Send completion
            response = model.generate_content(prompt)
            return response.text
            
        elif provider == "groq":
            if not self.groq_client:
                raise ValueError("Groq API key is missing. Set GROQ_API_KEY in your environment.")
            
            selected_model = model_name or "llama-3.3-70b-versatile"
            
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            # Send completion
            response = self.groq_client.chat.completions.create(
                model=selected_model,
                messages=messages
            )
            return response.choices[0].message.content
        else:
            raise ValueError(f"Unsupported AI provider option: {provider}")

    async def parse_resume(self, resume_text: str, provider: str = "gemini", model_name: str = None) -> dict:
        system_instruction = """
You are an expert talent acquisition AI. Your job is to parse a candidate's resume text and structure it into a perfect, valid JSON object.
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Respond with ONLY valid JSON.

JSON schema:
{
  "name": "Candidate's Full Name",
  "email": "Candidate's Email Address (or 'unknown@example.com' if not found)",
  "score": 85, // Integer match score from 0 to 100 based on standard tech resume caliber
  "title": "Clean professional job title (e.g. Senior Software Engineer)",
  "category": "One of: Engineering, Product, Design, DevOps",
  "experience": 5, // Integer number of years of experience
  "skills": ["Skill1", "Skill2", ...], // List of technical/professional skills found
  "education": "Highest degree or education level found",
  "matchDetails": {
    "accuracy": 85, // Match accuracy percentage matching the score
    "seniorityIndex": 6, // Seniority index out of 10
    "gaps": ["Skill gap 1", "Slight experience gap", ...], // Areas of missing competencies or lower depth
    "strengths": ["Strong system design", "Proven leadership", ...], // Key highlight strengths
    "summary": "A cohesive, professional 2-3 sentence AI synapse summary on why the candidate fits or is unique."
  }
}
"""
        prompt = f"Please parse this resume text and respond with ONLY the structured JSON object:\n\n{resume_text}"
        
        response_text = await self.generate_response(
            prompt=prompt,
            system_instruction=system_instruction,
            provider=provider,
            model_name=model_name
        )
        
        # Clean response text from backticks or leading/trailing markdown blocks
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```"):
            # strip leading ```json or ```
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()
            
        try:
            parsed_json = json.loads(cleaned_text)
            return parsed_json
        except Exception as e:
            # Fallback mock in case LLM response is corrupt
            print(f"Failed to parse AI response as JSON: {e}. Raw response: {response_text}")
            raise ValueError("AI structured parsing failed to generate valid JSON.")

    async def parse_and_match_resume(self, resume_text: str, jd: dict, provider: str = "gemini", model_name: str = None) -> dict:
        system_instruction = """
You are an expert talent acquisition AI. Your job is to parse a candidate's resume text and score/match it directly against the provided Job Description criteria.
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Respond with ONLY valid JSON.

JSON schema:
{
  "name": "Candidate's Full Name (extract from resume or use email name if not found)",
  "email": "Candidate's Email Address",
  "score": 85, // Integer match score from 0 to 100 based strictly on match accuracy with the Job Description requirements
  "title": "Clean professional job title from resume",
  "category": "One of: Engineering, Product, Design, DevOps",
  "experience": 5, // Integer number of years of experience
  "skills": ["Skill1", "Skill2", ...], // List of technical/professional skills found in resume
  "education": "Highest degree or education level found",
  "matchDetails": {
    "accuracy": 85, // Match score from 0 to 100 benchmarked against the Job Description
    "seniorityIndex": 6, // Seniority index out of 10
    "gaps": ["Missing skill 1", "Experience is less than minimum", ...], // Gaps between candidate skills and the JD's required/preferred skills
    "strengths": ["Strong match with required PostgreSQL", "Has preferred Kubernetes experience", ...], // Strengths matching the JD criteria
    "summary": "A cohesive, professional 2-3 sentence AI synapse summary explaining exactly how well this candidate matches the specific job description."
  }
}
"""
        prompt = f"""
Target Job Description:
- Title: {jd['title']}
- Summary: {jd['summary']}
- Minimum Experience Required: {jd['min_experience']} years
- Target Education: {jd['education']}
- Required Skills: {", ".join(jd['required_skills'])}
- Preferred Skills: {", ".join(jd['preferred_skills'])}

Candidate Resume Text:
{resume_text}

Please parse this resume and evaluate its match against the Job Description. Respond with ONLY the structured JSON object:
"""
        response_text = await self.generate_response(
            prompt=prompt,
            system_instruction=system_instruction,
            provider=provider,
            model_name=model_name
        )
        
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()
            
        try:
            parsed_json = json.loads(cleaned_text)
            return parsed_json
        except Exception as e:
            print(f"Failed to parse AI matching response as JSON: {e}. Raw response: {response_text}")
            raise ValueError("AI structured matching failed to generate valid JSON.")

    async def parse_jd(self, jd_text: str, provider: str = "gemini", model_name: str = None) -> dict:
        system_instruction = """
You are an expert talent acquisition AI. Your job is to parse a raw job description (JD) and extract structural attributes into a perfect, valid JSON object.
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Respond with ONLY valid JSON.

JSON schema:
{
  "title": "Normalized professional job title (e.g. Senior Software Engineer)",
  "summary": "A high-quality 2-3 sentence AI synapse summary of the role, responsibilities, and requirements.",
  "min_experience": 5, // Integer representation of minimum years of experience required (default to 0 if not stated)
  "education": "Minimum education level required (e.g., BS in Computer Science, MS, PhD, or 'None')",
  "required_skills": ["Skill1", "Skill2", ...], // List of core, mandatory, or highly emphasized technical skills
  "preferred_skills": ["SkillA", "SkillB", ...] // List of nice-to-have, secondary, or preferred technical/professional skills
}
"""
        prompt = f"Please parse this job description and respond with ONLY the structured JSON object:\n\n{jd_text}"
        
        response_text = await self.generate_response(
            prompt=prompt,
            system_instruction=system_instruction,
            provider=provider,
            model_name=model_name
        )
        
        # Clean response text from backticks or leading/trailing markdown blocks
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()
            
        try:
            parsed_json = json.loads(cleaned_text)
            return parsed_json
        except Exception as e:
            print(f"Failed to parse AI JD response as JSON: {e}. Raw response: {response_text}")
            raise ValueError("AI JD parsing failed to generate valid JSON.")

    async def compare_candidates(self, candidates_data: list[dict], target_role: str = "General Software Engineer", parsed_jd: dict = None, provider: str = "gemini", model_name: str = None) -> dict:
        if parsed_jd:
            title = parsed_jd.get("title", target_role)
            req_skills = ", ".join(parsed_jd.get("required_skills", []))
            pref_skills = ", ".join(parsed_jd.get("preferred_skills", []))
            min_exp = parsed_jd.get("min_experience", 0)
            
            system_instruction = f"""
You are an elite Staffing AI Director. You are given an array of candidate profiles.
Your task is to analytically compare them against each other and determine the absolute best candidate specifically for the parsed job description:
- Role Title: {title}
- Required Skills: {req_skills}
- Preferred Skills: {pref_skills}
- Minimum Experience: {min_exp} Years

Return your comparative synthesis strictly as a valid JSON object matching this schema exactly:
{{
  "recommended_winner_id": "Candidate ID of the best fit",
  "comparative_summary": "A cohesive 3-4 sentence analytical synthesis explaining why the winner is the strongest choice for this specific Job Description, comparing their technical skill coverage and years of experience to the others.",
  "candidate_analysis": [
    {{
      "id": "Candidate ID",
      "name": "Candidate Name",
      "relative_strengths": ["Strength 1 compared to others regarding the requirements", "Strength 2"],
      "relative_gaps": ["Gap 1 compared to others regarding the requirements", "Gap 2"]
    }}
  ]
}}
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Respond with ONLY valid JSON.
"""
            prompt = f"Please analyze and compare these candidates specifically for the structured Job Description of '{title}', then output the strictly structured JSON synthesis:\n\n{prompt_payload}" if 'prompt_payload' in locals() else ""
        else:
            system_instruction = f"""
You are an elite Staffing AI Director. You are given an array of candidate profiles.
Your task is to analytically compare them against each other and determine the absolute best candidate specifically for the role of "{target_role}".
Return your comparative synthesis strictly as a valid JSON object matching this schema exactly:
{{
  "recommended_winner_id": "Candidate ID of the best fit",
  "comparative_summary": "A cohesive 3-4 sentence analytical synthesis explaining why the winner is the strongest choice for the role of {target_role}, comparing their specific strengths to the others.",
  "candidate_analysis": [
    {{
      "id": "Candidate ID",
      "name": "Candidate Name",
      "relative_strengths": ["Strength 1 compared to others regarding the {target_role} role", "Strength 2"],
      "relative_gaps": ["Gap 1 compared to others regarding the {target_role} role", "Gap 2"]
    }}
  ]
}}
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Respond with ONLY valid JSON.
"""
        
        # Serialize candidates for the prompt
        prompt_payload = json.dumps(candidates_data, indent=2)
        if parsed_jd:
            title = parsed_jd.get("title", target_role)
            prompt = f"Please analyze and compare these candidates specifically for the structured Job Description of '{title}', then output the strictly structured JSON synthesis:\n\n{prompt_payload}"
        else:
            prompt = f"Please analyze and compare these candidates specifically for the role of '{target_role}', then output the strictly structured JSON synthesis:\n\n{prompt_payload}"
        
        response_text = await self.generate_response(
            prompt=prompt,
            system_instruction=system_instruction,
            provider=provider,
            model_name=model_name
        )
        
        # Clean response text from backticks or leading/trailing markdown blocks
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()
            
        try:
            parsed_json = json.loads(cleaned_text)
            return parsed_json
        except Exception as e:
            print(f"Failed to parse AI Compare response as JSON: {e}. Raw response: {response_text}")
            raise ValueError("AI Comparison parsing failed to generate valid JSON.")

# Singleton Instance
ai_service = AIService()
