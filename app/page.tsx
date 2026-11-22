import { headers } from 'next/headers';
import { CopyInstall } from '@/components/CopyInstall';
import { Header } from '@/components/Header';
import { MindBackdrop } from '@/components/mind/MindBackdrop';
import { Playground } from '@/components/Playground';
import { ScrollDirector } from '@/components/ScrollDirector';
import { StateDiagram } from '@/components/StateDiagram';
import { VideoFacade } from '@/components/VideoFacade';
import { formatDate, getSiteData, getVideoMetadata } from '@/lib/data';
import { KERNEL_URL, ORG_URL, PYPI_URL, SITE_URL } from '@/lib/seo';

const reference = (path:string)=>`${KERNEL_URL}/blob/main/${path}`;
const link = (label:string,href:string)=>({label,href});
const proofs = [
  link('SPECIFICATION',reference('spec/SPEC.md')),
  link('ARCHITECTURE',reference('docs/ARCHITECTURE.md')),
  link('THREAT MODEL',reference('docs/THREAT_MODEL.md')),
  link('CHANGELOG',reference('CHANGELOG.md')),
  link('CONTRIBUTING',reference('CONTRIBUTING.md')),
  link('SECURITY',reference('SECURITY.md')),
];
export default async function Home(){
  const [data,video,h]=await Promise.all([getSiteData(),getVideoMetadata(),headers()]);
  const nonce=h.get('x-nonce')||undefined;
  const company={name:'Shards Inc Ltd',number:process.env.COMPANY_NUMBER,
    jurisdiction:process.env.COMPANY_JURISDICTION,office:process.env.COMPANY_REGISTERED_OFFICE,
    contact:process.env.CONTACT_EMAIL};
  const jsonld=[
    {'@context':'https://schema.org','@type':'Organization',name:company.name,url:SITE_URL,
      sameAs:[ORG_URL],...(company.contact?{email:company.contact}:{})},
    {'@context':'https://schema.org','@type':'WebSite',name:'Shards Inc',url:SITE_URL},
    {'@context':'https://schema.org','@type':'SoftwareApplication',name:'Shards-Kernel',
      description:'Deterministic control planes for AI systems',applicationCategory:'DeveloperApplication',
      operatingSystem:'Cross-platform',url:PYPI_URL,license:'https://opensource.org/licenses/MIT',
      ...(data.version?{softwareVersion:data.version}:{})},
  ];
  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,'\\u003c')}}/>
    <MindBackdrop/><ScrollDirector/><Header/>
    <main id="main" className="site-main">
      <section id="top" className="hero section-frame" data-mind-stage="HERO" aria-labelledby="headline">
        <div className="hero-copy">
          <div className="eyebrow"><span className="signal-square"/>SHARDS INC / LONDON <span className="line-piece"/> 001</div>
          <h1 id="headline">Intelligence,<br/><em>governed.</em></h1>
          <p className="hero-lede">Deterministic control planes for autonomous AI. No tool executes without an explicit ALLOW, and every ALLOW is audited.</p>
          <div className="hero-actions">
            <a className="button-filled" href={KERNEL_URL} target="_blank" rel="noopener noreferrer">EXPLORE THE KERNEL <span aria-hidden="true">↗</span></a>
            <a className="button-text" href="#video">WATCH THE DEMO <span aria-hidden="true">↗</span></a>
          </div>
          <CopyInstall/>
          <div className="status-row"><span className="status-pulse"/>ALPHA <span className="separator">/</span> MIT <span className="separator">/</span> OPEN SOURCE</div>
        </div>
        <div className="hero-annotation" aria-hidden="true"><span>FIG. 01 — THE MIND</span><span>VISUAL METAPHOR / NOT LIVE TELEMETRY</span></div>
        <div className="scroll-indicator"><span>SCROLL TO INTERROGATE THE SYSTEM</span><span className="scroll-line"/></div>
      </section>

      <section className="proof-band" aria-label="Shards-Kernel published facts">
        <div className="proof-header"><span className="micro-label">PUBLISHED SOURCE SIGNALS</span><span>REFRESHED AT MOST HOURLY · {data.source==='Live'?'LIVE SOURCES':'FALLBACK DATA'}</span></div>
        <div className="proof-grid">
          {[
            {label:'PYPI RELEASE',value:data.version??'Unavailable',href:PYPI_URL},
            {label:'LICENCE',value:data.licence??'Unavailable',href:reference('LICENSE')},
            {label:'PYTHON',value:data.python??'Unavailable',href:PYPI_URL},
            {label:'PROVENANCE',value:data.provenance,href:PYPI_URL},
            {label:'STARS',value:data.stars===null?'Unavailable':String(data.stars),href:KERNEL_URL},
            {label:'LAST COMMIT',value:formatDate(data.lastCommit),href:`${KERNEL_URL}/commits/main/`},
          ].map(p=><a className="proof-item" key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"><span>{p.label} ↗</span><strong>{p.value}</strong></a>)}
        </div>
      </section>

      <section id="thesis" className="section-frame thesis-section" data-mind-stage="THESIS" aria-labelledby="thesis-title">
        <div className="section-heading"><span className="section-index">01 / THESIS</span><span className="section-rule"/></div>
        <div className="content-column">
          <p className="micro-label">A DISTINCTION THAT MATTERS</p>
          <h2 id="thesis-title" className="display-title">Capability is<br/><em>not authority.</em></h2>
          <p className="section-lede">A capable agent can still make an unauthorised request. The execution boundary must be explicit, independent and observable.</p>
          <div className="fault-table">
            <div><span>01 / FAILURE</span><strong>Ambiguity reaches execution.</strong><p>Policy uncertainty is converted into action.</p><b>FIX — FAIL-CLOSED ARBITRATION</b></div>
            <div><span>02 / FAILURE</span><strong>State drifts without evidence.</strong><p>Post-hoc reconstruction replaces an audit trail.</p><b>FIX — EXPLICIT TRANSITIONS + HASH CHAIN</b></div>
            <div><span>03 / FAILURE</span><strong>Tool reach outruns operator intent.</strong><p>Access to a tool gets confused with permission to use it.</p><b>FIX — SCOPED PERMITS + REGISTRY</b></div>
          </div>
          <a className="underline-link" href={KERNEL_URL} target="_blank" rel="noopener noreferrer">READ THE DOCUMENTED INVARIANTS <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section id="kernel" className="section-frame kernel-section" data-mind-stage="KERNEL" aria-labelledby="kernel-title">
        <div className="section-heading"><span className="section-index">02 / THE KERNEL</span><span className="section-rule"/></div>
        <div className="kernel-layout">
          <div className="kernel-copy">
            <p className="micro-label">DETERMINISTIC EXECUTION CONTROL</p>
            <h2 id="kernel-title" className="display-title">One boundary.<br/><em>Explicit decisions.</em></h2>
            <p className="section-lede">The Kernel receives requests, evaluates jurisdiction, commits its decision and only then dispatches permitted tools. This is a local reference implementation with defined limits.</p>
            <div className="roles-grid">
              <div><span>OPERATOR</span><strong>Authority</strong><p>Policy, review, halt.</p></div>
              <div><span>KERNEL</span><strong>Arbitration</strong><p>Validation, decision, audit.</p></div>
              <div><span>TOOL REGISTRY</span><strong>Execution</strong><p>Sanctioned operations only.</p></div>
              <div><span>AGENT</span><strong>Request</strong><p>No direct tool access.</p></div>
            </div>
            <div className="limits-block"><span>WHAT THIS REFUSES TO CLAIM</span><p>Not a sandbox. Not a hosted gateway. Not a certification. The released local reference operator provides <code>echo</code> and <code>add</code> only.</p></div>
          </div>
          <StateDiagram/>
        </div>
      </section>

      <section id="playground" className="section-frame playground-section" data-mind-stage="PLAYGROUND" aria-labelledby="playground-title">
        <div className="section-heading"><span className="section-index">03 / GOVERNANCE PLAYGROUND</span><span className="section-rule"/></div>
        <div className="section-intro"><div><p className="micro-label">LOCAL / DETERMINISTIC / EDUCATIONAL</p><h2 id="playground-title" className="display-title">See the<br/><em>boundary hold.</em></h2></div><p>Walk a request from denial to approved execution, then attempt replay, expiry and revocation. Inspect a real SHA-256 hash chain produced in your browser.</p></div>
        <Playground/>
      </section>

      <section id="systems" className="section-frame systems-section" data-mind-stage="SYSTEMS" aria-labelledby="systems-title">
        <div className="section-heading"><span className="section-index">04 / OPEN SYSTEMS</span><span className="section-rule"/></div>
        <div className="section-intro"><div><p className="micro-label">CODE BEFORE CLAIMS</p><h2 id="systems-title" className="display-title">Systems in<br/><em>the open.</em></h2></div><p>Selected public, non-archived repositories from the organisation. Every project is experimental unless its own published documentation establishes a different status.</p></div>
        <div className="systems-grid">
          {data.repos.map((repo,i)=><a className="system-card" key={repo.url} href={repo.url} target="_blank" rel="noopener noreferrer">
            <div className="system-card-top"><span>{String(i+1).padStart(2,'0')} / OPEN SOURCE</span><span className="system-card-arrow" aria-hidden="true">↗</span></div>
            <span className={`system-badge ${repo.badge==='Flagship'?'is-flagship':''}`}>{repo.badge}</span>
            <h3>{repo.name}</h3><p>{repo.description}</p>
            <div className="system-card-bottom"><span>GITHUB REPOSITORY</span><span>{repo.stars===null?'STARS UNAVAILABLE':`${repo.stars} STARS`}</span></div>
          </a>)}
        </div>
        <a className="underline-link" href={`${ORG_URL}?tab=repositories`} target="_blank" rel="noopener noreferrer">BROWSE ALL PUBLIC REPOSITORIES ↗</a>
      </section>

      <section id="labs" className="section-frame lab-section" data-mind-stage="SYSTEMS" aria-labelledby="lab-title">
        <div className="section-heading"><span className="section-index">05 / TWO MODES OF WORK</span><span className="section-rule"/></div>
        <h2 id="lab-title" className="display-title">Build. Publish.<br/><em>Iterate.</em></h2>
        <div className="twin-grid">
          <div className="twin-panel"><span className="micro-label">SHARDS / LABS</span><h3>Systems engineering</h3><p>Commercial exploration of autonomous systems, agent infrastructure and the boundaries that make them operable.</p><span>PROTOTYPE → EVALUATE → REFINE</span></div>
          <div className="twin-panel"><span className="micro-label">SHARDS / FOUNDATION</span><h3>Open foundations</h3><p>Public code, technical education, documentation and contributions that others can inspect and extend.</p><a href={ORG_URL} target="_blank" rel="noopener noreferrer">EXPLORE THE ORGANISATION ↗</a></div>
        </div>
      </section>

      <section id="video" className="section-frame video-section" data-mind-stage="VIDEO" aria-labelledby="video-title">
        <div className="section-heading"><span className="section-index">06 / DOCUMENTATION FILM</span><span className="section-rule"/></div>
        <div className="section-intro"><div><p className="micro-label">VIEW THE SYSTEM</p><h2 id="video-title" className="display-title">Evidence over<br/><em>spectacle.</em></h2></div><p>See the published demonstration. Playback is optional; no connection to YouTube is made until you activate the player.</p></div>
        <VideoFacade title={video.title} author={video.author}/>
      </section>

      <section id="contribute" className="section-frame contribute-section" data-mind-stage="VIDEO" aria-labelledby="contribute-title">
        <div className="section-heading"><span className="section-index">07 / BUILD IN PUBLIC</span><span className="section-rule"/></div>
        <div className="contribute-layout"><div><p className="micro-label">START WITH THE SOURCE</p><h2 id="contribute-title" className="display-title">Read the code.<br/><em>Challenge the design.</em></h2><p className="section-lede">Shards-Kernel is an early alpha Python package. Start with the published release and its local demonstration, then inspect the specification before integrating it.</p><div className="quickstart" role="region" aria-label="Kernel installation commands" tabIndex={0}><code>$ pip install shards-kernel</code><code>$ python -m pip install &quot;shards-kernel[crypto]&quot;</code><code>$ shards-kernel demo --json</code></div><a className="button-filled" href={reference('CONTRIBUTING.md')} target="_blank" rel="noopener noreferrer">HOW TO CONTRIBUTE ↗</a></div>
          <div className="link-directory">{proofs.map(p=><a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"><span>{p.label}</span><span aria-hidden="true">↗</span></a>)}</div>
        </div>
      </section>

      <section id="contact" className="section-frame contact-section" data-mind-stage="CONTACT" aria-labelledby="contact-title">
        <div className="section-heading"><span className="section-index">08 / CONTACT</span><span className="section-rule"/></div>
        <p className="micro-label">SHARDS INC / LONDON</p>
        <h2 id="contact-title" className="contact-display">Build with<br/><em>intent.</em></h2>
        {company.contact?<a className="contact-email" href={`mailto:${company.contact}`}>{company.contact} <span aria-hidden="true">↗</span></a>:<p className="fine-print">Contact details pending verified company configuration.</p>}
      </section>
    </main>
    <footer className="site-footer"><div className="footer-top"><a className="footer-wordmark" href="#top">SHARDS/INC.</a><span>INTELLIGENCE, GOVERNED.</span><a href="#top">BACK TO TOP ↑</a></div>
      <div className="footer-bottom"><div><strong>Shards Inc Ltd</strong><p>Company no. {company.number||'Not configured'} · Registered in {company.jurisdiction||'Not configured'}.</p><p>Registered office: {company.office||'Not configured'}.</p></div><div><a href="/privacy">PRIVACY</a><a href={ORG_URL} target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href={PYPI_URL} target="_blank" rel="noopener noreferrer">PYPI ↗</a></div></div>
    </footer>
  </>;
}
