"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventFormState = {
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
  agendas: string[];
};

const initialFormState: EventFormState = {
  title: "",
  description: "",
  overview: "",
  image: "",
  venue: "",
  location: "",
  date: "",
  time: "",
  mode: "In-person",
  audience: "",
  organizer: "",
  tags: "web, backend, startup",
  agendas: [""],
};

const CreateEventPage = () => {
  const [form, setForm] = useState<EventFormState>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const agendaPreview = useMemo(
    () => form.agendas.map((item) => item.trim()).filter(Boolean),
    [form.agendas]
  );

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFieldChange = <K extends keyof Omit<EventFormState, "agendas">>(
    key: K,
    value: EventFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAgendaChange = (index: number, value: string) => {
    setForm((prev) => {
      const nextAgendas = [...prev.agendas];
      nextAgendas[index] = value;
      return { ...prev, agendas: nextAgendas };
    });
  };

  const addAgendaRow = () => {
    setForm((prev) => ({ ...prev, agendas: [...prev.agendas, ""] }));
  };

  const removeAgendaRow = (index: number) => {
    setForm((prev) => {
      if (prev.agendas.length === 1) return prev;
      return { ...prev, agendas: prev.agendas.filter((_, i) => i !== index) };
    });
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setImageFile(nextFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalizedAgendas = form.agendas.map((item) => item.trim()).filter(Boolean);
    if (normalizedAgendas.length === 0) {
      setErrorMessage("Please add at least one agenda item.");
      return;
    }

    const normalizedImageUrl = form.image.trim();
    if (!imageFile && !normalizedImageUrl) {
      setErrorMessage("Please provide an image URL or upload an image file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        overview: form.overview.trim(),
        image: normalizedImageUrl,
        venue: form.venue.trim(),
        location: form.location.trim(),
        date: form.date,
        time: form.time,
        mode: form.mode.trim(),
        audience: form.audience.trim(),
        organizer: form.organizer.trim(),
        tags: form.tags,
        // API accepts arrays, JSON-array strings, or comma-separated strings.
        agenda: JSON.stringify(normalizedAgendas),
      };

      const response = imageFile
        ? await (async () => {
            const formData = new FormData();
            for (const [key, value] of Object.entries(payload)) {
              formData.append(key, value);
            }
            formData.set("image", imageFile);

            return fetch("/api/events", {
              method: "POST",
              body: formData,
            });
          })()
        : await fetch("/api/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(result.error ?? "Failed to create event. Please try again.");
        return;
      }

      setSuccessMessage(result.message ?? "Event created successfully.");
      setForm(initialFormState);
      setImageFile(null);
    } catch {
      setErrorMessage("Network error while creating event. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="create-event" className="mx-auto w-full max-w-6xl">
      <div className="create-shell">
        <div className="create-hero">
          <p className="eyebrow">Create Event</p>
          <h1>Publish Your Next Tech Event</h1>
          <p className="hero-copy">
          Fill out every detail, add agenda rows dynamically, and submit directly to the events API.
          You can upload an image file (Cloudinary) or provide an image URL.
          </p>
          <div className="hero-notes">
            <span>Image: file upload or URL</span>
            <span>Tags: comma separated</span>
            <span>Agenda: add rows dynamically</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" value={form.title} onChange={(e) => handleFieldChange("title", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="organizer">Organizer</label>
              <input id="organizer" value={form.organizer} onChange={(e) => handleFieldChange("organizer", e.target.value)} required />
            </div>
            <div className="field field-wide">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows={3} value={form.description} onChange={(e) => handleFieldChange("description", e.target.value)} required />
            </div>
            <div className="field field-wide">
              <label htmlFor="overview">Overview</label>
              <textarea id="overview" rows={4} value={form.overview} onChange={(e) => handleFieldChange("overview", e.target.value)} required />
            </div>
            <div className="field field-wide">
              <label htmlFor="image">Image URL (optional if file uploaded)</label>
              <input id="image" type="url" value={form.image} onChange={(e) => handleFieldChange("image", e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="field field-wide">
              <label htmlFor="imageFile">Upload Image File (optional)</label>
              <input id="imageFile" type="file" accept="image/*" onChange={handleImageFileChange} />
            </div>
            <div className="field">
              <label htmlFor="venue">Venue</label>
              <input id="venue" value={form.venue} onChange={(e) => handleFieldChange("venue", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input id="location" value={form.location} onChange={(e) => handleFieldChange("location", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={form.date} onChange={(e) => handleFieldChange("date", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input id="time" type="time" value={form.time} onChange={(e) => handleFieldChange("time", e.target.value)} required />
            </div>
            <div className="field">
                {/* make mode dropdown */}
              <label htmlFor="mode">Mode</label>
              <select id="mode" value={form.mode} onChange={(e) => handleFieldChange("mode", e.target.value)} required>
                <option value="">Select Mode</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="audience">Audience</label>
              <input id="audience" value={form.audience} onChange={(e) => handleFieldChange("audience", e.target.value)} required />
            </div>
            <div className="field field-wide">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input id="tags" value={form.tags} onChange={(e) => handleFieldChange("tags", e.target.value)} required />
            </div>
          </div>

          <div className="image-preview" style={{ backgroundImage: `url(${imagePreviewUrl || form.image || ""})` }}>
            <div className="overlay">{imageFile ? `Poster Preview (${imageFile.name})` : "Poster Preview"}</div>
          </div>

          <div className="agenda-card">
            <div className="agenda-header">
              <div>
                <h2>Agenda Items</h2>
                <p>
                Add one agenda per row. The form submits agenda as a JSON array string.
                </p>
              </div>
              <button type="button" onClick={addAgendaRow} className="agenda-add-btn">
                Add Agenda
              </button>
            </div>

            <div className="agenda-list">
              {form.agendas.map((agenda, index) => (
                <div key={`agenda-${index}`} className="agenda-row">
                  <input
                    value={agenda}
                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                    placeholder={`Agenda item ${index + 1}`}
                    required={index === 0}
                  />
                  <button
                    type="button"
                    onClick={() => removeAgendaRow(index)}
                    className="agenda-remove-btn"
                    disabled={form.agendas.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* <div className="agenda-preview">
              <p>Agenda Preview (JSON)</p>
              <code>{JSON.stringify(agendaPreview)}</code>
            </div> */}
          </div>

          {errorMessage && <p className="create-error">{errorMessage}</p>}

          {successMessage && <p className="create-success">{successMessage}</p>}

          <button
            type="submit"
            className="create-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Event..." : "Add Event"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateEventPage;