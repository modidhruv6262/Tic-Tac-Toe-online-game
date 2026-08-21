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
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const backToModeBtn = document.getElementById('backToModeBtn');

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
    showScreen(lobbyScreen); 
});

backToModeBtn.addEventListener('click', () => { 
    showScreen(modeScreen); 
    lobbyMessage.innerText = ''; 
    codeInput.value = ''; 
});

createBtn.addEventListener('click', () => { 
    socket.send(JSON.stringify({ action: "create", name: playerName })); 
});

joinBtn.addEventListener('click', () => { 
    const code = codeInput.value.trim(); 
    if (code.length === 4) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName })); 
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

leaveHubBtn.addEventListener('click', () => { 
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "leave" })); 
    hideChat(); 
    chatMessages.innerHTML = ''; 
    showScreen(modeScreen); 
});

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
        statusText.innerText = myRole === 'Host' ? "Game Started! Your Turn." : `Game Started! Waiting for ${opponentName}...`; 
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

// Token tracking: -1 means in base, 0-50 means on track, 51-56 means home stretch. 57 = Finish
let ludoState = {
    Host: [-1, -1, -1, -1], // Red (Host)
    Guest: [-1, -1, -1, -1] // Blue (Guest / Bot)
};

// 52 step main track (row-col IDs)
const trackPath = [
    '6-1','6-2','6-3','6-4','6-5', '5-6','4-6','3-6','2-6','1-6','0-6', '0-7','0-8', '1-8','2-8','3-8','4-8','5-8', 
    '6-9','6-10','6-11','6-12','6-13','6-14', '7-14','8-14', '8-13','8-12','8-11','8-10','8-9', '9-8','10-8','11-8','12-8','13-8','14-8', 
    '14-7','14-6', '13-6','12-6','11-6','10-6','9-6', '8-5','8-4','8-3','8-2','8-1', '7-1'
];

const redHome = ['7-1','7-2','7-3','7-4','7-5','center'];
const blueHome = ['7-13','7-12','7-11','7-10','7-9','center'];
const safeZones = ['6-1','1-8','8-13','13-6', '2-6','6-12','12-8','8-2'];

function initLudoGame() {
    ludoState = { Host: [-1, -1, -1, -1], Guest: [-1, -1, -1, -1] };
    drawLudoBoard();
    currentLudoTurn = 'Host';
    hasRolled = false;
    ludoDice.innerText = '🎲';
    rollDiceBtn.disabled = myRole !== currentLudoTurn;
    statusText.innerText = myRole === 'Host' ? "Ludo! Your Turn to Roll." : `Ludo! Waiting for ${opponentName} to roll.`;
    gameActive = true;
}

rollDiceBtn.addEventListener('click', () => {
    if (activeGame !== 'ludo' || myRole !== currentLudoTurn || hasRolled || !gameActive) return;
    
    const val = Math.floor(Math.random() * 6) + 1;
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "roll_dice", roller: myRole, value: val }));
    } else {
        animateDice(val, myRole);
    }
});

function animateDice(finalValue, rollerRole) {
    rollDiceBtn.disabled = true; 
    hasRolled = true; 
    diceRolledValue = finalValue;
    
    let counter = 0; 
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    const interval = setInterval(() => {
        ludoDice.innerText = diceFaces[Math.floor(Math.random() * 6)];
        counter++;
        if (counter > 10) {
            clearInterval(interval);
            ludoDice.innerText = diceFaces[finalValue - 1];
            statusText.innerText = `${rollerRole === myRole ? "You" : opponentName} rolled a ${finalValue}!`;
            
            setTimeout(() => { processTurnMoves(rollerRole); }, 800);
        }
    }, 50);
}

