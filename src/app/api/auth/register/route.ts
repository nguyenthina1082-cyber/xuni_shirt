import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, turnstileToken } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "缺少必要参数" } },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, error: { message: "请先完成人机验证" } },
          { status: 400 }
        );
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );
      const turnstileData = await response.json();
      if (!turnstileData.success) {
        return NextResponse.json(
          { success: false, error: { message: "人机验证失败" } },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { message: "邮箱格式不正确" } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: "密码至少需要 6 个字符" } },
        { status: 400 }
      );
    }

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: { message: "该邮箱已被注册" } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
    `;

    return NextResponse.json({
      success: true,
      message: "注册成功",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: { message: "服务器错误，请重试" } },
      { status: 500 }
    );
  }
}
