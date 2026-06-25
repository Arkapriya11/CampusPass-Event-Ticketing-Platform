import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FlowPath({ scrollOffset = 0 }) {
  const groupRef = useRef();
  const tubeRef = useRef();
  const markerRefs = [useRef(), useRef(), useRef()];

  // Create a curved path
  const { curve, tubeGeometry, glowGeometry } = useMemo(() => {
    const points = [
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-3, 1.5, -2),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(3, -1, -2),
      new THREE.Vector3(6, 0.5, 0),
    ];
    const c = new THREE.CatmullRomCurve3(points);
    const g = new THREE.TubeGeometry(c, 100, 0.03, 8, false);
    const glow = new THREE.TubeGeometry(c, 100, 0.1, 8, false);
    return { curve: c, tubeGeometry: g, glowGeometry: glow };
  }, []);

  // Step marker positions along the curve
  const markerPositions = useMemo(() => [
    curve.getPoint(0.1),
    curve.getPoint(0.5),
    curve.getPoint(0.9),
  ], [curve]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Section visibility (section 3: offset 0.4-0.6)
    const sectionProgress = Math.max(0, Math.min(1, (scrollOffset - 0.35) / 0.2));
    groupRef.current.visible = sectionProgress > 0;

    // Animate tube travel (glow effect via draw range)
    if (tubeRef.current) {
      const totalVertices = tubeGeometry.index ? tubeGeometry.index.count : tubeGeometry.attributes.position.count;
      tubeRef.current.geometry.setDrawRange(0, Math.floor(sectionProgress * totalVertices));
    }

    // Animate markers — appear one by one
    markerRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const markerProgress = Math.max(0, Math.min(1, (sectionProgress - i * 0.25) / 0.25));
      ref.current.scale.setScalar(markerProgress * 0.8);

      // Orbit animation
      const orbitRadius = 0.3;
      ref.current.children[1].position.x = Math.cos(time * 2 + i * 2) * orbitRadius;
      ref.current.children[1].position.z = Math.sin(time * 2 + i * 2) * orbitRadius;
    });
  });

  const markerColors = ['#818cf8', '#34d399', '#fbbf24'];

  return (
    <group ref={groupRef} position={[0, -25, -2]}>
      {/* Glowing tube path */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Wider faint outer glow tube */}
      <mesh geometry={glowGeometry}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Step markers */}
      {markerPositions.map((pos, i) => (
        <group key={i} ref={markerRefs[i]} position={[pos.x, pos.y, pos.z]}>
          {/* Main ring */}
          <mesh>
            <torusGeometry args={[0.4, 0.06, 16, 32]} />
            <meshStandardMaterial
              color={markerColors[i]}
              emissive={markerColors[i]}
              emissiveIntensity={2}
            />
          </mesh>
          {/* Orbiting sphere */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={markerColors[i]}
              emissiveIntensity={3}
            />
          </mesh>
          {/* Center dot */}
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={markerColors[i]}
              emissive={markerColors[i]}
              emissiveIntensity={1.5}
            />
          </mesh>
          {/* Point light */}
          <pointLight color={markerColors[i]} intensity={0.8} distance={4} />
        </group>
      ))}
    </group>
  );
}
