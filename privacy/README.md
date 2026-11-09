# Shards Privacy — deployed foundation (2026-11-09)

**Public endpoint:** https://privacy.shardsinc.co.uk

**Worker:** `shards-privacy-portal` in Cloudflare Shards-inc account

**Database:** Cloudflare D1 `shards-privacy-prod` (EU jurisdiction); tables defined in `schema.sql`.

## What is actually live
- Cloudflare Worker serving a responsive privacy cockpit with animated graphics
- Same-origin `GET /api/network`: request-visible IP, Cloudflare country, edge colo, network ASN
- Browser WebCrypto password generator (uniform rejection sampling)
- Local marketing-tracker URL sanitizer
- Official outbound links for DuckDuckGo Email Protection, Burner and WireGuard
- A baseline-vs-current-IP VPN connectivity check (not a full leak test)

All these tools are real; no simulated phone numbers, VPN tunnels, or Duck addresses are shown.

## Independently checked
- On 2026-11-09, a fresh public-site fetch returned HTTP 200, the expected title and rendered live IP diagnostics.
- A fresh fetch of `/api/network` returned HTTP 200, JSON content type and request-specific IP/country/colo/asn fields.
- The Cloudflare API returned an enabled custom-domain mapping and corresponding proxied DNS record.
- The D1 schema was applied and the created table names were queried successfully.
- No independent end-to-end browser interaction, external SMS, inbound email delivery, WireGuard handshake or live card-payment verification has passed.

## No paid subscriptions yet
The only connected Stripe account is **Shards Inc. sandbox** (`livemode=false`). Do not offer live subscriptions or take money for undeployed products. The PayPal account has no payment links. All paid features remain disabled.

## Vendor restrictions
- DuckDuckGo supports private-address generation in its own supported browsers/extensions; it does not provide an official third-party API authorised for an embedded SaaS.
- Burner explicitly does not offer developer accounts or an API. Use a programmable telecom provider with contract and end-user regulatory compliance, or link customers to Burner separately.
- WireGuard needs a real Linux VPN gateway, peer provisioning, key management, IP assignment, and verified full-tunnel routing. An HTTP page cannot activate an OS-level VPN.

## Non-negotiable production gates
1. Customer auth: verified email, account recovery, session revocation, rate-limits/Turnstile, secure cookie + CSRF, audit trail and abuse controls.
2. Mail: dedicated email subdomain, Cloudflare Email Routing + Worker, per-customer alias ownership, real inbound delivery, MIME safety, revocation, retention and deletion tests. Never represent `@shardsinc.co.uk` aliases as `@duck.com` addresses.
3. Phone: telecom API and funded account, provision/receive/release tests, verified sender rules, end-user regulatory compliance/KYC where required, usage quotas and fraud controls. No fake numbers.
4. VPN: deployed WireGuard gateway, customer peer lifecycle, IP exhaustion controls, heartbeat/reconnect tests, routing/DNS leak tests, revocation, key deletion and hard cost caps.
5. Billing: merchant live-mode activation, chosen plans/prices, signed webhook verification, replay/idempotency, failed-payment suspension, renewal/cancel/refund and reconciled side effects.
6. Compliance: published accurate privacy/terms/refunds/contact information, ICO/UK GDPR assessment where applicable, DPA with infrastructure and telecom providers, abuse policy and incident response.
7. E2E: verified journey account -> payment -> entitlement -> each resource -> consumption -> cancellation -> revocation; fail closed for any unavailable provider.

**Decision:** do not activate customer payments until real providers are connected and every promise in the selected plan is deliverable.

## Live privacy toolkit (2026-11-09 extension)

**Public URL:** https://privacy.shardsinc.co.uk/lab

The Privacy Lab contains ten working modules:
1. Have I Been Pwned Pwned Passwords exposure check: browser SHA-1 hash; send only first 5 hexadecimal characters to a fixed-upstream server proxy; client matches returned suffixes. False negatives do not imply safety. Known test password matched 52,372,427 occurrences in the verified HIBP response.
2. Cloudflare DNS-over-HTTPS: strict hostname/type allowlist, single fixed resolver origin, A/AAAA/MX/TXT/NS/CAA/CNAME lookups and SPF/DMARC record inspection. Queries are sent to Cloudflare.
3. File integrity: local SHA-256/SHA-384/SHA-512, limited to 25 MiB.
4. Image metadata scrubber: local canvas re-encode to JPEG, removing commonly embedded metadata, 20 MiB / 24 Mp image limits. Re-encoding removes alpha/transparency and can alter visual quality. No guarantee about downstream metadata.
5. Cryptographic random 256-bit tokens and UUIDv4 from browser CSPRNG.
6. Local common-pattern PII text redaction; cannot guarantee all identifiers were found.
7. AES-256-GCM encrypted note and file export using PBKDF2-SHA256 with 350,000 iterations, 16-byte random salt, 12-byte random IV. No server persistence or key recovery.
8. Browser privacy posture and permissions introspection without requesting permissions.
9. Local RFC 6238 SHA-1 TOTP (6 digit / 30 seconds) derived from a user-entered Base32 secret. Do not enter authenticator seeds on untrusted websites.
10. Pasted HTTP security-header analysis; presence alone is not correctness.

**Third-party disclosure boundary:** DNS lookup names are sent to Cloudflare DoH. For HIBP, only the first five hex digits of a browser-computed SHA-1 hash cross the service boundary. Other Lab input content is designed to stay on the browser. This does not protect against compromised devices, malicious browser extensions, or future compromised site code.

**On-chain privacy:** Tornado Cash is not embedded, deployed, relayed, or monetised. US OFAC delisted Tornado Cash on March 21 2025, but UK commercial applicability and sanctions/financial promotion obligations need specialist legal review. The Lab provides research links only.

### Additional checks performed
- Independent fresh public request of the /lab page: HTTP 200, correct title and feature names.
- Independent fresh public request of /lab.js: HTTP 200; client JavaScript parsed successfully as JavaScript.
- Independent fresh public request of /api/dns?name=example.com&type=A: HTTP 200, real records with Status=0.
- Independent fresh public request of /api/pwned?prefix=5BAA6: HTTP 200, known breached-password suffix match with count; never queried plaintext.
- Regression workflow runs worker/client syntax checks, deployed Lab responses and real HIBP/DoH checks. A passing CI report is required before treating subsequent modifications as verified.

**Not yet verified:** manual mobile interactive tool-by-tool runs, end-to-end full user-flow, file-specific cross-browser compatibility, paid subscriptions, and legal approval for crypto transaction processing.
