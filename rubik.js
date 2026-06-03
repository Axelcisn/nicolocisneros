const faces = ["U", "R", "F", "D", "L", "B"];
const faceNames = {
  U: "Alto",
  R: "Destra",
  F: "Fronte",
  D: "Basso",
  L: "Sinistra",
  B: "Retro"
};
const faceColors = {
  U: "#f5d24a",
  R: "#1f66b1",
  F: "#d83a32",
  D: "#f8f8f2",
  L: "#1f8a5b",
  B: "#e97830"
};
const normals = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0]
};
const oppositeFaces = {
  U: "D",
  D: "U",
  F: "B",
  B: "F",
  R: "L",
  L: "R"
};
const moveConfigs = {
  U: { axis: "y", layer: 1, dir: 1 },
  D: { axis: "y", layer: -1, dir: -1 },
  R: { axis: "x", layer: 1, dir: 1 },
  L: { axis: "x", layer: -1, dir: -1 },
  F: { axis: "z", layer: 1, dir: -1 },
  B: { axis: "z", layer: -1, dir: 1 },
  M: { axis: "x", layer: 0, dir: -1 },
  E: { axis: "y", layer: 0, dir: -1 },
  S: { axis: "z", layer: 0, dir: -1 }
};
const viewAngles = {
  left: { x: -24, y: 90 },
  front: { x: -24, y: -28 },
  right: { x: -24, y: -90 }
};
const relativeFaceSlots = {
  U: "up",
  D: "down",
  L: "left",
  R: "right",
  F: "front",
  B: "back"
};

let cubies = [];
let moveCount = 0;
let moveHistory = [];
let timerId = null;
let startedAt = null;
let isAnimating = false;
let viewX = viewAngles.front.x;
let viewY = viewAngles.front.y;
let dragStart = null;

const cubeElement = document.querySelector("#game-cube");
const cubeView = document.querySelector(".rubik-view");
const netElement = document.querySelector("#face-net");
const moveGrid = document.querySelector("#move-grid");
const patternsPanel = document.querySelector("#patterns-panel");
const patternsList = document.querySelector("#patterns-list");
const timerElement = document.querySelector("#timer");
const moveCountElement = document.querySelector("#move-count");
const statusElement = document.querySelector("#game-status");
const sexyMoveButton = document.querySelector("#sexy-button");
const patternsButton = document.querySelector("#patterns-button");
const patternsClose = document.querySelector("#patterns-close");

