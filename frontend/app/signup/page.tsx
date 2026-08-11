"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";
import { playEngineStart } from "@/lib/sound";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    homeZip: "",
    role: "flipper" as UserRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    playEngineStart();
    try {
      await signup(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-1 py-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink-400 bg-gradient-to-b from-ink-600 to-ink-800 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,139,61,0.15)]">
          <span className="font-mono text-sm font-extrabold text-accent-500">CF</span>
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-ink-50">Create your account</h1>
        <p className="mt-1 text-sm text-ink-200">Evaluate deals before you buy, not after.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="homeZip">Home ZIP</Label>
              <Input
                id="homeZip"
                required
                value={form.homeZip}
                onChange={(e) => update("homeZip", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">I am a…</Label>
              <Select id="role" value={form.role} onChange={(e) => update("role", e.target.value as UserRole)}>
                <option value="flipper">Flipper</option>
                <option value="dealer">Dealer</option>
              </Select>
            </div>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Starting up…" : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-200">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-500 hover:text-accent-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
