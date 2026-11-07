import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/seo';

const space = Space_Grotesk({subsets:['latin'],display:'swap',variable:'--font-space'});
const mono = IBM_Plex_Mono({subsets:['latin'],weight:'400',display:'swap',variable:'--font-mono'});
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#05060a'};
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {default:'Shards Inc — Intelligence, governed.', template:'%s | Shards Inc'},
  description:'Deterministic control planes for autonomous AI. Explore Shards-Kernel, an early-stage open-source Python project.',
  alternates:{canonical: '/'},
  openGraph:{title:'Shards Inc — Intelligence, governed.',description:'Capability is not authority. Explore deterministic execution governance and auditable decisions.',type:'website',images:[{url:'/opengraph-image',width:1200,height:630}]},
  twitter:{card:'summary_large_image',images:['/opengraph-image']},
  robots:{index:true,follow:true},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en-GB" className={`${space.variable} ${mono.variable}`}><body>{children}</body></html>;
}
