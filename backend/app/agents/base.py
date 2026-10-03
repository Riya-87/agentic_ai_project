import os
import json
import logging
import re
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger("agents.base")

T = TypeVar("T", bound=BaseModel)

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def call_llm_json(self, prompt: str, schema_class: Optional[Type[T]] = None, fallback_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calls Gemini LLM requesting structured JSON output.
        If no API key or network error occurs, seamlessly returns structured fallback data.
        """
        # Try Gemini API if key is available
        if self.gemini_key:
            try:
                try:
                    # Try google-genai SDK first
                    from google import genai
                    from google.genai import types
                    client = genai.Client(api_key=self.gemini_key)
                    
                    full_prompt = f"{prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object matching the required schema. No markdown backticks, no markdown fence, only raw JSON."
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=full_prompt,
                    )
                    text = response.text.strip()
                    cleaned_text = self._clean_json_string(text)
                    return json.loads(cleaned_text)
                except ImportError:
                    # Fallback to google.generativeai
                    import google.generativeai as gai
                    gai.configure(api_key=self.gemini_key)
                    model = gai.GenerativeModel("gemini-1.5-flash")
                    full_prompt = f"{prompt}\n\nIMPORTANT: Return pure JSON without code fences or extra text."
                    res = model.generate_content(full_prompt)
                    cleaned = self._clean_json_string(res.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.warning(f"[{self.name}] LLM invocation failed: {e}. Falling back to structured heuristic processor.")

        # Fallback to provided fallback dictionary or empty dict
        return fallback_dict or {}

    def call_llm_text(self, prompt: str, fallback_text: str = "") -> str:
        """
        Calls Gemini LLM for freeform textual synthesis.
        """
        if self.gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.gemini_key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                return response.text.strip()
            except Exception:
                try:
                    import google.generativeai as gai
                    gai.configure(api_key=self.gemini_key)
                    model = gai.GenerativeModel("gemini-1.5-flash")
                    res = model.generate_content(prompt)
                    return res.text.strip()
                except Exception as e:
                    logger.warning(f"[{self.name}] LLM text call failed: {e}. Using fallback.")
        return fallback_text

    def _clean_json_string(self, raw_str: str) -> str:
        """Removes markdown code fences and extraneous whitespace."""
        s = raw_str.strip()
        if s.startswith("```json"):
            s = s[7:]
        elif s.startswith("```"):
            s = s[3:]
        if s.endswith("```"):
            s = s[:-3]
        return s.strip()
