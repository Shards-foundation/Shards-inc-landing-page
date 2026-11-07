'use client';
import { useState } from 'react';
const COMMAND='pip install shards-kernel';
export function CopyInstall(){
  const [copied,setCopied]=useState(false);
  async function copy(){
    try{await navigator.clipboard.writeText(COMMAND);setCopied(true);
    }catch{setCopied(false);}
  }
  return <button className="install-chip" onClick={copy} type="button">
    <span className="terminal-dollar">$</span><code>{COMMAND}</code><span className="copy-hint">{copied?'COPIED':'COPY ↗'}</span>
  </button>;
}
