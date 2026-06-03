const boardEl = document.querySelector("#board");
const turnLabel = document.querySelector("#turnLabel");
const gameStatus = document.querySelector("#gameStatus");
const moveHistoryEl = document.querySelector("#moveHistory");
const analysisPanel = document.querySelector("#analysisPanel");
const resetBtn = document.querySelector("#resetBtn");
const undoBtn = document.querySelector("#undoBtn");
const flipBtn = document.querySelector("#flipBtn");
const tabButtons = document.querySelectorAll("[data-tab-button]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");

const PIECES = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟"
};

const FILES = "abcdefgh";
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
let position;
let selected = null;
let legalTargets = [];
let flipped = false;
let history = [];
let moves = [];

function startingBoard() {
  return [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
  ];
}

function resetGame() {
  position = {
    board: startingBoard(),
    turn: "w",
    rights: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null
  };
  selected = null;
  legalTargets = [];
  history = [];
  moves = [];
  render();
}

function clonePosition(pos = position) {
  return {
    board: pos.board.map((row) => [...row]),
    turn: pos.turn,
    rights: { ...pos.rights },
    enPassant: pos.enPassant ? { ...pos.enPassant } : null
  };
}

function colorOf(piece) {
  return piece ? piece[0] : null;
}

function typeOf(piece) {
  return piece ? piece[1] : null;
}

function enemy(color) {
  return color === "w" ? "b" : "w";
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function squareName(r, c) {
  return `${FILES[c]}${8 - r}`;
}

function render() {
  boardEl.innerHTML = "";
  boardEl.classList.toggle("is-flipped", flipped);

  for (let displayR = 0; displayR < 8; displayR += 1) {
    for (let displayC = 0; displayC < 8; displayC += 1) {
      const r = flipped ? 7 - displayR : displayR;
      const c = flipped ? 7 - displayC : displayC;
      const piece = position.board[r][c];
      const square = document.createElement("button");
      square.type = "button";
      square.className = `chess-square ${(r + c) % 2 === 0 ? "is-light" : "is-dark"}`;
      square.dataset.r = String(r);
      square.dataset.c = String(c);
      square.setAttribute("aria-label", `${squareName(r, c)} ${piece ? pieceName(piece) : "vuota"}`);

      if (piece) {
        const pieceEl = document.createElement("span");
        pieceEl.className = "chess-piece";
        pieceEl.textContent = PIECES[piece];
        square.append(pieceEl);
        square.classList.add(colorOf(piece) === "w" ? "has-white-piece" : "has-black-piece");
      }

      if (displayC === 0) {
        const rank = document.createElement("span");
        rank.className = "chess-coordinate chess-coordinate--rank";
        rank.textContent = String(8 - r);
        square.append(rank);
      }

      if (displayR === 7) {
        const file = document.createElement("span");
        file.className = "chess-coordinate chess-coordinate--file";
        file.textContent = FILES[c];
        square.append(file);
      }

      if (selected && selected.r === r && selected.c === c) {
        square.classList.add("is-selected");
      }

      const target = legalTargets.find((move) => move.to.r === r && move.to.c === c);
      if (target) {
        square.classList.add(position.board[r][c] ? "is-capture" : "is-target");
      }

      square.addEventListener("click", () => handleSquareClick(r, c));
      boardEl.append(square);
    }
  }

  turnLabel.textContent = position.turn === "w" ? "Bianco" : "Nero";
  updateStatus();
  renderHistory();
  renderAnalysis();
}

function pieceName(piece) {
  const names = {
    k: "re",
    q: "regina",
    r: "torre",
    b: "alfiere",
    n: "cavallo",
    p: "pedone"
  };
  return `${colorOf(piece) === "w" ? "bianco" : "nero"} ${names[typeOf(piece)]}`;
}

function handleSquareClick(r, c) {
  const piece = position.board[r][c];
  const legalMove = legalTargets.find((move) => move.to.r === r && move.to.c === c);

  if (selected && legalMove) {
    const previous = clonePosition();
    applyMove(position, legalMove);
    history.push({ position: previous, moves: [...moves] });
    moves.push(formatMove(legalMove));
    position.turn = enemy(position.turn);
    selected = null;
    legalTargets = [];
    render();
    return;
  }

  if (piece && colorOf(piece) === position.turn) {
    selected = { r, c };
    legalTargets = legalMovesFor(position, r, c);
    render();
    return;
  }

  selected = null;
  legalTargets = [];
  render();
}

function updateStatus() {
  const legal = allLegalMoves(position, position.turn);
  const inCheck = isInCheck(position, position.turn);

  if (legal.length === 0 && inCheck) {
    gameStatus.textContent = `Scacco matto: vince il ${position.turn === "w" ? "nero" : "bianco"}.`;
    return;
  }

  if (legal.length === 0) {
    gameStatus.textContent = "Stallo: la partita è patta.";
    return;
  }

  if (inCheck) {
    gameStatus.textContent = `Il ${position.turn === "w" ? "bianco" : "nero"} è sotto scacco.`;
    return;
  }

  gameStatus.textContent = selected ? "Scegli una casella evidenziata." : "Seleziona un pezzo.";
}

function renderHistory() {
  moveHistoryEl.innerHTML = "";
  moves.forEach((move, index) => {
    const item = document.createElement("li");
    item.textContent = `${index + 1}. ${move}`;
    moveHistoryEl.append(item);
  });
  undoBtn.disabled = history.length === 0;
}

function renderAnalysis() {
  const legal = allLegalMoves(position, position.turn);
  const inCheck = isInCheck(position, position.turn);
  const material = materialBalance();
  const currentColor = position.turn === "w" ? "Bianco" : "Nero";
  const lastMove = moves.length ? moves[moves.length - 1] : "Nessuna mossa";
  const balanceText = material === 0
    ? "Materiale pari"
    : `${material > 0 ? "Bianco" : "Nero"} +${Math.abs(material)}`;

  analysisPanel.innerHTML = `
    <article class="analysis-card">
      <span>Turno</span>
      <strong>${currentColor}</strong>
      <p>${inCheck ? "Il re e sotto scacco." : "Posizione tranquilla: scegli una mossa legale."}</p>
    </article>
    <article class="analysis-card">
      <span>Mosse disponibili</span>
      <strong>${legal.length}</strong>
      <p>${legal.length ? "Le caselle evidenziate sono le mosse possibili del pezzo selezionato." : "La partita e finita."}</p>
    </article>
    <article class="analysis-card">
      <span>Materiale</span>
      <strong>${balanceText}</strong>
      <p>Ultima mossa: ${lastMove}</p>
    </article>
  `;
}

function materialBalance() {
  let score = 0;
  for (const row of position.board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[typeOf(piece)];
      score += colorOf(piece) === "w" ? value : -value;
    }
  }
  return score;
}

