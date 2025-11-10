import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <>
      {/* This component will be wrapped by your root app/layout.jsx */}
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <Image 
            src="/assets/images/logo-black.png" // Use your logo
            width={150} 
            height={40} 
            alt="Narumugai" 
            className="mx-auto h-10 w-auto"
            unoptimized
          />
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            404
          </h1>
          <p className="mt-4 text-base font-semibold uppercase text-primary">
            Page Not Found
          </p>
          <p className="mt-2 text-base text-gray-600">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Go Back Home
            </Link>
            <Link href="/shop" className="text-sm font-semibold text-gray-900">
              Continue Shopping <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}