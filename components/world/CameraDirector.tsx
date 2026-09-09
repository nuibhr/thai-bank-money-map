'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import type {OrbitControls as ControlsImpl} from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import {banks,journeyPoints,type Bank,type Mode,type V3} from '@/lib/world/model';
import {sections,type SectionId} from '@/lib/bank-sections';
export default function CameraDirector({bank,mode,interior,expanded,section,journey,paused,onStep,onComplete,focus,nonce}:{bank:Bank|null;mode:Mode;interior:boolean;expanded:boolean;section:SectionId|null;journey:number;paused:boolean;onStep:(n:number)=>void;onComplete:()=>void;focus:V3|null;nonce:number}){
 const {camera,size}=useThree();const controls=useRef<ControlsImpl>(null);const marker=useRef<THREE.Mesh>(null);const tl=useRef<gsap.core.Timeline|null>(null);const movement=useRef({t:0,following:false,active:false});const stage=useRef(-1);const currentBank=bank??banks[0];
 const curve=useMemo(()=>new THREE.CatmullRomCurve3(journeyPoints(currentBank).map(p=>new THREE.Vector3(...p)),false,'catmullrom',.25),[currentBank]);
 const point=useRef(new THREE.Vector3()),ahead=useRef(new THREE.Vector3()),desired=useRef(new THREE.Vector3());
 useEffect(()=>{
 const c=controls.current;if(!c)return;tl.current?.kill();movement.current.active=false;movement.current.following=false;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const duration=reduced?.65:2;
 const timeline=gsap.timeline();tl.current=timeline;c.enabled=false;
 const fly=(p:V3,target:V3)=>timeline.to(camera.position,{x:p[0],y:p[1],z:p[2],duration,ease:'power2.inOut'},0).to(c.target,{x:target[0],y:target[1],z:target[2],duration,ease:'power2.inOut',onUpdate:()=>c.update()},0);
 if(journey){
 const start=curve.getPoint(0);movement.current={t:0,following:false,active:true};stage.current=-1;
 fly([start.x+9,start.y+7,start.z+12],[start.x,start.y,start.z]);
 timeline.call(()=>{movement.current.following=true}).to(movement.current,{t:1,duration:58,ease:'none'}).call(()=>{movement.current.active=false;movement.current.following=false;c.enabled=true;onStep(11);onComplete()});
 }else{
 let target:V3=[0,2,2],pos:V3=size.width<size.height?[97,103,139]:[76,64,90];
 if(mode==='valuation'){target=focus??[0,9,0];pos=focus?[focus[0]+12,focus[1]+9,focus[2]+20]:[35,28,46]}
 else if(interior&&bank){const y=section?Math.max(3,.7+sections.findIndex(s=>s.id===section)*(expanded?1.6:.75)):5;target=[bank.position[0]+1.5,y,bank.position[2]];pos=[target[0]+11,y+7,target[2]+19]}
 else if(focus){target=[focus[0],3,focus[2]];pos=[focus[0]+18,21,focus[2]+27]}
 else if(mode==='funding'){target=[-32,2,-3];pos=[1,40,49]}
 else if(mode==='risk'){target=[-19,2,29];pos=[15,31,70]}
 else if(mode==='profit'){target=[7,2,34];pos=[37,28,70]}
 else if(mode==='compare'){target=[0,5,0];pos=[26,24,52]}
 else if(bank&&mode==='district'){target=[bank.position[0],bank.height*.4,bank.position[2]];pos=[target[0]+15,18,target[2]+23]}
 else if(mode==='district'){target=[0,3,0];pos=[37,33,48]}
 else if(bank&&(mode==='concentration'||mode==='sectors')){target=[14,3,4];pos=[62,47,69]}
 fly(pos,target).call(()=>{c.enabled=true});
 }
 return()=>{timeline.kill();c.enabled=true};
 },[bank,mode,interior,expanded,section,journey,focus,nonce,camera,curve,onStep,onComplete]);
 useEffect(()=>{if(journey){if(paused)tl.current?.pause();else tl.current?.resume()}},[paused,journey]);
 useFrame((_,dt)=>{const m=movement.current,c=controls.current;if(marker.current)marker.current.visible=m.active;if(!m.active||!c)return;curve.getPoint(m.t,point.current);marker.current?.position.copy(point.current);const s=Math.min(11,Math.floor(m.t*11+.1));if(s!==stage.current){stage.current=s;onStep(s)}if(m.following){curve.getPoint(Math.min(1,m.t+.012),ahead.current);desired.current.copy(point.current).add(new THREE.Vector3(9,7,12));const alpha=1-Math.exp(-dt*4);camera.position.lerp(desired.current,alpha);c.target.lerp(ahead.current,alpha);c.update()}});
 return <><OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.07} minDistance={7} maxDistance={230} maxPolarAngle={Math.PI*.475} minPolarAngle={.14}/><mesh ref={marker} visible={false} name="follow-100-marker"><icosahedronGeometry args={[.55,2]}/><meshBasicMaterial color="#ffdfa2" toneMapped={false}/><pointLight color="#efd1a0" intensity={7} distance={5}/></mesh></>
}
