// app/api/content/route.ts
// POST /api/content — run the full 4-stage content pipeline

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkIfUserBanned } from "@/lib/checkIfUserBanned";
import { runContentPipeline } from "@/lib/contentPipeline";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banStatus = await checkIfUserBanned(userId);
    if (banStatus.isBanned) {
      return NextResponse.json({ error: banStatus.message }, { status: 403 });
    }

    const body = await req.json();
    const { brief, contentType, targetMarket, targetLanguage, channels, knowledgeBase } = body;

    if (!brief || typeof brief !== "string") {
      return NextResponse.json({ error: "Missing required field: brief" }, { status: 400 });
    }
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json({ error: "At least one channel required" }, { status: 400 });
    }

    const result = await runContentPipeline({
      brief,
      contentType: contentType || "Blog Post",
      targetMarket: targetMarket || "Global",
      targetLanguage: targetLanguage || "English",
      channels,
      knowledgeBase: knowledgeBase || "",
      userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Content pipeline error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
