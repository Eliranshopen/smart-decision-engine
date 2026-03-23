"""
CourseScoutAgent — given a list of accessible marketplaces (from MarketplaceFinder),
fetches the best-selling AI courses and upserts them into Supabase.
"""
import os
import re
import requests
from datetime import datetime
from tools.supabase_tool import upsert_affiliates

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

AI_KEYWORDS = [
    "artificial intelligence", "chatgpt", "machine learning", "deep learning",
    "neural network", "llm", "gpt", "generative ai", "prompt engineering",
    "ai automation", "ai tools", "ai course", "openai",
]

# Hebrew keywords for filtering Campus IL results
AI_KEYWORDS_HE = [
    "בינה מלאכותית", "למידת מכונה", "chatgpt", "gpt", "ai", "בינה",
    "אוטומציה", "נוירוני", "עיבוד שפה", "ראייה ממוחשבת", "llm",
]


def is_ai_course_he(name: str) -> bool:
    name_lower = name.lower()
    return any(kw in name_lower for kw in AI_KEYWORDS_HE)


def calc_scores(popularity: float, commission: float) -> dict:
    p = min(popularity, 10.0)
    return {
        "popularity_score": round(p, 2),
        "trend_score": round(min(p * 1.1, 10.0), 2),
        "trustworthiness": int(round(min(6.0 + p * 0.3, 10.0))),  # INTEGER column
        "risk_score": round(max(1.0, 4.0 - p * 0.3), 2),
        "ease_of_joining": 8,  # INTEGER column
        "conversion_score": round(min(p * 0.9, 9.0), 2),
    }


def is_ai_course(name: str) -> bool:
    name_lower = name.lower()
    return any(kw in name_lower for kw in AI_KEYWORDS)


# --- Coursera ------------------------------------------------------------------

def scrape_coursera(marketplace: dict) -> list[dict]:
    """
    Scans the Coursera public catalog and filters for AI-related courses.
    Stops after finding 30 AI courses or scanning 2000 courses total.
    """
    results = []
    seen = set()
    scanned = 0
    start = 0
    max_scan = 2000
    target = 30

    print("[course_scout] Coursera: scanning catalog for AI courses...")

    while scanned < max_scan and len(results) < target:
        url = marketplace["search_url"].format(start=start)
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                print(f"[course_scout] Coursera HTTP {resp.status_code}")
                break
            data = resp.json()
            items = data.get("elements", [])
            if not items:
                break

            for item in items:
                slug = item.get("slug", "")
                name = item.get("name", "")
                if not slug or not name or slug in seen:
                    continue
                if is_ai_course(name):
                    seen.add(slug)
                    results.append({
                        "site_name": name[:120],
                        "affiliate_link": f"https://www.coursera.org/learn/{slug}",
                        "category": "courses",
                        "commission_pct": 45.0,
                        "popularity_score": 8.0,
                        "trend_score": 8.0,
                        "trustworthiness": 9,
                        "risk_score": 1.0,
                        "ease_of_joining": 8,
                        "conversion_score": 7.5,
                        "updated_at": datetime.utcnow().isoformat(),
                    })

            scanned += len(items)
            start += len(items)

        except Exception as e:
            print(f"[course_scout] Coursera error at start={start}: {e}")
            break

    print(f"[course_scout] Coursera: {len(results)} AI courses (scanned {scanned})")
    return results


# --- Udemy ---------------------------------------------------------------------

def scrape_udemy(marketplace: dict) -> list[dict]:
    results = []
    seen = set()
    queries = ["artificial intelligence", "ChatGPT course"]

    for query in queries:
        url = marketplace["search_url"].format(query=query.replace(" ", "+"))
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                print(f"[course_scout] Udemy HTTP {resp.status_code}")
                continue
            items = resp.json().get("results", [])
            for item in items:
                slug = item.get("url", "").strip("/").split("/")[-1]
                name = item.get("title", "")
                if not slug or not name or slug in seen:
                    continue
                seen.add(slug)
                rating = float(item.get("rating", 4.0))
                num_reviews = int(item.get("num_reviews", 0))
                popularity = min(10.0, rating * 1.5 + min(num_reviews / 10000, 3.0))
                scores = calc_scores(popularity, 30.0)
                results.append({
                    "site_name": name[:120],
                    "affiliate_link": f"https://www.udemy.com/course/{slug}/",
                    "category": "courses",
                    "commission_pct": 30.0,
                    "updated_at": datetime.utcnow().isoformat(),
                    **scores,
                })
        except Exception as e:
            print(f"[course_scout] Udemy error: {e}")

    print(f"[course_scout] Udemy: {len(results)} courses")
    return results


# --- edX -----------------------------------------------------------------------

