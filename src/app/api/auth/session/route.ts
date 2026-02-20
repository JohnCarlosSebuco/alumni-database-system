import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Verify the token and get the decoded claims
    const decoded = await admin.auth().verifyIdToken(idToken);
    const role = (decoded.role as string) ?? "alumni";

    // Create a Firebase session cookie (valid 5 days)
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });

    const res = NextResponse.json({ status: "ok" });
    const cookieOpts = {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    res.cookies.set("__session", sessionCookie, cookieOpts);
    res.cookies.set("__role", role, { ...cookieOpts, httpOnly: false });
    return res;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
