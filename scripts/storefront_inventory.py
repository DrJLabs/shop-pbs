#!/usr/bin/env python3
"""Storefront inventory for Admin API content + theme text sources.

Reads Admin API data via GraphQL (requires SHOPIFY_ADMIN_ACCESS_TOKEN)
and extracts text-like content from theme files for copy refinement.
"""

import argparse
import json
import os
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib import error, request

BASE_DIR = Path(__file__).resolve().parents[1]
REPORTS_DIR = BASE_DIR / "reports" / "storefront-inventory"

BACKOFFS = [0.5, 2.0]
TIMEOUT = 30


class _HTMLTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: List[str] = []

    def handle_data(self, data: str) -> None:
        text = data.strip()
        if text:
            self.parts.append(text)


def html_to_text(value: str) -> str:
    parser = _HTMLTextExtractor()
    parser.feed(value)
    return " ".join(parser.parts)


def graphql_request(endpoint: str, token: str, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
    }
    last_exc: Optional[Exception] = None
    for attempt, backoff in enumerate([0.0, *BACKOFFS]):
        if attempt:
            time.sleep(backoff)
        try:
            req = request.Request(endpoint, data=payload, headers=headers)
            with request.urlopen(req, timeout=TIMEOUT) as resp:
                data = json.load(resp)
            if data.get("errors"):
                raise RuntimeError(data["errors"])
            if "data" not in data:
                raise RuntimeError("Missing data in GraphQL response")
            return data["data"]
        except (error.URLError, error.HTTPError, json.JSONDecodeError, RuntimeError) as exc:
            last_exc = exc
            if attempt >= len(BACKOFFS):
                break
    if last_exc:
        raise last_exc
    raise RuntimeError("GraphQL request failed without exception context")


