export const FILES = "abcdefgh";

export function getGameStatus(chess) {
  if (chess.isCheckmate()) return `Checkmate — ${chess.turn() === "w" ? "Black" : "White"} wins`;
  if (chess.isStalemate()) return "Draw — stalemate";
  if (chess.isThreefoldRepetition()) return "Draw — threefold repetition";
  if (chess.isInsufficientMaterial()) return "Draw — insufficient material";
  if (chess.isDraw()) return "Draw";
  return `${chess.turn() === "w" ? "White" : "Black"} to move${chess.isCheck() ? " · Check" : ""}`;
}

export function getMoveRows(history) {
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({ number: i / 2 + 1, white: history[i]?.san ?? "—", black: history[i + 1]?.san ?? "" });
  }
  return rows;
}
