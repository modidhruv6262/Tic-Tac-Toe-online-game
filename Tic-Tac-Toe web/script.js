const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

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

// NEW CHAT ELEMENTS
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
        cell.style.color = '#00e5ff'; 
        cell.style.textShadow = '0 0 15px rgba(0, 229, 255, 0.8)';
    } else if (symbol === 'O') {
        cell.style.color = '#ff007a'; 
        cell.style.textShadow = '0 0 15px rgba(255, 0, 122, 0.8)';
    }
}

function resetBoard() {
    cells.forEach(cell => {
        cell.innerText = "";
        cell.style.color = "";
        cell.style.textShadow = "";
    });
    currentSymbol = 'X';
    gameActive = true;
    strike.className = 'strike hidden'; 
    strike.style.background = '';
    strike.style.boxShadow = '';
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
    
    // Clear chat memory
    chatMessages.innerHTML = '';
    
    gameArea.classList.add('hidden');
    chatBox.classList.add('hidden'); // Hide chat on exit
    lobby.classList.remove('hidden');
    gameControls.classList.add('hidden');
    codeInput.value = '';
    lobbyMessage.innerText = '';
    myRoomCode = '';
    myRole = '';
    opponentName = '';
    gameActive = false;
});

// --- NEW CHAT LOGIC ---
function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message.length > 0) {
        socket.send(JSON.stringify({ action: "chat", message: message }));
        chatInput.value = ''; // clear input after sending
    }
}

sendChatBtn.addEventListener('click', sendChatMessage);

// Allow pressing "Enter" to send message
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
        chatBox.classList.remove('hidden'); // Show chat!
        
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
        chatBox.classList.remove('hidden'); // Show chat!
        
        roomDisplay.innerText = `ROOM: ${myRoomCode} | ${playerName} vs ${opponentName}`;
        
        if (myRole === 'X') {
            statusText.innerText = "Game Started! Your turn.";
        } else {
            statusText.innerText = `Game Started! Waiting for ${opponentName}...`;
        }
        resetBoard(); 
    }
    
    // --- NEW: RECEIVE CHAT MESSAGE ---
    else if (data.type === "chat") {
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');
        
        // Color the sender name pink if it's the opponent to distinguish easily
        const senderColor = data.sender === playerName ? '#00e5ff' : '#ff007a';
        
        msgElement.innerHTML = `<span class="chat-sender" style="color: ${senderColor}">${data.sender}:</span> ${data.message}`;
        chatMessages.appendChild(msgElement);
        
        // Auto-scroll to the bottom when new message arrives
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
        
        // Let players know in chat!
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');
        msgElement.innerHTML = `<em style="color: #ff4b2b;">${opponentName} has left the room.</em>`;
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
            strike.style.background = '#00e5ff'; 
            strike.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.8)';
        } else {
            strike.style.background = '#ff007a'; 
            strike.style.boxShadow = '0 0 15px rgba(255, 0, 122, 0.8)';
        }
        
        if (winner === myRole) {
            statusText.innerText = "YOU WIN! 🎉";
            statusText.style.color = '#00e5ff';
        } else {
            statusText.innerText = `${opponentName.toUpperCase()} WINS! 😢`;
            statusText.style.color = '#ff007a';
        }
        
        strike.className = `strike ${winningClass}`;
        gameActive = false;
        
    } else if ([...cells].every(cell => cell.innerText !== "")) {
        statusText.innerText = "IT'S A DRAW!";
        statusText.style.color = '#fff';
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