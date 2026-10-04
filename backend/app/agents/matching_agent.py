import logging
from datetime import datetime
from typing import Dict, Any, List
from app.agents.base import BaseAgent

logger = logging.getLogger("agents.matching")

class StudentMatchingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Student Matching Agent",
            role="Precision alignment and transparent dimensional evaluation between student profiles and opportunity requirements."
        )

    def match_student_opportunity(self, student_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates student profile attributes vs opportunity attributes.
        Returns structured matching breakdown with exact percentages, skill overlaps, and rationale.
        """
        student_skills = [s.strip().lower() for s in student_profile.get("skills", [])]
        student_interests = [i.strip().lower() for i in student_profile.get("interests", [])]
        student_categories = [c.strip().lower() for c in student_profile.get("preferred_categories", [])]
        student_degree = student_profile.get("degree", "Undergraduate")
        student_branch = student_profile.get("branch", "Computer Science")
        student_year = student_profile.get("academic_year", "3rd Year")

        opp_title = opportunity.get("title", "")
        opp_org = opportunity.get("organization", "")
        opp_category = opportunity.get("category", "")
        opp_skills = [s.strip() for s in opportunity.get("required_skills", [])]
        opp_eligibility = opportunity.get("eligibility", "")
        opp_deadline = opportunity.get("deadline")

        # 1. Skills Match (35% Weight)
        matched_skills: List[str] = []
        missing_skills: List[str] = []

        if opp_skills:
            for skill in opp_skills:
                skill_norm = skill.strip().lower()
                if any(skill_norm in s or s in skill_norm for s in student_skills):
                    matched_skills.append(skill)
                else:
                    missing_skills.append(skill)
            skill_score = (len(matched_skills) / len(opp_skills)) * 100.0 if opp_skills else 85.0
        else:
            skill_score = 85.0

        # 2. Education Match (20% Weight)
        opp_elig_lower = opp_eligibility.lower()
        opp_deg_reqs = [d.lower() for d in opportunity.get("degree_requirements", [])]
        opp_year_reqs = [y.lower() for y in opportunity.get("academic_year_requirements", [])]
        
        education_score = 90.0
        if "phd" in opp_elig_lower and "phd" not in student_degree.lower():
            education_score -= 40.0
        elif "master" in opp_elig_lower and ("master" not in student_degree.lower() and "phd" not in student_degree.lower()):
            education_score -= 25.0
        
        # Check academic year
        academic_year_match = 100.0
        if "final year" in opp_elig_lower and "4th" not in student_year.lower() and "graduate" not in student_year.lower():
            academic_year_match = 65.0
            education_score -= 15.0
        elif "1st year" in opp_elig_lower and "1st" not in student_year.lower():
            academic_year_match = 60.0
            education_score -= 20.0
        education_score = max(20.0, min(100.0, education_score))

        # 3. Experience Match (15% Weight)
        student_experience = student_profile.get("experience", [])
        student_projects = student_profile.get("projects", [])
        exp_score = 75.0
        if student_experience and len(student_experience) > 0:
            exp_score += min(25.0, len(student_experience) * 12.0)
        elif student_projects and len(student_projects) > 0:
            exp_score += min(20.0, len(student_projects) * 8.0)
        exp_score = min(100.0, exp_score)

        # 4. Location Match (10% Weight)
        opp_location = (opportunity.get("location") or "Global").lower()
        opp_mode = (opportunity.get("mode") or "Online").lower()
        student_loc = (student_profile.get("preferred_location") or "").lower()
        student_mode = (student_profile.get("mode_preference") or "Any").lower()
        
        location_score = 80.0
        if "online" in opp_mode or "remote" in opp_mode:
            location_score = 100.0
        elif student_mode != "any" and student_mode in opp_mode:
            location_score = 95.0
        elif student_loc and (student_loc in opp_location or opp_location in student_loc or "global" in opp_location):
            location_score = 90.0
        else:
            location_score = 65.0

        # 5. Interest Match (10% Weight)
        opp_text_corpus = f"{opp_title} {opp_org} {opp_category} {opportunity.get('domain', '')} {opportunity.get('description', '')}".lower()
        interest_overlap = sum(1 for interest in student_interests if interest in opp_text_corpus)
        category_match = 100.0 if opp_category.lower() in student_categories else 70.0
        interest_score = min(100.0, (category_match * 0.4) + (min(100.0, 50.0 + (interest_overlap * 20.0)) * 0.6))

        # 6. Eligibility Match & Status (10% Weight)
        eligibility_score = 95.0
        if education_score < 50.0:
            eligibility_status = "not eligible"
            eligibility_score = 30.0
        elif not opp_eligibility or "open to all" in opp_elig_lower:
            eligibility_status = "eligible"
            eligibility_score = 100.0
        elif education_score >= 80.0 and len(missing_skills) <= 1:
            eligibility_status = "eligible"
            eligibility_score = 95.0
        elif education_score >= 65.0:
            eligibility_status = "likely eligible"
            eligibility_score = 80.0
        else:
            eligibility_status = "eligibility unclear"
            eligibility_score = 60.0

        # Overall 6-Factor Weighted Composite Match (Sum of weights: 35 + 20 + 15 + 10 + 10 + 10 = 100%)
        overall_match = round(
            (skill_score * 0.35) +
            (education_score * 0.20) +
            (exp_score * 0.15) +
            (location_score * 0.10) +
            (interest_score * 0.10) +
            (eligibility_score * 0.10),
            1
        )
        overall_match = max(25.0, min(99.0, overall_match))

        # Deadline Urgency Tracking
        urgency_score = 50.0
        if opp_deadline:
            if isinstance(opp_deadline, str):
                try:
                    due_date = datetime.fromisoformat(opp_deadline.replace("Z", "+00:00"))
                except Exception:
                    due_date = datetime.utcnow()
            else:
                due_date = opp_deadline

            days_left = (due_date.replace(tzinfo=None) - datetime.utcnow()).days
            if days_left <= 3:
                urgency_score = 95.0
            elif days_left <= 7:
                urgency_score = 85.0
            elif days_left <= 14:
                urgency_score = 70.0
            else:
                urgency_score = 50.0

        # Structured Match Reasons
        match_reasons = []
        for sk in matched_skills[:3]:
            match_reasons.append({
                "type": "positive",
                "text": f"{sk} is required and present in your profile."
            })

        matched_interests = [i for i in student_profile.get("interests", []) if i.lower() in opp_text_corpus]
        if matched_interests:
            match_reasons.append({
                "type": "positive",
                "text": f"{matched_interests[0]} directly aligns with your verified academic focus."
            })

        match_reasons.append({
            "type": "positive" if eligibility_status == "eligible" else "caution",
            "text": f"Status: {eligibility_status.capitalize()} based on your {student_degree} ({student_year}) enrollment."
        })

        for msk in missing_skills[:2]:
            match_reasons.append({
                "type": "caution",
                "text": f"{msk} is preferred for this position but not yet listed in your skills."
            })

        # Contextualized Explanation
        fallback_explanation = (
            f"{int(overall_match)}% match because your {', '.join(matched_skills[:2]) if matched_skills else student_branch} background "
            f"aligns with the {opp_category} requirements and accepts {student_year} students."
        )

        missing_reqs = ""
        if missing_skills:
            missing_reqs = f"Recommended to prepare: {', '.join(missing_skills[:3])}."

        prompt = f"""
You are the Student Matching Agent.
Provide a concise 2-sentence explanation of why this opportunity matches the student and what makes them competitive.

Student Profile:
- Degree: {student_degree}, Branch: {student_branch}, Year: {student_year}
- Skills: {', '.join(student_profile.get('skills', []))}
- Interests: {', '.join(student_profile.get('interests', []))}

Opportunity:
- Title: {opp_title} ({opp_org})
- Category: {opp_category}
- Required Skills: {', '.join(opp_skills)}
- Matched Skills: {', '.join(matched_skills)}
- Missing Skills: {', '.join(missing_skills)}
- Eligibility Status: {eligibility_status}

Return JSON:
{{
  "explanation": "Concise 1-2 sentence explanation of match relevance and student strength",
  "missing_requirements": "Actionable note on missing skills or requirements to address"
}}
"""
        llm_match = self.call_llm_json(
            prompt=prompt,
            fallback_dict={
                "explanation": fallback_explanation,
                "missing_requirements": missing_reqs
            }
        )

        result_dict = {
            "overall_match": overall_match,
            "skill_match": round(skill_score, 1),
            "education_match": round(education_score, 1),
            "experience_match": round(exp_score, 1),
            "location_match": round(location_score, 1),
            "interest_match": round(interest_score, 1),
            "eligibility_match": round(eligibility_score, 1),
            "eligibility_status": eligibility_status,
            "academic_year_match": round(academic_year_match, 1),
            "deadline_urgency": round(urgency_score, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "match_reasons": match_reasons,
            "explanation": llm_match.get("explanation", fallback_explanation),
            "missing_requirements": llm_match.get("missing_requirements", missing_reqs)
        }
        return result_dict

    def calculate_match(self, student_profile: Dict[str, Any], opportunity: Dict[str, Any]):
        """Helper that returns an object supporting both attribute and key access."""
        res = self.match_student_opportunity(student_profile, opportunity)
        class MatchResultWrapper(dict):
            def __getattr__(self, name):
                if name in self:
                    return self[name]
                raise AttributeError(f"No attribute {name}")
        return MatchResultWrapper(res)

matching_agent = StudentMatchingAgent()

