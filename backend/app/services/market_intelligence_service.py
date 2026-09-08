"""
Market Intelligence Service
============================
Provides market research and competitive analysis by combining:
- Google Search Grounding (fast mode) for real-time web intelligence
- Deep Research Interactions API (deep dive mode) for comprehensive analysis

Architecture:
- Fast mode uses the PRIMARY Gemini API key (Search Grounding + JSON structuring)
- Deep Dive mode uses the DEDICATED deep research API key (isolated rate limits)
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timezone, timedelta

from google import genai
from google.genai import types

from app.config import get_settings
from app.db.supabase import get_supabase_client
from app.schemas.analysis import (
    AnalysisResultData,
    CompanyIntelligence,
    MarketBenchmark,
    SkillFrequency,
    CompetitiveStrategy,
    StrategyPoint,
    ActionItem,
    MarketIntelligenceResult,
    WebSource,
)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Client Initialization — Dual Key Pattern
# ──────────────────────────────────────────────

def _get_primary_client() -> genai.Client:
    """Client for base analysis + fast market intel (Search Grounding)."""
    return genai.Client(api_key=get_settings().GEMINI_API_KEY)


def _get_deep_research_client() -> genai.Client:
    """Dedicated client for Deep Dive mode — isolated rate limits & billing.
    Falls back to primary key if GEMINI_DEEP_RESEARCH_API_KEY is not set."""
    settings = get_settings()
    api_key = settings.GEMINI_DEEP_RESEARCH_API_KEY or settings.GEMINI_API_KEY
    return genai.Client(api_key=api_key)


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _clean_json_text(raw_text: str) -> str:
    """Extracts JSON substring using regex pattern matching and strips markdown fences."""
    if not raw_text or not raw_text.strip():
        return "{}"
    raw = raw_text.strip()
    match = re.search(r'(\{[\s\S]*\})', raw)
    if match:
        return match.group(1).strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', raw)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    return cleaned.strip() or "{}"


def extract_grounding_sources(response) -> list[dict]:
    """Safely extracts WebSource list from grounding metadata.
    Handles None metadata, empty chunks, and missing web attributes."""
    try:
        metadata = response.candidates[0].grounding_metadata
        if not metadata or not metadata.grounding_chunks:
            return []
        return [
            {"title": chunk.web.title or "", "uri": chunk.web.uri or ""}
            for chunk in metadata.grounding_chunks
            if chunk.web
        ]
    except (AttributeError, IndexError, TypeError):
        return []


async def _search_grounded_call(
    client: genai.Client, model: str, prompt: str
) -> tuple[str, list[dict]]:
    """Executes a Google Search-grounded call. Returns (text, sources).
    Cannot use response_mime_type=json with search grounding — returns free text."""
    response = await client.aio.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.3,
        ),
    )
    sources = extract_grounding_sources(response)
    text = response.text if response and response.text else ""
    return text, sources


async def _structure_json_call(
    client: genai.Client, model: str, raw_text: str, schema_instruction: str
) -> dict:
    """Takes free text from a grounded call, returns parsed JSON via a non-grounded call."""
    structuring_prompt = f"""You are a precise data extraction system.
Parse the following research text into a JSON object matching the specified schema.
Return ONLY a valid JSON object, nothing else.

=== SCHEMA INSTRUCTION ===
{schema_instruction}

=== RESEARCH TEXT ===
{raw_text}
"""
    response = await client.aio.models.generate_content(
        model=model,
        contents=structuring_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )
    raw = response.text if response and response.text else "{}"
    return json.loads(_clean_json_text(raw))


# ──────────────────────────────────────────────
# Stage A: Company Intelligence (Search Grounding)
# ──────────────────────────────────────────────

async def run_company_intelligence(
    company_name: str, job_title: str
) -> CompanyIntelligence:
    """Stage A: Search-grounded company research.
    Step 1: Grounded search for company info (free text + sources)
    Step 2: Structure the text into CompanyIntelligence JSON"""
    settings = get_settings()
    client = _get_primary_client()
    model = settings.GEMINI_MODEL

    search_prompt = f"""Research the company "{company_name}" for a job seeker targeting a "{job_title}" role.
