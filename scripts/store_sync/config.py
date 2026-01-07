from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict


@dataclass
class StoreEnv:
    shop: str
    token: str
    api_version: str


def _parse_env(path: Path) -> Dict[str, str]:
    data: Dict[str, str] = {}
    for line in path.read_text().splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip()
    return data


def load_env_file(path: str) -> StoreEnv:
    env = _parse_env(Path(path))
    return StoreEnv(
        shop=env["SHOPIFY_SHOP"],
        token=env["SHOPIFY_ADMIN_ACCESS_TOKEN"],
        api_version=env.get("SHOPIFY_ADMIN_API_VERSION", "2026-01"),
    )
