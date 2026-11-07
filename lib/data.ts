import snapshot from './fallback.json';

export interface Repo {
  name: string;
  url: string;
  description: string;
  stars: number | null;
  pushedAt: string | null;
  badge: 'Flagship' | 'Experimental';
}
export interface SiteData {
  version: string | null;
  licence: string | null;
  python: string | null;
  provenance: 'Verified for this release' | 'Not verified';
  stars: number | null;
  lastCommit: string | null;
  repos: Repo[];
  fetchedAt: string | null;
  source: 'Live' | 'Fallback';
}
const ORG = 'Shards-foundation';
const PKG = 'shards-kernel';
const KERNEL = 'Shards-kernel';
const HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'shards-inc-website',
};
if (process.env.GITHUB_TOKEN) HEADERS.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const NOT_SHOWCASE = /trading|investment|financial|revenue|super.intelligen|(?:^|[-_])agi(?:$|[-_])|(?:^|[-_])asi(?:$|[-_])/i;
const CURATED = new Set([
  'shards-kernel','shards-workflow-hub','shards-playbooks','shards-rag',
  'omni-llm-orchestrator','agentmesh','shards-agent-core','shards-discord-bot',
]);
const descriptions: Record<string, string> = {
  'shards-kernel': 'Deterministic execution arbitration and audit for AI agents.',
  'shards-workflow-hub': 'Workflow experiments and reusable operational patterns.',
  'shards-playbooks': 'Reusable instructions and operational playbooks.',
  'shards-rag': 'Retrieval-augmented generation exploration.',
  'omni-llm-orchestrator': 'Model orchestration experiments.',
  'agentmesh': 'Experiments in agent communication and coordination.',
  'shards-agent-core': 'Code for core agent components.',
  'shards-discord-bot': 'Discord bot integration project.',
};

function usableRepo(x: unknown): x is Record<string, unknown> & { name: string; html_url: string } {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return typeof r.name === 'string' && typeof r.html_url === 'string' &&
    r.private === false && r.archived === false && r.fork === false;
}
function makeRepo(x: Record<string, unknown>): Repo {
  const name = String(x.name);
  return {
    name,
    url: String(x.html_url),
    description: descriptions[name.toLowerCase()] ?? 'Open-source project; see repository for current scope.',
    stars: typeof x.stargazers_count === 'number' ? x.stargazers_count : null,
    pushedAt: typeof x.pushed_at === 'string' ? x.pushed_at : null,
    badge: name.toLowerCase() === 'shards-kernel' ? 'Flagship' : 'Experimental',
  };
}
function isJsonRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Upstream ${res.status}: ${new URL(url).hostname}`);
  return res.json() as Promise<unknown>;
}
function fallback(): SiteData {
  return JSON.parse(JSON.stringify(snapshot)) as SiteData;
}

/** Server-only: no GitHub/PyPI requests originate in the visitor's browser. */
export async function getSiteData(): Promise<SiteData> {
  const out = fallback();
  let github = false;
  let pypi = false;
  try {
    const pkg = await getJson(`https://pypi.org/pypi/${PKG}/json`);
    if (isJsonRecord(pkg) && isJsonRecord(pkg.info)) {
      const info = pkg.info;
      out.version = typeof info.version === 'string' ? info.version : null;
      out.python = typeof info.requires_python === 'string' ? info.requires_python : null;
      out.licence = Array.isArray(info.classifiers) && info.classifiers.some((s) =>
        typeof s === 'string' && s.includes('MIT License')) ? 'MIT' : null;
      // PyPI JSON alone is insufficient to prove provenance for *this* release.
      // Check attestations separately before claiming verification.
      out.provenance = 'Not verified';
      pypi = true;
    }
  } catch (error) { console.warn('PyPI unavailable, using fallback', error); }

  try {
    const selected: Repo[] = [];
    for (let page = 1; page <= 5; page++) {
      const data = await getJson(`https://api.github.com/orgs/${ORG}/repos?type=public&per_page=100&page=${page}`, HEADERS);
      if (!Array.isArray(data)) throw new Error('GitHub response is not a list');
      for (const x of data) {
        if (!usableRepo(x) || NOT_SHOWCASE.test(x.name)) continue;
        if (CURATED.has(x.name.toLowerCase())) selected.push(makeRepo(x));
      }
      if (data.length < 100) break;
    }
    const kernel = selected.find((r) => r.name.toLowerCase() === KERNEL.toLowerCase());
    out.repos = [
      ...(kernel ? [kernel] : []),
      ...selected.filter((r) => r !== kernel).sort((a,b) =>
        (b.pushedAt || '').localeCompare(a.pushedAt || '')).slice(0, 5),
    ];
    if (kernel) out.stars = kernel.stars;
    // `pushed_at` is not proof of the latest commit timestamp.
    const latest = await getJson(`https://api.github.com/repos/${ORG}/${KERNEL}/commits?per_page=1`, HEADERS);
    if (Array.isArray(latest) && isJsonRecord(latest[0]) && isJsonRecord(latest[0].commit)) {
      const commit = latest[0].commit;
      const committer = isJsonRecord(commit.committer) ? commit.committer : null;
      out.lastCommit = typeof committer?.date === 'string' ? committer.date : null;
    }
    github = true;
  } catch (error) { console.warn('GitHub unavailable, using fallback', error); }
  out.source = github && pypi ? 'Live' : 'Fallback';
  out.fetchedAt = github || pypi ? new Date().toISOString() : null;
  return out;
}

export async function getVideoMetadata(): Promise<{title:string; author:string|null}> {
  try {
    const u = new URL('https://www.youtube.com/oembed');
    u.searchParams.set('url', 'https://youtu.be/lU9HhusLSe8');
    u.searchParams.set('format', 'json');
    const data = await getJson(u.toString());
    if (!isJsonRecord(data)) throw new Error('Invalid video response');
    return {
      title: typeof data.title === 'string' ? data.title : 'Shards-Kernel demonstration',
      author: typeof data.author_name === 'string' ? data.author_name : null,
    };
  } catch {
    return { title: 'Shards-Kernel demonstration', author: null };
  }
}
export function formatDate(x: string | null): string {
  if (!x || Number.isNaN(Date.parse(x))) return 'Unavailable';
  return new Intl.DateTimeFormat('en-GB',{ day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(x));
}
