export default function HighlightMarker({ position, color, radius = 14 }) {
  if (!position) return null;
  return (
    <mesh position={position} renderOrder={1}>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        depthTest={false}
      />
    </mesh>
  );
}
