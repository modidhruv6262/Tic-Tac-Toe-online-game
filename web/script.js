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
const leaveHubBtn = document.getElementById('leaveHubBtn');

const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySlider = document.getElementById('difficultySlider');
const diffLabelText = document.getElementById('diffLabelText');

const gameArea = document.getElementById('gameArea');
const gameControls = document.getElementById('gameControls');
const backToHubBtn = document.getElementById('backToHubBtn');
const restartBtn = document.getElementById('restartBtn');
const statusText = document.getElementById('statusText');
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
let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';
let botDifficulty = 2; 

// --- DIFFICULTY SLIDER LOGIC ---
const diffNames = { 1: "Easy", 2: "Medium", 3: "Hard (Unbeatable)" };
difficultySlider.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value);
    diffLabelText.innerText = diffNames[botDifficulty];
});

// --- THEME TOGGLE ---
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

// --- SCREEN ROUTING HELPER ---
function showScreen(screen) {
    nameScreen.classList.add('hidden');
    modeScreen.classList.add('hidden');
    lobbyScreen.classList.add('hidden');
    hubScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    resultOverlay.classList.add('hidden');
    screen.classList.remove('hidden');
}

// --- CHAT DISPLAY HELPERS ---
function showChat() {
    chatBox.classList.remove('hidden');
    document.body.classList.add('chat-active');
}

function hideChat() {
    chatBox.classList.add('hidden');
    document.body.classList.remove('chat-active');
}

// --- 1. IDENTIFICATION ---
nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveNameBtn.click(); });
saveNameBtn.addEventListener('click', () => {
    playerName = nameInput.value.trim() || "Player";
    document.getElementById('greetingText').innerText = `Hey ${playerName}!`;
    showScreen(modeScreen);
});

// --- 2. MODE SELECTION ---
vsBotBtn.addEventListener('click', () => {
    currentMode = 'bot';
    myRole = 'Host';
    opponentName = 'Bot';
    
    hubRoleBanner.classList.add('hidden');
    hubRoomDisplay.classList.add('hidden');
    difficultyContainer.classList.remove('hidden');
    launchTicTacToe.classList.remove('locked-game'); 
    
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

// --- 3. ROOM LOBBY (FRIEND MODE) ---
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

// --- 4. HUB CONTROLS ---
leaveHubBtn.addEventListener('click', () => {
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "leave" }));
    hideChat();
    chatMessages.innerHTML = ''; // <-- CHAT RESET FIX
    showScreen(modeScreen);
});

launchTicTacToe.addEventListener('click', () => {
    if (myRole === 'Host' || currentMode === 'bot') {
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "tictactoe" }));
        } else {
            startGameUI();
        }
    }
});

// --- 5. GAME LOGIC & UI ---
function startGameUI() {
    showScreen(gameArea);
    gameControls.classList.remove('hidden');
    
    resetBoard();
    statusText.innerText = myRole === 'Host' ? "Game Started! Your Turn." : `Game Started! Waiting for ${opponentName}...`;
}

function resetBoard() {
    cells.forEach(cell => { cell.innerText = ""; cell.style.color = ""; });
    currentSymbol = 'X';
    gameActive = true;
    strike.className = 'strike hidden'; 
    strike.style.background = '';
    resultOverlay.classList.add('hidden');
}

function applyColor(cell, symbol) {
    cell.style.color = symbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
}

// --- BOT MINIMAX LOGIC ---
const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkBoardWinner(board) {
    for (let combo of winCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
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

    if (botDifficulty === 1) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (botDifficulty === 2 && Math.random() < 0.5) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    let bestScore = -Infinity;
    let move = emptyIndices[0];
    for (let i of emptyIndices) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = "";
        if (score > bestScore) {
            bestScore = score;
            move = i;
        }
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
        let playerSymbol = myRole === 'Host' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === playerSymbol) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: playerSymbol }));
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

// --- RETURN TO HUB & RESTART BUTTONS ---
function returnToHub() {
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "return_hub" }));
    } else {
        showScreen(hubScreen);
    }
}
backToHubBtn.addEventListener('click', returnToHub);
overlayHubBtn.addEventListener('click', returnToHub);

