// Connected to your live Render server!
const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

const lobby = document.getElementById('lobby');
const gameArea = document.getElementById('gameArea');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const statusText = document.getElementById('statusText');
const roomDisplay = document.getElementById('roomDisplay');
const cells = document.querySelectorAll('.cell');

let currentSymbol = 'X'; 
let myRole = ''; // This will store whether I am 'X' or 'O'
let gameActive = false; 
let myRoomCode = '';

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

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "room_created") {
        myRoomCode = data.room;
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        roomDisplay.innerText = `Room Code: ${myRoomCode}`;
        statusText.innerText = "Waiting for friend to join...";
    }
    
    else if (data.type === "game_start") {
        myRoomCode = data.room;
        myRole = data.role; // The server tells you if you are X or O!
        
        lobby.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        // Update the display so you know who you are
        roomDisplay.innerText = `Room: ${myRoomCode} | You are Player ${myRole}`;
        
        // If I am X, tell me it's my turn. If I am O, tell me it's X's turn.
        statusText.innerText = myRole === 'X' ? "Game Started! Your turn." : "Game Started! Player X's turn.";
        gameActive = true; 
    }
    
    else if (data.type === "error") {
        lobbyMessage.innerText = data.message;
    }
    
    else if (data.type === "player_left") {
        statusText.innerText = "Your friend disconnected. Game over.";
        gameActive = false;
    }
    
    else if (data.type === "move") {
        cells[data.index].innerText = data.symbol;
        currentSymbol = data.symbol === 'X' ? 'O' : 'X';
        
        if (gameActive) {
            // Personalize the turn message
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
        // Only allow clicking if the cell is empty AND game is active AND it is my turn!
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