'use client';
import {Html,Line} from '@react-three/drei';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {sections,sectionById,type SectionId} from '@/lib/bank-sections';
import type {Bank} from './BankWorld';
export function BankInterior({bank,section,metric,onSection,onMetric}:{bank:Bank;section:SectionId|null;metric:string|null;onSection:(s:SectionId)=>void;onMetric:(s:string)=>void}){
 const active=section?sectionById(section):null;
 const particles=useRef<THREE.InstancedMesh>(null);const dummy=useRef(new THREE.Object3D());
 useFrame(({clock})=>{if(!particles.current)return;for(let i=0;i<8;i++){const u=(clock.elapsedTime*.12+i/8)%1;dummy.current.position.set(Math.sin(u*Math.PI*2)*.75,.5+u*6,Math.cos(u*Math.PI*2)*.75);dummy.current.updateMatrix();particles.current.setMatrixAt(i,dummy.current.matrix)}particles.current.instanceMatrix.needsUpdate=true});
 return <group position={bank.position} name={`interior-${bank.ticker}`}>
 <instancedMesh ref={particles} args={[undefined,undefined,8]} frustumCulled={false}><sphereGeometry args={[.09,8,8]}/><meshBasicMaterial color="#efc57e"/></instancedMesh>
 <mesh position={[0,3,0]}><cylinderGeometry args={[1.3,1.3,6,8,1,true]}/><meshStandardMaterial color="#68d9ad" wireframe transparent opacity={.18}/></mesh>
 {sections.map((s,i)=>{const y=.7+i*1.1;const hot=section===s.id;return <group key={s.id} position={[0,y,0]}>
 <mesh onClick={e=>{e.stopPropagation();onSection(s.id)}}><cylinderGeometry args={[1.55,1.55,.28,8]}/><meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={hot?.7:.15} transparent opacity={hot?1:.6}/></mesh>
 <Html position={[-2.2,0,0]} center><button className={`spatial-label ${hot?'chosen':''}`} onClick={()=>onSection(s.id)}>{s.label}</button></Html>
 </group>})}
 {active&&active.children.map(([id,label],i)=>{const y=1+i*1.15;const point:[number,number,number]=[4,y,0];return <group key={id}>
 <Line points={[[0,3,0],point]} color={active.color} transparent opacity={.45}/>
 <mesh position={point} onClick={e=>{e.stopPropagation();onMetric(id)}}><icosahedronGeometry args={[metric===id?.4:.28,1]}/><meshStandardMaterial color={active.color} emissive={active.color} emissiveIntensity={.6}/></mesh>
 <Html position={[5.3,y,0]} center><button className={`spatial-label ${metric===id?'chosen':''}`} onClick={()=>onMetric(id)}>{label}</button></Html>
 </group>})}
 </group>
}
