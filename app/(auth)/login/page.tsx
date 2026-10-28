import { signIn } from "./actions";

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

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12"
      style={{
        backgroundImage: `
      linear-gradient(
        135deg,
        rgba(23, 63, 53, 0.88) 0%,
        rgba(23, 107, 85, 0.72) 45%,
        rgba(255, 255, 255, 0.42) 100%
      ),
      url('https://images.unsplash.com/photo-1777269749032-d8d458ae594d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D')
    `,
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DDE8E1] bg-white p-8 shadow-sm">
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
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#173F35]"
            >
              Password
            </label>

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
      </div>
    </main>
  );
}