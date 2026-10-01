import { useMemo } from "react";

const EMPTY = ".";

export default function KlotskiBoard({
  representation,
  boardW,
  boardH,
  onMoveRequested,
}) {
  // Parse the 1D string into distinct 2D pieces for rendering
  const pieces = useMemo(() => {
    const map = new Map();
    for (let y = 0; y < boardH; y++) {
      for (let x = 0; x < boardW; x++) {
        const char = representation[y * boardW + x];
        if (char === EMPTY) continue;

        if (!map.has(char)) {
          map.set(char, { id: char, minX: x, maxX: x, minY: y, maxY: y });
        } else {
          const p = map.get(char);
          p.minX = Math.min(p.minX, x);
          p.maxX = Math.max(p.maxX, x);
          p.minY = Math.min(p.minY, y);
          p.maxY = Math.max(p.maxY, y);
        }
      }
    }
    return Array.from(map.values()).map((p) => ({
      ...p,
      w: p.maxX - p.minX + 1,
      h: p.maxY - p.minY + 1,
    }));
  }, [representation, boardW, boardH]);

  // Handle a piece move attempt (simplified discrete movement)
  const handleMove = (piece, dx, dy) => {
    // 1. Convert current string to 2D array
    const grid = Array.from({ length: boardH }, (_, i) =>
      representation.slice(i * boardW, (i + 1) * boardW).split(""),
    );

    // 2. Validate boundaries
    if (
      piece.minX + dx < 0 ||
      piece.maxX + dx >= boardW ||
      piece.minY + dy < 0 ||
      piece.maxY + dy >= boardH
    )
      return;

    // 3. Check collisions (only against other pieces)
    for (let y = 0; y < piece.h; y++) {
      for (let x = 0; x < piece.w; x++) {
        const targetY = piece.minY + y + dy;
        const targetX = piece.minX + x + dx;
        const targetChar = grid[targetY][targetX];
        if (targetChar !== EMPTY && targetChar !== piece.id) return; // Collision
      }
    }

    // 4. Clear old position, draw new position
    for (let y = piece.minY; y <= piece.maxY; y++) {
      for (let x = piece.minX; x <= piece.maxX; x++) {
        grid[y][x] = EMPTY;
      }
    }
    for (let y = 0; y < piece.h; y++) {
      for (let x = 0; x < piece.w; x++) {
        grid[piece.minY + y + dy][piece.minX + x + dx] = piece.id;
      }
    }

    // 5. Rejoin and pass up
    const newString = grid.map((row) => row.join("")).join("");
    onMoveRequested(newString);
  };

  return (
    <div className="absolute bottom-4 left-4 rounded-xl border border-neutral-300/60 bg-neutral-200/60 p-4 shadow-2xl backdrop-blur dark:invert-100 dark:bg-[#ddd] dark:shadow-sm">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Board
      </div>
      <div
        className="relative bg-white"
        style={{
          width: boardW * 40,
          height: boardH * 40,
          backgroundImage: `linear-gradient(to right, #afafaf 1px, transparent 1px), linear-gradient(to bottom, #afafaf 1px, transparent 1px)`,
          backgroundSize: `40px 40px`,
        }}
      >
        {pieces.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-none border-none bg-amber-500 shadow-inner flex items-center justify-center font-bold text-black/40 select-none cursor-pointer active:cursor-grabbing"
            style={{
              left: p.minX * 40,
              top: p.minY * 40,
              width: p.w * 40,
              height: p.h * 40,
              // Generating stable colors based on piece ID
              backgroundColor: `hsl(${(p.id.charCodeAt(0) * 45) % 360}, 65%, 60%)`,
            }}
            // Basic arrow key controls for the focused piece
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") handleMove(p, 0, -1);
              if (e.key === "ArrowDown") handleMove(p, 0, 1);
              if (e.key === "ArrowLeft") handleMove(p, -1, 0);
              if (e.key === "ArrowRight") handleMove(p, 1, 0);
            }}
          >
            {p.id}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-neutral-500">
        Click a piece and use <br /> Arrow Keys to move.
      </p>
    </div>
  );
}
