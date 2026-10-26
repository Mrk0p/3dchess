import { getMoveRows } from "./chess-utils.js";

export default function MoveHistory({ history }) {
  const rows = getMoveRows(history);
  return (
    <section className="panel-section move-section">
      <div className="section-heading"><div className="section-label">MOVE HISTORY</div><span className="move-count">{history.length} PLY</span></div>
      {rows.length ? <div className="move-list">{rows.map((row) => <div className="move-row" key={row.number}><span className="move-number">{row.number}.</span><span className="move-white">{row.white}</span><span className="move-black">{row.black}</span></div>)}</div> : <div className="empty-state"><span>♘</span><strong>The board is yours.</strong><small>Make the opening move to begin.</small></div>}
    </section>
  );
}
