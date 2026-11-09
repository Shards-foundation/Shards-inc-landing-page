# Shards Voice Studio — 2026-11-09

**Public URL:** https://voice.shardsinc.co.uk
**Cloudflare Worker:** `shards-voice-studio` (Shards-inc account)
**Database:** `shards-voice-prod` (Cloudflare D1, EU jurisdiction), bound as `VOICE_DB`
**Public home integration:** linked from https://privacy.shardsinc.co.uk/
**Implementation source:** `privacy/voice-worker.js`

## Actually deployed
- Real browser text-to-speech using `SpeechSynthesisUtterance`, installed browser/OS voices, live play/pause/resume/stop, speed, pitch and language selection. Does not produce an MP3 file.
- Browser speech recognition (where available; `SpeechRecognition` / `webkitSpeechRecognition`) with live editable transcript, clipboard and TXT download. It may be sent by the browser to an upstream recognition provider.
- Microphone recording using `getUserMedia` and `MediaRecorder` with waveform, preview, one-minute timeout and file download. Stays in the browser; no upload.
- Cloud synthesis endpoint `POST /api/tts` and Scribe transcription `POST /api/transcribe`, coded against documented ElevenLabs APIs. Disabled until all authentication and key requirements are satisfied; no fake audio returned.
- `GET /api/status`: accurately advertises `elevenlabs.enabled` and browser-feature descriptions.
- 404 for unknown paths, no caching, CSP, HSTS, no implicit cross-origin API usage.

## Provider integration credentials
The connected ElevenLabs ChatGPT plugin **does not** make its key available to Cloudflare Workers. The Cloudflare Worker must have its own server-side scoped ElevenLabs API credential, created by the owner in https://elevenlabs.io/app/settings/api-keys or the current account's credential settings.

Never paste or commit API keys into GitHub, browser JavaScript, documents, screenshots or this conversation. Store the key using Cloudflare Worker secrets:

- `ELEVENLABS_API_KEY`: provider developer API credential.
- `VOICE_ACCESS_TEAM`: Cloudflare Access team subdomain (e.g. companyname, without .cloudflareaccess.com).
- `VOICE_ACCESS_AUD`: exact Access application audience tag (JWT aud).

Each must be configured as a Worker secret or trusted server binding. **The code refuses cloud requests unless all three values and `VOICE_DB` are present.**

## Authentication and entitlement
The application does not trust client-generated identities. It requires a **cryptographically verified Cloudflare Access RS256 JWT**:
- `cf-access-jwt-assertion` header
- issuer exactly the configured team domain
- expected Access application audience
- valid expiry / not-before and matching RS256 signature from Access JWKS
- a nonempty subject claim

Requests also require same-origin `Origin`. The provider key is never sent to the client.

Cloudflare Access application must cover /api/tts and /api/transcribe for permitted operators, not publicly issued customer accounts. **This is an administrative gate, not integrated paid-customer entitlement verification.** Do not enable retail checkout or expand Access to external users until Stripe live billing, server-side subscription checks, cancellation/revocation, fraud and abuse limits, and payment reconciliation are deployed.

## Usage constraints (the stricter gates apply)
- TTS: voice IDs on a fixed curated allowlist, text length 1–1200 characters, per-Access-subject cap 6,000 chars/UTC day, account-wide cap 30,000 chars/day.
- Scribe STT: audio MIME allowlist, body/file limit 4 MiB, per-Access-subject cap 5 jobs/UTC day, account-wide cap 30 jobs/day. A short uploaded file limit **does not enforce an audio-duration cap**; verify billable audio duration upstream before enabling customer access.
- Cloudflare D1 keeps only a SHA-256 pseudonym of the Access subject, UTC day, operation and unit counters. A failed provider call may still consume an entitlement to fail conservatively.
- Upstream provider requests use fixed HTTPS endpoints, not arbitrary URLs.
- Failed AI provider requests return a non-sensitive error, not a fake result.

The production billing threshold remains CLOSED. ElevenLabs audio and transcription inputs will be processed by ElevenLabs when enabled; no zero-retention guarantee is made.

## API runbook
```bash
# Public checks
curl -i https://voice.shardsinc.co.uk/
curl -s https://voice.shardsinc.co.uk/api/status
curl -i -X POST https://voice.shardsinc.co.uk/api/tts \
  -H "Origin: https://voice.shardsinc.co.uk" \
  -H "Content-Type: application/json" \
  --data '{"text":"test","voice_id":"JBFqnCBsd6RMkjVDRZzb"}'
# Expected without secret/access: HTTP 503 and not-configured error, no provider charge.
```

## Tested
- Cloudflare Worker script uploaded and custom domain mapping enabled.
- D1 EU database created, schema applied, D1 binding verified by API.
- Independent public fetch: `/` HTTP 200, `/studio.js` HTTP 200, `/api/status` HTTP 200, unknown path 404.
- Deployed `/api/status` says `elevenlabs.enabled = false` as required.
- JavaScript source and client parse validation passed during authoring.
- GitHub Action `voice-smoke.yml` is authoritative for API 503 fail-closed and CSP tests; inspect individual run results before claiming pass.

## Unverified or not delivered
- Actual ElevenLabs-generated paid MP3 or Scribe transcript via this website: provider credential absent.
- Mobile/browser permission journey, synthesized voice quality, real microphone capture, cross-device recording support, voice preferences and language accuracy: require device-specific acceptance tests.
- Live subscription billing, payment webhook, entitlements, account signup, customer receipts/refunds and privacy terms: not integrated.
- Non-custodial or crypto functionality: not part of Voice Studio.

## Operational hardening before paid activation
1. Configure a restricted ElevenLabs API key and provider billing ceiling.
2. Deploy an Access application with an authenticated admin-only policy; get its team domain and AUD.
3. Test signed Access JWTs, invalid signatures, cross-user quota isolation and quota contention.
4. Test ElevenLabs request streaming, malformed provider errors and invoices.
5. Add end-to-end customer auth, live Stripe subscriptions and server-side entitlement enforcement (not just Access).
6. Review UK GDPR/privacy terms, provider processing agreements, AI voice consent/impersonation policy, abuse response and retention.
7. Run real Android and iOS browser/microphone tests, then graduate the draft PR only after reviewers approve.
