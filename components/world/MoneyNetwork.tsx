'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';
import {banks,origins,sectors,engines,exposureWeight,type Mode,type WorldData,type Exposure,type V3} from '@/lib/world/model';
export type Stream={id:string;from:string;to:string;start:V3;end:V3;kind:'funding'|'loan'|'interest'|'risk'|'profit'|'dividend';width:number;source?:Exposure;color:string;bank?:string};
const colors={funding:'#5aafcf',loan:'#70bc9f',interest:'#dcc28d',risk:'#c5757d',profit:'#80cbb0',dividend:'#beb0d8'};
const at=(p:V3,y=1.2):V3=>[p[0],y,p[2]];
export function companyPoint(bank:V3,index:number):V3{return [bank[0]+Math.cos(index*1.05)*12,3.2,bank[2]+Math.sin(index*1.05)*12]}
export function makeStreams(mode:Mode,ticker:string|null,data:WorldData|null,sector:string|null):Stream[]{
 const list:Stream[]=[];const add=(id:string,from:string,to:string,start:V3,end:V3,kind:Stream['kind'],bank?:string,source?:Exposure,width=.055)=>list.push({id,from,to,start,end,kind,color:colors[kind],bank,source,width});
 const focused=ticker&&['concentration','sectors','funding','risk','profit','district'].includes(mode)?banks.filter(b=>b.ticker===ticker):banks;
 for(const b of focused){
 if(!['concentration','sectors','profit'].includes(mode))for(const o of (mode==='flow'||mode==='funding'?origins:origins.filter((_,i)=>i===0||i===2)))add(`in-${b.ticker}-${o.id}`,o.label,b.ticker,at(o.position),at(b.position,2),'funding',b.ticker);
 if(mode==='concentration'||mode==='sectors'){
 const rows=data?.banks.find(x=>x.ticker===b.ticker)?.exposures??[];
 rows.forEach((e,i)=>{const target=e.company?companyPoint(b.position,i):sectors.find(s=>s.id===e.destination)?.position;const w=exposureWeight(e,rows);if(!target||w===null||w<=0||(sector&&!e.company&&e.destination!==sector))return;add(`exp-${b.ticker}-${i}`,b.ticker,e.category,at(b.position,3.2),at(target,2),'loan',b.ticker,e,.055+w*.25)});
 }else if(mode!=='funding'){
 // Conceptual borrower connection: deliberately equal widths, never a claimed sector allocation.
 add(`loan-${b.ticker}`,b.ticker,'ผู้กู้ในเศรษฐกิจ (ภาพจำลอง)',at(b.position,3),[24,1.3,4],'loan',b.ticker);
 add(`return-${b.ticker}`,'ผู้กู้ → ดอกเบี้ย (ภาพจำลอง)',b.ticker,[25,1.8,6],at(b.position,6),'interest',b.ticker);
 }
 if(mode!=='funding'&&mode!=='concentration'&&mode!=='sectors'){
 add(`risk-${b.ticker}`,b.ticker,'ความเสี่ยง / NPL',at(b.position,1.5),[-32,2,33],'risk',b.ticker);
 add(`income-${b.ticker}`,b.ticker,'ค่าใช้จ่าย / ภาษี',at(b.position,4),[-10,3,25],'profit',b.ticker);
 }
 }
 if(!['funding','concentration','sectors'].includes(mode)){
 add('risk-ecl','ความเสี่ยง','สำรอง / ECL',[-32,2,33],[-18,2,34],'risk');
 add('ecl-profit','ผลกระทบของสำรอง','กำไรสุทธิ',[-18,2,34],[-3,3,34],'profit');
 add('cost-profit','รายได้หลังต้นทุน','กำไรสุทธิ',[-10,3,25],[-3,3,34],'profit');
 add('profit-capital','กำไรสุทธิ','ทุนสะสม',[-3,3,34],[10,3,35],'profit');
 add('dividend','กำไรที่จัดสรร','ผู้ถือหุ้น',[-3,3,34],[23,3,42],'dividend');
 }
 return list;
}
export function MoneyNetwork({mode,ticker,data,sector,stress,paused,low,onStream}:{mode:Mode;ticker:string|null;data:WorldData|null;sector:string|null;stress:number;paused:boolean;low:boolean;onStream:(s:Stream)=>void}){
 const streams=useMemo(()=>makeStreams(mode,ticker,data,sector),[mode,ticker,data,sector]);
 const paths=useMemo(()=>streams.map(s=>{const a=new THREE.Vector3(...s.start),b=new THREE.Vector3(...s.end);const mid=a.clone().lerp(b,.5);mid.y+=Math.min(7,a.distanceTo(b)*.13);mid.z+=s.kind==='interest'?3:0;const curve=new THREE.CatmullRomCurve3([a,mid,b]);return {s,curve,samples:curve.getSpacedPoints(100)}}),[streams]);
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(paths.length*(low?7:15)*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(paths.length*(low?7:15)*3),3));return g},[paths,low]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const topPaths=paths.filter(p=>p.s.source&&!p.s.source.company).sort((a,b)=>b.s.width-a.s.width).slice(0,3);
 const time=useRef(0);const temp=useRef(new THREE.Vector3());const color=useRef(new THREE.Color());
 useFrame((_,dt)=>{if(!paused)time.current+=Math.min(dt,.05);const count=low?7:15;const positions=geometry.attributes.position as THREE.BufferAttribute;const colorsAttr=geometry.attributes.color as THREE.BufferAttribute;
 paths.forEach(({s,samples},i)=>{for(let j=0;j<count;j++){
 const stressed=mode==='risk'&&(s.kind==='loan'||s.kind==='risk')&&j/count<stress*.65;
 let u=(time.current*(stressed?.025:.08)+j/count)%1;
 if(stressed)u=Math.min(u,.68); // Stalled particles represent a conceptual stress queue, not a measured NPL ratio.
 if(s.id==='ecl-profit'&&j/count<stress*.5){positions.setXYZ(i*count+j,0,-50,0);continue}
 if(s.id==='cost-profit'&&j%4===0){positions.setXYZ(i*count+j,0,-50,0);continue}
 const idx=Math.min(99,Math.floor(u*100));temp.current.copy(samples[idx]).lerp(samples[idx+1],u*100-idx);positions.setXYZ(i*count+j,temp.current.x,temp.current.y,temp.current.z);
 color.current.set(stressed?'#f18c91':s.color);colorsAttr.setXYZ(i*count+j,color.current.r,color.current.g,color.current.b);
 }});positions.needsUpdate=true;colorsAttr.needsUpdate=true});
 return <group name="money-flow-network">{paths.map(({s,curve})=><mesh key={s.id} onClick={e=>{e.stopPropagation();onStream(s)}}><tubeGeometry args={[curve,36,s.width,5,false]}/><meshBasicMaterial color={s.color} transparent opacity={s.source?.7:mode==='flow'?.2:.32} depthWrite={false}/></mesh>)}<points geometry={geometry} frustumCulled={false}><pointsMaterial size={low?.34:.25} vertexColors transparent opacity={.95} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}/></points>
 {mode==='concentration'&&topPaths.map(({s,curve},i)=><Html key={'rank-'+s.id} center position={curve.getPoint(.65).add(new THREE.Vector3(0,2+i*1.2,0))} zIndexRange={[9,0]}><button className="exposure-tag" onClick={()=>onStream(s)}>#{i+1} {s.to}<small>{s.source?.share!=null?`${s.source.share}%`:s.source?.amount!=null?`${s.source.amount.toLocaleString('th-TH')} ล้านบาท`:'N/A'} · {s.source?.period}</small></button></Html>)}
 {mode==='concentration'&&ticker&&paths.filter(p=>p.s.source?.company).map(({s})=><group key={s.id} position={s.end}><mesh><icosahedronGeometry args={[.65,1]}/><meshStandardMaterial color="#b3a3d6" emissive="#817398" emissiveIntensity={.5}/></mesh><Html center position={[0,1.6,0]} zIndexRange={[8,0]}><button className="district-label" onClick={()=>onStream(s)}>{s.to}<span>{s.source?.share??'N/A'}% · สัดส่วนตามบริษัท</span></button></Html></group>)}
 </group>
}
