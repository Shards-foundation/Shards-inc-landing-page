'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMindStore, type MindStage } from '@/lib/mind-store';

export function ScrollDirector(){
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const targets=document.querySelectorAll<HTMLElement>('[data-mind-stage]');
    const triggers=Array.from(targets).map(el=>ScrollTrigger.create({
      trigger:el,start:'top center',end:'bottom center',
      onEnter:self=>useMindStore.getState().setStage(el.dataset.mindStage as MindStage,self.progress),
      onEnterBack:self=>useMindStore.getState().setStage(el.dataset.mindStage as MindStage,self.progress),
      onUpdate:self=>{
        if(self.isActive)useMindStore.getState().setStage(el.dataset.mindStage as MindStage,self.progress);
      },
    }));
    return ()=>triggers.forEach(t=>t.kill());
  },[]);
  return null;
}
