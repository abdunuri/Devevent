import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getBookingCountByEvent } from "@/lib/actions/booking.actions";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import type { SimilarEventSummary } from "@/lib/actions/event.actions";
import EventCard from "@/components/eventCard";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import { Suspense } from "react";

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fall through to comma-separated parsing.
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={20} height={20} />
    <span>{label}</span>
  </div>
);
const EventAgenda= ({ agenda }: { agenda: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    {agenda.length > 0 ? (
      <ul>
        {agenda.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No agenda items available.</p>
    )}
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.length > 0 ? (
      tags.map((tag) => (
        <span key={tag} className="pill">
          {tag}
        </span>
      ))
    ) : (
      <p>No tags available.</p>
    )}

  </div>
);
const EventDetailsContent = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  type EventDetails = {
    _id: string;
    title: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: unknown;
    organizer: string;
    tags: unknown;
  };

  let eventData: { error?: string; event?: EventDetails } | null = null;
  try {
    const request = await fetch(`${getAppBaseUrl()}/api/events/${slug}`, {
      headers: {
        Accept: "application/json",
      },
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

  const {
    _id,
    title,
    description,
    overview,
    image,
    venue,
    location,
    date,
    time,
    mode,
    audience,
    agenda: rawAgenda,
    organizer,
    tags: rawTags,
  } = eventData.event;

  const agenda = parseListField(rawAgenda);
  const tags = parseListField(rawTags);
  const formattedDate = formatEventDate(date);
  const formattedTime = formatEventTime(time);
  const bookingCount = await getBookingCountByEvent({ eventId: _id, slug });
  const similarEvents: SimilarEventSummary[] = await getSimilarEventsBySlug(slug);


  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className="details">
        {/* {left side event content} */}
        <div className="content">
          <Image src={image} alt={title} width={800} height={800} className="banner" />
          <section className="flex-col gap-2">
            <h2>Overview</h2>
            <p className="overview">{overview}</p>
          </section>
          <section className="flex-col gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="Date" label={formattedDate} />
            <EventDetailItem icon="/icons/clock.svg" alt="Time" label={formattedTime} />
            <EventDetailItem icon="/icons/pin.svg" alt="Location" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="Mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="Audience" label={audience} />
          </section>
          <EventAgenda agenda={agenda} />
          <section className="flex-col gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />
        </div>
        {/* {right side booking form} */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            <BookEvent eventId={eventData.event._id} slug={slug} initialBookings={bookingCount} />
          </div>
        </aside>
      </div>
      <div className="similar-events flex w-full flex-col gap-4">
        <h2>Similar Events</h2>
        {similarEvents.length > 0 ? (
          similarEvents.map((similarEvent) => (
            <EventCard
              key={String(similarEvent._id)}
              title={String(similarEvent.title)}
              image={String(similarEvent.image)}
              slug={String(similarEvent.slug)}
              location={String(similarEvent.location)}
              date={String(similarEvent.date)}
              time={String(similarEvent.time)}
            />
          ))
        ) : (
          <p>No similar events found.</p>
        )}
      </div>

    </section>
  )
};

const EventDetailsFallback = () => (
  <section id="event">
    <div className="header">
      <h1>Event Description</h1>
      <p>Loading event details...</p>
    </div>
  </section>
);

const EventDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<EventDetailsFallback />}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
};

export default EventDetailsPage;