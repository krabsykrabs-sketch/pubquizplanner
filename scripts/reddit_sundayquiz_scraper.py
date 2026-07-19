#!/usr/bin/env python3
"""
reddit_sundayquiz_scraper.py
Scrape all posts by u/sundayquiz using Reddit's public JSON API.
Paginates automatically. No auth needed.

Output: data/pipeline/reddit/raw_posts.json
"""

import json
import os
import time
import urllib.request

USER_AGENT = "PubQuizPlanner/1.0"
BASE_URL = "https://www.reddit.com/user/sundayquiz/submitted.json"
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "pipeline", "reddit", "raw_posts.json"
)
DELAY = 2  # seconds between requests


def fetch_page(after=None):
    url = f"{BASE_URL}?limit=100&raw_json=1"
    if after:
        url += f"&after={after}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def scrape_all():
    all_posts = []
    after = None
    page = 0

    while True:
        page += 1
        print(f"Fetching page {page} (after={after})...")
        data = fetch_page(after)
        children = data["data"]["children"]
        if not children:
            break

        for child in children:
            all_posts.append(child["data"])

        after = data["data"].get("after")
        print(f"  Got {len(children)} posts (total: {len(all_posts)})")

        if not after:
            break
        time.sleep(DELAY)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, indent=2, ensure_ascii=False)

    print(f"\nDone. Scraped {len(all_posts)} posts -> {OUTPUT_PATH}")
    return all_posts


if __name__ == "__main__":
    scrape_all()
