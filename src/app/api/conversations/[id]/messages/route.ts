import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { uploadBase64ImageToR2 } from "@/lib/r2";

export async function POST(
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
      SELECT id FROM conversations
      WHERE id = ${conversationId} AND user_id = ${userId}
    `;

    if (conversations.length === 0) {
      return NextResponse.json({ success: false, error: { message: "对话不存在" } }, { status: 404 });
    }

    const body = await request.json();
    const { role, content, imageUrls } = body;

    if (!role || !["user", "assistant"].includes(role)) {
      return NextResponse.json({ success: false, error: { message: "无效的角色" } }, { status: 400 });
    }

    if (!content && (!imageUrls || imageUrls.length === 0)) {
      return NextResponse.json({ success: false, error: { message: "消息内容不能为空" } }, { status: 400 });
    }

    const uploadedImageUrls: string[] = [];
    if (imageUrls && imageUrls.length > 0) {
      for (const img of imageUrls) {
        if (img.startsWith("data:")) {
          try {
            const r2Url = await uploadBase64ImageToR2(img, "user-uploads");
            uploadedImageUrls.push(r2Url);
          } catch (uploadError) {
            console.error("上传用户图片到 R2 失败:", uploadError);
            uploadedImageUrls.push(img);
          }
        } else {
          uploadedImageUrls.push(img);
        }
      }
    }

    const result = await sql`
      INSERT INTO messages (conversation_id, role, content, image_urls)
      VALUES (${conversationId}, ${role}, ${content}, ${uploadedImageUrls.length > 0 ? uploadedImageUrls : null})
      RETURNING id, role, content, image_urls, created_at
    `;

    await sql`
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${conversationId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        ...result[0],
        imageUrls: result[0].image_urls || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "发送消息失败" } },
      { status: 500 }
    );
  }
}
