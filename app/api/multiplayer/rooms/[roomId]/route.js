import { NextResponse } from "next/server";
import { fetchRoom, publicRoom } from "../../../../../lib/multiplayer/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { roomId } = await params;
    const found = await fetchRoom(roomId);
    if (found.error) return NextResponse.json({ error: found.error }, { status: found.status });
    return NextResponse.json({ room: publicRoom(found.row) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Read multiplayer room failed:", error);
    return NextResponse.json({ error: "Could not load this room." }, { status: 500 });
  }
}