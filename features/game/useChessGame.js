"use client";

import { useCallback, useRef, useState } from "react";
import { Chess } from "chess.js";
import { getGameStatus } from "./chess-utils.js";

export default function useChessGame() {
  const chessRef = useRef(new Chess());
  const [position, setPosition] = useState(chessRef.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(getGameStatus(chessRef.current));
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [message, setMessage] = useState("Select a piece, then choose a highlighted square.");
  const [orientation, setOrientation] = useState("w");

  const sync = useCallback(() => {
    const chess = chessRef.current;
    setPosition(chess.fen());
    setHistory(chess.history({ verbose: true }));
    setStatus(getGameStatus(chess));
    setSelected(null);
    setTargets([]);
  }, []);

  const selectSquare = useCallback((square) => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;
    if (selected && targets.includes(square)) {
      try {
        const move = chess.move({ from: selected, to: square, promotion: "q" });
        setMessage(move ? `${move.color === "w" ? "White" : "Black"} played ${move.san}.` : "That move is not legal.");
        sync();
      } catch {
        setMessage("That move is not legal. Choose a highlighted square.");
        setSelected(null);
        setTargets([]);
      }
      return;
    }
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelected(square);
      setTargets(chess.moves({ square, verbose: true }).map((move) => move.to));
      setMessage(`Selected ${piece.color === "w" ? "White" : "Black"} ${piece.type.toUpperCase()} on ${square}.`);
      return;
    }
    setSelected(null);
    setTargets([]);
    setMessage("Select one of your pieces to see its legal moves.");
  }, [selected, targets, sync]);

  const undo = useCallback(() => {
    if (!chessRef.current.undo()) return;
    setMessage("Last move undone.");
    sync();
  }, [sync]);

  const newGame = useCallback(() => {
    chessRef.current = new Chess();
    setMessage("New game started. White moves first.");
    sync();
  }, [sync]);

  const flip = useCallback(() => setOrientation((current) => current === "w" ? "b" : "w"), []);

  return { position, history, status, selected, targets, message, orientation, selectSquare, undo, newGame, flip };
}
