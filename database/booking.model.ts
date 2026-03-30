import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

import { Event } from "./event.model";

function ensureNonEmpty(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`"${fieldName}" is required and cannot be empty.`);
  }

  return normalized;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type BookingDocument = HydratedDocument<IBooking>;

type BookingModelType = Model<IBooking>;

const bookingSchema = new Schema<IBooking, BookingModelType>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre("save", async function preSaveValidateBooking(this: BookingDocument) {
  const normalizedEmail = ensureNonEmpty(this.email, "email").toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error(`Invalid email format: "${this.email}".`);
  }
  this.email = normalizedEmail;

  // Validate referential integrity so bookings cannot target deleted/missing events.
  if (this.isModified("eventId") || this.isNew) {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error(`Event with id "${this.eventId.toString()}" does not exist.`);
    }
  }
});

export const Booking =
  (mongoose.models.Booking as BookingModelType | undefined) ??
  mongoose.model<IBooking, BookingModelType>("Booking", bookingSchema);

