import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );
  const data = await response.json();
  return data.success;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, turnstileToken } = body;

    if (!email || !password || !turnstileToken) {
      return NextResponse.json(
        { success: false, error: { message: "缺少必要参数" } },
        { status: 400 }
      );
    }

    const isValidTurnstile = await verifyTurnstile(turnstileToken);
    if (!isValidTurnstile) {
      return NextResponse.json(
        { success: false, error: { message: "人机验证失败" } },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "邮箱或密码错误" } },
        { status: 401 }
      );
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: { message: "邮箱或密码错误" } },
        { status: 401 }
      );
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: "服务器错误，请重试" } },
      { status: 500 }
    );
  }
}
