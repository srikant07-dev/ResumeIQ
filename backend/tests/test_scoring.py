from app.services.scoring_service import (
    calculate_skills_score,
    calculate_keyword_score,
    calculate_overall_score
)

def test_skills_scoring_exact():
    # 5 matched, 2 partial out of 8 required skills
    # (5 + 0.5 * 2) / 8 = 6 / 8 = 75%
    score = calculate_skills_score(matched_count=5, partial_count=2, total_required=8)
    assert score == 75

def test_skills_scoring_edge_cases():
    assert calculate_skills_score(matched_count=0, partial_count=0, total_required=0) == 70
    assert calculate_skills_score(matched_count=10, partial_count=0, total_required=5) == 100
    assert calculate_skills_score(matched_count=0, partial_count=0, total_required=10) == 0

def test_keyword_scoring_exact():
    # 12 present out of 16 keywords = 75%
    score = calculate_keyword_score(present_count=12, total_keywords=16)
    assert score == 75

def test_overall_weighted_score():
    # Formula: 0.40*skills + 0.25*exp + 0.15*kw + 0.10*edu + 0.10*qual
    # Skills=80, Exp=70, Kw=80, Edu=90, Qual=80
    # = 32 + 17.5 + 12 + 9 + 8 = 78.5 -> rounded to 78 or 79
    score = calculate_overall_score(
        skills_score=80,
        experience_score=70,
        keyword_score=80,
        education_score=90,
        quality_score=80
    )
    assert score in [78, 79]
