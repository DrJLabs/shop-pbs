from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Optional
from urllib.request import Request, urlopen

sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.store_sync.config import load_env_file


def _graphql(api_url: str, token: str, query: str, variables: Optional[Dict] = None) -> Dict:
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = Request(api_url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    with urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Export installed apps report")
    parser.add_argument("--env", default=".env", help="Prod env file")
    parser.add_argument("--output", default="docs/shopify/dev-store-apps.md")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env_file(args.env)
    graphql_url = f"https://{env.shop}.myshopify.com/admin/api/{env.api_version}/graphql.json"

    query = """
    {
      appInstallations(first: 250) {
        edges {
          node {
            id
            installedAt
            app {
              title
              handle
              developerType
            }
          }
        }
      }
    }
    """

    if args.dry_run:
        print("apps: dry-run")
        return 0
    data = _graphql(graphql_url, env.token, query)
    edges = data.get("data", {}).get("appInstallations", {}).get("edges", [])

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    lines = ["# Installed apps (production)", "", "Manual install required in dev store.", "", "| App | Handle | Developer type | Installed at |", "| --- | --- | --- | --- |"]
    for edge in edges:
        node = edge.get("node", {})
        app = node.get("app", {})
        lines.append(
            f"| {app.get('title', '')} | {app.get('handle', '')} | {app.get('developerType', '')} | {node.get('installedAt', '')} |"
        )

    output.write_text("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
