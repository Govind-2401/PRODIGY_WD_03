const board = document.getElementById('board');
const status = document.getElementById('status');
const modeRadios = document.getElementsByName('mode');

let currentPlayer = 'X';
let gameState = Array(9).fill('');
let gameActive = true;
let gameMode = 'pvp';

modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    gameMode = document.querySelector('input[name="mode"]:checked').value;
    resetGame();
  });
});

function createBoard() {
  board.innerHTML = '';
  gameState.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.dataset.index = index;
    cellDiv.innerHTML = `<span>${cell}</span>`;
    board.appendChild(cellDiv);
    cellDiv.addEventListener('click', handleCellClick);
  });
}

function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (!gameActive || gameState[index]) return;

  makeMove(index, currentPlayer);

  if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
    const bestMove = getBestMove(gameState);
    setTimeout(() => makeMove(bestMove, 'O'), 400);
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  const cell = document.querySelector(`[data-index='${index}']`);
  cell.innerHTML = `<span>${player}</span>`;

  if (checkWinner(player)) {
    status.textContent = `🎉 Player ${player} wins!`;
    status.classList.add('win');
    gameActive = false;
    return;
  }

  if (!gameState.includes('')) {
    status.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  status.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner(player) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let combo of wins) {
    const [a, b, c] = combo;
    if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
      highlightWinningCells(combo);
      return true;
    }
  }

  return false;
}

function highlightWinningCells(indices) {
  indices.forEach(i => {
    const cell = document.querySelector(`[data-index='${i}']`);
    cell.classList.add('win');
  });
}

function resetGame() {
  currentPlayer = 'X';
  gameState = Array(9).fill('');
  gameActive = true;
  status.textContent = "Player X's turn";
  status.classList.remove('win');
  createBoard();
}

function getBestMove(state) {
  const emptyCells = state
    .map((val, i) => val === '' ? i : null)
    .filter(i => i !== null);

  let bestScore = -Infinity;
  let move;

  for (const index of emptyCells) {
    state[index] = 'O';
    const score = minimax(state, 0, false);
    state[index] = '';
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  }

  return move;
}

function minimax(state, depth, isMaximizing) {
  if (checkStaticWin(state, 'O')) return 10 - depth;
  if (checkStaticWin(state, 'X')) return depth - 10;
  if (!state.includes('')) return 0;

  const emptyCells = state
    .map((val, i) => val === '' ? i : null)
    .filter(i => i !== null);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const index of emptyCells) {
      state[index] = 'O';
      const score = minimax(state, depth + 1, false);
      state[index] = '';
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const index of emptyCells) {
      state[index] = 'X';
      const score = minimax(state, depth + 1, true);
      state[index] = '';
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

function checkStaticWin(state, player) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return wins.some(([a, b, c]) => {
    return state[a] === player && state[b] === player && state[c] === player;
  });
}

createBoard();
