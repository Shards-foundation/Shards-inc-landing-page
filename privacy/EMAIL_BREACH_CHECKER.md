# Embedded HIBP email breach checker — Shards Privacy Lab

**Live UI:** https://privacy.shardsinc.co.uk/lab#email-breaches

**Cloudflare Worker:** `shards-privacy-portal`, source `privacy/worker.js`
**Official upstream:** https://haveibeenpwned.com/api/v3/breachedaccount/
**D1 binding:** `EMAIL_DB` → EU `shards-privacy-prod` (`23e63c32-2a34-4b50-95de-3bc347dc3e86`)
**Schema:** `privacy/email-breach-budget.sql`

## Real functionality and explicit licence boundary

HIBP's public browser email check and its Pwned Passwords API are free, **but embedded API searches for an email address require a paid HIBP subscription key**. HIBP's documentation provides an official zero-cost test API key (`00000000000000000000000000000000`) solely for its documented test email domain `hibp-integration-tests.com`. The site uses that official test key **only for a strict allowlist of published fixture aliases** (`account-exists`, `multiple-breaches`, `not-active-breach`, `spam-list-only`). These are real HIBP endpoint responses, not fabricated matches.

A genuine user/customer email address cannot be queried until BOTH the commercial provider contract/key and server-side authenticated access gate are enabled. There is no email scraper, unlicensed commercial re-host of XposedOrNot's free API, generic iframe, local breach database or impersonation of HIBP.

The client discloses that submission sends the **full email address** via HTTPS to Shards Cloudflare Worker and then to HIBP, and collects affirmative authority/consent. The server does **not** insert raw emails, responses, credentials, source IPs or browser fingerprints into the D1 lookup-budget table. Provider/Cloudflare request processing and independent log policies are outside that database guarantee. No tracking query parameters carry email addresses.

The client displays provider-attributed breach names using DOM `textContent`, not unsafe HTML, and never renders leaked passwords, tokens or raw credential data. No match is explicitly **not** proof of safety: sensitive, retired, opt-out and incompletely indexed breaches can be absent.

## Endpoints

- `GET /api/email-breaches/status`: safe non-sensitive source and activation status. When no commercial key or Access identity settings are active, reports `official_test_only`.
- `POST /api/email-breaches`: accepts JSON `{"email":"...","consent":true}`, requires same-origin Origin, validates ASCII email and content-type, enforces upper body bounds, and applies D1 global and per-identity time-window budgets.
- Official integration test: `multiple-breaches@hibp-integration-tests.com` is a real HIBP fixture, expected 3 breach names. `not-active-breach@hibp-integration-tests.com` intentionally returns no public breach matches.
- Regular customer email without provider/access configuration returns HTTP **503**, without sending the address upstream.
- Rejected/invalid Origin: HTTP 403. No consent: HTTP 400. Upstream errors/invalid key: provider unavailable, never a false `no breaches` result.
- Provider 404 corresponds to **no public match** (HTTP 200 from the Shards route, with source and explicit caveat).

## Secrets and activation

The worker does not contain any customer provider keys. On Cloudflare **Workers & Pages → shards-privacy-portal → Settings → Variables and Secrets** add only via Secret bindings:

- `HIBP_API_KEY`: real 32-character hex key from https://haveibeenpwned.com/Dashboard → Business → API Key.
- `HIBP_ACCESS_TEAM`: Cloudflare Access team slug.
- `HIBP_ACCESS_AUD`: expected audience tag for a Cloudflare Access application protecting customer lookup routes.
- `HIBP_ENABLE_CUSTOMER_LOOKUP`: literal string `true` only after the approved operator/identity acceptance tests pass.

The server treats arbitrary email lookup as **disabled unless all four settings and the EU D1 binding are present**. It verifies a signed Access RS256 JWT using the configured team's public signing certificates, expected issuer, audience, expiry/nbf and subject before any subscribed customer lookup. No client-supplied or unsigned identity is trusted.

**The Access gate is NOT equivalent to subscription payment enforcement.** Do not turn on retail customer billing without a real user account layer, verified provider licence, payment entitlements, per-customer provider-cost accounting, signed billing webhooks, cancellation/revocation, purpose control and external security review.

If enhanced privacy is needed, HIBP Pro's k-anonymity email range API uses a **6-hex SHA-1 prefix** rather than transmitting the full address; it is a separate paid plan and **not** implemented in this direct email endpoint.

## Usage budget

D1 only stores global daily/hourly request-count records and (if Access identity is enabled) a SHA-256 pseudonym of the JWT subject. The API conservatively increments quotas *before* calling HIBP:
- Test fixtures: max 18 UTC/day, 9 UTC/hour globally.
- Authenticated user lookups: max 160 UTC/day, 28 UTC/hour globally, 12 UTC/day per verified identity.
- Quota exhaustion yields 429; unavailable database fails closed.
- **There is no IP-based rate limiter or Turnstile yet.** Additional Cloudflare WAF and token/access policy needed before wider public availability.
- Budget rows do not yet have a cron cleanup routine. This small transient counter table should be pruned by a scheduled trigger in a subsequent release.

## Testing

GitHub `.github/workflows/privacy-smoke.yml` includes public UI/source checks, the real official HIBP integration fixture, strict invalid/unauthorised request rejection and checks that email strings are not echoed. Inspect the actual successful run before claiming all upstream fixtures are validated.

The production `/lab` page and `/api/email-breaches/status` were independently verified as HTTP 200 following deployment. The normal customer lookup remains fail-closed.
