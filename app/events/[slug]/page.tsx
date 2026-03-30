import { notFound } from "next/navigation";

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  let eventData: { error?: string } | null = null;
  try {
    const request = await fetch(`${getAppBaseUrl()}/api/events/${slug}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!request.ok) {
      return notFound();
    }

    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
      return notFound();
    }

    eventData = (await request.json()) as { error?: string };
  } catch {
    return notFound();
  }

  if (!eventData || eventData.error) {
    return notFound();
  }

  return (
    <section>
      <h1>Event Details for: {slug}</h1>
    </section>
  );
};

export default EventDetailsPage;