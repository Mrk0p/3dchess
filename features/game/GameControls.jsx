"use client";

export default function GameControls({ status, message, onNewGame, onUndo, onFlip, canUndo }) {
  return (
    <section className="panel-section current-turn">
      <div className="section-label">GAME STATUS</div>
      <div className="turn-title">{status}</div>
      <p>{message}</p>
      <div className="button-row"><button className="primary-button" onClick={onNewGame}>New game <span>↗</span></button><button className="secondary-button" onClick={onUndo} disabled={!canUndo}>Undo <span>↶</span></button></div>
      <button className="text-button" onClick={onFlip}>↻ Flip board orientation</button>
    </section>
  );
}
