import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Chess } from "chess.js";

const FILES = "abcdefgh";
const SYMBOLS = { wk:"♔", wq:"♕", wr:"♖", wb:"♗", wn:"♘", wp:"♙", bk:"♚", bq:"♛", br:"♜", bb:"♝", bn:"♞", bp:"♟" };
const toWorld = (s) => ({ x: FILES.indexOf(s[0]) - 3.5, z: 3.5 - (Number(s[1]) - 1) });
const statusText = (c) => c.isCheckmate() ? `Checkmate — ${c.turn() === "w" ? "Black" : "White"} wins` : c.isStalemate() ? "Draw — stalemate" : c.isThreefoldRepetition() ? "Draw — threefold repetition" : c.isInsufficientMaterial() ? "Draw — insufficient material" : c.isDraw() ? "Draw" : `${c.turn() === "w" ? "White" : "Black"} to move${c.isCheck() ? " · Check" : ""}`;

function makePiece(piece, square) {
  const group = new THREE.Group(), white = piece.color === "w";
  const body = new THREE.MeshStandardMaterial({ color: white ? "#eee3cb" : "#252b36", roughness: .35, metalness: .12 });
  const accent = new THREE.MeshStandardMaterial({ color: white ? "#bba16f" : "#778598", roughness: .3, metalness: .3 });
  const add = (geo, mat, y, x=0, z=0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow = true; m.userData.square = square; group.add(m); };
  add(new THREE.CylinderGeometry(.31,.36,.12,24),accent,.07);
  add(new THREE.CylinderGeometry(.24,.31,.13,24),body,.17);
  if (piece.type === "p") { add(new THREE.CylinderGeometry(.17,.23,.22,20),body,.32); add(new THREE.SphereGeometry(.17,20,16),body,.51); }
  else if (piece.type === "r") { add(new THREE.CylinderGeometry(.21,.27,.42,20),body,.4); add(new THREE.CylinderGeometry(.29,.29,.12,20),accent,.66); for(let i=0;i<4;i++){const a=i*Math.PI/2;add(new THREE.BoxGeometry(.12,.12,.12),body,.75,Math.cos(a)*.2,Math.sin(a)*.2);} }
  else if (piece.type === "n") { add(new THREE.CylinderGeometry(.2,.27,.28,20),body,.34); const head = new THREE.Mesh(new THREE.ConeGeometry(.23,.46,4),body); head.position.y=.65; head.rotation.z=-.22; head.rotation.y=Math.PI/4; head.userData.square=square; head.castShadow=true; group.add(head); }
  else if (piece.type === "b") { add(new THREE.CylinderGeometry(.2,.27,.3,20),body,.35); add(new THREE.SphereGeometry(.19,20,16),body,.61); add(new THREE.ConeGeometry(.1,.18,16),accent,.81); }
  else { add(new THREE.CylinderGeometry(.21,.28,.31,20),body,.36); add(new THREE.SphereGeometry(.19,20,16),body,.62); add(new THREE.ConeGeometry(.11,.21,20),accent,.83); if(piece.type==="q") for(let i=0;i<5;i++){const a=i*2*Math.PI/5;add(new THREE.SphereGeometry(.045,10,8),accent,.91,Math.cos(a)*.17,Math.sin(a)*.17);} else {add(new THREE.BoxGeometry(.08,.34,.08),accent,.92);add(new THREE.BoxGeometry(.26,.08,.08),accent,.92);} }
  const p=toWorld(square); group.position.set(p.x,0,p.z); return group;
}

