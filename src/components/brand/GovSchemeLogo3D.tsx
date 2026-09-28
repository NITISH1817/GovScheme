import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { GovSchemeLogoMark } from './GovSchemeLogoMark';

interface Logo3DProps {
  size?: number;
  interactive?: boolean;
}

const LogoGeometry = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Custom subtle idle animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.05;
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
    }
  });

  const { path1, path2, accent1, accent2 } = useMemo(() => {
    // Left-to-center inner G (scaled for 3D)
    const p1 = new THREE.Shape();
    p1.moveTo(-0.05, 0.38);
    p1.lineTo(-0.28, 0.22);
    p1.lineTo(-0.28, -0.10);
    p1.lineTo(-0.05, -0.26);
    p1.lineTo(0.15, -0.17);
    p1.lineTo(0.15, 0);
    p1.lineTo(-0.05, 0);
    p1.lineTo(-0.05, -0.12);

    // Right-to-center wrapping
    const p2 = new THREE.Shape();
    p2.moveTo(0.05, -0.38);
    p2.lineTo(0.28, -0.22);
    p2.lineTo(0.28, 0.10);
    p2.lineTo(0.05, 0.26);
    p2.lineTo(-0.15, 0.17);
    p2.lineTo(-0.15, 0);
    p2.lineTo(0.05, 0);
    p2.lineTo(0.05, 0.12);

    // Accents
    const a1 = new THREE.Shape();
    a1.moveTo(-0.05, 0.35); a1.lineTo(0.05, 0.29); a1.lineTo(0.02, 0.26); a1.lineTo(-0.08, 0.32);
    
    const a2 = new THREE.Shape();
    a2.moveTo(0.05, -0.35); a2.lineTo(-0.05, -0.29); a2.lineTo(-0.02, -0.26); a2.lineTo(0.08, -0.32);

    return { path1: p1, path2: p2, accent1: a1, accent2: a2 };
  }, []);

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSteps: 2,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  };

  const navyMaterial = new THREE.MeshPhysicalMaterial({
    color: '#123C69',
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });

  const saffronMaterial = new THREE.MeshPhysicalMaterial({
    color: '#F97316',
    metalness: 0.5,
    roughness: 0.3,
    emissive: '#F97316',
    emissiveIntensity: 0.2
  });

  return (
    <group ref={meshRef} scale={4}>
      <mesh material={navyMaterial}>
        <extrudeGeometry args={[path1, extrudeSettings]} />
      </mesh>
      <mesh material={navyMaterial}>
        <extrudeGeometry args={[path2, extrudeSettings]} />
      </mesh>
      <mesh material={saffronMaterial} position={[0,0,0.01]}>
        <extrudeGeometry args={[accent1, { ...extrudeSettings, depth: 0.11 }]} />
      </mesh>
      <mesh material={saffronMaterial} position={[0,0,0.01]}>
        <extrudeGeometry args={[accent2, { ...extrudeSettings, depth: 0.11 }]} />
      </mesh>
      
      {/* Connector dots */}
      <mesh material={navyMaterial} position={[-0.05, -0.12, 0.05]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
      </mesh>
      <mesh material={navyMaterial} position={[0.05, 0.12, 0.05]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
      </mesh>
    </group>
  );
};

export const GovSchemeLogo3D: React.FC<Logo3DProps> = ({ 
  size = 200, 
  interactive = true 
}) => {
  // Graceful fallback for low-power devices/errors
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (prefersReducedMotion) {
    return <GovSchemeLogoMark size={size} />;
  }

  return (
    <div style={{ width: size, height: size }} className="relative group">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#1769FF" />
        
        {interactive ? (
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 12, Math.PI / 12]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <Float rotationIntensity={0.2} floatIntensity={0.5} speed={2}>
              <LogoGeometry />
            </Float>
          </PresentationControls>
        ) : (
          <LogoGeometry />
        )}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
