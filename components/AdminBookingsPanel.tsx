"use client";

import { useEffect, useState } from "react";

type BookingGroup = {
  eventId: string;
  slug: string;
  eventTitle: string;
  totalBookings: number;
  emails: string[];
};

export default function AdminBookingsPanel() {
  const [groups, setGroups] = useState<BookingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  async function loadGroups() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/bookings", {
        headers: { Accept: "application/json" },
      });

      const result = (await response.json()) as {
        bookingGroups?: BookingGroup[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load booking analytics.");
      }

      setGroups(Array.isArray(result.bookingGroups) ? result.bookingGroups : []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unknown error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGroups();
  }, []);

  async function exportGroup(group: BookingGroup) {
    const key = `${group.eventId}:${group.slug}`;
    setExportingKey(key);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin/bookings/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ eventId: group.eventId, slug: group.slug }),
      });

      const result = (await response.json()) as {
        message?: string;
        warning?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to export booking report.");
      }

      setStatusMessage(result.warning ?? result.message ?? "Booking report export completed.");
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : "Unknown error.";
      setError(message);
    } finally {
      setExportingKey(null);
    }
  }

  return (
    <section className="rounded-2xl border border-dark-200 bg-dark-100/80 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Booked Users Tracker</h2>
          <p className="text-sm text-light-200">
            View bookings grouped by event and export each event&apos;s attendee emails to Telegram.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadGroups()}
          disabled={isLoading}
          className="rounded-md border border-dark-200 px-3 py-2 text-sm text-light-100 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {statusMessage ? (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          {statusMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-dark-200 bg-dark-100/60 p-4 text-sm text-light-200">
          Loading booking groups...
        </div>
      ) : null}

      {!isLoading && groups.length === 0 ? (
        <div className="rounded-lg border border-dark-200 bg-dark-100/60 p-4 text-sm text-light-200">
          No bookings yet.
        </div>
      ) : null}

      {!isLoading && groups.length > 0 ? (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const key = `${group.eventId}:${group.slug}`;
            const isExporting = exportingKey === key;

            return (
              <article key={key} className="rounded-lg border border-dark-200 bg-dark-100/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-light-100">{group.eventTitle}</h3>
                    <p className="text-xs text-light-200">/{group.slug}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {group.totalBookings} booking{group.totalBookings === 1 ? "" : "s"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void exportGroup(group)}
                      disabled={isExporting}
                      className="rounded-md border border-blue/50 bg-blue/10 px-3 py-2 text-sm font-semibold text-blue disabled:opacity-60"
                    >
                      {isExporting ? "Exporting..." : "Export + Send to TG"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 max-h-36 overflow-auto rounded-md border border-dark-200 bg-dark-200/30 p-3 text-sm text-light-100">
                  <ul className="list-none space-y-1">
                    {group.emails.map((email) => (
                      <li key={`${key}:${email}`}>{email}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
