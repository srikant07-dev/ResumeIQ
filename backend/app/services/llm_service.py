import json
import re
from google import genai
from google.genai import types
from app.config import get_settings
from app.schemas.analysis import (
    AnalysisResultData,
    ScoreBreakdown,
    ScoreEvidence,
    SkillMatch,
    CategorizedKeywords,
    EvidencePoint,
    Recommendation
)
from app.services.scoring_service import (
    calculate_skills_score,
    calculate_keyword_score,
    calculate_overall_score
)

def _clean_json_text(raw_text: str) -> str:
    """Strips markdown code fences and extraneous text around JSON."""
    raw = raw_text.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    elif raw.startswith("```"):
        raw = raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    return raw.strip()

async def run_stage_1_comparison(resume_text: str, job_description: str) -> dict:
    """
    Stage 1: Extracts structured requirements from both documents,
    performs semantic matching, keyword categorization, and qualitative ratings.
    """
    settings = get_settings()
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    prompt = f"""
You are an expert technical recruiter and resume evaluator.
Analyze the following RESUME text against the TARGET JOB DESCRIPTION.

=== RESUME TEXT ===
{resume_text[:8000]}

=== JOB DESCRIPTION ===
{job_description[:6000]}

Respond ONLY with a valid, parseable JSON object matching this exact structure:
{{
  "required_skills_count": 8,
  "matching_skills": [
    {{"skill": "Skill Name", "context": "Brief proof from resume text showing usage"}}
  ],
  "partial_skills": [
    {{"skill": "Skill Name", "context": "Why this is only a partial match based on resume text"}}
  ],
  "missing_skills": ["Skill1", "Skill2"],
  "keywords_present": ["Keyword1", "Keyword2"],
  "keywords_missing": ["Keyword3", "Keyword4"],
  "keyword_categories": {{
    "technical": ["Python", "FastAPI", "React"],
    "soft": ["Communication", "Problem Solving"],
    "domain": ["Cloud Architecture", "RESTful APIs"]
  }},
  "experience": {{
    "score": 75,
    "evidence": "Concrete evaluation of relevant project/work experience in 1-2 sentences."
  }},
  "education": {{
    "score": 90,
    "evidence": "Assessment of degree, field of study, and academic alignment in 1-2 sentences."
  }},
  "quality": {{
    "score": 80,
    "evidence": "Assessment of formatting, action-oriented bullet points, and clarity in 1-2 sentences."
  }},
  "strengths": [
    {{"point": "Key Strength Title", "evidence": "Direct citation or rationale from resume"}}
  ],
  "weaknesses": [
    {{"point": "Key Weakness Title", "evidence": "Explanation of gap relative to job requirements"}}
  ]
}}

Rules:
1. Ensure all score fields (experience, education, quality) are integers between 0 and 100.
2. Provide non-empty, factual evidence citations for all points.
3. Do not invent resume experience that does not exist in the text.
"""
    
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )
    
    clean_text = _clean_json_text(response.text)
    return json.loads(clean_text)

