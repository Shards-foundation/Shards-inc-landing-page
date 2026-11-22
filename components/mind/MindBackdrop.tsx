'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
const MindCanvas=dynamic(()=>import('./MindCanvas'),{ssr:false});
type Tier='desktop'|'mid'|'low';

export function MindBackdrop(){
  const [tier,setTier]=useState<Tier|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const raf=requestAnimationFrame(()=>{
      const ready=()=>{
        if(cancelled) return;
        const media=matchMedia('(prefers-reduced-motion: reduce)').matches;
        const nav=navigator as Navigator & {connection?:{saveData?:boolean};deviceMemory?:number};
        const lowMemory=(nav.deviceMemory??4)<=2;
        const webgl=(()=>{
          try{const c=document.createElement('canvas');return Boolean(c.getContext('webgl2'));}
          catch{return false;}
        })();
        if(media||nav.connection?.saveData||lowMemory||!webgl)return;
        const width=window.innerWidth;
        setTier(width<600?'low':width<1100?'mid':'desktop');
      };
      // Preserve first-paint priority for the image before starting WebGL.
      if('requestIdleCallback' in window){
        (window as Window & {requestIdleCallback:(cb:()=>void)=>number}).requestIdleCallback(ready);
      }else setTimeout(ready,250);
    });
    return ()=>{cancelled=true;cancelAnimationFrame(raf);};
  },[]);
  return <div className="mind-backdrop" aria-hidden="true">
    <Image src="/images/mind-poster.webp" alt="" priority fill sizes="100vw" className="mind-poster"/>
    {tier&&!failed&&<div className="mind-canvas"><MindCanvas tier={tier} onFailed={()=>setFailed(true)}/></div>}
    <div className="mind-veil" />
  </div>;
}
