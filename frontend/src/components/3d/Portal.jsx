import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Portal({ scrollOffset = 0 }) {
  const groupRef = useRef();
  const ringRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Visibility (section 5: offset 0.75-1.0)
    const sectionProgress = Math.max(0, Math.min(1, (scrollOffset - 0.75) / 0.2));
    groupRef.current.visible = sectionProgress > 0;
    groupRef.current.scale.setScalar(sectionProgress);

    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.3;
      ringRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }

    // Breathing pulse
    if (innerRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.08;
      innerRef.current.scale.setScalar(pulse);
    }

    // Glow intensity
    if (glowRef.current) {
      glowRef.current.intensity = 2 + Math.sin(time * 3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -52, 0]}>
      {/* Main ring */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[2.5, 0.12, 32, 64]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Secondary ring (offset rotation) */}
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[2.5, 0.04, 16, 64]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Tertiary ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.8, 0.03, 16, 64]} />
          <meshStandardMaterial
            color="#a5b4fc"
            emissive="#a5b4fc"
            emissiveIntensity={1.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Inner glow disc */}
      <group ref={innerRef}>
        <mesh>
          <circleGeometry args={[2, 64]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#6366f1"
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
            side={2}
          />
        </mesh>
      </group>

      {/* Orbiting particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 2.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#a5b4fc"
              emissiveIntensity={4}
            />
          </mesh>
        );
      })}

      {/* Point light for global glow */}
      <pointLight ref={glowRef} color="#6366f1" intensity={2} distance={15} />
      <pointLight color="#8b5cf6" intensity={1} distance={8} position={[0, 0, 2]} />
    </group>
  );
}
