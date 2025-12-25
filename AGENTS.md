# Repository Guidelines

## Project Structure & Module Organization
The theme follows Shopify Dawn layout. Liquid templates in `templates/` map to storefront pages, while reusable blocks live under `sections/` (kebab-case names such as `background-video.liquid`) and `snippets/`. Theme assets (`.css`, `.js`, `.json`, media) reside in `assets/`. Configurable settings are defined in `config/settings_schema.json`; deployment environments use `config/*.json`. Translations live in `locales/`. Keep structural changes paired with matching schema or locale updates.

## Build, Test, and Development Commands
Run `shopify theme dev` from the repo root for a hot-reloading preview tied to your development store. Use `shopify theme dev --store <store-domain> --theme <theme_id>` when running non-interactively or in background terminals. The local preview is `http://127.0.0.1:9292`; the CLI output also includes a share URL for collaborators. Stop the dev server with Ctrl+C; if it is running in the background, find the PID with `lsof -i :9292` and `kill` it. If the preview URL is down (connection refused) and you need verification, restart `shopify theme dev` in the same working tree before re-testing. Use `shopify theme check` before every push to lint Liquid, JSON, and schema files. When ready to sync, run `shopify theme push --env=<environment>`; include `--allow-live` only after review. Capture output when commands surface warnings.

## Coding Style & Naming Conventions
Use two-space indentation for Liquid, JSON, and SCSS/CSS to match existing files. Prefer semantic HTML and section schema settings keys in lower_snake_case to align with Shopify UI. Name new sections and snippets in kebab-case, e.g. `sections/featured-menu.liquid`. Prefix asset bundles with their scope (`component-`, `page-`) and colocate feature scripts alongside their CSS when possible. Run `shopify theme check` or Prettier (if configured locally) before committing.

## Testing Guidelines
There is no automated test suite; rely on `shopify theme check` plus targeted manual QA. For dev-server validation, start `shopify theme dev`, confirm the local preview URL, and verify changes against `http://127.0.0.1:9292` (preferred for Playwright checks). If a fix does not appear, restart the dev server from the same working tree to clear hot reload state. Exercise cart drawer, checkout linkages, and theme editor settings impacted by your change. Record live preview URLs or screenshots for UI adjustments. Maintain backwards compatibility with existing section presets.

## MCP Validation & Docs
Verify new Liquid code blocks through the MCP servers `shopify-dev-mcp-partial` and `shopify-dev-mcp-full` (use the full server for multi-file validations). These endpoints also deliver up-to-date Shopify documentation; pull the relevant snippets before implementing complex features.

## Commit & Pull Request Guidelines
Create feature branches using `feat/<kebab>`, `fix/<kebab>`, or `chore/<kebab>`. Write Conventional Commits (`feat: add cart drawer animation`). PRs must include: concise summary, linked issue or task ID, screenshots or screen recordings for visual changes, confirmation of `shopify theme check`, and rollout notes if pushing to live. Request re-review with `@codex review` once feedback is addressed.

## Security & Configuration Tips
Never commit API keys or store credentials; keep them in `.env` files ignored by Git. Redact customer data in screenshots. Before running `shopify theme push`, verify `config/settings_data.json` omits store-specific secrets or disable syncing via CLI flags.

## Tracking Documents
Maintain `docs/phase-tracker.md` alongside feature work. Update phase statuses and Phase 5 checklist whenever tasks progress; reference it in PR summaries when scope changes.
