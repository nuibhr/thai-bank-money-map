'use client';
import {Html,Line} from '@react-three/drei';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {sections,sectionById,type SectionId} from '@/lib/bank-sections';
import type {Bank} from './BankWorld';
export function BankInterior({bank,section,metric,onSection,onMetric,expanded}:{bank:Bank;expanded:boolean;section:SectionId|null;metric:string|null;onSection:(s:SectionId)=>void;onMetric:(s:string)=>void}){
 const active=section?sectionById(section):null;
 const particles=useRef<THREE.InstancedMesh>(null);const dummy=useRef(new THREE.Object3D());
 useFrame(({clock})=>{if(!particles.current)return;for(let i=0;i<8;i++){const u=(clock.elapsedTime*.12+i/8)%1;dummy.current.position.set(Math.sin(u*Math.PI*2)*.75,.5+u*6,Math.cos(u*Math.PI*2)*.75);dummy.current.updateMatrix();particles.current.setMatrixAt(i,dummy.current.matrix)}particles.current.instanceMatrix.needsUpdate=true});
 return <group position={bank.position} name={`interior-${bank.ticker}`}>
 <instancedMesh ref={particles} args={[undefined,undefined,8]} frustumCulled={false}><sphereGeometry args={[.09,8,8]}/><meshBasicMaterial color="#efc57e"/></instancedMesh>
 <mesh position={[0,3,0]}><cylinderGeometry args={[1.3,1.3,6,8,1,true]}/><meshStandardMaterial color="#68d9ad" wireframe transparent opacity={.18}/></mesh>
 {sections.map((s,i)=><Floor key={s.id} index={i} section={s.id} hot={section===s.id} expanded={expanded} onSelect={onSection}/>)}
 {active&&active.children.map(([id,label],i)=>{const y=1+i*1.15;const point:[number,number,number]=[5,y+(expanded?1:0),0];return <group key={id}>
 <Line points={[[0,3,0],point]} color={active.color} transparent opacity={.45}/>
 <mesh position={point} onClick={e=>{e.stopPropagation();onMetric(id)}}><icosahedronGeometry args={[metric===id?.4:.28,1]}/><meshStandardMaterial color={active.color} emissive={active.color} emissiveIntensity={.6}/></mesh>
 <Html position={[5.3,y,0]} center><button className={`spatial-label ${metric===id?'chosen':''}`} onClick={()=>onMetric(id)}>{label}</button></Html>
 </group>})}
 </group>
}

function Floor({index,section,hot,expanded,onSelect}:{index:number;section:SectionId;hot:boolean;expanded:boolean;onSelect:(s:SectionId)=>void}){
 const s=sectionById(section)!;const group=useRef<THREE.Group>(null);
 useFrame((_,dt)=>{if(group.current){group.current.position.x=THREE.MathUtils.damp(group.current.position.x,expanded?(index%2===0?-.7:.7):0,5,dt);group.current.position.y=THREE.MathUtils.damp(group.current.position.y,.7+index*(expanded?1.6:.75),5,dt)}});
 return <group ref={group} position={[0,.7+index*.75,0]}>
 <mesh onClick={e=>{e.stopPropagation();onSelect(section)}}><boxGeometry args={[3.1,.18,2.7]}/><meshStandardMaterial color={hot?s.color:'#25384b'} emissive={s.color} emissiveIntensity={hot?.45:.06} metalness={.65} roughness={.3}/></mesh>
 <mesh position={[0,.35,0]} onClick={e=>{e.stopPropagation();onSelect(section)}}><torusGeometry args={[.55,.07,8,24]}/><meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={hot?1:.3}/></mesh>
 <mesh position={[0,.35,0]}><icosahedronGeometry args={[.28,1]}/><meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={.5}/></mesh>
 <Html position={[-2.2,.2,0]} center><button className={`spatial-label ${hot?'chosen':''}`} onClick={()=>onSelect(section)}>{String(index+1).padStart(2,'0')} · {s.label}</button></Html>
 </group>
}
