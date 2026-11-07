'use client';

import { useCallback, useState } from 'react';
import { appendEntry, verifyChain, type Entry, type AuditKind } from '@/lib/ledger';
import { useMindStore, type KernelState } from '@/lib/mind-store';

interface DemoStep {
  title: string;
  text: string;
  kind?: AuditKind;
  reason?: string;
  state: KernelState;
}
const demo: DemoStep[] = [
  {title:'Request submitted',text:'An agent requests echo(text). Requesting is not authorisation.',state:'VALIDATING'},
  {title:'DENY / no permit',text:'Without a separately issued permit, execution is blocked.',state:'ARBITRATING',kind:'DENY',reason:'missing_permit'},
  {title:'Human approval',text:'A human approves an exact permit draft. This is a simulated approval, not a credential.',state:'VALIDATING'},
  {title:'Separate issuer',text:'A distinct issuer signs the approved draft in the real workflow. Here the signature is simulated.',state:'ARBITRATING'},
  {title:'ALLOW / intent committed',text:'An ALLOW decision is committed to the local hash chain before simulated tool execution.',state:'AUDITING',kind:'ALLOW',reason:'valid_scoped_permit'},
  {title:'EXECUTING / outcome audited',text:'The simulated echo operation completes. A separate outcome entry is chained.',state:'EXECUTING',kind:'OUTCOME',reason:'echo_completed'},
  {title:'Replay DENY',text:'The same single-use permit cannot authorise another execution.',state:'HALTED',kind:'DENY',reason:'permit_replayed'},
  {title:'Expiry DENY',text:'An expired permit is refused.',state:'HALTED',kind:'DENY',reason:'permit_expired'},
  {title:'Revocation DENY',text:'A revoked permit is refused.',state:'HALTED',kind:'DENY',reason:'permit_revoked'},
  {title:'Chain verified',text:'Every entry is re-hashed in the browser with Web Crypto SHA-256.',state:'COMPLETED'},
];
export function Playground(){
  const [index,setIndex]=useState(-1);
  const [entries,setEntries]=useState<Entry[]>([]);
  const [verified,setVerified]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false);
  const setSimulated=useMindStore((s)=>s.setSimulated);
  const step=useCallback(async()=>{
    if(busy || index>=demo.length-1) return;
    setBusy(true);
    try{
      const next=index+1;
      const s=demo[next];
      let current=entries;
      if(s.kind && s.reason){
        const entry=await appendEntry(current,s.kind,s.reason);
        current=[...current,entry];setEntries(current);
      }
      if(next===demo.length-1) setVerified(await verifyChain(current));
      setSimulated(s.state);
      setIndex(next);
    }finally{setBusy(false);}
  },[busy,index,entries,setSimulated]);
  const reset=()=>{setIndex(-1);setEntries([]);setVerified(null);setSimulated(null);};
  return <div className="playground-grid">
    <div className="sim-terminal" aria-label="Client-side demonstration sequence">
      <div className="terminal-top"><span className="terminal-dot"/><span>OFFLINE / BROWSER SIMULATION</span><span>01—10</span></div>
      <div className="terminal-inner">
        <div className="terminal-eyebrow">CURRENT DECISION</div>
        <div className={`terminal-decision ${index>=0&&demo[index].state==='HALTED'?'is-denied':''}`} aria-live="polite" aria-atomic="true">
          {index<0?'AWAITING REQUEST':demo[index].title.toUpperCase()}
        </div>
        <p className="terminal-description" aria-live="polite">
          {index<0?'Run the sequence to see the approval boundary and audit evidence.':demo[index].text}
        </p>
        <div className="terminal-meta">
          <span>EXECUTION</span><strong>{index<5?'NOT AUTHORISED':index===5?'SIMULATED':'BLOCKED / FINISHED'}</strong>
          <span>AUDIT ENTRIES</span><strong>{String(entries.length).padStart(2,'0')}</strong>
          <span>CHAIN STATUS</span><strong>{verified===null?'NOT YET VERIFIED':verified?'SHA-256 VERIFIED':'VERIFICATION FAILED'}</strong>
        </div>
      </div>
      <div className="terminal-actions">
        <button type="button" className="action-primary" onClick={step} disabled={busy||index===demo.length-1}>
          {index===demo.length-1?'Sequence complete':index<0?'Begin simulation':'Next state'} <span aria-hidden="true">↗</span>
        </button>
        <button type="button" className="action-outline" onClick={reset}>Reset</button>
      </div>
    </div>
    <div className="audit-stack">
      <div className="micro-label">HASH-CHAINED EVIDENCE / SHA-256</div>
      {entries.length===0 ? <div className="empty-ledger">Audit entries will appear here after the first decision. Each hash is computed using Web Crypto.</div>:
      <ol className="audit-list" aria-label="Local chained audit evidence">
        {entries.map(e=><li key={e.hash} className="audit-entry">
          <div><span className="audit-index">{String(e.index).padStart(2,'0')}</span><strong>{e.kind}</strong><span>{e.reason}</span></div>
          <code title={e.hash}>{e.hash.slice(0,20)}…{e.hash.slice(-8)}</code>
        </li>)}
      </ol>}
      <p className="fine-print">A simulation of the documented <code>shards-kernel demo</code>, not a running Kernel. The chain hashes are real; human approval, issuer signature, permit lifecycle and execution are illustrative. No network requests or real tools are invoked.</p>
    </div>
  </div>;
}
