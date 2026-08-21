const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// --- UI ELEMENTS ---
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

// Game Engine Elements
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

// --- STATE VARIABLES ---
let currentMode = ''; 
let activeGame = ''; 
let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';
let botDifficulty = 2; 

// --- LUDO SPECIFIC STATE ---
let currentLudoTurn = 'Host'; // Host goes first
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// --- SLIDER & THEME ---
const diffNames = { 1: "Easy", 2: "Medium", 3: "Hard (Unbeatable)" };
difficultySlider.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value);
    diffLabelText.innerText = diffNames[botDifficulty];
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

// --- SCREEN ROUTING ---
function showScreen(screen) {
    nameScreen.classList.add('hidden');
    modeScreen.classList.add('hidden');
    lobbyScreen.classList.add('hidden');
    hubScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    resultOverlay.classList.add('hidden');
    screen.classList.remove('hidden');
}

function showChat() { chatBox.classList.remove('hidden'); document.body.classList.add('chat-active'); }
function hideChat() { chatBox.classList.add('hidden'); document.body.classList.remove('chat-active'); }

nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveNameBtn.click(); });
saveNameBtn.addEventListener('click', () => {
    playerName = nameInput.value.trim() || "Player";
    document.getElementById('greetingText').innerText = `Hey ${playerName}!`;
    showScreen(modeScreen);
});

// --- MODE SELECTION ---
vsBotBtn.addEventListener('click', () => {
    currentMode = 'bot'; myRole = 'Host'; opponentName = 'Bot';
    hubRoleBanner.classList.add('hidden'); hubRoomDisplay.classList.add('hidden');
    difficultyContainer.classList.remove('hidden');
    launchTicTacToe.classList.remove('locked-game'); 
    launchLudo.classList.remove('locked-game');
    showScreen(hubScreen);
});

vsFriendBtn.addEventListener('click', () => {
    currentMode = 'friend'; difficultyContainer.classList.add('hidden'); showScreen(lobbyScreen);
});

backToModeBtn.addEventListener('click', () => { showScreen(modeScreen); lobbyMessage.innerText = ''; codeInput.value = ''; });
createBtn.addEventListener('click', () => { socket.send(JSON.stringify({ action: "create", name: playerName })); });
joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code.length === 4) socket.send(JSON.stringify({ action: "join", room: code, name: playerName }));
    else lobbyMessage.innerText = "Invalid Code";
});

leaveHubBtn.addEventListener('click', () => {
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "leave" }));
    hideChat(); chatMessages.innerHTML = ''; showScreen(modeScreen);
});

// --- HUB LAUNCHERS ---
launchTicTacToe.addEventListener('click', () => {
    if (myRole === 'Host' || currentMode === 'bot') {
        if (currentMode === 'friend') socket.send(JSON.stringify({ action: "launch_game", game: "tictactoe" }));
        else startGameUI("tictactoe");
    }
});

launchLudo.addEventListener('click', () => {
    if (myRole === 'Host' || currentMode === 'bot') {
        if (currentMode === 'friend') socket.send(JSON.stringify({ action: "launch_game", game: "ludo" }));
        else startGameUI("ludo");
    }
});

// --- GAME ROUTER & UI ---
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
    } 
    else if (activeGame === 'ludo') {
        ludoWrapper.classList.remove('hidden');
        drawLudoBoard();
        currentLudoTurn = 'Host';
        ludoDice.innerText = '🎲';
        rollDiceBtn.disabled = myRole !== currentLudoTurn;
        statusText.innerText = myRole === 'Host' ? "Ludo Initialized! Your Turn to Roll." : `Ludo Initialized! Waiting for ${opponentName} to roll.`;
    }
}

// ==========================================
// PHASE 2: LUDO DICE LOGIC
// ==========================================
rollDiceBtn.addEventListener('click', () => {
    if (activeGame !== 'ludo' || myRole !== currentLudoTurn) return; // Prevent rolling out of turn
    
    const rollValue = Math.floor(Math.random() * 6) + 1; // 1 to 6
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "roll_dice", roller: myRole, value: rollValue }));
    } else {
        animateDice(rollValue, myRole);
    }
});

