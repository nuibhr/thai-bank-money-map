'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Grid } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export type Bank = { ticker: string; position: [number, number, number]; height: number };

export const BANKS: Bank[] = [
  { ticker: 'KBANK', position: [-9, 0, 0], height: 7.5 },
  { ticker: 'SCB', position: [-6, 0, -3], height: 8.5 },
  { ticker: 'KTB', position: [-3, 0, 1], height: 9 },
  { ticker: 'BBL', position: [0, 0, -2], height: 10 },
  { ticker: 'TTB', position: [3, 0, 1], height: 6.5 },
  { ticker: 'KKP', position: [6, 0, -3], height: 5.5 },
  { ticker: 'TISCO', position: [9, 0, 0], height: 5 },
];

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

function CameraRig({ selected }: { selected: Bank | null }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!selected) return;
    const [x,,z] = selected.position;
    gsap.to(camera.position, {
      x: x + 5,
      y: selected.height + 4,
      z: z + 8,
      duration: 1.6,
      ease: 'power3.inOut',
      onUpdate: () => camera.lookAt(x, selected.height / 2, z),
    });
  }, [selected, camera]);
  return null;
}

function Scene({ selected, onSelect }: { selected: Bank | null; onSelect: (b: Bank) => void }) {
  return (
    <>
      <color attach="background" args={['#02050a']} />
      <fog attach="fog" args={['#02050a', 24, 65]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[15, 25, 10]} intensity={2.8} />
      <pointLight position={[0, 12, 0]} intensity={80} distance={40} />
      <CameraRig selected={selected} />
      {BANKS.map((b) => <Tower key={b.ticker} bank={b} selected={selected?.ticker===b.ticker} onSelect={onSelect} />)}
      {BANKS.map((b) => <Flow key={'f-'+b.ticker} bank={b} />)}
      <Grid args={[80,80]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1} fadeDistance={45} infiniteGrid />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={8} maxDistance={55} maxPolarAngle={Math.PI/2.05} />
    </>
  );
}

export default function BankWorld({ selected, onSelect }: { selected: Bank | null; onSelect: (b: Bank) => void }) {
  return (
    <Canvas camera={{ position: [0,16,28], fov: 45 }} dpr={[1,1.5]}>
      <Scene selected={selected} onSelect={onSelect} />
    </Canvas>
  );
}
