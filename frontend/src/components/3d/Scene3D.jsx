import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import ParticleField from './ParticleField';
import DJBooth from './DJBooth';
import FlowPath from './FlowPath';
import Portal from './Portal';
import GridFloor from './GridFloor';

function InteractiveBackground() {
  const ref = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.x = time * 0.1;
      ref.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group ref={ref} position={[0, -15, -4]}>
      <mesh>
        <torusGeometry args={[4, 0.02, 16, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.02, 16, 100]} />
        <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={2} wireframe />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[6, 0.02, 16, 100]} />
        <meshStandardMaterial color="#a200ff" emissive="#a200ff" emissiveIntensity={2} wireframe />
      </mesh>
    </group>
  );
}

export default function Scene3D() {
  const scroll = useScroll();
  const { camera } = useThree();
  const scrollRef = useRef(0);

  useFrame((state) => {
    const offset = scroll.offset;
    scrollRef.current = offset;
    const time = state.clock.elapsedTime;

    const targetY = -offset * 56;
    const targetZ = 8 - offset * 3;
    const lookAheadY = targetY - 2.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(time * 0.1) * 0.4, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    // 🔥 FIXED CAMERA LIMIT
    camera.position.y = Math.max(camera.position.y, -1.5);

    camera.lookAt(0, lookAheadY, -4.5);

    if (state.scene.fog) {
      const fogNear = 6 + offset * 10;
      const fogFar = 35 + offset * 15;

      state.scene.fog.near = THREE.MathUtils.lerp(state.scene.fog.near, fogNear, 0.02);
      state.scene.fog.far = THREE.MathUtils.lerp(state.scene.fog.far, fogFar, 0.02);
    }
  });

  return (
    <>
      <fog attach="fog" args={['#0a0e1a', 6, 30]} />

      <ambientLight intensity={0.25} color="#ff007f" />
      <hemisphereLight args={['#00f0ff', '#0a0812', 0.5]} />

      <directionalLight position={[5, 10, 5]} intensity={0.6} color="#ff007f" />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} color="#00f0ff" />

      <spotLight position={[0, 6, 10]} angle={0.5} penumbra={1} intensity={0.6} color="#6366f1" />

      <GridFloor />
      <ParticleField scrollOffset={scrollRef.current} />
      <DJBooth scrollOffset={scrollRef.current} />
      <InteractiveBackground />
      <FlowPath scrollOffset={scrollRef.current} />
      <Portal scrollOffset={scrollRef.current} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.6} />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.12} darkness={1.2} />
      </EffectComposer>
    </>
  );
}