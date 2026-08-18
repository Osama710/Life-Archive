export function MeshBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-cream"
      aria-hidden="true"
    >
      <div className="mesh-bg mesh-bg-animated absolute inset-0" />
      <div className="blob blob-violet absolute -left-24 top-16 size-80 opacity-90" />
      <div className="blob blob-coral absolute -right-20 top-1/4 size-72 opacity-90" />
      <div className="blob blob-fuchsia absolute right-1/4 top-2/3 size-64 opacity-80" />
      <div className="blob blob-mint absolute bottom-16 left-1/5 size-72 opacity-90" />
      <div className="mesh-noise absolute inset-0" />
    </div>
  );
}
