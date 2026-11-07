/* eslint-disable react-hooks/immutability -- GPU uniforms are intentionally mutated in useFrame without React renders. */
'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, useDetectGPU } from '@react-three/drei';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3,
  DoubleSide, Group, InstancedBufferAttribute, LatheGeometry, MathUtils,
  InstancedMesh, Matrix4, Mesh, Plane, Raycaster, ShaderMaterial,
  TetrahedronGeometry, Vector2, Vector3,
} from 'three';
import { stageToState, useMindStore, type KernelState } from '@/lib/mind-store';

type Tier = 'desktop' | 'mid' | 'low';
const shardVertex = /* glsl */ `
  attribute vec3 aHome; attribute vec3 aScatter; attribute vec3 aAxis;
  attribute float aSeed;
  uniform float uAssemble; uniform float uTime; uniform float uState;
  uniform vec3 uPointer;
  varying vec3 vNormal; varying float vSeed; varying float vDist;
  void main() {
    float breathing = sin(uTime * 0.72 + aSeed * 6.28) * 0.014;
    float execution = step(3.9, uState) * (1.0 - step(4.9, uState)) * 0.12;
    float scan = step(0.9, uState) * (1.0 - step(1.9, uState));
    vec3 center = mix(aScatter, aHome, uAssemble);
    center += normalize(aAxis + vec3(.001)) * (breathing + execution);
    center.y += scan * 0.025 * sin(center.y * 15.0 - uTime * 5.0);
    vec3 d = center - uPointer;
    float repel = .065 / (1.0 + 7.0 * dot(d,d));
    center += normalize(d + vec3(.0001)) * repel;
    // Faceted shards turn slightly, but all per-shard motion remains on GPU.
    float theta = .15 * sin(uTime * .35 + aSeed * 15.0);
    mat2 rot = mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
    vec3 local = position;
    local.xz = rot * local.xz;
    vec4 viewPosition = modelViewMatrix * vec4(local + center, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    vNormal = normalize(normalMatrix * normal);
    vSeed = aSeed;
    vDist = length(viewPosition.xyz);
  }
`;
const shardFragment = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uState; uniform float uOpacity;
  varying vec3 vNormal; varying float vSeed; varying float vDist;
  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.,0.,1.))), 2.25);
    float phase = dot(vNormal,vec3(.5,.3,.8)) * 1.8 + vSeed * 1.8 + uTime * .1;
    vec3 titanium = vec3(.26,.39,.45);
    vec3 spectrum = vec3(.34 + .15*sin(phase), .49 + .15*sin(phase+2.1), .58 + .12*sin(phase+4.2));
    vec3 colour = mix(titanium, spectrum, .75) + fresnel*vec3(.52,.65,.75);
    float audit = step(2.9,uState)*(1.0-step(3.9,uState));
    colour += vec3(.36,.26,.09)*audit*max(0.0,sin(uTime*17.0+vSeed*16.0));
    float halted = step(5.9, uState);
    colour = mix(colour, vec3(.20,.23,.25), halted*.86);
    gl_FragColor = vec4(colour,uOpacity);
  }
`;
const coreVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  void main(){
    float n=sin(position.x*21.0+uTime*1.4)*sin(position.y*17.0-uTime*.83);
    float pulse=.015*sin(uTime*1.2)+.013*n;
    vec3 displaced=position+normal*pulse;
    vNormal=normalize(normalMatrix*normal);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(displaced,1.0);
  }
`;
const coreFragment = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uState; uniform float uOpacity;
  varying vec3 vNormal;
  void main(){
    float edge=pow(1.0-abs(dot(normalize(vNormal),vec3(0.0,0.0,1.0))),1.6);
    float pulse=.72+.20*sin(uTime*1.3);
    float halted=step(5.9,uState);
    vec3 emission=vec3(.72,.79,.81)*pulse+vec3(.26,.20,.10)*edge;
    emission=mix(emission,vec3(.18,.21,.23),halted*.87);
    gl_FragColor=vec4(emission,uOpacity);
  }
