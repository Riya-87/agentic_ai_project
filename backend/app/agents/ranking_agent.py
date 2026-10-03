import logging
from typing import List, Dict, Any
from app.agents.base import BaseAgent

logger = logging.getLogger("agents.ranking")

class RankingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Ranking Agent",
            role="Multi-criteria optimization and dynamic prioritization of opportunities for optimal student attention allocation."
        )

    def rank_opportunities(self, opportunities_with_matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Computes composite rank score:
        rank_score = (overall_match * 0.55) + (skill_match * 0.20) + (deadline_urgency * 0.15) + (interest_match * 0.10)
        Sorts descending by rank_score.
        """
        for item in opportunities_with_matches:
            match_data = item.get("match", {})
            overall = match_data.get("overall_match", 50.0)
            skill = match_data.get("skill_match", 50.0)
            urgency = match_data.get("deadline_urgency", 50.0)
            interest = match_data.get("interest_match", 50.0)

            # Boost if opportunity is marked saved
            saved_bonus = 5.0 if item.get("is_saved", False) else 0.0

            rank_score = round(
                (overall * 0.50) +
                (skill * 0.20) +
                (urgency * 0.15) +
                (interest * 0.15) +
                saved_bonus,
                2
            )
            item["rank_score"] = rank_score
            if "match" in item and isinstance(item["match"], dict):
                item["match"]["rank_score"] = rank_score

        # Sort descending by rank_score
        opportunities_with_matches.sort(key=lambda x: x.get("rank_score", 0.0), reverse=True)
        return opportunities_with_matches
