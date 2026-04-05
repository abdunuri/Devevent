import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { PendingEvent } from "@/database/pending-event.model";
import { auth } from "@/auth";
import { isOwnerAdminEmail } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Rejection failed", error: "You must be signed in." },
        { status: 401 }
      );
    }

    if (!isOwnerAdminEmail(session.user.email)) {
      return NextResponse.json(
        {
          message: "Rejection failed",
          error: "Only the owner admin account can reject events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Rejection failed", error: "Invalid pending event id." },
        { status: 400 }
      );
    }

    const pendingEvent = await PendingEvent.findById(id);
    if (!pendingEvent) {
      return NextResponse.json(
        { message: "Rejection failed", error: "Pending event not found." },
        { status: 404 }
      );
    }

    if (pendingEvent.status !== "pending") {
      return NextResponse.json(
        {
          message: "Rejection failed",
          error: `Pending event is already marked as '${pendingEvent.status}'.`,
        },
        { status: 409 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { reviewNotes?: string };

    pendingEvent.status = "rejected";
    pendingEvent.reviewedAt = new Date();
    if (typeof body.reviewNotes === "string" && body.reviewNotes.trim()) {
      pendingEvent.reviewNotes = body.reviewNotes.trim();
    }
    await pendingEvent.save();

    return NextResponse.json(
      {
        message: "Pending event rejected successfully.",
        pendingEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Rejection failed", error: message },
      { status: 500 }
    );
  }
}
