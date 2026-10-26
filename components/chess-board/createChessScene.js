import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const FILES = "abcdefgh";
const SYMBOLS = { wk:"♔", wq:"♕", wr:"♖", wb:"♗", wn:"♘", wp:"♙", bk:"♚", bq:"♛", br:"♜", bb:"♝", bn:"♞", bp:"♟" };
const worldPosition = (square) => ({ x: FILES.indexOf(square[0]) - 3.5, z: 3.5 - (Number(square[1]) - 1) });

function makePiece(piece, square) {
  const group = new THREE.Group();
  const white = piece.color === "w";
  const body = new THREE.MeshStandardMaterial({ color: white ? "#eee3cb" : "#252b36", roughness: .35, metalness: .12 });
  const accent = new THREE.MeshStandardMaterial({ color: white ? "#bba16f" : "#778598", roughness: .3, metalness: .3 });
  const add = (geometry, material, y, x = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.userData.square = square; group.add(mesh);
  };
  add(new THREE.CylinderGeometry(.31, .36, .12, 24), accent, .07);
  add(new THREE.CylinderGeometry(.24, .31, .13, 24), body, .17);
  if (piece.type === "p") { add(new THREE.CylinderGeometry(.17,.23,.22,20),body,.32); add(new THREE.SphereGeometry(.17,20,16),body,.51); }
  else if (piece.type === "r") { add(new THREE.CylinderGeometry(.21,.27,.42,20),body,.4); add(new THREE.CylinderGeometry(.29,.29,.12,20),accent,.66); for(let i=0;i<4;i++){const a=i*Math.PI/2;add(new THREE.BoxGeometry(.12,.12,.12),body,.75,Math.cos(a)*.2,Math.sin(a)*.2);} }
  else if (piece.type === "n") { add(new THREE.CylinderGeometry(.2,.27,.28,20),body,.34); const head=new THREE.Mesh(new THREE.ConeGeometry(.23,.46,4),body); head.position.y=.65; head.rotation.z=-.22; head.rotation.y=Math.PI/4; head.userData.square=square; head.castShadow=true; group.add(head); }
  else if (piece.type === "b") { add(new THREE.CylinderGeometry(.2,.27,.3,20),body,.35); add(new THREE.SphereGeometry(.19,20,16),body,.61); add(new THREE.ConeGeometry(.1,.18,16),accent,.81); }
  else { add(new THREE.CylinderGeometry(.21,.28,.31,20),body,.36); add(new THREE.SphereGeometry(.19,20,16),body,.62); add(new THREE.ConeGeometry(.11,.21,20),accent,.83); if(piece.type==="q") for(let i=0;i<5;i++){const a=i*2*Math.PI/5;add(new THREE.SphereGeometry(.045,10,8),accent,.91,Math.cos(a)*.17,Math.sin(a)*.17);} else {add(new THREE.BoxGeometry(.08,.34,.08),accent,.92);add(new THREE.BoxGeometry(.26,.08,.08),accent,.92);} }
  const p = worldPosition(square); group.position.set(p.x, 0, p.z); group.userData.square = square;
  return group;
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }
}

export function createChessScene(mount, onSquareClick) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#11151d");
  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, .1, 100);
  camera.position.set(7.8, 9.5, 10.8);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xe5edff, 0x33313a, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffe5bd, 3.2); keyLight.position.set(4, 10, 5); keyLight.castShadow = true; scene.add(keyLight);
  const boardGroup = new THREE.Group(), pieceGroup = new THREE.Group(), highlightGroup = new THREE.Group();
  scene.add(boardGroup, pieceGroup, highlightGroup);
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.25, .28, 8.25), new THREE.MeshStandardMaterial({ color: "#343a45", roughness: .45, metalness: .18 }));
  base.position.y = -.19; base.receiveShadow = true; boardGroup.add(base);
  const squareMeshes = [];
  for (let rank = 1; rank <= 8; rank++) for (let file = 0; file < 8; file++) {
    const square = `${FILES[file]}${rank}`;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.99, .08, .99), new THREE.MeshStandardMaterial({ color: (file + rank) % 2 ? "#aeb8c8" : "#444e60", roughness: .8 }));
    const p = worldPosition(square); mesh.position.set(p.x, -.02, p.z); mesh.receiveShadow = true; mesh.userData.square = square;
    boardGroup.add(mesh); squareMeshes.push(mesh);
  }
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .07; controls.minDistance = 7; controls.maxDistance = 19; controls.maxPolarAngle = Math.PI / 2.05; controls.target.set(0, 0, 0);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const handleClick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([boardGroup, pieceGroup], true);
    const hit = hits.find((item) => item.object.userData.square || item.object.parent?.userData.square);
    const square = hit?.object.userData.square || hit?.object.parent?.userData.square;
    if (square) onSquareClick(square);
  };
  renderer.domElement.addEventListener("pointerup", handleClick);
  let frame;
  const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
  animate();
  const resizeObserver = new ResizeObserver(() => {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight);
  });
  resizeObserver.observe(mount);
  return {
    renderPosition(chess, selected, targets, orientation) {
      clearGroup(pieceGroup); clearGroup(highlightGroup);
      const rotation = orientation === "b" ? Math.PI : 0; boardGroup.rotation.y = rotation; pieceGroup.rotation.y = rotation; highlightGroup.rotation.y = rotation;
      for (const square of targets) {
        const p = worldPosition(square);
        const marker = new THREE.Mesh(new THREE.RingGeometry(.19,.28,28), new THREE.MeshBasicMaterial({ color: "#d4f17d", side: THREE.DoubleSide }));
        marker.rotation.x = -Math.PI / 2; marker.position.set(p.x, .035, p.z); marker.userData.square = square; highlightGroup.add(marker);
      }
      if (selected) {
        const p = worldPosition(selected);
        const marker = new THREE.Mesh(new THREE.PlaneGeometry(.96,.96), new THREE.MeshBasicMaterial({ color: "#d4f17d", transparent: true, opacity: .32, side: THREE.DoubleSide }));
        marker.rotation.x = -Math.PI / 2; marker.position.set(p.x,.032,p.z); marker.userData.square=selected; highlightGroup.add(marker);
      }
      const board = chess.board();
      for (let rank = 0; rank < 8; rank++) for (let file = 0; file < 8; file++) {
        const piece = board[rank][file]; if (!piece) continue;
        const square = `${FILES[file]}${8-rank}`;
        const group = makePiece(piece, square); pieceGroup.add(group);
        const glyph = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlyphTexture(SYMBOLS[piece.color + piece.type], piece.color), transparent: true }));
        glyph.position.set(0,.55,0); glyph.scale.set(.5,.5,1); glyph.userData.square=square; group.add(glyph);
      }
    },
    dispose() {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); controls.dispose(); renderer.domElement.removeEventListener("pointerup",handleClick);
      clearGroup(pieceGroup); clearGroup(highlightGroup); clearGroup(boardGroup); renderer.dispose(); renderer.domElement.remove();
    }
  };
}

function makeGlyphTexture(symbol, color) {
  const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
  const context = canvas.getContext("2d"); context.font = "100px Georgia"; context.textAlign = "center"; context.textBaseline = "middle";
  context.fillStyle = color === "w" ? "#f6edd9" : "#151922"; context.strokeStyle = color === "w" ? "#292e39" : "#d6dce5"; context.lineWidth = 2;
  context.strokeText(symbol,64,66); context.fillText(symbol,64,66);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
