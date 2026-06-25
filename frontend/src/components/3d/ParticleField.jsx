import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = ['#ff007f', '#00f0ff', '#ffeb3b', '#a200ff', '#ffffff'];

export default function ParticleField({ count = 3000, scrollOffset = 0 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Create random colored materials array to use with instanced mesh via colors
  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      color.set(COLORS[Math.floor(Math.random() * COLORS.length)]);
      color.toArray(arr, i * 3);
    }
    return arr;
  }, [count]);

  const particles = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
        const y = (Math.random() - 0.5) * 80;
      positions.push({
        x: (Math.random() - 0.5) * 60,
        y: y,
        z: (Math.random() - 0.5) * 60,
        speedY: 0.5 + Math.random() * 2, // falling speed
        speedX: (Math.random() - 0.5) * 0.5,
        speedZ: (Math.random() - 0.5) * 0.5,
        rotSpeedX: Math.random() * 5,
        rotSpeedY: Math.random() * 5,
        rotSpeedZ: Math.random() * 5,
        size: 0.05 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        initialY: y
      });
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const { x, z, speedY, speedX, speedZ, rotSpeedX, rotSpeedY, rotSpeedZ, phase, initialY } = particle;

      const spreadFactor = 1 + scrollOffset * 0.5;

      // Make them fall downwards
      let currentY = initialY - (time * speedY);
      // Reset if they fall too far down
      const range = 80;
      currentY = ((currentY % range) + range) % range - (range / 2);

      // Add erratic wind movement
      const windX = Math.sin(time * 0.5 + phase) * 2;
      const windZ = Math.cos(time * 0.3 + phase) * 2;

      dummy.position.set(
        x * spreadFactor + windX + (time * speedX),
        currentY, 
        z * spreadFactor + windZ + (time * speedZ)
      );

      dummy.rotation.set(
        time * rotSpeedX,
        time * rotSpeedY,
        time * rotSpeedZ
      );

      dummy.scale.setScalar(particle.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      {/* Confetti is usually small rectangular or circular, Let's use thin planes */}
      <planeGeometry args={[0.2, 0.4]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </planeGeometry>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
