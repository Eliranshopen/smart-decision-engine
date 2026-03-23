"""
Smart Decision Engine — Agent runner.

Usage:
  python main.py            # run all agents once and exit
  python main.py --schedule # run once, then on a weekly schedule (Railway Worker)
"""
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")

from crew.affiliate_scout import run_affiliate_scout
from crew.news_digest import run_news_digest
from crew.decision_engine import run_decision_engine
from crew.marketplace_finder import run_marketplace_finder
from crew.course_scout import run_course_scout


def run_all():
    print("\n" + "=" * 60)
    print("  Smart Decision Engine — Agent Run")
    print("=" * 60 + "\n")

    print("▶ Phase 1/5: MarketplaceFinderAgent")
    marketplaces = []
    try:
        marketplaces = run_marketplace_finder()
    except Exception as e:
        print(f"[main] MarketplaceFinderAgent failed: {e}")

    print("\n▶ Phase 2/5: CourseScoutAgent")
    try:
        run_course_scout(marketplaces)
    except Exception as e:
        print(f"[main] CourseScoutAgent failed: {e}")

    print("\n▶ Phase 3/5: AffiliateScoutAgent")
    try:
        run_affiliate_scout()
    except Exception as e:
        print(f"[main] AffiliateScoutAgent failed: {e}")

    print("\n▶ Phase 4/5: NewsDigestAgent")
    try:
        run_news_digest()
    except Exception as e:
        print(f"[main] NewsDigestAgent failed: {e}")

    print("\n▶ Phase 5/5: DecisionEngineAgent")
    try:
        run_decision_engine()
    except Exception as e:
        print(f"[main] DecisionEngineAgent failed: {e}")

    print("\n✅ All agents complete.\n")


if __name__ == "__main__":
    if "--schedule" in sys.argv:
        from apscheduler.schedulers.blocking import BlockingScheduler
        scheduler = BlockingScheduler(timezone="UTC")

        # Run immediately on start
        run_all()

        # Then run every Sunday at 06:00 UTC
        scheduler.add_job(run_all, "cron", day_of_week="sun", hour=6, minute=0)
        print("[scheduler] Scheduled weekly run every Sunday at 06:00 UTC. Press Ctrl+C to stop.")
        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            print("[scheduler] Stopped.")
    else:
        run_all()
