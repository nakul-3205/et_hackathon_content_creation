// app/api/content/approve/route.ts
// POST /api/content/approve — human-in-the-loop approval gate

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/connectToDB";
import ContentJob from "@/models/ContentJob";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, approved, notes } = await req.json();
    if (!jobId || typeof approved !== "boolean") {
      return NextResponse.json({ error: "Missing jobId or approved flag" }, { status: 400 });
    }

    await connectToDB();

    // Fetch user info from Clerk for the audit trail
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then((r) => r.json());

    const approverName =
      `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || userId;

    const update = {
      "approvalGate.approved": approved,
      "approvalGate.approvedBy": approverName,
      "approvalGate.approvedAt": new Date().toISOString(),
      "approvalGate.notes": notes || null,
      // If approved, flip publisher stage from awaiting_approval → done
      ...(approved ? { "stages.publisher.status": "done" } : { "stages.publisher.status": "pending" }),
    };

    const job = await ContentJob.findOneAndUpdate({ jobId }, { $set: update }, { new: true });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      jobId,
      approved,
      approvedBy: approverName,
      approvedAt: update["approvalGate.approvedAt"],
      publisherStatus: update["stages.publisher.status"],
    });
  } catch (err) {
    console.error("Approval error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