const sexyMoveSequence = ["R", "U", "R'", "U'"];
const rubikPatterns = [
  {
    title: "Cube",
    image: "/patterns/cube.jpg",
    items: [
      { name: "cube2", algorithm: "F L F U' R U F2 L2 U' L' B D' B' L2 U" },
      { name: "cube2 domino", algorithm: "B D F' B' D L2 U L U' B D' R B R D' R L' F U2 D" },
      { name: "cube2 flip", algorithm: "F R' L D F2 D' F2 U' F' B' L U R2 F2 D2 L2 D B2 U" },
      { name: "Sin nombre", algorithm: "U L D R' F D2 R2 F2 R' F D2 B L2 U2 D' R2 U R2 B2 L2" },
      { name: "Glitch", algorithm: "U B L' U' L F' L' B' D U R U' B U' F U F R2 F2 D R2 B2 L2" },
      { name: "Remolino 1", algorithm: "L' B' D U R U' R' D2 R2 D L D' L' R' F U" }
    ]
  },
  {
    title: "Cube in a cube in a cube",
    image: "/patterns/cube-in-cube.jpg",
    items: [
      { name: "cube3 (F)", algorithm: "U' L' U' F' R2 B' R F U B2 U B' L U' F U R F'" },
      { name: "cube3 (F')", algorithm: "F R' U' F' U L' B U' B2 U' F' R' B R2 F U L U" },
      { name: "Ring", algorithm: "F D F' D2 L' B' U L D R U L' F' U L U2" },
      { name: "cube3 contrary", algorithm: "B' U' B' L' D B U D2 B U L D' L' U' L2 D" },
      { name: "Twin Peaks", algorithm: "U L2 B2 R2 U R2 D' U L F' U L' D B' U L B' L R' U'", image: "/patterns/twin-peaks.jpg" }
    ]
  },
  {
    title: "Corner",
    image: "/patterns/corner.jpg",
    items: [
      { name: "Corner (F)", algorithm: "(D F2 D') (R B2 R') (D F2 D') (R B2 R')" },
      { name: "Corner (F')", algorithm: "(R B2 R') (D F2 D') (R B2 R') (D F2 D')" },
      { name: "Corner diagonal contrary", algorithm: "F L' D' B' L F U F' D' F L2 B' R' U L2 D' F" },
      { name: "Corner straight contrary", algorithm: "F U2 L F L' B L U B' R' L' U R' D' F' B R2" },
      { name: "Esquina diagonal", algorithm: "F L' D F' U' B U F U' F R' F2 L U' R' D2" },
      { name: "Esquina recta", algorithm: "F B' U F U F U L B L2 B' U F' L U L' B" }
    ]
  },
  {
    title: "Ajedrez / Chess",
    image: "/patterns/chess.jpg",
    items: [
      { name: "Chess / ajedrez", algorithm: "M2 S2 E2" },
      { name: "Superflip", algorithm: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2" },
      { name: "Cruz", algorithm: "R2 L' D F2 R' D' R' L U' D R D B2 R' U D2" },
      { name: "Falda Escocés", algorithm: "U' R2 L2 F2 B2 U' R L F B' U F2 D2 R2 L2 F2 U2 F2 U' F2" },
      { name: "Cruz 2", algorithm: "U F B' L2 U2 L2 F' B U2 L2 U" },
      { name: "Ajedrez 2", algorithm: "R2 L' D F2 R' D' R' L U' D R D B2 R' U D2 (M E' M' E)" }
    ]
  },
  {
    title: "Extra",
    image: "/patterns/extra.jpg",
    items: [
      { name: "Remolino 2", algorithm: "L D B' D' R D F2 U R U F D' F' U2 F' L2 B'" },
      { name: "Excepción", algorithm: "D' B2 F2 L2 U' F2 R2 D F2 U2 L' B R' U' L' F D' F L D2" },
      { name: "Meme", algorithm: "M E' M' E" },
      { name: "4 centros", algorithm: "E S2 E' S2" }
    ]
  }
];

function createSolvedCubies() {
  const nextCubies = [];

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const stickers = {};

        if (y === 1) stickers.U = "U";
        if (y === -1) stickers.D = "D";
        if (z === 1) stickers.F = "F";
        if (z === -1) stickers.B = "B";
        if (x === 1) stickers.R = "R";
        if (x === -1) stickers.L = "L";

        nextCubies.push({ id: `${x}:${y}:${z}`, x, y, z, stickers });
      }
    }
  }

  return nextCubies;
}

function rotateVector(vector, axis, dir) {
  const [x, y, z] = vector;

  if (axis === "x") return dir === 1 ? [x, -z, y] : [x, z, -y];
  if (axis === "y") return dir === 1 ? [z, y, -x] : [-z, y, x];
  return dir === 1 ? [-y, x, z] : [y, -x, z];
}

function faceFromVector(vector) {
  return Object.entries(normals).find(([, normal]) => normal.every((value, index) => value === vector[index]))[0];
}

function rotateCubie(cubie, axis, dir) {
  const [x, y, z] = rotateVector([cubie.x, cubie.y, cubie.z], axis, dir);
  const stickers = {};

  Object.entries(cubie.stickers).forEach(([face, color]) => {
    stickers[faceFromVector(rotateVector(normals[face], axis, dir))] = color;
  });

  cubie.x = x;
  cubie.y = y;
  cubie.z = z;
  cubie.stickers = stickers;
}

function getMoveParts(move) {
  const baseMove = move.replace("'", "").replace("2", "");
  const turns = move.includes("2") ? 2 : 1;
  const config = moveConfigs[baseMove];
  const moveDirection = baseMove === "R" ? config.dir : -config.dir;
  let direction = move.includes("'") ? -moveDirection : moveDirection;

  if (baseMove === "L") {
    direction *= -1;
  }

  const needsStateFlip = ["R", "L", "F", "B", "M", "S"].includes(baseMove);
  const stateDirection = needsStateFlip ? -direction : direction;
  const angle = direction * turns * 90;

  return { angle, baseMove, config, direction, stateDirection, turns };
}

function rotationTransform(axis, angle) {
  if (axis === "x") return `rotateX(${angle}deg)`;
  if (axis === "y") return `rotateY(${angle}deg)`;
  return `rotateZ(${angle}deg)`;
}

