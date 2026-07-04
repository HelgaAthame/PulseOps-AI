"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Logo } from "@/shared/ui/logo";
import { createClient } from "@/shared/api/supabase/client";
import {
  GoogleButton,
  PasskeySignInButton,
  CaptchaWidget,
} from "@/features/auth";

type Mode = "sign-in" | "sign-up";

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    // captchaToken передаётся только когда капча (hCaptcha) настроена; иначе
    // undefined (Supabase проверяет капчу, только если она включена в проекте).
    const options = captchaToken ? { captchaToken } : undefined;

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options,
      });
      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setNotice("Check your email to confirm the account, then sign in.");
      setMode("sign-in");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <Logo />
        </div>

        <h1 className="text-lg font-semibold tracking-tight">
          {mode === "sign-in" ? "Sign in" : "Sign up"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "sign-in"
            ? "Sign in to open your dashboard"
            : "Create an account to get started"}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <GoogleButton onError={setError} />
          <PasskeySignInButton onError={setError} captchaToken={captchaToken} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <CaptchaWidget onToken={setCaptchaToken} />

          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Loading…"
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "sign-in"
            ? "No account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
