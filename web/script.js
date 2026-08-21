const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// --- UI ELEMENTS & GLOBALS ---
const themeToggle = document.getElementById('themeToggle');
const nameScreen = document.getElementById('nameScreen');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');

const modeScreen = document.getElementById('modeScreen');
const vsBotBtn = document.getElementById('vsBotBtn');
const vsFriendBtn = document.getElementById('vsFriendBtn');

const lobbyScreen = document.getElementById('lobbyScreen');
const lobbyActions = document.getElementById('lobbyActions');
const capacitySetup = document.getElementById('capacitySetup');
const capacityCards = document.querySelectorAll('.capacity-card');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const backToModeBtn = document.getElementById('backToModeBtn');

const waitingScreen = document.getElementById('waitingScreen');
const waitingRoomCode = document.getElementById('waitingRoomCode');
const playerRoster = document.getElementById('playerRoster');
const waitingStatus = document.getElementById('waitingStatus');
const leaveWaitingBtn = document.getElementById('leaveWaitingBtn');

const hubScreen = document.getElementById('hubScreen');
const hubRoleBanner = document.getElementById('hubRoleBanner');
const hubRoomDisplay = document.getElementById('hubRoomDisplay');
const launchTicTacToe = document.getElementById('launchTicTacToe');
const launchLudo = document.getElementById('launchLudo');
const leaveHubBtn = document.getElementById('leaveHubBtn');

const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySlider = document.getElementById('difficultySlider');
const diffLabelText = document.getElementById('diffLabelText');

const gameArea = document.getElementById('gameArea');
const gameControls = document.getElementById('gameControls');
const backToHubBtn = document.getElementById('backToHubBtn');
const restartBtn = document.getElementById('restartBtn');
const statusText = document.getElementById('statusText');

const tictactoeBoard = document.getElementById('tictactoeBoard');
const ludoWrapper = document.getElementById('ludoWrapper');
const ludoBoard = document.getElementById('ludoBoard');
const ludoDice = document.getElementById('ludoDice');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const cells = document.querySelectorAll('.cell');
const strike = document.getElementById('strike');

const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

const rouletteOverlay = document.getElementById('rouletteOverlay');
const rouletteName = document.getElementById('rouletteName');
const rouletteRole = document.getElementById('rouletteRole');

const resultOverlay = document.getElementById('resultOverlay');
const resultTitle = document.getElementById('resultTitle');
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
const overlayHubBtn = document.getElementById('overlayHubBtn');

let currentMode = ''; 
let activeGame = ''; 
let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = ''; 
let opponentName = ''; 
let botDifficulty = 2; 

// --- ROUTING & CHAT ---
function showScreen(screen) {
    nameScreen.classList.add('hidden'); 
    modeScreen.classList.add('hidden'); 
    lobbyScreen.classList.add('hidden');
    waitingScreen.classList.add('hidden');
    hubScreen.classList.add('hidden'); 
    gameArea.classList.add('hidden'); 
    resultOverlay.classList.add('hidden');
    screen.classList.remove('hidden');
}

function showChat() { 
    chatBox.classList.remove('hidden'); 
    document.body.classList.add('chat-active'); 
}

function hideChat() { 
    chatBox.classList.add('hidden'); 
    document.body.classList.remove('chat-active'); 
}

difficultySlider.addEventListener('input', (e) => { 
    botDifficulty = parseInt(e.target.value); 
    diffLabelText.innerText = {1:"Easy", 2:"Medium", 3:"Hard"}[botDifficulty]; 
});

let isDarkMode = false;
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerText = '☀️ Light';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerText = '🌙 Dark';
    }
});

nameInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') saveNameBtn.click(); 
});

saveNameBtn.addEventListener('click', () => { 
    playerName = nameInput.value.trim() || "Player"; 
    document.getElementById('greetingText').innerText = `Hey ${playerName}!`; 
    showScreen(modeScreen); 
});

vsBotBtn.addEventListener('click', () => { 
    currentMode = 'bot'; 
    myRole = 'Host'; 
    opponentName = 'Bot'; 
    hubRoleBanner.classList.add('hidden'); 
    hubRoomDisplay.classList.add('hidden'); 
    difficultyContainer.classList.remove('hidden'); 
    launchTicTacToe.classList.remove('locked-game'); 
    launchLudo.classList.remove('locked-game'); 
    showScreen(hubScreen); 
});

