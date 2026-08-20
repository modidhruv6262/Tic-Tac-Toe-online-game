const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

const themeToggle = document.getElementById('themeToggle');
const nameScreen = document.getElementById('nameScreen');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const greetingText = document.getElementById('greetingText');
const lobby = document.getElementById('lobby');
const gameArea = document.getElementById('gameArea');
const gameControls = document.getElementById('gameControls');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const statusText = document.getElementById('statusText');
const roomDisplay = document.getElementById('roomDisplay');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');
const strike = document.getElementById('strike');
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

const resultOverlay = document.getElementById('resultOverlay');
const resultTitle = document.getElementById('resultTitle');
const overlayRestartBtn = document.getElementById('overlayRestartBtn');

let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';

// THEME TOGGLE
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

// PRESS "ENTER" TO CONTINUE ON NAME SCREEN
nameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        saveNameBtn.click(); 
    }
});

saveNameBtn.addEventListener('click', () => {
    const enteredName = nameInput.value.trim();
    if (enteredName.length > 0) {
        playerName = enteredName;
        nameScreen.classList.add('hidden');
        lobby.classList.remove('hidden');
        greetingText.innerText = `Ready, ${playerName}?`;
    }
});

function applyColor(cell, symbol) {
    if (symbol === 'X') {
        cell.style.color = 'var(--accent-x)'; 
    } else if (symbol === 'O') {
        cell.style.color = 'var(--accent-o)'; 
    }
}

function resetBoard() {
    cells.forEach(cell => {
        cell.innerText = "";
        cell.style.color = "";
    });
    currentSymbol = 'X';
    gameActive = true;
    strike.className = 'strike hidden'; 
    strike.style.background = '';
    resultOverlay.classList.add('hidden'); // Hide overlay
}

createBtn.addEventListener('click', () => { socket.send(JSON.stringify({ action: "create", name: playerName })); });

joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code.length === 5) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName }));
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

restartBtn.addEventListener('click', () => { socket.send(JSON.stringify({ action: "restart" })); });
overlayRestartBtn.addEventListener('click', () => { socket.send(JSON.stringify({ action: "restart" })); });

exitBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "leave" }));
    resetBoard(); 
    statusText.innerText = "Waiting for friend...";
    chatMessages.innerHTML = '';
    
    gameArea.classList.add('hidden');
    chatBox.classList.add('hidden'); 
    lobby.classList.remove('hidden');
    gameControls.classList.add('hidden');
    codeInput.value = '';
    lobbyMessage.innerText = '';
    myRoomCode = '';
    myRole = '';
    opponentName = '';
    gameActive = false;
});

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message.length > 0) {
        socket.send(JSON.stringify({ action: "chat", message: message }));
        chatInput.value = ''; 
    }
}
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendChatMessage(); });

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room;
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.add('hidden'); 
        chatBox.classList.remove('hidden'); 
        roomDisplay.innerText = `Room: ${myRoomCode}`;
        statusText.innerText = "Waiting for friend...";
    }
    
    else if (data.type === "game_start") {
        myRoomCode = data.room;
        myRole = data.role; 
        opponentName = data.opponent; 
        
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.remove('hidden'); 
        chatBox.classList.remove('hidden'); 
        
        roomDisplay.innerText = `Room: ${myRoomCode} | ${playerName} vs ${opponentName}`;
        statusText.innerText = myRole === 'X' ? "Game Started! Your Turn." : `Game Started! Waiting for ${opponentName}...`;
        resetBoard(); 
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
        statusText.innerText = myRole === 'X' ? "Rematch! Your Turn." : `Rematch! Waiting for ${opponentName}...`;
    }
    
    else if (data.type === "error") {
        lobbyMessage.innerText = data.message;
    }
    
    else if (data.type === "player_left") {
        statusText.innerText = `${opponentName} left the game.`;
        gameActive = false; 
        resultOverlay.classList.add('hidden'); 
    }
    
    else if (data.type === "move") {
        cells[data.index].innerText = data.symbol;
        applyColor(cells[data.index], data.symbol); 
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        
        if (gameActive) {
            statusText.innerText = currentSymbol === myRole ? "Your Turn!" : `Waiting for ${opponentName}...`;
            checkWin();
        }
    }
};

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
            roundWon = true;
            winningClass = winningConditions[i].class; 
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentSymbol === 'X' ? 'O' : 'X';
        gameActive = false;
        
        // CINEMATIC CLAY OVERLAY LOGIC
        setTimeout(() => {
            if (winner === myRole) {
                resultTitle.innerText = "YOU WIN! 🎉";
                resultTitle.style.color = 'var(--accent-x)';
            } else {
                resultTitle.innerText = "YOU LOSE! 😢";
                resultTitle.style.color = 'var(--accent-o)';
            }
            resultOverlay.classList.remove('hidden');
        }, 500); 

        strike.style.backgroundColor = winner === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
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

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.innerText === "" && gameActive && currentSymbol === myRole) {
            socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: myRole }));
        }
    });
});