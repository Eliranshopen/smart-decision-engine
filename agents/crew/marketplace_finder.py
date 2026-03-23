"""
MarketplaceFinderAgent — discovers affiliate course marketplaces that are
accessible (have a working API or can be scraped).

Returns a list of dicts:
  {name, base_url, access_method, search_url, affiliate_link_template, notes}
"""
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

# Known affiliate course marketplaces to test
CANDIDATES = [
    {
        "name": "Coursera",
        "base_url": "https://api.coursera.org",
        "probe_url": "https://api.coursera.org/api/courses.v1?limit=1&fields=name,slug",
        "search_url": "https://api.coursera.org/api/courses.v1?limit=100&fields=name,slug,workload,courseType&start={start}",
        "affiliate_link_template": "https://www.coursera.org/learn/{slug}",
        "access_method": "api",
        "category": "courses",
    },
    {
        "name": "Digistore24",
        "base_url": "https://www.digistore24.com",
        "probe_url": "https://www.digistore24.com/api/call/listProducts/api_key/demo/",
        "search_url": "https://www.digistore24.com/api/call/listProducts/api_key/demo/?category=elearning",
        "affiliate_link_template": "https://www.digistore24.com/redir/{product_id}/AFFILIATE_ID/",
        "access_method": "api",
        "category": "courses",
    },
    {
        "name": "JVZoo",
        "base_url": "https://www.jvzoo.com",
        "probe_url": "https://www.jvzoo.com/api/",
        "search_url": "https://www.jvzoo.com/api/",
        "affiliate_link_template": "https://www.jvzoo.com/c/AFFILIATE_ID/{product_id}",
        "access_method": "scrape",
        "category": "ai-tools",
    },
    {
        "name": "WarriorPlus",
        "base_url": "https://warriorplus.com",
        "probe_url": "https://warriorplus.com/o2/v/TESTID/0",
        "search_url": "https://warriorplus.com/marketplace",
        "affiliate_link_template": "https://warriorplus.com/o2/buy/{product_id}/0/AFFILIATE_ID",
        "access_method": "scrape",
        "category": "ai-tools",
    },
    {
        "name": "Udemy",
        "base_url": "https://www.udemy.com",
        "probe_url": "https://www.udemy.com/api-2.0/courses/?search=AI&page_size=1&language=en",
        "search_url": "https://www.udemy.com/api-2.0/courses/?search={query}&page_size=20&ordering=highest-rated&language=en&price=price-paid",
        "affiliate_link_template": "https://www.udemy.com/course/{slug}/?couponCode=AFFILIATE",
        "access_method": "api",
        "category": "courses",
    },
    {
        "name": "edX",
        "base_url": "https://www.edx.org",
        "probe_url": "https://www.edx.org/api/catalog/v2/courses?search=AI&page_size=1",
        "search_url": "https://www.edx.org/api/catalog/v2/courses?search={query}&page_size=20",
        "affiliate_link_template": "https://www.edx.org/course/{slug}",
        "access_method": "api",
        "category": "courses",
    },
]


def probe_url(url: str, timeout: int = 8) -> tuple[bool, int]:
    """Returns (accessible, status_code)."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        # Consider 200 and 401/403 as "reachable" (403 = exists but needs auth)
        accessible = resp.status_code in (200, 401)
        return accessible, resp.status_code
    except Exception:
        return False, 0


def run_marketplace_finder() -> list[dict]:
    """Test each candidate marketplace and return the accessible ones."""
    print("[marketplace_finder] Testing affiliate course marketplaces...\n")
    accessible = []

    for candidate in CANDIDATES:
        ok, code = probe_url(candidate["probe_url"])
        status = "OK" if ok else "FAIL"
        print(f"  [{status}] {candidate['name']} - HTTP {code}")
        if ok:
            accessible.append(candidate)

    print(f"\n[marketplace_finder] {len(accessible)}/{len(CANDIDATES)} marketplaces accessible.")
    return accessible


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    results = run_marketplace_finder()
    for r in results:
        print(f"  → {r['name']} ({r['access_method']})")
