const MODES = [
  { id: "dist", label: "Distance from start" },
  { id: "solution", label: "Distance to solution" },
];

export default function ControlsPanel({
  colorMode,
  setColorMode,
  showSolutions,
  setShowSolutions,
  showPath,
  setShowPath,
}) {
  return (
    <div className="absolute top-4 left-4 rounded-xl border border-neutral-200/60 bg-neutral-200/85 p-3 text-neutral-100 shadow-2xl backdrop-blur dark:invert-100 dark:shadow-sm">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
        Color by
      </div>
      <div className="flex gap-1">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setColorMode(mode.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              colorMode === mode.id
                ? "bg-neutral-900 text-neutral-100"
                : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-neutral-300/30 pt-3">
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="show-solutions"
            checked={showSolutions}
            onChange={(e) => setShowSolutions(e.target.checked)}
            className="accent-neutral-700"
          />
          <label
            htmlFor="show-solutions"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800 cursor-pointer"
          >
            Solutions
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="show-path"
            checked={showPath}
            onChange={(e) => setShowPath(e.target.checked)}
            className="accent-neutral-700"
          />
          <label
            htmlFor="show-path"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800 cursor-pointer"
          >
            Shortest Path
          </label>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-700">
        Scroll to zoom · drag to orbit · click a node for details
      </p>
    </div>
  );
}