function processTurnMoves(role) {
    const tokens = ludoState[role];
    let movableTokens = [];
    
    // Check which tokens are legally allowed to move
    tokens.forEach((pos, index) => {
        if (pos === -1 && diceRolledValue === 6) {
            movableTokens.push(index);
        } else if (pos !== -1 && pos + diceRolledValue <= 56) {
            movableTokens.push(index);
        }
    });

    // Handle skipped turns
    if (movableTokens.length === 0) {
        statusText.innerText = "No valid moves! Turn skipped.";
        setTimeout(() => { switchLudoTurn(role); }, 1500);
        return;
    }

    // THE SMART FIX: If all movable tokens are in the exact same spot, auto-move one to save user confusion!
    const allSamePosition = movableTokens.every(idx => tokens[idx] === tokens[movableTokens[0]]);
    if (allSamePosition && role === myRole) {
        statusText.innerText = "Auto-moving pawn...";
        setTimeout(() => { executeMove(role, movableTokens[0]); }, 600);
        return;
    }

    if (role === myRole) {
        statusText.innerText = "Action required: Click a glowing pawn!";
        movableTokens.forEach(idx => {
            const color = role === 'Host' ? 'red' : 'blue';
            const pawn = document.getElementById(`${color}-pawn-${idx}`);
            pawn.classList.add('movable-glow');
            
            pawn.onclick = () => {
                // Remove listeners/glows from all to prevent double-clicks
                for(let i=0; i<4; i++) { 
                    const p = document.getElementById(`${color}-pawn-${i}`);
                    p.classList.remove('movable-glow'); 
                    p.onclick = null; 
                }
                executeMove(role, idx);
            };
        });
    } else if (currentMode === 'bot') {
        // Bot AI Logic
        setTimeout(() => {
            let chosenToken = movableTokens[0];
            // Prefer bringing a new token out of base
            if (movableTokens.some(idx => tokens[idx] === -1)) {
                chosenToken = movableTokens.find(idx => tokens[idx] === -1);
            } else {
                // Otherwise move the token furthest along the track
                chosenToken = movableTokens.reduce((maxIdx, currentIdx) => 
                    tokens[currentIdx] > tokens[maxIdx] ? currentIdx : maxIdx
                , movableTokens[0]);
            }
            executeMove('Guest', chosenToken);
        }, 1000);
    }
}

function executeMove(role, tokenIndex) {
    if (currentMode === 'friend' && role === myRole) {
        socket.send(JSON.stringify({ action: "ludo_move", roller: role, token: tokenIndex, roll: diceRolledValue }));
    }
    
    let oldPos = ludoState[role][tokenIndex];
    let newPos = oldPos === -1 ? 0 : oldPos + diceRolledValue;
    ludoState[role][tokenIndex] = newPos;
    
    movePawnDOM(role, tokenIndex, newPos);
    
    // Check Captures
    let captured = false;
    if (newPos > -1 && newPos < 51) {
        const myAbsolutePos = getAbsoluteId(role, newPos);
        const oppRole = role === 'Host' ? 'Guest' : 'Host';
        
        // If not a safe zone, check opponent positions
        if (!safeZones.includes(myAbsolutePos)) {
            ludoState[oppRole].forEach((oppPos, oppIdx) => {
                if (oppPos > -1 && oppPos < 51 && getAbsoluteId(oppRole, oppPos) === myAbsolutePos) {
                    // Capture!
                    ludoState[oppRole][oppIdx] = -1;
                    movePawnDOM(oppRole, oppIdx, -1);
                    captured = true;
                    statusText.innerText = "SMASH! Sent home!";
                }
            });
        }
    }

    // Check Win
    if (ludoState[role].every(p => p === 57)) {
        gameActive = false;
        setTimeout(() => {
            resultTitle.innerText = role === myRole ? "LUDO CHAMPION! 🎉" : "YOU LOSE! 😢";
            resultTitle.style.color = role === 'Host' ? 'var(--accent-x)' : 'var(--accent-o)';
            resultOverlay.classList.remove('hidden');
        }, 1000);
        return;
    }

    // Determine next turn
    setTimeout(() => {
        if (diceRolledValue === 6 || captured || newPos === 57) {
            statusText.innerText = "Bonus Roll!";
            hasRolled = false;
            
            if (role === myRole) {
                rollDiceBtn.disabled = false;
            }
            
            if (role === 'Guest' && currentMode === 'bot') {
                setTimeout(() => { 
                    animateDice(Math.floor(Math.random() * 6) + 1, 'Guest'); 
                }, 1500);
            }
        } else {
            switchLudoTurn(role);
        }
    }, 1500);
}

function switchLudoTurn(current) {
    currentLudoTurn = current === 'Host' ? 'Guest' : 'Host';
    hasRolled = false;
    
    if (currentLudoTurn === myRole) {
        rollDiceBtn.disabled = false;
        statusText.innerText = "Your Turn: Roll the Dice!";
    } else {
        rollDiceBtn.disabled = true;
        statusText.innerText = `Waiting for ${opponentName}...`;
        
        if (currentMode === 'bot') {
            setTimeout(() => { 
                animateDice(Math.floor(Math.random() * 6) + 1, 'Guest'); 
            }, 1500);
        }
    }
}

function getAbsoluteId(role, pos) {
    if (pos === -1) return null; // base
    if (role === 'Host') {
        return pos < 51 ? trackPath[pos] : redHome[pos - 51];
    } else { 
        // Guest (Blue) starts 26 tiles shifted on the main track
        if (pos < 51) return trackPath[(pos + 26) % 52];
        return blueHome[pos - 51];
    }
}

