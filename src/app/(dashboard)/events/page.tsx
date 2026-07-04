import { EventsPage } from "@/views/events";

export default async function Events({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ page?: string }>;
}>) {
  const { page } = await searchParams;
  return <EventsPage page={page} />;
}
