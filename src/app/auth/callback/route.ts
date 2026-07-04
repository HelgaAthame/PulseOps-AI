import { NextResponse } from "next/server";

import { createClient } from "@/shared/api/supabase/server";

/**
 * OAuth / passkey redirect callback. Supabase присылает ?code=... —
 * обмениваем его на сессию (PKCE) и уводим пользователя внутрь приложения.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
