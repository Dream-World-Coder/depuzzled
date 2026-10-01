import {
  nodes_to_use,
  board_string,
  board_w,
  board_h,
  rushhour,
} from "./data.js";

// Build once, reuse everywhere. The raw object has ~26k keys with string
// hashes — we never want to touch that object again after this runs, since
// object property access doesn't vectorize and dict iteration order isn't
// guaranteed to stay stable across V8 versions the way Float32Array does.
let cached = null;

const TARGET_RADIUS = 1200; // world-space size we want the whole graph to span

export function buildGraphData() {
  if (cached) return cached;

  const hashList = Object.keys(nodes_to_use);
  const n = hashList.length;
  const hashToIndex = new Map();
  for (let i = 0; i < n; i++) hashToIndex.set(hashList[i], i);

  const positions = new Float32Array(n * 3);
  const dist = new Float32Array(n);
  const solutionDist = new Float32Array(n);
  const neighborCounts = new Int16Array(n);
  const representations = new Array(n);
  const extents = new Float32Array(n);
  const stringToIndex = new Map();

  let maxDist = 0;
  let maxSolutionDist = 0;

  for (let i = 0; i < n; i++) {
    const node = nodes_to_use[hashList[i]];
    const x = node.x;
    const y = node.y;
    const z = node.z;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    dist[i] = node.dist;
    solutionDist[i] = node.solution_dist;
    representations[i] = node.representation;
    neighborCounts[i] = node.neighbors.length;
    stringToIndex.set(node.representation, i);

    extents[i] = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    if (node.dist > maxDist) maxDist = node.dist;
    if (node.solution_dist > maxSolutionDist) {
      maxSolutionDist = node.solution_dist;
    }
  }

  // Scale by the 95th-percentile extent, not the absolute max. Force-directed
  // layouts this size almost always have a few outlier nodes; one outlier
  // dominating the max collapses the entire main cluster to a near-zero
  // radius point, which is exactly what reads as "one node" on screen.
  const sortedExtents = Array.from(extents).sort((a, b) => a - b);
  const p95Extent =
    sortedExtents[Math.floor(n * 0.95)] || sortedExtents[n - 1] || 1;
  const scale = p95Extent > 0 ? TARGET_RADIUS / p95Extent : 1;
  for (let i = 0; i < positions.length; i++) positions[i] *= scale;

  // Dedupe neighbor pairs into a flat edge index buffer (i < j, each pair once)
  const seen = new Set();
  const edgeIndexPairs = [];
  for (let i = 0; i < n; i++) {
    const node = nodes_to_use[hashList[i]];
    for (const neighborHash of node.neighbors) {
      const j = hashToIndex.get(neighborHash);
      if (j === undefined || j === i) continue;
      const a = i < j ? i : j;
      const b = i < j ? j : i;
      const key = a * n + b;
      if (seen.has(key)) continue;
      seen.add(key);
      edgeIndexPairs.push(a, b);
    }
  }

  const edgeCount = edgeIndexPairs.length / 2;
  const edgePositions = new Float32Array(edgeCount * 2 * 3);
  for (let e = 0; e < edgeCount; e++) {
    const a = edgeIndexPairs[e * 2];
    const b = edgeIndexPairs[e * 2 + 1];
    edgePositions[e * 6] = positions[a * 3];
    edgePositions[e * 6 + 1] = positions[a * 3 + 1];
    edgePositions[e * 6 + 2] = positions[a * 3 + 2];
    edgePositions[e * 6 + 3] = positions[b * 3];
    edgePositions[e * 6 + 4] = positions[b * 3 + 1];
    edgePositions[e * 6 + 5] = positions[b * 3 + 2];
  }

  const solutionPositionsArray = [];
  for (let i = 0; i < n; i++) {
    if (solutionDist[i] === 0) {
      solutionPositionsArray.push(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
    }
  }

  // Build a flat adjacency list for fast pathfinding
  const adjacencyList = new Array(n);
  for (let i = 0; i < n; i++) {
    const node = nodes_to_use[hashList[i]];
    const neighborIndices = [];
    for (const neighborHash of node.neighbors) {
      const j = hashToIndex.get(neighborHash);
      if (j !== undefined) neighborIndices.push(j);
    }
    adjacencyList[i] = neighborIndices;
  }

  cached = {
    n,
    hashList,
    hashToIndex,
    positions,
    dist,
    solutionDist,
    neighborCounts,
    representations,
    maxDist,
    maxSolutionDist,
    edgePositions,
    edgeCount,
    board: {
      board_string,
      board_w: parseInt(board_w, 10),
      board_h: parseInt(board_h, 10),
      rushhour,
    },
    solutionPositions: new Float32Array(solutionPositionsArray),
    solutionCount: solutionPositionsArray.length / 3, // why divide by 3
    stringToIndex,
    adjacencyList,
  };

  return cached;
}

export function nodePosition(data, index) {
  return [
    data.positions[index * 3],
    data.positions[index * 3 + 1],
    data.positions[index * 3 + 2],
  ];
}
