import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";

type EventPayload = Record<string, unknown>;

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

async function parseEventPayload(req: NextRequest): Promise<EventPayload> {
    const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("application/json")) {
        const body = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new Error("Invalid JSON payload. Expected a JSON object.");
        }

        return body as EventPayload;
    }

    if (
        contentType.includes("multipart/form-data") ||
        contentType.includes("application/x-www-form-urlencoded")
    ) {
        const formData = await req.formData();
        return Object.fromEntries(formData.entries());
    }

    throw new Error(
        "Unsupported content type. Use application/json or multipart/form-data."
    );
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const payload = await parseEventPayload(req);
        payload.agenda = parseListField(payload.agenda);
        payload.tags = parseListField(payload.tags);

        const createdEvent = await Event.create(payload);
        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 }
        );
    } catch (e) {
        console.error(e);

        const errorMessage = e instanceof Error ? e.message : "unknown";
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
            /invalid json payload|unsupported content type/i.test(errorMessage)
                ? 400
                : 500;

        return NextResponse.json(
            { message: "Event creation failed", error: errorMessage },
            { status }
        );
    }
}