def paginate_connection(
    endpoint: str,
    token: str,
    query: str,
    root_key: str,
    page_size: int = 100,
    variables: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    after: Optional[str] = None
    while True:
        payload = {"first": page_size, "after": after}
        if variables:
            payload.update(variables)
        data = graphql_request(endpoint, token, query, payload)
        connection = data[root_key]
        items.extend(connection.get("nodes", []))
        page_info = connection.get("pageInfo", {})
        if not page_info.get("hasNextPage"):
            break
        after = page_info.get("endCursor")
    return items


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def flatten_strings(value: Any, prefix: str = "") -> Iterable[Dict[str, str]]:
    if isinstance(value, dict):
        for key, child in value.items():
            next_prefix = f"{prefix}.{key}" if prefix else key
            yield from flatten_strings(child, next_prefix)
    elif isinstance(value, list):
        for idx, child in enumerate(value):
            next_prefix = f"{prefix}[{idx}]"
            yield from flatten_strings(child, next_prefix)
    elif isinstance(value, str):
        if any(ch.isalpha() for ch in value):
            yield {"path": prefix, "value": value}


def load_json(path: Path) -> Any:
    text = path.read_text(encoding="utf-8")
    if re.match(r"\s*/\*", text):
        text = re.sub(r"^\s*/\*.*?\*/\s*", "", text, flags=re.DOTALL)
    text = re.sub(r"^\s*//.*?$", "", text, flags=re.MULTILINE)
    return json.loads(text)


def extract_schema_defaults(schema: Dict[str, Any], source: str) -> List[Dict[str, Any]]:
    defaults: List[Dict[str, Any]] = []
    for setting in schema.get("settings", []):
        default = setting.get("default")
        if isinstance(default, str) and any(ch.isalpha() for ch in default):
            defaults.append(
                {
                    "source": source,
                    "scope": "section",
                    "setting_id": setting.get("id"),
                    "type": setting.get("type"),
                    "label": setting.get("label"),
                    "default": default,
                }
            )
    for block in schema.get("blocks", []):
        for setting in block.get("settings", []):
            default = setting.get("default")
            if isinstance(default, str) and any(ch.isalpha() for ch in default):
                defaults.append(
                    {
                        "source": source,
                        "scope": f"block:{block.get('type')}",
                        "setting_id": setting.get("id"),
                        "type": setting.get("type"),
                        "label": setting.get("label"),
                        "default": default,
                    }
                )
    for preset in schema.get("presets", []):
        name = preset.get("name")
        if isinstance(name, str) and any(ch.isalpha() for ch in name):
            defaults.append(
                {
                    "source": source,
                    "scope": "preset",
                    "setting_id": None,
                    "type": "preset",
                    "label": preset.get("category"),
                    "default": name,
                }
            )
    return defaults


def extract_schema_from_section(path: Path) -> Optional[Dict[str, Any]]:
    content = path.read_text(encoding="utf-8")
    match = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", content, re.DOTALL)
    if not match:
        return None
    raw = match.group(1).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def extract_inline_text(path: Path) -> List[str]:
    content = path.read_text(encoding="utf-8")
    content = re.sub(r"<script.*?>.*?</script>", " ", content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r"<style.*?>.*?</style>", " ", content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r"\{\%.*?\%\}", " ", content, flags=re.DOTALL)
    content = re.sub(r"\{\{.*?\}\}", " ", content, flags=re.DOTALL)
    matches = re.findall(r">([^<]+)<", content)
    cleaned: List[str] = []
    for text in matches:
        normalized = " ".join(text.split())
        if len(normalized) >= 3 and any(ch.isalpha() for ch in normalized):
            cleaned.append(normalized)
    return sorted(set(cleaned))


def extract_translation_keys(path: Path) -> List[str]:
    content = path.read_text(encoding="utf-8")
    keys = re.findall(r"['\"]([^'\"]+?)['\"]\s*\|\s*t", content)
    return sorted(set(keys))


ADMIN_QUERIES = {
    "pages": """
query Pages($first: Int!, $after: String) {
  pages(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      body
      bodySummary
      isPublished
      publishedAt
      templateSuffix
      updatedAt
    }
  }
}
""",
    "products": """
query Products($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      descriptionHtml
      description
      productType
      vendor
      status
      publishedAt
      updatedAt
    }
  }
}
""",
    "collections": """
query Collections($first: Int!, $after: String) {
  collections(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      descriptionHtml
      description
      templateSuffix
      updatedAt
    }
  }
}
""",
    "blogs": """
query Blogs($first: Int!, $after: String) {
  blogs(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      templateSuffix
      updatedAt
    }
  }
}
""",
    "articles": """
query Articles($first: Int!, $after: String) {
  articles(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      summary
      body
      isPublished
      publishedAt
      updatedAt
      tags
      blog {
        id
        handle
        title
      }
      author {
        name
      }
    }
  }
}
""",
    "menus": """
query Menus($first: Int!, $after: String) {
  menus(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      handle
      title
      isDefault
      items {
        id
        title
        type
        url
        resourceId
        tags
        items {
          id
          title
          type
          url
          resourceId
          tags
          items {
            id
            title
            type
            url
            resourceId
            tags
          }
        }
      }
    }
  }
}
""",
    "shop_policies": """
query ShopPolicies {
  shop {
    id
    name
    myshopifyDomain
    primaryDomain {
      url
    }
    shopPolicies {
      id
      type
      title
      body
      url
      updatedAt
    }
  }
}
""",
    "metafield_definitions": """
query MetafieldDefinitions($ownerType: MetafieldOwnerType!, $first: Int!, $after: String) {
  metafieldDefinitions(ownerType: $ownerType, first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      name
      namespace
      key
      description
      ownerType
      type {
        name
        category
      }
      validations {
        name
        value
      }
      pinnedPosition
      useAsCollectionCondition
      validationStatus
    }
  }
}
""",
    "metaobject_definitions": """
query MetaobjectDefinitions($first: Int!, $after: String) {
  metaobjectDefinitions(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      name
      type
      description
      displayNameKey
      metaobjectsCount
      fieldDefinitions {
        key
        name
        description
        required
        type {
          name
          category
        }
        validations {
          name
          value
        }
      }
    }
  }
}
""",
}


METAFIELD_OWNER_TYPES = [
    "ARTICLE",
    "BLOG",
    "COLLECTION",
    "COMPANY",
    "COMPANY_LOCATION",
    "CUSTOMER",
    "DRAFT_ORDER",
    "FULFILLMENT_SERVICE",
    "GIFT_CARD",
    "LOCATION",
    "MARKET",
    "ORDER",
    "PAGE",
    "PRODUCT",
    "PRODUCT_VARIANT",
    "SHOP",
]


def run_admin_inventory() -> Dict[str, Any]:
    shop = os.environ.get("SHOPIFY_SHOP")
    token = os.environ.get("SHOPIFY_ADMIN_ACCESS_TOKEN")
    if not shop:
        raise SystemExit("Missing SHOPIFY_SHOP")
    if not token:
        raise SystemExit("Missing SHOPIFY_ADMIN_ACCESS_TOKEN")
    version = os.environ.get("SHOPIFY_ADMIN_API_VERSION", "2026-01")
    endpoint = f"https://{shop}.myshopify.com/admin/api/{version}/graphql.json"

    admin_dir = REPORTS_DIR / "admin-api"
    admin_dir.mkdir(parents=True, exist_ok=True)

    results: Dict[str, Any] = {}
    for key in ["pages", "products", "collections", "blogs", "articles", "menus"]:
        items = paginate_connection(endpoint, token, ADMIN_QUERIES[key], key)
        results[key] = items
        write_json(admin_dir / f"{key}.json", items)

    shop_data = graphql_request(endpoint, token, ADMIN_QUERIES["shop_policies"], {})
    results["shop"] = shop_data.get("shop", {})
    write_json(admin_dir / "shop.json", results["shop"])

    metafield_definitions: List[Dict[str, Any]] = []
    for owner_type in METAFIELD_OWNER_TYPES:
        try:
            definitions = paginate_connection(
                endpoint,
                token,
                ADMIN_QUERIES["metafield_definitions"],
                "metafieldDefinitions",
                variables={"ownerType": owner_type},
            )
        except (error.URLError, error.HTTPError, RuntimeError) as exc:
            definitions = [{"ownerType": owner_type, "error": str(exc)}]
        for definition in definitions:
            if "ownerType" not in definition:
                definition["ownerType"] = owner_type
        metafield_definitions.extend(definitions)
    results["metafield_definitions"] = metafield_definitions
    write_json(admin_dir / "metafield-definitions.json", metafield_definitions)

    metaobject_definitions = paginate_connection(
        endpoint,
        token,
        ADMIN_QUERIES["metaobject_definitions"],
        "metaobjectDefinitions",
    )
    results["metaobject_definitions"] = metaobject_definitions
    write_json(admin_dir / "metaobject-definitions.json", metaobject_definitions)

    return results


def run_theme_inventory() -> Dict[str, Any]:
    theme_dir = REPORTS_DIR / "theme"
    theme_dir.mkdir(parents=True, exist_ok=True)

    output: Dict[str, Any] = {}

    locale_path = None
    for candidate in ["locales/en.default.json", "locales/en.json"]:
        path = BASE_DIR / candidate
        if path.exists():
            locale_path = path
            break

    if locale_path:
        locale_data = load_json(locale_path)
        flat_locale = list(flatten_strings(locale_data))
        output["locale_file"] = str(locale_path.relative_to(BASE_DIR))
        output["locale_strings"] = flat_locale
        write_json(theme_dir / "locale-strings.json", flat_locale)

    settings_data_path = BASE_DIR / "config" / "settings_data.json"
    if settings_data_path.exists():
        settings_data = load_json(settings_data_path)
        settings_strings = list(flatten_strings(settings_data))
        output["settings_data_strings"] = settings_strings
        write_json(theme_dir / "settings-data-strings.json", settings_strings)

    schema_defaults: List[Dict[str, Any]] = []
    for section in (BASE_DIR / "sections").glob("*.liquid"):
        schema = extract_schema_from_section(section)
        if not schema:
            continue
        schema_defaults.extend(extract_schema_defaults(schema, str(section.relative_to(BASE_DIR))))
    output["schema_defaults"] = schema_defaults
    write_json(theme_dir / "schema-defaults.json", schema_defaults)

    template_strings: List[Dict[str, str]] = []
    for template_path in (BASE_DIR / "templates").glob("*.json"):
        try:
            data = load_json(template_path)
        except json.JSONDecodeError:
            continue
        template_strings.extend(flatten_strings(data, str(template_path.relative_to(BASE_DIR))))
    output["template_strings"] = template_strings
    write_json(theme_dir / "template-strings.json", template_strings)

    inline_text: List[Dict[str, Any]] = []
    translation_keys: Dict[str, List[str]] = {}
    for directory in ["layout", "sections", "snippets", "templates"]:
        for liquid_path in (BASE_DIR / directory).glob("*.liquid"):
            text_entries = extract_inline_text(liquid_path)
            if text_entries:
                inline_text.append(
                    {
                        "source": str(liquid_path.relative_to(BASE_DIR)),
                        "text": text_entries,
                    }
                )
            keys = extract_translation_keys(liquid_path)
            if keys:
                translation_keys[str(liquid_path.relative_to(BASE_DIR))] = keys

    output["inline_text"] = inline_text
    output["translation_keys"] = translation_keys
    write_json(theme_dir / "inline-text.json", inline_text)
    write_json(theme_dir / "translation-keys.json", translation_keys)

    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Storefront inventory (admin API + theme text)")
    parser.add_argument("--admin", action="store_true", help="Pull Admin API content")
    parser.add_argument("--theme", action="store_true", help="Extract theme text sources")
    args = parser.parse_args()

    if not args.admin and not args.theme:
        parser.error("Select --admin and/or --theme")

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    summary: Dict[str, Any] = {}

    if args.admin:
        summary["admin"] = run_admin_inventory()

    if args.theme:
        summary["theme"] = run_theme_inventory()

    summary_path = REPORTS_DIR / "summary.json"
    write_json(summary_path, summary)

    readme_path = REPORTS_DIR / "README.md"
    with readme_path.open("w", encoding="utf-8") as handle:
        handle.write("# Storefront Inventory\n\n")
        handle.write("Generated by scripts/storefront_inventory.py.\n\n")
        if args.admin:
            handle.write("Admin API exports in reports/storefront-inventory/admin-api/\n")
        if args.theme:
            handle.write("Theme text exports in reports/storefront-inventory/theme/\n")


if __name__ == "__main__":
    main()
