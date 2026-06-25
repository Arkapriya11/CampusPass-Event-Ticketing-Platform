import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 1. UPWARD SWEEP BEAM ─────────────────────────────────────────
function SweepBeam({ originX, phaseOffset, speed = 0.5 }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed + phaseOffset;
    // Sweep side-to-side and fore-back
    groupRef.current.rotation.x = -Math.PI * 0.03 + Math.sin(t) * 0.3;
    groupRef.current.rotation.z = Math.cos(t * 0.7) * 0.18;
  });

  const HEIGHT = 20;

  return (
    // Tip of the cone at floor level, beam shoots straight UP
    // ConeGeometry default: tip at bottom, opens at top — perfect for upward beam
    <group
      ref={groupRef}
      position={[originX, -5, -1]}
    >
      {/* Outer diffuse glow — wide cone */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <coneGeometry args={[HEIGHT * 0.45, HEIGHT, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner bright core — narrow cone */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <coneGeometry args={[HEIGHT * 0.15, HEIGHT, 20, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Bright source disc at the base */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── 2. CONFETTI (reduced density) ─────────────────────────────────────────
const CONFETTI_COLORS = [
  '#ff007f', '#a200ff', '#00f0ff', '#ffeb3b', '#ff6600', '#00e676', '#ffffff',
];

function Confetti({ count = 220 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]);
      c.toArray(arr, i * 3);
    }
    return arr;
  }, [count]);

  const particles = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 26,
    y: Math.random() * 22 - 2,
    z: (Math.random() - 0.5) * 8,
    speedY: 0.7 + Math.random() * 1.4,
    driftX: (Math.random() - 0.5) * 0.3,
    rotX: Math.random() * 6,
    rotY: Math.random() * 6,
    rotZ: Math.random() * 6,
    size: 0.06 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
  })), [count]);

  const RANGE = 24;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      let currentY = p.y - t * p.speedY;
      currentY = ((currentY % RANGE) + RANGE) % RANGE - 2;

      dummy.position.set(
        p.x + Math.sin(t * 0.4 + p.phase) * 0.5,
        currentY,
        p.z
      );
      dummy.rotation.set(t * p.rotX, t * p.rotY, t * p.rotZ);
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1.8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </planeGeometry>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ── 3. NEON STAR FIELD ────────────────────────────────────────────────────
function StarField({ count = 300 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
    }
    return pos;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.014;
    ref.current.rotation.x = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#a200ff" transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ── 4. DARK STAGE FLOOR ───────────────────────────────────────────────────
function StageFloor() {
  return (
    <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 20]} />
      <meshStandardMaterial color="#050708" roughness={1} metalness={0} />
    </mesh>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
export default function LoginBackground() {
  return (
    <Canvas
      camera={{ position: [0, 1, 10], fov: 65 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#060810']} />
      <ambientLight intensity={0.03} />

      {/* ── 3 UPWARD SWEEP BEAMS ── */}
      <SweepBeam originX={-4}  phaseOffset={0}   speed={0.45} />
      <SweepBeam originX={0}   phaseOffset={2.1} speed={0.55} />
      <SweepBeam originX={4}   phaseOffset={4.2} speed={0.5}  />

      {/* ── STAGE FLOOR ── */}
      <StageFloor />

      {/* ── CONFETTI ── */}
      <Confetti count={220} />

      {/* ── NEON STAR FIELD ── */}
      <StarField count={300} />
    </Canvas>
  );
}
