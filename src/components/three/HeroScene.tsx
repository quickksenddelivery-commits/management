import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { useInView } from 'motion/react';
import type { Mesh } from 'three';

/** Purple gem-core: slow idle spin + a gentle pull toward the cursor. */
function GemCore() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.x += delta * 0.15;
    mesh.rotation.y += delta * 0.22;
    // Ease rotation toward the pointer for a subtle parallax feel.
    mesh.rotation.x += (state.pointer.y * 0.3 - mesh.rotation.x * 0.02) * delta;
    mesh.rotation.y += (state.pointer.x * 0.3 - mesh.rotation.y * 0.02) * delta;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 1]} />
      <MeshDistortMaterial
        color="#7C3AED"
        emissive="#4C1D95"
        emissiveIntensity={0.6}
        roughness={0.15}
        metalness={0.6}
        distort={0.35}
        speed={1.6}
      />
    </mesh>
  );
}

/** Slow-counter-rotating gold ring orbiting the gem. */
function GoldRing() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z -= delta * 0.12;
    meshRef.current.rotation.x = Math.PI / 2.4;
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2.1, 0.03, 16, 100]} />
      <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={40} color="#A78BFA" />
      <pointLight position={[-4, -2, -3]} intensity={20} color="#F59E0B" />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <GemCore />
        <GoldRing />
      </Float>

      <Sparkles count={40} scale={5} size={2.5} speed={0.3} color="#A78BFA" opacity={0.6} />
    </>
  );
}

/**
 * Real WebGL 3D centerpiece for the hero — a floating, distort-shaded gem
 * with an orbiting gold ring and ambient sparkles. Desktop-only (see caller);
 * capped DPR keeps it cheap on the GPU.
 *
 * The render loop is genuinely continuous (shader distortion, rotation,
 * sparkles), so it's gated behind an IntersectionObserver: the <Canvas>
 * only mounts while the hero is on screen, and unmounts (killing the WebGL
 * context and its rAF loop entirely) once scrolled away — otherwise it
 * keeps costing every frame for as long as the page is open, well after
 * it's no longer visible.
 */
export default function HeroScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { margin: '200px' });

  return (
    <div ref={wrapperRef} className="w-full h-full">
      {inView && (
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
