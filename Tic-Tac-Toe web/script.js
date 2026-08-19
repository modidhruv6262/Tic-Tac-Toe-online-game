const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

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

// New Buttons
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');

let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';

// --- NEW FUNCTION: Clears the board ---
function resetBoard() {
    cells.forEach(cell => cell.innerText = "");
    currentSymbol = 'X';
    gameActive = true;
}

createBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "create" }));
});

joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code.length === 5) {
        socket.send(JSON.stringify({ action: "join", room: code }));
    } else {
        lobbyMessage.innerText = "Please enter a valid 5-character code.";
    }
});

// --- NEW LOGIC: Restart and Exit Buttons ---
restartBtn.addEventListener('click', () => {
    if (gameActive || statusText.innerText.includes("Wins") || statusText.innerText.includes("Draw")) {
        socket.send(JSON.stringify({ action: "restart" }));
    }
});

exitBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: "leave" }));
    
    // Hide game area, go back to lobby
    gameArea.classList.add('hidden');
    lobby.classList.remove('hidden');
    gameControls.classList.add('hidden');
    codeInput.value = '';
    lobbyMessage.innerText = '';
    myRoomCode = '';
    myRole = '';
    gameActive = false;
});

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room;
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.add('hidden'); // Hide controls until friend joins
        roomDisplay.innerText = `Room Code: ${myRoomCode}`;
        statusText.innerText = "Waiting for friend to join...";
    }
    
    else if (data.type === "game_start") {
        myRoomCode = data.room;
        myRole = data.role; 
        
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        gameControls.classList.remove('hidden'); // Show controls!
        
        roomDisplay.innerText = `Room: ${myRoomCode} | You are Player ${myRole}`;
        statusText.innerText = myRole === 'X' ? "Game Started! Your turn." : "Game Started! Player X's turn.";
        
        // This fixes the bug where a rejoining player sees a blank board but you see the old one!
        resetBoard(); 
    }
    
    // --- NEW LOGIC: Catch Restart Signal ---
    else if (data.type === "restart") {
        resetBoard();
        statusText.innerText = myRole === 'X' ? "Game Restarted! Your turn." : "Game Restarted! Player X's turn.";
    }
    
    else if (data.type === "error") {
        lobbyMessage.innerText = data.message;
    }
    
    else if (data.type === "player_left") {
        statusText.innerText = "Other player disconnected. Game paused.";
        gameActive = false; // Prevents you from clicking the board
        gameControls.classList.add('hidden'); // Hide restart, keep exit
    }
    
    else if (data.type === "move") {
        cells[data.index].innerText = data.symbol;
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        
        if (gameActive) {
            if (currentSymbol === myRole) {
                statusText.innerText = "Your turn!";
            } else {
                statusText.innerText = `Waiting for Player ${currentSymbol}...`;
            }
            checkWin();
        }
    }
};

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]             
];

function checkWin() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].innerText !== "" && 
            cells[a].innerText === cells[b].innerText && 
            cells[a].innerText === cells[c].innerText) {
            roundWon = true;
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentSymbol === 'X' ? 'O' : 'X';
        if (winner === myRole) {
            statusText.innerText = "You Win! 🎉";
        } else {
            statusText.innerText = "You Lose! 😢";
        }
        gameActive = false;
    } else if ([...cells].every(cell => cell.innerText !== "")) {
        statusText.innerText = "It's a Draw!";
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