function movePawnDOM(role, tokenIndex, pos) {
    const color = role === 'Host' ? 'red' : 'blue';
    const pawn = document.getElementById(`${color}-pawn-${tokenIndex}`);
    
    if (pos === -1) {
        // Return to base
        const baseInner = document.querySelector(`.bg-${color} .ludo-base-inner`);
        const slot = baseInner.children[tokenIndex];
        slot.appendChild(pawn);
    } else {
        // Move to board cell
        const cellId = getAbsoluteId(role, pos);
        let targetCell = cellId === 'center' ? document.querySelector('.center-home') : document.getElementById(`cell-${cellId}`);
        targetCell.appendChild(pawn);
    }
    
    // UI Fix: Update stacking tracker across all cells so they shrink appropriately
    document.querySelectorAll('.ludo-cell, .center-home').forEach(cell => {
        const pawnCount = cell.querySelectorAll('.pawn').length;
        cell.setAttribute('data-pawns', pawnCount);
    });
}

function drawLudoBoard() {
    ludoBoard.innerHTML = ''; 
    const bases = [
        { id: 'green', class: 'bg-green', colStart: 1, colEnd: 7, rowStart: 1, rowEnd: 7 },
        { id: 'blue', class: 'bg-blue', colStart: 10, colEnd: 16, rowStart: 1, rowEnd: 7 },
        { id: 'red', class: 'bg-red', colStart: 1, colEnd: 7, rowStart: 10, rowEnd: 16 },
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
    centerHome.innerHTML = '🏆'; 
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

                if (row === 6 && col === 1) cell.classList.add('bg-red');
                if (row === 8 && col === 13) cell.classList.add('bg-blue');
                if (row === 1 && col === 8) cell.classList.add('bg-green');
                if (row === 13 && col === 6) cell.classList.add('bg-yellow');

                if (row === 7 && col >= 1 && col <= 5) cell.classList.add('bg-red');
                if (row === 7 && col >= 9 && col <= 13) cell.classList.add('bg-blue');
                if (col === 7 && row >= 1 && row <= 5) cell.classList.add('bg-green');
                if (col === 7 && row >= 9 && row <= 13) cell.classList.add('bg-yellow');

                if (safeZones.includes(`${row}-${col}`)) {
                    cell.innerHTML = '<span class="safe-star">⭐</span>';
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
    cells.forEach(c => { c.innerText = ""; c.style.color = ""; }); 
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
    
    if (botDifficulty === 1 || (botDifficulty === 2 && Math.random() < 0.5)) {
        return empty[Math.floor(Math.random() * empty.length)];
    }
    
    let best = -Infinity; 
    let move = empty[0];
    for (let i of empty) { 
        board[i] = 'O'; 
        let score = minimax(board, 0, false); 
        board[i] = ""; 
        if (score > best) { best = score; move = i; } 
    } 
    return move;
}

function handleBotMove() {
    if (!gameActive) return; 
    statusText.innerText = "Bot is thinking...";
    setTimeout(() => { 
        let m = getBestMove(); 
        if (m !== undefined) { 
            cells[m].innerText = 'O'; 
            applyColor(cells[m], 'O'); 
            currentSymbol = 'X'; 
            statusText.innerText = "Your Turn!"; 
            checkWin(); 
        } 
    }, 500);
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if(activeGame !== 'tictactoe') return; 
        
        let sym = myRole === 'Host' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === sym) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: sym }));
            } else { 
                cell.innerText = 'X'; 
                applyColor(cell, 'X'); 
                currentSymbol = 'O'; 
                checkWin(); 
                if (gameActive) handleBotMove(); 
            }
        }
    });
});

function checkWin() {
    let winCls = ''; 
    let won = false;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].innerText !== "" && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) { 
            won = true; 
            winCls = winningConditions[i].class; 
            break; 
        }
    }
    
    if (won) {
        gameActive = false; 
        const wSym = currentSymbol === 'X' ? 'O' : 'X'; 
        const me = (myRole === 'Host' && wSym === 'X') || (myRole === 'Guest' && wSym === 'O');
        setTimeout(() => { 
            resultTitle.innerText = me ? "YOU WIN! 🎉" : "YOU LOSE! 😢"; 
            resultTitle.style.color = me ? 'var(--accent-x)' : 'var(--accent-o)'; 
            resultOverlay.classList.remove('hidden'); 
        }, 500); 
        strike.style.backgroundColor = wSym === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
        strike.className = `strike ${winCls}`;
    } else if ([...cells].every(c => c.innerText !== "")) { 
        gameActive = false; 
        setTimeout(() => { 
            resultTitle.innerText = "STALEMATE!"; 
            resultTitle.style.color = 'var(--secondary-color)'; 
            resultOverlay.classList.remove('hidden'); 
        }, 400); 
    }
}

