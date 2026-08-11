"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";
import { playEngineStart } from "@/lib/sound";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    // Fired synchronously inside the submit gesture so mobile browsers'
    // autoplay policies allow it — a fun, one-shot ignition sound, not
    // background audio.
    playEngineStart();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-1">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink-400 bg-gradient-to-b from-ink-600 to-ink-800 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,139,61,0.15)]">
          <span className="font-mono text-sm font-extrabold text-accent-500">CF</span>
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-ink-50">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-200">Log in to keep flipping smart.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Starting up…" : "Log in"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-200">
        New to CarFlip OS?{" "}
        <Link href="/signup" className="font-medium text-accent-500 hover:text-accent-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
