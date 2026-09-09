'use client';
import {Html} from '@react-three/drei';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {type Bank,type Place,type Snapshot,display} from '@/lib/world/model';
const metal='#253e51';
function Block({position,size,color=metal}:{position:[number,number,number];size:[number,number,number];color?:string}){return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={.55} roughness={.36}/></mesh>}
function Crown({y,r,color}:{y:number;r:number;color:string}){return <mesh position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,.045,6,48]}/><meshBasicMaterial color={color}/></mesh>}
export function PremiumTower({bank,selected,dim,target,onSelect,onEnter,compare,snapshot}:{bank:Bank;selected:boolean;dim:boolean;target:[number,number,number];onSelect:()=>void;onEnter:()=>void;compare:boolean;snapshot?:Snapshot}){
 const group=useRef<THREE.Group>(null);const h=bank.height;const c=dim?'#344352':bank.accent;
 useFrame((_,dt)=>{if(group.current){group.current.position.x=THREE.MathUtils.damp(group.current.position.x,target[0],4,dt);group.current.position.z=THREE.MathUtils.damp(group.current.position.z,target[2],4,dt)}});
 return <group ref={group} position={bank.position} name={`bank-${bank.ticker}`} onClick={e=>{e.stopPropagation();onSelect()}} onDoubleClick={e=>{e.stopPropagation();onEnter()}}>
 <Block position={[0,.18,0]} size={[6.8,.36,6.8]} color="#142a3a"/><Block position={[0,.55,0]} size={[5.4,.4,5.4]} color="#304756"/>
 <mesh position={[0,h*.5,0]}><cylinderGeometry args={[.58,.58,h*.86,12]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={dim?.05:selected?1:.35} transparent opacity={.6}/></mesh>
 {bank.shape==='terraces'&&[0,1,2,3].map(i=><group key={i} position={[i*.25-0.35,0,0]}><Block position={[0,1+(h-i*2.1)/2,0]} size={[4.2-i*.8,h-i*2.1,3.6-i*.45]}/></group>)}
 {bank.shape==='spire'&&<><mesh position={[0,h/2+.8,0]} castShadow><cylinderGeometry args={[.85,2.4,h,6]}/><meshStandardMaterial color="#3a3651" metalness={.65} roughness={.22}/></mesh><mesh position={[0,h+2.2,0]}><coneGeometry args={[.8,3,6]}/><meshStandardMaterial color={c} metalness={.8} roughness={.25}/></mesh></>}
 {bank.shape==='twins'&&<><Block position={[-1.6,h/2,0]} size={[1.8,h,3.2]}/><Block position={[1.6,h*.44,0]} size={[1.8,h*.88,3.2]}/><Block position={[0,h*.72,0]} size={[4,.7,2.4]} color={c}/></>}
 {bank.shape==='obelisk'&&<mesh position={[0,h/2+.6,0]} rotation={[0,Math.PI/4,0]} castShadow><cylinderGeometry args={[1.5,3,h,4]}/><meshStandardMaterial color="#253c59" metalness={.75} roughness={.28}/></mesh>}
 {bank.shape==='ribbon'&&Array.from({length:7},(_,i)=><group key={i} position={[Math.sin(i*.5)*.6,1+i*1.55,0]} rotation={[0,i*.08,0]}><Block position={[0,.6,0]} size={[3.8,1.15,3]}/></group>)}
 {bank.shape==='crown'&&<><Block position={[0,h*.42,0]} size={[3.2,h*.8,3.2]}/>{[-1,1].map(x=><group key={x}><Block position={[x*1.55,h*.53,0]} size={[.5,h,3.4]} color="#697183"/></group>)}<Block position={[0,h,0]} size={[3.6,.35,3.6]} color={c}/></>}
 {bank.shape==='lantern'&&<><mesh position={[0,h/2+.7,0]} castShadow><cylinderGeometry args={[2.1,2.1,h,12]}/><meshPhysicalMaterial color="#24404a" metalness={.6} roughness={.22} transparent opacity={.8}/></mesh>{[.2,.5,.8,1].map(n=><Crown key={n} y={h*n+.7} r={2.13} color={c}/>)}</>}
 {Array.from({length:8},(_,i)=><mesh key={i} position={[0,1.3+i*(h/9),2]}><boxGeometry args={[3.5,.035,.025]}/><meshBasicMaterial color={c} transparent opacity={dim?.15:.7}/></mesh>)}
 {[-1,1].map(x=><mesh key={x} position={[x*2,h*.48,0]}><boxGeometry args={[.045,h*.85,3.6]}/><meshBasicMaterial color={c} transparent opacity={dim?.12:.6}/></mesh>)}
 <Crown y={.5} r={selected?4:3.6} color={c}/>
 <Html center position={[0,h+3.6,0]} zIndexRange={[8,0]}><button className={`tower-label ${selected?'selected':''}`} onClick={onSelect}><i style={{background:c}}/>{bank.ticker}<small>{selected?'ดับเบิลคลิกเพื่อเข้าตึก':'สำรวจธนาคาร'}</small></button></Html>
 {compare&&snapshot&&<Html center position={[0,h*.56,4]} zIndexRange={[10,0]}><div className="comparison-hologram"><strong>{bank.ticker}</strong><span>ROE {display(snapshot.roe,'%')}</span><span>NIM {display(snapshot.nim,'%')}</span><span>NPL {display(snapshot.npl,'%')}</span><small>{snapshot.period} · IMPORTED</small></div></Html>}
 </group>
}
export function District({place,color,active,onSelect,low}:{place:Place;color:string;active:boolean;onSelect:()=>void;low:boolean}){
 const count=low?3:6;
 return <group position={place.position} onClick={e=>{e.stopPropagation();onSelect()}} name={`district-${place.id}`}>
 <mesh position={[0,.12,0]} receiveShadow><boxGeometry args={[8,.25,6.7]}/><meshStandardMaterial color={active?'#213d47':'#122330'} metalness={.4} roughness={.6}/></mesh>
 <mesh position={[0,.27,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[4.4,4.44,48]}/><meshBasicMaterial color={color} transparent opacity={active?.8:.22}/></mesh>
 {Array.from({length:count},(_,i)=>{const x=(i%3-1)*2.4,z=Math.floor(i/3)*2.8-1.4;const height=place.kind==='hotel'?4.2:place.kind==='offices'?2.8+i%3:place.kind==='residential'?1.3+(i%3)*.7:1;return <group key={i} position={[x,0,z]}>
 {place.kind==='farm'?<><Block position={[0,.35,0]} size={[2,.22,2]} color="#335e4b"/>{[0,1,2].map(j=><Block key={j} position={[j*.5-.5,.55,0]} size={[.15,.2,1.6]} color="#648168"/>)}</>:place.kind==='energy'?<><mesh position={[0,1.3,0]}><cylinderGeometry args={[.75,.55,2.2,12]}/><meshStandardMaterial color="#496875" metalness={.65} roughness={.4}/></mesh><Block position={[0,2.5,0]} size={[1.5,.1,.1]} color={color}/></>:<><Block position={[0,height/2+.3,0]} size={[1.8,height,1.9]} color={place.kind==='government'?'#4d5d65':place.kind==='shops'?'#3b4b4d':'#294452'}/>
 {place.kind==='residential'?<mesh position={[0,height+.65,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[1.5,.7,4]}/><meshStandardMaterial color="#6e7d81"/></mesh>:<Block position={[0,height+.35,0]} size={[2,.12,2]} color={color}/>}
 <Block position={[0,height*.55+.3,1]} size={[1.4,.1,.015]} color={color}/>
 {place.kind==='factory'&&<mesh position={[.6,2.1,-.5]}><cylinderGeometry args={[.18,.2,2.2,8]}/><meshStandardMaterial color="#586a77"/></mesh>}
 </>}
 </group>})}
 <Html center position={[0,6.2,0]} zIndexRange={[6,0]}><button className={`district-label ${active?'active':''}`} onClick={onSelect}><span>{place.en}</span>{place.label}</button></Html>
 </group>
}
export function FinancialEngine({place,stress,active,onSelect}:{place:Place;stress:number;active:boolean;onSelect:()=>void}){
 const core=useRef<THREE.Mesh>(null);const risk=place.id==='risk'||place.id==='provision';const color=risk?'#d87d84':place.id==='capital'?'#a5a3db':'#ddc28d';
 useFrame((_,dt)=>{if(core.current)core.current.rotation.y+=dt*.2});
 return <group position={place.position} onClick={e=>{e.stopPropagation();onSelect()}} name={`engine-${place.id}`}>
 <Block position={[0,.3,0]} size={[7,.6,6]} color="#253649"/>
 <mesh position={[0,2.8,0]}><cylinderGeometry args={[2.1,2.1,4.7,16,1,true]}/><meshPhysicalMaterial color="#5f849a" transparent opacity={.12} metalness={.4} roughness={.2} side={THREE.DoubleSide} depthWrite={false}/></mesh>
 <mesh ref={core} position={[0,2.6,0]} scale={place.id==='risk'?1+stress*.8:place.id==='profit'?1-stress*.45:1}><icosahedronGeometry args={[1.2,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active?.9:.4} wireframe={place.id==='provision'}/></mesh>
 {[.8,4.8].map(y=><Crown key={y} y={y} r={2.3} color={color}/>)}
 {place.id==='capital'&&[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}><Block position={[2.5,2.1,0]} size={[.4,4,1.6]} color="#424767"/></group>)}
 {risk&&<mesh position={[0,.8+stress,0]} scale={[1,1+stress,1]}><sphereGeometry args={[1.8,16,12]}/><meshBasicMaterial color={color} transparent opacity={.1+stress*.1} depthWrite={false}/></mesh>}
 <Html center position={[0,6,0]} zIndexRange={[6,0]}><button className="district-label" onClick={onSelect}><span>{place.en}</span>{place.label}</button></Html>
 </group>
}
