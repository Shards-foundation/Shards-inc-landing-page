# Shards Security Sentinel — live defensive release (2026-11-09)

**Console:** https://security.shardsinc.co.uk
**Isolated decoy:** https://trap.shardsinc.co.uk
**Cloudflare Worker:** `shards-security-sentinel`
**Database:** EU D1 `shards-security-prod`, ID `d91208bb-a17d-4452-8fc4-f6db96016552`; Worker binding `EVENT_DB`
**Source:** `privacy/security-worker.js`
**Schema:** `privacy/security-schema.sql`
**CI:** `.github/workflows/security-smoke.yml`

## Delivered, deployed and verified

1. A Shards-owned HTTP decoy hostname with scheduled-by-date changing robots.txt lure paths, isolated route classification and restricted 403 responses. No third-party networks or hosts are attacked or scanned.
2. Actual D1 event ingestion classified by request-path family (admin-console, credential/config, CMS, internal-service, other). Stores timestamp, category, method, rule, score, coarse country/colo. **No IP address, user agent, URL query, cookies, payloads or request bodies are saved.** Max 300 sampled logged events/hour across the deployment.
3. Public live telemetry reports D1-backed 24-hour totals and request-family grouping. It intentionally includes synthetic/test visits. It is aggregate, untrusted telemetry, not evidence of successful attacks.
4. PhishRisk URL structural scoring with explainable rules and fixed-provider DNS A lookup. It does **not** fetch/open the destination or claim that heuristics prove a URL is legitimate or malicious.
5. LeakScan passive DNS posture checking with A, AAAA, MX, TXT/SPF, DMARC and CAA. No SSRF, service enumeration, port scanning, vulnerability checking, threat data or dark-web search.
6. Private export supports CEF lines and NDJSON events, with bearer key `SECURITY_EXPORT_KEY` stored only as a Cloudflare secret. The export remains **disabled** (HTTP 503) while the key is absent. It is an export endpoint, not yet an installed Splunk/QRadar/Sentinel forwarding integration.
7. Database tables for tenant and deployment metadata. **Only shards-internal is active**. Customer isolation, payments, onboarding, distributed sensor issuance and cross-site deployment are not built. **Local customer-branded HTML report export** now works from a successful DNS audit; this is not a hosted multi-tenant reporting or licensing platform.
8. On-device Bluetooth capability inspection of the Web Bluetooth API, including previously permissioned devices only. It is **not** a continuous or offline radio threat detector.

### Live evidence (2026-11-09)

- HTML `/`, browser JavaScript `/app.js`, `/api/status`, `/api/telemetry`, `/api/surface?domain=example.com`, `/api/siem/schema`: HTTP 200.
- Live `/api/surface?domain=example.com`: 6 DNS queries succeeded.
- `/api/events?format=cef`: HTTP 503, export securely disabled because export secret absent.
- `https://trap.shardsinc.co.uk/admin`: HTTP 403; two independent test hits subsequently confirmed **in D1** as `admin-console-probe`; public `/api/telemetry` returned total 2 and corresponding group.
- Browser script JavaScript and Worker source syntax validated before deployment.
- All other smoke tests are in GitHub Actions. Do not claim the latest CI passed until checked.

### Real client-branded reports

After `LeakScan` completes an actual passive DNS audit, the browser enables **Download Branded Report**. An optional organisation name is escaped and inserted into a print-friendly, locally generated HTML audit containing the real DNS answers, check time, observations and explicit limitations. No report upload or provider billing occurs. The action is implemented and browser JavaScript parses, but an interactive handset click/download acceptance test is not yet recorded. This is **not** MSSP white-label deployment, customer account isolation or volume licensing.

### Public API quotas and correlated signals

- `/api/surface`: 600 global DNS audit calls/UTC day; each audit makes at most six Cloudflare DoH requests.
- `/api/phishrisk`: 1,500 global link analyses/UTC day; performs at most one DNS A lookup per hostname.
- The shared daily counters are atomically incremented in D1. Exhaustion yields HTTP 429, and quota-store errors fail closed; **these are service-wide budgets, not per-user rate limits**. Cloudflare WAF/Turnstile/identity-based controls are still required before retail launch.
- `GET /api/alerts`: correlated, non-attributable alerts for request-family + UTC-hour groups with at least three recorded decoy hits. This reduces emitted signal groups but does not validate malicious intent or eliminate false positives.

### Native offline Android observation

`privacy/android-ble-observer/` now contains a compiled, consent-based Android BLE observer with no Internet permission. The debug APK was produced by GitHub Actions run `42711369953` and is available as `shards-offline-ble-debug`. It reports foreground BLE advertising observations using RAM-only pseudonymous IDs and RSSI. No background monitoring or intrusion detection is claimed, and a real-device run has not been verified.

### Data minimisation, lifecycle and limitations

This first release records no raw source IP or request content. D1 sampling is capped at 300 captured records/hour; drops are not currently counted. A scheduled Cloudflare Worker cron trigger at **03:17 UTC daily** runs a D1 DELETE for decoy events older than seven days and expired query-budget counters. The cron is configured through the Cloudflare API. The first scheduled execution has not yet occurred, so actual post-expiry pruning remains to be verified; retention and access controls for per-customer exports still require review.

There is no honeypot shell or command execution, no active defensive response on Shards' actual production services, no attack-back, no real-time threat intelligence or AI autonomous agent, no guarantee of zero false positives. A probe hitting the isolated decoy is a signal about the decoy, not proof any attack on the primary site was prevented.

### Setup required for private export
Create a random 32+ character bearer token in a secure operator password manager and add it as a Cloudflare Worker **Secret** named `SECURITY_EXPORT_KEY` on `shards-security-sentinel`. Never put it in GitHub, the website or this conversation. Export is only reachable to an authenticated server-side SIEM collector:

```bash
curl -H 'Authorization: Bearer <TOKEN_FROM_SECRET_STORE>' \
 'https://security.shardsinc.co.uk/api/events?format=cef'
```

The example contains **no real credentials**. A complete SIEM deployment additionally needs an authorised transport, TLS, collection endpoint and documented retention. For Cloudflare, prefer Zero Trust Access enforcement or mTLS on the export endpoint over bare bearer-only controls. A token alone is inadequate for a multi-tenant public product.

### Next gates
- Edge rate limiting and explicit production WAF policies on input scanners.
- Guaranteed retention and a report export audit trail.
- Individual verified client ownership, tenant-specific sensors and log segregation; never allow tenant parameters from an unauthenticated request.
- Actual licensed breach/dark-web intelligence provider and verified target ownership; do not claim **DarkCheck** is scanning hidden services or stolen credentials.
- Native, permission-based Android BLE advertising scanner with local-only risk classification. Web Bluetooth lacks dependable background scanning and cannot neutralise unrelated radios.
- Optional Splunk HEC, Microsoft Sentinel CEF over an authorised syslog collector and QRadar transport; validate field mapping and deduplication.
- Customer identity/MFA, verified live subscription billing, contracts, abuse/incident response and UK GDPR/DPA reviews before marketing to MSSPs.
