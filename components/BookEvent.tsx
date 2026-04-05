'use client';
import { createBooking, getCurrentUserBookingStatus } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

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
    const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
    const [alreadyBooked, setAlreadyBooked] = useState(false);
    const [isLoadingUserStatus, setIsLoadingUserStatus] = useState(true);
    const [bookingCount, setBookingCount] = useState(initialBookings);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let active = true;

      const loadUserStatus = async () => {
        const status = await getCurrentUserBookingStatus({ eventId, slug });

        if (!active) {
          return;
        }

        if (status.signedIn && status.email) {
          setSignedInEmail(status.email);
          setAlreadyBooked(status.alreadyBooked);
        } else {
          setSignedInEmail(null);
          setAlreadyBooked(false);
        }

        setIsLoadingUserStatus(false);
      };

      void loadUserStatus();

      return () => {
        active = false;
      };
    }, [eventId, slug]);

    const HandleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const result = await createBooking({ eventId, slug, email: signedInEmail ? undefined : email });

      if (result.alreadyBooked) {
        setAlreadyBooked(true);
        setError(null);
        return;
      }

      const { success, error, totalBookings } = result;

      if (success) {
        setSubmitted(true);
        setAlreadyBooked(true);
        setBookingCount(totalBookings ?? (bookingCount === null ? 1 : bookingCount + 1));
        posthog.capture("event_booked", {
          eventId,
          slug,
        });
      } else {
        setError(error ?? "We couldn't complete your booking. Please try again.");
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
            ) : alreadyBooked ? (
              <p>You already booked this event.</p>
            ) : (
              <form onSubmit={HandleSubmit}>
                {isLoadingUserStatus ? (
                  <p>Checking your sign-in status...</p>
                ) : signedInEmail ? (
                  <p className="text-sm text-light-200">Booking as {signedInEmail}</p>
                ) : (
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
                )}
                <button  className="button-submit" type="submit">
                    {signedInEmail ? "Book Event" : "Book Now"}
                </button>
                {error && <p className="error-message">{error}</p>}
              </form>
            )}

        </div>
  );
};

export default BookEvent;