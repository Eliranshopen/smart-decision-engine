"""
ClickBank Marketplace scraper — fetches top products by Gravity score
and generates HopLinks automatically using the affiliate nickname.
"""
import os
import requests


CLICKBANK_API_KEY = os.environ.get("CLICKBANK_API_KEY", "")
AFFILIATE_NICKNAME = os.environ.get("AFFILIATE_ID_CLICKBANK", "eliran2026")

# Categories relevant to our platform
RELEVANT_CATEGORIES = [
    "business",
    "computers",
    "education",
    "software",
    "ebusiness",
]

CATEGORY_MAP = {
    "business": "saas",
    "computers": "ai-tools",
    "education": "courses",
    "software": "ai-tools",
    "ebusiness": "saas",
}


def fetch_top_products(min_gravity: float = 10.0, max_results: int = 20) -> list[dict]:
    """
    Fetch top ClickBank products via the Analytics API sorted by gravity.
    Returns a list of product dicts ready for affiliate_scout upsert.
    """
    if not CLICKBANK_API_KEY:
        print("[clickbank] No API key found, skipping live fetch.")
        return []

    headers = {
        "Authorization": CLICKBANK_API_KEY,
        "Accept": "application/json",
    }

    products = []

    for category in RELEVANT_CATEGORIES:
        try:
            url = (
                f"https://api.clickbank.com/rest/1.3/products/list"
                f"?site={AFFILIATE_NICKNAME}"
                f"&category={category}"
                f"&sortField=GRAVITY"
                f"&sortDirection=DESC"
                f"&resultsPerPage={max_results}"
            )
            resp = requests.get(url, headers=headers, timeout=15)

            if resp.status_code == 401:
                print(f"[clickbank] Auth failed — check API key permissions.")
                break
            if resp.status_code != 200:
                print(f"[clickbank] {category}: HTTP {resp.status_code}")
                continue

            data = resp.json()
            items = data.get("products", {}).get("product", [])
            if isinstance(items, dict):
                items = [items]  # single result wrapped in dict

            for item in items:
                gravity = float(item.get("gravity", 0))
                if gravity < min_gravity:
                    continue

                site_id = item.get("site", "")
                title = item.get("title", site_id)
                commission_pct = float(item.get("commission", {}).get("affiliate", 0))
                avg_per_sale = float(item.get("earnings", {}).get("totalEarningsPerSale", 0))

                # Generate HopLink automatically
                hop_link = f"https://{AFFILIATE_NICKNAME}.{site_id}.hop.clickbank.net"

                product = {
                    "site_name": title,
                    "affiliate_link": hop_link,
                    "category": CATEGORY_MAP.get(category, "saas"),
                    "commission_pct": commission_pct,
                    "ease_of_joining": 10,  # ClickBank is always open
                    "trustworthiness": min(7.0, gravity / 10),
                    "popularity_score": min(10.0, gravity / 8),
                    "trend_score": 7.0,
                    "risk_score": 2.5,
                    "conversion_score": min(9.0, avg_per_sale / 20),
                }
                products.append(product)
                print(f"[clickbank] Found: {title} (gravity={gravity:.1f}, commission={commission_pct}%)")

        except Exception as e:
            print(f"[clickbank] Error fetching {category}: {e}")

    # Deduplicate by site_name
    seen = set()
    unique = []
    for p in products:
        if p["site_name"] not in seen:
            seen.add(p["site_name"])
            unique.append(p)

    print(f"[clickbank] Total unique products fetched: {len(unique)}")
    return unique