vsFriendBtn.addEventListener('click', () => { 
    currentMode = 'friend'; 
    difficultyContainer.classList.add('hidden'); 
    lobbyActions.classList.remove('hidden');
    capacitySetup.classList.add('hidden');
    showScreen(lobbyScreen); 
});

// --- SMART BACK BUTTON LOGIC ---
backToModeBtn.addEventListener('click', () => { 
    // If inside Capacity Selection, go back to Join/Create screen
    if (!capacitySetup.classList.contains('hidden')) {
        capacitySetup.classList.add('hidden');
        lobbyActions.classList.remove('hidden');
    } else {
        // Otherwise, go all the way back to the Mode screen
        showScreen(modeScreen); 
        lobbyMessage.innerText = ''; 
        codeInput.value = ''; 
    }
});

// --- NEW ROOM CREATION FLOW ---
createBtn.addEventListener('click', () => { 
    lobbyActions.classList.add('hidden');
    capacitySetup.classList.remove('hidden');
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

joinBtn.addEventListener('click', () => { 
    const code = codeInput.value.trim(); 
    if (code.length === 4) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName })); 
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

function leaveRoom() {
    socket.send(JSON.stringify({ action: "leave" })); 
    hideChat(); 
    chatMessages.innerHTML = ''; 
    showScreen(modeScreen); 
}

leaveHubBtn.addEventListener('click', () => { if (currentMode === 'friend') leaveRoom(); else showScreen(modeScreen); });
leaveWaitingBtn.addEventListener('click', leaveRoom);

launchTicTacToe.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "tictactoe" }));
        } else {
            startGameUI("tictactoe");
        }
    } 
});

launchLudo.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "ludo" }));
        } else {
            startGameUI("ludo");
        }
    } 
});

function startGameUI(gameType) {
    activeGame = gameType; 
    showScreen(gameArea); 
    gameControls.classList.remove('hidden');
    
    tictactoeBoard.classList.add('hidden'); 
    ludoWrapper.classList.add('hidden');
    
    if (activeGame === 'tictactoe') { 
        tictactoeBoard.classList.remove('hidden'); 
        resetBoard(); 
        
        if (currentMode === 'bot') {
            statusText.innerText = "Game Started! Your Turn."; 
        } else {
            if (myRole === 'Spectator') {
                statusText.innerText = "Spectating Match...";
            } else {
                statusText.innerText = currentSymbol === 'X' ? "Your Turn!" : "Opponent's Turn...";
            }
        }
    } else if (activeGame === 'ludo') { 
        ludoWrapper.classList.remove('hidden'); 
        initLudoGame(); 
    }
}

// ==========================================
// PHASE 3: THE SMART LUDO BRAIN
// ==========================================
let currentLudoTurn = 'Host'; 
let diceRolledValue = 0;
let hasRolled = false;
let myLudoColor = 'red'; // Default to red for bot mode

let ludoState = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1]
};

const ludoTurnOrder = ['red', 'green', 'yellow', 'blue'];

const trackPath = [
    '6-1','6-2','6-3','6-4','6-5', '5-6','4-6','3-6','2-6','1-6','0-6', '0-7','0-8', 
    '1-8','2-8','3-8','4-8','5-8', '6-9','6-10','6-11','6-12','6-13','6-14', '7-14','8-14', 
    '8-13','8-12','8-11','8-10','8-9', '9-8','10-8','11-8','12-8','13-8','14-8', '14-7','14-6', 
    '13-6','12-6','11-6','10-6','9-6', '8-5','8-4','8-3','8-2','8-1','8-0', '7-0','6-0'
];

const homePaths = {
    red: ['7-1','7-2','7-3','7-4','7-5','center'],
    green: ['1-7','2-7','3-7','4-7','5-7','center'],
    yellow: ['7-13','7-12','7-11','7-10','7-9','center'],
    blue: ['13-7','12-7','11-7','10-7','9-7','center']
};

const safeZones = ['6-1', '8-2', '1-8', '2-6', '8-13', '6-12', '13-6', '12-8'];

