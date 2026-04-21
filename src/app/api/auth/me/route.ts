import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    let userId: number;
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      userId = parsed.userId;
    } catch {
      return NextResponse.json({ success: false, user: null });
    }

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ success: false, user: null });
    }

    const users = await sql`
      SELECT id, email, created_at FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (error) {
    console.error("[me API] Error:", error);
    return NextResponse.json({ success: false, user: null });
  }
}
