const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// --- UI ELEMENTS & GLOBALS ---
const themeToggle = document.getElementById('themeToggle');
const nameScreen = document.getElementById('nameScreen');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');

const modeScreen = document.getElementById('modeScreen');
const vsBotBtn = document.getElementById('vsBotBtn');
const vsFriendBtn = document.getElementById('vsFriendBtn');
const backToNameBtn = document.getElementById('backToNameBtn');

const lobbyScreen = document.getElementById('lobbyScreen');
const lobbyActions = document.getElementById('lobbyActions');
const capacitySetup = document.getElementById('capacitySetup');
const capacityCards = document.querySelectorAll('.capacity-card');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const backToModeBtn = document.getElementById('backToModeBtn');

const waitingScreen = document.getElementById('waitingScreen');
const waitingRoomCode = document.getElementById('waitingRoomCode');
const playerRoster = document.getElementById('playerRoster');
const waitingStatus = document.getElementById('waitingStatus');
const leaveWaitingBtn = document.getElementById('leaveWaitingBtn');

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
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatIcon = document.getElementById('chatIcon');
const chatBadge = document.getElementById('chatBadge');
let unreadMessages = 0;

const rouletteOverlay = document.getElementById('rouletteOverlay');
const rouletteName = document.getElementById('rouletteName');
const rouletteRole = document.getElementById('rouletteRole');

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
let roomHost = '';
let playerName = ''; 
let opponentName = ''; 
let botDifficulty = 2; 



const leaveRequestModal = document.getElementById('leaveRequestModal');
const leaveRequestText = document.getElementById('leaveRequestText');
const allowLeaveBtn = document.getElementById('allowLeaveBtn');
const denyLeaveBtn = document.getElementById('denyLeaveBtn');
let pendingLeaveType = '';
let pendingLeavePlayer = '';

if (allowLeaveBtn) {
    allowLeaveBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "approve_leave", leave_type: pendingLeaveType, player: pendingLeavePlayer }));
        leaveRequestModal.classList.add('hidden');
    });
}
if (denyLeaveBtn) {
    denyLeaveBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "deny_leave", player: pendingLeavePlayer }));
        leaveRequestModal.classList.add('hidden');
    });
}

function requestLeave(type) {
    if (currentMode !== 'friend' || playerName === roomHost) {
        if (type === 'room') leaveRoom();
        else socket.send(JSON.stringify({action: "return_hub"}));
    } else {
        socket.send(JSON.stringify({ action: "request_leave", type: type, player: playerName }));
        showAlert("Request sent to Host. Waiting for approval...");
    }
}

const alertModal = document.getElementById('alertModal');
const alertModalText = document.getElementById('alertModalText');
const alertModalCloseBtn = document.getElementById('alertModalCloseBtn');

if (alertModalCloseBtn) {
    alertModalCloseBtn.addEventListener('click', () => {
        alertModal.classList.add('hidden');
    });
}

function showAlert(msg) {
    alertModalText.innerText = msg;
    alertModal.classList.remove('hidden');
}

// --- TRUTH OR DARE UI ---
const launchToD = document.getElementById('launchToD');
const todSettingsScreen = document.getElementById('todSettingsScreen');
const cancelTodBtn = document.getElementById('cancelTodBtn');
const startTodBtn = document.getElementById('startTodBtn');
const todScreen = document.getElementById('todScreen');
const leaveTodBtn = document.getElementById('leaveTodBtn');

const todIntensitySlider = document.getElementById('todIntensitySlider');
const todIntensityLabel = document.getElementById('todIntensityLabel');

const todTurnArea = document.getElementById('todTurnArea');
const todStatusText = document.getElementById('todStatusText');
const todBottleContainer = document.getElementById('todBottleContainer');
const todBottle = document.getElementById('todBottle');
const todSpinBtn = document.getElementById('todSpinBtn');

const todFateArea = document.getElementById('todFateArea');
const todChooseTruthBtn = document.getElementById('todChooseTruthBtn');
const todChooseDareBtn = document.getElementById('todChooseDareBtn');

