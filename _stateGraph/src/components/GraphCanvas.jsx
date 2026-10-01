import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import NodeInstances from "./NodeInstances";
import EdgeLines from "./EdgeLines";
import HighlightMarker from "./HighlightMarker";
import { buildGraphData, nodePosition } from "../lib/buildGraphData";
import SolutionRings from "./SolutionRings";
import ShortestPath from "./ShortestPath";

export default function GraphCanvas({
  colorMode,
  showSolutions,
  showPath,
  currentIndex,
  selectedIndex,
  onSelect,
}) {
  const data = useMemo(() => buildGraphData(), []);
  const values = colorMode === "solution" ? data.solutionDist : data.dist;
  const maxValue =
    colorMode === "solution" ? data.maxSolutionDist : data.maxDist;

  const currentPosition = useMemo(
    () => nodePosition(data, currentIndex),
    [data, currentIndex],
  );
  const selectedPosition = useMemo(
    () => (selectedIndex != null ? nodePosition(data, selectedIndex) : null),
    [data, selectedIndex],
  );

  return (
    <Canvas
      camera={{ position: [0, 600, 2600], fov: 50, near: 1, far: 20000 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#fff"]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[1500, 1500, 1500]} intensity={1.1} />
      <pointLight
        position={[-1500, -800, -1000]}
        intensity={0.4}
        color="#3a4a66"
      />

      <Suspense fallback={null}>
        <EdgeLines edgePositions={data.edgePositions} />
        <NodeInstances
          positions={data.positions}
          values={values}
          maxValue={maxValue}
          count={data.n}
          onSelect={onSelect}
        />
        {showSolutions && (
          <SolutionRings
            positions={data.solutionPositions}
            count={data.solutionCount}
            radius={12}
          />
        )}

        {showPath && <ShortestPath data={data} currentIndex={currentIndex} />}

        <HighlightMarker
          position={currentPosition}
          color="#ff0000"
          radius={6}
        />

        {selectedPosition && (
          <HighlightMarker
            position={selectedPosition}
            color="#0000ff"
            radius={8}
          />
        )}
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={50}
        maxDistance={8000}
      />
    </Canvas>
  );
}
