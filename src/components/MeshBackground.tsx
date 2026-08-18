export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="mesh-bg absolute inset-0" />
      <div className="blob blob-violet absolute -left-20 top-20 size-72" />
      <div className="blob blob-coral absolute -right-16 top-1/3 size-64" />
      <div className="blob blob-mint absolute bottom-20 left-1/4 size-56" />
    </div>
  );
}
