import io
import re
import logging
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
from app.agents.base import BaseAgent
from app.models.profile import StudentProfile
from app.agents.orchestrator import orchestrator
from sqlalchemy.orm import Session

logger = logging.getLogger("services.resume")

class ResumeService(BaseAgent):
    def __init__(self):
        super().__init__(name="ResumeService", role="Resume & CV Information Extraction Specialist")

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """
        Extracts clean plain text from a raw PDF byte stream using pypdf.
        """
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted.strip())
            full_text = "\n\n".join(text_parts).strip()
            if not full_text:
                raise ValueError("No extractable text found in PDF. The document may be scanned or empty.")
            return full_text
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise

    def parse_resume_content(self, text: str) -> Dict[str, Any]:
        """
        Invokes LLM (Groq / Gemini) to extract structured academic and career attributes from resume text.
        Falls back to resilient regex/heuristic parsing if LLM is unavailable.
        """
        prompt = f"""You are an expert technical resume parser and career intelligence assistant.
Analyze the following student/developer resume and extract the structured attributes into the exact JSON format specified below.

RESUME CONTENT:
\"\"\"
{text[:4500]}
\"\"\"

Return ONLY valid JSON with this exact schema:
{{
  "degree": "e.g. Bachelor of Technology or Bachelor of Science",
  "branch": "e.g. Computer Science & Engineering",
  "academic_year": "e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, or Graduate",
  "college": "e.g. University Name",
  "graduation_year": 2026,
  "gpa": "e.g. 8.8 / 10.0 or 3.8 / 4.0",
  "skills": ["List", "of", "technical", "skills", "tools", "languages"],
  "interests": ["List", "of", "domain", "interests", "like AI, Cloud, Robotics"],
  "preferred_categories": ["Internship", "Hackathon", "Research Fellowship", "Scholarship"],
  "preferred_location": "e.g. Remote or City",
  "career_goals": "Target career role or aspiration summary",
  "bio": "2-3 sentence professional summary",
  "resume_summary": "Concise 3-4 sentence highlight of key strengths, projects, and achievements",
  "projects": [
    {{"title": "Project Name", "description": "Brief description of the work and impact", "skills": ["Skill1", "Skill2"]}}
  ],
  "experience": [
    {{"role": "Title", "organization": "Company or Lab", "duration": "Dates or duration", "description": "Key responsibilities"}}
  ],
  "certifications": ["Certification name 1", "Certification name 2"]
}}
"""
        fallback_data = self._heuristic_fallback_parse(text)
        try:
            parsed = self.call_llm_json(prompt, fallback_dict=fallback_data)
            # Ensure mandatory fields have safe defaults
            if not parsed or not isinstance(parsed, dict):
                parsed = fallback_data

            # Merge with fallback to ensure nothing is None or missing
            for key, val in fallback_data.items():
                if key not in parsed or not parsed[key]:
                    parsed[key] = val

            return parsed
        except Exception as e:
            logger.warning(f"Resume LLM extraction failed: {e}. Using heuristic fallback.")
            return fallback_data

    def _heuristic_fallback_parse(self, text: str) -> Dict[str, Any]:
        """Resilient rule-based extractor if LLM is unavailable."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Detect common skills
        common_skills = [
            "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
            "SQL", "PostgreSQL", "MongoDB", "FastAPI", "Flask", "Django", "Docker", "Kubernetes",
            "AWS", "GCP", "Azure", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow",
            "NLP", "Computer Vision", "Git", "GitHub", "Linux", "REST APIs", "Tailwind CSS", "Data Structures"
        ]
        found_skills = []
        for sk in common_skills:
            if re.search(r'\b' + re.escape(sk) + r'\b', text, re.IGNORECASE):
                found_skills.append(sk)
        if not found_skills:
            found_skills = ["Python", "JavaScript", "Git", "Data Structures"]

        # Detect graduation year
        grad_year = 2026
        year_match = re.search(r'\b(202[4-9]|2030)\b', text)
        if year_match:
            grad_year = int(year_match.group(1))

        # Detect degree
        degree = "Bachelor of Technology"
        if re.search(r'\b(B\.?S\.?|B\.?Sc|Bachelor of Science)\b', text, re.IGNORECASE):
            degree = "Bachelor of Science"
        elif re.search(r'\b(M\.?S\.?|Master|M\.?Tech)\b', text, re.IGNORECASE):
            degree = "Master of Science"
        elif re.search(r'\b(Ph\.?D|Doctorate)\b', text, re.IGNORECASE):
            degree = "Ph.D."

        # Detect branch
        branch = "Computer Science & Engineering"
        if re.search(r'\b(Data Science|AI|Artificial Intelligence)\b', text, re.IGNORECASE):
            branch = "Computer Science (AI & Data Science)"
        elif re.search(r'\b(Electrical|ECE|Electronics)\b', text, re.IGNORECASE):
            branch = "Electrical & Computer Engineering"
        elif re.search(r'\b(Mechanical)\b', text, re.IGNORECASE):
            branch = "Mechanical Engineering"

        # Detect GPA
        gpa = "8.5 / 10.0"
        gpa_match = re.search(r'\b(GPA|CGPA|Grade)[\s:]*([0-9]\.[0-9]{1,2}(?:\s*/\s*(?:4\.0|10\.0|10))?)\b', text, re.IGNORECASE)
        if gpa_match:
            gpa = gpa_match.group(2)

        # Detect projects / experience snippets
        projects = []
        project_matches = re.findall(r'(?:Project|System|Application|Engine|Agent|Tool):\s*([^\n]+)', text, re.IGNORECASE)
        for pm in project_matches[:3]:
            projects.append({"title": pm.strip(), "description": "Extracted project from resume", "skills": found_skills[:3]})

        if not projects:
            projects = [{"title": "Software Engineering Project", "description": "Full-stack and AI development project", "skills": found_skills[:3]}]

        bio = lines[0] if lines else "Passionate computer science student"
        if len(bio) < 20 and len(lines) > 1:
            bio = f"{lines[0]} - {lines[1]}"

        return {
            "degree": degree,
            "branch": branch,
            "academic_year": "3rd Year",
            "college": "University",
            "graduation_year": grad_year,
            "gpa": gpa,
            "skills": found_skills[:12],
            "interests": ["Generative AI", "Software Engineering", "Open Source", "Machine Learning"],
            "preferred_categories": ["Internship", "Hackathon", "Research Fellowship", "Scholarship"],
            "preferred_location": "Global / Remote",
            "career_goals": "Software Engineer & AI Researcher",
            "bio": bio[:300],
            "resume_summary": f"Demonstrated background with technical proficiency in {', '.join(found_skills[:5])}.",
            "projects": projects,
            "experience": [],
            "certifications": []
        }

    def apply_parsed_to_profile(self, db: Session, user_id: int, parsed_data: Dict[str, Any], filename: Optional[str] = None, raw_text: Optional[str] = None) -> StudentProfile:
        """
        Updates the StudentProfile record with parsed resume attributes and triggers 6-factor re-matching.
        """
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            profile = StudentProfile(user_id=user_id)
            db.add(profile)

        # Apply extracted fields
        for field in [
            "degree", "branch", "academic_year", "college", "graduation_year",
            "gpa", "career_goals", "bio", "resume_summary"
        ]:
            if field in parsed_data and parsed_data[field]:
                setattr(profile, field, parsed_data[field])

        # Merge or set array attributes
        if "skills" in parsed_data and parsed_data["skills"]:
            existing = set(profile.skills or [])
            merged = list(existing.union(set(parsed_data["skills"])))
            profile.skills = merged

        if "interests" in parsed_data and parsed_data["interests"]:
            existing = set(profile.interests or [])
            merged = list(existing.union(set(parsed_data["interests"])))
            profile.interests = merged

        if "preferred_categories" in parsed_data and parsed_data["preferred_categories"]:
            profile.preferred_categories = parsed_data["preferred_categories"]

        if "projects" in parsed_data and parsed_data["projects"]:
            profile.projects = parsed_data["projects"]

        if "experience" in parsed_data and parsed_data["experience"]:
            profile.experience = parsed_data["experience"]

        if "certifications" in parsed_data and parsed_data["certifications"]:
            profile.certifications = parsed_data["certifications"]

        if filename:
            profile.resume_filename = filename

        if raw_text:
            profile.resume_text = raw_text[:20000]

        # Calculate updated profile strength
        from app.api.v1.profile import calculate_profile_strength
        strength_info = calculate_profile_strength(profile)
        profile.profile_strength = strength_info.score

        db.commit()
        db.refresh(profile)

        # Trigger 6-Factor Re-matching
        try:
            orchestrator.match_single_student(db, user_id)
        except Exception as e:
            logger.warning(f"Failed to re-match after resume update: {e}")

        return profile

resume_service = ResumeService()
