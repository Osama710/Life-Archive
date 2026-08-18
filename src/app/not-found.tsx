import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          Page not found
        </p>
        <h1 className="mb-3 text-4xl font-bold">This chapter isn’t here</h1>
        <p className="mb-7 text-stone-600">
          The link may be old, but your family archive is still safe.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-white"
        >
          Return to your archive
        </Link>
      </div>
    </main>
  );
}