function animateDice(finalValue, rollerRole) {
    rollDiceBtn.disabled = true; // Lock button during animation
    let counter = 0;
    
    // Rapidly change faces to simulate rolling
    const interval = setInterval(() => {
        ludoDice.innerText = diceFaces[Math.floor(Math.random() * 6)];
        counter++;
        
        if (counter > 10) { // Stop after ~500ms
            clearInterval(interval);
            ludoDice.innerText = diceFaces[finalValue - 1]; // Set final face
            
            const rollerName = rollerRole === myRole ? "You" : opponentName;
            statusText.innerText = `${rollerName} rolled a ${finalValue}!`;
            
            // Temporary Turn Switching Logic (Until we add token movement in Phase 3)
            setTimeout(() => {
                // If they didn't roll a 6, switch turns.
                if (finalValue !== 6) {
                    currentLudoTurn = currentLudoTurn === 'Host' ? 'Guest' : 'Host';
                }
                
                statusText.innerText = currentLudoTurn === myRole ? "Your Turn: Roll the Dice!" : `Waiting for ${opponentName} to roll...`;
                
                // Unlock button if it is my turn again
                if (currentLudoTurn === myRole) {
                    rollDiceBtn.disabled = false;
                }
                
                // If playing Bot, force Bot to roll after 1.5 seconds
                if (currentMode === 'bot' && currentLudoTurn === 'Guest') {
                    setTimeout(() => {
                        const botRoll = Math.floor(Math.random() * 6) + 1;
                        animateDice(botRoll, 'Guest');
                    }, 1000);
                }
                
            }, 2000); // Wait 2 seconds to admire the roll before switching
        }
    }, 50);
}

// ==========================================
// PHASE 1.5: UPGRADED LUDO BOARD RENDERER
// ==========================================
function drawLudoBoard() {
    ludoBoard.innerHTML = ''; 
    
    const bases = [
        { id: 'green', class: 'bg-green', colStart: 1, colEnd: 7, rowStart: 1, rowEnd: 7 },
        { id: 'blue', class: 'bg-blue', colStart: 10, colEnd: 16, rowStart: 1, rowEnd: 7 },
        { id: 'red', class: 'bg-red', colStart: 1, colEnd: 7, rowStart: 10, rowEnd: 16 },
        { id: 'yellow', class: 'bg-yellow', colStart: 10, colEnd: 16, rowStart: 10, rowEnd: 16 }
    ];

    // 1. Render the 4 Corner Bases & Pawns
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
            
            // Create the physical pawn
            const pawn = document.createElement('div');
            pawn.className = `pawn ${b.id}`;
            pawn.id = `${b.id}-pawn-${i}`;
            
            // Style them statically in base for now
            pawn.style.position = 'relative'; 
            
            slot.appendChild(pawn);
            innerDiv.appendChild(slot);
        }
        
        baseDiv.appendChild(innerDiv);
        ludoBoard.appendChild(baseDiv);
    });

    // 2. Render the Center Finish Zone
    const centerHome = document.createElement('div');
    centerHome.className = 'center-home';
    centerHome.style.gridColumn = '7 / 10';
    centerHome.style.gridRow = '7 / 10';
    centerHome.innerHTML = '🏆'; 
    ludoBoard.appendChild(centerHome);

    // 3. Render the Track Cells
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const inTopLeft = row < 6 && col < 6;
            const inTopRight = row < 6 && col > 8;
            const inBottomLeft = row > 8 && col < 6;
            const inBottomRight = row > 8 && col > 8;
            const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            // Only draw cells if they aren't part of a corner base or the center
            if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRight && !inCenter) {
                const cell = document.createElement('div');
                cell.className = 'ludo-cell';
                cell.style.gridColumn = `${col + 1}`;
                cell.style.gridRow = `${row + 1}`;
                cell.id = `cell-${row}-${col}`; // Maps coordinates for movement later

                // Color the Starting Tiles
                if (row === 6 && col === 1) cell.classList.add('bg-red', 'start-cell');
                if (row === 8 && col === 13) cell.classList.add('bg-blue', 'start-cell');
                if (row === 1 && col === 8) cell.classList.add('bg-green', 'start-cell');
                if (row === 13 && col === 6) cell.classList.add('bg-yellow', 'start-cell');

                // Color the Home stretches
                if (row === 7 && col >= 1 && col <= 5) cell.classList.add('bg-red');
                if (row === 7 && col >= 9 && col <= 13) cell.classList.add('bg-blue');
                if (col === 7 && row >= 1 && row <= 5) cell.classList.add('bg-green');
                if (col === 7 && row >= 9 && row <= 13) cell.classList.add('bg-yellow');

                // Add stars to safe zones (Start tiles + Standard Safe tiles)
                const isSafeTile = (row === 2 && col === 6) || (row === 6 && col === 12) || (row === 12 && col === 8) || (row === 8 && col === 2);
                if (isSafeTile || cell.classList.contains('start-cell')) {
                    cell.innerHTML = '<span class="safe-star">⭐</span>';
                }

                ludoBoard.appendChild(cell);
            }
        }
    }
}

