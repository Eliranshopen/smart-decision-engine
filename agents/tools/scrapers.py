"""
Data fetchers for HackerNews, Reddit, and ProductHunt.
No authentication required — all public APIs.
"""
import requests

HN_TOP_STORIES = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM        = "https://hacker-news.firebaseio.com/v0/item/{}.json"
REDDIT_JSON    = "https://www.reddit.com/r/{}/hot.json?limit=25"
PH_API         = "https://api.producthunt.com/v2/api/graphql"

HEADERS = {"User-Agent": "SmartDecisionEngine/1.0 (+https://github.com/Eliranshopen/smart-decision-engine)"}


def fetch_hackernews(limit: int = 30) -> list[dict]:
    """Return the top `limit` HN stories as dicts with title, url, score."""
    try:
        ids = requests.get(HN_TOP_STORIES, headers=HEADERS, timeout=10).json()[:limit]
        items = []
        for story_id in ids:
            item = requests.get(HN_ITEM.format(story_id), headers=HEADERS, timeout=5).json()
            if item and item.get("type") == "story":
                items.append({
                    "headline": item.get("title", ""),
                    "source_url": item.get("url") or f"https://news.ycombinator.com/item?id={story_id}",
                    "summary": item.get("text", "")[:500] if item.get("text") else "",
                    "published_at": None,  # HN returns Unix timestamp — skipping for brevity
                })
        return items
    except Exception as e:
        print(f"[scrapers] HackerNews fetch failed: {e}")
        return []


def fetch_reddit(subreddits: list[str] = None) -> list[dict]:
    """Fetch hot posts from multiple subreddits."""
    if subreddits is None:
        subreddits = ["entrepreneur", "ChatGPT", "SideProject", "passive_income"]

    items = []
    for sub in subreddits:
        try:
            resp = requests.get(
                REDDIT_JSON.format(sub),
                headers={**HEADERS, "Accept": "application/json"},
                timeout=10,
            )
            posts = resp.json().get("data", {}).get("children", [])
            for post in posts:
                d = post.get("data", {})
                if d.get("is_self") or not d.get("title"):
                    continue
                items.append({
                    "headline": d.get("title", "")[:300],
                    "source_url": f"https://reddit.com{d.get('permalink', '')}",
                    "summary": (d.get("selftext") or d.get("title", ""))[:500],
                    "published_at": None,
                })
        except Exception as e:
            print(f"[scrapers] Reddit r/{sub} fetch failed: {e}")
    return items


def fetch_producthunt(limit: int = 20) -> list[dict]:
    """
    Fetch today's top products from ProductHunt via GraphQL.
    TODO: Set PH_TOKEN env var (Bearer token) for authenticated requests to increase rate limits.
    Without auth, this endpoint may be rate-limited.
    """
    import os
    token = os.environ.get("PH_TOKEN", "")
    query = """
    {
      posts(first: %d, order: VOTES) {
        edges {
          node {
            name
            tagline
            website
            votesCount
            createdAt
          }
        }
      }
    }
    """ % limit

    headers = {**HEADERS, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        resp = requests.post(PH_API, json={"query": query}, headers=headers, timeout=10)
        edges = resp.json().get("data", {}).get("posts", {}).get("edges", [])
        return [
            {
                "headline": f"{e['node']['name']} — {e['node']['tagline']}",
                "source_url": e["node"].get("website") or "https://www.producthunt.com",
                "summary": e["node"].get("tagline", ""),
                "published_at": e["node"].get("createdAt"),
            }
            for e in edges
            if e.get("node")
        ]
    except Exception as e:
        print(f"[scrapers] ProductHunt fetch failed: {e}")
        return []
