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

class AnalysisCreateRequest(BaseModel):
    resume_id: str
    job_title: str = Field(min_length=2, max_length=200)
    job_description: str = Field(min_length=20, max_length=10000)

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
