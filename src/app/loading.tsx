export default function Loading() {
  return (
    <div
      className="flex min-h-[50dvh] items-center justify-center"
      role="status"
    >
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading Life Archive</span>
    </div>
  );
}
