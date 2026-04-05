import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import { isOwnerAdminEmail } from "@/lib/admin-auth";
import { Booking } from "@/database/booking.model";
import { Event } from "@/database/event.model";

function toCsvSafe(value: string): string {
  const normalized = value.replaceAll('"', '""');
  return `"${normalized}"`;
}

function buildCsv(eventTitle: string, eventSlug: string, emails: string[]): string {
  const lines = ["event_title,event_slug,email"];

  for (const email of emails) {
    lines.push(
      [toCsvSafe(eventTitle), toCsvSafe(eventSlug), toCsvSafe(email)].join(",")
    );
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized", error: "You must be signed in." },
        { status: 401 }
      );
    }

    if (!isOwnerAdminEmail(session.user.email)) {
      return NextResponse.json(
        {
          message: "Forbidden",
          error: "Only the owner admin account can export booking files.",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { eventId?: string; slug?: string };
    const eventId = body?.eventId?.trim() ?? "";
    const slug = body?.slug?.trim().toLowerCase() ?? "";

    if (!eventId || !slug) {
      return NextResponse.json(
        {
          message: "Export failed",
          error: "Both eventId and slug are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(eventId).select("title slug").lean();
    if (!event) {
      return NextResponse.json(
        { message: "Export failed", error: "Event not found." },
        { status: 404 }
      );
    }

    const bookings = await Booking.find({ eventId, slug }).sort({ createdAt: 1 }).lean();
    if (bookings.length === 0) {
      return NextResponse.json(
        { message: "Export failed", error: "No bookings found for this event." },
        { status: 404 }
      );
    }

    const emails = Array.from(new Set(bookings.map((item) => item.email))).sort((a, b) =>
      a.localeCompare(b)
    );
    const eventTitle = String(event.title ?? slug);
    const csv = buildCsv(eventTitle, slug, emails);

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const notifyChatId = process.env.APPROVAL_NOTIFY_CHAT_ID?.trim();

    if (!botToken || !notifyChatId) {
      return NextResponse.json(
        {
          message: "Export generated",
          warning:
            "CSV generated, but Telegram is not configured. Set TELEGRAM_BOT_TOKEN and APPROVAL_NOTIFY_CHAT_ID.",
          fileName: `${slug}-bookings.csv`,
          csv,
        },
        { status: 200 }
      );
    }

    const formData = new FormData();
    formData.set("chat_id", notifyChatId);
    formData.set(
      "caption",
      `Booking export for ${eventTitle} (${slug})\nTotal unique emails: ${emails.length}`
    );
    formData.set(
      "document",
      new Blob([csv], { type: "text/csv" }),
      `${slug}-bookings.csv`
    );

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    const telegramPayload = (await telegramResponse.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
    };

    if (!telegramResponse.ok || telegramPayload.ok === false) {
      return NextResponse.json(
        {
          message: "Export failed",
          error:
            telegramPayload.description ??
            "Telegram sendDocument failed while sending booking export.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: "Booking export sent to Telegram successfully.",
        fileName: `${slug}-bookings.csv`,
        totalEmails: emails.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Export failed", error: message },
      { status: 500 }
    );
  }
}
