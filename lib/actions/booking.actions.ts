"use server";

import mongoose from "mongoose";
import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

type CreateBookingInput = {
  eventId: string;
  slug: string;
  email: string;
};

type GetBookingCountInput = {
    eventId: string;
    slug: string;
};

function normalizeBookingTarget(eventId: string, slug: string) {
    const normalizedEventId = eventId.trim();
    if (!normalizedEventId || !mongoose.Types.ObjectId.isValid(normalizedEventId)) {
        throw new Error("A valid eventId is required.");
    }

    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) {
        throw new Error("A valid slug is required.");
    }

    return { normalizedEventId, normalizedSlug };
}

export const getBookingCountByEvent = async ({ eventId, slug }: GetBookingCountInput) => {
    try {
        const { normalizedEventId, normalizedSlug } = normalizeBookingTarget(eventId, slug);

        await connectToDatabase();
        return await Booking.countDocuments({
            eventId: normalizedEventId,
            slug: normalizedSlug,
        });
    } catch (error) {
        console.error("Failed to count bookings:", error);
        return 0;
    }
};

export const createBooking = async ({ eventId, slug, email }: CreateBookingInput) => {
    try {
        const { normalizedEventId, normalizedSlug } = normalizeBookingTarget(eventId, slug);

        await connectToDatabase();
        const createdBooking = await Booking.create({
            eventId: normalizedEventId,
            slug: normalizedSlug,
            email,
        });

        const totalBookings = await Booking.countDocuments({
            eventId: normalizedEventId,
            slug: normalizedSlug,
        });

        const booking = {
            id: String(createdBooking._id),
            eventId: String(createdBooking.eventId),
            slug: createdBooking.slug,
            email: createdBooking.email,
            createdAt: createdBooking.createdAt.toISOString(),
            updatedAt: createdBooking.updatedAt.toISOString(),
        };

        return { success: true, booking, totalBookings };
    } catch (error) {
        console.error("Failed to create booking:", error);
        const message = error instanceof Error ? error.message : "Failed to create booking.";
        return { success: false, error: message };
    }
};