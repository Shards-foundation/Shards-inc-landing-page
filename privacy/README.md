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
