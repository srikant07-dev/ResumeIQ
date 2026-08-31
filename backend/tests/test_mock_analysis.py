import pytest
from app.services.mock_service import get_mock_analysis_result
from app.schemas.analysis import AnalysisResultData

def test_mock_analysis_structure():
    mock_data = get_mock_analysis_result("Full Stack Engineer")
    assert isinstance(mock_data, AnalysisResultData)
    assert mock_data.score_breakdown.skills.score >= 0
    assert mock_data.score_breakdown.skills.score <= 100
    assert mock_data.score_breakdown.skills.source == "deterministic"
    assert mock_data.score_breakdown.experience.source == "ai"
    assert len(mock_data.matching_skills) > 0
    assert len(mock_data.recommendations) > 0
    for rec in mock_data.recommendations:
        assert rec.priority in ["HIGH", "MEDIUM", "LOW"]
        assert len(rec.evidence) > 0
        assert len(rec.suggested_action) > 0
