'use client';
import {Canvas} from '@react-three/fiber';
import {useEffect,useState} from 'react';
import {Html} from '@react-three/drei';
import {banks,origins,sectors,engines,type Bank,type Mode,type WorldData,type V3,type Place} from '@/lib/world/model';
import {BankInterior} from './BankInterior';
import {PremiumTower,District,FinancialEngine} from './world/Architecture';
import {MoneyNetwork,type Stream} from './world/MoneyNetwork';
import CameraDirector from './world/CameraDirector';
import ValuationGalaxy from './world/ValuationGalaxy';
import type {SectionId} from '@/lib/bank-sections';
export type {Bank} from '@/lib/world/model';
export const BANKS=banks;
export type WorldProps={onReady:()=>void;selected:Bank|null;onSelect:(b:Bank)=>void;onEnter:(b:Bank)=>void;interior:boolean;expanded:boolean;section:SectionId|null;metric:string|null;onSection:(s:SectionId)=>void;onMetric:(s:string)=>void;mode:Mode;data:WorldData|null;sector:string|null;onPlace:(p:Place)=>void;onStream:(s:Stream)=>void;journey:number;paused:boolean;onStep:(n:number)=>void;onComplete:()=>void;focus:V3|null;nonce:number;stress:number;comparison:string[];low:boolean;onValuation:(ticker:string,p:V3)=>void};
function Scene(p:WorldProps){const visibleStress=p.mode==='risk'?p.stress:0;return <>
 <color attach="background" args={['#080f18']}/><fog attach="fog" args={['#080f18',95,255]}/><ambientLight intensity={1.5}/><hemisphereLight args={['#bcd8eb','#101724',1.4]}/><directionalLight position={[-25,70,30]} intensity={3.5} castShadow shadow-mapSize={[p.low?512:2048,p.low?512:2048]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={70} shadow-camera-bottom={-70}/><directionalLight position={[35,20,-35]} color="#799ab9" intensity={2}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.3,0]} receiveShadow><planeGeometry args={[220,220]}/><meshStandardMaterial color="#101e2b" metalness={.32} roughness={.55}/></mesh>
 <gridHelper args={[180,60,'#264252','#182d3c']} position={[0,-.27,0]}/>
 {p.mode==='valuation'?<ValuationGalaxy data={p.data} selected={p.selected?.ticker??null} onSelect={p.onValuation}/>:<>
 <mesh position={[0,-.05,0]}><cylinderGeometry args={[23,24,.4,64]}/><meshStandardMaterial color="#172b3b" metalness={.55} roughness={.42}/></mesh>
 {banks.map(b=>{const ci=p.comparison.indexOf(b.ticker);const compare=p.mode==='compare'&&ci>=0;const target:V3=compare?[(ci-(p.comparison.length-1)/2)*12,0,0]:b.position;return p.interior&&p.selected?.ticker===b.ticker?<BankInterior key={b.ticker} bank={b} expanded={p.expanded} section={p.section} metric={p.metric} onSection={p.onSection} onMetric={p.onMetric}/>:<PremiumTower key={b.ticker} bank={b} target={target} selected={p.selected?.ticker===b.ticker} dim={p.interior||p.mode==='compare'&&!compare||!!p.selected&&p.selected.ticker!==b.ticker} onSelect={()=>p.onSelect(b)} onEnter={()=>p.onEnter(b)} compare={compare} snapshot={p.data?.banks.find(x=>x.ticker===b.ticker)}/>})}
 {origins.map(o=><District key={o.id} place={o} low={p.low} color="#669ebc" active={p.mode==='funding'} onSelect={()=>p.onPlace(o)}/>)}
 {sectors.map(s=><District key={s.id} place={s} low={p.low} color="#8cb7a5" active={s.id===p.sector||p.mode==='concentration'&&!!p.data?.banks.find(b=>b.ticker===p.selected?.ticker)?.exposures.some(e=>!e.company&&e.destination===s.id)} onSelect={()=>p.onPlace(s)}/>)}
 {engines.map(e=><FinancialEngine key={e.id} place={e} stress={visibleStress} active={p.mode==='risk'||p.mode==='profit'} onSelect={()=>p.onPlace(e)}/>)}
 {p.mode!=='compare'&&<MoneyNetwork mode={p.mode} ticker={p.selected?.ticker??null} data={p.data} sector={p.sector} stress={visibleStress} paused={p.paused} low={p.low} onStream={p.onStream}/>}
 <Html center position={[0,.6,-22]} zIndexRange={[2,0]}><div className="ground-title">THE BANKING DISTRICT<span>เงินทุน • ความเสี่ยง • ผลตอบแทน</span></div></Html>
 </>}
 <CameraDirector bank={p.selected} mode={p.mode} interior={p.interior} expanded={p.expanded} section={p.section} journey={p.journey} paused={p.paused} onStep={p.onStep} onComplete={p.onComplete} focus={p.focus} nonce={p.nonce}/>
 </>}
export default function BankWorld(props:WorldProps){const [mobile,setMobile]=useState(false);const [supported,setSupported]=useState<boolean|null>(null);useEffect(()=>{const probe=document.createElement('canvas');try{const context=probe.getContext('webgl2');setSupported(!!context);context?.getExtension('WEBGL_lose_context')?.loseContext()}catch{setSupported(false)}},[]);useEffect(()=>{const m=window.matchMedia('(max-width: 760px)');setMobile(m.matches);const change=()=>setMobile(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change)},[]);if(supported===null)return <div className="world-unavailable" role="status">กำลังเตรียมโลก 3D…</div>;if(!supported)return <div className="world-unavailable" role="status"><span>3D WORLD</span><h2>WebGL ไม่พร้อมใช้งาน</h2><p>เบราว์เซอร์นี้สร้างฉาก 3D ไม่ได้ โปรดใช้เบราว์เซอร์ที่รองรับ WebGL 2 และเปิดการเร่งกราฟิก<br/>ยังเลือกธนาคารและอ่านหลักฐานจากเมนูได้</p></div>;return <Canvas shadows={!props.low&&!mobile} dpr={[1,props.low||mobile?1:1.5]} camera={{position:[76,64,90],fov:48,near:.3,far:400}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.domElement.setAttribute('aria-label','โลกธนาคาร 3D หมุน เลื่อน และซูมได้');gl.domElement.setAttribute('tabindex','0');props.onReady()}}><Scene {...props} low={props.low||mobile}/></Canvas>}
