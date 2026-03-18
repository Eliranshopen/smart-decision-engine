"""
Scoring utilities shared across all agents.
Formulas are deterministic so results are reproducible and auditable.
"""

# Known high-credibility domains → credibility score bonus
CREDIBLE_DOMAINS = {
    "techcrunch.com": 9,
    "wired.com": 9,
    "forbes.com": 8,
    "inc.com": 8,
    "entrepreneur.com": 8,
    "news.ycombinator.com": 8,
    "producthunt.com": 7,
    "reddit.com": 6,
    "medium.com": 5,
}

# Keywords that increase risk score
RISK_KEYWORDS = [
    "scam", "fraud", "ban", "blocked", "lawsuit", "regulation",
    "fine", "penalty", "crash", "collapse", "shutdown", "hack",
    "breach", "exploit", "warning", "danger", "risk",
]

# Keywords that suggest high opportunity
OPPORTUNITY_KEYWORDS = [
    "launch", "trending", "viral", "record", "growth", "profit",
    "breakthrough", "new", "revolutionary", "ai", "automation",
    "passive income", "affiliate", "revenue", "income", "commission",
]


def score_affiliate(
    commission_pct: float,
    trustworthiness: float,
    popularity_score: float,
    trend_score: float,
    ease_of_joining: float,
) -> float:
    """
    Weighted composite score for an affiliate program.
    Range: roughly 0–100 (normalized to 0–10 by dividing by 10 when needed).
    """
    return (
        commission_pct * 0.30
        + trustworthiness * 2.5
        + popularity_score * 2.0
        + trend_score * 1.5
        + ease_of_joining * 1.0
    )


def score_credibility(source_url: str) -> int:
    """Return a credibility score 1-10 based on source domain."""
    if not source_url:
        return 5
    for domain, score in CREDIBLE_DOMAINS.items():
        if domain in source_url:
            return score
    return 5


def score_risk_level(text: str) -> str:
    """Classify risk_level as 'low', 'medium', or 'high' based on keyword count."""
    if not text:
        return "low"
    text_lower = text.lower()
    hits = sum(1 for kw in RISK_KEYWORDS if kw in text_lower)
    if hits >= 3:
        return "high"
    if hits >= 1:
        return "medium"
    return "low"


def score_opportunity(text: str) -> int:
    """Return an opportunity_level 1-10 based on keyword density."""
    if not text:
        return 5
    text_lower = text.lower()
    hits = sum(1 for kw in OPPORTUNITY_KEYWORDS if kw in text_lower)
    return min(10, max(1, 4 + hits))
