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

        # 1. Calculate Skill Match
        matched_skills: List[str] = []
        missing_skills: List[str] = []

        if opp_skills:
            for skill in opp_skills:
                skill_norm = skill.strip().lower()
                # Check direct or substring match
                if any(skill_norm in s or s in skill_norm for s in student_skills):
                    matched_skills.append(skill)
                else:
                    missing_skills.append(skill)
            skill_score = (len(matched_skills) / len(opp_skills)) * 100.0 if opp_skills else 85.0
        else:
            skill_score = 85.0

        # 2. Calculate Interest & Category Match
        category_match = 100.0 if opp_category.lower() in student_categories else 60.0
        interest_overlap = 0
        opp_text_corpus = f"{opp_title} {opp_org} {opp_category} {opportunity.get('description', '')}".lower()
        for interest in student_interests:
            if interest in opp_text_corpus:
                interest_overlap += 1
        interest_score = min(100.0, 50.0 + (interest_overlap * 20.0))
        combined_interest_match = (category_match * 0.5) + (interest_score * 0.5)

        # 3. Calculate Eligibility Match
        eligibility_score = 95.0
        opp_elig_lower = opp_eligibility.lower()
        if "phd" in opp_elig_lower and "phd" not in student_degree.lower():
            eligibility_score -= 30.0
        if "master" in opp_elig_lower and ("master" not in student_degree.lower() and "phd" not in student_degree.lower()):
            eligibility_score -= 20.0
        eligibility_score = max(40.0, min(100.0, eligibility_score))

        # 4. Calculate Academic Year Match
        academic_year_match = 100.0
        if "final year" in opp_elig_lower and "4th" not in student_year.lower() and "graduate" not in student_year.lower():
            academic_year_match = 70.0
        elif "1st year" in opp_elig_lower and "1st" not in student_year.lower():
            academic_year_match = 60.0

        # 5. Calculate Deadline Urgency
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

        # 6. Overall Weighted Composite Match
        overall_match = round(
            (skill_score * 0.35) +
            (eligibility_score * 0.20) +
            (combined_interest_match * 0.20) +
            (academic_year_match * 0.15) +
            (urgency_score * 0.10),
            1
        )
        overall_match = max(15.0, min(99.0, overall_match))

        # 7. Generate Structured Match Reasons
        match_reasons = []
        for sk in matched_skills[:2]:
            match_reasons.append({
                "type": "positive",
                "text": f"{sk} is required and present in your profile."
            })

        matched_interests = [i for i in student_profile.get("interests", []) if i.lower() in opp_text_corpus]
        if matched_interests:
            match_reasons.append({
                "type": "positive",
                "text": f"{matched_interests[0]} is directly relevant to your academic interests."
            })
        else:
            match_reasons.append({
                "type": "positive",
                "text": f"Aligned with your {student_branch} curriculum focus."
            })

        match_reasons.append({
            "type": "positive" if academic_year_match >= 80 else "caution",
            "text": f"Your academic year ({student_year}) satisfies the candidate criteria." if academic_year_match >= 80 else f"Eligibility targets other academic years but accepts exceptional candidates."
        })

        for msk in missing_skills[:2]:
            match_reasons.append({
                "type": "caution",
                "text": f"{msk} is preferred/required but not currently listed in your skills."
            })

        # 8. Generate Contextualized Explanation via LLM or Heuristic
        fallback_explanation = (
            f"Your {', '.join(matched_skills[:2]) if matched_skills else 'core'} skills directly match {opp_title}. "
            f"Your academic year ({student_year}) and {student_branch} background satisfy the criteria."
        )

        missing_reqs = ""
        if missing_skills:
            missing_reqs = f"Recommended to prepare: {', '.join(missing_skills[:3])}."

        prompt = f"""
You are the Student Matching Agent.
Provide a concise 2-sentence explanation of why this opportunity matches the student and what makes them competitive.

Student:
- Degree: {student_degree}, Branch: {student_branch}, Year: {student_year}
- Skills: {', '.join(student_profile.get('skills', []))}
- Interests: {', '.join(student_profile.get('interests', []))}

Opportunity:
- Title: {opp_title} ({opp_org})
- Category: {opp_category}
- Required Skills: {', '.join(opp_skills)}
- Matched Skills: {', '.join(matched_skills)}
- Missing Skills: {', '.join(missing_skills)}

Return JSON:
{{
  "explanation": "Clear, encouraging explanation of match relevance and student strength",
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

        return {
            "overall_match": overall_match,
            "skill_match": round(skill_score, 1),
            "eligibility_match": round(eligibility_score, 1),
            "interest_match": round(combined_interest_match, 1),
            "academic_year_match": round(academic_year_match, 1),
            "deadline_urgency": round(urgency_score, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "match_reasons": match_reasons,
            "explanation": llm_match.get("explanation", fallback_explanation),
            "missing_requirements": llm_match.get("missing_requirements", missing_reqs)
        }

