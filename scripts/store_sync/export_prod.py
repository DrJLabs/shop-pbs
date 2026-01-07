from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.request import Request, urlopen

sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.store_sync.config import load_env_file


BULK_QUERIES: Dict[str, str] = {
    "products": """
    {
      products {
        edges {
          node {
            id
            handle
            title
            descriptionHtml
            vendor
            productType
            tags
            status
            options {
              name
              values
            }
            variants {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                  inventoryPolicy
                  barcode
                  taxable
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            images {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
    """,
    "collections": """
    {
      collections {
        edges {
          node {
            id
            handle
            title
            descriptionHtml
            updatedAt
            sortOrder
            ruleSet {
              appliedDisjunctively
              rules {
                column
                relation
                condition
              }
            }
          }
        }
      }
    }
    """,
    "pages": """
    {
      pages {
        edges {
          node {
            id
            handle
            title
            body
            createdAt
            updatedAt
            isPublished
          }
        }
      }
    }
    """,
    "blogs": """
    {
      blogs {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
    }
    """,
    "articles": """
    {
      articles {
        edges {
          node {
            id
            handle
            title
            body
            summary
            createdAt
            updatedAt
            blog {
              id
            }
            isPublished
          }
        }
      }
    }
    """,
    "metaobjects": "",
    "files": """
    {
      files {
        edges {
          node {
            id
            alt
            createdAt
            fileStatus
            ... on GenericFile {
              url
              mimeType
            }
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    """,
}


def _request_json(url: str, token: str, query: str) -> Dict:
    payload = json.dumps({"query": query}).encode("utf-8")
    req = Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    with urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _run_bulk_query(api_url: str, token: str, query: str) -> str:
    mutation = (
        "mutation bulkRun($query: String!) {"
        " bulkOperationRunQuery(query: $query) {"
        " bulkOperation { id status }"
        " userErrors { field message }"
        " }"
        "}"
    )
    payload = json.dumps({"query": mutation, "variables": {"query": query}}).encode("utf-8")
    req = Request(api_url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    with urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    errors = data.get("errors")
    if errors:
        raise RuntimeError(f"Bulk operation failed: {errors}")
    user_errors = data.get("data", {}).get("bulkOperationRunQuery", {}).get("userErrors", [])
    if user_errors:
        raise RuntimeError(f"Bulk operation userErrors: {user_errors}")
    bulk = data.get("data", {}).get("bulkOperationRunQuery", {}).get("bulkOperation")
    if not bulk:
        raise RuntimeError("Bulk operation not started")
    return bulk.get("id")


def _poll_bulk(api_url: str, token: str, bulk_id: str) -> Dict:
    query = "{ currentBulkOperation { id status errorCode objectCount url } }"
    while True:
        data = _request_json(api_url, token, query)
        current = data.get("data", {}).get("currentBulkOperation")
        if not current:
            raise RuntimeError("No current bulk operation")
        if current.get("id") != bulk_id:
            raise RuntimeError("Bulk operation id mismatch")
        status = current.get("status")
        if status in {"COMPLETED", "FAILED", "CANCELED"}:
            return current
        time.sleep(2)


def _download(url: str, dest: Path) -> None:
    req = Request(url)
    with urlopen(req) as resp, dest.open("wb") as handle:
        handle.write(resp.read())


def _parse_only(values: Optional[str]) -> Iterable[str]:
    if not values:
        return BULK_QUERIES.keys()
    return [v.strip() for v in values.split(",") if v.strip()]


def _get_metaobject_types(api_url: str, token: str) -> List[str]:
    query = """
    {
      metaobjectDefinitions(first: 250) {
        edges {
          node {
            type
          }
        }
      }
    }
    """
    data = _request_json(api_url, token, query)
    edges = data.get("data", {}).get("metaobjectDefinitions", {}).get("edges", [])
    return [edge.get("node", {}).get("type") for edge in edges if edge.get("node", {}).get("type")]


def main() -> int:
    parser = argparse.ArgumentParser(description="Export store data via bulk ops")
    parser.add_argument("--env", default=".env", help="Source env file (prod)")
    parser.add_argument("--out", default="outputs/store_sync", help="Output directory")
    parser.add_argument("--only", default="", help="Comma-separated resources")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env_file(args.env)
    api_url = f"https://{env.shop}.myshopify.com/admin/api/{env.api_version}/graphql.json"

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    targets = list(_parse_only(args.only))
    if args.dry_run:
        for key in targets:
            if key not in BULK_QUERIES:
                raise SystemExit(f"Unknown resource: {key}")
        print("Planned bulk exports:")
        for key in targets:
            print(f"- {key}")
        return 0

    timestamp_dir = out_dir / time.strftime("%Y%m%d-%H%M%S")
    timestamp_dir.mkdir(parents=True, exist_ok=True)

    for key in targets:
        query = BULK_QUERIES.get(key)
        if key == "metaobjects":
            types = _get_metaobject_types(api_url, env.token)
            for obj_type in types:
                meta_query = f"""
                {{
                  metaobjects(type: \"{obj_type}\") {{
                    edges {{
                      node {{
                        id
                        type
                        handle
                        fields {{
                          key
                          type
                          value
                        }}
                      }}
                    }}
                  }}
                }}
                """
                bulk_id = _run_bulk_query(api_url, env.token, meta_query)
                result = _poll_bulk(api_url, env.token, bulk_id)
                if result.get("status") != "COMPLETED":
                    raise RuntimeError(f"Bulk operation metaobjects {obj_type} failed: {result}")
                url = result.get("url")
                if not url:
                    if str(result.get("objectCount", "0")) == "0":
                        continue
                    raise RuntimeError(f"Bulk operation metaobjects {obj_type} missing url")
                safe_type = "".join(ch if ch.isalnum() else "_" for ch in obj_type)
                dest = timestamp_dir / f"metaobjects_{safe_type}.jsonl"
                _download(url, dest)
            continue
        if not query:
            raise SystemExit(f"Unknown resource: {key}")
        bulk_id = _run_bulk_query(api_url, env.token, query)
        result = _poll_bulk(api_url, env.token, bulk_id)
        if result.get("status") != "COMPLETED":
            raise RuntimeError(f"Bulk operation {key} failed: {result}")
        url = result.get("url")
        if not url:
            if str(result.get("objectCount", "0")) == "0":
                continue
            raise RuntimeError(f"Bulk operation {key} missing url")
        dest = timestamp_dir / f"{key}.jsonl"
        _download(url, dest)
    print(str(timestamp_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
