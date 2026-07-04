import { redirect } from "next/navigation";

import { ensureUserProfile } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { Sidebar } from "@/widgets/sidebar";
import { Topbar } from "@/widgets/topbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email) {
    await ensureUserProfile(user.id, user.email);
  }

  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
