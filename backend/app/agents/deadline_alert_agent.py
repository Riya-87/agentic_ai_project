import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.agents.base import BaseAgent

logger = logging.getLogger("agents.alert")

class DeadlineAlertAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Deadline & Alert Agent",
            role="Temporal urgency monitoring, deadline triage, and proactive push alert generation for students."
        )

    def evaluate_deadlines_and_alerts(
        self,
        student_user_id: int,
        ranked_matches: List[Dict[str, Any]],
        saved_opportunity_ids: List[int]
    ) -> List[Dict[str, Any]]:
        """
        Inspects opportunities and deadlines. Generates prioritized notifications:
        - Critical deadline alerts (<3 days)
        - Approaching deadline alerts (<7 days)
        - High-match opportunity discovery alerts (>85% match)
        """
        generated_alerts: List[Dict[str, Any]] = []
        now = datetime.utcnow()

        for item in ranked_matches:
            opp = item.get("opportunity", item)
            match_data = item.get("match", {})
            opp_id = opp.get("id")
            title = opp.get("title", "")
            org = opp.get("organization", "")
            deadline = opp.get("deadline")
            overall_match = match_data.get("overall_match", 0)

            # 1. High-Match Opportunity Alert
            if overall_match >= 88.0:
                generated_alerts.append({
                    "user_id": student_user_id,
                    "title": f"🔥 Exceptional Match ({int(overall_match)}%): {title}",
                    "message": f"{title} by {org} matches your core skills and interests. Check requirements and apply!",
                    "type": "match",
                    "urgency": "high",
                    "related_opportunity_id": opp_id,
                    "is_read": False,
                    "created_at": now
                })

            # 2. Deadline Urgency Alerts
            if deadline:
                if isinstance(deadline, str):
                    try:
                        due_date = datetime.fromisoformat(deadline.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        continue
                else:
                    due_date = deadline.replace(tzinfo=None) if hasattr(deadline, 'tzinfo') and deadline.tzinfo else deadline

                days_left = (due_date - now).days

                is_saved = opp_id in saved_opportunity_ids

                if 0 <= days_left <= 3:
                    generated_alerts.append({
                        "user_id": student_user_id,
                        "title": f"🚨 Urgent Deadline: {title} closes in {days_left} day{'s' if days_left != 1 else ''}!",
                        "message": f"Final call for {title} ({org}). Applications close on {due_date.strftime('%B %d, %Y')}.{' (In your saved list)' if is_saved else ''}",
                        "type": "deadline",
                        "urgency": "critical",
                        "related_opportunity_id": opp_id,
                        "is_read": False,
                        "created_at": now
                    })
                elif 3 < days_left <= 7 and (is_saved or overall_match >= 75.0):
                    generated_alerts.append({
                        "user_id": student_user_id,
                        "title": f"⏰ Approaching Deadline: {title} in {days_left} days",
                        "message": f"Reminder to prepare your application for {title}. Deadline: {due_date.strftime('%B %d, %Y')}.",
                        "type": "deadline",
                        "urgency": "high" if is_saved else "medium",
                        "related_opportunity_id": opp_id,
                        "is_read": False,
                        "created_at": now
                    })

        logger.info(f"[{self.name}] Generated {len(generated_alerts)} targeted alerts for student #{student_user_id}.")
        return generated_alerts
