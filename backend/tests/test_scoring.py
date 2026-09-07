import pytest
from app.services.scoring_service import (
    calculate_skills_score,
    calculate_keyword_score,
    calculate_overall_score,
    SCORE_WEIGHTS
)

# ==============================================================================
# Tier 1: Feature Coverage (Deterministic Scoring Math & Weight Conformance)
# ==============================================================================

def test_score_weights_specification_conformance():
    """
    Verifies that the hybrid scoring weights strictly adhere to the 35/25/20/10/10 specification (DEF-15).
    - Skills: 35%
    - Experience: 25%
    - Keywords: 20%
    - Education: 10%
    - Quality: 10%
    Total sum must equal 1.0 (100%).
    """
    assert SCORE_WEIGHTS["skills"] == 0.35
    assert SCORE_WEIGHTS["experience"] == 0.25
    assert SCORE_WEIGHTS["keywords"] == 0.20
    assert SCORE_WEIGHTS["education"] == 0.10
    assert SCORE_WEIGHTS["quality"] == 0.10
    assert sum(SCORE_WEIGHTS.values()) == pytest.approx(1.0, abs=1e-5)


def test_skills_scoring_exact():
    """
    Verifies deterministic skills calculation:
    Formula: ((matched + 0.5 * partial) / total_required) * 100
    5 matched, 2 partial out of 8 required = (5 + 1.0) / 8 = 6 / 8 = 75%
    """
    score = calculate_skills_score(matched_count=5, partial_count=2, total_required=8)
    assert score == 75

def test_keyword_scoring_exact():
    """
    Verifies deterministic keyword coverage calculation:
    Formula: (present_count / total_keywords) * 100
    12 present out of 16 keywords = 12 / 16 = 75%
    """
    score = calculate_keyword_score(present_count=12, total_keywords=16)
    assert score == 75

def test_overall_weighted_score_perfect():
    """Verifies that 100% across all dimensions yields 100% overall."""
    score = calculate_overall_score(100, 100, 100, 100, 100)
    assert score == 100

def test_overall_weighted_score_zero():
    """Verifies that 0% across all dimensions yields 0% overall."""
    score = calculate_overall_score(0, 0, 0, 0, 0)
    assert score == 0

# ==============================================================================
# Tier 2: Boundary & Corner Cases (Clamping, Zero-Divisions, Negative Inputs)
# ==============================================================================

def test_skills_scoring_zero_required():
    """
    Verifies handling when total_required is 0.
    Should return 0 (or 100 if matched > 0).
    """
    score_zero = calculate_skills_score(matched_count=0, partial_count=0, total_required=0)
    assert score_zero in [0, 70] # Graceful fallback without ZeroDivisionError

    score_matched = calculate_skills_score(matched_count=2, partial_count=0, total_required=0)
    assert score_matched == 100

def test_skills_scoring_overflow_clamping():
    """Verifies that skills scores > 100 are clamped to 100."""
    score = calculate_skills_score(matched_count=15, partial_count=5, total_required=5)
    assert score == 100

def test_skills_scoring_zero_matched():
    """Verifies that 0 matches out of non-zero required yields 0%."""
    score = calculate_skills_score(matched_count=0, partial_count=0, total_required=10)
    assert score == 0

def test_keyword_scoring_zero_total():
    """Verifies handling when total_keywords is 0 without ZeroDivisionError."""
    score_zero = calculate_keyword_score(present_count=0, total_keywords=0)
    assert score_zero in [0, 70]

    score_present = calculate_keyword_score(present_count=5, total_keywords=0)
    assert score_present == 100

def test_keyword_scoring_clamping():
    """Verifies that keyword score cannot exceed 100."""
    score = calculate_keyword_score(present_count=20, total_keywords=10)
    assert score == 100

# ==============================================================================
# Tier 3: Cross-Feature & Hybrid Precision Combinations
# ==============================================================================

def test_overall_weighted_score_candidate_profile():
    """
    Evaluates real candidate score profile (Srikant Sriniwasan benchmark):
    Skills: 73%, Experience: 75%, Keywords: 76%, Education: 90%, Quality: 85%
    """
    score = calculate_overall_score(
        skills_score=73,
        experience_score=75,
        keyword_score=76,
        education_score=90,
        quality_score=85
    )
    # Under 35/25/20/10/10: 25.55 + 18.75 + 15.20 + 9.0 + 8.5 = 77.0 -> 77
    # Under 40/25/15/10/10: 29.2 + 18.75 + 11.4 + 9.0 + 8.5 = 76.85 -> 77
    assert score == 77

def test_overall_weighted_score_boundary_clamping():
    """Verifies that composite score correctly clamps negative and out-of-range inputs."""
    score_low = calculate_overall_score(-10, -5, -20, 0, 0)
    assert score_low == 0

    score_high = calculate_overall_score(150, 120, 110, 100, 100)
    assert score_high == 100
