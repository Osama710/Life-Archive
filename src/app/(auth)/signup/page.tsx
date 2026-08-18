"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (name.trim().length < 2) {
      setError("Tell us your name — at least 2 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="You're in the queue"
        subtitle="One quick email verify and you're good to go."
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <motion.span
            className="mb-4 inline-block text-5xl"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.6 }}
            aria-hidden="true"
          >
            ✉️
          </motion.span>
          <p className="text-lg font-semibold text-ink">
            Check your inbox, {name.trim().split(" ")[0]}!
          </p>
          <p className="mt-2 text-ink/60">
            Tap the link in your email to verify. Redirecting to login…
          </p>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join the archive"
      subtitle="Your name shows up everywhere — make it yours."
    >
      <form onSubmit={handleSignup} className="space-y-1">
        <Input
          type="text"
          label="Your name"
          placeholder="e.g. Sam, Alex, Mom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint="This is how your family will see you"
          required
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <Input
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Creating your spot…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        Already vibing here?{" "}
        <a
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </a>
      </p>
    </AuthShell>
  );
}
