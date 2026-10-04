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
        self.groq_key = settings.GROQ_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def call_llm_json(self, prompt: str, schema_class: Optional[Type[T]] = None, fallback_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calls Groq (Llama 3.3 70B) or Gemini LLM requesting structured JSON output.
        If no API key or network error occurs, seamlessly returns structured fallback data.
        """
        # 1. Try Groq (Ultra-fast, Llama 3.3 70B with native JSON mode)
        if self.groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key, max_retries=1, timeout=10.0)
                system_prompt = (
                    "You are an intelligent academic opportunities analyzer. "
                    "Respond ONLY with a valid JSON object matching the requested schema. "
                    "Do not include markdown codeblocks or explanations outside the JSON."
                )
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=2048
                )
                raw_content = completion.choices[0].message.content or "{}"
                cleaned = self._clean_json_string(raw_content)
                return json.loads(cleaned)
            except Exception as e:
                logger.warning(f"[{self.name}] Groq JSON call failed: {e}. Trying secondary LLM.")

        # 2. Try Gemini API if key is available
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
                logger.warning(f"[{self.name}] Gemini LLM invocation failed: {e}. Falling back to structured heuristic processor.")

        # 3. Fallback to provided fallback dictionary or empty dict
        return fallback_dict or {}

    def call_llm_text(self, prompt: str, fallback_text: str = "") -> str:
        """
        Calls Groq or Gemini LLM for freeform textual synthesis.
        """
        # 1. Try Groq (Llama 3.3 70B)
        if self.groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key, max_retries=1, timeout=10.0)
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are an intelligent, helpful academic and career advisor assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2048
                )
                text = completion.choices[0].message.content
                if text:
                    return text.strip()
            except Exception as e:
                logger.warning(f"[{self.name}] Groq text call failed: {e}. Trying Gemini.")

        # 2. Try Gemini
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
                    logger.warning(f"[{self.name}] Gemini text call failed: {e}. Using fallback.")
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
