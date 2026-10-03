from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class AgentStepLog(BaseModel):
    agent_name: str
    status: str  # "started", "in_progress", "completed", "failed", "skipped"
    summary: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()

class AgentNodeStatus(BaseModel):
    id: str  # orchestrator, collector, analyzer, matching, ranking, summary, deadline
    name: str
    role: str
    status: str = "READY"  # READY, RUNNING, COMPLETE, IDLE
    current_task: str
    last_execution: str
    execution_duration: str
    items_processed: int
    metrics: Dict[str, Any] = {}
    errors_count: int = 0
    is_live: bool = True

class SearchRunMetrics(BaseModel):
    sources_searched: int = 0
    queries_executed: int = 0
    candidates_discovered: int = 0
    valid_opportunities: int = 0
    duplicates_removed: int = 0
    profile_matches: int = 0
    high_matches: int = 0
    deadlines_within_7_days: int = 0
    sources_list: List[Dict[str, Any]] = []
    executed_queries: List[Dict[str, Any]] = []
    summary_report: Optional[str] = ""

class AgentPipelineStatus(BaseModel):
    pipeline_id: str
    status: str  # "idle", "running", "completed", "failed"
    current_agent: Optional[str] = None
    total_steps: int = 7
    completed_steps: int = 0
    agents: List[AgentNodeStatus] = []
    logs: List[AgentStepLog] = []
    metrics: Optional[SearchRunMetrics] = None
    is_demo_mode: bool = False
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class AgentRunRequest(BaseModel):
    force_refresh: bool = False
    source_type: Optional[str] = "all"  # "all", "tavily", "linkedin", "internshala", "devpost", "mlh", "scholarships"
    custom_query: Optional[str] = None  # Natural language query e.g. "Find AI internships in India for 3rd year students"
    target_user_id: Optional[int] = None

class IngestionResult(BaseModel):
    source_name: str
    collected_count: int
    analyzed_count: int
    new_opportunities: int
    status: str