Provide detailed information about:
1. What domain/industry does {company_name} operate in?
2. Who are their 3-5 main peer/competitor companies in the same space?
3. What is their known technology stack and engineering tools?
4. What is their engineering culture and work environment like?
5. What is their hiring bar and interview process reputation?

Focus on accurate, current information. If you cannot find specific data about this company,
provide what is publicly available and note any uncertainty."""

    # Step 1: Grounded search
    raw_text, sources = await _search_grounded_call(client, model, search_prompt)

    if not raw_text or len(raw_text.strip()) < 50:
        logger.warning("Company intelligence search returned minimal data for '%s'", company_name)
        return CompanyIntelligence(
            company_name=company_name,
            domain="unknown",
            hiring_bar_summary=f"Limited public data available for {company_name}.",
            sources=[WebSource(**s) for s in sources],
        )

    # Step 2: Structure into JSON
    schema_instruction = """{
  "company_name": "string",
  "domain": "string (e.g. fintech, e-commerce, saas)",
  "peer_companies": ["string", "string", ...],
  "tech_stack": ["string", "string", ...],
  "engineering_culture": ["string bullet point", ...],
  "hiring_bar_summary": "string paragraph"
}"""

    try:
        structured = await _structure_json_call(client, model, raw_text, schema_instruction)
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("Failed to structure company intel JSON: %s", e)
        structured = {}

    return CompanyIntelligence(
        company_name=structured.get("company_name", company_name),
        domain=structured.get("domain", ""),
        peer_companies=structured.get("peer_companies", [])[:8],
        tech_stack=structured.get("tech_stack", [])[:15],
        engineering_culture=structured.get("engineering_culture", [])[:6],
        hiring_bar_summary=structured.get("hiring_bar_summary", ""),
        sources=[WebSource(**s) for s in sources],
    )


# ──────────────────────────────────────────────
# Stage B: Market JD Analysis (Search Grounding)
# ──────────────────────────────────────────────

async def run_market_jd_analysis(
    company_name: str,
    job_title: str,
    peer_companies: list[str],
    candidate_skills: list[str],
) -> MarketBenchmark:
    """Stage B: Search-grounded JD market analysis.
    Step 1: Grounded search for similar JDs (free text + sources)
    Step 2: Structure into MarketBenchmark JSON"""
    settings = get_settings()
    client = _get_primary_client()
    model = settings.GEMINI_MODEL

    peers_str = ", ".join(peer_companies[:5]) if peer_companies else "similar companies"
    candidate_skills_str = ", ".join(candidate_skills[:15]) if candidate_skills else "not specified"

    search_prompt = f"""Search for current "{job_title}" job listings and requirements at {company_name} and {peers_str}.

Analyze 8-15 similar job descriptions and report:
1. What skills/technologies appear in 70%+ of these JDs? (table-stakes consensus skills)
2. What differentiator/edge skills appear only at top companies or senior roles?
3. For each skill found, estimate its frequency across the JDs (e.g. "9/12 JDs")
4. What is the typical experience range required?
5. How many JDs were you able to analyze?

The candidate currently has these skills: {candidate_skills_str}
For each skill in the frequency map, note whether the candidate has it.

Be specific with real skill names and realistic frequency estimates."""

    # Step 1: Grounded search
    raw_text, sources = await _search_grounded_call(client, model, search_prompt)

    if not raw_text or len(raw_text.strip()) < 50:
        logger.warning("Market JD search returned minimal data for '%s' at '%s'", job_title, company_name)
        return MarketBenchmark(
            jds_analyzed_count=0,
            sources=[WebSource(**s) for s in sources],
        )

    # Step 2: Structure into JSON
    schema_instruction = f"""{{
  "consensus_skills": ["string", ...],
  "edge_skills": ["string", ...],
  "skill_frequency_map": [
    {{"skill": "string", "frequency": "string like 9/12 JDs", "present_in_resume": true/false}},
    ...
  ],
  "common_experience_range": "string like 3-5 years",
  "jds_analyzed_count": number
}}

