import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { PendingEvent } from "@/database/pending-event.model";

const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected"]);

function getStatusParam(request: NextRequest): string {
  const status = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();
  if (!status || !ALLOWED_STATUSES.has(status)) {
    return "pending";
  }

  return status;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const status = getStatusParam(request);

    const pendingEvents = await PendingEvent.find({ status })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        message: "Pending events fetched successfully",
        status,
        count: pendingEvents.length,
        pendingEvents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        message: "Failed to fetch pending events",
        error: message,
      },
      { status: 500 }
    );
  }
}
