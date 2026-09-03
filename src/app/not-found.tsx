import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        404 error
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-gray-500">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}