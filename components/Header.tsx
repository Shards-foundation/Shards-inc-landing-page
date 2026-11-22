import Link from 'next/link';

export function Header(){
  return <header className="site-header">
    <Link href="/" className="wordmark" aria-label="SHARDS/INC. home">
      <span className="brand-glyph" aria-hidden="true"><i/><i/><i/></span>
      <span>SHARDS<span className="wordmark-light">/INC.</span></span>
    </Link>
    <nav className="nav-links" aria-label="Main navigation">
      <Link href="/#thesis">THESIS</Link><Link href="/#kernel">KERNEL</Link><Link href="/#systems">SYSTEMS</Link><Link href="/#contact">CONTACT</Link>
    </nav>
    <a className="nav-cta" href="https://github.com/Shards-foundation/Shards-kernel" target="_blank" rel="noopener noreferrer">VIEW SOURCE <span aria-hidden="true">↗</span></a>
  </header>;
}
