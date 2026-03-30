import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import {
    v2 as cloudinary,
    type UploadApiErrorResponse,
    type UploadApiResponse,
} from "cloudinary";
import { Event } from "@/database/event.model";

type EventPayload = Record<string, unknown>;

interface ParsedEventPayload {
    payload: EventPayload;
    formData?: FormData;
}

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

const ALLOWED_FIELDS = new Set(REQUIRED_FIELDS);

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

function getRequiredString(payload: EventPayload, fieldName: keyof CreateEventInput): string {
    const value = payload[fieldName];
    if (typeof value !== "string") {
        throw new Error(`Invalid payload: \"${fieldName}\" must be a string.`);
    }

    const normalized = value.trim();
    if (!normalized) {
        throw new Error(`Invalid payload: \"${fieldName}\" is required.`);
    }

    return normalized;
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

async function parseEventPayload(req: NextRequest): Promise<ParsedEventPayload> {
    const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("application/json")) {
        const body = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new Error("Invalid JSON payload. Expected a JSON object.");
        }

        return { payload: body as EventPayload };
    }

    if (
        contentType.includes("multipart/form-data") ||
        contentType.includes("application/x-www-form-urlencoded")
    ) {
        const formData = await req.formData();
        return {
            payload: Object.fromEntries(formData.entries()),
            formData,
        };
    }

    throw new Error(
        "Unsupported content type. Use application/json or multipart/form-data."
    );
}

function normalizeEventPayload(payload: EventPayload): CreateEventInput {
    const unsupportedFields = Object.keys(payload).filter(
        (field) => !ALLOWED_FIELDS.has(field as (typeof REQUIRED_FIELDS)[number])
    );
    if (unsupportedFields.length > 0) {
        throw new Error(`Unsupported fields: ${unsupportedFields.join(", ")}.`);
    }

    const missingFields = REQUIRED_FIELDS.filter((field) => payload[field] === undefined);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}.`);
    }

    const title = getRequiredString(payload, "title");
    const slug = slugifyTitle(title);
    if (!slug) {
        throw new Error("Invalid payload: title could not be converted to a slug.");
    }

    const agenda = parseListField(payload.agenda);
    if (agenda.length === 0) {
        throw new Error("Invalid payload: \"agenda\" must contain at least one item.");
    }

    const tags = parseListField(payload.tags);
    if (tags.length === 0) {
        throw new Error("Invalid payload: \"tags\" must contain at least one item.");
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
        agenda,
        organizer: getRequiredString(payload, "organizer"),
        tags,
    };
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { payload, formData } = await parseEventPayload(req);

        if (formData) {
            const imageField = formData.get("image");
            if (imageField instanceof File) {
                if (imageField.size === 0) {
                    return NextResponse.json(
                        { message: "Event creation failed", error: "Image file is empty." },
                        { status: 400 }
                    );
                }

                const arrayBuffer = await imageField.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            { resource_type: "image", folder: "techvent" },
                            (
                                error: UploadApiErrorResponse | undefined,
                                result: UploadApiResponse | undefined
                            ) => {
                                if (error) {
                                    reject(error);
                                } else if (result) {
                                    resolve(result);
                                } else {
                                    reject(new Error("Image upload failed."));
                                }
                            }
                        )
                        .end(buffer);
                });

                payload.image = uploadResult.secure_url;
            } else if (typeof imageField === "string" && imageField.trim()) {
                payload.image = imageField.trim();
            } else if (typeof payload.image !== "string") {
                return NextResponse.json(
                    {
                        message: "Event creation failed",
                        error: "Image is required. Send an image file in form-data or an image URL string.",
                    },
                    { status: 400 }
                );
            }
        }

        const normalizedPayload = normalizeEventPayload(payload);

        const createdEvent = await Event.create(normalizedPayload);
        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 }
        );
    } catch (e) {
        console.error(e);

        const errorMessage = e instanceof Error ? e.message : "unknown";
        const duplicateSlugError =
            typeof e === "object" &&
            e !== null &&
            "code" in e &&
            (e as { code?: number }).code === 11000;

        if (duplicateSlugError) {
            return NextResponse.json(
                { message: "Event creation failed", error: "An event with this title already exists." },
                { status: 409 }
            );
        }

        if (/querySrv\s+ECONNREFUSED/i.test(errorMessage)) {
            return NextResponse.json(
                {
                    message: "Database connection failed",
                    error:
                        "DNS SRV lookup to MongoDB Atlas was refused. Verify network DNS access or use the non-SRV MongoDB URI in MONGODB_URI.",
                },
                { status: 503 }
            );
        }

        const status =
            /invalid payload|missing required fields|unsupported fields|invalid json payload|unsupported content type/i.test(errorMessage)
                ? 400
                : 500;

        return NextResponse.json(
            { message: "Event creation failed", error: errorMessage },
            { status }
        );
    }
}


export async function GET() {
    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({message: "Events retrieved successfully", events }, { status: 200 });
      }
    catch (e) {
        console.error(e);
        return NextResponse.json({message: "Failed to connect to database", error: e instanceof Error ? e.message : "unknown"}, {status: 500});
    }
}

