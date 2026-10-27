import { NextResponse } from "next/server";
import { fetchRoom, getSeat, replayRoom, publicRoom, broadcastRoom } from "../../../../../../lib/multiplayer/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const found = await fetchRoom(roomId);
    if (found.error) return NextResponse.json({ error: found.error }, { status: found.status });
    const { supabase, row } = found;
    const color = getSeat(row, body.seatToken);
    if (!color) return NextResponse.json({ error: "Your player session is invalid. Rejoin the room." }, { status: 401 });
    if (row.status !== "playing") return NextResponse.json({ error: "This game is not accepting moves." }, { status: 409 });
    let chess;
    try { chess = replayRoom(row); } catch { return NextResponse.json({ error: "Stored game state is invalid." }, { status: 500 }); }
    if (chess.turn() !== color) return NextResponse.json({ error: "It is not your turn." }, { status: 403 });
    const { from, to, promotion } = body.move ?? {};
    if (typeof from !== "string" || typeof to !== "string") return NextResponse.json({ error: "A source and destination square are required." }, { status: 400 });
    let move;
    try { move = chess.move({ from, to, ...(promotion ? { promotion } : {}) }); }
    catch { move = null; }
    if (!move) return NextResponse.json({ error: "That is not a legal chess move." }, { status: 422 });
    const moves = [...(row.moves ?? []), { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) }];
    const finished = chess.isGameOver();
    const result = chess.isCheckmate() ? (color === "w" ? "White wins by checkmate" : "Black wins by checkmate")
      : chess.isStalemate() || chess.isDraw() ? "Draw" : null;
    const nextStatus = finished ? "finished" : "playing";
    const { data, error } = await supabase.from("chess_rooms").update({
      fen: chess.fen(), moves, status: nextStatus, result, updated_at: new Date().toISOString(),
    }).eq("id", row.id).eq("fen", row.fen).eq("updated_at", row.updated_at).eq("status", "playing").select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "The board changed in another session. Refresh the room and try again." }, { status: 409 });
    const room = publicRoom(data);
    await broadcastRoom(supabase, room);
    return NextResponse.json({ room, san: move.san });
  } catch (error) {
    console.error("Submit multiplayer move failed:", error);
    return NextResponse.json({ error: error.message || "Could not submit the move." }, { status: 500 });
  }
}