import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = request.cookies.get("oauth_state")?.value;

    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const githubUser = await userResponse.json();

    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=no_email", request.url));
    }

    let users = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      users = await sql`
        INSERT INTO users (email, password_hash)
        VALUES (${email}, 'github-oauth')
        RETURNING id, email
      `;
    }

    const user = users[0];
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}
