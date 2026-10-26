"use client";

import ChessBoard from "../../components/chess-board/ChessBoard.jsx";
import useChessGame from "./useChessGame.js";
import GameControls from "./GameControls.jsx";
import MoveHistory from "./MoveHistory.jsx";
import FenPanel from "./FenPanel.jsx";

export default function ChessGame() {
  const game = useChessGame();
  return (
    <main className="app-shell">
      <header className="topbar"><a className="brand" href="/"><span className="brand-mark">♞</span><span>3D Chess<span className="brand-dot">.</span></span></a><div className="topbar-right"><a className="multiplayer-nav" href="/multiplayer">ONLINE PLAY ↗</a><span className="live-dot" /> LOCAL GAME <span className="version-pill">v1.1.0</span></div></header>
      <section className="intro"><div className="eyebrow"><span /> A CLASSIC, REIMAGINED</div><h1>Think ahead.<br /><em>See in 3D.</em></h1><p>A tactile chess experience, rendered in three dimensions. Make your move, read the board, and let strategy take shape.</p></section>
      <section className="workspace">
        <ChessBoard position={game.position} selected={game.selected} targets={game.targets} orientation={game.orientation} onSquareClick={game.selectSquare} status={game.status} />
        <aside className="side-panel">
          <GameControls status={game.status} message={game.message} onNewGame={game.newGame} onUndo={game.undo} onFlip={game.flip} canUndo={game.history.length > 0} />
          <MoveHistory history={game.history} />
          <FenPanel fen={game.position} />
          <div className="panel-note"><span>✳</span> Promotions default to queen. No account or network connection required.</div>
        </aside>
      </section>
      <footer className="site-footer"><span>BUILT FOR THE LOVE OF THE GAME</span><span>3D CHESS <b>♞</b></span></footer>
    </main>
  );
}