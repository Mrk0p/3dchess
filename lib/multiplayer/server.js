import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Chess } from "chess.js";
import { getSupabaseAdmin } from "./supabase-admin.js";

export const START_FEN = new Chess().fen();
const ROOM_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newSeatToken() {
  return randomBytes(32).toString("base64url");
}
export function hashSeatToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
export function validRoomId(id) {
  return typeof id === "string" && ROOM_ID.test(id);
}
export function publicRoom(row) {
  return {
    roomId: row.id,
    fen: row.fen,
    moves: row.moves ?? [],
    status: row.status,
    result: row.result,
    updatedAt: row.updated_at,
  };
}
export function getSeat(row, token) {
  if (!row || typeof token !== "string" || token.length < 32) return null;
  const hash = hashSeatToken(token);
  if (hash === row.white_token_hash) return "w";
  if (row.black_token_hash && hash === row.black_token_hash) return "b";
  return null;
}
export function replayRoom(row) {
  const chess = new Chess();
  for (const move of row.moves ?? []) {
    const played = chess.move({ from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) });
    if (!played) throw new Error("Stored room history is invalid.");
  }
  if (chess.fen() !== row.fen) throw new Error("Stored room position does not match its move history.");
  return chess;
}
export async function fetchRoom(roomId) {
  if (!validRoomId(roomId)) return { error: "Enter a valid room ID.", status: 400 };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("chess_rooms").select("*").eq("id", roomId).maybeSingle();
  if (error) throw error;
  if (!data) return { error: "Room not found.", status: 404 };
  return { supabase, row: data };
}
export async function broadcastRoom(supabase, room) {
  const channel = supabase.channel("chess-room:" + room.roomId);
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Realtime channel timed out.")), 5000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error("Could not publish room update."));
        }
      });
    });
    const result = await channel.send({ type: "broadcast", event: "room_state", payload: room });
    if (result !== "ok") throw new Error("Could not publish room update.");
  } finally {
    await supabase.removeChannel(channel).catch(() => {});
  }
}
export function createRoomId() {
  return randomUUID();
}