const todAskerArea = document.getElementById('todAskerArea');
const todAskerTitle = document.getElementById('todAskerTitle');
const todDbBtn = document.getElementById('todDbBtn');
const todCustomBtn = document.getElementById('todCustomBtn');
const todCustomInputArea = document.getElementById('todCustomInputArea');
const todSendCustomBtn = document.getElementById('todSendCustomBtn');
const todCustomInput = document.getElementById('todCustomInput');

const todRevealArea = document.getElementById('todRevealArea');
const todRevealType = document.getElementById('todRevealType');
const todRevealText = document.getElementById('todRevealText');
const todResolutionArea = document.getElementById('todResolutionArea');
const todDoneBtn = document.getElementById('todDoneBtn');
const todForfeitBtn = document.getElementById('todForfeitBtn');

// New truth elements
const todTruthAnswerContainer = document.getElementById('todTruthAnswerContainer');
const todTruthInput = document.getElementById('todTruthInput');
const todSendTruthBtn = document.getElementById('todSendTruthBtn');
const todTruthDisplayContainer = document.getElementById('todTruthDisplayContainer');
const todTruthDisplayText = document.getElementById('todTruthDisplayText');


// Update showScreen to hide todScreen

// --- ROUTING & CHAT ---
function showScreen(screen) {
    nameScreen.classList.add('hidden'); 
    modeScreen.classList.add('hidden'); 
    lobbyScreen.classList.add('hidden');
    waitingScreen.classList.add('hidden');
    todScreen.classList.add('hidden');
    if (typeof todSettingsScreen !== 'undefined' && todSettingsScreen) todSettingsScreen.classList.add('hidden');
    hubScreen.classList.add('hidden'); 
    gameArea.classList.add('hidden'); 
    resultOverlay.classList.add('hidden');
    screen.classList.remove('hidden');
}

function openChat() {
    if(chatToggleBtn) chatToggleBtn.classList.add('hidden');
    chatBox.classList.remove('hidden'); 
    document.body.classList.add('chat-active'); 
    unreadMessages = 0;
    if(chatBadge) chatBadge.classList.add('hidden');
}

function showChat() { 
    if (window.innerWidth <= 849) {
        // Mobile: just show the toggle button, keep chat closed by default
        if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
        return;
    }
    openChat();
}

function hideChat() { 
    if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
    chatBox.classList.add('hidden'); 
    document.body.classList.remove('chat-active'); 
}

if(chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        openChat();
    });
}

const closeChatBtn = document.getElementById('closeChatBtn');
if(closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        hideChat();
    });
}




difficultySlider.addEventListener('input', (e) => { 
    botDifficulty = parseInt(e.target.value); 
    diffLabelText.innerText = {1:"Easy", 2:"Medium", 3:"Hard"}[botDifficulty]; 
});

let isDarkMode = true; // Fix: start true because HTML is dark by default
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '☀️<span class="theme-text"> Light</span>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '🌙<span class="theme-text"> Dark</span>';
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
    if (launchLudo) launchLudo.classList.remove('locked-game'); 
    if (launchToD) launchToD.classList.remove('locked-game'); 
    if (launchDnG) launchDnG.classList.remove('locked-game');
    showScreen(hubScreen); 
});

vsFriendBtn.addEventListener('click', () => { 
    currentMode = 'friend'; 
    difficultyContainer.classList.add('hidden'); 
    lobbyActions.classList.remove('hidden');
    capacitySetup.classList.add('hidden');
    showScreen(lobbyScreen); 
});

backToNameBtn.addEventListener('click', () => {
    showScreen(nameScreen);
});

// --- SMART BACK BUTTON LOGIC ---
backToModeBtn.addEventListener('click', () => { 
    // If inside Capacity Selection, go back to Join/Create screen
    if (!capacitySetup.classList.contains('hidden')) {
        capacitySetup.classList.add('hidden');
        lobbyActions.classList.remove('hidden');
    } else {
        // Otherwise, go all the way back to the Mode screen
        showScreen(modeScreen); 
        lobbyMessage.innerText = ''; 
        codeInput.value = ''; 
    }
});

