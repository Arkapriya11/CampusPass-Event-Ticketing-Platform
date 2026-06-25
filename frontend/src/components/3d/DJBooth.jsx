import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function DJBooth({ scrollOffset = 0 }) {
  const groupRef = useRef();

  const { scene: setupScene } = useGLTF('/dj_setup.glb');
  const { scene: djScene, animations } = useGLTF('/dj_character.glb');

  const { actions } = useAnimations(animations, djScene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0];
      actions[actionName]?.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    const scale = Math.max(0.8, 1 - scrollOffset * 0.3);
    groupRef.current.scale.setScalar(scale);

    groupRef.current.rotation.y = Math.sin(time * 0.15) * 0.04;
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.03;
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <spotLight position={[-8, 6, 3]} intensity={120} angle={0.35} penumbra={0.9} color="#9900ff" />
      <spotLight position={[8, 6, 3]} intensity={100} angle={0.35} penumbra={0.9} color="#00d4ff" />
      <spotLight position={[0, 7, 2]} intensity={80} angle={0.45} penumbra={0.7} color="#ffffff" />
      <spotLight position={[0, 2, -5]} intensity={50} angle={0.6} penumbra={0.8} color="#ff007f" />
      {/* Soft face light (key fix) */}
      <spotLight
        position={[0, 4.5, 2]}
        intensity={60}
        angle={0.99}
        penumbra={1}
        color="#ffffff"
      />

      {/* MAIN GROUP — CENTERED */}
      <group ref={groupRef} position={[2.5, -2, 0]}>

        {/* DJ BOOTH — CENTER */}
        {setupScene && (
          <primitive
            object={setupScene}
            position={[-2.2, -2.8, 0.4]}
            scale={[0.095, 0.095, 0.095]}
          />
        )}

        {/* DJ CHARACTER — BEHIND BOOTH */}
        {djScene && (
          <primitive
            object={djScene}
            position={[0, -2.6, -0.6]}
            scale={[0.028, 0.028, 0.028]}
          />
        )}

        {/* Neon strip */}
        <mesh position={[0, -2.85, 0.4]}>
          <boxGeometry args={[6, 0.04, 1.5]} />
          <meshStandardMaterial emissive="#ff007f" emissiveIntensity={5} color="#000" />
        </mesh>

        {/* Glow floor */}
        <mesh position={[0, -2.9, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial
            color="#000"
            emissive="#7700ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.35}
          />
        </mesh>

      </group>
    </>
  );
}

useGLTF.preload('/dj_setup.glb');
useGLTF.preload('/dj_character.glb');