function getDiceHTML(value) {
    if (!value) return '';
    const dots = {
        1: '<div class="dot center"></div>',
        2: '<div class="dot top-left"></div><div class="dot bottom-right"></div>',
        3: '<div class="dot top-left"></div><div class="dot center"></div><div class="dot bottom-right"></div>',
        4: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>',
        5: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>',
        6: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot mid-left"></div><div class="dot mid-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>'
    };
    return `<div class="dice-face">${dots[value]}</div>`;
}

function initLudoGame() {
    ludoState = { red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], blue: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1] };
    drawLudoBoard();
    currentLudoTurn = 'red'; // Red always starts
    hasRolled = false;
    ludoDice.innerHTML = getDiceHTML(6); 
    
    // In bot mode, Host is red. In MP, color is assigned by server.
    if (currentMode === 'bot') {
        myLudoColor = 'red';
        myRole = 'Host';
    }
    
    rollDiceBtn.disabled = myLudoColor !== currentLudoTurn;
    statusText.innerText = myLudoColor === currentLudoTurn ? "Ludo! Your Turn to Roll." : `Waiting for ${currentLudoTurn}'s turn...`;
    gameActive = true;
}

rollDiceBtn.addEventListener('click', () => {
    if (activeGame !== 'ludo' || myLudoColor !== currentLudoTurn || hasRolled || !gameActive) return;
    const val = Math.floor(Math.random() * 6) + 1;
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "roll_dice", roller: myLudoColor, value: val }));
    } else {
        animateDice(val, myLudoColor);
    }
});

function animateDice(finalValue, rollerColor) {
    rollDiceBtn.disabled = true; 
    hasRolled = true; 
    diceRolledValue = finalValue;
    
    let counter = 0; 
    ludoDice.classList.add('rolling'); 
    
    const interval = setInterval(() => {
        ludoDice.innerHTML = getDiceHTML(Math.floor(Math.random() * 6) + 1);
        counter++;
        if (counter > 10) {
            clearInterval(interval);
            ludoDice.classList.remove('rolling');
            ludoDice.innerHTML = getDiceHTML(finalValue);
            statusText.innerText = `${rollerColor === myLudoColor ? "You" : rollerColor} rolled a ${finalValue}!`;
            
            setTimeout(() => { processTurnMoves(rollerColor); }, 800);
        }
    }, 50);
}

function processTurnMoves(colorStr) {
    const tokens = ludoState[colorStr];
    let movableTokens = [];
    
    tokens.forEach((pos, index) => {
        if (pos === -1 && diceRolledValue === 6) movableTokens.push(index);
        else if (pos !== -1 && pos + diceRolledValue <= 56) movableTokens.push(index);
    });

    if (movableTokens.length === 0) {
        statusText.innerText = "No valid moves! Turn skipped.";
        setTimeout(() => { switchLudoTurn(colorStr); }, 1500);
        return;
    }

    const allSamePosition = movableTokens.every(idx => tokens[idx] === tokens[movableTokens[0]]);
    if (allSamePosition && colorStr === myLudoColor) {
        statusText.innerText = "Auto-moving pawn...";
        setTimeout(() => { executeMove(colorStr, movableTokens[0]); }, 600);
        return;
    }

    if (colorStr === myLudoColor) {
        statusText.innerText = "Action required: Click a glowing pawn!";
        movableTokens.forEach(idx => {
            const pawn = document.getElementById(`${colorStr}-pawn-${idx}`);
            pawn.classList.add('movable-glow');
            
            pawn.onclick = () => {
                for(let i=0; i<4; i++) { 
                    const p = document.getElementById(`${colorStr}-pawn-${i}`);
                    p.classList.remove('movable-glow'); 
                    p.onclick = null; 
                }
                executeMove(colorStr, idx);
            };
        });
    } else if (currentMode === 'bot' && colorStr === 'blue') {
        setTimeout(() => {
            let chosenToken = movableTokens[0];
            if (movableTokens.some(idx => tokens[idx] === -1)) {
                chosenToken = movableTokens.find(idx => tokens[idx] === -1);
            } else {
                chosenToken = movableTokens.reduce((maxIdx, currentIdx) => tokens[currentIdx] > tokens[maxIdx] ? currentIdx : maxIdx, movableTokens[0]);
            }
            executeMove('blue', chosenToken);
        }, 1000);
    }
}

