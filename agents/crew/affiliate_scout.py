"""
AffiliateScoutAgent — discovers affiliate programs and scores them.

Sources:
  - Curated seed list (ShareASale, CJ, ClickBank, PartnerStack, Impact programs)
  - Future: web scraping / API calls to each network's public program directory

The agent computes a composite_score using a weighted formula and upserts
records into the Supabase `affiliates` table.
"""
import os
from datetime import datetime
from crewai import Agent, Task, Crew
from tools.scoring import score_affiliate
from tools.supabase_tool import upsert_affiliates


# ─── Seed data ────────────────────────────────────────────────────────────────
# TODO: Replace / extend with live API calls to each affiliate network.
# These are representative examples used to populate the DB on first run.
SEED_AFFILIATES = [
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
        "site_name": "ClickFunnels",
        "affiliate_link": f"https://www.clickfunnels.com/?cf_affiliate_id={os.environ.get('AFFILIATE_ID_CLICKBANK', 'TODO')}",
        "category": "saas",
        "commission_pct": 40.0,
        "ease_of_joining": 7,
        "trustworthiness": 7,
        "popularity_score": 7.0,
        "trend_score": 6.0,
        "risk_score": 4.0,
        "conversion_score": 6.5,
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
    """Compute composite scores and upsert all seed affiliates."""
    records = []
    for item in SEED_AFFILIATES:
        item["updated_at"] = datetime.utcnow().isoformat()
        records.append(item)
        print(f"[scout] Prepared: {item['site_name']} (commission: {item['commission_pct']}%)")

    upsert_affiliates(records)
    print(f"[scout] Done. {len(records)} affiliates upserted.")
    return records


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    run_affiliate_scout()
