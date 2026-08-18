"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const joiningFamily = nextPath.includes("/dashboard/invite");

  useEffect(() => {
    const prefilled = searchParams.get("email");
    if (prefilled) setEmail(prefilled);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={joiningFamily ? "Sign in to join family" : "Welcome back"}
      subtitle={
        joiningFamily
          ? "Use the same email your partner invited, then we will add you to the archive."
          : "Your memories missed you. No exaggeration."
      }
    >
      <form onSubmit={handleLogin} className="space-y-1">
        <Input
          type="email"
          label="Email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Opening the vault…" : joiningFamily ? "Sign in & continue" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-ink/55">
        <p>
          New here?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
        <p>
          <Link href="/reset-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading login" />}>
      <LoginForm />
    </Suspense>
  );
}
