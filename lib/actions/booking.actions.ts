"use server";

import mongoose from "mongoose";
import { Booking } from "@/database";
import { auth } from "@/auth";
import connectToDatabase from "../mongodb";

type CreateBookingInput = {
  eventId: string;
  slug: string;
    email?: string;
};

type GetBookingCountInput = {
    eventId: string;
    slug: string;
};

type BookingStatusInput = {
    eventId: string;
    slug: string;
};

function normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
        throw new Error("A valid email is required.");
    }

    return normalized;
}

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
        return null;
    }
};

export const getCurrentUserBookingStatus = async ({ eventId, slug }: BookingStatusInput) => {
    try {
        const { normalizedEventId, normalizedSlug } = normalizeBookingTarget(eventId, slug);
        const session = await auth();
        const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? null;

        if (!sessionEmail) {
            return {
                signedIn: false,
                email: null,
                alreadyBooked: false,
            };
        }

        await connectToDatabase();

        const existingBooking = await Booking.findOne({
            eventId: normalizedEventId,
            slug: normalizedSlug,
            email: sessionEmail,
        })
            .select("_id")
            .lean();

        return {
            signedIn: true,
            email: sessionEmail,
            alreadyBooked: Boolean(existingBooking),
        };
    } catch (error) {
        console.error("Failed to get current user booking status:", error);
        return {
            signedIn: false,
            email: null,
            alreadyBooked: false,
        };
    }
};

export const createBooking = async ({ eventId, slug, email }: CreateBookingInput) => {
    try {
        const { normalizedEventId, normalizedSlug } = normalizeBookingTarget(eventId, slug);
        const session = await auth();

        const bookingEmail = email?.trim()
            ? normalizeEmail(email)
            : session?.user?.email
              ? normalizeEmail(session.user.email)
              : null;

        if (!bookingEmail) {
            return {
                success: false,
                requiresEmail: true,
                error: "Email is required to complete booking.",
            };
        }

        await connectToDatabase();

        const existingBooking = await Booking.findOne({
            eventId: normalizedEventId,
            slug: normalizedSlug,
            email: bookingEmail,
        })
            .select("_id")
            .lean();

        if (existingBooking) {
            const totalBookings = await Booking.countDocuments({
                eventId: normalizedEventId,
                slug: normalizedSlug,
            });

            return {
                success: false,
                alreadyBooked: true,
                totalBookings,
                error: "You have already booked this event.",
            };
        }

        const createdBooking = await Booking.create({
            eventId: normalizedEventId,
            slug: normalizedSlug,
            email: bookingEmail,
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