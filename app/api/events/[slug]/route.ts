import { NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

interface EventRouteParams {
  slug: string;
}

interface ErrorResponseBody {
  message: string;
  error: string;
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fall through to comma-separated parsing.
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeEventArrays<T extends { agenda?: unknown; tags?: unknown }>(event: T) {
  return {
    ...event,
    agenda: parseListField(event.agenda),
    tags: parseListField(event.tags),
  };
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function buildErrorResponse(
  message: string,
  error: string,
  status: number
): NextResponse<ErrorResponseBody> {
  return NextResponse.json({ message, error }, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<EventRouteParams> }
) {
  try {
    const { slug: rawSlug } = await context.params;

    if (typeof rawSlug !== "string") {
      return buildErrorResponse(
        "Failed to fetch event",
        "Route parameter 'slug' must be a string.",
        400
      );
    }

    const slug = rawSlug.trim().toLowerCase();
    if (!slug) {
      return buildErrorResponse(
        "Failed to fetch event",
        "Route parameter 'slug' is required.",
        400
      );
    }

    // Restrict slug format to predictable URL-safe tokens.
    if (!isValidSlug(slug)) {
      return buildErrorResponse(
        "Failed to fetch event",
        "Route parameter 'slug' has an invalid format.",
        400
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug }).select("-__v").lean();
    if (!event) {
      return buildErrorResponse(
        "Event not found",
        `No event exists for slug '${slug}'.`,
        404
      );
    }

    const normalizedEvent = normalizeEventArrays(event);

    return NextResponse.json(
      { message: "Event retrieved successfully", event: normalizedEvent },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error.";

    if (/querySrv\s+ECONNREFUSED/i.test(errorMessage)) {
      return buildErrorResponse(
        "Database connection failed",
        "DNS SRV lookup to MongoDB Atlas was refused. Verify DNS/network access or use a non-SRV MongoDB URI.",
        503
      );
    }

    return buildErrorResponse(
      "Failed to fetch event",
      "An unexpected error occurred while fetching the event.",
      500
    );
  }
}