function legalMovesFor(pos, r, c) {
  const piece = pos.board[r][c];
  if (!piece) return [];
  const color = colorOf(piece);
  return pseudoMovesFor(pos, r, c).filter((move) => {
    const test = clonePosition(pos);
    applyMove(test, move);
    return !isInCheck(test, color);
  });
}

function allLegalMoves(pos, color) {
  const legal = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      if (colorOf(pos.board[r][c]) === color) {
        legal.push(...legalMovesFor(pos, r, c));
      }
    }
  }
  return legal;
}

function pseudoMovesFor(pos, r, c) {
  const piece = pos.board[r][c];
  const color = colorOf(piece);
  const type = typeOf(piece);
  const moves = [];
  const add = (toR, toC, extra = {}) => {
    if (!inBounds(toR, toC)) return;
    const target = pos.board[toR][toC];
    if (!target || colorOf(target) !== color) {
      moves.push({ from: { r, c }, to: { r: toR, c: toC }, piece, capture: target, ...extra });
    }
  };

  if (type === "p") {
    const dir = color === "w" ? -1 : 1;
    const start = color === "w" ? 6 : 1;
    const promote = color === "w" ? 0 : 7;
    if (inBounds(r + dir, c) && !pos.board[r + dir][c]) {
      add(r + dir, c, r + dir === promote ? { promotion: `${color}q` } : {});
      if (r === start && !pos.board[r + dir * 2][c]) {
        add(r + dir * 2, c, { doublePawn: true });
      }
    }
    for (const dc of [-1, 1]) {
      const tr = r + dir;
      const tc = c + dc;
      if (!inBounds(tr, tc)) continue;
      const target = pos.board[tr][tc];
      if (target && colorOf(target) !== color) {
        add(tr, tc, tr === promote ? { promotion: `${color}q` } : {});
      }
      if (pos.enPassant && pos.enPassant.r === tr && pos.enPassant.c === tc) {
        add(tr, tc, { enPassant: true, capture: `${enemy(color)}p` });
      }
    }
  }

  if (type === "n") {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      add(r + dr, c + dc);
    }
  }

  if (type === "b" || type === "r" || type === "q") {
    const dirs = [];
    if (type === "b" || type === "q") dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (type === "r" || type === "q") dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    for (const [dr, dc] of dirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (inBounds(tr, tc)) {
        const target = pos.board[tr][tc];
        if (!target) {
          add(tr, tc);
        } else {
          if (colorOf(target) !== color) add(tr, tc);
          break;
        }
        tr += dr;
        tc += dc;
      }
    }
  }

  if (type === "k") {
    for (const dr of [-1, 0, 1]) {
      for (const dc of [-1, 0, 1]) {
        if (dr || dc) add(r + dr, c + dc);
      }
    }
    addCastling(pos, r, c, color, moves);
  }

  return moves;
}

