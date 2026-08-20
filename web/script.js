const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com'); // Replace with your Render URL if needed

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
let currentMode = ''; // 'bot' or 'friend'
let currentSymbol = 'X'; 
let myRole = ''; // 'Host' (X) or 'Guest' (O)
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';

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
    
    hubRoleBanner.innerText = "Solo Practice Mode";
    hubRoomDisplay.innerText = "Local Game";
    launchTicTacToe.classList.remove('locked-game'); 
    
    showScreen(hubScreen);
});

vsFriendBtn.addEventListener('click', () => {
    currentMode = 'friend';
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
    if (code.length === 5) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName }));
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

// --- 4. HUB CONTROLS ---
leaveHubBtn.addEventListener('click', () => {
    if (currentMode === 'friend') socket.send(JSON.stringify({ action: "leave" }));
    showScreen(modeScreen);
});

// HOST launches the game
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
    
    if (currentMode === 'friend') {
        chatBox.classList.remove('hidden');
    } else {
        chatBox.classList.add('hidden'); // No chat needed for bot
    }
    
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

function handleBotMove() {
    if (!gameActive) return;
    
    statusText.innerText = "Bot is thinking...";
    setTimeout(() => {
        let emptyCells = [];
        cells.forEach((cell, index) => {
            if (cell.innerText === "") emptyCells.push(index);
        });
        
        if (emptyCells.length > 0) {
            let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            cells[randomIndex].innerText = 'O';
            applyColor(cells[randomIndex], 'O');
            currentSymbol = 'X';
            statusText.innerText = "Your Turn!";
            checkWin();
        }
    }, 800); // Artificial delay to make bot feel real
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        let playerSymbol = myRole === 'Host' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === playerSymbol) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: playerSymbol }));
            } else {
                // Solo Mode Logic
                cell.innerText = 'X';
                applyColor(cell, 'X');
                currentSymbol = 'O';
                checkWin();
                if (gameActive) handleBotMove();
            }
        }
    });
});

// --- GAME RETURN & RESTART BUTTONS ---
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
        
        hubRoleBanner.innerText = "Host: Pick a game!";
        hubRoomDisplay.innerText = `Room: ${myRoomCode}`;
        launchTicTacToe.classList.remove('locked-game'); 
        
        showScreen(hubScreen);
    }
    
    else if (data.type === "hub_start") {
        myRoomCode = data.room;
        myRole = data.role; 
        opponentName = data.opponent; 
        
        if (myRole === 'Host') {
            hubRoleBanner.innerText = `Host: Pick a game for you and ${opponentName}`;
            launchTicTacToe.classList.remove('locked-game');
        } else {
            hubRoleBanner.innerText = `Waiting for Host (${opponentName}) to pick a game...`;
            launchTicTacToe.classList.add('locked-game');
        }
        
        hubRoomDisplay.innerText = `Room: ${myRoomCode}`;
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
        showScreen(modeScreen); // Kick out to menu if friend leaves
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