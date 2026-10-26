"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import ChessBoard from "../../components/chess-board/ChessBoard.jsx";
import { getSupabaseBrowser } from "../../lib/multiplayer/supabase-browser.js";
import "./multiplayer.css";

const seatKey = (roomId) => `chess-seat:${roomId}`;

export default function MultiplayerGame() {
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [seatToken, setSeatToken] = useState("");
  const [color, setColor] = useState(null);
  const [room, setRoom] = useState(null);
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [orientation, setOrientation] = useState("w");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Create a room or join a friend's room to play online.");
  const [error, setError] = useState("");

  const chess = useMemo(() => {
    try { return new Chess(room?.fen); } catch { return new Chess(); }
  }, [room?.fen]);
  const status = useMemo(() => {
    if (!room) return "Not connected";
    if (room.status === "waiting") return "Waiting for opponent";
    if (room.status === "finished") return room.result || "Game finished";
    const turn = chess.turn() === "w" ? "White" : "Black";
    return `${turn} to move${chess.isCheck() ? " · Check" : ""}`;
  }, [room, chess]);
  const myTurn = !!room && room.status === "playing" && chess.turn() === color && !chess.isGameOver();
  const history = room?.moves ?? [];

  const acceptRoom = useCallback((payload, token, assignedColor) => {
    setRoom(payload);
    setRoomId(payload.roomId);
    setRoomInput(payload.roomId);
    setSeatToken(token);
    setColor(assignedColor);
    setSelected(null);
    setTargets([]);
    setOrientation(assignedColor || "w");
    setError("");
    setMessage(assignedColor === "w" ? "You are White. Share the room ID with your opponent." : "You are Black. White moves first.");
    if (typeof window !== "undefined") {
      if (token) window.sessionStorage.setItem(seatKey(payload.roomId), token);
      const url = new URL(window.location.href);
      url.searchParams.set("roomId", payload.roomId);
      window.history.replaceState({}, "", url);
    }
  }, []);

  const loadRoom = useCallback(async (id, token) => {
    const response = await fetch(`/api/multiplayer/rooms/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load room.");
    if (!token) throw new Error("This room is open. Join it to claim the second seat.");
    const joined = await fetch("/api/multiplayer/rooms/join", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id, seatToken: token }),
    });
    const joinData = await joined.json();
    if (!joined.ok) throw new Error(joinData.error || "Could not restore your player session.");
    acceptRoom(joinData.room, joinData.seatToken, joinData.color);
  }, [acceptRoom]);

  const createRoom = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/multiplayer/rooms", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create room.");
      acceptRoom(data.room, data.seatToken, data.color);
    } catch (e) { setError(e.message || "Could not create room."); }
    finally { setBusy(false); }
  }, [acceptRoom]);

  const joinRoom = useCallback(async (idValue) => {
    const id = idValue.trim();
    if (!id) { setError("Enter a room ID first."); return; }
    setBusy(true); setError("");
    try {
      const token = typeof window !== "undefined" ? window.sessionStorage.getItem(seatKey(id)) : null;
      const response = await fetch("/api/multiplayer/rooms/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, ...(token ? { seatToken: token } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not join room.");
      acceptRoom(data.room, data.seatToken, data.color);
    } catch (e) { setError(e.message || "Could not join room."); }
    finally { setBusy(false); }
  }, [acceptRoom]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRoom = params.get("roomId");
    if (requestedRoom) {
      setRoomInput(requestedRoom);
      const token = window.sessionStorage.getItem(seatKey(requestedRoom));
      if (token) loadRoom(requestedRoom, token).catch((e) => setError(e.message));
      else joinRoom(requestedRoom);
    }
  }, [joinRoom, loadRoom]);

  useEffect(() => {
    if (!roomId || !room) return;
    const client = getSupabaseBrowser();
    if (!client) {
      setError("Realtime is not configured yet. Add the Supabase URL and anon key, then refresh.");
      return;
    }
    const channel = client.channel(`chess-room:${roomId}`)
      .on("broadcast", { event: "room_state" }, ({ payload }) => {
        if (payload?.roomId !== roomId) return;
        setRoom(payload);
        setSelected(null);
        setTargets([]);
        setMessage(payload.status === "finished" ? (payload.result || "Game finished") : "Board synchronized with your opponent.");
      })
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [roomId, !!room]);

  const selectSquare = useCallback((square) => {
    if (!room || !myTurn || busy) return;
    if (selected && targets.includes(square)) {
      const legal = chess.moves({ square: selected, verbose: true }).find((move) => move.to === square);
      if (!legal) return;
      const promotion = legal.promotion ? "q" : undefined;
      setBusy(true); setError("");
      fetch(`/api/multiplayer/rooms/${roomId}/move`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatToken, move: { from: selected, to: square, ...(promotion ? { promotion } : {}) } }),
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Move was rejected.");
        setRoom(data.room);
        setMessage(`You played ${data.san}.`);
      }).catch((e) => setError(e.message || "Could not submit move."))
        .finally(() => setBusy(false));
      setSelected(null); setTargets([]);
      return;
    }
    const piece = chess.get(square);
    if (piece && piece.color === color) {
      setSelected(square);
      setTargets(chess.moves({ square, verbose: true }).map((move) => move.to));
    } else {
      setSelected(null); setTargets([]);
    }
  }, [room, myTurn, busy, selected, targets, chess, roomId, seatToken, color]);

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/multiplayer?roomId=${roomId}`);
      setMessage("Invite link copied. Send it to your opponent.");
    } catch { setMessage(`Share this room ID: ${roomId}`); }
  };

  const rows = [];
  for (let i = 0; i < history.length; i += 2) rows.push({ number: i / 2 + 1, white: history[i], black: history[i + 1] });

  return (
    <main className="app-shell multiplayer-shell">
      <header className="topbar">
        <Link className="brand" href="/"><span className="brand-mark">♞</span><span>3D Chess<span className="brand-dot">.</span></span></Link>
        <div className="topbar-right"><span className="live-dot" /> ONLINE PLAY <span className="version-pill">MULTIPLAYER</span></div>
      </header>
      <section className="intro multiplayer-intro">
        <div className="eyebrow"><span /> PLAY FROM ANYWHERE</div>
        <h1>Two minds.<br /><em>One board.</em></h1>
        <p>Create a private room, invite a friend, and play on the same synchronized 3D chessboard from different devices.</p>
      </section>
      <section className="multiplayer-lobby">
        <div className="lobby-actions">
          <button className="primary-button" onClick={createRoom} disabled={busy}>{busy ? "Please wait…" : "Create a room ↗"}</button>
          <div className="join-form">
            <input aria-label="Room ID" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} placeholder="Paste room ID" />
            <button className="secondary-button" onClick={() => joinRoom(roomInput)} disabled={busy}>Join room</button>
          </div>
        </div>
        {room && <div className="room-meta">
          <span><small>ROOM ID</small><strong>{roomId}</strong></span>
          <span><small>YOUR SIDE</small><strong>{color === "w" ? "White ♔" : "Black ♚"}</strong></span>
          <button className="text-button" onClick={copyInvite}>Copy invite link ↗</button>
        </div>}
        {error && <p className="multiplayer-error" role="alert">{error}</p>}
      </section>
      <section className="workspace multiplayer-workspace">
        <ChessBoard position={room?.fen || new Chess().fen()} selected={selected} targets={targets} orientation={orientation} onSquareClick={selectSquare} status={status} />
        <aside className="side-panel">
          <section className="panel-section current-turn">
            <div className="section-label">ONLINE GAME</div>
            <div className="turn-title">{status}</div>
            <p>{room ? (room.status === "waiting" ? "Waiting for your friend to join. Share the invite link." : myTurn ? "Your turn. Select a piece and a highlighted destination." : room.status === "finished" ? (room.result || "The game is over.") : "Your opponent is thinking…") : message}</p>
            {room && <div className="button-row"><button className="primary-button" onClick={copyInvite}>Invite opponent ↗</button><button className="secondary-button" onClick={() => { setRoom(null); setRoomId(""); setSeatToken(""); setColor(null); setMessage("Create a room or join a friend's room to play online."); setError(""); window.history.replaceState({}, "", "/multiplayer"); }}>Leave room</button></div>}
            <p className="multiplayer-message">{message}</p>
          </section>
          <section className="panel-section move-section">
            <div className="section-heading"><span className="section-label">MOVE HISTORY</span><span className="move-count">{history.length} PLIES</span></div>
            <div className="move-list">{rows.length ? rows.map((row) => <div className="move-row" key={row.number}><span className="move-number">{row.number}.</span><span className="move-white">{row.white ? `${row.white.from}–${row.white.to}` : ""}</span><span className="move-black">{row.black ? `${row.black.from}–${row.black.to}` : ""}</span></div>) : <div className="empty-state"><span>♟</span><strong>No moves yet</strong><small>White starts the game.</small></div>}</div>
          </section>
          <section className="panel-section fen-section"><div className="section-label">CURRENT POSITION</div><code>{room?.fen || new Chess().fen()}</code></section>
          <div className="panel-note"><span>✳</span> Moves are validated on the server. Keep this tab open while playing.</div>
        </aside>
      </section>
      <footer className="site-footer"><span>BUILT FOR THE LOVE OF THE GAME</span><span><Link href="/">LOCAL PLAY</Link> · 3D CHESS <b>♞</b></span></footer>
    </main>
  );
}