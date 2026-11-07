export function StateDiagram(){
  const rows = [
    ['01','BOOTING'], ['02','IDLE'], ['03','VALIDATING'], ['04','ARBITRATING'],
    ['05','AUDITING / INTENT'],['06','EXECUTING'],['07','AUDITING / OUTCOME'],['08','COMPLETED'],
  ];
  return <div className="state-diagram">
    <div className="micro-label">EXECUTION STATE MODEL / CANONICAL</div>
    <ol className="state-timeline" aria-label="Kernel state sequence">
      {rows.map(([number,state])=><li key={number}>
        <span className="state-number">{number}</span><strong>{state}</strong>
        <span aria-hidden="true" className="state-line"/>
      </li>)}
    </ol>
    <div className="halt-path"><span>UNHANDLED EXCEPTION</span><span aria-hidden="true">→</span><strong>HALTED</strong></div>
    <p className="fine-print">An ALLOW must be committed to audit before execution; the outcome is separately recorded. Sequence shown as a schematic, not an execution trace.</p>
  </div>;
}
