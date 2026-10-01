import { useMemo, useState } from "react";
import GraphCanvas from "./components/GraphCanvas";
import NodeDetailPanel from "./components/panels/NodeDetailPanel";
import ControlsPanel from "./components/panels/ControlsPanel";
import { buildGraphData } from "./lib/buildGraphData";
import KlotskiBoard from "./components/KlotskiBoard";

export default function App() {
  const data = useMemo(() => buildGraphData(), []);
  const [colorMode, setColorMode] = useState("dist");
  const [showSolutions, setShowSolutions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => closestToStart(data));
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showPath, setShowPath] = useState(true);

  const selectedNode = useMemo(() => {
    if (selectedIndex == null) return null;
    return {
      dist: data.dist[selectedIndex],
      solution_dist: data.solutionDist[selectedIndex],
      representation: data.representations[selectedIndex],
      neighborCount: data.neighborCounts[selectedIndex],
    };
  }, [data, selectedIndex]);

  const handleBoardMove = (newRepresentation) => {
    const nextIndex = data.stringToIndex.get(newRepresentation);

    if (nextIndex !== undefined) {
      // Valid move! Update the 3D graph camera/highlight to follow
      setCurrentIndex(nextIndex);
      // Optional: setSelectedIndex(nextIndex) if you want the details panel to pop open
    } else {
      console.warn(
        "Move resulted in a board state not found in the graph data.",
      );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <GraphCanvas
        colorMode={colorMode}
        showSolutions={showSolutions}
        showPath={showPath}
        currentIndex={currentIndex}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
      <ControlsPanel
        colorMode={colorMode}
        setColorMode={setColorMode}
        showSolutions={showSolutions}
        setShowSolutions={setShowSolutions}
        showPath={showPath}
        setShowPath={setShowPath}
      />

      <KlotskiBoard
        representation={data.representations[currentIndex]}
        boardW={data.board.board_w}
        boardH={data.board.board_h}
        onMoveRequested={handleBoardMove}
      />

      <NodeDetailPanel
        node={selectedNode}
        isCurrent={selectedIndex === currentIndex}
        onClose={() => setSelectedIndex(null)}
        onTeleport={() => {
          setCurrentIndex(selectedIndex);
          setSelectedIndex(null);
        }}
      />

      {/* add in a modal in bottom right */}
      <footer>
        Repo: <a href="link">long link ,,,,,,,,rrrj </a>
      </footer>
    </div>
  );
}

// Matches the original client.js convention: dist 0 marks the start state.
function closestToStart(data) {
  for (let i = 0; i < data.n; i++) {
    if (data.dist[i] === 0) return i;
  }
  return 0;
}
