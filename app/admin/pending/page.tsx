"use client";

import { useEffect, useMemo, useState } from "react";

interface PendingEventItem {
  _id: string;
  title: string;
  description: string;
  image?: string;
  source: string;
  eventDate: string | null;
  originalMessage: string;
  status: "pending" | "approved" | "rejected";
}

interface ApprovalForm {
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  organizer: string;
  tags: string;
  agenda: string;
}

const initialForm: ApprovalForm = {
  title: "",
  description: "",
  overview: "",
  image: "",
  venue: "",
  location: "",
  date: "",
  time: "",
  mode: "",
  audience: "",
  organizer: "",
  tags: "",
  agenda: "",
};

function toInputDate(value: string | null): string {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function buildInitialForm(event: PendingEventItem): ApprovalForm {
  return {
    title: event.title,
    description: event.description,
    overview: event.description,
    image: event.image ?? "",
    venue: "",
    location: "",
    date: toInputDate(event.eventDate),
    time: "",
    mode: "",
    audience: "",
    organizer: event.source,
    tags: "",
    agenda: event.description,
  };
}

export default function AdminPendingPage() {
  const [pendingEvents, setPendingEvents] = useState<PendingEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ApprovalForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activeEvent = useMemo(
    () => pendingEvents.find((item) => item._id === activeEditId) ?? null,
    [pendingEvents, activeEditId]
  );

  async function fetchPendingEvents() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/pending?status=pending", {
        headers: { Accept: "application/json" },
      });

      const result = (await response.json()) as {
        pendingEvents?: PendingEventItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load pending events.");
      }

      setPendingEvents(Array.isArray(result.pendingEvents) ? result.pendingEvents : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unknown error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  function startEdit(event: PendingEventItem) {
    setActiveEditId(event._id);
    setForm(buildInitialForm(event));
    setActionMessage(null);
    setError(null);
  }

  function closeEdit() {
    setActiveEditId(null);
    setForm(initialForm);
  }

  function updateForm<K extends keyof ApprovalForm>(key: K, value: ApprovalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function rejectEvent(id: string) {
    setIsSubmitting(true);
    setActionMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pending/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ reviewNotes: "Rejected from admin pending dashboard." }),
      });

      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to reject pending event.");
      }

      setActionMessage(result.message ?? "Pending event rejected.");
      setPendingEvents((prev) => prev.filter((item) => item._id !== id));
      if (activeEditId === id) {
        closeEdit();
      }
    } catch (rejectError) {
      const message = rejectError instanceof Error ? rejectError.message : "Unknown error.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function approveEvent() {
    if (!activeEvent) {
      return;
    }

    setIsSubmitting(true);
    setActionMessage(null);
    setError(null);

    const agenda = form.agenda
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const tags = form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/admin/pending/${activeEvent._id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          event: {
            title: form.title,
            description: form.description,
            overview: form.overview,
            image: form.image,
            venue: form.venue,
            location: form.location,
            date: form.date,
            time: form.time,
            mode: form.mode,
            audience: form.audience,
            organizer: form.organizer,
            agenda,
            tags,
          },
          reviewNotes: "Approved from admin pending dashboard.",
        }),
      });

      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to approve pending event.");
      }

      setActionMessage(result.message ?? "Pending event approved and published.");
      setPendingEvents((prev) => prev.filter((item) => item._id !== activeEvent._id));
      closeEdit();
    } catch (approveError) {
      const message = approveError instanceof Error ? approveError.message : "Unknown error.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-6" id="admin-pending">
      <div className="rounded-2xl border border-dark-200 bg-dark-100/80 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin Review</p>
        <h1 className="mt-2">Pending Events</h1>
        <p className="mt-3 max-w-3xl text-sm text-light-200">
          This page is the manual gate between Telegram ingestion and public visibility. Nothing
          is published to frontend until you approve it.
        </p>
      </div>

      {actionMessage ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          {actionMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-dark-200 bg-dark-100/60 p-6 text-light-200">
          Loading pending events...
        </div>
      ) : null}

      {!isLoading && pendingEvents.length === 0 ? (
        <div className="rounded-xl border border-dark-200 bg-dark-100/60 p-6 text-light-200">
          No pending events right now.
        </div>
      ) : null}

      {!isLoading && pendingEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pendingEvents.map((event) => (
            <article
              key={event._id}
              className="rounded-xl border border-dark-200 bg-dark-100/70 p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-light-100">{event.title}</h2>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {event.status}
                </span>
              </div>

              <p className="mb-3 text-sm text-light-200">{event.description}</p>

              {event.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.image}
                  alt={event.title}
                  className="mb-3 h-44 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-3 flex h-44 items-center justify-center rounded-lg border border-dashed border-dark-200 text-sm text-light-200">
                  No image on this Telegram message
                </div>
              )}

              <p className="text-xs text-light-200">Source: {event.source}</p>

              <details className="mt-3 rounded-md bg-dark-200/40 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-light-100">
                  Original Message
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-light-200">
                  {event.originalMessage}
                </p>
              </details>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(event)}
                  disabled={isSubmitting}
                  className="rounded-md border border-blue/50 bg-blue/10 px-3 py-2 text-sm font-semibold text-blue disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(event)}
                  disabled={isSubmitting}
                  className="rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void rejectEvent(event._id)}
                  disabled={isSubmitting}
                  className="rounded-md border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {activeEvent ? (
        <section className="rounded-xl border border-dark-200 bg-dark-100/80 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Edit Before Approve</h2>
            <button
              type="button"
              onClick={closeEdit}
              disabled={isSubmitting}
              className="rounded-md border border-dark-200 px-3 py-2 text-sm text-light-200 disabled:opacity-60"
            >
              Close
            </button>
          </div>

          <p className="mb-4 text-sm text-light-200">
            Fill required public event fields manually. This keeps pending extraction simple now
            and leaves room for future AI enrichment.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Image URL"
              value={form.image}
              onChange={(event) => updateForm("image", event.target.value)}
            />
            <textarea
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2 md:col-span-2"
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
            />
            <textarea
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2 md:col-span-2"
              rows={4}
              placeholder="Overview"
              value={form.overview}
              onChange={(event) => updateForm("overview", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Venue"
              value={form.venue}
              onChange={(event) => updateForm("venue", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Location"
              value={form.location}
              onChange={(event) => updateForm("location", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              type="date"
              value={form.date}
              onChange={(event) => updateForm("date", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              type="time"
              value={form.time}
              onChange={(event) => updateForm("time", event.target.value)}
            />
            <select
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              value={form.mode}
              onChange={(event) => updateForm("mode", event.target.value)}
            >
              <option value="">Select mode</option>
              <option value="online">Online</option>
              <option value="in-person">In-person</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Audience"
              value={form.audience}
              onChange={(event) => updateForm("audience", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Organizer"
              value={form.organizer}
              onChange={(event) => updateForm("organizer", event.target.value)}
            />
            <input
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(event) => updateForm("tags", event.target.value)}
            />
            <textarea
              className="rounded-md border border-dark-200 bg-dark-200/80 px-3 py-2 md:col-span-2"
              rows={4}
              placeholder="Agenda (one item per line)"
              value={form.agenda}
              onChange={(event) => updateForm("agenda", event.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void approveEvent()}
              disabled={isSubmitting}
              className="rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Approving..." : "Approve and Publish"}
            </button>
            <button
              type="button"
              onClick={() => void rejectEvent(activeEvent._id)}
              disabled={isSubmitting}
              className="rounded-md border border-red-400/60 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
