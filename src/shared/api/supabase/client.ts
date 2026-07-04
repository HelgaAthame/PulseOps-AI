import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Passkeys в Supabase пока экспериментальные — нужен явный opt-in.
        // Включает supabase.auth.registerPasskey() и signInWithPasskey().
        experimental: { passkey: true },
      },
    }
  );
}
