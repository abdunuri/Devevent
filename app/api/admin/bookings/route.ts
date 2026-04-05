import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Event } from "@/database/event.model";

interface BookingGroup {
  eventId: string;
  slug: string;
  eventTitle: string;
  totalBookings: number;
  emails: string[];
}

export async function GET() {
  try {
    await connectToDatabase();

    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    const uniqueEventIds = Array.from(new Set(bookings.map((item) => String(item.eventId))));

    const events = await Event.find({ _id: { $in: uniqueEventIds } })
      .select("_id title slug")
      .lean();

    const eventById = new Map<string, { title: string; slug: string }>();
    for (const event of events) {
      eventById.set(String(event._id), {
        title: String(event.title ?? "Untitled Event"),
        slug: String(event.slug ?? ""),
      });
    }

    const grouped = new Map<string, BookingGroup>();
    for (const booking of bookings) {
      const eventId = String(booking.eventId);
      const eventMeta = eventById.get(eventId);
      const slug = booking.slug;
      const key = `${eventId}:${slug}`;

      const existing = grouped.get(key) ?? {
        eventId,
        slug,
        eventTitle: eventMeta?.title ?? slug,
        totalBookings: 0,
        emails: [],
      };

      existing.totalBookings += 1;
      if (!existing.emails.includes(booking.email)) {
        existing.emails.push(booking.email);
      }

      grouped.set(key, existing);
    }

    const bookingGroups = Array.from(grouped.values())
      .map((group) => ({
        ...group,
        emails: group.emails.sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => b.totalBookings - a.totalBookings);

    return NextResponse.json(
      {
        message: "Booking analytics fetched successfully.",
        count: bookingGroups.length,
        bookingGroups,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Failed to fetch booking analytics.", error: message },
      { status: 500 }
    );
  }
}
