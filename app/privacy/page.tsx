import type { Metadata } from 'next';
import { Header } from '@/components/Header';
export const metadata: Metadata = {title:'Privacy',description:'Privacy notice for the Shards Inc website.',alternates:{canonical:'/privacy'}};
export default function Privacy(){
  const contact=process.env.CONTACT_EMAIL;
  return <><Header/><main className="privacy-content"><p className="micro-label">SHARDS INC / PRIVACY</p><h1>Privacy.</h1>
    <p>This is an early-stage informational website operated by Shards Inc Ltd. We have not installed advertising scripts, analytics scripts, tracking pixels or forms on the site.</p>
    <h2>What this site processes</h2><p>Browsing the site loads code and assets from our own hosting environment. Like most web hosts, the hosting provider may process technical request data such as IP addresses, timestamps and user-agent strings for delivery and operational purposes. Hosting-provider retention practices are subject to its own policies.</p>
    <h2>External links and video</h2><p>Links to GitHub, PyPI and other external sites take you to those providers. The embedded YouTube demonstration is not requested when the page first loads. Activating its play control loads YouTube&apos;s privacy-enhanced player, at which point YouTube may receive connection data and apply its policies.</p>
    <h2>Local demonstration</h2><p>The governance playground uses JavaScript and the browser&apos;s Web Crypto API to hash example evidence entries locally. It does not send requests or demonstration contents to a server. It does not store data in cookies, localStorage or sessionStorage.</p>
    <h2>Contact</h2><p>For privacy queries, {contact?<a href={`mailto:${contact}`}>{contact}</a>:'use the contact address published after company verification'}.</p>
    <p className="fine-print">Draft for legal review before production publication. Last revised 7 November 2026.</p>
  </main></>;
}
