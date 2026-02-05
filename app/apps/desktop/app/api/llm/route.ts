import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "unavailable",
    message: "LLM runner not wired yet",
  });
}
