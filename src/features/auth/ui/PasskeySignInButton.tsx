"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";

import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";

export function PasskeySignInButton({
  onError,
  captchaToken,
}: {
  onError?: (message: string) => void;
  captchaToken?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    onError?.("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPasskey(
        captchaToken ? { options: { captchaToken } } : undefined
      );
      if (error) {
        onError?.(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      onError?.((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Fingerprint className="size-4" />
      )}
      Войти по биометрии (passkey)
    </Button>
  );
}
