"""
LLM integration (Anthropic Claude API). Three jobs:

1. extract_profile()     — free-form chat text -> structured profile
                            fields, in one call, via forced tool use.
2. generate_explanation() — natural-language "why this course", grounded
                            in real profile + course data (not memory).
3. answer_question()      — grounded Q&A about the learner's path.

"Grounded" is the important word for all three: every prompt below
passes in real data pulled from Postgres and instructs the model to
use only that data. This is what keeps explanations honest instead of
plausible-sounding hallucination — worth calling out explicitly in
your solution documentation's AI/ML section.
"""
import json
from typing import Optional, Dict, Any, List

from anthropic import Anthropic

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL
from app.recommender import DOMAINS

_client: Optional[Anthropic] = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        if not ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY is not set — add it to your .env")
        _client = Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


EXTRACT_PROFILE_TOOL = {
    "name": "record_learner_profile",
    "description": "Record structured fields extracted from the learner's message.",
    "input_schema": {
        "type": "object",
        "properties": {
            "domain": {
                "type": "string",
                "enum": list(DOMAINS.keys()) + ["unclear"],
                "description": "Best-matching learning domain, or 'unclear' if not enough info yet.",
            },
            "goal_summary": {
                "type": "string",
                "description": "One-sentence restatement of the learner's goal.",
            },
            "experience_level": {
                "type": "string",
                "enum": ["beginner", "intermediate", "advanced", "unknown"],
            },
            "interests": {"type": "array", "items": {"type": "string"}},
            "weekly_hours": {
                "type": "integer",
                "description": "Estimated hours per week the learner can commit. 0 if not mentioned.",
            },
            "follow_up_question": {
                "type": "string",
                "description": "One short, natural question to ask next if domain or experience_level "
                               "is still missing. Empty string if nothing important is missing.",
            },
        },
        "required": [
            "domain", "goal_summary", "experience_level",
            "interests", "weekly_hours", "follow_up_question",
        ],
    },
}


def extract_profile(user_text: str, prior_context: Optional[str] = None) -> Dict[str, Any]:
    """
    One LLM call turns free text into structured fields — this is what
    replaces a rigid multi-step form with a real conversation. Forcing
    tool_choice guarantees a parseable result instead of chatty prose.
    """
    domain_list = ", ".join(f"{k} ({v['label']})" for k, v in DOMAINS.items())
    system = (
        "You are the profiling engine for a learning-path app. Extract structured "
        f"fields from what the learner says. Supported domains: {domain_list}. "
        "Always call the record_learner_profile tool with your best-effort extraction "
        "— never reply with plain text."
    )
    content = (prior_context + "\n\n" if prior_context else "") + user_text

    response = _get_client().messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=500,
        system=system,
        messages=[{"role": "user", "content": content}],
        tools=[EXTRACT_PROFILE_TOOL],
        tool_choice={"type": "tool", "name": "record_learner_profile"},
    )

    for block in response.content:
        if block.type == "tool_use":
            return block.input

    # Extremely unlikely given the forced tool_choice, but never let a
    # malformed model response 500 the endpoint.
    return {
        "domain": "unclear", "goal_summary": user_text, "experience_level": "unknown",
        "interests": [], "weekly_hours": 0,
        "follow_up_question": "Could you tell me a bit more about your goal?",
    }


def generate_explanation(course: Dict[str, Any], profile: Dict[str, Any], prereq_titles: List[str]) -> str:
    """LLM-written version of the 'why this course' text, grounded in real fields only."""
    system = (
        "You explain a course recommendation in one or two short, encouraging sentences. "
        "Use only the facts given below — never invent prerequisites, skills, or learner "
        "details that weren't provided."
    )
    prompt = (
        f"Learner goal: {profile.get('goal_summary')}\n"
        f"Learner level: {profile.get('experience_level')}\n"
        f"Course: {course['title']} — teaches {', '.join(course['skills'])}\n"
        f"Prerequisites already covered earlier in the path: {', '.join(prereq_titles) or 'none'}\n\n"
        "Explain briefly why this course is recommended next."
    )
    response = _get_client().messages.create(
        model=ANTHROPIC_MODEL, max_tokens=150, system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(b.text for b in response.content if b.type == "text").strip()


def answer_question(question: str, context: Dict[str, Any]) -> str:
    """
    Grounded Q&A: context is real data fetched from Postgres by the
    caller (see routes/recommendations.py), not the model's memory.
    """
    system = (
        "You answer a learner's question about their learning path using ONLY the "
        "context given below. If the context doesn't contain the answer, say you "
        "don't have that information rather than guessing. Keep answers to 2-3 sentences."
    )
    prompt = f"Context:\n{json.dumps(context, indent=2)}\n\nLearner question: {question}"
    response = _get_client().messages.create(
        model=ANTHROPIC_MODEL, max_tokens=250, system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(b.text for b in response.content if b.type == "text").strip()
