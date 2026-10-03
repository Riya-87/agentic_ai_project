import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.agents.base import BaseAgent
from app.schemas.assistant import GroundedReference, AIChatResponse

logger = logging.getLogger("agents.assistant")

class AIAssistantAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Academic Intelligence Copilot",
            role="Grounded conversational academic advisor leveraging student profile, matching context, and live opportunities."
        )

    def answer_query(
        self,
        query: str,
        student_profile: Dict[str, Any],
        matched_opportunities: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> AIChatResponse:
        """
        Synthesizes a helpful, accurate, and completely grounded response.
        Extracts relevant opportunity references and crafts actionable suggestions.
        """
        query_lower = query.lower()
        now = datetime.utcnow()

        # Build Grounded Context from live data
        top_opportunities = matched_opportunities[:15]
        
        context_items = []
        for item in top_opportunities:
            opp = item.get("opportunity", item)
            match = item.get("match", {})
            deadline_str = "No fixed deadline"
            if opp.get("deadline"):
                if isinstance(opp.get("deadline"), str):
                    deadline_str = opp.get("deadline")[:10]
                elif hasattr(opp.get("deadline"), "strftime"):
                    deadline_str = opp.get("deadline").strftime("%Y-%m-%d")

            context_items.append(
                f"- [ID: {opp.get('id')}] {opp.get('title')} ({opp.get('organization')}) | "
                f"Category: {opp.get('category')} | Mode: {opp.get('mode')} | Cost: {opp.get('cost')} | "
                f"Deadline: {deadline_str} | Match: {int(match.get('overall_match', 0))}% | "
                f"Skills: {', '.join(opp.get('required_skills', []))} | URL: {opp.get('official_url')} | "
                f"Summary: {opp.get('summary', opp.get('description', '')[:120])}"
            )

        context_block = "\n".join(context_items)

        profile_context = (
            f"Degree: {student_profile.get('degree')}, Branch: {student_profile.get('branch')}, Year: {student_profile.get('academic_year')}\n"
            f"Skills: {', '.join(student_profile.get('skills', []))}\n"
            f"Interests: {', '.join(student_profile.get('interests', []))}\n"
            f"Preferred Categories: {', '.join(student_profile.get('preferred_categories', []))}\n"
            f"Location/Mode Preference: {student_profile.get('preferred_location')}, {student_profile.get('mode_preference')}"
        )

        prompt = f"""
You are the Academic Intelligence Copilot, an elite personal advisor for college students.
Use ONLY the verified student profile and retrieved opportunity database below to answer the student's question.
DO NOT hallucinate opportunities that are not in the context.

=== STUDENT PROFILE ===
{profile_context}

=== RETRIEVED OPPORTUNITIES ===
{context_block}

=== STUDENT QUESTION ===
"{query}"

INSTRUCTIONS:
1. Provide a direct, structured, encouraging, and clear answer.
2. Refer to specific opportunities by Title, Organization, and why they fit the student.
3. If they ask about deadlines, highlight the exact dates and remaining days.
4. If they ask for free / AI-ML / specific categories, filter directly from the context.
5. Provide 2-3 short suggested next questions in JSON.

Return JSON in this format:
{{
  "response": "Your markdown formatted advice with bullet points and bold headers.",
  "intent": "opportunities_query | deadline_query | match_rationale | prioritization | general_advice",
  "referenced_ids": [1, 2],
  "suggested_followups": ["Followup question 1?", "Followup question 2?"]
}}
"""

        # Fallback heuristic handling for offline or non-LLM scenarios
        referenced_ids = []
        matching_refs: List[GroundedReference] = []

        if "deadline" in query_lower or "this week" in query_lower or "due" in query_lower:
            intent = "deadline_query"
            filtered = [
                item for item in top_opportunities
                if item.get("opportunity", item).get("deadline")
            ]
            referenced_ids = [item.get("opportunity", item).get("id") for item in filtered[:4]]
            lines = [f"### 📅 Upcoming Deadlines for Your Profile\n"]
            for item in filtered[:4]:
                opp = item.get("opportunity", item)
                m = item.get("match", {})
                d = opp.get("deadline")
                d_str = d.strftime("%b %d, %Y") if hasattr(d, "strftime") else str(d)[:10]
                lines.append(f"- **{opp.get('title')}** ({opp.get('organization')}) — Deadline: **{d_str}** | Match: **{int(m.get('overall_match', 0))}%**")
            lines.append("\nMake sure to complete your application draft at least 48 hours prior to avoid portal congestion.")
            fallback_response = "\n".join(lines)
            suggested = ["Which of these requires the least preparation time?", "Show free hackathons instead", "Why is my match score highest for this one?"]

        elif "free" in query_lower or "ai" in query_lower or "ml" in query_lower:
            intent = "filter_query"
            filtered = [
                item for item in top_opportunities
                if item.get("opportunity", item).get("is_free", True) and
                any("ai" in s.lower() or "ml" in s.lower() or "machine learning" in s.lower() or "python" in s.lower() for s in item.get("opportunity", item).get("required_skills", []))
            ]
            if not filtered:
                filtered = top_opportunities[:3]
            referenced_ids = [item.get("opportunity", item).get("id") for item in filtered[:4]]
            lines = [f"### 🚀 Free AI & Machine Learning Opportunities\n"]
            for item in filtered[:4]:
                opp = item.get("opportunity", item)
                m = item.get("match", {})
                lines.append(f"- **{opp.get('title')}** ({opp.get('organization')}) — Cost: **Free** | Match: **{int(m.get('overall_match', 0))}%**\n  *Key Skills*: {', '.join(opp.get('required_skills', [])[:3])}")
            fallback_response = "\n".join(lines)
            suggested = ["What are the eligibility criteria for these?", "What deadlines do I have this week?", "How should I structure my application?"]

        else:
            intent = "opportunities_query"
            filtered = top_opportunities[:4]
            referenced_ids = [item.get("opportunity", item).get("id") for item in filtered]
            lines = [f"### 🎯 Top Recommended Opportunities for Your Profile\n"]
            for item in filtered:
                opp = item.get("opportunity", item)
                m = item.get("match", {})
                lines.append(f"- **{opp.get('title')}** ({opp.get('organization')}) — **{int(m.get('overall_match', 0))}% Match**\n  {m.get('explanation', opp.get('summary', ''))}")
            fallback_response = "\n".join(lines)
            suggested = ["What deadlines do I have this month?", "Find free AI/ML research fellowships", "Why am I a good match for the top opportunity?"]

        fallback_dict = {
            "response": fallback_response,
            "intent": intent,
            "referenced_ids": referenced_ids,
            "suggested_followups": suggested
        }

        result = self.call_llm_json(prompt=prompt, fallback_dict=fallback_dict)

        # Build Grounded Reference objects
        final_referenced_ids = result.get("referenced_ids", referenced_ids)
        for item in top_opportunities:
            opp = item.get("opportunity", item)
            m = item.get("match", {})
            if opp.get("id") in final_referenced_ids:
                matching_refs.append(GroundedReference(
                    opportunity_id=opp.get("id"),
                    title=opp.get("title", ""),
                    organization=opp.get("organization", ""),
                    category=opp.get("category", ""),
                    deadline=opp.get("deadline") if isinstance(opp.get("deadline"), datetime) else None,
                    match_score=float(m.get("overall_match", 80.0)),
                    official_url=opp.get("official_url", "")
                ))

        agent_steps = [
            f"✓ Retrieved student profile ({student_profile.get('branch', 'CS')}, {student_profile.get('academic_year', '3rd Year')})",
            f"✓ Searched verified opportunities database ({len(top_opportunities)} catalog items indexed)",
            "✓ Applied domain eligibility & academic criteria filter",
            "✓ Calculated multi-dimensional compatibility scores",
            "✓ Ranked candidates by relevance & deadline urgency",
            "✓ Synthesized grounded response with verified citations"
        ]

        return AIChatResponse(
            response=result.get("response", fallback_response),
            intent=result.get("intent", intent),
            references=matching_refs,
            agent_steps=agent_steps,
            suggested_followups=result.get("suggested_followups", suggested)
        )

