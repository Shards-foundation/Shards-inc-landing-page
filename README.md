# Shards Inc — Intelligence, governed.

Early-stage Shards Inc website. Mobile-first, RSC-backed one-page site with a scroll-controlled three.js Mind, a genuine browser-side SHA-256 audit visualisation, server-only GitHub/PyPI proof feeds, a click-to-load video and a no-analytics privacy model.

## Development

Requires Node >=22, pnpm 10.21.0. Clone, run `corepack enable && pnpm install && pnpm dev`.

For production, provide the required legal metadata in your Vercel environment and run `pnpm build`. `prebuild` fails if any required legal variable is absent. See `.env.example`. `GITHUB_TOKEN` is optional and remains server-only. `SITE_URL` is the canonical site URL.

To run tests: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm claims:check`. For browser tests: `pnpm exec playwright install chromium && pnpm build && pnpm test:e2e` (requires verified legal env fields).

## Deployment

Connect a **private** repository to Vercel. PRs deploy to protected previews; production is only from the main branch after approval. Configure company variables in Preview and Production. Do not enter invented company details. Attach the verified domain using the exact DNS instructions returned by Vercel, then confirm HTTP 308 for apex and retention redirects. There is no automatic production DNS mutation.

## Security boundaries

The site is informational. The governance playground is a Web Crypto demonstration, not a live Kernel, a signed issuer, an MCP gateway or telemetry. No user messages or permits are transmitted. The site uses no analytics and avoids YouTube network calls before activation.

## Known gates

Performance, cross-browser screenshots, lockfile, dependency audits, CI, live preview checks and legal review must be completed before public deployment. See `DECISIONS.md` and `CONTENT.md` for evidence and release blockers. This repository is not approved for public release just because source code is present.