function commitMove(move, shouldRecord = true) {
  const { config, stateDirection, turns } = getMoveParts(move);

  for (let index = 0; index < turns; index += 1) {
    cubies.forEach((cubie) => {
      if (cubie[config.axis] === config.layer) {
        rotateCubie(cubie, config.axis, stateDirection);
      }
    });
  }

  if (shouldRecord) {
    moveHistory.push(move);
    moveCount += 1;
    startTimer();
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function animateMove(move, duration = 260) {
  const { angle, config } = getMoveParts(move);
  const selectedCubies = cubies
    .filter((cubie) => cubie[config.axis] === config.layer)
    .map((cubie) => cubeElement.querySelector(`[data-cubie="${cubie.id}"]`))
    .filter(Boolean);

  selectedCubies.forEach((cubieElement) => {
    cubieElement.style.setProperty("--turn-duration", `${duration}ms`);
  });

  await wait(20);

  selectedCubies.forEach((cubieElement) => {
    cubieElement.style.transform = `translate(-50%, -50%) ${rotationTransform(config.axis, angle)}`;
  });

  await wait(duration + 40);
}

async function performMove(move, shouldRecord = true, duration = 260) {
  await animateMove(move, duration);
  commitMove(move, shouldRecord);
  render();
}

async function playMove(move, shouldRecord = true) {
  if (isAnimating) return;

  isAnimating = true;
  setControlsDisabled(true);
  await performMove(translateMoveToCurrentView(move), shouldRecord);
  setControlsDisabled(false);
  isAnimating = false;
}

async function playSequence(sequence, repetitions = 1, duration = 115) {
  if (isAnimating) return;

  isAnimating = true;
  setControlsDisabled(true);

  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    for (const move of sequence) {
      await performMove(translateMoveToCurrentView(move), true, duration);
    }
  }

  setControlsDisabled(false);
  isAnimating = false;
}

function parseAlgorithm(algorithm) {
  return algorithm.match(/[URFDLBMES][2']?/g) || [];
}

async function playPattern(algorithm) {
  const sequence = parseAlgorithm(algorithm);
  if (!sequence.length || isAnimating) return;

  closePatterns();
  await playSequence(sequence, 1, 82);
}

function inverseMove(move) {
  if (move.includes("2")) return move;
  return move.includes("'") ? move.replace("'", "") : `${move}'`;
}

function resetGame() {
  cubies = createSolvedCubies();
  moveCount = 0;
  moveHistory = [];
  startedAt = null;
  clearInterval(timerId);
  timerId = null;
  timerElement.textContent = "00:00";
  render();
}

async function scramble() {
  if (isAnimating) return;

  const moves = faces;
  let lastMove = "";

  isAnimating = true;
  setControlsDisabled(true);
  resetGame();

  for (let index = 0; index < 20; index += 1) {
    let move = moves[Math.floor(Math.random() * moves.length)];
    while (move === lastMove) {
      move = moves[Math.floor(Math.random() * moves.length)];
    }

    const suffix = ["", "'", "2"][Math.floor(Math.random() * 3)];
    await performMove(`${move}${suffix}`, true, 115);
    lastMove = move;
  }

  setControlsDisabled(false);
  isAnimating = false;
}

async function undoMove() {
  if (isAnimating) return;

  const previousMove = moveHistory.pop();
  if (!previousMove) return;

  isAnimating = true;
  setControlsDisabled(true);
  moveCount = Math.max(0, moveCount - 1);
  await performMove(inverseMove(previousMove), false);
  setControlsDisabled(false);
  isAnimating = false;
}

function startTimer() {
  if (startedAt) return;

  startedAt = Date.now();
  timerId = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateTimer() {
  if (!startedAt) return;

  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  timerElement.textContent = `${minutes}:${seconds}`;
}

function getFace(face) {
  const stickers = Array(9).fill(face);

  cubies.forEach((cubie) => {
    if (!cubie.stickers[face]) return;

    const { x, y, z } = cubie;
    let row = 0;
    let col = 0;

    if (face === "F") {
      row = 1 - y;
      col = x + 1;
    } else if (face === "B") {
      row = 1 - y;
      col = 1 - x;
    } else if (face === "U") {
      row = z + 1;
      col = x + 1;
    } else if (face === "D") {
      row = 1 - z;
      col = x + 1;
    } else if (face === "R") {
      row = 1 - y;
      col = 1 - z;
    } else if (face === "L") {
      row = 1 - y;
      col = z + 1;
    }

    stickers[row * 3 + col] = cubie.stickers[face];
  });

  return stickers;
}

function isSolved() {
  return faces.every((face) => {
    const stickers = getFace(face);
    return stickers.every((color) => color === stickers[0]);
  });
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function rotateViewX(vector, degrees) {
  const radians = degreesToRadians(degrees);
  const [x, y, z] = vector;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return [x, y * cos - z * sin, y * sin + z * cos];
}

function rotateViewY(vector, degrees) {
  const radians = degreesToRadians(degrees);
  const [x, y, z] = vector;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function getViewedFaceVectors() {
  return faces.map((face) => ({
    face,
    vector: rotateViewX(rotateViewY(normals[face], viewY), viewX)
  }));
}

function getFaceClosestToAxis(vectors, axisIndex, excludedFaces = []) {
  return vectors
    .filter(({ face }) => !excludedFaces.includes(face))
    .sort((a, b) => b.vector[axisIndex] - a.vector[axisIndex])[0].face;
}

function getViewFaceLayout() {
  const vectors = getViewedFaceVectors();
  const front = getFaceClosestToAxis(vectors, 2);
  const back = oppositeFaces[front];
  const up = getFaceClosestToAxis(vectors, 1, [front, back]);
  const down = oppositeFaces[up];
  const right = getFaceClosestToAxis(vectors, 0, [front, back, up, down]);
  const left = oppositeFaces[right];

  return { up, left, front, right, back, down };
}

function translateMoveToCurrentView(move) {
  const baseMove = move.replace("'", "").replace("2", "");
  const slot = relativeFaceSlots[baseMove];

  if (!slot) return move;

  const suffix = move.endsWith("2") ? "2" : move.endsWith("'") ? "'" : "";
  return `${getViewFaceLayout()[slot]}${suffix}`;
}

function renderNetFace(face) {
  const faceElement = document.createElement("div");
  faceElement.className = `net-face net-face--${face.toLowerCase()}`;
  faceElement.setAttribute("aria-label", faceNames[face]);

  getFace(face).forEach((color) => {
    const sticker = document.createElement("span");
    sticker.className = "game-sticker";
    sticker.style.background = faceColors[color];
    faceElement.appendChild(sticker);
  });

  return faceElement;
}

function renderCubie(cubie) {
  const cubieElement = document.createElement("div");
  cubieElement.className = "game-cubie";
  cubieElement.dataset.cubie = cubie.id;
  cubieElement.dataset.x = String(cubie.x);
  cubieElement.dataset.y = String(cubie.y);
  cubieElement.dataset.z = String(cubie.z);

  const core = document.createElement("div");
  core.className = "cubie-core";

  Object.entries(cubie.stickers).forEach(([face, color]) => {
    const sticker = document.createElement("span");
    sticker.className = `cubie-sticker cubie-sticker--${face.toLowerCase()}`;
    sticker.style.background = faceColors[color];
    core.appendChild(sticker);
  });

  cubieElement.appendChild(core);
  return cubieElement;
}

function renderCube() {
  cubeElement.innerHTML = "";
  cubies
    .filter((cubie) => Object.keys(cubie.stickers).length > 0)
    .forEach((cubie) => {
      cubeElement.appendChild(renderCubie(cubie));
    });
  applyCubeView({ updateNet: false });
}

function renderNet() {
  netElement.innerHTML = "";
  const layout = getViewFaceLayout();
  const slots = [
    ["u", layout.up],
    ["l", layout.left],
    ["f", layout.front],
    ["r", layout.right],
    ["b", layout.back],
    ["d", layout.down]
  ];

  slots.forEach(([slot, face]) => {
    const wrapper = document.createElement("div");
    wrapper.className = `net-slot net-slot--${slot}`;

    const label = document.createElement("span");
    label.textContent = slot.toUpperCase();

    wrapper.append(label, renderNetFace(face));
    netElement.appendChild(wrapper);
  });
}

function render() {
  renderCube();
  renderNet();
  moveCountElement.textContent = String(moveCount);
  statusElement.textContent = isSolved() ? "Risolto" : "Da risolvere";

  if (isSolved() && startedAt && moveCount > 0) {
    clearInterval(timerId);
    timerId = null;
  }
}

function buildMoveControls() {
  ["U", "D", "L", "R", "F", "B", "M", "E", "S"].forEach((move) => {
    ["", "'", "2"].forEach((suffix) => {
      const button = document.createElement("button");
      button.className = "move-button";
      button.type = "button";
      button.textContent = `${move}${suffix}`;
      button.addEventListener("click", () => playMove(`${move}${suffix}`));
      moveGrid.appendChild(button);
    });
  });
}

function buildPatternList() {
  patternsList.innerHTML = "";

  rubikPatterns.forEach((group) => {
    const section = document.createElement("section");
    section.className = "pattern-group";

    const heading = document.createElement("h3");
    heading.textContent = group.title;
    section.appendChild(heading);

    if (group.image) {
      const image = document.createElement("img");
      image.className = "pattern-group__image";
      image.src = group.image;
      image.alt = `Anteprima ${group.title}`;
      section.appendChild(image);
    }

    const grid = document.createElement("div");
    grid.className = "pattern-grid";

    group.items.forEach((item) => {
      const card = document.createElement("button");
      card.className = "pattern-card";
      card.type = "button";
      card.addEventListener("click", () => playPattern(item.algorithm));

      if (item.image) {
        const image = document.createElement("img");
        image.className = "pattern-card__image";
        image.src = item.image;
        image.alt = `Anteprima ${item.name}`;
        card.appendChild(image);
      }

      const title = document.createElement("h4");
      title.textContent = item.name;

      const algorithm = document.createElement("p");
      algorithm.textContent = item.algorithm;

      card.append(title, algorithm);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    patternsList.appendChild(section);
  });
}

function openPatterns() {
  patternsPanel.hidden = false;
}

function closePatterns() {
  patternsPanel.hidden = true;
}

function setControlsDisabled(disabled) {
  document.querySelectorAll(".move-button, .pattern-card, #scramble-button, #reset-button, #undo-button, #sexy-button, #patterns-button").forEach((control) => {
    control.disabled = disabled;
  });
}

function applyCubeView({ updateNet = true } = {}) {
  cubeElement.style.setProperty("--cube-x", `${viewX}deg`);
  cubeElement.style.setProperty("--cube-y", `${viewY}deg`);

  if (updateNet && cubies.length) {
    renderNet();
  }
}

function setView(angle) {
  viewX = angle.x;
  viewY = angle.y;
  applyCubeView();
}

function beginDrag(clientX, clientY, pointerId = "mouse") {
  dragStart = {
    pointerId,
    x: clientX,
    y: clientY,
    viewX,
    viewY
  };
  cubeView.classList.add("is-dragging");
}

function updateDrag(clientX, clientY, pointerId = "mouse") {
  if (!dragStart || dragStart.pointerId !== pointerId) return;

  const deltaX = clientX - dragStart.x;
  const deltaY = clientY - dragStart.y;

  viewY = dragStart.viewY + deltaX * 0.38;
  viewX = dragStart.viewX - deltaY * 0.38;
  applyCubeView();
}

function endDrag(pointerId = "mouse") {
  if (!dragStart || dragStart.pointerId !== pointerId) return;

  dragStart = null;
  cubeView.classList.remove("is-dragging");
}

function handlePointerDown(event) {
  beginDrag(event.clientX, event.clientY, event.pointerId);
  cubeView.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  updateDrag(event.clientX, event.clientY, event.pointerId);
}

function handlePointerUp(event) {
  endDrag(event.pointerId);
}

function handleMouseDown(event) {
  beginDrag(event.clientX, event.clientY);
}

function handleMouseMove(event) {
  updateDrag(event.clientX, event.clientY);
}

function handleMouseUp() {
  endDrag();
}

document.querySelector("#scramble-button").addEventListener("click", scramble);
document.querySelector("#reset-button").addEventListener("click", () => {
  if (!isAnimating) resetGame();
});
document.querySelector("#undo-button").addEventListener("click", undoMove);
sexyMoveButton.addEventListener("click", () => playSequence(sexyMoveSequence, 6, 95));
patternsButton.addEventListener("click", openPatterns);
patternsClose.addEventListener("click", closePatterns);
patternsPanel.addEventListener("click", (event) => {
  if (event.target === patternsPanel) closePatterns();
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(viewAngles[button.dataset.view]));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !patternsPanel.hidden) closePatterns();
});

cubeView.addEventListener("pointerdown", handlePointerDown);
cubeView.addEventListener("pointermove", handlePointerMove);
cubeView.addEventListener("pointerup", handlePointerUp);
cubeView.addEventListener("pointercancel", handlePointerUp);
cubeView.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);

buildMoveControls();
buildPatternList();
setView(viewAngles.front);
resetGame();
