import { NextResponse } from "next/server";
import { fetchRoom, getSeat, hashSeatToken, newSeatToken, publicRoom, broadcastRoom } from "../../../../../lib/multiplayer/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const found = await fetchRoom(body.roomId);
    if (found.error) return NextResponse.json({ error: found.error }, { status: found.status });
    const { supabase, row } = found;
    if (body.seatToken && getSeat(row, body.seatToken)) {
      return NextResponse.json({ room: publicRoom(row), seatToken: body.seatToken, color: getSeat(row, body.seatToken) });
    }
    if (row.status !== "waiting" || row.black_token_hash) {
      return NextResponse.json({ error: "This room already has two players or has finished." }, { status: 409 });
    }
    const seatToken = newSeatToken();
    const { data, error } = await supabase.from("chess_rooms")
      .update({ black_token_hash: hashSeatToken(seatToken), status: "playing", updated_at: new Date().toISOString() })
      .eq("id", row.id).is("black_token_hash", null).eq("status", "waiting")
      .select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Another player just joined. Try joining again." }, { status: 409 });
    const room = publicRoom(data);
    await broadcastRoom(supabase, room);
    return NextResponse.json({ room, seatToken, color: "b" });
  } catch (error) {
    console.error("Join multiplayer room failed:", error);
    return NextResponse.json({ error: error.message || "Could not join this room." }, { status: 500 });
  }
}