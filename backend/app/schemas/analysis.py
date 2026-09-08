from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

class ScoreEvidence(BaseModel):
    score: int = Field(ge=0, le=100)
    source: Literal["deterministic", "ai"]
    evidence: str = Field(min_length=3)

class ScoreBreakdown(BaseModel):
    skills: ScoreEvidence
    experience: ScoreEvidence
    keywords: ScoreEvidence
    education: ScoreEvidence
    quality: ScoreEvidence

class SkillMatch(BaseModel):
    skill: str
    context: str

class CategorizedKeywords(BaseModel):
    technical: list[str] = Field(default_factory=list)
    soft: list[str] = Field(default_factory=list)
    domain: list[str] = Field(default_factory=list)

class EvidencePoint(BaseModel):
    point: str
    evidence: str

class Recommendation(BaseModel):
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    title: str
    description: str
    evidence: str
    suggested_action: str

class AnalysisResultData(BaseModel):
    score_breakdown: ScoreBreakdown
    matching_skills: list[SkillMatch] = Field(default_factory=list)
    partial_skills: list[SkillMatch] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    keywords_present: list[str] = Field(default_factory=list)
    keywords_missing: list[str] = Field(default_factory=list)
    keyword_categories: CategorizedKeywords = Field(default_factory=CategorizedKeywords)
    strengths: list[EvidencePoint] = Field(default_factory=list)
    weaknesses: list[EvidencePoint] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)
    summary: str


# ──────────────────────────────────────────────
# Market Intelligence Schemas
# ──────────────────────────────────────────────

class WebSource(BaseModel):
    title: str = ""
    uri: str = ""

class CompanyIntelligence(BaseModel):
    company_name: str
    domain: str = ""                         # e.g. "fintech", "e-commerce"
    peer_companies: list[str] = Field(default_factory=list)
    tech_stack: list[str] = Field(default_factory=list)
    engineering_culture: list[str] = Field(default_factory=list)
    hiring_bar_summary: str = ""
    sources: list[WebSource] = Field(default_factory=list)

class SkillFrequency(BaseModel):
    skill: str
    frequency: str = ""                      # e.g. "9/12 JDs"
    present_in_resume: bool = False

class MarketBenchmark(BaseModel):
    consensus_skills: list[str] = Field(default_factory=list)
    edge_skills: list[str] = Field(default_factory=list)
    skill_frequency_map: list[SkillFrequency] = Field(default_factory=list)
    common_experience_range: str = ""
    jds_analyzed_count: int = 0
    sources: list[WebSource] = Field(default_factory=list)

class StrategyPoint(BaseModel):
    title: str
    detail: str = ""

class ActionItem(BaseModel):
    action: str
    why: str = ""                            # Market evidence
    impact: str = ""
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    effort: Literal["QUICK_WIN", "SHORT_TERM", "LONG_TERM"] = "SHORT_TERM"

class CompetitiveStrategy(BaseModel):
    market_position: str = ""                # e.g. "top 30%"
    competitive_advantages: list[StrategyPoint] = Field(default_factory=list)
    critical_gaps: list[StrategyPoint] = Field(default_factory=list)
    strategic_gaps: list[StrategyPoint] = Field(default_factory=list)
    company_fit_score: int = Field(default=0, ge=0, le=100)
    company_fit_signals: list[str] = Field(default_factory=list)
    pointwise_strategy: list[ActionItem] = Field(default_factory=list)

class MarketIntelligenceResult(BaseModel):
    company_intelligence: CompanyIntelligence
    market_benchmark: MarketBenchmark
    competitive_strategy: CompetitiveStrategy
    mode: Literal["fast", "deep"] = "fast"
    deep_research_report: Optional[str] = None  # Full markdown report from Deep Research

class MarketIntelTriggerRequest(BaseModel):
    mode: Literal["fast", "deep"] = "fast"
    company_name: Optional[str] = Field(default=None, min_length=2, max_length=100)

class MarketIntelTriggerResponse(BaseModel):
    status: str = "running"                  # running | completed | failed
    message: str = ""

class MarketIntelQuotaResponse(BaseModel):
    used: int
    limit: int
    remaining: int


# ──────────────────────────────────────────────
# Request / Response Schemas
# ──────────────────────────────────────────────

class AnalysisCreateRequest(BaseModel):
    resume_id: str
    job_title: str = Field(min_length=2, max_length=200)
    job_description: str = Field(min_length=20, max_length=10000)
    company_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    parent_analysis_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    resume_id: str
    job_title: str = "Untitled Position"
    job_description: str = ""
    overall_score: Optional[int] = None
    skills_score: Optional[int] = None
    experience_score: Optional[int] = None
    keyword_score: Optional[int] = None
    education_score: Optional[int] = None
    quality_score: Optional[int] = None
    status: Literal["pending", "processing", "completed", "failed"] = "completed"
    result_json: Optional[AnalysisResultData] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    parent_analysis_id: Optional[str] = None
    # Market Intelligence fields (backwards-compatible: all Optional with None defaults)
    company_name: Optional[str] = None
    market_intel_status: Optional[str] = None       # None | running | completed | failed
    market_intel_json: Optional[MarketIntelligenceResult] = None
    market_intel_updated_at: Optional[datetime] = None

class AnalysisHistoryItem(BaseModel):
    id: str
    resume_id: str
    job_title: str = "Untitled Position"
    overall_score: Optional[int] = None
    status: str = "completed"
    created_at: Optional[datetime] = None

class ReEvaluationRequest(BaseModel):
    resume_id: str
    parent_analysis_id: Optional[str] = None

class ScoreDelta(BaseModel):
    overall_delta: int = 0
    skills_delta: int = 0
    keywords_delta: int = 0
    experience_delta: int = 0
    education_delta: int = 0
    quality_delta: int = 0
    newly_matched_skills: list[str] = Field(default_factory=list)
    resolved_missing_skills: list[str] = Field(default_factory=list)

class ReEvaluationResponse(BaseModel):
    new_analysis: AnalysisResponse
    parent_analysis_id: str
    score_delta: ScoreDelta
