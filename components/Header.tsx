export function Header(){
  return <header className="site-header">
    <a href="#top" className="wordmark" aria-label="SHARDS/INC. home">
      <span className="brand-glyph" aria-hidden="true"><i/><i/><i/></span>
      <span>SHARDS<span className="wordmark-light">/INC.</span></span>
    </a>
    <nav className="nav-links" aria-label="Main navigation">
      <a href="#thesis">THESIS</a><a href="#kernel">KERNEL</a><a href="#systems">SYSTEMS</a><a href="#contact">CONTACT</a>
    </nav>
    <a className="nav-cta" href="https://github.com/Shards-foundation/Shards-kernel" target="_blank" rel="noopener noreferrer">VIEW SOURCE <span aria-hidden="true">↗</span></a>
  </header>;
}
