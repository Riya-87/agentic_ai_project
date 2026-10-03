import logging
from typing import Dict, Any
from app.agents.base import BaseAgent

logger = logging.getLogger("agents.summary")

class SummaryAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Summary Agent",
            role="Student-centric summarization, distilling complex eligibility, prize terms, and deliverables into actionable briefs."
        )

    def generate_summary(self, opportunity: Dict[str, Any]) -> str:
        """
        Generates a concise, high-value, student-friendly 2-3 sentence executive summary.
        """
        title = opportunity.get("title", "")
        org = opportunity.get("organization", "")
        desc = opportunity.get("description", "")
        prize = opportunity.get("stipend_or_prize", "Recognition")
        mode = opportunity.get("mode", "Online")
        deadline = opportunity.get("deadline", "Upcoming")

        prompt = f"""
You are the Summary Agent for university students.
Summarize this academic opportunity into a compelling, crystal-clear 2-3 sentence brief for a busy college student.
Highlight the core benefit, format, and what the student gains.

Opportunity: {title} by {org}
Mode: {mode}
Perks / Prizes / Stipend: {prize}
Deadline: {deadline}
Description:
{desc[:1500]}

Return only the brief text summary (no headers, no markdown formatting).
"""
        fallback_summary = f"{title} hosted by {org} is a premier {mode.lower()} academic opportunity featuring {prize.lower()}. Excellent program to build real-world project impact and boost your profile."
        return self.call_llm_text(prompt=prompt, fallback_text=fallback_summary)