function returnToHub() { 
    currentMode === 'friend' ? socket.send(JSON.stringify({ action: "return_hub" })) : showScreen(hubScreen); 
}
backToHubBtn.addEventListener('click', returnToHub); 
overlayHubBtn.addEventListener('click', returnToHub);

function triggerRestart() { 
    currentMode === 'friend' ? socket.send(JSON.stringify({ action: "restart" })) : (resetBoard(), statusText.innerText = "Rematch! Your Turn."); 
}
restartBtn.addEventListener('click', triggerRestart); 
overlayRestartBtn.addEventListener('click', triggerRestart);

function sendChatMessage() { 
    const msg = chatInput.value.trim(); 
    if (msg.length > 0) { 
        socket.send(JSON.stringify({ action: "chat", message: msg })); 
        chatInput.value = ''; 
    } 
}
sendChatBtn.addEventListener('click', sendChatMessage); 
chatInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') sendChatMessage(); 
});

// --- SOCKET MESSAGES ---
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "room_created") { 
        myRoomCode = data.room; 
        myRole = 'Host'; 
        hubRoleBanner.classList.remove('hidden'); 
        hubRoomDisplay.classList.remove('hidden'); 
        hubRoleBanner.innerText = "Host: Pick a game!"; 
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`; 
        launchTicTacToe.classList.remove('locked-game'); 
        launchLudo.classList.remove('locked-game'); 
        showChat(); 
        showScreen(hubScreen); 
    }
    else if (data.type === "hub_start") { 
        myRoomCode = data.room; 
        myRole = data.role; 
        opponentName = data.opponent; 
        hubRoleBanner.classList.remove('hidden'); 
        hubRoomDisplay.classList.remove('hidden'); 
        if (myRole === 'Host') { 
            hubRoleBanner.innerText = `Host: Pick a game for you and ${opponentName}`; 
            launchTicTacToe.classList.remove('locked-game'); 
            launchLudo.classList.remove('locked-game'); 
        } else { 
            hubRoleBanner.innerText = `Waiting for Host (${opponentName}) to pick a game...`; 
            launchTicTacToe.classList.add('locked-game'); 
            launchLudo.classList.add('locked-game'); 
        } 
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`; 
        showChat(); 
        showScreen(hubScreen); 
    }
    else if (data.type === "launch_game") { startGameUI(data.game); }
    else if (data.type === "return_hub") { showScreen(hubScreen); }
    else if (data.type === "dice_rolled") { animateDice(data.value, data.roller); }
    else if (data.type === "ludo_move") { 
        executeMove(data.roller, data.token); 
        diceRolledValue = data.roll; 
    }
    else if (data.type === "chat") { 
        const msg = document.createElement('div'); 
        msg.classList.add('chat-message'); 
        const color = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)'; 
        msg.innerHTML = `<span style="color: ${color}">${data.sender}:</span> ${data.message}`; 
        chatMessages.appendChild(msg); 
        chatMessages.scrollTop = chatMessages.scrollHeight; 
    }
    else if (data.type === "restart") { 
        if(activeGame === 'tictactoe') { 
            resetBoard(); 
            statusText.innerText = myRole === 'Host' ? "Rematch! Your Turn." : `Rematch! Waiting for ${opponentName}...`; 
        } else if(activeGame === 'ludo') {
            initLudoGame(); 
        }
    }
    else if (data.type === "error") { lobbyMessage.innerText = data.message; }
    else if (data.type === "player_left") { 
        statusText.innerText = `${opponentName} left.`; 
        gameActive = false; 
        hideChat(); 
        chatMessages.innerHTML = ''; 
        showScreen(modeScreen); 
        alert(`${opponentName} disconnected.`); 
    }
    else if (data.type === "move" && activeGame === 'tictactoe') { 
        cells[data.index].innerText = data.symbol; 
        applyColor(cells[data.index], data.symbol); 
        currentSymbol = data.symbol === 'X' ? 'O' : 'X'; 
        if (gameActive) { 
            statusText.innerText = currentSymbol === (myRole === 'Host' ? 'X' : 'O') ? "Your Turn!" : `Waiting for ${opponentName}...`; 
            checkWin(); 
        } 
    }
};