import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

const REQUIRED_STRING_FIELDS = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "date",
  "time",
  "mode",
  "audience",
  "organizer",
] as const;

function ensureNonEmpty(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`"${fieldName}" is required and cannot be empty.`);
  }

  return normalized;
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeDateToIso(input: string): string {
  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: "${input}".`);
  }

  return parsed.toISOString();
}

function normalizeTime(input: string): string {
  const value = input.trim();
  const twelveHourMatch = value.match(/^(\d{1,2}):([0-5]\d)\s*([AaPp][Mm])$/);

  if (twelveHourMatch) {
    const hourValue = Number.parseInt(twelveHourMatch[1], 10);
    const minute = twelveHourMatch[2];
    const period = twelveHourMatch[3].toUpperCase();

    if (hourValue < 1 || hourValue > 12) {
      throw new Error(`Invalid time value: "${input}".`);
    }

    let hour24 = hourValue % 12;
    if (period === "PM") {
      hour24 += 12;
    }

    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  }

  const twentyFourHourMatch = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHourMatch) {
    const hour = Number.parseInt(twentyFourHourMatch[1], 10);
    const minute = twentyFourHourMatch[2];
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  throw new Error(`Invalid time value: "${input}". Use HH:mm or h:mm AM/PM.`);
}

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type EventDocument = HydratedDocument<IEvent>;

type EventModelType = Model<IEvent>;

const eventSchema = new Schema<IEvent, EventModelType>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true, default: [] },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, default: [] },
  },
  {
    timestamps: true,
    strict: true,
  }
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function preSaveNormalizeEvent(this: EventDocument) {
  for (const fieldName of REQUIRED_STRING_FIELDS) {
    const value = ensureNonEmpty(this[fieldName], fieldName);
    this[fieldName] = value;
  }

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error('"agenda" is required and must contain at least one item.');
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error('"tags" is required and must contain at least one item.');
  }

  this.agenda = this.agenda.map((item, index) =>
    ensureNonEmpty(item, `agenda[${index}]`)
  );
  this.tags = this.tags.map((item, index) =>
    ensureNonEmpty(item, `tags[${index}]`)
  );

  // Regenerate slug only when title changes to keep stable URLs.
  if (this.isModified("title")) {
    this.slug = slugifyTitle(this.title);
    if (!this.slug) {
      throw new Error("Unable to generate slug from title.");
    }
  }

  // Persist date as ISO string and time as consistent 24-hour HH:mm.
  if (this.isModified("date")) {
    this.date = normalizeDateToIso(this.date);
  }
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

export const Event =
  (mongoose.models.Event as EventModelType | undefined) ??
  mongoose.model<IEvent, EventModelType>("Event", eventSchema);