// --- NEW ROOM CREATION FLOW ---
createBtn.addEventListener('click', () => { 
    lobbyActions.classList.add('hidden');
    capacitySetup.classList.remove('hidden');
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

joinBtn.addEventListener('click', () => { 
    const code = codeInput.value.trim(); 
    if (code.length === 4) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName })); 
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

function leaveRoom() {
    socket.send(JSON.stringify({ action: "leave" })); 
    hideChat(); 
    chatMessages.innerHTML = ''; 
    showScreen(modeScreen); 
}

leaveHubBtn.addEventListener('click', () => { if (currentMode === 'friend') requestLeave('room'); else showScreen(modeScreen); });
leaveWaitingBtn.addEventListener('click', leaveRoom);

backToHubBtn.addEventListener('click', () => requestLeave('hub')); 
overlayHubBtn.addEventListener('click', () => requestLeave('hub'));

launchTicTacToe.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "tictactoe" }));
        } else {
            startGameUI("tictactoe");
        }
    } 
});

/* LUDO COMMENTED OUT
/* LUDO COMMENTED OUT
launchLudo.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "ludo" }));
        } else {
            startGameUI("ludo");
        }
    } 
});
*/

function startGameUI(gameType) {
    activeGame = gameType; 
    showScreen(gameArea); 
    gameControls.classList.remove('hidden');
    
    tictactoeBoard.classList.add('hidden'); 
    if (ludoWrapper) ludoWrapper.classList.add('hidden');
    
    if (activeGame === 'tictactoe') { 
        tictactoeBoard.classList.remove('hidden'); 
        resetBoard(); 
        
        if (currentMode === 'bot') {
            statusText.innerText = "Game Started! Your Turn."; 
        } else {
            if (myRole === 'Spectator') {
                statusText.innerText = "Spectating Match...";
            } else {
                statusText.innerText = currentSymbol === 'X' ? "Your Turn!" : "Opponent's Turn...";
            }
        }
    } else if (activeGame === 'ludo') { 
        if (ludoWrapper) ludoWrapper.classList.remove('hidden'); 
        initLudoGame(); 
    }
}

// ==========================================
// --- DRAW & GUESS (SKRIBBL CLONE) LOGIC ---
// ==========================================
const launchDnG = document.getElementById('launchDnG');
const dngScreen = document.getElementById('dngScreen');
const leaveDngBtn = document.getElementById('leaveDngBtn');
const dngCanvas = document.getElementById('dngCanvas');
const dngCtx = dngCanvas.getContext('2d');
const dngColorPicker = document.getElementById('dngColorPicker');
const dngSizePicker = document.getElementById('dngSizePicker');
const dngClearBtn = document.getElementById('dngClearBtn');
const dngToolbar = document.getElementById('dngToolbar');
const dngGuessInput = document.getElementById('dngGuessInput');
const dngGuessBtn = document.getElementById('dngGuessBtn');
const dngChatBox = document.getElementById('dngChatBox');
const dngLeaderboard = document.getElementById('dngLeaderboard');
const dngWordDisplay = document.getElementById('dngWordDisplay');
const dngTimerDisplay = document.getElementById('dngTimer');

let isDrawing = false;
let dngMyRole = "guesser"; 
let dngLastPos = {x: 0, y: 0};
let dngPlayers = [];
let dngTurnIndex = 0;
let dngScores = {};
let dngCurrentDrawer = "";
let dngCurrentWord = "";
let dngTimer = 0;
let dngTimerInterval = null;
let dngHasGuessed = false;

const dngWordList = [
    "APPLE", "BANANA", "HOUSE", "CAR", "DOG", "CAT", "SUN", "MOON", 
    "TREE", "SPIDER", "SNAKE", "COMPUTER", "PHONE", "PENCIL", "BOOK", 
    "SHOES", "GUITAR", "PIZZA", "HAMBURGER", "WATERMELON", "ELEPHANT", 
    "BIRD", "FISH", "AIRPLANE", "TRAIN", "MOUNTAIN", "RIVER", "BEACH", 
    "CLOCK", "GHOST", "TIGER", "LION", "TURTLE", "BUTTERFLY", "RAINBOW"
];