def scrape_edx(marketplace: dict) -> list[dict]:
    results = []
    seen = set()
    queries = ["artificial intelligence", "machine learning"]

    for query in queries:
        url = marketplace["search_url"].format(query=query.replace(" ", "+"))
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                continue
            data = resp.json()
            items = data.get("results", data.get("courses", []))
            for item in items:
                name = item.get("title") or item.get("name", "")
                slug = item.get("key") or item.get("slug") or re.sub(
                    r"[^a-z0-9\-]", "", name.lower().replace(" ", "-"))
                if not name or slug in seen:
                    continue
                seen.add(slug)
                results.append({
                    "site_name": name[:120],
                    "affiliate_link": f"https://www.edx.org/course/{slug}",
                    "category": "courses",
                    "commission_pct": 25.0,
                    "popularity_score": 7.0,
                    "trend_score": 7.0,
                    "trustworthiness": 9.0,
                    "risk_score": 1.0,
                    "ease_of_joining": 7,
                    "trustworthiness": 9,
                    "conversion_score": 6.5,
                    "updated_at": datetime.utcnow().isoformat(),
                })
        except Exception as e:
            print(f"[course_scout] edX error: {e}")

    print(f"[course_scout] edX: {len(results)} courses")
    return results


# --- Udemy Hebrew ---------------------------------------------------------------

def scrape_udemy_hebrew(marketplace: dict) -> list[dict]:
    """
    Fetch Hebrew-language AI courses from Udemy (affiliate program via Impact.com).
    Udemy's public API is often blocked by Cloudflare from server IPs.
    When blocked, returns [] and logs clearly — no crash.
    """
    results = []
    seen = set()
    queries = ["בינה מלאכותית", "ChatGPT", "למידת מכונה", "AI"]

    for query in queries:
        url = marketplace["search_url"].format(query=requests.utils.quote(query))
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 403:
                print("[course_scout] Udemy Hebrew: blocked by Cloudflare (403). Skipping.")
                break
            if resp.status_code != 200:
                print(f"[course_scout] Udemy Hebrew HTTP {resp.status_code}")
                continue
            if "json" not in resp.headers.get("content-type", ""):
                print("[course_scout] Udemy Hebrew: non-JSON response. Skipping.")
                break
            items = resp.json().get("results", [])
            for item in items:
                slug = item.get("url", "").strip("/").split("/")[-1]
                name = item.get("title", "")
                if not slug or not name or slug in seen:
                    continue
                seen.add(slug)
                rating = float(item.get("rating", 4.0))
                num_reviews = int(item.get("num_reviews", 0))
                popularity = min(10.0, rating * 1.5 + min(num_reviews / 10000, 3.0))
                scores = calc_scores(popularity, 30.0)
                results.append({
                    "site_name": name[:120],
                    "affiliate_link": f"https://www.udemy.com/course/{slug}/",
                    "category": "courses",
                    "commission_pct": 30.0,
                    "description": "קורס AI בעברית — למד בינה מלאכותית בשפה שלך, בקצב שלך.",
                    "updated_at": datetime.utcnow().isoformat(),
                    **scores,
                })
        except Exception as e:
            print(f"[course_scout] Udemy Hebrew error: {e}")

    print(f"[course_scout] Udemy Hebrew: {len(results)} courses")
    return results


# --- Dispatcher ----------------------------------------------------------------

SCRAPERS = {
    "Coursera": scrape_coursera,
    "Udemy": scrape_udemy,
    "Udemy Hebrew": scrape_udemy_hebrew,
    "edX": scrape_edx,
}


def run_course_scout(marketplaces: list[dict]) -> list[dict]:
    """Scrape courses from all accessible marketplaces and upsert to Supabase."""
    if not marketplaces:
        print("[course_scout] No accessible marketplaces.")
        return []

    all_courses = []
    for marketplace in marketplaces:
        name = marketplace["name"]
        scraper = SCRAPERS.get(name)
        if not scraper:
            print(f"[course_scout] No scraper for {name}, skipping.")
            continue
        print(f"\n[course_scout] Scraping {name}...")
        try:
            courses = scraper(marketplace)
            all_courses.extend(courses)
        except Exception as e:
            print(f"[course_scout] {name} failed: {e}")

    # Deduplicate by site_name
    seen = {}
    for c in all_courses:
        key = c["site_name"].lower()
        if key not in seen or c.get("popularity_score", 0) > seen[key].get("popularity_score", 0):
            seen[key] = c

    unique = sorted(seen.values(), key=lambda c: c.get("popularity_score", 0), reverse=True)

    print(f"\n[course_scout] Total unique AI courses found: {len(unique)}")

    if unique:
        upsert_affiliates(unique)

    return unique


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    from crew.marketplace_finder import run_marketplace_finder
    marketplaces = run_marketplace_finder()
    run_course_scout(marketplaces)
