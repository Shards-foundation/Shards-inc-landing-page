# Build decisions — 7 November 2026

| Decision | Reason / evidence | Consequence |
| --- | --- | --- |
| **Canonical host: `www.shardsinc.co.uk`**, pending domain routing verification | The request title says `www.shardsinc.co.uk`; the brief contradicts itself with `www.shardinc.co.uk`. Read-only Cloudflare zone inspection confirms an active `shardsinc.co.uk` zone with **zero DNS records**. The connected Vercel project `shards-inc-website` has only Vercel-generated hostnames, no verified custom host. | Do not touch DNS or publish redirects until Vercel supplies exact records. Hold `www.shardinc.co.uk` out of the configuration. |
| **Repository remains unpublished** | The requested private `Shards-foundation/shards-inc-site` repository does not exist. The connected GitHub connector has no create-repository action. Browser Use private-repository creation failed with `insufficient_credits`. The existing `Shards-inc-landing-page` repository is public. The user subsequently explicitly supplied that repository as the target. | The replacement may be reviewed on a branch in the **public** repository. Do not merge or update domain before release gates and approval. |
| **Signal accent: warm alloy / brass `#D8B46E`** | Deliberate separation of governance authority (one restrained UI accent) from the Mind's iridescent material. Better contrast and brand distinctiveness than saturated violet or cyan UI gradients. | UI remains obsidian/monochrome apart from the single signal hue. |
| **Type: Space Grotesk variable + IBM Plex Mono regular via `next/font`** | Display/clean-body plus technical annotations without loading unrelated font families. | Next self-hosts fonts at build. Output font-file count and byte cap require verification. |
| **Mind model: procedurally authored low-poly lathe bust** | No licence-chain ambiguity or external GLB download. `MeshSurfaceSampler` places GPU instanced crystals onto its surface. | The source geometry and still poster are original project assets. No DRACO/Meshopt decoder dependency. |
| **3D canvas uses GPU shaders, not per-frame matrix edits** | Thousands of CPU instance transforms would add main-thread work during scroll. | The initial matrices are set once; movement, assembly, scan and repulsion run in the vertex shader. |
| **No Lenis** | Only one GSAP ScrollTrigger driver is necessary; native scrolling reduces risk on touch devices and avoids smooth-scroll accessibility conflicts. | Desktop scroll remains native; the Mind follows section progress. |
| **Latest selected package versions checked against npm registry** | A temporary Vercel sandbox checked 7 November 2026 registry versions. Version resolution itself is not proof of dependency compatibility. | Exact versions declared; install, frozen lockfile and build are release gates. |
| **Provenance labelled `Not verified` by default** | PyPI JSON release metadata does not itself prove that the selected artifacts carry attestations. | Never claim release provenance until same-release artifact verification is implemented. |
| **GitHub system cards are curated from live repo metadata** | Repository descriptions can be hyperbolic or outside site scope. Server filters public, non-fork, non-archived repo data and writes neutral summaries. | No false claims about maturity; non-Kernel cards default to `Experimental`. |
| **Simulation hashes real but signatures are simulated** | Web Crypto SHA-256 verifies a genuine local chain, while an unprovisioned browser cannot represent an independent trusted Ed25519 issuer. | Copy marks approval/signatures/execution as illustrative. |
| **No privacy-invasive analytics or forms** | The site's conversion is a link to source or a mailto action. | `/privacy` describes local code and video loading. A solicitor must review the text before public release. |
| **Production build fails without real legal metadata** | `COMPANY_NUMBER`, `COMPANY_JURISDICTION`, `COMPANY_REGISTERED_OFFICE`, `CONTACT_EMAIL` were absent from the connected project's Vercel environment inspection. | `prebuild` exits nonzero until verified values are supplied. This is an intentional release blocker. |

## Unverified release gates

- Full pnpm lockfile generation, dependency installation, typecheck, Next build, browser screenshots, axe and Lighthouse are not yet verified in this local artifact.
- No 5-run Lighthouse medians, INP field metrics, mobile/desktop GPU FPS or GPU-resource leak inspection has been recorded.
- Domain routing, apex 308, existing path retention, cookie/storage behaviour in deployed preview and company details are not verified.
- Video oEmbed title/author are fetched at build/runtime with a conservative fallback if blocked; actual video content not inspected.
- Privacy is a draft requiring legal review; no adopted terms are asserted.
