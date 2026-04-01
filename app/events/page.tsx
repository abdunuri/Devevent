
import ExploreBtn from "@/components/exploreBtn";
import EventCard from "@/components/eventCard";
import Image from "next/image";
import { cacheLife } from "next/cache";
// import { events } from "@/lib/constants";

interface EventSummary {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

type EventCategory = "Hackathon" | "Meetup" | "Conference";

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function getEvents(): Promise<EventSummary[]> {
  try {
    const response = await fetch(`${getAppBaseUrl()}/api/events`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
      return [];
    }

    const data = (await response.json()) as { events?: EventSummary[] };
    return Array.isArray(data.events) ? data.events : [];
  } catch {
    return [];
  }
}

function countCategory(events: EventSummary[], category: EventCategory): number {
  const patterns: Record<EventCategory, RegExp> = {
    Hackathon: /hackathon|hack day/i,
    Meetup: /meetup|meet-up|community night|networking/i,
    Conference: /conference|summit|expo|forum/i,
  };

  return events.filter((event) => patterns[category].test(event.title)).length;
}

const page = async() => {
  'use cache';
  cacheLife('minutes');
  const events = await getEvents();
  const eventCount = events.length;
  const categoryChips: Array<{ label: EventCategory; count: number }> = [
    { label: "Hackathon", count: countCategory(events, "Hackathon") },
    { label: "Meetup", count: countCategory(events, "Meetup") },
    { label: "Conference", count: countCategory(events, "Conference") },
  ];

  return (
    <section id="events-page" className="flex flex-col gap-10">
      <div className="relative overflow-hidden rounded-3xl border border-dark-200 bg-gradient-to-br from-[#0f1d25] via-[#0b1318] to-[#090f13] p-7 card-shadow sm:p-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-20 h-56 w-56 rounded-full bg-blue/20 blur-3xl" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Discover Events</p>
            <h1 className="mb-3 text-5xl max-sm:text-4xl">Featured Tech Gatherings</h1>
            <p className="text-light-200 max-w-2xl text-base">
              Handpicked opportunities to learn, connect, and build with the Addis tech community.
              Find your next hackathon, meetup, or conference below.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {eventCount} active events
              </span>
              <span className="rounded-full border border-dark-200 bg-dark-100 px-3 py-1 text-xs font-semibold text-light-200">
                Updated frequently
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categoryChips.map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-full border border-dark-200 bg-dark-100 px-3 py-1 text-xs font-semibold text-light-100"
                >
                  {chip.label} {chip.count > 0 ? `(${chip.count})` : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="relative h-56 overflow-hidden rounded-2xl border border-dark-200 bg-dark-100">
            <Image
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80"
              alt="Audience at a technology event"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </div>

      <div className="space-y-7">
          <h3>Featured Events</h3>
          <ol className="events">
            {events && events.length > 0 ? (
              events.map((event) => (
                <li key={event.title}>
                  <EventCard {...event} />
                </li>
              ))
            ) : (
              <div className="rounded-xl border border-dark-200 bg-dark-100/70 p-6 text-center">
                <p className="text-light-200 mb-4">No events are available yet.</p>
                <div className="flex justify-center">
                  <ExploreBtn />
                </div>
              </div>
            )}

          </ol>
      </div>
    </section>
  );
};

export default page;