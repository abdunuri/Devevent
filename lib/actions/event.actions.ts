'use server'

import { Event } from "@/database/event.model";
import connectToDatabase from "../mongodb";

export interface SimilarEventSummary {
  _id: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const getSimilarEventsBySlug = async (slug: string): Promise<SimilarEventSummary[]> => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags }
    })
      .select("title image slug location date time")
      .lean<Array<{
        _id: unknown;
        title?: unknown;
        image?: unknown;
        slug?: unknown;
        location?: unknown;
        date?: unknown;
        time?: unknown;
      }>>();

    return similarEvents.map((similarEvent) => ({
      _id: String(similarEvent._id),
      title: String(similarEvent.title ?? ""),
      image: String(similarEvent.image ?? ""),
      slug: String(similarEvent.slug ?? ""),
      location: String(similarEvent.location ?? ""),
      date: String(similarEvent.date ?? ""),
      time: String(similarEvent.time ?? ""),
    }));
  } catch (error) {
    console.error("Failed to fetch similar events:", error);
    return [];
  }
};
