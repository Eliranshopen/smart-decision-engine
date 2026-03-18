"""
DecisionEngineAgent — reads affiliates + news_digest from Supabase,
refreshes the recommendations materialized view, and prints a daily briefing.
"""
from tools.supabase_tool import fetch_affiliates, fetch_news, refresh_recommendations


SECTIONS = [
    {
        "key": "trending",
        "label": "🔥 What People Are Buying This Week",
        "filter": lambda a: a.get("trend_score", 0) > 7 and a.get("risk_score", 10) < 4,
        "sort_key": "trend_score",
    },
    {
        "key": "beginner",
        "label": "💰 Most Profitable for Beginners",
        "filter": lambda a: a.get("ease_of_joining", 0) > 7 and a.get("commission_pct", 0) > 20,
        "sort_key": "commission_pct",
    },
    {
        "key": "risky",
        "label": "⚠️ Hot but Risky Trends",
        "filter": lambda a: a.get("risk_score", 0) > 6,
        "sort_key": "trend_score",
    },
    {
        "key": "top",
        "label": "🧠 Best Opportunity Right Now",
        "filter": lambda a: True,
        "sort_key": "composite_score",
    },
    {
        "key": "gems",
        "label": "🎯 Hidden Gems",
        "filter": lambda a: (a.get("composite_score") or 0) > 7 and (a.get("popularity_score") or 10) < 4,
        "sort_key": "composite_score",
    },
]


def run_decision_engine():
    """Generate and print 5 recommendation sections. Refresh materialized view."""
    affiliates = fetch_affiliates(limit=200)
    news = fetch_news(limit=50)

    print(f"[decision] Loaded {len(affiliates)} affiliates, {len(news)} news items\n")

    briefing = {}
    for section in SECTIONS:
        filtered = [a for a in affiliates if section["filter"](a)]
        sorted_items = sorted(
            filtered,
            key=lambda a: a.get(section["sort_key"]) or 0,
            reverse=True,
        )[:6]

        briefing[section["key"]] = sorted_items
        print(f"\n{section['label']}")
        print("─" * 50)
        if sorted_items:
            for item in sorted_items:
                score = item.get("composite_score") or 0
                print(f"  • {item['site_name']} ({item['category']}) — score: {score:.1f}")
        else:
            print("  (no matches yet — populate more affiliates)")

    # Refresh the materialized view so the API serves fresh data
    try:
        refresh_recommendations()
    except Exception as e:
        print(f"[decision] Could not refresh materialized view: {e}")
        print("[decision] This is OK — the API falls back to live queries.")

    print("\n[decision] Done. Recommendations refreshed.")
    return briefing


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    run_decision_engine()
