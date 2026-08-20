const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// Elements
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

let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';

// --- NEW: THEME TOGGLE LOGIC ---
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

saveNameBtn.addEventListener('click', () => {
    const enteredName = nameInput.value.trim();
    if (enteredName.length > 0) {
        playerName = enteredName;
        nameScreen.classList.add('hidden');
        lobby.classList.remove('hidden');
        greetingText.innerText = `Ready, ${playerName}?`;
    }
});

// Changed from hardcoded hex colors to CSS variables
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
    restartBtn.style.display = 'inline-block'; 
}

createBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "create", name: playerName }));
});

joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code.length === 5) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName }));
    } else {
        lobbyMessage.innerText = "Please enter a valid 5-character code.";
    }
});

restartBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "restart" }));
});

exitBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "leave" }));
    resetBoard(); 
    statusText.innerText = "Waiting for friend to join...";
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

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
});

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room;
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.add('hidden'); 
        chatBox.classList.remove('hidden'); 
        roomDisplay.innerText = `ROOM CODE: ${myRoomCode}`;
        statusText.innerText = "Waiting for friend to join...";
    }
    
    else if (data.type === "game_start") {
        myRoomCode = data.room;
        myRole = data.role; 
        opponentName = data.opponent; 
        
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.remove('hidden'); 
        chatBox.classList.remove('hidden'); 
        
        roomDisplay.innerText = `ROOM: ${myRoomCode} | ${playerName} vs ${opponentName}`;
        
        if (myRole === 'X') {
            statusText.innerText = "Game Started! Your turn.";
        } else {
            statusText.innerText = `Game Started! Waiting for ${opponentName}...`;
        }
        resetBoard(); 
    }
    
    else if (data.type === "chat") {
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');
        
        // Use CSS variables for sender names
        const senderColor = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)';
        
        msgElement.innerHTML = `<span class="chat-sender" style="color: ${senderColor}">${data.sender}:</span> ${data.message}`;
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    else if (data.type === "restart") {
        resetBoard();
        if (myRole === 'X') {
            statusText.innerText = "Game Restarted! Your turn.";
        } else {
            statusText.innerText = `Game Restarted! Waiting for ${opponentName}...`;
        }
    }
    
    else if (data.type === "error") {
        lobbyMessage.innerText = data.message;
    }
    
    else if (data.type === "player_left") {
        statusText.innerText = `${opponentName} left. Game paused.`;
        gameActive = false; 
        restartBtn.style.display = 'none'; 
        
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');
        msgElement.innerHTML = `<em style="color: var(--danger-color);">${opponentName} has left the room.</em>`;
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    else if (data.type === "move") {
        cells[data.index].innerText = data.symbol;
        applyColor(cells[data.index], data.symbol); 
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        
        if (gameActive) {
            if (currentSymbol === myRole) {
                statusText.innerText = "Your turn!";
            } else {
                statusText.innerText = `Waiting for ${opponentName}...`;
            }
            checkWin();
        }
    }
};

const winningConditions = [
    { combo: [0, 1, 2], class: 'row-1' },
    { combo: [3, 4, 5], class: 'row-2' },
    { combo: [6, 7, 8], class: 'row-3' },
    { combo: [0, 3, 6], class: 'col-1' },
    { combo: [1, 4, 7], class: 'col-2' },
    { combo: [2, 5, 8], class: 'col-3' },
    { combo: [0, 4, 8], class: 'diag-1' },
    { combo: [2, 4, 6], class: 'diag-2' }
];

function checkWin() {
    let roundWon = false;
    let winningClass = ''; 

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i].combo;
        if (cells[a].innerText !== "" && 
            cells[a].innerText === cells[b].innerText && 
            cells[a].innerText === cells[c].innerText) {
            roundWon = true;
            winningClass = winningConditions[i].class; 
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentSymbol === 'X' ? 'O' : 'X';
        
        if (winner === 'X') {
            strike.style.background = 'var(--accent-x)'; 
        } else {
            strike.style.background = 'var(--accent-o)'; 
        }
        
        if (winner === myRole) {
            statusText.innerText = "YOU WIN! 🎉";
            statusText.style.color = 'var(--accent-x)';
        } else {
            statusText.innerText = `${opponentName.toUpperCase()} WINS! 😢`;
            statusText.style.color = 'var(--accent-o)';
        }
        
        strike.className = `strike ${winningClass}`;
        gameActive = false;
        
    } else if ([...cells].every(cell => cell.innerText !== "")) {
        statusText.innerText = "IT'S A DRAW!";
        statusText.style.color = 'var(--text-color)';
        gameActive = false;
    }
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.innerText === "" && gameActive && currentSymbol === myRole) {
            const moveData = { 
                action: "move", 
                index: cell.getAttribute('data-index'), 
                symbol: myRole 
            };
            socket.send(JSON.stringify(moveData));
        }
    });
});