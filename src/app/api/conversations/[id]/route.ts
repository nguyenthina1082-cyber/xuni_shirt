import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const conversationId = parseInt(id);

    const conversations = await sql`
      SELECT id, title, created_at, updated_at
      FROM conversations
      WHERE id = ${conversationId} AND user_id = ${userId}
    `;

    if (conversations.length === 0) {
      return NextResponse.json({ success: false, error: { message: "对话不存在" } }, { status: 404 });
    }

    const messages = await sql`
      SELECT id, role, content, image_urls, created_at
      FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      data: {
        conversation: conversations[0],
        messages: messages.map((msg) => ({
          ...msg,
          imageUrls: msg.image_urls || [],
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "获取对话失败" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const conversationId = parseInt(id);
    const body = await request.json();
    const { title } = body;

    const result = await sql`
      UPDATE conversations
      SET title = ${title}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${conversationId} AND user_id = ${userId}
      RETURNING id, title, created_at, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: { message: "对话不存在" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "更新对话失败" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const conversationId = parseInt(id);

    const result = await sql`
      DELETE FROM conversations
      WHERE id = ${conversationId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: { message: "对话不存在" } }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "删除对话失败" } },
      { status: 500 }
    );
  }
}
