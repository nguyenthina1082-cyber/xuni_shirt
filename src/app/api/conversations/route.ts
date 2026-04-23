import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: { message: "未登录" } }, { status: 401 });
    }

    let userId: number;
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      userId = parsed.userId;
    } catch {
      return NextResponse.json({ success: false, error: { message: "无效的 token" } }, { status: 401 });
    }

    const conversations = await sql`
      SELECT id, title, created_at, updated_at
      FROM conversations
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "获取对话列表失败" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: { message: "未登录" } }, { status: 401 });
    }

    let userId: number;
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      userId = parsed.userId;
    } catch {
      return NextResponse.json({ success: false, error: { message: "无效的 token" } }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    const conversations = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${title || "新对话"})
      RETURNING id, title, created_at, updated_at
    `;

    return NextResponse.json({ success: true, data: conversations[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "创建对话失败" } },
      { status: 500 }
    );
  }
}
