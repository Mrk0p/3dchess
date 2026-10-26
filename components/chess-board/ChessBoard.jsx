"use client";

import { useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { createChessScene } from "./createChessScene.js";

export default function ChessBoard({ position, selected, targets, orientation, onSquareClick, status }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const clickRef = useRef(onSquareClick);
  const chessRef = useRef(new Chess(position));
  clickRef.current = onSquareClick;
  useEffect(() => {
    if (!mountRef.current) return;
    const api = createChessScene(mountRef.current, (square) => clickRef.current(square));
    sceneRef.current = api;
    return () => { api.dispose(); sceneRef.current = null; };
  }, []);
  useEffect(() => {
    chessRef.current = new Chess(position);
    sceneRef.current?.renderPosition(chessRef.current, selected, targets, orientation);
  }, [position, selected, targets, orientation]);
  return (
    <div className="board-card">
      <div className="board-toolbar">
        <div className="player-label"><span className={`player-icon ${status.startsWith("White") ? "active" : ""}`}>♔</span><div><strong>White</strong><small>Ivory pieces</small></div></div>
        <div className="board-toolbar-center"><span className="status-dot" />{status}</div>
        <div className="player-label"><span className="player-icon black-icon">♚</span><div><strong>Black</strong><small>Onyx pieces</small></div></div>
      </div>
      <div className="three-canvas" ref={mountRef} aria-label="Interactive 3D chessboard" />
      <div className="board-footer"><span><kbd>DRAG</kbd> ORBIT VIEW</span><span><kbd>SCROLL</kbd> ZOOM</span><span>LEGAL MOVES ONLY</span></div>
    </div>
  );
}
