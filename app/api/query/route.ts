// /api/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aggregateResponse } from "@/lib/aggregator";
import { auth } from "@clerk/nextjs/server";
import { checkIfUserBanned } from "@/lib/checkIfUserBanned";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context } = body;
    const { userId } = await auth();
      if(!userId) return NextResponse.json({ error: "Action not allwoed" }, { status: 400 });
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then(res => res.json());
  
      const user = {
        userId: clerkUser.id,
        firstName: clerkUser.first_name || "",
        lastName: clerkUser.last_name || "",
        email: clerkUser.email_addresses[0]?.email_address || "",
      };
        console.log(user)
        const banStatus = await checkIfUserBanned(userId);

    if (banStatus.isBanned) {
      return NextResponse.json(
        { error: banStatus.message },
        { status: 403 } // Forbidden
      );
    }

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' in request body." },
        { status: 400 }
      );
    }

    const result = await aggregateResponse(query, context || "",user);
    console.log(result)


    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Query Route Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: handle other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ error: "GET not supported. Use POST." }, { status: 405 });
}
