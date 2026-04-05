import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { PendingEvent } from "@/database/pending-event.model";
import { Event } from "@/database/event.model";
import { auth } from "@/auth";
import { isOwnerAdminEmail } from "@/lib/admin-auth";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";

const REQUIRED_FIELDS = [
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
  "agenda",
  "organizer",
  "tags",
] as const;

type EventPayload = Record<string, unknown>;

interface CreateEventInput {
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

function getRequiredString(payload: EventPayload, key: keyof CreateEventInput): string {
  const value = payload[key];
  if (typeof value !== "string") {
    throw new Error(`Invalid payload: \"${key}\" must be a string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Invalid payload: \"${key}\" is required.`);
  }

  return normalized;
}

function parseStringList(value: unknown, key: "agenda" | "tags"): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid payload: \"${key}\" must be an array of strings.`);
  }

  const normalized = value.map((item) => String(item).trim()).filter(Boolean);
  if (normalized.length === 0) {
    throw new Error(`Invalid payload: \"${key}\" must contain at least one item.`);
  }

  return normalized;
}

function normalizeEventPayload(payload: EventPayload): CreateEventInput {
  const missingFields = REQUIRED_FIELDS.filter((field) => payload[field] === undefined);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}.`);
  }

  const title = getRequiredString(payload, "title");
  const slug = slugifyTitle(title);
  if (!slug) {
    throw new Error("Invalid payload: title could not be converted to a slug.");
  }

  return {
    title,
    slug,
    description: getRequiredString(payload, "description"),
    overview: getRequiredString(payload, "overview"),
    image: getRequiredString(payload, "image"),
    venue: getRequiredString(payload, "venue"),
    location: getRequiredString(payload, "location"),
    date: getRequiredString(payload, "date"),
    time: getRequiredString(payload, "time"),
    mode: getRequiredString(payload, "mode"),
    audience: getRequiredString(payload, "audience"),
    agenda: parseStringList(payload.agenda, "agenda"),
    organizer: getRequiredString(payload, "organizer"),
    tags: parseStringList(payload.tags, "tags"),
  };
}

function isTelegramFileUrl(url: string): boolean {
  return /^https:\/\/api\.telegram\.org\/file\/bot/i.test(url);
}

function isLikelyImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isGif =
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38;
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  return isJpeg || isPng || isGif || isWebp;
}

async function uploadImageBufferToCloudinary(buffer: Buffer): Promise<string> {
  const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "techvent/telegram" },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            reject(error);
          } else if (result?.secure_url) {
            resolve(result);
          } else {
            reject(new Error("Cloudinary upload returned no secure URL."));
          }
        }
      )
      .end(buffer);
  });

  return uploaded.secure_url;
}

async function normalizeApprovedImage(imageUrl: string): Promise<string> {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    throw new Error('Invalid payload: "image" is required.');
  }

  if (!isTelegramFileUrl(trimmed)) {
    return trimmed;
  }

  const imageResponse = await fetch(trimmed, {
    method: "GET",
    cache: "no-store",
  });

  if (!imageResponse.ok) {
    throw new Error("Failed to download Telegram image for approval.");
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = imageResponse.headers.get("content-type")?.toLowerCase() ?? "";
  const headerSaysImage = contentType.startsWith("image/");
  const bufferLooksLikeImage = isLikelyImageBuffer(buffer);

  if (!headerSaysImage && !bufferLooksLikeImage) {
    const previewText = buffer.toString("utf8", 0, Math.min(buffer.length, 180));
    throw new Error(
      `Downloaded Telegram media is not an image. content-type=${contentType || "unknown"}; preview=${previewText}`
    );
  }

  return uploadImageBufferToCloudinary(buffer);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Approval failed", error: "You must be signed in." },
        { status: 401 }
      );
    }

    if (!isOwnerAdminEmail(session.user.email)) {
      return NextResponse.json(
        {
          message: "Approval failed",
          error: "Only the owner admin account can approve events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Approval failed", error: "Invalid pending event id." },
        { status: 400 }
      );
    }

    const pendingEvent = await PendingEvent.findById(id);
    if (!pendingEvent) {
      return NextResponse.json(
        { message: "Approval failed", error: "Pending event not found." },
        { status: 404 }
      );
    }

    if (pendingEvent.status !== "pending") {
      return NextResponse.json(
        {
          message: "Approval failed",
          error: `Pending event is already marked as '${pendingEvent.status}'.`,
        },
        { status: 409 }
      );
    }

    const body = (await request.json()) as {
      event?: EventPayload;
      reviewNotes?: string;
    };

    if (!body || typeof body !== "object" || !body.event || typeof body.event !== "object") {
      return NextResponse.json(
        { message: "Approval failed", error: "Request body must contain an 'event' object." },
        { status: 400 }
      );
    }

    const normalizedEvent = normalizeEventPayload(body.event);
    normalizedEvent.image = await normalizeApprovedImage(normalizedEvent.image);
    const createdEvent = await Event.create(normalizedEvent);

    pendingEvent.status = "approved";
    pendingEvent.approvedEventId = createdEvent._id;
    pendingEvent.reviewedAt = new Date();
    if (typeof body.reviewNotes === "string" && body.reviewNotes.trim()) {
      pendingEvent.reviewNotes = body.reviewNotes.trim();
    }
    await pendingEvent.save();

    return NextResponse.json(
      {
        message: "Pending event approved and published successfully.",
        event: createdEvent,
        pendingEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    const duplicateSlugError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000;

    if (duplicateSlugError) {
      return NextResponse.json(
        {
          message: "Approval failed",
          error: "An event with this title already exists. Please change title before approving.",
        },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = /invalid payload|missing required fields|request body/i.test(message)
      ? 400
      : 500;

    return NextResponse.json(
      { message: "Approval failed", error: message },
      { status }
    );
  }
}