function executeMove(colorStr, tokenIndex) {
    if (currentMode === 'friend' && colorStr === myLudoColor) {
        socket.send(JSON.stringify({ action: "ludo_move", roller: colorStr, token: tokenIndex, roll: diceRolledValue }));
    }
    
    let oldPos = ludoState[colorStr][tokenIndex];
    let newPos = oldPos === -1 ? 0 : oldPos + diceRolledValue;
    ludoState[colorStr][tokenIndex] = newPos;
    
    movePawnDOM(colorStr, tokenIndex, newPos);
    
    let captured = false;
    if (newPos > -1 && newPos < 51) {
        const myAbsolutePos = getAbsoluteId(colorStr, newPos);
        
        if (!safeZones.includes(myAbsolutePos)) {
            ['red', 'blue', 'green', 'yellow'].forEach(oppColor => {
                if (oppColor !== colorStr) {
                    ludoState[oppColor].forEach((oppPos, oppIdx) => {
                        if (oppPos > -1 && oppPos < 51 && getAbsoluteId(oppColor, oppPos) === myAbsolutePos) {
                            ludoState[oppColor][oppIdx] = -1;
                            movePawnDOM(oppColor, oppIdx, -1);
                            captured = true;
                            statusText.innerText = "SMASH! Sent home!";
                        }
                    });
                }
            });
        }
    }

    if (ludoState[colorStr].every(p => p === 57)) {
        gameActive = false;
        setTimeout(() => {
            resultTitle.innerText = colorStr === myLudoColor ? "LUDO CHAMPION! 🎉" : `${colorStr} WINS! 😢`;
            resultTitle.style.color = `var(--accent-${colorStr})`;
            resultOverlay.classList.remove('hidden');
        }, 1000);
        return;
    }

    setTimeout(() => {
        if (diceRolledValue === 6 || captured || newPos === 57) {
            statusText.innerText = "Bonus Roll!";
            hasRolled = false;
            if (colorStr === myLudoColor) rollDiceBtn.disabled = false;
            if (currentMode === 'bot' && colorStr === 'blue') {
                setTimeout(() => { animateDice(Math.floor(Math.random() * 6) + 1, 'blue'); }, 1500);
            }
        } else {
            switchLudoTurn(colorStr);
        }
    }, 1500);
}

function switchLudoTurn(current) {
    // In bot mode, we only toggle red/blue for simplicity
    if (currentMode === 'bot') {
        currentLudoTurn = current === 'red' ? 'blue' : 'red';
    } else {
        // In multiplayer, it cycles to the next active player. For now we assume all 4 could be playing.
        const currentIndex = ludoTurnOrder.indexOf(current);
        currentLudoTurn = ludoTurnOrder[(currentIndex + 1) % 4];
    }
    
    hasRolled = false;
    
    if (currentLudoTurn === myLudoColor) {
        rollDiceBtn.disabled = false;
        statusText.innerText = "Your Turn: Roll the Dice!";
    } else {
        rollDiceBtn.disabled = true;
        statusText.innerText = `Waiting for ${currentLudoTurn}...`;
        if (currentMode === 'bot' && currentLudoTurn === 'blue') {
            setTimeout(() => { animateDice(Math.floor(Math.random() * 6) + 1, 'blue'); }, 1500);
        }
    }
}

function getAbsoluteId(colorStr, pos) {
    if (pos === -1) return null; 
    
    if (pos >= 51) {
        return homePaths[colorStr][pos - 51];
    }
    
    // Shifts based on official Ludo layout
    let offset = 0;
    if (colorStr === 'green') offset = 13;
    if (colorStr === 'yellow') offset = 26;
    if (colorStr === 'blue') offset = 39;
    
    return trackPath[(pos + offset) % 52];
}

function movePawnDOM(colorStr, tokenIndex, pos) {
    const pawn = document.getElementById(`${colorStr}-pawn-${tokenIndex}`);
    
    if (pos === -1) {
        const baseInner = document.querySelector(`.bg-${colorStr} .ludo-base-inner`);
        const slot = baseInner.children[tokenIndex];
        slot.appendChild(pawn);
    } else {
        const cellId = getAbsoluteId(colorStr, pos);
        let targetCell = cellId === 'center' ? document.querySelector('.center-home') : document.getElementById(`cell-${cellId}`);
        targetCell.appendChild(pawn);
    }
    
    document.querySelectorAll('.ludo-cell, .center-home').forEach(cell => {
        const pawnCount = cell.querySelectorAll('.pawn').length;
        cell.setAttribute('data-pawns', pawnCount);
    });
}