The candidate has these skills: {candidate_skills_str}
Set present_in_resume=true for skills the candidate has, false otherwise."""

    try:
        structured = await _structure_json_call(client, model, raw_text, schema_instruction)
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("Failed to structure market JD JSON: %s", e)
        structured = {}

    freq_map = []
    for item in structured.get("skill_frequency_map", []):
        if isinstance(item, dict) and item.get("skill"):
            freq_map.append(SkillFrequency(
                skill=item["skill"],
                frequency=item.get("frequency", ""),
                present_in_resume=item.get("present_in_resume", False),
            ))

    return MarketBenchmark(
        consensus_skills=structured.get("consensus_skills", []),
        edge_skills=structured.get("edge_skills", []),
        skill_frequency_map=freq_map[:25],
        common_experience_range=structured.get("common_experience_range", ""),
        jds_analyzed_count=structured.get("jds_analyzed_count", 0),
        sources=[WebSource(**s) for s in sources],
    )


# ──────────────────────────────────────────────
# Stage C: Competitive Strategy (Non-grounded synthesis)
# ──────────────────────────────────────────────

async def generate_competitive_strategy(
    base_result: AnalysisResultData,
    company_intel: CompanyIntelligence,
    market_data: MarketBenchmark,
) -> CompetitiveStrategy:
    """Stage C: Non-grounded synthesis. Combines base analysis with market data
    to produce competitive positioning and actionable improvement strategy."""
    settings = get_settings()
    client = _get_primary_client()
    model = settings.GEMINI_MODEL

    # Build context from base analysis
    matched_skills = [s.skill for s in (base_result.matching_skills or [])]
    missing_skills = base_result.missing_skills or []
    overall_score = base_result.score_breakdown.skills.score if base_result.score_breakdown else 0

    prompt = f"""You are a career strategist analyzing a candidate's competitive position in the job market.

=== CANDIDATE PROFILE ===
Overall Skills Score: {overall_score}%
Matched Skills: {', '.join(matched_skills[:15])}
Missing Skills: {', '.join(missing_skills[:10])}
Strengths: {'; '.join(s.point for s in (base_result.strengths or [])[:5])}
Weaknesses: {'; '.join(w.point for w in (base_result.weaknesses or [])[:5])}

=== COMPANY INTELLIGENCE ===
Company: {company_intel.company_name} (Domain: {company_intel.domain})
Peer Companies: {', '.join(company_intel.peer_companies[:5])}
Tech Stack: {', '.join(company_intel.tech_stack[:10])}
Engineering Culture: {'; '.join(company_intel.engineering_culture[:4])}
Hiring Bar: {company_intel.hiring_bar_summary[:500]}

=== MARKET BENCHMARK ===
Consensus Skills (table-stakes): {', '.join(market_data.consensus_skills[:10])}
Edge Skills (differentiators): {', '.join(market_data.edge_skills[:8])}
JDs Analyzed: {market_data.jds_analyzed_count}
Experience Range: {market_data.common_experience_range}

Respond with a JSON object:
{{
  "market_position": "string like 'top 25%' or 'mid-tier' based on skills/experience match",
  "competitive_advantages": [
    {{"title": "short title", "detail": "why this is an advantage in this market"}}
  ],
  "critical_gaps": [
    {{"title": "short title", "detail": "why this gap hurts the candidate's chances"}}
  ],
  "strategic_gaps": [
    {{"title": "short title", "detail": "nice-to-have improvements for differentiation"}}
  ],
  "company_fit_score": 0-100,
  "company_fit_signals": ["string signal", ...],
  "pointwise_strategy": [
    {{
      "action": "specific actionable improvement",
      "why": "market evidence for why this matters",
      "impact": "expected impact on candidacy",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "effort": "QUICK_WIN|SHORT_TERM|LONG_TERM"
    }}
  ]
}}

