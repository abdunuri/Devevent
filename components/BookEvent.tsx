'use client';
import { useState } from "react";
const BookEvent = () => {
const [email, setEmail] = useState("");
const [submitted, setSubmitted] = useState(false);

const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
        setSubmitted(true);
    }, 1000);};
  return (
    <div id="book-event">
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