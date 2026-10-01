import { useMemo } from "react";
import * as THREE from "three";

export default function EdgeLines({
  edgePositions,
  color = "#3a4a66",
  opacity = 0.22,
  // color = "#fff",
  // opacity = 0.99,
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    return geo;
  }, [edgePositions]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [color, opacity],
  );

  return (
    <lineSegments
      geometry={geometry}
      material={material}
      raycast={() => null}
    />
  );
}
