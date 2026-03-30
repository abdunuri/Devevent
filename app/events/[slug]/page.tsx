import { notFound } from "next/navigation";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const request= await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`)
  const eventData = await request.json();
  if(!eventData || eventData.error) return notFound();
  return (
    <section>
      <h1>Event Details for: {slug}</h1>
    </section>
  );
};

export default EventDetailsPage;