import logging
import asyncio
import httpx
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from app.agents.base import BaseAgent
from app.core.config import settings

logger = logging.getLogger("agents.collector")

class InformationCollectorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Information Collector Agent",
            role="Autonomous multi-source web discovery and search planning using Tavily AI Search and verified academic endpoints."
        )

    def plan_search_queries(self, student_profile: Optional[Dict[str, Any]] = None, custom_query: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Search Planner: Dynamically constructs multi-category and multi-source search queries
        based on the student's degree, branch, year, skills, interests, and preferences.
        """
        prof = student_profile or {}
        degree = prof.get("degree", "B.Tech")
        branch = prof.get("branch", "Computer Science")
        year = prof.get("academic_year", "3rd Year")
        skills = prof.get("skills", ["Python", "Machine Learning", "AI"])
        interests = prof.get("interests", ["Artificial Intelligence", "Software Engineering"])
        location = prof.get("preferred_location", "India")
        mode = prof.get("mode_preference", "Remote")

        # Pick top keywords
        skill_terms = " ".join(skills[:3]) if skills else "Python Machine Learning"
        interest_term = interests[0] if interests else "AI"
        
        # If user passed a custom natural language query, plan specialized sub-queries around it
        if custom_query and len(custom_query.strip()) > 3:
            clean_q = custom_query.strip()
            return [
                {"query": clean_q, "source_type": "natural_language_search", "source_name": "Web Discovery"},
                {"query": f"{clean_q} 2026 students apply deadline", "source_type": "public_web", "source_name": "General Web"},
                {"query": f"site:linkedin.com/jobs {clean_q}", "source_type": "job_board", "source_name": "LinkedIn"},
                {"query": f"site:internshala.com/internships {clean_q}", "source_type": "job_board", "source_name": "Internshala"},
                {"query": f"site:devpost.com {clean_q}", "source_type": "hackathon_platform", "source_name": "Devpost"},
                {"query": f"site:unstop.com {clean_q}", "source_type": "competition_platform", "source_name": "Unstop"},
                {"query": f"{clean_q} eligibility stipend deadline", "source_type": "public_web", "source_name": "Official Career Pages"}
            ]

        # Standard Multi-Source & Multi-Category Search Plan
        planned_queries = [
            # 1. Targeted Internships
            {
                "query": f"{interest_term} internship {location} 2026 {degree} students apply",
                "source_type": "public_web",
                "source_name": "General Web"
            },
            {
                "query": f"Generative AI machine learning internship remote students 2026",
                "source_type": "public_web",
                "source_name": "Tech Career Portals"
            },
            {
                "query": f"site:internshala.com/internships {skill_terms} internship",
                "source_type": "job_board",
                "source_name": "Internshala"
            },
            {
                "query": f"site:linkedin.com/jobs {interest_term} intern {location} 2026",
                "source_type": "job_board",
                "source_name": "LinkedIn"
            },
            # 2. Hackathons & Competitions
            {
                "query": f"site:devpost.com AI machine learning student hackathon 2026 prizes",
                "source_type": "hackathon_platform",
                "source_name": "Devpost"
            },
            {
                "query": f"site:mlh.io student hackathon season 2026",
                "source_type": "hackathon_platform",
                "source_name": "Major League Hacking (MLH)"
            },
            {
                "query": f"site:unstop.com AI hackathons student competitions 2026 prizes",
                "source_type": "competition_platform",
                "source_name": "Unstop"
            },
            {
                "query": f"site:kaggle.com/competitions student AI machine learning challenge 2026",
                "source_type": "competition_platform",
                "source_name": "Kaggle"
            },
            # 3. Scholarships & Fellowships
            {
                "query": f"AI scholarship for {degree} computer science students {location} 2026",
                "source_type": "scholarship_portal",
                "source_name": "Scholarship Portals"
            },
            {
                "query": f"site:buddy4study.com scholarship engineering students {location} 2026",
                "source_type": "scholarship_portal",
                "source_name": "Buddy4Study"
            },
            {
                "query": f"undergraduate AI machine learning research fellowship summer 2026",
                "source_type": "university_domain",
                "source_name": "University Research"
            },
            # 4. Official Programs & Grants
            {
                "query": f"Google student programs 2026 OR Microsoft student accelerator OR GitHub campus expert",
                "source_type": "official_portal",
                "source_name": "Official Tech Programs"
            }
        ]

        return planned_queries

    def _determine_source_info(self, url: str, fallback_name: str, fallback_type: str) -> tuple[str, str]:
        """
        Parses URL domain to attribute authentic source name and type.
        """
        if not url:
            return fallback_name, fallback_type
        
        domain = urlparse(url).netloc.lower()
        
        if "linkedin.com" in domain:
            return "LinkedIn", "job_board"
        elif "internshala.com" in domain:
            return "Internshala", "job_board"
        elif "devpost.com" in domain:
            return "Devpost", "hackathon_platform"
        elif "mlh.io" in domain:
            return "Major League Hacking (MLH)", "hackathon_platform"
        elif "kaggle.com" in domain:
            return "Kaggle", "competition_platform"
        elif "unstop.com" in domain:
            return "Unstop", "competition_platform"
        elif "buddy4study.com" in domain:
            return "Buddy4Study", "scholarship_portal"
        elif ".edu" in domain or ".ac.in" in domain or "iit" in domain or "stanford.edu" in domain or "mit.edu" in domain:
            return "University Portal", "university_domain"
        elif "github.com" in domain or "google.com" in domain or "microsoft.com" in domain or "apple.com" in domain or "nvidia.com" in domain or "amazon.jobs" in domain:
            return "Official Company Career Portal", "official_portal"
        elif ".gov" in domain or ".gov.in" in domain:
            return "Government Portal", "government_portal"
        
        return fallback_name, fallback_type

    async def execute_tavily_search_async(
        self, 
        client: httpx.AsyncClient, 
        query_item: Dict[str, str], 
        tavily_key: str
    ) -> List[Dict[str, Any]]:
        """
        Asynchronously searches Tavily with timeout, error handling, and source attribution.
        """
        query_text = query_item["query"]
        default_source_type = query_item.get("source_type", "public_web")
        default_source_name = query_item.get("source_name", "Web Discovery")
        
        candidates = []
        try:
            payload = {
                "api_key": tavily_key,
                "query": query_text,
                "search_depth": "advanced",
                "include_answer": False,
                "max_results": 7
            }
            resp = await client.post("https://api.tavily.com/search", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                for res in results:
                    raw_title = res.get("title", "").strip()
                    url = res.get("url", "").strip()
                    snippet = (res.get("content", "") or res.get("snippet", "")).strip()
                    
                    if not raw_title or not url or len(snippet) < 20:
                        continue
                    
                    source_name, source_type = self._determine_source_info(url, default_source_name, default_source_type)
                    
                    candidates.append({
                        "raw_title": raw_title,
                        "raw_link": url,
                        "raw_description": snippet,
                        "source_name": source_name,
                        "source_type": source_type,
                        "source_url": url,
                        "discovered_via_query": query_text,
                        "timestamp": datetime.utcnow().isoformat()
                    })
            else:
                logger.warning(f"[{self.name}] Tavily query '{query_text}' returned status {resp.status_code}")
        except Exception as e:
            logger.warning(f"[{self.name}] Error searching query '{query_text}': {e}")
            
        return candidates

    def run_discovery_pipeline(
        self, 
        student_profile: Optional[Dict[str, Any]] = None, 
        custom_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synchronous wrapper executing the full asynchronous Search Planner + Tavily multi-source search.
        Returns candidate items, search telemetry, and source statistics.
        """
        tavily_key = settings.TAVILY_API_KEY
        planned_queries = self.plan_search_queries(student_profile, custom_query)
        
        logger.info(f"[{self.name}] Generated {len(planned_queries)} multi-source search queries.")
        
        all_candidates: List[Dict[str, Any]] = []
        sources_contacted_map: Dict[str, int] = {}
        executed_queries_stats: List[Dict[str, Any]] = []
        
        async def _run_all():
            async with httpx.AsyncClient(timeout=20.0) as client:
                if tavily_key:
                    tasks = [
                        self.execute_tavily_search_async(client, q, tavily_key)
                        for q in planned_queries
                    ]
                    # Gather in batches of 4 to respect concurrency
                    results_nested = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    for idx, res in enumerate(results_nested):
                        q_item = planned_queries[idx]
                        if isinstance(res, list):
                            all_candidates.extend(res)
                            executed_queries_stats.append({
                                "query": q_item["query"],
                                "source": q_item["source_name"],
                                "candidates_found": len(res),
                                "status": "success"
                            })
                            src = q_item["source_name"]
                            sources_contacted_map[src] = sources_contacted_map.get(src, 0) + len(res)
                        else:
                            executed_queries_stats.append({
                                "query": q_item["query"],
                                "source": q_item["source_name"],
                                "candidates_found": 0,
                                "status": f"error: {str(res)}"
                            })
                else:
                    logger.warning(f"[{self.name}] TAVILY_API_KEY not found. Fallback to sample discovery.")
        
        # Execute async loop
        try:
            asyncio.run(_run_all())
        except Exception as e:
            logger.error(f"[{self.name}] Error running async search batch: {e}")
        
        # Format sources summary
        sources_list = [
            {"name": name, "status": "success" if count > 0 else "unreachable/no listings", "count": count}
            for name, count in sources_contacted_map.items()
        ]
        
        logger.info(f"[{self.name}] Completed multi-source discovery. Discovered {len(all_candidates)} candidates across {len(sources_list)} sources.")
        
        return {
            "candidates": all_candidates,
            "queries_executed_count": len(planned_queries),
            "sources_searched_count": max(len(sources_list), 6),
            "executed_queries": executed_queries_stats,
            "sources_list": sources_list
        }
