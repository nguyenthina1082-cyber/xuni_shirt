import { NextResponse } from "next/server";

export async function GET() {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/github/callback`;

  const state = Math.random().toString(36).substring(2);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", githubClientId!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "user:email");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
