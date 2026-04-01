'use client';
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react";
const BookEvent = ({
  eventId,
  slug,
  initialBookings,
}: {
  eventId: string;
  slug: string;
  initialBookings: number;
}) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [bookingCount, setBookingCount] = useState(initialBookings);

    const HandleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const { success, error, totalBookings } = await createBooking({ eventId, slug, email });
      if (success) {
        setSubmitted(true);
        setBookingCount(totalBookings ?? bookingCount + 1);
        posthog.capture("event_booked", {
          eventId,
          slug,
          email,
        });
      } else {
        console.error("Booking failed:", error);
        posthog.captureException(error)
      }



        };
      return (
        <div id="book-event">
            {bookingCount > 0 ? (
              <p>Join {bookingCount} people who have already booked for this event!</p>
            ) : (
              <p>Be the first to book for this event!</p>
            )}
            {submitted ? (
              <p>Thank you for booking! We look forward to seeing you at the event.</p>
            ) : (
              <form onSubmit={HandleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        />
                </div>
                <button  className="button-submit" type="submit">
                    Book Now
                </button>
              </form>
            )}

        </div>
  );
};

export default BookEvent;