if (launchDnG) {
    launchDnG.addEventListener('click', () => {
        if (myRole !== 'Host' && currentMode !== 'bot') return; // Prevent non-hosts
        if (launchDnG.classList.contains('locked-game')) return; // Extra safety
        
        if (myRole === 'Host' || currentMode === 'bot') { 
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "launch_game", game: "dng" }));
            } else {
                dngPlayers = [playerName, "Bot"];
                initDnGGame();
            }
        }
    });
}

if (leaveDngBtn) {
    leaveDngBtn.addEventListener('click', () => {
        clearInterval(dngTimerInterval);
        requestLeave('hub');
    });
}

function initDnGGame() {
    activeGame = 'dng';
    showScreen(dngScreen);
    
    // Clear canvas
    dngCtx.fillStyle = "#ffffff";
    dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
    dngChatBox.innerHTML = '';
    
    // Host initializes scores and starts game loop
    if (playerName === roomHost || currentMode === 'bot') {
        dngScores = {};
        dngPlayers.forEach(p => dngScores[p] = 0);
        dngTurnIndex = 0;
        startDngTurn();
    }
}

function startDngTurn() {
    dngCurrentDrawer = dngPlayers[dngTurnIndex];
    dngCurrentWord = dngWordList[Math.floor(Math.random() * dngWordList.length)];
    
    const packet = {
        action: "dng_event",
        event: "start_turn",
        drawer: dngCurrentDrawer,
        word: dngCurrentWord,
        scores: dngScores
    };
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify(packet));
    }
    // Also handle locally
    handleDngEvent(packet);
}

function endDngTurn() {
    const packet = {
        action: "dng_event",
        event: "end_turn",
        word: dngCurrentWord,
        scores: dngScores
    };
    if (currentMode === 'friend') {
        socket.send(JSON.stringify(packet));
    }
    handleDngEvent(packet);
}

function handleDngEvent(data) {
    if (data.event === "start_turn") {
        clearInterval(dngTimerInterval);
        dngCurrentDrawer = data.drawer;
        dngCurrentWord = data.word;
        dngScores = data.scores || dngScores;
        dngHasGuessed = false;
        
        dngMyRole = (playerName === dngCurrentDrawer) ? "drawer" : "guesser";
        
        // Update UI
        dngCtx.fillStyle = "#ffffff";
        dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
        
        dngChatBox.innerHTML += `<p class="sys-msg">✏️ ${dngCurrentDrawer} is drawing!</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
        if (dngMyRole === 'drawer') {
            dngToolbar.classList.remove('hidden');
            dngWordDisplay.innerText = dngCurrentWord;
        } else {
            dngToolbar.classList.add('hidden');
            dngWordDisplay.innerText = "_ ".repeat(dngCurrentWord.length).trim();
        }
        
        updateDngLeaderboard();
        
        // Start Local Timer
        dngTimer = 60;
        dngTimerDisplay.innerText = `⏱️ ${dngTimer}s`;
        dngTimerInterval = setInterval(() => {
            dngTimer--;
            dngTimerDisplay.innerText = `⏱️ ${dngTimer}s`;
            if (dngTimer <= 0) {
                clearInterval(dngTimerInterval);
                if (playerName === roomHost || currentMode === 'bot') {
                    endDngTurn();
                }
            }
        }, 1000);
        
    } else if (data.event === "end_turn") {
        clearInterval(dngTimerInterval);
        dngScores = data.scores || dngScores;
        updateDngLeaderboard();
        
        dngChatBox.innerHTML += `<p class="sys-msg" style="color:var(--accent-red)">Time's up! The word was: ${data.word}</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        dngWordDisplay.innerText = data.word;
        
        // Host moves to next turn after 5 seconds
        if (playerName === roomHost || currentMode === 'bot') {
            setTimeout(() => {
                dngTurnIndex++;
                if (dngTurnIndex >= dngPlayers.length) {
                    dngTurnIndex = 0; // Loop or end game here
                }
                startDngTurn();
            }, 5000);
        }
        
    } else if (data.event === "chat") {
        dngChatBox.innerHTML += `<p><b>${data.player}:</b> ${data.text}</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
    } else if (data.event === "correct_guess") {
        dngChatBox.innerHTML += `<p class="sys-msg" style="color:var(--accent-green)">🎉 ${data.player} guessed the word!</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
        // Host awards points
        if (playerName === roomHost || currentMode === 'bot') {
            const points = dngTimer > 0 ? dngTimer : 10;
            dngScores[data.player] = (dngScores[data.player] || 0) + points;
            dngScores[dngCurrentDrawer] = (dngScores[dngCurrentDrawer] || 0) + Math.floor(points / 2);
            updateDngLeaderboard();
            
            // Note: In a full game, host checks if ALL guessers have guessed. We'll leave it simple for now.
        }
    }
}