export default function App() {
  const mountRef=useRef(null), apiRef=useRef(null), chessRef=useRef(new Chess());
  const [fen,setFen]=useState(chessRef.current.fen()), [history,setHistory]=useState([]), [status,setStatus]=useState(statusText(chessRef.current));
  const [selected,setSelected]=useState(null), [targets,setTargets]=useState([]), [orientation,setOrientation]=useState("w"), [message,setMessage]=useState("Select a piece, then choose a highlighted square.");
  const sync=useCallback(()=>{const c=chessRef.current;setFen(c.fen());setHistory(c.history({verbose:true}));setStatus(statusText(c));},[]);
  useEffect(()=>{
    const mount=mountRef.current; if(!mount)return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color("#11151d");
    const camera=new THREE.PerspectiveCamera(42,mount.clientWidth/mount.clientHeight,.1,100); camera.position.set(7.8,9.5,10.8);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(mount.clientWidth,mount.clientHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15; mount.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(0,0,0); controls.maxPolarAngle=Math.PI*.48; controls.minDistance=7; controls.maxDistance=19;
    scene.add(new THREE.HemisphereLight("#dce8ff","#34303a",2.1)); const key=new THREE.DirectionalLight("#fff0d4",3.2); key.position.set(-5,11,7); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key); const rim=new THREE.PointLight("#6a9bff",24,20); rim.position.set(5,4,-5); scene.add(rim);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:"#171c25",roughness:.85})); floor.rotation.x=-Math.PI/2; floor.position.y=-.24; floor.receiveShadow=true; scene.add(floor);
    const board=new THREE.Group(); scene.add(board); const base=new THREE.Mesh(new THREE.BoxGeometry(8.35,.28,8.35),new THREE.MeshStandardMaterial({color:"#6c4935",roughness:.38,metalness:.2})); base.position.y=-.12; base.receiveShadow=true; base.castShadow=true; board.add(base);
    const squareMeshes=[];
    for(let r=1;r<=8;r++) for(let f=0;f<8;f++){const s=FILES[f]+r,p=toWorld(s),tile=new THREE.Mesh(new THREE.BoxGeometry(.99,.045,.99),new THREE.MeshStandardMaterial({color:(f+r)%2===0?"#e6d6b8":"#657c91",roughness:.62}));tile.position.set(p.x,.035,p.z);tile.userData.square=s;tile.receiveShadow=true;board.add(tile);squareMeshes.push(tile);}
    const pieces=new THREE.Group(),markers=new THREE.Group();scene.add(pieces,markers);
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(); let frame=0,disposed=false;
    const disposeGroup=(g)=>{while(g.children.length){const o=g.children.pop();if(o.parent)o.parent.remove(o);o.traverse?.(x=>{if(x.geometry)x.geometry.dispose();if(x.material){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(m=>m.dispose());}});}};
    const refresh=(c,sel,legal,flip)=>{disposeGroup(pieces);disposeGroup(markers);c.board().forEach((row,ri)=>row.forEach((pc,fi)=>{if(pc){const s=FILES[fi]+(8-ri);pieces.add(makePiece(pc,s));}}));if(sel){const p=toWorld(sel),m=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.025,32),new THREE.MeshBasicMaterial({color:"#d4f17d",transparent:true,opacity:.7}));m.position.set(p.x,.075,p.z);markers.add(m);}legal.forEach(s=>{const p=toWorld(s),m=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.035,20),new THREE.MeshBasicMaterial({color:"#d4f17d",transparent:true,opacity:.9}));m.position.set(p.x,.09,p.z);markers.add(m);});};
    const onClick=(e)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...squareMeshes,...pieces.children],true);if(!hits.length)return;const s=hits.find(h=>h.object.userData.square)?.object.userData.square;if(!s)return;const c=chessRef.current;let sel=selectedRef.current;};
    const pick=(e)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...squareMeshes,...pieces.children],true);if(!hits.length)return;const s=hits.find(h=>h.object.userData.square)?.object.userData.square;if(!s)return;const c=chessRef.current;const pc=c.get(s);const chosen=selectionRef.current;if(chosen&&legalRef.current.includes(s)){try{c.move({from:chosen,to:s,promotion:"q"});selectionRef.current=null;legalRef.current=[];setSelected(null);setTargets([]);setMessage("Move played.");sync();refresh(c,null,[],"w");return;}catch{}}if(pc&&pc.color===c.turn()){selectionRef.current=s;legalRef.current=c.moves({square:s,verbose:true}).map(m=>m.to);setSelected(s);setTargets(legalRef.current);setMessage(`${pc.color==="w"?"White":"Black"} ${pc.type.toUpperCase()} selected on ${s.toUpperCase()}.`);refresh(c,s,legalRef.current,orientationRef.current);}else{selectionRef.current=null;legalRef.current=[];setSelected(null);setTargets([]);setMessage("Choose a piece belonging to the side to move.");refresh(c,null,[],"w");}};
    const selectionRef={current:null},legalRef={current:[]},orientationRef={current:orientation};
    const resize=()=>{const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    renderer.domElement.addEventListener("pointerup",pick); const observer=new ResizeObserver(resize);observer.observe(mount);
    apiRef.current={refresh:()=>refresh(chessRef.current,selectionRef.current,legalRef.current,orientationRef.current),flip:()=>{orientationRef.current=orientationRef.current==="w"?"b":"w";board.rotation.y=orientationRef.current==="w"?0:Math.PI;pieces.rotation.y=board.rotation.y;markers.rotation.y=board.rotation.y;},reset:()=>{selectionRef.current=null;legalRef.current=[];},dispose:()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener("pointerup",pick);controls.dispose();disposeGroup(pieces);disposeGroup(markers);renderer.dispose();mount.removeChild(renderer.domElement);}};
    const animate=()=>{if(disposed)return;frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();refresh(chessRef.current,null,[],"w");
    return()=>{apiRef.current?.dispose();apiRef.current=null;disposeGroup(board);floor.geometry.dispose();floor.material.dispose();scene.clear();};
  },[sync]);
  const selectionRef=useRef(null), legalRef=useRef([]);
  useEffect(()=>{selectionRef.current=selected;legalRef.current=targets;},[selected,targets]);
  const newGame=()=>{chessRef.current=new Chess();setSelected(null);setTargets([]);setMessage("New game started. White to move.");apiRef.current?.reset();apiRef.current?.refresh();sync();};
  const undo=()=>{if(chessRef.current.undo()){setSelected(null);setTargets([]);setMessage("Last move undone.");apiRef.current?.reset();apiRef.current?.refresh();sync();}};
  const flip=()=>{setOrientation(o=>o==="w"?"b":"w");apiRef.current?.flip();};
  const copyFen=async()=>{try{await navigator.clipboard.writeText(fen);setMessage("FEN copied to clipboard.");}catch{setMessage("Clipboard access is unavailable in this browser.");}};
  return <main className="app-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-mark">♞</span> 3D<span className="brand-dot">CHESS</span></a><div className="topbar-right"><span className="live-dot"/> LOCAL GAME <span className="version-pill">v1.0.1</span></div></header>
    <section className="intro"><div className="eyebrow"><span/> A CLASSIC, REIMAGINED</div><h1>Think in moves.<br/><em>See in 3D.</em></h1><p>A tactile chessboard built for the browser. Play legal moves, orbit the board, and study every position in a cinematic 3D space.</p></section>
    <section className="workspace"><div className="board-card"><div className="board-toolbar"><div className="player-label"><span className={`player-icon ${status.startsWith("White")?"active":""}`}>♔</span><div><strong>White</strong><small>Ivory pieces</small></div></div><div className="board-toolbar-center"><span className="status-dot"/>{status}</div><div className="player-label"><span className="player-icon black-icon">♚</span><div><strong>Black</strong><small>Onyx pieces</small></div></div></div><div className="three-canvas" ref={mountRef}/><div className="board-footer"><span><kbd>DRAG</kbd> ORBIT VIEW</span><span><kbd>SCROLL</kbd> ZOOM</span><span>LEGAL MOVES ONLY</span></div></div>
    <aside className="side-panel"><section className="panel-section current-turn"><div className="section-label">GAME STATUS</div><div className="turn-title">{status}</div><p>{message}</p><div className="button-row"><button className="primary-button" onClick={newGame}>New game <span>↗</span></button><button className="secondary-button" onClick={undo} disabled={!history.length}>Undo <span>↶</span></button></div><button className="text-button" onClick={flip}>↻ Flip board orientation</button></section>
    <section className="panel-section move-section"><div className="section-heading"><div className="section-label">MOVE HISTORY</div><span className="move-count">{history.length} PLY</span></div>{history.length?<div className="move-list">{Array.from({length:Math.ceil(history.length/2)},(_,i)=><div className="move-row" key={i}><span className="move-number">{i+1}.</span><span className="move-white">{history[i*2]?.san||"—"}</span><span className="move-black">{history[i*2+1]?.san||""}</span></div>)}</div>:<div className="empty-state"><span>♘</span><strong>The board is yours.</strong><small>Make the opening move to begin.</small></div>}</section>
    <section className="panel-section fen-section"><div className="section-label">POSITION · FEN</div><code>{fen}</code><button className="copy-button" onClick={copyFen}>COPY FEN ↗</button></section><div className="panel-note"><span>✳</span> Promotions default to queen. No account or network connection required.</div></aside></section>
    <footer className="site-footer"><span>BUILT FOR THE LOVE OF THE GAME</span><span>3D CHESS <b>♞</b></span></footer></main>;
}