Provide 3-5 competitive advantages, 2-4 critical gaps, 2-3 strategic gaps,
3-5 company fit signals, and 5-8 prioritized strategy items.
Order strategy items by priority (CRITICAL first), then by effort (QUICK_WIN first)."""

    try:
        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        raw = response.text if response and response.text else "{}"
        data = json.loads(_clean_json_text(raw))
    except Exception as e:
        logger.error("Competitive strategy generation failed: %s", e)
        data = {}

    # Parse advantages
    advantages = [
        StrategyPoint(title=a.get("title", ""), detail=a.get("detail", ""))
        for a in data.get("competitive_advantages", [])
        if isinstance(a, dict) and a.get("title")
    ]

    # Parse critical gaps
    c_gaps = [
        StrategyPoint(title=g.get("title", ""), detail=g.get("detail", ""))
        for g in data.get("critical_gaps", [])
        if isinstance(g, dict) and g.get("title")
    ]

    # Parse strategic gaps
    s_gaps = [
        StrategyPoint(title=g.get("title", ""), detail=g.get("detail", ""))
        for g in data.get("strategic_gaps", [])
        if isinstance(g, dict) and g.get("title")
    ]

    # Parse strategy items
    strategy_items = []
    valid_priorities = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    valid_efforts = {"QUICK_WIN", "SHORT_TERM", "LONG_TERM"}
    for item in data.get("pointwise_strategy", []):
        if isinstance(item, dict) and item.get("action"):
            priority = item.get("priority", "MEDIUM").upper()
            effort = item.get("effort", "SHORT_TERM").upper()
            strategy_items.append(ActionItem(
                action=item["action"],
                why=item.get("why", ""),
                impact=item.get("impact", ""),
                priority=priority if priority in valid_priorities else "MEDIUM",
                effort=effort if effort in valid_efforts else "SHORT_TERM",
            ))

    fit_score = data.get("company_fit_score", 0)
    if not isinstance(fit_score, (int, float)):
        fit_score = 0
    fit_score = max(0, min(100, int(fit_score)))

    return CompetitiveStrategy(
        market_position=data.get("market_position", ""),
        competitive_advantages=advantages[:5],
        critical_gaps=c_gaps[:4],
        strategic_gaps=s_gaps[:3],
        company_fit_score=fit_score,
        company_fit_signals=data.get("company_fit_signals", [])[:5],
        pointwise_strategy=strategy_items[:8],
    )


# ──────────────────────────────────────────────
# Deep Dive Mode (Interactions API — dedicated key)
# ──────────────────────────────────────────────

async def run_deep_research_market_intel(
    company_name: str,
    job_title: str,
    job_description: str,
    candidate_skills: list[str],
    missing_skills: list[str],
) -> MarketIntelligenceResult:
    """Uses the Deep Research Interactions API for comprehensive analysis.
    Runs on GEMINI_DEEP_RESEARCH_API_KEY — isolated from primary workload."""
    deep_client = _get_deep_research_client()

    candidate_skills_str = ", ".join(candidate_skills[:20]) if candidate_skills else "not specified"
    missing_skills_str = ", ".join(missing_skills[:15]) if missing_skills else "none identified"

    research_input = f"""Research the following for a job seeker preparing to apply:

Company: {company_name}
Target Role: {job_title}
Job Description excerpt: {job_description[:3000]}

Research and report comprehensively:
1. What is {company_name}'s domain, technology stack, and engineering culture?
2. Who are their 3-5 peer/competitor companies hiring for similar roles?
3. Find 10-15 similar {job_title} job listings at {company_name} and competitors.
4. What skills appear in 70%+ of those JDs (table-stakes requirements)?
5. What differentiator skills appear only at top companies or senior positions?
6. The candidate has: {candidate_skills_str}. They are missing: {missing_skills_str}.
7. Where would this candidate rank competitively among typical applicants?
8. Provide a prioritized improvement strategy with effort estimates (quick win / short-term / long-term).

