
"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createSupabaseBrowserClient();

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/set-password`,
      });

    setLoading(false);

    if (resetError) {
      setError(
        "We couldn't send the password reset email. Please try again."
      );
      return;
    }

    setMessage(
      "If an account exists with that email, you'll receive a password reset link shortly. Please check your inbox and spam folder."
    );
  }

  return (
    <>
      <div className="mb-8">
        <img src="/full-logo.webp" alt="Medora" className="mb-8 w-36" />

        <h1 className="text-2xl font-bold tracking-tight text-[#173F35]">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#53645D]">
          Enter the email address associated with your Medora account.
          We&apos;ll send you a link to set a new password.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-5 text-green-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@clinic.com"
            className="w-full rounded-lg border border-[#DDE8E1] px-4 py-3 text-sm text-[#173F35] outline-none transition placeholder:text-gray-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#145744] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#53645D]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#176B55] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </>
  );
}
