import { describe, expect, it } from 'vitest';
import { appendEntry, GENESIS, verifyChain } from '../lib/ledger';

describe('client-side audit chain',()=>{
  it('starts at a deterministic genesis',()=>expect(GENESIS).toBe('0'.repeat(64)));
  it('commits and verifies in strict order',async()=>{
    const a=await appendEntry([],'DENY','missing_permit');
    const b=await appendEntry([a],'ALLOW','valid_scoped_permit');
    const c=await appendEntry([a,b],'OUTCOME','echo_completed');
    expect(a.previousHash).toBe(GENESIS);
    expect(b.previousHash).toBe(a.hash);
    expect(c.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyChain([a,b,c])).toBe(true);
  });
  it('rejects altered records and missing entries',async()=>{
    const a=await appendEntry([],'ALLOW','approved');
    const b=await appendEntry([a],'OUTCOME','completed');
    expect(await verifyChain([{...a,reason:'forged'},b])).toBe(false);
    expect(await verifyChain([b])).toBe(false);
    expect(await verifyChain([{...a,hash:'0'.repeat(64)},b])).toBe(false);
  });
});
