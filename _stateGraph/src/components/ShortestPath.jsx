import { useMemo } from "react";
import * as THREE from "three";

export default function ShortestPath({ data, currentIndex }) {
  const pathPositions = useMemo(() => {
    if (currentIndex == null || !data) return null;

    let current = currentIndex;
    const pts = [];
    const { positions, solutionDist, adjacencyList } = data;

    // Failsafe iteration limit to prevent infinite loops
    let safety = 0;
    while (solutionDist[current] > 0 && safety++ < 1000) {
      pts.push(
        positions[current * 3],
        positions[current * 3 + 1],
        positions[current * 3 + 2],
      );

      const neighbors = adjacencyList[current];
      let nextNode = current;

      // Find the first neighbor strictly closer to the solution
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        if (solutionDist[n] < solutionDist[current]) {
          nextNode = n;
          break;
        }
      }

      if (nextNode === current) break; // Dead end (should not occur in valid data)
      current = nextNode;
    }

    // Append the final solution node
    pts.push(
      positions[current * 3],
      positions[current * 3 + 1],
      positions[current * 3 + 2],
    );

    return new Float32Array(pts);
  }, [data, currentIndex]);

  const geometry = useMemo(() => {
    if (!pathPositions) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pathPositions, 3));
    return geo;
  }, [pathPositions]);

  if (!geometry) return null;

  return (
    <line geometry={geometry} renderOrder={2}>
      <lineBasicMaterial
        color="#ff0000" // red
        // color="#1e3a8a" // Dark blue
        transparent
        opacity={0.9}
        depthTest={false}
      />
    </line>
  );
}