function triggerRestart() {
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "restart" }));
    } else {
        resetBoard();
        statusText.innerText = "Rematch! Your Turn.";
    }
}
restartBtn.addEventListener('click', triggerRestart);
overlayRestartBtn.addEventListener('click', triggerRestart);

// --- WIN LOGIC ---
const winningConditions = [
    { combo: [0, 1, 2], class: 'row-1' }, { combo: [3, 4, 5], class: 'row-2' }, { combo: [6, 7, 8], class: 'row-3' },
    { combo: [0, 3, 6], class: 'col-1' }, { combo: [1, 4, 7], class: 'col-2' }, { combo: [2, 5, 8], class: 'col-3' },
    { combo: [0, 4, 8], class: 'diag-1' }, { combo: [2, 4, 6], class: 'diag-2' }
];

function checkWin() {
    let roundWon = false;
    let winningClass = ''; 

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i].combo;
        if (cells[a].innerText !== "" && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) {
            roundWon = true; winningClass = winningConditions[i].class; break;
        }
    }
    
    if (roundWon) {
        gameActive = false;
        const winnerSymbol = currentSymbol === 'X' ? 'O' : 'X';
        const didIWin = (myRole === 'Host' && winnerSymbol === 'X') || (myRole === 'Guest' && winnerSymbol === 'O');
        
        setTimeout(() => {
            if (didIWin) {
                resultTitle.innerText = "YOU WIN! 🎉";
                resultTitle.style.color = 'var(--accent-x)';
            } else {
                resultTitle.innerText = "YOU LOSE! 😢";
                resultTitle.style.color = 'var(--accent-o)';
            }
            resultOverlay.classList.remove('hidden');
        }, 500); 

        strike.style.backgroundColor = winnerSymbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        strike.className = `strike ${winningClass}`;
        
    } else if ([...cells].every(cell => cell.innerText !== "")) {
        gameActive = false;
        setTimeout(() => {
            resultTitle.innerText = "STALEMATE!";
            resultTitle.style.color = 'var(--secondary-color)';
            resultOverlay.classList.remove('hidden');
        }, 400);
    }
}

// --- CHAT LOGIC ---
function sendChatMessage() {
    const msg = chatInput.value.trim();
    if (msg.length > 0) {
        socket.send(JSON.stringify({ action: "chat", message: msg }));
        chatInput.value = ''; 
    }
}
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// --- SERVER MESSAGES ---
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
        } else {
            hubRoleBanner.innerText = `Waiting for Host (${opponentName}) to pick a game...`;
            launchTicTacToe.classList.add('locked-game');
        }
        
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`;
        
        showChat();
        showScreen(hubScreen);
    }
    
    else if (data.type === "launch_game") {
        if (data.game === "tictactoe") startGameUI();
    }
    
    else if (data.type === "return_hub") {
        showScreen(hubScreen);
    }
    
    else if (data.type === "chat") {
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');
        const senderColor = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)';
        msgElement.innerHTML = `<span style="color: ${senderColor}">${data.sender}:</span> ${data.message}`;
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    else if (data.type === "restart") {
        resetBoard();
        let playerSymbol = myRole === 'Host' ? 'X' : 'O';
        statusText.innerText = playerSymbol === 'X' ? "Rematch! Your Turn." : `Rematch! Waiting for ${opponentName}...`;
    }
    
    else if (data.type === "error") {
        lobbyMessage.innerText = data.message;
    }
    
    else if (data.type === "player_left") {
        statusText.innerText = `${opponentName} left.`;
        gameActive = false; 
        hideChat();
        chatMessages.innerHTML = ''; // <-- CHAT RESET FIX
        showScreen(modeScreen);
        alert(`${opponentName} disconnected.`);
    }
    
    else if (data.type === "move") {
        cells[data.index].innerText = data.symbol;
        applyColor(cells[data.index], data.symbol); 
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        
        if (gameActive) {
            let playerSymbol = myRole === 'Host' ? 'X' : 'O';
            statusText.innerText = currentSymbol === playerSymbol ? "Your Turn!" : `Waiting for ${opponentName}...`;
            checkWin();
        }
    }
};