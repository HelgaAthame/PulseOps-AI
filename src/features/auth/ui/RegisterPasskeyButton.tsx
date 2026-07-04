"use client";

import { useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";

import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";

/** Регистрация passkey для уже вошедшего пользователя (страница настроек). */
export function RegisterPasskeyButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.registerPasskey();
      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }
      setIsError(false);
      setMessage("Passkey зарегистрирован. Теперь можно входить по биометрии.");
    } catch (e) {
      setIsError(true);
      setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Fingerprint className="size-4" />
        )}
        Добавить passkey
      </Button>
      {message && (
        <p
          className={
            isError ? "text-sm text-destructive" : "text-sm text-emerald-600"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