async def run_stage_2_recommendations(
    stage1_data: dict,
    scores_context: dict,
    job_description: str
) -> dict:
    """
    Stage 2: Generates prioritized, evidence-backed recommendations and candidate summary
    given the extracted gaps and computed hybrid scores.
    """
    settings = get_settings()
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    prompt = f"""
You are a career coach and engineering mentor.
Based on the resume gap analysis and computed scores below, generate prioritized, actionable recommendations.

=== COMPUTED SCORES ===
Overall Match Score: {scores_context.get('overall', 75)}%
Skills Match Score: {scores_context.get('skills', 80)}%
Experience Match Score: {scores_context.get('experience', 70)}%
Keywords Match Score: {scores_context.get('keywords', 75)}%

=== MISSING SKILLS ===
{json.dumps(stage1_data.get('missing_skills', []))}

=== PARTIAL SKILLS ===
{json.dumps(stage1_data.get('partial_skills', []))}

=== WEAKNESSES ===
{json.dumps(stage1_data.get('weaknesses', []))}

=== TARGET JOB DESCRIPTION EXCERPT ===
{job_description[:2000]}

Respond ONLY with a valid, parseable JSON object matching this structure:
{{
  "recommendations": [
    {{
      "priority": "HIGH",
      "title": "Clear action-oriented title",
      "description": "Specific explanation of what to improve.",
      "evidence": "Why this matters according to the job description.",
      "suggested_action": "Truthful guidance on how to highlight or acquire this skill without fabricating experience."
    }}
  ],
  "summary": "2-3 sentence overall strategic summary of candidate alignment and next steps."
}}

Rules:
1. Provide 3-5 high-impact recommendations prioritized as 'HIGH', 'MEDIUM', or 'LOW'.
2. NEVER encourage the candidate to fabricate experience, metrics, or credentials.
3. Keep advice practical, engineering-grade, and specific.
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    clean_text = _clean_json_text(response.text)
    return json.loads(clean_text)

async def analyze_resume_with_gemini(resume_text: str, job_description: str) -> AnalysisResultData:
    """
    Orchestrates the 2-Stage Gemini Pipeline + Deterministic Scoring Synthesis.
    """
    # Stage 1: Extraction, Matching, and Qualitative AI signals
    stage1 = await run_stage_1_comparison(resume_text, job_description)
    
    # Deterministic math computations
    matched_skills = [SkillMatch(**m) for m in stage1.get("matching_skills", [])]
    partial_skills = [SkillMatch(**p) for p in stage1.get("partial_skills", [])]
    missing_skills = stage1.get("missing_skills", [])
    
    total_required_skills = max(
        len(matched_skills) + len(partial_skills) + len(missing_skills),
        stage1.get("required_skills_count", 1)
    )
    
    skills_score_val = calculate_skills_score(
        matched_count=len(matched_skills),
        partial_count=len(partial_skills),
        total_required=total_required_skills
    )
    
    kw_present = stage1.get("keywords_present", [])
    kw_missing = stage1.get("keywords_missing", [])
    total_kw = max(1, len(kw_present) + len(kw_missing))
    
    kw_score_val = calculate_keyword_score(
        present_count=len(kw_present),
        total_keywords=total_kw
    )
    
    exp_score_val = max(0, min(100, int(stage1.get("experience", {}).get("score", 70))))
    edu_score_val = max(0, min(100, int(stage1.get("education", {}).get("score", 85))))
    qual_score_val = max(0, min(100, int(stage1.get("quality", {}).get("score", 75))))
    
    overall_val = calculate_overall_score(
        skills_score=skills_score_val,
        experience_score=exp_score_val,
        keyword_score=kw_score_val,
        education_score=edu_score_val,
        quality_score=qual_score_val
    )
    
    scores_context = {
        "overall": overall_val,
        "skills": skills_score_val,
        "experience": exp_score_val,
        "keywords": kw_score_val,
        "education": edu_score_val,
        "quality": qual_score_val
    }
    
    # Stage 2: Recommendations
    stage2 = await run_stage_2_recommendations(stage1, scores_context, job_description)
    
    # Assemble full Pydantic validated object
    score_breakdown = ScoreBreakdown(
        skills=ScoreEvidence(
            score=skills_score_val,
            source="deterministic",
            evidence=f"Matched {len(matched_skills)} core skills; {len(partial_skills)} partial matches out of {total_required_skills} evaluated requirements."
        ),
        experience=ScoreEvidence(
            score=exp_score_val,
            source="ai",
            evidence=stage1.get("experience", {}).get("evidence", "Evaluated from candidate work history and technical project alignment.")
        ),
        keywords=ScoreEvidence(
            score=kw_score_val,
            source="deterministic",
            evidence=f"Found {len(kw_present)} of {total_kw} essential job keywords across resume sections."
        ),
        education=ScoreEvidence(
            score=edu_score_val,
            source="ai",
            evidence=stage1.get("education", {}).get("evidence", "Degree and academic background align with target qualification requirements.")
        ),
        quality=ScoreEvidence(
            score=qual_score_val,
            source="ai",
            evidence=stage1.get("quality", {}).get("evidence", "Resume utilizes clear bullet hierarchy and action-oriented vocabulary.")
        )
    )
    
    kw_categories_raw = stage1.get("keyword_categories", {})
    categorized_kw = CategorizedKeywords(
        technical=kw_categories_raw.get("technical", []),
        soft=kw_categories_raw.get("soft", []),
        domain=kw_categories_raw.get("domain", [])
    )
    
    strengths = [EvidencePoint(**s) for s in stage1.get("strengths", [])]
    weaknesses = [EvidencePoint(**w) for w in stage1.get("weaknesses", [])]
    recommendations = [Recommendation(**r) for r in stage2.get("recommendations", [])]
    
    return AnalysisResultData(
        score_breakdown=score_breakdown,
        matching_skills=matched_skills,
        partial_skills=partial_skills,
        missing_skills=missing_skills,
        keywords_present=kw_present,
        keywords_missing=kw_missing,
        keyword_categories=categorized_kw,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        summary=stage2.get("summary", "Analysis completed successfully.")
    )
