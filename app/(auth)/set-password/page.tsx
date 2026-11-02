
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const supabase = createSupabaseBrowserClient();

      const hashParams = new URLSearchParams(
        window.location.hash.substring(1)
      );

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const recoveryType = hashParams.get("type");

      if (
        accessToken &&
        refreshToken &&
        recoveryType === "recovery"
      ) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Failed to establish recovery session:", error.message);
        } else {
          // Remove tokens from the visible URL after processing.
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        }
      }

      if (!mounted) return;

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        console.error(
          "No recovery session:",
          error?.message ?? "No session found"
        );
        setValidSession(false);
      } else {
        setValidSession(true);
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setError(
        "Your password link is invalid or has expired. Please request a new one."
      );
      setValidSession(false);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(
        "We couldn't update your password. Please try again or request a new reset link."
      );
      return;
    }

    setMessage("Your password has been updated. Redirecting to login...");

    // End the recovery session so the user can sign in normally.
    await supabase.auth.signOut();

    setTimeout(() => {
      router.replace("/login?success=password_set");
    }, 1200);
  }

  if (checkingSession) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#DDE8E1] border-t-[#176B55]" />
        <p className="text-sm text-[#53645D]">
          Verifying your password link...
        </p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <>
        <div className="mb-8">
          <img src="/full-logo.webp" alt="Medora" className="mb-8 w-36" />

          <h1 className="text-2xl font-bold tracking-tight text-[#173F35]">
            Password link expired
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#53645D]">
            This link may have expired or already been used. Request a new
            password reset email to continue.
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="block w-full rounded-lg bg-[#176B55] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#145744]"
        >
          Request a new link
        </Link>

        <p className="mt-6 text-center text-sm text-[#53645D]">
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

  return (
    <>
      <div className="mb-8">
        <img src="/full-logo.webp" alt="Medora" className="mb-8 w-36" />

        <h1 className="text-2xl font-bold tracking-tight text-[#173F35]">
          Set your password
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#53645D]">
          Choose a strong password for your Medora account.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#173F35]"
          >
            New password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-lg border border-[#DDE8E1] px-4 py-3 text-sm text-[#173F35] outline-none transition placeholder:text-gray-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[#173F35]"
          >
            Confirm new password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full rounded-lg border border-[#DDE8E1] px-4 py-3 text-sm text-[#173F35] outline-none transition placeholder:text-gray-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#145744] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating password..." : "Set password"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-[#53645D]">
        Use at least 8 characters and avoid reusing a password from another
        account.
      </p>
    </>
  );
}
