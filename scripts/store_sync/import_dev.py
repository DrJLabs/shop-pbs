from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.error import HTTPError
from urllib.request import Request, urlopen

sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.store_sync.config import load_env_file


def _compact_dict(data: Dict) -> Dict:
    return {key: value for key, value in data.items() if value is not None}


def _gid_to_id(gid: Optional[str]) -> Optional[str]:
    if not gid:
        return None
    if "/" not in gid:
        return gid
    return gid.rsplit("/", 1)[-1]


def _graphql(api_url: str, token: str, query: str, variables: Optional[Dict] = None) -> Dict:
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = Request(api_url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    with urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _rest(api_url: str, token: str, method: str, path: str, payload: Optional[Dict] = None) -> Dict:
    url = f"{api_url}{path}"
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("X-Shopify-Access-Token", token)
    try:
        with urlopen(req) as resp:
            body = resp.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8") if exc.fp else ""
        raise RuntimeError(f"REST {method} {path} failed: {exc.code} {detail}") from exc
    return json.loads(body) if body else {}


def _load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open() as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def _group_products(path: Path) -> List[Dict]:
    products: Dict[str, Dict] = {}
    for obj in _load_jsonl(path):
        parent_id = obj.get("__parentId")
        if not parent_id:
            products[obj["id"]] = obj
            products[obj["id"]].setdefault("_variants", [])
            products[obj["id"]].setdefault("_images", [])
            continue
        parent = products.get(parent_id)
        if not parent:
            continue
        if "sku" in obj or "selectedOptions" in obj:
            parent["_variants"].append(obj)
        elif "url" in obj or "altText" in obj:
            parent["_images"].append(obj)
    return list(products.values())


def _get_product_id(api_url: str, token: str, handle: str) -> Optional[str]:
    query = """
    query ($query: String!) {
      products(first: 1, query: $query) {
        edges { node { id } }
      }
    }
    """
    data = _graphql(api_url, token, query, {"query": f"handle:{handle}"})
    edges = data.get("data", {}).get("products", {}).get("edges", [])
    return _gid_to_id(edges[0]["node"].get("id")) if edges else None


def _get_collection_id(api_url: str, token: str, handle: str) -> Optional[str]:
    query = """
    query ($query: String!) {
      collections(first: 1, query: $query) {
        edges { node { id } }
      }
    }
    """
    data = _graphql(api_url, token, query, {"query": f"handle:{handle}"})
    edges = data.get("data", {}).get("collections", {}).get("edges", [])
    return _gid_to_id(edges[0]["node"].get("id")) if edges else None


def _get_page_id(api_url: str, token: str, handle: str) -> Optional[str]:
    query = """
    query ($query: String!) {
      pages(first: 1, query: $query) {
        edges { node { id } }
      }
    }
    """
    data = _graphql(api_url, token, query, {"query": f"handle:{handle}"})
    edges = data.get("data", {}).get("pages", {}).get("edges", [])
    return _gid_to_id(edges[0]["node"].get("id")) if edges else None


def _get_blog_id(api_url: str, token: str, handle: str) -> Optional[str]:
    query = """
    query ($query: String!) {
      blogs(first: 1, query: $query) {
        edges { node { id } }
      }
    }
    """
    data = _graphql(api_url, token, query, {"query": f"handle:{handle}"})
    edges = data.get("data", {}).get("blogs", {}).get("edges", [])
    return _gid_to_id(edges[0]["node"].get("id")) if edges else None


def _create_or_update_product(api_url: str, token: str, product: Dict, dry_run: bool) -> None:
    handle = product.get("handle")
    if not handle:
        return
    product_id = _get_product_id(f"{api_url}/graphql.json", token, handle)
    images = []
    for img in product.get("_images", []):
        if img.get("url"):
            images.append({"src": img.get("url"), "alt": img.get("altText")})
    variants = []
    for var in product.get("_variants", []):
        selected = [opt.get("value") for opt in var.get("selectedOptions", [])]
        inventory_policy = var.get("inventoryPolicy")
        variants.append(
            _compact_dict(
                {
                "title": var.get("title"),
                "sku": var.get("sku"),
                "price": var.get("price"),
                "compare_at_price": var.get("compareAtPrice"),
                "inventory_policy": inventory_policy.lower() if isinstance(inventory_policy, str) else None,
                "barcode": var.get("barcode"),
                "taxable": var.get("taxable"),
                "option1": selected[0] if len(selected) > 0 else None,
                "option2": selected[1] if len(selected) > 1 else None,
                "option3": selected[2] if len(selected) > 2 else None,
                }
            )
        )
    options_list = [
        {"name": opt.get("name")}
        for opt in product.get("options", [])
        if opt.get("name")
    ]
    product_payload = _compact_dict(
        {
            "title": product.get("title"),
            "handle": handle,
            "body_html": product.get("descriptionHtml"),
            "vendor": product.get("vendor"),
            "product_type": product.get("productType"),
            "tags": ", ".join(product.get("tags", [])),
            "status": (product.get("status") or "active").lower(),
            "options": options_list if options_list else None,
            "variants": variants if variants else None,
            "images": images if images else None,
        }
    )
    payload = {"product": product_payload}
    if dry_run:
        return
    if product_id:
        payload["product"] = _compact_dict(
            {
                "id": product_id,
                "title": product.get("title"),
                "handle": handle,
                "body_html": product.get("descriptionHtml"),
                "vendor": product.get("vendor"),
                "product_type": product.get("productType"),
                "tags": ", ".join(product.get("tags", [])),
                "status": (product.get("status") or "active").lower(),
            }
        )
        _rest(api_url, token, "PUT", f"/products/{product_id}.json", payload)
    else:
        try:
            _rest(api_url, token, "POST", "/products.json", payload)
        except Exception:
            fallback = _compact_dict(
                {
                    "title": product.get("title"),
                    "handle": handle,
                    "body_html": product.get("descriptionHtml"),
                    "vendor": product.get("vendor"),
                    "product_type": product.get("productType"),
                    "tags": ", ".join(product.get("tags", [])),
                    "status": (product.get("status") or "active").lower(),
                }
            )
            _rest(api_url, token, "POST", "/products.json", {"product": fallback})


def _normalize_rule_value(value: Optional[str]) -> Optional[str]:
    if not isinstance(value, str):
        return value
    return value.lower()


def _create_or_update_collection(api_url: str, token: str, collection: Dict, dry_run: bool) -> None:
    handle = collection.get("handle")
    if not handle:
        return
    sort_order_map = {
        "MANUAL": "manual",
        "BEST_SELLING": "best-selling",
        "ALPHA_ASC": "alpha-asc",
        "ALPHA_DESC": "alpha-desc",
        "PRICE_ASC": "price-asc",
        "PRICE_DESC": "price-desc",
        "CREATED": "created",
        "CREATED_DESC": "created-desc",
    }
    ruleset = collection.get("ruleSet")
    is_smart = bool(ruleset and ruleset.get("rules"))
    sort_order = sort_order_map.get(collection.get("sortOrder"), "best-selling")
    if is_smart:
        root_key = "smart_collection"
    else:
        root_key = "custom_collection"
    payload = {
        root_key: {
            "title": collection.get("title"),
            "handle": handle,
            "body_html": collection.get("descriptionHtml"),
            "sort_order": sort_order,
        }
    }
    if is_smart:
        payload[root_key]["rules"] = [
            {
                "column": _normalize_rule_value(rule.get("column")),
                "relation": _normalize_rule_value(rule.get("relation")),
                "condition": rule.get("condition"),
            }
            for rule in ruleset.get("rules", [])
            if rule.get("column") and rule.get("relation") and rule.get("condition")
        ]
        payload[root_key]["disjunctive"] = ruleset.get("appliedDisjunctively", False)
        path = "/smart_collections.json"
    else:
        path = "/custom_collections.json"
    if dry_run:
        return
    collection_id = _get_collection_id(f"{api_url}/graphql.json", token, handle)
    if collection_id:
        payload[root_key]["id"] = collection_id
        base_path = path.replace(".json", "")
        _rest(api_url, token, "PUT", f"{base_path}/{collection_id}.json", payload)
    else:
        _rest(api_url, token, "POST", path, payload)


def _create_or_update_page(api_url: str, token: str, page: Dict, dry_run: bool) -> None:
    payload = {
        "page": {
            "title": page.get("title"),
            "handle": page.get("handle"),
            "body_html": page.get("body"),
            "published": page.get("isPublished", False),
        }
    }
    if dry_run:
        return
    page_id = _get_page_id(f"{api_url}/graphql.json", token, page.get("handle"))
    if page_id:
        _rest(api_url, token, "PUT", f"/pages/{page_id}.json", payload)
    else:
        _rest(api_url, token, "POST", "/pages.json", payload)


def _create_or_update_blog(api_url: str, token: str, blog: Dict, dry_run: bool) -> Optional[int]:
    payload = {"blog": {"title": blog.get("title"), "handle": blog.get("handle")}}
    if dry_run:
        return None
    blog_id = _get_blog_id(f"{api_url}/graphql.json", token, blog.get("handle"))
    if blog_id:
        data = _rest(api_url, token, "PUT", f"/blogs/{blog_id}.json", payload)
    else:
        data = _rest(api_url, token, "POST", "/blogs.json", payload)
    return data.get("blog", {}).get("id")


def _create_or_update_article(api_url: str, token: str, article: Dict, blog_map: Dict[str, int], dry_run: bool) -> None:
    blog_id = blog_map.get(article.get("blog", {}).get("id"))
    if not blog_id:
        return
    payload = {
        "article": {
            "title": article.get("title"),
            "handle": article.get("handle"),
            "body_html": article.get("body"),
            "summary_html": article.get("summary"),
            "published": article.get("isPublished", False),
        }
    }
    if dry_run:
        return
    _rest(api_url, token, "POST", f"/blogs/{blog_id}/articles.json", payload)


def _upsert_metaobject(api_url: str, token: str, metaobject: Dict, dry_run: bool) -> None:
    handle = metaobject.get("handle")
    obj_type = metaobject.get("type")
    if not handle or not obj_type:
        return
    fields = [
        {"key": field.get("key"), "value": field.get("value")}
        for field in metaobject.get("fields", [])
        if field.get("key")
    ]
    mutation = """
    mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
    """
    variables = {
        "handle": {"type": obj_type, "handle": handle},
        "metaobject": {"type": obj_type, "handle": handle, "fields": fields},
    }
    if dry_run:
        return
    data = _graphql(api_url, token, mutation, variables)
    errors = data.get("data", {}).get("metaobjectUpsert", {}).get("userErrors", [])
    if errors:
        raise RuntimeError(f"Metaobject upsert failed: {errors}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import store data into dev")
    parser.add_argument("--env", default="env.dev", help="Dev env file")
    parser.add_argument("--input", required=True, help="Input export directory")
    parser.add_argument("--error-log", default="outputs/store_sync/import_errors.log")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env_file(args.env)
    api_url = f"https://{env.shop}.myshopify.com/admin/api/{env.api_version}"
    graphql_url = f"{api_url}/graphql.json"

    input_dir = Path(args.input)
    if not input_dir.exists():
        raise SystemExit(f"Missing input directory: {input_dir}")

    products_path = input_dir / "products.jsonl"
    collections_path = input_dir / "collections.jsonl"
    pages_path = input_dir / "pages.jsonl"
    blogs_path = input_dir / "blogs.jsonl"
    articles_path = input_dir / "articles.jsonl"
    metaobjects_paths = sorted(input_dir.glob("metaobjects_*.jsonl"))

    error_log = Path(args.error_log)
    error_log.parent.mkdir(parents=True, exist_ok=True)

    def append_error(message: str) -> None:
        with error_log.open("a") as handle:
            handle.write(message + "\n")

    if products_path.exists():
        for product in _group_products(products_path):
            try:
                _create_or_update_product(api_url, env.token, product, args.dry_run)
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"product {product.get('handle')}: {exc}")
            time.sleep(0.1)

    if collections_path.exists():
        for collection in _load_jsonl(collections_path):
            if collection.get("__parentId"):
                continue
            try:
                _create_or_update_collection(api_url, env.token, collection, args.dry_run)
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"collection {collection.get('handle')}: {exc}")
            time.sleep(0.1)

    blog_map: Dict[str, int] = {}
    if blogs_path.exists():
        for blog in _load_jsonl(blogs_path):
            if blog.get("__parentId"):
                continue
            try:
                blog_id = _create_or_update_blog(api_url, env.token, blog, args.dry_run)
                if blog_id:
                    blog_map[blog.get("id")] = blog_id
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"blog {blog.get('handle')}: {exc}")
            time.sleep(0.1)

    if articles_path.exists():
        for article in _load_jsonl(articles_path):
            if article.get("__parentId"):
                continue
            try:
                _create_or_update_article(api_url, env.token, article, blog_map, args.dry_run)
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"article {article.get('handle')}: {exc}")
            time.sleep(0.1)

    if pages_path.exists():
        for page in _load_jsonl(pages_path):
            if page.get("__parentId"):
                continue
            try:
                _create_or_update_page(api_url, env.token, page, args.dry_run)
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"page {page.get('handle')}: {exc}")
            time.sleep(0.1)

    for meta_path in metaobjects_paths:
        for metaobject in _load_jsonl(meta_path):
            if metaobject.get("__parentId"):
                continue
            try:
                _upsert_metaobject(graphql_url, env.token, metaobject, args.dry_run)
            except Exception as exc:  # pylint: disable=broad-except
                append_error(f"metaobject {metaobject.get('handle')}: {exc}")
            time.sleep(0.1)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
