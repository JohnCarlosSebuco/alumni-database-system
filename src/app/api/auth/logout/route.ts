import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ status: "ok" });
  res.cookies.delete("__session");
  res.cookies.delete("__role");
  return res;
}