Include specific evidence, data points, and sources wherever possible."""

    interaction = deep_client.interactions.create(
        agent="deep-research-pro-preview-12-2025",
        input=research_input,
        background=True,
    )

    logger.info("Deep Research interaction created: %s", interaction.id)

    # Async polling loop with timeout (max 10 minutes)
    max_wait = 600  # seconds
    poll_interval = 10  # seconds
    elapsed = 0

    while elapsed < max_wait:
        result = await asyncio.to_thread(
            deep_client.interactions.get, id=interaction.id
        )
        if result.status == "completed":
            report_text = getattr(result, "output_text", None) or (result.outputs[-1].text if hasattr(result, "outputs") and result.outputs else "") or ""
            logger.info("Deep Research completed for interaction %s", interaction.id)
            break
        elif result.status in ("failed", "cancelled"):
            raise RuntimeError(
                f"Deep Research interaction {result.status}: {interaction.id}"
            )
        await asyncio.sleep(poll_interval)
        elapsed += poll_interval
    else:
        raise RuntimeError(
            f"Deep Research timed out after {max_wait}s: {interaction.id}"
        )

    # Structure the report into our schema (uses PRIMARY key — fast, cheap)
    structured_result = await _structure_deep_research_report(report_text)
    structured_result.mode = "deep"
    structured_result.deep_research_report = report_text
    return structured_result


async def _structure_deep_research_report(report_text: str) -> MarketIntelligenceResult:
    """Parses a Deep Research markdown report into our structured schema."""
    client = _get_primary_client()
    model = get_settings().GEMINI_MODEL

    prompt = f"""Parse the following comprehensive research report into a structured JSON object.
Extract all relevant data into the schema below. Be thorough.

=== SCHEMA ===
{{
  "company_intelligence": {{
    "company_name": "string",
    "domain": "string",
    "peer_companies": ["string"],
    "tech_stack": ["string"],
    "engineering_culture": ["string"],
    "hiring_bar_summary": "string"
  }},
  "market_benchmark": {{
    "consensus_skills": ["string"],
    "edge_skills": ["string"],
    "skill_frequency_map": [{{"skill": "string", "frequency": "string", "present_in_resume": false}}],
    "common_experience_range": "string",
    "jds_analyzed_count": number
  }},
  "competitive_strategy": {{
    "market_position": "string",
    "competitive_advantages": [{{"title": "string", "detail": "string"}}],
    "critical_gaps": [{{"title": "string", "detail": "string"}}],
    "strategic_gaps": [{{"title": "string", "detail": "string"}}],
    "company_fit_score": 0-100,
    "company_fit_signals": ["string"],
    "pointwise_strategy": [
      {{"action": "string", "why": "string", "impact": "string",
        "priority": "CRITICAL|HIGH|MEDIUM|LOW", "effort": "QUICK_WIN|SHORT_TERM|LONG_TERM"}}
    ]
  }}
}}

