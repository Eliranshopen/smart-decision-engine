"""
NewsDigestAgent — scans HackerNews, Reddit, and ProductHunt,
scores each item, and upserts to news_digest table.
"""
from datetime import datetime, timezone
from tools.scrapers import fetch_hackernews, fetch_reddit, fetch_producthunt
from tools.scoring import score_credibility, score_risk_level, score_opportunity
from tools.supabase_tool import upsert_news


def _enrich(raw_items: list[dict]) -> list[dict]:
    """Add scoring fields to raw scraped items."""
    enriched = []
    for item in raw_items:
        text = f"{item.get('headline', '')} {item.get('summary', '')}"
        enriched.append({
            **item,
            "risk_level": score_risk_level(text),
            "opportunity_level": score_opportunity(text),
            "credibility": score_credibility(item.get("source_url", "")),
            "published_at": item.get("published_at") or datetime.now(timezone.utc).isoformat(),
        })
    return enriched


def run_news_digest():
    """Fetch, score, and upsert news from all sources."""
    print("[news] Fetching from HackerNews...")
    hn_items = fetch_hackernews(limit=20)

    print("[news] Fetching from Reddit...")
    reddit_items = fetch_reddit()

    print("[news] Fetching from ProductHunt...")
    ph_items = fetch_producthunt(limit=15)

    all_items = hn_items + reddit_items + ph_items
    print(f"[news] Total raw items: {len(all_items)}")

    # Deduplicate by source_url
    seen = set()
    unique = []
    for item in all_items:
        url = item.get("source_url", "")
        if url not in seen:
            seen.add(url)
            unique.append(item)

    enriched = _enrich(unique)
    upsert_news(enriched)
    print(f"[news] Done. {len(enriched)} items upserted.")
    return enriched


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    run_news_digest()
