"""
AffiliateScoutAgent — discovers affiliate programs and scores them.

Sources:
  - Curated seed list (ShareASale, CJ, ClickBank, PartnerStack, Impact programs)
  - Future: web scraping / API calls to each network's public program directory

The agent computes a composite_score using a weighted formula and upserts
records into the Supabase `affiliates` table.
"""
import os
import re
import requests
from datetime import datetime
from crewai import Agent, Task, Crew
from tools.scoring import score_affiliate
from tools.supabase_tool import upsert_affiliates
from tools.clickbank_scraper import fetch_top_products


def find_youtube_preview(url: str, timeout: int = 5) -> str | None:
    """
    Fetches the product page at `url` and returns the first YouTube embed
    URL found in the HTML, or None if not found.
    """
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200:
            return None
        # Match YouTube embed or watch URLs in the page source
        match = re.search(
            r'(?:youtube\.com/embed/|youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})',
            resp.text
        )
        if match:
            return f"https://www.youtube.com/watch?v={match.group(1)}"
    except Exception:
        pass
    return None


# ─── Seed data ────────────────────────────────────────────────────────────────
# TODO: Replace / extend with live API calls to each affiliate network.
# These are representative examples used to populate the DB on first run.
SEED_AFFILIATES = [
    {
        "site_name": "AI Beginner Course",
        "affiliate_link": "https://cbc23zy7z8vp9-j890l7f4rnfx.hop.clickbank.net",
        "category": "courses",
        "commission_pct": 75.0,
        "ease_of_joining": 10,
        "trustworthiness": 7,
        "popularity_score": 6.5,
        "trend_score": 8.0,
        "risk_score": 2.0,
        "conversion_score": 6.5,
    },
    {
        "site_name": "Jasper AI",
        "affiliate_link": f"https://www.jasper.ai/?fpr={os.environ.get('AFFILIATE_ID_PARTNERSTACK', 'TODO')}",
        "category": "ai-tools",
        "commission_pct": 30.0,
        "ease_of_joining": 9,
        "trustworthiness": 9,
        "popularity_score": 8.5,
        "trend_score": 8.0,
        "risk_score": 2.0,
        "conversion_score": 7.5,
    },
    {
        "site_name": "Teachable",
        "affiliate_link": f"https://teachable.com/?via={os.environ.get('AFFILIATE_ID_SHAREASALE', 'TODO')}",
        "category": "courses",
        "commission_pct": 30.0,
        "ease_of_joining": 8,
        "trustworthiness": 9,
        "popularity_score": 7.5,
        "trend_score": 6.5,
        "risk_score": 1.5,
        "conversion_score": 7.0,
    },
    {
        "site_name": "InstaDoodle",
        "affiliate_link": "https://42ccc4wh3xwn8xab0fzwqby7xv.hop.clickbank.net",
        "category": "ai-tools",
        "commission_pct": 50.0,
        "ease_of_joining": 10,
        "trustworthiness": 7,
        "popularity_score": 7.5,
        "trend_score": 7.5,
        "risk_score": 2.5,
        "conversion_score": 7.0,
    },
    {
        "site_name": "Semrush",
        "affiliate_link": f"https://www.semrush.com/?ref={os.environ.get('AFFILIATE_ID_CJ', 'TODO')}",
        "category": "saas",
        "commission_pct": 200.0,  # $200 per sale (flat)
        "ease_of_joining": 7,
        "trustworthiness": 10,
        "popularity_score": 9.0,
        "trend_score": 8.5,
        "risk_score": 1.0,
        "conversion_score": 8.0,
    },
    {
        "site_name": "Coinbase",
        "affiliate_link": f"https://coinbase.com/join/{os.environ.get('AFFILIATE_ID_IMPACT', 'TODO')}",
        "category": "finance",
        "commission_pct": 50.0,
        "ease_of_joining": 6,
        "trustworthiness": 8,
        "popularity_score": 9.5,
        "trend_score": 7.0,
        "risk_score": 6.0,
        "conversion_score": 6.0,
    },
    {
        "site_name": "Notion",
        "affiliate_link": "https://www.notion.so/product/affiliate",
        "category": "saas",
        "commission_pct": 50.0,
        "ease_of_joining": 9,
        "trustworthiness": 10,
        "popularity_score": 9.0,
        "trend_score": 8.0,
        "risk_score": 1.0,
        "conversion_score": 8.5,
    },
    {
        "site_name": "Coursera",
        "affiliate_link": "https://www.coursera.org/affiliate",
        "category": "courses",
        "commission_pct": 45.0,
        "ease_of_joining": 7,
        "trustworthiness": 10,
        "popularity_score": 9.5,
        "trend_score": 7.5,
        "risk_score": 1.0,
        "conversion_score": 7.5,
    },
    {
        "site_name": "Shopify",
        "affiliate_link": "https://www.shopify.com/affiliates",
        "category": "saas",
        "commission_pct": 200.0,  # $200 average
        "ease_of_joining": 8,
        "trustworthiness": 10,
        "popularity_score": 10.0,
        "trend_score": 8.0,
        "risk_score": 1.5,
        "conversion_score": 8.5,
    },
]


def run_affiliate_scout():
    """Fetch live ClickBank products + seed data, score and upsert all."""
    # 1. Try to fetch live products from ClickBank API
    live_products = fetch_top_products(min_gravity=10.0, max_results=20)

    # 2. Fall back to seed data if API returns nothing
    base_list = live_products if live_products else SEED_AFFILIATES
    if not live_products:
        print("[scout] No live products fetched — using seed data as fallback.")

    records = []
    for item in base_list:
        item["updated_at"] = datetime.utcnow().isoformat()
        # Try to find a YouTube trailer if not already set
        if not item.get("preview_video_url"):
            link = item.get("affiliate_link") or item.get("course_url", "")
            if link and "hop.clickbank.net" not in link:
                yt = find_youtube_preview(link)
                if yt:
                    item["preview_video_url"] = yt
                    print(f"[scout] Found YouTube preview for {item['site_name']}: {yt}")
        records.append(item)
        print(f"[scout] Prepared: {item['site_name']} (commission: {item['commission_pct']}%)")

    # 3. Always include our manually confirmed ClickBank links
    manual = [
        {
            "site_name": "InstaDoodle",
            "affiliate_link": "https://42ccc4wh3xwn8xab0fzwqby7xv.hop.clickbank.net",
            "category": "ai-tools",
            "commission_pct": 50.0,
            "ease_of_joining": 10,
            "trustworthiness": 7,
            "popularity_score": 7.5,
            "trend_score": 7.5,
            "risk_score": 2.5,
            "conversion_score": 7.0,
            "updated_at": datetime.utcnow().isoformat(),
        },
        {
            "site_name": "AI Beginner Course",
            "affiliate_link": "https://cbc23zy7z8vp9-j890l7f4rnfx.hop.clickbank.net",
            "category": "courses",
            "commission_pct": 75.0,
            "ease_of_joining": 10,
            "trustworthiness": 7,
            "popularity_score": 6.5,
            "trend_score": 8.0,
            "risk_score": 2.0,
            "conversion_score": 6.5,
            "updated_at": datetime.utcnow().isoformat(),
        },
    ]
    # Add manual ones only if not already in records
    existing_names = {r["site_name"] for r in records}
    for m in manual:
        if m["site_name"] not in existing_names:
            records.append(m)

    upsert_affiliates(records)
    print(f"[scout] Done. {len(records)} affiliates upserted.")
    return records


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    run_affiliate_scout()
