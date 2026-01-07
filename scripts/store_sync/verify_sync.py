from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Optional
from urllib.error import HTTPError
from urllib.request import Request, urlopen

sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.store_sync.config import load_env_file


def _rest(api_url: str, token: str, path: str) -> Dict:
    url = f"{api_url}{path}"
    req = Request(url, method="GET")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    with urlopen(req) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body) if body else {}


def _counts(api_url: str, token: str) -> Dict[str, int]:
    counts = {
        "products": _rest(api_url, token, "/products/count.json").get("count", 0),
        "custom_collections": _rest(api_url, token, "/custom_collections/count.json").get("count", 0),
        "smart_collections": _rest(api_url, token, "/smart_collections/count.json").get("count", 0),
        "pages": _rest(api_url, token, "/pages/count.json").get("count", 0),
        "blogs": _rest(api_url, token, "/blogs/count.json").get("count", 0),
        "articles": _rest(api_url, token, "/articles/count.json").get("count", 0),
    }
    try:
        counts["files"] = _rest(api_url, token, "/files/count.json").get("count", 0)
    except HTTPError:
        counts["files"] = -1
    return counts


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify dev store counts against prod")
    parser.add_argument("--prod", default=".env", help="Prod env file")
    parser.add_argument("--dev", default="env.dev", help="Dev env file")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.dry_run:
        print("dry-run")
        return 0

    prod_env = load_env_file(args.prod)
    dev_env = load_env_file(args.dev)

    prod_url = f"https://{prod_env.shop}.myshopify.com/admin/api/{prod_env.api_version}"
    dev_url = f"https://{dev_env.shop}.myshopify.com/admin/api/{dev_env.api_version}"

    prod_counts = _counts(prod_url, prod_env.token)
    dev_counts = _counts(dev_url, dev_env.token)

    failed = False
    for key, prod_value in prod_counts.items():
        dev_value = dev_counts.get(key, 0)
        status = "OK" if dev_value >= prod_value else "LOW"
        print(f"{key}: prod={prod_value} dev={dev_value} {status}")
        if status == "LOW":
            failed = True

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
