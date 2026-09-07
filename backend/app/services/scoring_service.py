# Configurable weights across the hybrid evaluation dimensions (35/25/20/10/10)
SCORE_WEIGHTS = {
    "skills": 0.35,
    "experience": 0.25,
    "keywords": 0.20,
    "education": 0.10,
    "quality": 0.10,
}

def calculate_skills_score(matched_count: int, partial_count: int, total_required: int) -> int:
    """
    Deterministic calculation for skills match percentage (35% total weight).
    Strong matches award 1.0 point, partial matches award 0.5 points.
    """
    if total_required <= 0:
        return 100 if matched_count > 0 else 70
    
    score = ((matched_count + 0.5 * partial_count) / total_required) * 100
    return max(0, min(100, round(score)))

def calculate_keyword_score(present_count: int, total_keywords: int) -> int:
    """
    Deterministic calculation for keyword coverage (20% total weight).
    """
    if total_keywords <= 0:
        return 100 if present_count > 0 else 70
        
    score = (present_count / total_keywords) * 100
    return max(0, min(100, round(score)))

def calculate_overall_score(
    skills_score: int,
    experience_score: int,
    keyword_score: int,
    education_score: int,
    quality_score: int
) -> int:
    """
    Computes the deterministic weighted overall score:
    35% Skills + 25% Experience + 20% Keywords + 10% Education + 10% Quality.
    """
    weighted = (
        skills_score * SCORE_WEIGHTS["skills"] +
        experience_score * SCORE_WEIGHTS["experience"] +
        keyword_score * SCORE_WEIGHTS["keywords"] +
        education_score * SCORE_WEIGHTS["education"] +
        quality_score * SCORE_WEIGHTS["quality"]
    )
    return max(0, min(100, round(weighted)))

