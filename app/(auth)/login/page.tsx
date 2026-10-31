
import { Suspense } from "react";
import { signIn } from "./actions";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  invalid_input: "Please enter your email address and password.",
  invalid_credentials: "Invalid email or password. Please try again.",
  unauthorized: "You don't have permission to access the admin platform.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function LoginFallback() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-8 w-36 rounded bg-gray-200" />
      <div className="mb-3 h-6 w-48 rounded bg-gray-200" />
      <div className="mb-8 h-4 w-56 rounded bg-gray-100" />
      <div className="mb-5 h-11 rounded-lg bg-gray-100" />
      <div className="mb-5 h-11 rounded-lg bg-gray-100" />
      <div className="h-12 rounded-lg bg-gray-200" />
    </div>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <>
      <div className="mb-8">
        <img
          src="/full-logo.webp"
          alt="Medora"
          className="mb-8 w-36"
        />

        <h1 className="text-2xl font-bold tracking-tight text-[#173F35]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-[#53645D]">
          Sign in to your Medora account.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <form action={signIn} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#173F35]"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#173F35]"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#176B55] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#125542] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#53645D]">
        Secure access to the Medora platform.
      </p>
    </>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
