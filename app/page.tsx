"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { ApiError } from "@/lib/api";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login, signup, isAuthenticated, user, rehydrateAuth } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    rehydrateAuth();
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      if (user?.onboardingComplete) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }
      setLoading(true);
      try {
        await login(email, password);
        router.push("/dashboard");
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!name || !email || !password) {
        setError("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      try {
        await signup(name, email, password);
        router.push("/onboarding");
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <Image src="/logo.svg" alt="Vocation" width={40} height={40} />
          <span className="text-xl font-bold tracking-tight">Vocation</span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border mb-8">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Create account
          </button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-1.5">
            {mode === "login" ? "Welcome back" : "Get started"}
          </h2>
          <p className="text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue your career journey."
              : "Create an account to discover where you belong."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg bg-danger/8 border border-danger/15 text-danger text-sm animate-scaleIn">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-medium mb-1.5 text-muted">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted">
              Email address
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                placeholder={
                  mode === "signup"
                    ? "Min. 6 characters"
                    : "Enter your password"
                }
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
            {!loading && <ArrowRightIcon className="w-4 h-4" />}
          </button>
        </form>

        {/* Bottom text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="text-accent hover:text-accent-hover transition-colors cursor-pointer font-medium"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                className="text-accent hover:text-accent-hover transition-colors cursor-pointer font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
