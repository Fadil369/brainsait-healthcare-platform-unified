import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-static';
export const revalidate = 0;
import { autoReply } from "@/lib/SecurityAutoResponder";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = autoReply(payload);
    // Do not log body content; only minimal metadata if needed.
    return NextResponse.json(
      {
        ok: true,
        severity: result.severity,
        slaHours: result.slaHours,
        initialReply: result.initialReply,
        followUps: result.followUps,
        escalate: result.escalate,
      },
      { status: 200 },
    );
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
}

