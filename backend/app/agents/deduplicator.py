import logging
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse

logger = logging.getLogger("agents.deduplicator")

class DeduplicationEngine:
    """
    Intelligent multi-source deduplication and consolidation engine.
    Merges duplicate listings across LinkedIn, Internshala, Devpost, Official Careers, etc.
    into single unified opportunities with multi-source attribution.
    """

    def normalize_text(self, text: str) -> str:
        if not text:
            return ""
        # Lowercase, remove punctuation and extra spaces
        cleaned = re.sub(r'[^\w\s]', '', text.lower())
        # Remove common transient suffixes
        cleaned = re.sub(r'\b(2026|2025|hiring|apply|now|internship|intern|students|freshers|india|remote)\b', '', cleaned)
        return " ".join(cleaned.split())

    def are_duplicates(self, opp_a: Dict[str, Any], opp_b: Dict[str, Any]) -> bool:
        # 1. Exact canonical URL match
        url_a = opp_a.get("official_url", "").strip()
        url_b = opp_b.get("official_url", "").strip()
        if url_a and url_b and url_a == url_b:
            return True

        # 2. Normalized Title & Organization Match
        norm_title_a = self.normalize_text(opp_a.get("title", ""))
        norm_title_b = self.normalize_text(opp_b.get("title", ""))
        
        norm_org_a = self.normalize_text(opp_a.get("organization", ""))
        norm_org_b = self.normalize_text(opp_b.get("organization", ""))

        if norm_title_a and norm_title_b and norm_title_a == norm_title_b:
            if norm_org_a and norm_org_b and (norm_org_a in norm_org_b or norm_org_b in norm_org_a):
                return True

        # 3. Fuzzy match: Check if titles share high word overlap and have matching org & category
        if norm_org_a and norm_org_b and (norm_org_a == norm_org_b or norm_org_a in norm_org_b or norm_org_b in norm_org_a):
            words_a = set(norm_title_a.split())
            words_b = set(norm_title_b.split())
            if words_a and words_b:
                intersection = len(words_a.intersection(words_b))
                union = len(words_a.union(words_b))
                if union > 0 and (intersection / union) >= 0.65:
                    cat_a = opp_a.get("category", "")
                    cat_b = opp_b.get("category", "")
                    if cat_a == cat_b or cat_a == "General" or cat_b == "General":
                        return True

        return False

    def deduplicate_and_merge(
        self, 
        analyzed_items: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Deduplicates incoming analyzed items, merging duplicate references into multi-source lists.
        Returns (unique_opportunities, duplicates_removed_count).
        """
        unique_list: List[Dict[str, Any]] = []
        duplicates_count = 0

        for item in analyzed_items:
            # Build initial source dict
            src_entry = {
                "source_name": item.get("source_name", "Web Discovery"),
                "source_url": item.get("source_url") or item.get("official_url", ""),
                "source_type": item.get("source_type", "public_web"),
                "last_checked": datetime.utcnow().isoformat()
            }

            matched_existing = False
            for existing in unique_list:
                if self.are_duplicates(item, existing):
                    matched_existing = True
                    duplicates_count += 1
                    
                    # Merge sources
                    existing_sources = existing.setdefault("sources", [])
                    # Avoid exact duplicate source URL
                    if not any(s.get("source_url") == src_entry["source_url"] for s in existing_sources):
                        existing_sources.append(src_entry)
                        existing["source_count"] = len(existing_sources)

                    # Upgrade verification if incoming item is VERIFIED
                    if item.get("verification_status") == "VERIFIED":
                        existing["verification_status"] = "VERIFIED"

                    # Merge skills
                    for sk in item.get("required_skills", []):
                        if sk not in existing.get("required_skills", []):
                            existing.setdefault("required_skills", []).append(sk)
                    
                    break

            if not matched_existing:
                item["sources"] = [src_entry]
                item["source_count"] = 1
                unique_list.append(item)

        logger.info(f"[Deduplicator] Merged {len(analyzed_items)} raw items into {len(unique_list)} unique opportunities ({duplicates_count} duplicates consolidated).")
        return unique_list, duplicates_count
