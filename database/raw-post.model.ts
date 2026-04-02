import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export interface IRawPost {
  fingerprint: string;
  sourceChannelId: string;
  sourceChannelTitle?: string;
  sourceChannelUsername?: string;
  telegramMessageId: number;
  messageDate: Date | null;
  text: string;
  imageUrl?: string;
  mediaType: string;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

type RawPostDocument = HydratedDocument<IRawPost>;
type RawPostModelType = Model<IRawPost>;

const rawPostSchema = new Schema<IRawPost, RawPostModelType>(
  {
    fingerprint: { type: String, required: true, unique: true, trim: true },
    sourceChannelId: { type: String, required: true, trim: true },
    sourceChannelTitle: { type: String, trim: true },
    sourceChannelUsername: { type: String, trim: true },
    telegramMessageId: { type: Number, required: true },
    messageDate: { type: Date, default: null },
    text: { type: String, required: true, default: "" },
    imageUrl: { type: String, trim: true },
    mediaType: { type: String, required: true, default: "none" },
    rawPayload: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

rawPostSchema.pre("validate", function preValidateRawPost(this: RawPostDocument) {
  this.fingerprint = this.fingerprint.trim();
  this.sourceChannelId = this.sourceChannelId.trim();
  this.text = this.text.trim();

  if (this.sourceChannelUsername) {
    this.sourceChannelUsername = this.sourceChannelUsername.trim().replace(/^@/, "");
  }

  if (this.sourceChannelTitle) {
    this.sourceChannelTitle = this.sourceChannelTitle.trim();
  }
});

export const RawPost =
  (mongoose.models.RawPost as RawPostModelType | undefined) ??
  mongoose.model<IRawPost, RawPostModelType>("RawPost", rawPostSchema, "raw_posts");
