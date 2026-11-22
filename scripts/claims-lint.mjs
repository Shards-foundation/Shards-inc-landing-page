import fs from 'node:fs';
import path from 'node:path';

const forbidden = [
  /\bAGI\b/i, /\bASI\b/i, /\bsuper-intelligen\w*/i,
  /\benterprise-grade\b/i, /\bproduction-ready\b/i,
  /\bguarantee\w*\b/i, /\bunhackable\b/i, /\bpip\s+install\s+kernels\b/i,
];
const allowed = JSON.parse(fs.readFileSync('claims-allowlist.json', 'utf8'));
const scanned = [];
function visit(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!['node_modules','.git','.next','coverage'].includes(f.name)) visit(p);
    } else if (/\.(html|tsx|jsx|mdx)$/.test(f.name) && !p.includes('test')) scanned.push(p);
  }
}
visit('.next/server/app');
// Source is checked as well so builds cannot suppress prohibited language by skipping rendering.
visit('app'); visit('components');
let errors = 0;
for (const file of scanned) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    const hit = text.match(pattern);
    if (!hit) continue;
    if (allowed.some((a) => a.phrase.toLowerCase() === hit[0].toLowerCase() && /^https:\/\//.test(a.source))) continue;
    console.error(`${file}: prohibited claim ${JSON.stringify(hit[0])}`);
    errors++;
  }
}
if (errors) process.exit(1);
console.log(`claims-lint: scanned ${scanned.length} files, 0 violations`);
