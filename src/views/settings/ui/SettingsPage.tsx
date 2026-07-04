import { PasskeyManager } from "@/features/auth";
import { createClient } from "@/shared/api/supabase/server";

export async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground">
          Аккаунт и безопасность
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <div className="text-sm font-medium">Аккаунт</div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user?.email ?? "—"}</dd>
          <dt className="text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{user?.id ?? "—"}</dd>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <div className="text-sm font-medium">Passkey / биометрия</div>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Входите по Face ID, Touch ID или Windows Hello — без пароля. Здесь
          видны все ваши passkeys; лишние можно удалить.
        </p>
        <PasskeyManager />
      </div>
    </div>
  );
}
