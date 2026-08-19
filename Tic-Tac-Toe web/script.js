const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// Name Screen Elements
const nameScreen = document.getElementById('nameScreen');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const greetingText = document.getElementById('greetingText');

// Other Elements
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

let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let playerName = '';
let opponentName = '';

// --- 1. NAME SCREEN LOGIC ---
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
    
    // Hide and clear the strike line
    strike.className = 'strike hidden'; 
    strike.style.background = '';
    strike.style.boxShadow = '';
    
    restartBtn.style.display = 'inline-block'; 
}

// --- 2. SEND NAME WITH ROOM CREATION/JOIN ---
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

// --- 3. FIX EXIT BUG (Clear the board memory!) ---
exitBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "leave" }));
    
    // Wipe the board BEFORE hiding it so the next game starts fresh!
    resetBoard(); 
    statusText.innerText = "Waiting for friend to join...";
    
    gameArea.classList.add('hidden');
    lobby.classList.remove('hidden');
    gameControls.classList.add('hidden');
    codeInput.value = '';
    lobbyMessage.innerText = '';
    myRoomCode = '';
    myRole = '';
    opponentName = '';
    gameActive = false;
});

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room;
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.add('hidden'); 
        roomDisplay.innerText = `ROOM CODE: ${myRoomCode}`;
        statusText.innerText = "Waiting for friend to join...";
    }
    
    else if (data.type === "game_start") {
        myRoomCode = data.room;
        myRole = data.role; 
        opponentName = data.opponent; // Get the opponent's name!
        
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.remove('hidden'); 
        
        roomDisplay.innerText = `ROOM: ${myRoomCode} | ${playerName} (You) vs ${opponentName}`;
        
        if (myRole === 'X') {
            statusText.innerText = "Game Started! Your turn.";
        } else {
            statusText.innerText = `Game Started! Waiting for ${opponentName}...`;
        }
        resetBoard(); 
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
        
        // --- 4. COLOR THE STRIKE LINE ---
        if (winner === 'X') {
            strike.style.background = '#00e5ff'; // Cyan
            strike.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.8)';
        } else {
            strike.style.background = '#ff007a'; // Pink
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