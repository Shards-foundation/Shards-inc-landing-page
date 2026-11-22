'use client';
import { useState } from 'react';
export function VideoFacade({title,author}:{title:string;author:string|null}){
  const [loaded,setLoaded]=useState(false);
  return <div className="video-facade">
    {loaded?<iframe
      title={title} src="https://www.youtube-nocookie.com/embed/lU9HhusLSe8?autoplay=1"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share; autoplay"
      allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />:
      <button className="video-play" type="button" onClick={()=>setLoaded(true)} aria-label={`Play documentation film — load external YouTube video: ${title}`}>
        <span className="video-symbol" aria-hidden="true">▶</span>
        <span className="video-play-copy">PLAY DOCUMENTATION FILM <span>↗</span></span>
      </button>}
    <div className="video-caption"><span>{title}</span><span>{author ? `BY ${author} · `:''}YouTube loads only after activation</span></div>
  </div>;
}
