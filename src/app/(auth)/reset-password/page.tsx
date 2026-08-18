"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We sent a reset link — tap it and you're back in."
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-4 text-center"
        >
          <span className="mb-4 inline-block text-5xl" aria-hidden>
            ✉️
          </span>
          <p className="text-ink/60">
            Link sent to <strong className="text-ink">{email}</strong>
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block font-semibold text-primary hover:underline"
          >
            Back to login
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email — we'll send a link to get you back in."
    >
      <form onSubmit={handleReset} className="space-y-1">
        <Input
          type="email"
          label="Email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/55">
        Remember it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
