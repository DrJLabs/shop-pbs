from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, Optional
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


def _load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open() as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def _extract_file(obj: Dict) -> Optional[Dict]:
    if obj.get("__parentId"):
        return None
    if "url" in obj and obj.get("url"):
        return {"url": obj.get("url"), "alt": obj.get("alt")}
    image = obj.get("image") or {}
    if image.get("url"):
        return {"url": image.get("url"), "alt": image.get("altText")}
    return None


def _file_create(api_url: str, token: str, file_url: str, alt: Optional[str]) -> None:
    mutation = """
    mutation($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
    """
    variables = {"files": [{"originalSource": file_url, "alt": alt}]}
    data = _graphql(api_url, token, mutation, variables)
    errors = data.get("data", {}).get("fileCreate", {}).get("userErrors", [])
    if errors:
        raise RuntimeError(f"fileCreate failed: {errors}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Transfer Admin Files to dev store")
    parser.add_argument("--env", default="env.dev", help="Dev env file")
    parser.add_argument("--input", required=True, help="Input export directory")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env_file(args.env)
    graphql_url = f"https://{env.shop}.myshopify.com/admin/api/{env.api_version}/graphql.json"

    input_dir = Path(args.input)
    files_path = input_dir / "files.jsonl"
    if not files_path.exists():
        raise SystemExit(f"Missing files.jsonl in {input_dir}")

    files = []
    for obj in _load_jsonl(files_path):
        item = _extract_file(obj)
        if item:
            files.append(item)

    if args.dry_run:
        print(f"files: {len(files)}")
        return 0

    for item in files:
        _file_create(graphql_url, env.token, item["url"], item.get("alt"))
        time.sleep(0.2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
