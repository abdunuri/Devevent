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
  initialBookings: number | null;
}) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [bookingCount, setBookingCount] = useState(initialBookings);
    const [error, setError] = useState<string | null>(null);

    const HandleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const { success, error, totalBookings } = await createBooking({ eventId, slug, email });
      if (success) {
        setSubmitted(true);
        setBookingCount(totalBookings ?? (bookingCount === null ? 1 : bookingCount + 1));
        posthog.capture("event_booked", {
          eventId,
          slug,
        });
      } else {
        setError("We couldn't complete your booking. Please try again.");
        console.error("Booking failed:", error);
        posthog.captureException(error)
      }



        };
      return (
        <div id="book-event">
            {bookingCount === null ? (
              <p>Booking count is currently unavailable. You can still book your spot.</p>
            ) : bookingCount > 0 ? (
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
                {error && <p className="error-message">{error}</p>}
              </form>
            )}

        </div>
  );
};

export default BookEvent;