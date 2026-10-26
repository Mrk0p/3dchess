import { NextResponse } from "next/server";
import { Chess } from "chess.js";
import { getSupabaseAdmin } from "../../../../lib/multiplayer/supabase-admin.js";
import { createRoomId, hashSeatToken, newSeatToken, publicRoom } from "../../../../lib/multiplayer/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    const roomId = createRoomId();
    const seatToken = newSeatToken();
    const chess = new Chess();
    const { data, error } = await supabase.from("chess_rooms").insert({
      id: roomId,
      fen: chess.fen(),
      moves: [],
      status: "waiting",
      white_token_hash: hashSeatToken(seatToken),
    }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ room: publicRoom(data), seatToken, color: "w" }, { status: 201 });
  } catch (error) {
    console.error("Create multiplayer room failed:", error);
    return NextResponse.json({ error: error.message || "Could not create a room." }, { status: 500 });
  }
}