=== RESEARCH REPORT ===
{report_text[:15000]}
"""

    try:
        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        raw = response.text if response and response.text else "{}"
        data = json.loads(_clean_json_text(raw))
    except Exception as e:
        logger.error("Failed to structure deep research report: %s", e)
        data = {}

    # Parse company intelligence
    ci_data = data.get("company_intelligence", {})
    company_intel = CompanyIntelligence(
        company_name=ci_data.get("company_name", ""),
        domain=ci_data.get("domain", ""),
        peer_companies=ci_data.get("peer_companies", []),
        tech_stack=ci_data.get("tech_stack", []),
        engineering_culture=ci_data.get("engineering_culture", []),
        hiring_bar_summary=ci_data.get("hiring_bar_summary", ""),
    )

    # Parse market benchmark
    mb_data = data.get("market_benchmark", {})
    freq_map = [
        SkillFrequency(
            skill=f.get("skill", ""),
            frequency=f.get("frequency", ""),
            present_in_resume=f.get("present_in_resume", False),
        )
        for f in mb_data.get("skill_frequency_map", [])
        if isinstance(f, dict) and f.get("skill")
    ]
    market_bench = MarketBenchmark(
        consensus_skills=mb_data.get("consensus_skills", []),
        edge_skills=mb_data.get("edge_skills", []),
        skill_frequency_map=freq_map,
        common_experience_range=mb_data.get("common_experience_range", ""),
        jds_analyzed_count=mb_data.get("jds_analyzed_count", 0),
    )

    # Parse competitive strategy
    cs_data = data.get("competitive_strategy", {})
    valid_priorities = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    valid_efforts = {"QUICK_WIN", "SHORT_TERM", "LONG_TERM"}

    strategy_items = []
    for item in cs_data.get("pointwise_strategy", []):
        if isinstance(item, dict) and item.get("action"):
            p = item.get("priority", "MEDIUM").upper()
            e = item.get("effort", "SHORT_TERM").upper()
            strategy_items.append(ActionItem(
                action=item["action"],
                why=item.get("why", ""),
                impact=item.get("impact", ""),
                priority=p if p in valid_priorities else "MEDIUM",
                effort=e if e in valid_efforts else "SHORT_TERM",
            ))

    fit_score = cs_data.get("company_fit_score", 0)
    if not isinstance(fit_score, (int, float)):
        fit_score = 0

    comp_strategy = CompetitiveStrategy(
        market_position=cs_data.get("market_position", ""),
        competitive_advantages=[
            StrategyPoint(title=a.get("title", ""), detail=a.get("detail", ""))
            for a in cs_data.get("competitive_advantages", [])
            if isinstance(a, dict) and a.get("title")
        ],
        critical_gaps=[
            StrategyPoint(title=g.get("title", ""), detail=g.get("detail", ""))
            for g in cs_data.get("critical_gaps", [])
            if isinstance(g, dict) and g.get("title")
        ],
        strategic_gaps=[
            StrategyPoint(title=g.get("title", ""), detail=g.get("detail", ""))
            for g in cs_data.get("strategic_gaps", [])
            if isinstance(g, dict) and g.get("title")
        ],
        company_fit_score=max(0, min(100, int(fit_score))),
        company_fit_signals=cs_data.get("company_fit_signals", []),
        pointwise_strategy=strategy_items,
    )

    return MarketIntelligenceResult(
        company_intelligence=company_intel,
        market_benchmark=market_bench,
        competitive_strategy=comp_strategy,
    )


# ──────────────────────────────────────────────
# DB Helpers
# ──────────────────────────────────────────────

async def _update_market_intel_in_db(
    analysis_id: str,
    user_id: str,
    status: str,
    result: MarketIntelligenceResult | None = None,
    error_msg: str | None = None,
) -> None:
    """Updates market_intel_status and market_intel_json in the analyses table."""
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        logger.info("Skipping DB update in demo/offline mode (analysis_id=%s)", analysis_id)
        return

    supabase = get_supabase_client()
    update_data: dict = {
        "market_intel_status": status,
        "market_intel_updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if result is not None:
        update_data["market_intel_json"] = result.model_dump()
    elif error_msg:
        # Store error in market_intel_json for frontend display
        update_data["market_intel_json"] = {"error": error_msg}

    try:
        supabase.table("analyses") \
            .update(update_data) \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()
    except Exception as e:
        logger.warning(
            "Initial update with market_intel_updated_at failed for analysis %s: %s. Attempting fallback...",
            analysis_id, e,
        )
        if "market_intel_updated_at" in update_data:
            fallback_data = {k: v for k, v in update_data.items() if k != "market_intel_updated_at"}
            try:
                supabase.table("analyses") \
                    .update(fallback_data) \
                    .eq("id", analysis_id) \
                    .eq("user_id", user_id) \
                    .execute()
                logger.info("Fallback update without market_intel_updated_at succeeded for %s", analysis_id)
                return
            except Exception as e2:
                logger.error("Fallback update also failed for analysis %s: %s", analysis_id, e2, exc_info=True)
        else:
            logger.error("Update failed for analysis %s: %s", analysis_id, e, exc_info=True)


async def count_user_market_intel_today(user_id: str) -> int:
    """Counts how many market intel analyses a user has triggered today (UTC)."""
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return 0

    supabase = get_supabase_client()
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    ).isoformat()

    try:
        result = supabase.table("analyses") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .not_.is_("market_intel_status", "null") \
            .gte("market_intel_updated_at", today_start) \
            .execute()
        return result.count if result.count is not None else 0
    except Exception as e:
        logger.warning("Query with market_intel_updated_at failed (%s). Falling back to created_at...", e)
        try:
            result = supabase.table("analyses") \
                .select("id", count="exact") \
                .eq("user_id", user_id) \
                .not_.is_("market_intel_status", "null") \
                .gte("created_at", today_start) \
                .execute()
            return result.count if result.count is not None else 0
        except Exception as e2:
            logger.error("Failed to count market intel usage for user %s: %s", user_id, e2)
            return 0


async def update_market_intel_status(
    analysis_id: str, user_id: str, status: str
) -> None:
    """Public helper: sets market_intel_status without result data."""
    await _update_market_intel_in_db(analysis_id, user_id, status)


# ──────────────────────────────────────────────
# Orchestrator — Background Task Entry Point
# ──────────────────────────────────────────────

async def run_full_market_intelligence(
    analysis_id: str,
    user_id: str,
    mode: str = "fast",
    company_name: str | None = None,
) -> None:
    """Background task entry point. Updates DB status as it progresses.
    Called via asyncio.create_task() from the API route.

    Fast mode uses primary API key.
    Deep mode uses dedicated deep research API key."""
    try:
        # 1. Load the parent analysis from DB
        from app.services.analysis_service import get_analysis_by_id
        analysis = await get_analysis_by_id(analysis_id, user_id)

        if not analysis or not analysis.result_json:
            raise RuntimeError("Analysis not found or has no result data")

        # 2. Extract data needed for intelligence pipeline
        company_name = company_name or analysis.company_name or "Unknown Company"
        job_title = analysis.job_title
        job_description = analysis.job_description or ""
        candidate_skills = [
            s.skill for s in (analysis.result_json.matching_skills or [])
        ]
        missing_skills = analysis.result_json.missing_skills or []

        if mode == "deep":
            result = await run_deep_research_market_intel(
                company_name, job_title, job_description,
                candidate_skills, missing_skills,
            )
        else:
            # Fast mode: 3-stage pipeline (primary key)
            company_intel = await run_company_intelligence(company_name, job_title)

            market_data = await run_market_jd_analysis(
                company_name, job_title,
                company_intel.peer_companies, candidate_skills,
            )

            strategy = await generate_competitive_strategy(
                analysis.result_json, company_intel, market_data,
            )

            result = MarketIntelligenceResult(
                company_intelligence=company_intel,
                market_benchmark=market_data,
                competitive_strategy=strategy,
                mode="fast",
            )

        # 3. Save to DB
        await _update_market_intel_in_db(
            analysis_id, user_id, "completed", result
        )
        logger.info(
            "Market intelligence completed for analysis %s (mode=%s)",
            analysis_id, mode,
        )

    except Exception as e:
        logger.error(
            "Market intelligence failed for analysis %s: %s",
            analysis_id, e, exc_info=True,
        )
        err_str = str(e)
        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
            clean_err = "Gemini API rate limit or quota exceeded (429 RESOURCE_EXHAUSTED). Please check your Gemini API plan or try again shortly."
        elif "API_KEY_INVALID" in err_str or "403" in err_str:
            clean_err = "Invalid or restricted Gemini API key. Please verify your GEMINI_API_KEY."
        else:
            clean_err = f"Intelligence analysis encountered an error: {err_str[:250]}"

        await _update_market_intel_in_db(
            analysis_id, user_id, "failed", error_msg=clean_err
        )

