"""Supabase client singleton + upsert helpers used by all agents."""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(url, key)
    return _client


def upsert_affiliates(records: list[dict]) -> None:
    """Upsert a list of affiliate records. Conflict key: site_name."""
    if not records:
        return
    sb = get_supabase()
    result = sb.table("affiliates").upsert(records, on_conflict="site_name").execute()
    print(f"[supabase] upserted {len(records)} affiliates -> {len(result.data)} rows affected")


def upsert_news(records: list[dict]) -> None:
    """Upsert a list of news_digest records. Conflict key: source_url."""
    if not records:
        return
    sb = get_supabase()
    result = sb.table("news_digest").upsert(records, on_conflict="source_url").execute()
    print(f"[supabase] upserted {len(records)} news items -> {len(result.data)} rows affected")


def fetch_affiliates(limit: int = 200) -> list[dict]:
    sb = get_supabase()
    result = sb.table("affiliates").select("*").order("composite_score", desc=True).limit(limit).execute()
    return result.data or []


def fetch_news(limit: int = 100) -> list[dict]:
    sb = get_supabase()
    result = sb.table("news_digest").select("*").order("published_at", desc=True).limit(limit).execute()
    return result.data or []


def refresh_recommendations() -> None:
    """Refresh the materialized view so recommendations are up to date."""
    sb = get_supabase()
    sb.rpc("refresh_recommendations_view").execute()
    print("[supabase] refreshed recommendations materialized view")