// ==========================================
// RESTORED TIC-TAC-TOE BOT LOGIC & GAME LOOP
// ==========================================
function resetBoard() {
    cells.forEach(cell => { cell.innerText = ""; cell.style.color = ""; });
    currentSymbol = 'X'; gameActive = true; strike.className = 'strike hidden'; strike.style.background = '';
    resultOverlay.classList.add('hidden');
}
function applyColor(cell, symbol) { cell.style.color = symbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; }

const winningConditions = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ];
function checkBoardWinner(board) {
    for (let combo of winningConditions) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(cell => cell !== "")) return 'tie';
    return null;
}

function minimax(board, depth, isMaximizing) {
    let result = checkBoardWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'tie') return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function getBestMove() {
    let currentBoard = Array.from(cells).map(cell => cell.innerText);
    let emptyIndices = currentBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

    if (botDifficulty === 1) return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    if (botDifficulty === 2 && Math.random() < 0.5) return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    let bestScore = -Infinity; let move = emptyIndices[0];
    for (let i of emptyIndices) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = "";
        if (score > bestScore) { bestScore = score; move = i; }
    }
    return move;
}

function handleBotMove() {
    if (!gameActive) return;
    statusText.innerText = "Bot is thinking...";
    setTimeout(() => {
        let moveIndex = getBestMove();
        if (moveIndex !== undefined && moveIndex !== null) {
            cells[moveIndex].innerText = 'O';
            applyColor(cells[moveIndex], 'O');
            currentSymbol = 'X';
            statusText.innerText = "Your Turn!";
            checkWin();
        }
    }, 500);
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if(activeGame !== 'tictactoe') return;
        let playerSymbol = myRole === 'Host' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === playerSymbol) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: playerSymbol }));
            } else {
                cell.innerText = 'X'; applyColor(cell, 'X'); currentSymbol = 'O';
                checkWin();
                if (gameActive) handleBotMove();
            }
        }
    });
});

function checkWin() {
    let roundWon = false; let winningClass = ''; 
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].innerText !== "" && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) {
            roundWon = true; winningClass = winningConditions[i].class; break;
        }
    }
    if (roundWon) {
        gameActive = false; const winnerSymbol = currentSymbol === 'X' ? 'O' : 'X';
        const didIWin = (myRole === 'Host' && winnerSymbol === 'X') || (myRole === 'Guest' && winnerSymbol === 'O');
        setTimeout(() => {
            resultTitle.innerText = didIWin ? "YOU WIN! 🎉" : "YOU LOSE! 😢";
            resultTitle.style.color = didIWin ? 'var(--accent-x)' : 'var(--accent-o)';
            resultOverlay.classList.remove('hidden');
        }, 500); 
        strike.style.backgroundColor = winnerSymbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        strike.className = `strike ${winningClass}`;
    } else if ([...cells].every(cell => cell.innerText !== "")) {
        gameActive = false;
        setTimeout(() => { resultTitle.innerText = "STALEMATE!"; resultTitle.style.color = 'var(--secondary-color)'; resultOverlay.classList.remove('hidden'); }, 400);
    }
}

