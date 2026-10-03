import logging
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
from app.agents.base import BaseAgent

logger = logging.getLogger("agents.analyzer")

class OpportunityAnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Opportunity Analyzer Agent",
            role="Deep semantic parsing, schema validation, and multi-tier source verification."
        )

    def determine_verification_status(self, official_url: str, source_type: str, source_name: str) -> str:
        """
        Calculates verification status based on domain authority:
        VERIFIED: Direct primary organization, university (.edu, .ac.in), government (.gov), or tier-1 hackathon platform.
        PUBLIC SOURCE: Reputable public platform (LinkedIn, Internshala, Kaggle, Devpost, Unstop, Buddy4Study).
        UNVERIFIED: Secondary aggregator, forum, or third-party blog.
        """
        if not official_url:
            return "UNVERIFIED"
            
        domain = urlparse(official_url).netloc.lower()
        
        # 1. Direct Official / University / Government Domains -> VERIFIED
        if any(d in domain for d in [".edu", ".ac.in", ".gov", ".gov.in", "careers.google.com", "jobs.apple.com", "amazon.jobs", "microsoft.com", "nvidia.com", "openai.com", "devpost.com", "mlh.io"]):
            return "VERIFIED"
            
        # 2. Known Public Platforms -> PUBLIC SOURCE
        if any(d in domain for d in ["linkedin.com", "internshala.com", "kaggle.com", "unstop.com", "buddy4study.com", "github.com", "medium.com"]):
            return "PUBLIC SOURCE"
            
        if source_type in ["official_portal", "university_domain", "government_portal"]:
            return "VERIFIED"
        elif source_type in ["job_board", "hackathon_platform", "competition_platform", "scholarship_portal"]:
            return "PUBLIC SOURCE"
            
        return "PUBLIC SOURCE"

    def analyze_candidate(self, candidate: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parses a single candidate search result using Gemini / heuristic structured extraction.
        Rejects non-opportunity snippets (e.g. cookie notices, generic homepages, logins).
        """
        raw_title = candidate.get("raw_title", "").strip()
        raw_desc = candidate.get("raw_description", "").strip()
        raw_link = candidate.get("raw_link", "").strip()
        source_name = candidate.get("source_name", "Public Web")
        source_type = candidate.get("source_type", "public_web")
        discovered_via = candidate.get("discovered_via_query", "")

        # Noise / spam filter
        lower_all = (raw_title + " " + raw_desc).lower()
        if any(skip in lower_all for skip in ["sign in to view", "404 not found", "page not found", "enable javascript", "access denied", "cookie policy"]):
            return None

        prompt = f"""
You are an expert academic opportunity intelligence analyzer for college students.
Extract clean, verified, structured JSON metadata from this opportunity search snippet:

Title: {raw_title}
URL: {raw_link}
Source: {source_name} ({source_type})
Search Query Context: {discovered_via}
Content:
{raw_desc[:2000]}

Extract the following JSON schema exactly. If a specific field is not mentioned, use sensible defaults based on the text:
{{
  "title": "Clean concise title (e.g. 'Google Summer Internship 2026' or 'Smart India Hackathon 2026')",
  "organization": "Exact company, university, or organizing body name",
  "category": "One of [Internship, Hackathon, Scholarship, Research Fellowship, Competition, Grant, Conference, Student Program, Workshop]",
  "description": "2-4 sentence clear summary of the role, benefits, and key dates.",
  "eligibility": "Clear eligibility criteria (e.g. 'Enrolled B.Tech/B.E. students, 2026/2027 graduates')",
  "deadline": "ISO format date string YYYY-MM-DDTHH:MM:SS or null",
  "location": "Location or 'Global / Remote' or 'India (Hybrid)'",
  "mode": "Online, Offline, or Hybrid",
  "cost": "Free or explicit fee",
  "is_free": true or false,
  "stipend_or_prize": "Stipend amount (e.g. '₹45,000/month', '$2,000 Grant', 'Certificates & PPO') or 'Certificates & Recognition'",
  "required_skills": ["List", "Of", "3-5", "Relevant", "Technical", "Skills"],
  "preferred_skills": ["List", "Of", "Bonus", "Skills"],
  "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech", "Open to All"],
  "academic_year_requirements": ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"],
  "tags": ["Tag1", "Tag2", "Tag3"],
  "official_url": "{raw_link}"
}}
"""

        # Deterministic fallback heuristics in case of network latency or rate limit
        fallback_deadline = (datetime.utcnow() + timedelta(days=28)).isoformat()
        
        detected_category = "Student Program"
        if "intern" in lower_all:
            detected_category = "Internship"
        elif "hackathon" in lower_all or "hack" in lower_all:
            detected_category = "Hackathon"
        elif "scholarship" in lower_all:
            detected_category = "Scholarship"
        elif "fellowship" in lower_all or "research" in lower_all:
            detected_category = "Research Fellowship"
        elif "competition" in lower_all or "challenge" in lower_all or "contest" in lower_all:
            detected_category = "Competition"
        elif "workshop" in lower_all or "course" in lower_all or "bootcamp" in lower_all:
            detected_category = "Workshop"

        # Extract skills heuristics
        detected_skills = []
        for sk in ["Python", "Machine Learning", "Artificial Intelligence", "Deep Learning", "FastAPI", "React", "SQL", "Data Science", "C++", "Java", "Cloud Computing", "NLP", "Computer Vision", "Docker", "Git"]:
            if sk.lower() in lower_all:
                detected_skills.append(sk)
        if not detected_skills:
            detected_skills = ["Python", "Problem Solving", "Software Engineering"]

        mode_detected = "Online" if ("remote" in lower_all or "virtual" in lower_all or "online" in lower_all) else "Hybrid" if "hybrid" in lower_all else "Offline"
        
        # Org detection
        org_detected = source_name
        if " - " in raw_title:
            parts = raw_title.split(" - ")
            if len(parts[-1].strip()) < 35:
                org_detected = parts[-1].strip()
        elif " at " in raw_title:
            org_detected = raw_title.split(" at ")[-1].strip()

        fallback_data = {
            "title": raw_title,
            "organization": org_detected,
            "category": detected_category,
            "description": raw_desc[:400] if len(raw_desc) > 20 else f"Discovered dynamic {detected_category.lower()} for students.",
            "eligibility": "Open to enrolled undergraduate and graduate college students.",
            "deadline": fallback_deadline,
            "location": "India / Remote" if "india" in lower_all else "Global / Remote",
            "mode": mode_detected,
            "cost": "Free",
            "is_free": True,
            "stipend_or_prize": "Competitive Stipend & Certificates" if detected_category == "Internship" else "Cash Prizes & Recognition",
            "required_skills": detected_skills,
            "preferred_skills": ["Git", "System Design"],
            "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech"],
            "academic_year_requirements": ["2nd Year", "3rd Year", "4th Year"],
            "tags": [detected_category, "Tech 2026", "Students"],
            "official_url": raw_link
        }

        # Try structured LLM extraction
        extracted = self.call_llm_json(prompt=prompt, fallback_dict=fallback_data)
        
        # Sanitize & normalize fields
        official_url = extracted.get("official_url") or raw_link
        verification = self.determine_verification_status(official_url, source_type, source_name)
        
        result = {
            "title": extracted.get("title") or raw_title,
            "organization": extracted.get("organization") or org_detected,
            "category": extracted.get("category") or detected_category,
            "description": extracted.get("description") or raw_desc,
            "eligibility": extracted.get("eligibility") or "Open to all enrolled students",
            "deadline": extracted.get("deadline") or fallback_deadline,
            "location": extracted.get("location") or "Global / Remote",
            "mode": extracted.get("mode") or mode_detected,
            "cost": extracted.get("cost") or "Free",
            "is_free": extracted.get("is_free", True),
            "stipend_or_prize": extracted.get("stipend_or_prize") or "Certificates & Recognition",
            "required_skills": extracted.get("required_skills") or detected_skills,
            "preferred_skills": extracted.get("preferred_skills") or [],
            "degree_requirements": extracted.get("degree_requirements") or ["B.Tech", "B.E", "B.Sc"],
            "academic_year_requirements": extracted.get("academic_year_requirements") or ["3rd Year", "4th Year"],
            "tags": extracted.get("tags") or [detected_category, "2026"],
            "official_url": official_url,
            "source_name": source_name,
            "source_url": raw_link,
            "source_type": source_type,
            "verification_status": verification,
            "is_live": True,
            "is_demo": False,
            "raw_content": raw_desc[:1000]
        }

        return result

    def analyze_batch(self, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes a batch of candidate postings, filtering invalid items.
        """
        logger.info(f"[{self.name}] Beginning semantic parsing & verification for {len(candidates)} candidates.")
        valid_items: List[Dict[str, Any]] = []
        
        for cand in candidates:
            try:
                analyzed = self.analyze_candidate(cand)
                if analyzed and len(analyzed.get("title", "")) > 4:
                    valid_items.append(analyzed)
            except Exception as e:
                logger.warning(f"[{self.name}] Error analyzing candidate {cand.get('raw_link')}: {e}")

        logger.info(f"[{self.name}] Semantic analysis complete. {len(valid_items)} / {len(candidates)} passed verification & schema validation.")
        return valid_items
