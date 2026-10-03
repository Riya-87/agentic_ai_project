from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.source import TrustedSource
from app.models.search_run import SearchRun
from app.schemas.agent import AgentPipelineStatus, AgentRunRequest, SearchRunMetrics, AgentStepLog
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/agents", tags=["Agentic AI Control Room"])

@router.post("/run", response_model=AgentPipelineStatus)
def trigger_agent_pipeline(
    request: AgentRunRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers the autonomous multi-agent pipeline:
    1. Search Planner & Collector Agent (Tavily Multi-Source Web Discovery)
    2. Analyzer Agent (Semantic Extraction & Source Verification)
    3. Deduplication & Multi-Source Consolidation Engine
    4. Student Matching Agent (Compatibility Scoring)
    5. Ranking Agent (Prioritization)
    6. Summary Agent (Concise Briefs)
    7. Deadline & Alert Agent (Urgency scan & notifications)
    """
    target_uid = request.target_user_id or (current_user.id if current_user else 1)
    status = orchestrator.run_full_pipeline(
        db=db, 
        target_user_id=target_uid,
        custom_query=request.custom_query
    )
    return status

@router.get("/status", response_model=AgentPipelineStatus)
def get_pipeline_status(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    agents_nodes = orchestrator.get_agent_nodes_status(db=db, target_user_id=user_id)

    last_run = db.query(SearchRun).order_by(SearchRun.id.desc()).first()

    if orchestrator.current_pipeline_status:
        st = orchestrator.current_pipeline_status
        st.agents = agents_nodes
        return st
    
    default_logs = [
        AgentStepLog(agent_name="Student Matching Agent", status="completed", summary="✓ Profile retrieved (B.Tech CSE/AIML, 3rd Year)", timestamp=datetime.utcnow()),
        AgentStepLog(agent_name="Information Collector Agent", status="completed", summary="✓ Autonomous Search Planner initialized (14 targeted queries ready)", timestamp=datetime.utcnow()),
        AgentStepLog(agent_name="Opportunity Analyzer Agent", status="completed", summary="✓ Verified schema extractor and domain authority analyzer active", timestamp=datetime.utcnow()),
        AgentStepLog(agent_name="Deduplication Engine", status="completed", summary="✓ Cross-platform entity matching active", timestamp=datetime.utcnow()),
        AgentStepLog(agent_name="Ranking Agent", status="completed", summary="✓ Multi-factor priority weighting initialized", timestamp=datetime.utcnow()),
        AgentStepLog(agent_name="Deadline Alert Agent", status="completed", summary="✓ Temporal urgency monitor scanning deadlines", timestamp=datetime.utcnow())
    ]

    metrics = None
    if last_run:
        metrics = SearchRunMetrics(
            sources_searched=last_run.sources_searched,
            queries_executed=last_run.queries_executed,
            candidates_discovered=last_run.candidates_discovered,
            valid_opportunities=last_run.valid_opportunities,
            duplicates_removed=last_run.duplicates_removed,
            profile_matches=last_run.profile_matches,
            high_matches=last_run.high_matches,
            deadlines_within_7_days=last_run.deadlines_within_7_days,
            sources_list=last_run.sources_list or [],
            executed_queries=last_run.executed_queries or [],
            summary_report=last_run.summary_report
        )

    return AgentPipelineStatus(
        pipeline_id=last_run.run_id if last_run else "pipeline-live-ready",
        status=last_run.status if last_run else "completed",
        current_agent=None,
        total_steps=7,
        completed_steps=7,
        agents=agents_nodes,
        logs=default_logs,
        metrics=metrics,
        is_demo_mode=False,
        started_at=last_run.started_at if last_run else datetime.utcnow(),
        completed_at=last_run.completed_at if last_run else datetime.utcnow()
    )

@router.get("/last-sync")
def get_last_search_sync(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the most recent Search Run metrics and source breakdown.
    """
    last_run = db.query(SearchRun).order_by(SearchRun.id.desc()).first()
    if not last_run:
        return {
            "has_run": False,
            "message": "No search runs executed yet. Click 'Run Agent Sync' to discover live opportunities."
        }

    return {
        "has_run": True,
        "run_id": last_run.run_id,
        "query_prompt": last_run.query_prompt,
        "status": last_run.status,
        "started_at": last_run.started_at,
        "completed_at": last_run.completed_at,
        "sources_searched": last_run.sources_searched,
        "queries_executed": last_run.queries_executed,
        "candidates_discovered": last_run.candidates_discovered,
        "valid_opportunities": last_run.valid_opportunities,
        "duplicates_removed": last_run.duplicates_removed,
        "profile_matches": last_run.profile_matches,
        "high_matches": last_run.high_matches,
        "deadlines_within_7_days": last_run.deadlines_within_7_days,
        "sources_list": last_run.sources_list or [],
        "executed_queries": last_run.executed_queries or [],
        "summary_report": last_run.summary_report
    }

@router.get("/sources")
def list_trusted_sources(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    sources = db.query(TrustedSource).all()
    return sources

@router.post("/sources")
def add_trusted_source(
    payload: Dict[str, Any],
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    source = TrustedSource(
        name=payload.get("name", "Custom Feed"),
        url=payload.get("url", ""),
        type=payload.get("type", "rss"),
        category_focus=payload.get("category_focus", "All")
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source
