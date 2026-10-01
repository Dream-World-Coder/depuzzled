import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { colorForValue } from "../lib/colors";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export default function NodeInstances({
  positions,
  values,
  maxValue,
  count,
  nodeRadius = 1.5,
  onSelect,
}) {
  const meshRef = useRef();

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.5,
        metalness: 0.05,
      }),
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      tempObject.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      tempObject.scale.setScalar(nodeRadius);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [positions, count, nodeRadius]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < count; i++) {
      const [r, g, b] = colorForValue(values[i], maxValue);
      tempColor.setRGB(r, g, b);
      mesh.setColorAt(i, tempColor);
    }

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [values, maxValue, count]);

  const handleClick = (event) => {
    event.stopPropagation();
    if (event.instanceId != null) onSelect(event.instanceId);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      onClick={handleClick}
      frustumCulled={false}
    />
  );
}
