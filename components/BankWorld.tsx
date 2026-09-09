'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Grid } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import bankLayout from '@/data/banks.json';
import {BankInterior} from './BankInterior';
import type {SectionId} from '@/lib/bank-sections';
import type {OrbitControls as ControlsImpl} from 'three-stdlib';

export type Bank = { ticker: string; position: [number, number, number]; height: number };

export const BANKS = bankLayout as Bank[];

function Tower({ bank, selected, onSelect }: { bank: Bank; selected: boolean; onSelect: (b: Bank) => void }) {
  return (
    <group position={bank.position}>
      <mesh position={[0, bank.height / 2, 0]} onClick={(e) => { e.stopPropagation(); onSelect(bank); }}>
        <boxGeometry args={[2.4, bank.height, 2.4]} />
        <meshStandardMaterial
          color={selected ? '#7fffd4' : '#17314d'}
          emissive={selected ? '#2ee6b8' : '#06111d'}
          emissiveIntensity={selected ? 1.5 : 0.45}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      <Html position={[0, bank.height + 1, 0]} center distanceFactor={12}>
        <div style={{color:'white',fontWeight:800,fontSize:16,background:'rgba(0,0,0,.6)',border:'1px solid rgba(255,255,255,.18)',padding:'5px 8px',borderRadius:8,whiteSpace:'nowrap'}}>{bank.ticker}</div>
      </Html>
    </group>
  );
}

function MovingParticle({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const p = curve.getPointAt((clock.elapsedTime * 0.18) % 1);
    ref.current?.position.copy(p);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.13, 12, 12]} />
      <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={4} />
    </mesh>
  );
}

function Flow({ bank }: { bank: Bank }) {
  const curve = useMemo(() => {
    const [x,,z] = bank.position;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.2, z - 7),
      new THREE.Vector3(x, 3.5, z - 3.5),
      new THREE.Vector3(x, 1.3, z),
    ]);
  }, [bank]);
  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.035, 8, false]} />
        <meshStandardMaterial color="#2ac7ff" emissive="#2ac7ff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
      <MovingParticle curve={curve} />
    </>
  );
}

type WorldProps={selected:Bank|null;onSelect:(b:Bank)=>void;interior:boolean;section:SectionId|null;metric:string|null;onSection:(s:SectionId)=>void;onMetric:(s:string)=>void};
function CameraRig({selected,interior}:{selected:Bank|null;interior:boolean}){
 const {camera}=useThree();const controls=useRef<ControlsImpl>(null);
 useEffect(()=>{const c=controls.current;if(!c)return;const p=selected?.position??[0,0,0];
 const target=selected?[p[0]+(interior?1.5:0),interior?3:selected.height/2,p[2]]:[0,2,0];
 const pos=selected?[p[0]+(interior?9:5),interior?7:selected.height+4,p[2]+(interior?14:8)]:[0,16,28];
 c.enabled=false;const tl=gsap.timeline({onComplete:()=>{c.enabled=true}});
 tl.to(camera.position,{x:pos[0],y:pos[1],z:pos[2],duration:1.6,ease:'power3.inOut'},0).to(c.target,{x:target[0],y:target[1],z:target[2],duration:1.6,ease:'power3.inOut',onUpdate:()=>c.update()},0);
 return()=>{tl.kill();c.enabled=true};},[selected,interior,camera]);
 return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.05} minDistance={4} maxDistance={55} maxPolarAngle={Math.PI/2.05}/>;
}
function Scene(props:WorldProps){const {selected,onSelect,interior}=props;return <>
 <color attach="background" args={['#02050a']}/><fog attach="fog" args={['#02050a',24,65]}/>
 <ambientLight intensity={1.1}/><directionalLight position={[15,25,10]} intensity={2.8}/><pointLight position={[0,12,0]} intensity={80} distance={40}/>
 <CameraRig selected={selected} interior={interior}/>
 {!interior&&BANKS.map(b=><Tower key={b.ticker} bank={b} selected={selected?.ticker===b.ticker} onSelect={onSelect}/>)}
 {interior&&selected&&<BankInterior bank={selected} section={props.section} metric={props.metric} onSection={props.onSection} onMetric={props.onMetric}/>}
 {BANKS.filter(b=>!interior||b.ticker===selected?.ticker).map(b=><Flow key={b.ticker} bank={b}/>)}
 <Grid args={[80,80]} cellSize={1} cellThickness={.5} sectionSize={5} sectionThickness={1} fadeDistance={45} infiniteGrid/>
 </>}
export default function BankWorld(props:WorldProps){return <Canvas camera={{position:[0,16,28],fov:45}} dpr={[1,1.5]}><Scene {...props}/></Canvas>}
