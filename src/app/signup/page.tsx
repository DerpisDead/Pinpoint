"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {checks.map((c) => (
        <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? "text-emerald-500" : "text-gray-400"}`}>
          <CheckCircle2 size={12} className={c.pass ? "text-emerald-500" : "text-gray-300"} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // If email confirmation is disabled in Supabase, go straight to dashboard
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Account created!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Check your email to confirm your account, then you'll be
              redirected to your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-2xl font-bold gradient-text">PinPoint</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Free forever. Start studying in seconds.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Display name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3F6E]/20 focus:border-[#1C3F6E]/40 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3F6E]/20 focus:border-[#1C3F6E]/40 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3F6E]/20 focus:border-[#1C3F6E]/40 transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-[#8B1A2D]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:border-[#1C3F6E]/40 hover:text-[#1C3F6E] transition-colors"
          >
            Sign in instead
          </Link>

          <p className="text-center text-xs text-gray-400 mt-5">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Back to landing */}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            ← Back to PinPoint
          </Link>
        </p>
      </div>
    </div>
  );
}