`;
const haloVertex = /* glsl */ `
  attribute float aSeed; uniform float uTime; uniform float uAssemble;
  varying float vFade;
  void main() {
    float t = fract(aSeed + uTime * (.012 + aSeed*.01));
    float a = aSeed * 251.3 + t*1.8;
    float r = mix(3.2, .28, pow(t,.72)) + .11*sin(a*5.0);
    vec3 p = vec3(cos(a)*r, sin(a*1.4)*1.5 + (1.-t)*.2, sin(a)*r*.6);
    p = mix(p, p*.73, uAssemble);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(2.6, 6.5/-mv.z) * (1.0-t);
    vFade = .4*(1.-t)*sin(3.14159*t);
  }
`;
const haloFragment = /* glsl */ `
  varying float vFade;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord-.5);
    if(d>.5) discard;
    gl_FragColor = vec4(.58,.73,.85, uOpacity * vFade* (1.-d*2.));
  }
`;
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296);
}
function buildShards(count: number) {
  const rand = seeded(0x5aada12);
  // Self-authored low-poly profile: head, neck and shoulder geometry.
  const silhouette = [
    [0,-1.14],[.28,-1.13],[.69,-.97],[.91,-.77],[.88,-.64],
    [.61,-.47],[.34,-.25],[.24,-.10],[.25,.09],[.35,.21],
    [.43,.40],[.47,.68],[.43,.98],[.33,1.23],[.15,1.38],[0,1.41],
  ].map(([x,y]) => new Vector2(x,y));
  const surface = new LatheGeometry(silhouette,14);
  const sampler = new MeshSurfaceSampler(new Mesh(surface));
  // Three.js runtime implements this method; @types/three can lag behind.
  (sampler as MeshSurfaceSampler & { setRandomGenerator: (rng: () => number) => MeshSurfaceSampler }).setRandomGenerator(rand);
  sampler.build();
  const base = new TetrahedronGeometry(1,0);
  base.scale(.015,.06,.015);
  const home = new Float32Array(count*3);
  const scatter = new Float32Array(count*3);
  const axes = new Float32Array(count*3);
  const seeds = new Float32Array(count);
  const sample = new Vector3();
  for(let i=0;i<count;i++){
    sampler.sample(sample);
    home.set([sample.x,sample.y,sample.z],i*3);
    const angle=rand()*Math.PI*2;
    const radius=1.9+rand()*2.2;
    scatter.set([Math.cos(angle)*radius,(rand()-.5)*4,Math.sin(angle)*radius],i*3);
    axes.set([rand()*2-1,rand()*2-1,rand()*2-1],i*3);
    seeds[i]=rand();
  }
  base.setAttribute('aHome',new InstancedBufferAttribute(home,3));
  base.setAttribute('aScatter',new InstancedBufferAttribute(scatter,3));
  base.setAttribute('aAxis',new InstancedBufferAttribute(axes,3));
  base.setAttribute('aSeed',new InstancedBufferAttribute(seeds,1));
  surface.dispose();
  return base;
}
function Shards({count,uniforms}:{count:number; uniforms:Record<string,{value:unknown}>}){
  const mesh=useRef<InstancedMesh>(null);
  const geometry=useMemo(()=>buildShards(count),[count]);
  const material=useMemo(()=>new ShaderMaterial({uniforms,vertexShader:shardVertex,fragmentShader:shardFragment,side:DoubleSide,transparent:true,depthWrite:false}),[uniforms]);
  useEffect(()=>{
    if(!mesh.current) return;
    const id=new Matrix4();
    for(let i=0;i<count;i++) mesh.current.setMatrixAt(i,id);
    mesh.current.instanceMatrix.needsUpdate=true;
  },[count]);
  useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
  return <instancedMesh ref={mesh} args={[geometry,material,count]} frustumCulled={false}/>;
}
function Halo({count,uniforms}:{count:number;uniforms:Record<string,{value:unknown}>}){
  const geometry=useMemo(()=>{
    const g=new BufferGeometry();
    const positions=new Float32Array(count*3);
    const seeds=new Float32Array(count);
    const rand=seeded(0xcafebabe);
    for(let i=0;i<count;i++) seeds[i]=rand();
    g.setAttribute('position',new BufferAttribute(positions,3));
    g.setAttribute('aSeed',new BufferAttribute(seeds,1));
    return g;
  },[count]);
  const material=useMemo(()=>new ShaderMaterial({uniforms,vertexShader:haloVertex,fragmentShader:haloFragment,transparent:true,depthWrite:false,blending:AdditiveBlending}),[uniforms]);
  useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
  return <points args={[geometry,material]} frustumCulled={false}/>;
}
const curves = new CatmullRomCurve3([
  new Vector3(.4,.10,4.5),new Vector3(.0,.25,4.25),new Vector3(-.3,.2,4.8),
  new Vector3(.45,.1,4.7),new Vector3(-.5,.15,4.6),new Vector3(.2,.1,4.3),
  new Vector3(0,.15,4.7),
]);
const stageT:Record<string,number>={HERO:0,THESIS:.16,KERNEL:.34,PLAYGROUND:.53,SYSTEMS:.69,VIDEO:.83,CONTACT:1};
const stateIndex: Record<KernelState,number> = {
  IDLE:0,VALIDATING:1,ARBITRATING:2,AUDITING:3,EXECUTING:4,COMPLETED:5,HALTED:6,
};
function Scene({tier}:{tier:Tier}){
  const { camera }=useThree();
  const group=useRef<Group>(null);
  const ring=useRef<Group>(null);
  const clock=useRef(0);
  const mouse=useRef(new Vector3(10,10,0));
  const frameCamera=useRef(0);
  const uniforms=useMemo(()=>({
    uTime:{value:0},uAssemble:{value:0},uState:{value:0},uOpacity:{value:1},
    uPointer:{value:new Vector3(10,10,0)},
  }),[]);
  useEffect(()=>{
    const ray=new Raycaster();const plane=new Plane(new Vector3(0,0,1),0);
    const cursor=new Vector2();
    const move=(e:PointerEvent)=>{
      cursor.set((e.clientX/window.innerWidth)*2-1,-(e.clientY/window.innerHeight)*2+1);
      ray.setFromCamera(cursor,camera);
      ray.ray.intersectPlane(plane,mouse.current);
    };
    window.addEventListener('pointermove',move,{passive:true});
    return ()=>window.removeEventListener('pointermove',move);
  },[camera]);
  useFrame((_,delta)=>{
    const d=Math.min(delta,.05);
    clock.current+=d;
    const {stage,progress,simulated}=useMindStore.getState();
    const state=simulated && stage==='PLAYGROUND' ? simulated : stageToState(stage,progress);
    const halted=state==='HALTED';
    uniforms.uTime.value=clock.current;
    uniforms.uAssemble.value=MathUtils.damp(uniforms.uAssemble.value as number,halted ? 0.98 : 1,1.7,d);
    uniforms.uState.value=stateIndex[state];
    const dim = stage==='SYSTEMS' ? .48 : stage==='THESIS' ? .72 : stage==='CONTACT' ? .82 : 1;
    uniforms.uOpacity.value=MathUtils.damp(uniforms.uOpacity.value as number,dim,1.3,d);
    (uniforms.uPointer.value as Vector3).lerp(mouse.current,Math.min(1,delta*4));
    frameCamera.current=MathUtils.damp(frameCamera.current,Math.min(1,stageT[stage]+progress*.06),1.3,d);
    const goal=curves.getPoint(frameCamera.current);
    camera.position.lerp(goal,Math.min(1,d*1.1));
    camera.lookAt(0,.08,0);
    if(group.current){
      // A section-scoped composition: proof remains visible while content gets room.
      const xByStage:Record<string,number>={HERO:.52,THESIS:.92,KERNEL:.35,PLAYGROUND:.66,SYSTEMS:.83,VIDEO:.48,CONTACT:.52};
      const scaleByStage:Record<string,number>={HERO:1,THESIS:.88,KERNEL:.82,PLAYGROUND:.97,SYSTEMS:.71,VIDEO:.83,CONTACT:1};
      group.current.position.x=MathUtils.damp(group.current.position.x,xByStage[stage],1.15,d);
      const newScale=MathUtils.damp(group.current.scale.x,scaleByStage[stage],1.15,d);
      group.current.scale.setScalar(newScale);
      group.current.rotation.y=MathUtils.damp(group.current.rotation.y,
        MathUtils.clamp(mouse.current.x*.036,-.21,.21),.9,d);
      group.current.rotation.x=MathUtils.damp(group.current.rotation.x,
        MathUtils.clamp(-mouse.current.y*.012,-.15,.15),.9,d);
    }
    if(ring.current){
      ring.current.rotation.y+=halted?0:d*(state==='ARBITRATING'?.9:.08);
      ring.current.rotation.z=MathUtils.damp(ring.current.rotation.z,
        state==='ARBITRATING'?Math.PI/3:0,2,d);
    }
  });
  const count=tier==='desktop'?4000:tier==='mid'?2000:800;
  const halo=tier==='desktop'?30000:tier==='mid'?22000:12000;
  return <>
    <group ref={group} position={[0,-.04,0]}>
      <Halo count={halo} uniforms={uniforms}/>
      <Shards count={count} uniforms={uniforms}/>
      <mesh position={[0,.15,0]}>
        <icosahedronGeometry args={[.17,2]}/>
        <shaderMaterial args={[{ uniforms, vertexShader:coreVertex, fragmentShader:coreFragment, transparent:true, depthWrite:false }]}/>
      </mesh>
      <group ref={ring}>
        {[0,1,2].map((i)=><mesh key={i} rotation={[i*.55,i*1.047,i*.4]}>
          <torusGeometry args={[.88+i*.07,.006,3,90]}/>
          <meshBasicMaterial color={i===1?'#eac17b':'#7c9ca6'} transparent opacity={i===1?.46:.24} depthWrite={false}/>
        </mesh>)}
      </group>
    </group>
    {tier==='desktop'&&<EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={.7} intensity={.32}/>
      <Vignette eskil={false} offset={.23} darkness={.54}/>
      <Noise opacity={.035}/>
      <ChromaticAberration offset={new Vector2(.00025,.0002)}/>
    </EffectComposer>}
  </>;
}
function GPUCheck({onFailed}:{onFailed:()=>void}) {
  const gpu=useDetectGPU();
  useEffect(()=>{ if (gpu.tier === 0) onFailed(); }, [gpu.tier,onFailed]);
  return null;
}
export default function MindCanvas({tier,onFailed}:{tier:Tier;onFailed:()=>void}){
  const [quality,setQuality]=useState<Tier>(tier);
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const onVisibility=()=>setVisible(document.visibilityState==='visible');
    document.addEventListener('visibilitychange',onVisibility);
    return ()=>document.removeEventListener('visibilitychange',onVisibility);
  },[]);
  return <Canvas
    aria-hidden="true"
    frameloop={visible?'always':'never'}
    dpr={quality==='desktop'?[1,1.5]:quality==='mid'?[1,1.25]:1}
    camera={{ fov:41, position:[.4,.10,4.5], near:.1, far:50 }}
    gl={{alpha:true, antialias:quality==='desktop', powerPreference:'high-performance'}}
    onCreated={({gl})=>{
      const lost=(e:Event)=>{e.preventDefault();onFailed();};
      gl.domElement.addEventListener('webglcontextlost',lost,{once:true});
    }}
    fallback={null}
  >
    <Suspense fallback={null}><GPUCheck onFailed={onFailed}/></Suspense>
    <PerformanceMonitor onDecline={()=>setQuality('low')} onIncline={()=>{
      if(tier==='desktop') setQuality('desktop');
    }}/>
    <Scene tier={quality}/>
  </Canvas>;
}
