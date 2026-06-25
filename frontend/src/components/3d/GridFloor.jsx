import { Grid } from '@react-three/drei';

export default function GridFloor() {
  return (
    <Grid
      position={[0, -4, 0]}
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1a1f35"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#2d3555"
      fadeDistance={40}
      fadeStrength={1.5}
      followCamera
      infiniteGrid
    />
  );
}
