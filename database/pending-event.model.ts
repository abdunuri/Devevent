import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export type PendingEventStatus = "pending" | "approved" | "rejected";

export interface IPendingEvent {
  rawPostId: mongoose.Types.ObjectId;
  fingerprint: string;
  sourceChannelId: string;
  source: string;
  telegramMessageId: number;
  title: string;
  description: string;
  image?: string;
  eventDate: string | null;
  originalMessage: string;
  status: PendingEventStatus;
  approvedEventId?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type PendingEventDocument = HydratedDocument<IPendingEvent>;
type PendingEventModelType = Model<IPendingEvent>;

const pendingEventSchema = new Schema<IPendingEvent, PendingEventModelType>(
  {
    rawPostId: {
      type: Schema.Types.ObjectId,
      ref: "RawPost",
      required: true,
      index: true,
      unique: true,
    },
    fingerprint: { type: String, required: true, unique: true, trim: true },
    sourceChannelId: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    telegramMessageId: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    eventDate: { type: String, default: null },
    originalMessage: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },
    approvedEventId: { type: Schema.Types.ObjectId, ref: "Event" },
    reviewNotes: { type: String, trim: true },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
  }
);

pendingEventSchema.pre("validate", function preValidatePendingEvent(this: PendingEventDocument) {
  this.fingerprint = this.fingerprint.trim();
  this.sourceChannelId = this.sourceChannelId.trim();
  this.source = this.source.trim();
  this.title = this.title.trim();
  this.description = this.description.trim();
  this.originalMessage = this.originalMessage.trim();

  if (this.image) {
    this.image = this.image.trim();
  }

  if (this.eventDate !== null) {
    const normalized = this.eventDate.trim();
    this.eventDate = normalized || null;
  }

  if (this.reviewNotes) {
    this.reviewNotes = this.reviewNotes.trim();
  }
});

export const PendingEvent =
  (mongoose.models.PendingEvent as PendingEventModelType | undefined) ??
  mongoose.model<IPendingEvent, PendingEventModelType>(
    "PendingEvent",
    pendingEventSchema,
    "pending_events"
  );
