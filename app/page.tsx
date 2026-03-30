import ExploreBtn from "@/components/exploreBtn";
import EventCard from "@/components/eventCard";
// import { events } from "@/lib/constants";

interface EventSummary {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
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

async function getEvents(): Promise<EventSummary[]> {
  try {
    const response = await fetch(`${getAppBaseUrl()}/api/events`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
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

const page = async() => {
  const events = await getEvents();

  return (
    <section>
        <h1 className="text-center">The hub for every Tech <br/>Event in Addis</h1>
        <p className="text-center mt-5">Hackathons, Meetups, and Conferences all in one place.</p>

        <ExploreBtn />
        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ol className="events">
            {events && events.length > 0 ? (
              events.map((event) => (
                <li key={event.title}>
                  <EventCard {...event} />
                </li>
              ))
            ) : (
              <p>No events available.</p>
            )}

          </ol>
        </div>
    </section>
  );
};

export default page;