function drawLudoBoard() {
    ludoBoard.innerHTML = ''; 
    const bases = [
        { id: 'red', class: 'bg-red', colStart: 1, colEnd: 7, rowStart: 1, rowEnd: 7 }, 
        { id: 'green', class: 'bg-green', colStart: 10, colEnd: 16, rowStart: 1, rowEnd: 7 }, 
        { id: 'blue', class: 'bg-blue', colStart: 1, colEnd: 7, rowStart: 10, rowEnd: 16 }, 
        { id: 'yellow', class: 'bg-yellow', colStart: 10, colEnd: 16, rowStart: 10, rowEnd: 16 } 
    ];

    bases.forEach(b => {
        const baseDiv = document.createElement('div'); 
        baseDiv.className = `ludo-base ${b.class}`;
        baseDiv.style.gridColumn = `${b.colStart} / ${b.colEnd}`; 
        baseDiv.style.gridRow = `${b.rowStart} / ${b.rowEnd}`;
        
        const innerDiv = document.createElement('div'); 
        innerDiv.className = 'ludo-base-inner';
        
        for(let i=0; i<4; i++) {
            const slot = document.createElement('div'); 
            slot.className = 'ludo-token-slot';
            const pawn = document.createElement('div'); 
            pawn.className = `pawn ${b.id}`; 
            pawn.id = `${b.id}-pawn-${i}`;
            slot.appendChild(pawn); 
            innerDiv.appendChild(slot);
        }
        baseDiv.appendChild(innerDiv); 
        ludoBoard.appendChild(baseDiv);
    });

    const centerHome = document.createElement('div'); 
    centerHome.className = 'center-home';
    centerHome.style.gridColumn = '7 / 10'; 
    centerHome.style.gridRow = '7 / 10'; 
    ludoBoard.appendChild(centerHome);

    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const inTopLeft = row < 6 && col < 6; 
            const inTopRight = row < 6 && col > 8;
            const inBottomLeft = row > 8 && col < 6; 
            const inBottomRight = row > 8 && col > 8;
            const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRight && !inCenter) {
                const cell = document.createElement('div'); 
                cell.className = 'ludo-cell';
                cell.style.gridColumn = `${col + 1}`; 
                cell.style.gridRow = `${row + 1}`; 
                cell.id = `cell-${row}-${col}`;

                if (row === 6 && col === 1) cell.classList.add('bg-red', 'start-cell');
                if (row === 1 && col === 8) cell.classList.add('bg-green', 'start-cell');
                if (row === 8 && col === 13) cell.classList.add('bg-yellow', 'start-cell');
                if (row === 13 && col === 6) cell.classList.add('bg-blue', 'start-cell');

                if (row === 7 && col >= 1 && col <= 5) cell.classList.add('bg-red');
                if (col === 7 && row >= 1 && row <= 5) cell.classList.add('bg-green');
                if (row === 7 && col >= 9 && col <= 13) cell.classList.add('bg-yellow');
                if (col === 7 && row >= 9 && row <= 13) cell.classList.add('bg-blue');

                if (safeZones.includes(`${row}-${col}`)) {
                    cell.innerHTML = '<div class="safe-star">⭐</div>';
                }
                ludoBoard.appendChild(cell);
            }
        }
    }
}

// ==========================================
// TIC-TAC-TOE & COMMON LOGIC
// ==========================================
function resetBoard() { 
    cells.forEach(c => { c.innerText = ""; c.style.color = ""; c.style.pointerEvents = myRole === 'Spectator' ? 'none' : 'auto'; }); 
    currentSymbol = 'X'; 
    gameActive = true; 
    strike.className = 'strike hidden'; 
    strike.style.background = ''; 
    resultOverlay.classList.add('hidden'); 
}

function applyColor(cell, symbol) { 
    cell.style.color = symbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
}

const winningConditions = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ];

function checkBoardWinner(board) { 
    for (let c of winningConditions) { 
        if (board[c[0]] && board[c[0]] === board[c[1]] && board[c[0]] === board[c[2]]) return board[c[0]]; 
    } 
    return board.every(c => c !== "") ? 'tie' : null; 
}

