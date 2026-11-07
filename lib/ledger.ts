export type AuditKind = 'DENY' | 'ALLOW' | 'OUTCOME';
export interface Entry {
  index: number;
  kind: AuditKind;
  reason: string;
  previousHash: string;
  hash: string;
}
export const GENESIS = '0'.repeat(64);
export function serialize(index: number, kind: AuditKind, reason: string, previousHash: string) {
  return JSON.stringify({ index, kind, reason, previousHash });
}
export async function sha256(message: string): Promise<string> {
  const bytes = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((c) => c.toString(16).padStart(2, '0')).join('');
}
export async function appendEntry(entries: readonly Entry[], kind: AuditKind, reason: string): Promise<Entry> {
  const index = entries.length;
  const previousHash = entries[index - 1]?.hash ?? GENESIS;
  const hash = await sha256(serialize(index, kind, reason, previousHash));
  return { index, kind, reason, previousHash, hash };
}
export async function verifyChain(entries: readonly Entry[]): Promise<boolean> {
  let previousHash = GENESIS;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.index !== i || e.previousHash !== previousHash) return false;
    if ((await sha256(serialize(e.index, e.kind, e.reason, e.previousHash))) !== e.hash) return false;
    previousHash = e.hash;
  }
  return true;
}
