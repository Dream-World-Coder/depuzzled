import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

const tempObject = new THREE.Object3D();

export default function SolutionRings({ positions, count, radius = 10 }) {
  const meshRef = useRef();

  const geometry = useMemo(
    () => new THREE.TorusGeometry(radius, 1.5, 8, 24),
    [radius],
  );
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFF78D",
        // color: "#87cefa",
        transparent: true,
        opacity: 0.9,
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
      // Give the rings a uniform orientation
      tempObject.lookAt(0, 1000, 0);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions, count]);

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
}