function minimax(board, depth, isMax) {
    let res = checkBoardWinner(board); 
    if (res === 'O') return 10 - depth; 
    if (res === 'X') return depth - 10; 
    if (res === 'tie') return 0;
    
    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = isMax ? 'O' : 'X';
            let score = minimax(board, depth + 1, !isMax);
            board[i] = ""; 
            best = isMax ? Math.max(score, best) : Math.min(score, best);
        }
    } 
    return best;
}

function getBestMove() {
    let board = Array.from(cells).map(c => c.innerText); 
    let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (botDifficulty === 1 || (botDifficulty === 2 && Math.random() < 0.5)) return empty[Math.floor(Math.random() * empty.length)];
    
    let best = -Infinity; let move = empty[0];
    for (let i of empty) { 
        board[i] = 'O'; 
        let score = minimax(board, 0, false); 
        board[i] = ""; 
        if (score > best) { best = score; move = i; } 
    } 
    return move;
}

function handleBotMove() {
    if (!gameActive) return; statusText.innerText = "Bot is thinking...";
    setTimeout(() => { 
        let m = getBestMove(); 
        if (m !== undefined) { 
            cells[m].innerText = 'O'; applyColor(cells[m], 'O'); currentSymbol = 'X'; statusText.innerText = "Your Turn!"; checkWin(); 
        } 
    }, 500);
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if(activeGame !== 'tictactoe' || myRole === 'Spectator') return; 
        
        let sym = myRole === 'Player 1' || currentMode === 'bot' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === sym) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: sym }));
            } else { 
                cell.innerText = 'X'; applyColor(cell, 'X'); currentSymbol = 'O'; checkWin(); if (gameActive) handleBotMove(); 
            }
        }
    });
});

function checkWin() {
    let winCls = ''; let won = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].innerText !== "" && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) { won = true; winCls = winningConditions[i].class; break; }
    }
    if (won) {
        gameActive = false; 
        const wSym = currentSymbol === 'X' ? 'O' : 'X'; 
        
        let me = false;
        if (currentMode === 'bot') me = wSym === 'X';
        else me = (myRole === 'Player 1' && wSym === 'X') || (myRole === 'Player 2' && wSym === 'O');

        setTimeout(() => { 
            if (myRole === 'Spectator') {
                resultTitle.innerText = `${wSym} WINS!`;
            } else {
                resultTitle.innerText = me ? "YOU WIN! 🎉" : "YOU LOSE! 😢"; 
            }
            resultTitle.style.color = wSym === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
            resultOverlay.classList.remove('hidden'); 
        }, 500); 
        strike.style.backgroundColor = wSym === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
        strike.className = `strike ${winCls}`;
    } else if ([...cells].every(c => c.innerText !== "")) { 
        gameActive = false; setTimeout(() => { resultTitle.innerText = "STALEMATE!"; resultTitle.style.color = 'var(--secondary-color)'; resultOverlay.classList.remove('hidden'); }, 400); 
    }
}

function returnToHub() { currentMode === 'friend' ? socket.send(JSON.stringify({ action: "return_hub" })) : showScreen(hubScreen); }
backToHubBtn.addEventListener('click', returnToHub); overlayHubBtn.addEventListener('click', returnToHub);
function triggerRestart() { currentMode === 'friend' ? socket.send(JSON.stringify({ action: "restart" })) : (resetBoard(), statusText.innerText = "Rematch! Your Turn."); }
restartBtn.addEventListener('click', triggerRestart); overlayRestartBtn.addEventListener('click', triggerRestart);