// --- BUTTONS & CHAT ---
function returnToHub() {
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "return_hub" }));
    else showScreen(hubScreen);
}
backToHubBtn.addEventListener('click', returnToHub);
overlayHubBtn.addEventListener('click', returnToHub);

function triggerRestart() {
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "restart" }));
    else { resetBoard(); statusText.innerText = "Rematch! Your Turn."; }
}
restartBtn.addEventListener('click', triggerRestart);
overlayRestartBtn.addEventListener('click', triggerRestart);

function sendChatMessage() {
    const msg = chatInput.value.trim();
    if (msg.length > 0) { socket.send(JSON.stringify({ action: "chat", message: msg })); chatInput.value = ''; }
}
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// --- SERVER MESSAGES ---
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room; myRole = 'Host';
        hubRoleBanner.classList.remove('hidden'); hubRoomDisplay.classList.remove('hidden');
        hubRoleBanner.innerText = "Host: Pick a game!"; hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`;
        launchTicTacToe.classList.remove('locked-game'); launchLudo.classList.remove('locked-game');
        showChat(); showScreen(hubScreen);
    }
    
    else if (data.type === "hub_start") {
        myRoomCode = data.room; myRole = data.role; opponentName = data.opponent; 
        hubRoleBanner.classList.remove('hidden'); hubRoomDisplay.classList.remove('hidden');
        if (myRole === 'Host') {
            hubRoleBanner.innerText = `Host: Pick a game for you and ${opponentName}`;
            launchTicTacToe.classList.remove('locked-game'); launchLudo.classList.remove('locked-game');
        } else {
            hubRoleBanner.innerText = `Waiting for Host (${opponentName}) to pick a game...`;
            launchTicTacToe.classList.add('locked-game'); launchLudo.classList.add('locked-game');
        }
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`;
        showChat(); showScreen(hubScreen);
    }
    
    else if (data.type === "launch_game") { startGameUI(data.game); }
    else if (data.type === "return_hub") { showScreen(hubScreen); }
    
    // NEW: HANDLE DICE ROLL FROM FRIEND
    else if (data.type === "dice_rolled") {
        animateDice(data.value, data.roller);
    }
    
    else if (data.type === "chat") {
        const msgElement = document.createElement('div'); msgElement.classList.add('chat-message');
        const senderColor = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)';
        msgElement.innerHTML = `<span style="color: ${senderColor}">${data.sender}:</span> ${data.message}`;
        chatMessages.appendChild(msgElement); chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    else if (data.type === "restart") {
        if(activeGame === 'tictactoe') { resetBoard(); statusText.innerText = myRole === 'Host' ? "Rematch! Your Turn." : `Rematch! Waiting for ${opponentName}...`; }
    }
    else if (data.type === "error") { lobbyMessage.innerText = data.message; }
    else if (data.type === "player_left") {
        statusText.innerText = `${opponentName} left.`; gameActive = false; 
        hideChat(); chatMessages.innerHTML = ''; showScreen(modeScreen); alert(`${opponentName} disconnected.`);
    }
    else if (data.type === "move" && activeGame === 'tictactoe') {
        cells[data.index].innerText = data.symbol; applyColor(cells[data.index], data.symbol); 
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        if (gameActive) {
            statusText.innerText = currentSymbol === (myRole === 'Host' ? 'X' : 'O') ? "Your Turn!" : `Waiting for ${opponentName}...`;
            checkWin();
        }
    }
};