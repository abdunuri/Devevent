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

  type EventDetails = {
    description: string;
  };

  let eventData: { error?: string; event?: EventDetails } | null = null;
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

    eventData = (await request.json()) as { error?: string; event?: EventDetails };
  } catch {
    return notFound();
  }

  if (!eventData || eventData.error || !eventData.event) {
    return notFound();
  }


  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{}</p>
      </div>
    </section>
  );
};

export default EventDetailsPage;