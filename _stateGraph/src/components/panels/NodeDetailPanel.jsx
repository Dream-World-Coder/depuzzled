export default function NodeDetailPanel({
  node,
  onClose,
  onTeleport,
  isCurrent,
}) {
  if (!node) return null;

  return (
    <div
      className="absolute top-4 right-4 w-72 rounded-xl border border-neutral-200/60 bg-neutral-200/85 p-4 text-neutral-500 shadow-2xl backdrop-blur dark:invert-100 dark:shadow-sm"
      style={
        {
          // background: `repeating-linear-gradient(
          //             135deg,
          //             rgba(11, 11, 11, 0.2) 0px,
          //             rgba(11, 11, 11, 0.2) 1px,
          //             transparent 1px,
          //             transparent 3px
          //           )`,
        }
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
          Node details
        </h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-neutral-900 transition hover:bg-neutral-900 hover:text-neutral-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <dl className="space-y-1.5 text-sm">
        <Row label="Distance from start" value={node.dist} />
        <Row label="Distance to solution" value={node.solution_dist} />
        <Row label="Neighbors" value={node.neighborCount} />
      </dl>

      <div className="mt-3 break-all rounded-lg bg-black/60 p-2 font-mono text-[11px] leading-relaxed text-neutral-100">
        {node.representation}
      </div>

      <button
        onClick={onTeleport}
        disabled={isCurrent}
        className="mt-3 w-full rounded-lg bg-sky-400 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-800"
      >
        {isCurrent ? "This is the current position" : "Set as current position"}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-900">{label}</dt>
      <dd className="font-medium text-neutral-600">{value}</dd>
    </div>
  );
}