function updateDngLeaderboard() {
    dngLeaderboard.innerHTML = "";
    Object.keys(dngScores).sort((a,b) => dngScores[b] - dngScores[a]).forEach(p => {
        const isDrawer = (p === dngCurrentDrawer) ? " ✏️" : "";
        dngLeaderboard.innerHTML += `<li style="padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.1);"><strong style="color:var(--accent-cyan)">${p}${isDrawer}</strong><span style="float:right">${dngScores[p]}</span></li>`;
    });
}

function submitDngGuess() {
    if (dngMyRole === 'drawer') return; // Drawers can't guess!
    
    const text = dngGuessInput.value.trim();
    if (!text) return;
    dngGuessInput.value = '';
    
    if (text.toUpperCase() === dngCurrentWord && !dngHasGuessed) {
        dngHasGuessed = true;
        // Correct Guess
        const packet = { action: "dng_event", event: "correct_guess", player: playerName };
        if (currentMode === 'friend') socket.send(JSON.stringify(packet));
        handleDngEvent(packet);
    } else {
        // Normal chat
        const packet = { action: "dng_event", event: "chat", player: playerName, text: text };
        if (currentMode === 'friend') socket.send(JSON.stringify(packet));
        handleDngEvent(packet);
    }
}

if (dngGuessBtn) dngGuessBtn.addEventListener('click', submitDngGuess);
if (dngGuessInput) {
    dngGuessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitDngGuess();
    });
}

// Canvas Drawing Mechanics
function getCanvasPos(e) {
    const rect = dngCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (dngCanvas.width / rect.width),
        y: (clientY - rect.top) * (dngCanvas.height / rect.height)
    };
}

function startDrawing(e) {
    if (dngMyRole !== 'drawer') return;
    isDrawing = true;
    dngLastPos = getCanvasPos(e);
}

function draw(e) {
    if (!isDrawing || dngMyRole !== 'drawer') return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    
    const color = dngColorPicker.value;
    const size = dngSizePicker.value;
    
    drawLineLocally(dngLastPos.x, dngLastPos.y, pos.x, pos.y, color, size);
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({
            action: "dng_draw",
            startX: dngLastPos.x, startY: dngLastPos.y,
            endX: pos.x, endY: pos.y,
            color: color, size: size
        }));
    }
    
    dngLastPos = pos;
}

function stopDrawing() {
    isDrawing = false;
}

function drawLineLocally(x1, y1, x2, y2, color, size) {
    dngCtx.beginPath();
    dngCtx.moveTo(x1, y1);
    dngCtx.lineTo(x2, y2);
    dngCtx.strokeStyle = color;
    dngCtx.lineWidth = size;
    dngCtx.lineCap = 'round';
    dngCtx.stroke();
}

// Event Listeners for Canvas
dngCanvas.addEventListener('mousedown', startDrawing);
dngCanvas.addEventListener('mousemove', draw);
dngCanvas.addEventListener('mouseup', stopDrawing);
dngCanvas.addEventListener('mouseout', stopDrawing);

dngCanvas.addEventListener('touchstart', startDrawing, {passive: false});
dngCanvas.addEventListener('touchmove', draw, {passive: false});
dngCanvas.addEventListener('touchend', stopDrawing);

if (dngClearBtn) {
    dngClearBtn.addEventListener('click', () => {
        if (dngMyRole !== 'drawer') return;
        dngCtx.fillStyle = "#ffffff";
        dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "dng_clear" }));
        }
    });
}
