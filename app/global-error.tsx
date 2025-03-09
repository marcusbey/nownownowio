"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-6 text-zinc-400">{error.message}</p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
