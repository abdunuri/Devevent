import ExploreBtn from "@/components/exploreBtn";
import EventCard from "@/components/eventCard";
// import { events } from "@/lib/constants";

const page = async() => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { events } = await response.json();

  return (
    <section>
        <h1 className="text-center">The hub for every Tech <br/>Event in Addis</h1>
        <p className="text-center mt-5">Hackathons, Meetups, and Conferences all in one place.</p>

        <ExploreBtn />
        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ol className="events">
            {events && events.length > 0 ? (
              events.map((event: any) => (
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