function addCastling(pos, r, c, color, moves) {
  const home = color === "w" ? 7 : 0;
  const enemyColor = enemy(color);
  if (r !== home || c !== 4 || isInCheck(pos, color)) return;

  if (pos.rights[`${color}K`] && !pos.board[home][5] && !pos.board[home][6]) {
    if (!isSquareAttacked(pos, home, 5, enemyColor) && !isSquareAttacked(pos, home, 6, enemyColor)) {
      moves.push({ from: { r, c }, to: { r: home, c: 6 }, piece: `${color}k`, castle: "K" });
    }
  }

  if (pos.rights[`${color}Q`] && !pos.board[home][3] && !pos.board[home][2] && !pos.board[home][1]) {
    if (!isSquareAttacked(pos, home, 3, enemyColor) && !isSquareAttacked(pos, home, 2, enemyColor)) {
      moves.push({ from: { r, c }, to: { r: home, c: 2 }, piece: `${color}k`, castle: "Q" });
    }
  }
}

function applyMove(pos, move) {
  const { from, to } = move;
  const moving = pos.board[from.r][from.c];
  const color = colorOf(moving);
  const target = pos.board[to.r][to.c];

  pos.board[from.r][from.c] = null;

  if (move.enPassant) {
    pos.board[from.r][to.c] = null;
  }

  if (move.castle === "K") {
    pos.board[to.r][5] = pos.board[to.r][7];
    pos.board[to.r][7] = null;
  }

  if (move.castle === "Q") {
    pos.board[to.r][3] = pos.board[to.r][0];
    pos.board[to.r][0] = null;
  }

  pos.board[to.r][to.c] = move.promotion || moving;

  if (typeOf(moving) === "k") {
    pos.rights[`${color}K`] = false;
    pos.rights[`${color}Q`] = false;
  }

  if (typeOf(moving) === "r") {
    if (from.r === 7 && from.c === 0) pos.rights.wQ = false;
    if (from.r === 7 && from.c === 7) pos.rights.wK = false;
    if (from.r === 0 && from.c === 0) pos.rights.bQ = false;
    if (from.r === 0 && from.c === 7) pos.rights.bK = false;
  }

  if (target && typeOf(target) === "r") {
    if (to.r === 7 && to.c === 0) pos.rights.wQ = false;
    if (to.r === 7 && to.c === 7) pos.rights.wK = false;
    if (to.r === 0 && to.c === 0) pos.rights.bQ = false;
    if (to.r === 0 && to.c === 7) pos.rights.bK = false;
  }

  pos.enPassant = null;
  if (typeOf(moving) === "p" && Math.abs(to.r - from.r) === 2) {
    pos.enPassant = { r: (from.r + to.r) / 2, c: from.c };
  }
}

function isInCheck(pos, color) {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      if (pos.board[r][c] === `${color}k`) {
        return isSquareAttacked(pos, r, c, enemy(color));
      }
    }
  }
  return false;
}

function isSquareAttacked(pos, r, c, byColor) {
  const pawnDir = byColor === "w" ? -1 : 1;
  for (const dc of [-1, 1]) {
    const pr = r - pawnDir;
    const pc = c - dc;
    if (inBounds(pr, pc) && pos.board[pr][pc] === `${byColor}p`) return true;
  }

  for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
    if (inBounds(r + dr, c + dc) && pos.board[r + dr][c + dc] === `${byColor}n`) return true;
  }

  for (const dr of [-1, 0, 1]) {
    for (const dc of [-1, 0, 1]) {
      if ((dr || dc) && inBounds(r + dr, c + dc) && pos.board[r + dr][c + dc] === `${byColor}k`) return true;
    }
  }

  const rays = [
    [-1, -1, ["b", "q"]], [-1, 1, ["b", "q"]], [1, -1, ["b", "q"]], [1, 1, ["b", "q"]],
    [-1, 0, ["r", "q"]], [1, 0, ["r", "q"]], [0, -1, ["r", "q"]], [0, 1, ["r", "q"]]
  ];

  for (const [dr, dc, attackers] of rays) {
    let tr = r + dr;
    let tc = c + dc;
    while (inBounds(tr, tc)) {
      const piece = pos.board[tr][tc];
      if (piece) {
        if (colorOf(piece) === byColor && attackers.includes(typeOf(piece))) return true;
        break;
      }
      tr += dr;
      tc += dc;
    }
  }

  return false;
}

function formatMove(move) {
  if (move.castle === "K") return "O-O";
  if (move.castle === "Q") return "O-O-O";
  const type = typeOf(move.piece);
  const pieceLetter = { p: "", n: "N", b: "B", r: "R", q: "Q", k: "K" }[type];
  const capture = move.capture || move.enPassant ? "x" : "";
  const fromFile = type === "p" && capture ? FILES[move.from.c] : "";
  const promo = move.promotion ? "=Q" : "";
  return `${pieceLetter}${fromFile}${capture}${squareName(move.to.r, move.to.c)}${promo}`;
}

resetBtn.addEventListener("click", resetGame);

undoBtn.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  position = previous.position;
  moves = previous.moves;
  selected = null;
  legalTargets = [];
  render();
});

flipBtn.addEventListener("click", () => {
  flipped = !flipped;
  render();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tabButton;
    tabButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tab;
    });
  });
});

resetGame();
