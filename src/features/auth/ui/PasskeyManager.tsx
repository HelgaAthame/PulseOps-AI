"use client";

import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";

import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";
import { formatRelativeTime } from "@/shared/lib/format";

type Passkey = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

export function PasskeyManager() {
  const [items, setItems] = useState<Passkey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.passkey.list();
    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }
    setItems(data ?? []);
  }, []);

  useEffect(() => {
    // Легитимная загрузка при монтировании: passkey.list() требует
    // браузерной сессии; setState вызывается асинхронно после await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRegister() {
    setRegistering(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.registerPasskey();
      if (error) {
        setError(error.message);
        return;
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.passkey.delete({ passkeyId: id });
      if (error) {
        setError(error.message);
        return;
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {items === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading passkeys…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No passkeys yet. Add one to sign in with biometrics.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((pk) => (
            <li key={pk.id} className="flex items-center gap-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Fingerprint className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {pk.friendly_name || "Unnamed"}
                </div>
                <div className="text-xs text-muted-foreground">
                  added {formatRelativeTime(pk.created_at)}
                  {pk.last_used_at
                    ? ` · used ${formatRelativeTime(pk.last_used_at)}`
                    : ""}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete passkey"
                title="Delete passkey"
                onClick={() => handleDelete(pk.id)}
                disabled={deletingId === pk.id}
              >
                {deletingId === pk.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Add passkey
      </Button>
    </div>
  );
}
