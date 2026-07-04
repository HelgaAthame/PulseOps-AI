-- Включаем Supabase Realtime для таблицы events.
-- Realtime отдаёт клиенту изменения строк с учётом RLS: включаем RLS и
-- политику «свои события», чтобы пользователь получал только свои строки.
-- Серверные чтения через Drizzle идут под ролью-владельцем таблицы (postgres)
-- и RLS обходят (RLS не применяется к владельцу без FORCE).

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "Users can read own events"
  ON "events" FOR SELECT
  TO authenticated
  USING ("owner_id" = (SELECT auth.uid()));
--> statement-breakpoint
ALTER PUBLICATION "supabase_realtime" ADD TABLE "events";
