import { EventsPage } from "@/views/events";

export default async function Events({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ page?: string; size?: string; q?: string }>;
}>) {
  const { page, size, q } = await searchParams;
  return <EventsPage page={page} size={size} q={q} />;
}
