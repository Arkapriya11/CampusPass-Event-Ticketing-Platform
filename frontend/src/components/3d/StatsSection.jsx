import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedStat({ position, value, label, color, scrollProgress, delay = 0 }) {
  const groupRef = useRef();
  const textRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = Math.max(0, Math.min(1, (scrollProgress - delay) / 0.3));
    groupRef.current.scale.setScalar(progress);

    // Count-up effect
    if (textRef.current) {
      const displayValue = Math.floor(value * progress);
      const formatted = displayValue >= 1000
        ? (displayValue / 1000).toFixed(1) + 'K+'
        : displayValue.toString() + '+';
      textRef.current.text = formatted;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Number */}
      <Text
        ref={textRef}
        fontSize={1.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        0
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Text>

      {/* Label */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.28}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function FloatingShape({ position, geometry, color, speed = 1, rotSpeed = 0.5 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    ref.current.rotation.x = time * rotSpeed * 0.3;
    ref.current.rotation.y = time * rotSpeed * 0.5;
    ref.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
  });

  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function StatsSection({ scrollOffset = 0 }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const sectionProgress = Math.max(0, Math.min(1, (scrollOffset - 0.55) / 0.2));
    groupRef.current.visible = sectionProgress > 0;
  });

  const statsProgress = Math.max(0, Math.min(1, (scrollOffset - 0.55) / 0.2));

  return (
    <group ref={groupRef} position={[0, -38, -2]}>
      {/* Stats */}
      <AnimatedStat
        position={[-5, 0, 0]}
        value={1000}
        label="Events Hosted"
        color="#818cf8"
        scrollProgress={statsProgress}
        delay={0}
      />
      <AnimatedStat
        position={[0, 0, 0]}
        value={50000}
        label="Tickets Sold"
        color="#34d399"
        scrollProgress={statsProgress}
        delay={0.1}
      />
      <AnimatedStat
        position={[5, 0, 0]}
        value={99}
        label="Uptime %"
        color="#fbbf24"
        scrollProgress={statsProgress}
        delay={0.2}
      />

      {/* Floating geometric shapes */}
      <FloatingShape
        position={[-8, 2, -3]}
        geometry={<icosahedronGeometry args={[0.8, 0]} />}
        color="#6366f1"
        speed={0.8}
      />
      <FloatingShape
        position={[8, -1, -4]}
        geometry={<torusKnotGeometry args={[0.5, 0.15, 64, 16]} />}
        color="#8b5cf6"
        speed={0.6}
      />
      <FloatingShape
        position={[-3, 3, -5]}
        geometry={<octahedronGeometry args={[0.6, 0]} />}
        color="#06b6d4"
        speed={1}
        rotSpeed={0.8}
      />
      <FloatingShape
        position={[5, 3, -3]}
        geometry={<dodecahedronGeometry args={[0.5, 0]} />}
        color="#10b981"
        speed={0.7}
        rotSpeed={0.3}
      />
      <FloatingShape
        position={[0, -3, -6]}
        geometry={<torusGeometry args={[0.7, 0.2, 16, 32]} />}
        color="#f59e0b"
        speed={0.5}
        rotSpeed={0.6}
      />
    </group>
  );
}
