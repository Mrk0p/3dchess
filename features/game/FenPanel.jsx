"use client";

import { useState } from "react";

export default function FenPanel({ fen }) {
  const [copied, setCopied] = useState(false);
  async function copyFen() {
    try { await navigator.clipboard.writeText(fen); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setCopied(false); }
  }
  return <section className="panel-section fen-section"><div className="section-label">POSITION · FEN</div><code>{fen}</code><button className="copy-button" onClick={copyFen}>{copied ? "COPIED ✓" : "COPY FEN ↗"}</button></section>;
}