function sendChatMessage() { 
    const msg = chatInput.value.trim(); 
    if (msg.length > 0) { socket.send(JSON.stringify({ action: "chat", message: msg })); chatInput.value = ''; } 
}
sendChatBtn.addEventListener('click', sendChatMessage); 
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// --- SOCKET MESSAGES & ROULETTE LOGIC ---
function runRoulette(players, assignedRole, symbol, finalRoleData) {
    rouletteOverlay.classList.remove('hidden');
    let counter = 0;
    
    // Rapidly flash random names
    const interval = setInterval(() => {
        const randPlayer = players[Math.floor(Math.random() * players.length)];
        rouletteName.innerText = randPlayer;
        rouletteRole.innerText = "Shuffling...";
        counter++;
        
        if (counter > 20) {
            clearInterval(interval);
            rouletteName.innerText = "Role Assigned!";
            rouletteRole.innerText = `You are: ${assignedRole} ${symbol ? '('+symbol+')' : ''}`;
            
            setTimeout(() => {
                rouletteOverlay.classList.add('hidden');
                startGameUI(finalRoleData.game);
                
                if (finalRoleData.game === 'tictactoe') {
                    if (assignedRole === 'Spectator') {
                        statusText.innerText = `Spectating: ${finalRoleData.p1} (X) vs ${finalRoleData.p2} (O)`;
                    } else {
                        statusText.innerText = symbol === 'X' ? "Your Turn!" : "Waiting for Opponent...";
                    }
                }
            }, 2500);
        }
    }, 100);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "room_created") { 
        myRoomCode = data.room; 
        myRole = 'Host'; 
        // Do not show hub yet, wait for lobby update
    }
    else if (data.type === "lobby_update") {
        myRoomCode = data.room;
        waitingRoomCode.innerText = myRoomCode;
        waitingStatus.innerText = `Waiting for players... (${data.players.length}/${data.capacity})`;
        
        playerRoster.innerHTML = '';
        data.players.forEach(p => {
            playerRoster.innerHTML += `<div style="font-weight: 800; font-size: 1.1rem; padding: 5px 0;">👤 ${p} ${p === data.host ? '(Host)' : ''}</div>`;
        });
        
        showScreen(waitingScreen);
        showChat();
    }
    else if (data.type === "hub_start") { 
        myRoomCode = data.room; 
        opponentName = data.host; 
        
        if (playerName === data.host) { 
            hubRoleBanner.innerText = `Host: Pick a game for the lobby!`; 
            launchTicTacToe.classList.remove('locked-game'); 
            launchLudo.classList.remove('locked-game'); 
        } else { 
            hubRoleBanner.innerText = `Waiting for Host (${data.host}) to pick a game...`; 
            launchTicTacToe.classList.add('locked-game'); 
            launchLudo.classList.add('locked-game'); 
        } 
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`; 
        showScreen(hubScreen); 
    }
    else if (data.type === "launch_game") { 
        if (data.game === 'tictactoe') {
            myRole = data.role;
            runRoulette(data.all_players, data.role, data.symbol, data);
        } else if (data.game === 'ludo') {
            myLudoColor = data.color;
            runRoulette(data.all_players.map(p=>p.name), "Player", data.color.toUpperCase(), data);
        }
    }
    else if (data.type === "return_hub") { showScreen(hubScreen); }
    else if (data.type === "dice_rolled") { animateDice(data.value, data.roller); }
    else if (data.type === "ludo_move") { 
        diceRolledValue = data.roll; 
        executeMove(data.roller, data.token); 
    }
    else if (data.type === "chat") { 
        const msg = document.createElement('div'); msg.classList.add('chat-message'); 
        const color = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)'; 
        msg.innerHTML = `<span style="color: ${color}">${data.sender}:</span> ${data.message}`; 
        chatMessages.appendChild(msg); chatMessages.scrollTop = chatMessages.scrollHeight; 
    }
    else if (data.type === "restart") { 
        if(activeGame === 'tictactoe') { 
            resetBoard(); 
            if (myRole === 'Spectator') statusText.innerText = "Spectating Match...";
            else statusText.innerText = myRole === 'Player 1' ? "Rematch! Your Turn." : "Waiting for Opponent...";
        } else if(activeGame === 'ludo') { initLudoGame(); }
    }
    else if (data.type === "error") { lobbyMessage.innerText = data.message; }
    else if (data.type === "player_left") { 
        statusText.innerText = `${data.name} left the room.`; 
        gameActive = false; 
        hideChat(); chatMessages.innerHTML = ''; showScreen(modeScreen); alert(`${data.name} disconnected.`); 
    }
    else if (data.type === "move" && activeGame === 'tictactoe') { 
        cells[data.index].innerText = data.symbol; applyColor(cells[data.index], data.symbol); currentSymbol = data.symbol === 'X' ? 'O' : 'X'; 
        if (gameActive) { 
            if (myRole === 'Spectator') statusText.innerText = `Current Turn: ${currentSymbol}`;
            else statusText.innerText = currentSymbol === (myRole === 'Player 1' ? 'X' : 'O') ? "Your Turn!" : "Opponent's Turn..."; 
            checkWin(); 
        } 
    }
};